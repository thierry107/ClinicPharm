-- ==============================================================================
-- Curis Health (ClinicPharm) - Phase 3 Approved RLS Policy
-- ==============================================================================
-- This is the ONE and ONLY approved RLS policy for Phase 3.
-- Allows an authenticated user to read only their own profile record.
--
-- Prerequisites:
-- - public.profiles table exists with column 'id' referencing auth.users(id)
-- - RLS is enabled on public.profiles: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists to allow idempotent re-execution
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Create the Phase 3 approved policy
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
