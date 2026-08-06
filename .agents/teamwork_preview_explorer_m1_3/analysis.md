# Milestone 1 Backend API Blueprint: Dynamic Measurement Template & POM Engine

**Author**: teamwork_preview_explorer_m1_3  
**Date**: 2026-08-06  
**Target Module**: `apps/api/src/modules/measurements/`  
**Status**: Architecture & Specification Blueprint  

---

## 1. Executive Summary

This blueprint defines the backend architecture, NestJS controller endpoints, DTO validation classes, domain models, and mathematical algorithms for **Milestone 1 (M1: Dynamic Measurement Template & POM Engine)** of the Tailoring OS.

### Key Objectives
1. **Complete 9 Garment Schemas (`GET /measurements/templates`)**: Expand existing 4-garment stub into 9 bespoke garment schemas (4 Men's, 5 Women's) with full Points of Measure (POM) metadata, landmark bindings, ease defaults, and physical validation ranges.
2. **Dynamic Ease & Posture Calculation (`POST /measurements/calculate-ease`)**: Compute target garment measurements using a 5-variable mathematical model:
   $$\text{Target POM} = \text{Net Body} + \text{Category Base Ease} + \text{Fit Preference Modifier} + \text{Posture Offset} + \text{Stretch Allowance}$$
3. **Size-Scaled Fabric Yield Engine (`POST /measurements/fabric-yield`)**: Upgrade fabric consumption calculations with body size scaling factors, fabric width factors (36", 44", 54", 60"), pattern repeat math, shrinkage padding, and panel count multipliers for flared ethnic wear (Lehenga / Anarkali).

---

## 2. Prisma Database Integration (`apps/api/prisma/schema.prisma`)

The current `schema.prisma` already defines key entities:

- `MeasurementTemplate`: Stores system-wide default POM schemas and tenant custom schemas.
- `Client`: Contains client profile, `preferredFit`, and 4-axis `postureProfile` JSON.
- `CustomerMeasurementVersion`: Immutable snapshot of a client's net body measurements and calculated POMs.
- `Order` & `OrderItem`: Applied measurement snapshot and garment configurations.
- `OrderTrial`: Observed deltas during fitting trials.

### Recommended JSON Data Schema for `MeasurementTemplate.pomSchema`

When seeding or persisting templates in Prisma:
```json
{
  "id": "mens-suit",
  "garmentName": "Men's Bespoke 3-Piece Suit",
  "gender": "Men",
  "category": "Western",
  "poms": [
    {
      "id": "m-su-chest",
      "code": "M-SU-01",
      "name": "Jacket Chest Circumference",
      "category": "girth",
      "baseMeasurement": 40.0,
      "defaultEase": 3.5,
      "tolerance": 0.25,
      "landmarkId": "hs-chest-front",
      "unit": "in",
      "validationRange": { "min": 28.0, "max": 64.0 }
    }
  ]
}
```

---

## 3. API Blueprint: `GET /measurements/templates`

### 3.1 Endpoint & Controller Specification
- **Route**: `GET /measurements/templates`
- **Query Parameters**:
  - `gender` *(optional)*: `'Men' | 'Women' | 'Unisex'`
  - `category` *(optional)*: `'Ethnic' | 'Western' | 'Couture'`
- **NestJS Decorators**: `@Get('templates')`, `@Query('gender') gender?: string`, `@Query('category') category?: string`
- **Description**: Returns all 9 garment schemas with full POM definitions, landmarks, default ease, tolerance, and validation ranges.

### 3.2 Complete 9 Garment POM Schemas Specification

#### 1. `mens-suit` — Men's Bespoke 3-Piece Suit
- **Gender**: `Men` | **Category**: `Western`
- **POMs**:
  1. `M-SU-01` | **Jacket Chest** | `girth` | Base: 40.0" | Ease: +3.5" | Tol: 0.25" | Min/Max: [28, 64] | Landmark: `hs-chest`
  2. `M-SU-02` | **Buttoning Waist Point** | `girth` | Base: 34.0" | Ease: +2.5" | Tol: 0.25" | Min/Max: [24, 60] | Landmark: `hs-waist-jacket`
  3. `M-SU-03` | **Jacket Back Length (C7 to Hem)** | `length` | Base: 30.0" | Ease: 0.0" | Tol: 0.25" | Min/Max: [24, 38] | Landmark: `hs-back-length`
  4. `M-SU-04` | **Shoulder Width (Acromion to Acromion)** | `width` | Base: 18.0" | Ease: +0.5" | Tol: 0.125" | Min/Max: [14, 24] | Landmark: `hs-shoulder-width`
  5. `M-SU-05` | **Sleeve Length (Crown to Wrist)** | `sleeve` | Base: 25.0" | Ease: +0.5" | Tol: 0.25" | Min/Max: [20, 32] | Landmark: `hs-sleeve-length`
  6. `M-SU-06` | **Trouser Waist Circumference** | `trouser` | Base: 34.0" | Ease: +0.5" | Tol: 0.25" | Min/Max: [24, 60] | Landmark: `hs-trouser-waist`
  7. `M-SU-07` | **Trouser Outseam (Waist to Ankle)** | `trouser` | Base: 41.0" | Ease: 0.0" | Tol: 0.25" | Min/Max: [32, 52] | Landmark: `hs-trouser-outseam`
  8. `M-SU-08` | **Trouser Thigh Circumference** | `trouser` | Base: 24.0" | Ease: +2.5" | Tol: 0.25" | Min/Max: [18, 36] | Landmark: `hs-thigh`

#### 2. `mens-sherwani` — Men's Royal Sherwani
- **Gender**: `Men` | **Category**: `Ethnic`
- **POMs**:
  1. `M-SH-01` | **Chest Circumference** | `girth` | Base: 40.0" | Ease: +5.0" | Tol: 0.25" | Min/Max: [28, 64] | Landmark: `hs-chest`
  2. `M-SH-02` | **Natural Waist** | `girth` | Base: 34.0" | Ease: +3.5" | Tol: 0.25" | Min/Max: [24, 60] | Landmark: `hs-waist-sherwani`
  3. `M-SH-03` | **Hip / Seat Circumference** | `girth` | Base: 40.0" | Ease: +4.5" | Tol: 0.25" | Min/Max: [30, 66] | Landmark: `hs-hip`
  4. `M-SH-04` | **Shoulder Width (Acromion to Acromion)** | `width` | Base: 18.0" | Ease: +0.75" | Tol: 0.125" | Min/Max: [14, 24] | Landmark: `hs-shoulder-width`
  5. `M-SH-05` | **Band Collar Height & Circumference** | `width` | Base: 16.5" | Ease: +0.85" | Tol: 0.125" | Min/Max: [12, 22] | Landmark: `hs-neck-collar`
  6. `M-SH-06` | **Center Back Length (C7 to Hem)** | `length` | Base: 42.0" | Ease: 0.0" | Tol: 0.5" | Min/Max: [34, 52] | Landmark: `hs-sherwani-length`
  7. `M-SH-07` | **Sleeve Length (Crown to Wrist)** | `sleeve` | Base: 25.5" | Ease: +0.5" | Tol: 0.25" | Min/Max: [20, 32] | Landmark: `hs-sleeve-length`

#### 3. `mens-shirt` — Men's Custom Dress Shirt
- **Gender**: `Men` | **Category**: `Western`
- **POMs**:
  1. `M-ST-01` | **Neck Collar Circumference** | `girth` | Base: 15.5" | Ease: +0.5" | Tol: 0.125" | Min/Max: [12, 22] | Landmark: `hs-neck-collar`
  2. `M-ST-02` | **Chest Girth** | `girth` | Base: 40.0" | Ease: +4.0" | Tol: 0.25" | Min/Max: [28, 64] | Landmark: `hs-chest`
  3. `M-ST-03` | **Waist Girth** | `girth` | Base: 34.0" | Ease: +3.0" | Tol: 0.25" | Min/Max: [24, 60] | Landmark: `hs-waist-shirt`
  4. `M-ST-04` | **Yoke Width (Shoulder to Shoulder)** | `width` | Base: 17.5" | Ease: +0.5" | Tol: 0.125" | Min/Max: [14, 23] | Landmark: `hs-yoke`
  5. `M-ST-05` | **Shirt Length (CB to Hem)** | `length` | Base: 31.0" | Ease: 0.0" | Tol: 0.25" | Min/Max: [26, 38] | Landmark: `hs-shirt-length`
  6. `M-ST-06` | **Sleeve Length (CB to Cuff)** | `sleeve` | Base: 33.5" | Ease: +0.5" | Tol: 0.25" | Min/Max: [28, 40] | Landmark: `hs-sleeve-full`

#### 4. `mens-trouser` — Men's Tailored Trouser / Chino
- **Gender**: `Men` | **Category**: `Western`
- **POMs**:
  1. `M-TR-01` | **Trouser Waist** | `trouser` | Base: 34.0" | Ease: +0.5" | Tol: 0.25" | Min/Max: [24, 60] | Landmark: `hs-trouser-waist`
  2. `M-TR-02` | **Hip / Seat Girth** | `trouser` | Base: 40.0" | Ease: +2.0" | Tol: 0.25" | Min/Max: [30, 64] | Landmark: `hs-hip`
  3. `M-TR-03` | **Inseam Length** | `trouser` | Base: 31.0" | Ease: 0.0" | Tol: 0.25" | Min/Max: [24, 40] | Landmark: `hs-inseam`
  4. `M-TR-04` | **Outseam Length** | `trouser` | Base: 41.0" | Ease: 0.0" | Tol: 0.25" | Min/Max: [32, 52] | Landmark: `hs-trouser-outseam`
  5. `M-TR-05` | **Thigh Circumference** | `trouser` | Base: 24.0" | Ease: +2.0" | Tol: 0.25" | Min/Max: [18, 36] | Landmark: `hs-thigh`
  6. `M-TR-06` | **Knee Width** | `trouser` | Base: 18.0" | Ease: +1.5" | Tol: 0.25" | Min/Max: [14, 26] | Landmark: `hs-knee`
  7. `M-TR-07` | **Bottom Hem Opening** | `trouser` | Base: 15.0" | Ease: +1.0" | Tol: 0.25" | Min/Max: [11, 22] | Landmark: `hs-ankle-opening`

#### 5. `womens-blouse` — Women's Sari Blouse (Couture)
- **Gender**: `Women` | **Category**: `Ethnic`
- **POMs**:
  1. `W-SB-01` | **Upper Bust Circumference** | `girth` | Base: 34.0" | Ease: +0.75" | Tol: 0.125" | Min/Max: [26, 54] | Landmark: `hs-upper-bust`
  2. `W-SB-02` | **Full Bust Peak** | `girth` | Base: 36.0" | Ease: +1.25" | Tol: 0.125" | Min/Max: [28, 58] | Landmark: `hs-full-bust`
  3. `W-SB-03` | **Underbust / Band** | `girth` | Base: 30.0" | Ease: +0.5" | Tol: 0.125" | Min/Max: [22, 48] | Landmark: `hs-underbust`
  4. `W-SB-04` | **Apex Distance (Nipple-to-Nipple)** | `width` | Base: 7.5" | Ease: 0.0" | Tol: 0.125" | Min/Max: [5.5, 10.5] | Landmark: `hs-apex-dist`
  5. `W-SB-05` | **Apex Height (Shoulder to Nipple)** | `length` | Base: 10.0" | Ease: 0.0" | Tol: 0.125" | Min/Max: [7.5, 14.5] | Landmark: `hs-apex-height`
  6. `W-SB-06` | **Front Neck Drop** | `length` | Base: 7.0" | Ease: 0.0" | Tol: 0.125" | Min/Max: [4.0, 11.0] | Landmark: `hs-front-neck`
  7. `W-SB-07` | **Back Neck Drop** | `length` | Base: 9.5" | Ease: 0.0" | Tol: 0.125" | Min/Max: [3.0, 14.0] | Landmark: `hs-back-neck`
  8. `W-SB-08` | **Armscye / Armhole Depth** | `sleeve` | Base: 15.5" | Ease: +0.5" | Tol: 0.125" | Min/Max: [11.0, 22.0] | Landmark: `hs-armhole`

#### 6. `womens-lehenga` — Women's Lehenga Choli
- **Gender**: `Women` | **Category**: `Ethnic`
- **POMs**:
  1. `W-LC-01` | **Lehenga Waist Line (Navel)** | `girth` | Base: 30.0" | Ease: +0.5" | Tol: 0.25" | Min/Max: [22, 52] | Landmark: `hs-lehenga-waist`
  2. `W-LC-02` | **Lehenga High Hip (4" Below Waist)** | `girth` | Base: 36.0" | Ease: +1.0" | Tol: 0.25" | Min/Max: [28, 58] | Landmark: `hs-high-hip`
  3. `W-LC-03` | **Lehenga Length (Waist to Floor with Heels)** | `length` | Base: 42.0" | Ease: +0.5" | Tol: 0.375" | Min/Max: [34, 52] | Landmark: `hs-lehenga-length`
  4. `W-LC-04` | **Choli Bust Circumference** | `girth` | Base: 36.0" | Ease: +1.5" | Tol: 0.125" | Min/Max: [28, 58] | Landmark: `hs-choli-bust`
  5. `W-LC-05` | **Choli Band Length (Shoulder to Underbust)** | `length` | Base: 14.0" | Ease: 0.0" | Tol: 0.125" | Min/Max: [11, 18] | Landmark: `hs-choli-length`

#### 7. `womens-anarkali` — Women's Anarkali Suit
- **Gender**: `Women` | **Category**: `Ethnic`
- **POMs**:
  1. `W-AK-01` | **Upper Bust Girth** | `girth` | Base: 35.0" | Ease: +1.0" | Tol: 0.125" | Min/Max: [26, 54] | Landmark: `hs-upper-bust`
  2. `W-AK-02` | **Full Bust Girth** | `girth` | Base: 36.0" | Ease: +2.0" | Tol: 0.25" | Min/Max: [28, 58] | Landmark: `hs-full-bust`
  3. `W-AK-03` | **Empire Waist / Yoke Line** | `girth` | Base: 30.0" | Ease: +1.5" | Tol: 0.25" | Min/Max: [22, 50] | Landmark: `hs-empire-waist`
  4. `W-AK-04` | **Yoke Height (Shoulder to Empire Line)** | `length` | Base: 14.5" | Ease: 0.0" | Tol: 0.125" | Min/Max: [11.5, 18.0] | Landmark: `hs-yoke-height`
  5. `W-AK-05` | **Full Kurta Length (Shoulder to Ankle/Floor)** | `length` | Base: 52.0" | Ease: +0.5" | Tol: 0.5" | Min/Max: [42, 60] | Landmark: `hs-anarkali-length`
  6. `W-AK-06` | **Sleeve Length** | `sleeve` | Base: 22.0" | Ease: +0.5" | Tol: 0.25" | Min/Max: [14, 28] | Landmark: `hs-sleeve-length`

#### 8. `womens-corset` — Women's Structured Corset
- **Gender**: `Women` | **Category**: `Couture`
- **POMs**:
  1. `W-CS-01` | **Overbust Circumference** | `girth` | Base: 34.0" | Ease: 0.0" | Tol: 0.125" | Min/Max: [26, 52] | Landmark: `hs-overbust`
  2. `W-CS-02` | **Underbust Circumference** | `girth` | Base: 29.0" | Ease: -0.5" | Tol: 0.125" | Min/Max: [22, 46] | Landmark: `hs-underbust`
  3. `W-CS-03` | **Target Tight-Laced Waist** | `girth` | Base: 26.0" | Ease: -2.0" | Tol: 0.125" | Min/Max: [20, 42] | Landmark: `hs-corset-waist`
  4. `W-CS-04` | **High Hip (At Bone)** | `girth` | Base: 35.0" | Ease: 0.0" | Tol: 0.125" | Min/Max: [28, 54] | Landmark: `hs-high-hip`
  5. `W-CS-05` | **Front Center Busk Length** | `length` | Base: 13.5" | Ease: 0.0" | Tol: 0.125" | Min/Max: [10, 17] | Landmark: `hs-busk-length`
  6. `W-CS-06` | **Side Seam Height (Underarm to Waist)** | `length` | Base: 7.5" | Ease: 0.0" | Tol: 0.125" | Min/Max: [5.5, 10.5] | Landmark: `hs-side-height`

#### 9. `womens-gown` — Women's Evening Gown
- **Gender**: `Women` | **Category**: `Couture`
- **POMs**:
  1. `W-GW-01` | **Bust Girth** | `girth` | Base: 36.0" | Ease: +1.5" | Tol: 0.25" | Min/Max: [28, 58] | Landmark: `hs-full-bust`
  2. `W-GW-02` | **Natural Waist Girth** | `girth` | Base: 28.0" | Ease: +1.0" | Tol: 0.25" | Min/Max: [22, 48] | Landmark: `hs-waist-gown`
  3. `W-GW-03` | **Full Hip Circumference** | `girth` | Base: 38.0" | Ease: +2.0" | Tol: 0.25" | Min/Max: [30, 62] | Landmark: `hs-hip`
  4. `W-GW-04` | **Hollow to Hem (Neck Base to Floor)** | `length` | Base: 58.0" | Ease: +1.0" | Tol: 0.5" | Min/Max: [48, 68] | Landmark: `hs-hollow-to-hem`
  5. `W-GW-05` | **Train Length Offset (Floor Sweep)** | `length` | Base: 12.0" | Ease: 0.0" | Tol: 0.5" | Min/Max: [0, 60] | Landmark: `hs-train-length`

---

## 4. API Blueprint: `POST /measurements/calculate-ease`

### 4.1 Endpoint Specification
- **Route**: `POST /measurements/calculate-ease`
- **NestJS Decorator**: `@Post('calculate-ease')`
- **Request Body**: `CalculateEaseDto`
- **Response Body**: `CalculatedEaseResponseDto`

### 4.2 DTO Validation Classes

```typescript
// apps/api/src/modules/measurements/dto/posture-profile.dto.ts
import { IsEnum } from 'class-validator';

export enum ShoulderSlopeOption {
  NORMAL = 'normal',
  SLOPED = 'sloped',
  SQUARE = 'square',
  VERY_SLOPED = 'very_sloped',
}

export enum BackCurvatureOption {
  NORMAL = 'normal',
  STOOPED = 'stooped',
  ERECT = 'erect',
  PROMINENT_BLADE = 'prominent_blade',
}

export enum AbdomenStanceOption {
  NORMAL = 'normal',
  PROMINENT = 'prominent',
  FLAT = 'flat',
}

export enum HipSpineStanceOption {
  NORMAL = 'normal',
  HIGH_HIP = 'high_hip',
  SWAY_BACK = 'sway_back',
}

export class PostureProfileDto {
  @IsEnum(ShoulderSlopeOption)
  shoulderSlope: ShoulderSlopeOption;

  @IsEnum(BackCurvatureOption)
  backCurvature: BackCurvatureOption;

  @IsEnum(AbdomenStanceOption)
  abdomenStance: AbdomenStanceOption;

  @IsEnum(HipSpineStanceOption)
  hipSpineStance: HipSpineStanceOption;
}
```

```typescript
// apps/api/src/modules/measurements/dto/calculate-ease.dto.ts
import { IsString, IsEnum, IsObject, ValidateNested, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PostureProfileDto } from './posture-profile.dto';

export enum FitPreferenceOption {
  SKINNY = 'skinny',
  SLIM = 'slim',
  REGULAR = 'regular',
  RELAXED = 'relaxed',
}

export class CalculateEaseDto {
  @IsString()
  garmentCategory: string; // e.g. 'mens-suit', 'womens-blouse'

  @IsEnum(FitPreferenceOption)
  fitPreference: FitPreferenceOption;

  @ValidateNested()
  @Type(() => PostureProfileDto)
  postureProfile: PostureProfileDto;

  @IsObject()
  measurements: Record<string, number>; // key: pom code/id, value: net body in inches

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  fabricStretchPercent?: number; // e.g. 5 for 5% stretch wool/cotton
}
```

### 4.3 Ease Calculation Logic & Posture Modifier Matrix

#### Formula
$$\text{Target} = \text{NetBody} + \text{CategoryBaseEase} + \text{FitModifier} + \text{PostureOffset} - \text{StretchReduction}$$

1. **Category Base Ease**: Lookup from default template POM (`defaultEase`).
2. **Fit Preference Modifiers**:
   - `skinny`: `-0.75"` (for girth), `-0.25"` (for length/width)
   - `slim`: `-0.375"` (for girth), `0.0"` (for length/width)
   - `regular`: `0.0"` (default standard baseline)
   - `relaxed`: `+0.75"` (for girth), `+0.25"` (for length/width)
3. **4-Axis Posture Modifiers**:

| Axis | Value | Affected POM Types | Offset Value (inches) | Rationale |
|------|-------|--------------------|------------------------|-----------|
| **Shoulder Slope** | `sloped` | Shoulder Width, Armhole | `-0.25"` width, `+0.25"` armhole drop | Compensates for lower shoulder point |
| | `square` | Shoulder Width, Chest Girth | `+0.25"` width, `+0.125"` chest | Higher shoulder line requires more collar-to-shoulder clearance |
| | `very_sloped` | Shoulder Width, Armhole | `-0.50"` width, `+0.375"` armhole drop | Extreme slope adjustment |
| **Back Curvature** | `stooped` | Back Length, Upper Back | `+0.50"` back length, `+0.375"` back girth | Rounded spine needs extra cloth across shoulder blades |
| | `erect` | Back Length, Chest Girth | `-0.25"` back length, `+0.25"` chest girth | Straight spine drops back hem, pushes chest forward |
| | `prominent_blade` | Upper Back Girth | `+0.375"` back girth | Clearance for prominent scapulae |
| **Abdomen Stance** | `prominent` | Waist Girth, Front Hem Drop | `+1.25"` waist girth, `+0.50"` front length | Pot belly requires girth expansion and hem drop to prevent riding up |
| | `flat` | Waist Girth | `-0.375"` waist girth | Athletic/flat belly reduction |
| **Hip / Spine** | `high_hip` | High Hip Girth, Outseam | `+0.375"` hip girth, `-0.25"` outseam curve | Higher hip crest adjustment |
| | `sway_back` | Lower Back Length, Seat Girth | `-0.375"` back waist height, `+0.25"` seat | Lordosis / sway back creates cloth pooling at waist |

4. **Stretch Factor**:
   $$\text{StretchReduction} = \text{NetBody} \times \left(\frac{\text{fabricStretchPercent}}{100}\right) \times 0.5$$
   *(Applies only to girth POMs to prevent sagging in stretchy fabrics)*

### 4.4 Service Implementation Specification (`measurements.service.ts`)

```typescript
public calculateEaseAndPosture(dto: CalculateEaseDto): CalculatedEaseResponseDto {
  const template = this.getTemplateById(dto.garmentCategory);
  const result: Record<string, CalculatedEaseResult> = {};

  for (const pom of template.poms) {
    const netBody = dto.measurements[pom.code] || dto.measurements[pom.id] || pom.baseMeasurement;
    const baseEase = pom.defaultEase;
    const fitMod = this.getFitModifier(dto.fitPreference, pom.category);
    const postureMod = this.getPostureModifier(dto.postureProfile, pom.code, pom.category);
    const stretchFactor = (pom.category === 'girth' && dto.fabricStretchPercent)
      ? Number((netBody * (dto.fabricStretchPercent / 100) * 0.5).toFixed(2))
      : 0;

    const targetGarmentMeasurement = Number(
      (netBody + baseEase + fitMod + postureMod - stretchFactor).toFixed(2)
    );

    result[pom.code] = {
      netBody,
      categoryBaseEase: baseEase,
      fitPreferenceModifier: fitMod,
      postureOffset: postureMod,
      stretchFactor,
      targetGarmentMeasurement
    };
  }

  return {
    garmentCategory: dto.garmentCategory,
    fitPreference: dto.fitPreference,
    postureProfile: dto.postureProfile,
    calculatedGarmentPOMs: result
  };
}
```

---

## 5. API Blueprint: `POST /measurements/fabric-yield`

### 5.1 Endpoint & DTO Specification
- **Route**: `POST /measurements/fabric-yield`
- **NestJS Decorator**: `@Post('fabric-yield')`
- **Request Body**: `CalculateFabricYieldDto`
- **Response Body**: `FabricYieldResponseDto`

```typescript
// apps/api/src/modules/measurements/dto/calculate-fabric-yield.dto.ts
import { IsString, IsNumber, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class CalculateFabricYieldDto {
  @IsString()
  garmentCategory: string; // e.g. 'mens-suit', 'womens-lehenga'

  @IsNumber()
  @Min(36)
  @Max(60)
  fabricWidthInches: number; // 36, 44, 54, 60

  @IsOptional()
  @IsNumber()
  @Min(24)
  @Max(64)
  chestOrHipSizeInches?: number; // Client key body dimension for size scaling

  @IsOptional()
  @IsNumber()
  @Min(0)
  patternRepeatInches?: number; // Directional / plaid pattern repeat

  @IsOptional()
  @IsBoolean()
  hasShrinkage?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  shrinkagePercent?: number; // Custom shrinkage % (default 5% if hasShrinkage is true)

  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(32)
  panelCount?: number; // For Lehenga/Anarkali kalis (12, 16, 24)
}
```

### 5.2 Fabric Yield Mathematical Engine & Formulas

1. **Base Category Consumption Map** (Meters at baseline 44" width & 40" chest/hip):

| Garment Category | 36" Width (m) | 44" Width (m) | 54" Width (m) | 60" Width (m) |
|------------------|---------------|---------------|---------------|---------------|
| `mens-suit` | 5.80 | 5.00 | 3.95 | 3.45 |
| `mens-sherwani` | 5.20 | 4.50 | 3.65 | 3.25 |
| `mens-shirt` | 2.60 | 2.25 | 1.85 | 1.60 |
| `mens-trouser` | 1.60 | 1.40 | 1.25 | 1.10 |
| `womens-blouse` | 1.20 | 1.00 | 0.80 | 0.70 |
| `womens-lehenga` | 6.80 | 5.80 | 4.40 | 3.80 |
| `womens-anarkali` | 6.20 | 5.20 | 4.10 | 3.50 |
| `womens-corset` | 1.40 | 1.10 | 0.90 | 0.75 |
| `womens-gown` | 6.50 | 5.50 | 4.20 | 3.60 |

2. **Size Scaling Multiplier ($S$)**:
   $$\text{Baseline Size} = 40.0"$$
   $$S = 1.0 + \max\left(0, (\text{chestOrHipSizeInches} - 40.0) \times 0.015\right)$$
   *(e.g., Size 48" chest $\rightarrow S = 1 + (8 \times 0.015) = 1.12$, a +12% increase)*

3. **Panel Count Multiplier ($P$)** *(for Ethnic Flared Garments)*:
   - `womens-lehenga` / `womens-anarkali`:
     - Default (12 kalis): $1.0$
     - 16 kalis: $1.20$ (+20% cloth for extra seams & sweep)
     - 24 kalis: $1.45$ (+45% cloth for maximum volume)

4. **Pattern Repeat Allowance ($R$)**:
   $$R_{\text{factor}} = 1.0 + \frac{\text{patternRepeatInches} \times 0.0254}{\text{BaseMeters}}$$
   $$\text{PatternAllowanceMeters} = \text{ScaledMeters} \times (\min(R_{\text{factor}}, 1.25) - 1.0)$$

5. **Shrinkage Allowance ($K$)**:
   $$\text{ShrinkageAllowanceMeters} = (\text{ScaledMeters} + \text{PatternAllowanceMeters}) \times \frac{\text{shrinkagePercent}}{100}$$

6. **Total Estimated Yield**:
   $$\text{TotalMeters} = \text{ScaledMeters} + \text{PatternAllowanceMeters} + \text{ShrinkageAllowanceMeters}$$

### 5.3 Response DTO Structure

```typescript
export interface FabricYieldResponseDto {
  garmentCategory: string;
  fabricWidthInches: number;
  baseYieldMeters: number;
  sizeScaledMeters: number;
  panelMultiplier: number;
  patternAllowanceMeters: number;
  shrinkageAllowanceMeters: number;
  estimatedMeters: number; // Rounded to 2 decimal places
  markerEfficiencyPercent: number; // e.g. 88.5%
}
```

---

## 6. Architecture & Directory Blueprint

To implement this blueprint clean and maintainable, the following file layout in `apps/api/src/modules/measurements/` must be produced:

```
apps/api/src/modules/measurements/
├── dto/
│   ├── calculate-ease.dto.ts
│   ├── calculate-fabric-yield.dto.ts
│   ├── posture-profile.dto.ts
│   ├── pom-schema.dto.ts
│   └── template-response.dto.ts
├── constants/
│   ├── garment-templates.data.ts    # Central definitions for all 9 garment schemas
│   ├── posture-modifiers.data.ts    # Posture lookup matrices
│   └── fabric-consumption.data.ts   # Base width yield tables
├── measurements.controller.ts
├── measurements.service.ts
└── measurements.module.ts
```

---

## 7. Verification & Automated Test Strategy

To verify this backend specification upon implementation, the test suite should run via:

```bash
# 1. NestJS Unit Tests
npm run test --workspaces -- --testPathPattern=measurements

# 2. TypeScript Type checking
npx tsc --noEmit -p apps/api/tsconfig.json
```

### Key Test Cases Required
1. **Templates Verification**: `getGarmentTemplates()` returns exactly 9 templates, each possessing non-empty `poms` array with valid codes and numerical range bounds.
2. **Ease Math Verification**:
   - Baseline check (`regular` fit, `normal` posture): Target equals `NetBody + defaultEase`.
   - Posture check (`sloped` shoulder): Shoulder width receives `-0.25"` offset.
   - Compound posture check (`prominent` abdomen + `relaxed` fit): Waist girth receives `+1.25"` posture + `+0.75"` fit preference = `+2.00"` total ease delta.
3. **Fabric Yield Verification**:
   - Check `mens-suit` at 44" width returns base 5.00m.
   - Check size 48" chest scales yield by +12% (5.60m).
   - Check 24-kali `womens-lehenga` increases yield appropriately.
