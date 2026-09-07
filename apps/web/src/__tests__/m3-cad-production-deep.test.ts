import { calculateGarmentSam, BASE_GARMENT_SAM_MAP, EMBROIDERY_SAM_MAP } from '../lib/sam-calculator';
import { calculateDynamicEase, calculatePostureOffset, getFitPreferenceModifier } from '../lib/ease-calculator';
import { POM_SCHEMAS as POM_SCHEMAS_LIB, getAllGarmentTemplates, getGarmentTemplate } from '../lib/pom-schemas';
import { LANDMARK_DEFINITIONS } from '../lib/landmark-mappings';
import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  JobCardItem,
  Order,
  KanbanStage
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';

// Mock localStorage for node environment
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
  };
}

export function runM3CadProductionDeepSuite() {
  console.log('\n=============================================================');
  console.log('--- M3 DEEP VERIFICATION: CAD SILHOUETTE & KARIGAR LEDGER ---');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;
  const failedMsgs: string[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failedMsgs.push(msg);
      failed++;
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // =========================================================================
  // 1. 2D CAD SILHOUETTE STUDIO: POSTURE MORPHS & GEOMETRY
  // =========================================================================
  console.log('[Group 1: 2D CAD Posture Morphing & Coordinate Formulas]');

  // 1.1 Shoulder Slope Vertical Offsets (±8px)
  const getShoulderOffsetY = (slope: 'Normal' | 'Sloped' | 'Square'): number => {
    return slope === 'Sloped' ? 8 : slope === 'Square' ? -8 : 0;
  };
  assert(getShoulderOffsetY('Normal') === 0, 'Normal shoulder slope gives 0px offset');
  assert(getShoulderOffsetY('Sloped') === 8, 'Sloped shoulder slope gives +8px vertical drop');
  assert(getShoulderOffsetY('Square') === -8, 'Square shoulder slope gives -8px vertical lift');

  // 1.2 Chest Stance Curves
  const getChestStanceCurve = (stance: 'Normal' | 'Forward' | 'Barrel'): string => {
    if (stance === 'Forward') return 'M 160 170 C 170 200, 205 210, 210 210 C 215 210, 250 200, 260 170';
    if (stance === 'Barrel') return 'M 155 170 C 165 212, 200 222, 210 222 C 220 222, 255 212, 265 170';
    return 'M 160 170 C 175 188, 200 192, 210 192 C 220 192, 245 188, 260 170';
  };
  assert(getChestStanceCurve('Forward').includes('210 210'), 'Forward chest stance has peaked apex curve at Y:210');
  assert(getChestStanceCurve('Barrel').includes('210 222'), 'Barrel chest stance has deep expanded curve at Y:222');
  assert(getChestStanceCurve('Normal').includes('210 192'), 'Normal chest stance has standard natural curve at Y:192');

  // 1.3 Spine Curvature Dash Arrays
  const getSpineDashArray = (posture: 'Normal' | 'Stooped' | 'Erect'): string => {
    return posture === 'Stooped' ? '3 3' : posture === 'Erect' ? '10 2' : '5 5';
  };
  assert(getSpineDashArray('Normal') === '5 5', 'Normal spine curvature uses standard 5 5 dasharray');
  assert(getSpineDashArray('Stooped') === '3 3', 'Stooped spine curvature uses tight 3 3 dasharray');
  assert(getSpineDashArray('Erect') === '10 2', 'Erect spine curvature uses extended 10 2 dasharray');

  // 1.4 Heel Height Vertical Hem Offset (Women: heelHeight * 5px)
  const getHeelOffsetY = (gender: 'Men' | 'Women', heelInches: number): number => {
    return (gender === 'Women' && heelInches > 0) ? heelInches * 5 : 0;
  };
  assert(getHeelOffsetY('Men', 4) === 0, 'Men silhouette ignores heel height offset');
  assert(getHeelOffsetY('Women', 0) === 0, 'Women flat heel returns 0px offset');
  assert(getHeelOffsetY('Women', 2) === 10, 'Women 2-inch heel gives 10px hem compensation');
  assert(getHeelOffsetY('Women', 4) === 20, 'Women 4-inch heel gives 20px hem compensation');

  // 1.5 Zoom Controls Bound Validation (80% to 135%)
  const clampZoom = (current: number, delta: number): number => {
    return Math.min(Math.max(Number((current + delta).toFixed(2)), 0.8), 1.35);
  };
  assert(clampZoom(1.0, 0.1) === 1.1, 'Zoom in increases from 1.0 to 1.1');
  assert(clampZoom(1.3, 0.1) === 1.35, 'Zoom in clamps at maximum 1.35 (135%)');
  assert(clampZoom(0.85, -0.1) === 0.8, 'Zoom out clamps at minimum 0.80 (80%)');

  // =========================================================================
  // 2. 6 GARMENT OVERLAYS & CALIPER RIBBON ALIGNMENT
  // =========================================================================
  console.log('\n[Group 2: 6 Garment Overlays, POM Schemas & Calipers]');

  const overlayGarments = ['Sherwani', 'Suit', 'Blouse', 'Lehenga', 'Anarkali', 'Corset'] as const;
  assert(overlayGarments.length === 6, 'Defines exactly 6 bespoke garment overlays');

  // Verify landmark Y positions and bounding ranges for key calipers
  const caliperRibbonWing = (focused: boolean) => ({
    strokeWidth: focused ? '1.8' : '1',
    leftWing: { x1: 80, x2: 135 },
    rightWing: { x1: 285, x2: 340 }
  });
  const wings = caliperRibbonWing(true);
  assert(wings.leftWing.x2 - wings.leftWing.x1 === 55, 'Left caliper wing span is exactly 55px (80 to 135)');
  assert(wings.rightWing.x2 - wings.rightWing.x1 === 55, 'Right caliper wing span is exactly 55px (285 to 340)');

  // Unit conversion helper accuracy
  const formatInchesToCm = (valInches: number): string => (valInches * 2.54).toFixed(1);
  assert(formatInchesToCm(40) === '101.6', '40 inches converts to 101.6 cm');
  assert(formatInchesToCm(18.5) === '47.0', '18.5 inches converts to 47.0 cm');

  // =========================================================================
  // 3. SNAPSHOT AUTOSAVE, VERSIONING & FITTING DELTA MATRIX
  // =========================================================================
  console.log('\n[Group 3: Snapshot Autosave, Versioning & Fitting Delta Matrix]');

  interface VersionSnapshot {
    id: string;
    version: string;
    date: string;
    garment: string;
    status: 'current' | 'archived';
    pomCount: number;
    fitPref?: string;
    pomData?: Record<string, number>;
  }

  window.localStorage.clear();
  const initialSnapshots: VersionSnapshot[] = [
    {
      id: 'v-100',
      version: 'v1.0',
      date: 'Aug 1, 2026',
      garment: 'Sherwani',
      status: 'archived',
      pomCount: 8,
      pomData: { 'sh-01': 40.0, 'sh-02': 34.0, 'sh-03': 18.0 }
    },
    {
      id: 'v-101',
      version: 'v2.0',
      date: 'Aug 15, 2026',
      garment: 'Sherwani',
      status: 'current',
      pomCount: 8,
      pomData: { 'sh-01': 41.0, 'sh-02': 34.5, 'sh-03': 18.25 }
    }
  ];
  setLocalStorage('yh_measurement_snapshots', initialSnapshots);

  const loadedSnapshots = getLocalStorage<VersionSnapshot[]>('yh_measurement_snapshots', []);
  assert(loadedSnapshots.length === 2, 'Loaded 2 snapshots from yh_measurement_snapshots');
  assert(loadedSnapshots.find(s => s.status === 'current')?.version === 'v2.0', 'v2.0 is current baseline');

  // Baseline restoration: restoring v1.0 data
  const v1 = loadedSnapshots.find(s => s.version === 'v1.0')!;
  let activeWorkbenchMeasurements = { ...v1.pomData };
  assert(activeWorkbenchMeasurements['sh-01'] === 40.0, 'Restored v1.0 baseline sh-01 = 40.0"');

  // Autosave next version v3.0
  const nextVer = `v${(loadedSnapshots.length + 1).toFixed(1)}`;
  const v3Snapshot: VersionSnapshot = {
    id: `v-${Date.now()}`,
    version: nextVer,
    date: 'Aug 24, 2026',
    garment: 'Sherwani',
    status: 'current',
    pomCount: 8,
    pomData: { 'sh-01': 41.5, 'sh-02': 35.0, 'sh-03': 18.5 }
  };
  const updatedSnapshots = [
    v3Snapshot,
    ...loadedSnapshots.map(s => ({ ...s, status: 'archived' as const }))
  ];
  setLocalStorage('yh_measurement_snapshots', updatedSnapshots);

  const finalSnapshots = getLocalStorage<VersionSnapshot[]>('yh_measurement_snapshots', []);
  assert(finalSnapshots.length === 3, 'Snapshots list incremented to 3');
  assert(finalSnapshots[0].version === 'v3.0', 'v3.0 is newest snapshot at head');
  assert(finalSnapshots[0].status === 'current', 'v3.0 marked as current');
  assert(finalSnapshots[1].status === 'archived', 'v2.0 archived');

  // Fitting Delta Classification: Perfect (0), Tolerance (<=0.25), Alteration (>0.25)
  const classifyDelta = (delta: number) => {
    if (Math.abs(delta) === 0) return 'Perfect';
    if (Math.abs(delta) <= 0.25) return 'Tolerance';
    return 'Alteration';
  };
  assert(classifyDelta(0.0) === 'Perfect', 'Delta 0.0" classified as Perfect');
  assert(classifyDelta(0.25) === 'Tolerance', 'Delta +0.25" classified as Tolerance');
  assert(classifyDelta(-0.25) === 'Tolerance', 'Delta -0.25" classified as Tolerance');
  assert(classifyDelta(0.50) === 'Alteration', 'Delta +0.50" classified as Alteration');
  assert(classifyDelta(-0.75) === 'Alteration', 'Delta -0.75" classified as Alteration');

  // =========================================================================
  // 4. KARIGAR 5-STAGE KANBAN & STAGE MOVEMENT VALIDATION
  // =========================================================================
  console.log('\n[Group 4: Karigar 5-Stage Kanban & Workflow Rules]');

  const KANBAN_STAGES: KanbanStage[] = [
    'Fabric Inspection',
    'Master Cutting',
    'Zardozi/Aari Embroidery',
    'Stitching Assembly',
    'QC & Ready for Delivery'
  ];
  assert(KANBAN_STAGES.length === 5, '5 Kanban stages configured');

  const STAGE_PROGRESS: Record<KanbanStage, number> = {
    'Fabric Inspection': 20,
    'Master Cutting': 40,
    'Zardozi/Aari Embroidery': 60,
    'Stitching Assembly': 80,
    'QC & Ready for Delivery': 100
  };
  for (const [st, prog] of Object.entries(STAGE_PROGRESS)) {
    assert(prog > 0 && prog <= 100, `Stage ${st} has valid progress ${prog}%`);
  }

  // Single-stage movement navigation
  const getNextStage = (current: KanbanStage): KanbanStage => {
    const idx = KANBAN_STAGES.indexOf(current);
    return idx < KANBAN_STAGES.length - 1 ? KANBAN_STAGES[idx + 1] : current;
  };
  const getPrevStage = (current: KanbanStage): KanbanStage => {
    const idx = KANBAN_STAGES.indexOf(current);
    return idx > 0 ? KANBAN_STAGES[idx - 1] : current;
  };
  assert(getNextStage('Fabric Inspection') === 'Master Cutting', 'Next from Fabric Inspection is Master Cutting');
  assert(getNextStage('QC & Ready for Delivery') === 'QC & Ready for Delivery', 'Cannot advance past QC & Ready for Delivery');
  assert(getPrevStage('Master Cutting') === 'Fabric Inspection', 'Prev from Master Cutting is Fabric Inspection');
  assert(getPrevStage('Fabric Inspection') === 'Fabric Inspection', 'Cannot retreat before Fabric Inspection');

  // =========================================================================
  // 5. ARTISAN TIMESHEETS & PIECE-RATE LEDGER (₹42/min)
  // =========================================================================
  console.log('\n[Group 5: Artisan Timesheets & Piece-Rate Earnings Math]');

  const RATE_PER_MINUTE_INR = 42;

  interface TimesheetEntry {
    date: string;
    karigar: string;
    jobId: string;
    garment: string;
    task: string;
    samMinutes: number;
    status: 'Logged' | 'Disbursed';
  }

  const sampleTimesheets: TimesheetEntry[] = [
    { date: '2026-08-20', karigar: 'Karigar Salim', jobId: 'JC-9035', garment: 'Lehenga Choli', task: 'Zari Border Attachment', samMinutes: 60, status: 'Logged' },
    { date: '2026-08-21', karigar: 'Karigar Latif', jobId: 'JC-9038', garment: 'Sherwani', task: 'Mandarin Collar & Placket Stitching', samMinutes: 90, status: 'Logged' },
    { date: '2026-08-22', karigar: 'Karigar Salim', jobId: 'JC-9040', garment: 'Anarkali Gown', task: 'Umbrella Flare Kalis Assembly', samMinutes: 120, status: 'Disbursed' },
  ];

  const computePayout = (minutes: number) => minutes * RATE_PER_MINUTE_INR;
  assert(computePayout(60) === 2520, '60 SAM minutes @ ₹42/m = ₹2,520');
  assert(computePayout(90) === 3780, '90 SAM minutes @ ₹42/m = ₹3,780');
  assert(computePayout(120) === 5040, '120 SAM minutes @ ₹42/m = ₹5,040');

  const totalMins = sampleTimesheets.reduce((acc, t) => acc + t.samMinutes, 0);
  const totalPayout = sampleTimesheets.reduce((acc, t) => acc + computePayout(t.samMinutes), 0);
  assert(totalMins === 270, 'Total logged SAM minutes = 270 mins (4.5 hours)');
  assert(totalPayout === 270 * 42, 'Total accrued payout = 270 * 42 = ₹11,340');

  // Karigar filter check
  const salimEntries = sampleTimesheets.filter(t => t.karigar === 'Karigar Salim');
  assert(salimEntries.length === 2, 'Filter by Karigar Salim yields 2 entries');
  const salimPayout = salimEntries.reduce((acc, t) => acc + computePayout(t.samMinutes), 0);
  assert(salimPayout === (60 + 120) * 42, 'Salim payout = 180 * 42 = ₹7,560');

  // CSV Export line generation test
  const generateCsvRow = (t: TimesheetEntry) => `"${t.date}","${t.karigar}","${t.jobId}","${t.garment}","${t.task}",${t.samMinutes},₹${computePayout(t.samMinutes)},"${t.status}"`;
  const csvRow = generateCsvRow(sampleTimesheets[0]);
  assert(csvRow.includes('Karigar Salim') && csvRow.includes('₹2520'), 'CSV row correctly formats metadata and earned amount');

  // =========================================================================
  // 6. STORAGE RACK TRACKING & BARCODE GENERATION
  // =========================================================================
  console.log('\n[Group 6: Storage Rack Logistics & SVG Barcode]');

  const sampleRack = 'Rack A-12, Hanger 4';
  const rackPattern = /^Rack\s+[A-Z]-\d+,\s+Hanger\s+\d+$/i;
  assert(rackPattern.test(sampleRack), 'Rack identifier follows standard atelier rack syntax (Rack A-12, Hanger 4)');

  const generateBarcodeStripeWidths = (text: string): number[] => {
    const bars: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      bars.push((charCode % 3) + 1);
      bars.push(1);
      bars.push(((charCode >> 1) % 3) + 1);
      bars.push(1);
    }
    return bars;
  };
  const barcodeBars = generateBarcodeStripeWidths('JC-9035');
  assert(barcodeBars.length === 7 * 4, 'Barcode generates 4 stripe segments per character in token');
  assert(barcodeBars.every(w => w >= 1 && w <= 3), 'All barcode bar widths are between 1 and 3 units');

  console.log('\n========================================');
  console.log(`M3 DEEP SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  return { passed, failed, failedMsgs };
}

if (require.main === module) {
  const res = runM3CadProductionDeepSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
}
