import { calculateGarmentSam, BASE_GARMENT_SAM_MAP, EMBROIDERY_SAM_MAP } from '../lib/sam-calculator';
import { calculateBespokePricing, EMBROIDERY_PRICE_MAP, POSTURE_AXIS_TECHNICAL_FEE } from '../lib/pricing-calculator';
import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  JobCardItem,
  Order,
  KanbanStage,
  OrderStatus
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';

// Mock localStorage for node environment if window is undefined
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
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
  };
}

export function runAdversarialM3Tests() {
  console.log('\n==================================================');
  console.log('--- MILESTONE 3 ADVERSARIAL CHALLENGE TEST SUITE ---');
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

  // ----------------------------------------------------
  // SECTION 1: SAM CALCULATOR FORMULAS & ADVERSARIAL INPUTS
  // ----------------------------------------------------
  console.log('[Suite 1: SAM Calculation Extreme Combinations & Invalid Inputs]');

  // 1.1 All 9 Garment Categories base SAM check
  for (const [cat, expectedBase] of Object.entries(BASE_GARMENT_SAM_MAP)) {
    const res = calculateGarmentSam({ garmentCategory: cat as any });
    assert(res.baseSamMinutes === expectedBase, `Category ${cat} returns base SAM ${expectedBase}`);
    assert(res.postureModifierMinutes === 0, `Category ${cat} without posture has 0 modifier mins`);
    assert(res.customizationMinutes === 0, `Category ${cat} without customization has 0 customization mins`);
    assert(res.totalSamMinutes === expectedBase, `Category ${cat} total SAM matches base`);
  }

  // 1.2 Unknown Garment Category fallback
  const unknownCatRes = calculateGarmentSam({ garmentCategory: 'unknown-category' as any });
  assert(unknownCatRes.baseSamMinutes === 120, 'Unknown garment category falls back to 120 SAM mins');

  // 1.3 Extreme Posture combinations (all 4 axes maximum non-normal)
  const maxPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-suit',
    postureProfile: {
      shoulderSlope: 'very_sloped',
      backCurvature: 'stooped',
      abdomenStance: 'prominent',
      hipSpineStance: 'sway_back',
    },
  });
  assert(maxPostureRes.postureModifierMinutes === 90, 'Max posture combination yields exactly +90 modifier mins');
  assert(maxPostureRes.totalSamMinutes === 240 + 90, 'Total SAM for suit with max posture = 330 mins');

  // 1.4 Invalid / Unknown posture keys in posture profile
  const invalidPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-shirt',
    postureProfile: {
      shoulderSlope: 'invalid_shoulder' as any,
      backCurvature: 'normal',
      abdomenStance: 'invalid_abdomen' as any,
      hipSpineStance: 'normal',
    },
  });
  assert(invalidPostureRes.postureModifierMinutes === 0, 'Invalid posture enum values safely evaluate to +0 mins');

  // 1.5 Panel Count threshold tests: <=0 (0), 1-11 (0), 12-16 (+30), >16 (+60)
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: -5 }).customizationMinutes === 0, 'Negative panel count (-5) gives 0 surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 0 }).customizationMinutes === 0, 'Zero panel count gives 0 surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 11 }).customizationMinutes === 0, '11 panels gives 0 surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 12 }).customizationMinutes === 30, '12 panels gives +30 mins surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 16 }).customizationMinutes === 30, '16 panels gives +30 mins surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 17 }).customizationMinutes === 60, '17 panels gives +60 mins surcharge');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 100 }).customizationMinutes === 60, '100 panels gives +60 mins surcharge');

  // 1.6 Fitting trial counts: negative, zero, positive
  assert(calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: -3 }).customizationMinutes === 0, 'Negative fitting trial count (-3) gives 0 mins');
  assert(calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: 0 }).customizationMinutes === 0, 'Zero fitting trial count gives 0 mins');
  assert(calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: 3 }).customizationMinutes === 135, '3 fitting trials gives +135 mins (3 * 45)');

  // 1.7 Combined Max Surcharge
  const extremeAllRes = calculateGarmentSam({
    garmentCategory: 'womens-lehenga',
    postureProfile: {
      shoulderSlope: 'very_sloped',
      backCurvature: 'stooped',
      abdomenStance: 'prominent',
      hipSpineStance: 'sway_back',
    },
    panelCount: 20,
    embroideryLevel: 'heavy',
    hasFullCanvas: true,
    hasCustomLining: true,
    fittingTrialCount: 4,
  });
  assert(extremeAllRes.baseSamMinutes === 300, 'Extreme combination base SAM = 300');
  assert(extremeAllRes.postureModifierMinutes === 90, 'Extreme combination posture = 90');
  assert(extremeAllRes.customizationMinutes === 540, 'Extreme combination customization = 540');
  assert(extremeAllRes.totalSamMinutes === 930, 'Extreme combination total SAM = 930');
  assert(extremeAllRes.estimatedLaborHours === 15.5, 'Estimated labor hours = 15.5');


  // ----------------------------------------------------
  // SECTION 2: BESPOKE PRICING CALCULATOR FORMULAS & MATH ACCURACY
  // ----------------------------------------------------
  console.log('\n[Suite 2: Bespoke Pricing Calculator Formulas & Math]');

  // 2.1 Posture Surcharge Math (₹750 per non-normal axis)
  const p0 = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 1000,
    postureProfile: { shoulderSlope: 'normal', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal' },
  });
  assert(p0.postureSurcharge === 0, '0 non-normal posture axes = ₹0 surcharge');

  const p2 = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 1000,
    postureProfile: { shoulderSlope: 'sloped', backCurvature: 'normal', abdomenStance: 'prominent', hipSpineStance: 'normal' },
  });
  assert(p2.postureSurcharge === 1500, '2 non-normal posture axes = ₹1500 surcharge (2 * 750)');

  const p4 = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 1000,
    postureProfile: { shoulderSlope: 'sloped', backCurvature: 'erect', abdomenStance: 'prominent', hipSpineStance: 'high_hip' },
  });
  assert(p4.postureSurcharge === 3000, '4 non-normal posture axes = ₹3000 surcharge (4 * 750)');

  // 2.2 Embroidery Surcharge Mapping
  assert(calculateBespokePricing({ garmentCategory: 'mens-shirt', fabricCostPerMeter: 500, embroideryLevel: 'none' }).embroiderySurcharge === 0, 'Embroidery none = ₹0');
  assert(calculateBespokePricing({ garmentCategory: 'mens-shirt', fabricCostPerMeter: 500, embroideryLevel: 'light' }).embroiderySurcharge === 3500, 'Embroidery light = ₹3,500');
  assert(calculateBespokePricing({ garmentCategory: 'mens-shirt', fabricCostPerMeter: 500, embroideryLevel: 'medium' }).embroiderySurcharge === 12000, 'Embroidery medium = ₹12,000');
  assert(calculateBespokePricing({ garmentCategory: 'mens-shirt', fabricCostPerMeter: 500, embroideryLevel: 'heavy' }).embroiderySurcharge === 28000, 'Embroidery heavy = ₹28,000');

  // 2.3 SAM + Pricing Interaction Test
  // Suit base SAM (240 mins) + Heavy Embroidery SAM (+240 mins) = 480 total SAM mins.
  // Base labor cost = 480 * ₹42 = ₹20,160.
  // Heavy embroidery material/artisan surcharge = ₹28,000.
  // Rush order fee (+20% of labor ₹20,160 + embroidery ₹28,000 = ₹48,160) = 0.20 * 48,160 = ₹9,632.
  const rushPricingWithEmb = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 0,
    embroideryLevel: 'heavy',
    isUrgent: true,
    artisanMinuteRate: 42,
  });
  assert(rushPricingWithEmb.totalSamMinutes === 480, 'Suit + Heavy Embroidery total SAM = 480 mins');
  assert(rushPricingWithEmb.baseLaborCost === 20160, 'Suit + Heavy Embroidery base labor cost = ₹20,160 (480 * 42)');
  assert(rushPricingWithEmb.embroiderySurcharge === 28000, 'Suit heavy embroidery surcharge = ₹28,000');
  assert(rushPricingWithEmb.rushSurcharge === 9632, 'Rush order surcharge (+20% of ₹48,160) = ₹9,632');

  // 2.4 Suit without embroidery rush fee test
  // Suit base SAM = 240 mins. Base labor cost @ ₹42/min = 240 * 42 = ₹10,080.
  // Embroidery none = ₹0.
  // Rush fee = 20% of 10,080 = ₹2,016.
  const rushPricingNoEmb = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 0,
    embroideryLevel: 'none',
    isUrgent: true,
    artisanMinuteRate: 42,
  });
  assert(rushPricingNoEmb.baseLaborCost === 10080, 'Suit without embroidery base labor cost = ₹10,080');
  assert(rushPricingNoEmb.rushSurcharge === 2016, 'Rush order surcharge (+20% of ₹10,080) = ₹2,016');

  // 2.5 50% Mandatory Advance Payment Schedule Integrity Check
  const priceCases = [
    { fabricCostPerMeter: 1200, category: 'mens-suit' as const },
    { fabricCostPerMeter: 3450, category: 'womens-lehenga' as const },
    { fabricCostPerMeter: 777, category: 'womens-gown' as const },
    { fabricCostPerMeter: 999, category: 'mens-shirt' as const },
  ];

  for (const pc of priceCases) {
    const res = calculateBespokePricing({ garmentCategory: pc.category, fabricCostPerMeter: pc.fabricCostPerMeter, isUrgent: true });
    assert(
      res.mandatoryAdvance50Percent + res.balanceDueOnDelivery === res.totalGarmentPrice,
      `Payment schedule sum (${res.mandatoryAdvance50Percent} + ${res.balanceDueOnDelivery}) equals total price (${res.totalGarmentPrice}) without drift`
    );
  }


  // ----------------------------------------------------
  // SECTION 3: STATE SYNC UTILITIES & MALFORMED STORAGE RESILIENCE
  // ----------------------------------------------------
  console.log('\n[Suite 3: State Sync Utilities & Malformed Storage Handling]');

  // 3.1 Order ID Cleaning Helper Tests
  assert(cleanOrderId('#YH-9035') === '9035', "cleanOrderId('#YH-9035') => '9035'");
  assert(cleanOrderId('YH-9035') === '9035', "cleanOrderId('YH-9035') => '9035'");
  assert(cleanOrderId('JC-9035') === '9035', "cleanOrderId('JC-9035') => '9035'");
  assert(cleanOrderId(' 9035 ') === '9035', "cleanOrderId(' 9035 ') => '9035'");
  assert(cleanOrderId('#yh-9035') === '9035', "cleanOrderId case insensitive '#yh-9035' => '9035'");
  assert(cleanOrderId('') === '', "cleanOrderId('') => ''");
  assert(cleanOrderId(null as any) === '', "cleanOrderId(null) => ''");
  assert(cleanOrderId(undefined as any) === '', "cleanOrderId(undefined) => ''");

  // 3.2 Stage <-> OrderStatus Mapping Bidirectionality
  const stageToStatusPairs: [KanbanStage, OrderStatus][] = [
    ['Fabric Inspection', 'CONFIRMED'],
    ['Master Cutting', 'CUTTING'],
    ['Zardozi/Aari Embroidery', 'IN_PRODUCTION'],
    ['Stitching Assembly', 'IN_PRODUCTION'],
    ['QC & Ready for Delivery', 'READY_FOR_DELIVERY'],
  ];

  for (const [stage, expectedStatus] of stageToStatusPairs) {
    assert(mapStageToOrderStatus(stage) === expectedStatus, `Stage '${stage}' maps to status '${expectedStatus}'`);
  }

  // 3.3 Storage resilience tests
  window.localStorage.clear();

  // Test Case A: Corrupt JSON
  window.localStorage.setItem('yh_orders', '{ corrupt json string... ');
  let syncNoCrashCorrupt = true;
  try {
    syncJobToOrdersStorage({
      id: 'JC-1001',
      orderId: '#YH-1001',
      client: 'Test Client',
      garment: 'Suit',
      karigar: 'Salim',
      samMinutesLogged: 10,
      samTotalEstimate: 120,
      priority: 'Normal',
      dueDate: 'Aug 20',
      progress: 20,
      stage: 'Master Cutting',
    });
  } catch (err) {
    syncNoCrashCorrupt = false;
    console.error('Crash on corrupt JSON:', err);
  }
  assert(syncNoCrashCorrupt, 'syncJobToOrdersStorage does not crash on corrupt JSON in localStorage');

  // Test Case B: Malformed Non-Array Object in Storage (e.g. `{ "invalid": true }`)
  window.localStorage.clear();
  window.localStorage.setItem('yh_orders', JSON.stringify({ invalid: true }));
  let syncNoCrashObject = true;
  try {
    syncJobToOrdersStorage({
      id: 'JC-1002',
      orderId: '#YH-1002',
      client: 'Test Client 2',
      garment: 'Sherwani',
      karigar: 'Latif',
      samMinutesLogged: 15,
      samTotalEstimate: 150,
      priority: 'Normal',
      dueDate: 'Aug 22',
      progress: 20,
      stage: 'Master Cutting',
    });
  } catch (err: any) {
    syncNoCrashObject = false;
    console.error('Captured exception on non-array object in localStorage:', err?.message);
  }
  // Let's document whether it passes or fails
  assert(syncNoCrashObject, 'syncJobToOrdersStorage handles non-array JSON object in localStorage without TypeError crash');

  // Test Case C: Primitive string in localStorage ('"invalid-string"')
  window.localStorage.clear();
  window.localStorage.setItem('yh_orders', '"just a string"');
  let syncNoCrashPrimitive = true;
  try {
    syncJobToOrdersStorage({
      id: 'JC-1003',
      orderId: '#YH-1003',
      client: 'Test Client 3',
      garment: 'Bandhgala',
      karigar: 'Ahmed',
      samMinutesLogged: 5,
      samTotalEstimate: 100,
      priority: 'Normal',
      dueDate: 'Aug 23',
      progress: 10,
      stage: 'Fabric Inspection',
    });
  } catch (err: any) {
    syncNoCrashPrimitive = false;
    console.error('Captured exception on primitive string in localStorage:', err?.message);
  }
  assert(syncNoCrashPrimitive, 'syncJobToOrdersStorage handles primitive string in localStorage without TypeError crash');

  // 3.4 Bidirectional Storage Synchronization Functional Test
  window.localStorage.clear();
  const sampleOrder: Order = {
    id: '#YH-8888',
    clientName: 'Sunita Sharma',
    clientPhone: '+91 9876543210',
    garmentSummary: 'Lehenga Choli',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 45000,
    dueDate: 'Aug 25',
    createdAt: '2026-08-01',
    isUrgent: true,
  };

  // Seed order into storage
  setLocalStorage('yh_orders', [sampleOrder]);

  // Sync order to jobs -> auto spawns job card JC-8888
  syncOrderToJobsStorage(sampleOrder);
  const syncedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(syncedJobs.length === 1, 'syncOrderToJobsStorage auto-spawns 1 job card for CONFIRMED order');
  assert(syncedJobs[0].id === 'JC-8888', 'Spawned job card ID matches JC-8888');
  assert(syncedJobs[0].stage === 'Fabric Inspection', 'CONFIRMED order maps job stage to Fabric Inspection');

  // Now simulate moving job card to Master Cutting
  const updatedJobCard = { ...syncedJobs[0], stage: 'Master Cutting' as KanbanStage };
  syncJobToOrdersStorage(updatedJobCard);

  // Check if order in yh_orders updated to CUTTING
  const updatedOrders = getLocalStorage<Order[]>('yh_orders', []);
  assert(updatedOrders[0].status === 'CUTTING', 'syncJobToOrdersStorage updates order status in yh_orders to CUTTING');


  // ----------------------------------------------------
  // SECTION 4: UI DRAG AND DROP & STAGE MOVEMENT LOGIC
  // ----------------------------------------------------
  console.log('\n[Suite 4: Drag & Drop Stage Progress Consistency Math]');

  const allStages: KanbanStage[] = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery',
  ];

  function calculateStageProgress(stage: KanbanStage): number {
    if (stage === 'QC & Ready for Delivery') {
      return 100;
    }
    const stageIndex = allStages.indexOf(stage);
    return Math.min(100, Math.max(15, (stageIndex + 1) * 20));
  }

  assert(calculateStageProgress('Fabric Inspection') === 20, 'Fabric Inspection stage progress = 20%');
  assert(calculateStageProgress('Master Cutting') === 40, 'Master Cutting stage progress = 40%');
  assert(calculateStageProgress('Zardozi/Aari Embroidery') === 60, 'Zardozi stage progress = 60%');
  assert(calculateStageProgress('Stitching Assembly') === 80, 'Stitching Assembly stage progress = 80%');
  assert(calculateStageProgress('QC & Ready for Delivery') === 100, 'QC & Ready stage progress = 100%');

  console.log('\n========================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  return { passed, failed };
}

if (require.main === module) {
  const result = runAdversarialM3Tests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
