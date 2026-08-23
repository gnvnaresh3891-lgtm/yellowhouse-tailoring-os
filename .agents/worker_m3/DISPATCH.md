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

## 2026-08-23T14:27:48Z

Scope and Exclusively Owned Files for Milestone 3:
1. `apps/web/src/components/ecosystem/vendor-material-card.tsx`:
   - Interactive card for vendor materials (Silk, Cotton, Velvet, Organza, Linings, Trims, Interfacing).
   - Real-time stock level indicator with low-stock warnings, volume discount breakdown popover (1-9m, 10-49m @ 10%, 50-199m @ 22%, 200m+ @ 35%), swatch color preview, drape coefficient, GSM, bolt width, vendor rating, and quick-order button.
2. `apps/web/src/components/ecosystem/fabric-recommendation-widget.tsx`:
   - Interactive Smart Fabric Recommendation Engine widget.
   - User inputs: target garment category (`mens-suit`, `womens-lehenga`, `womens-anarkali`, `womens-gown`, `womens-corset`, etc.), max budget per meter, required yield meters, and preferred color tone.
   - Computes recommendations via `computeSmartFabricRecommendations` and displays Best Match, Budget Saver, and Luxury Upgrade options with drape score, savings percentage, and 1-click add-to-sourcing-order action.
3. `apps/web/src/app/(dashboard)/supply/page.tsx`:
   - Full responsive glassmorphic page for Supply Layer — Vendor Material Sourcing & Smart Recommendations.
   - Material category filters (Fabrics, Linings, Trims, Interfacing), color/weave filter, in-stock only toggle, volume tier comparison matrix, active sourcing orders tracker, and BOM Sourcing preview modal.
   - Safe LocalStorage persistence (`yh_vendor_materials`, `yh_fabric_sourcing_orders`) with `SEED_VENDOR_MATERIALS` fallback and `yh-data-sync` event reactivity.
4. `apps/web/src/components/ecosystem/tailor-bid-card.tsx`:
   - Portfolio & Bid card showcasing artisan specialization (Zardozi, Master Cutting, Tuxedos, Lehengas, Corsetry), experience years, completed projects, sample gallery modal, hourly/fixed rates, capacity status, and in-app bid acceptance button.
5. `apps/web/src/components/ecosystem/brief-submission-modal.tsx`:
   - Design brief submission workflow where ateliers/designers publish custom briefs (title, garment type, target completion date, budget range, tech pack attachment, POM reference, special instructions). Persists to `yh_production_briefs` and notifies artisans.
6. `apps/web/src/app/(dashboard)/bidding/page.tsx`:
   - Full responsive glassmorphic page for Production Bidding & Tailor / Manufacturer Ecosystem.
   - Dual view: (1) Artisan & Master Tailor Directory with specialization filters and portfolio previews, (2) Active Design Briefs & Competitive Bidding Arena with bid submission form, comparison drawer, 4-stage milestone contract generator, and in-app bid acceptance workflow.
   - Safe LocalStorage persistence (`yh_artisan_portfolios`, `yh_production_briefs`, `yh_tailor_bids`) with `SEED_ARTISAN_PROFILES` fallback and `yh-data-sync` event reactivity.
