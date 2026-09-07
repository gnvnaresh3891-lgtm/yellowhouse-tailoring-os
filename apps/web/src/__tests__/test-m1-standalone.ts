import { runM1PreviewChallengerRbacSuite } from './m1-preview-challenger-rbac.test';

const res = runM1PreviewChallengerRbacSuite();
console.log('\n========================================');
console.log('STANDALONE M1 RUN SUMMARY:');
console.log(`Passed: ${res.passed}, Failed: ${res.failed}`);
console.log('Findings:');
res.findings.forEach((f, idx) => console.log(`${idx + 1}. ${f}`));
console.log('========================================');
