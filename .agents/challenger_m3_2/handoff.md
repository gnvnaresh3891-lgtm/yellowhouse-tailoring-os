# Milestone 3 Handoff Report — Adversarial Challenger 2

**Verdict**: `REQUEST_CHANGES`

---

## Challenge Summary

**Overall risk assessment**: MEDIUM

Adversarial stress testing was conducted on state synchronization utilities, the SAM calculation matrix, bespoke pricing math, Kanban card stage movement behavior, and LocalStorage state fallbacks.

While standard unit tests (`npm test` in `apps/web` and `apps/api`) and TypeScript compilation (`npx tsc --noEmit` in both apps) pass cleanly, adversarial empirical testing uncovered **2 distinct functional defects** in state synchronization and LocalStorage fallback handling.

---

## 1. Observation

### Verified Passing Operations
1. **SAM Calculation Matrix Math**:
   - `calculateGarmentSam` correctly calculates base SAM across all 9 garment categories (`mens-suit`: 240, `mens-sherwani`: 210, `mens-shirt`: 60, `mens-trouser`: 90, `womens-blouse`: 120, `womens-lehenga`: 300, `womens-anarkali`: 270, `womens-corset`: 180, `womens-gown`: 240 mins).
   - Posture profile modifiers across all 4 anatomical axes correctly sum (+15 to +25 mins per non-normal stance).
   - Panel count surcharges (>16: +60 mins, 12-16: +30 mins), embroidery levels (`light`: +45, `medium`: +120, `heavy`: +240 mins), canvas (+30 mins), custom lining (+30 mins), and fitting trials (+45 mins/trial) calculate accurately.
   - `estimatedLaborHours` rounds to 1 decimal place.

2. **Bespoke Pricing Engine Math**:
   - `calculateBespokePricing` accurately integrates material yield from `calculateFabricYield` and labor time from `calculateGarmentSam`.
   - Posture surcharge accurately computes ₹750 per non-normal axis.
   - Embroidery surcharge accurately maps to matrix (`light`: ₹3,500, `medium`: ₹12,000, `heavy`: ₹28,000).
   - Rush fee calculates +20% on `(baseLaborCost + embroiderySurcharge)`.
   - 50% advance payment (`mandatoryAdvance50Percent`) and balance due (`balanceDueOnDelivery`) sum to `totalGarmentPrice` without rounding discrepancies even when total price is an odd number.

3. **Standard Build & Pipeline Checks**:
   - `apps/web`: `npm test` -> 791 PASSED, 0 FAILED.
   - `apps/web`: `npx tsc --noEmit` -> 0 errors.
   - `apps/api`: `npx tsc --noEmit` -> 0 errors.
   - `apps/api`: `npm test` -> 23 PASSED, 0 FAILED.

---

### Discovered Failure Modes & Defect Evidence

#### Defect 1: Unhandled LocalStorage Exception when Storage Contains Valid Non-Array JSON
- **Location**: `apps/web/src/lib/storage-utils.ts` (`getLocalStorage`) and `apps/web/src/lib/state-sync-utils.ts` (`syncJobToOrdersStorage`, `syncOrderToJobsStorage`).
- **Verbatim Error**: `TypeError: orders.map is not a function` / `TypeError: jobs.map is not a function`.
- **Root Cause**: `getLocalStorage<T>(key, fallbackValue)` checks `if (parsed === null || parsed === undefined) return fallbackValue;`. However, if `localStorage.getItem(key)` contains a valid JSON string that parses to a non-array value (e.g. `"{}"`, `"123"`, `"true"`), `getLocalStorage` returns that object/primitive instead of the fallback value (`[]`). When `syncJobToOrdersStorage` or `syncOrderToJobsStorage` calls `.map()` on the returned value, it crashes with an unhandled runtime exception.
- **Empirical Proof**:
  ```ts
  mockStorage['yh_orders'] = JSON.stringify({ error: 'corrupted state' });
  syncJobToOrdersStorage(jobItem); // Throws TypeError: orders.map is not a function
  ```

#### Defect 2: Kanban Card Stage Movement Progress Desync
- **Location**: `apps/web/src/lib/state-sync-utils.ts` (`getProgressForStage`) vs `apps/web/src/app/(dashboard)/production/page.tsx` (`moveJobToStage`).
- **Observed Behavior**:
  - `state-sync-utils.ts` defines `getProgressForStage('Fabric Inspection')` as **15%** and `getProgressForStage('Master Cutting')` as **35%**.
  - `production/page.tsx` computes stage progress in `moveJobToStage` using `Math.min(100, Math.max(15, (stageIndex + 1) * 20))`:
    - Stage 0 (`Fabric Inspection`): `(0 + 1) * 20` = **20%** (desynced by 5% from state-sync-utils).
    - Stage 1 (`Master Cutting`): `(1 + 1) * 20` = **40%** (desynced by 5% from state-sync-utils).
- **Impact**: Progress percentage jumps inconsistently depending on whether a card stage was moved via drag-and-drop on the Production board (sets 20%/40%) or synced via Order status change (sets 15%/35%).

#### Defect 3 (Minor): `cleanOrderId` Boundary Safety on Non-String Values
- **Location**: `apps/web/src/lib/state-sync-utils.ts` (`cleanOrderId`).
- **Observed Behavior**: Calling `cleanOrderId(9021 as any)` throws `TypeError: id.trim is not a function` because `if (!id)` passes for truthy numbers/booleans and directly calls `.trim()`.

---

## 2. Logic Chain

1. *Requirement*: The system must operate reliably under empty or malformed LocalStorage states without runtime crashes.
   - *Observation*: When LocalStorage keys `yh_orders` or `yh_production_jobs` contain valid non-array JSON (e.g. `{}` or `123`), `getLocalStorage` returns `{}` instead of `[]`.
   - *Logic*: Callers in `state-sync-utils.ts` assume `getLocalStorage<T[]>(..., [])` guarantees an array and invoke `.map()` without checking `Array.isArray()`, causing a fatal `TypeError` crash.
   - *Conclusion*: `getLocalStorage` must ensure type consistency (or callers must validate `Array.isArray`), or `getLocalStorage` should support an optional array type check.

2. *Requirement*: Kanban card stage movement behavior must synchronize status and progress consistently across the OS.
   - *Observation*: Moving a card to `Fabric Inspection` in `/production` sets progress to `20%`, but syncing an order to `CONFIRMED` sets job progress to `15%`. Moving to `Master Cutting` in `/production` sets `40%`, but order sync sets `35%`.
   - *Logic*: The hardcoded `(stageIndex + 1) * 20` formula in `production/page.tsx` contradicts `getProgressForStage` in `state-sync-utils.ts`.
   - *Conclusion*: `production/page.tsx` should use `getProgressForStage(newStage)` from `state-sync-utils.ts` instead of calculating a separate formula.

3. *Requirement*: Robust Order ID cleaning helper.
   - *Observation*: Passing non-string primitives (e.g. numbers) to `cleanOrderId` causes `.trim()` to fail.
   - *Logic*: `typeof id !== 'string'` check is missing before calling string methods.
   - *Conclusion*: `cleanOrderId` should coerce inputs via `String(id)` or check `typeof id === 'string'`.

---

## 3. Caveats

- Standard happy-path operations run cleanly with zero compiler warnings or broken tests.
- Defects occur under state desynchronization edge cases (Kanban progress math) and malformed LocalStorage data scenarios.

---

## 4. Conclusion

Verdict: **`REQUEST_CHANGES`**

### Required Mitigations
1. **Fix LocalStorage Safe Parsing in `storage-utils.ts` or `state-sync-utils.ts`**:
   - In `getLocalStorage`, if `fallbackValue` is an Array (`Array.isArray(fallbackValue)`), verify `Array.isArray(parsed)`. If `parsed` is not an array, warn and return `fallbackValue`.
2. **Align Kanban Progress Calculation in `production/page.tsx`**:
   - Update `moveJobToStage` in `apps/web/src/app/(dashboard)/production/page.tsx` to use `getProgressForStage(newStage)` from `@/lib/state-sync-utils` instead of `(stageIndex + 1) * 20`.
3. **Harden `cleanOrderId` in `state-sync-utils.ts`**:
   - Add safe string coercion: `if (!id) return ''; const strId = String(id).trim();`.

---

## 5. Verification Method

To verify the defects and subsequent fixes:

1. **Run Standard Web Test Suite**:
   ```cmd
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npm test
   ```
2. **Run Standard Web & API TypeScript Check**:
   ```cmd
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit
   ```
3. **Run Challenger M3 Stress Test Suite**:
   ```cmd
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npx ts-node -O '{\"module\":\"commonjs\"}' ..\..\.agents\challenger_m3_2\stress_test_m3.ts
   ```
   *Expected Outcome after fixes*: All 60 assertions pass (0 failures).

---

## Adversarial Stress Test Results Breakdown

```
========================================
STRESS TEST SUMMARY
========================================
PASSED: 56
FAILED: 4

1. FAIL: syncJobToOrdersStorage crashes if LocalStorage yh_orders is non-array JSON object (TypeError: orders.map is not a function)
2. FAIL: syncOrderToJobsStorage crashes if LocalStorage yh_production_jobs is a number/non-array (TypeError: jobs.map is not a function)
3. FAIL: Fabric Inspection progress values match between state-sync-utils (15%) and production/page.tsx (20%)
4. FAIL: Master Cutting progress values match between state-sync-utils (35%) and production/page.tsx (40%)
```

## Unchallenged Areas
- NestJS backend auth controller & signup DTO (out of scope for M3 frontend sync/pricing focus).
