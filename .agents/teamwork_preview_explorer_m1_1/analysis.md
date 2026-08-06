# Milestone 1 (M1) Technical Blueprint: Dynamic Measurement Template & POM Engine

## Executive Summary & Scope

Milestone 1 establishes the core domain logic and computational engine for the Tailoring OS Measurement System. This blueprint defines:
1. Complete Points of Measure (POM) schemas for all 9 garment categories across Men's and Women's custom tailoring.
2. The 4-Axis Posture Profile Model (`shoulderSlope`, `backCurvature`, `abdomenStance`, `hipSpineStance`) with precise numeric offsets.
3. The Dynamic Ease Allowance Engine formula: $\text{Target POM} = \text{Net Body} + \text{Category Base Ease} + \text{Fit Modifier} + \text{Posture Offset} + \text{Stretch Factor}$.
4. A multi-variable Size-Scaled Fabric Yield mathematical model adjusting yardage based on girth, garment length, fabric width, pattern repeat, and shrinkage.

---

## 1. Garment Category POM Schemas (All 9 Categories)

### Shared Data Contract (`apps/web/src/types/measurement.ts`)
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

export type PomCategoryType = 'length' | 'girth' | 'width' | 'sleeve' | 'trouser';

export interface PomSchemaItem {
  id: string;
  code: string;
  name: string;
  category: PomCategoryType;
  baseMeasurement: number; // inches (standard medium/40 body reference)
  defaultEase: number; // inches
  landmarkId?: string; // SVG hotspot map reference
  unit: 'in' | 'cm';
  validationRange: { min: number; max: number };
}
```

---

### Category Schemas Specification

#### 1. Men's Suit (`mens-suit`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `M-SU-01` | Jacket Chest Circumference | girth | 40.0 | +3.50 | `hs-mens-chest` | 30.0 - 60.0 |
| `M-SU-02` | Buttoning Waist Point | girth | 34.0 | +2.50 | `hs-mens-waist` | 26.0 - 56.0 |
| `M-SU-03` | Hip / Seat Circumference | girth | 41.0 | +3.00 | `hs-mens-hip` | 32.0 - 60.0 |
| `M-SU-04` | Shoulder Width (Acromion-to-Acromion) | width | 18.0 | +0.75 | `hs-mens-shoulder` | 14.0 - 24.0 |
| `M-SU-05` | Center Back Jacket Length | length | 30.0 | +0.00 | `hs-mens-jacket-len` | 24.0 - 38.0 |
| `M-SU-06` | Sleeve Length (Crown to Wrist) | sleeve | 25.0 | +0.50 | `hs-mens-sleeve` | 20.0 - 32.0 |
| `M-SU-07` | Armscye / Armhole Depth | width | 10.0 | +1.00 | `hs-mens-armscye` | 7.0 - 14.0 |
| `M-SU-08` | Bicep Circumference | girth | 14.0 | +2.00 | `hs-mens-bicep` | 10.0 - 22.0 |

#### 2. Men's Sherwani (`mens-sherwani`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `M-SH-01` | Chest Circumference | girth | 40.0 | +5.00 | `hs-mens-chest` | 30.0 - 60.0 |
| `M-SH-02` | Natural Waist | girth | 34.0 | +3.50 | `hs-mens-waist` | 26.0 - 56.0 |
| `M-SH-03` | Hip / Seat Circumference | girth | 41.0 | +4.50 | `hs-mens-hip` | 32.0 - 60.0 |
| `M-SH-04` | Shoulder Width | width | 18.0 | +0.75 | `hs-mens-shoulder` | 14.0 - 24.0 |
| `M-SH-05` | Band Collar Circumference | girth | 15.5 | +0.85 | `hs-mens-neck` | 12.0 - 22.0 |
| `M-SH-06` | Sherwani Full Length (C7 to Knee/Calf) | length | 42.0 | +0.00 | `hs-mens-sherwani-len` | 34.0 - 52.0 |
| `M-SH-07` | Sleeve Length | sleeve | 25.5 | +0.50 | `hs-mens-sleeve` | 20.0 - 32.0 |
| `M-SH-08` | Across Chest Width | width | 16.5 | +0.50 | `hs-mens-across-chest` | 13.0 - 22.0 |

#### 3. Men's Shirt (`mens-shirt`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `M-ST-01` | Collar / Neck Band | girth | 15.5 | +0.75 | `hs-mens-neck` | 12.0 - 22.0 |
| `M-ST-02` | Chest Circumference | girth | 40.0 | +4.00 | `hs-mens-chest` | 30.0 - 60.0 |
| `M-ST-03` | Waist Circumference | girth | 34.0 | +3.50 | `hs-mens-waist` | 26.0 - 56.0 |
| `M-ST-04` | Shoulder Yoke Width | width | 18.0 | +0.50 | `hs-mens-shoulder` | 14.0 - 24.0 |
| `M-ST-05` | Shirt Length (Back) | length | 30.0 | +0.00 | `hs-mens-shirt-len` | 24.0 - 38.0 |
| `M-ST-06` | Sleeve Length | sleeve | 25.0 | +0.50 | `hs-mens-sleeve` | 20.0 - 32.0 |
| `M-ST-07` | Cuff Circumference | girth | 8.5 | +1.50 | `hs-mens-cuff` | 6.0 - 13.0 |

#### 4. Men's Trouser (`mens-trouser`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `M-TR-01` | Waistband Circumference | girth | 34.0 | +1.00 | `hs-mens-trouser-waist` | 26.0 - 56.0 |
| `M-TR-02` | Seat / Hip Circumference | girth | 41.0 | +3.00 | `hs-mens-hip` | 32.0 - 60.0 |
| `M-TR-03` | Outseam Length | trouser | 41.0 | +0.00 | `hs-mens-outseam` | 32.0 - 52.0 |
| `M-TR-04` | Inseam Length | trouser | 31.0 | +0.00 | `hs-mens-inseam` | 24.0 - 40.0 |
| `M-TR-05` | Thigh Circumference | girth | 24.0 | +2.50 | `hs-mens-thigh` | 18.0 - 34.0 |
| `M-TR-06` | Knee Circumference | girth | 18.0 | +2.00 | `hs-mens-knee` | 13.0 - 26.0 |
| `M-TR-07` | Leg Opening / Hem | girth | 15.0 | +1.00 | `hs-mens-ankle` | 10.0 - 22.0 |
| `M-TR-08` | Crotch Rise Depth | trouser | 10.5 | +0.50 | `hs-mens-crotch` | 8.0 - 16.0 |

#### 5. Women's Sari Blouse (`womens-blouse`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `W-SB-01` | Upper Bust Circumference | girth | 34.0 | +0.75 | `hs-womens-upperbust` | 26.0 - 52.0 |
| `W-SB-02` | Full Bust Peak | girth | 36.0 | +1.25 | `hs-womens-fullbust` | 28.0 - 56.0 |
| `W-SB-03` | Underbust / Band | girth | 30.0 | +0.50 | `hs-womens-underbust` | 24.0 - 48.0 |
| `W-SB-04` | Apex Distance (Nipple to Nipple) | width | 7.5 | +0.00 | `hs-womens-apex-dist` | 5.5 - 11.0 |
| `W-SB-05` | Apex Height (Shoulder to Apex) | length | 10.0 | +0.00 | `hs-womens-apex-height` | 7.5 - 14.0 |
| `W-SB-06` | Front Neck Drop | length | 7.0 | +0.00 | `hs-womens-front-neck` | 4.0 - 11.0 |
| `W-SB-07` | Back Neck Drop | length | 9.5 | +0.00 | `hs-womens-back-neck` | 4.0 - 15.0 |
| `W-SB-08` | Armhole / Armscye Depth | width | 15.0 | +0.50 | `hs-womens-armscye` | 11.0 - 22.0 |
| `W-SB-09` | Blouse Total Length | length | 14.5 | +0.00 | `hs-womens-blouse-len` | 11.0 - 19.0 |

#### 6. Women's Lehenga Choli (`womens-lehenga`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `W-LC-01` | Lehenga Waistline (Navel) | girth | 28.0 | +0.50 | `hs-womens-waist` | 22.0 - 48.0 |
| `W-LC-02` | High Hip / Seat Circumference | girth | 38.0 | +3.00 | `hs-womens-hip` | 30.0 - 58.0 |
| `W-LC-03` | Lehenga Length (Waist to Floor with Heels)| length | 42.0 | +0.50 | `hs-womens-lehenga-len` | 34.0 - 50.0 |
| `W-LC-04` | Choli Bust Circumference | girth | 36.0 | +1.50 | `hs-womens-fullbust` | 28.0 - 56.0 |
| `W-LC-05` | Choli Underbust Band | girth | 30.0 | +0.75 | `hs-womens-underbust` | 24.0 - 48.0 |
| `W-LC-06` | Choli Back Length | length | 15.0 | +0.00 | `hs-womens-choli-len` | 12.0 - 20.0 |

#### 7. Women's Anarkali (`womens-anarkali`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `W-AN-01` | Full Bust Circumference | girth | 36.0 | +2.50 | `hs-womens-fullbust` | 28.0 - 56.0 |
| `W-AN-02` | Empire Waist Band | girth | 30.0 | +2.00 | `hs-womens-underbust` | 24.0 - 48.0 |
| `W-AN-03` | Yoke / Empire Height | length | 14.5 | +0.00 | `hs-womens-yoke-len` | 11.0 - 19.0 |
| `W-AN-04` | Anarkali Total Length | length | 54.0 | +0.50 | `hs-womens-gown-len` | 42.0 - 64.0 |
| `W-AN-05` | Flare Hem Circumference | girth | 120.0 | +12.00 | `hs-womens-flare` | 80.0 - 240.0 |
| `W-AN-06` | Sleeve Length | sleeve | 22.0 | +0.50 | `hs-womens-sleeve` | 14.0 - 26.0 |

#### 8. Women's Corset (`womens-corset`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `W-CO-01` | Overbust Circumference | girth | 34.0 | -1.00 | `hs-womens-upperbust` | 26.0 - 52.0 |
| `W-CO-02` | Full Bust Peak | girth | 36.0 | -1.50 | `hs-womens-fullbust` | 28.0 - 56.0 |
| `W-CO-03` | Underbust Line | girth | 30.0 | -1.50 | `hs-womens-underbust` | 24.0 - 48.0 |
| `W-CO-04` | Waist Cinch Target | girth | 28.0 | -3.00 | `hs-womens-waist` | 20.0 - 44.0 |
| `W-CO-05` | High Hip Curve | girth | 35.0 | -0.50 | `hs-womens-highhip` | 28.0 - 52.0 |
| `W-CO-06` | Busk Front Length | length | 13.0 | +0.00 | `hs-womens-busk-len` | 10.0 - 18.0 |

#### 9. Women's Gown (`womens-gown`)
| Code | Name | Category | Base (in) | Default Ease (in) | Landmark ID | Min-Max Range (in) |
|---|---|---|---|---|---|---|
| `W-GO-01` | Full Bust Circumference | girth | 36.0 | +2.00 | `hs-womens-fullbust` | 28.0 - 56.0 |
| `W-GO-02` | Natural Waist Circumference | girth | 28.0 | +1.50 | `hs-womens-waist` | 22.0 - 48.0 |
| `W-GO-03` | High Hip / Seat | girth | 38.0 | +2.50 | `hs-womens-hip` | 30.0 - 58.0 |
| `W-GO-04` | Hollow to Hem Length | length | 58.0 | +0.50 | `hs-womens-hollow-hem` | 46.0 - 66.0 |
| `W-GO-05` | Train Sweep Extra Length | length | 18.0 | +0.00 | `hs-womens-train` | 0.0 - 60.0 |
| `W-GO-06` | Shoulder to Waist Length | length | 16.0 | +0.00 | `hs-womens-sh-waist` | 13.0 - 20.0 |

---

## 2. 4-Axis Posture Profile Model & Offset Formulas

### Data Definition (`PostureProfile`)
```typescript
export type PostureAxis = 'shoulderSlope' | 'backCurvature' | 'abdomenStance' | 'hipSpineStance';

export interface PostureProfile {
  shoulderSlope: 'normal' | 'sloped' | 'square' | 'very_sloped';
  backCurvature: 'normal' | 'stooped' | 'erect' | 'prominent_blade';
  abdomenStance: 'normal' | 'prominent' | 'flat';
  hipSpineStance: 'normal' | 'high_hip' | 'sway_back';
}
```

### Posture Offset Calculation Function
The total posture offset for a POM item is computed by summing the axis-specific offsets that apply to its `category` or specific `code`:

$$\text{PostureOffset}(\text{POM}) = \Delta_{\text{shoulderSlope}}(\text{POM}) + \Delta_{\text{backCurvature}}(\text{POM}) + \Delta_{\text{abdomenStance}}(\text{POM}) + \Delta_{\text{hipSpineStance}}(\text{POM})$$

#### Offset Rule Matrix:

1. **`shoulderSlope`**:
   - `normal`: 0.0" offset.
   - `sloped`:
     - Armscye/Armhole POMs (`M-SU-07`, `W-SB-08`): **+0.375"** (deepens armhole to prevent pinching).
     - Shoulder Width POMs (`M-SU-04`, `M-SH-04`, `M-ST-04`): **-0.25"** (narraws shoulder seam).
   - `very_sloped`:
     - Armscye/Armhole POMs: **+0.625"**
     - Shoulder Width POMs: **-0.375"**
   - `square`:
     - Armscye/Armhole POMs: **-0.25"** (raises shoulder, shallows armhole).
     - Shoulder Width POMs: **+0.25"**

2. **`backCurvature`**:
   - `normal`: 0.0" offset.
   - `stooped`:
     - Back Length POMs (`M-SU-05`, `M-SH-06`, `M-ST-05`, `W-SB-09`, `W-LC-06`): **+0.50"** (adds curve height for rounded upper spine).
     - Across Chest / Front Length POMs: **-0.25"**
     - Chest/Bust Girth POMs: **+0.375"**
   - `erect`:
     - Back Length POMs: **-0.375"** (shortens back distance).
     - Across Chest / Front Length POMs: **+0.25"**
     - Chest/Bust Girth POMs: **+0.25"**
   - `prominent_blade`:
     - Upper Back Width / Across Chest POMs: **+0.50"**
     - Armscye Depth: **+0.25"**

3. **`abdomenStance`**:
   - `normal`: 0.0" offset.
   - `prominent`:
     - Waist Girth POMs (`M-SU-02`, `M-SH-02`, `M-ST-03`, `M-TR-01`, `W-GO-02`): **+1.00"** (relieves waistband tension).
     - Trouser Rise / Crotch Depth (`M-TR-08`): **+0.50"** (extends front rise for belly overhang).
   - `flat`:
     - Waist Girth POMs: **-0.50"** (tighter contouring).
     - Trouser Rise / Crotch Depth: **-0.25"**

4. **`hipSpineStance`**:
   - `normal`: 0.0" offset.
   - `high_hip`:
     - Hip/Seat Girth POMs (`M-SU-03`, `M-SH-03`, `M-TR-02`, `W-LC-02`, `W-GO-03`): **+0.50"**
     - Trouser Outseam / Inseam adjustment: **+0.25"**
   - `sway_back`:
     - Back Waist Drop / Jacket Length (`M-SU-05`, `W-SB-09`): **-0.625"** (shortens back waist to eliminate lower-back pooling fabric).
     - Trouser Seat Rise (`M-TR-08`): **-0.375"**

---

## 3. Dynamic Ease Calculation Formula

$$\text{Target Garment Measurement} = \text{Net Body} + \text{Category Base Ease} + \text{Fit Preference Modifier} + \text{Posture Offset} + \text{Stretch Factor}$$

### Fit Preference Modifier Matrix ($\text{Fit Modifier}$)
Values apply depending on POM `category`:

| Fit Preference | Girth POMs (`girth`) | Width POMs (`width`) | Sleeve POMs (`sleeve`) | Length/Trouser POMs (`length`, `trouser`) |
|---|---|---|---|---|
| `'skinny'` | -1.50" | -0.50" | -0.375" | 0.00" |
| `'slim'` | -0.75" | -0.25" | -0.250" | 0.00" |
| `'regular'` | 0.00" | 0.00" | 0.000" | 0.00" |
| `'relaxed'` | +1.25" | +0.50" | +0.375" | 0.00" |

### Stretch Factor Formulation ($\text{Stretch Factor}$)
For woven / non-stretch fabrics, $\text{Stretch Factor} = 0.0$.
For knit or elastane-blended fabrics, $\text{Stretch Factor}$ is calculated as a negative percentage reduction of Net Body girth:
$$\text{Stretch Factor} = -(\text{Net Body Girth} \times \text{Fabric Elasticity Rate})$$
*(e.g. 5% spandex = -5% of 36.0" bust = -1.80" negative ease for corsets/blouses)*.

---

## 4. Size-Scaled Fabric Yield Calculation Math

### Multi-Variable Mathematical Model

Let:
- $Y_{base} = \text{Standard Reference Fabric Yardage}$ (for Size Medium / 40" chest, 44" fabric width)
- $K_{scale} = \text{Composite Size Scaling Ratio}$
- $F_{width} = \text{Fabric Width Utilization Factor}$
- $A_{pattern} = \text{Pattern Repeat Allowance Factor}$
- $A_{shrink} = \text{Shrinkage Padding Factor}$

### 1. Composite Size Scale Ratio ($K_{scale}$)
$$\text{Ref Girth} = \begin{cases} 40.0\text{ in} & \text{(Men)} \\ 36.0\text{ in} & \text{(Women)} \end{cases}, \quad \text{Ref Length} = \begin{cases} 30.0\text{ in} & \text{(Jacket/Shirt)} \\ 42.0\text{ in} & \text{(Sherwani/Lehenga)} \\ 56.0\text{ in} & \text{(Anarkali/Gown)} \\ 41.0\text{ in} & \text{(Trouser)} \end{cases}$$

$$K_{girth} = \frac{\text{Customer Observed Girth}}{\text{Ref Girth}}, \quad K_{length} = \frac{\text{Customer Observed Length}}{\text{Ref Length}}$$

$$K_{scale} = 0.6 \cdot K_{length} + 0.4 \cdot K_{girth}$$

### 2. Standard Category Base Yardage Matrix ($Y_{base}$)
For 44" fabric width, baseline standard size consumption:
- `mens-suit`: 5.00 m
- `mens-sherwani`: 4.50 m
- `mens-shirt`: 2.20 m
- `mens-trouser`: 1.40 m
- `womens-blouse`: 1.00 m
- `womens-lehenga`: 5.80 m
- `womens-anarkali`: 6.50 m
- `womens-corset`: 1.20 m
- `womens-gown`: 5.50 m

### 3. Width Utilization Factor ($F_{width}$)
$$F_{width} = \frac{44.0}{\text{Selected Fabric Width (inches)}}$$
- For 44" width: $F_{width} = 1.00$
- For 54" width: $F_{width} = 44/54 \approx 0.815$
- For 60" width: $F_{width} = 44/60 \approx 0.733$

### 4. Pattern Repeat Allowance ($A_{pattern}$)
If pattern repeat $R > 0$ inches:
$$A_{pattern} = 1.0 + \min\left(0.25, \, \frac{R \times 0.0254}{Y_{base} \times K_{scale} \times F_{width}}\right)$$
If pattern repeat $R = 0$: $A_{pattern} = 1.0$.

### 5. Shrinkage Allowance ($A_{shrink}$)
If fabric has shrinkage treatment ($S = 0.05$ for 5% shrinkage):
$$A_{shrink} = 1.0 + S = 1.05$$
Otherwise $A_{shrink} = 1.0$.

### 6. Final Fabric Yield Calculation
$$\text{Estimated Meters} = \text{Math.round}\left( Y_{base} \times K_{scale} \times F_{width} \times A_{pattern} \times A_{shrink} \times 100 \right) / 100$$

---

## 5. Architectural Implementation Plan for M1

### Key Files to Create / Enhance
1. `apps/web/src/types/measurement.ts`: Export core TypeScript interfaces for 9 Garment Categories, POM Schemas, 4-Axis Posture Profile, Fit Preferences, and Calculated Ease Results.
2. `apps/web/src/lib/pom-schemas.ts`: Export schema lookup functions and full array of all 9 category POM templates.
3. `apps/web/src/lib/posture-engine.ts`: Implement `calculatePostureOffset(pomCode, category, postureProfile)` engine.
4. `apps/web/src/lib/ease-calculator.ts`: Implement `calculateDynamicEase(netBody, baseEase, fitPref, posture, stretch, pomCategory)` function.
5. `apps/web/src/lib/fabric-yield.ts`: Implement multi-variable fabric yield math function.
6. `apps/api/src/modules/measurements/measurements.service.ts`: Update NestJS service to expose getGarmentTemplates, calculateEase, and calculateFabricYield endpoints matching web lib math.
7. `apps/web/src/components/measurement-engine/PomFormEngine.tsx`: Dynamic form UI with numeric inputs, live validation range checks, and ease breakdowns.
8. `apps/web/src/components/measurement-engine/PostureProfileSelector.tsx`: Interactive selector UI for the 4 posture axes.
9. `apps/web/src/components/measurement-engine/FabricYieldCalculator.tsx`: Real-time fabric yield estimator UI.
10. `apps/web/src/__tests__/`: Unit tests for schema validity, ease calculator, posture offsets, and fabric yield math.

---
