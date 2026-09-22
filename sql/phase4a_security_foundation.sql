-- ==============================================================================
-- Curis Health (ClinicPharm) - Phase 4A Security Foundation
-- ==============================================================================
-- Goal: Harden database functions and revoke unnecessary EXECUTE privileges
-- from PUBLIC, anon, and authenticated roles before implementing Phase 4B RLS matrix.
--
-- IMPORTANT:
-- - This script does NOT modify table RLS policies or table GRANTs.
-- - This script does NOT delete any functions or event triggers.
-- - All functions have search_path explicitly pinned to '' with schema-qualified object references.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN public.handle_new_user()
-- ------------------------------------------------------------------------------
-- Pinned search_path = '' to eliminate search path hijacking.
-- Schema-qualifies public.profiles to ensure safe execution under SECURITY DEFINER.
-- Enforces hardcoded role = 'patient' regardless of metadata inputs.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email, 'Curis User'),
    new.email,
    'patient'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Revoke default PUBLIC execute privileges on Auth trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;


-- ------------------------------------------------------------------------------
-- 2. HARDEN public.set_updated_at()
-- ------------------------------------------------------------------------------
-- Pinned search_path = '' for updated_at timestamp trigger function.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Revoke default PUBLIC execute privileges on timestamp trigger function
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;


-- ------------------------------------------------------------------------------
-- 3. RESTRICT public.rls_auto_enable()
-- ------------------------------------------------------------------------------
-- Prevents public/anon/authenticated roles from invoking the event trigger function via PostgREST/Data API.
-- Function and event trigger remain intact for DDL operations.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
