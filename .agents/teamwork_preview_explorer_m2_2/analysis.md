# Technical Strategy & Architecture Blueprint: Staff Management & Order Form Draft Autosave (Milestone 2)

**Author:** M2 Explorer 2 (`teamwork_preview_explorer_m2_2`)  
**Target Project:** YellowHouse Tailoring OS (`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`)  
**Date:** 2026-08-07  

---

## 1. Executive Summary

Milestone 2 requires dynamic local storage persistence and state resilience across all primary forms in YellowHouse Tailoring OS. This report covers the technical analysis, current code state, flaw identification, architectural blueprint, and step-by-step file modification plan for:
1. **Staff Management Form & List Persistence (`yh_staff`)**
2. **Order Creation Form, Items, Swatches & Client Details Autosave (`yh_orders_draft` & `yh_orders`)**
3. **Fallback Defaults, Null Safety & Storage Corruption Resilience**

Currently, the Staff page (`apps/web/src/app/(dashboard)/staff/page.tsx`) relies purely on in-memory React state initialized with a hardcoded `INITIAL_STAFF` array. Any hired or terminated specialists are lost upon page reload. The Order Creation form (`apps/web/src/app/(dashboard)/orders/page.tsx`) persists confirmed orders to `yh_orders` upon submit, but completely lacks draft autosave (`yh_orders_draft`). If a user navigates away or refreshes while configuring complex multi-item garment specs, fabric swatches, lining choices, or trim instructions, all inputs are destroyed. Furthermore, `storage-utils.ts` lacks validation guards against stringified `"null"` values and corrupted non-array payloads, creating crash risks (`.map` / `.filter` on null).

This blueprint details the exact changes needed to achieve 100% draft persistence, zero data loss, and crash-proof null safety.

---

## 2. Current Implementation Code Audit

### 2.1 Staff Management (`apps/web/src/app/(dashboard)/staff/page.tsx`)

- **State Initialization (Line 59)**:
  ```typescript
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  ```
  `staffList` is initialized strictly with the hardcoded 5-member `INITIAL_STAFF` array (`Master Latif Khan`, `Sarah Jenkins`, `Rafi Craftsman`, `Anik Dev`, `Priya Mehta`).
- **Storage Utility Import (Line 19)**:
  `getLocalStorage` is imported, but only used on line 78 for `yh_auth_user`. `setLocalStorage` and `removeLocalStorage` are not imported or used anywhere.
- **Add Staff Handler (`handleAddStaff`, Lines 84–143)**:
  ```typescript
  const newMember: StaffMember = {
    id: `st-${Date.now().toString().slice(-4)}`,
    name: newStaffName.trim(),
    email: newStaffEmail.trim(),
    role: newStaffRole,
    branch: newStaffBranch,
    status: 'Active',
    hiredAt: new Date().toISOString().split('T')[0]
  };
  setStaffList(prev => [newMember, ...prev]);
  ```
  Updates React memory state `setStaffList` only. No `setLocalStorage('yh_staff', ...)` call is performed.
- **Remove Staff Handler (`handleRemoveStaff`, Lines 145–149)**:
  ```typescript
  setStaffList(prev => prev.filter(st => st.id !== id));
  ```
  Updates React state only. No local storage sync.
- **Recruitment Form Inputs (Lines 67–72)**:
  `newStaffName`, `newStaffEmail`, `newStaffPassword`, `newStaffRole`, `newStaffBranch` exist only in transient `useState`. If the modal is closed or page refreshed mid-entry, draft input is erased.

---

### 2.2 Order Management (`apps/web/src/app/(dashboard)/orders/page.tsx`)

- **State Initialization & Mount Load (Lines 186, 192–195)**:
  ```typescript
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    const storedOrders = getLocalStorage<Order[]>('yh_orders', initialOrders);
    setOrders(storedOrders);
  }, []);
  ```
  `yh_orders` is read on mount, but if `localStorage` returns a non-array or `null` (e.g. key contains `"null"` string), `setOrders` receives non-array, breaking downstream calls like `orders.filter` on line 223.
- **Order Creation Form State (Lines 198–209)**:
  ```typescript
  const [selectedClientId, setSelectedClientId] = useState<string>(customerList[0].id);
  const [dueDate, setDueDate] = useState<string>('2026-08-25');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<OrderItemRow[]>([
    {
      id: 'item-1',
      garmentType: 'Sherwani',
      fabricSku: 'SKU-SHER-901',
      fabricMeters: 4.5,
      unitPrice: 28000
    }
  ]);
  ```
  Order creation form state consists of `selectedClientId`, `dueDate`, `notes`, and an array of `items` containing fabric SKUs, meters, unit prices, `fabricImage` (swatch preset/URL), `liningImage` (lining preset/URL), and `materialNotes` (trims/zippers/collar specs).
- **Absence of Draft Autosave (`yh_orders_draft`)**:
  There is **zero** code reading from or writing to `yh_orders_draft`.
  When a user adds multiple garment items, attaches swatches, or writes detailed tailoring notes:
  - Navigating to another dashboard tab or refreshing wipes out the draft.
  - Clicking "Save as Draft" currently generates an active order with status `'DRAFT'` into `yh_orders`, rather than saving the form state draft for ongoing editing.
- **Order Creation Handler (`handleSaveOrder`, Lines 354–419)**:
  ```typescript
  const updatedOrders = [newOrder, ...orders];
  setOrders(updatedOrders);
  setLocalStorage('yh_orders', updatedOrders);
  ```
  Saves to `yh_orders`, but does not clear `yh_orders_draft` from localStorage.

---

### 2.3 Local Storage Utilities (`apps/web/src/lib/storage-utils.ts`)

- **Current Implementation (Lines 7–21)**:
  ```typescript
  export function getLocalStorage<T>(key: string, fallbackValue: T): T {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return fallbackValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) {
        return fallbackValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[storage-utils] Error reading key "${key}" from localStorage:`, error);
      return fallbackValue;
    }
  }
  ```
- **Null Safety Hole**:
  If `window.localStorage.getItem(key)` returns string `"null"`, `JSON.parse("null")` evaluates to JavaScript `null`. The check `item === null` evaluates to `false` because `item` is `"null"`. Thus, `getLocalStorage('yh_orders', [])` returns `null` instead of `[]`!
  Calling `.filter()` or `.map()` on `orders` then throws an uncaught `TypeError: Cannot read properties of null`.

---

## 3. Core Architectural Strategy

### 3.1 Staff Management Strategy (`yh_staff` & `yh_staff_draft`)

```
   ┌─────────────────────────────────────────────────────────────┐
   │                      StaffPage Mount                        │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                   Read `yh_staff` via getLocalStorage
                                  │
                  Is valid non-empty StaffMember[]?
                           ├───────────┐
                          YES          NO
                           │           │
                    setStaffList   Fallback to INITIAL_STAFF
                           │       & seed to `yh_staff`
                           └─────┬─────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
  handleAddStaff()                             handleRemoveStaff()
  1. Add new member                            1. Filter out member
  2. setStaffList(updated)                     2. setStaffList(updated)
  3. setLocalStorage('yh_staff', updated)      3. setLocalStorage('yh_staff', updated)
  4. removeLocalStorage('yh_staff_draft')
```

1. **Mount Synchronization**: Load `yh_staff` from localStorage on page mount. If absent or empty, seed `INITIAL_STAFF` into localStorage under key `yh_staff`.
2. **Mutation Synchronization**: Whenever a staff member is added or terminated, immediately update `yh_staff` in localStorage.
3. **Form Draft Autosave (`yh_staff_draft`)**:
   - Store temporary values (`name`, `email`, `role`, `branch`) in `yh_staff_draft`.
   - On modal input change, update `yh_staff_draft`.
   - On successful recruitment, clear `yh_staff_draft`.

---

### 3.2 Order Form Draft Autosave Strategy (`yh_orders_draft` & `yh_orders`)

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    OrderManagementPage                      │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
      Mount / Load `yh_orders`          Mount / Load `yh_orders_draft`
      (Array fallback guard)            (Form state draft restore)
                 │                                 │
                 │                      User edits client, items,
                 │                      swatches, or notes
                 │                                 │
                 │                      Autosave to `yh_orders_draft`
                 │                                 │
                 └────────────────┬────────────────┘
                                  │
                        handleSaveOrder()
                        1. Construct new Order
                        2. Append to `yh_orders`
                        3. setLocalStorage('yh_orders', updated)
                        4. removeLocalStorage('yh_orders_draft')
                        5. Reset form to clean default state
```

1. **Draft Data Structure**:
   ```typescript
   export interface OrderFormDraft {
     selectedClientId: string;
     dueDate: string;
     notes: string;
     items: OrderItemRow[];
     lastSavedAt: string;
   }
   ```
2. **Mount Draft Restoration**:
   - On component mount, call `getLocalStorage<OrderFormDraft | null>('yh_orders_draft', null)`.
   - If a valid draft with items exists, populate `selectedClientId`, `dueDate`, `notes`, and `items`.
3. **Continuous Dynamic Autosave**:
   - Use a `useEffect` watching `[selectedClientId, dueDate, notes, items]`.
   - Automatically persist draft updates to `yh_orders_draft` whenever form fields change.
4. **Draft Clearance on Order Submission**:
   - When an order is saved (either as CONFIRMED or DRAFT in active orders list), invoke `removeLocalStorage('yh_orders_draft')` to clear the draft workspace.

---

### 3.3 Defensive Storage & Null-Safety Strategy

1. **Enhanced `getLocalStorage` Helper**:
   - Guard against string `"null"`, `"undefined"`, and invalid shapes.
   - If `JSON.parse` yields `null` or `undefined`, explicitly return `fallbackValue`.
2. **Array Validation Wrappers**:
   - When retrieving lists (`yh_staff`, `yh_orders`, `yh_customers`), enforce `Array.isArray(result) && result.length > 0` validation before setting state.
3. **Customer Synchronization**:
   - Read `yh_customers` in `orders/page.tsx` to dynamically include newly added customers alongside the standard fallback options.

---

## 4. Detailed File Modification Blueprint

### 4.1 `apps/web/src/lib/storage-utils.ts`

**Objective**: Fix null parsing vulnerability and ensure absolute type safety on empty or malformed storage keys.

```typescript
export function getLocalStorage<T>(key: string, fallbackValue: T): T {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallbackValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined || item === 'null' || item === 'undefined') {
      return fallbackValue;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      return fallbackValue;
    }
    return parsed as T;
  } catch (error) {
    console.warn(`[storage-utils] Error reading key "${key}" from localStorage:`, error);
    return fallbackValue;
  }
}
```

---

### 4.2 `apps/web/src/app/(dashboard)/staff/page.tsx`

**Objective**: Implement dynamic persistence for staff additions/removals (`yh_staff`) and recruitment form drafts (`yh_staff_draft`).

1. **Import `setLocalStorage` and `removeLocalStorage`**:
   ```typescript
   import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
   ```
2. **Staff List Mount Effect**:
   ```typescript
   useEffect(() => {
     const stored = getLocalStorage<StaffMember[]>('yh_staff', INITIAL_STAFF);
     if (Array.isArray(stored) && stored.length > 0) {
       setStaffList(stored);
     } else {
       setStaffList(INITIAL_STAFF);
       setLocalStorage('yh_staff', INITIAL_STAFF);
     }
   }, []);
   ```
3. **Staff Recruitment Draft Load & Autosave**:
   - Interface:
     ```typescript
     interface StaffFormDraft {
       name: string;
       email: string;
       role: string;
       branch: string;
     }
     ```
   - Load draft on mount / modal open:
     ```typescript
     useEffect(() => {
       const draft = getLocalStorage<StaffFormDraft | null>('yh_staff_draft', null);
       if (draft) {
         if (draft.name) setNewStaffName(draft.name);
         if (draft.email) setNewStaffEmail(draft.email);
         if (draft.role) setNewStaffRole(draft.role);
         if (draft.branch) setNewStaffBranch(draft.branch);
       }
     }, []);
     ```
   - Autosave draft when inputs change:
     ```typescript
     useEffect(() => {
       if (newStaffName || newStaffEmail) {
         setLocalStorage('yh_staff_draft', {
           name: newStaffName,
           email: newStaffEmail,
           role: newStaffRole,
           branch: newStaffBranch
         });
       }
     }, [newStaffName, newStaffEmail, newStaffRole, newStaffBranch]);
     ```
4. **Update `handleAddStaff`**:
   - Persist updated list to `yh_staff`:
     ```typescript
     const updatedList = [newMember, ...staffList];
     setStaffList(updatedList);
     setLocalStorage('yh_staff', updatedList);
     removeLocalStorage('yh_staff_draft');
     ```
5. **Update `handleRemoveStaff`**:
   - Persist updated list to `yh_staff`:
     ```typescript
     const updatedList = staffList.filter(st => st.id !== id);
     setStaffList(updatedList);
     setLocalStorage('yh_staff', updatedList);
     ```

---

### 4.3 `apps/web/src/app/(dashboard)/orders/page.tsx`

**Objective**: Add `yh_orders_draft` autosave for Order Creation form (items, swatches, materials, client details), ensure array safety on `yh_orders`, and clear draft upon order creation.

1. **Order Form Draft Type Definition**:
   ```typescript
   export interface OrderFormDraft {
     selectedClientId: string;
     dueDate: string;
     notes: string;
     items: OrderItemRow[];
     updatedAt: string;
   }
   ```
2. **Mount Effect for `yh_orders` Safety**:
   ```typescript
   useEffect(() => {
     const storedOrders = getLocalStorage<Order[]>('yh_orders', initialOrders);
     if (Array.isArray(storedOrders) && storedOrders.length > 0) {
       setOrders(storedOrders);
     } else {
       setOrders(initialOrders);
       setLocalStorage('yh_orders', initialOrders);
     }
   }, []);
   ```
3. **Mount Effect for `yh_orders_draft` Load**:
   ```typescript
   useEffect(() => {
     const draft = getLocalStorage<OrderFormDraft | null>('yh_orders_draft', null);
     if (draft && typeof draft === 'object' && Array.isArray(draft.items) && draft.items.length > 0) {
       if (draft.selectedClientId) setSelectedClientId(draft.selectedClientId);
       if (draft.dueDate) setDueDate(draft.dueDate);
       if (draft.notes !== undefined) setNotes(draft.notes);
       setItems(draft.items);
     }
   }, []);
   ```
4. **Autosave Draft Effect**:
   ```typescript
   useEffect(() => {
     // Persist current draft state to localStorage
     const draft: OrderFormDraft = {
       selectedClientId,
       dueDate,
       notes,
       items,
       updatedAt: new Date().toISOString()
     };
     setLocalStorage('yh_orders_draft', draft);
   }, [selectedClientId, dueDate, notes, items]);
   ```
5. **Update `handleSaveOrder`**:
   - Upon creating order:
     ```typescript
     const updatedOrders = [newOrder, ...orders];
     setOrders(updatedOrders);
     setLocalStorage('yh_orders', updatedOrders);
     removeLocalStorage('yh_orders_draft'); // Clear draft upon submit
     ```
   - Reset form state to initial defaults.
6. **Dynamic Client Directory Loading**:
   - Load customers from `yh_customers` with `customerList` fallback:
     ```typescript
     const activeCustomers = useMemo(() => {
       const stored = getLocalStorage<any[]>('yh_customers', customerList);
       return Array.isArray(stored) && stored.length > 0 ? stored : customerList;
     }, []);
     ```

---

## 5. Verification & Testing Strategy

1. **Unit Testing (`apps/web/src/__tests__/storage-utils.test.ts`)**:
   - Verify string `"null"` handling in `getLocalStorage`.
   - Verify array integrity checks.
2. **Integration Verification Command**:
   - Run `npm test` inside `apps/web` to confirm zero regressions across storage utils, posture calculation, SAM engine, and POM schemas.
3. **Manual Verification Workflow**:
   - Open `/staff`, add new specialist, refresh page -> verify specialist persists from `yh_staff`.
   - Delete specialist, refresh -> verify deletion persists.
   - Open `/orders` -> Create New Order tab. Fill client, 2 garment items, add fabric image URL, write material notes. Refresh page -> verify all fields restore from `yh_orders_draft`.
   - Submit order -> verify order added to `yh_orders` and `yh_orders_draft` cleared.
