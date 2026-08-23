import { 
  calculateVolumeDiscountedPrice, 
  computeSmartFabricRecommendations,
  transitionContractMilestone 
} from '../lib/ecosystem-algorithms';
import { 
  SEED_MATERIALS_CATALOG, 
  SEED_MATERIAL_ORDERS,
  SEED_ARTISAN_PORTFOLIOS,
  SEED_PRODUCTION_BRIEFS,
  SEED_TAILOR_BIDS,
  SEED_PRODUCTION_CONTRACTS,
  SEED_VENDOR_MATERIALS,
  SEED_FABRIC_SOURCING_ORDERS,
  SEED_ARTISAN_PROFILES
} from '../lib/ecosystem-seeds';
import { calculateFabricYield } from '../lib/fabric-yield';
import { 
  VendorMaterialItem, 
  ProductionDesignBrief, 
  TailorProductionBid, 
  ProductionContractRecord,
  GarmentCategory 
} from '../types/ecosystem';

export function runMilestone3EcosystemTests() {
  console.log('\n======================================================');
  console.log('--- SUITE: MILESTONE 3 SUPPLY & BIDDING ECOSYSTEM ---');
  console.log('======================================================\n');

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

  // -------------------------------------------------------------
  // 1. Supply Layer Material Sourcing & Volume Pricing Tests
  // -------------------------------------------------------------
  console.log('[Test Group 1: Volume Discount Tier Computations]');
  const sampleSilk = SEED_MATERIALS_CATALOG.find(m => m.id === 'mat_mulberry_silk_01')!;
  assert(sampleSilk !== undefined, 'Sample Mulberry Silk swatch exists in catalog');

  // Tier 1: 5 meters (1-9m, 0% discount)
  const tier1Price = calculateVolumeDiscountedPrice(sampleSilk, 5);
  assert(tier1Price.unitPricePerMeterInr === 1850, 'Tier 1 unit price is base rate ₹1,850/m');
  assert(tier1Price.discountPercent === 0, 'Tier 1 discount is 0%');
  assert(tier1Price.totalCostInr === 1850 * 5, 'Tier 1 total cost = 5m * ₹1,850 = ₹9,250');
  assert(tier1Price.savingsInr === 0, 'Tier 1 savings is ₹0');

  // Tier 2: 25 meters (10-49m, 10% discount)
  const tier2Price = calculateVolumeDiscountedPrice(sampleSilk, 25);
  assert(tier2Price.unitPricePerMeterInr === 1665, 'Tier 2 unit price is ₹1,665/m (10% discount)');
  assert(tier2Price.discountPercent === 10, 'Tier 2 discount is 10%');
  assert(tier2Price.totalCostInr === 1665 * 25, 'Tier 2 total cost = 25m * ₹1,665 = ₹41,625');
  assert(tier2Price.savingsInr === (1850 * 25) - (1665 * 25), 'Tier 2 savings matches undiscounted delta');

  // Tier 3: 100 meters (50-199m, 22% discount)
  const tier3Price = calculateVolumeDiscountedPrice(sampleSilk, 100);
  assert(tier3Price.unitPricePerMeterInr === 1443, 'Tier 3 unit price is ₹1,443/m (22% discount)');
  assert(tier3Price.discountPercent === 22, 'Tier 3 discount is 22%');
  assert(tier3Price.totalCostInr === 1443 * 100, 'Tier 3 total cost = 100m * ₹1,443 = ₹144,300');
  assert(tier3Price.savingsInr === 40700, 'Tier 3 savings is ₹40,700');

  // Tier 4: 250 meters (200m+, 35% discount)
  const tier4Price = calculateVolumeDiscountedPrice(sampleSilk, 250);
  assert(tier4Price.unitPricePerMeterInr === 1202, 'Tier 4 unit price is ₹1,202/m (35% discount)');
  assert(tier4Price.discountPercent === 35, 'Tier 4 discount is 35%');
  assert(tier4Price.totalCostInr === 1202 * 250, 'Tier 4 total cost = 250m * ₹1,202 = ₹300,500');
  assert(tier4Price.savingsInr === (1850 * 250) - (1202 * 250), 'Tier 4 savings is ₹162,000');

  // Low stock threshold checking
  const isLowStock = sampleSilk.stockLevelMeters <= sampleSilk.reorderThresholdMeters;
  assert(!isLowStock, 'Mulberry silk stock (480m) exceeds threshold (100m)');

  const lowStockItem: VendorMaterialItem = {
    ...sampleSilk,
    id: 'mat_test_low',
    stockLevelMeters: 45,
    reorderThresholdMeters: 50
  };
  assert(lowStockItem.stockLevelMeters <= lowStockItem.reorderThresholdMeters, 'Low stock warning triggers when stock <= reorderThreshold');

  // -------------------------------------------------------------
  // 2. Smart Fabric Recommendation Engine Tests
  // -------------------------------------------------------------
  console.log('\n[Test Group 2: Smart Fabric Recommendation Algorithm]');
  const sherwaniRec = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
    garmentCategory: 'mens-sherwani',
    maxBudgetPerMeter: 2500,
    desiredDrape: 'STRUCTURED',
    preferredColorTone: 'Ivory',
    includeLiningAndTrims: true
  });

  assert(sherwaniRec.garmentCategory === 'mens-sherwani', 'Recommendation target matches requested category');
  assert(sherwaniRec.options.bestMatch !== undefined, 'Generates Best Match option');
  assert(sherwaniRec.options.budgetSaver !== undefined, 'Generates Budget Saver option');
  assert(sherwaniRec.options.luxuryUpgrade !== undefined, 'Generates Luxury Upgrade option');
  assert(sherwaniRec.options.bestMatch.fitScore >= 70, 'Best match achieves high fit score (>= 70%)');
  assert(sherwaniRec.options.bestMatch.requiredMeters > 0, 'Best match has positive required meters');
  assert(sherwaniRec.options.bestMatch.grandTotalMaterialCostInr > 0, 'Best match calculates positive total cost');
  assert(sherwaniRec.comparisonMatrix.length >= 4, 'Comparison matrix contains at least 4 criteria');

  // Test across all 9 categories
  const allCategories: GarmentCategory[] = [
    'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
    'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
  ];

  for (const cat of allCategories) {
    const yieldMeters = calculateFabricYield({ garmentCategory: cat, boltWidth: 44 }).requiredMeters;
    assert(yieldMeters > 0, `CAD yield for ${cat} on 44" bolt is > 0 (${yieldMeters}m)`);

    const rec = computeSmartFabricRecommendations(SEED_MATERIALS_CATALOG, {
      garmentCategory: cat,
      maxBudgetPerMeter: 3000,
      minRequiredYieldMeters: yieldMeters
    });
    assert(rec.options.bestMatch.primaryFabric !== undefined, `Category ${cat} resolves a primary fabric candidate`);
  }

  // -------------------------------------------------------------
  // 3. Tailor Bidding & RFQ Workflows
  // -------------------------------------------------------------
  console.log('\n[Test Group 3: Tailor Bidding & RFQ Workflows]');
  assert(SEED_ARTISAN_PORTFOLIOS.length >= 2, 'Seed artisan portfolios catalog contains verified karigars');
  const ustadRafiq = SEED_ARTISAN_PORTFOLIOS.find(a => a.id === 'art_rafiq_zardozi_01')!;
  assert(ustadRafiq.specialties.includes('ZARDOZI_EMBROIDERY'), 'Ustad Rafiq has Zardozi specialization');
  assert(ustadRafiq.standardMinuteSamRateInr === 55, 'Ustad Rafiq standard SAM rate = ₹55/min');

  const masterLatif = SEED_ARTISAN_PORTFOLIOS.find(a => a.id === 'art_latif_canvas_02')!;
  assert(masterLatif.specialties.includes('MASTER_CANVAS_CUTTING'), 'Master Latif has Master Cutting specialization');
  assert(masterLatif.standardMinuteSamRateInr === 65, 'Master Latif standard SAM rate = ₹65/min');

  const sampleBrief = SEED_PRODUCTION_BRIEFS[0];
  assert(sampleBrief.batchQuantity === 12, 'Sample brief batch quantity = 12 units');
  assert(sampleBrief.totalBudgetCeilingInr === 12 * 42000, 'Total budget ceiling = 12 * ₹42,000 = ₹504,000');

  const sampleBid = SEED_TAILOR_BIDS[0];
  assert(sampleBid.briefId === sampleBrief.id, 'Sample bid links to sample brief');
  assert(sampleBid.totalBidAmountInr === sampleBid.bidAmountPerUnitInr * sampleBrief.batchQuantity, 'Total bid amount matches unit * quantity');

  // Milestone sum check
  const milestoneSumPercent = sampleBid.milestonePlan.reduce((sum, m) => sum + m.percentagePayout, 0);
  assert(milestoneSumPercent === 100, 'Milestone percentage payouts sum exactly to 100%');

  // -------------------------------------------------------------
  // 4. Milestone Escrow State Machine Tests
  // -------------------------------------------------------------
  console.log('\n[Test Group 4: Milestone Escrow Contract Transitions]');
  const sampleContract = SEED_PRODUCTION_CONTRACTS[0];
  assert(sampleContract.escrowStatus === 'HELD_IN_ESCROW', 'Initial contract escrow status is HELD_IN_ESCROW');
  assert(sampleContract.milestones.length === 4, 'Contract contains 4 milestone stages');

  // Stage 1 Approval
  const stage1Result = transitionContractMilestone(sampleContract, 1, 'APPROVED_AND_PAID');
  assert(stage1Result.updatedContract !== undefined, 'Stage 1 returns updated contract');
  assert(stage1Result.updatedContract!.escrowStatus === 'PARTIAL_RELEASE', 'Stage 1 release transitions escrow to PARTIAL_RELEASE');
  assert(stage1Result.totalReleasedInr === 92400, 'Stage 1 releases ₹92,400 (20% of ₹462,000)');
  assert(stage1Result.remainingInEscrowInr === 462000 - 92400, 'Remaining escrow = ₹369,600');
  assert(!stage1Result.isFullyCompleted, 'Contract is not yet fully completed');
  assert(stage1Result.updatedContract!.currentState === 'SKELETON_TRIAL_INSPECTION', 'Current state advances to SKELETON_TRIAL_INSPECTION');

  // Stage 2 Approval
  const stage2Result = transitionContractMilestone(stage1Result.updatedContract!, 2, 'APPROVED_AND_PAID');
  assert(stage2Result.totalReleasedInr === 92400 + 138600, 'Stage 2 releases cumulative ₹231,000 (50%)');
  assert(stage2Result.updatedContract!.currentState === 'EMBROIDERY_ASSEMBLY', 'Current state advances to EMBROIDERY_ASSEMBLY');

  // Stage 3 Approval
  const stage3Result = transitionContractMilestone(stage2Result.updatedContract!, 3, 'APPROVED_AND_PAID');
  assert(stage3Result.totalReleasedInr === 92400 + 138600 + 138600, 'Stage 3 releases cumulative ₹369,600 (80%)');
  assert(stage3Result.updatedContract!.currentState === 'FINAL_QC', 'Current state advances to FINAL_QC');

  // Stage 4 Final Approval
  const stage4Result = transitionContractMilestone(stage3Result.updatedContract!, 4, 'APPROVED_AND_PAID');
  assert(stage4Result.totalReleasedInr === 462000, 'Stage 4 releases 100% ₹462,000');
  assert(stage4Result.remainingInEscrowInr === 0, 'Remaining escrow = ₹0');
  assert(stage4Result.isFullyCompleted, 'Contract is fully completed');
  assert(stage4Result.updatedContract!.escrowStatus === 'FULLY_RELEASED', 'Escrow status is FULLY_RELEASED');
  assert(stage4Result.updatedContract!.currentState === 'COMPLETED', 'Current state is COMPLETED');

  // -------------------------------------------------------------
  // 5. Aliases & Seed Compatibility
  // -------------------------------------------------------------
  console.log('\n[Test Group 5: Seed Aliases & Compatibility]');
  assert(SEED_VENDOR_MATERIALS.length === SEED_MATERIALS_CATALOG.length, 'SEED_VENDOR_MATERIALS alias matches SEED_MATERIALS_CATALOG');
  assert(SEED_FABRIC_SOURCING_ORDERS.length === SEED_MATERIAL_ORDERS.length, 'SEED_FABRIC_SOURCING_ORDERS alias matches SEED_MATERIAL_ORDERS');
  assert(SEED_ARTISAN_PROFILES.length === SEED_ARTISAN_PORTFOLIOS.length, 'SEED_ARTISAN_PROFILES alias matches SEED_ARTISAN_PORTFOLIOS');

  console.log(`\n========================================`);
  console.log(`MILESTONE 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (typeof require !== 'undefined' && require.main === module) {
  const res = runMilestone3EcosystemTests();
  if (res.failed > 0) {
    process.exit(1);
  }
}
