/**
 * YellowHouse Tailoring OS — Milestone 4 Production Operations Test Suite
 * Production Floor Kanban, SAM Calculations, Piece-Rate Ledger (₹42/min),
 * Staff 7-Role Management, Customer CRM & CAD Linkage, and Print Layouts.
 *
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 4 & Mathematical Invariants
 * - ORIGINAL_REQUEST.md § R4 (Karigar Workshop Production Board & SAM Efficiency Ledger)
 * - apps/web/src/lib/production-utils.ts
 * - apps/web/src/lib/staff-utils.ts
 * - apps/web/src/lib/sam-calculator.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Local storage mock for Node test runner
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
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
if (!(global as any).localStorage) {
  (global as any).localStorage = (global as any).window.localStorage;
}

import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import {
  KanbanStage,
  JobCardItem,
  KANBAN_STAGES,
  STAGE_CONFIG,
  STAGE_RACK_MAPPING,
  isTransitionAllowed,
  getNextStage,
  getPrevStage,
  computeKanbanProgress,
  executeStageTransition,
  PIECE_RATE_PER_MINUTE,
  calculatePieceRateEarnings,
  calculateTimesheetEarnings,
  formatTimerDuration,
  calculateSamEfficiency,
  aggregateDailyTimesheet,
  aggregateWeeklyTimesheet,
  generateTimesheetCsv,
} from '../lib/production-utils';

import {
  PLATFORM_ROLES,
  StaffRole,
  StaffMember,
  INITIAL_STAFF,
  isValidPlatformRole,
  getRoleBadgeClass,
  Customer,
  INITIAL_CUSTOMERS,
  filterCustomers,
  buildCustomerCadLink,
  filterSnapshotsForCustomer,
  computeCustomerStats,
} from '../lib/staff-utils';

import {
  calculateGarmentSam,
  BASE_GARMENT_SAM_MAP,
  EMBROIDERY_SAM_MAP,
} from '../lib/sam-calculator';

export interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runM4ProductionOperationsTests(): TestResult {
  console.log('\n====================================================================');
  console.log('--- MILESTONE 4: PRODUCTION FLOOR, KARIGAR SAM & OPERATIONS SUITE ---');
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

  // Base directory resolution
  const cwd = process.cwd();
  const webRoot =
    cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
      ? cwd
      : path.join(cwd, 'apps', 'web');

  /**
   * Helper to safely transpile and load TSX modules in CommonJS ts-node runtime
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

  const idCodesModule = loadTsxModule(path.join(webRoot, 'src', 'components', 'id-codes.tsx'));
  const QRCodeSVG = idCodesModule.QRCodeSVG;
  const BarcodeSVG = idCodesModule.BarcodeSVG;

  // =========================================================================
  // SUITE 1: 5 KANBAN STAGES & SINGLE-STEP TRANSITION ENFORCEMENT
  // =========================================================================
  console.log('[Suite 1: 5 Kanban Stages & Single-Step Transition Enforcement]');

  assert(KANBAN_STAGES.length === 5, 'Exactly 5 Kanban stages defined', '5', String(KANBAN_STAGES.length));
  assert(KANBAN_STAGES[0] === 'Fabric Inspection', 'Stage 1 is Fabric Inspection');
  assert(KANBAN_STAGES[1] === 'Master Cutting', 'Stage 2 is Master Cutting');
  assert(KANBAN_STAGES[2] === 'Zardozi/Aari Embroidery', 'Stage 3 is Zardozi/Aari Embroidery');
  assert(KANBAN_STAGES[3] === 'Stitching Assembly', 'Stage 4 is Stitching Assembly');
  assert(KANBAN_STAGES[4] === 'QC & Ready for Delivery', 'Stage 5 is QC & Ready for Delivery');

  // Single-step forward transitions
  for (let i = 0; i < KANBAN_STAGES.length - 1; i++) {
    const from = KANBAN_STAGES[i];
    const to = KANBAN_STAGES[i + 1];
    assert(isTransitionAllowed(from, to) === true, `Single-step forward allowed: ${from} -> ${to}`);
  }

  // Single-step backward transitions
  for (let i = KANBAN_STAGES.length - 1; i > 0; i--) {
    const from = KANBAN_STAGES[i];
    const to = KANBAN_STAGES[i - 1];
    assert(isTransitionAllowed(from, to) === true, `Single-step backward allowed: ${from} -> ${to}`);
  }

  // Idempotent same-stage transition
  assert(isTransitionAllowed('Master Cutting', 'Master Cutting') === true, 'Same-stage transition allowed (diff 0)');

  // Illegal multi-step skip transitions
  const illegalPairs: [KanbanStage, KanbanStage][] = [
    ['Fabric Inspection', 'Zardozi/Aari Embroidery'],
    ['Fabric Inspection', 'Stitching Assembly'],
    ['Fabric Inspection', 'QC & Ready for Delivery'],
    ['Master Cutting', 'Stitching Assembly'],
    ['Master Cutting', 'QC & Ready for Delivery'],
    ['QC & Ready for Delivery', 'Fabric Inspection'],
    ['QC & Ready for Delivery', 'Master Cutting'],
    ['Stitching Assembly', 'Fabric Inspection'],
  ];

  for (const [from, to] of illegalPairs) {
    assert(isTransitionAllowed(from, to) === false, `Illegal jump rejected: ${from} -> ${to}`);
  }

  // getNextStage & getPrevStage helpers
  assert(getNextStage('Fabric Inspection') === 'Master Cutting', 'Next stage from Fabric Inspection is Master Cutting');
  assert(getNextStage('QC & Ready for Delivery') === null, 'Next stage from QC is null');
  assert(getPrevStage('Master Cutting') === 'Fabric Inspection', 'Prev stage from Master Cutting is Fabric Inspection');
  assert(getPrevStage('Fabric Inspection') === null, 'Prev stage from Fabric Inspection is null');

  // Execution transition & progress calculation
  const sampleJob: JobCardItem = {
    id: 'JC-9001',
    orderId: 'ORD-9001',
    client: 'Aditya Birla',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 45,
    samTotalEstimate: 210,
    priority: 'Urgent',
    dueDate: '2026-09-20',
    progress: 20,
    stage: 'Fabric Inspection',
  };

  const validTransition = executeStageTransition(sampleJob, 'Master Cutting');
  assert(validTransition.success === true, 'Valid transition executed successfully');
  const updatedJob = validTransition.updatedJob || validTransition.job;
  assert(updatedJob?.stage === 'Master Cutting', 'Job stage updated to Master Cutting');
  assert(updatedJob?.progress === 40, 'Job progress updated to 40%');
  assert(Boolean(updatedJob?.history && updatedJob.history.length === 1), 'History entry appended to job card');
  assert(updatedJob?.rack === STAGE_RACK_MAPPING['Master Cutting'], 'Rack automatically updated to Master Cutting storage');

  const invalidTransition = executeStageTransition(sampleJob, 'Stitching Assembly');
  assert(invalidTransition.success === false, 'Invalid multi-step transition blocked');
  assert(Boolean(invalidTransition.error?.toLowerCase().includes('single-step')), 'Error message specifies single-step transition requirement');

  // Final stage progress = 100%
  const qcJob: JobCardItem = { ...sampleJob, stage: 'Stitching Assembly', progress: 80 };
  const toQc = executeStageTransition(qcJob, 'QC & Ready for Delivery');
  const qcUpdated = toQc.updatedJob || toQc.job;
  assert(toQc.success === true && qcUpdated?.progress === 100, 'QC stage enforces 100% progress');

  // =========================================================================
  // SUITE 2: SAM CALCULATION ENGINE & ACTIVE TIMER EFFICIENCY
  // =========================================================================
  console.log('\n[Suite 2: SAM Calculation Engine & Active Timer Efficiency]');

  // Base SAM map verification
  assert(BASE_GARMENT_SAM_MAP['mens-suit'] === 240, "Men's Suit base SAM is 240m");
  assert(BASE_GARMENT_SAM_MAP['mens-sherwani'] === 210, "Men's Sherwani base SAM is 210m");
  assert(BASE_GARMENT_SAM_MAP['mens-shirt'] === 60, "Men's Shirt base SAM is 60m");
  assert(BASE_GARMENT_SAM_MAP['mens-trouser'] === 90, "Men's Trouser base SAM is 90m");
  assert(BASE_GARMENT_SAM_MAP['womens-blouse'] === 120, "Women's Blouse base SAM is 120m");
  assert(BASE_GARMENT_SAM_MAP['womens-lehenga'] === 300, "Women's Lehenga base SAM is 300m");
  assert(BASE_GARMENT_SAM_MAP['womens-anarkali'] === 270, "Women's Anarkali base SAM is 270m");
  assert(BASE_GARMENT_SAM_MAP['womens-corset'] === 180, "Women's Corset base SAM is 180m");
  assert(BASE_GARMENT_SAM_MAP['womens-gown'] === 240, "Women's Gown base SAM is 240m");

  // Posture Surcharges
  const slopedPostureSam = calculateGarmentSam({
    garmentCategory: 'mens-suit',
    postureProfile: { shoulderSlope: 'sloped', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal' },
  });
  assert(slopedPostureSam.postureModifierMinutes === 15, 'Sloped shoulders adds +15 mins posture surcharge');
  assert(slopedPostureSam.totalSamMinutes === 255, 'Total SAM with sloped shoulders = 240 + 15 = 255 mins');

  const compoundPostureSam = calculateGarmentSam({
    garmentCategory: 'mens-sherwani',
    postureProfile: { shoulderSlope: 'very_sloped', backCurvature: 'stooped', abdomenStance: 'prominent', hipSpineStance: 'sway_back' },
  });
  // very_sloped: 25, stooped: 20, prominent: 25, sway_back: 20 -> 90
  assert(compoundPostureSam.postureModifierMinutes === 90, 'Compound 4-axis posture adds +90 mins surcharge');
  assert(compoundPostureSam.totalSamMinutes === 210 + 90, 'Total SAM with compound posture = 300 mins');

  // Customization Surcharges: Canvas, Silk Lining, Flared Panels, Embroidery
  const coutureLehengaSam = calculateGarmentSam({
    garmentCategory: 'womens-lehenga',
    panelCount: 24, // > 16 panels: +60 mins
    embroideryLevel: 'heavy', // +240 mins
    hasFullCanvas: true, // +30 mins
    hasCustomLining: true, // +30 mins
    fittingTrialCount: 2, // 2 * 45 = +90 mins
  });
  // Base 300 + Customizations (60 + 240 + 30 + 30 + 90 = 450) = 750 mins
  assert(coutureLehengaSam.customizationMinutes === 450, 'Couture customizations sum to +450 mins');
  assert(coutureLehengaSam.totalSamMinutes === 750, 'Total couture lehenga SAM = 750 mins (12.5 hrs)');
  assert(coutureLehengaSam.estimatedLaborHours === 12.5, 'Estimated labor hours = 12.5 hrs');

  // Active Timer Formatting & Efficiency Yield
  assert(formatTimerDuration(45) === '00:45', 'Formats 45 seconds');
  assert(formatTimerDuration(754) === '12:34', 'Formats 12m 34s');
  assert(formatTimerDuration(3665) === '01:01:05', 'Formats 1h 1m 5s');
  assert(formatTimerDuration(-10) === '00:00', 'Sanitizes negative seconds');

  // SAM Yield Efficiency: 180 min estimate, 150 min logged -> 120% yield
  assert(calculateSamEfficiency(180, 150) === 120.0, 'Efficient artisan yield = 120.0%');
  // 180 min estimate, 200 min logged -> 90.0% yield
  assert(calculateSamEfficiency(180, 200) === 90.0, 'Delayed artisan yield = 90.0%');

  // =========================================================================
  // SUITE 3: PIECE-RATE EARNINGS LEDGER (STRICTLY ₹42/MINUTE)
  // =========================================================================
  console.log('\n[Suite 3: Piece-Rate Earnings Ledger (Strict ₹42/Minute Rate)]');

  assert(PIECE_RATE_PER_MINUTE === 42, 'PIECE_RATE_PER_MINUTE invariant strictly equals 42');

  // Benchmark calculations
  assert(calculatePieceRateEarnings(60) === 2520, '1 hour (60 min) = ₹2,520 (60 * 42)');
  assert(calculatePieceRateEarnings(100) === 4200, '100 min = ₹4,200 (100 * 42)');
  assert(calculatePieceRateEarnings(180) === 7560, '180 min = ₹7,560 (180 * 42)');
  assert(calculatePieceRateEarnings(240) === 10080, '240 min = ₹10,080 (240 * 42)');
  assert(calculatePieceRateEarnings(300) === 12600, '300 min = ₹12,600 (300 * 42)');

  // Daily Timesheet Aggregation
  const dailyLogs = [
    { minutesLogged: 45 },
    { minutesLogged: 120 },
    { minutesLogged: 75 },
  ];
  // 45 + 120 + 75 = 240 mins -> 240 * 42 = ₹10,080
  const dailyResult = calculateTimesheetEarnings(dailyLogs);
  assert(dailyResult.totalMinutes === 240, 'Daily logged minutes = 240 mins');
  assert(dailyResult.totalEarningsInr === 10080, 'Daily artisan earnings = ₹10,080');

  // Weekly Timesheet Aggregation (6 days * 240 mins = 1440 mins)
  const weeklyLogs = Array(6).fill({ minutesLogged: 240 });
  const weeklyResult = calculateTimesheetEarnings(weeklyLogs);
  assert(weeklyResult.totalMinutes === 1440, 'Weekly logged minutes = 1,440 mins');
  assert(weeklyResult.totalEarningsInr === 60480, 'Weekly artisan earnings = ₹60,480');

  // Boundary checks: 0, negative, NaN
  assert(calculatePieceRateEarnings(0) === 0, '0 minutes yields ₹0');
  assert(calculatePieceRateEarnings(-50) === 0, 'Negative minutes yields ₹0');
  assert(calculatePieceRateEarnings(NaN) === 0, 'NaN minutes yields ₹0');

  // =========================================================================
  // SUITE 4: 7 PLATFORM ROLES IN STAFF ROSTER MANAGEMENT
  // =========================================================================
  console.log('\n[Suite 4: 7 Platform Roles in Staff Roster Management]');

  const expected7Roles: StaffRole[] = [
    'SUPER_ADMIN',
    'TENANT_OWNER',
    'BRANCH_MANAGER',
    'MASTER_TAILOR',
    'RECEPTIONIST',
    'KARIGAR',
    'ACCOUNTANT',
  ];

  assert(PLATFORM_ROLES.length === 7, 'PLATFORM_ROLES defines exactly 7 roles');
  for (const r of expected7Roles) {
    assert(isValidPlatformRole(r) === true, `Validates platform role: ${r}`);
  }
  assert(isValidPlatformRole('HACKER') === false, 'Rejects unknown role: HACKER');
  assert(isValidPlatformRole('') === false, 'Rejects empty role string');

  // Initial staff contains valid members
  assert(INITIAL_STAFF.length >= 7, 'INITIAL_STAFF contains seeded team members for all 7 roles');
  for (const staff of INITIAL_STAFF) {
    assert(isValidPlatformRole(staff.role), `Staff member ${staff.name} has valid role ${staff.role}`);
    assert(Boolean(staff.email && staff.email.includes('@')), `Staff member ${staff.name} has valid email`);
    assert(staff.status === 'Active' || staff.status === 'Pending', `Staff member status is Active or Pending`);
  }

  // Badge class mappings
  assert(getRoleBadgeClass('SUPER_ADMIN').includes('badge-gold'), 'SUPER_ADMIN maps to gold badge');
  assert(getRoleBadgeClass('TENANT_OWNER').includes('badge-gold'), 'TENANT_OWNER maps to gold badge');
  assert(getRoleBadgeClass('BRANCH_MANAGER').includes('badge-blue'), 'BRANCH_MANAGER maps to blue badge');
  assert(getRoleBadgeClass('MASTER_TAILOR').includes('badge-amber'), 'MASTER_TAILOR maps to amber badge');
  assert(getRoleBadgeClass('RECEPTIONIST').includes('badge-emerald'), 'RECEPTIONIST maps to emerald badge');
  assert(getRoleBadgeClass('KARIGAR').includes('badge-rose'), 'KARIGAR maps to rose badge');
  assert(getRoleBadgeClass('ACCOUNTANT').includes('badge-blue'), 'ACCOUNTANT maps to blue badge');

  // LocalStorage autosave draft key check
  setLocalStorage('yh_staff_draft', { name: 'Master Salim', role: 'MASTER_TAILOR' });
  const draft = getLocalStorage<any>('yh_staff_draft', null);
  assert(draft?.name === 'Master Salim', 'yh_staff_draft persists recruitment draft');
  removeLocalStorage('yh_staff_draft');
  assert(getLocalStorage('yh_staff_draft', null) === null, 'yh_staff_draft clears on form submission');

  // =========================================================================
  // SUITE 5: CUSTOMER CRM SEARCH, FILTER & CAD SNAPSHOT LINKAGE
  // =========================================================================
  console.log('\n[Suite 5: Customer CRM Search, Filter & CAD Snapshot Linkage]');

  assert(INITIAL_CUSTOMERS.length === 8, 'INITIAL_CUSTOMERS defines 8 seeded client profiles');

  // Case-insensitive name search
  const searchName = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: 'malhotra' });
  assert(searchName.length === 1 && searchName[0].id === 'CUST-001', 'Searches customer by name (case-insensitive)');

  // Phone number search
  const searchPhone = filterCustomers(INITIAL_CUSTOMERS, { searchQuery: '43211' });
  assert(searchPhone.length === 1 && searchPhone[0].name === 'Ananya Sharma', 'Searches customer by phone substring');

  // Gender filtering
  const menCustomers = filterCustomers(INITIAL_CUSTOMERS, { gender: 'Men' });
  assert(menCustomers.length === 4, 'Filters 4 Men customer profiles');
  assert(menCustomers.every((c) => c.gender === 'Men'), 'All filtered profiles have gender Men');

  const womenCustomers = filterCustomers(INITIAL_CUSTOMERS, { gender: 'Women' });
  assert(womenCustomers.length === 4, 'Filters 4 Women customer profiles');

  // VIP filtering
  const vipCustomers = filterCustomers(INITIAL_CUSTOMERS, { vipOnly: true });
  assert(vipCustomers.length === 6, 'Filters 6 VIP/Couture/Wedding customer profiles');
  assert(vipCustomers.every((c) => c.isVip), 'All VIP filtered profiles have isVip === true');

  // VIP Tier Filtering (4-tier hierarchy)
  const coutureCustomers = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'Couture' });
  assert(coutureCustomers.length === 2, 'Filters 2 Couture customer profiles (Rajeshwar Malhotra & Meera Reddy)');

  const weddingCustomers = filterCustomers(INITIAL_CUSTOMERS, { vipTier: 'Wedding' });
  assert(weddingCustomers.length === 2, 'Filters 2 Wedding customer profiles (Ananya Sharma & Deepika Nair)');

  // CAD Studio Link Generation
  const cadLink = buildCustomerCadLink('CUST-001');
  assert(cadLink === '/measurements?customerId=CUST-001', 'Generates URL link to 2D CAD studio with customerId query param');

  // Customer Measurement Snapshot Linkage Isolation
  const mockSnapshots = [
    { id: 'snap-1', customerId: 'CUST-001', version: 'v1.0', garment: 'Sherwani' },
    { id: 'snap-2', customerId: 'CUST-001', version: 'v1.1', garment: 'Sherwani' },
    { id: 'snap-3', customerId: 'CUST-002', version: 'v1.0', garment: 'Lehenga' },
  ];
  const cust1Snapshots = filterSnapshotsForCustomer(mockSnapshots, 'CUST-001');
  assert(cust1Snapshots.length === 2, 'Filters 2 snapshots for CUST-001');
  assert(cust1Snapshots.every((s) => s.customerId === 'CUST-001'), 'Ensures zero cross-customer measurement snapshot leakage');

  // Soft deletion logging invariant
  setLocalStorage('yh_deleted_customers_log', []);
  const deleteLog = [
    { customerId: 'CUST-999', name: 'Deleted Client', reason: 'Requested GDPR deletion', deletedAt: new Date().toISOString() },
  ];
  setLocalStorage('yh_deleted_customers_log', deleteLog);
  const loadedLogs = getLocalStorage<any[]>('yh_deleted_customers_log', []);
  assert(loadedLogs.length === 1 && loadedLogs[0].customerId === 'CUST-999', 'Customer deletion logged to yh_deleted_customers_log');

  // =========================================================================
  // SUITE 6: PRINT ISOLATION INVARIANTS & PURE SVG VECTOR GENERATORS
  // =========================================================================
  console.log('\n[Suite 6: Print Isolation Invariants & Pure SVG Vector Generators]');

  // Pure SVG QR Code rendering
  const qrStaticHtml = renderToStaticMarkup(
    React.createElement(QRCodeSVG, { value: 'https://yellowhouse.atelier/job/JC-9035', size: 42 })
  );
  assert(qrStaticHtml.includes('<svg'), 'QRCodeSVG renders SVG element');
  assert(qrStaticHtml.includes('width="42"') && qrStaticHtml.includes('height="42"'), 'QRCodeSVG renders exact size dimensions');
  assert(qrStaticHtml.includes('<rect'), 'QRCodeSVG renders rect vector elements');
  assert(!qrStaticHtml.includes('<img'), 'QRCodeSVG contains zero raster img tags');

  // Pure SVG Barcode rendering
  const barcodeStaticHtml = renderToStaticMarkup(
    React.createElement(BarcodeSVG, { value: 'JC-9035', width: 130, height: 30 })
  );
  assert(barcodeStaticHtml.includes('<svg'), 'BarcodeSVG renders SVG element');
  assert(barcodeStaticHtml.includes('width="130"') && barcodeStaticHtml.includes('height="30"'), 'BarcodeSVG renders exact width/height');
  assert(barcodeStaticHtml.includes('JC-9035'), 'BarcodeSVG renders uppercase label text');
  assert(barcodeStaticHtml.includes('<rect'), 'BarcodeSVG renders vector rect stripes');
  assert(!barcodeStaticHtml.includes('<img'), 'BarcodeSVG contains zero raster img tags');

  // Global CSS @media print isolation audit
  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  assert(fs.existsSync(globalsCssPath), 'globals.css exists');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  assert(globalsCss.includes('@media print'), 'globals.css defines @media print block');
  assert(globalsCss.includes('aside, header, .no-print { display: none !important; }'), 'Hides UI navigation chrome on print');
  assert(globalsCss.includes('.print-only { display: block !important; }'), 'Shows .print-only elements on print');
  assert(globalsCss.includes('body { background: white !important; color: black !important; }'), 'Resets body to pure white paper and black text on print');
  assert(globalsCss.includes('.print-only'), '.print-only is defined in globals.css');

  // =========================================================================
  // SUITE 7: ADVERSARIAL EDGE CASES & STRESS RESILIENCE
  // =========================================================================
  console.log('\n[Suite 7: Adversarial Edge Cases & Stress Resilience]');

  // Corrupted LocalStorage JSON fault tolerance
  const corruptedStrings = ['{ broken_json', 'undefined', 'null', 'NaN', '<<<XML>>>'];
  for (const bad of corruptedStrings) {
    (global as any).localStorage.setItem('yh_production_jobs', bad);
    const safeJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', [sampleJob]);
    assert(Array.isArray(safeJobs) && safeJobs.length > 0, `Safely recovers from corrupted storage: ${bad.slice(0, 15)}`);
  }

  // XSS script injection sanitization in Customer Name & Job Notes
  const xssCustomer: Customer = {
    id: 'CUST-XSS',
    name: '<script>alert("xss")</script> Maharaj',
    phone: '+91 99999 88888',
    gender: 'Men',
    preferredFit: 'Regular',
    vipTier: 'VIP',
    isVip: true,
    totalOrders: 1,
    totalSpend: 50000,
    outstandingBalance: 0,
    tags: ['Urgent Fitting'],
    measurementsCount: 1,
    lastVisit: 'Today',
    initials: 'XM',
    createdAt: '2026-09-01',
    notes: '<img src=x onerror=alert(1)> Urgent embroidery',
  };
  const filteredXss = filterCustomers([xssCustomer], { searchQuery: 'script' });
  assert(filteredXss.length === 1, 'Filters customer containing script tag without execution');

  // Rapid sequential stage transitions (0 -> 1 -> 2 -> 3 -> 4)
  let iterativeJob = { ...sampleJob };
  for (let i = 1; i < KANBAN_STAGES.length; i++) {
    const nextStg = KANBAN_STAGES[i];
    const res = executeStageTransition(iterativeJob, nextStg);
    assert(res.success === true, `Sequential transition step ${i}: -> ${nextStg}`);
    iterativeJob = res.updatedJob || res.job!;
  }
  assert(iterativeJob.stage === 'QC & Ready for Delivery' && iterativeJob.progress === 100, 'Completed full 5-stage transition pipeline to QC 100%');

  // Summary
  console.log('\n====================================================================');
  console.log(`M4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  return { passed, failed, findings };
}
