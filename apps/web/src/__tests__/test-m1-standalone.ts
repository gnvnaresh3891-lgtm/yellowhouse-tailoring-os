import { runM1PreviewChallengerRbacSuite } from './m1-preview-challenger-rbac.test';
import { runM1AppleDesignSystemTests } from './m1-apple-design-system.test';
import { runAdversarialVerification } from './challenger-m1-adversarial-verification.test';

console.log('Running M1 Standalone Test Suites...');

const rbacRes = runM1PreviewChallengerRbacSuite();
const designRes = runM1AppleDesignSystemTests();
const adversarialRes = runAdversarialVerification();

const totalPassed = rbacRes.passed + designRes.passed + adversarialRes.passed;
const totalFailed = rbacRes.failed + designRes.failed + adversarialRes.failed;

console.log('\n========================================');
console.log('STANDALONE M1 RUN SUMMARY:');
console.log(`RBAC Suite: ${rbacRes.passed} passed, ${rbacRes.failed} failed`);
console.log(`Apple Design System Suite: ${designRes.passed} passed, ${designRes.failed} failed`);
console.log(`Adversarial Verification Suite: ${adversarialRes.passed} passed, ${adversarialRes.failed} failed`);
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
console.log('========================================');

if (totalFailed > 0) {
  process.exit(1);
}

