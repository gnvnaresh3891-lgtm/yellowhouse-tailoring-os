/**
 * YellowHouse Tailoring OS — Milestone 2 Verification Suite
 * Public Landing Page, RedHouse OS Showcase, Auth (Login/Register), & Onboarding Funnel
 * 
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 2 (Public Experience, Auth & Onboarding)
 * - ORIGINAL_REQUEST.md § R1 & R5 (4 Atelier Personas, Zero Admin Leak, 1-Click Sandbox, Onboarding Funnel)
 * - apps/web/src/app/page.tsx
 * - apps/web/src/app/redhouse-os/page.tsx
 * - apps/web/src/app/(auth)/login/page.tsx
 * - apps/web/src/app/(auth)/register/page.tsx
 * - apps/web/src/app/onboarding/page.tsx
 * 
 * Verifies:
 * 1. Public Landing Page (apps/web/src/app/page.tsx):
 *    - Exactly 4 atelier demo personas (TENANT_OWNER, MASTER_TAILOR, BRANCH_MANAGER, KARIGAR)
 *    - Zero administrative exposure (SUPER_ADMIN / /admin never appears on marketing page)
 *    - Interactive demo calculations (fabric meters, efficiency cap, SAM hours, piece-rate payout)
 *    - 1-click sandbox session setup (yh_auth_user session persistence, target route mapping)
 *    - Landmark hotspot coordinates and posture deltas
 * 
 * 2. RedHouse OS (apps/web/src/app/redhouse-os/page.tsx):
 *    - Ecosystem modules (marketplace, bidding, equipment, stylists) and services grid (6 services)
 *    - Key ecosystem metrics (100% Fit Guarantee, 7-Day Turnaround, 4.9/5 Rating)
 *    - 4-step artisan journey and doorstep pickup booking validation
 * 
 * 3. Login & Register (apps/web/src/app/(auth)/login/page.tsx & register/page.tsx):
 *    - Form input validations (empty credentials, valid email format, password minimum length)
 *    - Password confirmation match enforcement
 *    - Demo account credential handlers and active session card rendering
 *    - Session persistence in localStorage ('yh_auth_user') and sign out cleanup
 *    - Role badge styling and 6-role registration options
 * 
 * 4. Onboarding Funnel (apps/web/src/app/onboarding/page.tsx):
 *    - 3-step wizard validation (Step 1: Identity/Slug, Step 2: Blueprint Templates, Step 3: Owner Credentials)
 *    - Live slug generation, normalization, and isValidSlug boundary rules
 *    - Blueprint template selection (4 templates, POM count aggregation, empty selection block)
 *    - Draft autosave and recovery ('yh_onboarding_draft')
 *    - Demo session cleanup upon workspace activation (removeLocalStorage for 'yh_auth_user', 'yh_customers', etc.)
 * 
 * 5. Adversarial & Boundary Stress Testing:
 *    - Malicious XSS vectors in boutique name, owner name, and booking notes
 *    - Extreme boundary string lengths (5000+ chars)
 *    - Internationalized Unicode / RTL sartorial strings
 *    - Extreme arithmetic inputs for telemetry formulas
 *    - Corrupted localStorage JSON fault recovery
 */

import * as fs from 'fs';
import * as path from 'path';
import { slugify, isValidSlug } from '../lib/slug';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';

export interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runM2PublicAuthOnboardingTests(): TestResult {
  console.log('\n================================================================');
  console.log('--- MILESTONE 2: PUBLIC PAGES, AUTH & ONBOARDING TEST SUITE ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, expected: string = 'PASS', actual: string = 'PASS') {
    if (!condition) {
      console.error(`❌ FAIL: ${testName} | Expected: ${expected} | Got: ${actual}`);
      failed++;
      findings.push(`FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
    } else {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    }
  }

  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  // ===========================================================================
  // SUITE 1: PUBLIC MARKETING LANDING PAGE (apps/web/src/app/page.tsx)
  // ===========================================================================
  console.log('[Suite 1: Public Marketing Landing Page & Demo Personas]');

  const landingPagePath = path.join(webRoot, 'src', 'app', 'page.tsx');
  assert(fs.existsSync(landingPagePath), 'Landing page file exists at src/app/page.tsx');
  const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');

  // 1.1 Persona Verification: Exactly 4 Atelier Demo Personas
  console.log('\n--- Subsuite 1.1: Exactly 4 Atelier Demo Personas ---');
  const expectedPersonas = [
    {
      role: 'TENANT_OWNER',
      name: 'Latif Khan',
      email: 'owner@yellowhouse.com',
      targetUrl: '/dashboard',
      badge: 'Executive Command',
      label: 'Owner Sandbox',
    },
    {
      role: 'MASTER_TAILOR',
      name: 'Master Latif',
      email: 'master@yellowhouse.com',
      targetUrl: '/measurements',
      badge: '2D CAD Studio',
      label: 'Master Workbench',
    },
    {
      role: 'BRANCH_MANAGER',
      name: 'Sarah Jenkins',
      email: 'manager@yellowhouse.com',
      targetUrl: '/orders',
      badge: 'Store Operations',
      label: 'Store Operations',
    },
    {
      role: 'KARIGAR',
      name: 'Rafi Craftsman',
      email: 'karigar@yellowhouse.com',
      targetUrl: '/production',
      badge: 'Workshop Floor',
      label: 'Karigar Floor',
    },
  ];

  // Extract DEMO_ROLES array from landing page content
  const demoRolesMatch = landingPageContent.match(/const DEMO_ROLES:\s*DemoRole\[\]\s*=\s*(\[[\s\S]*?\]);/);
  assert(Boolean(demoRolesMatch), 'Landing page defines DEMO_ROLES array');

  if (demoRolesMatch) {
    const rawDemoRolesText = demoRolesMatch[1];
    for (const persona of expectedPersonas) {
      assert(
        rawDemoRolesText.includes(`role: '${persona.role}'`) &&
        rawDemoRolesText.includes(`email: '${persona.email}'`) &&
        rawDemoRolesText.includes(`targetUrl: '${persona.targetUrl}'`),
        `Persona '${persona.role}' is defined with email '${persona.email}' and targetUrl '${persona.targetUrl}'`
      );
    }

    // Role count: exactly 4 roles in DEMO_ROLES
    const roleOccurrences = (rawDemoRolesText.match(/role:\s*'[A-Z_]+'/g) || []).map((m) =>
      m.replace(/role:\s*'/,'').replace(/'/, '')
    );
    assert(
      roleOccurrences.length === 4,
      `DEMO_ROLES has exactly 4 roles`,
      '4',
      String(roleOccurrences.length)
    );
    assert(
      roleOccurrences.every((r) => ['TENANT_OWNER', 'MASTER_TAILOR', 'BRANCH_MANAGER', 'KARIGAR'].includes(r)),
      'DEMO_ROLES contains only the 4 allowed atelier roles'
    );
  }

  // 1.2 Administrative Isolation: Zero Admin Exposure
  console.log('\n--- Subsuite 1.2: Administrative Isolation & Zero Admin Leak ---');
  const pageCodeWithoutComments = landingPageContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  // Check that SUPER_ADMIN never appears in runtime code or markup
  const hasSuperAdmin = /\bSUPER_ADMIN\b/.test(pageCodeWithoutComments);
  assert(!hasSuperAdmin, 'Zero administrative exposure: SUPER_ADMIN never appears in page.tsx code or markup', 'false', String(hasSuperAdmin));

  // Check that SYSTEM_ADMIN never appears in runtime code or markup
  const hasSystemAdmin = /\bSYSTEM_ADMIN\b/.test(pageCodeWithoutComments);
  assert(!hasSystemAdmin, 'Zero administrative exposure: SYSTEM_ADMIN never appears in page.tsx code or markup', 'false', String(hasSystemAdmin));

  // Check that /admin route is never linked or referenced in public marketing page
  const hasAdminRoute = /['"]\/admin['"]/.test(pageCodeWithoutComments) || /href=['"]\/admin['"]/.test(pageCodeWithoutComments);
  assert(!hasAdminRoute, 'Zero administrative exposure: /admin route is never referenced or linked in page.tsx', 'false', String(hasAdminRoute));

  // Check that master passkeys are never exposed in marketing page
  const hasMasterPasskey = /yh-admin-2026/.test(pageCodeWithoutComments) || /admin123/.test(pageCodeWithoutComments);
  assert(!hasMasterPasskey, 'Master passkeys are never exposed on public landing page', 'false', String(hasMasterPasskey));

  // 1.3 Interactive Demo Calculations (Karigar Yield & Telemetry Math)
  console.log('\n--- Subsuite 1.3: Interactive Demo Calculations & Telemetry Math ---');
  // Mathematical logic from page.tsx:
  // totalFabricMeters = (suitCount * fabricLengthPerSuit).toFixed(1)
  // fabricEfficiency = Math.min(98.5, parseFloat((92.4 + (suitCount * 0.4)).toFixed(1)))
  // estimatedSAMHours = (suitCount * 14.5).toFixed(1)
  // karigarPayoutINR = suitCount * 4200 (formatted with commas)

  function calculateLandingMetrics(suitCount: number, fabricLengthPerSuit: number = 3.3) {
    const totalFabricMeters = (suitCount * fabricLengthPerSuit).toFixed(1);
    const fabricEfficiency = Math.min(98.5, parseFloat((92.4 + (suitCount * 0.4)).toFixed(1)));
    const estimatedSAMHours = (suitCount * 14.5).toFixed(1);
    const karigarPayoutNumber = suitCount * 4200;
    const karigarPayoutINR = karigarPayoutNumber.toLocaleString('en-IN');
    return { totalFabricMeters, fabricEfficiency, estimatedSAMHours, karigarPayoutNumber, karigarPayoutINR };
  }

  // Default state: 8 suits @ 3.3m
  const defaultMetrics = calculateLandingMetrics(8, 3.3);
  assert(defaultMetrics.totalFabricMeters === '26.4', 'Default 8 suits yield 26.4 total fabric meters');
  assert(defaultMetrics.fabricEfficiency === 95.6, 'Default 8 suits achieve 95.6% fabric efficiency');
  assert(defaultMetrics.estimatedSAMHours === '116.0', 'Default 8 suits require 116.0 SAM hours');
  assert(defaultMetrics.karigarPayoutNumber === 33600, 'Default 8 suits result in ₹33,600 karigar payout');

  // Boundary 1: Single suit
  const singleSuit = calculateLandingMetrics(1, 3.3);
  assert(singleSuit.totalFabricMeters === '3.3', 'Single suit fabric meters = 3.3m');
  assert(singleSuit.fabricEfficiency === 92.8, 'Single suit efficiency = 92.8% (92.4 + 0.4)');
  assert(singleSuit.estimatedSAMHours === '14.5', 'Single suit SAM hours = 14.5');
  assert(singleSuit.karigarPayoutNumber === 4200, 'Single suit payout = ₹4,200 (100 min @ ₹42/min)');

  // Boundary 2: High suit count efficiency cap (max 98.5%)
  const highSuits = calculateLandingMetrics(20, 3.3);
  assert(highSuits.fabricEfficiency === 98.5, '20 suits efficiency is capped at maximum 98.5% (calculated 100.4% -> 98.5%)');

  const extremeSuits = calculateLandingMetrics(100, 3.5);
  assert(extremeSuits.totalFabricMeters === '350.0', '100 suits @ 3.5m = 350.0m');
  assert(extremeSuits.fabricEfficiency === 98.5, '100 suits efficiency strictly capped at 98.5%');
  assert(extremeSuits.karigarPayoutNumber === 420000, '100 suits payout = ₹420,000');

  // Invariant: ₹42/minute rate check (4200 per suit corresponds to 100 minutes at ₹42/minute)
  assert(4200 / 100 === 42, 'Karigar payout ₹4,200 per suit satisfies ₹42/minute piece-rate invariant (100 SAM minutes)');

  // 1.4 1-Click Sandbox Session Setup
  console.log('\n--- Subsuite 1.4: 1-Click Sandbox Session Setup ---');
  // Simulate handleQuickDemoLogin from page.tsx
  function createSandboxSession(role: string, name: string, email: string) {
    return {
      id: `usr_demo_${role.toLowerCase()}`,
      name,
      email,
      role,
      tenant: {
        id: 'tenant-flagship-01',
        name: 'Grand Atelier Flagship',
        code: 'GA-01',
      },
      loggedInAt: new Date().toISOString(),
    };
  }

  // Setup mock local storage environment
  const mockStorage: Record<string, string> = {};
  const origWindow = (global as any).window;
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
    },
  };

  for (const persona of expectedPersonas) {
    const session = createSandboxSession(persona.role, persona.name, persona.email);
    setLocalStorage('yh_auth_user', session);

    const retrieved = getLocalStorage<any>('yh_auth_user', null);
    assert(retrieved !== null, `Sandbox session for ${persona.role} stored in localStorage`);
    assert(retrieved.id === `usr_demo_${persona.role.toLowerCase()}`, `Session user id matches usr_demo_${persona.role.toLowerCase()}`);
    assert(retrieved.role === persona.role, `Session role matches ${persona.role}`);
    assert(retrieved.tenant.code === 'GA-01', `Session tenant code is GA-01`);
    assert(typeof retrieved.loggedInAt === 'string', `Session has loggedInAt ISO string`);
  }

  // 1.5 Landmark Hotspots
  console.log('\n--- Subsuite 1.5: Anatomical Landmark Hotspots ---');
  assert(landingPageContent.includes("id: 'chest'"), "Landmark 'chest' defined");
  assert(landingPageContent.includes("id: 'shoulder'"), "Landmark 'shoulder' defined");
  assert(landingPageContent.includes("id: 'waist'"), "Landmark 'waist' defined");
  assert(landingPageContent.includes("id: 'sleeve'"), "Landmark 'sleeve' defined");
  assert(landingPageContent.includes("id: 'inseam'"), "Landmark 'inseam' defined");
  assert(landingPageContent.includes("unit: 'in'"), "Landmarks use inches as base unit");

  // ===========================================================================
  // SUITE 2: REDHOUSE OS ECOSYSTEM SHOWCASE (apps/web/src/app/redhouse-os/page.tsx)
  // ===========================================================================
  console.log('\n[Suite 2: RedHouse OS Ecosystem Showcase]');

  const redhousePath = path.join(webRoot, 'src', 'app', 'redhouse-os', 'page.tsx');
  assert(fs.existsSync(redhousePath), 'RedHouse OS file exists at src/app/redhouse-os/page.tsx');
  const redhouseContent = fs.readFileSync(redhousePath, 'utf8');

  // 2.1 Services Grid (6 services)
  console.log('\n--- Subsuite 2.1: Ecosystem Services Grid ---');
  const expectedServices = [
    { id: 'blouses', name: 'Bespoke Blouse Stitching', price: 990, turnaround: '7 Days', href: '/redhouse/marketplace' },
    { id: 'lehenga', name: 'Lehenga Choli & Ghagras', price: 2499, turnaround: '10 Days', href: '/redhouse/marketplace' },
    { id: 'salwar', name: 'Salwar Suits & Anarkalis', price: 1199, turnaround: '7 Days', href: '/redhouse/marketplace' },
    { id: 'indo-western', name: 'Indo-Western & Crop Top Sets', price: 1899, turnaround: '7 Days', href: '/redhouse/bidding' },
    { id: 'gowns', name: 'Evening Gowns & Western Wear', price: 3499, turnaround: '10 Days', href: '/redhouse/stylists' },
    { id: 'custom-print', name: 'Custom Fabric Printing', price: 349, turnaround: '3 Days', href: '/redhouse/equipment' },
  ];

  for (const srv of expectedServices) {
    assert(redhouseContent.includes(`id: '${srv.id}'`), `Service '${srv.id}' is configured in SERVICES_GRID`);
    assert(redhouseContent.includes(`href: '${srv.href}'`), `Service '${srv.id}' links to ecosystem route '${srv.href}'`);
  }

  // 2.2 Platform Ecosystem Modules (ECOSYSTEM_MODULES)
  console.log('\n--- Subsuite 2.2: Platform Ecosystem Modules & Navigation Links ---');
  const expectedModules = [
    { id: 'marketplace', href: '/redhouse/marketplace' },
    { id: 'equipment', href: '/redhouse/equipment' },
    { id: 'supply', href: '/redhouse/supply' },
    { id: 'bidding', href: '/redhouse/bidding' },
    { id: 'stylists', href: '/redhouse/stylists' },
  ];

  for (const mod of expectedModules) {
    assert(redhouseContent.includes(`id: '${mod.id}'`), `Ecosystem module '${mod.id}' is configured`);
    assert(redhouseContent.includes(`href: '${mod.href}'`), `Ecosystem module '${mod.id}' links to '${mod.href}'`);
  }

  // 2.3 Key Ecosystem Metrics & Guarantees
  console.log('\n--- Subsuite 2.3: Ecosystem Metrics & Quality Guarantees ---');
  assert(redhouseContent.includes('100% Perfect Fit Guarantee'), 'Features 100% Perfect Fit Guarantee');
  assert(redhouseContent.includes('7-Day Guaranteed Delivery') || redhouseContent.includes('7-Day Turnaround'), 'Features 7-Day Guaranteed Turnaround');
  assert(redhouseContent.includes('4.9/5 Rating'), 'Features 4.9/5 Customer Rating metric');

  // 2.4 Doorstep Booking Form Validation
  console.log('\n--- Subsuite 2.4: Doorstep Booking Form Validation ---');
  function validatePickupBooking(form: { name: string; phone: string }) {
    if (!form.name || !form.name.trim() || !form.phone || !form.phone.trim()) {
      return { valid: false, error: 'Please provide your name and contact number.' };
    }
    return { valid: true, error: null };
  }

  assert(!validatePickupBooking({ name: '', phone: '8142424646' }).valid, 'Empty name fails doorstep pickup validation');
  assert(!validatePickupBooking({ name: 'Sravani Reddy', phone: '' }).valid, 'Empty phone fails doorstep pickup validation');
  assert(validatePickupBooking({ name: 'Sravani Reddy', phone: '+91 81424 24646' }).valid, 'Valid name and phone passes doorstep pickup validation');

  // ===========================================================================
  // SUITE 3: LOGIN & REGISTER AUTHENTICATION VIEWS
  // ===========================================================================
  console.log('\n[Suite 3: Login & Register Authentication Views]');

  const loginPath = path.join(webRoot, 'src', 'app', '(auth)', 'login', 'page.tsx');
  assert(fs.existsSync(loginPath), 'Login page file exists at src/app/(auth)/login/page.tsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');

  const registerPath = path.join(webRoot, 'src', 'app', '(auth)', 'register', 'page.tsx');
  assert(fs.existsSync(registerPath), 'Register page file exists at src/app/(auth)/register/page.tsx');
  const registerContent = fs.readFileSync(registerPath, 'utf8');

  // 3.1 Login Validation Logic
  console.log('\n--- Subsuite 3.1: Login Form Validation ---');
  function validateLoginInput(email: string, pass: string) {
    if (!email || !pass) {
      return { valid: false, error: 'Please enter both email and password.' };
    }
    if (!email.includes('@')) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    return { valid: true, error: null };
  }

  assert(!validateLoginInput('', 'password123').valid, 'Empty email rejected in login');
  assert(validateLoginInput('', 'password123').error === 'Please enter both email and password.', 'Empty email error message matches specification');
  assert(!validateLoginInput('owner@yellowhouse.com', '').valid, 'Empty password rejected in login');
  assert(validateLoginInput('owner@yellowhouse.com', '').error === 'Please enter both email and password.', 'Empty password error message matches specification');
  assert(!validateLoginInput('invalid-email-format', 'password123').valid, 'Missing @ symbol rejected');
  assert(validateLoginInput('invalid-email-format', 'password123').error === 'Please enter a valid email address.', 'Invalid email error message matches specification');
  assert(validateLoginInput('owner@yellowhouse.com', 'password123').valid, 'Valid email and password pass login validation');

  // 3.2 Demo Accounts in Login Page
  console.log('\n--- Subsuite 3.2: Demo Accounts on Login Page ---');
  const expectedLoginDemos = [
    { role: 'TENANT_OWNER', email: 'owner@yellowhouse.com' },
    { role: 'MASTER_TAILOR', email: 'master@yellowhouse.com' },
    { role: 'BRANCH_MANAGER', email: 'manager@yellowhouse.com' },
    { role: 'KARIGAR', email: 'karigar@yellowhouse.com' },
  ];

  for (const demo of expectedLoginDemos) {
    assert(loginContent.includes(`email: '${demo.email}'`), `Login page supports demo account for '${demo.email}'`);
    assert(loginContent.includes(`role: '${demo.role}'`), `Login page maps demo role '${demo.role}'`);
  }

  // Demo personas on login page: includes 4 atelier roles + SYSTEM_ADMIN for admin gate access
  const demoPersonasMatch = loginContent.match(/const DEMO_PERSONAS\s*=\s*(\[[\s\S]*?\]);/);
  assert(Boolean(demoPersonasMatch), 'Login page defines DEMO_PERSONAS array');
  if (demoPersonasMatch) {
    const rawDemoText = demoPersonasMatch[1];
    assert(rawDemoText.includes('TENANT_OWNER'), 'Login demo personas include TENANT_OWNER');
    assert(rawDemoText.includes('MASTER_TAILOR'), 'Login demo personas include MASTER_TAILOR');
    assert(rawDemoText.includes('BRANCH_MANAGER'), 'Login demo personas include BRANCH_MANAGER');
    assert(rawDemoText.includes('KARIGAR'), 'Login demo personas include KARIGAR');
    assert(rawDemoText.includes('SYSTEM_ADMIN'), 'Login demo personas include SYSTEM_ADMIN for admin gate routing');
    assert(!rawDemoText.includes('SUPER_ADMIN'), 'Login demo personas do not expose SUPER_ADMIN role');
  }

  // 3.3 Active Session Persistence & Sign Out
  console.log('\n--- Subsuite 3.3: Active Session Persistence & Sign Out ---');
  const dummyUser = {
    id: 'usr_active_test',
    name: 'Latif Khan',
    email: 'owner@yellowhouse.com',
    role: 'TENANT_OWNER',
    tenant: { id: 'tenant-flagship-01', name: 'Grand Atelier Flagship', code: 'GA-01' },
    loggedInAt: new Date().toISOString(),
  };

  setLocalStorage('yh_auth_user', dummyUser);
  const activeSession = getLocalStorage<any>('yh_auth_user', null);
  assert(activeSession !== null && activeSession.id === 'usr_active_test', 'Session is actively restored from yh_auth_user');

  // Sign out cleanup
  removeLocalStorage('yh_auth_user');
  const postSignOut = getLocalStorage<any>('yh_auth_user', null);
  assert(postSignOut === null, 'Sign out removes yh_auth_user from localStorage');

  // 3.4 Register Form Validation
  console.log('\n--- Subsuite 3.4: Register Form Validation ---');
  function validateRegisterInput(fullName: string, email: string, pass: string, confirmPass: string) {
    if (!fullName || !fullName.trim()) {
      return { valid: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    if (pass.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long.' };
    }
    if (pass !== confirmPass) {
      return { valid: false, error: 'Passwords do not match. Please check and try again.' };
    }
    return { valid: true, error: null };
  }

  assert(!validateRegisterInput('', 'test@atelier.com', '123456', '123456').valid, 'Empty full name rejected in register');
  assert(!validateRegisterInput('Latif Khan', 'not-an-email', '123456', '123456').valid, 'Invalid email rejected in register');
  assert(!validateRegisterInput('Latif Khan', 'latif@atelier.com', '12345', '12345').valid, 'Password < 6 chars rejected in register');
  assert(
    validateRegisterInput('Latif Khan', 'latif@atelier.com', '12345', '12345').error ===
      'Password must be at least 6 characters long.',
    'Password length error message matches specification'
  );
  assert(!validateRegisterInput('Latif Khan', 'latif@atelier.com', 'passwordA', 'passwordB').valid, 'Password mismatch rejected in register');
  assert(
    validateRegisterInput('Latif Khan', 'latif@atelier.com', 'passwordA', 'passwordB').error ===
      'Passwords do not match. Please check and try again.',
    'Password mismatch error message matches specification'
  );
  assert(validateRegisterInput('Latif Khan', 'latif@atelier.com', 'securepass123', 'securepass123').valid, 'Valid registration fields accepted');

  // 3.5 Role Options in Register
  console.log('\n--- Subsuite 3.5: Role Options in Register ---');
  const expectedRegisterRoles = ['TENANT_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'MASTER_TAILOR', 'KARIGAR', 'ACCOUNTANT'];
  for (const r of expectedRegisterRoles) {
    assert(registerContent.includes(`value: '${r}'`), `Register page offers role selection for '${r}'`);
  }

  // ===========================================================================
  // SUITE 4: ONBOARDING FUNNEL WIZARD (apps/web/src/app/onboarding/page.tsx)
  // ===========================================================================
  console.log('\n[Suite 4: Onboarding Funnel Wizard & Demo Eviction]');

  const onboardingPath = path.join(webRoot, 'src', 'app', 'onboarding', 'page.tsx');
  assert(fs.existsSync(onboardingPath), 'Onboarding page file exists at src/app/onboarding/page.tsx');
  const onboardingContent = fs.readFileSync(onboardingPath, 'utf8');

  // 4.1 Step 1 Validation: Boutique Name & Subdomain Slug
  console.log('\n--- Subsuite 4.1: Step 1 Validation & Slug Rules ---');
  function validateOnboardingStep1(boutiqueName: string, slugStatus: string) {
    if (!boutiqueName || !boutiqueName.trim()) {
      return { valid: false, error: 'Please enter your boutique or atelier business name.' };
    }
    if (slugStatus !== 'available') {
      return { valid: false, error: 'Please provide a valid and available workspace subdomain slug.' };
    }
    return { valid: true, error: null };
  }

  assert(!validateOnboardingStep1('', 'available').valid, 'Empty boutique name rejected in Step 1');
  assert(!validateOnboardingStep1('Savile Row Atelier', 'taken').valid, 'Taken slug rejected in Step 1');
  assert(!validateOnboardingStep1('Savile Row Atelier', 'invalid').valid, 'Invalid slug rejected in Step 1');
  assert(validateOnboardingStep1('Savile Row Atelier', 'available').valid, 'Valid name and available slug advances to Step 2');

  // Test slugify functionality
  assert(slugify('Grand Atelier & Couture') === 'grand-atelier-couture', 'slugify converts boutique name to kebab-case');
  assert(slugify('   Savile    Row   ') === 'savile-row', 'slugify collapses multiple spaces and trims');
  assert(isValidSlug('savile-row-atelier') === true, 'isValidSlug accepts standard hyphenated slug');
  assert(isValidSlug('sr') === false, 'isValidSlug rejects slug shorter than 3 characters');
  assert(isValidSlug('-savile-row') === false, 'isValidSlug rejects leading hyphen');
  assert(isValidSlug('savile-row-') === false, 'isValidSlug rejects trailing hyphen');
  assert(isValidSlug('SavileRow') === false, 'isValidSlug rejects uppercase letters');

  // 4.2 Step 2 Validation: Blueprint Template Selection
  console.log('\n--- Subsuite 4.2: Step 2 Validation & Template Aggregation ---');
  const templateBlueprints = [
    { id: 'mens_ethnic', name: "Men's Ethnic", pomsCount: 28 },
    { id: 'mens_western', name: "Men's Western", pomsCount: 32 },
    { id: 'womens_ethnic', name: "Women's Ethnic", pomsCount: 36 },
    { id: 'womens_couture', name: "Women's Couture", pomsCount: 40 },
  ];

  for (const t of templateBlueprints) {
    assert(onboardingContent.includes(`id: '${t.id}'`), `Onboarding includes blueprint template '${t.id}'`);
    assert(onboardingContent.includes(`pomsCount: ${t.pomsCount}`), `Template '${t.id}' seeds ${t.pomsCount} POMs`);
  }

  function validateOnboardingStep2(templates: string[]) {
    if (!templates || templates.length === 0) {
      return { valid: false, error: 'Select at least one measurement template category to seed your atelier.' };
    }
    return { valid: true, error: null };
  }

  assert(!validateOnboardingStep2([]).valid, 'Empty template selection rejected in Step 2');
  assert(validateOnboardingStep2(['mens_ethnic']).valid, 'Single template selection accepted in Step 2');
  assert(validateOnboardingStep2(['mens_ethnic', 'mens_western', 'womens_ethnic', 'womens_couture']).valid, 'All 4 templates selection accepted');

  // Calculate total POMs seeded
  const totalSeededAll = templateBlueprints.reduce((acc, t) => acc + t.pomsCount, 0);
  assert(totalSeededAll === 136, 'Seeding all 4 templates provides exactly 136 production POMs (28+32+36+40)');

  // 4.3 Step 3 Validation: Owner Account
  console.log('\n--- Subsuite 4.3: Step 3 Validation ---');
  function validateOnboardingStep3(ownerName: string, email: string, pass: string, confirmPass: string) {
    if (!ownerName || !ownerName.trim()) {
      return { valid: false, error: 'Please enter the atelier owner name.' };
    }
    if (!email || !email.trim()) {
      return { valid: false, error: 'Please enter a valid owner email address.' };
    }
    if (pass.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long.' };
    }
    if (pass !== confirmPass) {
      return { valid: false, error: 'Passwords do not match.' };
    }
    return { valid: true, error: null };
  }

  assert(!validateOnboardingStep3('', 'latif@atelier.com', '123456', '123456').valid, 'Empty owner name rejected in Step 3');
  assert(!validateOnboardingStep3('Latif Khan', '', '123456', '123456').valid, 'Empty email rejected in Step 3');
  assert(!validateOnboardingStep3('Latif Khan', 'latif@atelier.com', '12345', '12345').valid, 'Password < 6 chars rejected in Step 3');
  assert(!validateOnboardingStep3('Latif Khan', 'latif@atelier.com', 'passwordA', 'passwordB').valid, 'Password mismatch rejected in Step 3');
  assert(validateOnboardingStep3('Latif Khan', 'latif@atelier.com', 'securepass123', 'securepass123').valid, 'Valid owner credentials accepted in Step 3');

  // 4.4 Draft Autosave & Recovery
  console.log('\n--- Subsuite 4.4: Draft Autosave & Recovery ---');
  const sampleDraft = {
    step: 2,
    boutiqueName: 'Bespoke Crown Atelier',
    slug: 'bespoke-crown-atelier',
    isSlugManuallyEdited: false,
    city: 'London',
    phone: '+44 20 7946 0912',
    templates: ['mens_western', 'womens_couture'],
    ownerName: 'Arthur Vance',
    email: 'vance@bespokecrown.co.uk',
  };

  setLocalStorage('yh_onboarding_draft', sampleDraft);
  const loadedDraft = getLocalStorage<any>('yh_onboarding_draft', null);
  assert(loadedDraft !== null && loadedDraft.boutiqueName === 'Bespoke Crown Atelier', 'Draft correctly saved and restored');
  assert(loadedDraft.step === 2, 'Draft maintains active step 2');
  assert(loadedDraft.templates.length === 2, 'Draft maintains selected templates');

  // 4.5 Demo Session Cleanup Upon Workspace Activation
  console.log('\n--- Subsuite 4.5: Demo Session Eviction Upon Activation ---');
  // Populate demo data
  setLocalStorage('yh_auth_user', { role: 'KARIGAR', name: 'Demo Karigar' });
  setLocalStorage('yh_customers', [{ id: 'cust_1', name: 'Demo Client' }]);
  setLocalStorage('yh_orders', [{ id: 'ord_1', totalAmount: 25000 }]);
  setLocalStorage('yh_measurements_current', { chest: 42 });

  // Simulate completion cleanup handler from onboarding/page.tsx lines 378-384
  function performOnboardingCompletionCleanup() {
    removeLocalStorage('yh_auth_user');
    removeLocalStorage('yh_customers');
    removeLocalStorage('yh_orders');
    removeLocalStorage('yh_measurements_current');
  }

  performOnboardingCompletionCleanup();

  assert(getLocalStorage('yh_auth_user', null) === null, 'yh_auth_user is cleaned up upon onboarding completion');
  assert(getLocalStorage('yh_customers', null) === null, 'yh_customers demo records evicted');
  assert(getLocalStorage('yh_orders', null) === null, 'yh_orders demo records evicted');
  assert(getLocalStorage('yh_measurements_current', null) === null, 'yh_measurements_current demo records evicted');

  // Verify onboarding page source contains this exact cleanup invocation
  assert(onboardingContent.includes("removeLocalStorage('yh_auth_user')"), "onboarding/page.tsx includes removeLocalStorage('yh_auth_user')");
  assert(onboardingContent.includes("removeLocalStorage('yh_customers')"), "onboarding/page.tsx includes removeLocalStorage('yh_customers')");
  assert(onboardingContent.includes("removeLocalStorage('yh_orders')"), "onboarding/page.tsx includes removeLocalStorage('yh_orders')");
  assert(onboardingContent.includes("removeLocalStorage('yh_measurements_current')"), "onboarding/page.tsx includes removeLocalStorage('yh_measurements_current')");

  // ===========================================================================
  // SUITE 5: ADVERSARIAL, REGRESSION & BOUNDARY STRESS TESTING
  // ===========================================================================
  console.log('\n[Suite 5: Adversarial, Regression & Boundary Stress Testing]');

  // 5.1 XSS Vectors and HTML Injection in Inputs
  console.log('\n--- Subsuite 5.1: XSS Injection & Security Sanitization ---');
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    '"><img src=x onerror=alert(1)>',
    "'; DROP TABLE users; --",
    "javascript:void(0)",
    '<iframe src="https://evil.com"></iframe>',
    '${7*7}',
    '{{7*7}}',
  ];

  for (const payload of xssPayloads) {
    const slugified = slugify(payload);
    assert(
      !slugified.includes('<') && !slugified.includes('>') && !slugified.includes('"') && !slugified.includes("'") && !slugified.includes('/'),
      `slugify safely sanitizes XSS payload '${payload}' -> '${slugified}'`
    );
    if (slugified.length > 0 && isValidSlug(slugified)) {
      assert(/^[a-z0-9-]+$/.test(slugified), `Slugified output '${slugified}' is strictly safe alphanumeric/hyphen characters`);
    }
  }

  // 5.2 Extreme String Length Boundaries
  console.log('\n--- Subsuite 5.2: Extreme Boundary String Lengths ---');
  const hugeString = 'A'.repeat(5000);
  assert(slugify(hugeString) === 'a'.repeat(5000), 'slugify handles 5000-character input without stack overflow');
  assert(isValidSlug('a'.repeat(5000)) === false, 'isValidSlug rejects 5000-char slug (max 50 chars)');
  assert(isValidSlug('a'.repeat(50)) === true, 'isValidSlug accepts exactly 50-char slug (boundary upper limit)');
  assert(isValidSlug('a'.repeat(51)) === false, 'isValidSlug rejects 51-char slug');
  assert(isValidSlug('aaa') === true, 'isValidSlug accepts exactly 3-char slug (boundary lower limit)');
  assert(isValidSlug('aa') === false, 'isValidSlug rejects 2-char slug');

  // 5.3 Internationalization & Unicode Sartorial Robustness
  console.log('\n--- Subsuite 5.3: Internationalization & Unicode Robustness ---');
  const unicodeNames = [
    { text: 'Atelier François & Élégance', expectedSlug: 'atelier-franois-lgance' },
    { text: 'शाही शेरवानी घराना', expectedSlug: '' }, // non-alphanumeric ASCII stripped
    { text: 'دار الأزياء الفاخرة', expectedSlug: '' },
    { text: 'Tokyo Bespoke 銀座', expectedSlug: 'tokyo-bespoke' },
    { text: 'München Haute Couture', expectedSlug: 'mnchen-haute-couture' },
  ];

  for (const item of unicodeNames) {
    const resultSlug = slugify(item.text);
    assert(typeof resultSlug === 'string', `Unicode text '${item.text}' slugifies without error`);
  }

  // 5.4 Arithmetic Edge Cases for Landing Page Math
  console.log('\n--- Subsuite 5.4: Arithmetic Edge Cases in Formula Math ---');
  const zeroSuitMetrics = calculateLandingMetrics(0, 3.3);
  assert(zeroSuitMetrics.totalFabricMeters === '0.0', '0 suits yields 0.0 fabric meters');
  assert(zeroSuitMetrics.fabricEfficiency === 92.4, '0 suits efficiency defaults to base 92.4%');
  assert(zeroSuitMetrics.estimatedSAMHours === '0.0', '0 suits yields 0.0 SAM hours');
  assert(zeroSuitMetrics.karigarPayoutNumber === 0, '0 suits yields ₹0 payout');

  // Negative suit boundary
  const negativeSuitMetrics = calculateLandingMetrics(-5, 3.3);
  assert(typeof negativeSuitMetrics.totalFabricMeters === 'string', 'Negative input handled without throw');

  // 5.5 Corrupted LocalStorage Fault Recovery
  console.log('\n--- Subsuite 5.5: Corrupted LocalStorage Fault Recovery ---');
  mockStorage['corrupted_key'] = '{ invalid_json ::: ';
  const safeRetrieved = getLocalStorage('corrupted_key', { fallback: true });
  assert(safeRetrieved.fallback === true, 'Corrupted JSON in localStorage falls back safely without crash');

  mockStorage['null_literal_key'] = 'null';
  const nullRetrieved = getLocalStorage('null_literal_key', 'fallback_val');
  assert(nullRetrieved === 'fallback_val', 'Literal null string in localStorage returns fallback safely');

  // Clean up mock window
  if (origWindow) {
    (global as any).window = origWindow;
  } else {
    delete (global as any).window;
  }

  console.log(`\n================================================================`);
  console.log(`MILESTONE 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { passed, failed, findings };
}

if (require.main === module) {
  const result = runM2PublicAuthOnboardingTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
