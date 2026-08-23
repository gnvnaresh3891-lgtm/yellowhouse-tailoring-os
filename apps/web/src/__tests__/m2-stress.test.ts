import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';

export function runM2StressTests(): { passed: number; failed: number } {
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

  console.log('\n==================================================');
  console.log('--- MILESTONE 2 EMPIRICAL STRESS & RESILIENCE SUITE ---');
  console.log('==================================================\n');

  const mockStore: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
    setItem: (key: string, value: string) => {
      mockStore[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      for (const k in mockStore) delete mockStore[k];
    }
  };

  const originalWindow = (global as any).window;
  (global as any).window = {
    localStorage: mockLocalStorage
  };

  // ------------------------------------------------------------------------
  // Suite 1: Corrupted / Invalid JSON Strings in Specified LocalStorage Keys
  // ------------------------------------------------------------------------
  console.log('[Suite 1: Corrupted / Invalid JSON String Safety Checks]');

  const CORRUPTED_STRINGS = [
    '{ invalid_json: true, unterminated_string: "hello ',
    '<<<XML_OR_HTML_NOT_JSON>>>',
    'undefined',
    'null',
    '{"id": 1, "nested": {"broken": ',
    '[ { "unclosed_array": true ',
    'NaN',
    'Function() {}',
    '{"truncated": "abc',
  ];

  // 1.1 yh_auth_user
  for (const badJson of CORRUPTED_STRINGS) {
    mockStore['yh_auth_user'] = badJson;
    const res = getLocalStorage<any>('yh_auth_user', null);
    assert(
      res === null,
      `yh_auth_user handles corrupted JSON "${badJson.slice(0, 20)}..." safely and returns null fallback`
    );
  }

  // 1.2 yh_customers
  for (const badJson of CORRUPTED_STRINGS) {
    mockStore['yh_customers'] = badJson;
    const res = getLocalStorage<any[]>('yh_customers', []);
    assert(
      Array.isArray(res) && res.length === 0,
      `yh_customers handles corrupted JSON "${badJson.slice(0, 20)}..." safely and returns [] fallback`
    );
  }

  // 1.3 yh_staff
  for (const badJson of CORRUPTED_STRINGS) {
    mockStore['yh_staff'] = badJson;
    const res = getLocalStorage<any[]>('yh_staff', []);
    assert(
      Array.isArray(res) && res.length === 0,
      `yh_staff handles corrupted JSON "${badJson.slice(0, 20)}..." safely and returns [] fallback`
    );
  }

  // 1.4 yh_orders_draft
  for (const badJson of CORRUPTED_STRINGS) {
    mockStore['yh_orders_draft'] = badJson;
    const res = getLocalStorage<any>('yh_orders_draft', null);
    assert(
      res === null,
      `yh_orders_draft handles corrupted JSON "${badJson.slice(0, 20)}..." safely and returns null fallback`
    );
  }

  // 1.5 yh_onboarding_draft
  for (const badJson of CORRUPTED_STRINGS) {
    mockStore['yh_onboarding_draft'] = badJson;
    const res = getLocalStorage<any>('yh_onboarding_draft', null);
    assert(
      res === null,
      `yh_onboarding_draft handles corrupted JSON "${badJson.slice(0, 20)}..." safely and returns null fallback`
    );
  }

  // ------------------------------------------------------------------------
  // Suite 2: Empty LocalStorage Access Across All Dashboard Pages & Keys
  // ------------------------------------------------------------------------
  console.log('\n[Suite 2: Empty LocalStorage Access Resilience Across All Keys]');
  mockLocalStorage.clear();

  // Test empty key access for all 8 keys used in M2
  const keysToTest: Array<{ key: string; fallback: any; expectedType: string }> = [
    { key: 'yh_auth_user', fallback: null, expectedType: 'null' },
    { key: 'yh_customers', fallback: [], expectedType: 'array' },
    { key: 'yh_staff', fallback: [], expectedType: 'array' },
    { key: 'yh_orders_draft', fallback: null, expectedType: 'null' },
    { key: 'yh_onboarding_draft', fallback: null, expectedType: 'null' },
    { key: 'yh_orders', fallback: [], expectedType: 'array' },
    { key: 'yh_production_jobs', fallback: [], expectedType: 'array' },
    { key: 'yh_measurements_current', fallback: {}, expectedType: 'object' },
  ];

  for (const testCase of keysToTest) {
    const res = getLocalStorage<any>(testCase.key, testCase.fallback);
    if (testCase.expectedType === 'null') {
      assert(res === null, `Empty storage access for "${testCase.key}" safely returns null fallback`);
    } else if (testCase.expectedType === 'array') {
      assert(Array.isArray(res) && res.length === 0, `Empty storage access for "${testCase.key}" safely returns empty array fallback`);
    } else if (testCase.expectedType === 'object') {
      assert(typeof res === 'object' && res !== null && Object.keys(res).length === 0, `Empty storage access for "${testCase.key}" safely returns empty object fallback`);
    }
  }

  // ------------------------------------------------------------------------
  // Suite 3: Draft Autosave & Clear Lifecycle Stress Testing
  // ------------------------------------------------------------------------
  console.log('\n[Suite 3: Draft Autosave & Submission Clear Lifecycle]');

  // 3.1 Onboarding Lifecycle: Save Draft -> Read -> Submit -> Clear -> Confirm Null
  const onboardingSample = { step: 3, boutiqueName: 'Aura Tailors', slug: 'aura-tailors' };
  assert(setLocalStorage('yh_onboarding_draft', onboardingSample) === true, 'Autosave onboarding draft writes successfully');
  assert(getLocalStorage<any>('yh_onboarding_draft', null)?.boutiqueName === 'Aura Tailors', 'Onboarding draft restored correctly');
  removeLocalStorage('yh_onboarding_draft');
  assert(getLocalStorage<any>('yh_onboarding_draft', null) === null, 'Onboarding draft cleared on submission');

  // 3.2 Customer Persistence: Add Customer -> Store -> Retrieve -> Count Matches
  const newCust = [{ id: 'CUST-999', name: 'Zoya Akhtar', phone: '+91 91111 22222', gender: 'Women', isVip: true }];
  assert(setLocalStorage('yh_customers', newCust) === true, 'Customer directory saves new client entry');
  const storedCust = getLocalStorage<any[]>('yh_customers', []);
  assert(storedCust.length === 1 && storedCust[0].name === 'Zoya Akhtar', 'Retrieved customer directory contains saved entry');

  // 3.3 Staff Recruitment: Save Draft -> Clear -> Persist Staff List
  const staffDraft = { name: 'Karigar Rashid', email: 'rashid@atelier.com', role: 'KARIGAR' };
  setLocalStorage('yh_staff_draft', staffDraft);
  assert(getLocalStorage<any>('yh_staff_draft', null)?.name === 'Karigar Rashid', 'Staff recruitment draft autosaves');
  removeLocalStorage('yh_staff_draft');
  assert(getLocalStorage<any>('yh_staff_draft', null) === null, 'Staff recruitment draft cleared on hiring');

  // 3.4 Order Creation Draft Lifecycle
  const orderDraftSample = { selectedClientId: 'CUST-999', items: [{ id: 'item-1', garmentType: 'Lehenga' }] };
  setLocalStorage('yh_orders_draft', orderDraftSample);
  assert(getLocalStorage<any>('yh_orders_draft', null)?.selectedClientId === 'CUST-999', 'Order draft autosaves client selection & items');
  removeLocalStorage('yh_orders_draft');
  assert(getLocalStorage<any>('yh_orders_draft', null) === null, 'Order draft cleared on order launch');

  // Restore global window
  (global as any).window = originalWindow;

  console.log(`\n========================================`);
  console.log(`M2 STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  const { failed } = runM2StressTests();
  if (failed > 0) {
    process.exit(1);
  }
}
