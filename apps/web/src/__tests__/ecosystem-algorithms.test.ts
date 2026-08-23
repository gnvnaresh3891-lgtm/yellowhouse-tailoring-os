/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Unit & Integration Test Suite for Ecosystem Algorithms & Business Logic (Milestone 1)
 */

import {
  calculateLicensePricing,
  calculateCreatorEarningsSplit,
  generateHMACLicenseSignature,
  generateFormattedLicenseKey,
  computeSha256Hex,
  checkMachineSlotCollision,
  calculateMachineBookingCost,
  calculateVolumeDiscountedPrice,
  computeSmartFabricRecommendations,
  transitionContractMilestone,
  evaluateTrialEntitlements
} from '../lib/ecosystem-algorithms';

import {
  SEED_FASHION_ASSETS,
  SEED_ASSET_LICENSES,
  SEED_CREATOR_EARNINGS,
  SEED_WORKSHOP_MACHINES,
  SEED_MACHINE_RESERVATIONS,
  SEED_MATERIALS_CATALOG,
  SEED_MATERIAL_ORDERS,
  SEED_ARTISAN_PORTFOLIOS,
  SEED_PRODUCTION_BRIEFS,
  SEED_TAILOR_BIDS,
  SEED_PRODUCTION_CONTRACTS,
  SEED_TENANT_TRIAL_PROFILE,
  SEED_CERTIFIED_STYLISTS,
  SEED_STYLIST_BOOKINGS
} from '../lib/ecosystem-seeds';

import {
  MachineReservationRecord,
  ProductionContractRecord,
  TenantTrialOnboardingProfile
} from '../types/ecosystem';

export function runEcosystemAlgorithmsTests(): { passed: number; failed: number } {
  console.log('\n[Suite: Ecosystem Layer 1-5 Algorithms & Seeds]');

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

  // ==========================================================================
  // 1. SHA-256 & CRYPTOGRAPHIC UTILITIES
  // ==========================================================================
  const knownEmptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  assert(computeSha256Hex('') === knownEmptySha256, 'computeSha256Hex matches empty string standard SHA-256');

  const testHash = computeSha256Hex('YellowHouse Tailoring OS 2026');
  assert(testHash.length === 64, 'SHA-256 generates exact 64-character hexadecimal digest');

  // ==========================================================================
  // 2. LAYER 1: LICENSING & ROYALTY MATH
  // ==========================================================================
  const basePrice = 5000;
  const personalPricing = calculateLicensePricing(basePrice, 'PERSONAL_BESPOKE');
  assert(personalPricing.priceInr === 5000, 'Personal Bespoke priceInr equals base price');
  assert(personalPricing.allowedRuns === 3, 'Personal Bespoke allows 3 client runs');
  assert(personalPricing.commercialAllowed === false, 'Personal Bespoke disallows commercial mass runs');
  assert(personalPricing.transfersIp === false, 'Personal Bespoke does not transfer IP');
  assert(personalPricing.priceUsd > 0, 'Personal Bespoke computes valid USD conversion');

  const commercialPricing = calculateLicensePricing(basePrice, 'COMMERCIAL_PRODUCTION');
  assert(commercialPricing.priceInr === Math.round(5000 * 4.11), 'Commercial Production applies 4.11x tier multiplier');
  assert(commercialPricing.allowedRuns === 250, 'Commercial Production allows 250 production runs');
  assert(commercialPricing.commercialAllowed === true, 'Commercial Production allows commercial usage');
  assert(commercialPricing.transfersIp === false, 'Commercial Production does not transfer IP');

  const buyoutPricing = calculateLicensePricing(basePrice, 'EXCLUSIVE_BUYOUT');
  assert(buyoutPricing.priceInr === Math.round(5000 * 21.11), 'Exclusive Buyout applies 21.11x multiplier');
  assert(buyoutPricing.allowedRuns === 999999, 'Exclusive Buyout allows unlimited runs');
  assert(buyoutPricing.transfersIp === true, 'Exclusive Buyout transfers full IP rights');

  // Creator Royalty Split (88/12 split)
  const earnings10k = calculateCreatorEarningsSplit(10000);
  assert(earnings10k.grossAmount === 10000, 'Gross amount matches ₹10,000');
  assert(earnings10k.platformFee === 1200, '12% platform fee on ₹10,000 is ₹1,200');
  assert(earnings10k.creatorNetEarnings === 8800, '88% creator net on ₹10,000 is ₹8,800');
  assert(earnings10k.grossAmount === earnings10k.platformFee + earnings10k.creatorNetEarnings, 'Gross equals fee + net earnings');

  // Custom royalty rate (90/10)
  const earningsCustom = calculateCreatorEarningsSplit(20000, 0.90);
  assert(earningsCustom.platformFee === 2000, 'Custom 10% platform fee on ₹20,000 is ₹2,000');
  assert(earningsCustom.creatorNetEarnings === 18000, 'Custom 90% creator net on ₹20,000 is ₹18,000');

  // License Signature & Key
  const sig1 = generateHMACLicenseSignature('ast_01', 'buyer_01', 'COMMERCIAL_PRODUCTION', 1724420000000);
  const sig2 = generateHMACLicenseSignature('ast_01', 'buyer_01', 'COMMERCIAL_PRODUCTION', 1724420000000);
  const sig3 = generateHMACLicenseSignature('ast_02', 'buyer_01', 'COMMERCIAL_PRODUCTION', 1724420000000);
  assert(sig1 === sig2, 'HMAC signature is deterministic for identical inputs');
  assert(sig1 !== sig3, 'HMAC signature changes when assetId differs');

  const formattedKey = generateFormattedLicenseKey('ast_01', 'buyer_01', 1724420000000);
  assert(formattedKey.startsWith('LIC-YH-'), 'Formatted license key has standard LIC-YH prefix');
  assert(formattedKey.split('-').length >= 4, 'Formatted license key contains standard segment structure');

  // ==========================================================================
  // 3. LAYER 2: MACHINE BOOKING & COLLISION DETECTION
  // ==========================================================================
  const machine = SEED_WORKSHOP_MACHINES[0]; // Mimaki Tx300P (hourly: ₹1,800, daily: ₹12,000, opFee: ₹600/hr, deposit: ₹5,000)

  // Test Hourly booking cost
  const hourlyCost = calculateMachineBookingCost(machine, 'HOURLY', 4, true);
  assert(hourlyCost.machineBaseCost === 7200, '4 hours at ₹1,800/hr base cost is ₹7,200');
  assert(hourlyCost.operatorFee === 2400, '4 hours operator fee at ₹600/hr is ₹2,400');
  assert(hourlyCost.cleaningFee === 500, 'Standard cleaning fee is ₹500');
  assert(hourlyCost.securityDeposit === 5000, 'Security deposit is ₹5,000');
  const expectedHourlyTaxes = Math.round((7200 + 2400 + 500) * 0.18);
  assert(hourlyCost.taxesInr === expectedHourlyTaxes, `18% GST matches ₹${expectedHourlyTaxes}`);
  assert(hourlyCost.totalAmountInr === 7200 + 2400 + 500 + expectedHourlyTaxes + 5000, 'Total amount includes base, op, clean, tax, and deposit');

  // Test Daily Shift booking cost
  const dailyCost = calculateMachineBookingCost(machine, 'DAILY_SHIFT', 2, false);
  assert(dailyCost.machineBaseCost === 24000, '2 daily shifts at ₹12,000/day base cost is ₹24,000');
  assert(dailyCost.operatorFee === 0, 'No operator fee when withOperator is false');

  // Collision Detection Tests
  const existingRes: MachineReservationRecord[] = [
    {
      id: 'res_001',
      reservationNumber: 'RES-2026-001',
      machineId: 'mch_lectra_laser_02',
      machineName: 'Lectra Cutter',
      machineCategory: 'CNC_LASER_CUTTER',
      facilityName: 'Shahpur Jat Hub',
      tenantId: 't1',
      userId: 'u1',
      userName: 'User 1',
      bookingType: 'HOURLY',
      startTime: '2026-08-25T10:00:00Z',
      endTime: '2026-08-25T14:00:00Z',
      totalDurationHours: 4,
      includeOperator: false,
      jobDetails: {
        jobTitle: 'Cutting Job',
        garmentCategory: 'mens-suit',
        panelCount: 20,
        fabricType: 'Wool',
        boltWidthInches: 58,
        estimatedRunMinutes: 120,
        bedEfficiencyPercent: 90
      },
      costBreakdown: { machineBaseCost: 8800, operatorFee: 0, securityDeposit: 8000, cleaningFee: 500, taxesInr: 1674, totalAmountInr: 18974 },
      paymentStatus: 'PAID',
      reservationStatus: 'CONFIRMED',
      createdAt: '2026-08-23T10:00:00Z'
    }
  ];

  // Exact overlap collision
  const collision1 = checkMachineSlotCollision(
    existingRes,
    'mch_lectra_laser_02',
    '2026-08-25T11:00:00Z',
    '2026-08-25T13:00:00Z'
  );
  assert(collision1.hasConflict === true, 'Direct time slot overlap reports collision');

  // Buffer overlap collision (within 30 mins before)
  const collisionBufferBefore = checkMachineSlotCollision(
    existingRes,
    'mch_lectra_laser_02',
    '2026-08-25T08:00:00Z',
    '2026-08-25T09:45:00Z'
  );
  assert(collisionBufferBefore.hasConflict === true, 'Collision detected within 30-minute pre-maintenance buffer');

  // Safe outside buffer (45 mins after)
  const collisionSafe = checkMachineSlotCollision(
    existingRes,
    'mch_lectra_laser_02',
    '2026-08-25T14:45:00Z',
    '2026-08-25T18:00:00Z'
  );
  assert(collisionSafe.hasConflict === false, 'No conflict when booked 45 mins after previous reservation');

  // Different machine does not collide
  const collisionDiffMachine = checkMachineSlotCollision(
    existingRes,
    'mch_mimaki_tx300_01',
    '2026-08-25T11:00:00Z',
    '2026-08-25T13:00:00Z'
  );
  assert(collisionDiffMachine.hasConflict === false, 'Different machine does not trigger collision');

  // Self-reschedule ignore
  const collisionSelf = checkMachineSlotCollision(
    existingRes,
    'mch_lectra_laser_02',
    '2026-08-25T10:00:00Z',
    '2026-08-25T14:00:00Z',
    'res_001'
  );
  assert(collisionSelf.hasConflict === false, 'Updating existing reservation ignores self-collision');

  // ==========================================================================
  // 4. LAYER 3: SUPPLY LAYER & SMART FABRIC RECOMMENDATIONS
  // ==========================================================================
  const rawSilk = SEED_MATERIALS_CATALOG[0]; // Raw Silk (1-9m: ₹1,850, 10-49m: ₹1,665, 50-199m: ₹1,443, 200+m: ₹1,202)

  const vol1 = calculateVolumeDiscountedPrice(rawSilk, 5);
  assert(vol1.unitPricePerMeterInr === 1850, '5 meters uses retail tier ₹1,850/m');
  assert(vol1.discountPercent === 0, 'Retail tier has 0% discount');
  assert(vol1.savingsInr === 0, 'Retail tier has ₹0 savings');

  const vol2 = calculateVolumeDiscountedPrice(rawSilk, 25);
  assert(vol2.unitPricePerMeterInr === 1665, '25 meters uses Atelier tier ₹1,665/m');
  assert(vol2.discountPercent === 10, 'Atelier tier has 10% discount');
  assert(vol2.savingsInr === (1850 - 1665) * 25, 'Atelier tier computes exact savings vs base');

  const vol3 = calculateVolumeDiscountedPrice(rawSilk, 75);
  assert(vol3.unitPricePerMeterInr === 1443, '75 meters uses Boutique Production tier ₹1,443/m');
  assert(vol3.discountPercent === 22, 'Boutique tier has 22% discount');

  const vol4 = calculateVolumeDiscountedPrice(rawSilk, 300);
  assert(vol4.unitPricePerMeterInr === 1202, '300 meters uses Mill Roll tier ₹1,202/m');
  assert(vol4.discountPercent === 35, 'Mill roll tier has 35% discount');

  // Smart Fabric Recommendations
  const recs = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    targetGarmentType: 'mens-sherwani',
    targetBudgetInr: 18000,
    desiredDrape: 'STRUCTURED',
    includeLiningAndTrims: true
  });

  assert(recs.options.bestMatch !== undefined, 'Returns Best Match recommendation');
  assert(recs.options.budgetSaver !== undefined, 'Returns Budget Saver recommendation');
  assert(recs.options.luxuryUpgrade !== undefined, 'Returns Luxury Upgrade recommendation');
  assert(recs.options.bestMatch.fitScore >= 50, 'Best match option has high fit score');
  assert(recs.comparisonMatrix.length >= 4, 'Comparison matrix contains multi-factor criteria');
  assert(recs.calculatedYieldMeters > 0, 'Calculates non-zero fabric yield');

  // ==========================================================================
  // 5. LAYER 4: PRODUCTION BIDDING & ESCROW CONTRACTS
  // ==========================================================================
  const contract = SEED_PRODUCTION_CONTRACTS[0];
  assert(contract.escrowStatus === 'HELD_IN_ESCROW', 'Initial contract escrow is HELD_IN_ESCROW');
  assert(contract.milestones.length === 4, 'Contract has 4 standard production milestones');

  // Transition Milestone 1 to APPROVED_AND_PAID
  const m1Result = transitionContractMilestone(contract, 1, 'APPROVED_AND_PAID');
  assert(m1Result.updatedMilestones[0].status === 'APPROVED_AND_PAID', 'Milestone 1 status updated to APPROVED_AND_PAID');
  assert(m1Result.totalReleasedInr === 92400, 'Released ₹92,400 for 20% milestone 1 payout');
  assert(m1Result.remainingInEscrowInr === 462000 - 92400, 'Remaining escrow balance reduced accordingly');
  assert(m1Result.updatedContract?.escrowStatus === 'PARTIAL_RELEASE', 'Escrow status transitions to PARTIAL_RELEASE');
  assert(m1Result.isFullyCompleted === false, 'Contract is not fully completed after milestone 1');

  // Approve all milestones
  let fullContract = m1Result.updatedContract!;
  const m2Result = transitionContractMilestone(fullContract, 2, 'APPROVED_AND_PAID');
  const m3Result = transitionContractMilestone(m2Result.updatedContract!, 3, 'APPROVED_AND_PAID');
  const m4Result = transitionContractMilestone(m3Result.updatedContract!, 4, 'APPROVED_AND_PAID');

  assert(m4Result.isFullyCompleted === true, 'Contract is marked fully completed when all 4 milestones approved');
  assert(m4Result.remainingInEscrowInr === 0, 'Zero remaining escrow when fully completed');
  assert(m4Result.updatedContract?.escrowStatus === 'FULLY_RELEASED', 'Contract escrow transitions to FULLY_RELEASED');
  assert(m4Result.updatedContract?.currentState === 'COMPLETED', 'Contract current state transitions to COMPLETED');

  // ==========================================================================
  // 6. LAYER 5: TRIAL ENTITLEMENTS & RESOLUTION EVALUATION
  // ==========================================================================
  const trialProfile = SEED_TENANT_TRIAL_PROFILE;
  const trialEval = evaluateTrialEntitlements(trialProfile, new Date('2026-08-23T00:00:00Z'));
  assert(trialEval.isTrialActive === true, 'Trial profile is active within 90 days');
  assert(trialEval.isExpired === false, 'Trial profile is not expired');
  assert(trialEval.daysRemaining === 68, 'Evaluates exact 68 days remaining');
  assert(trialEval.watermarkRequired === true, 'Trial tier enforces watermark on preview exports');
  assert(trialEval.maxExportResolutionDpi === 150, 'Trial tier enforces 150 DPI preview resolution');
  assert(trialEval.allow1to1Dxf === false, 'Trial tier restricts direct 1:1 DXF downloads');
  assert(trialEval.bidsRemaining === 2, 'Evaluates remaining bids quota (3 - 1 = 2)');
  assert(trialEval.canSubmitBids === true, 'Can submit bids while under quota');

  // Test Pro Tier
  const proProfile: TenantTrialOnboardingProfile = {
    ...trialProfile,
    tier: 'ATELIER_PRO'
  };
  const proEval = evaluateTrialEntitlements(proProfile);
  assert(proEval.watermarkRequired === false, 'Pro tier allows watermark-free exports');
  assert(proEval.maxExportResolutionDpi === 300, 'Pro tier unlocks 300+ DPI vector exports');
  assert(proEval.allow1to1Dxf === true, 'Pro tier unlocks 1:1 DXF exports');
  assert(proEval.allowCommercialBuyout === true, 'Pro tier unlocks commercial buyouts');

  // Test Expired Trial
  const expiredTrialProfile: TenantTrialOnboardingProfile = {
    ...trialProfile,
    trialExpiresAt: '2026-08-01T00:00:00Z'
  };
  const expiredEval = evaluateTrialEntitlements(expiredTrialProfile, new Date('2026-08-23T00:00:00Z'));
  assert(expiredEval.isExpired === true, 'Expired trial evaluates isExpired: true');
  assert(expiredEval.isTrialActive === false, 'Expired trial evaluates isTrialActive: false');
  assert(expiredEval.daysRemaining === 0, 'Expired trial days remaining is 0');

  // ==========================================================================
  // 7. SEED CATALOG INTEGRITY CHECKS
  // ==========================================================================
  assert(SEED_FASHION_ASSETS.length >= 5, `Seed fashion assets contains ${SEED_FASHION_ASSETS.length} blueprints (>=5)`);
  assert(SEED_ASSET_LICENSES.length >= 1, 'Seed asset licenses contains active certificates');
  assert(SEED_CREATOR_EARNINGS.monthlyBreakdown.length >= 3, 'Seed creator earnings has 3-month telemetry');
  assert(SEED_WORKSHOP_MACHINES.length >= 5, `Seed workshop machines contains ${SEED_WORKSHOP_MACHINES.length} hardware listings (>=5)`);
  assert(SEED_MACHINE_RESERVATIONS.length >= 1, 'Seed machine reservations contains sample bookings');
  assert(SEED_MATERIALS_CATALOG.length >= 6, `Seed materials catalog contains ${SEED_MATERIALS_CATALOG.length} swatches (>=6)`);
  assert(SEED_MATERIAL_ORDERS.length >= 1, 'Seed material orders contains sample POs');
  assert(SEED_ARTISAN_PORTFOLIOS.length >= 2, 'Seed artisan portfolios contains verified karigars');
  assert(SEED_PRODUCTION_BRIEFS.length >= 1, 'Seed production briefs contains open RFQs');
  assert(SEED_TAILOR_BIDS.length >= 1, 'Seed tailor bids contains competitive bids');
  assert(SEED_PRODUCTION_CONTRACTS.length >= 1, 'Seed production contracts contains active escrow contracts');
  assert(SEED_CERTIFIED_STYLISTS.length >= 3, `Seed stylists directory contains ${SEED_CERTIFIED_STYLISTS.length} consultants (>=3)`);
  assert(SEED_STYLIST_BOOKINGS.length >= 1, 'Seed stylist bookings contains consultation appointments');

  return { passed, failed };
}
