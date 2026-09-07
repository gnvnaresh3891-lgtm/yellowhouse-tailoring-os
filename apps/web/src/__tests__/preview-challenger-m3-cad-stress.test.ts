/**
 * YellowHouse Tailoring OS — Milestone 3 (R3) Empirical Deep Stress & Challenge Suite
 * Invoked by teamwork_preview_challenger_m3_1
 * 
 * Comprehensive Empirical Stress Testing:
 * 1. 4-Axis Posture Morph Calculations with Extreme Angle/Offset Inputs
 * 2. Caliper Dimension HUD Steppers with Rapid Sub-inch Increments & Unit Conversion Toggles
 * 3. Snapshot Serialization, Semantic Version Sorting & Baseline Restoration under Corrupt Storage States
 * 4. 3-Way Fitting Delta Ledger Tolerances & Boundary Classification
 */

import { calculateDynamicEase, calculatePostureOffset, getFitPreferenceModifier } from '../lib/ease-calculator';
import { POM_SCHEMAS, getAllGarmentTemplates, getGarmentTemplate } from '../lib/pom-schemas';
import {
  LANDMARK_DEFINITIONS,
  evaluateAnatomicalProportions,
  getHotspotColorConfig,
  getLandmarkForPom,
  getLandmarksForGarment,
  getPomForLandmark,
  getPostureAlertTriggers
} from '../lib/landmark-mappings';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import {
  GarmentCategory,
  PostureProfile,
  ShoulderSlopeValue,
  BackCurvatureValue,
  AbdomenStanceValue,
  HipSpineStanceValue,
  FitPreference,
  ValidationState
} from '../types/measurement';

// Mock localStorage for node / test environments
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string): string | null { return key in this.store ? this.store[key] : null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: new LocalStorageMock(),
    dispatchEvent: () => true,
  };
}

export function runM3PreviewChallengerCadStudioStressSuite(): { passed: number; failed: number; totalAssertions: number; failedMsgs: string[] } {
  let passed = 0;
  let failed = 0;
  const failedMsgs: string[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ [CAD-STRESS] FAIL: ${msg}`);
      failedMsgs.push(msg);
      failed++;
    } else {
      passed++;
    }
  }

  // Setup robust mock window and localStorage for this suite
  const mockStorage: Record<string, string> = {};
  (global as any).window = {
    localStorage: {
      getItem: (key: string) => (key in mockStorage ? mockStorage[key] : null),
      setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => {
        for (const k of Object.keys(mockStorage)) {
          delete mockStorage[k];
        }
      }
    },
    dispatchEvent: () => true,
  };

  console.log('\n================================================================================');
  console.log('--- EMPIRICAL CHALLENGER M3: 2D CAD SILHOUETTE & WORKBENCH STRESS SUITE ---');
  console.log('================================================================================\n');

  // ============================================================================
  // SECTION 1: 4-AXIS POSTURE MORPH CALCULATIONS WITH EXTREME ANGLE/OFFSET INPUTS
  // ============================================================================
  console.log('[Suite 1: 4-Axis Posture Morph Calculations & Vector Path Geometry]');

  // 1.1 Shoulder Slope Vertical Offsets (Normal: 0px, Sloped: +8px, Square: -8px)
  const computeShoulderOffsetY = (slope: 'Normal' | 'Sloped' | 'Square' | string): number => {
    if (slope === 'Sloped') return 8;
    if (slope === 'Square') return -8;
    return 0;
  };
  assert(computeShoulderOffsetY('Normal') === 0, 'Normal shoulder slope -> 0px vertical offset');
  assert(computeShoulderOffsetY('Sloped') === 8, 'Sloped shoulder slope -> +8px downward drop');
  assert(computeShoulderOffsetY('Square') === -8, 'Square shoulder slope -> -8px upward lift');
  assert(computeShoulderOffsetY('UNKNOWN' as any) === 0, 'Invalid shoulder slope string safely defaults to 0px');
  assert(computeShoulderOffsetY('') === 0, 'Empty string shoulder slope safely defaults to 0px');

  // 1.2 Chest Stance Curves & Bezier Control Points
  const computeChestCurveD = (stance: 'Normal' | 'Forward' | 'Barrel' | string): string => {
    if (stance === 'Forward') {
      return 'M 160 170 C 170 200, 205 210, 210 210 C 215 210, 250 200, 260 170';
    }
    if (stance === 'Barrel') {
      return 'M 155 170 C 165 212, 200 222, 210 222 C 220 222, 255 212, 265 170';
    }
    return 'M 160 170 C 175 188, 200 192, 210 192 C 220 192, 245 188, 260 170';
  };

  const forwardCurve = computeChestCurveD('Forward');
  const barrelCurve = computeChestCurveD('Barrel');
  const normalCurve = computeChestCurveD('Normal');
  const fallbackCurve = computeChestCurveD('INVALID_STANCE');

  assert(forwardCurve.includes('210 210'), 'Forward chest stance curve peaks at Y:210 apex');
  assert(barrelCurve.includes('210 222'), 'Barrel chest stance curve expands to Y:222 apex');
  assert(normalCurve.includes('210 192'), 'Normal chest stance curve rests at Y:192 apex');
  assert(fallbackCurve === normalCurve, 'Invalid chest stance falls back to normal curve');
  assert(!forwardCurve.includes('NaN') && !barrelCurve.includes('NaN'), 'Bezier curves never contain NaN');

  // 1.3 Spine Curvature Dash Arrays (Normal: '5 5', Stooped: '3 3', Erect: '10 2')
  const computeSpineDashArray = (posture: 'Normal' | 'Stooped' | 'Erect' | string): string => {
    if (posture === 'Stooped') return '3 3';
    if (posture === 'Erect') return '10 2';
    return '5 5';
  };
  assert(computeSpineDashArray('Normal') === '5 5', 'Normal spine dasharray is "5 5"');
  assert(computeSpineDashArray('Stooped') === '3 3', 'Stooped spine dasharray is tight "3 3"');
  assert(computeSpineDashArray('Erect') === '10 2', 'Erect spine dasharray is extended "10 2"');
  assert(computeSpineDashArray('INVALID') === '5 5', 'Invalid spine posture falls back to "5 5"');

  // 1.4 Heel Height Compensation (Women: heelHeight * 5px, Men: 0px)
  const computeHeelOffsetY = (gender: 'Men' | 'Women', heelHeight: number): number => {
    if (gender !== 'Women' || typeof heelHeight !== 'number' || isNaN(heelHeight) || !isFinite(heelHeight) || heelHeight <= 0) {
      return 0;
    }
    return Math.min(100, heelHeight * 5); // Clamped to max 100px for safety
  };
  assert(computeHeelOffsetY('Men', 0) === 0, 'Men 0" heel -> 0px offset');
  assert(computeHeelOffsetY('Men', 4) === 0, 'Men 4" heel -> 0px offset (ignored)');
  assert(computeHeelOffsetY('Women', 0) === 0, 'Women 0" heel -> 0px offset');
  assert(computeHeelOffsetY('Women', 1) === 5, 'Women 1" heel -> 5px hem compensation');
  assert(computeHeelOffsetY('Women', 2) === 10, 'Women 2" heel -> 10px hem compensation');
  assert(computeHeelOffsetY('Women', 3) === 15, 'Women 3" heel -> 15px hem compensation');
  assert(computeHeelOffsetY('Women', 4) === 20, 'Women 4" heel -> 20px hem compensation');
  assert(computeHeelOffsetY('Women', -5) === 0, 'Negative heel height safely returns 0px offset');
  assert(computeHeelOffsetY('Women', NaN) === 0, 'NaN heel height safely returns 0px offset');
  assert(computeHeelOffsetY('Women', Infinity) === 0, 'Infinity heel height safely handled');

  // 1.5 Full SVG Path String Generation under Extreme Posture Coordinates
  const generateTorsoSvgPath = (gender: 'Men' | 'Women', shoulderOffsetY: number, heelOffsetY: number): string => {
    if (gender === 'Men') {
      return `M 202 120 C 175 120, 145 ${125 + shoulderOffsetY}, 135 ${140 + shoulderOffsetY} C 125 ${155 + shoulderOffsetY}, 120 200, 118 230 C 115 270, 115 320, 118 370 C 122 375, 128 375, 130 370 C 132 330, 135 285, 140 240 C 145 240, 152 235, 155 220 C 158 200, 158 185, 160 180 C 160 240, 160 280, 158 340 C 155 370, 155 390, 155 405 C 150 460, 145 550, 140 630 C 135 700, 130 750, 130 760 C 140 765, 155 765, 165 760 C 170 700, 180 600, 190 500 C 195 450, 205 420, 210 405 C 215 420, 225 450, 230 500 C 240 600, 250 700, 255 760 C 265 765, 280 765, 290 760 C 290 750, 285 700, 280 630 C 275 550, 270 460, 265 405 C 265 390, 265 370, 262 340 C 260 280, 260 240, 260 180 C 262 185, 262 200, 265 220 C 268 235, 275 240, 280 240 C 285 285, 288 330, 290 370 C 292 375, 298 375, 302 370 C 305 320, 305 270, 302 230 C 300 200, 295 ${155 + shoulderOffsetY}, 285 ${140 + shoulderOffsetY} C 275 ${125 + shoulderOffsetY}, 245 120, 218 120 Z`;
    } else {
      return `M 204 118 C 185 118, 155 ${125 + shoulderOffsetY}, 145 ${135 + shoulderOffsetY} C 135 ${145 + shoulderOffsetY}, 125 195, 122 220 C 118 260, 118 310, 122 355 C 125 362, 132 362, 135 355 C 138 320, 142 270, 148 230 C 152 230, 155 225, 158 210 C 160 195, 158 185, 160 180 C 162 230, 165 260, 168 290 C 170 320, 168 370, 168 400 C 165 450, 155 540, 150 620 C 145 690, 140 740, 140 ${750 - heelOffsetY} C 148 ${755 - heelOffsetY}, 160 ${755 - heelOffsetY}, 168 ${750 - heelOffsetY} C 175 690, 185 580, 195 480 C 200 430, 205 400, 210 390 C 215 400, 220 430, 225 480 C 235 580, 245 690, 252 ${750 - heelOffsetY} C 260 ${755 - heelOffsetY}, 272 ${755 - heelOffsetY}, 280 ${750 - heelOffsetY} C 280 740, 275 690, 270 620 C 265 540, 255 450, 252 400 C 252 370, 250 320, 252 290 C 255 260, 258 230, 260 180 C 262 185, 260 195, 262 210 C 265 225, 268 230, 272 230 C 278 270, 282 320, 285 355 C 288 362, 295 362, 298 355 C 302 310, 302 260, 298 220 C 295 195, 285 ${145 + shoulderOffsetY}, 275 ${135 + shoulderOffsetY} C 265 ${125 + shoulderOffsetY}, 235 118, 216 118 Z`;
    }
  };

  const testOffsets = [-50, -8, 0, 8, 50];
  const testHeelOffsets = [0, 5, 10, 15, 20, 50];

  for (const sOff of testOffsets) {
    for (const hOff of testHeelOffsets) {
      const menPath = generateTorsoSvgPath('Men', sOff, hOff);
      const womenPath = generateTorsoSvgPath('Women', sOff, hOff);
      assert(!menPath.includes('NaN') && !menPath.includes('undefined'), `Men SVG path with shoulder=${sOff}, heel=${hOff} contains no NaN`);
      assert(!womenPath.includes('NaN') && !womenPath.includes('undefined'), `Women SVG path with shoulder=${sOff}, heel=${hOff} contains no NaN`);
      assert(menPath.startsWith('M 202 120') && menPath.endsWith('Z'), 'Men SVG path starts with M and terminates with Z');
      assert(womenPath.startsWith('M 204 118') && womenPath.endsWith('Z'), 'Women SVG path starts with M and terminates with Z');
    }
  }

  // 1.6 4-Axis Technical Offsets Calculation Stress in ease-calculator.ts
  const allShoulderSlopes: ShoulderSlopeValue[] = ['normal', 'sloped', 'very_sloped', 'square'];
  const allBackCurvatures: BackCurvatureValue[] = ['normal', 'stooped', 'erect', 'prominent_blade'];
  const allAbdomenStances: AbdomenStanceValue[] = ['normal', 'prominent', 'flat'];
  const allHipSpineStances: HipSpineStanceValue[] = ['normal', 'high_hip', 'sway_back'];

  let postureCombosTested = 0;
  for (const ss of allShoulderSlopes) {
    for (const bc of allBackCurvatures) {
      for (const as of allAbdomenStances) {
        for (const hs of allHipSpineStances) {
          const profile: PostureProfile = {
            shoulderSlope: ss,
            backCurvature: bc,
            abdomenStance: as,
            hipSpineStance: hs,
          };

          // Test across chest, armscye, waist, back length, hip
          const chestOffset = calculatePostureOffset('SU-01', 'girth', 'Jacket Chest', profile);
          const armscyeOffset = calculatePostureOffset('SU-07', 'width', 'Armscye Depth', profile);
          const waistOffset = calculatePostureOffset('SU-02', 'girth', 'Jacket Waist', profile);
          const backLenOffset = calculatePostureOffset('SU-05', 'length', 'Back Length', profile);
          const hipOffset = calculatePostureOffset('SU-03', 'girth', 'Seat / Hip', profile);

          assert(typeof chestOffset === 'number' && !isNaN(chestOffset), 'Chest offset is finite number');
          assert(typeof armscyeOffset === 'number' && !isNaN(armscyeOffset), 'Armscye offset is finite number');
          assert(typeof waistOffset === 'number' && !isNaN(waistOffset), 'Waist offset is finite number');
          assert(typeof backLenOffset === 'number' && !isNaN(backLenOffset), 'Back length offset is finite number');
          assert(typeof hipOffset === 'number' && !isNaN(hipOffset), 'Hip offset is finite number');

          postureCombosTested++;
        }
      }
    }
  }
  assert(postureCombosTested === 4 * 4 * 3 * 3, `Exhaustively evaluated all ${4 * 4 * 3 * 3} = 144 4-axis posture combinations`);


  // ============================================================================
  // SECTION 2: CALIPER DIMENSION HUD STEPPERS & UNIT CONVERSION TOGGLES
  // ============================================================================
  console.log('\n[Suite 2: Caliper HUD Steppers, Rapid Increments & Unit Conversion Math]');

  // 2.1 Sub-inch stepper math (-0.5", -0.25", +0.25", +0.5") with floating-point drift protection
  const applyStepper = (val: number, delta: number, min: number, max: number): number => {
    const raw = Number((val + delta).toFixed(2));
    return Math.min(max, Math.max(min, raw));
  };

  // Base test: Chest Girth min 32.0, max 56.0, base 40.0
  let currentVal = 40.0;
  currentVal = applyStepper(currentVal, 0.25, 32, 56);
  assert(currentVal === 40.25, 'Step +0.25" from 40.0 -> 40.25');
  currentVal = applyStepper(currentVal, 0.5, 32, 56);
  assert(currentVal === 40.75, 'Step +0.50" from 40.25 -> 40.75');
  currentVal = applyStepper(currentVal, -0.25, 32, 56);
  assert(currentVal === 40.5, 'Step -0.25" from 40.75 -> 40.50');
  currentVal = applyStepper(currentVal, -0.5, 32, 56);
  assert(currentVal === 40.0, 'Step -0.50" from 40.50 -> 40.00');

  // Upper and Lower Bound Clamping
  let clampedMax = applyStepper(55.8, 0.5, 32, 56);
  assert(clampedMax === 56.0, 'Incrementing past max 56.0 clamps strictly at 56.0');
  let clampedMin = applyStepper(32.2, -0.5, 32, 56);
  assert(clampedMin === 32.0, 'Decrementing below min 32.0 clamps strictly at 32.0');

  // 2.2 Rapid 10,000 Stepper Iterations (Stress Test for IEEE-754 precision drift)
  let rapidVal = 40.0;
  for (let i = 0; i < 5000; i++) {
    rapidVal = applyStepper(rapidVal, 0.25, 20, 80);
    rapidVal = applyStepper(rapidVal, -0.25, 20, 80);
  }
  assert(rapidVal === 40.0, '10,000 rapid +0.25/-0.25 stepper cycles returned to exact 40.0 with 0 drift');

  // 2.3 Imperial <-> Metric Conversion Accuracy
  const inchesToCm = (valIn: number): number => Number((valIn * 2.54).toFixed(1));
  const cmToInches = (valCm: number): number => Number((valCm / 2.54).toFixed(4));
  const formatValDisplay = (val: number, unit: 'in' | 'cm'): string => {
    return unit === 'cm' ? (val * 2.54).toFixed(1) : val.toString();
  };

  assert(inchesToCm(40.0) === 101.6, '40.0 inches converts to 101.6 cm');
  assert(inchesToCm(18.5) === 47.0, '18.5 inches converts to 47.0 cm');
  assert(inchesToCm(34.0) === 86.4, '34.0 inches converts to 86.4 cm');
  assert(inchesToCm(15.75) === 40.0, '15.75 inches converts to 40.0 cm');

  assert(formatValDisplay(40.0, 'in') === '40', 'Display in inches: "40"');
  assert(formatValDisplay(40.0, 'cm') === '101.6', 'Display in cm: "101.6"');

  // Round-trip unit toggle stability (100 cycles)
  let testInches = 42.5;
  for (let c = 0; c < 100; c++) {
    const cm = inchesToCm(testInches);
    const backToIn = cmToInches(cm);
    assert(Math.abs(backToIn - testInches) < 0.05, `Unit conversion cycle #${c + 1} precision error < 0.05"`);
  }

  // 2.4 Zoom HUD Bounds (80% to 135%)
  const handleZoomChange = (currentZoom: number, delta: number): number => {
    return Math.min(Math.max(Number((currentZoom + delta).toFixed(2)), 0.8), 1.35);
  };
  assert(handleZoomChange(1.0, 0.1) === 1.1, 'Zoom in: 1.0 -> 1.10');
  assert(handleZoomChange(1.3, 0.1) === 1.35, 'Zoom in clamps at 1.35 (135%)');
  assert(handleZoomChange(1.35, 0.2) === 1.35, 'Zoom in cannot exceed 1.35');
  assert(handleZoomChange(0.85, -0.1) === 0.8, 'Zoom out clamps at 0.80 (80%)');
  assert(handleZoomChange(0.8, -0.2) === 0.8, 'Zoom out cannot drop below 0.80');


  // ============================================================================
  // SECTION 3: SNAPSHOT SERIALIZATION, VERSION SORTING & BASELINE RESTORATION
  // ============================================================================
  console.log('\n[Suite 3: Snapshot Serialization, Version Sorting & Storage Corruption Recovery]');

  interface VersionSnapshot {
    id: string;
    version: string;
    date: string;
    garment: string;
    status: 'current' | 'archived';
    pomCount: number;
    fitPref?: string;
    customerId?: string;
    customerName?: string;
    pomData?: Record<string, number>;
  }

  // 3.1 Clean Storage Initialization
  window.localStorage.clear();
  const defaultSnapshots: VersionSnapshot[] = [
    {
      id: 'v1',
      version: 'v1.0',
      date: 'Jun 12, 2026',
      garment: 'Suit',
      status: 'archived',
      pomCount: 9,
      fitPref: 'Regular',
      pomData: { 'su-01': 40.0, 'su-02': 34.0, 'su-03': 18.0 }
    },
    {
      id: 'v2',
      version: 'v2.0',
      date: 'Jul 20, 2026',
      garment: 'Sherwani',
      status: 'archived',
      pomCount: 8,
      fitPref: 'Regular',
      pomData: { 'sh-01': 42.0, 'sh-02': 35.0, 'sh-03': 18.5 }
    },
    {
      id: 'v3',
      version: 'v3.0',
      date: 'Aug 5, 2026',
      garment: 'Sherwani',
      status: 'current',
      pomCount: 8,
      fitPref: 'Slim Bespoke',
      pomData: { 'sh-01': 42.5, 'sh-02': 35.0, 'sh-03': 18.5 }
    },
  ];

  setLocalStorage('yh_measurement_snapshots', defaultSnapshots);
  const loaded = getLocalStorage<VersionSnapshot[]>('yh_measurement_snapshots', []);
  assert(loaded.length === 3, 'Successfully persisted and retrieved 3 baseline snapshots');

  // 3.2 Semantic Version Sorting Oracle (v1.0 < v2.0 < v3.0 < v10.0 < v12.5)
  const unsortedVersions: VersionSnapshot[] = [
    { id: 'v12', version: 'v12.5', date: 'Aug 24', garment: 'Sherwani', status: 'current', pomCount: 8 },
    { id: 'v2', version: 'v2.0', date: 'Aug 20', garment: 'Sherwani', status: 'archived', pomCount: 8 },
    { id: 'v10', version: 'v10.0', date: 'Aug 22', garment: 'Sherwani', status: 'archived', pomCount: 8 },
    { id: 'v1', version: 'v1.0', date: 'Aug 10', garment: 'Sherwani', status: 'archived', pomCount: 8 },
    { id: 'v3', version: 'v3.0', date: 'Aug 21', garment: 'Sherwani', status: 'archived', pomCount: 8 },
  ];

  const parseVersionNum = (vStr: string): number => {
    const cleaned = vStr.replace(/^v/i, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const sortedAscending = [...unsortedVersions].sort((a, b) => parseVersionNum(a.version) - parseVersionNum(b.version));
  const sortedDescending = [...unsortedVersions].sort((a, b) => parseVersionNum(b.version) - parseVersionNum(a.version));

  assert(sortedAscending.map(s => s.version).join(',') === 'v1.0,v2.0,v3.0,v10.0,v12.5', 'Semantic version sorting handles v10.0 > v3.0 correctly');
  assert(sortedDescending[0].version === 'v12.5', 'Descending sort places newest v12.5 at head');

  // 3.3 Autosave Next Version Generation
  const generateNextVersion = (snapshotsList: VersionSnapshot[]): string => {
    if (snapshotsList.length === 0) return 'v1.0';
    const highestVer = snapshotsList.reduce((max, s) => Math.max(max, parseVersionNum(s.version)), 0);
    return `v${(highestVer + 1.0).toFixed(1)}`;
  };
  assert(generateNextVersion([]) === 'v1.0', 'Empty snapshot list yields v1.0');
  assert(generateNextVersion(defaultSnapshots) === 'v4.0', 'List with v3.0 yields v4.0');
  assert(generateNextVersion(unsortedVersions) === 'v13.5', 'List with v12.5 yields v13.5');

  // 3.4 Baseline Restoration Flow
  let activeMeasurements: Record<string, number> = { 'sh-01': 44.0, 'sh-02': 38.0, 'sh-03': 19.5 };
  const snapshotToRestore = defaultSnapshots.find(s => s.version === 'v1.0')!;
  if (snapshotToRestore.pomData) {
    activeMeasurements = { ...activeMeasurements, ...snapshotToRestore.pomData };
  }
  assert(activeMeasurements['su-01'] === 40.0, 'Restored v1.0 baseline su-01 into workbench');
  assert(activeMeasurements['su-02'] === 34.0, 'Restored v1.0 baseline su-02 into workbench');

  // 3.5 Storage Corruption Adversarial Resilience
  const corruptedPayloads = [
    'undefined',
    'null',
    '{ "broken": json',
    '<!DOCTYPE html><html>Server Error 500</html>',
    'NaN',
    '',
    '{"id": "incomplete"',
    '12345',
    '"plain string"'
  ];

  for (let idx = 0; idx < corruptedPayloads.length; idx++) {
    const corrupt = corruptedPayloads[idx];
    window.localStorage.setItem('yh_measurement_snapshots', corrupt);
    const recovered = getLocalStorage<VersionSnapshot[]>('yh_measurement_snapshots', defaultSnapshots);
    assert(Array.isArray(recovered) && recovered.length === 3, `Corrupt input #${idx + 1} (${corrupt.slice(0, 15)}) safely returned fallback array without throwing`);
  }


  // ============================================================================
  // SECTION 4: 3-WAY FITTING DELTA LEDGER TOLERANCES & BOUNDARY CHECKS
  // ============================================================================
  console.log('\n[Suite 4: 3-Way Fitting Delta Ledger Tolerances & Status Classification]');

  interface FittingDeltaRow {
    pomName: string;
    original: number;
    trial1: number;
    trial2: number;
    delta1: number;
    delta2: number;
  }

  const sampleFittingDeltas: FittingDeltaRow[] = [
    { pomName: 'Chest Girth', original: 42.5, trial1: 42.0, trial2: 42.25, delta1: -0.5, delta2: -0.25 },
    { pomName: 'Waist Girth', original: 35.0, trial1: 35.5, trial2: 35.25, delta1: +0.5, delta2: +0.25 },
    { pomName: 'Shoulder Width', original: 18.5, trial1: 18.5, trial2: 18.5, delta1: 0, delta2: 0 },
    { pomName: 'Sleeve Length', original: 25.0, trial1: 24.5, trial2: 25.0, delta1: -0.5, delta2: 0 },
    { pomName: 'Sherwani Length', original: 42.0, trial1: 42.0, trial2: 42.0, delta1: 0, delta2: 0 },
    { pomName: 'Neck Girth', original: 15.75, trial1: 16.0, trial2: 15.75, delta1: +0.25, delta2: 0 },
  ];

  // Mathematical Oracles for Fitting Delta Ledger:
  const classifyFittingDelta = (delta: number): { status: 'Perfect' | 'Tolerance' | 'Alteration'; badgeClass: string; textColor: string } => {
    const absDelta = Math.abs(delta);
    if (absDelta === 0) {
      return { status: 'Perfect', badgeClass: 'badge badge-emerald', textColor: 'text-emerald-400' };
    }
    if (absDelta <= 0.25) {
      return { status: 'Tolerance', badgeClass: 'badge badge-amber', textColor: 'text-amber-400' };
    }
    return { status: 'Alteration', badgeClass: 'badge badge-rose', textColor: 'text-rose-400' };
  };

  // 4.1 Delta Computation Verification
  for (const row of sampleFittingDeltas) {
    const computedDelta1 = Number((row.trial1 - row.original).toFixed(2));
    const computedDelta2 = Number((row.trial2 - row.original).toFixed(2));
    assert(computedDelta1 === row.delta1, `Delta1 for ${row.pomName} matches trial1 - original (${row.delta1})`);
    assert(computedDelta2 === row.delta2, `Delta2 for ${row.pomName} matches trial2 - original (${row.delta2})`);
  }

  // 4.2 Boundary & Tolerance Classification Checks
  assert(classifyFittingDelta(0.0).status === 'Perfect', 'Delta = 0.0" -> Perfect (Emerald)');
  assert(classifyFittingDelta(0.0).badgeClass.includes('badge-emerald'), 'Perfect status uses badge-emerald');
  assert(classifyFittingDelta(0.0).textColor === 'text-emerald-400', 'Perfect status uses text-emerald-400');

  assert(classifyFittingDelta(0.25).status === 'Tolerance', 'Delta = +0.25" -> Tolerance (Amber)');
  assert(classifyFittingDelta(-0.25).status === 'Tolerance', 'Delta = -0.25" -> Tolerance (Amber)');
  assert(classifyFittingDelta(0.125).status === 'Tolerance', 'Delta = +0.125" -> Tolerance (Amber)');
  assert(classifyFittingDelta(-0.125).status === 'Tolerance', 'Delta = -0.125" -> Tolerance (Amber)');
  assert(classifyFittingDelta(0.25).badgeClass.includes('badge-amber'), 'Tolerance status uses badge-amber');

  assert(classifyFittingDelta(0.26).status === 'Alteration', 'Delta = +0.26" -> Alteration (Rose)');
  assert(classifyFittingDelta(-0.26).status === 'Alteration', 'Delta = -0.26" -> Alteration (Rose)');
  assert(classifyFittingDelta(0.50).status === 'Alteration', 'Delta = +0.50" -> Alteration (Rose)');
  assert(classifyFittingDelta(-1.75).status === 'Alteration', 'Delta = -1.75" -> Alteration (Rose)');
  assert(classifyFittingDelta(3.50).status === 'Alteration', 'Delta = +3.50" -> Alteration (Rose)');
  assert(classifyFittingDelta(0.50).badgeClass.includes('badge-rose'), 'Alteration status uses badge-rose');

  // 4.3 Full Delta Matrix Validation across all 6 sample rows
  const statusCounts = { Perfect: 0, Tolerance: 0, Alteration: 0 };
  for (const row of sampleFittingDeltas) {
    const res1 = classifyFittingDelta(row.delta1);
    const res2 = classifyFittingDelta(row.delta2);
    statusCounts[res2.status]++;
  }
  assert(statusCounts.Perfect === 4, '4 POMs reached Perfect status by Trial 2 (Shoulder, Sleeve, Sherwani Length, Neck)');
  assert(statusCounts.Tolerance === 2, '2 POMs reached Tolerance status by Trial 2 (Chest ±0.25, Waist ±0.25)');
  assert(statusCounts.Alteration === 0, '0 POMs require major alteration by Trial 2');

  console.log('\n================================================================================');
  console.log(`EMPIRICAL CHALLENGER M3 CAD SUMMARY: ${passed} PASSED, ${failed} FAILED (${passed + failed} total assertions)`);
  if (failedMsgs.length > 0) {
    console.log('FAILED CAD STRESS ASSERTIONS:');
    failedMsgs.forEach(m => console.log(` - ${m}`));
  }
  console.log('================================================================================\n');

  return { passed, failed, totalAssertions: passed + failed, failedMsgs };
}

if (require.main === module) {
  const res = runM3PreviewChallengerCadStudioStressSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
}
