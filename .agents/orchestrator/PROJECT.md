# Project: YellowHouse Tailoring OS

## Architecture
- **Monorepo Structure**: `npm` workspaces with `apps/web` (Next.js 14 App Router, React 18, TypeScript, Tailwind CSS) and `apps/api` (NestJS 10, Prisma ORM, PostgreSQL/SQLite).
- **State & Data Flow**:
  - Web UI pages: `/onboarding`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/admin`.
  - Local Storage Persistence Layer: `yh_auth_user`, `yh_customers`, `yh_measurements_current`, `yh_measurement_snapshots`, `yh_orders`, `yh_production_jobs`.
  - Local Storage Access Safety: Safe local storage wrapper helper with try/catch fallback to empty states for zero runtime errors on empty local storage.
  - Kanban Stage Synchronization: Bidirectional synchronization between 5-stage Kanban board (`yh_production_jobs`) and active orders (`yh_orders`).
  - Business Calculation Engines: Dynamic Standard Allowed Minutes (SAM) calculator and Bespoke Order Pricing calculator.
- **Testing & Verification**:
  - `apps/web/package.json` & `apps/api/package.json` equipped with `"test"` npm scripts.
  - Automated unit and integration test suites covering business rules, state persistence, RBAC route visibility, and empty local storage safety.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | TypeScript & Build Warning Audit | Remove dead code, unused imports, fix TS compilation errors across all pages & layouts | M1 | ORIGINAL_REQUEST R1 |
| 2 | Safe LocalStorage Helpers & Null Checks | Safe accessor utility for local storage reads/writes to prevent runtime exceptions on empty storage | M1 | ORIGINAL_REQUEST R1 |
| 3 | Package Test Infrastructure Setup | Add runnable `"test"` npm scripts to `apps/web/package.json` and `apps/api/package.json` | M1 | ORIGINAL_REQUEST R4 |
| 4 | Onboarding Form Draft Autosave | Dynamic draft persistence for multi-step atelier onboarding inputs into `yh_auth_user` / `yh_onboarding_draft` | M2 | ORIGINAL_REQUEST R2 |
| 5 | Customer Directory Draft Persistence | Persist new customer additions/edits dynamically to `yh_customers` local storage | M2 | ORIGINAL_REQUEST R2 |
| 6 | Staff Management Draft Persistence | Persist staff recruitment additions/edits dynamically to `yh_staff` local storage | M2 | ORIGINAL_REQUEST R2 |
| 7 | Order Form Draft Autosave | Persist order item inputs, swatches, and client details dynamically to `yh_orders_draft` local storage | M2 | ORIGINAL_REQUEST R2 |
| 8 | Empty Storage Resilience & Fallbacks | Guarantee zero runtime exceptions when navigating between routes or loading pages with empty local storage | M2 | ORIGINAL_REQUEST R1, R2 |
| 9 | Dynamic SAM Calculation Engine | Dynamic Standard Allowed Minutes calculation engine based on garment category complexity and posture modifiers | M3 | ORIGINAL_REQUEST R2, R4 |
| 10 | Dynamic Bespoke Order Pricing Engine | Dynamic pricing calculation combining fabric yield, cost per meter, tailoring labor, and embroidery surcharges | M3 | ORIGINAL_REQUEST R2, R4 |
| 11 | Kanban Drag-and-Drop & Stage Buttons | Implement HTML5 drag-and-drop event handlers and stage movement buttons on Kanban production board | M3 | ORIGINAL_REQUEST R2 |
| 12 | Kanban-to-Order State Sync | Synchronize Kanban stage changes (`yh_production_jobs`) back to active order status (`yh_orders`) in local storage | M3 | ORIGINAL_REQUEST R2 |
| 13 | Premium UI Aesthetics & Micro-Interactions | Refine HSL gold theme, glassmorphic cards, tooltips, responsive grid limits, and SVG hotspot animations | M4 | ORIGINAL_REQUEST R3 |
| 14 | RBAC Page Visibility & Router Safety | Enforce and verify role-based route visibility and navigation permissions across all 7 user roles | M4 | ORIGINAL_REQUEST R2, R4 |
| 15 | Business Logic Unit Test Suite | Comprehensive unit tests for SAM calculation, order pricing, posture modifiers, and ease formulas | M4 | ORIGINAL_REQUEST R4 |
| 16 | Integration & State Persistence Tests | Programmatic integration tests verifying form persistence, empty local storage load safety, and Kanban stage sync | M4 | ORIGINAL_REQUEST R4 |
| 17 | Production Build & Pipeline Verification | Verify `npm run build` and `npm test` execute cleanly with 100% passing tests and zero compilation warnings | M4 | ORIGINAL_REQUEST Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Audit, LocalStorage Safety & Test Infra | Clean up TypeScript errors, unused imports, safe local storage accessor, and wire up workspace `"test"` scripts | none | DONE |
| M2 | Form Draft Autosave & LocalStorage State Persistence | Dynamic local storage persistence for Onboarding, Customer Directory, Staff Recruitment, and Order Creation drafts with empty-state safety | M1 | DONE |
| M3 | Business Rules Engines & Kanban-to-Order State Sync | Dynamic SAM calculation, bespoke order pricing engine, HTML5 drag-and-drop Kanban board, and bidirectional order status sync | M1, M2 | IN_PROGRESS |
| M4 | Premium UI Polish, RBAC Verification & Automated Test Suite | Vibrant HSL aesthetics, glassmorphism, tooltips, RBAC route visibility rules, unit/integration test suites, build & audit verification | M1, M2, M3 | PLANNED |

---

## Code Layout
```
apps/
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── __tests__/
│       │   └── signup-dto-adversarial.test.ts
│       └── modules/
└── web/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── onboarding/
        │   │   └── page.tsx
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── (dashboard)/
        │       ├── layout.tsx
        │       ├── dashboard/page.tsx
        │       ├── customers/page.tsx
        │       ├── measurements/page.tsx
        │       ├── orders/page.tsx
        │       ├── production/page.tsx
        │       ├── staff/page.tsx
        │       └── admin/page.tsx
        ├── components/
        ├── lib/
        │   ├── storage-utils.ts
        │   ├── sam-calculator.ts
        │   ├── pricing-calculator.ts
        │   ├── ease-calculator.ts
        │   └── posture-engine.ts
        └── __tests__/
            ├── storage-utils.test.ts
            ├── sam-calculator.test.ts
            ├── pricing-calculator.test.ts
            ├── state-sync.test.ts
            └── rbac-visibility.test.ts
```
