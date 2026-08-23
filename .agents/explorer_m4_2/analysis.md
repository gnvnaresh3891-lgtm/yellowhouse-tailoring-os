# Architectural Specification & Technical Blueprint: Milestone 4 RBAC & Automated Test Suite

## Executive Summary
This architectural specification defines the Role-Based Access Control (RBAC) route visibility matrix, navigation filtering rules, route guard redirect mechanisms, and automated test suite design for Milestone 4 of **YellowHouse Tailoring OS**. 

It details the precise access permissions across all 7 user roles (`SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`), provides the code blueprint for `apps/web/src/__tests__/rbac-visibility.test.ts`, and establishes the production sign-off build & test pipeline across `apps/web` and `apps/api`.

---

## 1. System-Wide RBAC Architecture & Route Visibility Rules

### 1.1 Overview of User Roles
YellowHouse Tailoring OS categorizes platform actors into 7 distinct operational roles:

1. **`SUPER_ADMIN`**: Enterprise Platform Administrator overseeing system-wide tenant management, global settings, system configuration, and tenant onboarding.
2. **`ATELIER_MANAGER`**: Atelier General Manager / Boutique Owner managing staff recruitment, financial metrics, client relations, orders, and workshop operations.
3. **`MASTER_TAILOR`**: Master Pattern Cutter & Fitting Specialist responsible for CAD measurement profiles, posture deltas, pattern drafting, fitting sessions, and order customization.
4. **`EMBROIDERY_ARTISAN`**: Karigar / Hand-embroidery Craftsman executing specific job cards on the workshop Kanban board with piece-rate and SAM tracking.
5. **`SALES_FRONT_DESK`**: Receptionist & Sales Representative managing client intake, new order creation, advance deposits, and fitting appointments.
6. **`QUALITY_INSPECTOR`**: QC Auditor responsible for inspecting finished garments, auditing trial fittings, and verifying quality benchmarks.
7. **`CUSTOMER_VIEW`**: Client / End Customer viewing personal active orders, order status, fitting reminders, and read-only measurement cards.

---

### 1.2 Route Access Control Matrix
The following matrix defines route access across all 11 application routes in `apps/web/src/app`:

| Route Path | Route Name | `SUPER_ADMIN` | `ATELIER_MANAGER` | `MASTER_TAILOR` | `EMBROIDERY_ARTISAN` | `SALES_FRONT_DESK` | `QUALITY_INSPECTOR` | `CUSTOMER_VIEW` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/admin` | System Admin Panel | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| `/onboarding` | Atelier Onboarding | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| `/dashboard` | Atelier Dashboard | **ALLOW** | **ALLOW** | **ALLOW** | DENY | **ALLOW** | **ALLOW** | DENY |
| `/customers` | Client Directory | **ALLOW** | **ALLOW** | **ALLOW** | DENY | **ALLOW** | DENY | DENY |
| `/measurements` | CAD Measurements | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW (RO)** | **ALLOW** | **ALLOW (RO)** | **ALLOW (RO)** |
| `/orders` | Bespoke Orders | **ALLOW** | **ALLOW** | **ALLOW** | DENY | **ALLOW** | **ALLOW** | **ALLOW (Self)** |
| `/production` | Workshop Kanban | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | DENY | **ALLOW** | DENY |
| `/staff` | Staff Management | **ALLOW** | **ALLOW** | DENY | DENY | DENY | DENY | DENY |
| `/login` | Authentication | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** |
| `/register` | Registration | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** |
| `/` | Landing / Home | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** | **PUBLIC** |

*(RO = Read-Only Access Mode; Self = Filtered to Client's own records)*

---

### 1.3 Navigation Item Rendering Rules per Role

When rendering the main sidebar navigation in `apps/web/src/app/(dashboard)/layout.tsx`, navigation items must be dynamically filtered using `filterNavItemsForRole(navItems, currentUser.role)`.

Below is the expected visible navigation item array for each role:

- **`SUPER_ADMIN`**: 
  - Admin Panel (`/admin`), Dashboard (`/dashboard`), Customers (`/customers`), Measurements (`/measurements`), Orders (`/orders`), Production (`/production`), Staff Management (`/staff`), Onboarding (`/onboarding`). (8 items)
- **`ATELIER_MANAGER`**: 
  - Dashboard (`/dashboard`), Customers (`/customers`), Measurements (`/measurements`), Orders (`/orders`), Production (`/production`), Staff Management (`/staff`). (6 items)
- **`MASTER_TAILOR`**: 
  - Dashboard (`/dashboard`), Customers (`/customers`), Measurements (`/measurements`), Orders (`/orders`), Production (`/production`). (5 items)
- **`EMBROIDERY_ARTISAN`**: 
  - Production (`/production`), Measurements (`/measurements`). (2 items)
- **`SALES_FRONT_DESK`**: 
  - Dashboard (`/dashboard`), Customers (`/customers`), Measurements (`/measurements`), Orders (`/orders`). (4 items)
- **`QUALITY_INSPECTOR`**: 
  - Dashboard (`/dashboard`), Orders (`/orders`), Production (`/production`), Measurements (`/measurements`). (4 items)
- **`CUSTOMER_VIEW`**: 
  - Orders (`/orders`), Measurements (`/measurements`). (2 items)

---

### 1.4 Route Guard & Redirect Fallback Policy

If an authenticated user attempts to directly access a URL for a route denied to their role, the layout/route guard MUST automatically intercept the request and redirect to the role's default landing page:

| Role | Default Fallback Landing Route |
| :--- | :--- |
| `SUPER_ADMIN` | `/admin` |
| `ATELIER_MANAGER` | `/dashboard` |
| `MASTER_TAILOR` | `/dashboard` |
| `EMBROIDERY_ARTISAN` | `/production` |
| `SALES_FRONT_DESK` | `/orders` |
| `QUALITY_INSPECTOR` | `/production` |
| `CUSTOMER_VIEW` | `/orders` |

If `currentUser` is null/unauthenticated, all private dashboard routes (`/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/admin`, `/onboarding`) MUST redirect to `/login`.

---

## 2. Implementation Blueprint for Navigation & Route Guard

### 2.1 RBAC Utility Engine (`apps/web/src/lib/rbac-utils.ts`)

```typescript
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ATELIER_MANAGER'
  | 'MASTER_TAILOR'
  | 'EMBROIDERY_ARTISAN'
  | 'SALES_FRONT_DESK'
  | 'QUALITY_INSPECTOR'
  | 'CUSTOMER_VIEW';

export interface RolePermissions {
  allowedRoutes: string[];
  defaultLanding: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    allowedRoutes: [
      '/admin',
      '/dashboard',
      '/customers',
      '/measurements',
      '/orders',
      '/production',
      '/staff',
      '/onboarding',
    ],
    defaultLanding: '/admin',
  },
  ATELIER_MANAGER: {
    allowedRoutes: ['/dashboard', '/customers', '/measurements', '/orders', '/production', '/staff'],
    defaultLanding: '/dashboard',
  },
  MASTER_TAILOR: {
    allowedRoutes: ['/dashboard', '/customers', '/measurements', '/orders', '/production'],
    defaultLanding: '/dashboard',
  },
  EMBROIDERY_ARTISAN: {
    allowedRoutes: ['/production', '/measurements'],
    defaultLanding: '/production',
  },
  SALES_FRONT_DESK: {
    allowedRoutes: ['/dashboard', '/customers', '/measurements', '/orders'],
    defaultLanding: '/orders',
  },
  QUALITY_INSPECTOR: {
    allowedRoutes: ['/dashboard', '/orders', '/production', '/measurements'],
    defaultLanding: '/production',
  },
  CUSTOMER_VIEW: {
    allowedRoutes: ['/orders', '/measurements'],
    defaultLanding: '/orders',
  },
};

export function canUserAccessRoute(role: UserRole | string, routePath: string): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) return false;
  const userRole = role as UserRole;
  const normalizedPath = routePath.split('?')[0].split('#')[0];
  const permissions = ROLE_PERMISSIONS[userRole];
  
  return permissions.allowedRoutes.some(
    (allowed) => normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`)
  );
}

export function filterNavItemsForRole<T extends { href: string }>(items: T[], role: UserRole | string): T[] {
  if (!role || !(role in ROLE_PERMISSIONS)) return [];
  return items.filter((item) => canUserAccessRoute(role, item.href));
}

export function getFallbackRedirectRoute(role: UserRole | string, attemptedRoute: string): string {
  if (!role || !(role in ROLE_PERMISSIONS)) return '/login';
  const userRole = role as UserRole;
  
  if (canUserAccessRoute(userRole, attemptedRoute)) {
    return attemptedRoute;
  }
  return ROLE_PERMISSIONS[userRole].defaultLanding;
}
```

---

## 3. Blueprint for `apps/web/src/__tests__/rbac-visibility.test.ts`

### 3.1 Test Suite Structure
The test file `apps/web/src/__tests__/rbac-visibility.test.ts` MUST export `runRbacVisibilityTests()` returning `{ passed: number; failed: number }`, matching the monorepo test runner pattern in `apps/web/src/__tests__/run-tests.ts`.

### 3.2 Full Test Implementation Blueprint

```typescript
import {
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
  UserRole,
  ROLE_PERMISSIONS,
} from '../lib/rbac-utils';

const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/customers', label: 'Customers' },
  { href: '/measurements', label: 'Measurements' },
  { href: '/orders', label: 'Orders' },
  { href: '/production', label: 'Production' },
  { href: '/staff', label: 'Staff Management' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/admin', label: 'Admin Panel' },
];

export function runRbacVisibilityTests(): { passed: number; failed: number } {
  console.log('\n[Suite 7: RBAC Route Visibility & Guard Verification]');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // 1. SUPER_ADMIN Permissions Test
  assert(
    canUserAccessRoute('SUPER_ADMIN', '/admin') &&
    canUserAccessRoute('SUPER_ADMIN', '/dashboard') &&
    canUserAccessRoute('SUPER_ADMIN', '/staff'),
    'SUPER_ADMIN has full access to /admin, /dashboard, and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'SUPER_ADMIN').length === 8,
    'SUPER_ADMIN sidebar navigation renders all 8 main routes'
  );

  // 2. ATELIER_MANAGER Permissions Test
  assert(
    canUserAccessRoute('ATELIER_MANAGER', '/staff') &&
    canUserAccessRoute('ATELIER_MANAGER', '/dashboard'),
    'ATELIER_MANAGER has access to /staff and /dashboard'
  );
  assert(
    !canUserAccessRoute('ATELIER_MANAGER', '/admin') &&
    !canUserAccessRoute('ATELIER_MANAGER', '/onboarding'),
    'ATELIER_MANAGER is restricted from /admin and /onboarding'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'ATELIER_MANAGER').length === 6,
    'ATELIER_MANAGER sidebar renders exactly 6 allowed routes'
  );

  // 3. MASTER_TAILOR Permissions Test
  assert(
    canUserAccessRoute('MASTER_TAILOR', '/measurements') &&
    canUserAccessRoute('MASTER_TAILOR', '/production'),
    'MASTER_TAILOR has access to /measurements and /production'
  );
  assert(
    !canUserAccessRoute('MASTER_TAILOR', '/staff') &&
    !canUserAccessRoute('MASTER_TAILOR', '/admin'),
    'MASTER_TAILOR is restricted from /staff and /admin'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'MASTER_TAILOR').length === 5,
    'MASTER_TAILOR sidebar renders exactly 5 technical routes'
  );

  // 4. EMBROIDERY_ARTISAN (Karigar) Isolation Test
  assert(
    canUserAccessRoute('EMBROIDERY_ARTISAN', '/production') &&
    canUserAccessRoute('EMBROIDERY_ARTISAN', '/measurements'),
    'EMBROIDERY_ARTISAN can access /production and /measurements'
  );
  assert(
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/customers') &&
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/orders') &&
    !canUserAccessRoute('EMBROIDERY_ARTISAN', '/dashboard'),
    'EMBROIDERY_ARTISAN is isolated from /customers, /orders, and /dashboard'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'EMBROIDERY_ARTISAN').length === 2,
    'EMBROIDERY_ARTISAN sidebar renders exactly 2 workshop routes'
  );

  // 5. SALES_FRONT_DESK Permissions Test
  assert(
    canUserAccessRoute('SALES_FRONT_DESK', '/orders') &&
    canUserAccessRoute('SALES_FRONT_DESK', '/customers'),
    'SALES_FRONT_DESK has access to /orders and /customers'
  );
  assert(
    !canUserAccessRoute('SALES_FRONT_DESK', '/production') &&
    !canUserAccessRoute('SALES_FRONT_DESK', '/staff'),
    'SALES_FRONT_DESK is restricted from /production and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'SALES_FRONT_DESK').length === 4,
    'SALES_FRONT_DESK sidebar renders exactly 4 sales routes'
  );

  // 6. QUALITY_INSPECTOR Permissions Test
  assert(
    canUserAccessRoute('QUALITY_INSPECTOR', '/production') &&
    canUserAccessRoute('QUALITY_INSPECTOR', '/orders'),
    'QUALITY_INSPECTOR has access to /production and /orders'
  );
  assert(
    !canUserAccessRoute('QUALITY_INSPECTOR', '/customers') &&
    !canUserAccessRoute('QUALITY_INSPECTOR', '/staff'),
    'QUALITY_INSPECTOR is restricted from /customers and /staff'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'QUALITY_INSPECTOR').length === 4,
    'QUALITY_INSPECTOR sidebar renders exactly 4 QC routes'
  );

  // 7. CUSTOMER_VIEW Permissions Test
  assert(
    canUserAccessRoute('CUSTOMER_VIEW', '/orders') &&
    canUserAccessRoute('CUSTOMER_VIEW', '/measurements'),
    'CUSTOMER_VIEW has access to /orders and /measurements'
  );
  assert(
    !canUserAccessRoute('CUSTOMER_VIEW', '/dashboard') &&
    !canUserAccessRoute('CUSTOMER_VIEW', '/production') &&
    !canUserAccessRoute('CUSTOMER_VIEW', '/customers'),
    'CUSTOMER_VIEW is restricted from internal management routes'
  );
  assert(
    filterNavItemsForRole(ALL_NAV_ITEMS, 'CUSTOMER_VIEW').length === 2,
    'CUSTOMER_VIEW sidebar renders exactly 2 client routes'
  );

  // 8. Route Guard Redirect & Invalid Input Handling Test
  assert(
    getFallbackRedirectRoute('EMBROIDERY_ARTISAN', '/admin') === '/production',
    'Forbidden route access for EMBROIDERY_ARTISAN redirects to /production'
  );
  assert(
    getFallbackRedirectRoute('SALES_FRONT_DESK', '/staff') === '/orders',
    'Forbidden route access for SALES_FRONT_DESK redirects to /orders'
  );
  assert(
    getFallbackRedirectRoute('INVALID_ROLE' as any, '/dashboard') === '/login',
    'Invalid role input falls back cleanly to /login'
  );

  return { passed, failed };
}
```

---

## 4. Final Build & Test Pipeline Requirements for Production Sign-Off

To achieve 100% production sign-off quality across YellowHouse Tailoring OS, the build and test pipeline must execute clean, error-free operations across all workspaces (`apps/web` and `apps/api`).

### 4.1 Pipeline Execution Matrix

```
                          ┌──────────────────────────┐
                          │   monorepo root          │
                          │   npm run build / test   │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────┐                                  ┌──────────────────────┐
│       apps/web       │                                  │       apps/api       │
├──────────────────────┤                                  ├──────────────────────┤
│ 1. npx tsc --noEmit  │                                  │ 1. npx tsc --noEmit  │
│ 2. npm test          │                                  │ 2. npm test          │
│    (run-tests.ts)    │                                  │    (signup-dto.test) │
│ 3. npm run build     │                                  │ 3. npm run build     │
│    (next build)      │                                  │    (nest build)      │
└──────────────────────┘                                  └──────────────────────┘
```

---

### 4.2 Step-by-Step Command Requirements

#### Step 1: Workspace Typecheck (`npx tsc --noEmit`)
- **`apps/web` Command**: `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit`
  - Target: Verify zero TypeScript errors across Next.js App Router, components, lib helpers, and test files.
- **`apps/api` Command**: `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit`
  - Target: Verify zero TypeScript errors across NestJS controllers, services, Prisma models, and DTOs.

#### Step 2: Automated Test Execution (`npm test`)
- **`apps/web` Command**: `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npm test`
  - Target: Must execute `run-tests.ts` including all 7 test suites:
    1. Storage Utils Test Suite
    2. Milestone 2 Stress Test Suite
    3. Milestone 3 SAM Calculator Test Suite
    4. Milestone 3 Pricing Calculator Test Suite
    5. Milestone 3 State Sync Test Suite
    6. Milestone 3 Adversarial Challenge Test Suite
    7. **Milestone 4 RBAC Route Visibility Test Suite**
  - Result: Must report 0 failed assertions and exit code 0.
- **`apps/api` Command**: `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npm test`
  - Target: Must execute `signup-dto-adversarial.test.ts`.
  - Result: Must report 0 failed assertions and exit code 0.

#### Step 3: Production Build Generation (`npm run build`)
- **Monorepo Command**: `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse && npm run build`
  - Executed via npm workspaces (`npm run build --workspaces`).
  - Target: Compiles `.next/` production build for Next.js web application and `dist/` production output for NestJS API server.
  - Result: 0 build errors, 0 compilation warnings.

---

## 5. Summary of Deliverables & Next Steps

1. **Implement `apps/web/src/lib/rbac-utils.ts`**: Implement the complete permission matrix and helper functions (`canUserAccessRoute`, `filterNavItemsForRole`, `getFallbackRedirectRoute`).
2. **Wire Up `apps/web/src/app/(dashboard)/layout.tsx`**: Replace hardcoded role checks with `filterNavItemsForRole` and dynamic route guards.
3. **Implement `apps/web/src/__tests__/rbac-visibility.test.ts`**: Write the full test suite blueprint into the workspace test directory.
4. **Integrate into `apps/web/src/__tests__/run-tests.ts`**: Import and call `runRbacVisibilityTests()` within `runAllSuites()`.
5. **Run Verification Commands**: Execute typecheck, test suites, and production builds to ensure 100% passing sign-off.
