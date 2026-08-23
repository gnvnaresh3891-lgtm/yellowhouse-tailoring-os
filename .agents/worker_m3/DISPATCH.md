## 2026-08-07T21:45:46Z

You are the M3 Implementation Worker for YellowHouse Tailoring OS (`yellowhouse`).
Project Root Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Your Working Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m3

Read the following reference documents carefully before starting work:
- ORIGINAL_REQUEST.md: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\ORIGINAL_REQUEST.md
- M3 Explorer 1 Analysis: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_m3_1\analysis.md
- M3 Explorer 2 Analysis: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_m3_2\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Implement Dynamic SAM Calculation Engine (`apps/web/src/lib/sam-calculator.ts`):
   - Implement `calculateGarmentSam(input: SamCalculationInput): SamCalculationResult`.
   - Matrix for 9 base garment categories (`mens-suit`: 240, `mens-sherwani`: 210, `mens-shirt`: 60, `mens-trouser`: 90, `womens-blouse`: 120, `womens-lehenga`: 300, `womens-anarkali`: 270, `womens-corset`: 180, `womens-gown`: 240 mins).
   - Posture modifiers for 4 axes (`shoulderSlope`, `backCurvature`, `abdomenStance`, `hipSpineStance`).
   - Customization surcharges (panel count, embroidery levels, full canvas/silk lining, fitting trial counts).

2. Implement Bespoke Order Pricing Engine (`apps/web/src/lib/pricing-calculator.ts`):
   - Implement `calculateBespokePricing(input: PricingCalculationInput): PricingCalculationResult`.
   - Uses `calculateFabricYield()` from `apps/web/src/lib/fabric-yield.ts` for meters, `calculateGarmentSam()` for SAM mins.
   - Standard minute rate: default ₹42/min. Posture technical pattern fee: ₹750 per non-normal axis.
   - Embroidery fee matrix (none: ₹0, light: ₹3,500, medium: ₹12,000, heavy: ₹28,000).
   - Rush order fee (+20% on labor + embroidery), 50% mandatory advance, balance due on delivery.

3. Implement Bidirectional State Sync Helper (`apps/web/src/lib/state-sync-utils.ts`):
   - Helpers: `cleanOrderId`, `mapStageToOrderStatus`, `mapOrderStatusToStage`, `syncJobToOrdersStorage`, `syncOrderToJobsStorage`.
   - Uses safe storage accessors from `storage-utils.ts`.

4. Update UI Components:
   - `apps/web/src/app/(dashboard)/production/page.tsx`: Native HTML5 drag-and-drop handlers (`draggable`, `onDragStart`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`), stage highlight CSS, direct stage dropdown selector in card modal/toolbar, sync job movement to orders storage via `syncJobToOrdersStorage`.
   - `apps/web/src/app/(dashboard)/orders/page.tsx`: Direct status dropdown selector in table/modal, sync status change to jobs storage via `syncOrderToJobsStorage`, integrate dynamic price quote calculator.

5. Create Unit Test Suites:
   - `apps/web/src/__tests__/sam-calculator.test.ts`
   - `apps/web/src/__tests__/pricing-calculator.test.ts`
   - `apps/web/src/__tests__/state-sync.test.ts`
   - Wire all tests into `apps/web/src/__tests__/run-tests.ts`.

6. Verification:
   - Execute `npm test` and `npx tsc --noEmit` in both `apps/web` and `apps/api`.
   - Verify 0 TypeScript errors and 100% tests pass.

Deliver your complete report in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m3\handoff.md` and send a message when done.
