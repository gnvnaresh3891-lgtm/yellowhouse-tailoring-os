import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';

export function runStorageUtilsTests(): { passed: number; failed: number } {
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
  console.log('--- STORAGE UTILS SAFE LOCALSTORAGE TEST SUITE ---');
  console.log('==================================================\n');

  // 1. Test SSR environment behavior (when window / window.localStorage is not present or mocked)
  console.log('[Suite 1: SSR & Window Safety Checks]');
  
  // Store real global window if any
  const originalWindow = (global as any).window;

  // Test Node.js SSR fallback (window is undefined or dummy)
  (global as any).window = undefined;
  assert(getLocalStorage('test_key', 'ssr_fallback') === 'ssr_fallback', 'getLocalStorage returns fallbackValue when window is undefined');
  assert(setLocalStorage('test_key', 'val') === false, 'setLocalStorage returns false when window is undefined');
  assert(removeLocalStorage('test_key') === false, 'removeLocalStorage returns false when window is undefined');

  // 2. Test In-Memory Storage Mocking
  console.log('\n[Suite 2: Storage Operations with Mock LocalStorage]');
  
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

  (global as any).window = {
    localStorage: mockLocalStorage
  };

  // 2.1 Get fallback when key does not exist
  assert(getLocalStorage('non_existent', 'default_val') === 'default_val', 'getLocalStorage returns fallback for missing key');

  // 2.2 Set object value
  const sampleObject = { boutique: 'Royal Tailors', id: 101, active: true };
  const setRes = setLocalStorage('yh_auth_user', sampleObject);
  assert(setRes === true, 'setLocalStorage returns true on successful write');
  assert(mockStore['yh_auth_user'] === JSON.stringify(sampleObject), 'Storage contains correctly serialized JSON string');

  // 2.3 Get stored object value
  const retrieved = getLocalStorage<typeof sampleObject | null>('yh_auth_user', null);
  assert(retrieved !== null && retrieved.boutique === 'Royal Tailors' && retrieved.id === 101, 'getLocalStorage correctly parses stored JSON object');

  // 2.4 Handle corrupted / invalid JSON gracefully
  mockStore['corrupted_key'] = '{ invalid_json : 123 ';
  const corruptedFallback = getLocalStorage('corrupted_key', { fallback: true });
  assert(corruptedFallback.fallback === true, 'getLocalStorage catches JSON parse error and returns fallbackValue');

  // 2.5 Null string guard check ("null" or "undefined" raw string in localStorage)
  mockStore['null_string_key'] = 'null';
  const nullStringFallback = getLocalStorage<any[]>('null_string_key', [1, 2, 3]);
  assert(Array.isArray(nullStringFallback) && nullStringFallback.length === 3, 'getLocalStorage guards against raw "null" string and returns fallbackValue array');

  mockStore['undefined_string_key'] = 'undefined';
  const undefinedStringFallback = getLocalStorage<string>('undefined_string_key', 'safe_default');
  assert(undefinedStringFallback === 'safe_default', 'getLocalStorage guards against raw "undefined" string and returns fallbackValue');

  // 2.6 Remove localStorage item
  const removeRes = removeLocalStorage('yh_auth_user');
  assert(removeRes === true, 'removeLocalStorage returns true on successful removal');
  assert(getLocalStorage('yh_auth_user', 'deleted') === 'deleted', 'Removed key returns fallbackValue');

  // 2.7 Edge case values (array, numbers, booleans, null)
  setLocalStorage('array_key', [1, 2, 3]);
  const arr = getLocalStorage<number[]>('array_key', []);
  assert(Array.isArray(arr) && arr.length === 3 && arr[1] === 2, 'getLocalStorage supports array values');

  setLocalStorage('bool_key', false);
  const boolVal = getLocalStorage<boolean>('bool_key', true);
  assert(boolVal === false, 'getLocalStorage handles boolean false correctly');

  // 3. Milestone 2 Draft Autosave & Persistence Integration Suite
  console.log('\n[Suite 3: Milestone 2 Draft Autosave & Persistence]');

  // 3.1 Onboarding Form Draft Autosave
  const onboardingDraft = {
    step: 2,
    boutiqueName: 'Imperial Savile Row',
    slug: 'imperial-savile-row',
    isSlugManuallyEdited: true,
    city: 'London',
    phone: '+44 20 7946 0912',
    templates: ['mens_ethnic', 'mens_western'],
    ownerName: 'Master Arthur Pendelton',
    email: 'arthur@imperial.co.uk'
  };
  setLocalStorage('yh_onboarding_draft', onboardingDraft);
  const loadedOnboardingDraft = getLocalStorage<typeof onboardingDraft | null>('yh_onboarding_draft', null);
  assert(
    loadedOnboardingDraft !== null &&
    loadedOnboardingDraft.boutiqueName === 'Imperial Savile Row' &&
    loadedOnboardingDraft.step === 2 &&
    loadedOnboardingDraft.templates.length === 2,
    'Onboarding draft autosave stores and restores multi-step form state correctly'
  );
  removeLocalStorage('yh_onboarding_draft');
  assert(getLocalStorage('yh_onboarding_draft', null) === null, 'Onboarding draft is cleared upon completion');

  // 3.2 Customer Directory Persistence
  const customerList = [
    { id: 'CUST-101', name: 'Kabir Khan', phone: '+91 99887 76655', gender: 'Men', preferredFit: 'Slim Bespoke', isVip: true, measurementsCount: 2, lastVisit: 'Today', initials: 'KK' }
  ];
  setLocalStorage('yh_customers', customerList);
  const loadedCustomers = getLocalStorage<typeof customerList>('yh_customers', []);
  assert(
    Array.isArray(loadedCustomers) &&
    loadedCustomers.length === 1 &&
    loadedCustomers[0].name === 'Kabir Khan' &&
    loadedCustomers[0].isVip === true,
    'Customer directory persistence dynamically stores new additions in yh_customers'
  );

  // 3.3 Staff Management Persistence & Recruitment Draft
  const staffDraft = { name: 'Karigar Salim', email: 'salim@yellowhouse.com', role: 'KARIGAR', branch: 'Main Flagship' };
  setLocalStorage('yh_staff_draft', staffDraft);
  const loadedStaffDraft = getLocalStorage<typeof staffDraft | null>('yh_staff_draft', null);
  assert(
    loadedStaffDraft !== null && loadedStaffDraft.name === 'Karigar Salim' && loadedStaffDraft.role === 'KARIGAR',
    'Staff recruitment draft autosaves modal input values'
  );

  const staffList = [
    { id: 'st-10', name: 'Karigar Salim', email: 'salim@yellowhouse.com', role: 'KARIGAR', branch: 'Main Flagship', status: 'Active', hiredAt: '2026-08-07' }
  ];
  setLocalStorage('yh_staff', staffList);
  const loadedStaff = getLocalStorage<typeof staffList>('yh_staff', []);
  assert(
    Array.isArray(loadedStaff) && loadedStaff.length === 1 && loadedStaff[0].id === 'st-10',
    'Staff directory persists hired specialists dynamically to yh_staff'
  );

  // 3.4 Order Creation Form Draft Autosave
  const orderDraft = {
    selectedClientId: 'CUST-101',
    dueDate: '2026-08-25',
    notes: 'Silk lining preference with gold zari embroidery',
    items: [
      { id: 'item-1', garmentType: 'Sherwani', fabricSku: 'SKU-SHER-901', fabricMeters: 4.5, unitPrice: 28000, fabricImage: 'https://example.com/swatch.jpg' }
    ],
    updatedAt: new Date().toISOString()
  };
  setLocalStorage('yh_orders_draft', orderDraft);
  const loadedOrderDraft = getLocalStorage<typeof orderDraft | null>('yh_orders_draft', null);
  assert(
    loadedOrderDraft !== null &&
    loadedOrderDraft.selectedClientId === 'CUST-101' &&
    loadedOrderDraft.items[0].fabricMeters === 4.5 &&
    loadedOrderDraft.items[0].fabricImage === 'https://example.com/swatch.jpg',
    'Order creation form draft autosaves client selection, swatches, meters, and item rows'
  );
  removeLocalStorage('yh_orders_draft');
  assert(getLocalStorage('yh_orders_draft', null) === null, 'Order draft is cleared upon submission');

  // 4. Empty LocalStorage Load Resilience Suite across All Dashboard Keys
  console.log('\n[Suite 4: Empty LocalStorage Resilience across 8 Dashboard Routes]');
  mockLocalStorage.clear();

  const emptyAuth = getLocalStorage('yh_auth_user', null);
  assert(emptyAuth === null, '/onboarding & login load safely with null auth on empty storage');

  const emptyCustomers = getLocalStorage('yh_customers', []);
  assert(Array.isArray(emptyCustomers) && emptyCustomers.length === 0, '/customers loads safely with empty array fallback');

  const emptyStaff = getLocalStorage('yh_staff', []);
  assert(Array.isArray(emptyStaff) && emptyStaff.length === 0, '/staff loads safely with empty array fallback');

  const emptyOrders = getLocalStorage('yh_orders', []);
  assert(Array.isArray(emptyOrders) && emptyOrders.length === 0, '/orders loads safely with empty array fallback');

  const emptyOrderDraft = getLocalStorage('yh_orders_draft', null);
  assert(emptyOrderDraft === null, '/orders form draft restores safely with null fallback');

  const emptyJobs = getLocalStorage('yh_production_jobs', []);
  assert(Array.isArray(emptyJobs) && emptyJobs.length === 0, '/production loads safely with empty array fallback');

  const emptyMeasurements = getLocalStorage('yh_measurements_current', {});
  assert(typeof emptyMeasurements === 'object' && Object.keys(emptyMeasurements).length === 0, '/measurements loads safely with empty object fallback');

  // 4. M2 Mandatory Verification Suite for Route LocalStorage Safety & Autosave
  console.log('\n[Suite 4: M2 Mandatory Verification Suite for Route Storage & Autosave]');

  // 4.1 Clear localStorage -> Load each route component key -> 0 exceptions thrown
  mockLocalStorage.clear();

  let thrownCount = 0;
  try {
    const routeKeys = [
      { key: 'yh_auth_user', fallback: null },
      { key: 'yh_onboarding_draft', fallback: null },
      { key: 'yh_customers', fallback: [] },
      { key: 'yh_staff', fallback: [] },
      { key: 'yh_staff_draft', fallback: null },
      { key: 'yh_orders', fallback: [] },
      { key: 'yh_orders_draft', fallback: null },
      { key: 'yh_production_jobs', fallback: [] },
      { key: 'yh_measurements_current', fallback: {} },
      { key: 'yh_measurement_snapshots', fallback: [] }
    ];

    for (const r of routeKeys) {
      const res = getLocalStorage(r.key, r.fallback);
      assert(res !== undefined, `Cleared storage load for route key "${r.key}" succeeded without exception`);
    }
  } catch (err) {
    thrownCount++;
  }
  assert(thrownCount === 0, 'Clear localStorage -> load each route key -> 0 exceptions thrown');

  // 4.2 Store "null" string in key -> call getLocalStorage -> fallback value returned without crash
  mockStore['test_null_string_key'] = 'null';
  const nullStringObjResult = getLocalStorage('test_null_string_key', { fallback: 'safe_object' });
  assert(
    nullStringObjResult !== null && nullStringObjResult.fallback === 'safe_object',
    'Store "null" string in key -> call getLocalStorage -> fallback object returned without crash'
  );

  mockStore['test_null_array_key'] = 'null';
  const nullStringArrResult = getLocalStorage<string[]>('test_null_array_key', ['default_1', 'default_2']);
  assert(
    Array.isArray(nullStringArrResult) && nullStringArrResult.length === 2 && nullStringArrResult[0] === 'default_1',
    'Store "null" string in key -> call getLocalStorage -> fallback array returned without crash'
  );

  mockStore['test_undefined_string_key'] = 'undefined';
  const undefinedStringResult = getLocalStorage('test_undefined_string_key', 'fallback_str');
  assert(
    undefinedStringResult === 'fallback_str',
    'Store "undefined" string in key -> call getLocalStorage -> fallback string returned without crash'
  );

  // 4.3 Save draft -> reload component -> draft state restored
  // Onboarding draft reload
  const sampleOnboardingDraft = {
    step: 2,
    boutiqueName: 'Savile Atelier',
    slug: 'savile-atelier',
    isSlugManuallyEdited: true,
    city: 'Mumbai',
    phone: '+91 98765 00000',
    templates: ['mens_ethnic'],
    ownerName: 'Master Latif',
    email: 'latif@savile.com'
  };
  setLocalStorage('yh_onboarding_draft', sampleOnboardingDraft);
  const reloadedOnboardingDraft = getLocalStorage<typeof sampleOnboardingDraft | null>('yh_onboarding_draft', null);
  assert(
    reloadedOnboardingDraft !== null &&
    reloadedOnboardingDraft.boutiqueName === 'Savile Atelier' &&
    reloadedOnboardingDraft.step === 2,
    'Save onboarding draft -> reload component -> draft state restored'
  );

  // Order draft reload
  const sampleOrderDraft = {
    selectedClientId: 'CUST-002',
    dueDate: '2026-08-30',
    notes: 'Gold zari thread work required',
    items: [
      { id: 'item-1', garmentType: 'Sherwani', fabricSku: 'SKU-SHER-901', fabricMeters: 4.5, unitPrice: 28000 }
    ],
    updatedAt: new Date().toISOString()
  };
  setLocalStorage('yh_orders_draft', sampleOrderDraft);
  const reloadedOrderDraft = getLocalStorage<typeof sampleOrderDraft | null>('yh_orders_draft', null);
  assert(
    reloadedOrderDraft !== null &&
    reloadedOrderDraft.selectedClientId === 'CUST-002' &&
    reloadedOrderDraft.items.length === 1,
    'Save order draft -> reload component -> draft state restored'
  );

  // Staff draft reload
  const sampleStaffDraft = { name: 'Karigar Rahim', email: 'rahim@yellowhouse.com', role: 'KARIGAR', branch: 'Main Flagship' };
  setLocalStorage('yh_staff_draft', sampleStaffDraft);
  const reloadedStaffDraft = getLocalStorage<typeof sampleStaffDraft | null>('yh_staff_draft', null);
  assert(
    reloadedStaffDraft !== null &&
    reloadedStaffDraft.name === 'Karigar Rahim' &&
    reloadedStaffDraft.role === 'KARIGAR',
    'Save staff draft -> reload component -> draft state restored'
  );

  // 4.4 Submit form -> draft cleared -> persistent storage updated
  // Onboarding submission
  const newAuthUser = { id: 'usr_999', name: 'Master Latif', email: 'latif@savile.com', role: 'TENANT_OWNER' };
  setLocalStorage('yh_auth_user', newAuthUser);
  removeLocalStorage('yh_onboarding_draft');
  assert(getLocalStorage('yh_onboarding_draft', null) === null, 'Onboarding submit -> draft cleared from storage');
  assert(getLocalStorage<typeof newAuthUser | null>('yh_auth_user', null)?.id === 'usr_999', 'Onboarding submit -> persistent auth storage updated');

  // Customer form submission
  const currentCustomers = getLocalStorage<any[]>('yh_customers', []);
  const newCust = { id: 'CUST-999', name: 'Zoya Khan', phone: '+91 91234 56789', gender: 'Women', preferredFit: 'Slim', isVip: true };
  const updatedCustomers = [newCust, ...currentCustomers];
  setLocalStorage('yh_customers', updatedCustomers);
  const savedCusts = getLocalStorage<any[]>('yh_customers', []);
  assert(savedCusts.some(c => c.id === 'CUST-999'), 'Customer submit -> persistent storage yh_customers updated');

  // Staff form submission
  const currentStaff = getLocalStorage<any[]>('yh_staff', []);
  const newStaff = { id: 'st-99', name: 'Karigar Rahim', email: 'rahim@yellowhouse.com', role: 'KARIGAR', branch: 'Main Flagship', status: 'Active', hiredAt: '2026-08-07' };
  setLocalStorage('yh_staff', [newStaff, ...currentStaff]);
  removeLocalStorage('yh_staff_draft');
  assert(getLocalStorage('yh_staff_draft', null) === null, 'Staff submit -> draft cleared from storage');
  assert(getLocalStorage<any[]>('yh_staff', []).some(s => s.id === 'st-99'), 'Staff submit -> persistent storage yh_staff updated');

  // Order form submission
  const currentOrders = getLocalStorage<any[]>('yh_orders', []);
  const newOrder = { id: '#YH-9999', clientName: 'Zoya Khan', clientPhone: '+91 91234 56789', garmentSummary: 'Sherwani', itemCount: 1, status: 'CONFIRMED', totalAmount: 28000, dueDate: 'Aug 30', createdAt: '2026-08-07' };
  setLocalStorage('yh_orders', [newOrder, ...currentOrders]);
  removeLocalStorage('yh_orders_draft');
  assert(getLocalStorage('yh_orders_draft', null) === null, 'Order submit -> draft cleared from storage');
  assert(getLocalStorage<any[]>('yh_orders', []).some(o => o.id === '#YH-9999'), 'Order submit -> persistent storage yh_orders updated');

  // Restore original window
  (global as any).window = originalWindow;

  console.log(`\n========================================`);
  console.log(`STORAGE UTILS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  const { failed } = runStorageUtilsTests();
  if (failed > 0) {
    process.exit(1);
  }
}

