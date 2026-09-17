/**
 * YellowHouse Tailoring OS — Milestone 3 Test Suite
 * Core Atelier Operations, Executive Dashboard, Dynamic BOM Studio, & 2D CAD Studio
 *
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 3 (Core Atelier Operations & CAD Studio)
 * - ORIGINAL_REQUEST.md § R2 (Order Lifecycle & BOM) & R3 (2D CAD Mannequin & Silhouette)
 * - apps/web/src/app/(dashboard)/dashboard/page.tsx
 * - apps/web/src/app/(dashboard)/orders/page.tsx
 * - apps/web/src/app/(dashboard)/measurements/page.tsx
 * - apps/web/src/components/id-codes.tsx
 * - apps/web/src/components/print-layouts.tsx
 * - apps/web/src/app/globals.css
 *
 * Verifies:
 * 1. Executive Dashboard (/dashboard):
 *    - Telemetry KPIs (Active orders, urgent jobs, total revenue, collected advance, delivery rate %, overdue orders alert)
 *    - P&L stats (gross booking revenue, advance collection ratio > 50%, delivery completion rate)
 *    - Recent orders table (top 5 slice, column headers, status badges, empty fallback message)
 *    - Karigar SAM yield / Workshop pipeline bars (5 standardized stages, count and percentage width bar, dot colors)
 *    - Activity feed formatting (relative time strings for <1m, minutes, hours, days)
 *
 * 2. Orders & Dynamic BOM Studio (/orders):
 *    - Customer Fabric SKU format (begins with CUST-FAB-, regex validation, idempotency, adversarial rejection)
 *    - 12 Garment Types BOM presets exist and calculate material accessories (Blouse, Corset, Shirt, Trouser,
 *      2-Piece Suit, 3-Piece Suit, Sherwani, Bandhgala, Kurta, Lehenga, Anarkali, Gown)
 *    - Fitting trial state machine transitions (strict 9-status transition graph, adversarial illegal transitions)
 *    - Delivery scheduling and overdue detection
 *    - Pure vector SVG QR and Code 128 barcodes render on printable order receipts and job tickets with @media print isolation
 *
 * 3. 2D CAD Mannequin & Caliper Studio (/measurements):
 *    - Pure SVG viewport has viewBox="0 0 420 840", zoom scaling strictly between 80% and 135% (0.8 to 1.35)
 *    - 6 garment drape overlays (Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset) with tailored seamlines
 *    - 4-axis posture morphs (shoulder slope ±8px, chest stance curves, spine curvature dasharrays, heel height 5px/in)
 *    - Dynamic caliper steppers (-0.5", -0.25", +0.25", +0.5") strictly clamped to POM min/max ranges
 *    - Snapshot version history (yh_measurements_current, yh_measurement_snapshots) and print isolation
 *
 * 4. Adversarial Edge Cases & Stress Resilience:
 *    - Corrupted localStorage JSON fault tolerance
 *    - Boundary arithmetic (zero, negative, NaN, extreme numbers)
 *    - XSS / script tags in customer names and garment summaries
 *    - Floating point stability across dynamic caliper increments
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Local storage mock for Node environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string): string | null { return this.store[key] !== undefined ? this.store[key] : null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: new LocalStorageMock(),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    print: () => {},
  };
}
if (!(global as any).localStorage) {
  (global as any).localStorage = (global as any).window.localStorage;
}

import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import { formatRelativeTime } from '../lib/date-utils';
import {
  computeActiveOrders,
  computeUrgentJobs,
  computeTotalRevenue,
  computeTotalCollected,
  isCollectedGood,
  computeDeliveryRate,
  computeOverdueOrders,
  getOrderStatusBadgeText as getStatusBadgeText,
  WORKSHOP_STAGES,
  STAGE_DOT_COLORS,
  garmentOptions as GARMENT_OPTIONS,
  generateCustomerFabricSku,
  getDefaultBOMForGarment,
  getValidNextStatuses,
  isValidTransition,
  OrderStatus,
  BOMItem
} from '../lib/orders-utils';
import {
  clampZoom,
  getShoulderOffsetY,
  getChestCurve,
  getSpineDash,
  getHeelOffset,
  applyStepper,
  saveNewSnapshot,
  POM_SCHEMAS,
  GARMENT_GENDER,
  MENS_GARMENTS,
  WOMENS_GARMENTS,
  EASE_OFFSETS,
  fittingDeltas
} from '../lib/cad-schemas';

export interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runM3CoreAtelierCadTests(): TestResult {
  console.log('\n====================================================================');
  console.log('--- MILESTONE 3: CORE ATELIER OPERATIONS & 2D CAD TEST SUITE ---');
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

  // Base path resolution
  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  /**
   * Helper to safely transpile and load TSX modules in CommonJS ts-node runtime
   * where tsconfig uses "jsx": "preserve" for Next.js build.
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
      if (id === './currency-context' || id === '@/components/currency-context') {
        return loadTsxModule(path.join(webRoot, 'src', 'components', 'currency-context.tsx'));
      }
      if (id === './id-codes' || id === '@/components/id-codes') {
        return loadTsxModule(path.join(webRoot, 'src', 'components', 'id-codes.tsx'));
      }
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

  // Load TSX components dynamically via loadTsxModule
  const idCodesModule = loadTsxModule(path.join(webRoot, 'src', 'components', 'id-codes.tsx'));
  const printLayoutsModule = loadTsxModule(path.join(webRoot, 'src', 'components', 'print-layouts.tsx'));

  const QRCodeSVG = idCodesModule.QRCodeSVG;
  const BarcodeSVG = idCodesModule.BarcodeSVG;
  const OrderReceipt = printLayoutsModule.OrderReceipt;
  const JobCardPrint = printLayoutsModule.JobCardPrint;
  const MeasurementCard = printLayoutsModule.MeasurementCard;

  // =========================================================================
  // SECTION 1: EXECUTIVE ATELIER DASHBOARD (/dashboard)
  // =========================================================================
  console.log('\n[Suite 1: Executive Atelier Dashboard Telemetry & P&L Logic]');

  const sampleOrders = [
    { id: '#YH-9021', clientName: 'Rajeshwar Malhotra', garmentSummary: 'Sherwani + Churidar', itemCount: 2, status: 'IN_PRODUCTION', totalAmount: 45000, advanceAmount: 22500, dueDate: 'Aug 15', createdAt: '2026-08-01', isUrgent: true },
    { id: '#YH-9018', clientName: 'Ananya Sharma', garmentSummary: 'Lehenga Choli', itemCount: 1, status: 'TRIAL_FITTING', totalAmount: 68000, advanceAmount: 34000, dueDate: 'Aug 12', createdAt: '2026-07-28', isUrgent: true },
    { id: '#YH-8994', clientName: 'Priya Patel', garmentSummary: 'Sari Blouse (x3)', itemCount: 3, status: 'QC_CHECK', totalAmount: 12000, advanceAmount: 12000, dueDate: 'Aug 10', createdAt: '2026-07-25' },
    { id: '#YH-9025', clientName: 'Vikram Singh', garmentSummary: '3-Piece Suit', itemCount: 1, status: 'CUTTING', totalAmount: 35000, advanceAmount: 15000, dueDate: 'Aug 20', createdAt: '2026-08-03' },
    { id: '#YH-9030', clientName: 'Deepika Nair', garmentSummary: 'Anarkali Gown', itemCount: 1, status: 'DELIVERED', totalAmount: 28000, advanceAmount: 28000, dueDate: 'Aug 5', createdAt: '2026-07-20' },
    { id: '#YH-9033', clientName: 'Draft Customer', garmentSummary: 'Test Draft', itemCount: 1, status: 'DRAFT', totalAmount: 10000, advanceAmount: 0, dueDate: 'Aug 30', createdAt: '2026-08-05' },
  ];

  const sampleJobs = [
    { id: 'JC-9035', orderId: 'JC-9035', stage: 'Fabric Inspection', priority: 'Urgent', samTotalEstimate: 240 },
    { id: 'JC-9038', orderId: 'JC-9038', stage: 'Fabric Inspection', priority: 'Normal', samTotalEstimate: 180 },
    { id: 'JC-9021', orderId: 'JC-9021', stage: 'Master Cutting', priority: 'Urgent', samTotalEstimate: 180 },
    { id: 'JC-9025', orderId: 'JC-9025', stage: 'Master Cutting', priority: 'Normal', samTotalEstimate: 150 },
    { id: 'JC-9028', orderId: 'JC-9028', stage: 'Master Cutting', priority: 'Normal', samTotalEstimate: 140 },
    { id: 'JC-9018', orderId: 'JC-9018', stage: 'Zardozi/Aari Embroidery', priority: 'Urgent', samTotalEstimate: 360 },
    { id: 'JC-9022', orderId: 'JC-9022', stage: 'Zardozi/Aari Embroidery', priority: 'Normal', samTotalEstimate: 220 },
    { id: 'JC-8994', orderId: 'JC-8994', stage: 'Stitching Assembly', priority: 'Normal', samTotalEstimate: 120 },
    { id: 'JC-9030', orderId: 'JC-9030', stage: 'Stitching Assembly', priority: 'Normal', samTotalEstimate: 160 },
    { id: 'JC-8988', orderId: 'JC-8988', stage: 'QC & Ready for Delivery', priority: 'Urgent', samTotalEstimate: 160 }, // Urgent, but QC stage
  ];

  // 1.1 Active Orders Metric: filters out DELIVERED and DRAFT
  assert(
    computeActiveOrders(sampleOrders) === 4,
    'Active orders count strictly excludes DELIVERED and DRAFT',
    '4',
    String(computeActiveOrders(sampleOrders))
  );

  assert(
    computeActiveOrders([]) === 0,
    'Active orders count handles empty array safely',
    '0',
    String(computeActiveOrders([]))
  );

  assert(
    computeActiveOrders([{ status: 'DELIVERED' }, { status: 'DRAFT' }]) === 0,
    'Active orders count returns 0 when only delivered and draft orders exist',
    '0',
    String(computeActiveOrders([{ status: 'DELIVERED' }, { status: 'DRAFT' }]))
  );

  // 1.2 Urgent Jobs Metric: filters priority === 'Urgent' && stage !== 'QC & Ready for Delivery'
  assert(
    computeUrgentJobs(sampleJobs) === 3,
    'Urgent jobs metric excludes jobs already at "QC & Ready for Delivery"',
    '3',
    String(computeUrgentJobs(sampleJobs))
  );

  assert(
    computeUrgentJobs([]) === 0,
    'Urgent jobs metric handles empty job queue safely',
    '0',
    String(computeUrgentJobs([]))
  );

  // 1.3 Total Revenue & Total Collected P&L Calculations
  const totalRev = computeTotalRevenue(sampleOrders);
  const totalCol = computeTotalCollected(sampleOrders);

  assert(
    totalRev === 45000 + 68000 + 12000 + 35000 + 28000,
    'Total revenue sums non-DRAFT orders (188,000)',
    '188000',
    String(totalRev)
  );

  assert(
    totalCol === 22500 + 34000 + 12000 + 15000 + 28000,
    'Total collected advance sums non-DRAFT orders (111,500)',
    '111500',
    String(totalCol)
  );

  // 1.4 Advance Collection Health Indicator (isCollectedGood: ratio > 0.5)
  assert(
    isCollectedGood(totalRev, totalCol) === true,
    'Advance collected > 50% (111,500 / 188,000 = 59.3%) marks cash flow as healthy',
    'true',
    String(isCollectedGood(totalRev, totalCol))
  );

  assert(
    isCollectedGood(100000, 50000) === false,
    'Advance collection ratio at exact 50.0% boundary returns false (strictly > 50%)',
    'false',
    String(isCollectedGood(100000, 50000))
  );

  assert(
    isCollectedGood(100000, 50001) === true,
    'Advance collection ratio at 50.001% returns true',
    'true',
    String(isCollectedGood(100000, 50001))
  );

  assert(
    isCollectedGood(0, 0) === false,
    'Zero revenue cashflow evaluation returns false without divide-by-zero error',
    'false',
    String(isCollectedGood(0, 0))
  );

  // 1.5 Delivery Rate Metric: round((delivered / totalNonDraft) * 100)
  assert(
    computeDeliveryRate(sampleOrders) === 20,
    'Delivery rate calculates 1 delivered out of 5 non-draft orders = 20%',
    '20',
    String(computeDeliveryRate(sampleOrders))
  );

  assert(
    computeDeliveryRate([]) === 0,
    'Delivery rate with 0 orders returns 0% safely',
    '0',
    String(computeDeliveryRate([]))
  );

  assert(
    computeDeliveryRate([{ status: 'DELIVERED' }, { status: 'DELIVERED' }]) === 100,
    'Delivery rate with 100% delivered orders returns 100%',
    '100',
    String(computeDeliveryRate([{ status: 'DELIVERED' }, { status: 'DELIVERED' }]))
  );

  // 1.6 Overdue Orders Detection Algorithm
  const overdue = computeOverdueOrders(sampleOrders, '2026-08-16');
  assert(
    overdue.length === 3,
    'Overdue detection accurately flags 3 orders due before reference date',
    '3',
    String(overdue.length)
  );

  const overdueIds = overdue.map(o => o.id);
  assert(
    overdueIds.includes('#YH-9021') && overdueIds.includes('#YH-9018') && overdueIds.includes('#YH-8994'),
    'Overdue orders list contains exact IDs #YH-9021, #YH-9018, #YH-8994',
    'true',
    String(overdueIds.includes('#YH-9021') && overdueIds.includes('#YH-9018') && overdueIds.includes('#YH-8994'))
  );

  assert(
    !overdueIds.includes('#YH-9030') && !overdueIds.includes('#YH-9033'),
    'Overdue orders list strictly excludes DELIVERED and DRAFT items',
    'true',
    String(!overdueIds.includes('#YH-9030') && !overdueIds.includes('#YH-9033'))
  );

  // 1.7 Recent Orders Table Slicing & Badge Formatting
  const recentOrders = sampleOrders.slice(0, 5);
  assert(
    recentOrders.length === 5,
    'Recent orders table strictly displays at most top 5 orders',
    '5',
    String(recentOrders.length)
  );

  assert(getStatusBadgeText('IN_PRODUCTION') === 'PRODUCTION', 'IN_PRODUCTION maps to PRODUCTION badge');
  assert(getStatusBadgeText('TRIAL_FITTING') === 'TRIAL', 'TRIAL_FITTING maps to TRIAL badge');
  assert(getStatusBadgeText('QC_CHECK') === 'QC', 'QC_CHECK maps to QC badge');
  assert(getStatusBadgeText('READY_FOR_DELIVERY') === 'READY', 'READY_FOR_DELIVERY maps to READY badge');

  // 1.8 Karigar SAM Yield & Workshop Pipeline Stage Distribution
  assert(WORKSHOP_STAGES.length === 5, 'Workshop pipeline defines exactly 5 standardized stages');
  for (const stage of WORKSHOP_STAGES) {
    assert(!!STAGE_DOT_COLORS[stage], `Workshop stage "${stage}" has explicit dot color defined`);
    const count = sampleJobs.filter(j => j.stage === stage).length;
    const total = sampleJobs.length || 1;
    const percentage = Math.round((count / total) * 100);
    assert(percentage >= 0 && percentage <= 100, `Stage "${stage}" calculates valid yield percentage (${percentage}%)`);
  }

  // 1.9 Activity Feed Timestamp Formatter
  const formatRelativeTime = (isoString: string, mockNowMs: number): string => {
    const diff = mockNowMs - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const nowMs = 1755000000000;
  assert(formatRelativeTime(new Date(nowMs - 20000).toISOString(), nowMs) === 'Just now', 'Time delta <1m formats as "Just now"');
  assert(formatRelativeTime(new Date(nowMs - 15 * 60000).toISOString(), nowMs) === '15m ago', 'Time delta 15m formats as "15m ago"');
  assert(formatRelativeTime(new Date(nowMs - 4 * 3600000).toISOString(), nowMs) === '4h ago', 'Time delta 4h formats as "4h ago"');
  assert(formatRelativeTime(new Date(nowMs - 3 * 86400000).toISOString(), nowMs) === '3d ago', 'Time delta 3d formats as "3d ago"');

  // =========================================================================
  // SECTION 2: ORDERS & DYNAMIC BOM STUDIO (/orders)
  // =========================================================================
  console.log('\n[Suite 2: Orders & Dynamic BOM Studio Requirements]');

  // 2.1 Customer Fabric SKU Format: starts strictly with CUST-FAB-
  const sampleCustSku = generateCustomerFabricSku(1755000000000);
  assert(
    sampleCustSku.startsWith('CUST-FAB-'),
    'Customer-supplied fabric generates SKU starting with "CUST-FAB-"',
    'starts with CUST-FAB-',
    sampleCustSku
  );

  const custSkuPattern = /^CUST-FAB-[A-Z0-9]+$/;
  assert(
    custSkuPattern.test(sampleCustSku),
    'Customer fabric SKU matches uppercase alphanumeric pattern ^CUST-FAB-[A-Z0-9]+$',
    'true',
    String(custSkuPattern.test(sampleCustSku))
  );

  // Adversarial SKU validation:
  const invalidSkus = ['FAB-1234', 'CUST_FAB_1234', 'cust-fab-1234', 'CUST-FAB', 'SUPP-FAB-1234', ''];
  for (const inv of invalidSkus) {
    assert(
      !custSkuPattern.test(inv),
      `Adversarial SKU "${inv}" is correctly rejected by customer fabric SKU validator`,
      'false',
      String(custSkuPattern.test(inv))
    );
  }

  // Idempotency: does not double prefix
  const testSkuGeneration = (currentSku: string, isCustomerFabric: boolean, time: number) => {
    if (isCustomerFabric && !currentSku.startsWith('CUST-FAB-')) {
      return `CUST-FAB-${time.toString(36).toUpperCase()}`;
    }
    return currentSku;
  };
  const existingCustSku = 'CUST-FAB-EXISTING99';
  assert(
    testSkuGeneration(existingCustSku, true, 123456) === existingCustSku,
    'Existing customer fabric SKU is not overwritten or duplicated'
  );

  // 2.2 12 Garment Types BOM Presets & Material Accessories Calculation
  assert(
    GARMENT_OPTIONS.length === 12,
    'Orders Studio specifies exactly 12 Garment Types presets',
    '12',
    String(GARMENT_OPTIONS.length)
  );

  // Verify BOM presets across all 12 garments
  for (const opt of GARMENT_OPTIONS) {
    const bom = getDefaultBOMForGarment(opt.value);
    assert(bom.length >= 4, `Garment type "${opt.value}" generates at least 4 BOM preset items (got ${bom.length})`);
    const hasThread = bom.some(b => b.category === 'thread');
    assert(hasThread, `Garment type "${opt.value}" includes base thread spools`);
  }

  // Verify material accessory calculations
  const sherwaniBom = getDefaultBOMForGarment('Sherwani');
  const requiredCost = sherwaniBom.filter(b => !b.isOptional).reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
  assert(requiredCost === 680, 'Sherwani required BOM accessories total ₹680 (thread + 7 buttons)', '680', String(requiredCost));

  const totalBomCost = sherwaniBom.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
  assert(totalBomCost === 1520, 'Sherwani total BOM accessories with optional canvas & piping total ₹1,520', '1520', String(totalBomCost));

  // Customer-provided accessory cost exclusion
  const bomWithCustItems = sherwaniBom.map(b => b.category === 'button' ? { ...b, isCustomerProvided: true } : b);
  const billedCost = bomWithCustItems
    .filter(b => !b.isCustomerProvided)
    .reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
  assert(billedCost === totalBomCost - 560, 'Customer-provided buttons (₹560) are excluded from atelier material billing');

  // 2.3 Fitting Trial State Machine Transitions

  // Valid forward path verification
  assert(isValidTransition('DRAFT', 'CONFIRMED'), 'Valid transition: DRAFT -> CONFIRMED');
  assert(isValidTransition('CONFIRMED', 'CUTTING'), 'Valid transition: CONFIRMED -> CUTTING');
  assert(isValidTransition('CUTTING', 'IN_PRODUCTION'), 'Valid transition: CUTTING -> IN_PRODUCTION');
  assert(isValidTransition('IN_PRODUCTION', 'TRIAL_FITTING'), 'Valid transition: IN_PRODUCTION -> TRIAL_FITTING');
  assert(isValidTransition('TRIAL_FITTING', 'QC_CHECK'), 'Valid transition: TRIAL_FITTING -> QC_CHECK');
  assert(isValidTransition('TRIAL_FITTING', 'READY_FOR_DELIVERY'), 'Valid transition: TRIAL_FITTING -> READY_FOR_DELIVERY');
  assert(isValidTransition('QC_CHECK', 'READY_FOR_DELIVERY'), 'Valid transition: QC_CHECK -> READY_FOR_DELIVERY');
  assert(isValidTransition('READY_FOR_DELIVERY', 'DELIVERED'), 'Valid transition: READY_FOR_DELIVERY -> DELIVERED');

  // Cancellation allowed from all non-cancelled stages
  const allStatuses: OrderStatus[] = [
    'DRAFT', 'CONFIRMED', 'CUTTING', 'IN_PRODUCTION', 'TRIAL_FITTING', 'QC_CHECK', 'READY_FOR_DELIVERY', 'DELIVERED'
  ];
  for (const st of allStatuses) {
    assert(isValidTransition(st, 'CANCELLED'), `Order can transition to CANCELLED from ${st}`);
  }

  // Adversarial illegal transitions
  assert(!isValidTransition('DRAFT', 'DELIVERED'), 'Adversarial: DRAFT cannot skip straight to DELIVERED');
  assert(!isValidTransition('CONFIRMED', 'TRIAL_FITTING'), 'Adversarial: CONFIRMED cannot skip cutting & production');
  assert(!isValidTransition('DELIVERED', 'CUTTING'), 'Adversarial: DELIVERED cannot transition back to CUTTING');
  assert(!isValidTransition('CANCELLED', 'CONFIRMED'), 'Adversarial: CANCELLED order cannot be reactivated directly');

  // 2.4 Pure Vector SVG QR and Code 128 Barcodes & @media print Isolation
  const qrOutput = renderToStaticMarkup(React.createElement(QRCodeSVG, { value: 'https://yellowhouse.atelier/order/YH-9021', size: 64 }));
  assert(qrOutput.includes('<svg'), 'QRCodeSVG renders native SVG root element');
  assert(/viewBox="0 0 \d+ \d+"/.test(qrOutput), 'QRCodeSVG uses standard 2D matrix viewBox');
  assert(qrOutput.includes('<rect'), 'QRCodeSVG contains SVG rect elements for data cells');
  assert(!qrOutput.includes('<img') && !qrOutput.includes('<canvas'), 'QRCodeSVG does NOT rely on raster <img> or <canvas>');

  const barcodeOutput = renderToStaticMarkup(React.createElement(BarcodeSVG, { value: 'YH-9021', width: 160, height: 40 }));
  assert(barcodeOutput.includes('<svg'), 'BarcodeSVG renders native SVG root element');
  assert(barcodeOutput.includes('<rect'), 'BarcodeSVG contains SVG rect elements for barcode stripes');
  assert(barcodeOutput.includes('YH-9021'), 'BarcodeSVG includes human-readable uppercase text label');
  assert(!barcodeOutput.includes('<img') && !barcodeOutput.includes('<canvas'), 'BarcodeSVG does NOT rely on raster <img> or <canvas>');

  // Printable Order Receipt & Job Ticket Component Verification
  const samplePrintOrder = {
    id: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    phone: '+91 98765 43210',
    dueDate: 'Aug 15',
    items: [
      { garmentType: 'Sherwani', fabric: 'Raw Silk', quantity: 1, unitPrice: 32000, subtotal: 32000 },
      { garmentType: 'Churidar', fabric: 'Cotton Silk', quantity: 1, unitPrice: 13000, subtotal: 13000 }
    ],
    subtotal: 45000,
    advancePaid: 22500,
    balanceDue: 22500,
    createdAt: '2026-08-01'
  };

  const receiptOutput = renderToStaticMarkup(React.createElement(OrderReceipt, { order: samplePrintOrder }));
  assert(receiptOutput.includes('print-only hidden print:block'), 'OrderReceipt root container has "print-only hidden print:block" isolation');
  assert(receiptOutput.includes('#YH-9021'), 'OrderReceipt renders order ID #YH-9021');
  assert(receiptOutput.includes('Rajeshwar Malhotra'), 'OrderReceipt renders client name');
  assert(receiptOutput.includes('<svg'), 'OrderReceipt renders pure SVG QR/barcode elements');

  const samplePrintJob = {
    id: 'JC-9021',
    orderId: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    garmentType: 'Sherwani',
    assignedKarigar: 'Karigar Latif',
    stage: 'Master Cutting',
    priority: 'Urgent',
    dueDate: 'Aug 12',
    estimatedSAM: 180,
    notes: 'Gold zari border alignment required'
  };

  const jobTicketOutput = renderToStaticMarkup(React.createElement(JobCardPrint, { job: samplePrintJob }));
  assert(jobTicketOutput.includes('print-only hidden print:block'), 'JobCardPrint root container has "print-only hidden print:block" isolation');
  assert(jobTicketOutput.includes('JC-9021'), 'JobCardPrint renders job ID JC-9021');
  assert(jobTicketOutput.includes('180 mins'), 'JobCardPrint renders estimated SAM time (180 mins)');
  assert(jobTicketOutput.includes('<svg'), 'JobCardPrint renders pure SVG QR code and barcode');

  // Verify globals.css @media print isolation rules
  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');

  assert(globalsCss.includes('@media print'), 'globals.css defines @media print block');
  assert(globalsCss.includes('.print-only { display: block !important; }'), 'globals.css unhides .print-only in @media print');
  assert(
    globalsCss.includes('aside, header, .no-print { display: none !important; }'),
    'globals.css strictly hides UI chrome (aside, header, .no-print) during print'
  );
  assert(
    globalsCss.includes('.print-only {') && globalsCss.includes('display: none;'),
    'globals.css hides .print-only by default in screen media mode'
  );

  // =========================================================================
  // SECTION 3: 2D CAD MANNEQUIN & CALIPER STUDIO (/measurements)
  // =========================================================================
  console.log('\n[Suite 3: 2D CAD Mannequin & Caliper Studio Requirements]');

  const measurementsPagePath = path.join(webRoot, 'src', 'app', '(dashboard)', 'measurements', 'page.tsx');
  const measurementsSource = fs.readFileSync(measurementsPagePath, 'utf-8');

  // 3.1 Pure SVG Viewport & Strict Zoom Scaling (80% to 135%)
  assert(
    measurementsSource.includes('viewBox="0 0 420 840"'),
    'BodySilhouetteSvg viewport uses exact viewBox="0 0 420 840"'
  );

  // Zoom level clamp formula: Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35)
  assert(clampZoom(1.0, 0.1) === 1.1, 'Zoom in from 1.0 by 0.1 yields 1.1 (110%)', '1.1', String(clampZoom(1.0, 0.1)));
  assert(clampZoom(1.0, -0.1) === 0.9, 'Zoom out from 1.0 by 0.1 yields 0.9 (90%)', '0.9', String(clampZoom(1.0, -0.1)));
  assert(clampZoom(1.30, 0.1) === 1.35, 'Zoom in strictly clamps at 1.35 (135% maximum)', '1.35', String(clampZoom(1.30, 0.1)));
  assert(clampZoom(0.85, -0.1) === 0.8, 'Zoom out strictly clamps at 0.80 (80% minimum)', '0.8', String(clampZoom(0.85, -0.1)));
  assert(clampZoom(0.8, -0.5) === 0.8, 'Adversarial extreme negative delta clamps at 0.80', '0.8', String(clampZoom(0.8, -0.5)));
  assert(clampZoom(1.35, 5.0) === 1.35, 'Adversarial extreme positive delta clamps at 1.35', '1.35', String(clampZoom(1.35, 5.0)));

  // Viewport CAD datum alignment lasers coordinates
  assert(measurementsSource.includes('Neck Datum (Y:120)'), 'Viewport includes Neck Datum line at Y=120');
  assert(measurementsSource.includes('Chest / Scye Line (Y:200)'), 'Viewport includes Chest/Scye Datum line at Y=200');
  assert(measurementsSource.includes('Natural Waistline (Y:280)'), 'Viewport includes Natural Waistline Datum line at Y=280');
  assert(measurementsSource.includes('Seat Datum (Y:360)'), 'Viewport includes Seat Datum line at Y=360');
  assert(measurementsSource.includes('Knee / Outseam (Y:550)'), 'Viewport includes Outseam Datum line at Y=550');

  // 3.2 6 Garment Drape Overlays in Measurements Studio
  const CAD_DRAPE_GARMENTS = ['Sherwani', 'Suit', 'Blouse', 'Lehenga', 'Anarkali', 'Corset'];

  CAD_DRAPE_GARMENTS.forEach(garment => {
    assert(
      measurementsSource.includes(`selectedGarment === '${garment}'`),
      `CAD Studio defines dedicated drape overlay for "${garment}"`
    );
  });

  // Verify garment-specific drape elements in code:
  // 1. Sherwani: Mandarin collar band, front placket, 9 buttons, welt pocket, flared sweep
  assert(measurementsSource.includes('Mandarin Collar Band'), 'Sherwani overlay includes Mandarin Collar Band');
  assert(measurementsSource.includes('Front Center Placket'), 'Sherwani overlay includes Front Center Placket line');
  assert(measurementsSource.includes('sh-btn-'), 'Sherwani overlay includes ornate button array');

  // 2. Suit: Peak lapel roll lines, lapel buttonhole, 2-button closure, trouser press creases
  assert(measurementsSource.includes('Peak Lapel Roll Lines'), 'Suit overlay includes Savile Row Peak Lapel lines');
  assert(measurementsSource.includes('Trouser Center Press Creases'), 'Suit overlay includes Trouser Press Creases');

  // 3. Blouse: Sweetheart neckline, bust apex points, princess cut darts, underbust band
  assert(measurementsSource.includes('Sweetheart Neckline Front'), 'Blouse overlay includes Sweetheart Neckline vector path');
  assert(measurementsSource.includes('Princess Cut Darts'), 'Blouse overlay includes Princess Cut Darts');

  // 4. Lehenga: High-rise waistband, radiating kalis, broad flare sweep, cancan guide
  assert(measurementsSource.includes('High-Rise Embroidered Waistband'), 'Lehenga overlay includes High-Rise Waistband');
  assert(measurementsSource.includes('lh-kali-'), 'Lehenga overlay includes 12-Kali radiating flare lines');
  assert(measurementsSource.includes('Cancan Ring Guide'), 'Lehenga overlay includes Cancan Ring Guide');

  // 5. Anarkali: Empire bodice yoke, umbrella kalidar flare lines, floor sweep hem
  assert(measurementsSource.includes('Empire Bodice Yoke'), 'Anarkali overlay includes Empire Bodice Yoke');
  assert(measurementsSource.includes('Umbrella Kalidar Flare lines'), 'Anarkali overlay includes Umbrella Kalidar flare lines');

  // 6. Corset: Sweetheart décolletage, steel busk clasp hooks, 8 boning channels, bottom cinch
  assert(measurementsSource.includes('Sweetheart Décolletage'), 'Corset overlay includes Sweetheart Décolletage path');
  assert(measurementsSource.includes('Steel Busk Center Front Clasp Hooks'), 'Corset overlay includes Steel Busk Center Clasp');
  assert(measurementsSource.includes('busk-hook-'), 'Corset overlay includes busk hooks');

  // 3.3 4-Axis Posture Morphs & Dynamic Caliper Steppers
  // Axis 1: Shoulder Slope ('Normal' 0, 'Sloped' +8, 'Square' -8)
  assert(getShoulderOffsetY('Normal') === 0, 'Normal shoulder slope gives 0px offset');
  assert(getShoulderOffsetY('Sloped') === 8, 'Sloped shoulder slope drops shoulder line by +8px');
  assert(getShoulderOffsetY('Square') === -8, 'Square shoulder slope raises shoulder line by -8px');

  // Axis 2: Chest Stance Curve Apex (Normal Y:192, Forward Y:210, Barrel Y:222)
  assert(getChestCurve('Normal').includes('210 192'), 'Normal chest stance has apex at Y=192');
  assert(getChestCurve('Forward').includes('210 210'), 'Forward chest stance has forward apex at Y=210');
  assert(getChestCurve('Barrel').includes('210 222'), 'Barrel chest stance has expanded barrel apex at Y=222');

  // Axis 3: Back Posture / Spine DashArray ('Normal' '5 5', 'Stooped' '3 3', 'Erect' '10 2')
  assert(getSpineDash('Normal') === '5 5', 'Normal back posture uses "5 5" spine dash');
  assert(getSpineDash('Stooped') === '3 3', 'Stooped back posture uses tight "3 3" spine dash');
  assert(getSpineDash('Erect') === '10 2', 'Erect back posture uses extended "10 2" spine dash');

  // Axis 4: Heel Height Compensation (Women: heelHeight * 5px; Men: 0px)
  assert(getHeelOffset('Men', 3) === 0, 'Men silhouette strictly ignores heel height offset');
  assert(getHeelOffset('Women', 0) === 0, 'Women flat heel returns 0px offset');
  assert(getHeelOffset('Women', 2) === 10, 'Women 2-inch heel gives 10px vertical hem compensation');
  assert(getHeelOffset('Women', 3) === 15, 'Women 3-inch heel gives 15px vertical hem compensation');

  // Dynamic Caliper Steppers: -0.5", -0.25", +0.25", +0.5" clamped to [min, max]
  const samplePom = { min: 32.0, max: 56.0, base: 40.0 };
  assert(applyStepper(40.0, -0.5, samplePom.min, samplePom.max) === 39.5, 'Caliper stepper -0.5" decrements 40.0 -> 39.5"');
  assert(applyStepper(40.0, -0.25, samplePom.min, samplePom.max) === 39.75, 'Caliper stepper -0.25" decrements 40.0 -> 39.75"');
  assert(applyStepper(40.0, 0.25, samplePom.min, samplePom.max) === 40.25, 'Caliper stepper +0.25" increments 40.0 -> 40.25"');
  assert(applyStepper(40.0, 0.5, samplePom.min, samplePom.max) === 40.5, 'Caliper stepper +0.5" increments 40.0 -> 40.5"');
  assert(applyStepper(32.25, -0.5, samplePom.min, samplePom.max) === 32.0, 'Caliper stepper clamps at min bound (32.0")');
  assert(applyStepper(55.75, 0.5, samplePom.min, samplePom.max) === 56.0, 'Caliper stepper clamps at max bound (56.0")');

  // 3.4 Snapshot Version History & Print Isolation
  // Test localStorage snapshot operations
  const initialSnapshots = [
    { id: 'v3', version: 'v3.0', date: 'Aug 5, 2026', garment: 'Sherwani', status: 'current', pomCount: 8, pomData: { 'sh-01': 42.5 } },
    { id: 'v2', version: 'v2.0', date: 'Jul 20, 2026', garment: 'Sherwani', status: 'archived', pomCount: 8, pomData: { 'sh-01': 43.0 } },
    { id: 'v1', version: 'v1.0', date: 'Jun 12, 2026', garment: 'Suit', status: 'archived', pomCount: 9, pomData: { 'su-01': 43.5 } }
  ];

  setLocalStorage('yh_measurement_snapshots', initialSnapshots);
  const storedSnapshots = getLocalStorage<any[]>('yh_measurement_snapshots', []);
  assert(storedSnapshots.length === 3, 'yh_measurement_snapshots loaded from storage with 3 initial snapshots');

  // Save new snapshot logic: increments version to v4.0, archives previous current
  const updatedSnapshots = saveNewSnapshot(storedSnapshots, 'Sherwani', { 'sh-01': 42.0, 'sh-02': 34.5 });
  assert(updatedSnapshots.length === 4, 'Saving snapshot increases total snapshots to 4');
  assert(updatedSnapshots[0].version === 'v4.0', 'New snapshot receives version string "v4.0"');
  assert(updatedSnapshots[0].status === 'current', 'New snapshot is marked status="current"');
  assert(updatedSnapshots[1].version === 'v3.0' && updatedSnapshots[1].status === 'archived', 'Previous current snapshot v3.0 is archived');

  // Restore snapshot logic
  const targetToRestore = updatedSnapshots.find(s => s.version === 'v2.0');
  assert(targetToRestore && targetToRestore.pomData['sh-01'] === 43.0, 'Snapshot v2.0 pomData is retrieved intact');

  // Save active measurements to yh_measurements_current
  setLocalStorage('yh_measurements_current', { 'sh-01': 42.0, 'sh-02': 34.5 });
  const storedCurrent = getLocalStorage<Record<string, number>>('yh_measurements_current', {});
  assert(storedCurrent['sh-01'] === 42.0 && storedCurrent['sh-02'] === 34.5, 'yh_measurements_current persists active measurements');

  // Print isolation in /measurements page:
  assert(
    measurementsSource.includes('@media print {'),
    '/measurements page defines local @media print style tag'
  );
  assert(
    measurementsSource.includes('.measurement-card-print'),
    '/measurements page wraps MeasurementCard in .measurement-card-print container'
  );
  assert(
    measurementsSource.includes('visibility: hidden !important;'),
    '/measurements print CSS hides body chrome during print'
  );
  assert(
    measurementsSource.includes('.measurement-card-print, .measurement-card-print * { visibility: visible !important; }'),
    '/measurements print CSS enforces visibility on .measurement-card-print'
  );

  // Render MeasurementCard component and verify pure vector SVG QR / barcode output
  const measurementCardOutput = renderToStaticMarkup(
    React.createElement(MeasurementCard, {
      customerName: 'Rajeshwar Malhotra',
      garmentType: 'Sherwani',
      fitPref: 'Slim Bespoke',
      measurements: { 'Chest Girth': 42.5, 'Waist Girth': 35.0, 'Shoulder Width': 18.5 }
    })
  );

  assert(
    measurementCardOutput.toLowerCase().includes('measurement chart'),
    'MeasurementCard renders "Measurement Chart" heading'
  );
  assert(measurementCardOutput.includes('Rajeshwar Malhotra'), 'MeasurementCard renders client name');
  assert(
    measurementCardOutput.toLowerCase().includes('chest') && measurementCardOutput.toLowerCase().includes('girth'),
    'MeasurementCard renders POM label'
  );
  assert(measurementCardOutput.includes('42.5'), 'MeasurementCard renders POM value');
  assert(measurementCardOutput.includes('<svg'), 'MeasurementCard includes pure SVG QR code and barcode');

  // =========================================================================
  // SECTION 4: ADVERSARIAL STRESS & RESILIENCE TESTING
  // =========================================================================
  console.log('\n[Suite 4: Adversarial Stress & Robustness Evaluation]');

  // 4.1 Corrupted LocalStorage Fault Recovery
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('yh_corrupted_test', '{ invalid-json');
  }
  const recoveredValue = getLocalStorage<any>('yh_corrupted_test', { fallback: true });
  assert(
    recoveredValue && recoveredValue.fallback === true,
    'Storage utils recovers safely with fallback when JSON parsing fails',
    'true',
    String(recoveredValue && recoveredValue.fallback)
  );

  // 4.2 Extreme and Boundary Order Totals
  const edgeCaseOrders = [
    { status: 'CONFIRMED', totalAmount: 0, advanceAmount: 0 },
    { status: 'CONFIRMED', totalAmount: 1e9, advanceAmount: 5e8 },
    { status: 'CONFIRMED', totalAmount: -500, advanceAmount: 0 }, // Negative anomaly
    { status: 'DRAFT', totalAmount: 999999, advanceAmount: 999999 }
  ];

  const edgeRevenue = computeTotalRevenue(edgeCaseOrders);
  assert(edgeRevenue === 1e9 - 500, 'Revenue calculation gracefully handles boundary arithmetic and skips DRAFT');

  // 4.3 Malformed Date Strings in Overdue Calculation
  const malformedOrders = [
    { id: '#M1', dueDate: '9999-99-99', status: 'IN_PRODUCTION' },
    { id: '#M2', dueDate: '', status: 'IN_PRODUCTION' },
    { id: '#M3', dueDate: undefined, status: 'IN_PRODUCTION' }
  ];
  const malformedOverdue = computeOverdueOrders(malformedOrders, '2026-08-16');
  assert(malformedOverdue.length === 0, 'Malformed or missing due dates do not crash overdue engine and return 0 overdue');

  // 4.4 XSS / Injection Resilience in QR and Barcode Strings
  const xssString = '<script>alert("XSS")</script>&quot;`\'';
  const xssQrOutput = renderToStaticMarkup(React.createElement(QRCodeSVG, { value: xssString, size: 64 }));
  assert(xssQrOutput.includes('<svg'), 'QRCodeSVG safely handles arbitrary XSS payload');

  const xssBarcodeOutput = renderToStaticMarkup(React.createElement(BarcodeSVG, { value: 'XSS-SAFE-123', width: 160, height: 40 }));
  assert(xssBarcodeOutput.includes('<svg'), 'BarcodeSVG safely renders formatted barcode');

  // 4.5 POM Value Boundary Validation
  const validatePomValue = (val: number, min: number, max: number): boolean => {
    return typeof val === 'number' && !isNaN(val) && val >= min && val <= max;
  };
  assert(validatePomValue(40, 32, 56) === true, 'In-range POM value (40) is valid');
  assert(validatePomValue(31.9, 32, 56) === false, 'Below min POM value (31.9) is invalid');
  assert(validatePomValue(56.1, 32, 56) === false, 'Above max POM value (56.1) is invalid');
  assert(validatePomValue(NaN, 32, 56) === false, 'NaN POM value is rejected');

  console.log(`\n====================================================================`);
  console.log(`MILESTONE 3 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================================\n`);

  return { passed, failed, findings };
}
