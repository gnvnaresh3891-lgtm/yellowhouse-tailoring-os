import {
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
  normalizeRole,
  ROLE_PERMISSIONS,
  UserRole,
} from '../lib/rbac-utils';

export function runM4Challenger2StressTests(): { passed: number; failed: number } {
  console.log('\n=============================================================');
  console.log('--- CHALLENGER 2 ADVERSARIAL STRESS TEST SUITE (M4) ---');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // -------------------------------------------------------------
  // 1. RBAC ROLE NORMALIZATION ADVERSARIAL TESTS
  // -------------------------------------------------------------
  console.log('[Section 1: RBAC Role Normalization & Aliases]');
  assert(normalizeRole('super_admin') === 'SUPER_ADMIN', 'Lowercase super_admin normalizes to SUPER_ADMIN');
  assert(normalizeRole(' SYSTEM_ADMIN ') === 'SUPER_ADMIN', 'Spaced SYSTEM_ADMIN normalizes to SUPER_ADMIN');
  assert(normalizeRole('karigar') === 'EMBROIDERY_ARTISAN', 'karigar alias normalizes to EMBROIDERY_ARTISAN');
  assert(normalizeRole('receptionist') === 'SALES_FRONT_DESK', 'receptionist alias normalizes to SALES_FRONT_DESK');
  assert(normalizeRole('customer') === 'CUSTOMER_VIEW', 'customer alias normalizes to CUSTOMER_VIEW');
  assert(normalizeRole('tenant_owner') === 'ATELIER_MANAGER', 'tenant_owner alias normalizes to ATELIER_MANAGER');
  assert(normalizeRole('branch_manager') === 'ATELIER_MANAGER', 'branch_manager alias normalizes to ATELIER_MANAGER');
  assert(normalizeRole('') === null, 'Empty string role returns null');
  assert(normalizeRole('  ') === null, 'Whitespace-only role returns null');
  assert(normalizeRole('hacker_role') === null, 'Unknown role string returns null');
  assert(normalizeRole(null as any) === null, 'Null role input returns null');
  assert(normalizeRole(undefined as any) === null, 'Undefined role input returns null');

  // -------------------------------------------------------------
  // 2. ROUTE ACCESS CONTROL & PREFIX ISOLATION TESTS
  // -------------------------------------------------------------
  console.log('\n[Section 2: Route Access Control & Prefix Boundary Testing]');
  
  // Sub-routes testing
  assert(canUserAccessRoute('SUPER_ADMIN', '/admin/users/123'), 'SUPER_ADMIN can access sub-route /admin/users/123');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/production/job/99'), 'EMBROIDERY_ARTISAN can access sub-route /production/job/99');
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/orders/new?client=42#step1'), 'SALES_FRONT_DESK handles query params and hashes in /orders/new');

  // Trailing slash testing
  assert(canUserAccessRoute('ATELIER_MANAGER', '/dashboard/'), 'ATELIER_MANAGER handles trailing slash in /dashboard/');
  assert(canUserAccessRoute('MASTER_TAILOR', '/measurements/'), 'MASTER_TAILOR handles trailing slash in /measurements/');

  // False positive prefix attack prevention (e.g. /admin_backup should NOT match /admin)
  assert(!canUserAccessRoute('ATELIER_MANAGER', '/admin_backup'), 'ATELIER_MANAGER blocked from /admin_backup (prevent prefix false-matches)');
  assert(!canUserAccessRoute('EMBROIDERY_ARTISAN', '/production_logs_secret'), 'EMBROIDERY_ARTISAN blocked from /production_logs_secret');

  // Falsy / invalid role inputs
  assert(!canUserAccessRoute('', '/dashboard'), 'Empty string role denied access to /dashboard');
  assert(!canUserAccessRoute('INVALID_ROLE', '/dashboard'), 'Invalid role denied access to /dashboard');
  assert(!canUserAccessRoute(null as any, '/dashboard'), 'Null role denied access to /dashboard');

  // -------------------------------------------------------------
  // 3. FALLBACK REDIRECT ROUTE INTEGRITY TESTS
  // -------------------------------------------------------------
  console.log('\n[Section 3: Fallback Redirect Routing Integrity]');
  
  // All 7 roles default landing route checks
  const roles: UserRole[] = [
    'SUPER_ADMIN', 'ATELIER_MANAGER', 'MASTER_TAILOR',
    'EMBROIDERY_ARTISAN', 'SALES_FRONT_DESK', 'QUALITY_INSPECTOR', 'CUSTOMER_VIEW'
  ];

  for (const r of roles) {
    const defaultLanding = ROLE_PERMISSIONS[r].defaultLanding;
    // Attempting forbidden route '/forbidden_secret'
    const fallback = getFallbackRedirectRoute(r, '/forbidden_secret');
    assert(fallback === defaultLanding, `Role ${r} attempting forbidden route redirects to default landing ${defaultLanding}`);

    // Attempting allowed route returns attempted route
    const allowedRoute = ROLE_PERMISSIONS[r].allowedRoutes[0];
    const allowedFallback = getFallbackRedirectRoute(r, allowedRoute);
    assert(allowedFallback === allowedRoute, `Role ${r} attempting allowed route ${allowedRoute} returns ${allowedRoute}`);
  }

  // Falsy & Invalid roles fallback redirect to /login
  assert(getFallbackRedirectRoute('', '/dashboard') === '/login', 'Empty role redirects to /login');
  assert(getFallbackRedirectRoute('HACKER', '/admin') === '/login', 'Unknown role redirects to /login');
  assert(getFallbackRedirectRoute(null as any, '/orders') === '/login', 'Null role redirects to /login');

  // -------------------------------------------------------------
  // 4. SIDEBAR NAV FILTERING ADVERSARIAL TESTS
  // -------------------------------------------------------------
  console.log('\n[Section 4: Navigation Items Filtering Matrix]');
  const sampleNav = [
    { href: '/admin', label: 'Admin' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/customers', label: 'Customers' },
    { href: '/measurements', label: 'Measurements' },
    { href: '/orders', label: 'Orders' },
    { href: '/production', label: 'Production' },
    { href: '/staff', label: 'Staff' },
    { href: '/onboarding', label: 'Onboarding' },
  ];

  assert(filterNavItemsForRole(sampleNav, 'SUPER_ADMIN').length === 8, 'SUPER_ADMIN nav retains all 8 items');
  assert(filterNavItemsForRole(sampleNav, 'ATELIER_MANAGER').length === 6, 'ATELIER_MANAGER nav retains 6 items');
  assert(filterNavItemsForRole(sampleNav, 'MASTER_TAILOR').length === 5, 'MASTER_TAILOR nav retains 5 items');
  assert(filterNavItemsForRole(sampleNav, 'EMBROIDERY_ARTISAN').length === 2, 'EMBROIDERY_ARTISAN nav retains 2 items');
  assert(filterNavItemsForRole(sampleNav, 'SALES_FRONT_DESK').length === 4, 'SALES_FRONT_DESK nav retains 4 items');
  assert(filterNavItemsForRole(sampleNav, 'QUALITY_INSPECTOR').length === 4, 'QUALITY_INSPECTOR nav retains 4 items');
  assert(filterNavItemsForRole(sampleNav, 'CUSTOMER_VIEW').length === 2, 'CUSTOMER_VIEW nav retains 2 items');
  assert(filterNavItemsForRole(sampleNav, 'INVALID').length === 0, 'Invalid role nav returns empty array');
  assert(filterNavItemsForRole(sampleNav, '').length === 0, 'Empty role nav returns empty array');

  console.log(`\n-------------------------------------------------------------`);
  console.log(`STRESS TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`-------------------------------------------------------------\n`);

  return { passed, failed };
}

if (require.main === module) {
  const res = runM4Challenger2StressTests();
  if (res.failed > 0) process.exit(1);
}
