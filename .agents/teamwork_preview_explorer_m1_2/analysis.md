# Architectural Blueprint & Specification: Milestone 1 UI Measurement Engine

**Author**: `teamwork_preview_explorer_m1_2`  
**Target Milestone**: M1 (Dynamic Measurement Template & POM Engine)  
**Target Directory**: `apps/web/src/`  
**Status**: Comprehensive Specification & Implementation Blueprint  

---

## 1. Executive Architecture Overview

Milestone 1 introduces the core interactive UI components and state management context for the **YellowHouse Tailoring OS Measurement Engine**. The UI is built using Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. 

### Core Requirements Addressed:
1. **Dynamic Measurement Template & POM Engine (R1)**: Dynamic forms rendering schemas for 9 distinct Men's and Women's garments, with real-time formula-driven ease calculation, posture profile offsets, and input validation bounds.
2. **Posture Profile Modifier Selector**: Interactive 4-axis posture selection (`shoulderSlope`, `backCurvature`, `abdomenStance`, `hipSpineStance`) with live offset visualization.
3. **Fabric Yield & Yardage Math Calculator**: Real-time fabric yardage and marker efficiency calculator supporting 44", 54", and 60" bolt widths, pattern repeat offsets, and shrinkage buffers.
4. **State Management & Provider Infrastructure**: React Context (`MeasurementEngineContext.tsx`) and Custom Hook (`useMeasurementEngine`) managing active selection, POM inputs, posture states, ease outputs, validation state, and landmark focus events.

---

## 2. Directory & Module Topology

```
apps/web/src/
├── types/
│   └── measurement.ts                     # Core domain interfaces & types
├── context/
│   └── MeasurementEngineContext.tsx       # React Context provider & custom hook
└── components/
    └── measurement-engine/
        ├── PomFormEngine.tsx               # Dynamic multi-category POM input form
        ├── PostureProfileSelector.tsx      # 4-axis posture modifier UI component
        ├── FabricYieldCalculator.tsx       # Fabric consumption & yield math component
        └── MeasurementEngineContainer.tsx  # Root container orchestrating layout & state
```

---

## 3. Data Models & Type Definitions (`apps/web/src/types/measurement.ts`)

```typescript
export type GarmentCategory =
  | 'mens-suit'
  | 'mens-sherwani'
  | 'mens-shirt'
  | 'mens-trouser'
  | 'womens-blouse'
  | 'womens-lehenga'
  | 'womens-anarkali'
  | 'womens-corset'
  | 'womens-gown';

export type GenderCategory = 'men' | 'women';

export type FitPreference = 'skinny' | 'slim' | 'regular' | 'relaxed';

export type UnitSystem = 'in' | 'cm';

export type PostureAxis = 'shoulderSlope' | 'backCurvature' | 'abdomenStance' | 'hipSpineStance';

export type ShoulderSlopeValue = 'normal' | 'sloped' | 'square' | 'very_sloped';
export type BackCurvatureValue = 'normal' | 'stooped' | 'erect' | 'prominent_blade';
export type AbdomenStanceValue = 'normal' | 'prominent' | 'flat';
export type HipSpineStanceValue = 'normal' | 'high_hip' | 'sway_back';

export interface PostureProfile {
  shoulderSlope: ShoulderSlopeValue;
  backCurvature: BackCurvatureValue;
  abdomenStance: AbdomenStanceValue;
  hipSpineStance: HipSpineStanceValue;
}

export type PomCategoryGroup = 'length' | 'girth' | 'width' | 'sleeve' | 'trouser';

export interface PomValidationRange {
  min: number; // in inches
  max: number; // in inches
  step: number;
}

export interface PomSchemaItem {
  id: string;
  code: string;
  name: string;
  category: PomCategoryGroup;
  baseMeasurement: number; // default baseline net body measurement in inches
  defaultEase: number; // category default ease in inches
  landmarkId?: string; // matching SVG hotspot identifier for M2 integration
  unit: UnitSystem;
  validationRange: PomValidationRange;
  description?: string;
}

export interface CalculatedEaseResult {
  pomId: string;
  netBody: number; // inches
  categoryBaseEase: number; // inches
  fitPreferenceModifier: number; // inches
  postureOffset: number; // inches
  stretchFactor: number; // inches deducted for elastic fabric
  targetGarmentMeasurement: number; // Net + Ease
}

export interface FabricYieldInput {
  garmentCategory: GarmentCategory;
  boltWidth: 44 | 54 | 60; // inches
  patternRepeat: number; // inches
  shrinkageBufferPercent: number; // percentage, e.g. 5
  girthMeasurement: number; // e.g. max chest or hip girth
  lengthMeasurement: number; // total garment length
}

export interface FabricYieldResult {
  requiredYards: number;
  requiredMeters: number;
  markerEfficiencyPercent: number;
  shrinkageAllowanceMeters: number;
}

export interface ValidationState {
  errors: Record<string, string>; // pomId -> error message
  warnings: Record<string, string>; // pomId -> warning message
  isValid: boolean;
}

export interface MeasurementVersionSnapshot {
  id?: string;
  clientId?: string;
  versionNumber: number;
  garmentCategory: GarmentCategory;
  fitPreference: FitPreference;
  postureProfile: PostureProfile;
  measurements: Record<string, number>;
  calculatedGarmentPOMs: Record<string, CalculatedEaseResult>;
  createdAt: string;
}
```

---

## 4. React Context & State Provider (`apps/web/src/context/MeasurementEngineContext.tsx`)

### Context Interface Contract
```typescript
export interface MeasurementEngineContextState {
  // Active State
  garmentCategory: GarmentCategory;
  gender: GenderCategory;
  fitPreference: FitPreference;
  unitSystem: UnitSystem;
  postureProfile: PostureProfile;
  measurements: Record<string, number>; // pomId -> value in active unit
  calculatedEaseResults: Record<string, CalculatedEaseResult>;
  activePomSchema: PomSchemaItem[];
  validationState: ValidationState;
  focusedLandmarkId: string | null;
  
  // Fabric Yield Parameters
  fabricParams: {
    boltWidth: 44 | 54 | 60;
    patternRepeat: number;
    shrinkageBufferPercent: number;
  };
  fabricYieldResult: FabricYieldResult;

  // Dispatch Actions
  setGarmentCategory: (category: GarmentCategory) => void;
  setFitPreference: (fit: FitPreference) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  setPostureProfile: (profile: Partial<PostureProfile>) => void;
  setPostureAxisValue: (axis: PostureAxis, value: string) => void;
  setMeasurementValue: (pomId: string, value: number) => void;
  batchSetMeasurements: (measurements: Record<string, number>) => void;
  setFabricParams: (params: Partial<MeasurementEngineContextState['fabricParams']>) => void;
  setFocusedLandmarkId: (landmarkId: string | null) => void;
  resetToDefaults: () => void;
}
```

### Key Functional Logic in `MeasurementEngineContext`:
1. **Garment & Schema Mapping**: When `garmentCategory` changes, load the matching schema array from `@/lib/pom-schemas.ts`. Auto-populate baseline measurements for uninitialized POM keys.
2. **Real-time Ease Computation**: Every measurement change or posture modification triggers recalculation of `calculatedEaseResults`:
   $$\text{Target Pattern POM} = \text{Net Body} + \text{Base Ease} + \text{Fit Modifier} + \text{Posture Offset} - \text{Stretch}$$
3. **Real-time Validation Engine**:
   - Boundary checks: values outside `[min, max]` populate `errors[pomId]`.
   - Sanity checks: Proportion anomalies (e.g. Waist > Chest by 4"+ without prominent abdomen stance) populate `warnings[pomId]`.
4. **Unit Conversion Utility**: Supports seamless display switching between `inches` and `cm` ($1 \text{ inch} = 2.54 \text{ cm}$), maintaining high-precision underlying values.

---

## 5. UI Components Blueprint

### 5.1 `PostureProfileSelector.tsx`

#### UI Layout & Structure:
- **Header**: Title "4-Axis Posture Profile Engine", subtitled with "Anatomical posture adjustments modifying default POM ease offsets".
- **4 Axis Input Cards Grid** (`grid-cols-1 sm:grid-cols-2 gap-4`):
  1. **Shoulder Slope Axis**: Options (`normal`, `sloped`, `square`, `very_sloped`).
     - Display offset badge: `Normal: 0" | Sloped: -0.50" | Square: +0.38" | Very Sloped: -0.75"`.
  2. **Back Curvature Axis**: Options (`normal`, `stooped`, `erect`, `prominent_blade`).
     - Display offset badge: `Normal: 0" | Stooped: +0.75" | Erect: -0.50" | Prominent Blade: +0.50"`.
  3. **Abdomen Stance Axis**: Options (`normal`, `prominent`, `flat`).
     - Display offset badge: `Normal: 0" | Prominent: +0.75" Girth (+1.0" Front Drop) | Flat: -0.50"`.
  4. **Hip / Spine Stance Axis**: Options (`normal`, `high_hip`, `sway_back`).
     - Display offset badge: `Normal: 0" | High Hip: +0.50" | Sway Back: -0.50" Back Length`.
- **Live Active Posture Offset Summary Badge**: Highlight active modifiers in gold/amber badges with clear visual indication of active adjustments.

#### Props Interface:
```typescript
export interface PostureProfileSelectorProps {
  className?: string;
  compact?: boolean;
  showEasePreview?: boolean;
}
```

#### Tailwind Palette & Styling:
- Background: `bg-slate-900/90 border border-slate-800 rounded-2xl p-5`
- Option Pills (Inactive): `bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700`
- Option Pills (Active): `bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 font-bold border-gold-400 shadow-md shadow-gold-500/10`
- Alert Badge: `bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-full font-mono`

---

### 5.2 `PomFormEngine.tsx`

#### UI Layout & Structure:
- **Top Control Bar**:
  - **Garment Category Selector**: Tab bar with 9 garment categories divided into `Men's Bespoke` (Suit, Sherwani, Shirt, Trouser) and `Women's Couture` (Sari Blouse, Lehenga Choli, Anarkali, Corset, Gown).
  - **Fit Preference Selector**: `Skinny`, `Slim`, `Regular`, `Relaxed`.
  - **Unit Switcher**: Toggle `Imperial (in)` vs `Metric (cm)`.
- **POM Category Accordions / Groups**:
  - Length POMs (Back Length, Front Length, High Armhole to Waist).
  - Girth POMs (Chest/Bust, Upper Bust, Underbust, Waist, Hip).
  - Width POMs (Shoulder Width, Apex Distance, Cross Back).
  - Sleeve & Trouser POMs (Sleeve Length, Bicep, Wrist, Inseam, Outseam, Thigh).
- **Individual POM Input Field**:
  - Field label with code (`e.g., M-SH-01: Chest Girth`) & info tooltip.
  - Net Body numeric input with step `0.25`.
  - Calculated Target Pattern Measurement readout badge (`Net Body + Ease = Pattern POM`).
  - Ease Breakdown Collapsible / Hover Card:
    - Base Ease: `+5.00"`
    - Fit Modifier: `+0.50"`
    - Posture Offset: `-0.25"`
    - Stretch Factor: `-0.00"`
  - Status Indicator:
    - Valid: `border-slate-800 focus:border-gold-500`
    - Error: `border-rose-500/80 bg-rose-500/5 text-rose-300` + Error message caption below.
    - Warning: `border-amber-500/80 bg-amber-500/5 text-amber-300` + Warning message caption below.
  - Interactive Focus: Triggers `setFocusedLandmarkId(pom.landmarkId)` on focus and clears on blur.
- **Form Actions Footer**:
  - Validation Summary Bar (showing 0 errors, X active warnings).
  - Save Snapshot Action Button (`Save Immutable Snapshot v1.0`).

#### Props Interface:
```typescript
export interface PomFormEngineProps {
  className?: string;
  onSaveSnapshot?: (snapshot: MeasurementVersionSnapshot) => void;
  readOnly?: boolean;
}
```

---

### 5.3 `FabricYieldCalculator.tsx`

#### UI Layout & Structure:
- **Header**: `Fabric Yield & Nesting Optimization Engine`.
- **Inputs Row**:
  - **Fabric Bolt Width**: Radio buttons for `44"`, `54"`, `60"`.
  - **Pattern Repeat**: Input for pattern repeat interval in inches (e.g. 0 for plain, 3.5 for plaid/brocade).
  - **Shrinkage Buffer**: Input/Slider for shrinkage allowance (3% - 10%, default 5%).
- **Yield Summary Output Card**:
  - Large stat readout: `Required Yardage: X.XX Meters (Y.YY Yards)`.
  - Sub-stat readout: `Marker Efficiency: 88.5% (Includes 5.0% shrinkage buffer)`.
  - Fabric Yardage Formula Breakdown:
    $$\text{Yield (m)} = \text{Base Consumption} \times \text{Width Scale Factor} \times (1 + \text{Shrinkage \%}) + (\text{Repeat} \times 0.05)$$
- **Export Marker Button**: `Export DXF Marker Pattern`.

#### Props Interface:
```typescript
export interface FabricYieldCalculatorProps {
  className?: string;
  compact?: boolean;
}
```

---

### 5.4 `MeasurementEngineContainer.tsx`

#### UI Layout & Structure:
- **Root Provider Wrapper**: Wraps children in `<MeasurementEngineProvider>`.
- **Header & Atelier Bar**: Shows Client Name, Phone, VIP Status, Active Order ID.
- **Main 2-Column Responsive Layout**:
  - **Left Sidebar Column** (`col-span-12 lg:col-span-4 space-y-6`):
    - `PostureProfileSelector`
    - `FabricYieldCalculator`
  - **Main Form Column** (`col-span-12 lg:col-span-8 space-y-6`):
    - `PomFormEngine`
  - **Top Interactive Slot**: Prepared container slot for M2 SVG Body Diagram component (`<BodyLandmarkDiagram />`).

#### Props Interface:
```typescript
export interface MeasurementEngineContainerProps {
  initialGarmentCategory?: GarmentCategory;
  initialPostureProfile?: Partial<PostureProfile>;
  initialMeasurements?: Record<string, number>;
  onSaveSnapshot?: (snapshot: MeasurementVersionSnapshot) => void;
  className?: string;
}
```

---

## 6. Input Validation Bounds & Proportion Sanity Rules

| POM Code | POM Name | Garment Category | Min (in) | Max (in) | Step | Sanity / Proportion Warning Condition |
|---|---|---|---|---|---|---|
| `M-SU-01` | Chest Girth | Men's Suit | 30.0 | 64.0 | 0.25 | If Waist > Chest + 4.0" (Abdomen check required) |
| `M-SU-02` | Natural Waist | Men's Suit | 24.0 | 60.0 | 0.25 | If Waist < Chest - 16.0" |
| `M-SU-04` | Shoulder Width | Men's Suit | 14.0 | 24.0 | 0.25 | If Shoulder < 0.38 × Chest or > 0.48 × Chest |
| `M-SH-01` | Chest Girth | Men's Sherwani | 30.0 | 64.0 | 0.25 | Default ease +5.0" |
| `M-SH-06` | Back Length | Men's Sherwani | 36.0 | 56.0 | 0.50 | Garment length knee-level check |
| `W-SB-01` | Upper Bust | Women's Blouse | 26.0 | 54.0 | 0.25 | High armpit line measurement |
| `W-SB-02` | Full Bust Peak | Women's Blouse | 28.0 | 58.0 | 0.25 | Must be >= Upper Bust |
| `W-SB-03` | Underbust Band | Women's Blouse | 22.0 | 50.0 | 0.25 | Must be <= Full Bust Peak - 2.0" |
| `W-SB-04` | Apex Distance | Women's Blouse | 5.5 | 11.0 | 0.25 | Bust apex point to point distance |
| `W-LC-01` | Lehenga Waist | Women's Lehenga | 22.0 | 54.0 | 0.25 | High waist skirt attachment line |
| `W-LC-02` | High Hip | Women's Lehenga | 28.0 | 60.0 | 0.25 | 4 inches below natural waist |
| `W-LC-03` | Low Hip / Seat | Women's Lehenga | 32.0 | 68.0 | 0.25 | Fullest seat girth |
| `W-CS-01` | Corset Bust | Women's Corset | 26.0 | 52.0 | 0.25 | Tight structured compression support |
| `W-CS-02` | Corset Waist | Women's Corset | 20.0 | 46.0 | 0.25 | Compression target (-2.0" to -4.0" ease) |

---

## 7. Verification Method

1. **Static Type Integrity Verification**:
   - Run `npx tsc --noEmit` inside `apps/web` workspace to ensure zero compilation errors across all interfaces and React components.
2. **Component File Hierarchy Compliance**:
   - Verify created files under `apps/web/src/components/measurement-engine/` and `apps/web/src/context/`.
3. **Props & Context Alignment Verification**:
   - Confirm all 9 garment categories, 4 posture axes, dynamic ease formula calculations, fabric yield calculations, and validation boundary handlers are exported and typed cleanly.
