# Project: Tailoring OS Measurement Engine

## Architecture
- **Monorepo Structure**: `npm` workspaces with `apps/web` (Next.js 14 App Router, React 18, TypeScript, Tailwind CSS) and `apps/api` (NestJS 10, Prisma ORM).
- **Data Flow**:
  - Web UI (`apps/web/src/components/measurement-engine/*`) renders dynamic POM form schemas, SVG body diagrams, and fitting delta comparison matrix.
  - Measurement engine state managed via React Context / Custom Hook (`MeasurementEngineContext`).
  - Backend API (`apps/api/src/modules/measurements/`) exposes POM schemas, ease calculation, versioning snapshot creation, and fitting trial delta tracking.
- **Shared Domain Models**:
  - `GarmentCategory`: `mens-suit`, `mens-sherwani`, `mens-shirt`, `mens-trouser`, `womens-blouse`, `womens-lehenga`, `womens-anarkali`, `womens-corset`, `womens-gown`.
  - `PostureProfile`: 4-axis model (`shoulderSlope`, `backCurvature`, `abdomenStance`, `hipSpineStance`).
  - `FitPreference`: `skinny`, `slim`, `regular`, `relaxed`.
  - `MeasurementVersion`: Immutable snapshot (`versionNumber`, `measurements`, `easeAllowances`, `postureProfile`).
  - `FittingTrialDelta`: 3-way matrix (`targetPom`, `observedTrial`, `alterationDelta`, `toleranceStatus`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Complete 9 Garment POM Schemas | Comprehensive POM schemas for Men's (Suits, Sherwanis, Shirts, Trousers) & Women's (Blouse, Lehenga, Anarkali, Corset, Gown) | M1 | ORIGINAL_REQUEST R1 |
| 2 | 4-Axis Posture Profile Engine | Posture profile modifiers (Shoulders, Back, Abdomen, Hips) adjusting target POM ease offsets | M1 | ORIGINAL_REQUEST R1 |
| 3 | Dynamic Ease & Fabric Yield Math | Formula: Net Body + Category Ease + Fit Modifier + Posture Offset + Stretch; Size-scaled fabric yield estimation | M1 | ORIGINAL_REQUEST R1 |
| 4 | Dynamic Form Engine & Validation | Real-time POM input form with live validation rules and proportion sanity checks | M1 | ORIGINAL_REQUEST R1 |
| 5 | Interactive 2D SVG Body Landmark Diagram | SVG vector human outlines (Front, Back, Side) for Men & Women with anatomical landmark hotspots | M2 | ORIGINAL_REQUEST R2 |
| 6 | Bidirectional Landmark-to-POM Interaction | Clicking landmark hotspot highlights matching POM input; focusing input highlights SVG hotspot | M2 | ORIGINAL_REQUEST R2 |
| 7 | Live Color-Coded Validation Highlighting | Real-time visual feedback on SVG diagram (Emerald Green valid, Amber Gold posture alert, Rose Red error) | M2 | ORIGINAL_REQUEST R2 |
| 8 | Immutable Measurement Snapshot Versioning | Saving versioned measurement snapshots without mutating historical customer orders or jobs | M3 | ORIGINAL_REQUEST R3 |
| 9 | 3-Way Fitting Delta Comparison Viewer | Matrix comparing Target POM vs Observed Fitting Trial vs Alteration Delta with color-coded tolerance thresholds | M3 | ORIGINAL_REQUEST R3 |
| 10 | Master Tailor Notes & Alteration Ledger | Preserving tailor notes, fitting trial history, and alteration delta logs per order trial | M3 | ORIGINAL_REQUEST R3 |
| 11 | Unit & Integration Test Suite | Comprehensive automated tests for POM schemas, ease math, posture engine, landmark validation, versioning | M4 | ORIGINAL_REQUEST Acceptance |
| 12 | Tier 5 Adversarial Hardening & Audit Sign-off | White-box adversarial testing, TypeScript compilation check (`tsc --noEmit`), build verification, and forensic audit | M4 | ORIGINAL_REQUEST Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dynamic Measurement Template & POM Engine (R1) | Complete 9 POM schemas, 4-axis posture profile modifier, dynamic ease formulas, size-scaled fabric yield math, dynamic form component | none | DONE |
| M2 | Visual Body Landmark Diagram & Interactivity (R2) | Interactive SVG human body outlines (Men/Women), clickable landmark hotspots, bidirectional POM mapping, live visual validation highlighting | M1 | PLANNED |
| M3 | Measurement Versioning & Fitting Delta Tracker (R3) | Immutable version snapshot API & UI, 3-way fitting delta comparison matrix viewer, tailor notes & trial history ledger | M1, M2 | PLANNED |
| M4 | Comprehensive Testing & Forensic Audit Hardening | Tiers 1-4 E2E/Unit test suite, Tier 5 white-box adversarial coverage hardening, TypeScript & build checks, Forensic Audit sign-off | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### `apps/web/src/types/measurement.ts` ↔ `apps/api/src/modules/measurements`
```typescript
export type GarmentCategory =
  | 'mens-suit' | 'mens-sherwani' | 'mens-shirt' | 'mens-trouser'
  | 'womens-blouse' | 'womens-lehenga' | 'womens-anarkali' | 'womens-corset' | 'womens-gown';

export type PostureAxis = 'shoulderSlope' | 'backCurvature' | 'abdomenStance' | 'hipSpineStance';

export interface PostureProfile {
  shoulderSlope: 'normal' | 'sloped' | 'square' | 'very_sloped';
  backCurvature: 'normal' | 'stooped' | 'erect' | 'prominent_blade';
  abdomenStance: 'normal' | 'prominent' | 'flat';
  hipSpineStance: 'normal' | 'high_hip' | 'sway_back';
}

export type FitPreference = 'skinny' | 'slim' | 'regular' | 'relaxed';

export interface PomSchemaItem {
  id: string;
  code: string;
  name: string;
  category: 'length' | 'girth' | 'width' | 'sleeve' | 'trouser';
  baseMeasurement: number; // inches
  defaultEase: number; // inches
  landmarkId?: string; // SVG hotspot map
  unit: 'in' | 'cm';
  validationRange: { min: number; max: number };
}

export interface CalculatedEaseResult {
  netBody: number;
  categoryBaseEase: number;
  fitPreferenceModifier: number;
  postureOffset: number;
  stretchFactor: number;
  targetGarmentMeasurement: number; // netBody + ease
}

export interface MeasurementVersionSnapshot {
  id: string;
  clientId: string;
  versionNumber: number;
  garmentCategory: GarmentCategory;
  fitPreference: FitPreference;
  postureProfile: PostureProfile;
  measurements: Record<string, number>;
  calculatedGarmentPOMs: Record<string, CalculatedEaseResult>;
  createdAt: string;
}

export interface FittingTrialDeltaItem {
  pomId: string;
  pomName: string;
  targetGarmentMeasurement: number;
  observedFittingTrial: number;
  alterationDelta: number; // observed - target
  toleranceStatus: 'within_tolerance' | 'minor_alteration' | 'major_alteration'; // <=0.25", 0.25-0.75", >0.75"
}

export interface FittingTrialComparison {
  trialId: string;
  trialNumber: number;
  versionNumber: number;
  deltas: Record<string, FittingTrialDeltaItem>;
  masterTailorNotes: string;
  status: 'passed' | 'alteration_required' | 're_cut_required';
  createdAt: string;
}
```

---

## Code Layout
```
apps/
├── api/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── modules/
│           └── measurements/
│               ├── dto/
│               │   ├── calculate-ease.dto.ts
│               │   ├── create-version.dto.ts
│               │   └── record-trial.dto.ts
│               ├── measurements.controller.ts
│               ├── measurements.service.ts
│               └── measurements.module.ts
└── web/
    └── src/
        ├── app/
        │   └── page.tsx
        ├── components/
        │   └── measurement-engine/
        │       ├── MeasurementEngineContainer.tsx
        │       ├── PomFormEngine.tsx
        │       ├── PostureProfileSelector.tsx
        │       ├── BodyLandmarkDiagram.tsx
        │       ├── SvgHumanBodyOutline.tsx
        │       ├── VersionSnapshotViewer.tsx
        │       ├── FittingDeltaTracker.tsx
        │       └── FabricYieldCalculator.tsx
        ├── context/
        │   └── MeasurementEngineContext.tsx
        ├── lib/
        │   ├── pom-schemas.ts
        │   ├── ease-calculator.ts
        │   ├── posture-engine.ts
        │   └── landmark-mappings.ts
        ├── types/
        │   └── measurement.ts
        └── __tests__/
            ├── ease-calculator.test.ts
            ├── posture-engine.test.ts
            ├── pom-schemas.test.ts
            └── landmark-validation.test.ts
```
