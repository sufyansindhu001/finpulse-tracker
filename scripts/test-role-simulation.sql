-- ==============================================================================
-- FGC SPOT: GENUINE POSTGRESQL ROLE SIMULATION & RLS TEST SUITE (SAFE & ISOLATED)
-- Executes in a SAFE, ISOLATED TRANSACTION (BEGIN ... ROLLBACK).
-- ZERO changes persist in the database.
-- ==============================================================================
-- PREREQUISITES:
-- 1. Run scripts/secure-supabase-rls.sql (Applies RLS policies and table grants).
-- 2. Run scripts/enroll-owner-admin.sql (Enrolls the verified owner into public.admin_users).
--
-- SAFETY & RIGOROUS TESTING GUARANTEES:
-- - Starts with BEGIN; and ends with ROLLBACK; (ZERO COMMIT statements).
-- - Zero production articles (all 24 existing rows) are ever modified or targeted.
-- - All tests operate EXCLUSIVELY on temporary disposable articles with random UUIDs.
-- - No fake administrator UUID is inserted into public.admin_users. The test
--   uses the verified owner already enrolled in public.admin_users.
-- - Inspects exact SQLSTATE on exceptions: only SQLSTATE '42501' (insufficient_privilege)
--   is accepted as a genuine security denial.
-- - Never counts NOT NULL (23502), FK (23503), unique (23505) or syntax errors as PASS.
-- - For UPDATE/DELETE, accepts SQLSTATE '42501' OR ROW_COUNT = 0 (RLS silent filtering).
-- - All attempted INSERT statements supply all required columns to prevent false positives.
-- - Verifies current_user after each simulated role switch.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
  v_count INTEGER;
  v_rows INTEGER;
  v_permission_denied BOOLEAN;
  v_err_occurred BOOLEAN;
  v_sqlstate TEXT;
  v_sqlerrm TEXT;
  v_disposable_published_id TEXT := 'disposable-pub-test-' || gen_random_uuid()::text;
  v_disposable_draft_id TEXT := 'disposable-draft-test-' || gen_random_uuid()::text;
  v_admin_disposable_id TEXT := 'disposable-admin-crud-' || gen_random_uuid()::text;
  v_admin_uuid UUID;
  v_admin_email TEXT;
  v_ordinary_uuid UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE '======================================================================';
  RAISE NOTICE 'STARTING RIGOROUS ROLE SIMULATION TESTS ON FGCSPOT DATABASE';
  RAISE NOTICE '======================================================================';

  -- ----------------------------------------------------------------------------
  -- PREREQUISITE CHECK: Resolve verified owner from public.admin_users
  -- (Do NOT insert fake UUIDs that would violate foreign key to auth.users)
  -- ----------------------------------------------------------------------------
  SELECT user_id, email INTO v_admin_uuid, v_admin_email
  FROM public.admin_users
  WHERE role IN ('admin', 'super_admin')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_admin_uuid IS NULL THEN
    RAISE EXCEPTION '[PREREQUISITE ERROR] No verified administrator found in public.admin_users! Please run scripts/enroll-owner-admin.sql before executing this simulation suite.';
  END IF;

  RAISE NOTICE '[SETUP] Found enrolled administrator "%" (UUID: %) in public.admin_users', 
    v_admin_email, v_admin_uuid;

  -- ----------------------------------------------------------------------------
  -- SETUP: Create temporary disposable test articles as database owner (postgres)
  -- These disposable articles are the ONLY articles targeted during tests.
  -- ----------------------------------------------------------------------------
  -- 1. Disposable Published Article:
  INSERT INTO public.articles (id, slug, title, category, author, excerpt, content, read_time, is_published)
  VALUES (
    v_disposable_published_id, 
    v_disposable_published_id, 
    'Disposable Published Article (Simulation Only)', 
    'Testing', 
    'Test Runner', 
    'Disposable Excerpt', 
    'Disposable Content for RLS validation', 
    '1 min', 
    true -- PUBLISHED
  );

  -- 2. Disposable Draft Article:
  INSERT INTO public.articles (id, slug, title, category, author, excerpt, content, read_time, is_published)
  VALUES (
    v_disposable_draft_id, 
    v_disposable_draft_id, 
    'Disposable Draft Article (Simulation Only)', 
    'Testing', 
    'Test Runner', 
    'Disposable Draft Excerpt', 
    'Confidential Draft Content', 
    '1 min', 
    false -- DRAFT
  );

  RAISE NOTICE '[SETUP] Created 2 disposable test articles (% and %)', 
    v_disposable_published_id, v_disposable_draft_id;

  -- ============================================================================
  -- 0. REGRESSION AUDIT: ENSURE ALL 4 LEGACY PERMISSIVE POLICIES ARE DROPPED
  -- ============================================================================
  RAISE NOTICE '--- TEST GROUP 0: REGRESSION AUDIT (POLICIES & TABLE GRANTS) ---';

  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'articles'
    AND policyname IN (
      'Allow delete for all',
      'Allow insert for all',
      'Allow public read',
      'Allow update for all'
    );

  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] Test 0A: All 4 legacy permissive policies ("Allow...") successfully dropped (0 found)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 0A: Detected % legacy permissive policy/policies still active on public.articles!', v_count;
  END IF;

  -- Verify RLS is enabled on both tables
  SELECT count(*) INTO v_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('articles', 'admin_users')
    AND rowsecurity = true;

  IF v_count = 2 THEN
    RAISE NOTICE '[PASS] Test 0B: Row Level Security is active on both public.articles and public.admin_users';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 0B: Row Level Security is NOT active on all target tables! Count = %', v_count;
  END IF;

  -- Test 0C: Verify anon and PUBLIC have ZERO privileges on public.admin_users
  SELECT count(*) INTO v_count
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name = 'admin_users'
    AND grantee IN ('anon', 'PUBLIC');

  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] Test 0C: anon and PUBLIC have ZERO privileges on public.admin_users';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 0C: Detected % privileges on public.admin_users granted to anon/PUBLIC!', v_count;
  END IF;

  -- Test 0D: Verify authenticated has SELECT only on public.admin_users
  SELECT count(*) INTO v_count
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name = 'admin_users'
    AND grantee = 'authenticated'
    AND privilege_type != 'SELECT';

  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] Test 0D: authenticated has SELECT ONLY on public.admin_users (zero write privileges)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 0D: authenticated has unauthorized write privileges on public.admin_users! Count = %', v_count;
  END IF;

  -- ============================================================================
  -- 1. TEST AS ANONYMOUS VISITOR (ROLE: anon)
  -- ============================================================================
  RAISE NOTICE '--- TEST GROUP 1: ANONYMOUS VISITOR (anon) ---';
  
  -- Simulate PostgREST setting anonymous context
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  -- Verify current_user role switch
  IF current_user != 'anon' THEN
    RAISE EXCEPTION '[FAIL] Role switch failed: current_user is "%" instead of "anon"', current_user;
  END IF;

  -- Test 1A: Anonymous can read published disposable article
  SELECT count(*) INTO v_count FROM public.articles WHERE id = v_disposable_published_id;
  IF v_count = 1 THEN
    RAISE NOTICE '[PASS] Test 1A: Anonymous visitor can read published articles (found disposable published row)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1A: Anonymous visitor cannot read published articles!';
  END IF;

  -- Test 1B: Anonymous CANNOT read draft disposable article
  SELECT count(*) INTO v_count FROM public.articles WHERE id = v_disposable_draft_id;
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] Test 1B: Anonymous visitor CANNOT read draft articles (0 rows visible)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1B: Anonymous visitor was able to view draft article!';
  END IF;

  -- Test 1C: Anonymous INSERT is DENIED (Strictly verifies SQLSTATE 42501; supplies all required columns)
  v_permission_denied := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    INSERT INTO public.articles (id, slug, title, category, author, excerpt, content, read_time, is_published) 
    VALUES (
      'anon-insert-' || gen_random_uuid()::text, 
      'anon-insert-slug-' || gen_random_uuid()::text, 
      'Unauthorized Anon Post', 
      'Security', 
      'Anonymous Visitor', 
      'Excerpt', 
      'Content', 
      '1 min', 
      true
    );
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 1C: Anonymous INSERT threw non-permission error SQLSTATE % (%): %', 
        v_sqlstate, v_sqlerrm, SQLERRM;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 1C: Anonymous visitor INSERT is strictly DENIED (SQLSTATE 42501: %)', v_sqlerrm;
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1C: Anonymous visitor was able to INSERT an article!';
  END IF;

  -- Test 1D: Anonymous UPDATE is DENIED (targets ONLY disposable article; accepts 42501 OR row_count = 0)
  v_permission_denied := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    UPDATE public.articles 
    SET title = 'Hacked Title' 
    WHERE id = v_disposable_published_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 1D: Anonymous UPDATE threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 1D: Anonymous visitor UPDATE strictly DENIED by table permissions (SQLSTATE 42501: %)', v_sqlerrm;
  ELSIF v_rows = 0 THEN
    RAISE NOTICE '[PASS] Test 1D: Anonymous visitor UPDATE strictly DENIED by RLS row filtering (rows affected: 0)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1D: Anonymous visitor was able to UPDATE disposable article! (rows affected: %)', v_rows;
  END IF;

  -- Test 1E: Anonymous DELETE is DENIED (targets ONLY disposable article; accepts 42501 OR row_count = 0)
  v_permission_denied := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    DELETE FROM public.articles 
    WHERE id = v_disposable_published_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 1E: Anonymous DELETE threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 1E: Anonymous visitor DELETE strictly DENIED by table permissions (SQLSTATE 42501: %)', v_sqlerrm;
  ELSIF v_rows = 0 THEN
    RAISE NOTICE '[PASS] Test 1E: Anonymous visitor DELETE strictly DENIED by RLS row filtering (rows affected: 0)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1E: Anonymous visitor was able to DELETE disposable article! (rows affected: %)', v_rows;
  END IF;

  -- Test 1F: Anonymous write to admin_users is DENIED (Strictly verifies SQLSTATE 42501)
  v_permission_denied := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    INSERT INTO public.admin_users (user_id, email, role) 
    VALUES (gen_random_uuid(), 'attacker_' || gen_random_uuid()::text || '@fake.com', 'super_admin');
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 1F: Anonymous write to admin_users threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 1F: Anonymous write to admin_users is strictly DENIED (SQLSTATE 42501: %)', v_sqlerrm;
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1F: Anonymous visitor was able to insert into admin_users!';
  END IF;

  -- Test 1G: Anonymous SELECT on admin_users is DENIED (zero table privileges; verifies SQLSTATE 42501)
  v_permission_denied := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    SELECT count(*) INTO v_count FROM public.admin_users;
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 1G: Anonymous SELECT on admin_users threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 1G: Anonymous visitor SELECT on admin_users is strictly DENIED (SQLSTATE 42501: %)', v_sqlerrm;
  ELSE
    RAISE EXCEPTION '[FAIL] Test 1G: Anonymous visitor was able to SELECT from admin_users!';
  END IF;

  -- ============================================================================
  -- 2. TEST AS ORDINARY AUTHENTICATED USER (ROLE: authenticated, NOT IN admin_users)
  -- ============================================================================
  RAISE NOTICE '--- TEST GROUP 2: ORDINARY AUTHENTICATED USER (authenticated, unprivileged) ---';
  
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_ordinary_uuid::text, true);

  -- Verify current_user role switch
  IF current_user != 'authenticated' THEN
    RAISE EXCEPTION '[FAIL] Role switch failed: current_user is "%" instead of "authenticated"', current_user;
  END IF;

  -- Test 2A: Ordinary user can read published disposable article
  SELECT count(*) INTO v_count FROM public.articles WHERE id = v_disposable_published_id;
  IF v_count = 1 THEN
    RAISE NOTICE '[PASS] Test 2A: Ordinary user can read published articles (found disposable published row)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2A: Ordinary user cannot read published articles!';
  END IF;

  -- Test 2B: Ordinary user CANNOT read draft disposable article
  SELECT count(*) INTO v_count FROM public.articles WHERE id = v_disposable_draft_id;
  IF v_count = 0 THEN
    RAISE NOTICE '[PASS] Test 2B: Ordinary user CANNOT read draft articles (0 rows visible)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2B: Ordinary user was able to view draft article!';
  END IF;

  -- Test 2C: Ordinary user INSERT is DENIED (Strictly verifies SQLSTATE 42501; supplies all required columns)
  v_permission_denied := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    INSERT INTO public.articles (id, slug, title, category, author, excerpt, content, read_time, is_published) 
    VALUES (
      'ordinary-insert-' || gen_random_uuid()::text, 
      'ordinary-insert-slug-' || gen_random_uuid()::text, 
      'Unauthorized Ordinary User Post', 
      'Security', 
      'Ordinary User', 
      'Excerpt', 
      'Content', 
      '1 min', 
      true
    );
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 2C: Ordinary user INSERT threw non-permission error SQLSTATE % (%): %', 
        v_sqlstate, v_sqlerrm, SQLERRM;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 2C: Ordinary user INSERT is strictly DENIED by RLS (SQLSTATE 42501: %)', v_sqlerrm;
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2C: Ordinary user was able to INSERT an article!';
  END IF;

  -- Test 2D: Ordinary user UPDATE is DENIED (targets ONLY disposable article; accepts 42501 OR row_count = 0)
  v_permission_denied := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    UPDATE public.articles 
    SET title = 'Ordinary Tampered Title' 
    WHERE id = v_disposable_published_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 2D: Ordinary user UPDATE threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 2D: Ordinary user UPDATE strictly DENIED by table permissions (SQLSTATE 42501: %)', v_sqlerrm;
  ELSIF v_rows = 0 THEN
    RAISE NOTICE '[PASS] Test 2D: Ordinary user UPDATE strictly DENIED by RLS row filtering (rows affected: 0)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2D: Ordinary user was able to UPDATE disposable article! (rows affected: %)', v_rows;
  END IF;

  -- Test 2E: Ordinary user DELETE is DENIED (targets ONLY disposable article; accepts 42501 OR row_count = 0)
  v_permission_denied := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    DELETE FROM public.articles 
    WHERE id = v_disposable_published_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 2E: Ordinary user DELETE threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 2E: Ordinary user DELETE strictly DENIED by table permissions (SQLSTATE 42501: %)', v_sqlerrm;
  ELSIF v_rows = 0 THEN
    RAISE NOTICE '[PASS] Test 2E: Ordinary user DELETE strictly DENIED by RLS row filtering (rows affected: 0)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2E: Ordinary user was able to DELETE disposable article! (rows affected: %)', v_rows;
  END IF;

  -- Test 2F: Ordinary user cannot insert themselves into admin_users (Strictly verifies SQLSTATE 42501)
  v_permission_denied := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    INSERT INTO public.admin_users (user_id, email, role) 
    VALUES (v_ordinary_uuid, 'ordinary_' || gen_random_uuid()::text || '@user.com', 'admin');
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
    IF v_sqlstate = '42501' THEN
      v_permission_denied := true;
    ELSE
      RAISE EXCEPTION '[FAIL] Test 2F: Ordinary user elevation threw non-permission error SQLSTATE %: %', 
        v_sqlstate, v_sqlerrm;
    END IF;
  END;

  IF v_permission_denied THEN
    RAISE NOTICE '[PASS] Test 2F: Ordinary user self-elevation to admin_users is strictly DENIED (SQLSTATE 42501: %)', v_sqlerrm;
  ELSE
    RAISE EXCEPTION '[FAIL] Test 2F: Ordinary user was able to grant themselves admin privileges!';
  END IF;

  -- ============================================================================
  -- 3. TEST AS VERIFIED ADMINISTRATOR (ROLE: authenticated, REAL OWNER UUID)
  -- Uses the verified owner's real user_id resolved from public.admin_users in SETUP.
  -- Zero fake administrator UUIDs inserted.
  -- ============================================================================
  RAISE NOTICE '--- TEST GROUP 3: VERIFIED ADMINISTRATOR (authenticated, enrolled owner) ---';
  
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_uuid::text, true);

  -- Verify current_user role switch
  IF current_user != 'authenticated' THEN
    RAISE EXCEPTION '[FAIL] Role switch failed: current_user is "%" instead of "authenticated"', current_user;
  END IF;

  -- Test 3A: Admin CAN read draft articles
  SELECT count(*) INTO v_count FROM public.articles WHERE id = v_disposable_draft_id;
  IF v_count = 1 THEN
    RAISE NOTICE '[PASS] Test 3A: Verified administrator CAN view draft articles';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 3A: Verified administrator was blocked from viewing draft!';
  END IF;

  -- Test 3B: Admin CAN perform INSERT of a new disposable article
  v_err_occurred := false;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    INSERT INTO public.articles (id, slug, title, category, author, excerpt, content, read_time, is_published) 
    VALUES (
      v_admin_disposable_id, 
      v_admin_disposable_id, 
      'Admin Published Guide (Disposable)', 
      'Forex', 
      'Sufyan', 
      'Exc', 
      'Cont', 
      '2 min', 
      true
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_occurred := true;
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
  END;
  IF NOT v_err_occurred THEN
    RAISE NOTICE '[PASS] Test 3B: Verified administrator INSERT is ALLOWED';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 3B: Verified administrator was blocked from inserting article! (SQLSTATE %: %)', 
      v_sqlstate, v_sqlerrm;
  END IF;

  -- Test 3C: Admin CAN perform UPDATE on disposable article
  v_err_occurred := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    UPDATE public.articles 
    SET title = 'Admin Updated Guide (Disposable)' 
    WHERE id = v_admin_disposable_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_err_occurred := true;
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
  END;
  IF NOT v_err_occurred AND v_rows = 1 THEN
    RAISE NOTICE '[PASS] Test 3C: Verified administrator UPDATE is ALLOWED (rows affected: 1)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 3C: Verified administrator UPDATE failed! (rows affected: %, SQLSTATE %: %)', 
      v_rows, v_sqlstate, v_sqlerrm;
  END IF;

  -- Test 3D: Admin CAN perform DELETE on disposable article
  v_err_occurred := false;
  v_rows := 0;
  v_sqlstate := '';
  v_sqlerrm := '';
  BEGIN
    DELETE FROM public.articles 
    WHERE id = v_admin_disposable_id;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
  EXCEPTION WHEN OTHERS THEN
    v_err_occurred := true;
    v_sqlstate := SQLSTATE;
    v_sqlerrm := SQLERRM;
  END;
  IF NOT v_err_occurred AND v_rows = 1 THEN
    RAISE NOTICE '[PASS] Test 3D: Verified administrator DELETE is ALLOWED (rows affected: 1)';
  ELSE
    RAISE EXCEPTION '[FAIL] Test 3D: Verified administrator DELETE failed! (rows affected: %, SQLSTATE %: %)', 
      v_rows, v_sqlstate, v_sqlerrm;
  END IF;

  RAISE NOTICE '======================================================================';
  RAISE NOTICE 'ALL 17 GENUINE ROLE-BASED SCENARIOS PASSED WITH ZERO VULNERABILITIES.';
  RAISE NOTICE 'ROLLING BACK TRANSACTION (NO TEST DATA PERSISTED).';
  RAISE NOTICE '======================================================================';

END $$;

ROLLBACK;
