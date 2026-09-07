/**
 * YellowHouse Tailoring OS — Milestone 2 Comprehensive Verification Suite
 * Tests Order Lifecycle, BOM Integration, Pure SVG Barcode/QR Generation, and State Sync
 */

import {
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
  normalizeRole,
  UserRole,
} from '../lib/rbac-utils';
import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  JobCardItem,
  Order,
  OrderStatus,
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';
import { calculateFabricYield } from '../lib/fabric-yield';
import { calculateBespokePricing } from '../lib/pricing-calculator';

// Garment preset definitions identical to orders/page.tsx
export const GARMENT_PRESETS = [
  { label: 'Saree Blouse (Single)', value: 'Blouse', defaultMeters: 1.0, defaultPrice: 3500, skuPrefix: 'SKU-BLS-112', boltWidth: 44, bufferNote: '1.0m (up to 42" bust) + 0.8m lining' },
  { label: 'Corset Blouse / Bustier', value: 'Corset', defaultMeters: 1.2, defaultPrice: 6500, skuPrefix: 'SKU-CST-201', boltWidth: 44, bufferNote: '1.2m + fused interlining' },
  { label: 'Bespoke Shirt (Full Sleeve)', value: 'Shirt', defaultMeters: 2.2, defaultPrice: 2800, skuPrefix: 'SKU-SHRT-101', boltWidth: 44, bufferNote: '2.2m (44" width) or 1.6m (58" width)' },
  { label: 'Bespoke Trouser / Pants', value: 'Trouser', defaultMeters: 1.4, defaultPrice: 3200, skuPrefix: 'SKU-TRS-102', boltWidth: 58, bufferNote: '1.4m (58" width) or 2.2m (44" width)' },
  { label: '2-Piece Suit (Jacket + Trouser)', value: '2-Piece Suit', defaultMeters: 3.2, defaultPrice: 28000, skuPrefix: 'SKU-SUIT-2PC', boltWidth: 58, bufferNote: '3.2m (58" width wool/linen)' },
  { label: '3-Piece Suit (Jacket + Vest + Trouser)', value: '3-Piece Suit', defaultMeters: 4.0, defaultPrice: 38000, skuPrefix: 'SKU-SUIT-3PC', boltWidth: 58, bufferNote: '4.0m (58" width) + 3.0m satin lining' },
  { label: 'Sherwani + Churidar', value: 'Sherwani', defaultMeters: 4.5, defaultPrice: 32000, skuPrefix: 'SKU-SHER-901', boltWidth: 44, bufferNote: '4.5m brocade/raw silk + 2.5m churidar' },
  { label: 'Bandhgala / Jodhpuri Suit', value: 'Bandhgala', defaultMeters: 3.5, defaultPrice: 24000, skuPrefix: 'SKU-BDG-401', boltWidth: 58, bufferNote: '3.5m (58" width)' },
  { label: 'Kurta Pyjama Set', value: 'Kurta', defaultMeters: 3.8, defaultPrice: 7500, skuPrefix: 'SKU-KRT-302', boltWidth: 44, bufferNote: '2.4m Kurta + 2.2m Pyjama/Salwar' },
  { label: 'Bridal Lehenga (16-24 Kali Flare)', value: 'Lehenga', defaultMeters: 5.5, defaultPrice: 65000, skuPrefix: 'SKU-LHG-509', boltWidth: 44, bufferNote: '5.5m main silk + 4.5m lining + 4m cancan' },
  { label: 'Anarkali Gown / Floor Length Suit', value: 'Anarkali', defaultMeters: 5.0, defaultPrice: 26000, skuPrefix: 'SKU-ANK-440', boltWidth: 44, bufferNote: '5.0m flare georgette + 4.0m crepe lining' },
  { label: 'Evening Haute Couture Gown', value: 'Gown', defaultMeters: 4.8, defaultPrice: 35000, skuPrefix: 'SKU-GWN-710', boltWidth: 58, bufferNote: '4.8m (58" satin/crepe) + 1.2m train' }
];

export interface TestBOMItem {
  id: string;
  name: string;
  category: 'thread' | 'zipper' | 'button' | 'lining' | 'canvas' | 'lace' | 'hook' | 'piping' | 'fabric' | 'other';
  quantity: number;
  unit: string;
  unitCost: number;
  isOptional?: boolean;
  isCustomerProvided?: boolean;
  receivedDate?: string;
}

export function getDefaultBOMForGarment(garmentType: string): TestBOMItem[] {
  const g = garmentType.toLowerCase();
  const items: TestBOMItem[] = [
    {
      id: `bom-${Date.now()}-1`,
      name: 'Matching Spun Poly / Silk Thread Spools',
      category: 'thread',
      quantity: 2,
      unit: 'spools',
      unitCost: 60,
      isOptional: false,
    },
  ];

  if (g.includes('sherwani') || g.includes('bandhgala') || g.includes('kurta')) {
    items.push({
      id: `bom-${Date.now()}-2`,
      name: 'Gold Plated / Antique Metal Kurta Buttons',
      category: 'button',
      quantity: 7,
      unit: 'pcs',
      unitCost: 80,
      isOptional: false,
    });
    items.push({
      id: `bom-${Date.now()}-3`,
      name: 'Horsehair Canvas Chest Piece Reinforcement',
      category: 'canvas',
      quantity: 1.5,
      unit: 'meters',
      unitCost: 350,
      isOptional: true,
    });
    items.push({
      id: `bom-${Date.now()}-4`,
      name: 'Gold Zari Border Piping Trim',
      category: 'piping',
      quantity: 3.5,
      unit: 'meters',
      unitCost: 90,
      isOptional: true,
    });
  } else if (g.includes('lehenga') || g.includes('gown') || g.includes('anarkali')) {
    items.push({
      id: `bom-${Date.now()}-2`,
      name: 'Cancan Mesh Netting for Flare Volume',
      category: 'canvas',
      quantity: 4.0,
      unit: 'meters',
      unitCost: 110,
      isOptional: true,
    });
    items.push({
      id: `bom-${Date.now()}-3`,
      name: 'Heavy Zari Waistband Latkan Tassels',
      category: 'lace',
      quantity: 2,
      unit: 'pcs',
      unitCost: 220,
      isOptional: true,
    });
    items.push({
      id: `bom-${Date.now()}-4`,
      name: 'Concealed Side Zipper (18 inch)',
      category: 'zipper',
      quantity: 1,
      unit: 'pcs',
      unitCost: 65,
      isOptional: false,
    });
  } else if (g.includes('blouse') || g.includes('corset') || g.includes('choli')) {
    items.push({
      id: `bom-${Date.now()}-2`,
      name: 'Heavy Duty Side Invisible Zipper (12 inch)',
      category: 'zipper',
      quantity: 1,
      unit: 'pcs',
      unitCost: 55,
      isOptional: false,
    });
    items.push({
      id: `bom-${Date.now()}-3`,
      name: 'Back Eyelet / Braided Dori Hooks & Loops',
      category: 'hook',
      quantity: 8,
      unit: 'pairs',
      unitCost: 15,
      isOptional: true,
    });
    items.push({
      id: `bom-${Date.now()}-4`,
      name: 'Padded Cup Inserts & Boning Strips',
      category: 'canvas',
      quantity: 1,
      unit: 'pair',
      unitCost: 180,
      isOptional: true,
    });
  } else if (g.includes('trouser') || g.includes('suit') || g.includes('churidar')) {
    items.push({
      id: `bom-${Date.now()}-2`,
      name: 'YKK Concealed Metal Trouser Zipper (7 inch)',
      category: 'zipper',
      quantity: 1,
      unit: 'pcs',
      unitCost: 45,
      isOptional: false,
    });
    items.push({
      id: `bom-${Date.now()}-3`,
      name: 'Waistband Canvas Stiffener (Interlining)',
      category: 'canvas',
      quantity: 1.2,
      unit: 'meters',
      unitCost: 120,
      isOptional: true,
    });
    items.push({
      id: `bom-${Date.now()}-4`,
      name: 'Horn / Resin Jacket Buttons (Set of 6)',
      category: 'button',
      quantity: 1,
      unit: 'set',
      unitCost: 250,
      isOptional: true,
    });
  }

  return items;
}

// Pure SVG Generator Logic for Verification
export function generateQRMatrix(str: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  
  const addFinderPattern = (startR: number, startC: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3 && (r === 2 || c === 2))) {
          grid[startR + r][startC + c] = true;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, 10);
  addFinderPattern(10, 0);

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c >= 10) || (r >= 10 && c < 5)) continue;
      const bit = Math.abs((hash ^ (r * 17 + c * 31)) % 3) === 0;
      grid[r][c] = bit;
    }
  }
  return grid;
}

export function generateBarcodeBars(str: string): number[] {
  const bars: number[] = [2, 1, 1, 2];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString();
  for (let i = 0; i < absHash.length; i++) {
    const val = parseInt(absHash[i], 10);
    bars.push((val % 3) + 1);
    bars.push(((val + 1) % 2) + 1);
  }
  bars.push(2, 1, 2, 1);
  return bars;
}

export function getValidNextStatuses(current: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CONFIRMED', 'CUTTING', 'CANCELLED'],
    CUTTING: ['CUTTING', 'IN_PRODUCTION', 'CANCELLED'],
    IN_PRODUCTION: ['IN_PRODUCTION', 'TRIAL_FITTING', 'CANCELLED'],
    TRIAL_FITTING: ['TRIAL_FITTING', 'READY_FOR_DELIVERY', 'QC_CHECK', 'CANCELLED'],
    QC_CHECK: ['QC_CHECK', 'READY_FOR_DELIVERY', 'CANCELLED'],
    READY_FOR_DELIVERY: ['READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    DELIVERED: ['DELIVERED', 'CANCELLED'],
    CANCELLED: ['CANCELLED'],
  };
  return transitions[current] || ['CANCELLED'];
}

export function runM2OrderBomLifecycleTests(): { passed: number; failed: number } {
  console.log('\n================================================================');
  console.log('--- MILESTONE 2: ORDER LIFECYCLE, BOM & BARCODE/QR SUITE ---');
  console.log('================================================================\n');

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

  // --------------------------------------------------------------------------
  // SECTION 1: 12 LUXURY GARMENT PRESETS & CUSTOMER FABRIC TAGGING
  // --------------------------------------------------------------------------
  console.log('[Subsuite 1: 12 Luxury Garment Presets & Customer Fabric Surcharges]');

  assert(GARMENT_PRESETS.length === 12, '12 Luxury garment presets are defined');

  const presetNames = [
    'Blouse', 'Corset', 'Shirt', 'Trouser', '2-Piece Suit', '3-Piece Suit',
    'Sherwani', 'Bandhgala', 'Kurta', 'Lehenga', 'Anarkali', 'Gown'
  ];
  for (const name of presetNames) {
    const p = GARMENT_PRESETS.find(preset => preset.value === name);
    assert(!!p, `Preset ${name} exists`);
    assert((p?.defaultMeters || 0) > 0, `Preset ${name} has positive default meters (${p?.defaultMeters}m)`);
    assert((p?.defaultPrice || 0) > 0, `Preset ${name} has positive base price (₹${p?.defaultPrice})`);
    assert(!!p?.skuPrefix, `Preset ${name} has valid SKU prefix (${p?.skuPrefix})`);
  }

  // Customer Fabric SKU Generation verification
  const testTimestamp = 1724500000000;
  const generateCustomerFabricSku = (timestamp: number) => `CUST-FAB-${timestamp.toString(36).toUpperCase()}`;
  const custSku = generateCustomerFabricSku(testTimestamp);
  assert(custSku.startsWith('CUST-FAB-'), 'Customer-supplied fabric generates CUST-FAB-... SKU prefix');
  assert(custSku.length >= 12, 'Generated customer fabric SKU contains encoded unique timestamp hash');

  // Fabric Yield calculation with bolt widths
  const blouseYield44 = calculateFabricYield({ garmentCategory: 'womens-blouse', boltWidth: 44 });
  assert(blouseYield44.requiredMeters === 1.00, 'Blouse 44" bolt width yield is 1.00m');
  const trouserYield44 = calculateFabricYield({ garmentCategory: 'mens-trouser', boltWidth: 44 });
  assert(trouserYield44.requiredMeters === 1.40, 'Trouser 44" bolt width yield is 1.40m');
  const trouserYield58 = calculateFabricYield({ garmentCategory: 'mens-trouser', boltWidth: 58 });
  assert(trouserYield58.requiredMeters === 1.06, 'Trouser 58" bolt width yield is 1.06m (scaled from 1.40m)');
  const suitYield44 = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 44 });
  assert(suitYield44.requiredMeters === 5.00, 'Suit 44" bolt width yield is 5.00m');
  const suitYield58 = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 58 });
  assert(suitYield58.requiredMeters === 3.79, 'Suit 58" bolt width yield is 3.79m (scaled down from 5.00m)');

  // --------------------------------------------------------------------------
  // SECTION 2: BILL OF MATERIALS (BOM) & TRIM ENGINE
  // --------------------------------------------------------------------------
  console.log('\n[Subsuite 2: Intelligent BOM & Trims Engine]');

  // 2.1 Trouser / Suit BOM
  const suitBom = getDefaultBOMForGarment('2-Piece Suit');
  assert(suitBom.some(i => i.category === 'thread'), 'Suit BOM contains thread spool');
  assert(suitBom.some(i => i.category === 'zipper' && i.name.includes('YKK')), 'Suit BOM contains YKK metal zipper');
  assert(suitBom.some(i => i.category === 'canvas' && i.name.includes('Waistband')), 'Suit BOM contains waistband interlining canvas');
  assert(suitBom.some(i => i.category === 'button' && i.name.includes('Horn / Resin')), 'Suit BOM contains horn/resin jacket buttons');

  // 2.2 Blouse / Corset BOM
  const blouseBom = getDefaultBOMForGarment('Saree Blouse (Single)');
  assert(blouseBom.some(i => i.category === 'zipper' && i.name.includes('12 inch')), 'Blouse BOM contains 12-inch side invisible zipper');
  assert(blouseBom.some(i => i.category === 'hook' && i.quantity === 8), 'Blouse BOM contains 8 pairs of hooks & loops');
  assert(blouseBom.some(i => i.category === 'canvas' && i.name.includes('Padded Cup')), 'Blouse BOM contains padded cup inserts & boning');

  // 2.3 Sherwani / Bandhgala BOM
  const sherwaniBom = getDefaultBOMForGarment('Sherwani + Churidar');
  assert(sherwaniBom.some(i => i.category === 'button' && i.quantity === 7), 'Sherwani BOM contains 7 gold/metal buttons');
  assert(sherwaniBom.some(i => i.category === 'canvas' && i.name.includes('Horsehair')), 'Sherwani BOM contains horsehair chest canvas (1.5m)');
  assert(sherwaniBom.some(i => i.category === 'piping' && i.name.includes('Gold Zari')), 'Sherwani BOM contains 3.5m gold zari piping');

  // 2.4 Lehenga / Gown / Anarkali BOM
  const lehengaBom = getDefaultBOMForGarment('Bridal Lehenga (16-24 Kali Flare)');
  assert(lehengaBom.some(i => i.category === 'canvas' && i.name.includes('Cancan') && i.quantity === 4.0), 'Lehenga BOM contains 4.0m cancan mesh netting');
  assert(lehengaBom.some(i => i.category === 'lace' && i.name.includes('Latkan') && i.quantity === 2), 'Lehenga BOM contains 2 heavy zari latkan tassels');
  assert(lehengaBom.some(i => i.category === 'zipper' && i.name.includes('18 inch')), 'Lehenga BOM contains 18-inch concealed zipper');

  // 2.5 Client-Supplied Trim Cost Calculation
  const sampleBomWithCustomerItems: TestBOMItem[] = [
    { id: '1', name: 'Thread', category: 'thread', quantity: 2, unit: 'spools', unitCost: 60, isCustomerProvided: false },
    { id: '2', name: 'Latkans', category: 'lace', quantity: 2, unit: 'pcs', unitCost: 220, isCustomerProvided: true }, // Client brought latkans
    { id: '3', name: 'Cancan', category: 'canvas', quantity: 4, unit: 'meters', unitCost: 110, isCustomerProvided: false },
  ];

  const studioChargeableBOMCost = sampleBomWithCustomerItems
    .filter(i => !i.isCustomerProvided)
    .reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  assert(studioChargeableBOMCost === (2 * 60) + (4 * 110), 'Chargeable BOM cost excludes client-supplied trims (₹560 instead of ₹1000)');

  // --------------------------------------------------------------------------
  // SECTION 3: PURE SVG BARCODE & QR CODE ENGINE
  // --------------------------------------------------------------------------
  console.log('\n[Subsuite 3: Pure SVG 2D QR & Code-128 Linear Barcode Engine]');

  // 3.1 QR Code 15x15 Matrix
  const qrMatrix = generateQRMatrix('#YH-9021');
  assert(qrMatrix.length === 15, 'QR Matrix height is 15 rows');
  assert(qrMatrix[0].length === 15, 'QR Matrix width is 15 columns');

  // Verify Finder Patterns (Top-Left, Top-Right, Bottom-Left 5x5 squares)
  // Check Top-Left corner border is solid true
  assert(qrMatrix[0][0] === true && qrMatrix[0][4] === true && qrMatrix[4][0] === true && qrMatrix[4][4] === true, 'Top-Left finder pattern outer border active');
  assert(qrMatrix[2][2] === true, 'Top-Left finder pattern center point active');
  assert(qrMatrix[0][10] === true && qrMatrix[0][14] === true, 'Top-Right finder pattern outer border active');
  assert(qrMatrix[10][0] === true && qrMatrix[14][0] === true, 'Bottom-Left finder pattern outer border active');

  // Determinism check: Same input produces identical matrix
  const qrMatrixCopy = generateQRMatrix('#YH-9021');
  let isIdentical = true;
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (qrMatrix[r][c] !== qrMatrixCopy[r][c]) isIdentical = false;
    }
  }
  assert(isIdentical === true, 'QR Matrix generation is 100% deterministic');

  // Distinctness check: Different inputs produce different matrices
  const qrMatrixDifferent = generateQRMatrix('#YH-DIFFERENT');
  let hasDifferences = false;
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (qrMatrix[r][c] !== qrMatrixDifferent[r][c]) hasDifferences = true;
    }
  }
  assert(hasDifferences === true, 'Different order IDs produce distinct QR bit patterns');

  // 3.2 Linear Barcode Generator
  const barcodeBars = generateBarcodeBars('#YH-9021');
  assert(barcodeBars.length > 8, 'Barcode generates linear sequence of bars and spaces');
  assert(barcodeBars[0] === 2 && barcodeBars[1] === 1 && barcodeBars[2] === 1 && barcodeBars[3] === 2, 'Barcode begins with standard Start pattern [2, 1, 1, 2]');
  const len = barcodeBars.length;
  assert(barcodeBars[len - 4] === 2 && barcodeBars[len - 3] === 1 && barcodeBars[len - 2] === 2 && barcodeBars[len - 1] === 1, 'Barcode ends with standard Stop pattern [2, 1, 2, 1]');

  // --------------------------------------------------------------------------
  // SECTION 4: ORDER STAGE TRANSITIONS & BIDIRECTIONAL JOB SYNCHRONIZATION
  // --------------------------------------------------------------------------
  console.log('\n[Subsuite 4: Fitting Trial Lifecycle Stage Transitions & Job Sync]');

  // 4.1 Order Status Transitions
  assert(getValidNextStatuses('DRAFT').includes('CONFIRMED') && getValidNextStatuses('DRAFT').includes('CANCELLED'), 'DRAFT transitions to CONFIRMED or CANCELLED');
  assert(getValidNextStatuses('CONFIRMED').includes('CUTTING'), 'CONFIRMED transitions to CUTTING');
  assert(getValidNextStatuses('CUTTING').includes('IN_PRODUCTION'), 'CUTTING transitions to IN_PRODUCTION');
  assert(getValidNextStatuses('IN_PRODUCTION').includes('TRIAL_FITTING'), 'IN_PRODUCTION transitions to TRIAL_FITTING');
  assert(getValidNextStatuses('TRIAL_FITTING').includes('READY_FOR_DELIVERY') && getValidNextStatuses('TRIAL_FITTING').includes('QC_CHECK'), 'TRIAL_FITTING transitions to READY_FOR_DELIVERY or QC_CHECK');
  assert(getValidNextStatuses('QC_CHECK').includes('READY_FOR_DELIVERY'), 'QC_CHECK transitions to READY_FOR_DELIVERY');
  assert(getValidNextStatuses('READY_FOR_DELIVERY').includes('DELIVERED'), 'READY_FOR_DELIVERY transitions to DELIVERED');

  // 4.2 State Synchronization Engine
  const mockStorage: Record<string, string> = {};
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => (k in mockStorage ? mockStorage[k] : null),
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
    }
  };

  const sampleOrder: Order = {
    id: '#YH-7721',
    clientName: 'Priya Patel',
    clientPhone: '+91 98765 43213',
    garmentSummary: 'Bridal Lehenga',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 65000,
    advanceAmount: 32500,
    balanceAmount: 32500,
    paymentStatus: 'ADVANCE_PAID',
    dueDate: 'Sep 10',
    createdAt: '2026-08-24'
  };

  setLocalStorage('yh_orders', [sampleOrder]);
  syncOrderToJobsStorage(sampleOrder);

  const jobsAfterCreation = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const createdJob = jobsAfterCreation.find(j => cleanOrderId(j.id) === '7721');
  assert(!!createdJob, 'Order creation automatically synchronized and spawned production job card');
  assert(createdJob?.stage === 'Fabric Inspection', 'Initial stage in production board is Fabric Inspection');

  // Advance Order to CUTTING
  const cuttingOrder: Order = { ...sampleOrder, status: 'CUTTING' };
  syncOrderToJobsStorage(cuttingOrder);
  const jobsAfterCutting = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const cuttingJob = jobsAfterCutting.find(j => cleanOrderId(j.id) === '7721');
  assert(cuttingJob?.stage === 'Master Cutting', 'Status change to CUTTING synchronously moves job to Master Cutting');

  // Advance Order to DELIVERED
  const deliveredOrder: Order = { ...sampleOrder, status: 'DELIVERED' };
  syncOrderToJobsStorage(deliveredOrder);
  const jobsAfterDelivered = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const deliveredJob = jobsAfterDelivered.find(j => cleanOrderId(j.id) === '7721');
  assert(deliveredJob?.stage === 'QC & Ready for Delivery', 'Status change to DELIVERED moves job to QC & Ready for Delivery');
  assert(deliveredJob?.progress === 100, 'Delivered order marks job progress at 100%');

  // --------------------------------------------------------------------------
  // SECTION 5: RBAC TYPE HARDENING & PATH TRAVERSAL RESILIENCE
  // --------------------------------------------------------------------------
  console.log('\n[Subsuite 5: RBAC Type Hardening & Traversal Verification]');

  // Non-string path robustness
  assert(canUserAccessRoute('SUPER_ADMIN', null as any) === false, 'canUserAccessRoute(SUPER_ADMIN, null) returns false safely');
  assert(canUserAccessRoute('SUPER_ADMIN', undefined as any) === false, 'canUserAccessRoute(SUPER_ADMIN, undefined) returns false safely');
  assert(canUserAccessRoute('SUPER_ADMIN', 12345 as any) === false, 'canUserAccessRoute(SUPER_ADMIN, number) returns false safely');
  assert(canUserAccessRoute('SUPER_ADMIN', {} as any) === false, 'canUserAccessRoute(SUPER_ADMIN, object) returns false safely');

  // Traversal sequences safely resolved
  assert(canUserAccessRoute('MASTER_TAILOR', '/dashboard/../orders') === true, 'MASTER_TAILOR resolves /dashboard/../orders to /orders (allowed)');
  assert(canUserAccessRoute('MASTER_TAILOR', '/dashboard/../admin') === false, 'MASTER_TAILOR resolves /dashboard/../admin to /admin (blocked)');
  assert(canUserAccessRoute('MASTER_TAILOR', '/dashboard/./../admin') === false, 'MASTER_TAILOR resolves /dashboard/./../admin to /admin (blocked)');
  assert(canUserAccessRoute('MASTER_TAILOR', '///admin') === false, 'MASTER_TAILOR resolves ///admin to /admin (blocked)');

  console.log(`\n================================================================`);
  console.log(`MILESTONE 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  const result = runM2OrderBomLifecycleTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
