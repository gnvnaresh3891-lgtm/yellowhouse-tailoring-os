# YellowHouse Tailoring OS — Comprehensive Architecture & Codebase Survey

**Author**: Explorer 1  
**Date**: 2026-08-23  
**Project**: YellowHouse Tailoring OS (`apps/web` & `apps/api`)  
**Scope**: Full architectural investigation of Next.js App Router, UI design system, state management & storage persistence, RBAC, and seamless integration path for the 5 ecosystem extension layers.

---

## Executive Summary

YellowHouse Tailoring OS is an enterprise-grade multi-tenant Bespoke Tailoring & Garment Engineering platform. The frontend is built on **Next.js 14 App Router** (React 18, TypeScript, Tailwind CSS, Lucide icons) with dark-mode first glassmorphic aesthetics, dynamic HSL gold styling, safe client-side `localStorage` persistence, bidirectional state synchronization, dynamic mathematical calculation engines (SAM and Bespoke Pricing), interactive 2D CAD SVG landmark manipulation, and role-based access control (RBAC).

This survey documents the foundational architecture and outlines the non-intrusive integration roadmap for the 5 upcoming ecosystem layers:
1. **Digital Asset Warehouse & Design Marketplace**
2. **Machine & Workshop Equipment Sharing Marketplace**
3. **Supply Layer: Vendor Material Sourcing & Smart Recommendations**
4. **Production Bidding & Tailor / Manufacturer Ecosystem**
5. **3-Month Free Trial Onboarding & Stylist Directory ("Purple Cogs")**

---

## 1. Next.js App Router & Routing Architecture

### 1.1 Directory Structure (`apps/web/src/app`)

```
apps/web/src/app/
├── layout.tsx                     # Root HTML/Body wrapper with providers
├── globals.css                    # Design tokens, CSS variables, glassmorphism
├── page.tsx                       # Public marketing landing page & interactive CAD demo
├── onboarding/
│   └── page.tsx                   # Multi-tenant atelier onboarding wizard (3 steps)
├── (auth)/
│   ├── layout.tsx                 # Auth layout wrapper
│   ├── login/page.tsx             # Login interface with demo credentials
│   └── register/page.tsx          # Registration interface
└── (dashboard)/                   # Authenticated workspace route group
    ├── layout.tsx                 # Responsive dashboard shell (sidebar, topbar, guards)
    ├── dashboard/page.tsx         # Atelier KPI overview, activity feed, pipeline
    ├── customers/page.tsx         # Customer directory, fit profiles, VIP management
    ├── measurements/page.tsx      # 2D CAD SVG landmark engine & POM technical specs
    ├── orders/page.tsx            # Order draft creation, pricing engine, quotation
    ├── production/page.tsx        # 5-stage Kanban board, SAM tracking, timesheets
    ├── staff/page.tsx             # Specialist recruitment & attendance schedules
    └── admin/page.tsx             # Global multi-tenant admin oversight (SUPER_ADMIN)
```

### 1.2 Layout & Provider Hierarchy

1. **Root Layout (`app/layout.tsx`)**:
   - Applies `html.dark` and base dark slate background (`#0B0F19`).
   - Wraps the entire application tree with `<CurrencyProvider>` and `<ToastProvider>`.
2. **Dashboard Layout (`app/(dashboard)/layout.tsx`)**:
   - `use client` component managing global workspace chrome.
   - **Route Guard**: Reads active user from `yh_auth_user` storage. Evaluates `canUserAccessRoute(user.role, pathname)`; automatically redirects unauthorized roles using `getFallbackRedirectRoute(user.role, pathname)`.
   - **Navigation Filtering**: Executes `filterNavItemsForRole(navItems, user.role)` to dynamically hide unauthorized routes from the sidebar.
   - **Interactive Top Header**:
     - Mobile menu hamburger toggle with backdrop overlay.
     - Search bar bound to `<CommandPalette>` with `Ctrl+K` shortcut listener.
     - Country & Currency Selector dropdown powered by `useCurrency()`.
     - Notification Bell with unread counter and dynamic activity feed dropdown (`yh_activities`).
     - User Avatar card with initial monogram and role badge.
   - **Breadcrumb Navigation**: Embedded `<Breadcrumb />` component resolving nested pathname segments.
   - **Main Content Area**: `<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">` rendering child pages.

---

## 2. UI Design System & Component Library

### 2.1 Color Tokens & Theme Architecture (`tailwind.config.js` & `globals.css`)

- **HSL Gold Theme Tokens**:
  - `--gold-hue: 45`, `--gold-sat: 93%`
  - Metallic gold scale: `--color-gold-50` to `--color-gold-700` (core: `#EAB308` / `#FACC15`).
- **Dark Slate Hierarchy**:
  - Surface Base: `--bg-app: hsl(222, 47%, 7%)` (`#0B0F19`)
  - Elevated Surface: `--bg-surface-dark: hsl(222, 47%, 10%)` (`#101625`)
  - Card Interior: `--bg-card: hsl(222, 40%, 12%)` (`#141C2E`)
- **Glassmorphic UI Classes**:
  - `.glass-card`: `backdrop-filter: blur(16px) saturate(180%)`, border `hsla(0, 0%, 100%, 0.08)`, subtle hover lift & glow.
  - `.glass-card-gold`: Elevated gold-accented glass card with `hsla(45, 93%, 47%, 0.3)` border and ambient gold glow.
  - `.btn-gold`: Luxury gradient (`hsl(45, 93%, 47%)` to `hsl(38, 92%, 50%)`), dark text, crisp hover transform.
  - `.btn-ghost`: Translucent dark slate button with subtle hover borders.
  - `.input-dark`: Slate-900 input field with gold focus ring.
  - `.badge-gold`, `.badge-emerald`, `.badge-blue`, `.badge-amber`, `.badge-rose`: Standardized semantic status badges.
  - `.tooltip-content`: CSS-animated backdrop-blurred tooltip bubble.

### 2.2 Shared Components Library (`src/components/`)

| Component | File Path | Description & Purpose |
|---|---|---|
| `Tooltip` | `src/components/Tooltip.tsx` | Directional tooltip (`top`, `bottom`, `left`, `right`) with hover/focus triggers. |
| `ConfirmDialog` | `src/components/confirm-dialog.tsx` | Accessible modal dialog with focus trapping, `Escape` key listener, and destructive styling. |
| `CommandPalette` | `src/components/command-palette.tsx` | Global search modal (`Ctrl+K`) indexing routes, recent orders, and clients with keyboard navigation. |
| `Breadcrumb` | `src/components/breadcrumb.tsx` | Pathname-derived breadcrumb navigation trail with custom label mapping. |
| `ToastProvider` | `src/components/toast-context.tsx` | Toast notification system (`success`, `error`, `warning`, `info`) with auto-dismiss timers. |
| `CurrencyProvider` | `src/components/currency-context.tsx` | Multi-currency converter supporting 10 currencies (INR, USD, GBP, EUR, AED, SAR, CAD, AUD, SGD, JPY). |
| `PrintLayouts` | `src/components/print-layouts.tsx` | Dedicated print components (`OrderReceipt`, `CustomerListPrint`, `ScheduleListPrint`, `MeasurementCard`, `JobCardPrint`). |

---

## 3. State Management, Persistence & Synchronization

### 3.1 Safe Storage Utilities (`src/lib/storage-utils.ts`)

To guarantee zero runtime exceptions during cold starts or empty browser states:
- `getLocalStorage<T>(key: string, fallbackValue: T): T`: Performs SSR `typeof window` verification, catches JSON parse failures, rejects stringified `'null'`/`'undefined'`, and enforces array type constraints if `fallbackValue` is an array.
- `setLocalStorage<T>(key: string, value: T): boolean`: Safely serializes objects and updates storage.
- `removeLocalStorage(key: string): boolean`: Safe removal wrapper.

### 3.2 Key LocalStorage Entities

| Key | Type | Description |
|---|---|---|
| `yh_auth_user` | `Object` | Active session user (id, name, email, role, tenant metadata). |
| `yh_orders` | `Order[]` | List of atelier orders (status, items, pricing, advance/balance). |
| `yh_orders_draft` | `OrderFormDraft` | Unsaved draft state of the order creation form. |
| `yh_production_jobs` | `JobCardItem[]` | Workshop job cards active on the 5-stage Kanban board. |
| `yh_customers` | `Customer[]` | Registered client profiles, fit preferences, and VIP flags. |
| `yh_measurements_current` | `Record<string, number>` | Active CAD Point-of-Measurement (POM) values. |
| `yh_measurement_snapshots` | `VersionSnapshot[]` | Historical CAD measurement versions and fitting trial deltas. |
| `yh_staff` / `yh_staff_draft` | `StaffMember[]` | Atelier staff specialists and recruitment form draft. |
| `yh_admin_tenants` | `Tenant[]` | Multi-tenant boutique instances for platform administration. |
| `yh_activities` | `ActivityItem[]` | Chronological activity log for topbar notifications and feed. |
| `yh_preferred_currency` | `string` | User's active currency code (default: `'INR'`). |

### 3.3 Bidirectional State Synchronization (`src/lib/state-sync-utils.ts`)

- **Kanban Stage to Order Status**:
  - `syncJobToOrdersStorage(job)` maps Kanban stages to order statuses:
    - `Fabric Inspection` → `CONFIRMED`
    - `Master Cutting` → `CUTTING`
    - `Zardozi/Aari Embroidery` → `IN_PRODUCTION`
    - `Stitching Assembly` → `IN_PRODUCTION`
    - `QC & Ready for Delivery` → `READY_FOR_DELIVERY`
- **Order to Kanban Job Cards**:
  - `syncOrderToJobsStorage(order)` creates or updates job cards per garment item when an order is saved.
- **Cross-Component / Cross-Tab Reactivity**:
  - `dispatchSyncEvent()` dispatches a custom `yh-data-sync` window event.
  - Subscribers (Dashboard, Orders, Production) listen to `yh-data-sync` to refresh state dynamically without page reloads.

---

## 4. Role-Based Access Control (RBAC) Architecture

Defined in `src/lib/rbac-utils.ts`:

### 4.1 Supported Roles & Permissions Matrix

| Role | Allowed Routes | Default Landing | Description |
|---|---|---|---|
| `SUPER_ADMIN` | `/admin`, `/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/onboarding` | `/admin` | Global platform administrator with multi-tenant oversight. |
| `ATELIER_MANAGER` | `/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff` | `/dashboard` | Boutique owner/manager with full operational privileges. |
| `MASTER_TAILOR` | `/dashboard`, `/customers`, `/measurements`, `/orders`, `/production` | `/dashboard` | Master cutter managing CAD measurements, orders & cutting. |
| `EMBROIDERY_ARTISAN` | `/production`, `/measurements` | `/production` | Karigar / craftsman focused on stage execution and timesheets. |
| `SALES_FRONT_DESK` | `/dashboard`, `/customers`, `/measurements`, `/orders` | `/orders` | Front desk receptionist managing clients, orders & billing. |
| `QUALITY_INSPECTOR` | `/dashboard`, `/orders`, `/production`, `/measurements` | `/production` | Quality assurance and final inspection specialist. |
| `CUSTOMER_VIEW` | `/orders`, `/measurements` | `/orders` | Client view restricted to their specific fit and order status. |

### 4.2 Role Normalization

- `normalizeRole(role)` handles common enterprise aliases:
  - `TENANT_OWNER`, `BRANCH_MANAGER` → `ATELIER_MANAGER`
  - `KARIGAR` → `EMBROIDERY_ARTISAN`
  - `RECEPTIONIST` → `SALES_FRONT_DESK`
  - `SYSTEM_ADMIN` → `SUPER_ADMIN`

---

## 5. Integration Architecture for the 5 Ecosystem Layers

To comply with the User Directive ("proceed but these has to be implemented separately as optional will be added in future not disturbing now"), the new ecosystem layers should be built as **modular, non-intrusive extension routes** within the App Router.

### 5.1 Route Mapping & Structure

```
apps/web/src/app/(dashboard)/
├── ... (Existing core routes remain 100% undisturbed)
├── marketplace/                   # Layer 1: Digital Asset Warehouse & Design Marketplace
│   └── page.tsx
├── equipment/                     # Layer 2: Machine & Workshop Equipment Sharing Marketplace
│   └── page.tsx
├── supply/                        # Layer 3: Vendor Material Sourcing & Smart Recommendations
│   └── page.tsx
├── bidding/                       # Layer 4: Production Bidding & Tailor/Manufacturer Ecosystem
│   └── page.tsx
└── stylists/                      # Layer 5: 3-Month Free Trial & Stylist Directory ("Purple Cogs")
    └── page.tsx
```

### 5.2 Ecosystem Layers Detail & Storage Blueprint

1. **Layer 1 — Digital Asset Warehouse & Design Marketplace (`/marketplace`)**:
   - Blueprint & 3D tech pack catalog with category/style filters.
   - Fixed pricing tiers, instant licensing workflow, earnings dashboard.
   - Storage Key: `yh_marketplace_assets`, `yh_asset_licenses`.
2. **Layer 2 — Machine & Workshop Equipment Sharing (`/equipment`)**:
   - Machine catalog (Digital textile printers, laser cutters, automated embroidery machines, tool positioners).
   - Hourly/daily booking calendar, operator toggle, panel reservation workflows.
   - Storage Key: `yh_equipment_listings`, `yh_equipment_bookings`.
3. **Layer 3 — Vendor Material Sourcing & Smart Recommendations (`/supply`)**:
   - Fabric catalogs (cotton, silk, velvet, organza, linings, trims) with live stock and tier comparisons.
   - Smart recommendation engine calculating optimal fabric swatches based on budget, garment type, and yield.
   - Storage Key: `yh_vendor_materials`, `yh_fabric_orders`.
4. **Layer 4 — Tailor & Manufacturer Bidding Marketplace (`/bidding`)**:
   - Public artisan portfolios (Zardozi, Master Cutting, Tuxedos, Lehengas) with capacity and rates.
   - Design brief submission and competitive bidding system with in-app acceptance.
   - Storage Key: `yh_tailor_bids`, `yh_design_briefs`.
5. **Layer 5 — 3-Month Free Trial Onboarding & Stylist Directory ("Purple Cogs") (`/stylists`)**:
   - 3-month free trial tier for emerging designers with download resolution controls.
   - Certified area-wise stylist directory (stylists, embroidery artisans, fashion consultants).
   - Storage Key: `yh_stylists_directory`, `yh_trial_subscriptions`.

### 5.3 Non-Intrusive Navigation & RBAC Integration Strategy

1. **Sidebar Navigation (`src/app/(dashboard)/layout.tsx`)**:
   - Add secondary section `"Ecosystem Extensions"` or integrate modular links with an optional `"NEW"` or `"OPTIONAL"` badge.
   - Maintain complete backwards compatibility for all 7 existing nav items.
2. **Command Palette (`src/components/command-palette.tsx`)**:
   - Add entries for `/marketplace`, `/equipment`, `/supply`, `/bidding`, `/stylists` into the searchable pages array.
3. **Breadcrumb (`src/components/breadcrumb.tsx`)**:
   - Add label mappings (`marketplace: 'Design Marketplace'`, `equipment: 'Equipment Sharing'`, `supply: 'Material Supply'`, `bidding: 'Production Bidding'`, `stylists: 'Stylist Directory'`).
4. **RBAC Configuration (`src/lib/rbac-utils.ts`)**:
   - Whitelist the new routes under appropriate roles (e.g. `SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`) without altering existing route permissions.

---

## 6. Quality & Verification Strategy

1. **Production Build**: `npm run build` must compile with 0 TypeScript/ESLint warnings.
2. **Test Suite Integrity**: Execute `npm test` to verify that all 943+ unit and integration tests continue to pass with 100% green status.
3. **Storage Fallback Verification**: Verify that opening every route with clean/empty `localStorage` executes with zero runtime exceptions.
