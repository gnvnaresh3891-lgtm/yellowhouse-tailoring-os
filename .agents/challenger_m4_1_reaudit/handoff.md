# Milestone 4 Re-Audit Handoff Report — YellowHouse Tailoring OS

**VERDICT**: `REQUEST_CHANGES`

---

## 1. Observation

Empirical adversarial re-audit of `rbac-utils.ts`, `layout.tsx`, and `rbac-adversarial-m4.test.ts` was performed against the 4 specified verification requirements:

1. **Path Traversal Sequence Normalization (`/dashboard/../admin`)**: **PASS**
   - **Location**: `apps/web/src/lib/rbac-utils.ts` (lines 72–75)
   - **Code**:
     ```ts
     let normalizedPath = routePath.split('?')[0].split('#')[0];
     while (normalizedPath.includes('/../') || normalizedPath.includes('/./')) {
       normalizedPath = normalizedPath.replace(/\/[^\/]+\/\.\.\//g, '/').replace(/\/\.\//g, '/');
     }
     ```
   - **Result**: `canUserAccessRoute('MASTER_TAILOR', '/dashboard/../admin')` normalizes `/dashboard/../admin` to `/admin` and evaluates `ROLE_PERMISSIONS['MASTER_TAILOR'].allowedRoutes`, returning `false`. Path traversal bypass is successfully blocked.

2. **Non-String Input Handling in `normalizeRole`**: **PASS**
   - **Location**: `apps/web/src/lib/rbac-utils.ts` (line 56)
   - **Code**:
     ```ts
     export function normalizeRole(role: string): UserRole | null {
       if (!role || typeof role !== 'string') return null;
     ```
   - **Result**: `normalizeRole(123)` checks `typeof role !== 'string'` and returns `null` without throwing `TypeError: role.toUpperCase is not a function`. `null`, `undefined`, and object inputs also return `null` safely.

3. **`layout.tsx` Role Property Safety**: **FAIL**
   - **Location**: `apps/web/src/app/(dashboard)/layout.tsx` (lines 160 & 222)
   - **Code**:
     ```tsx
     // Line 160 (Sidebar user card):
     <p className="text-[10px] text-slate-500 truncate">
       {currentUser.role.replace('_', ' ')}
     </p>

     // Line 222 (Header user dropdown):
     <p className="text-[10px] text-slate-500">{currentUser.role.replace('_', ' ')}</p>
     ```
   - **Result**: If `yh_auth_user` in `localStorage` has a missing role (`undefined`), `null` role, or numeric role (`123`), `currentUser.role.replace('_', ' ')` executes `.replace` directly on a non-string primitive or `undefined`/`null` value. This throws an unhandled `TypeError` runtime exception in React rendering:
     - Missing role (`undefined`): `TypeError: Cannot read properties of undefined (reading 'replace')`
     - Numeric role (`123`): `TypeError: currentUser.role.replace is not a function`
     - Null role (`null`): `TypeError: Cannot read properties of null (reading 'replace')`

4. **Web Test Suite Execution (`npm test` in `apps/web`)**: **PASS WITH TEST FLAW CAVEAT**
   - **Result**: `npm test` exited with code 0 (`943 PASSED, 0 FAILED across 14 test suites`).
   - **Test Design Flaw**: `apps/web/src/__tests__/rbac-adversarial-m4.test.ts` Subsuite 4 (lines 145–148) tests an inline variable guard defined inside the test file itself:
     ```ts
     let safeDisplay = (u as any).role && typeof (u as any).role === 'string' 
       ? (u as any).role.replace('_', ' ') 
       : 'User';
     ```
     The test does not call or render `DashboardLayout` from `layout.tsx`. Because the test guards itself with `typeof (u as any).role === 'string'`, it produces a false-positive passing test while `layout.tsx` lines 160 & 222 remain unsafe.

---

## 2. Logic Chain

1. **Observation 1**: `canUserAccessRoute` normalizes relative traversal path segments (`/dashboard/../admin` -> `/admin`) before checking role permissions. Because `/admin` is not in `MASTER_TAILOR`'s allowed routes, access is correctly denied.
2. **Observation 2**: Adding `typeof role !== 'string'` in `normalizeRole` ensures that primitive types (numbers, booleans) or object types passed as roles return `null` rather than causing runtime string method exceptions.
3. **Observation 3**: In `apps/web/src/app/(dashboard)/layout.tsx`, `currentUser.role.replace('_', ' ')` is called unconditionally on lines 160 and 222. When a user profile is missing the `role` key or contains a non-string `role` value, React rendering will invoke `.replace` on `undefined`/`null`/`number`, throwing an unhandled `TypeError` that crashes the dashboard UI.
4. **Observation 4**: The test suite `rbac-adversarial-m4.test.ts` passes 100% because Subsuite 4 tests a mock local variable check (`typeof (u as any).role === 'string'`) in the test script rather than asserting the safety of `layout.tsx`.

---

## 3. Caveats

- `rbac-utils.ts` functions (`normalizeRole`, `canUserAccessRoute`, `filterNavItemsForRole`) are robust and hardened.
- The defect is strictly isolated to lines 160 and 222 of `apps/web/src/app/(dashboard)/layout.tsx`.

---

## 4. Conclusion

The re-audit verdict is **REQUEST_CHANGES**.

### Required Action Items:
1. Update `apps/web/src/app/(dashboard)/layout.tsx` (lines 160 & 222) to safely check that `currentUser.role` is a string before invoking `.replace()`, e.g.:
   ```tsx
   {typeof currentUser?.role === 'string' ? currentUser.role.replace('_', ' ') : 'User'}
   ```
2. Re-run `npm test` in `apps/web` to confirm all 943 tests remain passing.

---

## 5. Verification Method

To independently verify this finding:

1. **Inspect Layout Code**:
   - File: `apps/web/src/app/(dashboard)/layout.tsx`
   - Check lines 160 and 222: observe `{currentUser.role.replace('_', ' ')}` without `typeof currentUser.role === 'string'` guards.

2. **Simulate Storage User with Missing / Non-String Role**:
   - Set `localStorage.setItem('yh_auth_user', JSON.stringify({ name: 'Test', role: 123 }))` or `JSON.stringify({ name: 'Test' })`.
   - Render `DashboardLayout` — observe `TypeError: currentUser.role.replace is not a function` or `Cannot read properties of undefined (reading 'replace')`.

3. **Verify Fix**:
   - Apply string type check guard on lines 160 and 222 in `layout.tsx`.
   - Run `cd apps/web && npm test` -> Expect 943 PASSED, 0 FAILED.
