# Handoff Report — Security & Multi-Tenancy Review (Milestone 1)

**Agent**: reviewer_m1_2 (Reviewer & Critic)  
**Date**: 2026-08-06  
**Target**: Milestone 1 Implementation — Multi-Tenant Onboarding & Seeding Flow  
**Verdict**: **APPROVE**  

---

## 1. Observation

### File & Code Inspection Results
1. **Atomic DB Transaction (`apps/api/src/modules/onboarding/onboarding.service.ts`)**:
   - Lines 125–246: Enclosed within `this.prisma.$transaction(async (tx) => { ... })`.
   - Operations inside transaction:
     - `tx.tenant.create(...)` — Creates tenant entity (`name`, `slug`, `plan`, `status`).
     - `tx.branch.create(...)` — Creates primary branch linked via `tenantId: tenant.id`.
     - `tx.user.create(...)` — Creates owner user with role `'TENANT_OWNER'`, `passwordHash`, `tenantId`, and `branchId`.
     - `tx.measurementTemplate.findMany(...)` — Queries global measurement templates (`tenantId: null`).
     - `tx.measurementTemplate.createMany(...)` — Copies and seeds selected measurement templates to the tenant scope (`tenantId: tenant.id`).
   - Pre-transaction CPU task: `bcrypt.hash(effectivePassword, 10)` is executed at line 122 **before** `$transaction`, avoiding unnecessary database transaction lock holding during password hashing.

2. **Password Hashing with `bcryptjs`**:
   - `bcryptjs` dependency verified in `apps/api/package.json` (`^2.4.3`).
   - Line 3: `import * as bcrypt from 'bcryptjs';`
   - Line 122: Password hashed using `await bcrypt.hash(effectivePassword, 10)` with standard 10 salt rounds.
   - Lines 234–241: Response object explicitly omits `passwordHash` from returned owner user data.

3. **Slug Uniqueness & Reserved Keyword Filtering**:
   - `RESERVED_SLUGS` defined at lines 7–23 of `onboarding.service.ts` (15 keywords: `admin`, `api`, `auth`, `login`, `register`, `onboarding`, `app`, `system`, `root`, `public`, `static`, `dashboard`, `settings`, `support`, `billing`).
   - Format Regex: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` enforces 3–50 lowercase alphanumeric characters and hyphens (rejecting leading/trailing hyphens and consecutive hyphens).
   - API Endpoint `GET /onboarding/check-slug/:slug`: Normalizes input (`trim()`, `toLowerCase()`), validates format, checks against `RESERVED_SLUGS`, and checks DB existence via `prisma.tenant.findUnique({ where: { slug } })`.
   - Database Constraint: `slug String @unique` on `Tenant` model in `apps/api/prisma/schema.prisma` guarantees database-level unique constraint enforcement against race conditions.

4. **Frontend `/onboarding` UX & Session Handling (`apps/web/src/app/onboarding/page.tsx`)**:
   - Debounced validation: 350ms timer in `useEffect` invoking `fetchApi<SlugCheckResponse>('/onboarding/check-slug/...')`.
   - UI status indicators: Visual badges for `checking` (spinner), `available` (emerald check), `taken` (rose X), and `invalid` (amber triangle).
   - Auto-slug generation: `slugify()` utility converts boutique name to slug in real-time unless manually modified by user.
   - Template selection: Checklist for "Men's Bespoke Atelier" (31 POMs), "Women's High Couture" (39 POMs), and "Custom Atelier Canvas".
   - Session management: Stores `jwt_token`, `tenant`, and `user` in `localStorage` and sets browser session cookies `jwt_token` and `x-tenant-id` with `SameSite=Lax`.

### Build Verification Results
- **Backend API (`apps/api`)**:
  - Executed command: `npm run build` (CWD: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api`)
  - Result: Exit Code `0`. Clean NestJS build output without compilation or TypeScript errors.
- **Frontend Web (`apps/web`)**:
  - Executed command: `npm run build` (CWD: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web`)
  - Result: Exit Code `0`. Next.js 14.2.35 compiled successfully, generating all 8 static routes including `/onboarding` (7.03 kB).

---

## 2. Logic Chain

1. **Transaction Integrity**:
   - *Premise*: Multi-tenant onboarding requires that tenant creation, primary branch setup, owner user account creation, and template seeding succeed or fail as a single atomic unit.
   - *Observation*: `OnboardingService.signup` uses NestJS/Prisma interactive `$transaction(async (tx) => ...)` with all DB writes executed on `tx`.
   - *Deduction*: If any database write fails (e.g. email collision or constraint error), Prisma automatically rolls back all previous writes within the transaction. No partial tenant states can exist in the database.

2. **Security & Hashing**:
   - *Premise*: Passwords must never be stored in plain text or leaked in API responses.
   - *Observation*: `bcrypt.hash` with 10 salt rounds is invoked prior to user creation; `passwordHash` is assigned to `User.passwordHash` and excluded from API return payloads.
   - *Deduction*: Password handling adheres to security standards for authentication.

3. **Multi-Tenant Slug Isolation**:
   - *Premise*: Tenant domain slugs must be unique, formatted cleanly, and protected from system endpoint collisions.
   - *Observation*: 15 critical system routes are reserved; regex pattern enforces hyphenated alphanumeric slugs; database schema enforces `@unique` on `Tenant.slug`.
   - *Deduction*: System paths cannot be hijacked by custom tenant slugs, and multi-tenant domain routing is isolated.

4. **Integrity & Code Quality**:
   - *Premise*: Codebase must be free of hardcoded test outputs, dummy stubs, or unverified shortcuts.
   - *Observation*: Source code connects directly to Prisma models and real JWT service without mock fallbacks or hardcoded values.
   - *Deduction*: Integrity check passed without violations.

---

## 3. Caveats

- **Concurrent Slug Race Condition**: While application-level `findUnique` check occurs outside the transaction, database-level `@unique` constraint on `Tenant.slug` acts as the ultimate safety net. In the event of a simultaneous collision, database constraint rejection triggers transaction rollback.
- **Frontend Cookie HttpOnly**: Client-side JavaScript (`document.cookie`) sets session cookies with `SameSite=Lax`. Full `HttpOnly` cookie setting is handled by backend authentication routes (`/auth/login` in Milestone 2).

---

## 4. Conclusion

Milestone 1 multi-tenant onboarding implementation satisfies all security, transaction isolation, slug validation, and build requirements.

**Explicit Verdict**: **APPROVE**

---

## 5. Verification Method

To independently verify this milestone assessment, run the following commands:

```powershell
# 1. Verify API Build
cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api
npm run build

# 2. Verify Web Build
cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
npm run build
```

Inspect the following key files:
- `apps/api/src/modules/onboarding/onboarding.service.ts` (lines 125-246 for `$transaction`, line 122 for `bcrypt.hash`, lines 7-23 for reserved slugs)
- `apps/api/prisma/schema.prisma` (line 13 for `slug @unique`)
- `apps/web/src/app/onboarding/page.tsx` (lines 105-144 for debounced slug validation, lines 213-222 for session cookie handling)
