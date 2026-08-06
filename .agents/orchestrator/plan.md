# YellowHouse Tailoring OS — Orchestration Plan

## Objectives
1. Map and survey the existing codebase structure (Next.js app, API service, DB models, schema migrations, existing measurement engine, auth, tenant routing, and tests).
2. Complete E2E Multi-Tenant Onboarding & Seeding Flow (R1).
3. Complete Role-Based Authentication (RBAC) & JWT Setup (R2).
4. Complete Global System Admin Dashboard (R3).
5. Complete Order-to-Delivery E2E Integration (R4).
6. Verify clean builds (`npx next build` and `npm run build` in API) and clean test suite execution.
7. Ensure audit verification (CLEAN) by teamwork_preview_auditor.
8. Claim final victory and report to Sentinel.

## Phased Approach

### Phase 0: Survey & Scope Mapping
- Dispatch 3 parallel Explorers / Spec Miners:
  1. `explorer_1`: Frontend & Next.js App structure (onboarding, auth UI, admin dashboard, measurement engine UI, layout headers).
  2. `explorer_2`: Backend API structure (auth controllers, tenant models/migrations, seeding endpoints, JWT middleware, RBAC guards).
  3. `spec_miner_1`: Existing tests, build configurations (`npx next build`, `npm run build`), package.json dependencies, environment configs, database setup/Prisma/ORM.

### Phase 1: Milestone Decomposition & Interface Definition
- Aggregate Explorer findings into `PROJECT.md`.
- Define milestones M1-M4 with clear contracts, acceptance criteria, and explicit code file ownership boundaries.

### Phase 2: Execution & Verification Loop
- For each milestone:
  - Explorer finds technical strategy.
  - Worker implements changes and executes build/test checks.
  - Reviewer (2x) verifies logic, security, layout compliance, and tests.
  - Challenger (2x) performs empirical validation.
  - Auditor (1x) checks integrity (HARD BINARY VETO).
  - Gate evaluation.

### Phase 3: Global Integration & Final Build/Audit Gate
- Run full build across all packages.
- Run complete E2E test suite.
- Run final Forensic Audit.
- Send final victory report to Sentinel.
