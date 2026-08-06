# Handoff Report: Milestone 2 Backend (RBAC & JWT Setup) Technical Design

## 1. Observation

- **Existing API & Prisma Schema**:
  - `apps/api/prisma/schema.prisma` lines 37-49 define `User` model with fields `id`, `tenantId`, `branchId`, `email`, `passwordHash`, `name`, `role`, `createdAt`.
  - Roles supported in schema comments: `TENANT_OWNER`, `BRANCH_MANAGER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`, `ACCOUNTANT`.
  - `apps/api/package.json` lines 18-29 include `@nestjs/common`, `@nestjs/core`, `@nestjs/jwt`, `@nestjs/passport`, `bcryptjs`, `@types/bcryptjs`, `class-validator`, `class-transformer`.
  - `apps/api/src/app.module.ts` lines 9-23 registers `ConfigModule`, `OnboardingModule`, `MeasurementsController`, `PrismaService`, `MeasurementsService`, and `TenantMiddleware`.
  - `apps/api/src/common/middleware/tenant.middleware.ts` currently extracts `x-tenant-id` header or defaults to `'default-tenant-id'`.

- **Milestone 2 Backend Requirements**:
  - Module location: `apps/api/src/modules/auth/`
  - Components: `AuthModule`, `AuthController`, `AuthService`, `JwtStrategy`
  - DTOs: `LoginDto` (`email`, `password`), `RegisterDto` (`email`, `password`, `name`, `role`, `tenantId`)
  - Endpoints:
    - `POST /auth/login`: authenticate via `bcrypt.compare`, sign JWT payload (`sub`, `email`, `role`, `tenantId`, `branchId`), set `jwt_token` HTTP-only cookie, return `{ token, user, tenant }`
    - `POST /auth/register`: register staff user
    - `POST /auth/logout`: clear `jwt_token` HTTP-only cookie
    - `GET /auth/me`: return authenticated user profile & tenant info
  - Guards & Decorators: `JwtAuthGuard`, `RolesGuard`, `@Roles(...)` decorator supporting `TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`
  - Middleware Update: `TenantMiddleware` in `apps/api/src/common/middleware/tenant.middleware.ts` to dynamically resolve `tenantId` from JWT cookie/token or `x-tenant-id` header
  - Root Module Registration: Register `AuthModule` in `apps/api/src/app.module.ts`

---

## 2. Logic Chain

1. **Prisma User & Tenant Schema Compatibility**:
   - Observation: `User` model in `schema.prisma:37-49` contains `email`, `passwordHash`, `role`, `tenantId`, and optional `branchId`. `Tenant` model in `schema.prisma:10-23` contains `id`, `name`, `slug`, `plan`, `status`.
   - Inactive/missing auth module requires implementing `AuthService` using `prisma.user` and `prisma.tenant` queries with `bcrypt.compare` / `bcrypt.hash`.

2. **Multi-Source Token Extraction & Cookie Resolution**:
   - Observation: Next.js frontend calls may send auth via HTTP-only cookie `jwt_token`, `Authorization: Bearer <token>` header, or `x-jwt-token`.
   - `JwtStrategy` and `TenantMiddleware` must parse cookies safely both when `req.cookies` exists and via raw `req.headers.cookie` string regex parsing (`/(?:^|;\s*)jwt_token=([^;]+)/`).

3. **RBAC Guard & Metadata Architecture**:
   - `@Roles(...)` decorator sets metadata key `'roles'`.
   - `RolesGuard` retrieves metadata using NestJS `Reflector` and performs case-insensitive validation against `req.user.role`.

4. **Dynamic Tenant Context Hierarchy**:
   - Precedence order established in `TenantMiddleware`:
     1. `x-tenant-id` header (explicit override)
     2. `jwt_token` cookie payload `tenantId`
     3. `Authorization: Bearer` token payload `tenantId`
     4. `x-jwt-token` header payload `tenantId`
     5. `'default-tenant-id'` fallback

5. **Complete Technical Design Delivery**:
   - Detailed TypeScript implementation specs written to `.agents/explorer_m2_1/analysis.md` without modifying any source code files.

---

## 3. Caveats

- Node environment in production requires `JWT_SECRET` environment variable set; fallback `'yellowhouse-secret-key-2026'` is provided for local dev/testing.
- Express `cookie-parser` is optional because regex fallback parsing is implemented in `JwtStrategy` and `TenantMiddleware`.

---

## 4. Conclusion

The technical design for Milestone 2 Backend Auth (RBAC & JWT Setup) is complete, fully specified, and ready for worker implementation. All 6 required areas are detailed in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_1\analysis.md`.

---

## 5. Verification Method

1. **File Inspection**:
   - Inspect `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_1\analysis.md` for complete code listings and exact file paths.
2. **Build Verification (Post Implementation)**:
   - Run `npm run build` in `apps/api` to verify TypeScript compilation.
3. **Endpoint Functional Verification**:
   - `POST /auth/login` returns `{ token, user, tenant }` and sets `jwt_token` cookie.
   - `POST /auth/register` creates staff user under target tenant.
   - `GET /auth/me` with valid JWT returns profile & tenant info.
   - `POST /auth/logout` clears `jwt_token` cookie.
   - Routes guarded with `@Roles('TENANT_OWNER')` reject unauthorized users with 403 Forbidden.
