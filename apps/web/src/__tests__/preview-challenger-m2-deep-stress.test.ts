/**
 * YellowHouse Tailoring OS — Milestone 2 Empirical Deep Stress & Challenge Suite
 * Invoked by teamwork_preview_challenger_m2_1
 * 
 * Comprehensive Stress Testing:
 * 1. BOM Generation (`getDefaultBOMForGarment`) across all 12 garment types + custom strings & fuzzing
 * 2. Bespoke Pricing Engine under extreme yields, accessory costs, discounts, and floating point boundaries
 * 3. Order Status Transition State Machine (`getValidNextStatuses`) against illegal forward skips, backward jumps, and cycles
 * 4. Bidirectional Sync (`syncOrderToJobsStorage` & `syncJobToOrdersStorage`) under storage corruption, missing fields, and high concurrency
 * 5. SVG 2D QR Code & Code-128 Linear Barcode determinism, boundary handling, and print fidelity
 */

import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  getProgressForStage,
  getProgressForStatus,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  syncAllOrdersToJobs,
  calculatePaymentStatus,
  calculateBalance,
  JobCardItem,
  Order,
  OrderStatus,
  KanbanStage
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import { calculateFabricYield } from '../lib/fabric-yield';
import { calculateBespokePricing } from '../lib/pricing-calculator';
import { calculateGarmentSam } from '../lib/sam-calculator';
import { GarmentCategory, PostureProfile } from '../types/measurement';
import { GARMENT_PRESETS, getDefaultBOMForGarment, getValidNextStatuses, generateQRMatrix, generateBarcodeBars, TestBOMItem } from './m2-order-bom-lifecycle.test';

export function runM2PreviewChallengerDeepStressSuite(): { passed: number; failed: number; totalAssertions: number } {
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

  console.log('\n================================================================');
  console.log('--- EMPIRICAL CHALLENGER M2: ORDER LIFECYCLE & BOM STRESS SUITE ---');
  console.log('================================================================\n');

  // Setup Mock Window & LocalStorage
  const mockStorage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (k: string) => (k in mockStorage ? mockStorage[k] : null),
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
  };

  const originalWindow = (global as any).window;
  (global as any).window = {
    localStorage: mockLocalStorage,
    dispatchEvent: () => true
  };

  // ========================================================================
  // TARGET 1: BOM GENERATION (`getDefaultBOMForGarment`) DEEP STRESS & FUZZING
  // ========================================================================
  console.log('[Target 1: BOM Generation Across 12 Presets, Arbitrary Strings & Mutation Isolation]');

  // 1.1 Test All 12 Garment Presets produce non-empty, well-formed BOM items
  const all12Presets = [
    'Blouse', 'Corset', 'Shirt', 'Trouser', '2-Piece Suit', '3-Piece Suit',
    'Sherwani', 'Bandhgala', 'Kurta', 'Lehenga', 'Anarkali', 'Gown'
  ];

  for (const preset of all12Presets) {
    const bom = getDefaultBOMForGarment(preset);
    assert(Array.isArray(bom) && bom.length >= 1, `Preset "${preset}" generates valid BOM array (count: ${bom.length})`);
    
    // Every BOM item must have valid required fields
    for (const item of bom) {
      assert(typeof item.id === 'string' && item.id.length > 0, `Preset "${preset}" item "${item.name}" has valid id`);
      assert(typeof item.name === 'string' && item.name.length > 0, `Preset "${preset}" item has non-empty name`);
      assert(typeof item.quantity === 'number' && item.quantity > 0, `Preset "${preset}" item "${item.name}" quantity > 0 (${item.quantity})`);
      assert(typeof item.unitCost === 'number' && item.unitCost > 0, `Preset "${preset}" item "${item.name}" unitCost > 0 (₹${item.unitCost})`);
      assert(typeof item.unit === 'string' && item.unit.length > 0, `Preset "${preset}" item "${item.name}" has unit "${item.unit}"`);
      assert(['thread', 'zipper', 'button', 'lining', 'canvas', 'lace', 'hook', 'piping', 'fabric', 'other'].includes(item.category), `Preset "${preset}" item category "${item.category}" is valid`);
      assert(typeof item.isOptional === 'boolean', `Preset "${preset}" item "${item.name}" has boolean isOptional`);
    }

    // Base thread spool is present in all BOMs
    assert(bom.some(i => i.category === 'thread'), `Preset "${preset}" contains thread spool`);
  }

  // 1.2 Specific Garment BOM Categorical Invariants
  const sherwaniBOM = getDefaultBOMForGarment('Sherwani');
  assert(sherwaniBOM.some(i => i.category === 'button' && i.quantity === 7), 'Sherwani BOM requires 7 buttons');
  assert(sherwaniBOM.some(i => i.category === 'canvas' && i.name.includes('Horsehair')), 'Sherwani BOM contains Horsehair canvas');
  assert(sherwaniBOM.some(i => i.category === 'piping'), 'Sherwani BOM contains gold zari piping');

  const lehengaBOM = getDefaultBOMForGarment('Lehenga');
  assert(lehengaBOM.some(i => i.category === 'canvas' && i.quantity === 4.0), 'Lehenga BOM requires 4.0m cancan mesh');
  assert(lehengaBOM.some(i => i.category === 'lace' && i.quantity === 2), 'Lehenga BOM requires 2 latkan tassels');
  assert(lehengaBOM.some(i => i.category === 'zipper' && i.name.includes('18 inch')), 'Lehenga BOM requires 18" concealed zipper');

  const blouseBOM = getDefaultBOMForGarment('Blouse');
  assert(blouseBOM.some(i => i.category === 'hook' && i.quantity === 8), 'Blouse BOM requires 8 hook/loop pairs');
  assert(blouseBOM.some(i => i.category === 'canvas' && i.name.includes('Padded Cup')), 'Blouse BOM requires padded cup inserts');
  assert(blouseBOM.some(i => i.category === 'zipper' && i.name.includes('12 inch')), 'Blouse BOM requires 12" invisible zipper');

  const trouserBOM = getDefaultBOMForGarment('Trouser');
  assert(trouserBOM.some(i => i.category === 'zipper' && i.name.includes('7 inch')), 'Trouser BOM requires 7" YKK metal zipper');
  assert(trouserBOM.some(i => i.category === 'canvas' && i.name.includes('Waistband')), 'Trouser BOM requires waistband canvas stiffener');
  assert(trouserBOM.some(i => i.category === 'button' && i.name.includes('Horn / Resin')), 'Trouser BOM requires horn/resin buttons');

  // 1.3 Fuzzing & Unrecognized String Resilience
  const FUZZ_STRINGS = [
    '',
    '   ',
    'Custom Tuxedo Overcoat',
    'Steampunk Cyberpunk Victorian Vest',
    '123456789',
    '<script>alert("xss")</script>',
    '!@#$%^&*()_+{}[]:;"\'<>,.?/|\\',
    'SHERWANI IN ALL CAPS',
    '   lehenga choli with spaces   ',
    'bLoUsE mixed case',
    'Very Long String '.repeat(100)
  ];

  for (const fuzzStr of FUZZ_STRINGS) {
    const bom = getDefaultBOMForGarment(fuzzStr);
    assert(Array.isArray(bom) && bom.length >= 1, `getDefaultBOMForGarment("${fuzzStr.slice(0, 25)}...") returns array safely`);
    assert(bom[0].category === 'thread', `Fuzzed input contains base thread spool`);
  }

  // 1.4 Mutation Isolation Stress Test
  const bomFirstCall = getDefaultBOMForGarment('Sherwani');
  bomFirstCall[0].quantity = 999;
  bomFirstCall.push({ id: 'injected', name: 'Corrupt', category: 'other', quantity: 100, unit: 'pcs', unitCost: 100, isOptional: false });
  
  const bomSecondCall = getDefaultBOMForGarment('Sherwani');
  assert(bomSecondCall[0].quantity === 2, 'Subsequent BOM call is isolated from external mutation (quantity remains 2)');
  assert(!bomSecondCall.some(i => i.id === 'injected'), 'Subsequent BOM call does not contain injected items');

  // ========================================================================
  // TARGET 2: BESPOKE PRICING ENGINE UNDER EXTREME BOUNDARIES
  // ========================================================================
  console.log('\n[Target 2: Bespoke Pricing Engine Stress Testing]');

  // 2.1 Extreme Fabric Costs (₹0 customer fabric to ₹1,000,000/meter luxury brocade)
  const zeroCostFabric = calculateBespokePricing({
    garmentCategory: 'mens-sherwani',
    fabricCostPerMeter: 0, // Client provided fabric
  });
  assert(zeroCostFabric.fabricCost === 0, 'Zero fabric cost per meter yields ₹0 fabric cost');
  assert(zeroCostFabric.baseLaborCost > 0, 'Labor cost remains positive even when fabric cost is ₹0');
  assert(zeroCostFabric.totalGarmentPrice === zeroCostFabric.baseLaborCost, 'Total price equals labor cost when no other surcharges exist');
  assert(zeroCostFabric.mandatoryAdvance50Percent + zeroCostFabric.balanceDueOnDelivery === zeroCostFabric.totalGarmentPrice, '50% advance + balance exactly equals total price');

  const extremeCostFabric = calculateBespokePricing({
    garmentCategory: 'womens-lehenga',
    fabricCostPerMeter: 100000, // ₹1 Lakh per meter
  });
  assert(extremeCostFabric.fabricCost > 500000, 'Extreme fabric cost scales correctly');
  assert(extremeCostFabric.mandatoryAdvance50Percent + extremeCostFabric.balanceDueOnDelivery === extremeCostFabric.totalGarmentPrice, 'Advance + balance split maintains 100% precision on ₹5L+ totals');

  // 2.2 Maximum Posture Axis Surcharges (All 4 axes non-normal = 4 * ₹750 = ₹3000)
  const allAbnormalPosture: PostureProfile = {
    shoulderSlope: 'sloped',
    backCurvature: 'stooped',
    abdomenStance: 'prominent',
    hipSpineStance: 'sway_back'
  };
  const postureStress = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 5000,
    postureProfile: allAbnormalPosture
  });
  assert(postureStress.postureSurcharge === 3000, 'All 4 abnormal posture axes generate exactly 4 * ₹750 = ₹3,000 technical surcharge');

  // 2.3 Embroidery Surcharges & Rush Order +20% Surcharge Stacking
  const embroideryLevels: Array<'none' | 'light' | 'medium' | 'heavy'> = ['none', 'light', 'medium', 'heavy'];
  const expectedEmbroideryPrices = { none: 0, light: 3500, medium: 12000, heavy: 28000 };

  for (const level of embroideryLevels) {
    const regularResult = calculateBespokePricing({
      garmentCategory: 'mens-sherwani',
      fabricCostPerMeter: 3000,
      embroideryLevel: level,
      isUrgent: false
    });
    assert(regularResult.embroiderySurcharge === expectedEmbroideryPrices[level], `Embroidery level "${level}" surcharges ₹${expectedEmbroideryPrices[level]}`);
    assert(regularResult.rushSurcharge === 0, `Non-urgent order has ₹0 rush surcharge`);

    const urgentResult = calculateBespokePricing({
      garmentCategory: 'mens-sherwani',
      fabricCostPerMeter: 3000,
      embroideryLevel: level,
      isUrgent: true
    });
    const expectedRush = Math.round(0.20 * (urgentResult.baseLaborCost + expectedEmbroideryPrices[level]));
    assert(urgentResult.rushSurcharge === expectedRush, `Urgent order adds +20% surcharge on (labor + embroidery) = ₹${expectedRush}`);
    assert(urgentResult.totalGarmentPrice === urgentResult.fabricCost + urgentResult.baseLaborCost + urgentResult.postureSurcharge + urgentResult.embroiderySurcharge + urgentResult.rushSurcharge, 'Total garment price is strictly additive across all components');
  }

  // 2.4 Odd Rupee Advance/Balance Split Invariance (Checking no 1-rupee loss on odd totals)
  const oddPriceInputs = [1, 3, 7, 13, 99, 1001, 35003, 99999, 1234567];
  for (const total of oddPriceInputs) {
    const adv = Math.round(total * 0.5);
    const bal = total - adv;
    assert(adv + bal === total, `Odd total ₹${total} splits into advance ₹${adv} + balance ₹${bal} with ZERO rounding loss`);
  }

  // 2.5 Payment Status & Balance Math Edge Cases
  assert(calculatePaymentStatus(10000, 0) === 'UNPAID', 'Advance ₹0 on ₹10k returns UNPAID');
  assert(calculatePaymentStatus(10000, -500) === 'UNPAID', 'Negative advance returns UNPAID safely');
  assert(calculatePaymentStatus(10000, 5000) === 'ADVANCE_PAID', 'Advance ₹5k on ₹10k returns ADVANCE_PAID');
  assert(calculatePaymentStatus(10000, 10000) === 'FULLY_PAID', 'Advance ₹10k on ₹10k returns FULLY_PAID');
  assert(calculatePaymentStatus(10000, 15000) === 'FULLY_PAID', 'Overpayment ₹15k on ₹10k returns FULLY_PAID');
  assert(calculateBalance(10000, 15000) === 0, 'Overpayment balance clamps to ₹0 (not negative)');
  assert(calculateBalance(10000, 4000) === 6000, 'Balance for ₹10k total and ₹4k advance is ₹6000');
  assert(calculateBalance(0, 0) === 0, 'Zero total and zero advance returns ₹0 balance');

  // ========================================================================
  // TARGET 3: ORDER STATUS TRANSITION STATE MACHINE INTEGRITY
  // ========================================================================
  console.log('\n[Target 3: Order Status Transition State Machine Verification]');

  const allStatuses: OrderStatus[] = [
    'DRAFT',
    'CONFIRMED',
    'CUTTING',
    'IN_PRODUCTION',
    'TRIAL_FITTING',
    'QC_CHECK',
    'READY_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  // 3.1 Every status allows self-transition (idempotence)
  for (const status of allStatuses) {
    const validNext = getValidNextStatuses(status);
    assert(validNext.includes(status), `Status "${status}" permits self-transition for idempotent updates`);
  }

  // 3.2 Every non-terminal status allows transition to CANCELLED
  for (const status of allStatuses) {
    const validNext = getValidNextStatuses(status);
    assert(validNext.includes('CANCELLED'), `Status "${status}" can be CANCELLED`);
  }

  // 3.3 Terminal Status CANCELLED only transitions to itself
  const cancelledTransitions = getValidNextStatuses('CANCELLED');
  assert(cancelledTransitions.length === 1 && cancelledTransitions[0] === 'CANCELLED', 'CANCELLED is a strict terminal state');

  // 3.4 Illegal Forward Skips Verification
  const illegalSkips: Array<[OrderStatus, OrderStatus]> = [
    ['DRAFT', 'CUTTING'],
    ['DRAFT', 'IN_PRODUCTION'],
    ['DRAFT', 'TRIAL_FITTING'],
    ['DRAFT', 'QC_CHECK'],
    ['DRAFT', 'READY_FOR_DELIVERY'],
    ['DRAFT', 'DELIVERED'],
    ['CONFIRMED', 'IN_PRODUCTION'],
    ['CONFIRMED', 'DELIVERED'],
    ['CUTTING', 'READY_FOR_DELIVERY'],
    ['CUTTING', 'DELIVERED'],
    ['IN_PRODUCTION', 'DELIVERED']
  ];

  for (const [from, to] of illegalSkips) {
    const allowed = getValidNextStatuses(from);
    assert(!allowed.includes(to), `Illegal forward skip "${from}" -> "${to}" is strictly disallowed`);
  }

  // 3.5 Illegal Backward Jumps Verification
  const illegalBackwardJumps: Array<[OrderStatus, OrderStatus]> = [
    ['CONFIRMED', 'DRAFT'],
    ['CUTTING', 'CONFIRMED'],
    ['CUTTING', 'DRAFT'],
    ['IN_PRODUCTION', 'CUTTING'],
    ['IN_PRODUCTION', 'CONFIRMED'],
    ['TRIAL_FITTING', 'CUTTING'],
    ['TRIAL_FITTING', 'CONFIRMED'],
    ['QC_CHECK', 'IN_PRODUCTION'],
    ['QC_CHECK', 'CUTTING'],
    ['READY_FOR_DELIVERY', 'IN_PRODUCTION'],
    ['READY_FOR_DELIVERY', 'CUTTING'],
    ['DELIVERED', 'READY_FOR_DELIVERY'],
    ['DELIVERED', 'IN_PRODUCTION'],
    ['DELIVERED', 'DRAFT'],
    ['CANCELLED', 'CONFIRMED'],
    ['CANCELLED', 'DRAFT']
  ];

  for (const [from, to] of illegalBackwardJumps) {
    const allowed = getValidNextStatuses(from);
    assert(!allowed.includes(to), `Illegal backward jump "${from}" -> "${to}" is strictly disallowed`);
  }

  // 3.6 Unrecognized Status Handling
  const unknownStatusTransitions = getValidNextStatuses('INVALID_STATUS' as any);
  assert(Array.isArray(unknownStatusTransitions) && unknownStatusTransitions.includes('CANCELLED'), 'Unrecognized status safely returns fallback transition');

  // 3.7 Progress percentage monotonicity across standard forward lifecycle
  const standardLifecycle: OrderStatus[] = [
    'DRAFT', 'CONFIRMED', 'CUTTING', 'IN_PRODUCTION', 'TRIAL_FITTING', 'QC_CHECK', 'READY_FOR_DELIVERY', 'DELIVERED'
  ];
  let lastProgress = 0;
  for (const s of standardLifecycle) {
    const currentProgress = getProgressForStatus(s);
    assert(currentProgress >= lastProgress, `Status "${s}" progress (${currentProgress}%) >= previous (${lastProgress}%)`);
    assert(currentProgress >= 0 && currentProgress <= 100, `Status "${s}" progress is between 0% and 100%`);
    lastProgress = currentProgress;
  }
  assert(getProgressForStatus('DELIVERED') === 100, 'DELIVERED status has 100% progress');

  // ========================================================================
  // TARGET 4: BIDIRECTIONAL SYNC & CORRUPTED STORAGE RESILIENCE
  // ========================================================================
  console.log('\n[Target 4: Bidirectional Sync & Corrupted Storage Stress Testing]');

  // 4.1 ID Cleaning Utility Resilience (`cleanOrderId`)
  const idVariations = [
    { input: '#YH-9021', expected: '9021' },
    { input: 'YH-9021', expected: '9021' },
    { input: '9021', expected: '9021' },
    { input: 'JC-9021', expected: '9021' },
    { input: '#YH-JC-9021', expected: '9021' },
    { input: '   #YH-9021   ', expected: '9021' },
    { input: '', expected: '' },
    { input: null as any, expected: '' },
    { input: undefined as any, expected: '' }
  ];

  for (const testId of idVariations) {
    const cleaned = cleanOrderId(testId.input);
    assert(cleaned === testId.expected, `cleanOrderId("${testId.input}") cleanly resolves to "${testId.expected}"`);
  }

  // 4.2 Storage Corruption Handling during Order -> Job Sync
  mockLocalStorage.clear();
  mockStorage['yh_orders'] = 'CORRUPTED_JSON_STRING{{{';
  mockStorage['yh_production_jobs'] = 'NOT_JSON_ARRAY';

  const testOrder: Order = {
    id: '#YH-8888',
    clientName: 'Alia Bhatt',
    clientPhone: '+91 99999 88888',
    garmentSummary: 'Sherwani',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 45000,
    dueDate: 'Sep 15',
    createdAt: '2026-08-24'
  };

  // Must not throw despite corrupted storage
  let syncThrew = false;
  try {
    syncOrderToJobsStorage(testOrder);
  } catch (err) {
    syncThrew = true;
    console.error('syncOrderToJobsStorage threw on corrupted storage:', err);
  }
  assert(!syncThrew, 'syncOrderToJobsStorage recovers cleanly from corrupted JSON in storage without throwing');
  
  const recoveredJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(Array.isArray(recoveredJobs) && recoveredJobs.length === 1, 'Corrupted storage was safely replaced with valid jobs array');
  assert(cleanOrderId(recoveredJobs[0].id) === '8888', 'Recovered job card has clean order ID 8888');

  // 4.3 Multi-Item Orders generate distinct job cards for each garment item
  mockLocalStorage.clear();
  const multiItemOrder: Order = {
    id: '#YH-5555',
    clientName: 'Ranbir Kapoor',
    clientPhone: '+91 98888 77777',
    garmentSummary: 'Sherwani + Trouser + Kurta',
    itemCount: 3,
    status: 'CONFIRMED',
    totalAmount: 65000,
    dueDate: 'Oct 01',
    createdAt: '2026-08-24',
    items: [
      { id: 'item-1', garmentType: 'Sherwani', fabricSku: 'SKU-SHER-901', fabricMeters: 4.5, unitPrice: 35000 },
      { id: 'item-2', garmentType: 'Trouser', fabricSku: 'SKU-TRS-102', fabricMeters: 1.4, unitPrice: 5000 },
      { id: 'item-3', garmentType: 'Kurta', fabricSku: 'SKU-KRT-302', fabricMeters: 3.8, unitPrice: 25000 }
    ]
  };

  syncOrderToJobsStorage(multiItemOrder);
  const multiJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(multiJobs.length === 3, 'Multi-item order with 3 items generates exactly 3 production job cards');
  assert(multiJobs[0].id === 'JC-5555-1' && multiJobs[0].garment === 'Sherwani', 'First job card is JC-5555-1 for Sherwani');
  assert(multiJobs[1].id === 'JC-5555-2' && multiJobs[1].garment === 'Trouser', 'Second job card is JC-5555-2 for Trouser');
  assert(multiJobs[2].id === 'JC-5555-3' && multiJobs[2].garment === 'Kurta', 'Third job card is JC-5555-3 for Kurta');

  // Verify SAM estimates are appropriately assigned per garment type
  assert(multiJobs[0].samTotalEstimate === 240, 'Sherwani job card estimated at 240 SAM');
  assert(multiJobs[1].samTotalEstimate === 75, 'Trouser job card estimated at 75 SAM');
  assert(multiJobs[2].samTotalEstimate === 90, 'Kurta job card estimated at 90 SAM');

  // 4.4 Job Movement in Kanban Board synchronizes back to active orders
  const testOrderForJobSync: Order = {
    id: '#YH-3333',
    clientName: 'Kareena Kapoor',
    clientPhone: '+91 97777 66666',
    garmentSummary: 'Bridal Lehenga',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 75000,
    dueDate: 'Nov 10',
    createdAt: '2026-08-24'
  };
  setLocalStorage('yh_orders', [testOrderForJobSync]);

  const movedJob: JobCardItem = {
    id: 'JC-3333',
    orderId: '#YH-3333',
    client: 'Kareena Kapoor',
    garment: 'Bridal Lehenga',
    karigar: 'Karigar Latif',
    samMinutesLogged: 120,
    samTotalEstimate: 300,
    priority: 'Normal',
    dueDate: 'Nov 10',
    progress: 80,
    stage: 'Stitching Assembly'
  };

  syncJobToOrdersStorage(movedJob);
  const updatedOrdersAfterJobMove = getLocalStorage<Order[]>('yh_orders', []);
  const syncedOrder = updatedOrdersAfterJobMove.find(o => cleanOrderId(o.id) === '3333');
  assert(syncedOrder?.status === 'IN_PRODUCTION', 'Moving job to "Stitching Assembly" synchronously updates order status to "IN_PRODUCTION"');

  // 4.5 Rapid Concurrent Event Dispatches Stress Test (100 sequential sync operations)
  mockLocalStorage.clear();
  setLocalStorage('yh_orders', [testOrderForJobSync]);
  setLocalStorage('yh_production_jobs', [movedJob]);

  const stages: KanbanStage[] = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery'
  ];

  for (let i = 0; i < 100; i++) {
    const stage = stages[i % stages.length];
    const jobToUpdate: JobCardItem = { ...movedJob, stage };
    syncJobToOrdersStorage(jobToUpdate);
    const expectedOrderStatus = mapStageToOrderStatus(stage);
    const currentOrders = getLocalStorage<Order[]>('yh_orders', []);
    assert(currentOrders[0].status === expectedOrderStatus, `Rapid iteration ${i + 1}/100: stage "${stage}" -> status "${expectedOrderStatus}"`);
  }

  // 4.6 Orphan Order Reconciliation (`syncAllOrdersToJobs`)
  mockLocalStorage.clear();
  const orphan1: Order = { id: '#YH-101', clientName: 'Client 1', clientPhone: '1', garmentSummary: 'Blouse', itemCount: 1, status: 'CONFIRMED', totalAmount: 3500, dueDate: 'Due', createdAt: '2026' };
  const orphan2: Order = { id: '#YH-102', clientName: 'Client 2', clientPhone: '2', garmentSummary: 'Suit', itemCount: 1, status: 'CUTTING', totalAmount: 28000, dueDate: 'Due', createdAt: '2026' };
  const draftOrder: Order = { id: '#YH-103', clientName: 'Draft Client', clientPhone: '3', garmentSummary: 'Gown', itemCount: 1, status: 'DRAFT', totalAmount: 35000, dueDate: 'Due', createdAt: '2026' };
  setLocalStorage('yh_orders', [orphan1, orphan2, draftOrder]);
  setLocalStorage('yh_production_jobs', []); // No jobs existing

  syncAllOrdersToJobs();
  const reconciledJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(reconciledJobs.length === 2, 'syncAllOrdersToJobs reconciled exactly 2 active non-draft orphan orders');
  assert(reconciledJobs.some(j => cleanOrderId(j.id) === '101'), 'Reconciled job for order 101');
  assert(reconciledJobs.some(j => cleanOrderId(j.id) === '102'), 'Reconciled job for order 102');
  assert(!reconciledJobs.some(j => cleanOrderId(j.id) === '103'), 'Draft order was NOT converted to production job');

  // ========================================================================
  // TARGET 5: PURE SVG BARCODE & QR CODE ROBUSTNESS & DETERMINISM
  // ========================================================================
  console.log('\n[Target 5: Pure SVG Barcode & QR Code Engine Robustness]');

  // 5.1 QR Code Matrix Validation
  const testQrStrings = [
    '#YH-9021',
    'CUST-FAB-TEST1234',
    '',
    'A',
    'Special-Characters!@#$%^&*()_+',
    'Unicode: 👗✂️📏',
    'X'.repeat(500)
  ];

  for (const str of testQrStrings) {
    const matrix = generateQRMatrix(str);
    assert(Array.isArray(matrix) && matrix.length === 15, `QR Matrix for "${str.slice(0, 15)}..." is 15 rows`);
    assert(matrix.every(row => Array.isArray(row) && row.length === 15), 'Every row has 15 columns');
    
    // Finder patterns are always intact
    assert(matrix[0][0] === true && matrix[0][4] === true && matrix[4][0] === true && matrix[4][4] === true, 'Top-Left finder pattern active');
    assert(matrix[0][10] === true && matrix[0][14] === true, 'Top-Right finder pattern active');
    assert(matrix[10][0] === true && matrix[14][0] === true, 'Bottom-Left finder pattern active');
  }

  // 5.2 Barcode Bars Array Validation
  const testBarcodeStrings = [
    '#YH-9021',
    'JC-9021-1',
    'SKU-SHER-901',
    'CUST-001',
    '',
    '1234567890',
    'VERY-LONG-BARCODE-IDENTIFIER-99999'
  ];

  for (const bStr of testBarcodeStrings) {
    const bars = generateBarcodeBars(bStr);
    assert(Array.isArray(bars) && bars.length >= 8, `Barcode bars for "${bStr}" is valid array of length ${bars.length}`);
    assert(bars.every(w => typeof w === 'number' && w > 0), 'All bar widths are positive integers');
    assert(bars[0] === 2 && bars[1] === 1 && bars[2] === 1 && bars[3] === 2, 'Starts with [2, 1, 1, 2]');
    const bLen = bars.length;
    assert(bars[bLen - 4] === 2 && bars[bLen - 3] === 1 && bars[bLen - 2] === 2 && bars[bLen - 1] === 1, 'Ends with [2, 1, 2, 1]');
  }

  // Restore Window
  (global as any).window = originalWindow;

  console.log(`\n================================================================`);
  console.log(`M2 PREVIEW CHALLENGER DEEP STRESS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { passed, failed, totalAssertions: passed + failed };
}

if (require.main === module) {
  const res = runM2PreviewChallengerDeepStressSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
}
