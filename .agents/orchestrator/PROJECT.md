# Project: YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem Expansion

## Architecture

The YellowHouse Tailoring OS is built on a high-performance Next.js 14 App Router monorepo architecture (`apps/web` and `apps/api`) styled with Tailwind CSS, custom HSL gold theme tokens, and glassmorphic micro-interactions.

### Core Architectural Principles
1. **Zero Core Disruption**: All 7 existing tailoring workflows (`/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/admin`) remain 100% untouched and fully operational.
2. **Modular Ecosystem Extension**: The 5 new ecosystem layers are implemented as clean, dedicated sub-routes under `(dashboard)`:
   - `/marketplace` — Digital Asset Warehouse & Design Marketplace ("Design as a Product")
   - `/equipment` — High-Tech Machine Access & Equipment Sharing Marketplace
   - `/supply` — Vendor Material Sourcing & Smart Recommendations Engine
   - `/bidding` — Production Bidding & Tailor/Manufacturer Ecosystem
   - `/stylists` — Professional Stylist Directory & 3-Month Trial Onboarding
3. **Safe State Persistence & Cross-Tab Sync**: All interactive state is managed via `storage-utils.ts` (`getLocalStorage`, `setLocalStorage`) with initial mock seed fallbacks, and synchronized across tabs/components using the custom `yh-data-sync` window event.
4. **Role-Based Access Control (RBAC)**: Integrated into `rbac-utils.ts` and `canUserAccessRoute()` to ensure fine-grained role authorization across all existing roles (`SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`).
5. **Zero-Dependency Native Print / PDF Support**: Native `@media print` print layouts for Tech Packs, Cutting Tickets, Material Bills of Materials (BOM), and Equipment Reservation Receipts.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Ecosystem Type Definitions & Seed Data | TypeScript interfaces, enums, mock catalogs for all 5 layers | M1 | Survey / R1-R5 |
| 2 | Digital Asset Licensing & Royalty Engine | 3-tier licensing math, HMAC-SHA256 license generation, 88/12 creator royalty split | M1 | R1 |
| 3 | Machine Booking & Collision Detection Algorithm | Hourly/daily shifts, operator assistance toggle, `checkMachineSlotCollision` algorithm | M1 | R2 |
| 4 | Smart Fabric Recommendation Engine | Multivariable scoring algorithm (drape 45%, budget 40%, vendor rating 15%) returning Best Match, Budget Saver, and Luxury Upgrade swatches | M1 | R3 |
| 5 | Tailor Production Bidding & Escrow State Machine | RFQ brief creation, competitive bidding, 4-stage milestone escrow contract state transitions | M1 | R4 |
| 6 | 3-Month Trial Entitlement & Export Resolution Engine | 90-day trial countdown calculation, watermarked 150 DPI vs Pro 300+ DPI vector export resolution controls | M1 | R5 |
| 7 | Digital Asset Marketplace UI (`/marketplace`) | Fashion blueprints, silhouettes, 3D tech packs, fixed pricing tiers, instant licensing modal, category/style filters, sales dashboard | M2 | R1 |
| 8 | Machine Equipment Sharing UI (`/equipment`) | High-tech machine listings (Mimaki DDPT, Lectra laser cutter, Tajima embroidery), hourly/daily calendar scheduler, operator toggle, reservation modal | M2 | R2 |
| 9 | Vendor Material Sourcing UI (`/supply`) | Material catalogs (cotton, silk, velvet, organza, linings, trims), real-time stock levels, volume discounts matrix, interactive Smart Fabric Recommendation widget | M3 | R3 |
| 10 | Production Bidding & Tailor Ecosystem UI (`/bidding`) | Artisan public portfolios (Zardozi, Master Cutting, Tuxedos, Lehengas), RFQ design brief publisher, competitive bid submission and in-app acceptance workflow | M3 | R4 |
| 11 | Stylist Directory & 3-Month Free Trial UI (`/stylists`) | Certified area-wise stylist directory (stylists, embroidery artisans, fashion consultants), trial status banner, onboarding modal | M4 | R5 |
| 12 | Navigation, Command Palette & RBAC Expansion | Sidebar navigation items, `CommandPalette` (`Ctrl+K`) search integration, breadcrumbs, RBAC route guards for new ecosystem routes | M4 | R1-R5 |
| 13 | Print / PDF Export Templates for Ecosystem | Native `@media print` components: Tech Pack Spec Sheet, Material BOM / Sourcing Invoice, Machine Job Reservation Receipt | M4 | Acceptance Criteria |
| 14 | Comprehensive Automated Test Suite (Tiers 1-4) | Unit & integration tests for all 5 layers and print/RBAC utilities, expanding test suite to 1,100+ passing tests | M5 | Acceptance Criteria |
| 15 | Adversarial Hardening, Integrity Audit & Build Validation | White-box stress testing, forensic integrity verification, zero TypeScript/ESLint warnings, clean static build | M6 | Acceptance Criteria |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Ecosystem Types, Business Logic & Algorithms | Define `types/ecosystem.ts`, `lib/ecosystem-algorithms.ts`, `lib/ecosystem-seeds.ts` | none | DONE |
| M2 | Layer 1 & 2 UI: Digital Asset Marketplace & Equipment Sharing | Implement `/marketplace` and `/equipment` pages, components, modals, filters, and storage persistence | M1 | DONE |
| M3 | Layer 3 & 4 UI: Material Sourcing & Tailor Bidding Ecosystem | Implement `/supply` and `/bidding` pages, smart recommendation widget, bidding workflows, and storage persistence | M1 | DONE |
| M4 | Layer 5 UI, Navigation, RBAC & Print Layouts | Implement `/stylists` page, 3-month trial banner, sidebar nav update, Command Palette items, RBAC rules, print layouts | M2, M3 | DONE |
| M5 | Comprehensive Automated Unit & Integration Test Suites | Write test suites (`digital-assets.test.ts`, `equipment-sharing.test.ts`, `material-sourcing.test.ts`, `production-bidding.test.ts`, `trial-stylist-directory.test.ts`, `print-and-rbac-expansion.test.ts`) integrated into `run-tests.ts` | M1, M2, M3, M4 | DONE |
| M6 | Adversarial Hardening, Forensic Audit & Final Build Gate | Run full test suite (943+ existing + new tests), execute forensic audit, verify `npm run build` with 0 errors | M5 | DONE |

---

## Interface Contracts

### Storage Keys
- `yh_marketplace_assets`: `FashionBlueprintAsset[]`
- `yh_asset_licenses`: `AssetLicenseCertificate[]`
- `yh_creator_earnings`: `CreatorEarningsLedger[]`
- `yh_workshop_machines`: `WorkshopMachineListing[]`
- `yh_machine_reservations`: `MachineReservationRecord[]`
- `yh_vendor_materials`: `VendorMaterialItem[]`
- `yh_fabric_sourcing_orders`: `MaterialSourcingOrder[]`
- `yh_artisan_portfolios`: `ArtisanPortfolioProfile[]`
- `yh_production_briefs`: `ProductionDesignBrief[]`
- `yh_tailor_bids`: `TailorProductionBid[]`
- `yh_tenant_trial_profile`: `TenantTrialOnboardingProfile`
- `yh_certified_stylists`: `CertifiedStylistProfile[]`
- `yh_stylist_bookings`: `StylistConsultationBookingRecord[]`

### Window Events
- `yh-data-sync`: custom event dispatched on any state mutation to trigger immediate reactive UI updates across components and tabs.

---

## Code Layout

```
apps/web/src/
├── app/
│   └── (dashboard)/
│       ├── marketplace/page.tsx         # [M2] Layer 1: Digital Asset Warehouse
│       ├── equipment/page.tsx           # [M2] Layer 2: Machine Equipment Sharing
│       ├── supply/page.tsx              # [M3] Layer 3: Vendor Material Sourcing
│       ├── bidding/page.tsx             # [M3] Layer 4: Production Bidding
│       └── stylists/page.tsx            # [M4] Layer 5: Stylists Directory & Trial
├── components/
│   ├── ecosystem/                       # [M2, M3, M4] Reusable ecosystem UI components
│   │   ├── asset-card.tsx
│   │   ├── asset-license-modal.tsx
│   │   ├── machine-card.tsx
│   │   ├── machine-booking-modal.tsx
│   │   ├── fabric-recommendation-widget.tsx
│   │   ├── vendor-material-card.tsx
│   │   ├── brief-submission-modal.tsx
│   │   ├── tailor-bid-card.tsx
│   │   ├── stylist-card.tsx
│   │   └── trial-status-banner.tsx
│   └── print-layouts.tsx                # [M4] Enhanced with TechPackPrint, BOMPrint, MachineTicketPrint
├── types/
│   └── ecosystem.ts                     # [M1] All 5 layer TypeScript interfaces
├── lib/
│   ├── ecosystem-algorithms.ts          # [M1] Pure math & business logic algorithms
│   ├── ecosystem-seeds.ts               # [M1] Initial mock datasets
│   ├── rbac-utils.ts                    # [M4] Expanded route access definitions
│   └── storage-utils.ts                 # Safe local storage wrapper
└── __tests__/                           # [M5]
    ├── digital-assets.test.ts
    ├── equipment-sharing.test.ts
    ├── material-sourcing.test.ts
    ├── production-bidding.test.ts
    ├── trial-stylist-directory.test.ts
    ├── print-and-rbac-expansion.test.ts
    └── run-tests.ts
```
