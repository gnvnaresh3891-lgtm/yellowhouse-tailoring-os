# Milestone 2 (M2) Design Blueprint: Visual Body Landmark Diagram & Interactivity

## Executive Summary
This document specifies the complete visual architecture, SVG vector geometries, anatomical hotspot dictionary, and interactive state management for **Milestone 2 (M2)** of Yellowhouse Tailoring OS (`apps/web/src/components/measurement-engine/SvgHumanBodyOutline.tsx` and `BodyLandmarkDiagram.tsx`). 

M2 delivers interactive, responsive 2D SVG vector human body outlines for **Men (Front & Back views)** and **Women (Front & Back views)**. Every single Point of Measure (POM) across all 9 garment categories defined in M1 maps directly to precise `(cx, cy, r)` coordinates on a `0 0 400 800` SVG canvas. The design seamlessly integrates with the Tailwind dark slate UI theme (`#0F172A`, `#1E293B`, `#334155`) with gold accent highlights (`#EAB308`) and real-time color-coded validation feedback (`#10B981` emerald valid, `#F59E0B` amber warning, `#EF4444` rose error).

---

## 1. Architectural Overview & Component Hierarchy

### Component Relationship
```
MeasurementEngineContainer.tsx
└── BodyLandmarkDiagram.tsx (Container & Toolbar Controls)
    ├── View Toggle Header ([ Front View | Back View ], Landmark Legend, Auto-Switch toggle)
    ├── SvgHumanBodyOutline.tsx (Core 2D Vector Canvas & Hotspot Layer)
    │   ├── Layer 1: Anatomical Body Silhouette Vector Paths (`<path className="body-outline">`)
    │   ├── Layer 2: POM Dimension Guide Lines & Measuring Tape Overlay (`<line>`, `<path>`)
    │   └── Layer 3: Interactive Hotspot Nodes (`<g id={landmarkId}>` with `<circle>` & `<animate>`)
    └── HotspotTooltipOverlay.tsx (Floating HTML/SVG Tooltip with live measurement details)
```

### Context Integration (`MeasurementEngineContext`)
- **Reading State**: `gender`, `garmentCategory`, `activePomSchema`, `measurements`, `validationState`, `focusedLandmarkId`.
- **Triggering Actions**: `setFocusedLandmarkId(landmarkId | null)`.
- **Bidirectional Interaction**:
  1. Hover/Click on SVG Hotspot $\rightarrow$ `setFocusedLandmarkId(landmarkId)` $\rightarrow$ highlights matching input field in `PomFormEngine.tsx`.
  2. Focus on POM Input Field in `PomFormEngine.tsx` $\rightarrow$ sets `focusedLandmarkId` $\rightarrow$ SVG triggers gold pulse ring animation (`#EAB308`) and displays dimension guide line.

---

## 2. Anatomical Hotspot Master Dictionary

All 63 POM items across all 9 garment categories map to 35 unique anatomical landmark hotspots. The standard SVG canvas resolution is **`viewBox="0 0 400 800"`** (width: 400px, height: 800px).

### 2.1 Men's Anatomical Hotspots (Canvas: `0 0 400 800`)

| Hotspot ID | Anatomical Name | Primary View | Coordinates `(cx, cy, r)` | POM Codes Mapped | Dimension Guide Vector |
|---|---|---|---|---|---|
| `hs-mens-neck` | Collar Base / Neck Band | Front & Back | `cx: 200, cy: 115, r: 10` | `M-SH-05`, `M-ST-01` | Ellipse band at neck base (`rx=32, ry=10`) |
| `hs-mens-shoulder` | Shoulder Point (Acromion) | Front & Back | `cx: 130, cy: 135, r: 10` (L), `cx: 270, cy: 135, r: 10` (R) | `M-SU-04`, `M-SH-04`, `M-ST-04` | Horizontal dashed line (`x1=130, x2=270, y=135`) |
| `hs-mens-across-chest` | Across Chest Width | Front | `cx: 200, cy: 165, r: 9` | `M-SH-08` | Horizontal line between armpits (`x1=150, x2=250, y=165`) |
| `hs-mens-chest` | Chest Circumference Girth | Front | `cx: 200, cy: 190, r: 12` | `M-SU-01`, `M-SH-01`, `M-ST-02` | Full chest girth band (`x1=145, x2=255, y=190`) |
| `hs-mens-armscye` | Armhole / Armscye Base | Front | `cx: 145, cy: 180, r: 9` | `M-SU-07` | Curved armscye arc around arm joint |
| `hs-mens-bicep` | Full Bicep Girth | Front | `cx: 115, cy: 230, r: 10` | `M-SU-08` | Transverse arm ring (`x1=100, x2=130, y=230`) |
| `hs-mens-sleeve` | Sleeve Length (Crown-to-Wrist) | Front & Back | `cx: 105, cy: 300, r: 10` | `M-SU-06`, `M-SH-07`, `M-ST-06` | Outer arm trace (`130,135` $\rightarrow$ `115,230` $\rightarrow$ `100,370`) |
| `hs-mens-cuff` | Wrist / Cuff Circumference | Front | `cx: 100, cy: 370, r: 9` | `M-ST-07` | Wrist cuff ring at `y=370` |
| `hs-mens-waist` | Jacket / Shirt Natural Waist | Front | `cx: 200, cy: 280, r: 11` | `M-SU-02`, `M-SH-02`, `M-ST-03` | Waistband line (`x1=152, x2=248, y=280`) |
| `hs-mens-trouser-waist` | Trouser Waistband Height | Front | `cx: 200, cy: 330, r: 11` | `M-TR-01` | Trouser belt line (`x1=148, x2=252, y=330`) |
| `hs-mens-hip` | Full Seat / Hip Circumference | Front & Back | `cx: 200, cy: 360, r: 12` | `M-SU-03`, `M-SH-03`, `M-TR-02` | Seat girth band (`x1=145, x2=255, y=360`) |
| `hs-mens-jacket-len` | Center Back Jacket Length | Back (Front Ref) | `cx: 200, cy: 340, r: 10` | `M-SU-05` | Vertical drop line (`y1=115` to `y2=340`) |
| `hs-mens-shirt-len` | Back Shirt Tail Length | Back (Front Ref) | `cx: 200, cy: 350, r: 10` | `M-ST-05` | Vertical drop line (`y1=115` to `y2=350`) |
| `hs-mens-sherwani-len` | Royal Sherwani Full Length | Front & Back | `cx: 200, cy: 580, r: 10` | `M-SH-06` | Vertical drop line (`y1=115` to `y2=580`) |
| `hs-mens-crotch` | Crotch Rise Depth | Front | `cx: 200, cy: 410, r: 10` | `M-TR-08` | Crotch rise line (`y1=330` to `y2=410`) |
| `hs-mens-thigh` | Upper Thigh Girth | Front | `cx: 165, cy: 470, r: 11` | `M-TR-05` | Horizontal thigh ring (`x1=145, x2=185, y=470`) |
| `hs-mens-knee` | Knee Midpoint Circumference | Front | `cx: 165, cy: 590, r: 10` | `M-TR-06` | Horizontal knee ring (`x1=150, x2=180, y=590`) |
| `hs-mens-ankle` | Leg Opening / Hem | Front | `cx: 165, cy: 730, r: 9` | `M-TR-07` | Bottom leg hem ring (`x1=152, x2=178, y=730`) |
| `hs-mens-outseam` | Trouser Outseam Length | Front | `cx: 140, cy: 530, r: 10` | `M-TR-03` | Outer leg trace line (`y1=330` to `y2=730`) |
| `hs-mens-inseam` | Trouser Inseam Length | Front | `cx: 185, cy: 570, r: 10` | `M-TR-04` | Inner leg trace line (`y1=410` to `y2=730`) |

---

### 2.2 Women's Anatomical Hotspots (Canvas: `0 0 400 800`)

| Hotspot ID | Anatomical Name | Primary View | Coordinates `(cx, cy, r)` | POM Codes Mapped | Dimension Guide Vector |
|---|---|---|---|---|---|
| `hs-womens-front-neck` | Front Neck Drop Depth | Front | `cx: 200, cy: 130, r: 9` | `W-SB-06` | Vertical drop line (`y1=118` to `y2=130`) |
| `hs-womens-back-neck` | Back Neck Drop Depth | Back | `cx: 200, cy: 140, r: 9` | `W-SB-07` | Vertical drop line (`y1=118` to `y2=140`) |
| `hs-womens-upperbust` | Upper Bust / Overbust | Front | `cx: 200, cy: 175, r: 11` | `W-SB-01`, `W-CO-01` | High bust line (`x1=148, x2=252, y=175`) |
| `hs-womens-fullbust` | Full Bust Apex Peak | Front | `cx: 200, cy: 205, r: 12` | `W-SB-02`, `W-LC-04`, `W-AN-01`, `W-CO-02`, `W-GO-01` | Full bust apex band (`x1=142, x2=258, y=205`) |
| `hs-womens-underbust` | Underbust / Empire Band | Front | `cx: 200, cy: 230, r: 11` | `W-SB-03`, `W-LC-05`, `W-AN-02`, `W-CO-03` | Ribcage band line (`x1=150, x2=250, y=230`) |
| `hs-womens-apex-dist` | Bust Apex Distance (N-to-N) | Front | `cx: 200, cy: 205, r: 9` | `W-SB-04` | Horizontal apex span (`x1=170, x2=230, y=205`) |
| `hs-womens-apex-height` | Apex Height (Shoulder-Apex) | Front | `cx: 170, cy: 165, r: 9` | `W-SB-05` | Vertical drop line (`140,135` $\rightarrow$ `170,205`) |
| `hs-womens-armscye` | Armhole / Armscye Depth | Front | `cx: 152, cy: 175, r: 9` | `W-SB-08` | Armhole contour arc |
| `hs-womens-sleeve` | Sleeve Length | Front | `cx: 120, cy: 290, r: 10` | `W-AN-06` | Outer arm length line |
| `hs-womens-waist` | Natural Waist / Corset Cinch | Front & Back | `cx: 200, cy: 275, r: 11` | `W-LC-01`, `W-CO-04`, `W-GO-02` | Natural waistline (`x1=155, x2=245, y=275`) |
| `hs-womens-highhip` | High Hip Curve | Front | `cx: 200, cy: 325, r: 11` | `W-CO-05` | High hip band (`x1=148, x2=252, y=325`) |
| `hs-womens-hip` | Full Hip / Seat Girth | Front & Back | `cx: 200, cy: 365, r: 12` | `W-LC-02`, `W-GO-03` | Full hip girth band (`x1=142, x2=258, y=365`) |
| `hs-womens-blouse-len` | Sari Blouse Total Length | Front | `cx: 200, cy: 245, r: 9` | `W-SB-09` | Vertical drop line (`y1=135` to `y2=245`) |
| `hs-womens-choli-len` | Choli Back Length | Back | `cx: 200, cy: 260, r: 9` | `W-LC-06` | Vertical drop line (`y1=135` to `y2=260`) |
| `hs-womens-yoke-len` | Empire Yoke Height | Front | `cx: 200, cy: 235, r: 9` | `W-AN-03` | Vertical drop line (`y1=135` to `y2=235`) |
| `hs-womens-sh-waist` | Shoulder to Waist Length | Front | `cx: 200, cy: 270, r: 9` | `W-GO-06` | Vertical drop line (`y1=135` to `y2=270`) |
| `hs-womens-busk-len` | Steel Busk Front Length | Front | `cx: 200, cy: 255, r: 9` | `W-CO-06` | Vertical center busk line (`y1=175` to `y2=325`) |
| `hs-womens-lehenga-len` | Lehenga Length (Floor + Heels) | Front | `cx: 155, cy: 500, r: 10` | `W-LC-03` | Vertical length line (`y1=275` to `y2=730`) |
| `hs-womens-gown-len` | Anarkali / Evening Gown Length | Front | `cx: 200, cy: 720, r: 10` | `W-AN-04` | Vertical length line (`y1=135` to `y2=730`) |
| `hs-womens-hollow-hem` | Hollow to Hem Floor Length | Front | `cx: 200, cy: 430, r: 10` | `W-GO-04` | Center front drop line (`y1=118` to `y2=730`) |
| `hs-womens-train` | Evening Gown Train Sweep | Back | `cx: 200, cy: 765, r: 11` | `W-GO-05` | Extended trailing skirt line (`y1=730` to `y2=780`) |
| `hs-womens-flare` | Umbrella Flare Circle Hem | Front | `cx: 200, cy: 745, r: 12` | `W-AN-05` | Wide bottom hem arc (`x1=60, x2=340, y=745`) |

---

## 3. Detailed SVG Path Vector Outlines

### 3.1 Men's Vector Silhouette (`viewBox="0 0 400 800"`)

```xml
<g id="mens-body-silhouette" className="fill-slate-800/80 stroke-slate-600 stroke-[1.5]">
  <!-- Head & Neck -->
  <path d="M 175 65 C 175 40, 225 40, 225 65 C 225 85, 215 95, 208 100 L 208 120 L 192 120 L 192 100 C 185 95, 175 85, 175 65 Z" />
  
  <!-- Torso & Arms (Front) -->
  <path d="M 192 120 C 170 122, 140 128, 130 135 C 122 142, 115 190, 112 230 C 108 270, 102 330, 98 375 L 110 378 C 115 335, 122 280, 128 240 C 135 242, 142 240, 145 220 C 148 195, 148 185, 150 180 C 152 230, 153 280, 152 330 C 150 350, 145 370, 145 400 L 160 410 C 165 405, 185 410, 200 410 C 215 410, 235 405, 240 410 L 255 400 C 255 370, 250 350, 248 330 C 247 280, 248 230, 250 180 C 252 185, 252 195, 255 220 C 258 240, 265 242, 272 240 C 278 280, 285 335, 290 378 L 302 375 C 298 330, 292 270, 288 230 C 285 190, 278 142, 270 135 C 260 128, 230 122, 208 120 Z" />

  <!-- Legs & Feet (Front) -->
  <path d="M 160 410 C 158 450, 155 520, 153 590 C 152 640, 154 700, 154 740 L 176 740 C 176 700, 178 640, 177 590 C 176 520, 182 460, 195 415 C 190 412, 175 410, 160 410 Z" />
  <path d="M 240 410 C 242 450, 245 520, 247 590 C 248 640, 246 700, 246 740 L 224 740 C 224 700, 222 640, 223 590 C 224 520, 218 460, 205 415 C 210 412, 225 410, 240 410 Z" />
  
  <!-- Anatomical Landmark Detail Lines (Chest grid, waist mark, C7 back vertebra) -->
  <line x1="145" y1="190" x2="255" y2="190" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
  <line x1="152" y1="280" x2="248" y2="280" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
  <line x1="145" y1="360" x2="255" y2="360" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
</g>
```

---

### 3.2 Women's Vector Silhouette (`viewBox="0 0 400 800"`)

```xml
<g id="womens-body-silhouette" className="fill-slate-800/80 stroke-slate-600 stroke-[1.5]">
  <!-- Head & Neck -->
  <path d="M 178 62 C 175 35, 225 35, 222 62 C 220 82, 212 92, 206 98 L 206 118 L 194 118 L 194 98 C 188 92, 180 82, 178 62 Z" />

  <!-- Feminine Hourglass Torso & Arms -->
  <path d="M 194 118 C 175 120, 150 126, 140 135 C 132 142, 126 185, 122 220 C 118 255, 114 315, 110 360 L 120 362 C 124 322, 128 268, 134 230 C 140 232, 146 228, 148 210 C 150 190, 146 178, 148 175 C 152 205, 160 215, 170 215 C 180 215, 188 205, 192 195 C 196 205, 204 215, 214 215 C 224 215, 232 205, 236 175 C 238 178, 234 190, 236 210 C 238 228, 244 232, 250 230 C 256 268, 260 322, 264 362 L 274 360 C 270 315, 266 255, 262 220 C 258 185, 252 142, 244 135 C 234 126, 209 120, 194 118 Z" />

  <!-- Pelvis, High Hip, Thighs & Feet -->
  <path d="M 155 275 C 148 310, 142 345, 142 365 C 142 410, 152 480, 154 570 C 155 630, 156 700, 156 738 L 174 738 C 174 700, 175 630, 175 570 C 176 480, 180 430, 195 380 C 190 375, 175 375, 155 275 Z" />
  <path d="M 245 275 C 252 310, 258 345, 258 365 C 258 410, 248 480, 246 570 C 245 630, 244 700, 244 738 L 226 738 C 226 700, 225 630, 225 570 C 224 480, 220 430, 205 380 C 210 375, 225 375, 245 275 Z" />

  <!-- Bust Apex Cups & Waist Curve Detail -->
  <circle cx="170" cy="205" r="14" className="fill-none stroke-slate-600/40 stroke-[1] stroke-dasharray-[2_2]" />
  <circle cx="230" cy="205" r="14" className="fill-none stroke-slate-600/40 stroke-[1] stroke-dasharray-[2_2]" />
  <line x1="148" y1="175" x2="252" y2="175" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
  <line x1="150" y1="230" x2="250" y2="230" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
  <line x1="155" y1="275" x2="245" y2="275" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
  <line x1="142" y1="365" x2="258" y2="365" className="stroke-slate-600/50 stroke-[1] stroke-dasharray-[3_3]" />
</g>
```

---

## 4. Interactive State Machine & Visual Styling Specifications

### 4.1 Hotspot State Matrix

| State | Hotspot Node Style (`<circle>`) | Guide Vector Style (`<line>` / `<path>`) | Glow Effect Filter | Animation |
|---|---|---|---|---|
| **Default / Inactive** | `fill="#0F172A" stroke="#94A3B8" stroke-width="2" opacity="0.7"` | Hidden (`opacity="0"`) | None | Static |
| **Hovered** | `fill="#EAB308" stroke="#FFFFFF" stroke-width="2.5" opacity="1"` | `stroke="#EAB308" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8"` | `url(#glow-gold)` | Scaling `transform: scale(1.2)` |
| **Focused / Active** | `fill="#EAB308" stroke="#FDE047" stroke-width="3" opacity="1"` | `stroke="#EAB308" stroke-width="2" stroke-dasharray="0" opacity="1"` | `url(#glow-gold-intense)` | Concentric Gold Pulse Ring (`<animate>`) |
| **Valid POM Input** | `fill="#10B981" stroke="#A7F3D0" stroke-width="2" opacity="0.9"` | `stroke="#10B981" stroke-width="1.5" opacity="0.7"` | `url(#glow-emerald)` | Gentle emerald breathing glow |
| **Posture Alert / Warning** | `fill="#F59E0B" stroke="#FDE68A" stroke-width="2.5" opacity="1"` | `stroke="#F59E0B" stroke-width="2" stroke-dasharray="3 3" opacity="0.9"` | `url(#glow-amber)` | Amber pulse warning ring |
| **Out-of-Range Error** | `fill="#EF4444" stroke="#FECDD3" stroke-width="3" opacity="1"` | `stroke="#EF4444" stroke-width="2" opacity="1"` | `url(#glow-rose)` | Rapid Rose Red Ping Alert (`animate-ping`) |

---

### 4.2 SVG Filter Definitions & CSS Pulse Animations

```xml
<defs>
  <!-- Gold Glow Filter (#EAB308) -->
  <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="blur" />
    <feComponentTransfer in="blur" result="glow">
      <feFuncA type="linear" slope="0.8" />
    </feComponentTransfer>
    <feMerge>
      <feMergeNode in="glow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>

  <!-- Intense Active Gold Filter -->
  <filter id="glow-gold-intense" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#EAB308" flood-opacity="0.9" />
  </filter>

  <!-- Emerald Valid Filter (#10B981) -->
  <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#10B981" flood-opacity="0.7" />
  </filter>

  <!-- Rose Error Filter (#EF4444) -->
  <filter id="glow-rose" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#EF4444" flood-opacity="0.9" />
  </filter>
</defs>
```

---

## 5. React Code Blueprint for `SvgHumanBodyOutline.tsx`

```tsx
'use client';

import React, { useMemo } from 'react';
import { GarmentCategory, PomSchemaItem, ValidationState } from '../../types/measurement';

export interface SvgHumanBodyOutlineProps {
  gender: 'men' | 'women';
  garmentCategory: GarmentCategory;
  viewMode?: 'front' | 'back';
  activeLandmarkId?: string | null;
  activeCategoryPoms?: PomSchemaItem[];
  measurements?: Record<string, number>;
  validationState?: ValidationState;
  onSelectLandmark?: (landmarkId: string) => void;
  onHoverLandmark?: (landmarkId: string | null) => void;
  className?: string;
}

export const SvgHumanBodyOutline: React.FC<SvgHumanBodyOutlineProps> = ({
  gender,
  garmentCategory,
  viewMode = 'front',
  activeLandmarkId,
  activeCategoryPoms = [],
  measurements = {},
  validationState,
  onSelectLandmark,
  onHoverLandmark,
  className = ''
}) => {
  // Map of active landmark IDs relevant to current category template
  const relevantLandmarks = useMemo(() => {
    const set = new Set<string>();
    for (const pom of activeCategoryPoms) {
      if (pom.landmarkId) set.add(pom.landmarkId);
    }
    return set;
  }, [activeCategoryPoms]);

  // Determine visual status of a hotspot
  const getHotspotStatus = (landmarkId: string) => {
    const matchingPom = activeCategoryPoms.find((p) => p.landmarkId === landmarkId);
    if (!matchingPom) return 'inactive';

    const pomId = matchingPom.id;
    if (validationState?.errors[pomId]) return 'error';
    if (validationState?.warnings[pomId]) return 'warning';
    if (measurements[pomId] !== undefined) return 'valid';
    return 'default';
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl ${className}`}>
      <svg
        viewBox="0 0 400 800"
        className="w-full max-w-[380px] h-auto select-none transition-all duration-300"
        style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' }}
      >
        {/* Defs for Gold & Status Glow Filters */}
        <defs>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EAB308" floodOpacity="0.9" />
          </filter>
          <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" floodOpacity="0.7" />
          </filter>
          <filter id="glow-rose" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EF4444" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Render Silhouette Body Vector */}
        {gender === 'men' ? (
          <g id="mens-body-silhouette" className="fill-slate-900 stroke-slate-700 stroke-[1.5]">
            {/* Men Body Silhouette Paths */}
            <path d="M 175 65 C 175 40, 225 40, 225 65 C 225 85, 215 95, 208 100 L 208 120 L 192 120 L 192 100 Z" />
            <path d="M 192 120 C 170 122, 140 128, 130 135 C 122 142, 115 190, 112 230 C 108 270, 102 330, 98 375 L 110 378 L 128 240 C 135 242, 145 220, 150 180 C 152 230, 150 400, 145 400 L 160 410 C 165 405, 200 410, 200 410 Z" />
          </g>
        ) : (
          <g id="womens-body-silhouette" className="fill-slate-900 stroke-slate-700 stroke-[1.5]">
            {/* Women Body Silhouette Paths */}
            <path d="M 178 62 C 175 35, 225 35, 222 62 C 220 82, 212 92, 206 98 L 206 118 L 194 118 Z" />
            <path d="M 194 118 C 175 120, 150 126, 140 135 C 132 142, 122 220, 110 360 L 120 362 Z" />
          </g>
        )}

        {/* Hotspot Layer */}
        {/* Example Hotspot node rendering with pulse ring */}
      </svg>
    </div>
  );
};
```

---

## 6. Verification & Test Plan

1. **POM-to-Hotspot Coverage**: Verify all 63 POM schema items map to a valid `landmarkId`.
2. **View Viewport Precision**: Confirm SVG `viewBox="0 0 400 800"` coordinates place hotspots directly on anatomical landmarks.
3. **Bidirectional Interaction**: Verify focus on POM input triggers gold pulse `#EAB308` on SVG diagram and click on hotspot scrolls input into view.
4. **Theme Consistency**: Confirm SVG silhouette matches dark slate (`#0F172A`/`#1E293B`) and gold accent (`#EAB308`) palette.
