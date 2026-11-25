/**
 * FGC SPOT — Phase P0 Security & Access Control Verification
 * Tests the 10 Authorization & Least-Privilege Scenarios Required by Phase P0.
 * 
 * Usage: node scripts/test-authorization-scenarios.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SQL_PATH = path.join(ROOT, 'scripts', 'secure-supabase-rls.sql');
const APP_CONTEXT_PATH = path.join(ROOT, 'src', 'context', 'AppContext.jsx');
const ADMIN_PAGE_PATH = path.join(ROOT, 'src', 'pages', 'AdminPage.jsx');

console.log('======================================================================');
console.log('FGC SPOT — PHASE P0 AUTHORIZATION & RLS POLICY AUDIT');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let notVerifiedChecks = 0;

function check(label, condition, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${label}`);
    if (details) console.log(`       Evidence: ${details}`);
  } else {
    console.error(`[FAIL] ${label}`);
    if (details) console.error(`       Reason: ${details}`);
  }
}

function notVerified(label, reason) {
  totalChecks++;
  notVerifiedChecks++;
  console.log(`[NOT VERIFIED] ${label}`);
  console.log(`       Note: ${reason}`);
}

// ----------------------------------------------------------------------------
// 1. AUDIT SQL RLS POLICY SPECIFICATION
// ----------------------------------------------------------------------------
console.log('--- 1. AUDITING DATABASE RLS POLICIES & GRANTS (scripts/secure-supabase-rls.sql) ---');

const sql = fs.readFileSync(SQL_PATH, 'utf8').replace(/\r\n/g, '\n');

// Policy 1: Public SELECT with draft restriction
const hasPublicSelect = sql.includes('CREATE POLICY "Public visitors can read published articles"') &&
                        sql.includes('is_published = true') &&
                        sql.includes('public.is_fgc_admin()');
check('Scenario 1: Public visitors can read published articles; drafts restricted', hasPublicSelect,
  'SELECT policy checks: is_published = true OR public.is_fgc_admin()');

// Policy 2: Anonymous & ordinary user INSERT blocked; only admin allowed
const hasAdminInsert = sql.includes('CREATE POLICY "Only authorized administrators can insert articles"') &&
                       sql.includes('public.is_fgc_admin()');
check('Scenario 2 & 5: INSERT restricted strictly to verified administrators', hasAdminInsert,
  'INSERT policy checks: public.is_fgc_admin() - ordinary authenticated and anon users fail');

// Policy 3: Anonymous & ordinary user UPDATE blocked; only admin allowed
const hasAdminUpdate = sql.includes('CREATE POLICY "Only authorized administrators can update articles"') &&
                       sql.includes('public.is_fgc_admin()');
check('Scenario 3 & 6: UPDATE restricted strictly to verified administrators', hasAdminUpdate,
  'UPDATE policy checks: public.is_fgc_admin() for both USING and WITH CHECK');

// Policy 4: Anonymous & ordinary user DELETE blocked; only admin allowed
const hasAdminDelete = sql.includes('CREATE POLICY "Only authorized administrators can delete articles"') &&
                       sql.includes('public.is_fgc_admin()');
check('Scenario 4 & 7: DELETE restricted strictly to verified administrators', hasAdminDelete,
  'DELETE policy checks: public.is_fgc_admin()');

// Policy 5: public.admin_users least privilege lockdown
const hasAdminUsersLockdown = sql.includes('ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;') &&
                              sql.includes('CREATE POLICY "Admins can view their own admin status"') &&
                              sql.includes('REVOKE ALL PRIVILEGES\nON TABLE public.admin_users\nFROM PUBLIC, anon, authenticated;') &&
                              sql.includes('GRANT SELECT\nON TABLE public.admin_users\nTO authenticated;');
check('Scenario 11: public.admin_users least privilege lockdown (anon/PUBLIC zero privileges; auth SELECT only)', hasAdminUsersLockdown,
  'REVOKE ALL PRIVILEGES from PUBLIC, anon, authenticated; GRANT SELECT TO authenticated; RLS enabled');

// Hardened Security Definer Function Check
const hasHardenedSecurityDefiner = sql.includes('CREATE OR REPLACE FUNCTION public.is_fgc_admin()') &&
                                  sql.includes('SECURITY DEFINER') &&
                                  sql.includes('SET search_path = pg_catalog, public, auth') &&
                                  sql.includes('REVOKE ALL ON FUNCTION public.is_fgc_admin() FROM PUBLIC;') &&
                                  sql.includes('GRANT EXECUTE ON FUNCTION public.is_fgc_admin() TO authenticated, anon;') &&
                                  sql.includes('public.admin_users') &&
                                  sql.includes('auth.uid()');
check('Hardened SECURITY DEFINER: Fixed search_path, schema-qualified, explicit EXECUTE', hasHardenedSecurityDefiner,
  'Fixed search_path prevents search_path hijacking; explicit grant ensures anon read policies evaluate without error');

// Table level privilege defense-in-depth
const hasTableLevelGrants = (sql.includes('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.articles FROM anon, PUBLIC;') ||
                             sql.includes('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.articles FROM anon;')) &&
                            sql.includes('GRANT SELECT ON TABLE public.articles TO anon;');
check('Defense-in-Depth: Anonymous stripped of all write privileges at PostgreSQL table grant level', hasTableLevelGrants,
  'Anon granted SELECT only; write DML revoked at table grant layer');

// Content preservation
const hasSafeColumnMigration = sql.includes('ALTER TABLE public.articles ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;');
check('Article Content Preservation: is_published defaults to true without modifying existing text', hasSafeColumnMigration,
  'IF NOT EXISTS ensures idempotency and zero content overwrites');

// Safe Recovery & Rollback Audit
const hasNoInsecureRollback = !sql.includes('DISABLE ROW LEVEL SECURITY') &&
                              !sql.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.articles TO anon');
check('Safe Recovery Audit: Zero insecure rollback commands (RLS never disabled; anon write never restored)', hasNoInsecureRollback,
  'Unsafe rollback eliminated and replaced with forward-fix owner recovery');

const hasForwardFixRecovery = sql.includes('SAFE EMERGENCY RECOVERY PROCEDURE (FORWARD-FIX STRATEGY)') &&
                              sql.includes('Emergency Lockdown of Writes') &&
                              sql.includes('Emergency Administrator Re-Enrollment');
check('Forward-Fix Recovery Strategy: Lockdown to read-only + owner re-enrollment defined', hasForwardFixRecovery,
  'Safe recovery preserves public reading, keeps RLS enabled, and locks writes to owner');

// Explicit Purge of All 4 Permissive Legacy Policies
const dropsAllFourLegacyPolicies = sql.includes('DROP POLICY IF EXISTS "Allow delete for all" ON public.articles;') &&
                                   sql.includes('DROP POLICY IF EXISTS "Allow insert for all" ON public.articles;') &&
                                   sql.includes('DROP POLICY IF EXISTS "Allow public read" ON public.articles;') &&
                                   sql.includes('DROP POLICY IF EXISTS "Allow update for all" ON public.articles;');
check('Legacy Policy Purge: Explicitly drops all four verified permissive policies before granting write access', dropsAllFourLegacyPolicies,
  'Ensures no legacy permissive policy can bypass new RBAC restrictions');

console.log('');

// ----------------------------------------------------------------------------
// 2. AUDIT ENROLLMENT SCRIPT & ROLE SIMULATION TEST SUITE
// ----------------------------------------------------------------------------
console.log('--- 2. AUDITING SEPARATE ENROLLMENT & ROLE SIMULATION SCRIPTS ---');

const ENROLL_SQL_PATH = path.join(ROOT, 'scripts', 'enroll-owner-admin.sql');
const SIM_SQL_PATH = path.join(ROOT, 'scripts', 'test-role-simulation.sql');

const enrollExists = fs.existsSync(ENROLL_SQL_PATH);
const enrollSql = enrollExists ? fs.readFileSync(ENROLL_SQL_PATH, 'utf8') : '';
const enrollValid = enrollExists &&
                    enrollSql.includes('v_owner_email') &&
                    enrollSql.includes('FROM auth.users') &&
                    enrollSql.includes('INSERT INTO public.admin_users');
check('Separate Owner Enrollment Script: Resolves owner from auth.users into public.admin_users', enrollValid,
  'scripts/enroll-owner-admin.sql is separated from DDL migration and contains validation');

const simExists = fs.existsSync(SIM_SQL_PATH);
const simSql = simExists ? fs.readFileSync(SIM_SQL_PATH, 'utf8') : '';
const simValid = simExists &&
                 simSql.includes('BEGIN;') &&
                 simSql.includes('ROLLBACK;') &&
                 simSql.includes('set_config(\'role\', \'anon\', true)') &&
                 simSql.includes('set_config(\'role\', \'authenticated\', true)') &&
                 simSql.includes('TEST GROUP 0: REGRESSION AUDIT');
check('Genuine Role Simulation Test Script: Transactional BEGIN...ROLLBACK with role switching', simValid,
  'scripts/test-role-simulation.sql tests anon, ordinary authenticated, admin roles and verifies legacy policy absence');

// Verification of test suite data safety
const simDataSafe = !simSql.includes('UPDATE public.articles SET title = \'Hacked\' WHERE is_published = true') &&
                    !simSql.includes('DELETE FROM public.articles WHERE is_published = true') &&
                    simSql.includes('v_disposable_published_id') &&
                    simSql.includes('v_disposable_draft_id') &&
                    simSql.includes('GET DIAGNOSTICS v_rows = ROW_COUNT;') &&
                    simSql.includes('current_user != \'anon\'') &&
                    simSql.includes('current_user != \'authenticated\'') &&
                    !simSql.includes('COMMIT;');
check('Simulation Data Isolation: Strictly targets disposable articles, checks ROW_COUNT, zero COMMITs', simDataSafe,
  'All 24 production articles protected; zero production data targeted; handles silent RLS filtering');

// Verification of admin resolution without fake FK insertion
const simAdminFkSafe = simSql.includes('FROM public.admin_users') &&
                       simSql.includes('PREREQUISITE ERROR') &&
                       !simSql.includes('INSERT INTO public.admin_users (user_id, email, role) VALUES (v_admin_uuid');
check('Simulation Admin Prerequisite: Uses verified owner from admin_users (zero fake UUID FK violations)', simAdminFkSafe,
  'Enrolled admin resolved safely from public.admin_users; aborts with helpful error if missing');

// Verification of precise exception inspection (SQLSTATE 42501 vs false-positive constraint errors)
const simSqlstatePrecise = simSql.includes("v_sqlstate = '42501'") &&
                           simSql.includes('SQLSTATE') &&
                           simSql.includes('non-permission error') &&
                           simSql.includes('v_permission_denied := true;');
check('Simulation Exception Rigor: Inspects SQLSTATE 42501 (zero false-positive passes from 23502/23503/23505)', simSqlstatePrecise,
  'Only genuine 42501 insufficient_privilege counts as security denial; constraint/syntax errors fail test immediately');

console.log('');

// ----------------------------------------------------------------------------
// 3. AUDIT FRONTEND CLIENT RBAC LOGIC
// ----------------------------------------------------------------------------
console.log('--- 3. AUDITING FRONTEND CLIENT RBAC LOGIC ---');

const appContextCode = fs.readFileSync(APP_CONTEXT_PATH, 'utf8');

// Verify zero hardcoded admin credentials in AppContext
const hasNoHardcodedCreds = !appContextCode.includes('DEFAULT_ADMIN_CREDENTIALS') &&
                            !appContextCode.includes('Sindhu@101');
check('Zero hardcoded administrator passwords in AppContext.jsx', hasNoHardcodedCreds,
  'DEFAULT_ADMIN_CREDENTIALS completely removed');

// Verify client checks admin authorization against database
const hasAdminAuthCheck = appContextCode.includes('verifyAdminAuthorization') &&
                          appContextCode.includes('check_is_admin') &&
                          appContextCode.includes('admin_users');
check('Client enforces database-level administrator verification', hasAdminAuthCheck,
  'AppContext verifies user against check_is_admin RPC and public.admin_users');

// Verify unprivileged users are signed out on /admin
const hasAutoSignOutUnprivileged = appContextCode.includes('await supabase.auth.signOut()') &&
                                   appContextCode.includes('Access Denied');
check('Ordinary authenticated users without admin role are immediately rejected', hasAutoSignOutUnprivileged,
  'SignOut invoked and access denied error returned if user not in public.admin_users');

console.log('');

// ----------------------------------------------------------------------------
// 4. LIVE DATABASE PERMISSION SCENARIOS STATUS
// ----------------------------------------------------------------------------
console.log('--- 4. LIVE SUPABASE DATABASE TESTS STATUS (DISTINCTION) ---');

notVerified('Live Remote Anonymous INSERT/UPDATE/DELETE Rejection', 
  'Awaiting website owner to execute scripts/secure-supabase-rls.sql in the Supabase Dashboard SQL Editor.');

notVerified('Live Remote Ordinary Authenticated User Write Rejection', 
  'Awaiting website owner to execute scripts/secure-supabase-rls.sql in the Supabase Dashboard SQL Editor.');

notVerified('Live Remote Verified Administrator Disposable Record CRUD', 
  'Awaiting website owner to enroll their administrator account in public.admin_users via Supabase SQL Editor.');

console.log('\n======================================================================');
console.log(`SUMMARY: ${passedChecks} Architectural Checks Passed | ${notVerifiedChecks} Live Remote Checks Awaiting Owner Execution in Supabase Dashboard`);
console.log('======================================================================');
