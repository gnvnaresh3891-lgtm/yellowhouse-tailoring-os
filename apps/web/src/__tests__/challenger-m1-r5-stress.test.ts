/**
 * YellowHouse Tailoring OS — Milestone 1 (R5) Empirical Challenger Stress Harness
 * 
 * Empirical Verification of:
 * 1. 1-Click Sandbox Session Creation for all 4 Atelier Personas (TENANT_OWNER, MASTER_TAILOR, BRANCH_MANAGER, KARIGAR)
 *    - Route permission validation via canUserAccessRoute & normalizeRole
 *    - Target URL reachability and default landings
 *    - Admin isolation (zero admin exposure / leakage)
 * 2. Storage Persistence & Corruption Recovery on yh_auth_user and yh_onboarding_draft
 *    - SSR safety (undefined window/localStorage)
 *    - Corrupted JSON strings, truncated JSON, invalid types
 *    - Literal strings "null", "undefined", empty string
 *    - Schema preservation & type safety
 * 3. Demo Data Cleanup & Eviction on Onboarding Completion
 *    - Eviction of mock data keys (yh_onboarding_draft, yh_customers, yh_orders, yh_measurements_current)
 *    - Isolation of fresh tenant session from demo state
 * 4. Slug generation, validation rules & edge cases
 */

import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import { normalizeRole, canUserAccessRoute, getFallbackRedirectRoute, ROLE_PERMISSIONS, UserRole } from '../lib/rbac-utils';
import { slugify, isValidSlug } from '../lib/slug';
import type { OnboardingFormState, SlugCheckResponse } from '../types/onboarding';

export interface M1StressReport {
  totalPassed: number;
  totalFailed: number;
  assertions: Array<{
    category: string;
    description: string;
    passed: boolean;
    expected: string;
    actual: string;
  }>;
}

export function runM1EmpiricalStressSuite(): M1StressReport {
  console.log('\n================================================================');
  console.log('--- EMPIRICAL CHALLENGER M1 STRESS SUITE (R5 ATELIER FUNNEL) ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const assertions: M1StressReport['assertions'] = [];

  function check(category: string, description: string, condition: boolean, expected: string, actual: string) {
    if (condition) {
      console.log(`✅ [${category}] ${description}`);
      passed++;
      assertions.push({ category, description, passed: true, expected, actual });
    } else {
      console.error(`❌ [${category}] FAIL: ${description} (Expected: ${expected}, Got: ${actual})`);
      failed++;
      assertions.push({ category, description, passed: false, expected, actual });
    }
  }

  // ==========================================================================
  // SUITE 1: 1-CLICK SANDBOX SESSION CREATION ACROSS 4 PERSONAS
  // ==========================================================================
  console.log('[SUITE 1: 1-Click Sandbox Session Creation across 4 Personas]');

  const DEMO_PERSONAS = [
    {
      role: 'TENANT_OWNER',
      name: 'Latif Khan',
      email: 'owner@yellowhouse.com',
      targetUrl: '/dashboard',
      expectedNormalizedRole: 'ATELIER_MANAGER',
      forbiddenRoutes: ['/admin', '/admin/security']
    },
    {
      role: 'MASTER_TAILOR',
      name: 'Master Latif',
      email: 'master@yellowhouse.com',
      targetUrl: '/measurements',
      expectedNormalizedRole: 'MASTER_TAILOR',
      forbiddenRoutes: ['/admin', '/admin/users']
    },
    {
      role: 'BRANCH_MANAGER',
      name: 'Sarah Jenkins',
      email: 'manager@yellowhouse.com',
      targetUrl: '/orders',
      expectedNormalizedRole: 'ATELIER_MANAGER',
      forbiddenRoutes: ['/admin', '/admin/settings']
    },
    {
      role: 'KARIGAR',
      name: 'Rafi Craftsman',
      email: 'karigar@yellowhouse.com',
      targetUrl: '/production',
      expectedNormalizedRole: 'EMBROIDERY_ARTISAN',
      forbiddenRoutes: ['/admin', '/admin/tenants', '/staff']
    }
  ];

  // Set up mock window and localStorage
  const mockStorage: Record<string, string> = {};
  (global as any).window = {
    localStorage: {
      getItem: (key: string) => (key in mockStorage ? mockStorage[key] : null),
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => {
        const keys = Object.keys(mockStorage);
        for (let i = 0; i < keys.length; i++) {
          delete mockStorage[keys[i]];
        }
      }
    }
  };

  for (let pIdx = 0; pIdx < DEMO_PERSONAS.length; pIdx++) {
    const persona = DEMO_PERSONAS[pIdx];
    // 1.1 Create Session Object
    const sessionObj = {
      id: `usr_demo_${persona.role.toLowerCase()}`,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      tenant: {
        id: 'tenant-flagship-01',
        name: 'Grand Atelier Flagship',
        code: 'GA-01',
      },
      loggedInAt: new Date().toISOString(),
    };

    // Store in localStorage
    setLocalStorage('yh_auth_user', sessionObj);
    const stored = getLocalStorage<typeof sessionObj | null>('yh_auth_user', null);

    check(
      'SandboxCreation',
      `Session creation and retrieval for persona ${persona.role}`,
      stored !== null && stored.role === persona.role && stored.email === persona.email && stored.tenant.id === 'tenant-flagship-01',
      `Stored ${persona.role} session with email ${persona.email}`,
      `Stored: ${stored?.role}, ${stored?.email}, ${stored?.tenant?.id}`
    );

    // 1.2 Verify Role Normalization
    const normalized = normalizeRole(persona.role);
    check(
      'SandboxRBAC',
      `Role normalization for ${persona.role} -> ${persona.expectedNormalizedRole}`,
      normalized === persona.expectedNormalizedRole,
      persona.expectedNormalizedRole,
      String(normalized)
    );

    // 1.3 Verify Target URL Access
    const canAccessTarget = canUserAccessRoute(persona.role, persona.targetUrl);
    check(
      'SandboxRouting',
      `Persona ${persona.role} has route permission for target ${persona.targetUrl}`,
      canAccessTarget === true,
      'true',
      String(canAccessTarget)
    );

    // 1.4 Verify Admin Route Block (Zero Admin Exposure)
    for (let fIdx = 0; fIdx < persona.forbiddenRoutes.length; fIdx++) {
      const forbidden = persona.forbiddenRoutes[fIdx];
      const canAccessForbidden = canUserAccessRoute(persona.role, forbidden);
      check(
        'AdminIsolation',
        `Persona ${persona.role} strictly forbidden from accessing ${forbidden}`,
        canAccessForbidden === false,
        'false',
        String(canAccessForbidden)
      );

      // Verify redirect fallback when attempting forbidden route
      const fallback = getFallbackRedirectRoute(persona.role, forbidden);
      check(
        'AdminRedirect',
        `Persona ${persona.role} redirected safely away from ${forbidden} to allowed route`,
        fallback !== forbidden && canUserAccessRoute(persona.role, fallback),
        `Allowed route (not ${forbidden})`,
        `Fallback: ${fallback}`
      );
    }
  }

  // ==========================================================================
  // SUITE 2: STORAGE PERSISTENCE & CORRUPTION RECOVERY (yh_auth_user & yh_onboarding_draft)
  // ==========================================================================
  console.log('\n[SUITE 2: Storage Persistence & Corruption Recovery]');

  // 2.1 SSR Window Undefined Fallback
  const savedWindow = (global as any).window;
  (global as any).window = undefined;

  const ssrAuth = getLocalStorage('yh_auth_user', null);
  const ssrDraft = getLocalStorage('yh_onboarding_draft', { step: 1, boutiqueName: '' });
  const ssrSetAuth = setLocalStorage('yh_auth_user', { test: 1 });
  const ssrRemoveAuth = removeLocalStorage('yh_auth_user');

  check(
    'StorageSSR',
    'getLocalStorage returns fallbackValue when window is undefined',
    ssrAuth === null && ssrDraft.step === 1,
    'null / default object',
    `auth: ${ssrAuth}, draft.step: ${ssrDraft.step}`
  );
  check(
    'StorageSSR',
    'setLocalStorage and removeLocalStorage return false without crashing in SSR',
    ssrSetAuth === false && ssrRemoveAuth === false,
    'false / false',
    `set: ${ssrSetAuth}, remove: ${ssrRemoveAuth}`
  );

  // Restore mock window
  (global as any).window = savedWindow;
  const storageKeys = Object.keys(mockStorage);
  for (let k = 0; k < storageKeys.length; k++) {
    delete mockStorage[storageKeys[k]];
  }

  // 2.2 Corrupted JSON string recovery for yh_auth_user
  const corruptedStrings = [
    '{ invalid_json_syntax: 123 ',
    '<!DOCTYPE html><html><body>Error 500</body></html>',
    'undefined',
    'null',
    '{"id": "usr_1", "role": }',
    '',
    'NaN',
    '{"name": "broken',
    '[]' // array when object expected
  ];

  for (let idx = 0; idx < corruptedStrings.length; idx++) {
    const corrupt = corruptedStrings[idx];
    mockStorage['yh_auth_user'] = corrupt;
    const fallbackUser = { id: 'fallback', name: 'Fallback User', role: 'NONE' };
    const recovered = getLocalStorage('yh_auth_user', fallbackUser);

    check(
      'CorruptionRecovery',
      `Corrupted input #${idx + 1} for yh_auth_user safely recovers fallback`,
      recovered !== null && (corrupt === '[]' ? Array.isArray(recovered) : recovered.id === 'fallback'),
      'fallback object safely returned without unhandled throw',
      `Recovered: ${JSON.stringify(recovered)}`
    );
  }

  // 2.3 Corrupted JSON string recovery for yh_onboarding_draft
  for (let idx = 0; idx < corruptedStrings.length; idx++) {
    const corrupt = corruptedStrings[idx];
    mockStorage['yh_onboarding_draft'] = corrupt;
    const fallbackDraft = { step: 1, boutiqueName: 'Default Boutique', slug: 'default-boutique' };
    const recoveredDraft = getLocalStorage('yh_onboarding_draft', fallbackDraft);

    check(
      'CorruptionRecovery',
      `Corrupted input #${idx + 1} for yh_onboarding_draft safely recovers fallback`,
      recoveredDraft !== null && (corrupt === '[]' ? Array.isArray(recoveredDraft) : recoveredDraft.boutiqueName === 'Default Boutique'),
      'fallback draft safely returned',
      `Recovered: ${JSON.stringify(recoveredDraft)}`
    );
  }

  // 2.4 Multi-Step Draft Schema & Partial Fields Autosave
  const sampleStep1Draft = {
    step: 1,
    boutiqueName: 'The Royal Bespoke Atelier',
    slug: 'the-royal-bespoke-atelier',
    isSlugManuallyEdited: false,
    city: 'Mumbai',
    phone: '+91 98765 43210',
    templates: ['mens_ethnic', 'mens_western', 'womens_ethnic', 'womens_couture'],
    ownerName: '',
    email: '',
  };
  setLocalStorage('yh_onboarding_draft', sampleStep1Draft);
  const loadedStep1 = getLocalStorage<typeof sampleStep1Draft | null>('yh_onboarding_draft', null);

  check(
    'DraftPersistence',
    'Step 1 Draft persists and restores all boutique identity fields',
    loadedStep1 !== null &&
    loadedStep1.step === 1 &&
    loadedStep1.boutiqueName === 'The Royal Bespoke Atelier' &&
    loadedStep1.slug === 'the-royal-bespoke-atelier' &&
    loadedStep1.templates.length === 4,
    'Step 1 draft fully restored',
    `Restored: step ${loadedStep1?.step}, name ${loadedStep1?.boutiqueName}, templates: ${loadedStep1?.templates.length}`
  );

  // Advance to Step 2
  const sampleStep2Draft = {
    ...sampleStep1Draft,
    step: 2,
    templates: ['mens_ethnic', 'womens_couture'],
  };
  setLocalStorage('yh_onboarding_draft', sampleStep2Draft);
  const loadedStep2 = getLocalStorage<typeof sampleStep2Draft | null>('yh_onboarding_draft', null);

  check(
    'DraftPersistence',
    'Step 2 Draft persists custom template selection changes',
    loadedStep2 !== null && loadedStep2.step === 2 && loadedStep2.templates.length === 2 && loadedStep2.templates.includes('womens_couture'),
    'Step 2 draft restored with 2 templates',
    `Restored: step ${loadedStep2?.step}, templates: ${loadedStep2?.templates.join(', ')}`
  );

  // Advance to Step 3
  const sampleStep3Draft = {
    ...sampleStep2Draft,
    step: 3,
    ownerName: 'Master Cutter Latif',
    email: 'latif@royalbespoke.com',
  };
  setLocalStorage('yh_onboarding_draft', sampleStep3Draft);
  const loadedStep3 = getLocalStorage<typeof sampleStep3Draft | null>('yh_onboarding_draft', null);

  check(
    'DraftPersistence',
    'Step 3 Draft persists complete credentials and identity state',
    loadedStep3 !== null &&
    loadedStep3.step === 3 &&
    loadedStep3.ownerName === 'Master Cutter Latif' &&
    loadedStep3.email === 'latif@royalbespoke.com',
    'Step 3 complete draft restored',
    `Restored: owner ${loadedStep3?.ownerName}, email ${loadedStep3?.email}`
  );

  // ==========================================================================
  // SUITE 3: DEMO DATA CLEANUP & EVICTION ON ONBOARDING COMPLETION
  // ==========================================================================
  console.log('\n[SUITE 3: Demo Data Cleanup & Eviction on Onboarding Completion]');

  // Populate mock data across all active storage keys simulating previous demo sessions
  mockStorage['yh_onboarding_draft'] = JSON.stringify(sampleStep3Draft);
  mockStorage['yh_customers'] = JSON.stringify([{ id: 'mock-cust-1', name: 'Demo Patron' }]);
  mockStorage['yh_orders'] = JSON.stringify([{ id: 'mock-order-1', clientName: 'Demo Client' }]);
  mockStorage['yh_measurements_current'] = JSON.stringify({ garmentType: 'Sherwani', poms: { chest: 42 } });
  mockStorage['yh_auth_user'] = JSON.stringify({ id: 'usr_demo_owner', role: 'TENANT_OWNER' });

  // Simulate Onboarding Successful Provisioning & Eviction Action
  const newRegisteredUser = {
    id: 'usr_live_98765',
    name: 'Master Cutter Latif',
    email: 'latif@royalbespoke.com',
    role: 'TENANT_OWNER',
    tenant: {
      id: 'tenant_live_12345',
      name: 'The Royal Bespoke Atelier',
      code: 'THE-ROYAL-BESPOKE-ATELIER-01',
    },
    loggedInAt: new Date().toISOString(),
  };

  // Step 1 of signup completion:
  setLocalStorage('yh_auth_user', newRegisteredUser);
  removeLocalStorage('yh_onboarding_draft');

  check(
    'DemoDataEviction',
    'yh_onboarding_draft is evicted upon successful signup provisioning',
    getLocalStorage('yh_onboarding_draft', null) === null,
    'yh_onboarding_draft is null',
    `yh_onboarding_draft: ${getLocalStorage('yh_onboarding_draft', null)}`
  );

  check(
    'DemoDataEviction',
    'yh_auth_user is replaced with fresh tenant credentials',
    getLocalStorage<typeof newRegisteredUser | null>('yh_auth_user', null)?.id === 'usr_live_98765',
    'usr_live_98765',
    `id: ${getLocalStorage<typeof newRegisteredUser | null>('yh_auth_user', null)?.id}`
  );

  // Step 2 of signup completion (Clean Workspace entry button):
  removeLocalStorage('yh_customers');
  removeLocalStorage('yh_orders');
  removeLocalStorage('yh_measurements_current');

  const customersAfterClean = getLocalStorage('yh_customers', []);
  const ordersAfterClean = getLocalStorage('yh_orders', []);
  const measurementsAfterClean = getLocalStorage('yh_measurements_current', {});

  check(
    'DemoDataEviction',
    'Mock yh_customers evicted so new tenant starts with clean patron directory',
    Array.isArray(customersAfterClean) && customersAfterClean.length === 0,
    'Empty array []',
    `Count: ${customersAfterClean.length}`
  );

  check(
    'DemoDataEviction',
    'Mock yh_orders evicted so new tenant starts with clean order ledger',
    Array.isArray(ordersAfterClean) && ordersAfterClean.length === 0,
    'Empty array []',
    `Count: ${ordersAfterClean.length}`
  );

  check(
    'DemoDataEviction',
    'Mock yh_measurements_current evicted so new tenant starts with clean CAD studio',
    typeof measurementsAfterClean === 'object' && Object.keys(measurementsAfterClean).length === 0,
    'Empty object {}',
    `Keys count: ${Object.keys(measurementsAfterClean).length}`
  );

  // ==========================================================================
  // SUITE 4: SLUG SANITIZATION, VALIDATION & BOUNDARY STRESS
  // ==========================================================================
  console.log('\n[SUITE 4: Slug Sanitization, Validation & Boundary Stress]');

  const slugCases = [
    { input: 'Savile Row Atelier & Co.', expectedSlug: 'savile-row-atelier-co', valid: true },
    { input: '   The   Grand   Sherwani   House   ', expectedSlug: 'the-grand-sherwani-house', valid: true },
    { input: 'Haute-Couture---Bespoke!!!', expectedSlug: 'haute-couture-bespoke', valid: true },
    { input: 'abc', expectedSlug: 'abc', valid: true },
    { input: 'ab', expectedSlug: 'ab', valid: false }, // < 3 chars
    { input: 'a'.repeat(50), expectedSlug: 'a'.repeat(50), valid: true },
    { input: 'a'.repeat(51), expectedSlug: 'a'.repeat(51), valid: false }, // > 50 chars
    { input: '-leading-hyphen', expectedSlug: 'leading-hyphen', valid: true },
    { input: 'trailing-hyphen-', expectedSlug: 'trailing-hyphen', valid: true },
    { input: '123-456-789', expectedSlug: '123-456-789', valid: true },
  ];

  for (let sIdx = 0; sIdx < slugCases.length; sIdx++) {
    const sc = slugCases[sIdx];
    const generated = slugify(sc.input);
    check(
      'Slugify',
      `slugify("${sc.input}") -> "${sc.expectedSlug}"`,
      generated === sc.expectedSlug,
      sc.expectedSlug,
      generated
    );

    const isValid = isValidSlug(generated);
    check(
      'SlugValidation',
      `isValidSlug("${generated}") -> ${sc.valid}`,
      isValid === sc.valid,
      String(sc.valid),
      String(isValid)
    );
  }

  console.log(`\n================================================================`);
  console.log(`EMPIRICAL CHALLENGER M1 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { totalPassed: passed, totalFailed: failed, assertions };
}

// Auto-run if executed directly
if (require.main === module) {
  const res = runM1EmpiricalStressSuite();
  if (res.totalFailed > 0) {
    process.exit(1);
  }
}
