# Milestone 2 Investigation Handoff Report: Onboarding Form Draft Autosave & Customer Directory Persistence

**Agent**: M2 Explorer 1  
**Working Directory**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_m2_1`  
**Date**: 2026-08-07  

---

## 1. Observation

Direct code examination of relevant source files revealed the following exact state and locations:

### 1. Onboarding Form (`apps/web/src/app/onboarding/page.tsx`)
- **State declaration** (lines 90–104):
  ```typescript
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formState, setFormState] = useState({
    boutiqueName: '',
    slug: '',
    isSlugManuallyEdited: false,
    city: '',
    phone: '',
    templates: ['mens_ethnic', 'mens_western', 'womens_ethnic', 'womens_couture'],
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  ```
- **Local Storage Usage** (lines 270–324):
  `yh_auth_user` is only set upon `handleFinalSubmit` completion:
  ```typescript
  setLocalStorage('yh_auth_user', authObject);
  ```
- **Observed Gap**: No `useEffect` exists to load or save drafts to key `yh_onboarding_draft`. Refreshing or navigating away clears all form inputs and resets wizard step back to 1.

### 2. Customer Directory (`apps/web/src/app/(dashboard)/customers/page.tsx`)
- **Initial State declaration** (line 148):
  ```typescript
  const [customersList, setCustomersList] = useState<Customer[]>(initialCustomers);
  ```
  where `initialCustomers` (lines 40–145) is a hardcoded array of 8 mock customer objects.
- **Add Customer Handler** (lines 191–225):
  ```typescript
  setCustomersList([createdCustomer, ...customersList]);
  setIsAddModalOpen(false);
  ```
- **Observed Gap**: `customersList` is initialized directly from `initialCustomers` without inspecting local storage. When a new customer is created, state is updated in memory only without calling `setLocalStorage('yh_customers', nextList)`. Refreshing the page reverts the directory to `initialCustomers`.

### 3. Safe Storage Utilities (`apps/web/src/lib/storage-utils.ts`)
- Implements SSR `typeof window === 'undefined'` checks, missing key checks (`null`/`undefined`), and `try/catch` JSON parsing error handling (lines 7–35).
- Returns `fallbackValue` on any storage read error or empty state.

---

## 2. Logic Chain

1. **Onboarding Form Draft Autosave Requirements**:
   - The user requires automatic draft autosave to `yh_onboarding_draft` / `yh_auth_user` with debounce/effect on field changes.
   - To achieve this safely without breaking SSR hydration:
     - Component must run an initial `useEffect` on mount to retrieve `yh_onboarding_draft` via `getLocalStorage<OnboardingDraft | null>('yh_onboarding_draft', null)`.
     - Upon loading a draft, `step` and `formState` fields (excluding cleartext passwords for security) are restored.
     - An `isHydrated` state flag prevents premature overwriting during mount.
     - A debounced `useEffect` (350ms timer) monitors `formState` and `step` changes, persisting updated inputs to `setLocalStorage('yh_onboarding_draft', draftPayload)`.
     - Upon form completion, `removeLocalStorage('yh_onboarding_draft')` is invoked to clear the draft, while `setLocalStorage('yh_auth_user', authObject)` persists the active tenant owner.

2. **Customer Directory Persistence Requirements**:
   - The user requires additions/edits to persist dynamically to `yh_customers` in local storage.
   - To achieve this:
     - On mount, `useEffect` reads `yh_customers` using `getLocalStorage<Customer[] | null>('yh_customers', null)`.
     - If non-empty array exists, set `customersList` to saved items.
     - If empty or `null`, populate with `initialCustomers` default dataset and call `setLocalStorage('yh_customers', initialCustomers)` to seed initial state.
     - On adding a customer (`handleAddCustomer`), compute `nextList = [createdCustomer, ...customersList]`, update React state, and call `setLocalStorage('yh_customers', nextList)`.
     - On updating a customer (`handleUpdateCustomer`), map through `customersList`, update item, and call `setLocalStorage('yh_customers', nextList)`.

3. **Fallback Defaults & Null-Safety Requirements**:
   - When local storage is empty or corrupted (e.g. invalid JSON or missing key), `getLocalStorage` returns the fallback value.
   - Component state must validate types with `Array.isArray()` before calling array methods, ensuring zero runtime exceptions on empty or fresh local storage.

---

## 3. Caveats

- **Read-Only Investigation**: As per explorer agent identity, source code modification of `apps/web/src` was not performed by this agent. Detailed technical strategy and code blueprints have been documented in `analysis.md` for the implementer agent.
- **Passwords Excluded from Draft**: Security best practice requires excluding `password` and `confirmPassword` from local storage draft payload `yh_onboarding_draft`. They will be entered during Step 3 submission.
- **SSR Hydration Safety**: Local storage reads and writes MUST occur inside `useEffect` blocks after client hydration to prevent Next.js SSR/hydration markup mismatch warnings.

---

## 4. Conclusion

The technical strategy for Milestone 2 Onboarding Draft Autosave & Customer Directory Persistence is fully mapped:
- `apps/web/src/app/onboarding/page.tsx`: Integrate mount hydration `useEffect` for `yh_onboarding_draft` / `yh_auth_user`, debounced field autosave `useEffect`, and post-submit draft cleanup.
- `apps/web/src/app/(dashboard)/customers/page.tsx`: Integrate mount hydration `useEffect` for `yh_customers` with default seeding, and persist list updates on add/edit/delete/VIP mutations via `setLocalStorage('yh_customers', nextList)`.
- Fallbacks & Null-Safety: Guaranteed by `storage-utils.ts` wrapper and `Array.isArray()` validation checks.

---

## 5. Verification Method

To verify the implementation once applied by the implementer agent:

1. **Onboarding Form Draft Autosave Verification**:
   - Open `/onboarding`, fill in Step 1 (Boutique Name: "Savile Atelier", Slug: "savile-atelier"), proceed to Step 2, select measurement templates.
   - Refresh browser page.
   - Inspect `localStorage.getItem('yh_onboarding_draft')`.
   - Verify form state restores Step 2 with "Savile Atelier" and selected templates preserved.
   - Complete Step 3 submission -> verify `yh_onboarding_draft` is cleared and `yh_auth_user` is stored.

2. **Customer Directory Persistence Verification**:
   - Open `/customers`, click "Add Customer", enter Name: "Test Customer", Phone: "+91 99999 88888", click "Save Customer".
   - Verify "Test Customer" appears in the table.
   - Refresh browser page.
   - Inspect `localStorage.getItem('yh_customers')`.
   - Verify "Test Customer" persists in table across reloads.

3. **Empty Storage Safety Verification**:
   - Clear local storage via `localStorage.clear()` in browser DevTools console.
   - Navigate to `/onboarding` and `/customers`.
   - Verify pages render smoothly without console exceptions or runtime errors, defaulting to initial mock data where appropriate.

4. **Automated Test Verification**:
   - Run tests in workspace:
     `npm --prefix apps/web test`
