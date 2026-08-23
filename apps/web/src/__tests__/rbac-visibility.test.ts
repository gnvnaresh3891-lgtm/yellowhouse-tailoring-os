import {
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
  UserRole,
  ROLE_PERMISSIONS,
} from '../lib/rbac-utils';

const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/customers', label: 'Customers' },
  { href: '/measurements', label: 'Measurements' },
  { href: '/orders', label: 'Orders' },
  { href: '/production', label: 'Production' },
  { href: '/staff', label: 'Staff Management' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/admin', label: 'Admin Panel' },
];

export function runRbacVisibilityTests(): { passed: number; failed: number } {
  console.log('\n[Suite 7: RBAC Route Visibility & Guard Verification]');
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

  // 1. SUPER_ADMIN Permissions Test
  assert(
    canUserAccessRoute('SUPER_ADMIN', '/admin') &&
    canUserAccessRoute('SUPER_ADMIN', '/dashboard') &&
    canUserAccessRoute('SUPER_ADMIN', '/staff'),
    'SUPER_ADMIN has full access to /admin, /dashboard, and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'SUPER_ADMIN').length === 8,
    'SUPER_ADMIN sidebar navigation renders all 8 main routes'
  );

  // 2. ATELIER_MANAGER Permissions Test
  assert(
    canUserAccessRoute('ATELIER_MANAGER', '/staff') &&
    canUserAccessRoute('ATELIER_MANAGER', '/dashboard'),
    'ATELIER_MANAGER has access to /staff and /dashboard'
  );
  assert(
    !canUserAccessRoute('ATELIER_MANAGER', '/admin') &&
    !canUserAccessRoute('ATELIER_MANAGER', '/onboarding'),
    'ATELIER_MANAGER is restricted from /admin and /onboarding'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'ATELIER_MANAGER').length === 6,
    'ATELIER_MANAGER sidebar renders exactly 6 allowed routes'
  );

  // 3. MASTER_TAILOR Permissions Test
  assert(
    canUserAccessRoute('MASTER_TAILOR', '/measurements') &&
    canUserAccessRoute('MASTER_TAILOR', '/production'),
    'MASTER_TAILOR has access to /measurements and /production'
  );
  assert(
    !canUserAccessRoute('MASTER_TAILOR', '/staff') &&
    !canUserAccessRoute('MASTER_TAILOR', '/admin'),
    'MASTER_TAILOR is restricted from /staff and /admin'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'MASTER_TAILOR').length === 5,
    'MASTER_TAILOR sidebar renders exactly 5 technical routes'
  );

  // 4. EMBROIDERY_ARTISAN (Karigar) Isolation Test
  assert(
    canUserAccessRoute('EMBROIDERY_ARTISAN', '/production') &&
    canUserAccessRoute('EMBROIDERY_ARTISAN', '/measurements'),
    'EMBROIDERY_ARTISAN can access /production and /measurements'
  );
  assert(
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/customers') &&
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/orders') &&
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/dashboard'),
    'EMBROIDERY_ARTISAN is isolated from /customers, /orders, and /dashboard'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'EMBROIDERY_ARTISAN').length === 2,
    'EMBROIDERY_ARTISAN sidebar renders exactly 2 workshop routes'
  );

  // 5. SALES_FRONT_DESK Permissions Test
  assert(
    canUserAccessRoute('SALES_FRONT_DESK', '/orders') &&
    canUserAccessRoute('SALES_FRONT_DESK', '/customers'),
    'SALES_FRONT_DESK has access to /orders and /customers'
  );
  assert(
    !canUserAccessRoute('SALES_FRONT_DESK', '/production') &&
    !canUserAccessRoute('SALES_FRONT_DESK', '/staff'),
    'SALES_FRONT_DESK is restricted from /production and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'SALES_FRONT_DESK').length === 4,
    'SALES_FRONT_DESK sidebar renders exactly 4 sales routes'
  );

  // 6. QUALITY_INSPECTOR Permissions Test
  assert(
    canUserAccessRoute('QUALITY_INSPECTOR', '/production') &&
    canUserAccessRoute('QUALITY_INSPECTOR', '/orders'),
    'QUALITY_INSPECTOR has access to /production and /orders'
  );
  assert(
    !canUserAccessRoute('QUALITY_INSPECTOR', '/customers') &&
    !canUserAccessRoute('QUALITY_INSPECTOR', '/staff'),
    'QUALITY_INSPECTOR is restricted from /customers and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'QUALITY_INSPECTOR').length === 4,
    'QUALITY_INSPECTOR sidebar renders exactly 4 QC routes'
  );

  // 7. CUSTOMER_VIEW Permissions Test
  assert(
    canUserAccessRoute('CUSTOMER_VIEW', '/orders') &&
    canUserAccessRoute('CUSTOMER_VIEW', '/measurements'),
    'CUSTOMER_VIEW has access to /orders and /measurements'
  );
  assert(
    !canUserAccessRoute('CUSTOMER_VIEW', '/dashboard') &&
    !canUserAccessRoute('CUSTOMER_VIEW', '/production') &&
    !canUserAccessRoute('CUSTOMER_VIEW', '/customers'),
    'CUSTOMER_VIEW is restricted from internal management routes'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'CUSTOMER_VIEW').length === 2,
    'CUSTOMER_VIEW sidebar renders exactly 2 client routes'
  );

  // 8. Route Guard Redirect & Invalid Input Handling Test
  assert(
    getFallbackRedirectRoute('EMBROIDERY_ARTISAN', '/admin') === '/production',
    'Forbidden route access for EMBROIDERY_ARTISAN redirects to /production'
  );
  assert(
    getFallbackRedirectRoute('SALES_FRONT_DESK', '/staff') === '/orders',
    'Forbidden route access for SALES_FRONT_DESK redirects to /orders'
  );
  assert(
    getFallbackRedirectRoute('INVALID_ROLE' as any, '/dashboard') === '/login',
    'Invalid role input falls back cleanly to /login'
  );

  return { passed, failed };
}
