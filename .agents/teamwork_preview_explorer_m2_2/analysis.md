# Technical Design Blueprint: Visual Body Landmark Diagram & Interactivity (Milestone 2 - R2)

## Executive Summary
This document specifies the architecture, data models, validation math, color-coding logic, and React component structures for **Milestone 2 (M2: Visual Body Landmark Diagram & Interactivity)** of the Tailoring OS Measurement Engine (`yellowhouse`). M2 establishes bidirectional real-time synchronization between 2D SVG anatomical body hotspots (`focusedLandmarkId`) and dynamic POM form input fields (`pomId`), enforces multi-tier anatomical proportion sanity rules, alerts on posture profile offsets, and renders live status color-coding.

---

## 1. Bidirectional Landmark-to-POM State Synchronization

### 1.1 Synchronization Flow Architecture
Bidirectional synchronization between the 2D SVG body diagram and the numerical POM entry form is driven by `focusedLandmarkId` in `MeasurementEngineContext`.

```
┌─────────────────────────────────────────┐               ┌─────────────────────────────────────────┐
│     BodyLandmarkDiagram (SVG)           │               │          PomFormEngine (Form)            │
│  - Click / Hover Hotspot                │               │  - Focus / Hover Input Field            │
│  - Reads focusedLandmarkId              │               │  - Reads focusedLandmarkId              │
└────────────────────┬────────────────────┘               └────────────────────┬────────────────────┘
                     │                                                         │
                     │  setFocusedLandmarkId(landmarkId)                       │  setFocusedLandmarkId(landmarkId)
                     ▼                                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MeasurementEngineContext                                        │
│  - State: focusedLandmarkId: string | null                                                        │
│  - State: activePomSchema: PomSchemaItem[]                                                         │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
                     │                                                         │
                     ▼                                                         ▼
   SVG Hotspot highlights with active aura                 Input field scrolls into view & highlights
   and renders measurement guideline tape                  with golden accent border and active badge
```

### 1.2 Data Contract: `apps/web/src/lib/landmark-mappings.ts`

```typescript
import { GarmentCategory, PostureProfile, ValidationState } from '../types/measurement';

export type AnatomicalView = 'front' | 'back' | 'side';
export type GenderCategory = 'men' | 'women';

export interface LandmarkCoordinates {
  x: number; // SVG ViewBox relative X coordinate (0-300)
  y: number; // SVG ViewBox relative Y coordinate (0-600)
}

export interface MeasurementGuideline {
  type: 'horizontal_band' | 'vertical_tape' | 'arc_line' | 'point_pin';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curvature?: number; // for curved waist/hip/blade contours
}

export interface LandmarkDefinition {
  id: string; // e.g. 'hs-mens-chest'
  label: string; // e.g. 'Jacket Chest Circumference'
  gender: GenderCategory;
  primaryView: AnatomicalView;
  coordinates: LandmarkCoordinates;
  guideline: MeasurementGuideline;
  description: string;
}

export type HotspotStatus = 'valid' | 'warning' | 'error' | 'focused';

export interface HotspotColorConfig {
  status: HotspotStatus;
  hex: string;
  fillClass: string;
  strokeClass: string;
  glowClass: string;
  badgeBg: string;
  pulseAnimationClass: string;
}
```

### 1.3 Complete Anatomical Landmark Registry (22 Hotspots)

#### Men's Garment Hotspot Mappings
| Landmark ID | Label | View | X (ViewBox 300x600) | Y (ViewBox 300x600) | Mapped POM Codes |
|-------------|-------|------|--------------------|--------------------|-----------------|
| `hs-mens-neck` | Neck / Band Collar Line | Front/Back | 150 | 105 | `M-SH-05`, `M-ST-01` |
| `hs-mens-shoulder` | Acromion Shoulder Width | Front | 95 / 205 | 130 | `M-SU-04`, `M-SH-04`, `M-ST-04` |
| `hs-mens-across-chest` | Across Chest Width | Front | 150 | 150 | `M-SH-08` |
| `hs-mens-chest` | Chest Apex Circumference | Front | 150 | 170 | `M-SU-01`, `M-SH-01`, `M-ST-02` |
| `hs-mens-armscye` | Armscye / Armhole Depth | Front | 105 | 170 | `M-SU-07` |
| `hs-mens-bicep` | Bicep Circumference | Front | 75 | 200 | `M-SU-08` |
| `hs-mens-sleeve` | Crown-to-Wrist Sleeve | Front/Side | 55 | 290 | `M-SU-06`, `M-SH-07`, `M-ST-06` |
| `hs-mens-cuff` | Wrist Cuff Edge | Front | 45 | 350 | `M-ST-07` |
| `hs-mens-waist` | Buttoning / Natural Waist | Front | 150 | 240 | `M-SU-02`, `M-SH-02`, `M-ST-03` |
| `hs-mens-trouser-waist` | Trouser Waistband Height | Front | 150 | 255 | `M-TR-01` |
| `hs-mens-hip` | Full Seat / Hip Girth | Front/Side | 150 | 300 | `M-SU-03`, `M-SH-03`, `M-TR-02` |
| `hs-mens-crotch` | Crotch Intersection Rise | Front | 150 | 335 | `M-TR-08` |
| `hs-mens-thigh` | Upper Thigh Girth | Front | 125 | 375 | `M-TR-05` |
| `hs-mens-knee` | Knee Midpoint Girth | Front | 125 | 450 | `M-TR-06` |
| `hs-mens-ankle` | Ankle Leg Opening Hem | Front | 125 | 540 | `M-TR-07` |
| `hs-mens-jacket-len` | Jacket Back Length | Back | 150 | 320 | `M-SU-05` |
| `hs-mens-sherwani-len` | Sherwani Below-Knee Hem | Back | 150 | 460 | `M-SH-06` |
| `hs-mens-shirt-len` | Shirt Tail Back Length | Back | 150 | 310 | `M-ST-05` |
| `hs-mens-outseam` | Outer Leg Outseam | Side | 195 | 430 | `M-TR-03` |
| `hs-mens-inseam` | Inner Leg Inseam | Front | 135 | 430 | `M-TR-04` |

#### Women's Garment Hotspot Mappings
| Landmark ID | Label | View | X (ViewBox 300x600) | Y (ViewBox 300x600) | Mapped POM Codes |
|-------------|-------|------|--------------------|--------------------|-----------------|
| `hs-womens-front-neck` | Front Neck Drop | Front | 150 | 110 | `W-SB-06` |
| `hs-womens-back-neck` | Back Neck Drop | Back | 150 | 105 | `W-SB-07` |
| `hs-womens-upperbust` | Upper Bust High Chest | Front | 150 | 155 | `W-SB-01`, `W-CO-01` |
| `hs-womens-fullbust` | Full Bust Apex Peak | Front | 150 | 180 | `W-SB-02`, `W-LC-04`, `W-AN-01`, `W-CO-02`, `W-GO-01` |
| `hs-womens-underbust` | Underbust Ribcage Band | Front | 150 | 205 | `W-SB-03`, `W-LC-05`, `W-AN-02`, `W-CO-03` |
| `hs-womens-apex-dist` | Nipple-to-Nipple Distance | Front | 150 | 180 | `W-SB-04` |
| `hs-womens-apex-height` | High Shoulder to Apex | Front | 125 | 155 | `W-SB-05` |
| `hs-womens-armscye` | Armhole Circumference Depth| Front | 110 | 175 | `W-SB-08` |
| `hs-womens-sleeve` | Shoulder to Wrist Sleeve | Front/Side | 60 | 270 | `W-AN-06` |
| `hs-womens-waist` | Navel / Natural Waist | Front | 150 | 245 | `W-LC-01`, `W-CO-04`, `W-GO-02` |
| `hs-womens-highhip` | High Hip Curve Spring | Front | 150 | 275 | `W-LC-02`, `W-CO-05` |
| `hs-womens-hip` | Full Seat / Hip Girth | Front/Side | 150 | 305 | `W-GO-03` |
| `hs-womens-blouse-len` | Blouse Bottom Band Hem | Front | 150 | 215 | `W-SB-09` |
| `hs-womens-choli-len` | Choli Back Length | Back | 150 | 220 | `W-LC-06` |
| `hs-womens-yoke-len` | Empire Yoke Height | Front | 150 | 210 | `W-AN-03` |
| `hs-womens-busk-len` | Center Steel Busk Length | Front | 150 | 245 | `W-CO-06` |
| `hs-womens-sh-waist` | High Shoulder to Waist | Side | 150 | 185 | `W-GO-06` |
| `hs-womens-lehenga-len`| Waist to Floor Lehenga Length | Side | 180 | 410 | `W-LC-03` |
| `hs-womens-gown-len` | Shoulder to Floor Gown | Front | 150 | 560 | `W-AN-04` |
| `hs-womens-hollow-hem` | Neck Hollow to Floor Hem | Front | 150 | 560 | `W-GO-04` |
| `hs-womens-flare` | Umbrella Flare Circle Hem | Front | 150 | 575 | `W-AN-05` |
| `hs-womens-train` | Trailing Skirt Train Sweep| Back | 150 | 585 | `W-GO-05` |

### 1.4 Helper Functions Specification
```typescript
export function getLandmarkForPom(garmentCategory: GarmentCategory, pomId: string): LandmarkDefinition | undefined;
export function getPomForLandmark(garmentCategory: GarmentCategory, landmarkId: string): PomSchemaItem | undefined;
export function getLandmarksForGarment(garmentCategory: GarmentCategory, view: AnatomicalView): LandmarkDefinition[];
```

---

## 2. Anatomical Proportion Sanity Rules & Posture Alerts

### 2.1 Proportion Sanity Validation Matrix (Validation Rules)

To protect bespoke pattern making from invalid anthropometric input data, the engine applies real-time proportion checks in `MeasurementEngineContext`:

```typescript
export interface ProportionCheckResult {
  pomId: string;
  severity: 'error' | 'warning';
  message: string;
}

export function evaluateAnatomicalProportions(
  garmentCategory: GarmentCategory,
  measurements: Record<string, number>,
  postureProfile: PostureProfile
): ProportionCheckResult[]
```

#### Detailed Rule Specifications:

1. **Women's Bust Tiering Invariant**:
   - **Rule 1.1**: `Underbust < Upper Bust < Full Bust`
   - **Check**: `Upper Bust >= Full Bust`
     - Severity: `error` (Rose Red)
     - Message: `"Upper Bust (${upperBust}") cannot exceed or equal Full Bust Peak (${fullBust}")."`
   - **Check**: `Underbust >= Upper Bust`
     - Severity: `error` (Rose Red)
     - Message: `"Underbust Band (${underbust}") cannot exceed or equal Upper Bust (${upperBust}")."`
   - **Check**: `Underbust >= Full Bust`
     - Severity: `error` (Rose Red)
     - Message: `"Underbust Band (${underbust}") cannot exceed Full Bust Peak (${fullBust}")."`

2. **Trouser Seam Length Invariant**:
   - **Rule 2.1**: `Inseam < Outseam`
   - **Check**: `Inseam >= Outseam`
     - Severity: `error` (Rose Red)
     - Message: `"Inseam length (${inseam}") must be strictly less than Outseam length (${outseam}")."`
   - **Rule 2.2**: Crotch Rise Delta `Rise = Outseam - Inseam`
   - **Check**: `Rise < 7.0"` or `Rise > 16.0"`
     - Severity: `warning` (Amber Gold)
     - Message: `"Crotch rise delta (${rise.toFixed(1)}") is unusual for standard trouser draft (expected 7.0" - 16.0")."`

3. **Chest vs Waist Girth Invariant (Men's)**:
   - **Check**: `Waist > Chest + 4.0"` AND `postureProfile.abdomenStance !== 'prominent'`
     - Severity: `warning` (Amber Gold)
     - Message: `"Waist girth (${waist}") significantly exceeds Chest girth (${chest}"). Set Abdomen Stance to 'Prominent' if intentional."`

4. **Neck-to-Chest Ratio Sanity**:
   - **Check**: `Neck > Chest * 0.50` OR `Neck < Chest * 0.28`
     - Severity: `warning` (Amber Gold)
     - Message: `"Neck circumference (${neck}") is out of standard proportion relative to Chest girth (${chest}")."`

5. **Shoulder-to-Chest Ratio Sanity**:
   - **Check**: `Shoulder > Chest * 0.60` OR `Shoulder < Chest * 0.35`
     - Severity: `warning` (Amber Gold)
     - Message: `"Shoulder width (${shoulder}") is out of proportion relative to Chest girth (${chest}")."`

6. **Apex Distance Ratio (Women's)**:
   - **Check**: `ApexDistance > FullBust * 0.32` OR `ApexDistance < FullBust * 0.14`
     - Severity: `warning` (Amber Gold)
     - Message: `"Bust apex distance (${apexDist}") is disproportionate relative to Full Bust (${fullBust}")."`

7. **Corset Tight-Lace Sanity**:
   - **Check**: `WaistCinchTarget > Underbust + 2.0"`
     - Severity: `warning` (Amber Gold)
     - Message: `"Corset waist target exceeds underbust line, defying waist-reduction silhouette."`

### 2.2 Posture Offset Alert Triggers

Selecting non-normal values on the 4 posture axes triggers targeted posture warning badges (Amber Gold) and recalculates ease pattern drops:

```typescript
export interface PostureAlertTrigger {
  axis: PostureAxis;
  value: string;
  affectedPomIds: string[];
  affectedLandmarkIds: string[];
  alertMessage: string;
  patternEffectNote: string;
}
```

#### Posture Alert Registry:
| Axis | Value | Affected POMs | Affected Landmarks | Alert Badge & Pattern Note |
|------|-------|---------------|-------------------|----------------------------|
| `shoulderSlope` | `sloped` | `m-su-07`, `w-sb-08` | `hs-mens-armscye`, `hs-womens-armscye` | `"Sloped shoulders (+0.25" Armscye depth drop, shoulder seam angle lowered 3°)."` |
| `shoulderSlope` | `square` | `m-su-07`, `w-sb-08` | `hs-mens-armscye`, `hs-womens-armscye` | `"Square shoulders (-0.25" Armscye depth drop, shoulder seam angle raised 2°)."` |
| `shoulderSlope` | `very_sloped` | `m-su-07`, `w-sb-08` | `hs-mens-armscye`, `hs-womens-armscye` | `"Very sloped shoulders (+0.50" Armscye depth drop, shoulder pad insertion required)."` |
| `backCurvature` | `stooped` | `m-su-05`, `m-st-05`, `m-sh-08` | `hs-mens-jacket-len`, `hs-mens-across-chest` | `"Stooped back (+0.75" Center Back extension to prevent collar gap)."` |
| `backCurvature` | `erect` | `m-su-05`, `m-st-05` | `hs-mens-jacket-len` | `"Erect posture (-0.375" Center Back reduction to eliminate lumbar waist rolls)."` |
| `backCurvature` | `prominent_blade` | `m-su-04`, `m-sh-04` | `hs-mens-shoulder` | `"Prominent scapula (+0.50" Across Back width, shoulder blade dart expanded)."` |
| `abdomenStance` | `prominent` | `m-su-02`, `m-st-03`, `w-lc-01` | `hs-mens-waist`, `hs-womens-waist` | `"Prominent abdomen (+1.0" Front Waist length & buttoning ease extension)."` |
| `abdomenStance` | `flat` | `m-su-02`, `m-st-03` | `hs-mens-waist` | `"Flat abdomen (-0.50" Front Waist ease streamlined)."` |
| `hipSpineStance` | `high_hip` | `m-tr-02`, `w-lc-02`, `w-co-05` | `hs-mens-hip`, `hs-womens-highhip` | `"High hip (+0.50" High Hip ease & raised side seam shaping)."` |
| `hipSpineStance` | `sway_back` | `m-tr-08`, `w-lc-06` | `hs-mens-crotch`, `hs-womens-choli-len` | `"Sway back stance (-0.50" Back Waist rise hollowed out to avoid fabric pooling)."` |

---

## 3. Color-Coding State Logic

### 3.1 State Resolution Hierarchy
For any landmark or POM input field, state color is determined by a strict priority order:

1. **Focused Override**: If `landmarkId === focusedLandmarkId` -> Apply Active Focus Ring (Gold Glow + Primary status border).
2. **Rose Red (`#EF4444`)**: Range Min/Max Error OR Anatomical Proportion Error. High priority visual indicator.
3. **Amber Gold (`#F59E0B`)**: Range Warning OR Active Posture Profile Offset Trigger OR Proportion Warning.
4. **Emerald Green (`#10B981`)**: Input is valid, within range bounds, passes all proportion checks, and normal posture.

### 3.2 Hotspot Color Configuration Mapping

```typescript
export function getHotspotColorConfig(
  pomId: string | undefined,
  validationState: ValidationState,
  postureProfile: PostureProfile,
  isFocused: boolean
): HotspotColorConfig {
  const hasError = pomId ? !!validationState.errors[pomId] : false;
  const hasWarning = pomId ? !!validationState.warnings[pomId] : false;

  if (hasError) {
    return {
      status: isFocused ? 'focused' : 'error',
      hex: '#EF4444',
      fillClass: 'fill-rose-500',
      strokeClass: 'stroke-rose-400',
      glowClass: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      pulseAnimationClass: 'animate-ping text-rose-500/40'
    };
  }

  if (hasWarning) {
    return {
      status: isFocused ? 'focused' : 'warning',
      hex: '#F59E0B',
      fillClass: 'fill-amber-500',
      strokeClass: 'stroke-amber-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      pulseAnimationClass: 'animate-pulse text-amber-500/30'
    };
  }

  return {
    status: isFocused ? 'focused' : 'valid',
    hex: '#10B981',
    fillClass: 'fill-emerald-500',
    strokeClass: 'stroke-emerald-400',
    glowClass: isFocused
      ? 'drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]'
      : 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    pulseAnimationClass: isFocused ? 'animate-pulse text-gold-400/50' : 'none'
  };
}
```

---

## 4. Component Structure & Integration Blueprint

### 4.1 Component Tree Architecture

```
MeasurementEngineContainer.tsx
 ├── BodyLandmarkDiagram.tsx  (Visual 2D SVG Panel - Left Column)
 │    ├── AnatomicalViewSwitcher (Front | Back | Side)
 │    ├── SvgHumanBodyOutline.tsx
 │    │    ├── <defs> (Glow filters, marker gradients)
 │    │    ├── <g id="body-silhouette"> (Male/Female Vector Body Path)
 │    │    ├── <g id="posture-deformers"> (Visual Posture Offsets)
 │    │    ├── <g id="measurement-guidelines"> (Dashed Tape Lines)
 │    │    └── <g id="hotspots"> (Interactive Hotspot Pins)
 │    └── ActiveLandmarkDetailCard (Context summary box)
 │
 ├── PomFormEngine.tsx        (Dynamic Form Input Grid - Right/Center Column)
 ├── PostureProfileSelector.tsx (4-Axis Controls - Bottom Left)
 └── FabricYieldCalculator.tsx  (Fabric Math Card - Bottom Right)
```

### 4.2 Detailed Component Specifications

#### A. `BodyLandmarkDiagram.tsx`
- **Location**: `apps/web/src/components/measurement-engine/BodyLandmarkDiagram.tsx`
- **Props**: `className?: string`, `interactive?: boolean`
- **State**: `view: 'front' | 'back' | 'side'` (defaults to `'front'`)
- **Key Responsibilities**:
  1. Render view switcher tab bar (Front View, Back View, Side View).
  2. Auto-detect gender silhouette (`men` vs `women`) from `useMeasurementEngine().gender`.
  3. Render `SvgHumanBodyOutline`.
  4. Display status summary bar (Count of Valid, Posture Warning, and Proportion Error landmarks).
  5. Render `ActiveLandmarkDetailCard` at bottom when a landmark is focused.

#### B. `SvgHumanBodyOutline.tsx`
- **Location**: `apps/web/src/components/measurement-engine/SvgHumanBodyOutline.tsx`
- **Props**:
  - `gender`: `'men' | 'women'`
  - `view`: `'front' | 'back' | 'side'`
  - `focusedLandmarkId`: `string | null`
  - `validationState`: `ValidationState`
  - `postureProfile`: `PostureProfile`
  - `measurements`: `Record<string, number>`
  - `activePomSchema`: `PomSchemaItem[]`
  - `onSelectLandmark`: `(landmarkId: string) => void`
- **SVG ViewBox**: `0 0 300 600`
- **SVG Layers**:
  1. Background grid overlay (subtle 20px slate mesh).
  2. Silhouette vector path with anatomical outline (torso, arms, legs, neck, head).
  3. Dynamic posture deformity paths (e.g. tilted shoulder line when `shoulderSlope === 'sloped'`).
  4. Guidelines: Dashed tape lines across active measurement points (e.g. chest circumference band line).
  5. Hotspot pins: `<g>` group with target radius 16px, core pin circle radius 6px, color-coded based on `getHotspotColorConfig()`.
  6. Hover Tooltip: Floating SVG card showing POM code, name, value in active units (`in` / `cm`), and validation alert text.

#### C. Integration in `MeasurementEngineContainer.tsx`

Upgrade `MeasurementEngineContainer.tsx` to integrate `BodyLandmarkDiagram.tsx` into a responsive 12-column layout:

```tsx
<MeasurementEngineProvider
  initialGarmentCategory={initialGarmentCategory}
  initialPostureProfile={initialPostureProfile}
  initialMeasurements={initialMeasurements}
>
  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${className}`}>
    {/* Left Column: Visual 2D SVG Body Diagram (5 cols) */}
    <div className="lg:col-span-5 space-y-6">
      <BodyLandmarkDiagram />
    </div>

    {/* Right Column: POM Form Engine & Posture / Fabric Controls (7 cols) */}
    <div className="lg:col-span-7 space-y-6">
      <PomFormEngine onSaveSnapshot={onSaveSnapshot} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PostureProfileSelector />
        <FabricYieldCalculator />
      </div>
    </div>
  </div>
</MeasurementEngineProvider>
```

---

## 5. Verification & Test Plan

1. **TypeScript Type Safety**: Verify zero `tsc --noEmit` errors across `landmark-mappings.ts`, `BodyLandmarkDiagram.tsx`, `SvgHumanBodyOutline.tsx`, and `MeasurementEngineContext.tsx`.
2. **Bidirectional Focus Sync Test**:
   - Focus input field for `M-SU-01` -> `focusedLandmarkId` becomes `'hs-mens-chest'`, SVG hotspot for chest pulses with gold ring.
   - Click SVG hotspot `'hs-mens-waist'` -> `focusedLandmarkId` becomes `'hs-mens-waist'`, `PomFormEngine` scrolls input `M-SU-02` into view with gold outline.
3. **Proportion Sanity Validation Test**:
   - Enter `W-SB-01` (Upper Bust) = 38" and `W-SB-02` (Full Bust) = 36". Context sets `validationState.errors['w-sb-02']` and SVG hotspot `'hs-womens-fullbust'` turns Rose Red (`#EF4444`).
   - Enter `M-TR-04` (Inseam) = 35" and `M-TR-03` (Outseam) = 30". Context sets `validationState.errors['m-tr-04']` and SVG hotspot `'hs-mens-inseam'` turns Rose Red (`#EF4444`).
4. **Posture Alert Trigger Test**:
   - Select `shoulderSlope = 'sloped'`. Context sets posture alert warning on `M-SU-07` (Armscye), SVG hotspot `'hs-mens-armscye'` turns Amber Gold (`#F59E0B`) with posture note.
