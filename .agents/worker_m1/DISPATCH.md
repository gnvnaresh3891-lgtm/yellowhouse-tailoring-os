## 2026-09-01T20:02:46Z
You are the Implementation Worker for Milestone 1: Multi-Tenant RBAC & Admin Security Hardening for YellowHouse Tailoring OS.

Your working directory is: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m1
Project root: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Original Request file: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\ORIGINAL_REQUEST.md
PROJECT.md file: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. In `apps/web/src/lib/rbac-utils.ts`:
   - Update `normalizeRole` so that `'ACCOUNTANT'` is properly recognized and mapped to `'ACCOUNTANT'`.
   - Verify route access for all 7 platform roles across application routes.
2. In `apps/web/src/app/(dashboard)/layout.tsx`:
   - Check the unauthenticated / route guard redirect logic. Ensure that when navigating directly to `/admin`, the passkey gate on `admin/page.tsx` can render and handle the passkey challenge ('yh-admin-2026') rather than being prematurely redirected to `/dashboard`.
3. In `apps/web/src/app/onboarding/page.tsx`:
   - In `handleFinish` ("Sign In to Workspace"), ensure `yh_auth_user` is also removed via `removeLocalStorage('yh_auth_user')` along with `yh_customers`, `yh_orders`, `yh_measurements_current`, so that navigating to `/login` presents a clean, empty credential login form.
4. Run the test suites and production build:
   - Run `npm test` in `apps/web` and `apps/api`.
   - Run `npm run build` across the monorepo to ensure all 26 static pages compile with 0 TypeScript/ESLint/Next.js errors.
5. Write your report and handoff to `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m1\handoff.md`.
Notify the orchestrator with send_message when done.
