# Comprehensive Survey Report: R2, R3, and R4 in YellowHouse Tailoring OS

**Surveyor**: `teamwork_preview_explorer_survey_2`  
**Date**: 2026-08-24  
**Project**: YellowHouse Tailoring OS (`@yellowhouse/web` & `@yellowhouse/api`)  
**Scope**: 
- **R2**: Order Lifecycle & Bill of Materials (BOM) Integration
- **R3**: 2D CAD Interactive Vector Workbench & Mannequin Studio
- **R4**: Karigar Workshop Production Board & SAM Efficiency Ledger

---

## 1. Executive Summary & Test Health Summary

A comprehensive architectural and functional investigation was conducted on the core tailoring workflows of the YellowHouse Tailoring OS. The platform demonstrates an enterprise-grade bespoke garment operating system with deep reactive state management, anatomical CAD pattern drafting, dynamic bill of materials (BOM), real-time Standard Allowed Minutes (SAM) production boards, and isolated `@media print` physical layouts with SVG barcodes and QR codes.

### Key Verification Metrics:
- **Test Suite Status**: **2016 unit/integration tests PASSED cleanly (0 failed)** across all modules (`npm test` in `apps/web`).
- **Core Files Surveyed**:
  - `apps/web/src/app/(dashboard)/orders/page.tsx` (2412 lines)
  - `apps/web/src/app/(dashboard)/measurements/page.tsx` (1715 lines)
  - `apps/web/src/app/(dashboard)/production/page.tsx` (2005 lines)
  - `apps/web/src/components/id-codes.tsx` (136 lines)
  - `apps/web/src/components/print-layouts.tsx` (685 lines)
  - `apps/web/src/context/MeasurementEngineContext.tsx` (188 lines)
  - `apps/web/src/lib/pom-schemas.ts` (869 lines)
  - `apps/web/src/lib/landmark-mappings.ts` (804 lines)
  - `apps/web/src/lib/ease-calculator.ts` (189 lines)
  - `apps/web/src/lib/sam-calculator.ts` (139 lines)
  - `apps/web/src/lib/pricing-calculator.ts` (129 lines)
  - `apps/web/src/lib/state-sync-utils.ts` (419 lines)

---

## 2. R2 Deep-Dive: Order Lifecycle & BOM Integration

### 2.1 Customer Intake & Profile Management
- **Dynamic Customer Store Integration**: The order intake system loads existing patrons from `yh_customers` with a fallback to default patrons (`Rajeshwar Malhotra`, `Ananya Sharma`, `Vikram Singh`, `Priya Patel`, `Mohammed Farooq`, `Deepika Nair`, `Arjun Kapoor`, `Meera Reddy`).
- **Quick-Add Client Modal** (`orders/page.tsx:2265–2408`):
  - Provides instant modal registration for walk-in clients without leaving the order creation workflow.
  - Captures Name, Phone, Email, Gender (`Men` | `Women`), Fit Preference (`Slim Bespoke` | `Regular Tailored` | `Relaxed Royal` | `Comfort Traditional`), VIP Atelier status, and special posture/fitting notes.
  - Automatically generates client ID (`CUST-xxx`), computes initials, persists to `yh_customers`, logs activity via `logActivity`, and auto-selects the newly created client for the active order.

### 2.2 Fabric & Trim Selection Engine
- **Garment Presets**: 12 pre-configured luxury garments with standard bolt widths (44" and 58"), default yields (1.0m to 5.5m), default base prices, and buffer notes:
  - *Saree Blouse (Single)*: 1.0m (44") + 0.8m lining (₹3,500)
  - *Corset Blouse / Bustier*: 1.2m (44") + fused interlining (₹6,500)
  - *Bespoke Shirt*: 2.2m (44") or 1.6m (58") (₹2,800)
  - *Bespoke Trouser*: 1.4m (58") or 2.2m (44") (₹3,200)
  - *2-Piece Suit*: 3.2m (58") wool/linen (₹28,000)
  - *3-Piece Suit*: 4.0m (58") + 3.0m satin lining (₹38,000)
  - *Sherwani + Churidar*: 4.5m (44") brocade/silk + 2.5m churidar (₹32,000)
  - *Bandhgala*: 3.5m (58") (₹24,000)
  - *Kurta Pyjama Set*: 3.8m (44") (₹7,500)
  - *Bridal Lehenga (16-24 Kali Flare)*: 5.5m (44") silk + 4.5m lining + 4m cancan (₹65,000)
  - *Anarkali Gown*: 5.0m (44") georgette + 4.0m crepe lining (₹26,000)
  - *Evening Haute Couture Gown*: 4.8m (58") + 1.2m train (₹35,000)
- **Visual Swatches & File Upload**:
  - Image preset swatches (Crimson Silk Velvet, Emerald Green Velvet, Royal Blue Brocade, Ivory Gold Jacquard).
  - Dedicated base64 file uploaders for custom client fabric swatches and lining photographs (`handleFileUpload`).

### 2.3 Customer-Provided Fabric Flow
- **Customer Given Toggle**: Items can be flagged as `isCustomerFabric`.
- **Automated SKU Generation**: When toggled, auto-generates tracking SKU formatted as `CUST-FAB-<TIMESTAMP-HASH>` and applies distinctive emerald green indicator styling.

### 2.4 Bill of Materials (BOM) & Trim Integration
- **BOM Item Schema** (`orders/page.tsx:56–66`):
  - Fields: `id`, `name`, `category` (`thread` | `zipper` | `button` | `lining` | `canvas` | `lace` | `hook` | `piping` | `fabric` | `other`), `quantity`, `unit`, `unitCost`, `isOptional`, `isCustomerProvided`, `receivedDate`.
- **Intelligent Default BOM Generator** (`getDefaultBOMForGarment`, lines 403–532):
  - *Trouser / Suit*: Matching thread (2 spools), YKK concealed metal zipper (7"), waistband canvas stiffener interlining (1.2m), horn/resin jacket buttons (set of 6).
  - *Blouse / Corset / Choli*: Matching thread, heavy duty side invisible zipper (12"), back eyelet/braided dori hooks (8 pairs), padded cup inserts & boning strips (1 pair).
  - *Sherwani / Bandhgala*: Matching thread, gold plated/antique metal buttons (7 pcs), horsehair canvas chest piece reinforcement (1.5m), gold zari border piping trim (3.5m).
  - *Lehenga / Gown / Anarkali*: Matching thread, cancan mesh netting for flare volume (4.0m), heavy zari waistband latkan tassels (2 pcs), concealed side zipper (18").
- **Client Given vs. Atelier Supplied**: Each trim item has an interactive toggle (`isCustomerProvided`) allowing ateliers to record client-supplied accessories vs. studio-stocked materials.

### 2.5 Real-Time Pricing & Yield Computation
- Integrates `calculateBespokePricing` and `calculateFabricYield` (`orders/page.tsx:596–627`).
- Computes aggregate SAM minutes, base labor cost (rated at ₹42/minute), advance requirement (50%), and live balance due upon fitting.
- Includes autosaving draft state to `yh_orders_draft` on every keystroke/selection change.

### 2.6 Barcode & QR Code Engine
- Implemented in `apps/web/src/components/id-codes.tsx`:
  - `QRCodeSVG`: Pure SVG 15x15 2D matrix with 3 finder patterns and deterministic polynomial hashing.
  - `BarcodeSVG`: Pure SVG linear Code 128 / EAN stripe generator with human-readable alphanumeric label.
- Generated across:
  - `OrderReceipt` in `print-layouts.tsx:88–89` (`https://yellowhouse.atelier/order/${order.id}`)
  - Print Delivery Note in `orders/page.tsx:2198–2199` (`https://yellowhouse.atelier/track/${printModalOrder.id}`)
  - `JobCardPrint` in `print-layouts.tsx:381–382` (`https://yellowhouse.atelier/job/${job.id}`)
  - `MeasurementCard` in `print-layouts.tsx:322–323`

### 2.7 Fitting Trial Stage Transitions & State Reactivity
- **Valid Order Status Progression**:
  - `DRAFT` ➔ `CONFIRMED` / `CANCELLED`
  - `CONFIRMED` ➔ `CUTTING` / `CANCELLED`
  - `CUTTING` ➔ `IN_PRODUCTION` / `CANCELLED`
  - `IN_PRODUCTION` ➔ `TRIAL_FITTING` / `CANCELLED`
  - `TRIAL_FITTING` ➔ `READY_FOR_DELIVERY` / `QC_CHECK` / `CANCELLED`
  - `QC_CHECK` ➔ `READY_FOR_DELIVERY` / `CANCELLED`
  - `READY_FOR_DELIVERY` ➔ `DELIVERED` / `CANCELLED`
- **Bidirectional Sync**: Status modifications trigger `syncOrderToJobsStorage(updatedOrderObj)` (`lib/state-sync-utils.ts`), seamlessly syncing status with the Karigar workshop board (`yh_production_jobs`).

---

## 3. R3 Deep-Dive: 2D CAD Interactive Vector Workbench & Mannequin Studio

### 3.1 2D Vector CAD Canvas Architecture
- **Dimensions & Scale**: 420x840 SVG viewBox inside a responsive dark glassmorphic canvas (`#070A12`) with ambient backlights (`#38BDF8`, `#F59E0B`).
- **HUD Layer Controls** (`measurements/page.tsx:212–255`):
  - **Drape**: Toggles garment-specific vector pattern drape silhouette overlays.
  - **Calipers**: Toggles real-time horizontal caliper dimension ribbons with end ticks.
  - **Lasers**: Toggles horizontal datum laser alignment lines (Neck Y:120, Chest/Scye Y:200, Natural Waistline Y:280, Seat Y:360, Knee/Outseam Y:550).
  - **Grid**: Toggles precision CAD blueprint grid and millimeter calibration rulers (Top: 50–400, Left: 100–800).
- **Zoom & Reset Controls**: Dynamic scaling from 80% to 135% with instant reset (`RotateCcw`).
- **Anatomical Views**: Front/Back vector dress forms with realistic gradients, wooden/metallic finial, and cast iron base stand.

### 3.2 Posture Compensation Engine
- **Shoulder Slope**:
  - `Normal` (0px offset)
  - `Sloped` (+8px vertical drop on clavicles, shoulder width line, and armscye)
  - `Square` (-8px upward lift)
- **Chest Stance**:
  - `Normal` (`M 160 170 C 175 188, 200 192, 210 192...`)
  - `Forward` (`M 160 170 C 170 200, 205 210, 210 210...`) with highlighted amber gold curve
  - `Barrel` (`M 155 170 C 165 212, 200 222, 210 222...`)
- **Back Posture**:
  - `Normal` (dasharray `5 5`)
  - `Stooped` (dasharray `3 3`)
  - `Erect` (dasharray `10 2`)
- **Heel Height Offset**:
  - For Women's silhouettes, adjusts vertical hem boundary by `heelHeight * 5px`.

### 3.3 Garment Silhouette Overlays
The vector workbench provides 6 garment overlays:
1. **Sherwani**: Mandarin collar band, front center placket, 9 ornate gold buttons, chest welt pocket with pocket square, flared hem sweep, side slits.
2. **Suit**: Savile Row peak lapel roll lines, lapel flower buttonhole, 2-button closure, breast welt pocket, flap pockets, cutaway hem, trouser center press creases.
3. **Blouse**: Sweetheart neckline (front & back), bust apex points, princess cut darts, underbust band, hem line.
4. **Lehenga**: High-rise embroidered waistband, 12-Kali radiating flare panels, broad bottom flare sweep, cancan ring guide.
5. **Anarkali**: Empire bodice yoke line, umbrella kalidar flare lines, floor sweep hem.
6. **Corset**: Sweetheart décolletage, steel busk center front clasp hooks (5 clasps), 8 spiral steel boning channels, bottom cinch sweep.

### 3.4 Interactive Hotspot Calipers & Quick-Adjust HUD
- **Radar Pulse & Crosshairs**: Focused POM landmarks emit animated dual-ring radar pulses and full-viewport laser alignment crosshairs (`glow-cyan`, `glow-gold`).
- **Floating HUD Stepper**: Displays code, name, range, target value, and `[-0.5"]`, `[-0.25"]`, `[+0.25"]`, `[+0.5"]` quick-increment adjustment buttons.
- **Unit Toggling**: Seamless live conversion between Imperial (`in`, 0.25" steps) and Metric (`cm`, 0.5cm steps).

### 3.5 Snapshots, Version History & Fitting Trials
- **Snapshot Storage**: Saved in `yh_measurement_snapshots` with version numbering (`v1.0`, `v2.0`, `v3.0`), timestamp, customer association, fit preference, and full POM data map.
- **Interactive Version Inspection**: Allows inspecting historical measurements and restoring any past baseline back into the cutting workbench (`Load vX.X into Cutting Workbench`).
- **Fitting Trial Delta Matrix**:
  - Tracks Original, Trial 1, Trial 2, Δ1, and Δ2 across all POMs.
  - Status indicators: `Perfect` (Δ=0), `Tolerance` (|Δ| ≤ 0.25"), `Alteration` (|Δ| > 0.25").

### 3.6 Printable Measurement Chart with Print CSS Isolation
- Rendered via `<MeasurementCard>` with strict print isolation:
  ```css
  @media print {
    body * { visibility: hidden !important; }
    .measurement-card-print, .measurement-card-print * { visibility: visible !important; }
    .measurement-card-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; }
  }
  ```
- Contains client name, date, garment type, fit preference, dotted POM breakdown, master cutter notes, signature line, and dual SVG QR/Barcode identifiers.

---

## 4. R4 Deep-Dive: Karigar Workshop Production Board & SAM Efficiency Ledger

### 4.1 Mobile-Responsive 5-Stage Kanban Workflow
- **Production Stages**:
  1. `Fabric Inspection` (Slate accent, 20% base progress)
  2. `Master Cutting` (Gold accent, 40% progress)
  3. `Zardozi/Aari Embroidery` (Amber accent, 60% progress)
  4. `Stitching Assembly` (Blue accent, 80% progress)
  5. `QC & Ready for Delivery` (Emerald accent, 100% progress)
- **Interaction Paradigms**:
  - **HTML5 Drag-and-Drop**: Supports native dragging (`onDragStart`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`) with single-stage validation guard.
  - **Step Arrows**: Quick `←` and `→` buttons for rapid floor movements.
  - **Responsive Layout**: Adapts from 1-column on mobile phones to 2-column on tablets to 5-column grid on desktop monitors.

### 4.2 Standard Allowed Minutes (SAM) Calculation Engine
- Defined in `apps/web/src/lib/sam-calculator.ts` (`calculateGarmentSam`):
  - **Base SAM**: Suit (240m), Sherwani (210m), Shirt (60m), Trouser (90m), Blouse (120m), Lehenga (300m), Anarkali (270m), Corset (180m), Gown (240m).
  - **Posture Modifiers**: Sloped shoulders (+15m), Very sloped (+25m), Stooped back (+20m), Prominent blade (+20m), Prominent abdomen (+25m), High hip (+15m), Sway back (+20m).
  - **Customization Surcharges**:
    - Flare Kalis: 12–16 panels (+30m), >16 panels (+60m)
    - Embroidery: Light (+45m), Medium (+120m), Heavy (+240m)
    - Full Canvas Construction (+30m)
    - Custom Silk Lining (+30m)
    - Fitting Trial Alteration Runs (+45m per trial)

### 4.3 Artisan Timesheets & Piece-Rate Earnings Ledger
- **Dedicated Timesheets Tab** (`production/page.tsx:988–1336`):
  - Live metric widgets: Monthly logged hours, accrued piece-rate payout (rated at ₹42/minute), and logged entry counts.
  - **Calendar Month View**: Visual 7-day calendar matrix displaying daily SAM totals and per-artisan contribution chips.
  - **Audit List Table**: Detailed chronological log containing Date, Artisan, Job Card Ref, Garment, Task Description, SAM Minutes, Earned Amount (₹), and Payout Status (`Logged` | `Disbursed`).
  - **Filters & Export**: Period filter (Fiscal Year, Month, Specific Date, Karigar Filter) and CSV Export button.

### 4.4 Barcode Scanner, Logistics & Storage Tracking
- **Job Card Logistics Drawer**:
  - Assigned storage rack input (`Rack A-12, Hanger 4`).
  - Dynamic Barcode and QR code rendering toggles with scannable SVG representations.
  - Activity timeline tracking job history and timestamps.
- **Delivery Note & Receipt Generation**:
  - Modal with isolated print CSS (`#delivery-note-content`).
  - Scannable order token, garment specifications, tailoring notes, and artisan verification signature line.

---

## 5. Architectural & Implementation Assessment

### 5.1 Verification Checklist Matrix

| Requirement | Implementation Component | Status | Verification Detail |
|---|---|---|---|
| **R2: Customer Intake** | `orders/page.tsx:2265` | ✅ Complete | Dynamic `yh_customers` list, quick-add modal with gender, fit, VIP status. |
| **R2: Fabric / Trim Selection** | `orders/page.tsx:215, 1590` | ✅ Complete | 12 garment presets, yield calculations, preset swatches, custom photo upload. |
| **R2: Customer Fabric Option** | `orders/page.tsx:1508` | ✅ Complete | `isCustomerFabric` checkbox, auto `CUST-FAB-` SKU generator, distinct visual badge. |
| **R2: Accessory BOM** | `orders/page.tsx:403, 1712` | ✅ Complete | Dynamic BOM generator (thread, zipper, button, canvas, latkan, cancan), customer-supplied toggles. |
| **R2: Barcodes & QR Codes** | `id-codes.tsx`, `print-layouts.tsx` | ✅ Complete | SVG `QRCodeSVG` and `BarcodeSVG` embedded in receipts, job cards, tech packs, BOM orders. |
| **R2: Fitting Stage Transitions** | `orders/page.tsx:637, 778` | ✅ Complete | `getValidNextStatuses` validation, syncs to `yh_production_jobs` via `syncOrderToJobsStorage`. |
| **R3: 2D Silhouette Studio** | `measurements/page.tsx:159` | ✅ Complete | 420x840 SVG canvas, front/back views, zoom controls (80–135%), HUD layer toggles. |
| **R3: Posture Morphs** | `measurements/page.tsx:189` | ✅ Complete | Shoulder slope (±8px), chest stance (Forward/Barrel), spine curvature, heel height offset. |
| **R3: Garment Caliper Ribbons** | `measurements/page.tsx:481, 625` | ✅ Complete | 6 garment silhouettes (Sherwani, Suit, Blouse, Lehenga, Anarkali, Corset) with dimension calipers. |
| **R3: Snapshots & History** | `measurements/page.tsx:961, 1448` | ✅ Complete | Snapshot autosave in `yh_measurement_snapshots`, version inspection, restore baseline action. |
| **R3: Fitting Trial Deltas** | `measurements/page.tsx:1613` | ✅ Complete | Original vs Trial 1 vs Trial 2 delta comparison table with tolerance status badges. |
| **R3: Measurement Print** | `measurements/page.tsx:1692` | ✅ Complete | `<MeasurementCard>` with isolated `@media print` CSS rules. |
| **R4: Karigar Kanban Board** | `production/page.tsx:829` | ✅ Complete | 5 stages, HTML5 drag-and-drop, step arrows, mobile responsive grid. |
| **R4: SAM Tracking** | `sam-calculator.ts`, `production/page.tsx:498` | ✅ Complete | Base SAM by garment, posture modifiers, panel/embroidery/canvas surcharges, live progress bars. |
| **R4: Piece-Rate Ledger** | `production/page.tsx:988` | ✅ Complete | ₹42/min rate, Calendar & Table view modes, CSV export, filter by month/date/karigar. |
| **R4: Stage Timers & Logistics** | `production/page.tsx:1587` | ✅ Complete | Storage rack assignment, barcode/QR toggles, audit history timeline, print delivery note. |

---

## 6. Recommendations & Minor Polish Points for Future Roadmap

1. **Active Timer Persistence**:
   - The stage elapsed SAM tracking is currently calculated via discrete logged minutes per job. Adding an optional live stopwatch timer for artisans on mobile tablet screens could further enhance floor automation.
2. **RFID Reader Webhook**:
   - The rack assignment (`rack`) and barcode/QR toggles support visual camera/handheld scanners. Adding a dedicated webhook listener or USB HID input listener for industrial handheld Bluetooth barcode guns would streamline warehouse scanning.
3. **Cross-Tab BroadcastChannel**:
   - The system uses `localStorage` with dynamic listeners. Adding a lightweight `BroadcastChannel('yh_state_channel')` can guarantee zero-latency cross-tab synchronization in multi-monitor studio setups.

---

## 7. Conclusion

The survey confirms that **R2 (Order Lifecycle & BOM Integration)**, **R3 (2D CAD Vector Workbench & Mannequin Studio)**, and **R4 (Karigar Workshop Production Board & SAM Efficiency Ledger)** are fully implemented, architecturally robust, strictly type-safe, and thoroughly verified with 2016 passing tests. All UI interactions, vector graphics, print isolation stylesheets, and data synchronization routines operate with production-grade reliability.
