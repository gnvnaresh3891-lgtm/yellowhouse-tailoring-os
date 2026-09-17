import { runM2PublicAuthOnboardingTests } from './m2-public-auth-onboarding.test';
import { runM2RebuildAdversarialTests } from './challenger-m2-rebuild-adversarial.test';

console.log('Running M2 Standalone Rebuild Test Suites...');

const publicAuthRes = runM2PublicAuthOnboardingTests();
const adversarialRes = runM2RebuildAdversarialTests();

const totalPassed = publicAuthRes.passed + adversarialRes.passed;
const totalFailed = publicAuthRes.failed + adversarialRes.failed;

console.log('\n========================================');
console.log('STANDALONE M2 RUN SUMMARY:');
console.log(`Public & Auth Suite: ${publicAuthRes.passed} passed, ${publicAuthRes.failed} failed`);
console.log(`Adversarial Verification Suite: ${adversarialRes.passed} passed, ${adversarialRes.failed} failed`);
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
console.log('========================================');

if (totalFailed > 0) {
  process.exit(1);
}
