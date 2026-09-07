# Project: YellowHouse Tailoring OS

## Architecture
- **Monorepo Structure**: `npm` workspaces with `apps/web` (Next.js 14 App Router, React 18, TypeScript, Tailwind CSS) and `apps/api` (NestJS 10, Prisma ORM, PostgreSQL/SQLite).
- **State & Data Flow**:
  - Web UI pages: 26 static pages including `/`, `/onboarding`, `/(auth)/login`, `/(auth)/register`, `/(dashboard)/dashboard`, `/(dashboard)/customers`, `/(dashboard)/measurements`, `/(dashboard)/orders`, `/(dashboard)/production`, `/(dashboard)/staff`, `/(dashboard)/admin`, etc.
  - Local Storage Persistence Layer: `yh_auth_user`, `yh_customers`, `yh_measurements_current`, `yh_measurement_snapshots`, `yh_orders`, `yh_production_jobs`, `yh_onboarding_draft`, `yh_orders_draft`.
  - Local Storage Access Safety: Safe local storage wrapper helper with try/catch fallback to empty states for zero runtime errors on empty local storage.
  - Security & RBAC: Passkey gate on `/admin` (`yh-admin-2026`), 7 platform roles (Tenant Owner, Master Tailor, Branch Manager, Receptionist, Karigar, Accountant, Super Admin) with route guards and zero admin leakage on public pages.
  - 2D CAD Vector Engine: 420x840 pure SVG viewport, 80%-135% zoom, 6 drape overlays (Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset), 4-axis posture morphs, dynamic caliper ribbons, and snapshot versioning.
  - Order Lifecycle & Dynamic BOM: 12 luxury garment types, trims and accessories, `CUST-FAB-` SKU generation, pure SVG QR/Barcodes, and `@media print` styling.
  - Kanban Stage Synchronization: Bidirectional synchronization between 5-stage Kanban board (`yh_production_jobs`) and active orders (`yh_orders`).
  - Business Calculation Engines: Dynamic Standard Allowed Minutes (SAM) calculator (base matrix, posture, embroidery, canvas, lining) and piece-rate ledger (₹42/min).
- **Testing & Verification**:
  - `apps/web/package.json` & `apps/api/package.json` equipped with `"test"` npm scripts.
  - Automated unit, integration, and stress test suites covering business rules, state persistence, RBAC route visibility, pure SVG rendering, and empty local storage safety.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | RBAC Route Guard & Accountant Normalization | Map `ACCOUNTANT` role in `rbac-utils.ts` and verify traversal defense across all 7 platform roles and 26 routes | M1 | ORIGINAL_REQUEST R1 |
| 2 | Direct /admin Passkey Gate Isolation | Render Master Admin Passkey Gate (`yh-admin-2026`) when navigating to `/admin` unauthenticated without layout redirect loop | M1 | ORIGINAL_REQUEST R1 |
| 3 | Onboarding Completion Sandbox Cleanup | Clear `yh_auth_user` alongside mock data on onboarding completion to enforce clean private credential login | M1 | ORIGINAL_REQUEST R5 |
| 4 | Public Landing Page 4 Atelier Demo Personas | Verify landing page strictly renders 4 customer-facing personas (Owner, Master Tailor, Branch Manager, Karigar) with 0 admin exposure | M1 | ORIGINAL_REQUEST R5 |
| 5 | Client Profiling & Walk-in Order Intake | Quick-add walk-in customer modal, automatic `CUST-` ID and initials generation, draft autosave in `yh_orders_draft` | M2 | ORIGINAL_REQUEST R2 |
| 6 | Fabric SKU `CUST-FAB-` & Photo Attachment | Client-supplied fabric SKU generator with base-36 timestamp hash and base64 photo attachment | M2 | ORIGINAL_REQUEST R2 |
| 7 | 12-Garment Dynamic BOM & Surcharge Engine | Dynamic BOM for 12 garments with trims (threads, YKK zippers, horn buttons, canvas, latkans, cancan) and `isCustomerProvided` deduction | M2 | ORIGINAL_REQUEST R2 |
| 8 | Pure SVG QR & Barcode Print Engine | Deterministic 15x15 `QRCodeSVG` and Code-128 `BarcodeSVG` with isolated `@media print` CSS across 8 documents | M2 | ORIGINAL_REQUEST R2 |
| 9 | Fitting Trial Transitions & Delta Tracking | 8-stage order lifecycle, bidirectional Kanban sync, and 3-way delta tracking ($\Delta 1$, $\Delta 2$) with tolerance classifications | M2 | ORIGINAL_REQUEST R2 |
| 10 | 2D CAD Mannequin Viewport & HUD Controls | 420x840 pure SVG viewport, dark glass theme, 80%-135% zoom scaling, and HUD layer controls (Drape, Calipers, Lasers, Grid) | M3 | ORIGINAL_REQUEST R3 |
| 11 | 6 Garment Drape Overlays & 4-Axis Morphs | Tailored drape overlays for Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset, and 4-axis posture morphs (slope, stance, spine, heel) | M3 | ORIGINAL_REQUEST R3 |
| 12 | Dynamic Caliper Ribbons & Snapshots | SVG caliper wings with quick-adjust HUD steppers, `yh_measurement_snapshots` versioning, and Measurement Card print CSS | M3 | ORIGINAL_REQUEST R3 |
| 13 | 5-Stage Kanban Floor & Single-Stage Check | Mobile-responsive 5-stage Kanban floor with stage validation `|from - to| <= 1` and bidirectional sync to `yh_orders` | M3 | ORIGINAL_REQUEST R4 |
| 14 | Dynamic SAM Engine & Piece-Rate Ledger | SAM calculation factoring base matrix, posture, embroidery, canvas, lining, and ₹42/min piece-rate timesheets with CSV export | M3 | ORIGINAL_REQUEST R4 |
| 15 | Storage Rack Logistics & Delivery Notes | Rack assignment (`Rack A-12, Hanger 4`), barcode toggle, activity timeline, and printable delivery note modal | M3 | ORIGINAL_REQUEST R4 |
| 16 | Monorepo Regression Test Matrix (65,114+ tests) | Execute full suite of automated unit, integration, and stress tests across `apps/web` and `apps/api` with 0 failures | M4 | ORIGINAL_REQUEST Acceptance |
| 17 | 26-Route Production Build & Integrity Audit | Clean `npm run build` compilation across all 26 static pages and Forensic Auditor integrity verification | M4 | ORIGINAL_REQUEST Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Multi-Tenant RBAC & Admin Security Hardening | Role normalization for 7 roles, `/admin` passkey gate rendering, onboarding session cleanup, public landing page 4 personas | none | DONE |
| M2 | Order Lifecycle, 12-Garment Dynamic BOM & Vector QR/Barcodes | Client profiling, `CUST-FAB-` SKU, 12-garment BOM, Pure SVG QR/Barcodes, `@media print` CSS, fitting trial transitions | M1 | DONE |
| M3 | 2D CAD Vector Caliper Workbench & Karigar SAM Ledger | 420x840 SVG viewport, 6 drape overlays, 4-axis posture morphs, 5-stage Kanban, dynamic SAM math, ₹42/min ledger | M1, M2 | DONE |
| M4 | Monorepo Full Regression Matrix, Build & Forensic Integrity Audit | Full automated test suite execution (65,114+ tests), 26-page Next.js clean compilation, Challenger tests, Forensic Audit | M1, M2, M3 | DONE |

---

## Interface Contracts
### `apps/web/src/lib/rbac-utils.ts`
- `normalizeRole(role: string): UserRole | null`: Maps `'SUPER_ADMIN' | 'SYSTEM_ADMIN' | 'ATELIER_MANAGER' | 'TENANT_OWNER' | 'BRANCH_MANAGER' | 'MASTER_TAILOR' | 'EMBROIDERY_ARTISAN' | 'KARIGAR' | 'SALES_FRONT_DESK' | 'RECEPTIONIST' | 'QUALITY_INSPECTOR' | 'CUSTOMER_VIEW' | 'ACCOUNTANT'`
- `canUserAccessRoute(role: UserRole, pathname: string): boolean`: Stack-based directory traversal sanitizer and authorization matrix across all 26 routes.

### `apps/web/src/lib/pricing-calculator.ts`
- `calculateOrderPricing(input: PricingCalculationInput): OrderPricingResult`
- Combines Fabric Yield, SAM Labor (₹42/min), Posture Surcharges (₹750/axis), Tiered Embroidery Surcharges, Rush Surcharge (+20%), and 50% Deposit.

### `apps/web/src/lib/sam-calculator.ts`
- `calculateGarmentSAM(params: SAMCalculationParams): SAMCalculationResult`
- Factors base matrix (9 categories), 4-axis posture modifiers, panel counts, embroidery tiers, full canvas (+30m), silk lining (+30m), and fitting trials (+45m/trial).
