/// <reference lib="dom" />
declare var window: any;

import { calculateGarmentSam, BASE_GARMENT_SAM_MAP, EMBROIDERY_SAM_MAP } from '../../apps/web/src/lib/sam-calculator';
import { calculateBespokePricing, EMBROIDERY_PRICE_MAP, POSTURE_AXIS_TECHNICAL_FEE } from '../../apps/web/src/lib/pricing-calculator';
import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  getProgressForStage,
  getProgressForStatus,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  JobCardItem,
  Order,
  KanbanStage,
  OrderStatus,
} from '../../apps/web/src/lib/state-sync-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../../apps/web/src/lib/storage-utils';

// Mock localStorage setup for Node environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => (k in mockStorage ? mockStorage[k] : null),
  setItem: (k: string, v: string) => {
    mockStorage[k] = v;
  },
  removeItem: (k: string) => {
    delete mockStorage[k];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
};
(globalThis as any).window = {
  localStorage: mockLocalStorage,
};

let passCount = 0;
let failCount = 0;
const findings: string[] = [];

function assert(condition: boolean, testName: string, detailOnFail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${detailOnFail || 'Assertion failed'}`);
    failCount++;
    findings.push(`FAIL: ${testName} - ${detailOnFail || 'Assertion failed'}`);
  }
}

function runSuite(name: string, fn: () => void) {
  console.log(`\n========================================`);
  console.log(`SUITE: ${name}`);
  console.log(`========================================`);
  try {
    fn();
  } catch (err: any) {
    console.error(`💥 EXCEPTION in suite "${name}":`, err?.stack || err);
    failCount++;
    findings.push(`CRASH in suite "${name}": ${err?.message || err}`);
  }
}

// -------------------------------------------------------------
// SUITE 1: LocalStorage Edge Cases & Robustness
// -------------------------------------------------------------
runSuite('1. LocalStorage Fallback & Safe Parsing', () => {
  mockLocalStorage.clear();

  // Test 1.1: Standard fallback on missing key
  const val1 = getLocalStorage('non_existent_key', { default: true });
  assert(val1.default === true, 'Returns fallback on missing key');

  // Test 1.2: Raw JSON string "null"
  mockStorage['key_null'] = 'null';
  const val2 = getLocalStorage('key_null', ['fallback']);
  assert(Array.isArray(val2) && val2[0] === 'fallback', 'Returns fallback when storage has JSON string "null"');

  // Test 1.3: Raw JSON string "undefined"
  mockStorage['key_undef'] = 'undefined';
  const val3 = getLocalStorage('key_undef', { fallback: 1 });
  assert(val3.fallback === 1, 'Returns fallback when storage has "undefined" string');

  // Test 1.4: Invalid JSON syntax
  mockStorage['key_bad_json'] = '{ bad json: ';
  const val4 = getLocalStorage('key_bad_json', 'default_str');
  assert(val4 === 'default_str', 'Returns fallback on invalid JSON parse error');

  // Test 1.5: LocalStorage holds non-array JSON for key expecting array (e.g. object, number, boolean)
  mockStorage['yh_orders'] = JSON.stringify({ error: 'not an array' });
  const val5 = getLocalStorage<Order[]>('yh_orders', []);
  console.log('val5 value for non-array JSON:', val5);
  assert(val5 !== null && val5 !== undefined, 'getLocalStorage returns parsed JSON object');
  
  // Checking array safety when callers expect array:
  let arrayCrashCount = 0;
  try {
    // Attempt sync function when yh_orders is object instead of array
    syncJobToOrdersStorage({
      id: 'JC-100',
      orderId: '#YH-100',
      client: 'Test',
      garment: 'Suit',
      karigar: 'Salim',
      samMinutesLogged: 10,
      samTotalEstimate: 100,
      priority: 'Normal',
      dueDate: 'Aug 10',
      progress: 20,
      stage: 'Master Cutting',
    });
  } catch (err: any) {
    arrayCrashCount++;
    console.error('Captured expected crash in syncJobToOrdersStorage with non-array JSON:', err.message);
  }
  assert(arrayCrashCount > 0, 'BEHAVIOR CONFIRMED: syncJobToOrdersStorage crashes if LocalStorage yh_orders is non-array JSON object', 'Crashed with TypeError as orders.map is not a function');

  // Test 1.6: LocalStorage holds non-array JSON for yh_production_jobs
  mockStorage['yh_production_jobs'] = JSON.stringify(12345);
  let jobsArrayCrash = false;
  try {
    syncOrderToJobsStorage({
      id: '#YH-200',
      clientName: 'Test Client',
      clientPhone: '123',
      garmentSummary: 'Shirt',
      itemCount: 1,
      status: 'CONFIRMED',
      totalAmount: 5000,
      dueDate: 'Aug 10',
      createdAt: '2026-08-01',
    });
  } catch (err: any) {
    jobsArrayCrash = true;
    console.error('Captured expected crash in syncOrderToJobsStorage with non-array JSON:', err.message);
  }
  assert(jobsArrayCrash, 'BEHAVIOR CONFIRMED: syncOrderToJobsStorage crashes if LocalStorage yh_production_jobs is a number/non-array', 'Crashed with TypeError as jobs.map is not a function');

  mockLocalStorage.clear();
});

// -------------------------------------------------------------
// SUITE 2: Order ID Cleaning & Normalization Edge Cases
// -------------------------------------------------------------
runSuite('2. Order ID Cleaning & Normalization', () => {
  assert(cleanOrderId('#YH-9021') === '9021', 'cleanOrderId("#YH-9021") -> "9021"');
  assert(cleanOrderId('JC-9021') === '9021', 'cleanOrderId("JC-9021") -> "9021"');
  assert(cleanOrderId(' #YH-JC-9021 ') === '9021', 'cleanOrderId(" #YH-JC-9021 ") -> "9021"');
  assert(cleanOrderId('JC-YH-9021') === '9021', 'cleanOrderId("JC-YH-9021") -> "9021"');
  assert(cleanOrderId('9021') === '9021', 'cleanOrderId("9021") -> "9021"');
  assert(cleanOrderId('') === '', 'cleanOrderId("") -> ""');

  // Runtime boundary check: non-string input (null, undefined, number)
  let nullCrash = false;
  try {
    cleanOrderId(null as any);
  } catch (e) {
    nullCrash = true;
  }
  assert(!nullCrash, 'cleanOrderId(null) handles null safely without throwing', 'Threw exception on null');

  let numberCrash = false;
  try {
    cleanOrderId(9021 as any);
  } catch (e) {
    numberCrash = true;
  }
  assert(numberCrash, 'BEHAVIOR CONFIRMED: cleanOrderId(9021 as number) throws TypeError because .trim() is called directly', 'Threw TypeError 9021.trim is not a function');
});

// -------------------------------------------------------------
// SUITE 3: SAM Matrix & Customization Calculation Math
// -------------------------------------------------------------
runSuite('3. SAM Matrix & Customization Calculation Math', () => {
  // Test all 9 garment categories base SAM
  const categories = [
    { cat: 'mens-suit', expected: 240 },
    { cat: 'mens-sherwani', expected: 210 },
    { cat: 'mens-shirt', expected: 60 },
    { cat: 'mens-trouser', expected: 90 },
    { cat: 'womens-blouse', expected: 120 },
    { cat: 'womens-lehenga', expected: 300 },
    { cat: 'womens-anarkali', expected: 270 },
    { cat: 'womens-corset', expected: 180 },
    { cat: 'womens-gown', expected: 240 },
  ];

  for (const c of categories) {
    const res = calculateGarmentSam({ garmentCategory: c.cat as any });
    assert(res.baseSamMinutes === c.expected, `Category ${c.cat} has base SAM ${c.expected} mins`);
  }

  // Fallback for unknown garment category
  const unknownRes = calculateGarmentSam({ garmentCategory: 'unknown-garment' as any });
  assert(unknownRes.baseSamMinutes === 120, 'Unknown garment category falls back to 120 mins');

  // Posture Modifier combinations
  const allModifiersRes = calculateGarmentSam({
    garmentCategory: 'mens-suit',
    postureProfile: {
      shoulderSlope: 'very_sloped', // +25
      backCurvature: 'stooped', // +20
      abdomenStance: 'prominent', // +25
      hipSpineStance: 'sway_back', // +20
    },
  });
  assert(allModifiersRes.postureModifierMinutes === 90, 'Sum of max posture modifiers equals 90 mins (25+20+25+20)');
  assert(allModifiersRes.totalSamMinutes === 240 + 90, 'Total SAM for suit with max posture modifiers equals 330 mins');

  // Panel count thresholds
  const p11 = calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 11 });
  assert(p11.customizationMinutes === 0, '11 panels has 0 panel surcharge');

  const p12 = calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 12 });
  assert(p12.customizationMinutes === 30, '12 panels adds 30 mins surcharge');

  const p16 = calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 16 });
  assert(p16.customizationMinutes === 30, '16 panels adds 30 mins surcharge');

  const p17 = calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 17 });
  assert(p17.customizationMinutes === 60, '17 panels adds 60 mins surcharge');

  // Fitting trials multiplier
  const trials3 = calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: 3 });
  assert(trials3.customizationMinutes === 135, '3 fitting trials add 135 mins (3 * 45)');

  // Negative / zero fitting trials
  const trialsNeg = calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: -2 });
  assert(trialsNeg.customizationMinutes === 0, 'Negative fitting trials count adds 0 mins surcharge');

  // Hours precision formatting test
  const fracRes = calculateGarmentSam({ garmentCategory: 'mens-shirt' }); // 60 mins = 1.0 hr
  assert(fracRes.estimatedLaborHours === 1, '60 mins converted to 1.0 hour');

  const oddRes = calculateGarmentSam({ garmentCategory: 'mens-shirt', panelCount: 12 }); // 60 + 30 = 90 mins = 1.5 hr
  assert(oddRes.estimatedLaborHours === 1.5, '90 mins converted to 1.5 hours');
});

// -------------------------------------------------------------
// SUITE 4: Bespoke Pricing Math Verification
// -------------------------------------------------------------
runSuite('4. Bespoke Pricing Math Verification', () => {
  // Test 4.1: Suit standard pricing
  const suit = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 2000,
    boltWidth: 44,
  });

  // Base fabric yield = 5.0m * 2000 = 10000. SAM = 240 mins * 42 = 10080. Total = 20080. Advance = 10040. Balance = 10040.
  assert(suit.fabricCost === 10000, 'Fabric cost 5.0m * 2000 = 10000');
  assert(suit.baseLaborCost === 10080, 'Labor cost 240 mins * 42 = 10080');
  assert(suit.totalGarmentPrice === 20080, 'Total price = 20080');
  assert(suit.mandatoryAdvance50Percent === 10040, 'Mandatory advance 50% = 10040');
  assert(suit.balanceDueOnDelivery === 10040, 'Balance due = 10040');
  assert(suit.mandatoryAdvance50Percent + suit.balanceDueOnDelivery === suit.totalGarmentPrice, 'Advance + Balance equals Total Price exactly');

  // Test 4.2: Odd Total Price Rounding Sum Equivalence
  // Force an odd total price to check if advance + balance equals total
  const oddPriceInput = calculateBespokePricing({
    garmentCategory: 'mens-shirt', // SAM = 60 * 43 = 2580
    fabricCostPerMeter: 1001, // yield = 2.20 * 1001 = 2202.2 -> round 2202
    artisanMinuteRate: 43,
  });
  assert(
    oddPriceInput.mandatoryAdvance50Percent + oddPriceInput.balanceDueOnDelivery === oddPriceInput.totalGarmentPrice,
    'Advance + Balance equals Total Price even when total is odd/fractional rounded'
  );

  // Test 4.3: Rush Fee Math (+20% on labor + embroidery ONLY, excluding fabric & posture)
  const rushTest = calculateBespokePricing({
    garmentCategory: 'mens-suit', // SAM 240 * 42 = 10080 labor
    fabricCostPerMeter: 5000, // 5m * 5000 = 25000 fabric
    embroideryLevel: 'light', // 3500 embroidery (SAM +45 mins -> labor 285*42 = 11970)
    postureProfile: { shoulderSlope: 'sloped', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal' }, // 750 posture fee (SAM +15 mins -> labor 300*42 = 12600)
    isUrgent: true,
  });
  // Total SAM = 240 (base) + 15 (sloped) + 45 (light embroidery) = 300 mins.
  // baseLaborCost = 300 * 42 = 12600.
  // postureSurcharge = 750 (1 non-normal axis).
  // embroiderySurcharge = 3500.
  // rushSurcharge = Math.round(0.20 * (baseLaborCost + embroiderySurcharge)) = Math.round(0.20 * (12600 + 3500)) = Math.round(0.20 * 16100) = 3220.
  assert(rushTest.baseLaborCost === 12600, 'Base labor includes posture & embroidery SAM minutes (300m * 42 = 12600)');
  assert(rushTest.rushSurcharge === 3220, 'Rush surcharge equals 20% of (labor + embroidery) = 3220');
  assert(
    rushTest.totalGarmentPrice === rushTest.fabricCost + rushTest.baseLaborCost + rushTest.postureSurcharge + rushTest.embroiderySurcharge + rushTest.rushSurcharge,
    'Total price sums all 5 components correctly'
  );
});

// -------------------------------------------------------------
// SUITE 5: Kanban Stage & Order Status Mapping Matrix Consistency
// -------------------------------------------------------------
runSuite('5. Kanban Stage & Order Status Mappings & Progress Desync Audit', () => {
  const stageToStatusPairs: { stage: KanbanStage; expectedStatus: OrderStatus }[] = [
    { stage: 'Fabric Inspection', expectedStatus: 'CONFIRMED' },
    { stage: 'Master Cutting', expectedStatus: 'CUTTING' },
    { stage: 'Zardozi/Aari Embroidery', expectedStatus: 'IN_PRODUCTION' },
    { stage: 'Stitching Assembly', expectedStatus: 'IN_PRODUCTION' },
    { stage: 'QC & Ready for Delivery', expectedStatus: 'READY_FOR_DELIVERY' },
  ];

  for (const pair of stageToStatusPairs) {
    const status = mapStageToOrderStatus(pair.stage);
    assert(status === pair.expectedStatus, `mapStageToOrderStatus("${pair.stage}") -> "${pair.expectedStatus}"`);
  }

  // Audit Progress Calculations
  const utilsProgFabric = getProgressForStage('Fabric Inspection');
  const pageProgFabric = Math.min(100, Math.max(15, (0 + 1) * 20));
  assert(
    utilsProgFabric === pageProgFabric,
    'Fabric Inspection progress values match between state-sync-utils and production/page.tsx',
    `DESYNC FOUND: state-sync-utils returns ${utilsProgFabric}%, while production/page.tsx sets ${pageProgFabric}%`
  );

  const utilsProgCutting = getProgressForStage('Master Cutting');
  const pageProgCutting = Math.min(100, Math.max(15, (1 + 1) * 20));
  assert(
    utilsProgCutting === pageProgCutting,
    'Master Cutting progress values match between state-sync-utils and production/page.tsx',
    `DESYNC FOUND: state-sync-utils returns ${utilsProgCutting}%, while production/page.tsx sets ${pageProgCutting}%`
  );
});

// -------------------------------------------------------------
// SUITE 6: Bidirectional Synchronization & Idempotency Stress
// -------------------------------------------------------------
runSuite('6. Bidirectional Storage Sync & Idempotency', () => {
  mockLocalStorage.clear();

  // Setup valid initial state
  const initialOrder: Order = {
    id: '#YH-9001',
    clientName: 'Sunita V',
    clientPhone: '9876543210',
    garmentSummary: 'Lehenga Choli',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 65000,
    dueDate: 'Aug 20',
    createdAt: '2026-08-01',
  };
  setLocalStorage('yh_orders', [initialOrder]);
  setLocalStorage('yh_production_jobs', []);

  // 1. Sync Order to Jobs -> Spawns job card
  syncOrderToJobsStorage(initialOrder);
  const jobs1 = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(jobs1.length === 1, 'syncOrderToJobsStorage auto-spawns 1 job card for CONFIRMED order');
  assert(jobs1[0].id === 'JC-9001', 'Job card ID is JC-9001');
  assert(jobs1[0].stage === 'Fabric Inspection', 'Initial stage is Fabric Inspection');

  // 2. Call syncOrderToJobsStorage again with SAME order (Idempotency test)
  syncOrderToJobsStorage(initialOrder);
  const jobs2 = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(jobs2.length === 1, 'Calling syncOrderToJobsStorage again does not duplicate job card');

  // 3. Move Job Stage to "Master Cutting" and call syncJobToOrdersStorage
  const updatedJob: JobCardItem = {
    ...jobs2[0],
    stage: 'Master Cutting',
    progress: 35,
  };
  syncJobToOrdersStorage(updatedJob);

  const ordersAfterJobMove = getLocalStorage<Order[]>('yh_orders', []);
  assert(ordersAfterJobMove[0].status === 'CUTTING', 'Job stage move to Master Cutting updated Order status to CUTTING');

  // 4. Sync Order with DRAFT status -> Should NOT spawn a job card
  const draftOrder: Order = {
    id: '#YH-9002',
    clientName: 'Draft Client',
    clientPhone: '1112223333',
    garmentSummary: 'Shirt',
    itemCount: 1,
    status: 'DRAFT',
    totalAmount: 3000,
    dueDate: 'Aug 25',
    createdAt: '2026-08-07',
  };
  setLocalStorage('yh_orders', [...ordersAfterJobMove, draftOrder]);
  syncOrderToJobsStorage(draftOrder);

  const jobsAfterDraft = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(jobsAfterDraft.length === 1, 'DRAFT order does not auto-spawn a production job card');

  // 5. Upgrade DRAFT order to CONFIRMED and sync -> Should spawn job card now
  const confirmedOrder: Order = { ...draftOrder, status: 'CONFIRMED' };
  syncOrderToJobsStorage(confirmedOrder);
  const jobsAfterConfirmed = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(jobsAfterConfirmed.length === 2, 'Upgraded CONFIRMED order now spawns job card');
  assert(jobsAfterConfirmed[0].id === 'JC-9002' || jobsAfterConfirmed[1].id === 'JC-9002', 'Job JC-9002 created');
});

// Final Summary
console.log(`\n========================================`);
console.log(`STRESS TEST SUMMARY`);
console.log(`========================================`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
if (findings.length > 0) {
  console.log(`\nFINDINGS:`);
  findings.forEach((f, i) => console.log(`${i + 1}. ${f}`));
}
