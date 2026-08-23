# Milestone 4 Handoff Report — Challenger 1 (Adversarial Assessment)

## 1. Verdict
**`REQUEST_CHANGES`**

## 2. Observation
- Executed verification commands:
  - `apps/web` Typecheck: `npx tsc --noEmit` -> Passed with 0 errors.
  - `apps/api` Typecheck: `npx tsc --noEmit` -> Passed with 0 errors.
  - `apps/web` Test Suite: `npm test` -> 943 PASSED, 0 FAILED (with adversarial suite integrated).
  - `apps/api` Test Suite: `npm test` -> 23 PASSED, 0 FAILED.
  - Monorepo Build: `npm run build` -> Passed cleanly (Code 0).
- Created and executed empirical adversarial test suite `apps/web/src/__tests__/rbac-adversarial-m4.test.ts` to stress test RBAC route guards, input role parsing, path traversal, empty navigation items, and layout rendering state.
- **Empirical Vulnerabilities Discovered**:
  1. **Security Vulnerability — RBAC Path Traversal Route Guard Bypass**:
     - Location: `apps/web/src/lib/rbac-utils.ts`, lines 72-78 (`canUserAccessRoute`).
     - Observation: `canUserAccessRoute('MASTER_TAILOR', '/dashboard/../admin')` returned `true`.
     - Direct Code Snippet: `normalizedPath.startsWith('${allowed}/')` matches `'/dashboard/'` in `'/dashboard/../admin'` before canonical path normalization, allowing restricted roles to bypass route guards to reach `/admin` or `/staff`.
  2. **Type Hardening Vulnerability — Unhandled TypeError on Non-String Roles**:
     - Location: `apps/web/src/lib/rbac-utils.ts`, line 57 (`normalizeRole`).
     - Observation: Calling `normalizeRole(123 as any)` or passing non-string values throws `TypeError: role.toUpperCase is not a function`.
     - Impact: Crashes `normalizeRole`, `canUserAccessRoute`, and `filterNavItemsForRole` whenever corrupt or non-string role data exists in `localStorage`.
  3. **UI Crash Vulnerability — Unguarded `.replace()` Call in DashboardLayout**:
     - Location: `apps/web/src/app/(dashboard)/layout.tsx`, lines 162 & 224.
     - Observation: `currentUser.role.replace('_', ' ')` is executed directly. If `yh_auth_user` contains a user object with a null or missing `role` property, React rendering crashes with `TypeError: Cannot read properties of undefined (reading 'replace')`.

## 3. Logic Chain
1. **RBAC Guard Bypass Logic**:
   - `canUserAccessRoute` strips query parameters (`?`) and hash tags (`#`) but does not resolve path traversal operators like `..`.
   - When `MASTER_TAILOR` (who has access to `/dashboard` but NOT `/admin`) requests `/dashboard/../admin`, `normalizedPath.startsWith('/dashboard/')` evaluates to `true`.
   - The route guard falsely permits access to forbidden administrative paths.
2. **Type Safety & Storage Resilience Logic**:
   - `normalizeRole` accepts `role: string` but performs no runtime `typeof role === 'string'` check before calling `role.toUpperCase().trim()`.
   - If `localStorage` contains unexpected JSON types (e.g. `{ "role": 123 }`), `normalizeRole` throws a runtime TypeError that propagates up through `filterNavItemsForRole`, crashing layout sidebar rendering.
3. **UI Nullability Protection Logic**:
   - In `DashboardLayout` (`layout.tsx`), the route guard effect checks `if (user && user.role)`. If `user.role` is undefined, the route guard does not redirect to `/login`.
   - Component rendering then attempts `{currentUser.role.replace('_', ' ')}`, which throws a runtime crash because `currentUser.role` is undefined.

## 4. Caveats
- Baseline test suites (`rbac-visibility.test.ts`, `state-sync.test.ts`, `sam-calculator.test.ts`, `pricing-calculator.test.ts`) pass cleanly.
- Build system compiles without TypeScript or Next.js build errors.
- The vulnerabilities identified require focused refactoring in `rbac-utils.ts` and `layout.tsx` to achieve complete production-grade security and crash resilience.

## 5. Conclusion & Actionable Fix Recommendations
Milestone 4 RBAC route guards and UI state handling require fixes before approval:
1. **Path Normalization Fix**: In `canUserAccessRoute`, sanitize/resolve relative path segments (e.g. using path segment resolution) before checking route permissions.
2. **Type Hardening Fix**: In `normalizeRole`, add `if (typeof role !== 'string' || !role.trim()) return null;`.
3. **UI Safety Fix**: In `layout.tsx`, safeguard role display with `currentUser?.role && typeof currentUser.role === 'string' ? currentUser.role.replace('_', ' ') : 'User'`.

## 6. Verification Method
Verify all claims independently via:
1. `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit`
2. `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit`
3. `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npm test`
4. `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npm test`
5. `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse && npm run build`
