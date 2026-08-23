# Handoff Report — Explorer 1: Codebase & Architecture Survey

## 1. Observation

### 1.1 App Router & Routing Architecture
- **Root Layout (`apps/web/src/app/layout.tsx:1-28`)**: Sets `html className="dark"`, `body` background `#0B0F19`, and wraps children in `<CurrencyProvider>` and `<ToastProvider>`.
- **Dashboard Layout (`apps/web/src/app/(dashboard)/layout.tsx:33-41, 107-116`)**:
  - `navItems`: `[ { href: '/dashboard', label: 'Dashboard' }, { href: '/customers', label: 'Customers' }, { href: '/measurements', label: 'Measurements' }, { href: '/orders', label: 'Orders' }, { href: '/production', label: 'Production' }, { href: '/staff', label: 'Staff Management' }, { href: '/admin', label: 'Admin Panel' } ]`.
  - Route Guard (`lines 107-116`): Evaluates `canUserAccessRoute(user.role, pathname)` and pushes to `getFallbackRedirectRoute(user.role, pathname)`.
  - Dynamic Nav Item Filtering (`line 154`): `filteredNavItems = filterNavItemsForRole(navItems, activeUser.role)`.
  - Header & Topbar Components (`lines 267-414`): Search bar triggers `<CommandPalette>` (`Ctrl+K`), live currency dropdown with `SUPPORTED_CURRENCIES` (10 currencies), notification bell referencing `yh_activities`, user profile badge, and `<Breadcrumb />`.

### 1.2 UI Design System & Component Library
- **Tailwind Config & CSS Tokens (`apps/web/tailwind.config.js:10-26`, `apps/web/src/app/globals.css:8-47`)**:
  - HSL gold variables: `--gold-hue: 45`, `--gold-sat: 93%`, with scale from `--color-gold-50` to `--color-gold-700`.
  - Dark slate hierarchy: `--bg-app: hsl(222, 47%, 7%)` (`#0B0F19`), `--bg-surface-dark: hsl(222, 47%, 10%)`, `--bg-card: hsl(222, 40%, 12%)`.
  - Glassmorphic classes (`globals.css:61-93`): `.glass-card` (blur 16px, border `hsla(0,0%,100%,0.08)`), `.glass-card-gold` (blur 20px, border `hsla(45,93%,47%,0.30)`), `.btn-gold` (linear gradient HSL gold), `.input-dark`, `.pom-input`, `.badge`, `.badge-gold`, `.badge-emerald`, `.badge-blue`, `.badge-amber`, `.badge-rose`.
- **Shared Components**:
  - `Tooltip.tsx` (`lines 10-31`): Tooltip wrapper supporting `top`, `bottom`, `left`, `right`.
  - `confirm-dialog.tsx` (`lines 20-155`): Accessible confirmation dialog with focus trap and `Escape` support.
  - `command-palette.tsx` (`lines 52-216`): Keyboard accessible search dialog (`Ctrl+K`) for pages, orders, and customers.
  - `breadcrumb.tsx` (`lines 18-61`): Dynamic path segments derived from `usePathname()`.
  - `toast-context.tsx` (`lines 78-114`): Global toast manager with auto-dismiss timers and 4 variants.
  - `currency-context.tsx` (`lines 16-27, 38-82`): Live currency switcher with rate conversions from INR.
  - `print-layouts.tsx` (`lines 67-370`): Print components (`OrderReceipt`, `CustomerListPrint`, `ScheduleListPrint`, `MeasurementCard`, `JobCardPrint`).

### 1.3 State Management & Persistence Architecture
- **Safe LocalStorage Accessor (`apps/web/src/lib/storage-utils.ts:7-55`)**:
  - `getLocalStorage<T>(key, fallbackValue)`: Window check for SSR, JSON try/catch, null/undefined safety, array type enforcement.
  - `setLocalStorage<T>(key, value)` and `removeLocalStorage(key)`.
- **Bidirectional State Synchronization (`apps/web/src/lib/state-sync-utils.ts:102-137, 223-231, 252-361`)**:
  - `mapStageToOrderStatus` and `mapOrderStatusToStage`.
  - `syncJobToOrdersStorage`: Updates `yh_orders` and dispatches `yh-data-sync` on Kanban stage movement.
  - `syncOrderToJobsStorage`: Creates/updates `yh_production_jobs` per garment item when orders change.
  - `dispatchSyncEvent`: Dispatches window custom event `yh-data-sync` for cross-component reactivity.
- **RBAC Matrix (`apps/web/src/lib/rbac-utils.ts:15-53`)**:
  - 7 Roles: `SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`.
  - Normalizes aliases (`TENANT_OWNER` → `ATELIER_MANAGER`, `KARIGAR` → `EMBROIDERY_ARTISAN`).

---

## 2. Logic Chain

1. **Undisturbed Core Stability**: The user explicitly requested to proceed with the 5 new layers separately as optional additions without disturbing current workflows. Because the existing core tailoring flows (`/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/admin`) rely on established storage keys (`yh_orders`, `yh_production_jobs`, `yh_customers`, `yh_measurements_current`) and strict RBAC guards, new features must be implemented under separate, dedicated sub-routes.
2. **Modular Route Placement**: Placing the 5 ecosystem layers at `(dashboard)/marketplace`, `(dashboard)/equipment`, `(dashboard)/supply`, `(dashboard)/bidding`, and `(dashboard)/stylists` preserves the App Router layout structure while giving each module its own isolated state and views.
3. **Seamless Navigation Integration**: Updating `(dashboard)/layout.tsx` navigation items, `command-palette.tsx`, `breadcrumb.tsx`, and `rbac-utils.ts` allows authorized users to discover and navigate to the new modules without modifying or breaking any of the existing 7 core routes.
4. **State Isolation & Resilience**: Giving each ecosystem module dedicated local storage keys (`yh_marketplace_assets`, `yh_equipment_bookings`, `yh_vendor_materials`, `yh_tailor_bids`, `yh_stylists_directory`) with `storage-utils.ts` fallback defaults ensures that initial loads on empty storage will produce zero runtime exceptions.

---

## 3. Caveats

- **Scope Boundary**: Investigation was conducted on the frontend Next.js App Router workspace (`apps/web`). The backend NestJS API (`apps/api`) and Prisma database schema were not modified.
- **Assumptions**: Mock data fallbacks for initial ecosystem listings (fabric swatches, machines, digital blueprints, artisan bids) will be bundled client-side to ensure full offline and mock test operability without requiring an active PostgreSQL instance during unit tests.

---

## 4. Conclusion

The YellowHouse Tailoring OS has a robust, clean Next.js 14 App Router foundation, structured design token system, safe persistence layer, and bidirectional state synchronization. The 5 ecosystem extension layers can be added as modular pages under `(dashboard)/...` with dedicated storage keys, seamless sidebar and command palette links, and full RBAC alignment, while preserving 100% test pass rate and operational stability.

The full architecture survey has been delivered to:
`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_1\survey_architecture.md`

---

## 5. Verification Method

To independently verify the survey observations:
1. Inspect the survey report at `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_1\survey_architecture.md`.
2. Verify Next.js App Router structure in `apps/web/src/app/(dashboard)/layout.tsx`.
3. Verify CSS token definitions in `apps/web/src/app/globals.css` and `apps/web/tailwind.config.js`.
4. Verify RBAC permissions in `apps/web/src/lib/rbac-utils.ts`.
5. Run the web test suite:
   ```bash
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npm test
   ```
