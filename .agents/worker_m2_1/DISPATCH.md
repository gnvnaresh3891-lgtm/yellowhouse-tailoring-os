## 2026-08-06T15:07:00Z
You are worker_m2_1 for YellowHouse Tailoring OS.
Your working directory for metadata is: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m2_1
Workspace Root: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Original Request: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\ORIGINAL_REQUEST.md
Project Scope: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\orchestrator\PROJECT.md

Read the Explorer Analysis Reports before implementing:
- Backend: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_1\analysis.md
- Frontend: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_2\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task (Milestone 2 Implementation — RBAC & JWT Setup):

1. Implement Backend Auth & RBAC (`apps/api`):
   - `apps/api/src/modules/auth/dto/login.dto.ts` and `register.dto.ts` with `@Transform` lowercased & trimmed email.
   - `apps/api/src/modules/auth/auth.service.ts` (`login` with `bcrypt.compare`, sign JWT token with `sub`, `email`, `role`, `tenantId`, `branchId`, set HTTP-only cookie `jwt_token`, `register`, `logout`, `me`).
   - `apps/api/src/modules/auth/auth.controller.ts` (`POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`).
   - `apps/api/src/modules/auth/jwt.strategy.ts` (extracting token from `jwt_token` cookie or `Authorization: Bearer` header).
   - `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` & `roles.guard.ts` with `@Roles(...)` decorator supporting `TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`.
   - Update `apps/api/src/common/middleware/tenant.middleware.ts` to extract `tenantId` dynamically from JWT cookie/token or `x-tenant-id` header.
   - `apps/api/src/modules/auth/auth.module.ts` and register `AuthModule` in `apps/api/src/app.module.ts`.

2. Implement Frontend Auth UI, Context & Middleware (`apps/web`):
   - `apps/web/src/types/auth.ts`
   - `apps/web/src/context/AuthContext.tsx` & `apps/web/src/context/TenantContext.tsx`
   - `apps/web/src/app/providers.tsx` wrapping Auth & Tenant providers.
   - `apps/web/src/app/login/page.tsx` (Dark Atelier theme UI, role demo presets for quick testing, email/password form, submit handler posting to `POST /auth/login`, cookie & `localStorage` setting, router redirect).
   - `apps/web/src/app/register/page.tsx` (Staff signup form).
   - Update `apps/web/src/app/(dashboard)/layout.tsx` Header to dynamically render active tenant name, tenant slug badge, current user name, role badge (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), and Logout button.
   - Next.js Auth Middleware (`apps/web/src/middleware.ts`) intercepting protected routes (`/`, `/customers`, `/measurements`, `/production`, `/admin`), redirecting unauthenticated requests to `/login`, enforcing role permissions.

3. Run Build & Test Verification:
   - `cd apps/api && npx tsc --noEmit && npm run build` -> Exit code 0, zero errors.
   - `cd apps/web && npx tsc --noEmit && npx next build` -> Exit code 0, zero errors.
   - `npx tsx apps/web/src/__tests__/run-all-tests.ts` -> Exit code 0.

4. Write handoff report at C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m2_1\handoff.md and report completion to parent.
