# Comprehensive UI & State Management Analysis — Yellowhouse Tailoring OS

## Overview

This analysis evaluates the frontend architecture, state management patterns, domain data models, existing UI components, and visual/SVG infrastructure in the `yellowhouse` repository (`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`).

---

## 1. UI Framework & Technical Stack

### Core Frameworks
* **Frontend Framework**: Next.js `14.2.0` using the App Router (`apps/web/src/app`).
* **React Version**: React `18.3.0` / React DOM `18.3.0`.
* **TypeScript**: TypeScript `5.0.0` configured with strict mode in `apps/web/tsconfig.json` and `apps/api/tsconfig.json`.
* **Backend Framework**: NestJS `10.0.0` (`apps/api/src`), Prisma ORM `5.0.0` (`apps/api/prisma/schema.prisma`).

### Styling & Design System
* **Tailwind CSS**: Tailwind CSS `3.4.3` (`apps/web/tailwind.config.js`, `apps/web/src/app/globals.css`).
* **Custom Color Palette**:
  * `gold`: `gold-400` (`#FACC15`), `gold-500` (`#EAB308`), `gold-600` (`#CA8A04`).
  * `slate`: `slate-850` (`#141E33`), `slate-950` (`#0B0F19`).
* **Glassmorphism CSS Utility Classes** (`apps/web/src/app/globals.css` lines 11–32):
  * `.glass-card`: Semi-transparent slate background with backdrop blur (`rgba(15, 23, 42, 0.75)`).
  * `.glass-card-gold`: Gold-tinted slate background with gold border (`rgba(20, 30, 51, 0.85)`).
  * `.transition-glow`: Smooth hover transition with gold box-shadow.
* **Icon Library**: `lucide-react` `0.378.0` (used for `Scissors`, `Users`, `Ruler`, `ShoppingBag`, `Layers`, `MessageSquare`, `Search`, `Bell`, `ChevronRight`, `CheckCircle2`, `AlertCircle`, `Plus`, `Sparkles`, `Sliders`, `Calculator`, `Send`, `ArrowUpRight`).
* **Style Helpers**: `clsx` (`2.1.1`), `tailwind-merge` (`2.3.0`).

---

## 2. State Management Architecture

* **Current Approach**: Pure React local component state (`useState`) within a single top-level page component (`DashboardPage` in `apps/web/src/app/page.tsx`).
* **External State Libraries**: None currently installed or used (no Zustand, Redux, Recoil, or React Query/TanStack Query in `package.json`).
* **Active State Variables** (`apps/web/src/app/page.tsx` lines 11–29):
  1. `activeTab`: `'crm' | 'yield' | 'kanban' | 'whatsapp'` (controls main view tab switching).
  2. `selectedGender`: `'Men' | 'Women'` (switches between Men's and Women's POM forms and yield baseline).
  3. `selectedGarment`: `string` (e.g. `"Sherwani"`, `"Suit"`, `"Sari Blouse"`, `"Lehenga"`).
  4. `poms`: `Record<string, number>` storing POM key-value pairs (e.g. `chest`, `waist`, `shoulder`, `sleeve`, `length`, `underbust`, `apexDistance`).
  5. `fabricWidth`: `number` (`44`, `54`, `60`).
  6. `patternRepeat`: `number`.
  7. `calculatedMeters`: `number`.

---

## 3. Data Models, Schemas & Domain Types

### Database Schema (Prisma — `apps/api/prisma/schema.prisma`)

1. **`Client`** (lines 51–67):
   * `id`, `tenantId`, `phone`, `firstName`, `lastName`, `gender` (`"Men" | "Women" | "Unisex"`), `preferredFit` (default `"Regular"`), `postureProfile` (`Json?` e.g. `{"shoulder_slope": "sloping", "chest_stance": "prominent"}`).
   * Unique constraint: `@@unique([tenantId, phone])`.

2. **`CustomerMeasurementVersion`** (lines 69–84):
   * `id`, `tenantId`, `clientId`, `versionNumber` (`Int`), `profileName` (`String`), `gender` (`"Men" | "Women"`), `unit` (`"inch" | "cm"`), `measurements` (`Json`), `easeAllowances` (`Json?`), `measuredBy` (`String?`), `isActive` (`Boolean`).

3. **`MeasurementTemplate`** (lines 85–94):
   * `id`, `tenantId?`, `garmentName` (`String`), `gender` (`"Men" | "Women" | "Unisex"`), `category` (`"Ethnic" | "Western" | "Couture"`), `pomSchema` (`Json`).

4. **`Order` & `OrderItem`** (lines 96–130):
   * `OrderItem` stores `appliedMeasurementSnapshot` (`Json`), `garmentConfiguration` (`Json`), `productionStage`.

5. **`OrderTrial`** (lines 156–166):
   * `trialNumber` (`Int`), `status` (`"SCHEDULED" | "COMPLETED" | "ALTERATION_REQUIRED"`), `scheduledAt` (`DateTime`), `observedDeltas` (`Json?` e.g. `{"waist": -0.5, "sleeve": +0.25}`), `masterNotes` (`String?`).

### Backend Measurement & POM Schemas (`apps/api/src/modules/measurements/measurements.service.ts`)

#### POM Templates (`getGarmentTemplates()`, lines 16–75):
* **Men's Royal Sherwani (`mens-sherwani`)**:
  * `M-SH-01`: Chest Circumference (Default Ease: +5.0", Tolerance: ±0.25")
  * `M-SH-02`: Natural Waist (Default Ease: +3.5", Tolerance: ±0.25")
  * `M-SH-03`: Hip / Seat Circumference (Default Ease: +4.5", Tolerance: ±0.25")
  * `M-SH-04`: Shoulder Width (Default Ease: +0.75", Tolerance: ±0.125")
  * `M-SH-05`: Band Collar Height & Circumference (Default Ease: +0.85", Tolerance: ±0.125")
  * `M-SH-06`: Center Back Length (Default Ease: 0.0", Tolerance: ±0.5")
  * `M-SH-07`: Sleeve Length (Default Ease: +0.5", Tolerance: ±0.25")

* **Men's Bespoke 3-Piece Suit (`mens-suit`)**:
  * `M-SU-01`: Jacket Chest (Default Ease: +3.5", Tolerance: ±0.25")
  * `M-SU-02`: Buttoning Waist Point (Default Ease: +2.5", Tolerance: ±0.25")
  * `M-SU-03`: Trouser Outseam (Default Ease: -0.5", Tolerance: ±0.25")
  * `M-SU-04`: Trouser Thigh Circumference (Default Ease: +2.5", Tolerance: ±0.25")
  * `M-SU-05`: Inseam Length (Default Ease: 0.0", Tolerance: ±0.25")

* **Women's Sari Blouse (`womens-blouse`)**:
  * `W-SB-01`: Upper Bust Circumference (Default Ease: +0.75", Tolerance: ±0.125")
  * `W-SB-02`: Full Bust Peak (Default Ease: +1.25", Tolerance: ±0.125")
  * `W-SB-03`: Underbust / Band (Default Ease: +0.5", Tolerance: ±0.125")
  * `W-SB-04`: Apex Distance (Default Ease: 0.0", Tolerance: ±0.125")
  * `W-SB-05`: Apex Height (Default Ease: 0.0", Tolerance: ±0.125")
  * `W-SB-06`: Front Neck Drop (Default Ease: 0.0", Tolerance: ±0.125")
  * `W-SB-07`: Back Neck Drop (Default Ease: 0.0", Tolerance: ±0.125")
  * `W-SB-08`: Armscye / Armhole Depth (Default Ease: +0.5", Tolerance: ±0.125")

* **Women's Lehenga Choli (`womens-lehenga`)**:
  * `W-LC-01`: Lehenga Waist Line (Default Ease: +0.5", Tolerance: ±0.25")
  * `W-LC-02`: Lehenga Length (Default Ease: +0.5", Tolerance: ±0.375")
  * `W-LC-03`: Choli Band Length (Default Ease: +1.0", Tolerance: ±0.125")
  * `W-LC-04`: Kali Count (Default Ease: 0.0, Tolerance: 0.0)

#### Fabric Yield Math Engine (`calculateFabricYield()`, lines 78–114):
* Base consumption lookup by fabric width (44", 54", 60").
* Pattern repeat allowance math: `repeatFactor = 1 + (patternRepeatInches * 0.0254) / requiredMeters`.
* Shrinkage padding: 5% multiplier when `hasShrinkage` is true.

---

## 4. Existing UI Components, Forms, and Layout Patterns

### Component Architecture
* Currently, the frontend UI is contained in a single monolithic page component (`apps/web/src/app/page.tsx`). There are no sub-components extracted into `apps/web/src/components/`.
* **Layout Structure**:
  1. Sticky top navigation bar header (`Scissors` branding logo, tenant indicator, global search input, notifications icon, user avatar pill).
  2. 4-column KPI stats grid (`Active Atelier Orders`, `Karigar SAM Payout`, `Fitting Success Rate`, `WhatsApp Advance Payments`).
  3. Tab bar (`Customer Measurement Engine`, `Fabric Yield Math`, `Karigar Workshop Board`, `WhatsApp Deposit Sender`).
  4. Tab 1 Panel: Customer profile card (left 4 columns) and Dynamic Measurement POM form grid (right 8 columns).
  5. Tab 2 Panel: Fabric yield calculator & nesting optimization card.
  6. Tab 3 Panel: 4-stage Karigar Workshop Kanban Board (`Master Cutting`, `Zardozi Adda Work`, `Stitching Assembly`, `Ready for Delivery`).
  7. Tab 4 Panel: Meta WhatsApp interactive deposit payload generator.

### Gap Analysis Against Requirements (R1, R2, R3)

1. **R1 (Dynamic Measurement Template & POM Engine)**:
   * Form inputs in `page.tsx` are hardcoded static HTML fields with `defaultValue`.
   * Ease calculation logic exists in `apps/api/src/modules/measurements/measurements.service.ts` but is not connected to interactive state updates in the frontend UI.
   * Posture profile modifiers (e.g. sloping shoulders, posture adjustments) are static text displays without interactive slider/selector logic.

2. **R2 (Visual Body Landmark Diagram & Interactivity)**:
   * **Missing**: No SVG human body outline or clickable landmark hotspots exist in the codebase.
   * Required: Interactive 2D SVG silhouette (Front/Back view) for Men's and Women's garments with interactive anatomical hotspots matching POM input fields, hover highlights, and real-time validation badges.

3. **R3 (Measurement Versioning & Fitting Delta Tracker)**:
   * **Missing**: No measurement snapshot history or delta comparison viewer exists in the UI.
   * Required: Comparison view displaying Target POM vs. Observed Fitting Trial vs. Alteration Delta (e.g. `+0.25"`, `-0.5"`), with version selection and trial logs based on `CustomerMeasurementVersion` and `OrderTrial` Prisma schemas.

---

## 5. Architectural Recommendations for Implementation

1. **Component Modularization**:
   * Create `apps/web/src/components/measurements/` directory containing:
     * `MeasurementForm.tsx`: Dynamic form rendering based on POM schema.
     * `BodyLandmarkSvg.tsx`: Interactive SVG diagram with landmark hotspots.
     * `PostureProfileSelector.tsx`: Sloping/square shoulder and chest stance modifiers.
     * `FittingDeltaTracker.tsx`: Version snapshot comparator & alteration delta calculation table.
     * `FabricYieldCalculator.tsx`: Fabric bolt & pattern repeat calculator component.

2. **State Management Enhancement**:
   * Implement a centralized state store or custom React hook (e.g. `useMeasurementStore` with React Context or Zustand) to sync selected POMs, posture modifiers, active landmark highlighting, and version history seamlessly between the form, SVG diagram, and delta tracker.

3. **TypeScript Type Exports**:
   * Define shared TypeScript interfaces in `apps/web/src/types/measurement.ts` matching Prisma schemas and NestJS service DTOs (`POMDefinition`, `MeasurementValueMap`, `PostureProfile`, `MeasurementVersionSnapshot`, `FittingDelta`).
