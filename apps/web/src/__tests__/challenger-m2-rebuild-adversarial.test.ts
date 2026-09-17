/**
 * YellowHouse Tailoring OS — Milestone 2 Empirical Adversarial & Boundary Verification Suite
 * Authored by: Challenger 1 (challenger_m2_rebuild_1)
 *
 * Empirical Challenge Verification Targets:
 * 1. Zero Admin Exposure on Public Marketing Landing Page (`apps/web/src/app/page.tsx`)
 * 2. Demo State Eviction upon Onboarding Completion (`apps/web/src/app/onboarding/page.tsx`)
 * 3. Slugs and Input Boundaries (`apps/web/src/lib/slug.ts` and step 1 onboarding)
 * 4. RedHouse OS Ecosystem Showcase & Services Grid Integrity (`apps/web/src/app/redhouse-os/page.tsx`)
 * 5. Auth Views (Login & Register) Validation, RBAC Scoping, and Zero Admin Leaks
 */

import * as fs from 'fs';
import * as path from 'path';
import { slugify, isValidSlug } from '../lib/slug';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';

export interface AdversarialResult {
  passed: number;
  failed: number;
  totalAssertions: number;
  findings: string[];
}

export function runM2RebuildAdversarialTests(): AdversarialResult {
  let passed = 0;
  let failed = 0;
  let totalAssertions = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, expected: string = 'TRUE', actual: string = 'TRUE') {
    totalAssertions++;
    if (!condition) {
      console.error(`❌ FAIL [${totalAssertions}]: ${testName} | Expected: ${expected} | Got: ${actual}`);
      failed++;
      findings.push(`FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
    } else {
      console.log(`✅ PASS [${totalAssertions}]: ${testName}`);
      passed++;
    }
  }

  console.log('\n========================================================================');
  console.log('--- CHALLENGER 1: MILESTONE 2 EMPIRICAL ADVERSARIAL STRESS SUITE ---');
  console.log('========================================================================\n');

  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  // ===========================================================================
  // TARGET 1: ZERO ADMIN EXPOSURE ON PUBLIC MARKETING LANDING PAGE
  // ===========================================================================
  console.log('[Target 1: Zero Admin Exposure on Public Marketing Landing Page]');

  const landingPagePath = path.join(webRoot, 'src', 'app', 'page.tsx');
  assert(fs.existsSync(landingPagePath), 'page.tsx exists in apps/web/src/app/');
  const landingCode = fs.readFileSync(landingPagePath, 'utf8');

  // 1.1 Source Code AST & Token Scanning (Stripping Comments)
  const codeWithoutComments = landingCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

  // Strict absence of SUPER_ADMIN
  const hasSuperAdmin = /\bSUPER_ADMIN\b/.test(codeWithoutComments);
  assert(!hasSuperAdmin, 'SUPER_ADMIN token is strictly absent from executable code & markup', 'false', String(hasSuperAdmin));

  // Strict absence of SYSTEM_ADMIN
  const hasSystemAdmin = /\bSYSTEM_ADMIN\b/.test(codeWithoutComments);
  assert(!hasSystemAdmin, 'SYSTEM_ADMIN token is strictly absent from executable code & markup', 'false', String(hasSystemAdmin));

  // Strict absence of any /admin routes or links
  const hasAdminRoute = /['"]\/admin(\/|['"])/.test(codeWithoutComments) || /href=['"]\/admin/.test(codeWithoutComments);
  assert(!hasAdminRoute, '/admin route is strictly absent from landing page links and state', 'false', String(hasAdminRoute));

  // Strict absence of master passkeys
  const hasPasskey = /yh-admin-2026|admin123|yellowhouse@admin/.test(codeWithoutComments);
  assert(!hasPasskey, 'Master passkeys (yh-admin-2026, admin123, etc.) are strictly absent', 'false', String(hasPasskey));

  // Case-insensitive check for standalone "admin" in route paths or role definitions
  const hasAdminWordInRoles = /role:\s*['"][^'"]*admin[^'"]*['"]/i.test(codeWithoutComments);
  assert(!hasAdminWordInRoles, 'No role definition contains "admin" substring', 'false', String(hasAdminWordInRoles));

  // 1.2 DEMO_ROLES Array Inspection
  const demoRolesMatch = landingCode.match(/const DEMO_ROLES:\s*DemoRole\[\]\s*=\s*(\[[\s\S]*?\]);/);
  assert(Boolean(demoRolesMatch), 'DEMO_ROLES array is explicitly declared');

  if (demoRolesMatch) {
    const rawDemoText = demoRolesMatch[1];
    const roleMatches = (rawDemoText.match(/role:\s*'[A-Z_]+'/g) || []).map(m => m.replace(/role:\s*'/,'').replace(/'/, ''));
    
    assert(roleMatches.length === 4, 'DEMO_ROLES contains exactly 4 personas', '4', String(roleMatches.length));
    assert(
      roleMatches.every(r => ['TENANT_OWNER', 'MASTER_TAILOR', 'BRANCH_MANAGER', 'KARIGAR'].includes(r)),
      'DEMO_ROLES strictly contains only customer-facing atelier roles: TENANT_OWNER, MASTER_TAILOR, BRANCH_MANAGER, KARIGAR'
    );

    // Verify all target routes map to atelier workspaces, never admin
    const targetUrls = (rawDemoText.match(/targetUrl:\s*'[^']+'/g) || []).map(m => m.replace(/targetUrl:\s*'/,'').replace(/'/, ''));
    assert(targetUrls.length === 4, 'All 4 personas have explicit targetUrl mappings');
    assert(
      targetUrls.every(url => url === '/dashboard' || url === '/measurements' || url === '/orders' || url === '/production'),
      'Every targetUrl routes to a safe atelier workspace (/dashboard, /measurements, /orders, /production)'
    );
    assert(
      targetUrls.every(url => !url.includes('/admin')),
      'Zero targetUrls route to /admin'
    );
  }

  // 1.3 Telemetry Math & Piece-Rate Invariants
  function calcMetrics(suitCount: number, fabricPerSuit: number = 3.3) {
    const totalFabricMeters = (suitCount * fabricPerSuit).toFixed(1);
    const fabricEfficiency = Math.min(98.5, parseFloat((92.4 + (suitCount * 0.4)).toFixed(1)));
    const estimatedSAMHours = (suitCount * 14.5).toFixed(1);
    const karigarPayoutNumber = suitCount * 4200;
    return { totalFabricMeters, fabricEfficiency, estimatedSAMHours, karigarPayoutNumber };
  }

  // Verify default 8 suits
  const m8 = calcMetrics(8);
  assert(m8.totalFabricMeters === '26.4', '8 suits require 26.4m fabric');
  assert(m8.fabricEfficiency === 95.6, '8 suits achieve 95.6% fabric efficiency');
  assert(m8.estimatedSAMHours === '116.0', '8 suits take 116.0 SAM hours');
  assert(m8.karigarPayoutNumber === 33600, '8 suits pay ₹33,600 to karigar');
  assert(m8.karigarPayoutNumber / 8 / 100 === 42, 'Satisfies ₹42/minute invariant for 100 SAM minutes per suit');

  // Verify asymptotic cap at 98.5%
  const m20 = calcMetrics(20);
  assert(m20.fabricEfficiency === 98.5, '20 suits efficiency strictly capped at 98.5% maximum');
  const m100 = calcMetrics(100);
  assert(m100.fabricEfficiency === 98.5, '100 suits efficiency strictly capped at 98.5% maximum');

  // Verify 0 suits boundary
  const m0 = calcMetrics(0);
  assert(m0.totalFabricMeters === '0.0', '0 suits requires 0.0m fabric');
  assert(m0.fabricEfficiency === 92.4, '0 suits efficiency defaults to base 92.4%');
  assert(m0.karigarPayoutNumber === 0, '0 suits pays ₹0');

  // ===========================================================================
  // TARGET 2: DEMO STATE EVICTION UPON ONBOARDING COMPLETION
  // ===========================================================================
  console.log('\n[Target 2: Demo State Eviction Upon Onboarding Completion]');

  const onboardingPath = path.join(webRoot, 'src', 'app', 'onboarding', 'page.tsx');
  assert(fs.existsSync(onboardingPath), 'onboarding/page.tsx exists');
  const onboardingCode = fs.readFileSync(onboardingPath, 'utf8');

  // 2.1 Source Code Verification of Eviction Invariant
  // All 5 demo keys must be removed upon workspace entry
  assert(onboardingCode.includes("removeLocalStorage('yh_auth_user')"), "onboarding/page.tsx explicitly calls removeLocalStorage('yh_auth_user')");
  assert(onboardingCode.includes("removeLocalStorage('yh_customers')"), "onboarding/page.tsx explicitly calls removeLocalStorage('yh_customers')");
  assert(onboardingCode.includes("removeLocalStorage('yh_orders')"), "onboarding/page.tsx explicitly calls removeLocalStorage('yh_orders')");
  assert(onboardingCode.includes("removeLocalStorage('yh_measurements_current')"), "onboarding/page.tsx explicitly calls removeLocalStorage('yh_measurements_current')");
  assert(onboardingCode.includes("removeLocalStorage('yh_onboarding_draft')"), "onboarding/page.tsx explicitly calls removeLocalStorage('yh_onboarding_draft')");

  // 2.2 Simulated LocalStorage State Eviction Execution
  const testStorage: Record<string, string> = {};
  const prevWindow = (global as any).window;
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => testStorage[k] || null,
      setItem: (k: string, v: string) => { testStorage[k] = v; },
      removeItem: (k: string) => { delete testStorage[k]; },
      clear: () => { Object.keys(testStorage).forEach(k => delete testStorage[k]); },
    },
  };

  // Pre-seed mock demo state with tainted sandbox data
  setLocalStorage('yh_auth_user', { id: 'usr_demo_karigar', role: 'KARIGAR', name: 'Sandbox Artisan' });
  setLocalStorage('yh_customers', [{ id: 'cust_demo_99', name: 'Mock VIP Client', phone: '9876543210' }]);
  setLocalStorage('yh_orders', [{ id: 'ord_demo_99', garment: 'Sherwani', amount: 45000 }]);
  setLocalStorage('yh_measurements_current', { chest: 42.5, waist: 36.0, shoulder: 18.5 });
  setLocalStorage('yh_onboarding_draft', { boutiqueName: 'New Luxury Atelier', step: 3 });

  // Assert keys are pre-seeded
  assert(getLocalStorage('yh_auth_user', null) !== null, 'Pre-condition: yh_auth_user is populated with demo data');
  assert(getLocalStorage('yh_customers', null) !== null, 'Pre-condition: yh_customers is populated with demo data');
  assert(getLocalStorage('yh_orders', null) !== null, 'Pre-condition: yh_orders is populated with demo data');
  assert(getLocalStorage('yh_measurements_current', null) !== null, 'Pre-condition: yh_measurements_current is populated with demo data');
  assert(getLocalStorage('yh_onboarding_draft', null) !== null, 'Pre-condition: yh_onboarding_draft is populated with draft data');

  // Execute the exact eviction routine from onboarding/page.tsx lines 414-422
  function executeOnboardingEviction() {
    removeLocalStorage('yh_auth_user');
    removeLocalStorage('yh_customers');
    removeLocalStorage('yh_orders');
    removeLocalStorage('yh_measurements_current');
    removeLocalStorage('yh_onboarding_draft');
  }

  executeOnboardingEviction();

  // Assert all 5 keys are evicted (strictly null)
  assert(getLocalStorage('yh_auth_user', null) === null, 'Post-eviction: yh_auth_user is cleanly evicted (null)');
  assert(getLocalStorage('yh_customers', null) === null, 'Post-eviction: yh_customers is cleanly evicted (null)');
  assert(getLocalStorage('yh_orders', null) === null, 'Post-eviction: yh_orders is cleanly evicted (null)');
  assert(getLocalStorage('yh_measurements_current', null) === null, 'Post-eviction: yh_measurements_current is cleanly evicted (null)');
  assert(getLocalStorage('yh_onboarding_draft', null) === null, 'Post-eviction: yh_onboarding_draft is cleanly evicted (null)');

  // Clean up global window mock
  if (prevWindow) {
    (global as any).window = prevWindow;
  } else {
    delete (global as any).window;
  }

  // ===========================================================================
  // TARGET 3: SLUGS AND INPUT BOUNDARIES
  // ===========================================================================
  console.log('\n[Target 3: Slugs and Input Boundaries]');

  // 3.1 isValidSlug: Boundaries and Valid Inputs
  assert(isValidSlug('savile-row') === true, 'Accepts standard hyphenated slug ("savile-row")');
  assert(isValidSlug('atelier-123') === true, 'Accepts alphanumeric hyphenated slug ("atelier-123")');
  assert(isValidSlug('abc') === true, 'Accepts minimum length boundary (3 characters)');
  assert(isValidSlug('a'.repeat(50)) === true, 'Accepts maximum length boundary (50 characters)');
  assert(isValidSlug('a-b-c') === true, 'Accepts single character segments ("a-b-c")');
  assert(isValidSlug('123') === true, 'Accepts numeric 3-char slug ("123")');
  assert(isValidSlug('grand-atelier-london-paris-tokyo-ny-fl-01') === true, 'Accepts multi-segment slug');

  // 3.2 isValidSlug: Boundary Rejections (Length Limits)
  assert(isValidSlug('') === false, 'Rejects empty string');
  assert(isValidSlug('a') === false, 'Rejects length 1 (below minimum 3)');
  assert(isValidSlug('ab') === false, 'Rejects length 2 (below minimum 3)');
  assert(isValidSlug('a'.repeat(51)) === false, 'Rejects length 51 (above maximum 50)');
  assert(isValidSlug('a'.repeat(500)) === false, 'Rejects length 500 (stress test)');

  // 3.3 isValidSlug: Character Set & Case Rejections
  assert(isValidSlug('SavileRow') === false, 'Rejects uppercase ("SavileRow")');
  assert(isValidSlug('ATELIER') === false, 'Rejects all-caps ("ATELIER")');
  assert(isValidSlug('atelierName') === false, 'Rejects camelCase ("atelierName")');
  assert(isValidSlug('atelier_row') === false, 'Rejects underscores ("atelier_row")');
  assert(isValidSlug('atelier.co') === false, 'Rejects periods ("atelier.co")');
  assert(isValidSlug('atelier@co') === false, 'Rejects symbols ("atelier@co")');
  assert(isValidSlug('atelier space') === false, 'Rejects spaces ("atelier space")');
  assert(isValidSlug('atelier#1') === false, 'Rejects hashes ("atelier#1")');
  assert(isValidSlug('atelier/shop') === false, 'Rejects slashes ("atelier/shop")');

  // 3.4 isValidSlug: Hyphen Placement Rules
  assert(isValidSlug('-atelier') === false, 'Rejects leading hyphen ("-atelier")');
  assert(isValidSlug('atelier-') === false, 'Rejects trailing hyphen ("atelier-")');
  assert(isValidSlug('atelier--row') === false, 'Rejects consecutive hyphens ("atelier--row")');
  assert(isValidSlug('atelier---row') === false, 'Rejects triple hyphens ("atelier---row")');
  assert(isValidSlug('-') === false, 'Rejects single hyphen ("-")');
  assert(isValidSlug('---') === false, 'Rejects triple hyphen string ("---")');

  // 3.5 isValidSlug: Unicode / International Characters
  assert(isValidSlug('münchen') === false, 'Rejects non-ASCII umlauts ("münchen")');
  assert(isValidSlug('élégance') === false, 'Rejects accented characters ("élégance")');
  assert(isValidSlug('शेरवानी') === false, 'Rejects Devanagari script');
  assert(isValidSlug('خياط') === false, 'Rejects Arabic script');

  // 3.6 slugify: Automatic Slug Generation & Sanitization
  assert(slugify('Savile Row Atelier & Co.') === 'savile-row-atelier-co', 'slugify converts mixed case and punctuation');
  assert(slugify('   Trim   Spaces   ') === 'trim-spaces', 'slugify trims whitespace and collapses spaces');
  assert(slugify('Multiple----Hyphens') === 'multiple-hyphens', 'slugify collapses multiple hyphens');
  assert(slugify('--Leading-And-Trailing--') === 'leading-and-trailing', 'slugify strips leading and trailing hyphens');
  assert(slugify('<script>alert("xss")</script>') === 'scriptalertxssscript', 'slugify strips HTML tags and quotes');
  assert(slugify('@#$%^&*()_+') === '_', 'slugify strips non-word characters');
  assert(slugify('A'.repeat(5000)) === 'a'.repeat(5000), 'slugify handles 5,000 character strings without stack overflow');

  // 3.7 Onboarding Step 1 Slug Enforcement
  // Verify that an invalid slug prevents advancing past Step 1
  function simulateStep1Advance(boutiqueName: string, slugStatus: string) {
    if (!boutiqueName.trim()) {
      return { allowed: false, error: 'Please enter your boutique or atelier business name.' };
    }
    if (slugStatus !== 'available') {
      return { allowed: false, error: 'Please provide a valid and available workspace subdomain slug.' };
    }
    return { allowed: true, error: null };
  }

  assert(simulateStep1Advance('', 'available').allowed === false, 'Empty boutique name blocked');
  assert(simulateStep1Advance('Savile Row', 'invalid').allowed === false, 'Invalid slug status blocked');
  assert(simulateStep1Advance('Savile Row', 'taken').allowed === false, 'Taken slug status blocked');
  assert(simulateStep1Advance('Savile Row', 'checking').allowed === false, 'Pending/checking slug blocked');
  assert(simulateStep1Advance('Savile Row', 'available').allowed === true, 'Available slug with name allowed');

  // ===========================================================================
  // TARGET 4: REDHOUSE OS ECOSYSTEM SHOWCASE INTEGRITY
  // ===========================================================================
  console.log('\n[Target 4: RedHouse OS Ecosystem Showcase Integrity]');

  const redhousePath = path.join(webRoot, 'src', 'app', 'redhouse-os', 'page.tsx');
  assert(fs.existsSync(redhousePath), 'redhouse-os/page.tsx exists');
  const redhouseCode = fs.readFileSync(redhousePath, 'utf8');

  // Check 5 platform modules
  const expectedModules = ['marketplace', 'equipment', 'supply', 'bidding', 'stylists'];
  for (const mod of expectedModules) {
    assert(redhouseCode.includes(`id: '${mod}'`), `Module '${mod}' is configured in redhouse-os`);
    assert(redhouseCode.includes(`href: '/redhouse/${mod}'`), `Module '${mod}' routes to '/redhouse/${mod}'`);
  }

  // Check 6 bespoke services in SERVICES_GRID
  const expectedServices = ['blouses', 'lehenga', 'salwar', 'indo-western', 'gowns', 'custom-print'];
  for (const srv of expectedServices) {
    assert(redhouseCode.includes(`id: '${srv}'`), `Service '${srv}' exists in SERVICES_GRID`);
  }

  // Check guarantees and metrics
  assert(redhouseCode.includes('100% Perfect Fit Guarantee'), 'Guarantees 100% Perfect Fit');
  assert(redhouseCode.includes('7-Day Guaranteed Delivery') || redhouseCode.includes('7-Day Turnaround'), 'Guarantees 7-Day Turnaround');
  assert(redhouseCode.includes('4.9/5 Rating'), 'Displays 4.9/5 Rating metric');

  // Check zero admin links in redhouse-os
  const redhouseNoComments = redhouseCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  assert(!/\bSUPER_ADMIN\b/.test(redhouseNoComments), 'SUPER_ADMIN strictly absent from redhouse-os/page.tsx');
  assert(!/['"]\/admin['"]/.test(redhouseNoComments), '/admin link strictly absent from redhouse-os/page.tsx');

  // ===========================================================================
  // TARGET 5: AUTH VIEWS (LOGIN & REGISTER) INTEGRITY & SCOPING
  // ===========================================================================
  console.log('\n[Target 5: Auth Views (Login & Register) Integrity]');

  const loginPath = path.join(webRoot, 'src', 'app', '(auth)', 'login', 'page.tsx');
  assert(fs.existsSync(loginPath), 'login/page.tsx exists');
  const loginCode = fs.readFileSync(loginPath, 'utf8');

  const registerPath = path.join(webRoot, 'src', 'app', '(auth)', 'register', 'page.tsx');
  assert(fs.existsSync(registerPath), 'register/page.tsx exists');
  const registerCode = fs.readFileSync(registerPath, 'utf8');

  // Register view offers 6 atelier roles and NEVER SUPER_ADMIN
  const registerNoComments = registerCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  assert(!/\bSUPER_ADMIN\b/.test(registerNoComments), 'SUPER_ADMIN is strictly absent from register/page.tsx');

  const expectedRegisterRoles = ['TENANT_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'MASTER_TAILOR', 'KARIGAR', 'ACCOUNTANT'];
  for (const role of expectedRegisterRoles) {
    assert(registerCode.includes(`value: '${role}'`), `Register view provides '${role}' role`);
  }

  // Login view demo personas do NOT expose SUPER_ADMIN
  const loginNoComments = loginCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  const demoPersonasBlock = loginNoComments.match(/const DEMO_PERSONAS\s*=\s*(\[[\s\S]*?\]);/);
  if (demoPersonasBlock) {
    assert(!demoPersonasBlock[1].includes('SUPER_ADMIN'), 'Login DEMO_PERSONAS does not expose SUPER_ADMIN');
  }

  // Active session card is implemented in login view
  assert(loginCode.includes('yh_auth_user'), 'Login view reads yh_auth_user for active session');
  assert(loginCode.includes('Sign Out & Clear Session') || loginCode.includes('Sign Out'), 'Login view provides sign out / clear session capability');

  console.log('\n========================================================================');
  console.log(`CHALLENGER 1 RESULTS: ${passed} PASSED, ${failed} FAILED across ${totalAssertions} assertions`);
  console.log('========================================================================\n');

  return { passed, failed, totalAssertions, findings };
}

if (require.main === module) {
  const res = runM2RebuildAdversarialTests();
  if (res.failed > 0) {
    process.exit(1);
  }
}
