# Project: YellowHouse Tailoring OS Nuclear UI/UX Rebuild (Apple-Grade Design System)

## Architecture
YellowHouse Tailoring OS is a Next.js 14 App Router B2B SaaS platform for bespoke tailoring ateliers, bespoke clothiers, and couture houses.
- **Frontend Workspace**: `apps/web` (Next.js 14, React 18, Tailwind CSS v3.4.3, Lucide React icons, TypeScript)
- **Backend API Workspace**: `apps/api` (NestJS, Prisma ORM)
- **UI/UX Paradigm**: Apple Human Interface Guidelines (iPhone OS / macOS Ventura style)
  - Typography: SF Pro display/text optical hierarchy, negative letter tracking (`tracking-tight`), tabular numerals for measurements, SAM timers, and currency.
  - Spatial Grid: Strict 8px spatial rhythmic scale (4px/8px increments).
  - Palette: Monochromatic deep neutral slate/zinc base (`#07090E` OLED canvas, layered dark luminance) accented selectively by warm atelier gold (`#D4AF37` / `#C59B27`).
  - Depth & Elevation: Multi-layer soft ambient shadows (`shadow-ios-sm` through `shadow-ios-xl`), translucent frosted glass (`backdrop-blur-2xl bg-slate-900/60`), and hairline top bevel highlights (`inset 0 1px 0 0 rgba(255,255,255,0.08)`) replacing harsh 1px borders.
  - Geometry: Generous squircle and continuous pill radii (`rounded-2.5xl`, `rounded-3xl`, `rounded-full`).
  - Tactile Micro-Interactions: Native hardware-accelerated spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`), press scaling (`active:scale-[0.98]`), fluid shimmer loading states.
  - Print Isolation: Strict `@media print` isolation keeping printable documents (Measurement Cards, Order Receipts, Job Tickets, Invoices) clean on pure white paper with pure vector SVG QR/barcodes.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Apple Design System Tokens | SF Pro typography, 8px grid, warm gold palette, iOS shadow tokens, spring curves | M1 | Survey (Explorer 2) |
| 2 | UI Component Primitives | Apple-grade Button, Card, Badge, SegmentedControl, Input, Dialog in `src/components/ui/` | M1 | Survey (Explorer 2) |
| 3 | Dashboard Shell & Navigation | Native iOS/macOS sidebar, frosted glass topbar, Command Palette (Ctrl+K), currency switcher, role-based nav | M1 | Survey (Explorer 1) |
| 4 | Public Marketing Landing Page | Redesigned `/` with 4 atelier demo personas, operational telemetry, interactive CAD preview, Karigar yield calc | M2 | Survey (Explorer 1) |
| 5 | RedHouse OS Ecosystem Landing | Redesigned `/redhouse-os` public ecosystem portal with Apple-grade cards and metrics | M2 | Survey (Explorer 1) |
| 6 | Authentication Views | Redesigned `/login` & `/register` with auth layout, credential inputs, active session status card | M2 | Survey (Explorer 1) |
| 7 | Onboarding Wizard Funnel | 3-step registration wizard at `/onboarding` with live slug verification, template blueprints, demo data eviction | M2 | Survey (Explorer 1) |
| 8 | Executive Atelier Dashboard | High-altitude KPI telemetry, P&L stats, recent orders table, Karigar SAM yield bars at `/dashboard` | M3 | Survey (Explorer 1, 3) |
| 9 | Orders & Dynamic BOM Studio | Full order intake, client profiling, `CUST-FAB-` SKU generator, 12 garment BOM presets, status state machine at `/orders` | M3 | Survey (Explorer 1, 3) |
| 10 | 2D CAD Mannequin & Caliper Studio | Pure SVG 420x840 viewport, 0.8-1.35 zoom, 6 garment drape overlays, 4-axis posture morphs, caliper steppers at `/measurements` | M3 | Survey (Explorer 1, 3) |
| 11 | Karigar Production Kanban Board | 5-stage workshop floor, single-step transitions, garment timers, SAM calculation engine at `/production` | M4 | Survey (Explorer 1, 3) |
| 12 | Piece-Rate Ledger & Timesheets | Daily/weekly artisan timesheets, ₹42/min piece rate payout ledger, rack logistics at `/production` | M4 | Survey (Explorer 1, 3) |
| 13 | Customer CRM & Client Profile | Client directory, VIP tags, measurement linking, frosted glass detail drawer at `/customers` | M4 | Survey (Explorer 1, 3) |
| 14 | Staff Management & Timesheets | Team roster, 7-role assignments, operational status toggles at `/staff` | M4 | Survey (Explorer 1, 3) |
| 15 | Master Admin Passkey Gate & Console | Master passkey `yh-admin-2026` modal challenge, global tenant directory, subscription breakdown, audit logs at `/admin` | M5 | Survey (Explorer 1, 3) |
| 16 | Ecosystem Marketplace Modules | 6 RedHouse modules: `/redhouse`, `/marketplace`, `/bidding`, `/equipment`, `/supply`, `/stylists` (and `/redhouse/*` subroutes) | M5 | Survey (Explorer 1) |
| 17 | Print Layouts & Vector Barcodes | 8 printable documents with `@media print` isolation and pure SVG QR / Code 128 barcode generation | M1, M3, M4 | Survey (Explorer 2, 3) |
| 18 | E2E Testing & Adversarial Hardening | Comprehensive test suite (Tiers 1-4) + adversarial validation (Tier 5) across all 26 static pages | M6, E2E Track | Survey (Explorer 1, 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System Foundation, UI Primitives & Shell | `tailwind.config.js`, `globals.css`, `src/components/ui/*`, `RootLayout`, `DashboardLayout`, `AuthLayout` | None | PLANNED |
| M2 | Public Experience, Auth & Onboarding | `/`, `/redhouse-os`, `/login`, `/register`, `/onboarding` | M1 | PLANNED |
| M3 | Core Atelier Operations & CAD Studio | `/dashboard`, `/orders`, `/measurements` | M1 | PLANNED |
| M4 | Production Floor, Karigar SAM & Operations | `/production`, `/customers`, `/staff` | M1 | PLANNED |
| M5 | Admin Security Console & Ecosystem Marketplace | `/admin`, `/redhouse`, `/redhouse/marketplace`, `/redhouse/bidding`, `/redhouse/equipment`, `/redhouse/supply`, `/redhouse/stylists`, standalone ecosystem routes, `/_not-found` | M1 | PLANNED |
| M6 | E2E Test Pass & Adversarial Hardening | 100% pass across full test suite (Tiers 1-4) + Tier 5 adversarial stress testing | M1-M5 | PLANNED |

## Interface Contracts
### Design Tokens ↔ Components
- Custom Tailwind classes: `font-display`, `font-sans`, `bg-canvas`, `glass-card`, `glass-panel`, `glass-topbar`, `btn-apple`, `btn-apple-gold`, `shadow-ios-sm`, `shadow-ios-md`, `shadow-ios-lg`, `shadow-ios-xl`, `border-hairline`.
- UI Primitives exported from `src/components/ui/`:
  - `Button`: variant (`primary`, `secondary`, `gold`, `ghost`, `danger`), size (`sm`, `md`, `lg`, `icon`), tactile `active:scale-[0.98]`.
  - `Card`: variant (`glass`, `opaque`, `elevated`), padding (`sm`, `md`, `lg`), squircle radius.
  - `Badge`: variant (`neutral`, `gold`, `success`, `warning`, `danger`), size (`sm`, `md`), pill shape.
  - `SegmentedControl`: iOS-style sliding pill active indicator, full keyboard accessibility.
  - `Input`: pill/squircle shape, dark translucent fill, gold focus ring, clear error state.

### RBAC & Security Invariants ↔ Routes
- `/admin` passkey bypass in `DashboardLayout`: `pathname === '/admin' || pathname.startsWith('/admin/')` must skip layout-level redirects so `admin/page.tsx` renders the master passkey challenge.
- Passkey: `yh-admin-2026` (also supporting `admin123`, `yellowhouse@admin`).
- 7 Platform roles: `SUPER_ADMIN`, `TENANT_OWNER`, `BRANCH_MANAGER`, `MASTER_TAILOR`, `RECEPTIONIST`, `KARIGAR`, `ACCOUNTANT`.
- Public landing page: exactly 4 customer-facing atelier demo personas (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`), 0 admin leaks.
- LocalStorage keys: `yh_auth_user`, `yh_onboarding_draft`, `yh_admin_tenants`, `yh_customers`, `yh_orders`, `yh_production_jobs`, `yh_measurements_current`, `yh_measurement_snapshots`.

### Mathematical & Engineering Invariants
- Customer Fabric SKU format: must begin with `CUST-FAB-`.
- 12 Garment Types: Blouse, Corset, Shirt, Trouser, 2-Piece Suit, 3-Piece Suit, Sherwani, Bandhgala, Kurta, Lehenga, Anarkali, Gown.
- 2D CAD SVG: `viewBox="0 0 420 840"`, zoom range 80%–135% (`0.8` to `1.35`), 4 HUD controls, 6 garment drape overlays, 4-axis posture morphs.
- Karigar Kanban: 5 stages, single-step transitions (`Math.abs(diff) <= 1`).
- SAM Calculator: Base minutes + posture surcharges + panel/embroidery/canvas/lining surcharges.
- Piece-rate earnings: ₹42/minute rate.
- Print layouts: 8 documents with `@media print` isolation and pure SVG vector QR/barcodes.

## Code Layout
- `apps/web/tailwind.config.js`: Apple design tokens (fonts, shadows, radii, colors, spring transitions) [Owned by M1]
- `apps/web/src/app/globals.css`: Global styles, frosted glass utilities, print media query isolation [Owned by M1]
- `apps/web/src/components/ui/*`: Centralized Apple UI primitives (`button.tsx`, `card.tsx`, `badge.tsx`, `segmented-control.tsx`, `input.tsx`) [Owned by M1]
- `apps/web/src/app/layout.tsx`: Root layout and providers [Owned by M1]
- `apps/web/src/app/(dashboard)/layout.tsx`: Native iOS/macOS sidebar & frosted topbar shell [Owned by M1]
- `apps/web/src/app/(auth)/layout.tsx`: Auth layout shell [Owned by M1]
- `apps/web/src/app/page.tsx`: Landing page [Owned by M2]
- `apps/web/src/app/redhouse-os/page.tsx`: Ecosystem landing [Owned by M2]
- `apps/web/src/app/(auth)/login/page.tsx`: Login page [Owned by M2]
- `apps/web/src/app/(auth)/register/page.tsx`: Register page [Owned by M2]
- `apps/web/src/app/onboarding/page.tsx`: Onboarding wizard [Owned by M2]
- `apps/web/src/app/(dashboard)/dashboard/page.tsx`: Atelier executive dashboard [Owned by M3]
- `apps/web/src/app/(dashboard)/orders/page.tsx`: Orders & Dynamic BOM studio [Owned by M3]
- `apps/web/src/app/(dashboard)/measurements/page.tsx`: 2D CAD Mannequin & Caliper studio [Owned by M3]
- `apps/web/src/app/(dashboard)/production/page.tsx`: Karigar workshop Kanban & SAM ledger [Owned by M4]
- `apps/web/src/app/(dashboard)/customers/page.tsx`: Customer CRM directory [Owned by M4]
- `apps/web/src/app/(dashboard)/staff/page.tsx`: Staff management & roster [Owned by M4]
- `apps/web/src/app/(dashboard)/admin/page.tsx`: Admin console & passkey gate [Owned by M5]
- `apps/web/src/app/(dashboard)/redhouse/*` & standalone ecosystem pages: Marketplace modules [Owned by M5]
- `apps/web/src/__tests__/*`: E2E, regression, and adversarial test suites [Owned by E2E Track / M6]
