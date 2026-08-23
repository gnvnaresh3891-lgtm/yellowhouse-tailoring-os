# Milestone 3 Technical Analysis: Dynamic SAM Calculation & Bespoke Pricing Engines

## Executive Summary
This document provides the architectural specification and evidence-based design for Milestone 3 of YellowHouse Tailoring OS. It details the mathematical formulas, TypeScript interfaces, unit test strategy, and integration points for the **Dynamic SAM Calculation Engine** (`sam-calculator.ts`) and the **Bespoke Order Pricing Engine** (`pricing-calculator.ts`).

---

## 1. Dynamic SAM Calculation Engine (`apps/web/src/lib/sam-calculator.ts`)

### 1.1 Purpose & Role
Standard Allowed Minutes (SAM) represents the total time (in minutes) required by an artisan/master tailor to inspect, cut, assemble, embroider, and finish a bespoke garment. In Milestone 3, SAM calculation transitions from hardcoded static estimates (e.g. fixed 120 minutes) to a dynamic engine that accounts for garment baseline complexity, customer 4-axis posture variations, and specific structural customization options.

### 1.2 Base Garment SAM Matrix
Based on standard bespoke tailoring labor estimates in the atelier (referenced across `production/page.tsx` lines 123-330):

| Garment Category (`GarmentCategory`) | Base SAM (`baseSamMinutes`) | Key Manufacturing Operations |
|--------------------------------------|-----------------------------|------------------------------|
| `mens-suit`                          | 240 mins (4.0 hrs)          | Chest canvas pad, lapel roll, sleeve setting, lining |
| `mens-sherwani`                      | 210 mins (3.5 hrs)          | Angrakha/front placket, Mandarin collar, shoulder pad |
| `mens-shirt`                         | 60 mins (1.0 hr)            | Yoke, cuff, collar band, buttonholes |
| `mens-trouser`                       | 90 mins (1.5 hrs)            | Waistband, fly zipper, pocket welt, hem finishing |
| `womens-blouse`                      | 120 mins (2.0 hrs)          | Princess cut seam, padded cup insertion, hook/eye |
| `womens-lehenga`                     | 300 mins (5.0 hrs)          | Multi-panel flare assembly, waistband, canvas hem |
| `womens-anarkali`                    | 270 mins (4.5 hrs)          | Kali join assembly, empire bodice, flare hemline |
| `womens-corset`                      | 180 mins (3.0 hrs)          | Boning channel stitching, lace-up grommets, cupped bust |
| `womens-gown`                        | 240 mins (4.0 hrs)          | Draped bodice, lining layer, horsehair braid hem |

### 1.3 Posture Complexity Modifier Math
Non-standard posture profiles (from `PostureProfile` in `types/measurement.ts`) require master tailors to perform complex pattern manipulations (e.g. shifting armscye depth, wedge insertion for stooped back, crotch rise extensions).

Each non-normal posture value adds a SAM surcharge:

1. **Shoulder Slope Axis (`shoulderSlope`)**:
   - `normal`: +0 mins
   - `sloped`: +15 mins (armscye lowering & shoulder seam recut)
   - `very_sloped`: +25 mins
   - `square`: +10 mins (shoulder pad reduction)

2. **Back Curvature Axis (`backCurvature`)**:
   - `normal`: +0 mins
   - `stooped`: +20 mins (back length extension & wedge dart insertion)
   - `erect`: +15 mins (back shortening)
   - `prominent_blade`: +20 mins (blade dart expansion)

3. **Abdomen Stance Axis (`abdomenStance`)**:
   - `normal`: +0 mins
   - `prominent`: +25 mins (front waistband drop & rise pattern expansion)
   - `flat`: +10 mins (waist suppression)

4. **Hip / Spine Stance Axis (`hipSpineStance`)**:
   - `normal`: +0 mins
   - `high_hip`: +15 mins (hip curve adjustment)
   - `sway_back`: +20 mins (lower back hollow sway adjustment)

### 1.4 Customization & Feature Surcharges
- **Panel Count (Flared Garments)**: For `womens-lehenga` or `womens-anarkali`:
  - Panels < 12: +0 mins
  - Panels 12–16: +30 mins
  - Panels > 16: +60 mins
- **Embroidery / Embellishment Level**:
  - `none`: +0 mins
  - `light` (neckline / cuff accent): +45 mins
  - `medium` (all-over motifs / Aari work): +120 mins
  - `heavy` (Zardozi / Dabka / full skirt coverage): +240 mins
- **Lining & Canvas Reinforcement**:
  - Full Canvas / Premium Silk Lining: +30 mins
- **Fitting Trial Adjustments**:
  - Major alteration cycle: +45 mins

### 1.5 Formula Specification
$$\text{Total SAM (minutes)} = \text{Base SAM} + \sum \text{Posture Modifiers} + \sum \text{Customization Surcharges}$$

```typescript
export interface SamCalculationInput {
  garmentCategory: GarmentCategory;
  postureProfile?: PostureProfile;
  panelCount?: number;
  embroideryLevel?: 'none' | 'light' | 'medium' | 'heavy';
  hasFullCanvas?: boolean;
  hasCustomLining?: boolean;
  fittingTrialCount?: number;
}

export interface SamCalculationResult {
  baseSamMinutes: number;
  postureModifierMinutes: number;
  customizationMinutes: number;
  totalSamMinutes: number;
  estimatedLaborHours: number; // totalSamMinutes / 60 formatted to 1 decimal place
}
```

---

## 2. Bespoke Order Pricing Engine (`apps/web/src/lib/pricing-calculator.ts`)

### 2.1 Purpose & Role
The Bespoke Order Pricing Engine computes transparent, dynamic order quotes combining fabric cost (via dynamic fabric yield math), labor cost (via SAM minutes and hourly artisan rates), posture difficulty surcharges, and embroidery/embellishment fees.

### 2.2 Pricing Component Breakdown

1. **Fabric Cost Component**:
   $$\text{Fabric Cost (₹)} = \text{Required Fabric Yield (meters)} \times \text{Fabric Cost per Meter (₹/m)}$$
   - `Required Fabric Yield` is obtained dynamically by calling `calculateFabricYield()` from `apps/web/src/lib/fabric-yield.ts`.

2. **Tailoring Labor Cost Component**:
   $$\text{Labor Cost (₹)} = \text{Total SAM (minutes)} \times \text{Artisan Rate per SAM Minute (₹/min)}$$
   - Standard Artisan Minute Rate: ₹42/minute (derived from `production/page.tsx` line 460).
   - Alternatively: Base Tailoring Fee + (Posture Difficulty Score * ₹500).

3. **Posture Adjustment Labor Surcharge**:
   - Each non-normal posture axis adds an additional ₹750 technical pattern drafting fee.

4. **Embroidery & Embellishment Surcharge**:
   - `none`: ₹0
   - `light`: ₹3,500
   - `medium`: ₹12,000
   - `heavy` (Hand Zardozi / Dabka / Pearls): ₹28,000

5. **Rush Order Surcharge**:
   - Urgent order priority adds a +20% surcharge to total labor & embroidery fees.

6. **Order Deposit Requirement**:
   - Mandatory Advance Deposit: 50% of Total Garment Price (matches `orders/page.tsx` line 333).

### 2.3 Formula Specification
$$\text{Total Garment Price (₹)} = \text{Fabric Cost} + \text{Tailoring Labor Cost} + \text{Posture Surcharge} + \text{Embroidery Surcharge} + \text{Rush Fee}$$

```typescript
export interface PricingCalculationInput {
  garmentCategory: GarmentCategory;
  fabricCostPerMeter: number; // ₹ per meter
  boltWidth?: number; // inches, default 44
  patternRepeat?: number; // inches
  shrinkageBufferPercent?: number;
  girthMeasurement?: number;
  lengthMeasurement?: number;
  panelCount?: number;
  postureProfile?: PostureProfile;
  embroideryLevel?: 'none' | 'light' | 'medium' | 'heavy';
  isUrgent?: boolean;
  artisanMinuteRate?: number; // default ₹42/min
}

export interface PricingCalculationResult {
  fabricYieldMeters: number;
  fabricCost: number;
  baseLaborCost: number;
  postureSurcharge: number;
  embroiderySurcharge: number;
  rushSurcharge: number;
  totalGarmentPrice: number;
  mandatoryAdvance50Percent: number;
  balanceDueOnDelivery: number;
  totalSamMinutes: number;
}
```

---

## 3. Unit Test Strategy & Infrastructure

### 3.1 New Test Files to Add
1. **`apps/web/src/__tests__/sam-calculator.test.ts`**:
   - Validates base SAM for all 9 garment categories.
   - Validates posture modifier additions across sloped shoulders, stooped back, prominent abdomen, and sway back.
   - Validates customization surcharges for panel counts (12, 16, 24 kalis) and embroidery levels.

2. **`apps/web/src/__tests__/pricing-calculator.test.ts`**:
   - Validates fabric cost calculation given fabric yield and cost per meter.
   - Validates total order price calculation for Men's Suit, Women's Lehenga, Sherwani, and Sari Blouse.
   - Validates 50% mandatory advance calculation and rush order +20% surcharges.
   - Validates end-to-end integration between fabric yield, SAM calculation, and final price breakdown.

3. **Integration with `run-tests.ts`**:
   - Import and invoke `runSamCalculatorTests()` and `runPricingCalculatorTests()` inside `runAllSuites()` in `apps/web/src/__tests__/run-tests.ts`.

---

## 4. Integration Blueprint across YellowHouse OS

```
                     ┌──────────────────────────────────────────┐
                     │     MeasurementEngineContext.tsx         │
                     │  - Holds measurements, posture profile,   │
                     │    bolt width, pattern repeat, panels    │
                     └────────────────────┬─────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │    sam-calculator.ts        │                 │    fabric-yield.ts          │
   │  Calculates Total SAM Mins  │                 │  Calculates Fabric Meters   │
   └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                           ┌─────────────────────────────┐
                           │    pricing-calculator.ts    │
                           │ Computes Total Price & 50%  │
                           │      Mandatory Advance      │
                           └──────────────┬──────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │    orders/page.tsx          │                 │   production/page.tsx       │
   │ - Dynamic Item Price Quote  │                 │ - Auto-assigns SAM Estimate │
   │ - WhatsApp Quotation Link   │                 │ - Artisan Timesheet Payout  │
   └─────────────────────────────┘                 └─────────────────────────────┘
```

1. **Order Creation (`orders/page.tsx`)**:
   - Replace static default prices (`defaultPrice: 28000`) with dynamic calculation calling `calculateBespokePricing()`.
   - Automatically display item fabric yield (m), estimated SAM (mins), labor cost, and total price.

2. **Kanban Production Board (`production/page.tsx`)**:
   - When launching job cards from orders, set `samTotalEstimate` to `calculateGarmentSam().totalSamMinutes`.
   - Calculate artisan timesheet payouts dynamically: `samMinutesLogged * artisanRatePerMinute`.

3. **CAD Measurement Engine (`MeasurementEngineContext.tsx`)**:
   - Expose `samResult` and `pricingResult` in context for real-time preview during measurement entry.

---
