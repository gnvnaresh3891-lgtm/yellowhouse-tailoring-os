import * as crypto from 'crypto';
import {
  computeSha256Hex,
  calculateLicensePricing,
  calculateCreatorEarningsSplit,
  generateHMACLicenseSignature,
  generateFormattedLicenseKey,
  checkMachineSlotCollision,
  calculateMachineBookingCost,
  calculateVolumeDiscountedPrice,
  computeSmartFabricRecommendations,
  transitionContractMilestone,
  evaluateTrialEntitlements
} from '../lib/ecosystem-algorithms';
import {
  SEED_FASHION_ASSETS,
  SEED_WORKSHOP_MACHINES,
  SEED_MATERIALS_CATALOG,
  SEED_PRODUCTION_CONTRACTS,
  SEED_TENANT_TRIAL_PROFILE
} from '../lib/ecosystem-seeds';
import { MachineReservationRecord, ProductionContractRecord, ProductionContractMilestone } from '../types/ecosystem';

console.log('\n===============================================================');
console.log('--- FORENSIC AUDITOR INDEPENDENT ADVERSARIAL INTEGRITY SUITE ---');
console.log('===============================================================\n');

let passCount = 0;
let failCount = 0;

function forensicAssert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[FORENSIC PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FORENSIC FAIL] ${testName} - ${detail || 'Integrity assertion failed'}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: SHA-256 vs Node.js Crypto Standard
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 1: SHA-256 Pure Implementation vs Node.js Native Crypto');
const shaTestCases = [
  '',
  'a',
  'abc',
  'message digest',
  'secure-hash-algorithm-256-bit-block-verification-for-yellowhouse-bespoke-platform',
  '1234567890'.repeat(10), // 100 bytes (spans across two 512-bit chunks)
  'Multi-Block test string '.repeat(15), // 360 bytes
  'Zardozi & Can-Can 24-Kali Lehenga Imperial Craft Suite @ Mumbai 2026!'
];

for (const input of shaTestCases) {
  const expected = crypto.createHash('sha256').update(input, 'ascii').digest('hex');
  const actual = computeSha256Hex(input);
  forensicAssert(actual === expected, `SHA-256 match for length ${input.length}`, `Input "${input.substring(0, 20)}..." => Expected ${expected}, got ${actual}`);
}

// -----------------------------------------------------------------------------
// CHECK 2: Static Facade & Mock Bypass Detection
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 2: Mathematical Computation Integrity & Non-Trivial Calculations');

// Test calculateLicensePricing across diverse ranges
const p1 = calculateLicensePricing(1000, 'PERSONAL_BESPOKE');
const p2 = calculateLicensePricing(1000, 'COMMERCIAL_PRODUCTION');
const p3 = calculateLicensePricing(1000, 'EXCLUSIVE_BUYOUT');

forensicAssert(p1.priceInr === 1000 && p2.priceInr === 4110 && p3.priceInr === 21110, 'Pricing scales dynamically by multipliers 1x, 4.11x, 21.11x');
forensicAssert(p1.priceUsd === Math.round((1000 / 82.5) * 10) / 10, 'USD conversion is dynamically computed from INR rate 82.5');

// Test calculateCreatorEarningsSplit
const split1 = calculateCreatorEarningsSplit(50000);
forensicAssert(split1.grossAmount === 50000 && split1.platformFee === 6000 && split1.creatorNetEarnings === 44000, 'Standard 88/12 split on ₹50,000 gives ₹6,000 fee and ₹44,000 net');

const splitZero = calculateCreatorEarningsSplit(0);
forensicAssert(splitZero.grossAmount === 0 && splitZero.platformFee === 0 && splitZero.creatorNetEarnings === 0, 'Zero amount handles gracefully');

const splitNegative = calculateCreatorEarningsSplit(-500);
forensicAssert(splitNegative.grossAmount === 0 && splitNegative.platformFee === 0 && splitNegative.creatorNetEarnings === 0, 'Negative amount clamps to zero');

// -----------------------------------------------------------------------------
// CHECK 3: Collision Detection Boundary & Logic Tests
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 3: Machine Reservation Collision Edge Cases');

const baseReservation: MachineReservationRecord = {
  id: 'res_base_01',
  reservationNumber: 'RES-2026-B01',
  machineId: 'mch_001',
  machineName: 'Test Machine',
  machineCategory: 'CNC_LASER_CUTTER',
  facilityName: 'Test Hub',
  tenantId: 't1',
  userId: 'u1',
  userName: 'Tester',
  bookingType: 'HOURLY',
  startTime: '2026-08-25T10:00:00.000Z',
  endTime: '2026-08-25T14:00:00.000Z',
  totalDurationHours: 4,
  includeOperator: true,
  jobDetails: {
    jobTitle: 'Job 1',
    garmentCategory: 'mens-suit',
    panelCount: 10,
    fabricType: 'Wool',
    boltWidthInches: 58,
    estimatedRunMinutes: 60,
    bedEfficiencyPercent: 90
  },
  costBreakdown: { machineBaseCost: 1000, operatorFee: 500, securityDeposit: 2000, cleaningFee: 500, taxesInr: 360, totalAmountInr: 4360 },
  paymentStatus: 'PAID',
  reservationStatus: 'CONFIRMED',
  createdAt: '2026-08-23T00:00:00.000Z'
};

// Test 30m buffer boundary
// Existing is 10:00 - 14:00. Buffer makes it conflict between 09:30:00.001 and 14:29:59.999.
const candidateAtBufferEdgeBefore = checkMachineSlotCollision([baseReservation], 'mch_001', '2026-08-25T08:00:00.000Z', '2026-08-25T09:30:00.000Z');
forensicAssert(candidateAtBufferEdgeBefore.hasConflict === false, 'Reservation ending exactly at 09:30:00 (30m buffer boundary) has NO conflict');

const candidateInsideBufferBefore = checkMachineSlotCollision([baseReservation], 'mch_001', '2026-08-25T08:00:00.000Z', '2026-08-25T09:31:00.000Z');
forensicAssert(candidateInsideBufferBefore.hasConflict === true, 'Reservation ending at 09:31:00 (29m before start) detects collision');

const candidateAtBufferEdgeAfter = checkMachineSlotCollision([baseReservation], 'mch_001', '2026-08-25T14:30:00.000Z', '2026-08-25T16:00:00.000Z');
forensicAssert(candidateAtBufferEdgeAfter.hasConflict === false, 'Reservation starting exactly at 14:30:00 (30m buffer boundary) has NO conflict');

const candidateInsideBufferAfter = checkMachineSlotCollision([baseReservation], 'mch_001', '2026-08-25T14:29:00.000Z', '2026-08-25T16:00:00.000Z');
forensicAssert(candidateInsideBufferAfter.hasConflict === true, 'Reservation starting at 14:29:00 (29m after end) detects collision');

// Cancelled reservation test
const cancelledReservation: MachineReservationRecord = {
  ...baseReservation,
  id: 'res_cancelled_02',
  reservationStatus: 'CANCELLED'
};
const candidateAgainstCancelled = checkMachineSlotCollision([cancelledReservation], 'mch_001', '2026-08-25T11:00:00.000Z', '2026-08-25T13:00:00.000Z');
forensicAssert(candidateAgainstCancelled.hasConflict === false, 'Cancelled reservation is bypassed during conflict detection');

// -----------------------------------------------------------------------------
// CHECK 4: Multi-Tier Volume Discount Arithmetic
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 4: Volume Discount Curve Verification');
const material = SEED_MATERIALS_CATALOG[0]; // Raw silk (1-9m: 1850, 10-49m: 1665, 50-199m: 1443, 200+: 1202)

const t1 = calculateVolumeDiscountedPrice(material, 9);
const t2 = calculateVolumeDiscountedPrice(material, 10);
const t3 = calculateVolumeDiscountedPrice(material, 49);
const t4 = calculateVolumeDiscountedPrice(material, 50);
const t5 = calculateVolumeDiscountedPrice(material, 199);
const t6 = calculateVolumeDiscountedPrice(material, 200);

forensicAssert(t1.unitPricePerMeterInr === 1850 && t1.discountPercent === 0, '9m tier = ₹1,850/m (0%)');
forensicAssert(t2.unitPricePerMeterInr === 1665 && t2.discountPercent === 10, '10m tier = ₹1,665/m (10%)');
forensicAssert(t3.unitPricePerMeterInr === 1665 && t3.discountPercent === 10, '49m tier = ₹1,665/m (10%)');
forensicAssert(t4.unitPricePerMeterInr === 1443 && t4.discountPercent === 22, '50m tier = ₹1,443/m (22%)');
forensicAssert(t5.unitPricePerMeterInr === 1443 && t5.discountPercent === 22, '199m tier = ₹1,443/m (22%)');
forensicAssert(t6.unitPricePerMeterInr === 1202 && t6.discountPercent === 35, '200m tier = ₹1,202/m (35%)');

// -----------------------------------------------------------------------------
// CHECK 5: Smart Fabric Recommendation Multivariable Scoring
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 5: Smart Fabric Multivariable Scoring Logic');
const recResults = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
  targetGarmentType: 'womens-lehenga',
  targetBudgetInr: 25000,
  desiredDrape: 'FLUID',
  preferredColorTone: 'Navy'
});

forensicAssert(recResults.options.bestMatch.primaryFabric.name.length > 0, 'Best match returns valid material name');
forensicAssert(recResults.options.budgetSaver.grandTotalMaterialCostInr <= recResults.options.bestMatch.grandTotalMaterialCostInr || recResults.options.budgetSaver.appliedUnitPriceInr <= recResults.options.bestMatch.appliedUnitPriceInr, 'Budget saver material cost is <= best match');
forensicAssert(recResults.options.luxuryUpgrade.appliedUnitPriceInr >= recResults.options.budgetSaver.appliedUnitPriceInr, 'Luxury upgrade unit price is >= budget saver');

// -----------------------------------------------------------------------------
// CHECK 6: Escrow State Machine State Invariant Verification
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 6: Escrow State Machine Invariants');
const testContract: ProductionContractRecord = {
  id: 'ctr_test_01',
  contractNumber: 'CTR-2026-TEST',
  briefId: 'brf_01',
  briefTitle: 'Test Brief',
  acceptedBidId: 'bid_01',
  atelierTenantId: 't1',
  atelierName: 'Atelier',
  artisanId: 'art_01',
  artisanWorkshopName: 'Artisan Workshop',
  totalContractAmountInr: 100000,
  escrowStatus: 'HELD_IN_ESCROW',
  milestones: [
    { stageIndex: 1, name: 'Stage 1', payoutAmountInr: 25000, percentagePayout: 25, targetCompletionDate: '2026-09-01', status: 'PENDING' },
    { stageIndex: 2, name: 'Stage 2', payoutAmountInr: 25000, percentagePayout: 25, targetCompletionDate: '2026-09-10', status: 'PENDING' },
    { stageIndex: 3, name: 'Stage 3', payoutAmountInr: 25000, percentagePayout: 25, targetCompletionDate: '2026-09-20', status: 'PENDING' },
    { stageIndex: 4, name: 'Stage 4', payoutAmountInr: 25000, percentagePayout: 25, targetCompletionDate: '2026-09-30', status: 'PENDING' }
  ],
  currentState: 'CONTRACT_SIGNED',
  signedAt: '2026-08-23T00:00:00Z'
};

// Stage 1
let cur = transitionContractMilestone(testContract, 1, 'APPROVED_AND_PAID');
forensicAssert(cur.totalReleasedInr === 25000, 'Stage 1 released ₹25,000');
forensicAssert(cur.remainingInEscrowInr === 75000, 'Remaining in escrow is ₹75,000');
forensicAssert(cur.updatedContract?.escrowStatus === 'PARTIAL_RELEASE', 'Escrow status is PARTIAL_RELEASE');

// Stage 2
cur = transitionContractMilestone(cur.updatedContract!, 2, 'APPROVED_AND_PAID');
forensicAssert(cur.totalReleasedInr === 50000, 'Stage 2 total released ₹50,000');
forensicAssert(cur.remainingInEscrowInr === 50000, 'Remaining in escrow is ₹50,000');

// Stage 3 & 4
cur = transitionContractMilestone(cur.updatedContract!, 3, 'APPROVED_AND_PAID');
cur = transitionContractMilestone(cur.updatedContract!, 4, 'APPROVED_AND_PAID');
forensicAssert(cur.totalReleasedInr === 100000, 'All stages total released ₹100,000');
forensicAssert(cur.remainingInEscrowInr === 0, 'Zero balance in escrow upon full completion');
forensicAssert(cur.isFullyCompleted === true, 'isFullyCompleted flag is true');
forensicAssert(cur.updatedContract?.escrowStatus === 'FULLY_RELEASED', 'Escrow status is FULLY_RELEASED');
forensicAssert(cur.updatedContract?.currentState === 'COMPLETED', 'Current state is COMPLETED');

// -----------------------------------------------------------------------------
// CHECK 7: 3-Month Trial Entitlement Gate Matrix
// -----------------------------------------------------------------------------
console.log('\n>>> CHECK 7: 3-Month Free Trial Security Entitlement Boundaries');
const trial = SEED_TENANT_TRIAL_PROFILE;

// Active trial
const resActive = evaluateTrialEntitlements(trial, new Date('2026-08-23T00:00:00Z'));
forensicAssert(resActive.maxExportResolutionDpi === 150, 'Trial tier enforces 150 DPI preview exports');
forensicAssert(resActive.watermarkRequired === true, 'Trial tier requires watermark');
forensicAssert(resActive.allow1to1Dxf === false, 'Trial tier blocks 1:1 DXF downloads');
forensicAssert(resActive.allowCommercialBuyout === false, 'Trial tier blocks commercial buyouts');

// Pro tier
const resPro = evaluateTrialEntitlements({ ...trial, tier: 'ATELIER_PRO' });
forensicAssert(resPro.maxExportResolutionDpi === 300, 'Pro tier unlocks 300 DPI exports');
forensicAssert(resPro.watermarkRequired === false, 'Pro tier disables watermark');
forensicAssert(resPro.allow1to1Dxf === true, 'Pro tier enables 1:1 DXF downloads');

console.log('\n===============================================================');
console.log(`FORENSIC AUDIT SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('===============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
