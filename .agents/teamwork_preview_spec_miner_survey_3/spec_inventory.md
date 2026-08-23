# Feature Specification Inventory: YellowHouse Tailoring OS (R2 & R3)

**Author:** teamwork_preview_spec_miner_survey_3 (Spec Miner)  
**Date:** 2026-08-07  
**Scope:** UI/UX Specifications, Route Inventory, RBAC Rules, Aesthetic Details, Micro-interactions, and E2E User Flows  
**Target Directory:** `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  

---

## 1. Executive Summary

YellowHouse Tailoring OS is a monorepo bespoke tailoring management platform built with Next.js 14 (App Router) frontend and NestJS 10 (Prisma ORM) backend. This specification inventory documents all routes, user interfaces, RBAC access matrices, micro-interactions, local storage state persistence rules, and aesthetic specifications across Requirements R1, R2, and R3.

---

## 2. Page & Route Enumeration

| Route Path | Page Title | Component File | Description & Core Purpose | Primary Actions | Local Storage Keys |
|---|---|---|---|---|---|
| `/` | Marketing Landing Page | `apps/web/src/app/page.tsx` | Public landing page showcasing CAD measurement engine, Karigar yield calculator, competitor matrix, pricing tiers, and interactive 2D pattern SVG demo. | Plan choice, Demo launch, Testimonials carousel, FAQ toggle | None |
| `/onboarding` | Multi-Tenant Onboarding | `apps/web/src/app/onboarding/page.tsx` | 3-step setup wizard for multi-tenant boutique onboarding: (1) Identity & slug availability check, (2) POM template selection, (3) Owner account setup. | Check subdomain slug, select templates, launch atelier | `yh_auth_user`, Cookies (`jwt_token`, `x-tenant-id`) |
| `/login` | Authentication Login | `apps/web/src/app/(auth)/login/page.tsx` | User login portal supporting manual credentials and 5 instant quick demo login profiles (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`, `SYSTEM_ADMIN`). | Login, Quick demo login, Remember me | `yh_auth_user` |
| `/register` | Atelier Registration | `apps/web/src/app/(auth)/register/page.tsx` | Registration page for onboarding new team members across 6 RBAC roles with role description guidance. | Register user account | `yh_auth_user` |
| `/dashboard` | Workspace Dashboard | `apps/web/src/app/(dashboard)/dashboard/page.tsx` | Central atelier command center displaying 4 KPI stat cards (Active Orders, Total Clients, Urgent Jobs, Gross Revenue), recent orders table, quick tools, and workshop stage summary. | Create Order shortcut, Fit Engine link, View All orders | `yh_orders`, `yh_production_jobs`, `yh_customers` |
| `/customers` | Customer Directory | `apps/web/src/app/(dashboard)/customers/page.tsx` | Client directory with search, gender filters, VIP toggle, customer stats, Add Customer modal, and slide-over profile detail drawer. | Add Customer, Filter VIP, Edit profile, View fit notes | `yh_customers` (fallback initial state) |
| `/measurements` | CAD Measurement Workspace | `apps/web/src/app/(dashboard)/measurements/page.tsx` | Core measurement engine featuring 6 garment schemas (Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset), 2D SVG Mannequin diagram with interactive hotspots, posture profile sliders, version snapshot manager, and 3-way fitting trial delta tracker. | Garment select, Unit toggle (`in`/`cm`), Posture adjust, Save snapshot, Fitting comparison | `yh_measurements_current`, `yh_measurements_gender`, `yh_measurements_garment`, `yh_measurements_slope`, `yh_measurements_stance`, `yh_measurements_posture`, `yh_measurements_heel`, `yh_measurement_snapshots` |
| `/orders` | Order Management | `apps/web/src/app/(dashboard)/orders/page.tsx` | Dual-tab order workspace: (1) Active Orders table with search, status filters, drawer modal, (2) Create New Order wizard with item rows, fabric SKU, fabric/lining swatch upload, trim notes, 50% advance calculator, and WhatsApp quotation dispatch. | Create order, Add garment row, Upload swatches, Calculate 50% advance, Dispatch WhatsApp quote | `yh_orders`, `yh_production_jobs` |
| `/production` | Karigar Production Board | `apps/web/src/app/(dashboard)/production/page.tsx` | Workshop management page with 2 sub-tabs: (1) 5-stage Kanban board (`Fabric Inspection`, `Master Cutting`, `Zardozi/Aari Embroidery`, `Stitching Assembly`, `QC & Ready for Delivery`) with drag/button stage movement, SAM tracking, and barcode view; (2) Artisan Timesheets/Logs for piece-rate payouts. | Move stage, Edit job card, Log SAM time, View timesheets, Delete with audit reason | `yh_production_jobs`, `yh_orders`, `yh_deleted_jobs_log` |
| `/staff` | Staff Management | `apps/web/src/app/(dashboard)/staff/page.tsx` | Staff directory for hiring specialists, role assignments (`TENANT_OWNER`, `BRANCH_MANAGER`, `MASTER_TAILOR`, `RECEPTIONIST`, `KARIGAR`, `ACCOUNTANT`), active/pending status, and account deactivation. | Hire specialist, Filter roles, Deactivate account | `yh_staff` |
| `/admin` | System Administration | `apps/web/src/app/(dashboard)/admin/page.tsx` | Platform administration portal (exclusive to `SYSTEM_ADMIN`) with 6 global KPIs (Total Tenants [24], Active Subs [22], Monthly Revenue [₹8,45,000], Total Orders [1,847], Karigar Pool [156], System Uptime [99.97%]), subscription tier distribution chart, tenant directory, suspend/reactivate toggles, and tenant onboarding modal. | Onboard tenant, Suspend/Reactivate tenant, Filter plans, Export audit log | `yh_admin_tenants` |

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Onboarding | Workspace Subdomain Slug Checker | Debounced real-time validation of workspace subdomain availability during onboarding. | Subdomain string (3-50 chars) | Status badge: `available`, `taken`, `checking`, or `invalid` | Shows message "Must be 3-50 characters (lowercase letters, numbers, hyphens)" or "Workspace slug is already taken." | `apps/web/src/app/onboarding/page.tsx` |
| 2 | Onboarding | Template Seeding Selector | Pre-loads POM schemas for Men's Ethnic (28 POMs), Men's Western (32 POMs), Women's Ethnic (36 POMs), Women's Couture (40 POMs). | Checkbox selection | Seeded POM count total | Blocks step progression if 0 templates selected. | `apps/web/src/app/onboarding/page.tsx` |
| 3 | Auth | Quick Demo Role Selector | One-click instant login buttons for pre-configured roles (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`, `SYSTEM_ADMIN`). | Click demo account card | Populates credentials & authenticates session to `localStorage` | Graceful fallback to `TENANT_OWNER` if role unrecognized. | `apps/web/src/app/(auth)/login/page.tsx` |
| 4 | CAD Engine | 6 Garment POM Form Engine | Dynamic form rendering POM fields for Men's (Sherwani, Suit) and Women's (Blouse, Lehenga, Anarkali, Corset). | Numeric POM values (`in` or `cm`) | Real-time calculation, range validation, SVG hotspot highlight | Out-of-range inputs trigger Rose Red highlight and alert message. | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| 5 | CAD Engine | Interactive 2D SVG Mannequin | SVG vector silhouette (Front/Back view) with laser guidelines, coordinate grid, and clickable hotspot nodes linked to POM inputs. | Hotspot node click or hover | Focuses matching POM input, renders glowing crosshairs & radar pulses | Invalid values change hotspot color from Emerald Green to Rose Red. | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| 6 | CAD Engine | Posture Profile Modifiers | Adjusts pattern ease offsets based on 4 posture axes: Shoulder Slope (`Normal`, `Sloped`, `Square`), Chest Stance (`Normal`, `Forward`, `Barrel`), Back Posture (`Normal`, `Stooped`, `Erect`), and Heel Height (`0"`, `1"`, `2"`, `3"`). | Selector buttons | Dynamic ease allowance adjustments | Heel height disabled when `selectedGender === 'Men'`. | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| 7 | CAD Engine | Measurement Versioning Manager | Saves immutable snapshot versions (`v1.0`, `v2.0`, `v3.0`) with timestamp, garment type, and POM count without mutating order history. | Save Snapshot button | Version card added to history timeline | Disabled when form validation errors exist. | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| 8 | CAD Engine | 3-Way Fitting Delta Comparison | Compares Original POM Target vs Trial #1 Observed vs Trial #2 Observed, displaying variance delta and tolerance status (`Perfect` ≤0.0", `Tolerance` ≤0.25", `Alteration` >0.25"). | Fitting trial inputs | Color-coded delta matrix and status pills | Large variances (>0.75") highlight in Rose Red. | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| 9 | Orders | Multi-Item Order Creation | Dynamic order builder with multiple garment rows, auto-populated fabric meters, fabric SKU, and unit prices. | Garment type select, SKU, meters, price | Total order amount & fabric yield summation | Blocks submission if customer or items missing. | `apps/web/src/app/(dashboard)/orders/page.tsx` |
| 10 | Orders | Swatch & Material Attachments | Upload custom fabric photos, lining photos, or pick presets (e.g. Crimson Silk Velvet, Emerald Green Velvet, Royal Blue Brocade) and trim notes. | Image preset select or photo upload | Swatch thumbnail preview on item card | Renders placeholder graphic when no image attached. | `apps/web/src/app/(dashboard)/orders/page.tsx` |
| 11 | Orders | 50% Mandatory Advance Calculator | Automatically computes 50% advance deposit required upon order confirmation and remaining balance due at fitting. | Item prices sum | Formatted INR advance display | Recalculates dynamically on any price update. | `apps/web/src/app/(dashboard)/orders/page.tsx` |
| 12 | Orders | WhatsApp Quotation Dispatcher | Generates interactive WhatsApp quotation preview payload with deposit request link and dispatches notification toast. | Click "Send Quotation via WhatsApp" | Creates order in `yh_orders`, seeds job card to Kanban, displays toast notification | Saves as Draft if draft button clicked instead. | `apps/web/src/app/(dashboard)/orders/page.tsx` |
| 13 | Production | 5-Stage Kanban Board | Visual production pipeline with 5 columns (`Fabric Inspection`, `Master Cutting`, `Zardozi/Aari Embroidery`, `Stitching Assembly`, `QC & Ready for Delivery`), stage movement controls, SAM tracking, and barcode badges. | Stage arrow clicks or status updates | Moves card, updates progress bar, syncs status back to `yh_orders` | Prevents moving backward beyond stage 0 or forward beyond stage 4. | `apps/web/src/app/(dashboard)/production/page.tsx` |
| 14 | Production | Order-to-Production Sync | Automatic bidirectional synchronization between Kanban stage transitions and active order status in `yh_orders`. | Stage movement on Kanban card | Updates `Order.status` (`CONFIRMED`, `CUTTING`, `IN_PRODUCTION`, `READY_FOR_DELIVERY`) | Matches job order ID after stripping prefixes gracefully. | `apps/web/src/app/(dashboard)/production/page.tsx` |
| 15 | Production | Artisan Timesheets & Logs | Daily and monthly log viewer tracking SAM minutes logged per Karigar, task description, and piece-rate payout calculation (₹42/min). | Month/year/date filters, Karigar select | Total SAM minutes, total payout INR, completed task count | Shows empty message if no logs match selected date/artisan. | `apps/web/src/app/(dashboard)/production/page.tsx` |
| 16 | Staff | Staff Recruitment & Role Provisioning | Adds new atelier specialists (`MASTER_TAILOR`, `BRANCH_MANAGER`, `RECEPTIONIST`, `KARIGAR`, `ACCOUNTANT`), assigns branch, and creates active login credentials. | Name, email, password, role, branch | Adds staff row to directory and enables authentication | Validates email syntax and min password length (6 chars). | `apps/web/src/app/(dashboard)/staff/page.tsx` |
| 17 | Admin | Global Platform Dashboard | Multi-tenant system administration dashboard displaying 6 platform KPIs, subscription plan distribution chart, tenant table, and suspend/reactivate controls. | Search, plan filter, status filter, suspend toggle | Filtered tenant table, system metric summaries | Accessible only to `SYSTEM_ADMIN` role. | `apps/web/src/app/(dashboard)/admin/page.tsx` |

---

## 4. RBAC Access Control Matrix

| Role | Access Permissions & Page Visibility | Restricted Routes | Default Landing | Sidebar Navigation Items |
|---|---|---|---|---|
| `SYSTEM_ADMIN` | Exclusive access to System Administration (`/admin`). Controls multi-tenant boutiques, subscription plans, tenant suspension, and global metrics. | `/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/onboarding` | `/admin` | Admin Panel |
| `TENANT_OWNER` | Full operational control over boutique. Manages orders, CAD measurements, Karigar Kanban board, client directory, and staff recruitment. | `/admin`, `/onboarding` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production, Staff Management |
| `BRANCH_MANAGER` | Store-level operational control. Manages local client orders, workshop board, client measurements, and local staff assignments. | `/admin`, `/onboarding` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production, Staff Management |
| `MASTER_TAILOR` | Pattern cutting, CAD measurement entry, fitting trial comparisons, posture profiling, and workshop stage updates. | `/admin`, `/onboarding`, `/staff` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production |
| `RECEPTIONIST` | Front-desk client onboarding, customer directory search, order creation, advance deposit calculation, and WhatsApp quote dispatch. | `/admin`, `/onboarding`, `/staff` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production |
| `KARIGAR` | Workshop production board access, SAM time logging, stage task execution, and piece-rate earnings review. | `/admin`, `/onboarding`, `/staff` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production |
| `ACCOUNTANT` | Financial summary review, order booking values, 50% advance deposit verifications, and Karigar piece-rate payout ledgers. | `/admin`, `/onboarding`, `/staff` | `/dashboard` | Dashboard, Customers, Measurements, Orders, Production |

---

## 5. UI Aesthetic & Micro-Interaction Specifications

### 5.1 Color Palette & HSL Definitions
- **Background Baseline**: Slate 950 (`#0B0F19` / `hsl(222, 38%, 7%)`)
- **Gold Primary Palette**:
  - `--gold-400`: `#FACC15` (`hsl(48, 96%, 53%)`)
  - `--gold-500`: `#EAB308` (`hsl(45, 93%, 47%)`)
  - `--gold-600`: `#CA8A04` (`hsl(41, 96%, 40%)`)
- **Glassmorphism Containers**:
  - Standard Glass Card: `background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08);`
  - Gold Tinted Glass Card: `background: rgba(20, 30, 51, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(234, 179, 8, 0.25); shadow: 0 8px 32px rgba(234, 179, 8, 0.05);`

### 5.2 Micro-Interactions & Motion Design
- **Transitions**: Smooth bezier curves `cubic-bezier(0.4, 0, 0.2, 1)` on all interactive cards, buttons, and input borders (`transition-all duration-300`).
- **Pulsing Highlights**: Keyframe animation `pulse-gold` for active landmarks, announcement badges, and live operational status indicators (`animation: pulse-gold 2s ease-in-out infinite`).
- **SVG Hotspot Visuals**: Concentric radar pulse rings (`<circle>` elements animating radius from `r+4` to `r+20` and opacity from `0.8` to `0`), glowing laser crosshairs (`stroke="#38BDF8"` with SVG filter `#glow-cyan`), and color-coded status rings:
  - **Emerald Green (`#10B981`)**: Valid POM measurement.
  - **Amber Gold (`#F59E0B`)**: Focused input / posture adjustment alert.
  - **Rose Red (`#EF4444`)**: Validation error or anatomical sanity check violation.

### 5.3 Button Shapes, Badges & Tooltips
- **Primary Buttons (`.btn-gold`)**: Gradient `from-yellow-600 to-yellow-500`, text `slate-950 font-bold`, rounded `rounded-xl`, shadow `0 4px 14px rgba(234, 179, 8, 0.25)`. Hover effect: `brightness(1.1)`, `translateY(-1px)`.
- **Secondary Buttons (`.btn-ghost`)**: Border `slate-800`, text `slate-400 font-medium`, rounded `rounded-xl`. Hover effect: `text-white bg-slate-800/50 border-slate-700`.
- **Badge Styling**:
  - `badge-gold`: `bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`
  - `badge-emerald`: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
  - `badge-blue`: `bg-blue-500/10 text-blue-400 border border-blue-500/20`
  - `badge-amber`: `bg-amber-500/10 text-amber-400 border border-amber-500/20`
  - `badge-rose`: `bg-rose-500/10 text-rose-400 border border-rose-500/20`
- **Responsive Layout Limits**:
  - Desktop Sidebar: Fixed/sticky left navigation (`w-64`).
  - Mobile Overlay: Smooth slide-out menu (`translate-x-full` to `translate-x-0`).
  - Grid Form Factor: Adaptive breakpoints scaling from `grid-cols-1` (mobile) to `grid-cols-2` (tablet), `grid-cols-4` (desktop KPI grids), and `grid-cols-12` (measurement workspace).

---

## 6. End-to-End (E2E) User Flows

### Flow 1: Onboarding → Workspace Setup
1. User navigates to `/onboarding`.
2. Enters Boutique Name (e.g. "Savile Row Atelier"). Subdomain slug checker validates `savile-row-atelier.yellowhouse.app` in real-time.
3. Selects measurement templates (e.g. Men's Ethnic, Men's Western, Women's Ethnic, Women's Couture).
4. Fills Owner Account details (Name, Email, Password).
5. System provisions workspace, stores session in `localStorage` (`yh_auth_user`) and cookies (`jwt_token`, `x-tenant-id`), and presents success screen with direct link to `/dashboard`.

### Flow 2: Customer Intake → CAD Measurements Engine
1. User accesses `/customers` directory and clicks "Add Customer" (or selects existing client e.g. "Rajeshwar Malhotra").
2. Clicks "Open Measurements Engine", navigating to `/measurements`.
3. Selects garment (e.g. `Sherwani`), Fit Preference (`Slim`), and Unit (`Inches`).
4. Interacts with 2D SVG Mannequin: clicking landmark hotspots (e.g. `SH-01: Chest Girth`) focuses matching POM input with glowing laser crosshairs.
5. Configures Posture Modifiers: Shoulder Slope = `Sloped` (-0.5" offset), Chest Stance = `Normal`, Back Posture = `Stooped` (+0.75" back length).
6. Validates anatomical limits, clicks "Save Snapshot", storing version `v3.0` into `yh_measurement_snapshots`.

### Flow 3: Order Creation → Fabric & Swatch Allocation → WhatsApp Dispatch
1. User navigates to `/orders` and clicks "Create New Order".
2. Selects client ("Rajeshwar Malhotra") and target due date ("Aug 25, 2026").
3. Adds garment rows (Row 1: Sherwani 4.5m @ ₹28,000; Row 2: Churidar 2.5m @ ₹5,000).
4. Uploads or selects fabric swatch photo (e.g. "Crimson Silk Velvet") and lining photo ("Gold Zari Threads").
5. System automatically computes Total Order Amount (₹33,000) and 50% Mandatory Advance (₹16,500).
6. Clicks "Send Quotation via WhatsApp". Order is saved to `yh_orders`, a new Job Card is automatically dispatched to the Karigar Production Board under stage `Fabric Inspection`, and a success toast notification appears.

### Flow 4: Kanban Production Pipeline → Order Status Sync
1. Karigar or Master Tailor opens `/production`.
2. Locates Job Card `#JC-9021` in column `Fabric Inspection`.
3. Reviews fabric SKU, pattern notes, and SAM estimate (180 mins).
4. Clicks "Next Stage" arrow: Job Card transitions to `Master Cutting`. Progress bar updates to 35%.
5. System automatically synchronizes active order status in `yh_orders` to `CUTTING`.
6. Subsequent stage movements update order status to `IN_PRODUCTION` and `READY_FOR_DELIVERY` upon reaching final QC inspection column.

---

## 7. Edge Cases & Observed Behavior

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Onboarding Slug Checker | Entering special characters or space in subdomain slug (e.g. `Royal Atelier!`) | Automatically sanitizes string to lowercase hyphenated format (`royal-atelier`). Shows validation warning if length < 3 chars. |
| 2 | Empty Storage Safety | Loading `/dashboard`, `/customers`, `/orders`, or `/production` with clean `localStorage` | Gracefully initializes default state models without throwing runtime undefined exceptions. Empty state cards render "No records found" UI. |
| 3 | POM Validation Range | Inputting `15"` for Chest Girth (min allowed: `32"`) | Highlights input card with Rose Red border, displays alert icon, and disables "Save Snapshot" button until corrected. |
| 4 | Posture Gender Guard | Selecting Heel Height modifier while `selectedGender === 'Men'` | Heel height buttons are disabled (`opacity-30 cursor-not-allowed`) to maintain domain logic sanity. |
| 5 | Order Row Removal | Attempting to delete the last remaining garment row during Order Creation | Prevents removal; maintains minimum 1 garment item row to avoid zero-item corrupt orders. |
| 6 | Unsaved Order Navigation | Navigating away from Create Order tab after typing custom swatch specs | Form fields persist in React component state until tab switch or manual submission. |
| 7 | Job Deletion Audit Log | Deleting a Job Card on Kanban board | Opens deletion modal requiring mandatory audit note. Appends deletion log to `yh_deleted_jobs_log` in `localStorage`. |
| 8 | RBAC Page Guard | Non-admin user attempting to access `/admin` or `/staff` | Navigation link is filtered out of sidebar layout. Layout redirects unauthorized roles back to `/dashboard`. |

---

## 8. Verification & Audit Sign-Off

- **Compilation Check**: Static TypeScript verification (`npx tsc --noEmit`) passes cleanly with zero warnings across all routes in `apps/web/src/app`.
- **Runtime Exception Safety**: Empty local storage states, missing client profiles, and nested JSON properties are safely guarded across all pages.
- **Spec Completeness**: All features across R1, R2, and R3 are fully probed, enumerated, and documented.
