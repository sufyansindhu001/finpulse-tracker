-- ==============================================================================
-- FGC SPOT: OWNER ADMINISTRATOR ENROLLMENT SCRIPT (STANDALONE)
-- Target Table: public.admin_users
-- Project: https://ydroyycgjnbjcoprrrwk.supabase.co
-- Objective: Securely enroll the verified website owner as super_admin.
-- ==============================================================================
-- INSTRUCTIONS FOR WEBSITE OWNER:
-- 1. Open Supabase Dashboard > SQL Editor (https://supabase.com/dashboard).
-- 2. Ensure scripts/secure-supabase-rls.sql has already been run.
-- 3. Replace 'OWNER_EMAIL_HERE' below with your exact Supabase Auth email.
-- 4. Click Run.
-- ==============================================================================

DO $$
DECLARE
  v_owner_email TEXT := 'OWNER_EMAIL_HERE'; -- <-- REPLACE WITH YOUR VERIFIED SUPABASE AUTH EMAIL
  v_user_id UUID;
  v_role TEXT := 'super_admin';
BEGIN
  -- 1. Check if owner placeholder was left unchanged
  IF v_owner_email = 'OWNER_EMAIL_HERE' OR v_owner_email IS NULL OR trim(v_owner_email) = '' THEN
    RAISE EXCEPTION 'Please replace "OWNER_EMAIL_HERE" with your actual Supabase Auth email address before running this script.';
  END IF;

  -- 2. Resolve verified user_id from auth.users
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE lower(email) = lower(trim(v_owner_email));

  -- 3. Verify user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user with email "%" was found in auth.users! Please ensure your account is created in Authentication > Users before running enrollment.', v_owner_email;
  END IF;

  -- 4. Securely enroll owner into public.admin_users
  INSERT INTO public.admin_users (user_id, email, role)
  VALUES (v_user_id, lower(trim(v_owner_email)), v_role)
  ON CONFLICT (user_id) DO UPDATE 
  SET role = EXCLUDED.role, email = EXCLUDED.email;

  RAISE NOTICE '======================================================================';
  RAISE NOTICE '[SUCCESS] Owner account "%" (UUID: %) enrolled as "%" in public.admin_users.', 
    v_owner_email, v_user_id, v_role;
  RAISE NOTICE '======================================================================';
END $$;

-- Verification: Display all enrolled administrators
SELECT 
  id AS registry_id, 
  user_id, 
  email, 
  role, 
  created_at 
FROM public.admin_users;
