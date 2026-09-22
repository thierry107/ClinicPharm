-- ==============================================================================
-- Curis Health (ClinicPharm) - Phase 4B Role-Based RLS Security Policies
-- ==============================================================================
-- STATUS: PROPOSED REVISED DESIGN - DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. SCHEMA PREREQUISITES
-- ------------------------------------------------------------------------------
-- Add profile_id column safely if it doesn't already exist.
-- (Note: Verified on live database — profile_id columns are successfully present).
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);


-- ------------------------------------------------------------------------------
-- 1. SECURE ROLE LOOKUP HELPER (Prevents RLS Recursion)
-- ------------------------------------------------------------------------------
-- Pinned search_path = '' and SECURITY DEFINER to safely read profiles.role
-- without triggering recursive RLS policy evaluation loops.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Explicit privilege management on helper function
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;


-- ------------------------------------------------------------------------------
-- 2. ROLE IMMUTABILITY TRIGGER
-- ------------------------------------------------------------------------------
-- Prevents ordinary authenticated users from altering profiles.role via direct API calls.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND public.get_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Security Error: Only administrators are authorized to modify user roles.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();


-- ------------------------------------------------------------------------------
-- 3. ENABLE RLS ACROSS ALL 15 APPLICATION TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- 4. TABLE POLICIES DEFINITION
-- ------------------------------------------------------------------------------

-- --- A. PROFILES TABLE ---
-- Preserved Phase 3 Policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Users update own profile fields" ON public.profiles;
CREATE POLICY "Users update own profile fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- --- B. PATIENTS TABLE ---
DROP POLICY IF EXISTS "Patients view own record, staff view all" ON public.patients;
CREATE POLICY "Patients view own record, staff view all"
  ON public.patients FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid() 
    OR public.get_user_role() IN ('doctor', 'chemist', 'admin')
  );

DROP POLICY IF EXISTS "Doctors and Admins create patient records" ON public.patients;
CREATE POLICY "Doctors and Admins create patient records"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('doctor', 'admin'));

DROP POLICY IF EXISTS "Doctors and Admins update patient records" ON public.patients;
CREATE POLICY "Doctors and Admins update patient records"
  ON public.patients FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('doctor', 'admin'));

DROP POLICY IF EXISTS "Admins delete patient records" ON public.patients;
CREATE POLICY "Admins delete patient records"
  ON public.patients FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');


-- --- C. STAFF TABLE ---
DROP POLICY IF EXISTS "Staff directory viewable by clinical roles" ON public.staff;
CREATE POLICY "Staff directory viewable by clinical roles"
  ON public.staff FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('doctor', 'chemist', 'admin'));

DROP POLICY IF EXISTS "Admins manage staff directory" ON public.staff;
CREATE POLICY "Admins manage staff directory"
  ON public.staff FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin');


-- --- D. CATEGORIES & MEDICINES TABLES (Catalog) ---
DROP POLICY IF EXISTS "Public catalog read access" ON public.categories;
CREATE POLICY "Public catalog read access"
  ON public.categories FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Chemists and Admins manage categories" ON public.categories;
CREATE POLICY "Chemists and Admins manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));

DROP POLICY IF EXISTS "Medicines catalog read access" ON public.medicines;
CREATE POLICY "Medicines catalog read access"
  ON public.medicines FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Chemists and Admins manage medicines catalog" ON public.medicines;
CREATE POLICY "Chemists and Admins manage medicines catalog"
  ON public.medicines FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));


-- --- E. SUPPLIERS & INVENTORY BATCHES TABLES ---
DROP POLICY IF EXISTS "Chemists and Admins manage suppliers" ON public.suppliers;
CREATE POLICY "Chemists and Admins manage suppliers"
  ON public.suppliers FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));

DROP POLICY IF EXISTS "Chemists and Admins manage inventory batches" ON public.inventory_batches;
CREATE POLICY "Chemists and Admins manage inventory batches"
  ON public.inventory_batches FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));


-- --- F. APPOINTMENTS TABLE ---
DROP POLICY IF EXISTS "Appointments read access" ON public.appointments;
CREATE POLICY "Appointments read access"
  ON public.appointments FOR SELECT TO authenticated
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('doctor', 'chemist', 'admin')
  );

DROP POLICY IF EXISTS "Patients and Clinical staff create appointments" ON public.appointments;
CREATE POLICY "Patients and Clinical staff create appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "Patients and Clinical staff update appointments" ON public.appointments;
CREATE POLICY "Patients and Clinical staff update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "Admins delete appointments" ON public.appointments;
CREATE POLICY "Admins delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');


-- --- G. CONSULTATIONS TABLE ---
DROP POLICY IF EXISTS "Consultations read access" ON public.consultations;
CREATE POLICY "Consultations read access"
  ON public.consultations FOR SELECT TO authenticated
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "Doctors manage consultations" ON public.consultations;
CREATE POLICY "Doctors manage consultations"
  ON public.consultations FOR ALL TO authenticated
  USING (public.get_user_role() IN ('doctor', 'admin'));


-- --- H. PRESCRIPTIONS & PRESCRIPTION ITEMS TABLES ---
DROP POLICY IF EXISTS "Prescriptions read access" ON public.prescriptions;
CREATE POLICY "Prescriptions read access"
  ON public.prescriptions FOR SELECT TO authenticated
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('doctor', 'chemist', 'admin')
  );

DROP POLICY IF EXISTS "Doctors issue prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors issue prescriptions"
  ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('doctor', 'admin'));

DROP POLICY IF EXISTS "Doctors and Chemists update prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors and Chemists update prescriptions"
  ON public.prescriptions FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('doctor', 'chemist', 'admin'));

DROP POLICY IF EXISTS "Admins delete prescriptions" ON public.prescriptions;
CREATE POLICY "Admins delete prescriptions"
  ON public.prescriptions FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Prescription Items
DROP POLICY IF EXISTS "Prescription items read access" ON public.prescription_items;
CREATE POLICY "Prescription items read access"
  ON public.prescription_items FOR SELECT TO authenticated
  USING (
    prescription_id IN (
      SELECT id FROM public.prescriptions 
      WHERE patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    )
    OR public.get_user_role() IN ('doctor', 'chemist', 'admin')
  );

DROP POLICY IF EXISTS "Doctors and Admins manage prescription items" ON public.prescription_items;
CREATE POLICY "Doctors and Admins manage prescription items"
  ON public.prescription_items FOR ALL TO authenticated
  USING (public.get_user_role() IN ('doctor', 'admin'));


-- --- I. ORDERS & ORDER ITEMS TABLES ---
DROP POLICY IF EXISTS "Chemists and Admins manage purchase orders" ON public.orders;
CREATE POLICY "Chemists and Admins manage purchase orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));

DROP POLICY IF EXISTS "Chemists and Admins manage purchase order items" ON public.order_items;
CREATE POLICY "Chemists and Admins manage purchase order items"
  ON public.order_items FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));


-- --- J. SALES & SALE ITEMS TABLES ---
DROP POLICY IF EXISTS "Sales read access" ON public.sales;
CREATE POLICY "Sales read access"
  ON public.sales FOR SELECT TO authenticated
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    OR public.get_user_role() IN ('chemist', 'admin')
  );

DROP POLICY IF EXISTS "Chemists and Admins process sales" ON public.sales;
CREATE POLICY "Chemists and Admins process sales"
  ON public.sales FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));

DROP POLICY IF EXISTS "Sale items read access" ON public.sale_items;
CREATE POLICY "Sale items read access"
  ON public.sale_items FOR SELECT TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM public.sales 
      WHERE patient_id IN (SELECT id FROM public.patients WHERE profile_id = auth.uid())
    )
    OR public.get_user_role() IN ('chemist', 'admin')
  );

DROP POLICY IF EXISTS "Chemists and Admins manage sale items" ON public.sale_items;
CREATE POLICY "Chemists and Admins manage sale items"
  ON public.sale_items FOR ALL TO authenticated
  USING (public.get_user_role() IN ('chemist', 'admin'));
