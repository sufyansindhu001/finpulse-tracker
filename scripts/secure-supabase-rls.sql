-- ==============================================================================
-- FGC SPOT: SUPABASE DATABASE ROLE-BASED ACCESS CONTROL (RBAC) & RLS MIGRATION
-- Target Tables: public.articles, public.admin_users
-- Project: https://ydroyycgjnbjcoprrrwk.supabase.co
-- Objective: Enforce strict, database-verified administrator authorization:
--   1. Explicitly DROP all four legacy permissive PUBLIC policies on public.articles
--      BEFORE enabling write access for authenticated users.
--   2. Preserve all 24 existing live articles, columns, content, and public read access.
--   3. Create public.admin_users registry table with strict table grants and RLS.
--   4. Only owner-enrolled users in public.admin_users can perform INSERT, UPDATE, or DELETE.
--   5. Ordinary authenticated users and anonymous visitors CANNOT mutate articles or self-elevate.
--   6. Draft and private articles (is_published = false) remain restricted to admins.
--   7. Pinned secure search_path on all SECURITY DEFINER functions.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- STEP 1: Ensure 'is_published' column exists on public.articles
-- (Defaults to true so all existing 24 published articles remain immediately readable)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'articles' 
      AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 2: Create the Dedicated Administrator Registry Table (public.admin_users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- ------------------------------------------------------------------------------
-- STEP 3: Lock down public.admin_users with Table Grants & Row Level Security
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Defense-in-Depth: Explicitly restrict table-level SQL grants to absolute least privilege.
-- Revoke all default and inherited privileges from PUBLIC, anon, and authenticated.
REVOKE ALL PRIVILEGES
ON TABLE public.admin_users
FROM PUBLIC, anon, authenticated;

-- Authenticated users receive SELECT only, further restricted by RLS to own record
GRANT SELECT
ON TABLE public.admin_users
TO authenticated;

-- Drop any existing policies on admin_users for clean idempotency
DROP POLICY IF EXISTS "Admins can view their own admin status" ON public.admin_users;
DROP POLICY IF EXISTS "No client insert on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "No client update on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "No client delete on admin_users" ON public.admin_users;

-- Users may only view their own record to verify their admin status
CREATE POLICY "Admins can view their own admin status"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- NOTE: There are intentionally ZERO INSERT, UPDATE, or DELETE policies for
-- 'anon' or 'authenticated' roles on public.admin_users.
-- This guarantees that NO client API call can ever insert, elevate, or modify
-- an administrator record. Only the database owner via Supabase SQL Editor
-- or direct service_role calls can authorize an administrator.

-- ------------------------------------------------------------------------------
-- STEP 4: Server-Side Cryptographic Admin Check Function (Hardened SECURITY DEFINER)
-- ------------------------------------------------------------------------------
-- Hardening features:
--   - Schema-qualified references: public.admin_users, auth.uid()
--   - Pinned secure search_path: pg_catalog, public, auth (prevents search_path hijacking)
--   - Read-only STABLE classification (zero state modification)
--   - Revoked from PUBLIC, granted explicitly to authenticated and anon
CREATE OR REPLACE FUNCTION public.is_fgc_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- Revoke default PUBLIC privileges and explicitly grant EXECUTE
REVOKE ALL ON FUNCTION public.is_fgc_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_fgc_admin() TO authenticated, anon;

-- RPC wrapper for client-side authentication checks in React (check_is_admin)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
STABLE
AS $$
  SELECT public.is_fgc_admin();
$$;

REVOKE ALL ON FUNCTION public.check_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- STEP 5: Explicitly Purge All Four Permissive Legacy Policies & Ensure RLS Enabled
-- ------------------------------------------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- CRITICAL FIX: Explicitly drop ALL FOUR verified legacy permissive PUBLIC policies:
DROP POLICY IF EXISTS "Allow delete for all" ON public.articles;
DROP POLICY IF EXISTS "Allow insert for all" ON public.articles;
DROP POLICY IF EXISTS "Allow public read" ON public.articles;
DROP POLICY IF EXISTS "Allow update for all" ON public.articles;

-- Also drop other legacy/historical policy variants for complete idempotency:
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.articles;
DROP POLICY IF EXISTS "Allow anon read" ON public.articles;
DROP POLICY IF EXISTS "Allow anon insert" ON public.articles;
DROP POLICY IF EXISTS "Allow anon update" ON public.articles;
DROP POLICY IF EXISTS "Allow anon delete" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Public visitors can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Only authorized administrators can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Only authorized administrators can update articles" ON public.articles;
DROP POLICY IF EXISTS "Only authorized administrators can delete articles" ON public.articles;

-- ------------------------------------------------------------------------------
-- STEP 6: Apply Least-Privilege RLS Policies on public.articles
-- ------------------------------------------------------------------------------

-- 1. SELECT: Public can read published articles; Only admins can view drafts
CREATE POLICY "Public visitors can read published articles" 
ON public.articles 
FOR SELECT 
USING (
  is_published = true 
  OR public.is_fgc_admin()
);

-- 2. INSERT: Strictly restricted to verified administrators in public.admin_users
CREATE POLICY "Only authorized administrators can insert articles" 
ON public.articles 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.is_fgc_admin()
);

-- 3. UPDATE: Strictly restricted to verified administrators in public.admin_users
CREATE POLICY "Only authorized administrators can update articles" 
ON public.articles 
FOR UPDATE 
TO authenticated 
USING (
  public.is_fgc_admin()
)
WITH CHECK (
  public.is_fgc_admin()
);

-- 4. DELETE: Strictly restricted to verified administrators in public.admin_users
CREATE POLICY "Only authorized administrators can delete articles" 
ON public.articles 
FOR DELETE 
TO authenticated 
USING (
  public.is_fgc_admin()
);

-- ------------------------------------------------------------------------------
-- STEP 7: Table-Level Grants (Defense-in-Depth Layer)
-- ------------------------------------------------------------------------------
-- Anonymous users: SELECT only (write operations explicitly revoked)
GRANT SELECT ON TABLE public.articles TO anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.articles FROM anon, PUBLIC;

-- Authenticated users: SELECT, INSERT, UPDATE, DELETE (gated strictly by RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.articles TO authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.articles FROM authenticated;

COMMIT;

-- ==============================================================================
-- STEP 8: POST-MIGRATION VERIFICATION QUERIES (Run in SQL Editor):
-- ==============================================================================
-- 1. Verify RLS is enabled on both tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('articles', 'admin_users');
-- Expected result: rowsecurity = true for both tables.
--
-- 2. Verify legacy permissive policies are completely gone:
-- SELECT policyname FROM pg_policies WHERE tablename = 'articles' AND policyname LIKE 'Allow%';
-- Expected result: 0 rows.
--
-- 3. Verify active policies on public.articles:
-- SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'articles';
-- Expected result: Exactly 4 policies (1 SELECT, 1 INSERT, 1 UPDATE, 1 DELETE).
--
-- 4. Verify table-level privileges:
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_name IN ('articles', 'admin_users') AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee, privilege_type;
--
-- 5. Verify admin_users table privileges (Anon & PUBLIC must have 0 rows; Authenticated has SELECT only):
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' 
--   AND table_name = 'admin_users' 
--   AND grantee IN ('anon', 'authenticated', 'PUBLIC')
-- ORDER BY grantee, privilege_type;
-- Expected result: Exactly 1 row ('authenticated', 'SELECT').

-- ==============================================================================
-- SAFE EMERGENCY RECOVERY PROCEDURE (FORWARD-FIX STRATEGY)
-- ==============================================================================
-- IMPORTANT SAFETY NOTICE:
-- Never disable Row Level Security (RLS) or grant anonymous write access.
-- If any operational issue occurs (such as administrator lockout or policy syntax error),
-- execute this safe forward-fix recovery block in the Supabase Dashboard SQL Editor.
--
-- This recovery procedure:
--   1. PRESERVES RLS at all times (never disables it).
--   2. NEVER restores anonymous write permissions.
--   3. GUARANTEES continuous public read access to all 24 published articles.
--   4. LOCKS DOWN all write operations to the database owner / SQL Editor only.
--   5. RE-ENROLLS the verified owner account safely without touching existing data.
--   6. PRESERVES 100% of existing published articles and content.
--
-- EMERGENCY EXECUTION STEPS:
--
-- 1. Ensure RLS remains ENABLED and public read access is locked to published content:
--    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
--    DROP POLICY IF EXISTS "Public visitors can read published articles" ON public.articles;
--    CREATE POLICY "Public visitors can read published articles" 
--    ON public.articles FOR SELECT 
--    USING (is_published = true);
--
-- 2. Emergency Lockdown of Writes (Blocks all client mutation until administrator is verified):
--    DROP POLICY IF EXISTS "Only authorized administrators can insert articles" ON public.articles;
--    DROP POLICY IF EXISTS "Only authorized administrators can update articles" ON public.articles;
--    DROP POLICY IF EXISTS "Only authorized administrators can delete articles" ON public.articles;
--    (Articles are now 100% safe, read-only for public, zero data corruption possible.)
--
-- 3. Emergency Administrator Re-Enrollment (Owner Recovery via verified auth.users):
--    INSERT INTO public.admin_users (user_id, email, role)
--    SELECT id, email, 'super_admin'
--    FROM auth.users
--    WHERE email = 'YOUR_OWNER_EMAIL_HERE'
--    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', email = EXCLUDED.email;
--
-- 4. Re-Apply Hardened Write Policies once owner account is confirmed:
--    CREATE POLICY "Only authorized administrators can insert articles" 
--    ON public.articles FOR INSERT TO authenticated 
--    WITH CHECK (public.is_fgc_admin());
--
--    CREATE POLICY "Only authorized administrators can update articles" 
--    ON public.articles FOR UPDATE TO authenticated 
--    USING (public.is_fgc_admin()) 
--    WITH CHECK (public.is_fgc_admin());
--
--    CREATE POLICY "Only authorized administrators can delete articles" 
--    ON public.articles FOR DELETE TO authenticated 
--    USING (public.is_fgc_admin());
