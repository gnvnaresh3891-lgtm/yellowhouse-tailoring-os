## 2026-08-06T00:31:13Z
Task: Remediate 3 specific issues identified during Milestone 1 gate review for yellowhouse at C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse.

Issues to fix:
1. Fix test failure in apps/web/src/__tests__/run-all-tests.ts (around line 103): The "Women's 24-kali lehenga yield" test call omitted `hasShrinkage: true`, causing a calculation mismatch (8.41m vs expected 8.83m). Include `hasShrinkage: true` in the test input parameters so all test suites pass with exit code 0.
2. Fix defensive check in apps/web/src/lib/fabric-yield.ts: Add guard for `boltWidth <= 0` (fallback to 44" default if boltWidth is 0 or negative).
3. Align NestJS backend service in apps/api/src/modules/measurements/measurements.service.ts: Ensure `calculateEase()` posture offset matrices and `calculateFabricYield()` math match apps/web/src/lib/ease-calculator.ts and apps/web/src/lib/fabric-yield.ts exactly so Web and API logic are 100% unified.

File Ownership:
- apps/web/src/__tests__/run-all-tests.ts
- apps/web/src/lib/fabric-yield.ts
- apps/api/src/modules/measurements/measurements.service.ts

Verification:
- Run `npx tsx apps/web/src/__tests__/run-all-tests.ts` to verify 100% pass rate.
- Run `npx tsc --noEmit` in apps/web and apps/api to verify zero errors.
- 
## 2026-08-05T19:01:40Z
Parent message:
**Context**: Milestone 1 Remediation (Iteration 2)
**Content**: Additional finding from Challenger 2: In apps/web/src/context/MeasurementEngineContext.tsx, ensure the fabric yield calculator dynamically reads chest/bust girth and garment length POM values across ALL 9 garment categories (not just 4 hardcoded ones).
**Action**: Include this fix along with the run-all-tests.ts assertion fix, boltWidth defensive guard in fabric-yield.ts, and API service formula alignment in your remediation work product.

