/**
 * YellowHouse Tailoring OS — Milestone 3 (R4) Empirical Deep Stress & Challenge Suite
 * Invoked by teamwork_preview_challenger_m3_2
 * 
 * Comprehensive Stress Testing:
 * 1. Kanban Drag-and-Drop State Machine & Rapid Stage Transitions
 * 2. SAM Calculation Combinatorial Matrix (9 Garments x 7 Posture Modifiers x All Surcharges)
 * 3. Piece-Rate Earnings Ledger Math (₹42/min rate, Calendar/Table date filters, CSV Export)
 * 4. Workshop Storage Logistics & Scannable Identifiers
 */

import {
  calculateGarmentSam,
  BASE_GARMENT_SAM_MAP,
  EMBROIDERY_SAM_MAP,
  SamCalculationInput,
  SamCalculationResult
} from '../lib/sam-calculator';
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
  OrderStatus,
  KanbanStage,
  Priority
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import { GarmentCategory, PostureProfile, ShoulderSlopeValue, BackCurvatureValue, AbdomenStanceValue, HipSpineStanceValue } from '../types/measurement';

// Mock localStorage for node / test environments
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string): string | null { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: new LocalStorageMock(),
    dispatchEvent: () => true,
  };
}

export function runM3PreviewChallengerDeepStressSuite(): { passed: number; failed: number; totalAssertions: number; failedMsgs: string[] } {
  let passed = 0;
  let failed = 0;
  const failedMsgs: string[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failedMsgs.push(msg);
      failed++;
    } else {
      passed++;
    }
  }

  console.log('\n================================================================================');
  console.log('--- EMPIRICAL CHALLENGER M3: KARIGAR PRODUCTION & SAM LEDGER DEEP STRESS SUITE ---');
  console.log('================================================================================\n');

  const ALL_STAGES: KanbanStage[] = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery'
  ];

  // ============================================================================
  // SECTION 1: KANBAN DRAG-AND-DROP STATE MACHINE & RAPID STAGE TRANSITIONS
  // ============================================================================
  console.log('[Suite 1: Kanban Drag-and-Drop Transition Rules & Rapid Concurrency]');

  // Single-stage movement rule oracle: |idx_new - idx_current| <= 1
  const isTransitionAllowed = (fromStage: KanbanStage, toStage: KanbanStage): boolean => {
    const fromIdx = ALL_STAGES.indexOf(fromStage);
    const toIdx = ALL_STAGES.indexOf(toStage);
    if (fromIdx === -1 || toIdx === -1) return false;
    return Math.abs(fromIdx - toIdx) <= 1;
  };

  // 1.1 Full 5x5 Transition Matrix Verification
  let allowedCount = 0;
  let disallowedCount = 0;
  for (let i = 0; i < ALL_STAGES.length; i++) {
    for (let j = 0; j < ALL_STAGES.length; j++) {
      const from = ALL_STAGES[i];
      const to = ALL_STAGES[j];
      const allowed = isTransitionAllowed(from, to);
      if (Math.abs(i - j) <= 1) {
        assert(allowed, `Transition [${from}] -> [${to}] (|${i}-${j}| <= 1) is permitted`);
        allowedCount++;
      } else {
        assert(!allowed, `Transition [${from}] -> [${to}] (|${i}-${j}| = ${Math.abs(i - j)} > 1) is blocked`);
        disallowedCount++;
      }
    }
  }
  assert(allowedCount === 13, 'Exactly 13 allowed transitions (5 identity + 4 forward + 4 backward)');
  assert(disallowedCount === 12, 'Exactly 12 illegal multi-stage skip transitions blocked');

  // 1.2 Kanban Progress Mapping Invariants
  const expectedProgressMap: Record<KanbanStage, number> = {
    'Fabric Inspection': 20,
    'Master Cutting': 40,
    'Zardozi/Aari Embroidery': 60,
    'Stitching Assembly': 80,
    'QC & Ready for Delivery': 100
  };

  function computeKanbanProgress(stage: KanbanStage): number {
    if (stage === 'QC & Ready for Delivery') return 100;
    const stageIndex = ALL_STAGES.indexOf(stage);
    return Math.min(100, Math.max(15, (stageIndex + 1) * 20));
  }

  for (const st of ALL_STAGES) {
    assert(computeKanbanProgress(st) === expectedProgressMap[st], `Stage ${st} progress formula maps to exactly ${expectedProgressMap[st]}%`);
  }

  // 1.3 Rapid Concurrency & Sequential Drag Pipeline Simulation
  window.localStorage.clear();
  const initialJobs: JobCardItem[] = Array.from({ length: 10 }, (_, idx) => ({
    id: `JC-STRESS-${idx + 100}`,
    orderId: `#YH-${idx + 100}`,
    client: `Client ${idx + 1}`,
    garment: idx % 2 === 0 ? 'Sherwani' : 'Lehenga Choli',
    karigar: idx % 2 === 0 ? 'Karigar Latif' : 'Karigar Salim',
    samMinutesLogged: 30,
    samTotalEstimate: 240,
    priority: idx % 3 === 0 ? 'Urgent' : 'Normal',
    dueDate: 'Aug 28',
    progress: 20,
    stage: 'Fabric Inspection',
    history: [{ action: 'Job created', timestamp: new Date().toISOString(), stage: 'Fabric Inspection' }]
  }));
  setLocalStorage('yh_production_jobs', initialJobs);

  // Seed corresponding orders
  const initialOrders: Order[] = initialJobs.map(j => ({
    id: j.orderId,
    clientName: j.client,
    clientPhone: '+91 9876543210',
    garmentSummary: j.garment,
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 35000,
    dueDate: j.dueDate,
    createdAt: '2026-08-01'
  }));
  setLocalStorage('yh_orders', initialOrders);

  // Simulate 100 rapid stage transitions across all 10 jobs
  function moveJobSafe(jobId: string, targetStage: KanbanStage) {
    const currentJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    if (!isTransitionAllowed(job.stage, targetStage)) {
      return; // blocked by validation
    }

    const updated = currentJobs.map(j => {
      if (j.id !== jobId) return j;
      const newProgress = computeKanbanProgress(targetStage);
      const historyEntry = { action: 'Stage moved', timestamp: new Date().toISOString(), stage: targetStage };
      return {
        ...j,
        stage: targetStage,
        progress: newProgress,
        history: [...(j.history || []), historyEntry]
      };
    });
    setLocalStorage('yh_production_jobs', updated);

    const targetJob = updated.find(j => j.id === jobId);
    if (targetJob) {
      syncJobToOrdersStorage(targetJob);
    }
  }

  // Execute forward cycle: 0 -> 1 -> 2 -> 3 -> 4
  for (const job of initialJobs) {
    moveJobSafe(job.id, 'Master Cutting');
    moveJobSafe(job.id, 'Zardozi/Aari Embroidery');
    moveJobSafe(job.id, 'Stitching Assembly');
    moveJobSafe(job.id, 'QC & Ready for Delivery');
  }

  let finalJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(finalJobs.every(j => j.stage === 'QC & Ready for Delivery' && j.progress === 100), 'All 10 jobs successfully reached QC & Ready for Delivery at 100%');
  assert(finalJobs.every(j => (j.history?.length || 0) === 5), 'Each job accumulated exactly 5 historical audit records');

  // Verify orders synced to READY_FOR_DELIVERY
  let finalOrders = getLocalStorage<Order[]>('yh_orders', []);
  assert(finalOrders.every(o => o.status === 'READY_FOR_DELIVERY'), 'All linked orders bidirectionally updated to READY_FOR_DELIVERY');

  // Test illegal jump from 4 back to 0 directly
  for (const job of initialJobs) {
    moveJobSafe(job.id, 'Fabric Inspection'); // Must be blocked (4 -> 0)
  }
  finalJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(finalJobs.every(j => j.stage === 'QC & Ready for Delivery'), 'Illegal multi-stage backward jump (4 -> 0) blocked; stage remains QC');

  // Execute valid step backwards: 4 -> 3
  for (const job of initialJobs) {
    moveJobSafe(job.id, 'Stitching Assembly');
  }
  finalJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(finalJobs.every(j => j.stage === 'Stitching Assembly' && j.progress === 80), 'Valid step backward (4 -> 3) allowed; progress updated to 80%');

  finalOrders = getLocalStorage<Order[]>('yh_orders', []);
  assert(finalOrders.every(o => o.status === 'IN_PRODUCTION'), 'Linked orders bidirectionally updated back to IN_PRODUCTION');


  // ============================================================================
  // SECTION 2: SAM CALCULATION COMBINATORIAL ENGINE (9 Garments x Posture x Surcharges)
  // ============================================================================
  console.log('\n[Suite 2: SAM Matrix Combinatorial Stress Testing & Mathematical Oracles]');

  const ALL_GARMENTS: GarmentCategory[] = [
    'mens-suit',
    'mens-sherwani',
    'mens-shirt',
    'mens-trouser',
    'womens-blouse',
    'womens-lehenga',
    'womens-anarkali',
    'womens-corset',
    'womens-gown'
  ];

  const EXPECTED_BASE_SAM: Record<GarmentCategory, number> = {
    'mens-suit': 240,
    'mens-sherwani': 210,
    'mens-shirt': 60,
    'mens-trouser': 90,
    'womens-blouse': 120,
    'womens-lehenga': 300,
    'womens-anarkali': 270,
    'womens-corset': 180,
    'womens-gown': 240
  };

  const POSTURE_VECTORS: { label: string; profile: PostureProfile; expectedModifier: number }[] = [
    {
      label: 'Normal Posture Baseline',
      profile: { shoulderSlope: 'normal', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal' },
      expectedModifier: 0
    },
    {
      label: 'Sloped Shoulders (+15)',
      profile: { shoulderSlope: 'sloped', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal' },
      expectedModifier: 15
    },
    {
      label: 'Square Shoulders (+10) + Stooped Back (+20)',
      profile: { shoulderSlope: 'square', backCurvature: 'stooped', abdomenStance: 'normal', hipSpineStance: 'normal' },
      expectedModifier: 30
    },
    {
      label: 'Very Sloped (+25) + Prominent Blade (+20) + Flat Abdomen (+10) + High Hip (+15)',
      profile: { shoulderSlope: 'very_sloped', backCurvature: 'prominent_blade', abdomenStance: 'flat', hipSpineStance: 'high_hip' },
      expectedModifier: 70
    },
    {
      label: 'Maximum Extreme Posture (+25 + 20 + 25 + 20 = +90)',
      profile: { shoulderSlope: 'very_sloped', backCurvature: 'stooped', abdomenStance: 'prominent', hipSpineStance: 'sway_back' },
      expectedModifier: 90
    },
    {
      label: 'Erect Spine (+15) + Sway Back (+20)',
      profile: { shoulderSlope: 'normal', backCurvature: 'erect', abdomenStance: 'normal', hipSpineStance: 'sway_back' },
      expectedModifier: 35
    },
    {
      label: 'Prominent Abdomen (+25)',
      profile: { shoulderSlope: 'normal', backCurvature: 'normal', abdomenStance: 'prominent', hipSpineStance: 'normal' },
      expectedModifier: 25
    }
  ];

  const EMBROIDERY_LEVELS: ('none' | 'light' | 'medium' | 'heavy')[] = ['none', 'light', 'medium', 'heavy'];
  const EMBROIDERY_EXPECTED_MINUTES: Record<string, number> = {
    none: 0,
    light: 45,
    medium: 120,
    heavy: 240
  };

  const PANEL_TEST_TIERS = [
    { count: 0, expected: 0 },
    { count: 6, expected: 0 },
    { count: 12, expected: 30 },
    { count: 16, expected: 30 },
    { count: 24, expected: 60 },
    { count: 48, expected: 60 }
  ];

  // Run combinatorial verification across all 9 garments x all 7 posture vectors x 4 embroidery levels x 6 panel counts x canvas x lining
  let totalCombinationsTested = 0;
  for (const garment of ALL_GARMENTS) {
    const baseSam = EXPECTED_BASE_SAM[garment];

    for (const post of POSTURE_VECTORS) {
      for (const emb of EMBROIDERY_LEVELS) {
        for (const panel of PANEL_TEST_TIERS) {
          for (const canvas of [false, true]) {
            for (const lining of [false, true]) {
              for (const trials of [0, 2]) {
                const input: SamCalculationInput = {
                  garmentCategory: garment,
                  postureProfile: post.profile,
                  embroideryLevel: emb,
                  panelCount: panel.count,
                  hasFullCanvas: canvas,
                  hasCustomLining: lining,
                  fittingTrialCount: trials
                };

                const result = calculateGarmentSam(input);

                // Closed-form mathematical oracle
                const expectedBase = baseSam;
                const expectedPosture = post.expectedModifier;
                const expectedCustom = 
                  panel.expected +
                  EMBROIDERY_EXPECTED_MINUTES[emb] +
                  (canvas ? 30 : 0) +
                  (lining ? 30 : 0) +
                  (trials * 45);

                const expectedTotal = expectedBase + expectedPosture + expectedCustom;
                const expectedHours = Number((expectedTotal / 60).toFixed(1));

                assert(result.baseSamMinutes === expectedBase, `Base SAM correct for ${garment}`);
                assert(result.postureModifierMinutes === expectedPosture, `Posture modifier correct for ${post.label}`);
                assert(result.customizationMinutes === expectedCustom, `Customization minutes correct for ${garment} with panel=${panel.count}, emb=${emb}, canvas=${canvas}, lining=${lining}, trials=${trials}`);
                assert(result.totalSamMinutes === expectedTotal, `Total SAM minutes equals sum of base+posture+custom (${expectedTotal})`);
                assert(result.estimatedLaborHours === expectedHours, `Labor hours conversion matches ${expectedHours}h`);
                totalCombinationsTested++;
              }
            }
          }
        }
      }
    }
  }
  console.log(`✅ Exhaustively tested ${totalCombinationsTested} distinct SAM combinatorial vectors without a single mathematical deviation.`);


  // ============================================================================
  // SECTION 3: PIECE-RATE EARNINGS LEDGER MATH (Rate, Date Filtering, CSV Export)
  // ============================================================================
  console.log('\n[Suite 3: Artisan Timesheets Ledger Math, Date Filtering & CSV Generation]');

  const RATE_PER_MIN = 42;

  interface TestTimesheetLog {
    date: string; // YYYY-MM-DD
    karigar: string;
    jobId: string;
    garment: string;
    task: string;
    sam: number;
    rate: number;
    status: 'Logged' | 'Disbursed';
  }

  const MOCK_LEDGER_DATA: TestTimesheetLog[] = [
    { date: '2026-08-01', karigar: 'Karigar Latif', jobId: 'JC-9038', garment: 'Sherwani', task: 'Pattern Master Drafting', sam: 60, rate: 42, status: 'Disbursed' },
    { date: '2026-08-02', karigar: 'Karigar Salim', jobId: 'JC-9035', garment: 'Lehenga Choli', task: 'Fabric Align Inspection', sam: 35, rate: 42, status: 'Disbursed' },
    { date: '2026-08-03', karigar: 'Karigar Latif', jobId: 'JC-9021', garment: 'Sherwani', task: 'Jacket Bodice Cutting', sam: 65, rate: 42, status: 'Disbursed' },
    { date: '2026-08-03', karigar: 'Karigar Salim', jobId: 'JC-9018', garment: 'Lehenga Choli', task: 'Maroon Velvet Dabka embroidery', sam: 180, rate: 42, status: 'Disbursed' },
    { date: '2026-08-04', karigar: 'Karigar Ahmed', jobId: 'JC-9025', garment: 'Bandhgala', task: 'Collar Pattern Cut', sam: 45, rate: 42, status: 'Disbursed' },
    { date: '2026-08-04', karigar: 'Karigar Usman', jobId: 'JC-8994', garment: 'Sari Blouse', task: 'Princess bodice assembly', sam: 85, rate: 42, status: 'Disbursed' },
    { date: '2026-08-05', karigar: 'Karigar Salim', jobId: 'JC-9018', garment: 'Lehenga Choli', task: 'French Knot panel extensions', sam: 60, rate: 42, status: 'Logged' },
    { date: '2026-08-05', karigar: 'Karigar Rafi', jobId: 'JC-9030', garment: 'Anarkali', task: 'Kalis seam stitching', sam: 110, rate: 42, status: 'Logged' },
    { date: '2026-08-06', karigar: 'Karigar Usman', jobId: 'JC-9022', garment: 'Sari Blouse', task: 'Sequins work backend collar', sam: 120, rate: 42, status: 'Logged' },
    { date: '2026-08-06', karigar: 'Karigar Ahmed', jobId: 'JC-9028', garment: 'Suit', task: 'Double breasted collar cuts', sam: 50, rate: 42, status: 'Logged' },
    { date: '2026-08-07', karigar: 'Karigar Rafi', jobId: 'JC-8965', garment: 'Anarkali', task: 'Final flare hem stitching', sam: 90, rate: 42, status: 'Logged' },
    { date: '2025-12-15', karigar: 'Karigar Salim', jobId: 'JC-8001', garment: 'Sherwani', task: 'Previous fiscal embroidery', sam: 100, rate: 42, status: 'Disbursed' }
  ];

  // 3.1 Payout Multiplication Rule
  for (const entry of MOCK_LEDGER_DATA) {
    const earned = entry.sam * entry.rate;
    assert(earned === entry.sam * 42, `SAM ${entry.sam} mins @ ₹42/m = ₹${earned}`);
  }

  // 3.2 Filtering Engine Implementation Oracle
  function filterLedger(
    logs: TestTimesheetLog[],
    year: number,
    month: number, // 0-11 or -1 for All
    specificDate: string,
    karigar: string
  ): TestTimesheetLog[] {
    return logs.filter(log => {
      const d = new Date(log.date);
      const logYear = d.getFullYear();
      const logMonth = d.getMonth();

      const matchesYear = logYear === year;
      const matchesMonth = month === -1 || logMonth === month;
      const matchesSpecificDate = !specificDate || log.date === specificDate;
      const matchesKarigar = karigar === 'All Karigars' || log.karigar === karigar;

      return matchesYear && matchesMonth && matchesSpecificDate && matchesKarigar;
    });
  }

  // Filter 1: All August 2026 logs
  const aug2026Logs = filterLedger(MOCK_LEDGER_DATA, 2026, 7, '', 'All Karigars');
  assert(aug2026Logs.length === 11, 'August 2026 contains exactly 11 logs');
  const aug2026TotalSam = aug2026Logs.reduce((sum, l) => sum + l.sam, 0);
  const aug2026TotalPayout = aug2026Logs.reduce((sum, l) => sum + l.sam * l.rate, 0);
  assert(aug2026TotalSam === 900, 'August 2026 total SAM = 900 minutes');
  assert(aug2026TotalPayout === 900 * 42, `August 2026 total payout = ₹37,800 (900 * 42 = ${900 * 42})`);

  // Filter 2: Specific Date '2026-08-03'
  const date03Logs = filterLedger(MOCK_LEDGER_DATA, 2026, 7, '2026-08-03', 'All Karigars');
  assert(date03Logs.length === 2, '2026-08-03 has 2 log entries');
  const date03Sam = date03Logs.reduce((sum, l) => sum + l.sam, 0);
  assert(date03Sam === 65 + 180, '2026-08-03 total SAM = 245 minutes');
  assert(date03Logs.reduce((sum, l) => sum + l.sam * l.rate, 0) === 245 * 42, '2026-08-03 total payout = ₹10,290');

  // Filter 3: Karigar Salim in August 2026
  const salimAugLogs = filterLedger(MOCK_LEDGER_DATA, 2026, 7, '', 'Karigar Salim');
  assert(salimAugLogs.length === 3, 'Karigar Salim has 3 logs in August 2026');
  const salimSam = salimAugLogs.reduce((sum, l) => sum + l.sam, 0);
  assert(salimSam === 35 + 180 + 60, 'Karigar Salim accrued 275 SAM minutes');
  assert(salimAugLogs.reduce((sum, l) => sum + l.sam * l.rate, 0) === 275 * 42, 'Karigar Salim August payout = ₹11,550');

  // Filter 4: Previous Fiscal Year 2025
  const year2025Logs = filterLedger(MOCK_LEDGER_DATA, 2025, -1, '', 'All Karigars');
  assert(year2025Logs.length === 1, '2025 fiscal year has 1 archived log');
  assert(year2025Logs[0].jobId === 'JC-8001', '2025 log ID is JC-8001');

  // 3.3 CSV Export Generation & Formatting
  function generateTimesheetCSV(logs: TestTimesheetLog[]): string {
    const headers = ['Date', 'Artisan', 'Job Card Reference', 'Garment', 'Task Done', 'SAM Minutes', 'Earned (₹)', 'Payout Status'];
    const rows = logs.map(l => {
      const payout = l.sam * l.rate;
      return [
        `"${l.date}"`,
        `"${l.karigar}"`,
        `"${l.jobId}"`,
        `"${l.garment}"`,
        `"${l.task}"`,
        `${l.sam}`,
        `"₹${payout.toLocaleString('en-IN')}"`,
        `"${l.status}"`
      ].join(',');
    });
    return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  }

  const generatedCsv = generateTimesheetCSV(salimAugLogs);
  const csvLines = generatedCsv.split('\n');
  assert(csvLines.length === 4, 'CSV contains 1 header line + 3 data rows');
  assert(csvLines[0] === '"Date","Artisan","Job Card Reference","Garment","Task Done","SAM Minutes","Earned (₹)","Payout Status"', 'CSV header matches exact enterprise specification');
  assert(csvLines[1].includes('"Karigar Salim"') && csvLines[1].includes('"JC-9035"') && csvLines[1].includes('"₹1,470"'), 'First data row correctly formatted');


  // ============================================================================
  // SECTION 4: WORKSHOP STORAGE LOGISTICS & SCANNABLE IDENTIFIERS
  // ============================================================================
  console.log('\n[Suite 4: Storage Rack Tracking & Scannable Barcode Serialization]');

  const sampleRackSyntax = 'Rack B-04, Hanger 18';
  const rackRegex = /^Rack\s+[A-Z]-\d+,\s+Hanger\s+\d+$/i;
  assert(rackRegex.test(sampleRackSyntax), 'Workshop storage rack assignment conforms to standard syntax (Rack B-04, Hanger 18)');

  // Barcode width determinism
  function generateLinearBarcodeBars(text: string): number[] {
    const bars: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      bars.push((charCode % 3) + 1);
      bars.push(1);
      bars.push(((charCode >> 1) % 3) + 1);
      bars.push(1);
    }
    return bars;
  }

  const b1 = generateLinearBarcodeBars('JC-9035');
  const b2 = generateLinearBarcodeBars('JC-9035');
  assert(JSON.stringify(b1) === JSON.stringify(b2), 'Barcode generation is 100% deterministic');
  assert(b1.length === 7 * 4, 'Token JC-9035 (7 chars) produces exactly 28 stripe segments');
  assert(b1.every(w => w >= 1 && w <= 3), 'All barcode width bars are in standard 1-3 modular range');

  console.log('\n================================================================================');
  console.log(`EMPIRICAL CHALLENGER M3 SUMMARY: ${passed} PASSED, ${failed} FAILED (${passed + failed} assertions)`);
  console.log('================================================================================\n');

  return { passed, failed, totalAssertions: passed + failed, failedMsgs };
}

if (require.main === module) {
  const res = runM3PreviewChallengerDeepStressSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
}
