/**
 * YellowHouse Tailoring OS — Milestone 4 Empirical Adversarial Stress Suite
 * Authored by challenger_m4_1 (Empirical Challenger)
 *
 * SCOPE & INVARIANTS TESTED:
 * 1. Kanban State Machine & Stage Transitions:
 *    - All 25 stage-to-stage transition combinations.
 *    - Only valid single-step transitions (|diff| <= 1) succeed.
 *    - All 16 multi-step and out-of-bounds transitions are strictly rejected.
 * 2. Rapid Circular / Bidirectional State Transitions:
 *    - Sequence: 0 -> 1 -> 0 -> 1 -> 2 -> 3 -> 2 -> 3 -> 4.
 *    - Dynamic storage rack allocation and progress percentage tracking.
 *    - Audit history growth and mid-cycle illegal jump resilience.
 * 3. Extreme & Adversarial SAM Inputs:
 *    - Base SAM for all 9 garment types + fallback defaults.
 *    - Compound 4-axis posture combinations, abnormal postures, and malformed inputs.
 *    - Customization surcharges (panel count thresholds, embroidery levels, full canvas, lining, fitting trials).
 *    - Mathematical efficiency yields with division-by-zero and negative guards.
 * 4. Piece-Rate Ledger Invariants (Strict ₹42/min):
 *    - Constant invariance (PIECE_RATE_PER_MINUTE = 42).
 *    - Small, large, fractional, zero, negative, NaN, and infinite inputs.
 *    - Timesheet aggregate calculations and INR currency formatting.
 * 5. Active Garment Timer & Operations Logistics:
 *    - Stopwatch duration formatting (MM:SS, HH:MM:SS, large hours, invalid guards).
 *    - Labor time hours/minutes breakdown.
 *    - Daily & weekly timesheet rollups and RFC 4180 CSV export generation.
 */

import {
  KanbanStage,
  JobCardItem,
  TimesheetLog,
  KANBAN_STAGES,
  STAGE_RACK_MAPPING,
  STAGE_PROGRESS_MAP,
  GARMENT_BASE_SAM_MAP,
  PIECE_RATE_PER_MINUTE,
  PIECE_RATE_PER_MINUTE_INR,
  isTransitionAllowed,
  canTransitionStage,
  getNextStage,
  getPrevStage,
  computeKanbanProgress,
  getProgressForKanbanStage,
  getDefaultRackForStage,
  executeStageTransition,
  calculatePieceRateEarnings,
  calculatePieceRatePayout,
  calculateTimesheetEarnings,
  calculateSamEfficiency,
  formatTimerDuration,
  formatDuration,
  formatLaborTime,
  formatInrCurrency,
  aggregateDailyTimesheet,
  aggregateWeeklyTimesheet,
  generateTimesheetCsv,
} from '../lib/production-utils';

import {
  calculateGarmentSam,
  BASE_GARMENT_SAM_MAP,
  EMBROIDERY_SAM_MAP,
  SamCalculationInput,
} from '../lib/sam-calculator';

import { GarmentCategory, PostureProfile } from '../types/measurement';

export interface ChallengerM4Result {
  passed: number;
  failed: number;
  findings: string[];
}

export function runChallengerM4EmpiricalStressTests(): ChallengerM4Result {
  console.log('\n====================================================================');
  console.log('--- CHALLENGER M4: EMPIRICAL ADVERSARIAL STRESS TEST HARNESS ---');
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

  // ============================================================================
  // SECTION 1: ALL 25 STAGE-TO-STAGE TRANSITION COMBINATIONS MATRIX
  // ============================================================================
  console.log('[Section 1: All 25 Stage-to-Stage Transition Combinations Matrix]');

  assert(KANBAN_STAGES.length === 5, 'KANBAN_STAGES defines exactly 5 sequential stages', '5', String(KANBAN_STAGES.length));

  let validTransitionCount = 0;
  let rejectedTransitionCount = 0;

  // Test every pair in the 5x5 matrix
  for (let i = 0; i < KANBAN_STAGES.length; i++) {
    for (let j = 0; j < KANBAN_STAGES.length; j++) {
      const fromStage = KANBAN_STAGES[i];
      const toStage = KANBAN_STAGES[j];
      const diff = Math.abs(i - j);
      const isAllowed = isTransitionAllowed(fromStage, toStage);

      // Create a test job card at fromStage
      const testJob: JobCardItem = {
        id: `JC-TEST-${i}-${j}`,
        orderId: `ORD-${i}`,
        client: 'Test Client',
        garment: 'Sherwani',
        karigar: 'Karigar Latif',
        samMinutesLogged: 30,
        samTotalEstimate: 210,
        priority: 'Normal',
        dueDate: '2026-09-30',
        progress: STAGE_PROGRESS_MAP[fromStage],
        stage: fromStage,
        rack: STAGE_RACK_MAPPING[fromStage],
        history: [],
      };

      if (diff <= 1) {
        // Valid transition (|diff| <= 1): 5 same-stage (diff=0), 4 forward (diff=1), 4 backward (diff=1) = 13
        assert(isAllowed === true, `Matrix (${i} -> ${j}): '${fromStage}' to '${toStage}' is allowed (|diff|=${diff})`);
        assert(canTransitionStage(fromStage, toStage) === true, `canTransitionStage alias (${i} -> ${j}) returns true`);

        const execRes = executeStageTransition(testJob, toStage);
        assert(execRes.success === true, `executeStageTransition (${i} -> ${j}) succeeds`);
        assert(execRes.updatedJob?.stage === toStage, `updatedJob.stage matches destination '${toStage}'`);
        assert(execRes.updatedJob?.rack === STAGE_RACK_MAPPING[toStage], `updatedJob.rack matches rack for '${toStage}'`);
        assert(execRes.updatedJob?.progress === STAGE_PROGRESS_MAP[toStage], `updatedJob.progress matches ${STAGE_PROGRESS_MAP[toStage]}%`);
        assert(execRes.updatedJob?.history?.length === 1, `updatedJob.history has 1 appended entry`);
        validTransitionCount++;
      } else {
        // Multi-step jump (|diff| >= 2): 6 forward, 6 backward = 12 internal multi-step jumps
        assert(isAllowed === false, `Matrix (${i} -> ${j}): '${fromStage}' to '${toStage}' is strictly rejected (|diff|=${diff})`);
        assert(canTransitionStage(fromStage, toStage) === false, `canTransitionStage alias (${i} -> ${j}) returns false`);

        const execRes = executeStageTransition(testJob, toStage);
        assert(execRes.success === false, `executeStageTransition (${i} -> ${j}) strictly fails`);
        assert(execRes.error !== undefined && execRes.error.includes('Invalid transition'), `executeStageTransition error message describes invalid transition`);
        assert(execRes.updatedJob === undefined, `updatedJob is undefined on failed transition`);
        rejectedTransitionCount++;
      }
    }
  }

  assert(validTransitionCount === 13, `Total valid transitions in 5x5 matrix equals 13 (5 self + 4 forward + 4 backward)`, '13', String(validTransitionCount));
  assert(rejectedTransitionCount === 12, `Total rejected multi-step jumps in 5x5 matrix equals 12`, '12', String(rejectedTransitionCount));

  // Additional 4 adversarial / out-of-bounds stage transition tests to verify all 16 multi-step/invalid rejections
  const outOfBoundsTransitions: [any, any, string][] = [
    ['Fabric Inspection', 'Unknown Workshop Stage', 'To-stage unknown string'],
    ['NonExistent Stage', 'QC & Ready for Delivery', 'From-stage unknown string'],
    ['', 'Master Cutting', 'Empty string from-stage'],
    ['Zardozi/Aari Embroidery', 'Done', 'Invalid short code stage'],
  ];

  for (const [from, to, label] of outOfBoundsTransitions) {
    const isAllowed = isTransitionAllowed(from, to);
    assert(isAllowed === false, `Out-of-bounds rejection: ${label} ('${from}' -> '${to}') returns false`);
    const dummyJob: JobCardItem = {
      id: 'JC-OOB',
      orderId: 'ORD-OOB',
      client: 'Test',
      garment: 'Suit',
      karigar: 'Test',
      samMinutesLogged: 0,
      samTotalEstimate: 240,
      priority: 'Normal',
      dueDate: '2026-09-30',
      progress: 20,
      stage: from,
    };
    const res = executeStageTransition(dummyJob, to);
    assert(res.success === false, `executeStageTransition rejects out-of-bounds ${label}`);
    rejectedTransitionCount++;
  }

  assert(rejectedTransitionCount === 16, `Total rejected multi-step and invalid transitions equals exactly 16 (12 matrix + 4 out-of-bounds)`, '16', String(rejectedTransitionCount));

  // Sequential helper functions
  assert(getNextStage('Fabric Inspection') === 'Master Cutting', 'getNextStage: Fabric Inspection -> Master Cutting');
  assert(getNextStage('Master Cutting') === 'Zardozi/Aari Embroidery', 'getNextStage: Master Cutting -> Zardozi/Aari Embroidery');
  assert(getNextStage('Zardozi/Aari Embroidery') === 'Stitching Assembly', 'getNextStage: Zardozi/Aari Embroidery -> Stitching Assembly');
  assert(getNextStage('Stitching Assembly') === 'QC & Ready for Delivery', 'getNextStage: Stitching Assembly -> QC & Ready for Delivery');
  assert(getNextStage('QC & Ready for Delivery') === null, 'getNextStage: QC & Ready for Delivery -> null (end of pipeline)');

  assert(getPrevStage('Fabric Inspection') === null, 'getPrevStage: Fabric Inspection -> null (beginning of pipeline)');
  assert(getPrevStage('Master Cutting') === 'Fabric Inspection', 'getPrevStage: Master Cutting -> Fabric Inspection');
  assert(getPrevStage('Zardozi/Aari Embroidery') === 'Master Cutting', 'getPrevStage: Zardozi/Aari Embroidery -> Master Cutting');
  assert(getPrevStage('Stitching Assembly') === 'Zardozi/Aari Embroidery', 'getPrevStage: Stitching Assembly -> Zardozi/Aari Embroidery');
  assert(getPrevStage('QC & Ready for Delivery') === 'Stitching Assembly', 'getPrevStage: QC & Ready for Delivery -> Stitching Assembly');

  // ============================================================================
  // SECTION 2: RAPID CIRCULAR / BIDIRECTIONAL TRANSITIONS
  // ============================================================================
  console.log('\n[Section 2: Rapid Circular / Bidirectional Transitions]');

  // Pipeline sequence: 0 -> 1 -> 0 -> 1 -> 2 -> 3 -> 2 -> 3 -> 4
  const transitionPath: number[] = [1, 0, 1, 2, 3, 2, 3, 4];

  let currentJob: JobCardItem = {
    id: 'JC-CIRCULAR-01',
    orderId: 'ORD-CIRCULAR-01',
    client: 'Aditya Birla',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 45,
    samTotalEstimate: 210,
    priority: 'Urgent',
    dueDate: '2026-09-25',
    progress: 20,
    stage: 'Fabric Inspection',
    rack: STAGE_RACK_MAPPING['Fabric Inspection'],
    history: [],
  };

  let stepCount = 0;
  for (const targetIdx of transitionPath) {
    stepCount++;
    const prevStage = currentJob.stage;
    const targetStage = KANBAN_STAGES[targetIdx];
    const transitionRes = executeStageTransition(currentJob, targetStage);

    assert(transitionRes.success === true, `Step ${stepCount}: Bidirectional move '${prevStage}' -> '${targetStage}' succeeded`);
    assert(transitionRes.updatedJob !== undefined, `Step ${stepCount}: updatedJob returned`);
    currentJob = transitionRes.updatedJob!;

    assert(currentJob.stage === targetStage, `Step ${stepCount}: Current stage is '${targetStage}'`);
    assert(currentJob.rack === STAGE_RACK_MAPPING[targetStage], `Step ${stepCount}: Rack synchronized to '${STAGE_RACK_MAPPING[targetStage]}'`);
    assert(currentJob.progress === STAGE_PROGRESS_MAP[targetStage], `Step ${stepCount}: Progress is ${STAGE_PROGRESS_MAP[targetStage]}%`);
    assert(currentJob.history?.length === stepCount, `Step ${stepCount}: History length is ${stepCount}`);

    const latestHistory = currentJob.history![currentJob.history!.length - 1];
    assert(latestHistory.stage === targetStage, `Step ${stepCount}: History records stage '${targetStage}'`);
    assert(latestHistory.action.includes(prevStage) && latestHistory.action.includes(targetStage), `Step ${stepCount}: History action records '${prevStage}' to '${targetStage}'`);
  }

  assert(currentJob.stage === 'QC & Ready for Delivery', 'Job successfully reached final stage QC & Ready for Delivery after 8 bidirectional moves');
  assert(currentJob.progress === 100, 'Final progress reached 100%');
  assert(currentJob.rack === 'Dispatch Rack D-12 (Ready for Delivery)', 'Final rack is Dispatch Rack D-12');

  // Mid-cycle adversarial attack: try illegal jump while in stage 4 to stage 0 or 2
  const illegalJump1 = executeStageTransition(currentJob, 'Fabric Inspection');
  assert(illegalJump1.success === false, 'Illegal jump from stage 4 back to stage 0 is rejected');
  const illegalJump2 = executeStageTransition(currentJob, 'Zardozi/Aari Embroidery');
  assert(illegalJump2.success === false, 'Illegal jump from stage 4 back to stage 2 is rejected');
  assert(currentJob.stage === 'QC & Ready for Delivery', 'Current job remains in stage 4 despite rejected illegal jump');

  // Idempotent self-transition: stage 4 -> stage 4
  const selfTransition = executeStageTransition(currentJob, 'QC & Ready for Delivery');
  assert(selfTransition.success === true, 'Self-transition in stage 4 succeeds idempotently');
  assert(selfTransition.updatedJob?.progress === 100, 'Self-transition preserves 100% progress');

  // ============================================================================
  // SECTION 3: EXTREME & ADVERSARIAL SAM INPUTS
  // ============================================================================
  console.log('\n[Section 3: Extreme & Adversarial SAM Inputs]');

  // 3.1 Base SAM for all 9 garment categories
  const expectedBaseSam: Record<GarmentCategory, number> = {
    'mens-suit': 240,
    'mens-sherwani': 210,
    'mens-shirt': 60,
    'mens-trouser': 90,
    'womens-blouse': 120,
    'womens-lehenga': 300,
    'womens-anarkali': 270,
    'womens-corset': 180,
    'womens-gown': 240,
  };

  for (const [cat, baseMins] of Object.entries(expectedBaseSam) as [GarmentCategory, number][]) {
    const res = calculateGarmentSam({ garmentCategory: cat });
    assert(res.baseSamMinutes === baseMins, `Base SAM for ${cat} equals ${baseMins}m`, String(baseMins), String(res.baseSamMinutes));
    assert(res.totalSamMinutes === baseMins, `Total SAM with zero modifiers equals base ${baseMins}m`);
    assert(res.estimatedLaborHours === Number((baseMins / 60).toFixed(1)), `Labor hours correctly computed as ${(baseMins / 60).toFixed(1)}h`);
  }

  // 3.2 Unrecognized garment category fallback
  const fallbackRes = calculateGarmentSam({ garmentCategory: 'cyberpunk-trenchcoat' as any });
  assert(fallbackRes.baseSamMinutes === 120, 'Unrecognized garment category gracefully defaults to 120m base SAM');

  // 3.3 Posture modifier permutations
  const neutralPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-suit',
    postureProfile: {
      shoulderSlope: 'normal',
      backCurvature: 'normal',
      abdomenStance: 'normal',
      hipSpineStance: 'normal',
    },
  });
  assert(neutralPostureRes.postureModifierMinutes === 0, 'Normal posture profile adds 0 minutes surcharge');

  // Maximum compound 4-axis posture surcharge:
  // very_sloped (25) + prominent_blade (20) + prominent (25) + sway_back (20) = 90 mins
  const maxPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-sherwani',
    postureProfile: {
      shoulderSlope: 'very_sloped',
      backCurvature: 'prominent_blade',
      abdomenStance: 'prominent',
      hipSpineStance: 'sway_back',
    },
  });
  assert(maxPostureRes.postureModifierMinutes === 90, 'Maximum compound 4-axis posture surcharge equals exactly 90 minutes', '90', String(maxPostureRes.postureModifierMinutes));
  assert(maxPostureRes.totalSamMinutes === 210 + 90, 'Total SAM for sherwani + max posture equals 300 minutes');

  // Unusual posture combination:
  // square (10) + erect (15) + flat (10) + high_hip (15) = 50 mins
  const unusualPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-trouser',
    postureProfile: {
      shoulderSlope: 'square',
      backCurvature: 'erect',
      abdomenStance: 'flat',
      hipSpineStance: 'high_hip',
    },
  });
  assert(unusualPostureRes.postureModifierMinutes === 50, 'Unusual posture combination (square+erect+flat+high_hip) equals 50 minutes');

  // Malformed / invalid posture fields: should not throw, gracefully add 0
  const malformedPostureRes = calculateGarmentSam({
    garmentCategory: 'mens-shirt',
    postureProfile: {
      shoulderSlope: 'slanted_weird' as any,
      backCurvature: 999 as any,
      abdomenStance: null as any,
      hipSpineStance: undefined as any,
    },
  });
  assert(malformedPostureRes.postureModifierMinutes === 0, 'Malformed posture profile safely defaults to 0 minutes without crashing');

  // 3.4 Customization surcharges: panelCount, embroidery, canvas, lining, trials
  // Panel Count:
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 0 }).customizationMinutes === 0, 'Panel count 0 adds 0m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: -10 }).customizationMinutes === 0, 'Negative panel count adds 0m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 8 }).customizationMinutes === 0, 'Panel count < 12 adds 0m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 12 }).customizationMinutes === 30, 'Panel count 12 adds 30m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 16 }).customizationMinutes === 30, 'Panel count 16 adds 30m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 17 }).customizationMinutes === 60, 'Panel count 17 adds 60m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: 10000 }).customizationMinutes === 60, 'Extreme panel count 10000 adds 60m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-lehenga', panelCount: NaN }).customizationMinutes === 0, 'NaN panel count adds 0m');

  // Embroidery Levels:
  assert(calculateGarmentSam({ garmentCategory: 'womens-blouse', embroideryLevel: 'none' }).customizationMinutes === 0, 'Embroidery none adds 0m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-blouse', embroideryLevel: 'light' }).customizationMinutes === 45, 'Embroidery light adds 45m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-blouse', embroideryLevel: 'medium' }).customizationMinutes === 120, 'Embroidery medium adds 120m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-blouse', embroideryLevel: 'heavy' }).customizationMinutes === 240, 'Embroidery heavy adds 240m');
  assert(calculateGarmentSam({ garmentCategory: 'womens-blouse', embroideryLevel: 'ultra-mega' as any }).customizationMinutes === 0, 'Invalid embroidery adds 0m');

  // Canvas & Lining & Trials:
  const bespokeSuitRes = calculateGarmentSam({
    garmentCategory: 'mens-suit',
    hasFullCanvas: true,     // +30
    hasCustomLining: true,   // +30
    fittingTrialCount: 2,    // +90 (2 * 45)
  });
  assert(bespokeSuitRes.customizationMinutes === 150, 'Full canvas (30) + Silk lining (30) + 2 trials (90) equals 150m');
  assert(bespokeSuitRes.totalSamMinutes === 240 + 150, 'Bespoke suit total SAM equals 390m (6.5 hours)');

  // Extreme fitting trials: 100 trials = 4,500m
  const extremeTrialsRes = calculateGarmentSam({ garmentCategory: 'mens-suit', fittingTrialCount: 100 });
  assert(extremeTrialsRes.customizationMinutes === 4500, '100 fitting trials adds 4,500 minutes');
  assert(extremeTrialsRes.totalSamMinutes === 240 + 4500, 'Total SAM with 100 trials equals 4,740m');
  assert(extremeTrialsRes.estimatedLaborHours === 79.0, 'Labor hours for 4,740m equals 79.0h');

  // 3.5 Mathematical SAM Efficiency Yields (division by zero and extreme guards)
  assert(calculateSamEfficiency(0, 0) === 0, 'calculateSamEfficiency(0, 0) returns 0');
  assert(calculateSamEfficiency(120, 0) === 0, 'calculateSamEfficiency(120, 0) returns 0 (division by zero safe)');
  assert(calculateSamEfficiency(0, 120) === 0, 'calculateSamEfficiency(0, 120) returns 0');
  assert(calculateSamEfficiency(-120, 60) === 0, 'calculateSamEfficiency with negative SAM returns 0');
  assert(calculateSamEfficiency(120, -60) === 0, 'calculateSamEfficiency with negative minutes returns 0');
  assert(calculateSamEfficiency(NaN, 60) === 0, 'calculateSamEfficiency with NaN SAM returns 0');
  assert(calculateSamEfficiency(120, NaN) === 0, 'calculateSamEfficiency with NaN minutes returns 0');
  assert(calculateSamEfficiency(Infinity, 60) === 0, 'calculateSamEfficiency with Infinity returns 0');

  // Precise mathematical yields
  assert(calculateSamEfficiency(60, 60) === 100.0, '60m estimated / 60m actual = 100.0% efficiency');
  assert(calculateSamEfficiency(120, 60) === 200.0, '120m estimated / 60m actual = 200.0% efficiency (2x speed)');
  assert(calculateSamEfficiency(60, 120) === 50.0, '60m estimated / 120m actual = 50.0% efficiency (0.5x speed)');
  assert(calculateSamEfficiency(210, 160) === 131.3, '210m estimated / 160m actual = 131.3% efficiency');
  assert(calculateSamEfficiency(10000, 60) === 16666.7, '10000m estimated / 60m actual = 16666.7% efficiency');
  assert(calculateSamEfficiency(60, 10000) === 0.6, '60m estimated / 10000m actual = 0.6% efficiency');

  // ============================================================================
  // SECTION 4: PIECE-RATE CALCULATIONS STRICTLY AT ₹42/MIN RATE
  // ============================================================================
  console.log('\n[Section 4: Piece-Rate Calculations Strictly at ₹42/Min Rate]');

  assert(PIECE_RATE_PER_MINUTE === 42, 'PIECE_RATE_PER_MINUTE invariant strictly equals 42', '42', String(PIECE_RATE_PER_MINUTE));
  assert(PIECE_RATE_PER_MINUTE_INR === 42, 'PIECE_RATE_PER_MINUTE_INR invariant strictly equals 42', '42', String(PIECE_RATE_PER_MINUTE_INR));

  // Small inputs
  assert(calculatePieceRateEarnings(1) === 42, '1 minute piece-rate payout is exactly ₹42');
  assert(calculatePieceRateEarnings(2) === 84, '2 minutes piece-rate payout is exactly ₹84');
  assert(calculatePieceRateEarnings(10) === 420, '10 minutes piece-rate payout is exactly ₹420');
  assert(calculatePieceRateEarnings(60) === 2520, '60 minutes (1 hr) piece-rate payout is exactly ₹2,520 (60 * 42)');

  // Large inputs
  assert(calculatePieceRateEarnings(240) === 10080, '240 minutes (Suit) piece-rate payout is exactly ₹10,080 (240 * 42)');
  assert(calculatePieceRateEarnings(1000) === 42000, '1,000 minutes piece-rate payout is exactly ₹42,000');
  assert(calculatePieceRateEarnings(10000) === 420000, '10,000 minutes piece-rate payout is exactly ₹4,20,000');

  // Fractional inputs (IEEE-754 rounding)
  assert(calculatePieceRateEarnings(0.5) === 21, '0.5 minutes (30 sec) piece-rate payout is ₹21');
  assert(calculatePieceRateEarnings(0.25) === 11, '0.25 minutes (15 sec) piece-rate payout rounds 10.5 to ₹11');
  assert(calculatePieceRateEarnings(1.5) === 63, '1.5 minutes piece-rate payout is ₹63');
  assert(calculatePieceRateEarnings(33.33) === 1400, '33.33 minutes piece-rate payout rounds 1399.86 to ₹1,400');

  // Invalid / boundary inputs
  assert(calculatePieceRateEarnings(0) === 0, '0 minutes returns ₹0');
  assert(calculatePieceRateEarnings(-1) === 0, '-1 minute returns ₹0');
  assert(calculatePieceRateEarnings(-500) === 0, '-500 minutes returns ₹0');
  assert(calculatePieceRateEarnings(NaN) === 0, 'NaN minutes returns ₹0');
  assert(calculatePieceRateEarnings(Infinity) === 0, 'Infinity minutes returns ₹0');
  assert(calculatePieceRateEarnings(-Infinity) === 0, '-Infinity minutes returns ₹0');
  assert(calculatePieceRateEarnings(null as any) === 0, 'null input returns ₹0');
  assert(calculatePieceRateEarnings(undefined as any) === 0, 'undefined input returns ₹0');

  // calculatePieceRatePayout alias
  assert(calculatePieceRatePayout(60) === calculatePieceRateEarnings(60), 'calculatePieceRatePayout alias matches calculatePieceRateEarnings');

  // calculateTimesheetEarnings with various arrays
  const emptyEarnings = calculateTimesheetEarnings([]);
  assert(emptyEarnings.totalMinutes === 0 && emptyEarnings.totalEarningsInr === 0, 'Empty timesheet logs returns 0 mins and ₹0');

  const mixedLogs = [
    { sam: 60 },
    { minutesLogged: 90 },
    { sam: 120 },
    { sam: -40 },     // corrupt / negative
    { sam: NaN },     // corrupt / NaN
    { minutesLogged: 0 },
  ];
  const aggregateResult = calculateTimesheetEarnings(mixedLogs);
  assert(aggregateResult.totalMinutes === 270, 'calculateTimesheetEarnings correctly filters out corrupt/negative values (sum=270m)', '270', String(aggregateResult.totalMinutes));
  assert(aggregateResult.totalEarningsInr === 270 * 42, 'calculateTimesheetEarnings computes ₹11,340 (270 * 42)', '11340', String(aggregateResult.totalEarningsInr));

  // Currency formatting
  assert(formatInrCurrency(0) === '₹0', 'formatInrCurrency(0) returns ₹0');
  assert(formatInrCurrency(42) === '₹42', 'formatInrCurrency(42) returns ₹42');
  assert(formatInrCurrency(2520) === '₹2,520', 'formatInrCurrency(2520) returns ₹2,520');
  assert(formatInrCurrency(10080) === '₹10,080', 'formatInrCurrency(10080) returns ₹10,080');
  assert(formatInrCurrency(420000) === '₹4,20,000', 'formatInrCurrency(420000) formats Indian numbering ₹4,20,000');
  assert(formatInrCurrency(NaN) === '₹0', 'formatInrCurrency(NaN) returns ₹0');

  // ============================================================================
  // SECTION 5: ACTIVE GARMENT TIMER FORMATTING & OPERATIONS ROLLUPS
  // ============================================================================
  console.log('\n[Section 5: Active Garment Timer Formatting & Operations Rollups]');

  // 5.1 Timer duration formatting (MM:SS and HH:MM:SS)
  assert(formatTimerDuration(0) === '00:00', 'formatTimerDuration(0) is 00:00');
  assert(formatTimerDuration(5) === '00:05', 'formatTimerDuration(5) is 00:05');
  assert(formatTimerDuration(59) === '00:59', 'formatTimerDuration(59) is 00:59');
  assert(formatTimerDuration(60) === '01:00', 'formatTimerDuration(60) is 01:00');
  assert(formatTimerDuration(75) === '01:15', 'formatTimerDuration(75) is 01:15');
  assert(formatTimerDuration(599) === '09:59', 'formatTimerDuration(599) is 09:59');
  assert(formatTimerDuration(3599) === '59:59', 'formatTimerDuration(3599) is 59:59');
  assert(formatTimerDuration(3600) === '01:00:00', 'formatTimerDuration(3600) is 01:00:00 (switches to HH:MM:SS)');
  assert(formatTimerDuration(3661) === '01:01:01', 'formatTimerDuration(3661) is 01:01:01');
  assert(formatTimerDuration(36000) === '10:00:00', 'formatTimerDuration(36000) is 10:00:00');
  assert(formatTimerDuration(86399) === '23:59:59', 'formatTimerDuration(86399) is 23:59:59');
  assert(formatTimerDuration(86400) === '24:00:00', 'formatTimerDuration(86400) is 24:00:00');
  assert(formatTimerDuration(360000) === '100:00:00', 'formatTimerDuration(360000) is 100:00:00');

  // Boundary guards for timer
  assert(formatTimerDuration(-10) === '00:00', 'formatTimerDuration(-10) safely returns 00:00');
  assert(formatTimerDuration(NaN) === '00:00', 'formatTimerDuration(NaN) safely returns 00:00');
  assert(formatTimerDuration(Infinity) === '00:00', 'formatTimerDuration(Infinity) safely returns 00:00');
  assert(formatDuration(120) === '02:00', 'formatDuration alias behaves identically');

  // 5.2 Labor time hours/minutes breakdown
  assert(formatLaborTime(0).formatted === '0h 0m', 'formatLaborTime(0) is 0h 0m');
  assert(formatLaborTime(45).formatted === '0h 45m', 'formatLaborTime(45) is 0h 45m');
  assert(formatLaborTime(60).formatted === '1h 0m', 'formatLaborTime(60) is 1h 0m');
  assert(formatLaborTime(135).formatted === '2h 15m', 'formatLaborTime(135) is 2h 15m');
  assert(formatLaborTime(10000).formatted === '166h 40m', 'formatLaborTime(10000) is 166h 40m');
  assert(formatLaborTime(-50).formatted === '0h 0m', 'formatLaborTime(-50) is 0h 0m');
  assert(formatLaborTime(NaN).formatted === '0h 0m', 'formatLaborTime(NaN) is 0h 0m');

  // 5.3 Daily and Weekly Timesheet Rollups
  const sampleTimesheets: TimesheetLog[] = [
    {
      id: 'TS-T1',
      date: '2026-09-15',
      karigar: 'Karigar Latif',
      jobId: 'JC-1',
      garment: 'Sherwani',
      stage: 'Master Cutting',
      task: 'Pattern Drafting',
      sam: 60,
      minutesLogged: 60,
      rate: 42,
      status: 'Disbursed',
    },
    {
      id: 'TS-T2',
      date: '2026-09-15',
      karigar: 'Karigar Latif',
      jobId: 'JC-1',
      garment: 'Sherwani',
      stage: 'Master Cutting',
      task: 'Scissor Cutting',
      sam: 45,
      minutesLogged: 45,
      rate: 42,
      status: 'Logged',
    },
    {
      id: 'TS-T3',
      date: '2026-09-14',
      karigar: 'Karigar Salim',
      jobId: 'JC-2',
      garment: 'Lehenga Choli',
      stage: 'Zardozi/Aari Embroidery',
      task: 'Adda Frame Handwork',
      sam: 120,
      minutesLogged: 120,
      rate: 42,
      status: 'Logged',
    },
  ];

  const dailyRollup = aggregateDailyTimesheet(sampleTimesheets, '2026-09-15');
  assert(dailyRollup.totalMinutes === 105, 'Daily rollup total minutes for 2026-09-15 is 105m (60+45)', '105', String(dailyRollup.totalMinutes));
  assert(dailyRollup.totalHours === 1.8, 'Daily rollup total hours is 1.8h (105 / 60)', '1.8', String(dailyRollup.totalHours));
  assert(dailyRollup.totalEarningsINR === 105 * 42, 'Daily rollup total earnings is ₹4,410 (105 * 42)', '4410', String(dailyRollup.totalEarningsINR));
  assert(dailyRollup.logsCount === 2, 'Daily rollup logs count is 2', '2', String(dailyRollup.logsCount));

  const weekDates = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'];
  const weeklyRollups = aggregateWeeklyTimesheet(sampleTimesheets, weekDates);
  assert(weeklyRollups.length === 2, 'Weekly rollups partitions into 2 artisans (Latif and Salim)', '2', String(weeklyRollups.length));

  const latifRollup = weeklyRollups.find((r) => r.karigar === 'Karigar Latif');
  assert(latifRollup !== undefined, 'Latif rollup found');
  assert(latifRollup!.totalSamMinutes === 105, 'Latif weekly total minutes is 105m');
  assert(latifRollup!.totalEarningsINR === 105 * 42, 'Latif weekly total earnings is ₹4,410');
  assert(latifRollup!.disbursedEarningsINR === 60 * 42, 'Latif disbursed earnings is ₹2,520 (60 * 42)');
  assert(latifRollup!.loggedEarningsINR === 45 * 42, 'Latif logged pending earnings is ₹1,890 (45 * 42)');

  // 5.4 Timesheet CSV Export Generation
  const csvContent = generateTimesheetCsv(sampleTimesheets);
  const csvLines = csvContent.trim().split('\n');
  assert(csvLines.length === 4, 'CSV output has 4 lines (1 header + 3 rows)', '4', String(csvLines.length));
  assert(csvLines[0].startsWith('Log ID,Date,Artisan,Job Card ID'), 'CSV line 0 contains expected standard headers');
  assert(csvLines[1].includes('"Karigar Latif"') && csvLines[1].includes('"Disbursed"'), 'CSV row 1 contains Latif and Disbursed');
  assert(csvLines[2].includes('"Logged"'), 'CSV row 2 contains Logged');
  assert(csvLines[3].includes('"Karigar Salim"'), 'CSV row 3 contains Salim');

  console.log(`\n====================================================================`);
  console.log(`CHALLENGER M4 SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================================\n`);

  return { passed, failed, findings };
}
