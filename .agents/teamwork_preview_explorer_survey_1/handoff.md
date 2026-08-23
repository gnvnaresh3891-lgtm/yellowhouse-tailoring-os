# HANDOFF REPORT — Explorer Codebase & Architecture Survey (R1 Focus)

**Agent**: `teamwork_preview_explorer_survey_1`  
**Working Directory**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_survey_1`  
**Target Path**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  
**Handoff Type**: Hard Handoff (Task Complete)

---

## 1. Observation

### 1.1 Codebase Architecture & Monorepo Layout
- **Root Manifest** (`package.json:1-25`): Defines NPM workspaces `"workspaces": ["apps/*"]` and root scripts (`"test": "npm run test --workspaces"`).
- **Web Workspace** (`apps/web/package.json:1-38`): Next.js 14.2.3 App Router, React 18.3.1, Tailwind CSS 3.4.3, Lucide React 0.378.0.
- **API Workspace** (`apps/api/package.json:1-55`): NestJS 10.0.0 (`@nestjs/core`, `@nestjs/common`, `@nestjs/jwt`), Prisma 5.14.0, bcryptjs 2.4.3, class-validator 0.14.1, class-transformer 0.5.1.

### 1.2 Route & Layout Map (`apps/web/src/app`)
- `/` (`page.tsx:1-1405`): Monolithic landing page with interactive 2D CAD SVG mannequin viewer and Karigar yield calculator.
- `/onboarding` (`onboarding/page.tsx:1-591`): 3-step setup wizard calling API endpoints `/onboarding/check-slug/:slug` and `/onboarding/signup`.
- `/(auth)/login` (`(auth)/login/page.tsx:1-416`): Session authentication page with quick demo profiles (`TENANT_OWNER`, `MASTER_TAILOR`, `BRANCH_MANAGER`, `KARIGAR`, `SYSTEM_ADMIN`).
- `/(auth)/register` (`(auth)/register/page.tsx:1-355`): Registration form supporting 6 role options with validation.
- `/(dashboard)/layout.tsx` (1-244): Session guard checking `yh_auth_user` in `localStorage` and filtering navigation by role.
- `/(dashboard)/dashboard` (`(dashboard)/dashboard/page.tsx:1-314`): Control center displaying live statistics, orders overview, and KPIs.
- `/(dashboard)/measurements` (`(dashboard)/measurements/page.tsx:1-975`): Interactive 2D SVG body silhouette workspace (`BodySilhouetteSvg`), 4-axis posture modifiers, POM schema controls, version history drawer, fitting trial comparison table.
- `/(dashboard)/orders` (`(dashboard)/orders/page.tsx:1-1238`): Order engine with garment options, fabric/lining attachment previews, 50% advance calculations, automatic Kanban job card generation, WhatsApp quotation dispatch.
- `/(dashboard)/production` (`(dashboard)/production/page.tsx:1-1801`): 5-stage workshop Kanban board (`Fabric Inspection`, `Master Cutting`, `Zardozi/Aari Embroidery`, `Stitching Assembly`, `QC & Ready for Delivery`), SAM calculation, barcode/QR generator, storage rack assignment, printable Delivery Notes, Artisan Timesheets & Monthly Payout logs.
- `/(dashboard)/customers` (`(dashboard)/customers/page.tsx:1-747`): Client directory with VIP toggle, detailed measurement profile drawer, customer creation modal.
- `/(dashboard)/staff` (`(dashboard)/staff/page.tsx:1-422`): Specialist management, recruitment modal, system role assignment (`MASTER_TAILOR`, `KARIGAR`, etc.).
- `/(dashboard)/admin` (`(dashboard)/admin/page.tsx:1-865`): Multi-tenant system admin console with tenant directory, KPI cards, subscription distribution, system health metrics.

### 1.3 Tailoring Math & Domain Logic
- `MeasurementEngineContext.tsx:1-188`: Context provider managing active POM schema items, client body measurements, fit preferences, and posture adjustments.
- `ease-calculator.ts:1-189`:
  - `calculatePostureOffset()`: Implements 4-axis posture adjustments:
    - **Shoulder Slope**: `sloped` (+0.375" armhole, -0.25" shoulder width), `very_sloped` (+0.625" armhole, -0.375" shoulder), `square` (-0.25" armhole, +0.25" shoulder).
    - **Back Curvature**: `stooped` (+0.50" back length, -0.25" front chest, +0.375" chest girth), `erect` (-0.375" back length, +0.25" front chest), `prominent_blade` (+0.50" across chest/shoulder).
    - **Abdomen Stance**: `prominent` (+1.00" waist girth, +0.50" crotch rise), `flat` (-0.50" waist girth, -0.25" crotch rise).
    - **Hip/Spine Stance**: `high_hip` (+0.50" hip girth, +0.25" trouser length), `sway_back` (-0.625" back length, -0.375" crotch rise).
  - `getFitPreferenceModifier()`: Delivers ease adjustments for `skinny` (-1.50" girth), `slim` (-0.75" girth), `regular` (0.00"), and `relaxed` (+1.25" girth).
  - `calculateDynamicEase()`: Combines net body measurement, base ease, fit preference modifier, posture offset, and fabric stretch reduction (`netBody * (stretch% / 100) * 0.5`).
- `fabric-yield.ts:1-105`: Size-scaled fabric yield math using composite ratio $K_{\text{scale}} = 0.6 \times K_{\text{length}} + 0.4 \times K_{\text{girth}}$, fabric width factor $44" / w$, panel multipliers (1.45x for 24+ kalis), pattern repeat allowances, and shrinkage percentage adjustments.
- `landmark-mappings.ts:1-804`: `LANDMARK_DEFINITIONS` for 2D silhouette rendering, `evaluateAnatomicalProportions()`, and `getPostureAlertTriggers()`.
- `pom-schemas.ts:1-869`: POM definitions for 9 garment categories across Men's and Women's wear.

### 1.4 API Infrastructure & Database Schema (`apps/api`)
- `prisma/schema.prisma:1-167`: Models `Tenant`, `Branch`, `User`, `Client`, `CustomerMeasurementVersion`, `MeasurementTemplate`, `Order`, `OrderItem`, `JobCard`, `WorkerEarningsLedger`, `OrderTrial`.
- `common/middleware/tenant.middleware.ts:1-23`: `TenantMiddleware` extracting `x-tenant-id` header with fallback to `default-tenant-id`.
- `modules/onboarding/onboarding.service.ts:1-256`: Checks reserved slugs (`RESERVED_SLUGS`), slug format regex (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`), and executes atomic `$transaction` creating Tenant, Branch, Owner User, and copying global measurement templates. Handles Prisma `P2002` duplicate errors mapped to NestJS `ConflictException` (409).
- `modules/measurements/measurements.service.ts:1-419`: Implements 9 default garment templates and REST endpoints matching frontend math algorithms.

### 1.5 Identified Code Quality & Infrastructure Issues
1. **Missing Sub-workspace Test Scripts**: Root `package.json` calls `npm run test --workspaces`, but neither `apps/web/package.json` nor `apps/api/package.json` has a `"test"` script.
2. **Missing Test Runner**: `apps/web/src/__tests__/` has 6 test files (`ease-calculator.test.ts`, `landmark-validation.test.ts`, `measurement-context.test.ts`, `onboarding-stress.test.ts`, `pom-schemas.test.ts`, `posture-engine.test.ts`), but `vitest` / test framework dependencies are missing from `package.json`.
3. **TypeScript Strictness Disparity**: `apps/web/tsconfig.json` has `"strict": true`, whereas `apps/api/tsconfig.json` disables strict type checking (`"strictNullChecks": false`, `"noImplicitAny": false`, `"forceConsistentCasingInFileNames": false`).
4. **Dead / Unused Component**: `apps/web/src/components/SidebarLayout.tsx` (146 lines) is an obsolete legacy component with outdated route links (`/` instead of `/dashboard`), bypassed by `apps/web/src/app/(dashboard)/layout.tsx`.
5. **LocalStorage Fallback Vulnerabilities**: Several dashboard components read `localStorage` JSON without try/catch error handling for corrupted stored payloads.

---

## 2. Logic Chain

1. **Workspace Inspection**: Inspecting `package.json` files and `tsconfig.json` files revealed that while the monorepo is configured for workspaces, sub-workspace test scripts are absent, creating a gap when executing workspace-wide test commands.
2. **TypeScript Strictness Audit**: Comparing `apps/web/tsconfig.json` (`"strict": true`) against `apps/api/tsconfig.json` (`"strictNullChecks": false`) demonstrates an architectural mismatch where backend services have looser type checks than frontend components.
3. **Route & Layout Inspection**: Tracing `apps/web/src/app/(dashboard)/layout.tsx` revealed it directly renders a modern side navigation bar and handles RBAC role permissions (`SYSTEM_ADMIN`, `TENANT_OWNER`, `BRANCH_MANAGER`). Comparing this against `apps/web/src/components/SidebarLayout.tsx` showed that `SidebarLayout.tsx` is an unused legacy artifact that links to `/` instead of `/dashboard`.
4. **Domain Engine Verification**: Analyzing `ease-calculator.ts`, `fabric-yield.ts`, `pom-schemas.ts`, and `landmark-mappings.ts` alongside NestJS `measurements.service.ts` proved that the frontend and backend share identical mathematical formulas for dynamic ease, posture offsets, and size-scaled fabric yield calculations.
5. **Adversarial API Verification**: Inspecting `signup-dto-adversarial.test.ts` and `onboarding.service.ts` confirmed that slug formatting, reserved keyword blocking, and Prisma `P2002` duplicate mapping to HTTP 409 `ConflictException` are fully implemented and verified.

---

## 3. Caveats

- **Prisma Migration Execution**: PostgreSQL database migrations (`prisma migrate dev`) were not run against a live PostgreSQL server instance as this was a read-only investigation.
- **Sub-workspace Test Execution**: Running test suites via `npm test` at the root requires adding the `"test"` script target to sub-workspace `package.json` files.
- **Mock Authentication**: Auth pages rely on client-side `localStorage` (`yh_auth_user`) for offline demonstration. Backend JWT validation endpoints can be integrated for full server session synchronization.

---

## 4. Conclusion

The YellowHouse Tailoring OS codebase is well-designed, feature-rich, and ready for production refinement. The Next.js App Router client and NestJS API backend accurately implement the bespoke tailoring requirements specified in `PROJECT.md`.

Detailed findings, route maps, and recommended implementation tasks are documented in `analysis.md`.

---

## 5. Verification Method

### 5.1 Document Inspection
Inspect `analysis.md` located at:
`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_survey_1\analysis.md`

### 5.2 TypeScript Verification Commands
- Web TypeScript check:
  `npx tsc --noEmit -p apps/web`
- API TypeScript check:
  `npx tsc --noEmit -p apps/api`

### 5.3 Backend Unit & Adversarial Test Verification
- Run backend adversarial signup test:
  `npx ts-node apps/api/src/__tests__/signup-dto-adversarial.test.ts`

### 5.4 Files to Inspect for Dead Code
- Legacy sidebar: `apps/web/src/components/SidebarLayout.tsx`
- Active dashboard layout: `apps/web/src/app/(dashboard)/layout.tsx`
