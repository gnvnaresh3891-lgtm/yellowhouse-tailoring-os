/**
 * YellowHouse Tailoring OS — Print Layouts & RBAC Navigation Expansion Test Suite (Milestone 4)
 */

import {
  canUserAccessRoute,
  getFallbackRedirectRoute,
  filterNavItemsForRole,
  normalizeRole,
  UserRole,
  ROLE_PERMISSIONS
} from '../lib/rbac-utils';

import {
  SEED_FASHION_ASSETS,
  SEED_MATERIAL_ORDERS,
  SEED_MACHINE_RESERVATIONS,
  SEED_MATERIALS_CATALOG
} from '../lib/ecosystem-seeds';

import { generateHMACLicenseSignature } from '../lib/ecosystem-algorithms';

export function runPrintAndRbacExpansionTests(): { passed: number; failed: number } {
  console.log('\n==================================================');
  console.log('--- SUITE: PRINT LAYOUTS & RBAC EXPANSION (MILESTONE 4) ---');
  console.log('==================================================\n');

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

  // --------------------------------------------------------------------------
  // SECTION 1: Role Normalization & Route Access Matrix for Ecosystem
  // --------------------------------------------------------------------------
  console.log('[Section 1: Role Normalization & Expanded Route Access Matrix]');

  assert(normalizeRole('SUPER_ADMIN') === 'SUPER_ADMIN', 'Normalizes SUPER_ADMIN');
  assert(normalizeRole('TENANT_OWNER') === 'ATELIER_MANAGER', 'Normalizes TENANT_OWNER to ATELIER_MANAGER');
  assert(normalizeRole('KARIGAR') === 'EMBROIDERY_ARTISAN', 'Normalizes KARIGAR to EMBROIDERY_ARTISAN');
  assert(normalizeRole('RECEPTIONIST') === 'SALES_FRONT_DESK', 'Normalizes RECEPTIONIST to SALES_FRONT_DESK');
  assert(normalizeRole('CUSTOMER') === 'CUSTOMER_VIEW', 'Normalizes CUSTOMER to CUSTOMER_VIEW');

  // Super Admin Matrix
  const superAdminRoutes = [
    '/admin', '/dashboard', '/customers', '/measurements', '/orders',
    '/production', '/staff', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
  ];
  for (const r of superAdminRoutes) {
    assert(canUserAccessRoute('SUPER_ADMIN', r) === true, `SUPER_ADMIN can access ${r}`);
  }

  // Atelier Manager Matrix
  const managerAllowed = [
    '/dashboard', '/customers', '/measurements', '/orders',
    '/production', '/staff', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
  ];
  for (const r of managerAllowed) {
    assert(canUserAccessRoute('ATELIER_MANAGER', r) === true, `ATELIER_MANAGER can access ${r}`);
  }
  assert(canUserAccessRoute('ATELIER_MANAGER', '/admin') === false, 'ATELIER_MANAGER is denied /admin');

  // Master Tailor Matrix
  const tailorAllowed = [
    '/dashboard', '/customers', '/measurements', '/orders',
    '/production', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
  ];
  for (const r of tailorAllowed) {
    assert(canUserAccessRoute('MASTER_TAILOR', r) === true, `MASTER_TAILOR can access ${r}`);
  }
  assert(canUserAccessRoute('MASTER_TAILOR', '/admin') === false, 'MASTER_TAILOR is denied /admin');
  assert(canUserAccessRoute('MASTER_TAILOR', '/staff') === false, 'MASTER_TAILOR is denied /staff');

  // Embroidery Artisan (Karigar) Matrix
  const artisanAllowed = ['/production', '/measurements', '/bidding', '/equipment', '/stylists'];
  for (const r of artisanAllowed) {
    assert(canUserAccessRoute('EMBROIDERY_ARTISAN', r) === true, `EMBROIDERY_ARTISAN can access ${r}`);
  }
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/admin') === false, 'EMBROIDERY_ARTISAN denied /admin');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/dashboard') === false, 'EMBROIDERY_ARTISAN denied /dashboard');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/customers') === false, 'EMBROIDERY_ARTISAN denied /customers');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/orders') === false, 'EMBROIDERY_ARTISAN denied /orders');
  assert(canUserAccessRoute('EMBROIDERY_ARTISAN', '/staff') === false, 'EMBROIDERY_ARTISAN denied /staff');

  // Sales Front Desk Matrix
  const salesAllowed = ['/dashboard', '/customers', '/measurements', '/orders', '/marketplace', '/stylists', '/supply'];
  for (const r of salesAllowed) {
    assert(canUserAccessRoute('SALES_FRONT_DESK', r) === true, `SALES_FRONT_DESK can access ${r}`);
  }
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/admin') === false, 'SALES_FRONT_DESK denied /admin');
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/production') === false, 'SALES_FRONT_DESK denied /production');
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/equipment') === false, 'SALES_FRONT_DESK denied /equipment');
  assert(canUserAccessRoute('SALES_FRONT_DESK', '/bidding') === false, 'SALES_FRONT_DESK denied /bidding');

  // Quality Inspector Matrix
  const qcAllowed = ['/dashboard', '/orders', '/production', '/measurements', '/marketplace', '/supply', '/equipment'];
  for (const r of qcAllowed) {
    assert(canUserAccessRoute('QUALITY_INSPECTOR', r) === true, `QUALITY_INSPECTOR can access ${r}`);
  }
  assert(canUserAccessRoute('QUALITY_INSPECTOR', '/admin') === false, 'QUALITY_INSPECTOR denied /admin');
  assert(canUserAccessRoute('QUALITY_INSPECTOR', '/customers') === false, 'QUALITY_INSPECTOR denied /customers');
  assert(canUserAccessRoute('QUALITY_INSPECTOR', '/staff') === false, 'QUALITY_INSPECTOR denied /staff');

  // Customer View Matrix
  const customerAllowed = ['/orders', '/measurements', '/marketplace', '/stylists'];
  for (const r of customerAllowed) {
    assert(canUserAccessRoute('CUSTOMER_VIEW', r) === true, `CUSTOMER_VIEW can access ${r}`);
  }
  assert(canUserAccessRoute('CUSTOMER_VIEW', '/admin') === false, 'CUSTOMER_VIEW denied /admin');
  assert(canUserAccessRoute('CUSTOMER_VIEW', '/dashboard') === false, 'CUSTOMER_VIEW denied /dashboard');
  assert(canUserAccessRoute('CUSTOMER_VIEW', '/production') === false, 'CUSTOMER_VIEW denied /production');
  assert(canUserAccessRoute('CUSTOMER_VIEW', '/equipment') === false, 'CUSTOMER_VIEW denied /equipment');

  // --------------------------------------------------------------------------
  // SECTION 2: Fallback Redirects & Navigation Filtering
  // --------------------------------------------------------------------------
  console.log('\n[Section 2: Fallback Redirects & Nav Items Filtering]');

  assert(getFallbackRedirectRoute('EMBROIDERY_ARTISAN', '/admin') === '/production', 'Artisan attempting /admin redirects to /production');
  assert(getFallbackRedirectRoute('EMBROIDERY_ARTISAN', '/bidding') === '/bidding', 'Artisan attempting /bidding stays on /bidding');
  assert(getFallbackRedirectRoute('SALES_FRONT_DESK', '/equipment') === '/orders', 'Sales Front Desk attempting /equipment redirects to /orders');
  assert(getFallbackRedirectRoute('CUSTOMER_VIEW', '/staff') === '/orders', 'Customer attempting /staff redirects to /orders');
  assert(getFallbackRedirectRoute('SUPER_ADMIN', '/admin') === '/admin', 'Super Admin attempting /admin stays on /admin');

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/customers', label: 'Customers' },
    { href: '/measurements', label: 'Measurements' },
    { href: '/orders', label: 'Orders' },
    { href: '/production', label: 'Production' },
    { href: '/staff', label: 'Staff' },
    { href: '/admin', label: 'Admin' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/equipment', label: 'Equipment' },
    { href: '/supply', label: 'Supply' },
    { href: '/bidding', label: 'Bidding' },
    { href: '/stylists', label: 'Stylists' },
  ];

  const filteredCustomer = filterNavItemsForRole(allNavItems, 'CUSTOMER_VIEW');
  assert(filteredCustomer.length === 4, `Customer sees exactly 4 nav items (got ${filteredCustomer.length})`);
  assert(filteredCustomer.some(i => i.href === '/marketplace'), 'Customer nav includes /marketplace');
  assert(filteredCustomer.some(i => i.href === '/stylists'), 'Customer nav includes /stylists');

  const filteredArtisan = filterNavItemsForRole(allNavItems, 'EMBROIDERY_ARTISAN');
  assert(filteredArtisan.length === 5, `Artisan sees exactly 5 nav items (got ${filteredArtisan.length})`);
  assert(filteredArtisan.some(i => i.href === '/bidding'), 'Artisan nav includes /bidding');
  assert(filteredArtisan.some(i => i.href === '/equipment'), 'Artisan nav includes /equipment');

  // --------------------------------------------------------------------------
  // SECTION 3: Print Layout Data Contract Verification
  // --------------------------------------------------------------------------
  console.log('\n[Section 3: Print Layout Data Contracts & Barcode Signatures]');

  // Tech Pack Spec Print Contract
  const sampleAsset = SEED_FASHION_ASSETS[0];
  assert(!!sampleAsset.techPackSpecs, 'Asset techPackSpecs exists');
  assert(sampleAsset.techPackSpecs.patternPiecesCount === 18, 'Pattern pieces count is 18');
  assert(sampleAsset.techPackSpecs.gradingRange.length >= 5, 'Grading range has 5+ standard sizes');
  assert(sampleAsset.techPackSpecs.seamAllowancesMm === 12.5, 'Seam allowances is 12.5mm');
  assert(sampleAsset.techPackSpecs.estimatedSewingSamMinutes === 420, 'SAM minutes is 420');

  const signature = generateHMACLicenseSignature(sampleAsset.id, 'tenant_flagship_01', 'COMMERCIAL_PRODUCTION', '2026-08-23T12:00:00Z');
  assert(signature.length === 64, 'Generated 64-character SHA-256 HMAC signature for Tech Pack license verification');

  // Material BOM Print Contract
  const sampleOrder = SEED_MATERIAL_ORDERS[0];
  assert(sampleOrder.orderNumber === 'MSO-2026-089', 'Order number is MSO-2026-089');
  assert(sampleOrder.items.length >= 1, 'BOM has material items');
  assert(sampleOrder.subtotalInr === 86580, 'Material subtotal is ₹86,580');
  assert(sampleOrder.taxGstInr === 4329, '5% Textile GST is ₹4,329');
  assert(sampleOrder.totalAmountInr === 91159, 'Grand total = 86580 + 250 shipping + 4329 GST = ₹91,159');

  // Machine Reservation Ticket Contract
  const sampleReservation = SEED_MACHINE_RESERVATIONS[0];
  assert(sampleReservation.reservationNumber === 'RES-2026-MCH-089', 'Reservation number is RES-2026-MCH-089');
  assert(sampleReservation.totalDurationHours === 4, 'Total reservation duration is 4 hours');
  assert(sampleReservation.costBreakdown.machineBaseCost === 8800, 'Machine base rental cost is ₹8,800');
  assert(sampleReservation.costBreakdown.operatorFee === 3000, 'Operator fee is ₹3,000');
  assert(sampleReservation.costBreakdown.cleaningFee === 500, 'Cleaning fee is ₹500');
  assert(sampleReservation.costBreakdown.taxesInr === 2214, '18% Services GST is ₹2,214');
  assert(sampleReservation.costBreakdown.totalAmountInr === 22514, 'Total escrow amount = 8800 + 3000 + 500 + 8000 deposit + 2214 GST = ₹22,514');

  console.log(`\n--- PRINT & RBAC EXPANSION SUMMARY: ${passed} PASSED, ${failed} FAILED ---\n`);
  return { passed, failed };
}
