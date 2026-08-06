# Project: YellowHouse Tailoring OS

## Architecture
Monorepo structure with Next.js 14 App Router frontend (`apps/web`) and NestJS 10 backend API (`apps/api`) powered by Prisma ORM 5 and PostgreSQL/SQLite database.

- **Frontend (`apps/web`)**: Next.js 14, React 18, Tailwind CSS, TypeScript.
  - Path: `apps/web/src/app/`
  - Routes: `/onboarding`, `/login`, `/register`, `/admin`, `/` (dashboard), `/customers`, `/measurements`, `/production`.
  - Contexts: `AuthContext`, `TenantContext`.
  - Middleware: `src/middleware.ts` for route protection.

- **Backend API (`apps/api`)**: NestJS 10, Prisma 5, JWT, Passport, bcryptjs.
  - Path: `apps/api/src/`
  - Modules: `OnboardingModule`, `AuthModule`, `AdminModule`, `ClientsModule`, `OrdersModule`, `ProductionModule`, `MeasurementsModule`, `PrismaModule`.
  - Guards: `JwtAuthGuard`, `RolesGuard`.
  - Middleware: `TenantMiddleware` for multi-tenant isolation via `x-tenant-id` header or JWT session cookie.

- **Database (`apps/api/prisma/schema.prisma`)**:
  - Models: `Tenant`, `Branch`, `User`, `Client`, `CustomerMeasurementVersion`, `MeasurementTemplate`, `Order`, `OrderItem`, `JobCard`, `WorkerEarningsLedger`, `OrderTrial`.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Onboarding Slug Check API | Endpoint `GET /onboarding/check-slug/:slug` checking availability | M1 | Survey |
| 2 | Onboarding Signup API | Endpoint `POST /onboarding/signup` creating Tenant, Branch, Owner User | M1 | Survey |
| 3 | Database Seed Script | `prisma/seed.ts` seeding measurement templates & admin account | M1 | Survey |
| 4 | Multi-Tenant Onboarding Page | `/onboarding` UI with slug validation, template selection & owner form | M1 | Survey |
| 5 | Auth Registration & Login API | `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` with JWT cookies | M2 | Survey |
| 6 | RBAC & Tenant Guards | `JwtAuthGuard`, `RolesGuard`, `@Roles()`, and dynamic `TenantMiddleware` | M2 | Survey |
| 7 | Login & Register UI Pages | `/login` and `/register` frontend pages with role/tenant switcher | M2 | Survey |
| 8 | Header Context & Middleware | Next.js Header displaying tenant/user/role & `src/middleware.ts` RBAC guard | M2 | Survey |
| 9 | Admin Dashboard API | `GET /admin/tenants`, `PATCH /admin/tenants/:id/status`, `GET /admin/stats`, `GET /admin/health` | M3 | Survey |
| 10 | Global Admin Dashboard Page | `/admin` UI with boutique tenant table, status toggle, revenue & system health | M3 | Survey |
| 11 | Client Persistence API & UI | `/clients` CRUD endpoints & `/customers` page API integration | M4 | Survey |
| 12 | Measurement Snapshot API & UI | Save versioned measurement snapshots & load historical POM versions | M4 | Survey |
| 13 | Order Creation API & UI | Create Order modal/page (`/orders/new`) with line items & measurement links | M4 | Survey |
| 14 | Production Pipeline API & UI | Job card stage transitions (`/production`) linked to Order status update | M4 | Survey |
| 15 | E2E Order Lifecycle Flow | Complete trace: Onboarding -> Login -> Client -> Measurement -> Order -> Production -> Delivery | M4 | Survey |
| 16 | Monorepo Build & Test Verification | `npx next build` and `npm run build` in API pass with 0 errors & clean tests | M4 | Survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Multi-Tenant Onboarding & Seeding Flow | Onboarding API endpoints, Prisma seed script, `/onboarding` UI page | none | DONE |
| M2 | Role-Based Auth (RBAC) & JWT Setup | Auth API endpoints, JWT session cookies, RBAC guards, `/login` page, Header context, Next.js middleware | M1 | IN_PROGRESS |
| M3 | Global System Admin Dashboard | Admin API endpoints, `/admin` UI page with tenant table & status toggles, stats & health metrics | M2 | PLANNED |
| M4 | Order-to-Delivery E2E Integration & Verification | Clients API, Measurement Version API, Order Creation UI, Production Kanban API, E2E order flow, build & audit verification | M3 | PLANNED |

---

## Interface Contracts

### M1 ↔ M2: Onboarding & Auth Contract
- `POST /onboarding/signup` returns:
  ```json
  {
    "success": true,
    "tenant": { "id": "string", "name": "string", "slug": "string" },
    "user": { "id": "string", "email": "string", "role": "TENANT_OWNER" },
    "token": "string"
  }
  ```

### M2 ↔ M3: Auth & Admin Contract
- `POST /auth/login` sets HTTP-only cookie `jwt_token` and returns user & tenant profile payload.
- System Admin requests to `/admin/*` require `jwt_token` cookie or Bearer token with `role = 'SYSTEM_ADMIN'` or global admin scope.

### M2 ↔ M4: Auth & Tenant Data Contract
- Requests to `/clients`, `/measurements/versions`, `/orders`, `/production/job-cards` require valid `jwt_token` or `x-tenant-id` header.
- `TenantMiddleware` populates `req.tenantId` on all incoming backend requests.

---

## Code Layout File Boundaries

### Milestone 1 Files
- `apps/api/src/modules/onboarding/onboarding.module.ts`
- `apps/api/src/modules/onboarding/onboarding.controller.ts`
- `apps/api/src/modules/onboarding/onboarding.service.ts`
- `apps/api/src/modules/onboarding/dto/signup.dto.ts`
- `apps/api/prisma/seed.ts`
- `apps/web/src/app/onboarding/page.tsx`

### Milestone 2 Files
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/jwt.strategy.ts`
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`
- `apps/api/src/modules/auth/guards/roles.guard.ts`
- `apps/api/src/modules/auth/decorators/roles.decorator.ts`
- `apps/api/src/common/middleware/tenant.middleware.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/register/page.tsx`
- `apps/web/src/context/AuthContext.tsx`
- `apps/web/src/context/TenantContext.tsx`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/(dashboard)/layout.tsx`

### Milestone 3 Files
- `apps/api/src/modules/admin/admin.module.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/api/src/modules/admin/admin.service.ts`
- `apps/web/src/app/admin/page.tsx`

### Milestone 4 Files
- `apps/api/src/modules/clients/clients.module.ts` / `controller` / `service`
- `apps/api/src/modules/orders/orders.module.ts` / `controller` / `service`
- `apps/api/src/modules/production/production.module.ts` / `controller` / `service`
- `apps/web/src/app/(dashboard)/customers/page.tsx`
- `apps/web/src/app/(dashboard)/measurements/page.tsx`
- `apps/web/src/app/(dashboard)/production/page.tsx`
- `apps/web/src/app/(dashboard)/orders/new/page.tsx` (or order creation modal)
