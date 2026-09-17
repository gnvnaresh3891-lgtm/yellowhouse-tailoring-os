/**
 * YellowHouse Tailoring OS — Milestone 5 Admin Security Console & Ecosystem Marketplace Test Suite
 * Master Admin Passkey Gate, Global Multi-Tenant Management, MRR & P&L Telemetry,
 * Soft-Delete Audit Log Aggregator, 6 RedHouse Ecosystem Modules, and 404 Routing.
 *
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 5 & RBAC / Security Invariants
 * - ORIGINAL_REQUEST.md § R1 (Multi-Tenant RBAC & Admin Security Hardening)
 * - apps/web/src/lib/admin-utils.ts
 * - apps/web/src/lib/plugin-registry.ts
 * - apps/web/src/lib/ecosystem-algorithms.ts
 * - apps/web/src/lib/ecosystem-seeds.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock localStorage for Node test runner environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
}

if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: new LocalStorageMock(),
    dispatchEvent: () => true,
    CustomEvent: class {
      constructor(public type: string, public eventInitDict?: any) {}
    },
  };
}
if (!(global as any).localStorage) {
  (global as any).localStorage = (global as any).window.localStorage;
}

import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import {
  Tenant,
  TenantPlan,
  TenantStatus,
  AuditLog,
  AdminUser,
  MASTER_ADMIN_PASSKEYS,
  PLAN_PRICING,
  INITIAL_TENANTS,
  DEFAULT_ADMIN_USER,
  formatInrCurrency,
  isMasterPasskeyValid,
  verifyMasterPasskey,
  isSuperAdminUser,
  filterTenants,
  computeTenantStats,
  toggleTenantStatus,
  createNewTenant,
  aggregateAuditLogs,
  generateAuditCsv,
} from '../lib/admin-utils';

import {
  REGISTERED_PLUGINS,
  getTenantPluginSettings,
  setPluginEnabledState,
  RedHousePluginManifest,
} from '../lib/plugin-registry';

import {
  SEED_FASHION_ASSETS,
  SEED_WORKSHOP_MACHINES,
  SEED_MATERIALS_CATALOG,
  SEED_TAILOR_BIDS,
  SEED_CERTIFIED_STYLISTS,
  SEED_TENANT_TRIAL_PROFILE,
} from '../lib/ecosystem-seeds';

import {
  calculateVolumeDiscountedPrice,
  transitionContractMilestone,
  evaluateTrialEntitlements,
  computeSha256Hex,
} from '../lib/ecosystem-algorithms';

export interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runM5AdminEcosystemTests(): TestResult {
  console.log('\n====================================================================');
  console.log('--- MILESTONE 5: ADMIN SECURITY CONSOLE & ECOSYSTEM MARKETPLACE ---');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
      findings.push(`FAIL: ${msg}`);
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // Clear mock localStorage before test execution
  (global as any).localStorage.clear();

  // ============================================================================
  // SUITE 1: MASTER ADMIN PASSKEY GATE & RBAC VERIFICATION
  // ============================================================================
  console.log('\n[Suite 1: Master Admin Passkey Gate & Security Hardening]');

  // 1.1 Invariant: Accepted passkeys
  assert(
    MASTER_ADMIN_PASSKEYS.includes('yh-admin-2026'),
    'Passkey whitelist contains authoritative passkey yh-admin-2026'
  );
  assert(
    MASTER_ADMIN_PASSKEYS.includes('admin123'),
    'Passkey whitelist contains secondary passkey admin123'
  );
  assert(
    MASTER_ADMIN_PASSKEYS.includes('yellowhouse@admin'),
    'Passkey whitelist contains legacy passkey yellowhouse@admin'
  );
  assert(
    MASTER_ADMIN_PASSKEYS.length === 3,
    'Passkey whitelist contains exactly 3 authorized administrative passkeys'
  );

  // 1.2 Authentication challenge logic
  const authPrimary = verifyMasterPasskey('yh-admin-2026');
  assert(authPrimary.success === true, 'verifyMasterPasskey succeeds for yh-admin-2026');
  assert(
    authPrimary.user?.role === 'SUPER_ADMIN',
    'Authenticated admin user holds SUPER_ADMIN role'
  );
  assert(
    authPrimary.user?.tenant.code === 'GLOBAL-HQ',
    'Authenticated admin user belongs to GLOBAL-HQ platform tenant'
  );

  const authSecondary = verifyMasterPasskey('admin123');
  assert(authSecondary.success === true, 'verifyMasterPasskey succeeds for admin123');

  const authLegacy = verifyMasterPasskey('yellowhouse@admin');
  assert(authLegacy.success === true, 'verifyMasterPasskey succeeds for yellowhouse@admin');

  // 1.3 Rejection of invalid / unauthorized passkeys
  const authInvalid1 = verifyMasterPasskey('wrong-pass');
  assert(authInvalid1.success === false, 'verifyMasterPasskey rejects wrong-pass');
  assert(
    Boolean(authInvalid1.error?.includes('Access restricted')),
    'Error message clearly explains access restriction'
  );

  const authInvalid2 = verifyMasterPasskey('yh-admin-2025');
  assert(authInvalid2.success === false, 'verifyMasterPasskey rejects expired passkey yh-admin-2025');

  const authEmpty = verifyMasterPasskey('');
  assert(authEmpty.success === false, 'verifyMasterPasskey rejects empty string');
  assert(
    Boolean(authEmpty.error?.includes('Please enter')),
    'Empty passkey returns prompt error message'
  );

  const authWhitespace = verifyMasterPasskey('   ');
  assert(authWhitespace.success === false, 'verifyMasterPasskey rejects whitespace-only string');

  // 1.4 Admin role checker
  assert(
    isSuperAdminUser({ role: 'SUPER_ADMIN' }) === true,
    'isSuperAdminUser returns true for SUPER_ADMIN'
  );
  assert(
    isSuperAdminUser({ role: 'SYSTEM_ADMIN' }) === true,
    'isSuperAdminUser returns true for SYSTEM_ADMIN'
  );
  assert(
    isSuperAdminUser({ role: 'TENANT_OWNER' }) === false,
    'isSuperAdminUser returns false for TENANT_OWNER'
  );
  assert(
    isSuperAdminUser({ role: 'KARIGAR' }) === false,
    'isSuperAdminUser returns false for KARIGAR'
  );
  assert(
    isSuperAdminUser(null) === false,
    'isSuperAdminUser returns false for null user'
  );
  assert(
    isSuperAdminUser({}) === false,
    'isSuperAdminUser returns false for empty user object'
  );

  // 1.5 Session persistence in yh_auth_user
  if (authPrimary.user) {
    setLocalStorage('yh_auth_user', authPrimary.user);
    const storedUser = getLocalStorage<AdminUser | null>('yh_auth_user', null);
    assert(storedUser !== null, 'yh_auth_user persists to storage');
    assert(storedUser?.role === 'SUPER_ADMIN', 'Persisted user retains SUPER_ADMIN role');
    assert(isSuperAdminUser(storedUser), 'isSuperAdminUser validates persisted storage user');
  }

  // 1.6 Verify DashboardLayout bypass rule in code
  try {
    const layoutPath = path.resolve(__dirname, '../app/(dashboard)/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    const hasAdminBypass =
      layoutContent.includes("pathname === '/admin'") &&
      layoutContent.includes("pathname.startsWith('/admin/')");
    assert(
      hasAdminBypass,
      'DashboardLayout contains pathname === "/admin" || pathname.startsWith("/admin/") bypass rule'
    );
  } catch (err: any) {
    assert(false, `Failed to inspect DashboardLayout: ${err.message}`);
  }

  // ============================================================================
  // SUITE 2: MULTI-TENANT MANAGEMENT & LIFECYCLE ALGORITHMS
  // ============================================================================
  console.log('\n[Suite 2: Multi-Tenant Directory & Lifecycle Algorithms]');

  // 2.1 Initial tenants verification
  assert(INITIAL_TENANTS.length === 6, 'INITIAL_TENANTS contains exactly 6 seed ateliers');
  INITIAL_TENANTS.forEach((t) => {
    assert(!!t.id && !!t.name && !!t.slug, `Tenant ${t.id} has id, name, and slug`);
    assert(
      t.plan === 'Enterprise' || t.plan === 'Pro' || t.plan === 'Starter',
      `Tenant ${t.id} has valid plan tier: ${t.plan}`
    );
    assert(
      t.status === 'Active' || t.status === 'Suspended',
      `Tenant ${t.id} has valid status: ${t.status}`
    );
    assert(t.staffCount > 0, `Tenant ${t.id} staff count > 0`);
  });

  // 2.2 Plan pricing table
  assert(PLAN_PRICING.Enterprise === 45000, 'Enterprise tier MRR is ₹45,000');
  assert(PLAN_PRICING.Pro === 25000, 'Pro tier MRR is ₹25,000');
  assert(PLAN_PRICING.Starter === 5000, 'Starter tier MRR is ₹5,000');

  // 2.3 Filter by search query
  const searchName = filterTenants(INITIAL_TENANTS, 'Royal');
  assert(
    searchName.length === 1 && searchName[0].slug === 'royal-silhouette',
    'filterTenants finds "Royal Silhouette Atelier" by name substring'
  );

  const searchOwner = filterTenants(INITIAL_TENANTS, 'Tariq');
  assert(
    searchOwner.length === 1 && searchOwner[0].owner === 'Tariq Nawab',
    'filterTenants finds tenant by owner name'
  );

  const searchLocation = filterTenants(INITIAL_TENANTS, 'Jaipur');
  assert(
    searchLocation.length === 1 && searchLocation[0].location === 'Jaipur',
    'filterTenants finds tenant by location'
  );

  const searchSlug = filterTenants(INITIAL_TENANTS, 'silk-thread');
  assert(
    searchSlug.length === 1 && searchSlug[0].slug === 'silk-thread',
    'filterTenants finds tenant by slug'
  );

  const searchEmpty = filterTenants(INITIAL_TENANTS, '');
  assert(
    searchEmpty.length === INITIAL_TENANTS.length,
    'Empty search returns all tenants'
  );

  // 2.4 Filter by subscription plan
  const enterpriseTenants = filterTenants(INITIAL_TENANTS, '', 'Enterprise', 'All');
  assert(
    enterpriseTenants.every((t) => t.plan === 'Enterprise'),
    'Plan filter "Enterprise" returns only Enterprise tier'
  );
  assert(enterpriseTenants.length === 1, 'Exactly 1 Enterprise tenant in initial seed');

  const proTenants = filterTenants(INITIAL_TENANTS, '', 'Pro', 'All');
  assert(
    proTenants.every((t) => t.plan === 'Pro'),
    'Plan filter "Pro" returns only Pro tier'
  );
  assert(proTenants.length === 3, 'Exactly 3 Pro tenants in initial seed');

  const starterTenants = filterTenants(INITIAL_TENANTS, '', 'Starter', 'All');
  assert(
    starterTenants.every((t) => t.plan === 'Starter'),
    'Plan filter "Starter" returns only Starter tier'
  );
  assert(starterTenants.length === 2, 'Exactly 2 Starter tenants in initial seed');

  // 2.5 Filter by status
  const activeTenants = filterTenants(INITIAL_TENANTS, '', 'All', 'Active');
  assert(
    activeTenants.every((t) => t.status === 'Active'),
    'Status filter "Active" returns only Active ateliers'
  );
  assert(activeTenants.length === 5, 'Exactly 5 Active tenants in initial seed');

  const suspendedTenants = filterTenants(INITIAL_TENANTS, '', 'All', 'Suspended');
  assert(
    suspendedTenants.every((t) => t.status === 'Suspended'),
    'Status filter "Suspended" returns only Suspended ateliers'
  );
  assert(suspendedTenants.length === 1, 'Exactly 1 Suspended tenant in initial seed (Zari & Zardozi)');

  // 2.6 Multi-facet filter combination
  const combinedFilter = filterTenants(INITIAL_TENANTS, 'Zari', 'Pro', 'Suspended');
  assert(
    combinedFilter.length === 1 && combinedFilter[0].slug === 'zari-zardozi',
    'Multi-facet filter (search="Zari", plan="Pro", status="Suspended") precisely isolates target'
  );

  // 2.7 Tenant creation algorithm
  const newTenant = createNewTenant({
    name: 'Couture Royale Studio',
    slug: 'couture-royale',
    plan: 'Enterprise',
    owner: 'Arjun Mehra',
    location: 'Delhi NCR',
    staffCount: 14,
  });

  assert(newTenant.name === 'Couture Royale Studio', 'createNewTenant creates tenant with given name');
  assert(newTenant.slug === 'couture-royale', 'createNewTenant sets sanitized slug');
  assert(newTenant.plan === 'Enterprise', 'createNewTenant sets Enterprise plan');
  assert(newTenant.status === 'Active', 'createNewTenant sets default status to Active');
  assert(newTenant.mrrValue === 45000, 'createNewTenant assigns correct Enterprise MRR of 45000');
  assert(newTenant.mrr === '₹45,000', 'createNewTenant formats MRR as ₹45,000');
  assert(newTenant.orders === 0, 'createNewTenant initializes order count to 0');
  assert(newTenant.staffCount === 14, 'createNewTenant sets staffCount to 14');

  // 2.8 Slug sanitization in createNewTenant
  const dirtySlugTenant = createNewTenant({
    name: 'Modern & Chic Atelier!',
    slug: 'Modern & Chic Atelier! 2026',
    plan: 'Starter',
  });
  assert(
    dirtySlugTenant.slug === 'modern-chic-atelier-2026',
    'createNewTenant sanitizes dirty slug into clean URL-safe slug'
  );

  // 2.9 Status toggle algorithm
  const toggleResult1 = toggleTenantStatus(INITIAL_TENANTS, 't-1'); // t-1 was Active
  assert(
    toggleResult1.newStatus === 'Suspended',
    'toggleTenantStatus switches Active tenant to Suspended'
  );
  assert(
    toggleResult1.affectedTenant?.mrrValue === 0,
    'Suspended tenant MRR value becomes 0'
  );
  assert(
    toggleResult1.affectedTenant?.mrr === '₹0',
    'Suspended tenant formatted MRR becomes ₹0'
  );

  // Toggle back to Active
  const toggleResult2 = toggleTenantStatus(toggleResult1.updatedTenants, 't-1');
  assert(
    toggleResult2.newStatus === 'Active',
    'toggleTenantStatus reactivates Suspended tenant'
  );
  assert(
    toggleResult2.affectedTenant?.mrrValue === 45000,
    'Reactivated Enterprise tenant recovers ₹45,000 MRR'
  );

  // 2.10 Storage persistence for tenants
  setLocalStorage('yh_admin_tenants', INITIAL_TENANTS);
  const storedTenants = getLocalStorage<Tenant[]>('yh_admin_tenants', []);
  assert(
    storedTenants.length === INITIAL_TENANTS.length,
    'yh_admin_tenants persists full tenant array to localStorage'
  );

  // ============================================================================
  // SUITE 3: MRR, P&L TELEMETRY & ANALYTICS ENGINE
  // ============================================================================
  console.log('\n[Suite 3: P&L Telemetry & MRR Metrics Engine]');

  const initialStats = computeTenantStats(INITIAL_TENANTS);

  // 3.1 Total & Active counts
  assert(initialStats.totalTenantsCount === 6, 'Total tenants count is 6');
  assert(initialStats.activeSubsCount === 5, 'Active subscriptions count is 5');
  assert(initialStats.suspendedSubsCount === 1, 'Suspended subscriptions count is 1');

  // 3.2 Revenue calculation invariant: Suspended tenants contribute 0 to MRR
  // Active: t-1 (45000) + t-2 (25000) + t-3 (25000) + t-4 (5000) + t-6 (5000) = 105000
  // Suspended: t-5 (0)
  assert(
    initialStats.monthlyRevenueVal === 105000,
    `Monthly revenue equals exact sum of Active tenant MRR (expected 105000, got ${initialStats.monthlyRevenueVal})`
  );
  assert(
    initialStats.monthlyRevenueStr === '₹1,05,000',
    `Monthly revenue formatted as ₹1,05,000 (got ${initialStats.monthlyRevenueStr})`
  );

  // 3.3 Platform orders & karigar pool
  const expectedOrders = 342 + 215 + 178 + 89 + 134 + 45; // 1003
  assert(
    initialStats.totalOrdersVal === expectedOrders,
    `Total platform orders sum correctly (${expectedOrders})`
  );

  const expectedStaff = 12 + 8 + 6 + 3 + 5 + 2; // 36
  assert(
    initialStats.karigarPoolCount === expectedStaff,
    `Total staff / karigar pool sums correctly (${expectedStaff})`
  );

  // 3.4 Subscription distribution
  assert(
    initialStats.distributionData.length === 3,
    'Distribution data contains all 3 tiers: Pro, Starter, Enterprise'
  );
  const proDist = initialStats.distributionData.find((d) => d.plan === 'Pro');
  const starterDist = initialStats.distributionData.find((d) => d.plan === 'Starter');
  const enterpriseDist = initialStats.distributionData.find((d) => d.plan === 'Enterprise');

  assert(proDist?.count === 3, 'Pro tier has 3 tenants');
  assert(starterDist?.count === 2, 'Starter tier has 2 tenants');
  assert(enterpriseDist?.count === 1, 'Enterprise tier has 1 tenant');

  // 3.5 Empty array safety
  const emptyStats = computeTenantStats([]);
  assert(emptyStats.totalTenantsCount === 0, 'Empty tenant array returns 0 tenants');
  assert(emptyStats.monthlyRevenueVal === 0, 'Empty tenant array returns ₹0 revenue');
  assert(emptyStats.avgMrrPerTenantVal === 0, 'Empty tenant array avoids division by zero');

  // ============================================================================
  // SUITE 4: SOFT-DELETE AUDIT LOG VIEWER & CSV EXPORT
  // ============================================================================
  console.log('\n[Suite 4: Soft-Delete Audit Log Aggregator & CSV Exporter]');

  const mockDeletedOrders = [
    {
      id: 'del-ord-1',
      action: 'SOFT_DELETE_ORDER',
      orderNumber: 'ORD-2026-089',
      reason: 'Client requested cancellation',
      timestamp: '2026-09-14T10:00:00.000Z',
    },
    {
      id: 'del-ord-2',
      action: 'SOFT_DELETE_ORDER',
      orderNumber: 'ORD-2026-042',
      reason: 'Fabric damaged during intake',
      timestamp: '2026-09-12T14:30:00.000Z',
    },
  ];

  const mockDeletedCustomers = [
    {
      id: 'del-cust-1',
      action: 'ARCHIVE_CUSTOMER',
      customerName: 'Aarav Singhania',
      reason: 'Duplicate profile merged',
      timestamp: '2026-09-15T08:00:00.000Z',
    },
  ];

  const mockDeletedJobs = [
    {
      id: 'del-job-1',
      action: 'CANCEL_JOB_CARD',
      jobTitle: 'Sherwani Zardozi Collar',
      reason: 'Production line reallocated',
      timestamp: '2026-09-13T16:45:00.000Z',
    },
  ];

  // 4.1 Log aggregation
  const aggregated = aggregateAuditLogs(mockDeletedOrders, mockDeletedCustomers, mockDeletedJobs);
  assert(
    aggregated.length === 4,
    'aggregateAuditLogs combines all 4 records across orders, customers, and jobs'
  );

  // 4.2 Chronological descending sort (latest first)
  assert(
    aggregated[0].id === 'del-cust-1',
    'Latest log (2026-09-15T08:00:00Z) appears first'
  );
  assert(
    aggregated[aggregated.length - 1].id === 'del-ord-2',
    'Oldest log (2026-09-12T14:30:00Z) appears last'
  );

  // 4.3 Entity mapping
  const orderLog = aggregated.find((l) => l.id === 'del-ord-1');
  assert(orderLog?.entity === 'Order', 'Order deletion tagged with entity="Order"');
  assert(orderLog?.entityName === 'ORD-2026-089', 'Order entity name maps to orderNumber');

  const customerLog = aggregated.find((l) => l.id === 'del-cust-1');
  assert(customerLog?.entity === 'Customer', 'Customer deletion tagged with entity="Customer"');
  assert(customerLog?.entityName === 'Aarav Singhania', 'Customer entity name maps to customerName');

  const jobLog = aggregated.find((l) => l.id === 'del-job-1');
  assert(jobLog?.entity === 'Job', 'Job deletion tagged with entity="Job"');
  assert(jobLog?.entityName === 'Sherwani Zardozi Collar', 'Job entity name maps to jobTitle');

  // 4.4 CSV generation
  const csv = generateAuditCsv(aggregated);
  assert(
    csv.includes('ID,Timestamp,Action,Entity,Entity Name,Reason'),
    'CSV includes authoritative RFC header row'
  );
  assert(csv.includes('del-cust-1'), 'CSV contains customer log ID');
  assert(csv.includes('"Aarav Singhania"'), 'CSV quotes entity name properly');
  assert(csv.includes('"Sherwani Zardozi Collar"'), 'CSV quotes job name properly');

  // 4.5 Empty logs safety
  const emptyLogs = aggregateAuditLogs([], [], []);
  assert(emptyLogs.length === 0, 'aggregateAuditLogs safely handles empty inputs');
  const emptyCsv = generateAuditCsv([]);
  assert(
    emptyCsv === 'ID,Timestamp,Action,Entity,Entity Name,Reason',
    'generateAuditCsv on empty array yields header line only'
  );

  // ============================================================================
  // SUITE 5: ECOSYSTEM MARKETPLACE MODULES & PLUGIN REGISTRY
  // ============================================================================
  console.log('\n[Suite 5: Ecosystem Marketplace Modules & Plugin Registry]');

  // 5.1 Plugin registry manifests
  assert(
    REGISTERED_PLUGINS.length === 5,
    'REGISTERED_PLUGINS contains all 5 extension layers'
  );

  const expectedPluginIds = [
    'plugin-marketplace',
    'plugin-equipment-sharing',
    'plugin-material-sourcing',
    'plugin-tailor-bidding',
    'plugin-stylist-directory',
  ];

  expectedPluginIds.forEach((pid) => {
    const p = REGISTERED_PLUGINS.find((x) => x.id === pid);
    assert(!!p, `Plugin ${pid} registered in manifest`);
    assert(p?.isCore === true, `Plugin ${pid} is marked as core module`);
    assert(p?.defaultEnabled === true, `Plugin ${pid} defaultEnabled is true`);
    assert(!!p?.route && p.route.startsWith('/redhouse/'), `Plugin ${pid} has valid /redhouse/ route`);
  });

  // 5.2 Plugin state toggling & storage persistence
  const initialSettings = getTenantPluginSettings();
  assert(
    initialSettings['plugin-marketplace'] === true,
    'plugin-marketplace initially enabled'
  );

  const updatedSettings = setPluginEnabledState('plugin-marketplace', false);
  assert(
    updatedSettings['plugin-marketplace'] === false,
    'setPluginEnabledState disables plugin'
  );

  const reloadedSettings = getTenantPluginSettings();
  assert(
    reloadedSettings['plugin-marketplace'] === false,
    'Plugin disabled state persists in localStorage'
  );

  // Restore state
  setPluginEnabledState('plugin-marketplace', true);
  assert(
    getTenantPluginSettings()['plugin-marketplace'] === true,
    'Plugin re-enabled successfully'
  );

  // 5.3 Layer 1: Digital Fashion Assets Seed & Schema
  assert(SEED_FASHION_ASSETS.length > 0, 'SEED_FASHION_ASSETS contains seeded digital assets');
  const sampleAsset = SEED_FASHION_ASSETS[0];
  assert(!!sampleAsset.id && !!sampleAsset.title, 'Asset has id and title');
  assert(!!sampleAsset.pricingTiers, 'Asset has pricingTiers');
  assert(
    sampleAsset.pricingTiers.personalBespoke.priceInr > 0,
    'Personal license pricing defined'
  );
  assert(
    sampleAsset.pricingTiers.commercialProduction.priceInr > sampleAsset.pricingTiers.personalBespoke.priceInr,
    'Commercial license pricing > personal pricing'
  );

  // 5.4 Layer 2: Equipment Sharing Seed & Status
  assert(
    SEED_WORKSHOP_MACHINES.length > 0,
    'SEED_WORKSHOP_MACHINES contains machine listings'
  );
  const sampleMachine = SEED_WORKSHOP_MACHINES[0];
  assert(!!sampleMachine.id && !!sampleMachine.name, 'Machine has id and name');
  assert(sampleMachine.pricing.hourlyRateInr > 0, 'Machine has hourly rate in INR');
  assert(
    typeof sampleMachine.requiresCertification === 'boolean',
    'Machine specifies operator requirements'
  );

  // 5.5 Layer 3: Material Sourcing Volume Discount Algorithm
  const sampleMaterial = SEED_MATERIALS_CATALOG[0];
  assert(!!sampleMaterial, 'SEED_MATERIALS_CATALOG contains material items');
  const discountTier1 = calculateVolumeDiscountedPrice(sampleMaterial, 5);
  const discountTier2 = calculateVolumeDiscountedPrice(sampleMaterial, 50);
  assert(
    discountTier1.unitPricePerMeterInr >= discountTier2.unitPricePerMeterInr,
    'Volume discount reduces effective price per meter for larger quantities'
  );

  // 5.6 Layer 4: Tailor Bidding & Milestone State Transitions
  assert(SEED_TAILOR_BIDS.length > 0, 'SEED_TAILOR_BIDS contains tailor bids');
  const sampleBid = SEED_TAILOR_BIDS[0];
  assert(!!sampleBid.id && !!sampleBid.artisanName, 'Bid has id and artisanName');
  assert(sampleBid.totalBidAmountInr > 0, 'Bid has positive proposed amount');

  // 5.7 Layer 5: Stylists & 3-Month Trial Entitlements
  assert(
    SEED_CERTIFIED_STYLISTS.length > 0,
    'SEED_CERTIFIED_STYLISTS contains certified stylist profiles'
  );
  const trialEval = evaluateTrialEntitlements(SEED_TENANT_TRIAL_PROFILE);
  assert(
    typeof trialEval.isTrialActive === 'boolean',
    'evaluateTrialEntitlements computes trial active state'
  );
  assert(
    trialEval.daysRemaining >= 0,
    'evaluateTrialEntitlements computes remaining days non-negative'
  );

  // ============================================================================
  // SUITE 6: ROUTE INVARIANTS, 404 HANDLER & APP ROUTER COMPLIANCE
  // ============================================================================
  console.log('\n[Suite 6: Route Invariants, 404 Handler & Next.js 14 App Router]');

  // 6.1 Check not-found.tsx exists and exports default function
  try {
    const notFoundPath = path.resolve(__dirname, '../app/not-found.tsx');
    assert(fs.existsSync(notFoundPath), 'apps/web/src/app/not-found.tsx exists on disk');

    const notFoundCode = fs.readFileSync(notFoundPath, 'utf8');
    assert(
      notFoundCode.includes('export default function NotFound'),
      'not-found.tsx exports default function NotFound'
    );
    assert(
      !notFoundCode.match(/export (const|let|var|function|type|interface) (?!default)/),
      'not-found.tsx has 0 named runtime exports (strict App Router compliance)'
    );
    assert(
      notFoundCode.includes('/dashboard'),
      'not-found.tsx renders navigation link to /dashboard'
    );
    assert(
      notFoundCode.includes('/redhouse/marketplace'),
      'not-found.tsx renders navigation link to /redhouse/marketplace'
    );
  } catch (err: any) {
    assert(false, `Failed to verify not-found.tsx: ${err.message}`);
  }

  // 6.2 Check _not-found/page.tsx exists and exports default function
  try {
    const altNotFoundPath = path.resolve(__dirname, '../app/_not-found/page.tsx');
    assert(fs.existsSync(altNotFoundPath), 'apps/web/src/app/_not-found/page.tsx exists on disk');

    const altNotFoundCode = fs.readFileSync(altNotFoundPath, 'utf8');
    assert(
      altNotFoundCode.includes('export default function'),
      '_not-found/page.tsx exports default function'
    );
  } catch (err: any) {
    assert(false, `Failed to verify _not-found/page.tsx: ${err.message}`);
  }

  // 6.3 Check admin/page.tsx exports strictly default function
  try {
    const adminPagePath = path.resolve(__dirname, '../app/(dashboard)/admin/page.tsx');
    assert(fs.existsSync(adminPagePath), 'apps/web/src/app/(dashboard)/admin/page.tsx exists');

    const adminPageCode = fs.readFileSync(adminPagePath, 'utf8');
    assert(
      adminPageCode.includes('export default function GlobalAdminDashboard'),
      'admin/page.tsx exports default function GlobalAdminDashboard'
    );
    assert(
      !adminPageCode.match(/export (const|let|var|function|type|interface) (?!default)/),
      'admin/page.tsx has 0 named runtime exports'
    );
    assert(
      adminPageCode.includes('Global Security Console') || adminPageCode.includes('Master Admin Console'),
      'admin/page.tsx renders Master Admin Console header'
    );
  } catch (err: any) {
    assert(false, `Failed to verify admin/page.tsx: ${err.message}`);
  }

  // 6.4 Check all 6 RedHouse ecosystem routes on disk
  const redhousePages = [
    'src/app/(dashboard)/redhouse/page.tsx',
    'src/app/(dashboard)/redhouse/marketplace/page.tsx',
    'src/app/(dashboard)/redhouse/bidding/page.tsx',
    'src/app/(dashboard)/redhouse/equipment/page.tsx',
    'src/app/(dashboard)/redhouse/supply/page.tsx',
    'src/app/(dashboard)/redhouse/stylists/page.tsx',
  ];

  redhousePages.forEach((rel) => {
    const fullPath = path.resolve(__dirname, '../..', rel);
    assert(fs.existsSync(fullPath), `Route file exists: ${rel}`);

    const content = fs.readFileSync(fullPath, 'utf8');
    assert(
      content.includes('export default function'),
      `Route file ${rel} exports default function`
    );
  });

  // 6.5 Check all 5 root alias routes on disk
  const aliasPages = [
    'src/app/marketplace/page.tsx',
    'src/app/bidding/page.tsx',
    'src/app/equipment/page.tsx',
    'src/app/supply/page.tsx',
    'src/app/stylists/page.tsx',
  ];

  aliasPages.forEach((rel) => {
    const fullPath = path.resolve(__dirname, '../..', rel);
    assert(fs.existsSync(fullPath), `Root alias route exists: ${rel}`);

    const content = fs.readFileSync(fullPath, 'utf8');
    assert(
      content.includes('export default function'),
      `Alias route ${rel} exports default function`
    );
  });

  // ============================================================================
  // SUITE 7: ADVERSARIAL STRESS & INJECTION TESTING
  // ============================================================================
  console.log('\n[Suite 7: Adversarial Security & Stress Testing]');

  // 7.1 Injection attempts against passkey challenge
  const maliciousInputs = [
    "' OR '1'='1",
    "<script>alert('pwn')</script>",
    "admin' --",
    "yh-admin-2026\0admin",
    "../../etc/passwd",
    "yh-admin-2026'; DROP TABLE tenants;--",
    "\n\ryh-admin-2026",
    "yh-admin-2026 ", // Trailing space must either be trimmed or tested safely
  ];

  maliciousInputs.forEach((input) => {
    const trimmed = input.trim();
    const result = verifyMasterPasskey(input);
    if (trimmed === 'yh-admin-2026') {
      // If the trimmed input matches genuine passkey, it is authorized
      assert(result.success === true, `Valid passkey with surrounding space "${input}" validates cleanly`);
    } else {
      assert(
        result.success === false,
        `Adversarial passkey payload "${input}" is safely rejected without crash`
      );
    }
  });

  // 7.2 Corrupted localStorage recovery
  setLocalStorage('yh_admin_tenants', 'corrupted-non-json-data');
  const recoveredTenants = getLocalStorage<Tenant[]>('yh_admin_tenants', INITIAL_TENANTS);
  assert(
    Array.isArray(recoveredTenants),
    'Storage utils recover gracefully from corrupted non-JSON tenant storage'
  );

  // 7.3 Extreme staff and order numbers in stats
  const extremeTenants: Tenant[] = [
    {
      id: 'ext-1',
      name: 'Mega Factory Atelier',
      slug: 'mega-factory',
      plan: 'Enterprise',
      status: 'Active',
      staffCount: 5000,
      orders: 250000,
      mrr: '₹45,000',
      mrrValue: 45000,
      owner: 'Industrial Head',
      location: 'Gujarat',
      joinedDate: 'Jan 2024',
    },
  ];

  const extremeStats = computeTenantStats(extremeTenants);
  assert(extremeStats.karigarPoolCount === 5000, 'Calculates large staff pool without overflow');
  assert(extremeStats.totalOrdersVal === 250000, 'Calculates large order volume without overflow');
  assert(extremeStats.monthlyRevenueVal === 45000, 'Calculates single enterprise revenue accurately');

  console.log('\n====================================================================');
  console.log(`MILESTONE 5 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  return { passed, failed, findings };
}
