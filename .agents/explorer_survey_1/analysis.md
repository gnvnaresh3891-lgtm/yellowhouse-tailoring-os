# Frontend Architecture Survey & R1–R4 Implementation Gap Analysis

**Agent:** `explorer_survey_1` (Frontend Explorer)  
**Date:** 2026-08-06  
**Target Application:** YellowHouse Tailoring OS (`apps/web` & `apps/api`)  
**Workspace Root:** `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`

---

## 1. Executive Summary

YellowHouse Tailoring OS is designed as a multi-tenant SaaS platform for bespoke tailoring ateliers. The frontend (`apps/web`) is built with **Next.js 14 App Router**, **React 18**, **TypeScript**, and **Tailwind CSS**.

While core interactive measurement features (2D SVG body outline, POM schemas, posture modifiers, fitting delta comparison) and workshop tracking (5-stage Karigar Kanban board) exist as high-fidelity UI page mockups, **the multi-tenant platform baseline (R1, R2, R3) and E2E system integration (R4) are currently unimplemented or disconnected**.

---

## 2. Directory & Route Inventory (`apps/web`)

### Existing File & Route Map

| Route / Path | File Location | Purpose & Component Structure | Implementation Status |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/(dashboard)/page.tsx` | **Tenant Atelier Dashboard**: 4 KPI cards (Active Orders, SAM Payout, Fitting SLA, WhatsApp Deposits), Recent Orders table, Production Stage distribution bars. | UI Mock (Static data array) |
| `/customers` | `src/app/(dashboard)/customers/page.tsx` | **Customer Directory**: Client list, search filter, gender filter, VIP filter, Add Customer modal, Customer details drawer. | Local React State (`useState`) |
| `/measurements` | `src/app/(dashboard)/measurements/page.tsx` | **Measurement Engine Workspace**: 6 Garment POM Schemas, 2D Interactive SVG body diagram (Front/Back for Men/Women), clickable landmark hotspots, posture profile modifiers, version history sidebar, fitting trial delta tracker. | Local React State (`useState`) |
| `/production` | `src/app/(dashboard)/production/page.tsx` | **Karigar Workshop Kanban Board**: 5-stage pipeline (`Fabric Inspection` -> `Master Cutting` -> `Zardozi/Aari Embroidery` -> `Stitching Assembly` -> `QC & Ready for Delivery`), SAM minutes tracking, stage shift controls (`<-`, `->`), Job Card detail modal. | Local React State (`useState`) |
| Layout (Root) | `src/app/layout.tsx` | Root HTML container, Tailwind CSS setup (`dark` mode class), global metadata. | Functional |
| Layout (Dashboard) | `src/app/(dashboard)/layout.tsx` | Sticky Sidebar (Logo, links to `/`, `/customers`, `/measurements`, `/production`), Header Bar (Search input, notification alert, hardcoded user "Master Latif"). | Partial (Hardcoded user & nav) |
| Component | `src/components/SidebarLayout.tsx` | Legacy/alternative sidebar layout component. | Duplicate/Standalone |

---

## 3. Requirement-by-Requirement Implementation Analysis

### R1. Multi-Tenant Onboarding UI
* **Requirement Baseline**: Workspace onboarding allowing boutique owners to sign up, validate custom tenant slug availability, select standard measurement templates (Men's, Women's, Custom) for database seeding, and create owner credentials.
* **Current Status**: 🔴 **0% Implemented (MISSING)**
* **Observations**:
  - No onboarding page route (`/onboarding` or `/signup`) exists under `apps/web/src/app`.
  - Backend schema (`apps/api/prisma/schema.prisma:10-23`) defines `Tenant` and `MeasurementTemplate` models, but no API endpoints or frontend forms exist to seed or validate tenant slugs.
  - No slug availability checking mechanism (real-time debounce validation).
  - No template selection checklist UI (Men's Suits/Sherwanis, Women's Blouses/Lehengas).

---

### R2. Role-Based Authentication UI (RBAC & JWT Setup)
* **Requirement Baseline**: Login and Registration views, role-based view restrictions (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), secure JWT session handling, and dynamic tenant context persistence in the Next.js header.
* **Current Status**: 🔴 **0% Implemented (MISSING)**
* **Observations**:
  - No `/login` or `/register` route pages.
  - `(dashboard)/layout.tsx:115-118, 166-168` and `SidebarLayout.tsx:88-90` hardcode user profile to `"Master Latif"` / `"Head Atelier Master"` with initial badge `"MT"`.
  - No JWT token storage, cookie management, or auth headers sent to backend.
  - `apps/api/src/common/middleware/tenant.middleware.ts:14-18` falls back to `'default-tenant-id'` when `x-tenant-id` header is absent.
  - No RBAC permission guards or navigation items filtered by user role.
  - No dynamic tenant selector or active tenant indicator in the Next.js top header.

---

### R3. Global System Admin Dashboard UI
* **Requirement Baseline**: Control panel for global system administrators providing statistics on active boutique tenants, global revenue flow, subscription plan tiers (Starter, Pro, Enterprise), status toggles (Active / Suspended), and system health metrics.
* **Current Status**: 🔴 **0% Implemented (MISSING)**
* **Observations**:
  - Existing `/` route (`(dashboard)/page.tsx`) is a **Tenant Atelier Dashboard** focused on boutique shop floor ops (Recent Orders, Karigar payouts, active jobs).
  - No `/admin` or `/super-admin` route exists.
  - No global tenant directory table showing multi-tenant accounts, subscription tiers, or suspend/activate controls.
  - No system health indicators (API status, DB latency, active sessions).

---

### R4. Order-to-Delivery E2E Integration Flow
* **Requirement Baseline**: Connected lifecycle flow: Tenant Signup -> Client Onboarding -> Order Creation -> Measurement Snapshot -> Production Cutting/Stitching/QC -> Delivery.
* **Current Status**: 🟡 **30% Implemented (Disjointed UI Mocks)**
* **Observations**:
  - **Client Onboarding**: Implemented in `/customers` via local state (`initialCustomers` array), but not saved to backend API or shared with Order creation.
  - **Measurement Engine**: Implemented in `/measurements` with interactive SVG landmarks and POM schema validation, but measurements are strictly local component state and cannot be attached to an Order or Client.
  - **Order Creation**: Missing. Clicking "+ New Order" in `(dashboard)/page.tsx:129` is an unhandled button with no modal or page route.
  - **Production Pipeline**: Implemented in `/production` with a 5-stage Kanban board (`Fabric Inspection`, `Master Cutting`, `Zardozi/Aari Embroidery`, `Stitching Assembly`, `QC & Ready for Delivery`), but job cards are hardcoded (`INITIAL_JOB_CARDS`) and disconnected from actual Orders.
  - **Delivery Transition**: No action connects QC completion to order fulfillment or customer notification.

---

## 4. Frontend-Backend Contract Gaps

| Entity / Flow | Backend Prisma Model (`schema.prisma`) | Backend Controller/Service (`apps/api/src`) | Frontend Integration (`apps/web/src`) | Gap Description |
| :--- | :--- | :--- | :--- | :--- |
| **Tenant Onboarding** | `Tenant`, `Branch`, `MeasurementTemplate` | ❌ None | ❌ No route | Missing `/onboarding` route and `/api/tenants` controller. |
| **Authentication & RBAC** | `User` (roles: `TENANT_OWNER`, `RECEPTIONIST`, etc.) | ❌ None | ❌ No route / context | Missing `/login`, JWT handler, `AuthContext`, and NestJS Auth module. |
| **Client Management** | `Client` | ❌ None | ⚠️ `/customers` (local state) | `/customers` page needs API integration (`/api/clients`). |
| **Measurement Versioning** | `CustomerMeasurementVersion` | `MeasurementsController` (calculates ease/yield) | ⚠️ `/measurements` (local state) | `/measurements` needs to fetch schema and save snapshots via API. |
| **Order & Job Cards** | `Order`, `OrderItem`, `JobCard` | ❌ None | ⚠️ `/production` (local state) | Missing Order creation UI and `/api/orders` / `/api/job-cards` API. |
| **System Admin** | `Tenant` (plan, status) | ❌ None | ❌ No route | Missing `/admin` page and `/api/admin` controller. |

---

## 5. Architectural Recommendations for Implementation

To complete R1–R4 and achieve production readiness:

1. **State & Auth Infrastructure**:
   - Create `AuthContext` and `TenantContext` in `apps/web/src/context/` to manage JWT tokens, current user role, and active tenant slug.
   - Implement Next.js Middleware (`apps/web/src/middleware.ts`) for route protection (blocking unauthenticated access to `(dashboard)/*` and restricting `/admin/*` to global superadmins).

2. **New Page Routes Required**:
   - `apps/web/src/app/onboarding/page.tsx`: Multi-step form for tenant registration, slug validation, template seeding checkboxes, and owner account setup.
   - `apps/web/src/app/login/page.tsx`: Login view with role selection / auto-detection.
   - `apps/web/src/app/admin/page.tsx`: Global System Admin Panel displaying tenant stats, subscription tiers, status toggles, and system health metrics.

3. **E2E Flow Integration**:
   - Create an **Order Creation Modal / Page** (`/orders/new` or modal in dashboard) linking Client selection -> Garment selection -> Measurement Snapshot -> Job Card dispatch.
   - Wire `/customers`, `/measurements`, and `/production` to consume shared state / API calls.
