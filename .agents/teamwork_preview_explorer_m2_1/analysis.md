# Milestone 2 Technical Strategy & Blueprint: Onboarding Draft Autosave & Customer Directory Persistence

**Architectural Focus**: Onboarding Form Draft Autosave (`yh_onboarding_draft` / `yh_auth_user`), Customer Management State Persistence (`yh_customers`), and Empty Storage Null-Safety.  
**Author**: M2 Explorer 1  
**Date**: 2026-08-07  
**Target Files**:
- `apps/web/src/app/onboarding/page.tsx`
- `apps/web/src/app/(dashboard)/customers/page.tsx`
- `apps/web/src/lib/storage-utils.ts`
- `apps/web/src/types/onboarding.ts`

---

## 1. Executive Summary & Observations

### Current State Assessment
1. **Onboarding Form (`apps/web/src/app/onboarding/page.tsx`)**:
   - Manages a 3-step setup wizard (`step` state: 1 = Boutique Identity, 2 = Measurement Templates, 3 = Atelier Owner Account).
   - Form fields (`boutiqueName`, `slug`, `city`, `phone`, `templates`, `ownerName`, `email`, `password`, `confirmPassword`) are stored entirely in React component state `formState`.
   - **Gap**: Field state is not persisted as the user navigates steps or types. Page reload resets all inputs to default empty state.
   - **Current Storage Access**: Only calls `setLocalStorage('yh_auth_user', authObject)` upon successful final form submission (lines 283, 304, 320). No draft storage under key `yh_onboarding_draft`.

2. **Customer Directory (`apps/web/src/app/(dashboard)/customers/page.tsx`)**:
   - Manages customer list (`customersList`), search filters (`searchQuery`, `genderFilter`, `vipOnly`), add modal (`isAddModalOpen`), and customer detail view modal (`selectedCustomer`).
   - `customersList` is initialized from a hardcoded array `initialCustomers` (lines 40–145, 8 mock records).
   - **Gap**: On mount, `customersList` does not load saved data from `localStorage` (`yh_customers`). When a user adds a customer via `handleAddCustomer` (lines 191–225), the item is added to React state only. Page refresh loses all new customers and restores the initial 8 mock items.
   - **Gap**: Customer edit action buttons only trigger the detail viewer modal. No full edit form handler or persistence exists for customer modifications.

3. **Storage Utility Infrastructure (`apps/web/src/lib/storage-utils.ts`)**:
   - Exports `getLocalStorage<T>(key: string, fallbackValue: T): T`, `setLocalStorage<T>(key: string, value: T): boolean`, and `removeLocalStorage(key: string): boolean`.
   - Includes window SSR checks, `null`/`undefined` checks, and `JSON.parse` try/catch exception handling.
   - **Validation Requirement**: Ensure all component data loading uses `getLocalStorage` with strict runtime array/object validation to handle empty or corrupted storage gracefully.

---

## 2. Onboarding Form Draft Autosave Architecture

### Storage Keys
- `yh_onboarding_draft`: Stores transient draft form state across wizard steps.
- `yh_auth_user`: Stores active logged-in atelier user/tenant profile upon completion.

### Draft Data Schema
```typescript
export interface OnboardingDraft {
  step: 1 | 2 | 3;
  formState: {
    boutiqueName: string;
    slug: string;
    isSlugManuallyEdited: boolean;
    city: string;
    phone: string;
    templates: string[];
    ownerName: string;
    email: string;
  };
  updatedAt: string;
}
```
*Note: Sensitive security credentials (`password`, `confirmPassword`) are omitted from local storage draft for security best practice.*

### Implementation Blueprint for `apps/web/src/app/onboarding/page.tsx`

```
 [Mount] -> Check `yh_onboarding_draft` via getLocalStorage
               ├─ If draft exists -> Restore step & formState
               └─ If no draft     -> Fallback to default state
                       │
                       ▼
               Set isHydrated = true
                       │
                       ▼
 [Field Change / Step Change] -> Debounced useEffect (350ms)
                                       │
                                       ▼
                       Write to `yh_onboarding_draft`
                       (Excluding sensitive passwords)
                       │
                       ▼
 [Final Submit Success] -> Write `yh_auth_user`
                           Remove `yh_onboarding_draft`
                           Redirect to /dashboard
```

#### Blueprint Code Changes in `onboarding/page.tsx`:

1. **Imports & Hydration Flag**:
```typescript
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';

// Inside component:
const DRAFT_STORAGE_KEY = 'yh_onboarding_draft';
const [isHydrated, setIsHydrated] = useState(false);
```

2. **Mount Hydration Effect**:
```typescript
useEffect(() => {
  const savedDraft = getLocalStorage<OnboardingDraft | null>(DRAFT_STORAGE_KEY, null);
  if (savedDraft && typeof savedDraft === 'object' && savedDraft.formState) {
    setFormState((prev) => ({
      ...prev,
      ...savedDraft.formState,
      password: '',
      confirmPassword: '',
    }));
    if (savedDraft.step && [1, 2, 3].includes(savedDraft.step)) {
      setStep(savedDraft.step);
    }
  } else {
    // Optional check: pre-fill owner details from yh_auth_user if present
    const authUser = getLocalStorage<any>('yh_auth_user', null);
    if (authUser && authUser.email) {
      setFormState((prev) => ({
        ...prev,
        ownerName: authUser.name || prev.ownerName,
        email: authUser.email || prev.email,
      }));
    }
  }
  setIsHydrated(true);
}, []);
```

3. **Debounced Autosave Effect**:
```typescript
useEffect(() => {
  if (!isHydrated) return;

  const timer = setTimeout(() => {
    const draftPayload: OnboardingDraft = {
      step,
      formState: {
        boutiqueName: formState.boutiqueName,
        slug: formState.slug,
        isSlugManuallyEdited: formState.isSlugManuallyEdited,
        city: formState.city,
        phone: formState.phone,
        templates: formState.templates,
        ownerName: formState.ownerName,
        email: formState.email,
      },
      updatedAt: new Date().toISOString(),
    };
    setLocalStorage(DRAFT_STORAGE_KEY, draftPayload);
  }, 350);

  return () => clearTimeout(timer);
}, [formState, step, isHydrated]);
```

4. **Completion Cleanup**:
```typescript
// Inside handleFinalSubmit after successful registration/auth object creation:
removeLocalStorage(DRAFT_STORAGE_KEY);
```

---

## 3. Customer Directory Persistence Architecture

### Storage Key
- `yh_customers`: Stores array of customer records (`Customer[]`).

### Customer Record Schema
```typescript
export interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: 'Men' | 'Women';
  preferredFit: string;
  isVip: boolean;
  measurementsCount: number;
  lastVisit: string;
  initials: string;
  email?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Implementation Blueprint for `apps/web/src/app/(dashboard)/customers/page.tsx`

1. **Hydration and Default Seeding**:
```typescript
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';

const CUSTOMERS_STORAGE_KEY = 'yh_customers';

export default function CustomerDirectoryPage() {
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCustomers = getLocalStorage<Customer[] | null>(CUSTOMERS_STORAGE_KEY, null);
    if (Array.isArray(savedCustomers) && savedCustomers.length > 0) {
      setCustomersList(savedCustomers);
    } else {
      // Seed storage with initial default mock array if empty or missing
      setCustomersList(initialCustomers);
      setLocalStorage(CUSTOMERS_STORAGE_KEY, initialCustomers);
    }
    setIsHydrated(true);
  }, []);
```

2. **Add Customer Persistence (`handleAddCustomer`)**:
```typescript
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    const initials = newCustomer.name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newId = `CUST-${String(Date.now()).slice(-4)}`;

    const createdCustomer: Customer = {
      id: newId,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      gender: newCustomer.gender,
      preferredFit: newCustomer.preferredFit,
      isVip: newCustomer.isVip,
      measurementsCount: 1,
      lastVisit: 'Today',
      initials: initials || 'CU',
      notes: newCustomer.notes?.trim() || 'New customer profile created.',
      createdAt: new Date().toISOString(),
    };

    const nextList = [createdCustomer, ...customersList];
    setCustomersList(nextList);
    setLocalStorage(CUSTOMERS_STORAGE_KEY, nextList);

    setIsAddModalOpen(false);
    setNewCustomer({
      name: '',
      phone: '',
      gender: 'Men',
      preferredFit: 'Slim Bespoke',
      isVip: false,
      notes: ''
    });
  };
```

3. **Edit & Update Customer Persistence (`handleUpdateCustomer`)**:
```typescript
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleUpdateCustomer = (updated: Customer) => {
    const nextList = customersList.map((c) => (c.id === updated.id ? updated : c));
    setCustomersList(nextList);
    setLocalStorage(CUSTOMERS_STORAGE_KEY, nextList);
    setEditingCustomer(null);
    setIsEditModalOpen(false);
  };
```

4. **VIP Toggle & Delete Customer Handlers**:
```typescript
  const handleToggleVip = (id: string) => {
    const nextList = customersList.map((c) =>
      c.id === id ? { ...c, isVip: !c.isVip } : c
    );
    setCustomersList(nextList);
    setLocalStorage(CUSTOMERS_STORAGE_KEY, nextList);
  };

  const handleDeleteCustomer = (id: string) => {
    const nextList = customersList.filter((c) => c.id !== id);
    setCustomersList(nextList);
    setLocalStorage(CUSTOMERS_STORAGE_KEY, nextList);
  };
```

---

## 4. Null-Safety & Fallback Resilience Strategy

To meet acceptance criterion *"Zero runtime exceptions when navigating between routes or loading pages with empty local storage"*, the following protections must be in place:

1. **`storage-utils.ts` Resilience**:
   - `getLocalStorage` handles `undefined` window, missing key, and corrupted JSON.
   - Always supply typed fallback values:
     - For arrays: `getLocalStorage<Customer[]>(CUSTOMERS_STORAGE_KEY, initialCustomers)`
     - For objects: `getLocalStorage<OnboardingDraft | null>(DRAFT_STORAGE_KEY, null)`

2. **Structural Validation Checks**:
   - Before consuming array methods (`.map`, `.filter`, `.length`), wrap with `Array.isArray(saved)` check.
   - Sanitize object properties with optional chaining and fallback defaults (`customer.initials || 'CU'`, `customer.notes || ''`).

3. **SSR Hydration Mismatch Safety**:
   - Always delay local storage reads until after component mounts inside `useEffect`.
   - Use `isHydrated` state flag to avoid server-side / client-side HTML mismatch during Next.js hydration.

---

## 5. File Modification Blueprint

| Target File | Action | Detailed Description |
|-------------|--------|----------------------|
| `apps/web/src/types/onboarding.ts` | Modify | Export `OnboardingDraft` interface for draft payload typing. |
| `apps/web/src/app/onboarding/page.tsx` | Modify | 1. Add `isHydrated` state.<br>2. Add `useEffect` to load `yh_onboarding_draft` on mount.<br>3. Add debounced `useEffect` (350ms) to write `yh_onboarding_draft` on field/step change.<br>4. Call `removeLocalStorage('yh_onboarding_draft')` in `handleFinalSubmit`. |
| `apps/web/src/app/(dashboard)/customers/page.tsx` | Modify | 1. Add `isHydrated` state.<br>2. Add `useEffect` to load `yh_customers` on mount (or seed default `initialCustomers`).<br>3. Update `handleAddCustomer` to call `setLocalStorage('yh_customers', nextList)`.<br>4. Add edit customer modal and update handler sync.<br>5. Add VIP toggle and delete handlers with local storage sync. |
| `apps/web/src/__tests__/storage-utils.test.ts` | Reference | Existing test suite verifies safe SSR & corrupted JSON fallbacks. |

