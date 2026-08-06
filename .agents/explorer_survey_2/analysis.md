# Backend Architecture & Gap Analysis Report: YellowHouse Tailoring OS

**Author**: explorer_survey_2 (Backend Explorer)  
**Date**: 2026-08-06  
**Workspace**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  
**API Package**: `apps/api`  

---

## Executive Summary

YellowHouse Tailoring OS has established a NestJS 10 + Prisma ORM 5 backend structure in `apps/api`. The database schema (`apps/api/prisma/schema.prisma`) is well-defined with 11 relational models covering multi-tenancy (`Tenant`, `Branch`), user access (`User`), client management (`Client`, `CustomerMeasurementVersion`), measurement templates (`MeasurementTemplate`), and order execution (`Order`, `OrderItem`, `JobCard`, `WorkerEarningsLedger`, `OrderTrial`).

However, the current NestJS application (`apps/api/src`) is heavily minimalist and primarily implements **in-memory Measurement Engine calculations** (`getGarmentTemplates`, `calculateEase`, `calculateFabricYield`). None of the CRUD controllers, auth services, onboarding APIs, admin dashboard APIs, or order lifecycle endpoints are implemented.

Below is the detailed gap breakdown and technical roadmap for requirements R1 through R4.

---

## 1. Existing Backend Codebase Inventory

### 1.1 Dependencies & Workspace Config (`apps/api/package.json`)
- Framework: NestJS 10 (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`).
- Database: Prisma 5 (`prisma`, `@prisma/client`).
- Authentication: `@nestjs/jwt`, `@nestjs/passport`, `bcryptjs` (installed, but unconfigured).
- Validation: `class-validator`, `class-transformer` (configured globally in `main.ts`).

### 1.2 Prisma Data Schema (`apps/api/prisma/schema.prisma`)
- **Tenant** (`lines 10-23`): `id`, `name`, `slug` (unique), `plan`, `status` ("active"/"suspended"), `createdAt`, `updatedAt`.
- **Branch** (`lines 25-35`): `id`, `tenantId`, `name`, `city`, `isPrimary`.
- **User** (`lines 37-49`): `id`, `tenantId`, `branchId`, `email` (unique), `passwordHash`, `name`, `role` ("TENANT_OWNER", "BRANCH_MANAGER", "RECEPTIONIST", "MASTER_TAILOR", "KARIGAR", "ACCOUNTANT").
- **Client** (`lines 51-67`): `id`, `tenantId`, `phone`, `firstName`, `lastName`, `gender`, `preferredFit`, `postureProfile` (Json). Unique constraint: `[tenantId, phone]`.
- **CustomerMeasurementVersion** (`lines 69-83`): `id`, `tenantId`, `clientId`, `versionNumber`, `profileName`, `gender`, `unit`, `measurements` (Json), `easeAllowances` (Json), `measuredBy`, `isActive`.
- **MeasurementTemplate** (`lines 85-94`): `id`, `tenantId` (nullable for global templates), `garmentName`, `gender`, `category`, `pomSchema` (Json).
- **Order** (`lines 96-113`): `id`, `tenantId`, `branchId`, `clientId`, `orderNumber` (unique), `state` ("DRAFT", "QUOTATION_SENT", "CONFIRMED", "CUTTING", "STITCHING", "QC", "TRIAL", "READY_FOR_DELIVERY", "DELIVERED", "CLOSED"), `totalAmount`, `advancePaid`, `balanceDue`, `targetDeliveryAt`.
- **OrderItem** (`lines 115-129`): `id`, `orderId`, `garmentType`, `fabricSku`, `fabricMeters`, `unitPrice`, `appliedMeasurementSnapshot` (Json), `garmentConfiguration` (Json), `productionStage`.
- **JobCard** (`lines 131-142`): `id`, `orderItemId`, `assignedWorkerId`, `operationType` ("CUTTING", "EMBROIDERY", "STITCHING", "FINISHING"), `samMinutes`, `status` ("PENDING", "IN_PROGRESS", "COMPLETED").
- **WorkerEarningsLedger** (`lines 144-154`): `id`, `jobCardId`, `workerId`, `samMinutes`, `minuteRate`, `multiplier`, `totalPayoutInr`.
- **OrderTrial** (`lines 156-166`): `id`, `orderItemId`, `trialNumber`, `status` ("SCHEDULED", "COMPLETED", "ALTERATION_REQUIRED"), `scheduledAt`, `observedDeltas` (Json), `masterNotes`.

### 1.3 Active Modules & Controller Routes
- `main.ts` (`lines 1-27`): Configures NestJS on port 3001, CORS (`origin: '*'`), global `ValidationPipe`.
- `app.module.ts` (`lines 1-22`): Imports `ConfigModule`, applies `TenantMiddleware` for all routes (`*`), registers `MeasurementsController`, `PrismaService`, `MeasurementsService`.
- `common/middleware/tenant.middleware.ts` (`lines 1-23`): Reads `x-tenant-id` header; defaults to `'default-tenant-id'`.
- `modules/prisma/prisma.service.ts` (`lines 1-23`): Extends `PrismaClient` with connection lifecycle hooks.
- `modules/measurements/measurements.controller.ts` (`lines 1-28`):
  - `GET /measurements/templates` -> Returns in-memory garment templates.
  - `POST /measurements/calculate-ease` -> Returns posture & fit ease calculations.
  - `POST /measurements/fabric-yield` -> Returns fabric yardage/meters yield estimation.

---

## 2. Gap Analysis by Requirement (Implemented vs Missing)

### R1. Multi-Tenant Onboarding & Database Seeding API

| Sub-Feature | Implementation Status | Location / Details |
|---|---|---|
| Tenant Schema Model | ✅ Implemented | `apps/api/prisma/schema.prisma:10-23` |
| Branch Schema Model | ✅ Implemented | `apps/api/prisma/schema.prisma:25-35` |
| Slug Availability Validation API | ❌ Missing | Needs `GET /onboarding/check-slug/:slug` endpoint |
| Tenant Onboarding & Owner Creation API | ❌ Missing | Needs `POST /onboarding/signup` endpoint |
| Database Seeding Script | ❌ Missing | Needs `apps/api/prisma/seed.ts` for default system templates |
| Template Seeding per Tenant | ❌ Missing | Needs logic to copy global `MeasurementTemplate` records into newly created tenant |

**Required Deliverables for R1**:
1. Create `OnboardingModule`, `OnboardingController`, `OnboardingService` under `apps/api/src/modules/onboarding/`.
2. Implement DTOs: `CheckSlugDto`, `CreateTenantOnboardingDto`.
3. Implement `GET /onboarding/check-slug/:slug` returning `{ available: boolean, slug: string }`.
4. Implement `POST /onboarding/signup` creating:
   - Tenant (`name`, `slug`, `plan`)
   - Primary Branch (`name: "Main Branch"`, `isPrimary: true`)
   - Owner User (`email`, hashed `passwordHash`, `role: "TENANT_OWNER"`)
   - Copies system templates into `MeasurementTemplate` table scoped to `tenantId`.
5. Create `apps/api/prisma/seed.ts` seeding default global `MeasurementTemplate` rows (9 standard categories).

---

### R2. Role-Based Authentication (RBAC) & JWT Setup Backend Logic

| Sub-Feature | Implementation Status | Location / Details |
|---|---|---|
| User & Role Schema Model | ✅ Implemented | `apps/api/prisma/schema.prisma:37-49` |
| Auth Dependencies | 🟡 Installed only | `@nestjs/jwt`, `@nestjs/passport`, `bcryptjs` in `package.json` |
| Password Hashing & Verification | ❌ Missing | No bcrypt hashing service or login logic |
| Login / Register / Logout APIs | ❌ Missing | Needs `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` |
| JWT Cookie / Header Token Strategy | ❌ Missing | Needs `JwtStrategy` extracting token from HTTP-only cookie or Bearer header |
| Current User Session API | ❌ Missing | Needs `GET /auth/me` returning authenticated user profile & tenant context |
| RBAC Guards & `@Roles()` Decorator | ❌ Missing | Needs `JwtAuthGuard`, `RolesGuard`, `@Roles(...)` metadata decorator for roles (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`) |

**Required Deliverables for R2**:
1. Create `AuthModule`, `AuthController`, `AuthService` under `apps/api/src/modules/auth/`.
2. Implement JWT Strategy (`jwt.strategy.ts`), `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator, `@CurrentUser()` decorator.
3. Implement `POST /auth/login` setting secure `httpOnly` cookie (e.g. `jwt_token`) and returning session object (`{ user, tenant, branch }`).
4. Implement `POST /auth/logout` clearing authentication cookie.
5. Implement `GET /auth/me` returning current user profile, role, tenant details, and branch context.
6. Guard API routes across all modules with `@UseGuards(JwtAuthGuard, RolesGuard)` and role annotations.

---

### R3. Global System Admin Dashboard Backend APIs

| Sub-Feature | Implementation Status | Location / Details |
|---|---|---|
| System Admin Stats API | ❌ Missing | Needs `GET /admin/stats` (tenant counts, subscription breakdown, total revenue) |
| Global Tenant Directory API | ❌ Missing | Needs `GET /admin/tenants` (list with filters, user counts, order counts, status) |
| Tenant Status Toggle API | ❌ Missing | Needs `PATCH /admin/tenants/:id/status` (Active / Suspended) |
| System Health Metrics API | ❌ Missing | Needs `GET /admin/health` (DB connectivity, uptime, memory, CPU stats) |
| System Admin Authorization Guard | ❌ Missing | Needs restriction so only super-admin / platform admin users can call `/admin/*` |

**Required Deliverables for R3**:
1. Create `AdminModule`, `AdminController`, `AdminService` under `apps/api/src/modules/admin/`.
2. Implement `GET /admin/stats` querying:
   - Total tenants count, active tenants count, suspended tenants count.
   - Subscription plan distribution (`starter`, `professional`, `enterprise`).
   - Global system revenue & aggregate order metrics.
3. Implement `GET /admin/tenants` with pagination, search by slug/name, and status filtering.
4. Implement `PATCH /admin/tenants/:id/status` updating tenant `status` to `active` or `suspended`.
5. Implement `GET /admin/health` testing Prisma database connection (`$queryRaw\`SELECT 1\``), process uptime, Node memory usage, and environment health.

---

### R4. Order Lifecycle & Production Pipeline Backend Integration

| Sub-Feature | Implementation Status | Location / Details |
|---|---|---|
| Client CRUD APIs | ❌ Missing | Needs `POST /clients`, `GET /clients`, `GET /clients/:id` |
| Measurement Snapshot Versioning API | ❌ Missing | Needs `POST /clients/:id/measurements` saving `CustomerMeasurementVersion` |
| Order Creation & Management APIs | ❌ Missing | Needs `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Order Lifecycle State Transitions | ❌ Missing | Needs `PATCH /orders/:id/state` (`DRAFT` → `CONFIRMED` → `CUTTING` → `STITCHING` → `QC` → `READY_FOR_DELIVERY` → `DELIVERED`) |
| Production Pipeline / Job Cards API | ❌ Missing | Needs `POST /job-cards`, `PATCH /job-cards/:id/status`, `GET /job-cards/worker/:workerId` |
| Fitting Trial Delta Ledger API | ❌ Missing | Needs `POST /orders/items/:itemId/trials`, `GET /orders/items/:itemId/trials` |
| Tenant Isolation in Query Services | ❌ Missing | Services must enforce `tenantId` filtering derived from JWT / `TenantMiddleware` |

**Required Deliverables for R4**:
1. Create `ClientsModule`, `OrdersModule`, `ProductionModule` under `apps/api/src/modules/`.
2. Implement Client registration and persistent measurement version snapshot endpoints.
3. Implement Order creation linking client, branch, order items, and measurement snapshot.
4. Implement pipeline state transitions (`DRAFT` through `DELIVERED`).
5. Implement JobCard assignment and status progression for tailors/karigars (`PENDING` → `IN_PROGRESS` → `COMPLETED`).
6. Implement OrderTrial logging to save observed trial deltas (`observedDeltas`) and tailor notes (`masterNotes`).

---

## 3. Recommended Implementation Architecture & Routing Strategy

```
apps/api/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── middleware/
│   │   └── tenant.middleware.ts
│   └── strategies/
│       └── jwt.strategy.ts
└── modules/
    ├── admin/
    │   ├── admin.controller.ts
    │   ├── admin.module.ts
    │   └── admin.service.ts
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   └── dto/
    │       ├── login.dto.ts
    │       └── register.dto.ts
    ├── clients/
    │   ├── clients.controller.ts
    │   ├── clients.module.ts
    │   └── clients.service.ts
    ├── measurements/
    │   ├── dto/
    │   ├── measurements.controller.ts
    │   ├── measurements.module.ts
    │   └── measurements.service.ts
    ├── onboarding/
    │   ├── dto/
    │   │   ├── check-slug.dto.ts
    │   │   └── onboarding.dto.ts
    │   ├── onboarding.controller.ts
    │   ├── onboarding.module.ts
    │   └── onboarding.service.ts
    ├── orders/
    │   ├── dto/
    │   ├── orders.controller.ts
    │   ├── orders.module.ts
    │   └── orders.service.ts
    ├── production/
    │   ├── job-cards.controller.ts
    │   ├── production.module.ts
    │   └── production.service.ts
    └── prisma/
        ├── prisma.module.ts
        └── prisma.service.ts
```

---

## 4. Verification Plan for Implementers

1. **NestJS Build Check**:
   `npm run build --workspace=apps/api` or `npx nest build` inside `apps/api`.
2. **Prisma Schema Generation**:
   `npx prisma generate --schema=apps/api/prisma/schema.prisma`.
3. **Database Seeding**:
   `npx prisma db seed` or `node dist/prisma/seed.js`.
4. **End-to-End API Integration Check**:
   - Onboarding (`POST /onboarding/signup`) -> Returns tenant + owner.
   - Auth (`POST /auth/login`) -> Returns JWT cookie + session payload.
   - Profile (`GET /auth/me`) -> Returns tenant context & role.
   - Admin (`GET /admin/stats`, `GET /admin/health`) -> Returns health metrics & stats.
   - Client & Measurement (`POST /clients`, `POST /clients/:id/measurements`) -> Persists client & versioned snapshot.
   - Order Pipeline (`POST /orders`, `PATCH /orders/:id/state`) -> Advances order state cleanly.
