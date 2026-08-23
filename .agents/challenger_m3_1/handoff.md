# Milestone 3 Adversarial Challenge Report

## Verdict: `REQUEST_CHANGES`

---

## 1. Observation

### Build & Baseline Verification Commands
1. Executed `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npm test`:
   - Output: `GRAND SUMMARY: 791 PASSED, 0 FAILED` (exit code 0).
2. Executed `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit`:
   - Output: Exit code 0 (0 compilation errors).
3. Executed `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit`:
   - Output: Exit code 0 (0 compilation errors).
4. Executed `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npm test`:
   - Output: `SUMMARY: 23 PASSED, 0 FAILED` (exit code 0).

### Empirical Adversarial Test Harness Execution
Constructed and executed `apps/web/src/__tests__/adversarial-m3-challenge.test.ts` (97 assertions total):
Command: `npx ts-node src/__tests__/adversarial-m3-challenge.test.ts` in `apps/web`.

#### Test Results Summary:
- **Suite 1: SAM Calculation Extreme Combinations & Invalid Inputs**: 55 PASSED, 0 FAILED.
  - Verified base SAM matrix across all 9 garment categories (`mens-suit`: 240, `mens-sherwani`: 210, `mens-shirt`: 60, `mens-trouser`: 90, `womens-blouse`: 120, `womens-lehenga`: 300, `womens-anarkali`: 270, `womens-corset`: 180, `womens-gown`: 240 mins).
  - Verified 4-axis posture modifier calculations under maximum non-normal combination (`very_sloped` +25, `stooped` +20, `prominent` +25, `sway_back` +20 = +90 mins total).
  - Verified panel count thresholds (0-11: 0m, 12-16: +30m, >16: +60m), embroidery levels, full canvas (+30m), custom lining (+30m), fitting trials (+45m each).
  - Verified negative values (`-5` panels, `-3` trials) safely evaluate to 0 mins.

- **Suite 2: Bespoke Pricing Calculator Formulas & Math**: 17 PASSED, 0 FAILED.
  - Verified posture technical fee calculation (₹750 per non-normal axis up to ₹3,000 for 4 non-normal axes).
  - Verified embroidery surcharges (`none`: ₹0, `light`: ₹3,500, `medium`: ₹12,000, `heavy`: ₹28,000).
  - Verified rush order surcharge formula (+20% on base labor cost + embroidery surcharge).
  - Verified 50% mandatory advance payment schedule breakdown (`mandatoryAdvance50Percent + balanceDueOnDelivery === totalGarmentPrice`) with zero penny drift across all test cases.

- **Suite 3: State Sync Utilities & Storage Resilience**: 19 PASSED, 2 FAILED.
  - Verified `cleanOrderId` normalizes `#YH-`, `JC-`, whitespace, and casing safely.
  - Verified stage <-> status mapping bidirectionality across all 5 Kanban stages and order statuses.
  - **VERBATIM FAILURES ENCOUNTERED**:
    ```
    Captured exception on non-array object in localStorage: orders.map is not a function
    ❌ FAIL: syncJobToOrdersStorage handles non-array JSON object in localStorage without TypeError crash
    Captured exception on primitive string in localStorage: orders.map is not a function
    ❌ FAIL: syncJobToOrdersStorage handles primitive string in localStorage without TypeError crash
    ```

- **Suite 4: UI Drag & Drop Progress Math**: 5 PASSED, 0 FAILED.
  - Verified progress percentage calculations (Fabric Inspection: 20%, Master Cutting: 40%, Zardozi: 60%, Stitching: 80%, QC & Ready: 100%).

---

## 2. Logic Chain

1. **Storage Type Validation Flaw**:
   - In `apps/web/src/lib/storage-utils.ts` (lines 7-25):
     ```ts
     export function getLocalStorage<T>(key: string, fallbackValue: T): T {
       ...
       const parsed = JSON.parse(item);
       if (parsed === null || parsed === undefined) {
         return fallbackValue;
       }
       return parsed as T;
     }
     ```
   - `getLocalStorage` verifies that `item` is not null/undefined and `JSON.parse` does not return null/undefined. However, it **never checks whether the parsed JSON data matches the expected type contract** (e.g. checking `Array.isArray(parsed)` when `fallbackValue` is an array).
   - If `localStorage` contains valid JSON representing a primitive string (e.g. `"corrupted"`) or an object (e.g. `{ "error": "stale" }`), `JSON.parse` succeeds and `getLocalStorage<Order[]>('yh_orders', [])` returns that primitive/object rather than `fallbackValue` `[]`.

2. **Uncaught Runtime TypeError during State Sync**:
   - In `apps/web/src/lib/state-sync-utils.ts` (lines 153-173 and 175-213):
     ```ts
     export function syncJobToOrdersStorage(job: JobCardItem): void {
       const orders = getLocalStorage<Order[]>('yh_orders', []);
       ...
       const newOrders = orders.map((order) => { ... });
     ```
   - When `orders` is returned as a non-array (e.g. object or string), calling `orders.map(...)` throws an uncaught JavaScript runtime exception: `TypeError: orders.map is not a function`.
   - This breaks state synchronization when dragging job cards on `/production` or changing status dropdowns on `/orders`.

3. **Requirement Impact**:
   - Requirement R1 / Acceptance Criteria requires: `"Zero runtime exceptions when navigating between routes or loading pages with empty or malformed local storage."`
   - Therefore, until `getLocalStorage` or state sync utilities validate array types before calling `.map()`, this vulnerability must be remediated.

---

## 3. Caveats
- Browser LocalStorage behavior in Node.js test environment was mocked using standard HTML5 Web Storage API shim (`LocalStorageMock`), matching browser behavior identically.
- The default seed data in `production/page.tsx` and `orders/page.tsx` initializes arrays safely on first render, but pre-existing or external storage corruption breaks the component on user interaction.

---

## 4. Conclusion

Milestone 3 has achieved strong implementation quality across SAM matrix calculation, bespoke pricing math, and UI drag-and-drop progress math. However, an empirical vulnerability was discovered in LocalStorage state synchronization where non-array JSON data causes uncaught `TypeError: orders.map is not a function` exceptions.

**Verdict**: **`REQUEST_CHANGES`**

### Required Fixes:
1. Update `getLocalStorage` in `apps/web/src/lib/storage-utils.ts` to check if `Array.isArray(fallbackValue)` is true; if so, verify `Array.isArray(parsed)` is also true before returning `parsed`, otherwise returning `fallbackValue`.
2. Add defensive `Array.isArray(orders)` and `Array.isArray(jobs)` checks in `syncJobToOrdersStorage` and `syncOrderToJobsStorage` in `apps/web/src/lib/state-sync-utils.ts`.

---

## 5. Verification Method

To independently reproduce and verify this finding:

1. Execute standard build & test pipeline:
   ```cmd
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npm test
   npx tsc --noEmit
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api
   npx tsc --noEmit
   npm test
   ```
2. Run the empirical adversarial test harness:
   ```cmd
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npx ts-node src/__tests__/adversarial-m3-challenge.test.ts
   ```
   *Expected Output*: Output will show 95 PASSED and 2 FAILED assertions demonstrating the uncaught `TypeError: orders.map is not a function` runtime exception on malformed non-array storage data.
