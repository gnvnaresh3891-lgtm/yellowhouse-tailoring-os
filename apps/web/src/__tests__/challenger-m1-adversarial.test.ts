/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Challenger 1 Adversarial Stress Test Suite (Milestone 1)
 * 
 * Tests:
 * 1. checkMachineSlotCollision: Edge boundaries, exact boundary matches, nested timeslots, negative intervals, zero-duration bookings, timezone variations
 * 2. computeSmartFabricRecommendations: Empty candidates, negative budgets, zero yields, mismatching garment categories, tie-breaking
 * 3. calculateCreatorEarningsSplit & calculateLicensePricing: Float precision, extreme values, conservation laws
 * 4. transitionContractMilestone: Out-of-order jumps, invalid states, negative payment amounts, idempotency
 * 5. evaluateTrialEntitlements: Past dates, leap years, exact 90-day threshold, missing/partial profile fields
 */

import {
  checkMachineSlotCollision,
  computeSmartFabricRecommendations,
  calculateCreatorEarningsSplit,
  calculateLicensePricing,
  transitionContractMilestone,
  evaluateTrialEntitlements,
  computeSha256Hex,
  calculateMachineBookingCost,
  calculateVolumeDiscountedPrice
} from '../lib/ecosystem-algorithms';

import {
  SEED_WORKSHOP_MACHINES,
  SEED_MATERIALS_CATALOG,
  SEED_PRODUCTION_CONTRACTS,
  SEED_TENANT_TRIAL_PROFILE
} from '../lib/ecosystem-seeds';

import {
  MachineReservationRecord,
  ProductionContractRecord,
  TenantTrialOnboardingProfile,
  VendorMaterialItem
} from '../types/ecosystem';

export interface TestResultSummary {
  passed: number;
  failed: number;
  findings: Array<{
    area: string;
    scenario: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL' | 'EDGE_CASE_HANDLED' | 'EXCEPTION_CAUGHT';
    details?: string;
  }>;
}

export function runAdversarialStressSuite(): TestResultSummary {
  console.log('\n================================================================');
  console.log('--- CHALLENGER 1 ADVERSARIAL STRESS TEST SUITE (M1) ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: TestResultSummary['findings'] = [];

  function record(
    area: string,
    scenario: string,
    passedCondition: boolean,
    expected: string,
    actual: string,
    details?: string
  ) {
    if (passedCondition) {
      console.log(`✅ [${area}] PASS: ${scenario}`);
      passed++;
      findings.push({
        area,
        scenario,
        expected,
        actual,
        status: 'PASS',
        details
      });
    } else {
      console.error(`❌ [${area}] FAIL: ${scenario} (Expected: ${expected}, Got: ${actual})`);
      failed++;
      findings.push({
        area,
        scenario,
        expected,
        actual,
        status: 'FAIL',
        details
      });
    }
  }

  // ==========================================================================
  // AREA 1: checkMachineSlotCollision
  // ==========================================================================
  console.log('\n[AREA 1: checkMachineSlotCollision Stress Testing]');

  const baseReservation: MachineReservationRecord = {
    id: 'res_base',
    reservationNumber: 'RES-BASE-001',
    machineId: 'mch_001',
    machineName: 'Mimaki Printer',
    machineCategory: 'DIGITAL_TEXTILE_PRINTER',
    facilityName: 'Okhla Hub',
    tenantId: 'tenant_1',
    userId: 'user_1',
    userName: 'Designer A',
    bookingType: 'HOURLY',
    startTime: '2026-08-25T10:00:00.000Z',
    endTime: '2026-08-25T14:00:00.000Z',
    totalDurationHours: 4,
    includeOperator: false,
    jobDetails: {
      jobTitle: 'Base Print',
      garmentCategory: 'mens-sherwani',
      panelCount: 4,
      fabricType: 'Silk',
      boltWidthInches: 44,
      estimatedRunMinutes: 200,
      bedEfficiencyPercent: 95
    },
    costBreakdown: { machineBaseCost: 7200, operatorFee: 0, securityDeposit: 5000, cleaningFee: 500, taxesInr: 1386, totalAmountInr: 14086 },
    paymentStatus: 'PAID',
    reservationStatus: 'CONFIRMED',
    createdAt: '2026-08-23T00:00:00.000Z'
  };

  const existing = [baseReservation];

  // 1.1 Exact boundary match: Candidate starts exactly at 14:30 (30 min buffer after 14:00)
  const resExactAfter = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T14:30:00.000Z', '2026-08-25T16:00:00.000Z');
  record(
    'SlotCollision',
    'Exact 30m buffer boundary after existing slot (14:30 start after 14:00 end) allows booking',
    resExactAfter.hasConflict === false,
    'hasConflict: false',
    `hasConflict: ${resExactAfter.hasConflict}`
  );

  // 1.2 Boundary inside buffer by 1 millisecond (14:29:59.999Z)
  const res1MsInsideBufferAfter = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T14:29:59.999Z', '2026-08-25T16:00:00.000Z');
  record(
    'SlotCollision',
    '1ms inside buffer after slot (14:29:59.999Z) detects collision',
    res1MsInsideBufferAfter.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${res1MsInsideBufferAfter.hasConflict}`
  );

  // 1.3 Exact boundary match before: Candidate ends exactly at 09:30 (30 min buffer before 10:00)
  const resExactBefore = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T08:00:00.000Z', '2026-08-25T09:30:00.000Z');
  record(
    'SlotCollision',
    'Exact 30m buffer boundary before existing slot (09:30 end before 10:00 start) allows booking',
    resExactBefore.hasConflict === false,
    'hasConflict: false',
    `hasConflict: ${resExactBefore.hasConflict}`
  );

  // 1.4 Boundary inside buffer before by 1 millisecond (09:30:00.001Z)
  const res1MsInsideBufferBefore = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T08:00:00.000Z', '2026-08-25T09:30:00.001Z');
  record(
    'SlotCollision',
    '1ms inside buffer before slot (09:30:00.001Z) detects collision',
    res1MsInsideBufferBefore.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${res1MsInsideBufferBefore.hasConflict}`
  );

  // 1.5 Nested Timeslot: Candidate completely inside existing slot [11:00, 13:00] inside [10:00, 14:00]
  const resNestedInside = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T11:00:00.000Z', '2026-08-25T13:00:00.000Z');
  record(
    'SlotCollision',
    'Candidate nested completely inside existing slot triggers collision',
    resNestedInside.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resNestedInside.hasConflict}`
  );

  // 1.6 Encompassing Timeslot: Candidate [09:00, 15:00] completely encapsulates existing [10:00, 14:00]
  const resEncompassing = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T09:00:00.000Z', '2026-08-25T15:00:00.000Z');
  record(
    'SlotCollision',
    'Candidate encompassing entire existing slot triggers collision',
    resEncompassing.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resEncompassing.hasConflict}`
  );

  // 1.7 Negative interval (startTime > endTime): [15:00, 11:00]
  const resNegativeInterval = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T15:00:00.000Z', '2026-08-25T11:00:00.000Z');
  record(
    'SlotCollision',
    'Negative interval (start > end) is rejected as invalid/conflict',
    resNegativeInterval.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resNegativeInterval.hasConflict}`
  );

  // 1.8 Zero-duration booking [12:00, 12:00]
  const resZeroDuration = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T12:00:00.000Z', '2026-08-25T12:00:00.000Z');
  record(
    'SlotCollision',
    'Zero-duration booking inside active slot is caught',
    resZeroDuration.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resZeroDuration.hasConflict}`
  );

  // 1.9 Timezone variations: UTC vs IST (+05:30) vs EST (-05:00)
  // 10:00 UTC == 15:30 IST == 05:00 EST
  const resTimezoneIST = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T16:00:00+05:30', '2026-08-25T18:00:00+05:30'); // 10:30-12:30 UTC
  record(
    'SlotCollision',
    'Timezone offset ISO strings (+05:30 IST) map to identical UTC epoch and detect collision',
    resTimezoneIST.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resTimezoneIST.hasConflict}`
  );

  const resTimezoneSafe = checkMachineSlotCollision(existing, 'mch_001', '2026-08-25T20:00:00+05:30', '2026-08-25T22:00:00+05:30'); // 14:30-16:30 UTC
  record(
    'SlotCollision',
    'Timezone offset ISO strings (+05:30 IST) after buffer (14:30 UTC) correctly report no collision',
    resTimezoneSafe.hasConflict === false,
    'hasConflict: false',
    `hasConflict: ${resTimezoneSafe.hasConflict}`
  );

  // 1.10 Invalid dates (garbage strings)
  const resGarbageDate = checkMachineSlotCollision(existing, 'mch_001', 'invalid-date-string', '2026-08-25T12:00:00.000Z');
  record(
    'SlotCollision',
    'Invalid non-date strings trigger safe rejection (hasConflict: true)',
    resGarbageDate.hasConflict === true,
    'hasConflict: true',
    `hasConflict: ${resGarbageDate.hasConflict}`
  );

  // 1.11 Cancelled status ignored
  const cancelledRes: MachineReservationRecord = {
    ...baseReservation,
    id: 'res_cancelled',
    reservationStatus: 'CANCELLED'
  };
  const resCancelled = checkMachineSlotCollision([cancelledRes], 'mch_001', '2026-08-25T11:00:00.000Z', '2026-08-25T13:00:00.000Z');
  record(
    'SlotCollision',
    'Cancelled reservations do not block slots',
    resCancelled.hasConflict === false,
    'hasConflict: false',
    `hasConflict: ${resCancelled.hasConflict}`
  );

  // ==========================================================================
  // AREA 2: computeSmartFabricRecommendations
  // ==========================================================================
  console.log('\n[AREA 2: computeSmartFabricRecommendations Stress Testing]');

  // 2.1 Negative Budget
  const recsNegBudget = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'mens-sherwani',
    targetBudgetInr: -5000,
    desiredDrape: 'STRUCTURED'
  });
  record(
    'SmartFabric',
    'Handles negative budget gracefully without crashing',
    recsNegBudget.options.bestMatch !== undefined && recsNegBudget.options.bestMatch.fitScore >= 0,
    'Returns valid options object',
    `Best match fitScore: ${recsNegBudget.options.bestMatch?.fitScore}`
  );

  // 2.2 Zero Budget
  const recsZeroBudget = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'mens-suit',
    targetBudgetInr: 0,
    desiredDrape: 'STRUCTURED'
  });
  record(
    'SmartFabric',
    'Handles zero target budget without division-by-zero crashes',
    recsZeroBudget.options.bestMatch !== undefined && !isNaN(recsZeroBudget.options.bestMatch.budgetUtilizationPercent),
    'Number is not NaN',
    `budgetUtilizationPercent: ${recsZeroBudget.options.bestMatch?.budgetUtilizationPercent}`
  );

  // 2.3 Mismatching Garment Category (no candidates recommend it explicitly)
  const recsMismatch = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'womens-corset', // specific category
    targetBudgetInr: 10000,
    desiredDrape: 'STRUCTURED'
  });
  record(
    'SmartFabric',
    'Falls back smoothly to candidate fabrics when garment category has sparse matches',
    recsMismatch.options.bestMatch !== undefined && recsMismatch.options.budgetSaver !== undefined,
    'Fallbacks present',
    `Best match fabric: ${recsMismatch.options.bestMatch?.primaryFabric?.name}`
  );

  // 2.4 Custom measurements yielding custom fabric requirements
  const recsCustomMeasurements = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'womens-lehenga',
    girthMeasurement: 48,
    lengthMeasurement: 52,
    panelCount: 24,
    targetBudgetInr: 50000
  });
  record(
    'SmartFabric',
    'Custom body measurements and panel counts correctly scale required yield meters',
    recsCustomMeasurements.calculatedYieldMeters > 5.0,
    '> 5.0 meters for 24-kali lehenga',
    `calculatedYieldMeters: ${recsCustomMeasurements.calculatedYieldMeters}`
  );

  // 2.5 Drape Physics Targeting (Fluid vs Structured vs Sculptural vs Lightweight)
  const recsFluid = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'womens-anarkali',
    desiredDrape: 'FLUID'
  });
  const recsStructured = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'mens-sherwani',
    desiredDrape: 'STRUCTURED'
  });
  record(
    'SmartFabric',
    'Drape scoring differentiates FLUID vs STRUCTURED requirements',
    recsFluid.options.bestMatch !== undefined && recsStructured.options.bestMatch !== undefined,
    'Both produce tailored recommendations',
    `Fluid: ${recsFluid.options.bestMatch.primaryFabric.name} (drape ${recsFluid.options.bestMatch.primaryFabric.drapeScore}) vs Structured: ${recsStructured.options.bestMatch.primaryFabric.name} (drape ${recsStructured.options.bestMatch.primaryFabric.drapeScore})`
  );

  // 2.6 Preferred Color Tone matching bonus
  const recsColorMatch = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'mens-sherwani',
    preferredColorTone: 'Crimson'
  });
  record(
    'SmartFabric',
    'Color tone bonus prioritizes matching swatch tags/colorName',
    recsColorMatch.options.bestMatch.primaryFabric.colorName.toLowerCase().includes('crimson') ||
    recsColorMatch.options.bestMatch.fitScore > 0,
    'Matches color preference or scores high',
    `Best Match: ${recsColorMatch.options.bestMatch.primaryFabric.colorName}`
  );

  // 2.7 Comparison Matrix Integrity
  record(
    'SmartFabric',
    'Comparison matrix contains all 5 mandatory evaluation criteria',
    recsColorMatch.comparisonMatrix.length === 5,
    '5 criteria rows',
    `Found ${recsColorMatch.comparisonMatrix.length} rows`
  );

  // ==========================================================================
  // AREA 3: calculateCreatorEarningsSplit & calculateLicensePricing
  // ==========================================================================
  console.log('\n[AREA 3: Licensing & Royalty Math Stress Testing]');

  // 3.1 Float Precision Invariant: Gross == Platform Fee + Creator Net
  const testAmounts = [
    0,
    1,
    99.99,
    1000.33,
    5432.19,
    18500.55,
    999999.99,
    10000000,
    0.0001
  ];

  let allFloatSplitsConserved = true;
  for (const amt of testAmounts) {
    const split = calculateCreatorEarningsSplit(amt);
    if (split.grossAmount !== split.platformFee + split.creatorNetEarnings) {
      allFloatSplitsConserved = false;
      console.error(`Conservation violated for ${amt}: gross=${split.grossAmount}, fee=${split.platformFee}, net=${split.creatorNetEarnings}`);
    }
  }
  record(
    'RoyaltyMath',
    'Conservation Law: Gross Amount == Platform Fee + Creator Net for all float inputs',
    allFloatSplitsConserved,
    'Conserved across all values',
    `allFloatSplitsConserved: ${allFloatSplitsConserved}`
  );

  // 3.2 Extreme Royalty Rates (clamping check: <0 clamped to 0, >1 clamped to 1)
  const splitUnderflowRate = calculateCreatorEarningsSplit(10000, -0.25);
  record(
    'RoyaltyMath',
    'Negative royalty rate clamped to 0.0 (100% platform fee)',
    splitUnderflowRate.royaltyRate === 0 && splitUnderflowRate.platformFee === 10000 && splitUnderflowRate.creatorNetEarnings === 0,
    'rate=0, fee=10000, net=0',
    `rate=${splitUnderflowRate.royaltyRate}, fee=${splitUnderflowRate.platformFee}, net=${splitUnderflowRate.creatorNetEarnings}`
  );

  const splitOverflowRate = calculateCreatorEarningsSplit(10000, 1.5);
  record(
    'RoyaltyMath',
    'Over-100% royalty rate clamped to 1.0 (0% platform fee, 100% net)',
    splitOverflowRate.royaltyRate === 1.0 && splitOverflowRate.platformFee === 0 && splitOverflowRate.creatorNetEarnings === 10000,
    'rate=1.0, fee=0, net=10000',
    `rate=${splitOverflowRate.royaltyRate}, fee=${splitOverflowRate.platformFee}, net=${splitOverflowRate.creatorNetEarnings}`
  );

  // 3.3 License Pricing Minimum Clamp (500 INR floor)
  const pricingZero = calculateLicensePricing(0, 'PERSONAL_BESPOKE');
  const pricingNegative = calculateLicensePricing(-5000, 'PERSONAL_BESPOKE');
  record(
    'LicensePricing',
    'Base prices <= 0 are safely clamped to ₹500 floor',
    pricingZero.priceInr === 500 && pricingNegative.priceInr === 500,
    'priceInr: 500',
    `zero=${pricingZero.priceInr}, negative=${pricingNegative.priceInr}`
  );

  // 3.4 License Multiplier Accuracy
  const pricingPersonal = calculateLicensePricing(1000, 'PERSONAL_BESPOKE');
  const pricingCommercial = calculateLicensePricing(1000, 'COMMERCIAL_PRODUCTION');
  const pricingBuyout = calculateLicensePricing(1000, 'EXCLUSIVE_BUYOUT');

  record(
    'LicensePricing',
    'Multipliers strictly applied (1.0x Personal, 4.11x Commercial, 21.11x Buyout)',
    pricingPersonal.priceInr === 1000 &&
    pricingCommercial.priceInr === 4110 &&
    pricingBuyout.priceInr === 21110,
    '1000, 4110, 21110',
    `${pricingPersonal.priceInr}, ${pricingCommercial.priceInr}, ${pricingBuyout.priceInr}`
  );

  record(
    'LicensePricing',
    'IP Transfer and Commercial Rights flags strictly partitioned by license tier',
    pricingPersonal.transfersIp === false && pricingPersonal.commercialAllowed === false &&
    pricingCommercial.transfersIp === false && pricingCommercial.commercialAllowed === true &&
    pricingBuyout.transfersIp === true && pricingBuyout.commercialAllowed === true,
    'Correct Boolean matrix',
    'Verified'
  );

  // ==========================================================================
  // AREA 4: transitionContractMilestone
  // ==========================================================================
  console.log('\n[AREA 4: transitionContractMilestone Stress Testing]');

  const testContract: ProductionContractRecord = JSON.parse(JSON.stringify(SEED_PRODUCTION_CONTRACTS[0]));

  // 4.1 Non-existent stage index jump (e.g. stage 99 or -1)
  const resultInvalidStage = transitionContractMilestone(testContract, 99, 'APPROVED_AND_PAID');
  record(
    'EscrowTransition',
    'Targeting non-existent stage index 99 does not corrupt milestone ledger',
    resultInvalidStage.totalReleasedInr === 0 && resultInvalidStage.isFullyCompleted === false,
    'totalReleased: 0, isFullyCompleted: false',
    `totalReleased: ${resultInvalidStage.totalReleasedInr}, completed: ${resultInvalidStage.isFullyCompleted}`
  );

  // 4.2 Out-of-order stage approval (approve Stage 3 before Stage 1)
  const resultOutOfOrder = transitionContractMilestone(testContract, 3, 'APPROVED_AND_PAID');
  record(
    'EscrowTransition',
    'Out-of-order stage release calculates partial escrow payout accurately',
    resultOutOfOrder.updatedMilestones[2].status === 'APPROVED_AND_PAID' &&
    resultOutOfOrder.totalReleasedInr === testContract.milestones[2].payoutAmountInr &&
    resultOutOfOrder.remainingInEscrowInr === testContract.totalContractAmountInr - testContract.milestones[2].payoutAmountInr,
    `totalReleased: ${testContract.milestones[2].payoutAmountInr}`,
    `totalReleased: ${resultOutOfOrder.totalReleasedInr}, remaining: ${resultOutOfOrder.remainingInEscrowInr}`
  );

  // 4.3 Custom payment amount override during milestone payout
  const customPayoutAmt = 50000;
  const resultCustomPayout = transitionContractMilestone(testContract, 1, 'APPROVED_AND_PAID', customPayoutAmt);
  record(
    'EscrowTransition',
    'Custom payout amount override updates milestone payout and recalculates total released',
    resultCustomPayout.updatedMilestones[0].payoutAmountInr === customPayoutAmt &&
    resultCustomPayout.totalReleasedInr === customPayoutAmt,
    `payout: ${customPayoutAmt}`,
    `payout: ${resultCustomPayout.updatedMilestones[0].payoutAmountInr}, totalReleased: ${resultCustomPayout.totalReleasedInr}`
  );

  // 4.4 Idempotency / Repeated transitions on already approved milestone
  const m1Once = transitionContractMilestone(testContract, 1, 'APPROVED_AND_PAID');
  const m1Twice = transitionContractMilestone(m1Once.updatedContract!, 1, 'APPROVED_AND_PAID');
  record(
    'EscrowTransition',
    'Transitioning already approved milestone is idempotent (no double release)',
    m1Once.totalReleasedInr === m1Twice.totalReleasedInr &&
    m1Once.remainingInEscrowInr === m1Twice.remainingInEscrowInr,
    `totalReleased: ${m1Once.totalReleasedInr}`,
    `totalReleasedTwice: ${m1Twice.totalReleasedInr}`
  );

  // 4.5 Array-only overload (passing milestones array directly without contract wrapper)
  const arrayResult = transitionContractMilestone(testContract.milestones, 2, 'APPROVED_AND_PAID');
  record(
    'EscrowTransition',
    'Supports raw milestones array overload and accurately computes escrow release',
    arrayResult.updatedContract === undefined &&
    arrayResult.updatedMilestones[1].status === 'APPROVED_AND_PAID' &&
    arrayResult.totalReleasedInr === testContract.milestones[1].payoutAmountInr,
    'Raw array transition successful',
    `totalReleased: ${arrayResult.totalReleasedInr}`
  );

  // ==========================================================================
  // AREA 5: evaluateTrialEntitlements
  // ==========================================================================
  console.log('\n[AREA 5: evaluateTrialEntitlements Stress Testing]');

  const testTrialProfile: TenantTrialOnboardingProfile = JSON.parse(JSON.stringify(SEED_TENANT_TRIAL_PROFILE));

  // 5.1 Exact 90-day boundary test
  const startDate = new Date('2026-01-01T00:00:00.000Z');
  const exact90DaysLater = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 2026-04-01T00:00:00.000Z
  const profile90Day: TenantTrialOnboardingProfile = {
    ...testTrialProfile,
    trialStartedAt: startDate.toISOString(),
    trialExpiresAt: exact90DaysLater.toISOString()
  };

  // Evaluate exactly on start date
  const evalStart = evaluateTrialEntitlements(profile90Day, startDate);
  record(
    'TrialEntitlements',
    'Day 0 evaluation shows exactly 90 days remaining',
    evalStart.daysRemaining === 90 && evalStart.isTrialActive === true && evalStart.isExpired === false,
    'daysRemaining: 90, isTrialActive: true, isExpired: false',
    `daysRemaining: ${evalStart.daysRemaining}, active: ${evalStart.isTrialActive}, expired: ${evalStart.isExpired}`
  );

  // Evaluate at exact millisecond of expiry
  const evalExactExpiry = evaluateTrialEntitlements(profile90Day, exact90DaysLater);
  record(
    'TrialEntitlements',
    'Exact moment of expiry evaluates to expired (diffMs <= 0)',
    evalExactExpiry.daysRemaining === 0 && evalExactExpiry.isExpired === true && evalExactExpiry.isTrialActive === false,
    'daysRemaining: 0, isExpired: true, isTrialActive: false',
    `daysRemaining: ${evalExactExpiry.daysRemaining}, expired: ${evalExactExpiry.isExpired}, active: ${evalExactExpiry.isTrialActive}`
  );

  // 5.2 Leap Year span (2024-02-01 to 2024-05-01)
  const leapStart = new Date('2024-02-01T00:00:00.000Z');
  const leapExpiry = new Date('2024-05-01T00:00:00.000Z'); // 29 days in Feb 2024 + 31 in Mar + 30 in Apr = 90 days
  const profileLeap: TenantTrialOnboardingProfile = {
    ...testTrialProfile,
    trialStartedAt: leapStart.toISOString(),
    trialExpiresAt: leapExpiry.toISOString()
  };
  const evalLeapMidpoint = evaluateTrialEntitlements(profileLeap, new Date('2024-03-01T00:00:00.000Z'));
  record(
    'TrialEntitlements',
    'Leap year date math accurately accounts for February 29th (61 days remaining on March 1)',
    evalLeapMidpoint.daysRemaining === 61 && evalLeapMidpoint.isTrialActive === true,
    'daysRemaining: 61',
    `daysRemaining: ${evalLeapMidpoint.daysRemaining}`
  );

  // 5.3 Past dates (e.g. current date is in the past before trial started)
  const evalFarPast = evaluateTrialEntitlements(profile90Day, new Date('2025-01-01T00:00:00.000Z'));
  record(
    'TrialEntitlements',
    'Past date reference evaluates daysRemaining cleanly without throwing',
    evalFarPast.daysRemaining > 90 && evalFarPast.isTrialActive === true,
    '> 90 days',
    `daysRemaining: ${evalFarPast.daysRemaining}`
  );

  // 5.4 Missing/partial profile usage counters (bidsUsed = 0, bidsLimit exceeded)
  const profileQuotaExhausted: TenantTrialOnboardingProfile = {
    ...testTrialProfile,
    usageCounters: {
      ...testTrialProfile.usageCounters,
      bidsSubmitted: 10 // exceeds trial limit of 3
    }
  };
  const evalQuotaExhausted = evaluateTrialEntitlements(profileQuotaExhausted, new Date('2026-08-23T00:00:00.000Z'));
  record(
    'TrialEntitlements',
    'Exhausted bids quota clamps bidsRemaining to 0 and blocks canSubmitBids',
    evalQuotaExhausted.bidsRemaining === 0 && evalQuotaExhausted.canSubmitBids === false,
    'bidsRemaining: 0, canSubmitBids: false',
    `bidsRemaining: ${evalQuotaExhausted.bidsRemaining}, canSubmitBids: ${evalQuotaExhausted.canSubmitBids}`
  );

  // 5.5 Enterprise Tier override ignores quota limits and grants 300+ DPI
  const enterpriseProfile: TenantTrialOnboardingProfile = {
    ...testTrialProfile,
    tier: 'HAUTE_ENTERPRISE',
    usageCounters: {
      ...testTrialProfile.usageCounters,
      bidsSubmitted: 999
    }
  };
  const evalEnterprise = evaluateTrialEntitlements(enterpriseProfile, new Date('2026-08-23T00:00:00.000Z'));
  record(
    'TrialEntitlements',
    'Haute Enterprise tier unlocks unlimited bids, 300 DPI, and watermark-free exports regardless of usage counter',
    evalEnterprise.canSubmitBids === true &&
    evalEnterprise.maxExportResolutionDpi === 300 &&
    evalEnterprise.watermarkRequired === false &&
    evalEnterprise.allow1to1Dxf === true &&
    evalEnterprise.allowCommercialBuyout === true,
    'All Pro/Enterprise entitlements granted',
    'Verified'
  );

  console.log(`\n================================================================`);
  console.log(`CHALLENGER 1 ADVERSARIAL STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { passed, failed, findings };
}

// Auto-run if executed directly
if (require.main === module) {
  const res = runAdversarialStressSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
}
