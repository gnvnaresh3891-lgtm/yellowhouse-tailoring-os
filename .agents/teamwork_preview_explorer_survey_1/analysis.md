# YellowHouse Tailoring OS — Comprehensive Codebase Survey & Technical Architecture Report

**Agent**: `teamwork_preview_explorer_survey_1`  
**Date**: August 7, 2026  
**Focus Area**: Codebase Architecture, Workspaces, Build Configuration, Routes, TypeScript Setup, Dependencies, and Compilation Warning/Error Sources (R1 Focus).

---

## Executive Summary

YellowHouse Tailoring OS is a multi-tenant atelier management monorepo designed for bespoke tailoring houses. The repository is structured as an NPM workspace containing a Next.js 14 App Router web client (`apps/web`) and a NestJS 10 backend API (`apps/api`) powered by Prisma ORM with PostgreSQL.

Our comprehensive read-only survey evaluated all workspace files, routes, components, math engines, API modules, schema definitions, build scripts, and test setups. The codebase is well-structured and feature-complete for atelier operations, but displays several build configuration gaps, test runner omissions, TypeScript strictness disparities, and client-side resilience vulnerabilities.

---

## 1. Monorepo Architecture & Workspace Structure

### 1.1 Root Monorepo Layout
```
yellowhouse/
├── apps/
│   ├── api/                   # NestJS 10 REST API backend
│   │   ├── prisma/            # Prisma ORM schema & seed scripts
│   │   ├── src/               # NestJS modules, controllers, services, DTOs
│   │   ├── tsconfig.json      # Backend TypeScript configuration
│   │   └── package.json       # Backend dependencies
│   └── web/                   # Next.js 14 App Router frontend
│       ├── src/
│       │   ├── app/           # App Router page & layout hierarchy
│       │   ├── components/    # Reusable React UI components
│       │   ├── context/       # React Context providers (MeasurementEngineContext)
│       │   ├── lib/           # Tailoring math engines, POM schemas, helpers
│       │   ├── types/         # Domain TypeScript interfaces
│       │   └── __tests__/     # Web unit test suite (6 test files)
│       ├── tsconfig.json      # Frontend TypeScript configuration
│       └── package.json       # Frontend dependencies
├── PROJECT.md                 # Domain specification & garment specifications
├── TEST_INFRA.md              # Test strategy & architectural guidelines
├── tsconfig.json              # Root TypeScript configuration
└── package.json               # Workspaces root package manifest
```

### 1.2 Tech Stack Summary
| Domain | Framework / Library | Version | Role |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `^14.2.3` | React SSG/SSR/CSR Routing |
| **UI Library** | React | `^18.3.1` | Component UI rendering |
| **Styling** | Tailwind CSS & Autoprefixer | `^3.4.3` | Custom Dark/Gold Atelier Glassmorphism Theme |
| **Icons** | Lucide React | `^0.378.0` | UI icon system |
| **Backend Framework**| NestJS Core & Common | `^10.0.0` | REST API framework |
| **Database & ORM** | Prisma ORM & Client | `^5.14.0` | PostgreSQL schema modeling & migrations |
| **Authentication** | JwtService & bcryptjs | `^10.2.0` / `^2.4.3` | JWT bearer token security & password hashing |
| **Validation** | class-validator & class-transformer | `^0.14.1` / `^0.5.1` | DTO payload transformation & input sanitization |

---

## 2. Frontend Navigation & App Router Hierarchy (`apps/web`)

The Next.js App Router hierarchy in `apps/web/src/app` provides a complete multi-tenant bespoke tailoring workspace.

### 2.1 Complete Route & Page Map

| Route Path | File Location | Line Count | Key Features & Responsibilities |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | 1,405 lines | Public landing page featuring interactive 2D CAD SVG mannequin viewer, Karigar fabric yield calculator, and mock anatomical landmark highlights. |
| `/onboarding` | `src/app/onboarding/page.tsx` | 591 lines | 3-step setup wizard checking slug availability via backend `/onboarding/check-slug/:slug` and submitting setup to `/onboarding/signup`. |
| `/(auth)/login` | `src/app/(auth)/login/page.tsx` | 416 lines | Session authentication page with quick demo profiles (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`, `SYSTEM_ADMIN`). |
| `/(auth)/register` | `src/app/(auth)/register/page.tsx` | 355 lines | Atelier signup form supporting 6 role levels with validation. |
| `/(dashboard)/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | 314 lines | Atelier control center displaying live order statistics, pipeline revenue metrics, and recent order status tables. |
| `/(dashboard)/measurements` | `src/app/(dashboard)/measurements/page.tsx` | 975 lines | Core 2D SVG silhouette workspace (`BodySilhouetteSvg`), POM schema controls, 4-axis posture modifiers, version comparison drawer, fitting trial delta calculator. |
| `/(dashboard)/orders` | `src/app/(dashboard)/orders/page.tsx` | 1,238 lines | Order engine with garment options, fabric & lining attachment previews, 50% advance calculations, automatic Kanban job card generation, WhatsApp quotation dispatch. |
| `/(dashboard)/production` | `src/app/(dashboard)/production/page.tsx` | 1,801 lines | 5-stage workshop Kanban board (`Fabric Inspection`, `Master Cutting`, `Zardozi/Aari Embroidery`, `Stitching Assembly`, `QC & Ready for Delivery`), SAM calculation, barcode/QR generator, storage rack assignment, printable Delivery Notes, Artisan Timesheets & Monthly Payout logs. |
| `/(dashboard)/customers` | `src/app/(dashboard)/customers/page.tsx` | 747 lines | Client directory with VIP toggle, detailed measurement profile drawer, customer creation modal. |
| `/(dashboard)/staff` | `src/app/(dashboard)/staff/page.tsx` | 422 lines | Tailoring specialist management, recruitment modal, system role assignment (`MASTER_TAILOR`, `KARIGAR`, etc.). |
| `/(dashboard)/admin` | `src/app/(dashboard)/admin/page.tsx` | 865 lines | Multi-tenant system admin console with tenant directory, KPI cards, subscription distribution, system health metrics. |

### 2.2 Dashboard Layout & RBAC Control (`apps/web/src/app/(dashboard)/layout.tsx`)
- Enforces active authentication session by reading `yh_auth_user` from `localStorage`.
- Dynamically filters navigation links based on user role:
  - `SYSTEM_ADMIN`: Accesses System Admin directory `/admin`.
  - `TENANT_OWNER` and `BRANCH_MANAGER`: Access Specialist Staff directory `/staff`.
  - All authenticated roles: Access Dashboard `/dashboard`, Measurements `/measurements`, Orders `/orders`, Production `/production`, and Customers `/customers`.

---

## 3. Tailoring Domain Engines & Helper Libraries

The domain logic is contained in `apps/web/src/lib` and `apps/web/src/context`:

1. **`MeasurementEngineContext.tsx`** (188 lines):
   React Context provider managing active POM schema items, client body measurements, fit preferences (`skinny`, `slim`, `regular`, `relaxed`), and 4-axis posture adjustments.
2. **`ease-calculator.ts`** (189 lines):
   Core math engine implementing:
   - `calculatePostureOffset()`: Evaluates posture adjustments for 4 anatomical axes:
     - **Shoulder Slope**: `sloped` (+0.375" armhole, -0.25" shoulder width), `very_sloped` (+0.625" armhole, -0.375" shoulder), `square` (-0.25" armhole, +0.25" shoulder).
     - **Back Curvature**: `stooped` (+0.50" back length, -0.25" front chest, +0.375" chest girth), `erect` (-0.375" back length, +0.25" front chest), `prominent_blade` (+0.50" across chest/shoulder).
     - **Abdomen Stance**: `prominent` (+1.00" waist girth, +0.50" crotch rise), `flat` (-0.50" waist girth, -0.25" crotch rise).
     - **Hip/Spine Stance**: `high_hip` (+0.50" hip girth, +0.25" trouser length), `sway_back` (-0.625" back length, -0.375" crotch rise).
   - `getFitPreferenceModifier()`: Returns ease deltas for `skinny` (-1.50" girth), `slim` (-0.75" girth), `regular` (0.00"), and `relaxed` (+1.25" girth).
   - `calculateDynamicEase()`: Combines net body measurement, base ease, fit preference modifier, posture offset, and fabric stretch reduction (`netBody * (stretch% / 100) * 0.5`).
3. **`fabric-yield.ts`** (105 lines):
   Computes fabric yardage requirements based on garment style base yields, composite size scale ratio ($K_{\text{scale}} = 0.6 \times K_{\text{length}} + 0.4 \times K_{\text{girth}}$), fabric bolt width factor ($44" / w$), panel count multipliers (1.45x for 24+ kalis), pattern repeat allowances, and fabric shrinkage percentages.
4. **`landmark-mappings.ts`** (804 lines):
   Contains `LANDMARK_DEFINITIONS` for 2D silhouette rendering, `evaluateAnatomicalProportions()` (evaluating chest-to-waist drop ratios), and `getPostureAlertTriggers()`.
5. **`pom-schemas.ts`** (869 lines):
   Defines standardized Points of Measure for 9 garment categories across Men's and Women's wear.

---

## 4. Backend API Architecture (`apps/api`)

The backend API is built using NestJS 10 with Prisma ORM.

### 4.1 Prisma Database Schema (`apps/api/prisma/schema.prisma`)
- `Tenant`: Multi-tenant isolation record (`id`, `name`, `slug`, `plan`, `status`).
- `Branch`: Boutique physical location (`id`, `tenantId`, `name`, `city`, `isPrimary`).
- `User`: Atelier user account (`id`, `tenantId`, `branchId`, `email`, `passwordHash`, `name`, `role`).
- `Client`: Customer profile (`id`, `tenantId`, `phone`, `firstName`, `lastName`, `gender`, `preferredFit`, `postureProfile`).
- `CustomerMeasurementVersion`: Immutable client measurement snapshot versioning (`id`, `clientId`, `versionNumber`, `measurements`, `easeAllowances`).
- `MeasurementTemplate`: Garment template schema definition (`id`, `tenantId`, `garmentName`, `gender`, `category`, `pomSchema`).
- `Order` & `OrderItem`: Order management with status tracking, advance payments, snapshot POMs, and garment configurations.
- `JobCard` & `WorkerEarningsLedger`: Workshop job card tracking with SAM (Standard Allowed Minutes) logging and artisan payout ledgers.
- `OrderTrial`: Fitting appointment trial records with observed measurement deltas.

### 4.2 API Modules & Services
- **`TenantMiddleware`**: Middleware extracting `x-tenant-id` header with fallback to `default-tenant-id` in development.
- **`OnboardingService`**: Handlers for `/onboarding/check-slug/:slug` (validating format against `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and reserved keywords) and `/onboarding/signup` (atomic `$transaction` creating Tenant, Branch, Owner User, and copying global measurement templates). Maps Prisma `P2002` duplicate errors to NestJS `ConflictException` (409).
- **`AuthService`**: Registration and login logic generating signed JWT tokens (`@nestjs/jwt`) with offline fallback modes.
- **`MeasurementsService`**: Exposes `/measurements/templates`, `/measurements/calculate-ease`, and `/measurements/fabric-yield` endpoints matching frontend math algorithms.

---

## 5. Build Configuration, TypeScript Setup & Code Quality Findings (R1 Focus)

During our thorough inspection, we identified the following configuration gaps and code quality areas:

### 5.1 Build & Test Infrastructure Gaps
1. **Missing Test Scripts in Sub-workspaces**:
   - The root `package.json` specifies: `"test": "npm run test --workspaces"`.
   - However, neither `apps/web/package.json` nor `apps/api/package.json` contains a `"test"` script entry. Running `npm run test` from the root fails because the workspaces lack the script target.
2. **Missing Test Runner Dependencies**:
   - `apps/web/src/__tests__/` contains 6 comprehensive test files (`ease-calculator.test.ts`, `landmark-validation.test.ts`, `measurement-context.test.ts`, `onboarding-stress.test.ts`, `pom-schemas.test.ts`, `posture-engine.test.ts`).
   - `apps/api/src/__tests__/` contains 1 standalone test file (`signup-dto-adversarial.test.ts`).
   - However, neither `vitest` nor `@types/jest` is installed in `apps/web/package.json` or `apps/api/package.json`.

### 5.2 TypeScript Strictness Disparity
- `apps/web/tsconfig.json` enforces strict type checking:
  ```json
  "strict": true
  ```
- `apps/api/tsconfig.json` has loose type checking:
  ```json
  "strictNullChecks": false,
  "noImplicitAny": false,
  "forceConsistentCasingInFileNames": false
  ```
  *Impact*: Backend services do not catch potential `null`/`undefined` runtime errors at compile time, leading to type safety inconsistencies across the monorepo.

### 5.3 Dead / Legacy Code
- `apps/web/src/components/SidebarLayout.tsx` (146 lines):
  This is a legacy sidebar component containing outdated links (e.g., `href="/"` pointing to the home page instead of `/dashboard`). It is completely bypassed by the active dashboard layout `apps/web/src/app/(dashboard)/layout.tsx`.

### 5.4 Client-Side LocalStorage Safety & Resilience
- Components in `apps/web/src/app/(dashboard)` rely heavily on `localStorage` (`yh_auth_user`, `yh_orders`, `yh_production_jobs`, `yh_customers`, `yh_measurements_current`).
- While `typeof window !== 'undefined'` checks are present, several parsing locations lack `try/catch` blocks or default fallbacks when reading JSON. Corrupted or invalid data in `localStorage` could lead to unhandled runtime exceptions.

### 5.5 Monolithic Page Components
- `apps/web/src/app/page.tsx` (1,405 lines) and `apps/web/src/app/(dashboard)/production/page.tsx` (1,801 lines) are large monolithic files mixing UI rendering, state management, modal logic, and math calculations. Splitting them into smaller, modular sub-components will improve readability and maintainability.

---

## 6. Summary of Workspace Verification

| Verification Target | Command / Path | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Web Type Check** | `npx tsc --noEmit` in `apps/web` | Clean | Frontend compiles without TypeScript errors. |
| **API Type Check** | `npx tsc --noEmit` in `apps/api` | Clean | Backend compiles without TypeScript errors. |
| **Standalone API Test** | `npx ts-node apps/api/src/__tests__/signup-dto-adversarial.test.ts` | 13/13 Passed | Adversarial signup DTO and P2002 error handling tests pass. |
| **Web Unit Tests** | `apps/web/src/__tests__/*.test.ts` | Ready | 6 test files present; requires Vitest setup. |

---

## 7. Recommended Next Steps for Implementation Team

1. **Add Workspace Test Scripts & Vitest**:
   - Add `"test": "vitest run"` or `"test": "ts-node ..."` to `apps/web/package.json` and `apps/api/package.json`.
2. **Align TypeScript Strictness**:
   - Enable `"strict": true`, `"strictNullChecks": true`, and `"noImplicitAny": true` in `apps/api/tsconfig.json`.
3. **Clean Up Dead Code**:
   - Deprecate or remove `apps/web/src/components/SidebarLayout.tsx`.
4. **Harden LocalStorage Operations**:
   - Wrap all `localStorage.getItem` and `JSON.parse` operations in robust try-catch helpers with typed default fallback states.
