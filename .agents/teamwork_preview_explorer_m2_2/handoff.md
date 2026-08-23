# Handoff Report: Staff Management & Order Form Draft Autosave (Milestone 2)

**Agent ID**: `teamwork_preview_explorer_m2_2`  
**Role**: Teamwork Explorer (Read-Only Investigator)  
**Target Project**: YellowHouse Tailoring OS (`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`)  
**Date**: 2026-08-07  

---

## 1. Observation

Direct observations from source code audits and test execution in `apps/web`:

1. **Staff Management Page (`apps/web/src/app/(dashboard)/staff/page.tsx`)**:
   - Line 59: `const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);` — `staffList` is initialized ONLY with hardcoded `INITIAL_STAFF`.
   - Line 19: `import { getLocalStorage } from '@/lib/storage-utils';` — `getLocalStorage` is imported but only called for key `'yh_auth_user'` on line 78. `setLocalStorage` and `removeLocalStorage` are not imported or called.
   - Line 117 (`handleAddStaff`): `setStaffList(prev => [newMember, ...prev]);` — updates React state in memory only. Does NOT save to `'yh_staff'`.
   - Line 147 (`handleRemoveStaff`): `setStaffList(prev => prev.filter(st => st.id !== id));` — updates React state in memory only. Does NOT save to `'yh_staff'`.
   - Lines 67–72: `newStaffName`, `newStaffEmail`, `newStaffPassword`, `newStaffRole`, `newStaffBranch` exist in transient `useState` without draft persistence (`'yh_staff_draft'`).

2. **Order Management Page (`apps/web/src/app/(dashboard)/orders/page.tsx`)**:
   - Lines 192–195:
     ```typescript
     useEffect(() => {
       const storedOrders = getLocalStorage<Order[]>('yh_orders', initialOrders);
       setOrders(storedOrders);
     }, []);
     ```
     `yh_orders` is read on mount, but there is no array type safety check if `getLocalStorage` returns non-array (e.g. `null`).
   - Lines 198–209: `selectedClientId`, `dueDate`, `notes`, `items` (including fabric SKU, meters, unit price, `fabricImage`, `liningImage`, `materialNotes`) are initialized in `useState`.
   - Key `'yh_orders_draft'` is **not referenced anywhere** in `orders/page.tsx`. If a user refreshes or navigates away while building a multi-item order with swatches and notes, all progress is wiped.
   - Lines 374–375 (`handleSaveOrder`):
     ```typescript
     const updatedOrders = [newOrder, ...orders];
     setOrders(updatedOrders);
     setLocalStorage('yh_orders', updatedOrders);
     ```
     `yh_orders` is saved, but `removeLocalStorage('yh_orders_draft')` is not called to clean up draft state.

3. **Storage Utility (`apps/web/src/lib/storage-utils.ts`)**:
   - Lines 12–16:
     ```typescript
     const item = window.localStorage.getItem(key);
     if (item === null || item === undefined) {
       return fallbackValue;
     }
     return JSON.parse(item) as T;
     ```
     If `window.localStorage.getItem(key)` returns string `"null"`, `JSON.parse("null")` yields `null`. The `item === null` check evaluates to `false`, causing `getLocalStorage('yh_orders', [])` to return `null` instead of `[]`.

4. **Test Suite Failure Observation**:
   - Command: `npm test` inside `apps/web`
   - Output error:
     ```
     Error: Cannot find module 'C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web\src\__tests__\storage-utils.test' imported from C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web\src\__tests__\run-tests.ts
     ```
     Import in `run-tests.ts` line 1: `import { runStorageUtilsTests } from './storage-utils.test';` requires `.ts` extension or relative module resolution fix in Node ESM mode.

---

## 2. Logic Chain

1. **Staff Management State Persistence Failure**:
   - *Observation 1* shows `staffList` is initialized from `INITIAL_STAFF` on line 59 and modified in `handleAddStaff` (line 117) and `handleRemoveStaff` (line 147) without calling `setLocalStorage('yh_staff', ...)` or reading `yh_staff` on mount.
   - *Reasoning*: Any staff added or removed by boutique owners exists only in volatile browser memory. Refreshing the browser or navigating away immediately resets the staff list back to `INITIAL_STAFF`.
   - *Requirement Reference*: PROJECT.md Feature 6 & ORIGINAL_REQUEST R2 require staff additions/edits to persist dynamically to `yh_staff`.

2. **Order Form Draft Autosave Missing**:
   - *Observation 2* shows `orders/page.tsx` has no reference to `yh_orders_draft`, despite having complex multi-item state (`items` array with swatches, lining choices, material notes, client selection, due date, notes).
   - *Reasoning*: Custom order configuration takes significant effort (selecting fabric presets, configuring meters, uploading fabric/lining swatches, writing trim notes). Without autosave to `yh_orders_draft`, any accidental navigation or tab reload destroys the user's progress.
   - *Requirement Reference*: PROJECT.md Feature 7 & ORIGINAL_REQUEST R2 require order form inputs, swatches, and client details to autosave dynamically to `yh_orders_draft`.

3. **Null-Safety & Corruption Vulnerability**:
   - *Observation 3* shows `getLocalStorage` returns `null` if the localStorage key contains string `"null"`.
   - *Reasoning*: Component code like `orders.filter(...)` in `orders/page.tsx` line 223 expects an array. If `getLocalStorage` returns `null`, calling `.filter()` throws an unhandled `TypeError: Cannot read properties of null`, breaking the page.
   - *Requirement Reference*: ORIGINAL_REQUEST R1 & R2 require safe local storage accessors and zero runtime exceptions on empty or corrupted storage.

4. **Test Infrastructure Resolution Requirement**:
   - *Observation 4* shows `run-tests.ts` fails to import `./storage-utils.test` due to missing `.ts` file extension in ESM resolution mode.
   - *Reasoning*: Fix is required in test import path so automated tests execute cleanly.

---

## 3. Caveats

1. **Cross-Tab Synchronization**: LocalStorage updates trigger `storage` events across browser tabs. Current scope focuses on single-tab persistence and mount restoration. Real-time multi-tab `window.addEventListener('storage', ...)` sync can be added as an optional enhancement.
2. **Fabric Photo Uploads**: Currently, custom fabric/lining photo additions use mock image URLs (`https://images.unsplash.com/...`). Persistence saves these image URL strings into `yh_orders_draft` and `yh_orders`.
3. **No Code Written**: This is a read-only investigation and design blueprint step. No implementation changes were committed to `apps/web/src`.

---

## 4. Conclusion

The current implementation of YellowHouse Tailoring OS requires targeted modifications across three core files to achieve Milestone 2 compliance:

1. **`apps/web/src/lib/storage-utils.ts`**: Update `getLocalStorage` to explicitly guard against string `"null"`, `"undefined"`, and parsed `null` returns.
2. **`apps/web/src/app/(dashboard)/staff/page.tsx`**: Add `useEffect` mount loader for `yh_staff` with `INITIAL_STAFF` fallback, add `setLocalStorage('yh_staff', ...)` calls in `handleAddStaff` and `handleRemoveStaff`, and implement `yh_staff_draft` autosave for recruitment form inputs.
3. **`apps/web/src/app/(dashboard)/orders/page.tsx`**: Add `useEffect` mount loader for `yh_orders_draft`, add continuous `useEffect` draft autosave for client selection, due date, notes, items array, swatches, and material notes. Clear `yh_orders_draft` upon order submission, and add array safety checks when reading `yh_orders`.

Complete technical strategy and code modification blueprints have been written to `analysis.md` in the working directory.

---

## 5. Verification Method

### 5.1 Automated Unit & Integration Tests

1. Fix import path in `apps/web/src/__tests__/run-tests.ts`: change `./storage-utils.test` to `./storage-utils.test.ts`.
2. Run command:
   ```bash
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npm test
   ```
3. Expected Output:
   - All suites pass cleanly: Storage Utils, POM Schemas, Posture Profile Engine, Dynamic Ease Math, Fabric Yield Math, Landmark Validation.

### 5.2 Manual State Persistence Verification

1. **Staff Management Persistence (`yh_staff`)**:
   - Navigate to `/staff`.
   - Click "Hire New Specialist", enter Name: "Master Zafar", Email: "zafar@yellowhouse.com", Role: "MASTER_TAILOR", Branch: "Main Flagship".
   - Click "Add Specialist".
   - Refresh the page (`F5` or `Ctrl+R`).
   - Verify "Master Zafar" remains in the active headcount table.
   - In DevTools Console: `localStorage.getItem('yh_staff')` -> verify JSON contains "Master Zafar".
   - Click trash icon to remove "Master Zafar", refresh page -> verify removal persists.

2. **Order Form Draft Autosave Persistence (`yh_orders_draft`)**:
   - Navigate to `/orders` -> Click "Create New Order" tab.
   - Select Client: "Ananya Sharma". Set Due Date: "2026-09-01".
   - Add Garment Item #1: Sherwani, enter Fabric SKU: "SKU-SILK-999", set Fabric Meters: 5.2, select Swatch Preset: "Emerald Green Velvet", enter Trim Specs: "Gold zari embroidery on collar".
   - Click "Add Item" for Garment Item #2: Lehenga Choli.
   - Enter Special Notes: "Urgent wedding delivery request".
   - Without submitting, navigate to `/customers` tab, then return to `/orders` -> "Create New Order" tab (or refresh page).
   - Verify Client, Due Date, 2 Garment Items, Swatches, Trim Specs, and Special Notes are restored completely.
   - Click "Send Quotation via WhatsApp" or "Save as Draft".
   - In DevTools Console: `localStorage.getItem('yh_orders_draft')` -> verify returned value is `null` (draft cleared).
   - In DevTools Console: `localStorage.getItem('yh_orders')` -> verify new order appended to `yh_orders`.

3. **Empty & Corrupted LocalStorage Resilience**:
   - In DevTools Console: `localStorage.setItem('yh_staff', 'null')`, `localStorage.setItem('yh_orders', '{ invalid json')`, `localStorage.setItem('yh_orders_draft', 'null')`.
   - Reload `/staff` and `/orders` pages.
   - Verify zero runtime errors/white screens occur. Pages render cleanly using `INITIAL_STAFF` and `initialOrders` fallback defaults.
