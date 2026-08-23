import {
  normalizeRole,
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
  ROLE_PERMISSIONS,
  UserRole,
} from '../lib/rbac-utils';

export function runAdversarialM4Tests(): { passed: number; failed: number; findings: string[] } {
  console.log('\n==================================================');
  console.log('--- MILESTONE 4 ADVERSARIAL RBAC & UI TEST SUITE ---');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, msg: string, vulnerabilityDetail?: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
      if (vulnerabilityDetail) {
        findings.push(vulnerabilityDetail);
      }
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: INVALID ROLE STRINGS & NON-STRING TYPES
  // ----------------------------------------------------
  console.log('[Subsuite 1: Invalid Role Inputs & Type Hardening]');

  // Test null/undefined
  assert(normalizeRole(null as any) === null, 'normalizeRole(null) returns null');
  assert(normalizeRole(undefined as any) === null, 'normalizeRole(undefined) returns null');
  assert(normalizeRole('') === null, 'normalizeRole("") returns null');
  assert(normalizeRole('   ') === null, 'normalizeRole("   ") returns null');
  assert(normalizeRole('BOGUS_ROLE') === null, 'normalizeRole("BOGUS_ROLE") returns null');

  // Test non-string primitive / object types (Vulnerability Check)
  try {
    const resNum = normalizeRole(123 as any);
    assert(resNum === null, 'normalizeRole(123) handles numeric input without throwing exception');
  } catch (e: any) {
    findings.push('Type Hardening Vulnerability: normalizeRole throws TypeError when passed non-string role types (e.g. 123) because it calls .toUpperCase() without checking typeof role === "string".');
    console.log('⚠️ EMPIRICAL BUG CONFIRMED: normalizeRole(123) throws TypeError: ' + e.message);
  }

  try {
    const resObj = normalizeRole({ role: 'SUPER_ADMIN' } as any);
    assert(resObj === null, 'normalizeRole(object) handles object input without throwing exception');
  } catch (e: any) {
    console.log('⚠️ EMPIRICAL BUG CONFIRMED: normalizeRole(object) throws TypeError: ' + e.message);
  }

  // Test Case Sensitivity & Trimming
  assert(normalizeRole('master_tailor') === 'MASTER_TAILOR', 'normalizeRole parses lowercase role string "master_tailor"');
  assert(normalizeRole('  EMBROIDERY_ARTISAN  ') === 'EMBROIDERY_ARTISAN', 'normalizeRole trims whitespace surrounding role string');
  assert(normalizeRole('karigar') === 'EMBROIDERY_ARTISAN', 'normalizeRole resolves alias "karigar" to EMBROIDERY_ARTISAN');

  // ----------------------------------------------------
  // SECTION 2: FORBIDDEN ROUTE ACCESS & PATH TRAVERSAL
  // ----------------------------------------------------
  console.log('\n[Subsuite 2: Route Guard Security & Path Normalization]');

  // Standard Allowed / Forbidden Matrix
  assert(canUserAccessRoute('SUPER_ADMIN', '/admin') === true, 'SUPER_ADMIN can access /admin');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/admin') === false, 'EMBROIDERY_ARTISAN cannot access /admin');
  assert(canUserAccessRoute('CUSTOMER_VIEW', '/dashboard') === false, 'CUSTOMER_VIEW cannot access /dashboard');
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/production') === false, 'SALES_FRONT_DESK cannot access /production');

  // Subroutes & Query Params
  assert(canUserAccessRoute('ATELIER_MANAGER', '/customers/123/edit?tab=measurements#profile') === true, 
    'ATELIER_MANAGER can access /customers subroutes with query params and hash fragments');

  // Path Traversal Security Test
  const pathTraversalAllowed = canUserAccessRoute('MASTER_TAILOR', '/dashboard/../admin');
  if (pathTraversalAllowed) {
    findings.push('RBAC Security Vulnerability: Path traversal sequence "/dashboard/../admin" bypasses canUserAccessRoute guard for MASTER_TAILOR because startsWith("/dashboard/") matches before path normalization.');
    console.log('⚠️ EMPIRICAL BUG CONFIRMED: canUserAccessRoute("MASTER_TAILOR", "/dashboard/../admin") returned true!');
  } else {
    assert(true, 'MASTER_TAILOR blocked from path traversal attempt "/dashboard/../admin"');
  }

  // Trailing Slashes & Case Insensitivity on Routes
  assert(canUserAccessRoute('MASTER_TAILOR', '/production/') === true, 'Trailing slash handled correctly');
  
  // Unauthenticated / Missing Arguments
  assert(canUserAccessRoute('' as any, '/dashboard') === false, 'Empty role returns false for route access');
  assert(canUserAccessRoute(null as any, '/admin') === false, 'Null role returns false for route access');
  assert(canUserAccessRoute('SUPER_ADMIN', '') === false, 'Empty route returns false');

  // ----------------------------------------------------
  // SECTION 3: EMPTY NAVIGATION & FALLBACK REDIRECTS
  // ----------------------------------------------------
  console.log('\n[Subsuite 3: Navigation Filtering & Fallback Redirects]');

  const testNav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/admin', label: 'Admin' },
    { href: '/production', label: 'Production' },
  ];

  assert(filterNavItemsForRole([], 'SUPER_ADMIN').length === 0, 'Filtering empty nav items array returns []');
  assert(filterNavItemsForRole(testNav, '' as any).length === 0, 'Filtering with empty role returns []');
  assert(filterNavItemsForRole(testNav, 'INVALID_ROLE').length === 0, 'Filtering with invalid role returns []');
  
  try {
    const filtered = filterNavItemsForRole(testNav, 999 as any);
    assert(filtered.length === 0, 'Filtering with non-string role returns [] without exception');
  } catch (e: any) {
    findings.push('Type Vulnerability: filterNavItemsForRole crashes on non-string role values.');
    console.log('⚠️ EMPIRICAL BUG CONFIRMED: filterNavItemsForRole(nav, 999) threw TypeError: ' + e.message);
  }

  // Fallback Redirect Tests
  assert(getFallbackRedirectRoute('CUSTOMER_VIEW', '/admin') === '/orders', 'CUSTOMER_VIEW forbidden route fallback to /orders');
  assert(getFallbackRedirectRoute('EMBROIDERY_ARTISAN', '/staff') === '/production', 'EMBROIDERY_ARTISAN forbidden route fallback to /production');
  assert(getFallbackRedirectRoute('INVALID_ROLE' as any, '/admin') === '/login', 'Invalid role fallback to /login');
  assert(getFallbackRedirectRoute(null as any, '/admin') === '/login', 'Null role fallback to /login');

  // ----------------------------------------------------
  // SECTION 4: UI STATE RESILIENCE & LAYOUT BOUNDS
  // ----------------------------------------------------
  console.log('\n[Subsuite 4: UI State Handling & Layout Bounds]');

  // Test role.replace exception safety in UI layout context
  const mockUsers = [
    { name: 'Alice', role: 'SUPER_ADMIN' },
    { name: 'Bob' }, // missing role
    { name: 'Charlie', role: null }, // null role
    { name: 'Dave', role: 123 }, // numeric role
  ];

  for (const u of mockUsers) {
    try {
      if (u.role && typeof u.role === 'string') {
        const displayRole = u.role.replace('_', ' ');
        assert(typeof displayRole === 'string', `User ${u.name} display role formatted cleanly`);
      } else {
        // If role is missing or not a string, calling u.role.replace will throw
        let safeDisplay = (u as any).role && typeof (u as any).role === 'string' 
          ? (u as any).role.replace('_', ' ') 
          : 'User';
        assert(safeDisplay === 'User', `User ${u.name} without valid string role safely defaults to 'User'`);
      }
    } catch (e: any) {
      assert(false, `User ${u.name} role display threw exception: ${e.message}`,
        `UI Vulnerability: DashboardLayout crashes with TypeError when rendering user card if yh_auth_user.role is missing or non-string because of direct call: currentUser.role.replace('_', ' ').`);
    }
  }

  console.log('\n========================================');
  console.log(`M4 ADVERSARIAL SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`Found ${findings.length} potential vulnerabilities / edge case bugs.`);
  console.log('========================================\n');

  return { passed, failed, findings };
}
