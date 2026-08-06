# Handoff Report: Milestone 2 Frontend Technical Strategy

## 1. Observation
- Target Files & Paths Analyzed:
  - `apps/web/src/app/login/page.tsx` (To be created): Dark atelier themed login page with quick demo role switcher, email/password form, cookie (`jwt_token`, `x-tenant-id`) & `localStorage` persistence, and redirect support.
  - `apps/web/src/app/register/page.tsx` (To be created): Staff registration page supporting staff account creation, tenant slug input, role picker (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), and success redirection.
  - `apps/web/src/context/AuthContext.tsx` & `TenantContext.tsx` (To be created): Managing active user, JWT token, role checking (`hasRole`), and active tenant details across the app.
  - `apps/web/src/app/providers.tsx` (To be created): Global Root Provider wrapping `AuthProvider` and `TenantProvider`.
  - `apps/web/src/app/(dashboard)/layout.tsx` (Existing file to be updated): Updated header and sidebar to dynamically render tenant name, tenant slug badge, user name, role badge, initials avatar, and Logout button.
  - `apps/web/src/middleware.ts` (To be created): Next.js edge auth middleware enforcing route protection (`/`, `/customers`, `/measurements`, `/production`, `/admin`) and RBAC permissions based on JWT cookie claims.

## 2. Logic Chain
1. **Authentication Flow & Storage**:
   - When a user logs in via `/login`, `AuthContext.login()` dispatches a request to `POST /auth/login`.
   - On success, the JWT token is saved in both HTTP-only cookies (via backend) and fallback `document.cookie` (`jwt_token=${token}`) & `localStorage` (`jwt_token`, `user`, `tenant`).
   - `x-tenant-id` cookie and `localStorage.setItem('tenant')` are updated to ensure all subsequent API requests carry tenant isolation.

2. **Context State & Dynamic Header Integration**:
   - `AuthContext` and `TenantContext` rehydrate active session state from `localStorage` on initial mount to eliminate layout shifts or login flashes.
   - `DashboardLayout` in `apps/web/src/app/(dashboard)/layout.tsx` consumes `useAuth()` and `useTenant()` hooks.
   - The header dynamically computes initials avatar (e.g., "ML"), maps the user's role to a color badge (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), displays tenant name and slug badge (`royal-bespoke`), and exposes a clean Logout button that wipes state and redirects to `/login`.

3. **Edge Middleware Route Protection & RBAC**:
   - `middleware.ts` runs on Next.js edge runtime, checking incoming requests against `PUBLIC_PATHS` (`/login`, `/register`, `/onboarding`).
   - If unauthenticated requests target protected paths (`/`, `/customers`, `/measurements`, `/production`, `/admin`), the middleware redirects to `/login?redirect=${encodeURIComponent(pathname)}`.
   - For authenticated requests, the middleware decodes the JWT token payload and checks route permission rules (e.g. `/admin` requires `TENANT_OWNER` or `SYSTEM_ADMIN`). Violations trigger an immediate redirect to `/` with `error=unauthorized_role`.

## 3. Caveats
- No code modification was made in source files during this read-only investigation turn, adhering to the role instructions.
- Edge JWT parsing in `middleware.ts` uses base64 decoding for lightweight role extraction. Backend token verification (`JwtStrategy` in NestJS) handles cryptographic signature validation on API requests.

## 4. Conclusion
The frontend strategy for Milestone 2 is fully specified with complete, production-ready TypeScript code for `types/auth.ts`, `AuthContext.tsx`, `TenantContext.tsx`, `providers.tsx`, `login/page.tsx`, `register/page.tsx`, updated `layout.tsx`, and `middleware.ts`. All designs are written in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_2\analysis.md`.

## 5. Verification Method
1. **File Inspection**:
   Inspect `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m2_2\analysis.md` for complete code snippets and exact file boundaries.

2. **Implementation & Build Test**:
   - After `implementer_m2_2` writes the files, run `npx next build` in `apps/web` to confirm zero compilation errors.
   - Test login flow at `/login` using preset roles.
   - Verify unauthenticated requests to `/` redirect to `/login`.
