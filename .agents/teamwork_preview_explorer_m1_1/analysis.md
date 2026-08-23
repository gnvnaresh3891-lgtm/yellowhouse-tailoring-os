# Milestone 1: Core Audit, LocalStorage Safety & Test Infrastructure Analysis & Design Blueprint

**Author**: `teamwork_preview_explorer_m1_1` (Explorer Subagent)  
**Scope**: Milestone 1 — Core Audit, LocalStorage Safety & Test Infra  
**Target Repository**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  
**Date**: 2026-08-07  

---

## 1. Executive Summary

Milestone 1 establishes the foundational stability, code hygiene, runtime safety, and automated test execution pipeline for **YellowHouse Tailoring OS**. 

Our comprehensive investigation across `apps/web` and `apps/api` revealed:
1. **Type Safety & Build Status**: Both `apps/web` and `apps/api` pass `npx tsc --noEmit` cleanly and produce production builds without compilation errors (`npm run build`). However, extensive unused imports from `lucide-react` exist across 11 page/layout components, creating code bloat and linter warnings.
2. **LocalStorage Safety Gaps**: Multiple core routes (`onboarding/page.tsx`, `login/page.tsx`, `register/page.tsx`, `(dashboard)/layout.tsx`, `(dashboard)/dashboard/page.tsx`) perform unsafe direct calls to `window.localStorage` (`getItem`, `setItem`, `removeItem`). These lack unified fallback handling for SSR rendering, disabled/blocked storage policies, corrupted JSON strings, or DOM quota exceptions.
3. **Missing Workspace Test Scripts**: Running `npm run test` at the monorepo workspace root currently fails because neither `apps/web/package.json` nor `apps/api/package.json` contains a `"test"` npm script. Both applications already contain comprehensive unit/integration test files (`apps/web/src/__tests__/run-tests.ts` and `apps/api/src/__tests__/signup-dto-adversarial.test.ts`), but they lack the npm script wiring.

This document presents the full findings and step-by-step implementation blueprint to resolve these gaps.

---

## 2. Audit Findings

### 2.1 Baseline Build & Typecheck Verification
- **`apps/web` (`npx tsc --noEmit`)**: **PASSED** (0 type errors).
- **`apps/api` (`npx tsc --noEmit`)**: **PASSED** (0 type errors).
- **`apps/web` (`npm run build`)**: **PASSED** (`next build` compiled 14 static routes successfully).
- **`apps/api` (`npm run build`)**: **PASSED** (`nest build` compiled build outputs successfully).

### 2.2 Unused Imports Audit (`apps/web`)

The following files contain unused imports (predominantly `lucide-react` icons) that should be cleaned up:

| File Path | Unused Import Symbols |
| shadow |---|
| `apps/web/src/app/page.tsx` | `Building2`, `ShieldCheck`, `BarChart3`, `Zap`, `MessageSquare`, `HelpCircle`, `RefreshCw`, `Globe`, `Award`, `ExternalLink`, `DollarSign`, `Activity`, `Maximize2` |
| `apps/web/src/app/onboarding/page.tsx` | `Scissors`, `Mail`, `Lock`, `CheckCircle2`, `XCircle`, `Phone`, `MapPin`, `PartyPopper` |
| `apps/web/src/app/(auth)/login/page.tsx` | `Shield`, `Check` |
| `apps/web/src/app/(auth)/register/page.tsx` | `Sparkles`, `Scissors` |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | `CheckCircle2`, `Clock` |
| `apps/web/src/app/(dashboard)/customers/page.tsx` | `Calendar`, `Filter`, `MoreVertical`, `Sparkles` |
| `apps/web/src/app/(dashboard)/measurements/page.tsx` | `Eye`, `RotateCcw`, `ChevronUp`, `Calculator`, `AlertCircle`, `CheckCircle2`, `Info`, `History`, `ArrowUpRight`, `ArrowDownRight`, `Minus` |
| `apps/web/src/app/(dashboard)/orders/page.tsx` | `Filter`, `CheckCircle2`, `User`, `DollarSign`, `Scissors`, `Shirt`, `Sparkles`, `X`, `MessageSquare`, `Calendar`, `ArrowUpRight`, `FileText`, `Tag`, `AlertCircle` |
| `apps/web/src/app/(dashboard)/production/page.tsx` | `Sparkles`, `Package`, `User`, `Filter`, `SlidersHorizontal`, `Calendar`, `AlertTriangle`, `ShieldCheck`, `Flame`, `Edit2`, `FileText`, `Printer` |
| `apps/web/src/app/(dashboard)/staff/page.tsx` | `Mail`, `Building2`, `Check`, `AlertCircle`, `Filter`, `Trash2`, `Lock` |
| `apps/web/src/app/(dashboard)/admin/page.tsx` | `Building2`, `ShoppingBag`, `Activity`, `Filter`, `Sparkles`, `ExternalLink`, `Ban`, `RotateCcw`, `TrendingUp`, `Server`, `Layers`, `Crown`, `Zap` |
| `apps/web/src/components/SidebarLayout.tsx` | `LogOut` |

### 2.3 Direct Unsafe LocalStorage Access Audit

The following table details every location where raw `localStorage` calls bypass safety fallbacks:

| File Path | Line Numbers | Raw Call | Identified Risk |
|---|---|---|---|
| `apps/web/src/app/onboarding/page.tsx` | 282, 304, 322 | `localStorage.setItem('yh_auth_user', ...)` | Raw write without quota try/catch or safe fallback. |
| `apps/web/src/app/(auth)/login/page.tsx` | 106 | `localStorage.getItem('yh_auth_user')` | Unhandled JSON parse error if storage corrupted. |
| `apps/web/src/app/(auth)/login/page.tsx` | 157, 189 | `localStorage.setItem('yh_auth_user', ...)` | Raw write bypassing central utility helper. |
| `apps/web/src/app/(auth)/login/page.tsx` | 202 | `localStorage.removeItem('yh_auth_user')` | Direct deletion without window check safety wrapper. |
| `apps/web/src/app/(auth)/register/page.tsx` | 112 | `localStorage.setItem('yh_auth_user', ...)` | Direct raw setItem call. |
| `apps/web/src/app/(dashboard)/layout.tsx` | 45 | `localStorage.getItem('yh_auth_user')` | Unhandled JSON parse exception if storage corrupted. |
| `apps/web/src/app/(dashboard)/layout.tsx` | 57 | `localStorage.removeItem('yh_auth_user')` | Direct raw removeItem call. |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | 39 | `localStorage.getItem('yh_orders')` | Direct raw getItem call. |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | 47 | `localStorage.getItem('yh_production_jobs')` | Direct raw getItem call. |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | 55 | `localStorage.getItem('yh_customers')` | Direct raw getItem call. |

### 2.4 Unsafe Nested Property Access Audit

- `apps/web/src/app/(dashboard)/layout.tsx`:
  - Line 166: `currentUser.role.replace('_', ' ')` -> `currentUser?.role ? currentUser.role.replace('_', ' ') : ''` (prevents runtime TypeError if `currentUser` or `currentUser.role` is null/undefined).
  - Line 228: `currentUser.role.replace('_', ' ')` -> same safety check required.
- `apps/web/src/app/(dashboard)/staff/page.tsx`:
  - Line 59-60: Accessing `currentUser.role` requires optional chaining when checking authorization.

---

## 3. Design Blueprint — Safe LocalStorage Utility (`storage-utils.ts`)

### 3.1 Utility Design (`apps/web/src/lib/storage-utils.ts`)

The utility MUST provide three generic, type-safe functions:

```typescript
/**
 * Safe local storage utility functions for YellowHouse Tailoring OS.
 * Provides safe local storage methods with SSR window checks,
 * JSON parsing try/catch error handling, and safe fallback returns.
 */

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

export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[storage-utils] Error setting key "${key}" in localStorage:`, error);
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage-utils] Error removing key "${key}" from localStorage:`, error);
    return false;
  }
}
```

### 3.2 Refactoring Pattern for Application Code

All application pages MUST import `getLocalStorage`, `setLocalStorage`, and `removeLocalStorage` from `@/lib/storage-utils`:

```typescript
// BEFORE:
const stored = localStorage.getItem('yh_auth_user');
if (stored) {
  try {
    setCurrentUser(JSON.parse(stored));
  } catch (e) {}
}

// AFTER:
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';

const currentUser = getLocalStorage<StoredUser | null>('yh_auth_user', null);
```

---

## 4. Design Blueprint — Workspace `"test"` Scripts Infrastructure Setup

### 4.1 Root & Workspace Package Script Alignment

1. **Root `package.json`**:
```json
{
  "name": "yellowhouse-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

2. **`apps/web/package.json`**:
Add `ts-node` to `devDependencies` and configure `"test"` script:
```json
{
  "name": "@yellowhouse/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "test": "ts-node --transpile-only src/__tests__/run-tests.ts"
  },
  "dependencies": {
    ...
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

3. **`apps/api/package.json`**:
Add `"test"` script executing the NestJS DTO & service test suite:
```json
{
  "name": "@yellowhouse/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "seed": "ts-node prisma/seed.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "test": "ts-node src/__tests__/signup-dto-adversarial.test.ts"
  },
  ...
}
```

### 4.2 Test Suite Execution & Verification

When `npm run test` is executed at the monorepo root:
1. `npm` invokes `npm run test --workspaces`.
2. `@yellowhouse/api` executes `ts-node src/__tests__/signup-dto-adversarial.test.ts`:
   - Validates DTO string transformations (lowercasing tenant slugs and emails).
   - Tests regex validation for tenant subdomains and length constraints.
   - Tests `checkSlug` logic and Prisma `P2002` duplicate error mapping to NestJS `ConflictException` (409).
3. `@yellowhouse/web` executes `ts-node --transpile-only src/__tests__/run-tests.ts`:
   - Tests `storage-utils` (SSR fallback, object serialization, corrupted JSON fallback, key deletion, array/boolean primitives).
   - Tests 9 POM schema garment templates.
   - Tests 4-axis posture profile modifier engine.
   - Tests dynamic ease allowance calculations.
   - Tests size-scaled fabric yield math.
   - Tests SVG landmark & hotspot validations.

---

## 5. Step-by-Step Implementation Blueprint for Implementer

1. **Step 1: Clean Unused Imports Across `apps/web`**
   - Remove all identified unused `lucide-react` icons from the 11 audited files in Section 2.2.
2. **Step 2: Refactor Direct `localStorage` Calls & Unsafe Property Accesses**
   - In `apps/web/src/app/onboarding/page.tsx`, `login/page.tsx`, `register/page.tsx`, `(dashboard)/layout.tsx`, `(dashboard)/dashboard/page.tsx`: replace raw `localStorage` calls with `getLocalStorage`, `setLocalStorage`, `removeLocalStorage`.
   - Add optional chaining checks to `currentUser.role` in `layout.tsx` and `staff/page.tsx`.
3. **Step 3: Update `package.json` Test Scripts**
   - Update `apps/web/package.json` with `"ts-node": "^10.9.1"` in `devDependencies` and `"test": "ts-node --transpile-only src/__tests__/run-tests.ts"`.
   - Update `apps/api/package.json` with `"test": "ts-node src/__tests__/signup-dto-adversarial.test.ts"`.
4. **Step 4: Verify Full Pipeline**
   - Run `npx tsc --noEmit` across both apps.
   - Run `npm run test` at root workspace.
   - Run `npm run build` at root workspace.
