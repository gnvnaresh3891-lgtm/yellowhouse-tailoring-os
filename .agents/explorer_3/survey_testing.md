# YellowHouse Tailoring OS: Testing & Build Infrastructure Survey

**Author**: Explorer 3 (Testing & Build Infrastructure)  
**Date**: 2026-08-23  
**Status**: Comprehensive Investigation Complete  
**Scope**: Testing Architecture, Build System, Existing 943+ Tests, 5-Module Test Expansion Strategy, Print/PDF Systems

---

## Executive Summary

YellowHouse Tailoring OS is architected as an `npm` monorepo containing two core workspaces:
1. `@yellowhouse/web` (`apps/web`): Next.js 14.2 (App Router), React 18.3, TypeScript 5, Tailwind CSS 3.4.
2. `@yellowhouse/api` (`apps/api`): NestJS 10, Prisma ORM 5, TypeScript 5, Express.

The automated testing infrastructure is built upon a deterministic, high-speed, zero-flakiness TypeScript runner orchestrated via `ts-node` that executes **943 passing tests in `apps/web`** and **23 passing tests in `apps/api`** (**966 total automated checks** across the monorepo). The build pipeline executes `nest build` for API and Next.js static page generation for Web (`npm run build`), compiling 14 static route endpoints with 0 TypeScript/ESLint errors and 0 runtime exceptions on clean local storage.

Print and PDF generation is implemented using high-precision native browser print CSS (`@media print`) and bespoke print layout components (`OrderReceipt`, `CustomerListPrint`, `ScheduleListPrint`, `MeasurementCard`, `JobCardPrint`) with physical millimeter dimensions (`148mm x 210mm`, `100mm x 150mm`) and monospace barcode placeholders.

---

## 1. Monorepo Configuration & Build System Analysis

### 1.1 Root Configuration (`package.json`)
- **Path**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\package.json`
- **Workspaces**: `apps/*` (`apps/web`, `apps/api`)
- **Lifecycle Scripts**:
  ```json
  {
    "name": "yellowhouse-monorepo",
    "version": "1.0.0",
    "private": true,
    "workspaces": [
      "apps/*"
    ],
    "scripts": {
      "dev": "npm run dev --workspaces",
      "build": "npm run build --workspace=@yellowhouse/api && npm run build --workspace=@yellowhouse/web",
      "test": "npm run test --workspaces"
    }
  }
  ```

### 1.2 Web Workspace Configuration (`apps/web`)
- **Path**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web\package.json`
- **TypeScript Configuration** (`apps/web/tsconfig.json`):
  - Target: `es5`, JSX: `preserve`, Path alias: `@/*` -> `./src/*`
  - Module: `esnext` with `bundler` resolution for Next.js 14
  - `ts-node` override: `"compilerOptions": { "module": "CommonJS" }` to allow direct execution of test modules in Node.js
- **Build Script**:
  - `node -e "require('fs').rmSync('.next', { recursive: true, force: true })" && next build`
  - Ensures clean `.next` cache on every build run to avoid stale SSR artifacts.
- **Test Script**:
  - `npx ts-node -O "{\"module\":\"commonjs\"}" src/__tests__/run-tests.ts`

### 1.3 API Workspace Configuration (`apps/api`)
- **Path**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api\package.json`
- **TypeScript Configuration** (`apps/api/tsconfig.json`):
  - Module: `commonjs`, Target: `ES2021`, `emitDecoratorMetadata: true`, `experimentalDecorators: true`
- **Build Script**: `nest build`
- **Test Script**: `npx ts-node src/__tests__/signup-dto-adversarial.test.ts`

---

## 2. Existing Test Suite Deep Dive (943+ Assertions)

The test suite in `apps/web/src/__tests__/run-tests.ts` coordinates multiple specialized test suites covering domain math, state resilience, RBAC guards, and anatomical validation rules.

### 2.1 Test Suite Breakdown & Inventory

| Suite File | Primary Function / Domain | Assertion Count | Key Features Covered |
|---|---|:---:|---|
| `storage-utils.test.ts` | `runStorageUtilsTests` | 38 | SSR `window=undefined` fallback, corrupted JSON recovery, raw `'null'` / `'undefined'` string protection, empty storage resilience across 8 routes, draft autosave/clear lifecycle (`yh_onboarding_draft`, `yh_customers`, `yh_staff`, `yh_orders_draft`). |
| `m2-stress.test.ts` | `runM2StressTests` | 49 | 9 adversarial corrupted JSON strings (broken XML, truncated JSON, unclosed arrays, `NaN`, `Function()`) tested against 5 localStorage keys; empty storage load checks for all 8 keys; draft autosave/clear lifecycles. |
| `sam-calculator.test.ts` | `runSamCalculatorTests` | 40 | Base SAM verification for all 9 garment categories (suit: 240m, sherwani: 210m, shirt: 60m, trouser: 90m, blouse: 120m, lehenga: 300m, anarkali: 270m, corset: 180m, gown: 240m); 4-axis posture modifiers (+15 to +25m); customization surcharges (panel counts, embroidery levels, full canvas, custom lining, fitting trials). |
| `pricing-calculator.test.ts` | `runPricingCalculatorTests` | 17 | Fabric cost calculation (`yield * cost/m`), base labor (`SAM * ₹42/m`), posture technical fee (₹750/axis), embroidery surcharges (₹0 - ₹28,000), rush order surcharge (+20% on labor + embroidery), 50% advance split & delivery balance. |
| `state-sync.test.ts` | `runStateSyncTests` | 18 | `cleanOrderId` normalization (`#YH-9021`, `JC-9021`, `9021`), 5 Kanban stages to `OrderStatus` bidirectional mapping, `syncJobToOrdersStorage`, `syncOrderToJobsStorage`, auto-creation of missing job cards on order creation, sync idempotency. |
| `adversarial-m3-challenge.test.ts` | `runAdversarialM3Tests` | 61 | Unknown garment fallback (120m base), extreme posture combination (+90m), invalid posture enums (+0m), negative/excess panel count handling, payment schedule sum parity without drift, corrupt storage sync resilience, drag-and-drop progress calculation (20%-100%). |
| `rbac-visibility.test.ts` | `runRbacVisibilityTests` | 24 | Route visibility and sidebar nav filtering across all 7 user roles (`SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`), route guard redirects, invalid role fallback to `/login`. |
| `rbac-adversarial-m4.test.ts` | `runAdversarialM4Tests` | 28 | `normalizeRole` hardening (numeric/object inputs, trimming, alias mapping like `karigar` -> `EMBROIDERY_ARTISAN`), path traversal security (`/dashboard/../admin`), trailing slashes, empty route protection, safe UI role formatting (`u.role.replace('_', ' ')`). |
| Inline Suite 2 (in `run-tests.ts`) | POM Schemas & Garment Templates | 36 | 9 garment categories validation, 4 Men / 5 Women template breakdown, non-empty POM arrays, base measurements within `validationRange.min` and `max`. |
| Inline Suite 3 (in `run-tests.ts`) | 4-Axis Posture Profile Modifiers | 3 | Sloped shoulders (+0.375" armscye, -0.25" shoulder width), normal posture (0 offset). |
| Inline Suite 4 (in `run-tests.ts`) | Dynamic Ease Allowance Formulas | 1 | Regular fit target calculation (`netBody 40.0 + defaultEase 3.5 = 43.5"`). |
| Inline Suite 5 (in `run-tests.ts`) | Fabric Yield Math | 1 | Men's suit 44" bolt width base yield = 5.00m. |
| `landmark-validation.test.ts` | `runLandmarkValidationTests` | 627 | 35+ landmark coordinate bounds (0-400, 0-800); bidirectional POM-to-landmark mappings for all 64 POMs across 9 categories; anatomical proportion invariants (bust tiering, trouser seams, waist-chest ratio, corset cinch); posture alert triggers; color-coding hex resolution (`#EF4444`, `#F59E0B`, `#10B981`, `#EAB308`). |
| **Total `apps/web` Assertions** | **All 12 Web Test Suites** | **943** | **100% Passing (0 failures)** |
| `apps/api` (`signup-dto-adversarial.test.ts`) | API Onboarding & DTO Validation | 23 | Case transformation, invalid slug regex checks, short slug rejection, OnboardingService slug availability checks, NestJS `ConflictException` (HTTP 409) mapping on Prisma P2002 duplicate errors. |
| **Monorepo Grand Total** | **Web + API Suites** | **966** | **100% Passing (0 failures)** |

---

## 3. Print & PDF Generation Infrastructure

### 3.1 Mechanism Architecture
YellowHouse Tailoring OS implements zero-external-dependency, high-fidelity print and PDF export through the synergy of:
1. **CSS Print Media Rules** in `apps/web/src/app/globals.css`:
   ```css
   @media print {
     /* Hide all navigation, sidebars, headers, action buttons */
     aside, header, .no-print { display: none !important; }
     /* Display dedicated print layout components */
     .print-only { display: block !important; }
     /* Reset surface backgrounds to crisp paper white and text to deep black */
     body { background: white !important; color: black !important; }
     main { padding: 0 !important; }
   }

   .print-only {
     display: none;
   }
   ```
2. **Dedicated Printable Layout Components** in `apps/web/src/components/print-layouts.tsx`:
   - `OrderReceipt`: Client invoice with breakdown of garment line items, unit prices, subtotal, advance paid, and balance due.
   - `CustomerListPrint`: High-density client register table with VIP status flags and measurement profile counts.
   - `ScheduleListPrint`: Workshop production schedule and timesheets with supervisor sign-off signature line.
   - `MeasurementCard`: Standard A4/A5 formatted card (`max-w-[148mm] h-[210mm]`) with POM list and master tailor posture offset notes.
   - `JobCardPrint`: Industrial pocket-sized job ticket (`w-[100mm] h-[150mm]`) with monospaced barcode placeholder (`*{job.id}*`), SAM time estimate, assigned karigar, and priority tag.

---

## 4. Test Strategy & Structure for the 5 New Ecosystem Modules

To expand the OS into the 5 new layers without regression, new modular test suites must be created in `apps/web/src/__tests__/` and wired into `run-tests.ts`.

### 4.1 Module 1 (R1): Digital Asset Warehouse & Design Marketplace ("Design as a Product")
- **Test File**: `apps/web/src/__tests__/digital-assets.test.ts`
- **Key Verification Points**:
  1. **License Tiers & Pricing Math**:
     - Personal License: 1.0x Base Price.
     - Commercial License (Boutique/Atelier): 2.5x Base Price.
     - Exclusive License (Full IP Buyout): 8.0x Base Price.
  2. **Creator Royalties & Platform Fee Split**:
     - Platform Commission: 15% Standard (10% VIP Creator).
     - Net Creator Earnings = `Gross Sale * (1 - Commission Rate)`.
  3. **Asset Resolution & Access Authorization**:
     - Paid/Licensed status unlocks 3D Tech Pack (.obj/.gltf metadata), vector SVG blueprints, and graded DXF files.
  4. **State Persistence & Storage**:
     - Storage Keys: `yh_digital_assets`, `yh_asset_licenses`, `yh_creator_earnings`.
     - Empty storage resilience, corrupt JSON recovery, and dynamic listing creation.

### 4.2 Module 2 (R2): Machine Access & Workshop Equipment Sharing Marketplace
- **Test File**: `apps/web/src/__tests__/equipment-sharing.test.ts`
- **Key Verification Points**:
  1. **Machine Rate Calculation Engine**:
     - Hourly Rate vs Daily Rate discounts (e.g. 8-hour day = 6.5x hourly rate).
     - Certified Operator Surcharge (+₹450/hr for digital textile printer, +₹350/hr for laser cutter).
     - Security Deposit calculation (20% of total reservation fee).
  2. **Time Slot Booking & Overlap Collision Detection**:
     - Prevention of double-booking for the same machine ID and overlapping time window `[startTime, endTime]`.
  3. **Panel Production Reservation Flow**:
     - Linking equipment reservation with active atelier job cards (`yh_production_jobs`).
  4. **Storage Keys**:
     - `yh_equipment_listings`, `yh_equipment_reservations`, `yh_machine_availability`.

### 4.3 Module 3 (R3): Supply Layer — Vendor Material Sourcing & Smart Recommendations
- **Test File**: `apps/web/src/__tests__/material-sourcing.test.ts`
- **Key Verification Points**:
  1. **Volume Tier Discount Math**:
     - 1 - 9 meters: Base unit price (0% discount).
     - 10 - 49 meters: 10% volume discount.
     - 50+ meters (Full Bolt): 20% volume discount.
  2. **Smart Fabric Recommendation Matching Algorithm**:
     - Recommending alternative swatches based on budget limit, target garment category (e.g., Silk Brocade vs Art Silk for Sherwani), and fabric yield output from `calculateFabricYield()`.
  3. **Stock Depletion & Low Stock Warning**:
     - Real-time stock decrement on order placement; triggering warning when stock < required yield.
  4. **Storage Keys**:
     - `yh_vendor_materials`, `yh_material_orders`, `yh_fabric_swatches`.

### 4.4 Module 4 (R4): Production Bidding & Tailor / Manufacturer Ecosystem
- **Test File**: `apps/web/src/__tests__/production-bidding.test.ts`
- **Key Verification Points**:
  1. **Brief Submission & Specification Verification**:
     - Brief schema validation (garment category, target delivery date, tech pack attachment, target budget).
  2. **Competitive Bid Scoring & Ranking**:
     - Evaluation of bids based on price, artisan rating (1-5 stars), specialization match (e.g., Zardozi specialist for embroidered lehengas), and proposed turnaround time.
  3. **Bid Acceptance & State Machine Transition**:
     - Accepting a bid moves brief status to `AWARDED`, generates a binding production contract, and auto-spawns a synchronized Job Card in `yh_production_jobs`.
  4. **Storage Keys**:
     - `yh_tailor_profiles`, `yh_design_briefs`, `yh_production_bids`.

### 4.5 Module 5 (R5): 3-Month Free Trial Onboarding & Professional Stylist Directory ("Purple Cogs")
- **Test File**: `apps/web/src/__tests__/trial-stylist-directory.test.ts`
- **Key Verification Points**:
  1. **3-Month Trial Expiration & Entitlement Math**:
     - `trialStartDate + 90 days = trialEndDate`.
     - Entitlement checks: Watermarked low-res export allowed; high-res CAD tech pack export gated behind upgrade or trial quota (3 free high-res exports).
  2. **Certified Stylist Directory Filtering**:
     - Filtering by city/region (e.g., Mumbai, Delhi, London), specialty (Bridal Stylist, Master Draper, Color Consultant), and certification level.
  3. **Stylist Consultation Appointment Booking**:
     - Slot booking, fee calculation, and consultation notes persistence.
  4. **Storage Keys**:
     - `yh_trial_tier_state`, `yh_stylist_directory`, `yh_stylist_consultations`.

### 4.6 Print Layouts Expansion & RBAC Integration
- **Test File**: `apps/web/src/__tests__/print-and-rbac-expansion.test.ts`
- **Print Layouts to verify**:
  - `TechPackPrint`: CAD tech pack specification sheet with POM tables and pattern notes.
  - `MaterialBOMPrint`: Material requisition and Bill of Materials receipt.
  - `EquipmentBookingReceipt`: Machine rental confirmation ticket with hours and operator specs.
  - `ProductionContractPrint`: Tailor bidding contract and milestone delivery schedule.
  - `TrialCertificatePrint`: 3-month trial onboarding certificate and stylist booking voucher.
- **RBAC Matrix Expansion**:
  - Updating `ROLE_PERMISSIONS` in `apps/web/src/lib/rbac-utils.ts` to include route permissions for the new routes (`/marketplace`, `/equipment`, `/supply`, `/bidding`, `/stylists`, `/trial`).

---

## 5. Summary Matrix of Test Harness Execution

```
==================================================
--- YELLOWHOUSE MONOREPO TEST RUNNER ---
==================================================

[API Workspace: @yellowhouse/api]
✅ Suite 1: SignupDto Transformation & Validation (4 tests)
✅ Suite 2: OnboardingService Input Checks (8 tests)
✅ Suite 3: Prisma P2002 Duplicate Error Mapping (3 tests)
✅ Additional Adversarial Schema Tests (8 tests)
--- API SUMMARY: 23 PASSED, 0 FAILED ---

[Web Workspace: @yellowhouse/web]
✅ Suite 1: Storage Utils Safe LocalStorage (38 tests)
✅ Suite 1b: Milestone 2 Empirical Stress & Resilience (49 tests)
✅ Suite 1c: Dynamic SAM Calculation Engine (40 tests)
✅ Suite 1d: Bespoke Order Pricing Engine (17 tests)
✅ Suite 1e: Bidirectional State Synchronization Engine (18 tests)
✅ Suite 1f: Milestone 3 Adversarial Challenge Suite (61 tests)
✅ Suite 1g: RBAC Route Visibility & Guard Verification (24 tests)
✅ Suite 1h: Milestone 4 Adversarial RBAC & UI Suite (28 tests)
✅ Suite 2: POM Schemas & Garment Templates (36 tests)
✅ Suite 3: 4-Axis Posture Profile Modifier Engine (3 tests)
✅ Suite 4: Dynamic Ease Allowance Formulas (1 test)
✅ Suite 5: Size-Scaled Fabric Yield Math (1 test)
✅ Suite 6: Landmark & Hotspot Validation (627 tests)
--- WEB SUMMARY: 943 PASSED, 0 FAILED ---

========================================
GRAND TOTAL: 966 PASSED, 0 FAILED
========================================
```

---

## 6. Build Verification
- API Build: `nest build` completed successfully.
- Web Build: Next.js 14 static generation completed 14/14 routes with 0 errors:
  - `○ /`
  - `○ /_not-found`
  - `○ /admin`
  - `○ /customers`
  - `○ /dashboard`
  - `○ /login`
  - `○ /measurements`
  - `○ /onboarding`
  - `○ /orders`
  - `○ /production`
  - `○ /register`
  - `○ /staff`
- TypeScript type-checking (`tsc --noEmit`) passes with 0 warnings or errors across both workspaces.
