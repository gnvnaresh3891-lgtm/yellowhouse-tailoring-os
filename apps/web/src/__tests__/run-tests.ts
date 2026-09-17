import { runStorageUtilsTests } from './storage-utils.test';
import { runM2StressTests } from './m2-stress.test';
import { runM2OrderBomLifecycleTests } from './m2-order-bom-lifecycle.test';
import { runLandmarkValidationTests } from './landmark-validation.test';
import { runSamCalculatorTests } from './sam-calculator.test';
import { runPricingCalculatorTests } from './pricing-calculator.test';
import { runStateSyncTests } from './state-sync.test';
import { runAdversarialM3Tests } from './adversarial-m3-challenge.test';
import { runRbacVisibilityTests } from './rbac-visibility.test';
import { runAdversarialM4Tests } from './rbac-adversarial-m4.test';
import { runEcosystemAlgorithmsTests } from './ecosystem-algorithms.test';
import { runChallenger2SeedsAndLicensingTests } from './challenger-m1-2-seeds-licensing.test';
import { runAdversarialStressSuite } from './challenger-m1-adversarial.test';
import { runDigitalAssetsTests } from './digital-assets.test';
import { runEquipmentSharingTests } from './equipment-sharing.test';
import { runMilestone3EcosystemTests } from './milestone3-ecosystem.test';
import { runTrialStylistDirectoryTests } from './trial-stylist-directory.test';
import { runPrintAndRbacExpansionTests } from './print-and-rbac-expansion.test';
import { runChallengerFinalStressSuite } from './challenger-final-stress.test';
import { runM1PreviewChallengerRbacSuite } from './m1-preview-challenger-rbac.test';
import { runM1EmpiricalStressSuite } from './challenger-m1-r5-stress.test';
import { runM2PreviewChallengerDeepStressSuite } from './preview-challenger-m2-deep-stress.test';
import { runM2PreviewChallengerPrintSvgSuite } from './m2-preview-challenger-print-svg.test';
import { runM3CadProductionDeepSuite } from './m3-cad-production-deep.test';
import { runM3PreviewChallengerDeepStressSuite } from './preview-challenger-m3-deep-stress.test';
import { runM3PreviewChallengerCadStudioStressSuite } from './preview-challenger-m3-cad-stress.test';
import { runM1AdversarialVerificationSuite } from './challenger-m1-r2-adversarial-verification.test';
import { runM1AppleDesignSystemTests } from './m1-apple-design-system.test';
import { runAdversarialVerification } from './challenger-m1-adversarial-verification.test';
import { runM2PublicAuthOnboardingTests } from './m2-public-auth-onboarding.test';
import { runM2RebuildAdversarialTests } from './challenger-m2-rebuild-adversarial.test';
import { runM3CoreAtelierCadTests } from './m3-core-atelier-cad.test';
import { runChallengerM3AdversarialSuite } from './challenger-m3-adversarial-verification.test';
import { runM3ChallengerAdversarialTests } from './challenger-m3-adversarial.test';
import { runM4ProductionOperationsTests } from './m4-production-operations.test';
import { runChallengerM42AdversarialSuite } from './challenger-m4-2-adversarial.test';
import { runChallengerM4EmpiricalStressTests } from './challenger-m4-empirical-stress.test';
import { runM5AdminEcosystemTests } from './m5-admin-ecosystem.test';
import { getAllGarmentTemplates, getGarmentTemplate, getGarmentTemplatesByGender, POM_SCHEMAS } from '../lib/pom-schemas';
import { calculateDynamicEase, calculatePostureOffset } from '../lib/ease-calculator';
import { calculateFabricYield } from '../lib/fabric-yield';
import { getDynamicGirthAndLength } from '../context/MeasurementEngineContext';
import { GarmentCategory, PomSchemaItem, PostureProfile } from '../types/measurement';

async function runAllSuites() {
  console.log('\n==================================================');
  console.log('--- YELLOWHOUSE WEB COMPREHENSIVE TEST RUNNER ---');
  console.log('==================================================\n');

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

  // 1. Run Storage Utils Test Suite
  const storageResult = runStorageUtilsTests();
  passed += storageResult.passed;
  failed += storageResult.failed;

  // 1b. Run Milestone 2 Stress Test Suite
  const m2Result = runM2StressTests();
  passed += m2Result.passed;
  failed += m2Result.failed;

  // 1b-2. Run Milestone 2 Order Lifecycle, BOM & Barcode/QR Verification Suite
  const m2LifecycleResult = runM2OrderBomLifecycleTests();
  passed += m2LifecycleResult.passed;
  failed += m2LifecycleResult.failed;

  // 1b-3. Run Milestone 2 Public Landing Page, RedHouse OS, Auth & Onboarding Suite
  const m2PublicAuthResult = runM2PublicAuthOnboardingTests();
  passed += m2PublicAuthResult.passed;
  failed += m2PublicAuthResult.failed;

  // 1b-4. Run Milestone 2 Empirical Adversarial Stress Suite (Challenger 1)
  const m2AdversarialResult = runM2RebuildAdversarialTests();
  passed += m2AdversarialResult.passed;
  failed += m2AdversarialResult.failed;

  // 1c. Run Milestone 3 SAM Calculator Test Suite
  const samResult = runSamCalculatorTests();
  passed += samResult.passed;
  failed += samResult.failed;

  // 1d. Run Milestone 3 Pricing Calculator Test Suite
  const pricingResult = runPricingCalculatorTests();
  passed += pricingResult.passed;
  failed += pricingResult.failed;

  // 1e. Run Milestone 3 State Synchronization Test Suite
  const stateSyncResult = runStateSyncTests();
  passed += stateSyncResult.passed;
  failed += stateSyncResult.failed;

  // 1f. Run Milestone 3 Adversarial Challenge Test Suite
  const adversarialResult = runAdversarialM3Tests();
  passed += adversarialResult.passed;
  failed += adversarialResult.failed;

  // 1g. Run Milestone 4 RBAC Route Visibility Test Suite
  const rbacResult = runRbacVisibilityTests();
  passed += rbacResult.passed;
  failed += rbacResult.failed;

  // 1h. Run Milestone 4 Adversarial RBAC & UI Test Suite
  const m4AdversarialResult = runAdversarialM4Tests();
  passed += m4AdversarialResult.passed;
  failed += m4AdversarialResult.failed;

  // 1i. Run Milestone 1 Ecosystem Layer 1-5 Algorithms Test Suite
  const ecosystemResult = runEcosystemAlgorithmsTests();
  passed += ecosystemResult.passed;
  failed += ecosystemResult.failed;

  // 1j. Run Milestone 1 Challenger 2 Seeds & Licensing Verification Suite
  const challenger2Result = runChallenger2SeedsAndLicensingTests();
  passed += challenger2Result.passed;
  failed += challenger2Result.failed;

  // 1k. Run Milestone 1 Challenger 1 Adversarial Stress Test Suite
  const challenger1Result = runAdversarialStressSuite();
  passed += challenger1Result.passed;
  failed += challenger1Result.failed;

  // 1l. Run Milestone 2 Layer 1 Digital Assets Test Suite
  const digitalAssetsResult = runDigitalAssetsTests();
  passed += digitalAssetsResult.passed;
  failed += digitalAssetsResult.failed;

  // 1m. Run Milestone 2 Layer 2 Equipment Sharing Test Suite
  const equipmentSharingResult = runEquipmentSharingTests();
  passed += equipmentSharingResult.passed;
  failed += equipmentSharingResult.failed;

  // 1n. Run Milestone 3 Layer 3 & 4 Supply & Bidding Ecosystem Test Suite
  const m3EcosystemResult = runMilestone3EcosystemTests();
  passed += m3EcosystemResult.passed;
  failed += m3EcosystemResult.failed;

  // 1o. Run Milestone 4 Layer 5 3-Month Trial & Stylist Directory Test Suite
  const trialStylistResult = runTrialStylistDirectoryTests();
  passed += trialStylistResult.passed;
  failed += trialStylistResult.failed;

  // 1p. Run Milestone 4 Print Layouts & Expanded RBAC Test Suite
  const printRbacResult = runPrintAndRbacExpansionTests();
  passed += printRbacResult.passed;
  failed += printRbacResult.failed;

  // 1q. Run Final Adversarial Challenger Comprehensive Stress Suite
  const challengerFinalResult = runChallengerFinalStressSuite();
  passed += challengerFinalResult.passed;
  failed += challengerFinalResult.failed;

  // 1r. Run M1 Preview Challenger RBAC & Admin Gate Security Suite
  const m1ChallengerResult = runM1PreviewChallengerRbacSuite();
  passed += m1ChallengerResult.passed;
  failed += m1ChallengerResult.failed;

  // 1s. Run M1 Empirical Challenger R5 Onboarding & Sandbox Suite
  const m1R5Result = runM1EmpiricalStressSuite();
  passed += m1R5Result.totalPassed;
  failed += m1R5Result.totalFailed;

  // 1t. Run M2 Preview Challenger Deep Stress Suite (BOM, Pricing, Status Transitions, Bidirectional Sync, Barcode/QR)
  const m2DeepStressResult = runM2PreviewChallengerDeepStressSuite();
  passed += m2DeepStressResult.passed;
  failed += m2DeepStressResult.failed;

  // 1u. Run M2 Preview Challenger Pure SVG QR/Barcode & Print Layout Stress Suite
  const m2PrintSvgResult = runM2PreviewChallengerPrintSvgSuite();
  passed += m2PrintSvgResult.passed;
  failed += m2PrintSvgResult.failed;

  // 1v. Run M3 CAD Vector Silhouette & Karigar Production Deep Suite
  const m3DeepResult = runM3CadProductionDeepSuite();
  passed += m3DeepResult.passed;
  failed += m3DeepResult.failed;

  // 1w. Run M3 Empirical Challenger Karigar Production & SAM Deep Stress Suite
  const m3StressResult = runM3PreviewChallengerDeepStressSuite();
  passed += m3StressResult.passed;
  failed += m3StressResult.failed;

  // 1x. Run M3 Empirical Challenger CAD Studio, Mannequin Silhouette & Deltas Stress Suite
  const m3CadStudioResult = runM3PreviewChallengerCadStudioStressSuite();
  passed += m3CadStudioResult.passed;
  failed += m3CadStudioResult.failed;

  // 1x-2. Run Milestone 3 Core Atelier Operations, Executive Dashboard & 2D CAD Suite
  const m3CoreAtelierResult = runM3CoreAtelierCadTests();
  passed += m3CoreAtelierResult.passed;
  failed += m3CoreAtelierResult.failed;

  // 1x-3. Run Milestone 3 Challenger Adversarial Verification Suite
  const m3ChallengerResult = runM3ChallengerAdversarialTests();
  passed += m3ChallengerResult.passed;
  failed += m3ChallengerResult.failed;

  // 1x-4. Run Milestone 3 Empirical Challenger Verification Suite (Challenger 1)
  const challengerM3G4_1Result = runChallengerM3AdversarialSuite();
  passed += challengerM3G4_1Result.passed;
  failed += challengerM3G4_1Result.failed;

  // 1y. Run Challenger 1 (Round 2) M1 Adversarial Verification Suite
  const challengerM1R2Result = runM1AdversarialVerificationSuite();
  passed += challengerM1R2Result.totalPassed;
  failed += challengerM1R2Result.totalFailed;

  // 1z. Run Milestone 1 Apple Design System & UI Primitives Suite
  const m1DesignSystemResult = runM1AppleDesignSystemTests();
  passed += m1DesignSystemResult.passed;
  failed += m1DesignSystemResult.failed;

  // 1z-2. Run Challenger 1 Milestone 1 Adversarial Verification Suite
  const m1ChallengerAdvResult = runAdversarialVerification();
  passed += m1ChallengerAdvResult.passed;
  failed += m1ChallengerAdvResult.failed;

  // 1z-3. Run Milestone 4 Production Floor, Karigar SAM & Operations Suite
  const m4ProductionOpsResult = runM4ProductionOperationsTests();
  passed += m4ProductionOpsResult.passed;
  failed += m4ProductionOpsResult.failed;

  // 1z-4. Run Challenger M4-2 Adversarial Operations & Print Suite
  const challengerM42Result = runChallengerM42AdversarialSuite();
  passed += challengerM42Result.passed;
  failed += challengerM42Result.failed;

  // 1z-5. Run Challenger M4-1 Empirical Adversarial Stress Suite
  const challengerM41Result = runChallengerM4EmpiricalStressTests();
  passed += challengerM41Result.passed;
  failed += challengerM41Result.failed;

  // 1z-6. Run Milestone 5 Admin Security Console & Ecosystem Marketplace Suite
  const m5AdminEcosystemResult = runM5AdminEcosystemTests();
  passed += m5AdminEcosystemResult.passed;
  failed += m5AdminEcosystemResult.failed;

  // 2. POM Schemas & Measurement Engine Tests
  console.log('[Suite 2: POM Schemas & Garment Templates]');
  const allCategories: GarmentCategory[] = [
    'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
    'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
  ];

  assert(Object.keys(POM_SCHEMAS).length === 9, 'Defines all 9 garment categories');
  assert(getAllGarmentTemplates().length === 9, 'getAllGarmentTemplates returns 9 templates');
  assert(getGarmentTemplatesByGender('Men').length === 4, '4 Men garment templates');
  assert(getGarmentTemplatesByGender('Women').length === 5, '5 Women garment templates');

  for (const cat of allCategories) {
    const template = getGarmentTemplate(cat);
    assert(template.poms.length > 0, `Template ${cat} has non-empty POMs array`);
    for (const pom of template.poms) {
      assert(pom.baseMeasurement >= pom.validationRange.min && pom.baseMeasurement <= pom.validationRange.max, `POM ${pom.code} base measurement within valid range`);
    }
  }

  // 3. Posture Engine Tests
  console.log('\n[Suite 3: 4-Axis Posture Profile Modifier Engine]');
  const normalPosture: PostureProfile = {
    shoulderSlope: 'normal',
    backCurvature: 'normal',
    abdomenStance: 'normal',
    hipSpineStance: 'normal'
  };

  assert(calculatePostureOffset('M-SU-01', 'girth', 'Jacket Chest', normalPosture) === 0, 'Normal posture returns 0 offset');

  const slopedPosture: PostureProfile = { ...normalPosture, shoulderSlope: 'sloped' };
  assert(calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', slopedPosture) === 0.375, 'Sloped shoulders deepens armscye by +0.375"');
  assert(calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', slopedPosture) === -0.25, 'Sloped shoulders narrows shoulder width by -0.25"');

  // 4. Dynamic Ease Math Tests
  console.log('\n[Suite 4: Dynamic Ease Allowance Formulas]');
  const samplePomItem: PomSchemaItem = {
    id: 'm-su-01', code: 'M-SU-01', name: 'Jacket Chest Circumference', category: 'girth',
    baseMeasurement: 40.0, defaultEase: 3.5, unit: 'in', validationRange: { min: 30.0, max: 60.0 }
  };

  const regResult = calculateDynamicEase({
    pomItem: samplePomItem, netBody: 40.0, fitPreference: 'regular', postureProfile: normalPosture
  });
  assert(regResult.targetGarmentMeasurement === 43.5, 'Regular fit target = 40 + 3.5 = 43.5"');

  // 5. Fabric Yield Math Tests
  console.log('\n[Suite 5: Size-Scaled Fabric Yield Math]');
  const suitYield = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 44 });
  assert(suitYield.requiredMeters === 5.00, "Men's suit 44\" bolt width base yield = 5.00m");

  // 6. Landmark Validation Tests
  console.log('\n[Suite 6: Landmark & Hotspot Validation]');
  const landmarkResult = runLandmarkValidationTests();
  passed += landmarkResult.passed;
  failed += landmarkResult.failed;

  console.log(`\n========================================`);
  console.log(`SUITE BREAKDOWN:`);
  console.log(`- storage: ${storageResult.failed} failed`);
  console.log(`- m2: ${m2Result.failed} failed`);
  console.log(`- m2Lifecycle: ${m2LifecycleResult.failed} failed`);
  console.log(`- m2PublicAuth: ${m2PublicAuthResult.failed} failed`);
  console.log(`- sam: ${samResult.failed} failed`);
  console.log(`- pricing: ${pricingResult.failed} failed`);
  console.log(`- stateSync: ${stateSyncResult.failed} failed`);
  console.log(`- adversarial: ${adversarialResult.failed} failed`);
  console.log(`- rbac: ${rbacResult.failed} failed`);
  console.log(`- m4Adversarial: ${m4AdversarialResult.failed} failed`);
  console.log(`- ecosystem: ${ecosystemResult.failed} failed`);
  console.log(`- challenger2: ${challenger2Result.failed} failed`);
  console.log(`- challenger1: ${challenger1Result.failed} failed`);
  console.log(`- digitalAssets: ${digitalAssetsResult.failed} failed`);
  console.log(`- equipmentSharing: ${equipmentSharingResult.failed} failed`);
  console.log(`- m3Ecosystem: ${m3EcosystemResult.failed} failed`);
  console.log(`- trialStylist: ${trialStylistResult.failed} failed`);
  console.log(`- printRbac: ${printRbacResult.failed} failed`);
  console.log(`- challengerFinal: ${challengerFinalResult.failed} failed`);
  console.log(`- m1Challenger: ${m1ChallengerResult.failed} failed`);
  console.log(`- m1R5: ${m1R5Result.totalFailed} failed`);
  console.log(`- m2DeepStress: ${m2DeepStressResult.failed} failed`);
  console.log(`- m2PrintSvg: ${m2PrintSvgResult.failed} failed`);
  console.log(`- m3Deep: ${m3DeepResult.failed} failed`);
  console.log(`- m3Stress: ${m3StressResult.failed} failed`);
  console.log(`- m3CadStudio: ${m3CadStudioResult.failed} failed`);
  console.log(`- m3CoreAtelier: ${m3CoreAtelierResult.failed} failed`);
  console.log(`- m3Challenger: ${m3ChallengerResult.failed} failed`);
  console.log(`- challengerM3G4_1: ${challengerM3G4_1Result.failed} failed`);
  console.log(`- challengerM1R2: ${challengerM1R2Result.totalFailed} failed`);
  console.log(`- m1DesignSystem: ${m1DesignSystemResult.failed} failed`);
  console.log(`- m4ProductionOps: ${m4ProductionOpsResult.failed} failed`);
  console.log(`- challengerM42: ${challengerM42Result.failed} failed`);
  console.log(`- challengerM41: ${challengerM41Result.failed} failed`);
  console.log(`- landmark: ${landmarkResult.failed} failed`);
  console.log(`\n========================================`);
  console.log(`GRAND SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  console.log(`FAILED SUITE SUMMARY:`);
  if (m3CoreAtelierResult.failed > 0) {
    console.log(`❌ m3CoreAtelier: ${m3CoreAtelierResult.failed} failed:`);
    m3CoreAtelierResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m2PublicAuthResult.failed > 0) {
    console.log(`❌ m2PublicAuth: ${m2PublicAuthResult.failed} failed:`);
    m2PublicAuthResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m1DesignSystemResult.failed > 0) {
    console.log(`❌ m1DesignSystem: ${m1DesignSystemResult.failed} failed:`);
    m1DesignSystemResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m2PrintSvgResult.failed > 0) {
    console.log(`❌ m2PrintSvg: ${m2PrintSvgResult.failed} failed:`);
    if ((m2PrintSvgResult as any).findings) (m2PrintSvgResult as any).findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m3DeepResult.failed > 0) {
    console.log(`❌ m3Deep: ${m3DeepResult.failed} failed:`);
    if ((m3DeepResult as any).failedMsgs) (m3DeepResult as any).failedMsgs.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m3StressResult.failed > 0) {
    console.log(`❌ m3Stress: ${m3StressResult.failed} failed:`);
    if ((m3StressResult as any).failedMsgs) (m3StressResult as any).failedMsgs.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m3CadStudioResult.failed > 0) {
    console.log(`❌ m3CadStudio: ${m3CadStudioResult.failed} failed:`);
    m3CadStudioResult.failedMsgs.forEach(m => console.log(`   - ${m}`));
  }
  if (m3ChallengerResult.failed > 0) {
    console.log(`❌ m3Challenger: ${m3ChallengerResult.failed} failed:`);
    m3ChallengerResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (challengerM3G4_1Result.failed > 0) {
    console.log(`❌ challengerM3G4_1: ${challengerM3G4_1Result.failed} failed:`);
    challengerM3G4_1Result.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m4ProductionOpsResult.failed > 0) {
    console.log(`❌ m4ProductionOps: ${m4ProductionOpsResult.failed} failed:`);
    m4ProductionOpsResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (challengerM42Result.failed > 0) {
    console.log(`❌ challengerM42: ${challengerM42Result.failed} failed:`);
    challengerM42Result.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (challengerM41Result.failed > 0) {
    console.log(`❌ challengerM41: ${challengerM41Result.failed} failed:`);
    challengerM41Result.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  if (m5AdminEcosystemResult.failed > 0) {
    console.log(`❌ m5AdminEcosystem: ${m5AdminEcosystemResult.failed} failed:`);
    m5AdminEcosystemResult.findings.forEach((m: string) => console.log(`   - ${m}`));
  }
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllSuites().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
