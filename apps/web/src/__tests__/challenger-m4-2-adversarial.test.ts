/**
 * YellowHouse Tailoring OS — Milestone 4 Challenger Adversarial Test Suite
 * Empirical stress tests for:
 * 1. 7 Platform Roles Recognition, Invariants, and Rejection of Invalid/Malicious Roles
 * 2. Customer CRM Multi-Axis Search, Filtering (VIP Tier, Gender, Balance, Tags) & Sorting
 * 3. XSS & SQL Injection Payloads in Customer & Staff Data with URL Safe Encoding
 * 4. Measurement Snapshot Isolation & Zero Cross-Customer Telemetry Leakage
 * 5. Pure SVG Vector Barcode/QR Generation & Isolated @media print CSS Audit
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  PLATFORM_ROLES_LIST,
  PLATFORM_ROLES,
  PlatformRole,
  StaffRole,
  StaffMember,
  ROLE_CONFIGS,
  INITIAL_STAFF,
  isValidPlatformRole,
  getRoleBadgeClass,
  getRoleBadgeVariant,
  getStatusBadgeVariant,
  Customer,
  INITIAL_CUSTOMERS,
  filterCustomers,
  buildCustomerCadLink,
  filterSnapshotsForCustomer,
  computeCustomerStats,
  getVipTierBadgeVariant,
  VIPTier,
} from '../lib/staff-utils';

export interface ChallengerTestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runChallengerM42AdversarialSuite(): ChallengerTestResult {
  console.log('\n====================================================================');
  console.log('--- CHALLENGER M4-2: ADVERSARIAL STRESS SUITE (OPERATIONS & PRINT) ---');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, expected: string = 'PASS', actual: string = 'PASS') {
    if (!condition) {
      const msg = `FAILED: ${testName} — Expected [${expected}], Got [${actual}]`;
      console.error(`❌ ${msg}`);
      findings.push(msg);
      failed++;
    } else {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    }
  }

  // Base directory resolution
  const cwd = process.cwd();
  const webRoot =
    cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
      ? cwd
      : path.join(cwd, 'apps', 'web');

  /**
   * Helper to safely transpile and load TSX modules in CommonJS ts-node runtime
   */
  function loadTsxModule(filePath: string): any {
    const code = fs.readFileSync(filePath, 'utf8');
    const transpileResult = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    });

    const moduleExports: any = {};
    const customRequire = (id: string) => {
      if (id === 'react' || id === 'React') return React;
      if (id === 'react-dom/server') return { renderToStaticMarkup };
      if (id === 'clsx') return require('clsx');
      if (id === 'tailwind-merge') return require('tailwind-merge');
      if (id === 'lucide-react') return require('lucide-react');
      if (id.startsWith('@/')) {
        const relPath = id.slice(2);
        const resolved = path.join(webRoot, 'src', relPath);
        if (fs.existsSync(resolved + '.ts') || fs.existsSync(resolved + '.tsx')) {
          return loadTsxModule(fs.existsSync(resolved + '.tsx') ? resolved + '.tsx' : resolved + '.ts');
        }
        return require(resolved);
      }
      if (id.startsWith('./') || id.startsWith('../')) {
        const dir = path.dirname(filePath);
        const resolved = path.resolve(dir, id);
        if (fs.existsSync(resolved + '.tsx')) return loadTsxModule(resolved + '.tsx');
        if (fs.existsSync(resolved + '.ts')) return loadTsxModule(resolved + '.ts');
        if (fs.existsSync(resolved)) return require(resolved);
      }
      return require(id);
    };

    const fn = new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      'React',
      transpileResult.outputText
    );
    const moduleObj = { exports: moduleExports };
    fn(moduleExports, customRequire, moduleObj, filePath, path.dirname(filePath), React);
    return moduleObj.exports;
  }

  const idCodesModule = loadTsxModule(path.join(webRoot, 'src', 'components', 'id-codes.tsx'));
  const QRCodeSVG = idCodesModule.QRCodeSVG;
  const BarcodeSVG = idCodesModule.BarcodeSVG;

  // =========================================================================
  // SUB-SUITE 1: 7 PLATFORM ROLES RECOGNITION, BOUNDARY & INVARIANTS
  // =========================================================================
  console.log('[Sub-Suite 1: 7 Platform Roles Recognition, Boundary & Invariants]');

  const authoritative7Roles: PlatformRole[] = [
    'SUPER_ADMIN',
    'TENANT_OWNER',
    'BRANCH_MANAGER',
    'MASTER_TAILOR',
    'RECEPTIONIST',
    'KARIGAR',
    'ACCOUNTANT',
  ];

  assert(PLATFORM_ROLES_LIST.length === 7, 'PLATFORM_ROLES_LIST contains exactly 7 platform roles', '7', String(PLATFORM_ROLES_LIST.length));
  assert(new Set(PLATFORM_ROLES_LIST).size === 7, 'All 7 roles in PLATFORM_ROLES_LIST are distinct and unique');

  for (const role of authoritative7Roles) {
    assert(isValidPlatformRole(role) === true, `Recognizes authoritative role: ${role}`);
    assert((PLATFORM_ROLES_LIST as readonly string[]).includes(role), `Role ${role} is present in PLATFORM_ROLES_LIST`);
  }

  // Reject invalid / lowercase / whitespace / adversarial role inputs
  const adversarialRoles = [
    'super_admin',
    'tenant_owner',
    'branch_manager',
    'master_tailor',
    'receptionist',
    'karigar',
    'accountant',
    ' SUPER_ADMIN ',
    'KARIGAR\n',
    'ADMIN',
    'SUPERADMIN',
    'OWNER',
    'TAILOR',
    'MASTER',
    'ACCOUNTS',
    'MANAGER',
    'CLIENT',
    'CUSTOMER',
    'GUEST',
    'USER',
    'DEVELOPER',
    'ROOT',
    'ANONYMOUS',
    'CHALLENGER',
    '',
    '   ',
    'null',
    'undefined',
    "admin' OR '1'='1",
    '<script>alert("admin")</script>',
    '__proto__',
    'constructor',
    'SUPER_ADMIN\0',
  ];

  for (const badRole of adversarialRoles) {
    assert(isValidPlatformRole(badRole) === false, `Strictly rejects invalid role: "${badRole}"`);
  }

  // Coerced non-string inputs
  assert(isValidPlatformRole(null as any) === false, 'Rejects null input');
  assert(isValidPlatformRole(undefined as any) === false, 'Rejects undefined input');
  assert(isValidPlatformRole(12345 as any) === false, 'Rejects numeric input');
  assert(isValidPlatformRole({ role: 'SUPER_ADMIN' } as any) === false, 'Rejects object input');

  // Verify ROLE_CONFIGS integrity
  assert(ROLE_CONFIGS.length === 7, 'ROLE_CONFIGS defines metadata for all 7 roles');
  for (const config of ROLE_CONFIGS) {
    assert(isValidPlatformRole(config.role), `ROLE_CONFIGS entry ${config.role} has valid role`);
    assert(typeof config.label === 'string' && config.label.length > 0, `Config ${config.role} has valid label: "${config.label}"`);
    assert(typeof config.description === 'string' && config.description.length > 0, `Config ${config.role} has non-empty description`);
    assert(['gold', 'info', 'warning', 'success', 'danger', 'neutral'].includes(config.badgeVariant), `Config ${config.role} has valid badgeVariant`);
    assert(typeof config.badgeClass === 'string' && config.badgeClass.startsWith('badge'), `Config ${config.role} has valid badgeClass`);
  }

  // Verify Role Badge mappings
  assert(getRoleBadgeClass('SUPER_ADMIN') === 'badge badge-gold', 'SUPER_ADMIN badge class is badge badge-gold');
  assert(getRoleBadgeClass('TENANT_OWNER') === 'badge badge-gold', 'TENANT_OWNER badge class is badge badge-gold');
  assert(getRoleBadgeClass('BRANCH_MANAGER') === 'badge badge-blue', 'BRANCH_MANAGER badge class is badge badge-blue');
  assert(getRoleBadgeClass('MASTER_TAILOR') === 'badge badge-amber', 'MASTER_TAILOR badge class is badge badge-amber');
  assert(getRoleBadgeClass('RECEPTIONIST') === 'badge badge-emerald', 'RECEPTIONIST badge class is badge badge-emerald');
  assert(getRoleBadgeClass('KARIGAR') === 'badge badge-rose', 'KARIGAR badge class is badge badge-rose');
  assert(getRoleBadgeClass('ACCOUNTANT') === 'badge badge-blue', 'ACCOUNTANT badge class is badge badge-blue');
  assert(getRoleBadgeClass('UNKNOWN_ROLE') === 'badge badge-neutral', 'Fallback unknown role badge class is badge badge-neutral');

  assert(getRoleBadgeVariant('SUPER_ADMIN') === 'gold', 'SUPER_ADMIN badge variant is gold');
  assert(getRoleBadgeVariant('TENANT_OWNER') === 'gold', 'TENANT_OWNER badge variant is gold');
  assert(getRoleBadgeVariant('BRANCH_MANAGER') === 'info', 'BRANCH_MANAGER badge variant is info');
  assert(getRoleBadgeVariant('MASTER_TAILOR') === 'warning', 'MASTER_TAILOR badge variant is warning');
  assert(getRoleBadgeVariant('RECEPTIONIST') === 'success', 'RECEPTIONIST badge variant is success');
  assert(getRoleBadgeVariant('KARIGAR') === 'danger', 'KARIGAR badge variant is danger');
  assert(getRoleBadgeVariant('ACCOUNTANT') === 'info', 'ACCOUNTANT badge variant is info');
  assert(getRoleBadgeVariant('UNKNOWN_ROLE') === 'neutral', 'Fallback unknown role badge variant is neutral');

  // Verify Status Badge variants
  assert(getStatusBadgeVariant('Active') === 'success', 'Active status variant is success');
  assert(getStatusBadgeVariant('Inactive') === 'neutral', 'Inactive status variant is neutral');
  assert(getStatusBadgeVariant('On Leave') === 'warning', 'On Leave status variant is warning');
  assert(getStatusBadgeVariant('Pending') === 'warning', 'Pending status variant is warning');
  assert(getStatusBadgeVariant('Unknown' as any) === 'neutral', 'Unknown status variant defaults to neutral');

  // Verify Seeded Staff roster integrity
  assert(INITIAL_STAFF.length >= 7, 'INITIAL_STAFF contains at least 7 staff members');
  const staffRolesFound = new Set(INITIAL_STAFF.map((s) => s.role));
  for (const r of authoritative7Roles) {
    assert(staffRolesFound.has(r), `Seeded staff roster includes representation for role: ${r}`);
  }
  const staffIds = INITIAL_STAFF.map((s) => s.id);
  assert(new Set(staffIds).size === staffIds.length, 'All seeded staff IDs are globally unique');

  // =========================================================================
  // SUB-SUITE 2: CUSTOMER CRM SEARCH & MULTI-AXIS FILTERING
  // =========================================================================
  console.log('\n[Sub-Suite 2: Customer CRM Search & Multi-Axis Filtering]');

  // 1. Keyword search (Name, Phone, Email, ID)
  const searchUppercase = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'MALHOTRA' });
  assert(searchUppercase.length === 1 && searchUppercase[0].name === 'Rajeshwar Malhotra', 'Case-insensitive uppercase search matches patron');

  const searchLowercase = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'malhotra' });
  assert(searchLowercase.length === 1 && searchLowercase[0].name === 'Rajeshwar Malhotra', 'Case-insensitive lowercase search matches patron');

  const searchPartialPhone = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: '43213' });
  assert(searchPartialPhone.length === 1 && searchPartialPhone[0].name === 'Priya Patel', 'Matches phone substring');

  const searchEmail = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'm.farooq@example.com' });
  assert(searchEmail.length === 1 && searchEmail[0].name === 'Mohammed Farooq', 'Matches exact email');

  const searchId = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'CUST-007' });
  assert(searchId.length === 1 && searchId[0].name === 'Arjun Kapoor', 'Matches customer ID');

  const searchSpaced = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: '   meera   ' });
  assert(searchSpaced.length === 1 && searchSpaced[0].name === 'Meera Reddy', 'Trims whitespace before searching');

  const searchNoMatch = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'nonexistent-query-999' });
  assert(searchNoMatch.length === 0, 'Non-matching query returns empty array');

  // 2. Gender morphology filtering
  const menOnly = filterCustomers(INITIAL_CUSTOMERS, { gender: 'Men' });
  assert(menOnly.length === 4, 'Filters exactly 4 Men customer profiles');
  assert(menOnly.every((c) => c.gender === 'Men'), 'All filtered profiles have gender Men');

  const womenOnly = filterCustomers(INITIAL_CUSTOMERS, { gender: 'Women' });
  assert(womenOnly.length === 4, 'Filters exactly 4 Women customer profiles');
  assert(womenOnly.every((c) => c.gender === 'Women'), 'All filtered profiles have gender Women');

  const allGender = filterCustomers(INITIAL_CUSTOMERS, { gender: 'All' });
  assert(allGender.length === 8, 'Gender "All" returns all 8 customer profiles');

  // 3. VIP Boolean and 4-Tier VIP Hierarchy
  const vipOnly = filterCustomers(INITIAL_CUSTOMERS, { vipOnly: true });
  assert(vipOnly.length === 6, 'vipOnly returns 6 VIP/Couture/Wedding patrons');
  assert(vipOnly.every((c) => c.isVip), 'Every vipOnly patron has isVip === true');

  const regularTier = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'Regular' });
  assert(regularTier.length === 2, 'Filters 2 Regular tier patrons');
  assert(regularTier.every((c) => c.vipTier === 'Regular' && !c.isVip), 'Regular patrons have vipTier Regular and isVip false');

  const vipTierList = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'VIP' });
  assert(vipTierList.length === 2, 'Filters 2 VIP tier patrons (Priya Patel, Arjun Kapoor)');

  const coutureTier = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'Couture' });
  assert(coutureTier.length === 2, 'Filters 2 Couture tier patrons (Rajeshwar Malhotra, Meera Reddy)');

  const weddingTier = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'Wedding' });
  assert(weddingTier.length === 2, 'Filters 2 Wedding tier patrons (Ananya Sharma, Deepika Nair)');

  // 4-Tier VIP badge variants
  assert(getVipTierBadgeVariant('Couture') === 'gold', 'Couture tier maps to gold badge');
  assert(getVipTierBadgeVariant('Wedding') === 'rose', 'Wedding tier maps to rose badge');
  assert(getVipTierBadgeVariant('VIP') === 'warning', 'VIP tier maps to warning badge');
  assert(getVipTierBadgeVariant('Regular') === 'neutral', 'Regular tier maps to neutral badge');

  // 4. Balance Status Filtering
  const outstandingBal = filterCustomers(INITIAL_CUSTOMERS, { balanceStatus: 'OUTSTANDING' });
  assert(outstandingBal.length === 4, 'Filters 4 customers with outstanding balance > 0');
  assert(outstandingBal.every((c) => c.outstandingBalance > 0), 'Every customer has balance > 0');

  const settledBal = filterCustomers(INITIAL_CUSTOMERS, { balanceStatus: 'SETTLED' });
  assert(settledBal.length === 4, 'Filters 4 customers with settled balance == 0');
  assert(settledBal.every((c) => c.outstandingBalance <= 0), 'Every customer has balance <= 0');

  // 5. Tag Filtering
  const bridalTag = filterCustomers(INITIAL_CUSTOMERS, { tag: 'Bridal' });
  assert(bridalTag.length === 2, 'Filters 2 Bridal tag customers');
  assert(bridalTag.every((c) => c.tags.includes('Bridal')), 'All filtered patrons contain Bridal tag');

  const suitingTag = filterCustomers(INITIAL_CUSTOMERS, { tag: 'Bespoke Suiting' });
  assert(suitingTag.length === 3, 'Filters 3 Bespoke Suiting tag customers');

  const invalidTag = filterCustomers(INITIAL_CUSTOMERS, { tag: 'NonExistentTag' });
  assert(invalidTag.length === 0, 'Non-existent tag returns empty array');

  // 6. Sorting
  const sortBySpend = filterCustomers(INITIAL_CUSTOMERS, { sortBy: 'SPEND_DESC' });
  assert(sortBySpend[0].totalSpend === 240000, 'Top spender is ₹240,000 (Ananya Sharma)');
  assert(sortBySpend[sortBySpend.length - 1].totalSpend === 42000, 'Lowest spender is ₹42,000 (Mohammed Farooq)');
  for (let i = 0; i < sortBySpend.length - 1; i++) {
    assert(sortBySpend[i].totalSpend >= sortBySpend[i + 1].totalSpend, `Spend order preserved: ${sortBySpend[i].totalSpend} >= ${sortBySpend[i + 1].totalSpend}`);
  }

  const sortByOrders = filterCustomers(INITIAL_CUSTOMERS, { sortBy: 'ORDERS_DESC' });
  assert(sortByOrders[0].totalOrders === 6, 'Most orders is 6 (Rajeshwar Malhotra)');
  for (let i = 0; i < sortByOrders.length - 1; i++) {
    assert(sortByOrders[i].totalOrders >= sortByOrders[i + 1].totalOrders, `Orders order preserved: ${sortByOrders[i].totalOrders} >= ${sortByOrders[i + 1].totalOrders}`);
  }

  const sortByName = filterCustomers(INITIAL_CUSTOMERS, { sortBy: 'NAME_ASC' });
  for (let i = 0; i < sortByName.length - 1; i++) {
    assert(sortByName[i].name.localeCompare(sortByName[i + 1].name) <= 0, `Alphabetical order preserved: "${sortByName[i].name}" <= "${sortByName[i + 1].name}"`);
  }

  // 7. Compound Multi-Axis Filters
  const complexFilter1 = filterCustomers(INITIAL_CUSTOMERS, {
    gender: 'Women',
    vipTier: 'Wedding',
    balanceStatus: 'OUTSTANDING',
  });
  assert(complexFilter1.length === 1 && complexFilter1[0].name === 'Ananya Sharma', 'Compound filter: Women + Wedding + Outstanding = Ananya Sharma');

  const complexFilter2 = filterCustomers(INITIAL_CUSTOMERS, {
    gender: 'Men',
    vipTier: 'Couture',
    tag: 'Bespoke Suiting',
  });
  assert(complexFilter2.length === 1 && complexFilter2[0].name === 'Rajeshwar Malhotra', 'Compound filter: Men + Couture + Bespoke Suiting = Rajeshwar Malhotra');

  const contradictoryFilter = filterCustomers(INITIAL_CUSTOMERS, {
    gender: 'Men',
    vipTier: 'Wedding', // Seeded Wedding tier are Women
  });
  assert(contradictoryFilter.length === 0, 'Contradictory filter yields empty array cleanly');

  // 8. Compute Customer Stats Telemetry
  const stats = computeCustomerStats(INITIAL_CUSTOMERS);
  assert(stats.total === 8, 'Total customers = 8');
  assert(stats.vip === 2, 'VIP tier count = 2');
  assert(stats.couture === 2, 'Couture tier count = 2');
  assert(stats.wedding === 2, 'Wedding tier count = 2');
  assert(stats.men === 4, 'Men count = 4');
  assert(stats.women === 4, 'Women count = 4');
  assert(stats.totalLifetimeRevenue === 1044000, 'Total lifetime revenue = ₹1,044,000 (10.44L)');
  assert(stats.totalOutstandingBalance === 106000, 'Total outstanding balance = ₹106,000 (1.06L)');

  // =========================================================================
  // SUB-SUITE 3: XSS & SQL INJECTION ADVERSARIAL PAYLOADS STRESS RESILIENCE
  // =========================================================================
  console.log('\n[Sub-Suite 3: XSS & SQL Injection Adversarial Payloads Stress Resilience]');

  const maliciousPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1) />',
    '<svg/onload=alert("xss")>',
    '"><script src="//evil.com/evil.js"></script>',
    '\' OR \'1\'=\'1\' --',
    '\'; DROP TABLE customers; --',
    'UNION SELECT null, username, password FROM users --',
    '\\" or 1=1/*',
    '{{7*7}}',
    '${7*7}',
    '<iframe src="javascript:alert(1)"></iframe>',
    'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
    '../../../etc/passwd',
  ];

  // 1. Ensure searching WITH these payloads as queries never causes unhandled exceptions or regex breaks
  for (const payload of maliciousPayloads) {
    try {
      const res = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: payload });
      assert(Array.isArray(res), `Safe search execution with payload: ${payload.slice(0, 20)}`);
    } catch (err: any) {
      assert(false, `Crash during search with payload: ${payload}`, 'Safe Array', err?.message);
    }
  }

  // 2. Synthesize customer records CONTAINING these malicious payloads in every field
  const adversarialCustomers: Customer[] = maliciousPayloads.map((payload, idx) => ({
    id: `CUST-ADV-${idx}`,
    name: `Lord Malicious ${payload}`,
    phone: `+91 ${payload}`,
    email: `evil-${idx}@${payload}.com`,
    gender: idx % 2 === 0 ? 'Men' : 'Women',
    preferredFit: 'Slim Bespoke',
    vipTier: 'Couture',
    isVip: true,
    totalOrders: 3,
    totalSpend: 150000,
    outstandingBalance: 5000,
    tags: ['Bridal', payload],
    measurementsCount: 2,
    activeMeasurementId: 'v1',
    lastVisit: 'Today',
    initials: 'LM',
    notes: `Adversarial tailoring notes: ${payload}`,
    city: `Cyber City ${payload}`,
    createdAt: '2026-09-01',
  }));

  // Filter against adversarial customers
  try {
    const matchedAdv = filterCustomers(adversarialCustomers, { searchQuery: 'script' });
    assert(matchedAdv.length >= 2, 'Safely filtered customers containing <script> payloads without execution');
  } catch (err: any) {
    assert(false, 'Filtering customers containing script tags crashed', 'Safe execution', err?.message);
  }

  // Compute stats on adversarial customer dataset
  try {
    const advStats = computeCustomerStats(adversarialCustomers);
    assert(advStats.total === adversarialCustomers.length, `Correctly computed stats across ${advStats.total} adversarial profiles`);
    assert(!Number.isNaN(advStats.totalLifetimeRevenue), 'Revenue aggregation produces valid number without NaN');
  } catch (err: any) {
    assert(false, 'Stats computation crashed on adversarial profiles', 'Safe execution', err?.message);
  }

  // 3. Test buildCustomerCadLink URL encoding
  for (const payload of maliciousPayloads) {
    const url = buildCustomerCadLink(payload);
    assert(url.startsWith('/measurements?customerId='), `CAD URL starts with correct base path`);
    assert(!url.includes('<script>'), `CAD URL encodes script tags safely: ${url}`);
    assert(!url.includes(' '), `CAD URL contains no raw whitespace`);
    // Verify decodeURIComponent restores the original payload
    const parsedParam = decodeURIComponent(url.replace('/measurements?customerId=', ''));
    assert(parsedParam === payload, `Round-trip decode restores payload: ${payload.slice(0, 15)}`);
  }

  // =========================================================================
  // SUB-SUITE 4: CAD SNAPSHOT ISOLATION & ZERO DATA LEAKAGE
  // =========================================================================
  console.log('\n[Sub-Suite 4: CAD Snapshot Isolation & Zero Data Leakage]');

  interface MockSnapshot {
    id: string;
    customerId?: string;
    clientId?: string;
    garment: string;
    bust: number;
    waist: number;
  }

  // Create multi-customer snapshot database
  const snapshotDb: MockSnapshot[] = [
    { id: 'snap-001', customerId: 'CUST-001', garment: 'Sherwani', bust: 42, waist: 36 },
    { id: 'snap-002', customerId: 'CUST-001', garment: 'Suit', bust: 42.5, waist: 36.5 },
    { id: 'snap-003', customerId: 'CUST-002', garment: 'Lehenga', bust: 36, waist: 28 },
    { id: 'snap-004', customerId: 'CUST-002', garment: 'Blouse', bust: 36.5, waist: 28.5 },
    { id: 'snap-005', clientId: 'CUST-003', garment: 'Suit', bust: 40, waist: 34 }, // clientId backward compatibility
    { id: 'snap-006', customerId: 'CUST-004', garment: 'Corset', bust: 34, waist: 26 },
    { id: 'snap-007', customerId: 'CUST-004', garment: 'Anarkali', bust: 34.5, waist: 27 },
    { id: 'snap-008', customerId: 'CUST-004', garment: 'Gown', bust: 35, waist: 27.5 },
  ];

  // Test Customer 1 isolation
  const cust1Snaps = filterSnapshotsForCustomer(snapshotDb, 'CUST-001');
  assert(cust1Snaps.length === 2, 'Customer 1 receives exactly 2 snapshots');
  assert(cust1Snaps.every((s) => s.customerId === 'CUST-001'), 'Customer 1 snapshots contain zero data from other customers');
  assert(!cust1Snaps.some((s) => s.id === 'snap-003'), 'Customer 2 snapshot does NOT leak to Customer 1');

  // Test Customer 2 isolation
  const cust2Snaps = filterSnapshotsForCustomer(snapshotDb, 'CUST-002');
  assert(cust2Snaps.length === 2, 'Customer 2 receives exactly 2 snapshots');
  assert(cust2Snaps.every((s) => s.customerId === 'CUST-002'), 'Customer 2 snapshots strictly isolated');

  // Test backward-compatible clientId matching
  const cust3Snaps = filterSnapshotsForCustomer(snapshotDb, 'CUST-003');
  assert(cust3Snaps.length === 1 && cust3Snaps[0].id === 'snap-005', 'Matches snapshot stored with legacy clientId attribute');

  // Test customer with zero snapshots
  const zeroSnaps = filterSnapshotsForCustomer(snapshotDb, 'CUST-999');
  assert(Array.isArray(zeroSnaps) && zeroSnaps.length === 0, 'Customer with zero snapshots returns empty array');

  // Test empty or null customerId inputs
  assert(filterSnapshotsForCustomer(snapshotDb, '').length === 0, 'Empty string customerId returns empty array');
  assert(filterSnapshotsForCustomer(snapshotDb, null as any).length === 0, 'Null customerId returns empty array');
  assert(filterSnapshotsForCustomer(snapshotDb, undefined as any).length === 0, 'Undefined customerId returns empty array');

  // Substring prefix attack defense: CUST-001 must not match CUST-0010
  const deceptiveDb: MockSnapshot[] = [
    { id: 'snap-a', customerId: 'CUST-001', garment: 'Sherwani', bust: 40, waist: 34 },
    { id: 'snap-b', customerId: 'CUST-0010', garment: 'Lehenga', bust: 36, waist: 28 },
    { id: 'snap-c', customerId: 'CUST-001_SECRET', garment: 'Secret', bust: 45, waist: 40 },
  ];
  const isolatedPrefix = filterSnapshotsForCustomer(deceptiveDb, 'CUST-001');
  assert(isolatedPrefix.length === 1 && isolatedPrefix[0].id === 'snap-a', 'Strict equality prevents prefix/substring leakage (CUST-001 vs CUST-0010)');

  // =========================================================================
  // SUB-SUITE 5: VECTOR PRINT LAYOUTS & PURE SVG BARCODE VERIFICATION
  // =========================================================================
  console.log('\n[Sub-Suite 5: Vector Print Layouts & Pure SVG Barcode Verification]');

  // 1. QRCodeSVG Rendering Tests
  const qrTestValues = [
    'ORD-2026-001',
    'CUST-FAB-SILK-99',
    'https://atelier.yellowhouse.tailoring/print/job/JC-9001',
    '<script>alert("qr")</script>',
    '',
  ];

  for (const val of qrTestValues) {
    const html = renderToStaticMarkup(React.createElement(QRCodeSVG, { value: val, size: 80 }));
    assert(html.includes('<svg'), `QRCodeSVG produces <svg> for value "${val.slice(0, 15)}"`);
    assert(html.includes('width="80"') && html.includes('height="80"'), `QRCodeSVG respects size dimension 80`);
    assert(html.includes('<rect'), `QRCodeSVG contains vector <rect> elements`);
    assert(!html.includes('<img'), `QRCodeSVG has ZERO raster <img> tags`);
    assert(!html.includes('http://') && !html.includes('https://'), `QRCodeSVG has ZERO external CDN or asset requests`);
  }

  // 2. BarcodeSVG Rendering Tests
  const barcodeTestValues = [
    'JC-9001',
    'CUST-FAB-9921',
    'ORD-8820',
    '123456789012',
    'YH-CODE128',
  ];

  for (const val of barcodeTestValues) {
    const html = renderToStaticMarkup(React.createElement(BarcodeSVG, { value: val, width: 200, height: 50 }));
    assert(html.includes('<svg'), `BarcodeSVG produces <svg> for barcode "${val}"`);
    assert(html.includes('width="200"') && html.includes('height="50"'), `BarcodeSVG respects width 200 and height 50`);
    assert(html.includes('<rect'), `BarcodeSVG contains vector <rect> stripes`);
    assert(html.includes(val), `BarcodeSVG renders uppercase label text for "${val}"`);
    assert(!html.includes('<img'), `BarcodeSVG has ZERO raster <img> tags`);
    assert(!html.includes('http://') && !html.includes('https://'), `BarcodeSVG has ZERO external CDN or asset requests`);
  }

  // 3. Global CSS @media print Rules Verification
  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  assert(fs.existsSync(globalsCssPath), 'globals.css exists at expected path');
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

  // Test essential @media print isolation rules
  assert(cssContent.includes('@media print'), 'globals.css declares @media print');
  assert(cssContent.includes('aside, header, .no-print { display: none !important; }'), 'Suppresses all navigation chrome (aside, header, .no-print) during print');
  assert(cssContent.includes('.print-only { display: block !important; }'), 'Forces .print-only elements to display: block !important during print');
  assert(cssContent.includes('body { background: white !important; color: black !important; }'), 'Enforces pure white background and black ink on paper');
  assert(cssContent.includes('main { padding: 0 !important; }'), 'Resets main layout padding to 0 on paper');
  assert(cssContent.includes('.print-only {\n  display: none;\n}'), '.print-only is hidden by default in normal screen media');

  console.log('\n====================================================================');
  console.log(`CHALLENGER M4-2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  return { passed, failed, findings };
}

if (require.main === module) {
  const result = runChallengerM42AdversarialSuite();
  if (result.failed > 0) {
    process.exit(1);
  }
}
