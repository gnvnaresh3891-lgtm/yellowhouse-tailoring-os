# Codebase Analysis Report: YellowHouse Tailoring OS

**Author**: `teamwork_preview_explorer_survey_1`  
**Date**: 2026-08-06  
**Scope**: Codebase Structure, Build/Dev Tooling, Dependency & Source File Inventory  
**Target Directory**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`

---

## 1. Executive Summary

The **YellowHouse Tailoring OS** workspace is structured as an **npm monorepo** consisting of two main application packages (`apps/api` for the NestJS backend and `apps/web` for the Next.js frontend), supported by PostgreSQL and Redis via Docker Compose.

The project currently contains foundational data models and basic UI pages, but requires implementation of the **Measurement Engine for Tailoring OS** as specified in `ORIGINAL_REQUEST.md` (R1: Dynamic Measurement Template & POM Engine with posture modifiers, R2: Interactive SVG 2D body landmark hotspot diagram, R3: Measurement Versioning & Fitting Delta comparison tracker).

---

## 2. Monorepo Topology & Directory Structure

```
C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
├── package.json                   # Root monorepo workspace definition
├── package-lock.json              # Monorepo lockfile
├── docker-compose.dev.yml         # Dev services: PostgreSQL 16 & Redis 7
├── node_modules/                  # Monorepo dependencies
├── apps/
│   ├── api/                       # NestJS Backend API (@yellowhouse/api)
│   │   ├── nest-cli.json          # NestJS CLI configuration
│   │   ├── package.json           # NestJS dependencies & scripts
│   │   ├── tsconfig.json          # TypeScript compiler options (ES2021, CommonJS, Decorators)
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Prisma schema (Tenant, Client, CustomerMeasurementVersion, Order, etc.)
│   │   └── src/
│   │       ├── main.ts            # Entry point (port 3001, CORS, ValidationPipe)
│   │       ├── app.module.ts      # NestJS root module with TenantMiddleware
│   │       ├── common/
│   │       │   └── middleware/
│   │       │       └── tenant.middleware.ts # Extracts x-tenant-id header (default fallback)
│   │       └── modules/
│   │           ├── prisma/
│   │           │   └── prisma.service.ts    # PrismaClient lifecycle provider
│   │           └── measurements/
│   │               ├── measurements.controller.ts # GET /measurements/templates, POST /measurements/fabric-yield
│   │               └── measurements.service.ts    # POM templates & fabric yield math formula
│   └── web/                       # Next.js 14 Frontend (@yellowhouse/web)
│       ├── package.json           # Next.js dependencies & scripts
│       ├── tsconfig.json          # TypeScript compiler options (ESNext, Bundler, @/* path alias)
│       ├── postcss.config.js      # PostCSS config (Tailwind, Autoprefixer)
│       ├── tailwind.config.js     # Tailwind CSS config (custom gold & slate color palettes)
│       ├── next-env.d.ts          # Next.js type declarations
│       └── src/
│           └── app/
│               ├── globals.css    # Global stylesheet & Tailwind directives
│               ├── layout.tsx     # Root HTML layout with dark mode class
│               └── page.tsx       # Main dashboard page ('use client') with 4 tabs
└── .agents/                       # Agent metadata & reports directory
```

---

## 3. Package Breakdown & Setup

### 3.1 Root Package (`package.json`)
- **Name**: `yellowhouse-monorepo`
- **Workspaces**: `apps/*`
- **Scripts**:
  - `"dev"`: `npm run dev --workspaces`
  - `"build"`: `npm run build --workspaces`
  - `"test"`: `npm run test --workspaces`

### 3.2 Backend API Package (`apps/api/package.json`)
- **Package Name**: `@yellowhouse/api`
- **Framework**: NestJS v10.0.0, TypeScript v5.0.0
- **Database / ORM**: Prisma v5.0.0, PostgreSQL 16
- **Key Dependencies**:
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`
  - `@nestjs/jwt`, `@nestjs/passport`, `bcryptjs` (Authentication)
  - `@prisma/client`
  - `class-transformer`, `class-validator`, `reflect-metadata`, `rxjs`
- **Dev Dependencies**: `@nestjs/cli`, `@nestjs/schematics`, `@types/express`, `@types/node`, `prisma`, `typescript`

### 3.3 Frontend Web Package (`apps/web/package.json`)
- **Package Name**: `@yellowhouse/web`
- **Framework**: Next.js 14.2.0 (App Router), React 18.3.0, TypeScript v5.0.0
- **Styling & UI**: Tailwind CSS v3.4.3, Lucide React (`lucide-react` v0.378.0), `clsx`, `tailwind-merge`
- **Dev Dependencies**: `@types/node`, `@types/react`, `@types/react-dom`, `autoprefixer`, `postcss`, `tailwindcss`, `typescript`

### 3.4 Database & Infrastructure (`docker-compose.dev.yml`)
- **PostgreSQL 16**: Port 5432 (`POSTGRES_DB=yellowhouse_db`, `POSTGRES_USER=yh_admin`, `POSTGRES_PASSWORD=yh_password_123`)
- **Redis 7**: Port 6379

---

## 4. Command Reference Table

| Environment / Action | Target Workspace | Command Line | Description |
|---|---|---|---|
| **Dev Server (All)** | Root monorepo | `npm run dev` | Runs dev servers for all workspace apps simultaneously |
| **Dev Server (Backend API)** | `apps/api` | `npm run dev -w apps/api` or `npm run dev` inside `apps/api` | Starts NestJS API with watch mode (`nest start --watch`) on `http://localhost:3001` |
| **Dev Server (Frontend Web)** | `apps/web` | `npm run dev -w apps/web` or `npm run dev` inside `apps/web` | Starts Next.js dev server (`next dev -p 3000`) on `http://localhost:3000` |
| **Build (All)** | Root monorepo | `npm run build` | Builds all monorepo apps (`dist` for API, `.next` for Web) |
| **Build (Backend API)** | `apps/api` | `npm run build -w apps/api` or `npm run build` inside `apps/api` | Compiles TypeScript using Nest CLI (`nest build`) to `apps/api/dist` |
| **Build (Frontend Web)** | `apps/web` | `npm run build -w apps/web` or `npm run build` inside `apps/web` | Builds Next.js production bundle (`next build`) |
| **Test (All)** | Root monorepo | `npm run test` | Executes workspace test scripts (Note: Test runners are not yet installed/configured) |
| **Type Check / Lint (API)** | `apps/api` | `npx tsc --noEmit` inside `apps/api` | Runs TypeScript static type checking for backend API |
| **Type Check / Lint (Web)** | `apps/web` | `npx tsc --noEmit` inside `apps/web` | Runs TypeScript static type checking for frontend web |
| **Prisma Generate** | `apps/api` | `npm run prisma:generate -w apps/api` | Generates Prisma Client JS bindings |
| **Prisma Migrate** | `apps/api` | `npm run prisma:migrate -w apps/api` | Applies dev migrations to PostgreSQL database |

*Note on Testing & Linting*: Currently, neither Vitest nor Jest is listed in package dependencies, and no `test` script is defined inside `apps/api/package.json` or `apps/web/package.json`. No ESLint config file (`.eslintrc`) is present. TypeScript compiler check (`tsc --noEmit`) acts as the primary type integrity validation.

---

## 5. Map of Existing Source Files & Roles

### 5.1 Backend Source Files (`apps/api/src/`)

1. **`src/main.ts`**
   - **Role**: Application bootstrap entry point.
   - **Functionality**: Creates NestJS Express application, enables CORS for all origins, applies global `ValidationPipe` with whitelist and transform settings, listens on `PORT` (or 3001).

2. **`src/app.module.ts`**
   - **Role**: Root module of NestJS API.
   - **Functionality**: Registers `ConfigModule.forRoot()`, imports `MeasurementsController`, provides `PrismaService` and `MeasurementsService`, registers `TenantMiddleware` for all routes.

3. **`src/common/middleware/tenant.middleware.ts`**
   - **Role**: Multi-tenant request isolation middleware.
   - **Functionality**: Inspects `x-tenant-id` HTTP header; defaults to `'default-tenant-id'` when absent to support single-tenant/development fallback.

4. **`src/modules/prisma/prisma.service.ts`**
   - **Role**: Database access provider wrapping `@prisma/client`.
   - **Functionality**: Manages database connection lifecycle (`$connect` on module init, `$disconnect` on module destroy).

5. **`src/modules/measurements/measurements.controller.ts`**
   - **Role**: REST API controller for measurements and fabric yield.
   - **Endpoints**:
     - `GET /measurements/templates` — Returns garment Point of Measure (POM) schemas.
     - `POST /measurements/fabric-yield` — Computes required fabric yardage based on width and shrinkage parameters.

6. **`src/modules/measurements/measurements.service.ts`**
   - **Role**: Business logic service for POM schemas and fabric yield formulas.
   - **Functionality**:
     - `getGarmentTemplates()`: Hardcoded baseline schemas for Men's Sherwani, Men's Bespoke Suit, Women's Sari Blouse, Women's Lehenga Choli.
     - `calculateFabricYield(input)`: Mathematical formula applying base consumption per width (44", 54", 60"), pattern repeat scaling, and 5% shrinkage factor.

7. **`prisma/schema.prisma`**
   - **Role**: Database entity relationship schema.
   - **Models**:
     - `Tenant`: Multi-tenant organization.
     - `Branch`: Multi-branch boutique location.
     - `User`: Tailor/Staff user roles (`TENANT_OWNER`, `BRANCH_MANAGER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`, `ACCOUNTANT`).
     - `Client`: Customer profile with `gender`, `preferredFit`, and `postureProfile` JSON (`shoulder_slope`, `chest_stance`).
     - `CustomerMeasurementVersion`: Measurement snapshot with version number, unit (`inch`/`cm`), `measurements` JSON, `easeAllowances` JSON, and `isActive` boolean.
     - `MeasurementTemplate`: System or tenant-level POM template with `pomSchema` JSON.
     - `Order` & `OrderItem`: Customer order with `appliedMeasurementSnapshot` JSON and `garmentConfiguration` JSON.
     - `JobCard` & `WorkerEarningsLedger`: SAM (Standard Allowed Minutes) worker tracking and payout calculations.
     - `OrderTrial`: Fitting trial record with `observedDeltas` JSON (`waist: -0.5`, `sleeve: +0.25`) and status.

### 5.2 Frontend Source Files (`apps/web/src/`)

1. **`src/app/layout.tsx`**
   - **Role**: Root HTML layout component.
   - **Functionality**: Applies `dark` class, renders global HTML/body frame, defines metadata ("Tailoring OS | Enterprise Custom Tailoring Platform").

2. **`src/app/globals.css`**
   - **Role**: Global CSS file.
   - **Functionality**: Imports `@tailwind base`, `@tailwind components`, `@tailwind utilities`, and sets up global styling variables.

3. **`src/app/page.tsx`**
   - **Role**: Primary single-page client dashboard (`'use client'`).
   - **Tabs**:
     - **Tab 1: Customer Measurement Engine** — Customer profile input, posture profile selection, and mock POM input form for Men's Sherwani/Suit and Women's Blouse/Lehenga.
     - **Tab 2: Fabric Yield Math** — Interactive yield calculation UI based on garment type and bolt width (44", 54", 60").
     - **Tab 3: Karigar Workshop Board** — Kanban workspace showing 4 stages (Cutting, Embroidery, Stitching, QC/RFD).
     - **Tab 4: WhatsApp Deposit Sender** — Interactive WhatsApp payment call-to-action preview.

---

## 6. Target Requirements Gap Analysis & Alignment

According to `ORIGINAL_REQUEST.md`, the requested Tailoring OS Measurement Engine requires:

| Requirement | Current State | Missing / Required Enhancements |
|---|---|---|
| **R1: Dynamic Measurement Template & POM Engine** | Basic static template arrays in API service and partial form inputs in UI page | Complete POM schemas for Men's (Suits, Sherwanis, Shirts, Trousers) & Women's (Sari Blouse, Lehenga Choli, Anarkali, Corset, Gown); dynamic formula-based ease allowance calculations & posture profile modifier logic |
| **R2: Visual Body Landmark Diagram & Interactivity** | None present in `apps/web/src/app/page.tsx` | Interactive 2D SVG body outline component with clickable landmark hotspots linked to POM inputs, highlighted active landmarks, and real-time visual validation feedback |
| **R3: Measurement Versioning & Fitting Delta Tracker** | Schema contains `CustomerMeasurementVersion` & `OrderTrial`, but UI is static mock | Version snapshot viewer & delta comparison UI (Target POM vs Observed Fitting Trial vs Alteration Delta) with immutable history tracking |

---

## 7. Conclusion & Next Steps

1. The repository is properly configured as an npm monorepo with NestJS backend (`apps/api`) and Next.js frontend (`apps/web`).
2. Build commands (`npm run build`), dev commands (`npm run dev`), type checking (`npx tsc --noEmit`), and Prisma commands are verified.
3. The next phase will require expanding the measurement data structures, implementing the interactive 2D SVG body landmark component, adding dynamic ease allowance/posture formula calculations, and building out the fitting delta comparison component.
