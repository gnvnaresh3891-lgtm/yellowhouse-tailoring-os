import { runStorageUtilsTests } from '../../../apps/web/src/__tests__/storage-utils.test';
import { runM2StressTests } from '../../../apps/web/src/__tests__/m2-stress.test';
import { runM2OrderBomLifecycleTests } from '../../../apps/web/src/__tests__/m2-order-bom-lifecycle.test';
import { runLandmarkValidationTests } from '../../../apps/web/src/__tests__/landmark-validation.test';
import { runSamCalculatorTests } from '../../../apps/web/src/__tests__/sam-calculator.test';
import { runPricingCalculatorTests } from '../../../apps/web/src/__tests__/pricing-calculator.test';
import { runStateSyncTests } from '../../../apps/web/src/__tests__/state-sync.test';
import { runAdversarialM3Tests } from '../../../apps/web/src/__tests__/adversarial-m3-challenge.test';
import { runRbacVisibilityTests } from '../../../apps/web/src/__tests__/rbac-visibility.test';
import { runAdversarialM4Tests } from '../../../apps/web/src/__tests__/rbac-adversarial-m4.test';
import { runEcosystemAlgorithmsTests } from '../../../apps/web/src/__tests__/ecosystem-algorithms.test';
import { runChallenger2SeedsAndLicensingTests } from '../../../apps/web/src/__tests__/challenger-m1-2-seeds-licensing.test';
import { runAdversarialStressSuite } from '../../../apps/web/src/__tests__/challenger-m1-adversarial.test';
import { runDigitalAssetsTests } from '../../../apps/web/src/__tests__/digital-assets.test';
import { runEquipmentSharingTests } from '../../../apps/web/src/__tests__/equipment-sharing.test';
import { runMilestone3EcosystemTests } from '../../../apps/web/src/__tests__/milestone3-ecosystem.test';
import { runTrialStylistDirectoryTests } from '../../../apps/web/src/__tests__/trial-stylist-directory.test';
import { runPrintAndRbacExpansionTests } from '../../../apps/web/src/__tests__/print-and-rbac-expansion.test';
import { runChallengerFinalStressSuite } from '../../../apps/web/src/__tests__/challenger-final-stress.test';
import { runM1PreviewChallengerRbacSuite } from '../../../apps/web/src/__tests__/m1-preview-challenger-rbac.test';
import { runM1EmpiricalStressSuite } from '../../../apps/web/src/__tests__/challenger-m1-r5-stress.test';
import { runM2PreviewChallengerDeepStressSuite } from '../../../apps/web/src/__tests__/preview-challenger-m2-deep-stress.test';
import { runM2PreviewChallengerPrintSvgSuite } from '../../../apps/web/src/__tests__/m2-preview-challenger-print-svg.test';
import { runM3CadProductionDeepSuite } from '../../../apps/web/src/__tests__/m3-cad-production-deep.test';

async function diagnose() {
  const suites: Array<{ name: string; fn: () => any }> = [
    { name: 'runStorageUtilsTests', fn: runStorageUtilsTests },
    { name: 'runM2StressTests', fn: runM2StressTests },
    { name: 'runM2OrderBomLifecycleTests', fn: runM2OrderBomLifecycleTests },
    { name: 'runSamCalculatorTests', fn: runSamCalculatorTests },
    { name: 'runPricingCalculatorTests', fn: runPricingCalculatorTests },
    { name: 'runStateSyncTests', fn: runStateSyncTests },
    { name: 'runAdversarialM3Tests', fn: runAdversarialM3Tests },
    { name: 'runRbacVisibilityTests', fn: runRbacVisibilityTests },
    { name: 'runAdversarialM4Tests', fn: runAdversarialM4Tests },
    { name: 'runEcosystemAlgorithmsTests', fn: runEcosystemAlgorithmsTests },
    { name: 'runChallenger2SeedsAndLicensingTests', fn: runChallenger2SeedsAndLicensingTests },
    { name: 'runAdversarialStressSuite', fn: runAdversarialStressSuite },
    { name: 'runDigitalAssetsTests', fn: runDigitalAssetsTests },
    { name: 'runEquipmentSharingTests', fn: runEquipmentSharingTests },
    { name: 'runMilestone3EcosystemTests', fn: runMilestone3EcosystemTests },
    { name: 'runTrialStylistDirectoryTests', fn: runTrialStylistDirectoryTests },
    { name: 'runPrintAndRbacExpansionTests', fn: runPrintAndRbacExpansionTests },
    { name: 'runChallengerFinalStressSuite', fn: runChallengerFinalStressSuite },
    { name: 'runM1PreviewChallengerRbacSuite', fn: runM1PreviewChallengerRbacSuite },
    { name: 'runM1EmpiricalStressSuite', fn: runM1EmpiricalStressSuite },
    { name: 'runM2PreviewChallengerDeepStressSuite', fn: runM2PreviewChallengerDeepStressSuite },
    { name: 'runM2PreviewChallengerPrintSvgSuite', fn: runM2PreviewChallengerPrintSvgSuite },
    { name: 'runM3CadProductionDeepSuite', fn: runM3CadProductionDeepSuite },
  ];

  console.log('--- DIAGNOSING SUITES ---');
  for (const suite of suites) {
    try {
      const res = suite.fn();
      const failed = res?.failed || res?.totalFailed || 0;
      const passed = res?.passed || res?.totalPassed || 0;
      if (failed > 0) {
        console.log(`[SUITE FAILURE] ${suite.name}: ${failed} failed, ${passed} passed`);
      } else {
        console.log(`[SUITE OK] ${suite.name}: ${passed} passed`);
      }
    } catch (err: any) {
      console.log(`[SUITE EXCEPTION] ${suite.name}: ${err?.message}`);
    }
  }
}

diagnose();
