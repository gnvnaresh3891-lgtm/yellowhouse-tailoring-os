# Project: YellowHouse Tailoring OS — Platform Audit, Feature Integrity Check & Operational Hardening

## Architecture

YellowHouse Tailoring OS is an enterprise-grade B2B SaaS Garment Engineering and Bespoke Atelier Operating System built on Next.js 14 App Router (`apps/web`) and NestJS 10 (`apps/api`) with Prisma ORM, Tailwind CSS, custom luxury HSL design tokens, and pure SVG vector graphics.

### Core Architectural Pillars
1. **Multi-Tenant Security & Role-Based Access Control (RBAC)**: Strict 7-role authorization matrix (`SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`), pathname traversal normalization, and dual-layer defense guarding `/admin` (layout route guard + Master Admin Passkey Gate `yh-admin-2026`).
2. **End-to-End Order Lifecycle & Bill of Materials (BOM)**: Unified order intake from client selection to 12 luxury garment presets, fabric/lining photo uploads, auto `CUST-FAB-` SKU generation, dynamic BOM accessory engine (threads, zippers, buttons, canvas, latkans, cancan), live pricing (₹42/min SAM rate), and bidirectional state synchronization (`syncOrderToJobsStorage`).
3. **2D CAD Interactive Vector Workbench & Mannequin Studio**: 420x840 SVG blueprint canvas, 80%–135% zoom scaling, layer HUD toggles (Drape, Calipers, Lasers, Grid), 4-axis posture compensation morphs (Shoulder slope ±8px, Chest stance Forward/Barrel, Spine curvature, Heel height), 6 garment overlays (Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset), caliper ribbons, snapshot versioning (`yh_measurement_snapshots`), and 3-way fitting trial delta matrix.
4. **Karigar Production Floor & SAM Efficiency Ledger**: 5-stage mobile-responsive Kanban board with single-stage drag-and-drop validation, Standard Allowed Minutes (SAM) computation with posture/embroidery surcharges, monthly calendar/table piece-rate ledger, storage rack logistics, and barcode scanner integration.
5. **SaaS Landing Page & 1-Click Customer Demo Sandboxes**: Obsidian/amber marketing portal, 4 customer-facing atelier personas (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`) with 0 administrative exposure, interactive anatomy blueprint, SAM/yield calculators, and 3-step onboarding wizard clearing mock demo state before private login.
6. **Isolated Print Systems & Vector Identifiers**: Clean `@media print` CSS rules hiding all application chrome and rendering crisp monochrome documents with pure SVG 2D QR matrix (`QRCodeSVG`) and Code-128 linear barcodes (`BarcodeSVG`).

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-Tenant RBAC & Route Access Control Matrix | 7-role permissions engine, pathname normalization, traversal defense | M1 | R1 |
| 2 | Master Admin Passkey Gate & Isolation from Demo Accounts | Passkey gate (`yh-admin-2026`) guarding `/admin`, 0 admin leakage on marketing page | M1 | R1 |
| 3 | Multi-Tenant Safe Storage Persistence | SSR-safe local storage getters/setters with corrupt JSON and null fallbacks | M1 | R1 |
| 4 | SaaS Marketing Landing Page & Interactive Anatomy | Public page (`/`) with 4 visual previews, anatomy landmark hotspots, SAM calculator | M1 | R5 |
| 5 | 4 Customer-Facing Atelier Demo Sandboxes | 1-click sandbox session initialization for Owner, Master Tailor, Branch Manager, Karigar | M1 | R5 |
| 6 | 3-Step Onboarding Registration Funnel | Atelier registration wizard with async slug availability checking & demo state cleanup | M1 | R5 |
| 7 | Custom Tailoring Order Intake & Patron Quick-Add | Patron CRM integration, in-flow quick-add modal, client fit preferences | M2 | R2 |
| 8 | Fabric & Trim Selection with Customer Fabric SKUs | 12 garment presets, yield calculations, photo uploads, auto `CUST-FAB-` SKU generator | M2 | R2 |
| 9 | Dynamic Bill of Materials (BOM) Accessorization | Dynamic default BOM generator (thread, zipper, button, canvas, latkan, cancan) with client/atelier toggles | M2 | R2 |
| 10 | Pure SVG QR Code & Linear Barcode Engine | Zero-dependency `QRCodeSVG` matrix and `BarcodeSVG` linear vector identifiers | M2 | R2 |
| 11 | Order Stage Transitions & Bidirectional Sync | 9-stage order lifecycle, valid status transitions, sync to `yh_production_jobs` | M2 | R2 |
| 12 | Isolated Print Physical Layouts | `@media print` CSS rules for Order Receipts, Job Tickets, and Invoices | M2 | R2 / Acceptance Criteria |
| 13 | 2D CAD Vector Workbench & HUD Controls | 420x840 SVG canvas, 80%–135% zoom scaling, Drape/Calipers/Lasers/Grid HUD toggles | M3 | R3 |
| 14 | 4-Axis Posture Compensation Morphing Engine | Shoulder slope (±8px), chest stance (Forward/Barrel), spine curvature, heel offset | M3 | R3 |
| 15 | 6 Garment Silhouette CAD Overlays | Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset vector silhouette drafting | M3 | R3 |
| 16 | Hotspot Calipers, Snapshot Versioning & Fitting Deltas | Interactive landmark hotspots, caliper steppers, snapshot restoration, 3-way delta ledger | M3 | R3 |
| 17 | 5-Stage Karigar Kanban Production Board | Mobile-responsive Kanban board with HTML5 drag-and-drop & single-stage validation | M3 | R4 |
| 18 | Dynamic SAM Calculation Engine | Base garment SAM, posture modifiers, flare/embroidery/canvas surcharges | M3 | R4 |
| 19 | Artisan Timesheets & Piece-Rate Earnings Ledger | Calendar & Table views, ₹42/min rate, date/karigar filters, CSV export | M3 | R4 |
| 20 | Workshop Logistics & Delivery Notes | Storage rack assignment, scannable barcode toggles, print delivery note with order tokens | M3 | R4 |
| 21 | All 26 Static Routes Compilation | Zero TypeScript/ESLint warnings, clean `next build` static page generation | M4 | Acceptance Criteria |
| 22 | Monorepo Automated Test Suite (0 Regressions) | 2,016+ frontend assertions + backend test suites passing 100% green | M4 | Acceptance Criteria |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Multi-Tenant RBAC, Admin Passkey Gate & SaaS Landing / Demo Experience | Verify R1 & R5: `/admin` passkey gate, 7-role RBAC route guard, storage safety, marketing landing page, 4 demo personas, onboarding funnel | none | DONE |
| M2 | Order Lifecycle, BOM Integration & Barcode/QR Print Systems | Verify R2: Order intake, 12 garment presets, customer fabric SKU, dynamic BOM accessories, pure SVG QR/Barcode, fitting stage transitions, print isolation | none | DONE |
| M3 | 2D CAD Vector Studio, Mannequin Workbench & Karigar Production Board | Verify R3 & R4: 2D vector canvas, 4-axis posture morphs, 6 garment silhouettes, caliper HUD, snapshots & delta ledger, 5-stage Kanban, SAM calculator, timesheet ledger | none | DONE |
| M4 | Final Monorepo Compilation, 26 Static Routes, Automated Test Suite & Forensic Audit | Verify all 26 static routes compile with 0 errors (`npm run build`), all 2,016+ test assertions pass with 0 regressions, adversarial challenge, and forensic integrity audit | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### Multi-Tenant & Auth Contracts
- `yh_auth_user`: `{ id: string, name: string, email: string, role: UserRole, tenant: { id: string, name: string, code: string }, loggedInAt: string }`
- `yh_onboarding_draft`: Multi-step draft state `{ step: number, boutiqueName: string, city: string, phone: string, slug: string, selectedPoms: string[], ownerName: string, ownerEmail: string }`
- `yh_admin_tenants`: `TenantRegistryRecord[]`

### Core Workflow Contracts
- `yh_customers`: `CustomerRecord[]`
- `yh_orders`: `OrderRecord[]` (includes `bomItems: BOMItem[]`, `isCustomerFabric: boolean`, `fabricSku: string`, `stageHistory: StageHistoryEntry[]`)
- `yh_production_jobs`: `ProductionJobCard[]` (includes `samMinutes: number`, `assignedKarigar: string`, `stage: ProductionStage`, `rack: string`)
- `yh_measurements_current`: `MeasurementProfile` (includes `garmentType`, `gender`, `fitPreference`, `poms: Record<string, number>`, `posture: PostureSettings`)
- `yh_measurement_snapshots`: `MeasurementSnapshot[]` (versioned `v1.0`, `v2.0`, ...)
- `yh_artisan_timesheets`: `ArtisanTimesheetEntry[]` (includes `minutes: number`, `earnedAmount: number`, `status: 'Logged' | 'Disbursed'`)

### Window Event Protocol
- `yh-data-sync`: Broadcast across window/tabs on state mutation to trigger immediate UI reactivity.

---

## Code Layout

```
apps/web/src/
├── app/
│   ├── page.tsx                               # [M1] Public Marketing Landing & 4 Persona Switchers
│   ├── onboarding/page.tsx                    # [M1] 3-Step Onboarding Wizard & Slug Availability
│   ├── (auth)/
│   │   ├── login/page.tsx                     # [M1] Credential & Demo Login
│   │   └── register/page.tsx                  # [M1] Atelier Registration
│   ├── (dashboard)/
│   │   ├── layout.tsx                         # [M1] Dashboard Shell & RBAC Route Guard
│   │   ├── admin/page.tsx                     # [M1] Master Admin Console & Passkey Gate
│   │   ├── dashboard/page.tsx                 # [M1] Executive Telemetry & Karigar Efficiency
│   │   ├── customers/page.tsx                 # [M2] Customer CRM & Patron Profile Management
│   │   ├── orders/page.tsx                    # [M2] Bespoke Order Lifecycle, BOM & Pricing
│   │   ├── measurements/page.tsx              # [M3] 2D CAD Vector Silhouette Studio & Deltas
│   │   ├── production/page.tsx                # [M3] Karigar Kanban Board & SAM Timesheets
│   │   ├── staff/page.tsx                     # [M1] Staff Roster & Artisan Management
│   │   └── redhouse/...                       # [M1-M4] Ecosystem extensions (Marketplace, Equipment, Supply, Bidding, Stylists)
│   ├── layout.tsx                             # [M4] Global Root Layout
│   └── globals.css                            # [M2, M4] HSL Design System, Glassmorphism, @media print
├── components/
│   ├── id-codes.tsx                           # [M2] Pure SVG QRCodeSVG and BarcodeSVG
│   ├── print-layouts.tsx                      # [M2] OrderReceipt, MeasurementCard, JobCardPrint, TechPackSpecPrint, etc.
│   ├── command-palette.tsx                    # [M1] Global Search Palette
│   └── Tooltip.tsx                            # [M1] Luxury Glassmorphic Tooltip
├── lib/
│   ├── rbac-utils.ts                          # [M1] 7-Role Normalization, Route Permissions & Guard
│   ├── storage-utils.ts                       # [M1] Safe LocalStorage Getter/Setter/Remover
│   ├── state-sync-utils.ts                    # [M2] Order <-> Production Bidirectional Sync
│   ├── pricing-calculator.ts                  # [M2] Bespoke Garment Pricing Engine
│   ├── fabric-yield.ts                        # [M2] Size-Scaled Yield Calculator
│   ├── sam-calculator.ts                      # [M3] Dynamic SAM & Surcharge Calculator
│   ├── pom-schemas.ts                         # [M3] 9 Garment POM Schemas
│   ├── ease-calculator.ts                     # [M3] 4-Axis Posture Offsets & Dynamic Ease
│   └── landmark-mappings.ts                   # [M3] Anatomical Landmark Vector Coordinates
└── __tests__/                                 # [M4]
    ├── run-tests.ts                           # Master test suite runner (2,016 passing assertions)
    └── *.test.ts                              # 18 unit, integration, adversarial & stress test files
```

