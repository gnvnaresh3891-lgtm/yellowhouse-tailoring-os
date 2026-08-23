import { runStorageUtilsTests } from './storage-utils.test';
import { runM2StressTests } from './m2-stress.test';
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
  console.log(`GRAND SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllSuites().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
