# YellowHouse Tailoring OS — Comprehensive Codebase Survey & Analysis

## Executive Summary
This report presents a forensic code audit of the **YellowHouse Tailoring OS** repository located at `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`. The survey evaluates state management, local storage persistence, data models, business rules, E2E flow integration (R2 & R4), and test coverage across both `@yellowhouse/web` (Next.js 14) and `@yellowhouse/api` (NestJS 10).

---

## 1. Form Audit & Local Storage Persistence

| Form Component | File Location | Persistence Mechanism | Status & Identified Deficiencies |
| :--- | :--- | :--- | :--- |
| **Onboarding Setup Wizard** | `apps/web/src/app/onboarding/page.tsx` | `localStorage.setItem('yh_auth_user')` | ⚠️ **Partial / On-Submit Only**: Intermediate wizard inputs (boutique name, slug, selected templates, owner credentials) are stored solely in React `useState`. Unsaved drafts are lost if refreshed on step 2 or 3. Persistence occurs only upon final signup submission. |
| **Order Management Form** | `apps/web/src/app/(dashboard)/orders/page.tsx` | `localStorage.setItem('yh_orders')`, `yh_production_jobs` | ⚠️ **Partial / On-Submit Only**: Form fields (selected client, due date, garment item rows, fabric SKU, custom fabric/lining images, notes) reside in React `useState`. Draft orders are not saved to `localStorage` until "Save as Draft" or "Send Quotation" is clicked. |
| **Measurement Workspace Form** | `apps/web/src/app/(dashboard)/measurements/page.tsx` | `localStorage.setItem('yh_measurements_current')`, `yh_measurements_gender`, `yh_measurements_garment`, `yh_measurements_slope`, `yh_measurements_stance`, `yh_measurements_posture`, `yh_measurements_heel`, `yh_measurement_snapshots` | ✅ **Fully Persistent**: Uses a `useEffect` hook to continuously write all active POM inputs, posture profile selections, fit preferences, and version snapshots to `localStorage` on change. |
| **Staff Recruitment Form** | `apps/web/src/app/(dashboard)/staff/page.tsx` | In-memory React state (`staffList`) | ❌ **Missing Persistence**: Newly hired staff members are added to local component state but are **NEVER saved to `localStorage` or database**. Reloading the page resets staff to `INITIAL_STAFF`. |
| **Customer Directory Form** | `apps/web/src/app/(dashboard)/customers/page.tsx` | In-memory React state (`customersList`) | ❌ **Missing Persistence**: Adding a new customer updates component state only. Reloading the page discards newly created customers and resets to `initialCustomers`. |

---

## 2. Kanban Production Board Audit (Stage Movement & State Sync)

### 2.1 State Management & Drag-and-Drop Implementation
- **Storage**: Kanban job cards are loaded from and synchronized to `localStorage.getItem('yh_production_jobs')` (falling back to `INITIAL_JOB_CARDS` with 14 pre-loaded cards across 5 columns).
- **Drag-and-Drop**: Native HTML5 or library-based (e.g. `@hello-pangea/dnd`, `dnd-kit`) drag-and-drop event listeners are **not implemented**.
- **Stage Movement**: Stage transitions are executed via explicit directional buttons (`←` Previous Stage, `→` Next Stage) present on job cards and in the job card detail modal.

### 2.2 Bidirectional Stage-to-Order Synchronization
- **Sync Handler**: `moveStage(jobId, direction)` in `apps/web/src/app/(dashboard)/production/page.tsx`.
- **Status Mapping Logic**:
  ```typescript
  const mappedStatus = 
    targetJob.stage === 'Fabric Inspection' ? 'CONFIRMED' :
    targetJob.stage === 'Master Cutting' ? 'CUTTING' :
    targetJob.stage === 'Zardozi/Aari Embroidery' ? 'IN_PRODUCTION' :
    targetJob.stage === 'Stitching Assembly' ? 'IN_PRODUCTION' :
    targetJob.stage === 'QC & Ready for Delivery' ? 'READY_FOR_DELIVERY' : 'CONFIRMED';
  ```
- **Execution**: Updates matching order in `localStorage.getItem('yh_orders')` by comparing sanitized order IDs (`targetJob.orderId.replace('JC-', '').replace('#YH-', '')`).
- **Gaps & Disconnects**:
  1. Orders created as `DRAFT` in `/orders` do not automatically create Kanban job cards. Only `CONFIRMED` orders create a job card in `yh_production_jobs`.
  2. Reverting a card backwards to 'Fabric Inspection' sets order status to 'CONFIRMED', but does not revert delivered order financial ledgers.

---

## 3. Business Logic Calculations & Location Analysis

### 3.1 Standard Allowed Minutes (SAM) Calculation
- **Current Implementation**:
  - In `apps/web/src/app/(dashboard)/orders/page.tsx`: Order creation assigns a static estimate of `items.length * 120` minutes (2 hours per item).
  - In `apps/web/src/app/(dashboard)/production/page.tsx`: Logged minutes (`samMinutesLogged`) accumulate per card, and artisan timesheets compute payouts at `₹42/min` (`sam * 42`).
- **Missing Logic**: There is no dynamic SAM engine calculating allowed minutes based on garment category complexity (e.g., 24-kali embroidered lehenga vs 2-piece suit vs sari blouse), panel count, or posture alterations.

### 3.2 Order Price Calculations
- **Current Implementation**:
  - In `apps/web/src/app/(dashboard)/orders/page.tsx`: Unit price is selected from hardcoded garment presets in `garmentOptions` (e.g., Sherwani = ₹28,000, 3-Piece Suit = ₹35,000, Lehenga = ₹68,000) or manually entered per item.
  - Total order amount = `sum(item.unitPrice)`.
  - Advance requirement = `round(totalOrderAmount * 0.5)` (50%).
- **Missing Logic**: Price calculation is static and does not calculate `(Fabric Required * Fabric Price/Meter) + Tailoring Labor + Embroidery Surcharge`.

### 3.3 Dynamic Ease & Fabric Yield Math
- **Location**:
  - `apps/web/src/lib/ease-calculator.ts`: Net Body + Base Ease + Fit Preference Modifier + Posture Offset - Stretch Factor.
  - `apps/web/src/lib/posture-engine.ts`: Posture adjustments (shoulder slope, back curvature, abdomen stance, hip spine stance).
  - `apps/web/src/lib/fabric-yield.ts`: Size-scaled fabric yield math accounting for bolt width (44" vs 54"), panel count (8–24 kalis), and shrinkage.
- **Status**: ✅ Fully implemented and verified with math unit test suites.

---

## 4. Existing & Missing Unit/Integration Test Suites

### 4.1 Existing Test Files
- `apps/web/src/__tests__/run-all-tests.ts`: Console test runner verifying 9 POM schemas, posture offsets, ease formulas, fabric yield math, and dynamic POM resolution.
- `apps/web/src/__tests__/onboarding-stress.test.ts`: Stress tests for slug formatting, rapid typing race condition simulation, password matching, template selection, and API errors.
- `apps/web/src/__tests__/landmark-validation.test.ts`: Verifies SVG landmark hotspots and boundary checks.
- `apps/web/src/__tests__/measurement-context.test.ts`: Tests React context state management for measurement engine.
- `apps/api/src/__tests__/signup-dto-adversarial.test.ts`: Tests NestJS `SignupDto` class-transformer/validator and Prisma P2002 duplicate constraint mapping.

### 4.2 Critical Test Suite Deficiencies
1. **Missing NPM Test Scripts**: Root `package.json` defines `"test": "npm run test --workspaces"`, but neither `apps/web/package.json` nor `apps/api/package.json` contains a `"test"` script. Running `npm run test` from root fails.
2. **Missing Test Coverage**:
   - `localStorage` state persistence across page navigation for Customer and Staff forms.
   - RBAC role-based navigation item filtering (tested only visually in `layout.tsx`).
   - Order creation -> Kanban job card auto-creation flow.
   - Kanban stage movement -> order status synchronization back to `yh_orders`.

---

## 5. E2E Flow Integration Matrix (R2 & R4 Requirements)

```
[Onboarding Wizard] ──(Saves yh_auth_user)──> [Dashboard / RBAC Guard]
                                                      │
[Customer Directory] (In-memory only ❌)              │
        │                                             │
        ▼                                             ▼
[CAD Measurements Engine] ──(Saves yh_measurements)──> [Order Creation]
                                                            │ (Saves yh_orders
                                                            │  & yh_production_jobs)
                                                            ▼
                                                   [Kanban Workshop Board]
                                                            │ (Syncs stage back
                                                            │  to yh_orders ✅)
                                                            ▼
                                                   [Artisan Timesheets & SAM]
```

### Key Recommendations for Refinement
1. Implement `localStorage` draft saving and auto-loading for Onboarding, Order Creation, Customer Directory, and Staff forms.
2. Add a `test` script in `apps/web/package.json` and `apps/api/package.json` (e.g. using `ts-node` or `vitest`) so `npm run test` completes cleanly.
3. Enhance SAM calculation and pricing calculations with dynamic formulas.
