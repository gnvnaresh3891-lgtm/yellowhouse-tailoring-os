## 2026-08-06T08:29:31Z
You are explorer_m2_1 for YellowHouse Tailoring OS Milestone 2.
Working Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_1
Workspace Root: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Original Request: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\ORIGINAL_REQUEST.md
Project Scope Document: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\orchestrator\PROJECT.md

Task:
Analyze and design the exact technical implementation strategy for Milestone 2 Backend (RBAC & JWT Setup):
1. `AuthModule`, `AuthController`, `AuthService`, `JwtStrategy` in `apps/api/src/modules/auth`.
2. DTOs: `LoginDto` (`email`, `password`), `RegisterDto` (`email`, `password`, `name`, `role`, `tenantId`).
3. Endpoints:
   - `POST /auth/login`: authenticate via bcrypt.compare, sign JWT payload (`sub`, `email`, `role`, `tenantId`, `branchId`), set `jwt_token` HTTP-only cookie, return `{ token, user, tenant }`.
   - `POST /auth/register`: register staff user.
   - `POST /auth/logout`: clear `jwt_token` HTTP-only cookie.
   - `GET /auth/me`: return authenticated user profile & tenant info.
4. Guards & Decorators:
   - `JwtAuthGuard` (`apps/api/src/modules/auth/guards/jwt-auth.guard.ts`)
   - `RolesGuard` (`apps/api/src/modules/auth/guards/roles.guard.ts`)
   - `@Roles(...)` decorator supporting `TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`.
5. `TenantMiddleware` update in `apps/api/src/common/middleware/tenant.middleware.ts`: extract `tenantId` dynamically from JWT cookie/token or `x-tenant-id` header.
6. Register `AuthModule` in `apps/api/src/app.module.ts`.

Provide exact code structure and file paths. Do NOT modify source code files. Write findings to C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_1\analysis.md and deliver handoff.md.
