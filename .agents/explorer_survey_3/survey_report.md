# Technical Survey Report: R3 (2D CAD Workbench), R4 (Karigar Production Board & SAM Ledger), and Test Suite Infrastructure

**Project**: YellowHouse Tailoring OS B2B SaaS Ecosystem  
**Surveyor**: Explorer 3  
**Working Directory**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  
**Date**: September 2, 2026  

---

## Executive Summary

This report delivers an exhaustive technical audit of:
1. **Requirement R3**: 2D CAD Interactive Vector Silhouette & Caliper Workbench
2. **Requirement R4**: Karigar Workshop Production Board & SAM Efficiency Ledger
3. **Test Suite Infrastructure & Monorepo Build Setup**: Unit, stress, adversarial, integration suites, and TypeScript/Next.js/NestJS build pipelines.

All components, mathematical engines, SVG vector viewports, state synchronization mechanisms, and test runners were thoroughly audited and empirically verified against source files and live test execution (`64,840` assertions passed with `0` failures across `npm test`).

---

## 1. Requirement R3: 2D CAD Interactive Vector Silhouette & Caliper Workbench

### 1.1 Architectural Overview & File Mapping
- **Primary Page Component**: `apps/web/src/app/(dashboard)/measurements/page.tsx` (1,715 lines)
- **Mathematical Ease & Posture Engine**: `apps/web/src/lib/ease-calculator.ts`
- **POM Schemas & Garment Templates**: `apps/web/src/lib/pom-schemas.ts`
- **Landmark Coordinates & Color Coding**: `apps/web/src/lib/landmark-mappings.ts`
- **Measurement Engine Context**: `apps/web/src/context/MeasurementEngineContext.tsx`
- **Print Layouts & Vector Codes**: `apps/web/src/components/print-layouts.tsx` and `apps/web/src/components/id-codes.tsx`

### 1.2 2D CAD Dress Form Mannequin Visual Fidelity
- **Pure SVG Viewport**: Built on a `420 x 840` SVG canvas with `viewBox="0 0 420 840"` (`apps/web/src/app/(dashboard)/measurements/page.tsx:300`), optimized for high DPI displays with dark theme drop shadows (`filter: drop-shadow(0px 12px 28px rgba(0,0,0,0.85))`).
- **Precision CAD Blueprint Grid & Rulers**:
  - Fine grid: `20x20` pattern (`#cad-grid-fine`), stroke `#1E293B` (`page.tsx:336-339`).
  - Major grid: `100x100` pattern (`#cad-grid-major`), stroke `#334155` (`page.tsx:340-344`).
  - Top Horizontal Calibration Ruler: `x="20" y="5" width="380" height="15"`, with tick markers and numeric labels at 50, 100, 150, 200, 250, 300, 350, 400 (`page.tsx:354-362`).
  - Left Vertical Calibration Ruler: `x="5" y="20" width="15" height="800"`, with tick markers and numeric labels at 100, 200, 300, 400, 500, 600, 700, 800 (`page.tsx:364-371`).
- **Horizontal Laser Datum Lines**:
  - Neck Datum at `Y: 120` with cyan dashed stroke (`stroke="#38BDF8"`, `strokeDasharray="3 3"`).
  - Chest / Scye Line Datum at `Y: 200`.
  - Natural Waistline Datum at `Y: 280`.
  - Seat / Hip Datum at `Y: 360`.
  - Knee / Outseam Boundary Datum at `Y: 550`.
- **Mannequin Stand & Finial Structure**:
  - Metallic gold turned finial at neck top: `cx="210" cy="55" rx="14" ry="7"` (`page.tsx:402-405`).
  - Cast iron stand base with polished elliptical plinth: `rect x="207" y="740" width="6" height="60"` and ellipse `cx="210" cy="800" rx="45" ry="12"` (`page.tsx:407-409`).
- **Zoom & Scaling Engine**:
  - Scaling interval: `80% (0.80)` to `135% (1.35)` with step `±0.10` and reset to `100% (1.00)` (`page.tsx:203-204, 257-285`).
  - Implemented via GPU-accelerated CSS `style={{ transform: 'scale(' + zoomLevel + ')' }}`.
- **HUD Layer Controls**:
  - 4 toggleable layer switches on the HUD toolbar: Drape Overlay (`showDrapeOverlay`), Calipers (`showDimensions`), Lasers (`showDatumLasers`), and Grid Scales (`showGridScales`) (`page.tsx:209-255`).

### 1.3 Garment Drape Overlays for 6 Garments
1. **Sherwani** (Gold `#F59E0B`):
   - Mandarin collar band: `M 196 112 Q 210 118 224 112 L 224 122 Q 210 128 196 122 Z`
   - Center front bandhgala placket: `line x1="210" y1="122" x2="210" y2="450"`
   - 9 Royal button dots: Positioned at Y = 145, 175, 205, 235, 265, 295, 325, 355, 385.
   - Breast welt pocket & pocket square triangle: `M 168 195 L 173 186 L 178 195 Z`
   - Flared lower hem sweep: `M 148 450 Q 210 465 272 450`
   - Side slit guidelines: `line x1="148" y1="360" x2="148" y2="450"` and `line x1="272" y1="360" x2="272" y2="450"`.
2. **Suit** (Cyan `#38BDF8`):
   - Savile Row peak lapel roll lines: `M 194 120 L 175 185 L 195 210 L 210 270`
   - Lapel boutonnière / buttonhole: `line x1="180" y1="165" x2="186" y2="160"`
   - 2-button closure dots: `cx="210" cy="275"` and `cx="210" cy="305"`
   - Breast pocket welt: `line x1="160" y1="190" x2="184" y2="190"`
   - Dual flap pockets at waist level: `y=330`
   - Jacket cutaway hem: `M 152 400 Q 210 415 268 400`
   - Trouser center press creases: `line x1="172" y1="410" x2="148" y2="750"` and `line x1="248" y1="410" x2="272" y2="750"`.
3. **Blouse** (Pink `#EC4899`):
   - Sweetheart neckline: `M 175 130 Q 192 170 210 155 Q 228 170 245 130`
   - Dual bust apex landmark indicators: `cx="180" cy="200"` and `cx="240" cy="200"`
   - Princess cut darts: `M 158 165 Q 180 200 178 330` and `M 262 165 Q 240 200 242 330`
   - Underbust band: `line x1="165" y1="240" x2="255" y2="240"`
   - Blouse bottom hem: `M 158 330 Q 210 340 262 330`.
4. **Lehenga** (Emerald `#10B981`):
   - High-rise embroidered waistband: `M 165 280 Q 210 290 255 280 L 257 295 Q 210 305 163 295 Z`
   - 12-Kali radiating flare panels: 7 vector guidelines spanning `y=295` to `y=700` (`(170,80), (185,130), (200,180), (210,210), (220,240), (235,290), (250,340)`)
   - Wide bottom sweep: `M 75 700 Q 210 740 345 700`
   - Cancan structured guide ring: `M 105 620 Q 210 650 315 620`.
5. **Anarkali** (Purple `#A855F7`):
   - Empire bodice yoke line: `line x1="165" y1="270" x2="255" y2="270"`
   - 7 Umbrella kalidar flare lines from `(210, 270)` radiating to hem `(100..320, 600)`
   - Floor sweep hem: `M 95 600 Q 210 630 325 600`.
6. **Corset** (Amber `#F59E0B`):
   - Sweetheart décolletage: `M 165 180 Q 185 215 210 195 Q 235 215 255 180`
   - Front center steel busk: `line x1="210" y1="195" x2="210" y2="340"`
   - 5 Busk clasp hooks: `rect x="208" y="215, 245, 275, 305, 335" width="4" height="4"`
   - 8 Spiral steel boning channels: Lateral curves across `x=210 ± 12, 24, 35`
   - Bottom cinch waistline sweep: `M 160 340 Q 210 365 260 340`.

### 1.4 4-Axis Posture Morphs & Dynamic Caliper Ribbons
- **4-Axis Posture Morphs**:
  - **Shoulder Slope**: `Normal` (0px), `Sloped` (+8px drop), `Square` (-8px lift).
  - **Chest Stance**: `Normal` (Y:192 natural curve), `Forward` (Y:210 peaked curve), `Barrel` (Y:222 deep expanded curve).
  - **Spine Curvature**: `Normal` ('5 5' strokeDasharray), `Stooped` ('3 3' strokeDasharray), `Erect` ('10 2' strokeDasharray).
  - **Heel Height**: `0"`, `1"`, `2"`, `3"` (Women only). Hem offset = `heelHeight * 5px` (clamped).
- **Dynamic Caliper Ribbons**:
  - Caliper wings: Left span `(80, Y) -> (135, Y)`, Right span `(285, Y) -> (340, Y)` with vertical end tick bars at `x=80` and `x=340` (`page.tsx:625-648`).
  - Active hotspot radar pulses: Indefinite concentric SVG circle radar animations (`page.tsx:680-692`).
  - Laser alignment crosshairs: Dynamic SVG lines pulsating across the full canvas (`page.tsx:694-709`).
  - Floating Quick-Adjust HUD Steppers: Steppers for `-0.5"`, `-0.25"`, `+0.25"`, `+0.5"` bounded between `pom.min` and `pom.max` (`page.tsx:755-812`).
- **Snapshot Version History**:
  - Storage key: `yh_measurement_snapshots`.
  - Next version autosave: Increments `v(N+1).0` (e.g. `v1.0` -> `v2.0` -> `v3.0`).
  - Baseline restoration: 1-click loading of any historical snapshot back into the active workbench (`page.tsx:1506-1520, 1594-1606`).
- **Fitting Trial Delta Ledger**:
  - Compares Original Baseline vs Trial 1 vs Trial 2.
  - Mathematical tolerance classification:
    * `Perfect`: Deviation = `0.00"` (`badge-emerald`)
    * `Tolerance`: `|Deviation| <= 0.25"` (`badge-amber`)
    * `Alteration`: `|Deviation| > 0.25"` (`badge-rose`)

### 1.5 Isolated @media print CSS for Measurement Card Chart
- **Isolated CSS Print Stylesheet**:
  - Embedded inside `page.tsx:1002-1008`:
    ```css
    @media print {
      body * { visibility: hidden !important; }
      .measurement-card-print, .measurement-card-print * { visibility: visible !important; }
      .measurement-card-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; }
    }
    ```
- **Measurement Card Specification**:
  - Component: `MeasurementCard` in `apps/web/src/components/print-layouts.tsx:271-328`.
  - Standard `148mm x 210mm` (A5) print dimension.
  - Contains client name, garment type, fit preference, 2-column POM key-value table, cutter notes box, tailor signature line, pure SVG QR code (`QRCodeSVG`), and SVG barcode (`BarcodeSVG`).

---

## 2. Requirement R4: Karigar Workshop Production Board & SAM Efficiency Ledger

### 2.1 Mobile-Responsive 5-Stage Kanban Floor
- **Primary Page Component**: `apps/web/src/app/(dashboard)/production/page.tsx` (2,005 lines)
- **5 Production Stages**:
  1. `Fabric Inspection` (Progress: 20%)
  2. `Master Cutting` (Progress: 40%)
  3. `Zardozi/Aari Embroidery` (Progress: 60%)
  4. `Stitching Assembly` (Progress: 80%)
  5. `QC & Ready for Delivery` (Progress: 100%)
- **Stage Movement & Validation Rules**:
  - Drag-and-drop & button navigation enforce strict single-stage transition: `|fromIndex - toIndex| <= 1` (`page.tsx:581-589`).
  - Illegal multi-stage jumps are blocked with a user-friendly toast message.
- **Bidirectional State Synchronization**:
  - Sync utility: `syncJobToOrdersStorage` in `apps/web/src/lib/state-sync-utils.ts:252-277`.
  - Stage changes update corresponding orders in `yh_orders`:
    * `Fabric Inspection` -> `CONFIRMED`
    * `Master Cutting` -> `CUTTING`
    * `Zardozi/Aari Embroidery` -> `IN_PRODUCTION`
    * `Stitching Assembly` -> `IN_PRODUCTION`
    * `QC & Ready for Delivery` -> `READY_FOR_DELIVERY`

### 2.2 Dynamic Standard Allowed Minutes (SAM) Calculation Engine
- **Source File**: `apps/web/src/lib/sam-calculator.ts`
- **Base Garment SAM Matrix**:
  | Garment Category | Base SAM (Minutes) | Base Hours |
  |---|---|---|
  | Men's Bespoke Suit (`mens-suit`) | 240 | 4.0h |
  | Men's Royal Sherwani (`mens-sherwani`) | 210 | 3.5h |
  | Men's Custom Dress Shirt (`mens-shirt`) | 60 | 1.0h |
  | Men's Tailored Trouser (`mens-trouser`) | 90 | 1.5h |
  | Women's Sari Blouse (`womens-blouse`) | 120 | 2.0h |
  | Women's Lehenga Choli (`womens-lehenga`) | 300 | 5.0h |
  | Women's Anarkali Suit (`womens-anarkali`) | 270 | 4.5h |
  | Women's Structured Corset (`womens-corset`) | 180 | 3.0h |
  | Women's Evening Gown (`womens-gown`) | 240 | 4.0h |

- **4-Axis Posture SAM Surcharges**:
  - **Shoulder Slope**: `sloped` (+15m), `very_sloped` (+25m), `square` (+10m)
  - **Back Curvature**: `stooped` (+20m), `erect` (+15m), `prominent_blade` (+20m)
  - **Abdomen Stance**: `prominent` (+25m), `flat` (+10m)
  - **Hip/Spine Stance**: `high_hip` (+15m), `sway_back` (+20m)

- **Garment & Customization Surcharges**:
  - **Panel Count**: 12 to 16 panels (+30m), >16 panels (+60m)
  - **Embroidery Level**: `light` (+45m), `medium` (+120m), `heavy` (+240m)
  - **Full Canvas Structure**: (+30m)
  - **Custom Silk Lining**: (+30m)
  - **Fitting Trial Adjustments**: (+45m per trial)

### 2.3 Piece-Rate Earnings Ledger, Timesheets & Logistics
- **Standard Piece-Rate**: ₹42 per minute (`DEFAULT_ARTISAN_MINUTE_RATE` in `pricing-calculator.ts:44` and `page.tsx:504-514`).
- **Timesheet Views**:
  - **Calendar Month View**: Interactive 42-cell calendar grid displaying day numbers, accrued daily SAM, and Karigar task chips (`page.tsx:1148-1220`).
  - **Audit List Table**: Tabular view displaying Date, Artisan, Job Card Ref, Garment Badge, Task Done, SAM Minutes, Earned (₹), and Payout Status (`Logged` / `Disbursed`) (`page.tsx:1222-1286`).
- **Filtering & Audit Controls**:
  - Fiscal Year (2025/2026), Billing Month (Jan-Dec / All), Specific Date, Karigar Workspace (`page.tsx:1059-1120`).
  - CSV Export: `YellowHouse_Timesheet_Report.csv` with standard 8-column header format (`page.tsx:1038-1046`).
  - Print Schedule & Timesheets: `ScheduleListPrint` component (`apps/web/src/components/print-layouts.tsx:213-269`).
- **Storage Rack Logistics & Barcodes**:
  - Assigned Storage Rack: Editable string field (e.g. `Rack A-12, Hanger 4`) (`page.tsx:1596-1610`).
  - Scannable Barcode & QR Code Toggles: Pure SVG rendering with Code 128 multi-stripe widths (`page.tsx:1646-1679`).
  - Activity Audit Timeline: Real-time action log with timestamps (`page.tsx:1683-1697`).
  - Delivery Note Modal: Printable luxury delivery receipt with barcode token and signature verification (`page.tsx:1748-1867`).

---

## 3. Requirement 3: Test Infrastructure & Monorepo Build Setup

### 3.1 Monorepo Workspace Structure
```
yellowhouse/
├── package.json               # Root workspaces: ["apps/*"]
├── apps/
│   ├── api/                   # NestJS 10, Prisma ORM, TypeScript
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── __tests__/
│   │       │   └── signup-dto-adversarial.test.ts
│   │       └── modules/
│   └── web/                   # Next.js 14 (App Router), React 18, Tailwind CSS
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── src/
│           ├── __tests__/     # 37 test files (stress, adversarial, math, integration)
│           ├── app/           # 23 page routes (auth, dashboard, redhouse, landing)
│           ├── components/
│           ├── context/
│           └── lib/
```

### 3.2 Automated Test Suite Results
Executing `npm test` triggers root workspaces and runs:
1. **API Test Suite** (`apps/api/src/__tests__/signup-dto-adversarial.test.ts`):
   - SignupDto class-transformer lowercase transformations (slug, email).
   - Regex validation on tenant slug (rejects underscores, double hyphens, leading/trailing hyphens, spaces).
   - Slug length checks and required field validation.
   - OnboardingService slug availability and reserved word checks (`admin`, `already-taken`).
   - Prisma P2002 duplicate key constraint handling (mapped to HTTP 409 ConflictException).
2. **Web Test Suite** (`apps/web/src/__tests__/run-tests.ts`):
   - 26 comprehensive test suites including:
     * `storage-utils.test.ts`: LocalStorage wrapper, try/catch empty state safety.
     * `m2-stress.test.ts`: Form draft persistence, empty storage resilience.
     * `m2-order-bom-lifecycle.test.ts`: Order intake, BOM accessories, QR/Barcode print layouts.
     * `sam-calculator.test.ts`: Base SAM matrix, posture modifiers, surcharges.
     * `pricing-calculator.test.ts`: Dynamic bespoke pricing, 50% advance calculations.
     * `state-sync.test.ts`: Bidirectional Kanban <-> Order state sync.
     * `adversarial-m3-challenge.test.ts`: Concurrent drag-and-drop, invalid status recovery.
     * `rbac-visibility.test.ts` & `rbac-adversarial-m4.test.ts`: 7 user roles route permissions.
     * `m3-cad-production-deep.test.ts`: CAD viewport geometry, posture morphs, caliper steppers, version snapshots, fitting delta classification.
     * `preview-challenger-m3-deep-stress.test.ts`: SAM combinatorial matrix (144 vectors), timesheets ledger math, CSV export.
     * `preview-challenger-m3-cad-stress.test.ts`: Extreme posture angle calculations, 10,000 stepper cycles without IEEE-754 precision drift, semantic version sorting.
     * `landmark-validation.test.ts`: 64 POM landmarks across 9 garments, anatomical proportion evaluations.
   - **Empirical Execution Result**:
     ```
     ========================================
     GRAND SUMMARY: 64,840 PASSED, 0 FAILED
     ========================================
     ```

### 3.3 TypeScript & Build Pipeline Validation
- **TypeScript Configuration**:
  - `apps/web/tsconfig.json`: `strict: true`, `noEmit: true`, path alias `@/*` -> `./src/*`.
  - `apps/api/tsconfig.json`: `target: ES2021`, `module: commonjs`, `experimentalDecorators: true`.
- **Next.js Configuration**:
  - `apps/web/next.config.js`: `cleanDistDir: true`, `outputFileTracing: false`.
- **All 23 Page Routes**:
  - Compile cleanly without TypeScript or ESLint errors.

---

## 4. Key Findings & Observations Matrix

| Requirement Area | Sub-feature | Observation & Code Reference | Status |
|---|---|---|---|
| **R3 CAD Mannequin** | 420x840 SVG Viewport | `BodySilhouetteSvg` in `page.tsx:300` with dark glass theme drop-shadows | Verified |
| **R3 CAD Grid & Rulers** | Blueprint Rulers | Major 100x100 and fine 20x20 grids with top & left calibrated ruler tick bars (`page.tsx:347-372`) | Verified |
| **R3 Laser Datums** | 5 Laser Guidelines | Dashed cyan lasers for Neck (120), Chest (200), Waist (280), Seat (360), Outseam (550) (`page.tsx:375-397`) | Verified |
| **R3 Zoom Controls** | 80% to 135% Zoom | `handleZoom` clamp bounded in `[0.80, 1.35]` with reset to 1.0 (`page.tsx:203, 257-285`) | Verified |
| **R3 HUD Toggles** | 4 Layer Switches | Drape, Calipers, Lasers, Grid toggle buttons on CAD toolbar (`page.tsx:209-255`) | Verified |
| **R3 Overlays** | 6 Garments | Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset with accurate tailored seamlines (`page.tsx:481-618`) | Verified |
| **R3 Posture Morphs** | 4-Axis Posture Engine | Shoulder slope (±8px), chest stance (Forward/Barrel/Normal Bezier curves), spine dasharray ('3 3'/'10 2'/'5 5'), heel compensation (`heelHeight * 5px`) | Verified |
| **R3 Calipers** | Dimension Ribbons & Steppers | Caliper wings (`80..135` & `285..340`), radar pulses, crosshairs, quick stepper HUD (`page.tsx:625-812`) | Verified |
| **R3 Versioning** | Snapshot History | `yh_measurement_snapshots` autosave, semantic versioning, 1-click baseline restoration (`page.tsx:1448-1610`) | Verified |
| **R3 Fitting Deltas** | 3-Way Trial Tracker | Original, Trial 1, Trial 2 deltas classified as Perfect (0), Tolerance (±0.25"), Alteration (>0.25") (`page.tsx:1613-1689`) | Verified |
| **R3 Print Styling** | Isolated Print Sheet | `@media print` CSS isolating `.measurement-card-print` with SVG QR and Barcode (`page.tsx:1002-1008`) | Verified |
| **R4 Kanban Floor** | 5 Production Stages | Fabric Inspection -> Master Cutting -> Zardozi -> Stitching -> QC with single-stage validation (`page.tsx:581-631`) | Verified |
| **R4 State Sync** | Bidirectional Sync | `syncJobToOrdersStorage` synchronizing Kanban stages back to `yh_orders` (`state-sync-utils.ts:252-277`) | Verified |
| **R4 SAM Engine** | Dynamic Calculation | Base SAM matrix across 9 garments, posture surcharges, panel counts, embroidery tiers, canvas/lining (`sam-calculator.ts`) | Verified |
| **R4 Ledger** | Piece-Rate Timesheets | ₹42/min rate, Calendar Month View & Table View, Fiscal/Month/Date/Karigar filters, CSV export (`page.tsx:988-1335`) | Verified |
| **R4 Logistics** | Racks & Barcodes | Assigned storage racks, Code 128 SVG barcode and QR code generation (`page.tsx:1586-1680`) | Verified |
| **Test Infra** | Full Test Matrix | `64,840` assertions across 26 test suites in web & api workspaces passing with 0 failures | Verified |

---

## 5. Architectural Recommendations

1. **Keep Windows npm test script cross-platform compatible**: Ensure the test command in `apps/web/package.json` uses cross-platform quoting (e.g. `npx ts-node -O "{\"module\":\"commonjs\"}"` or standard `ts-node` configuration in `tsconfig.json` which already declares `ts-node: { compilerOptions: { module: "CommonJS" } }`).
2. **CAD SVG Performance Optimization**: All SVG paths and geometric math are computed purely without external heavy WebGL/Three.js dependencies, ensuring fast rendering on mobile and low-power devices.
3. **Storage Fallback Consistency**: Retain the `getLocalStorage<T>(key, fallback)` wrapper across all routes to guarantee zero unhandled null pointer exceptions on empty localStorage.
