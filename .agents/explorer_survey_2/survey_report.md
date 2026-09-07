# R2 Investigation & Survey Report: End-to-End Order Lifecycle & Dynamic BOM Refinement

**Project**: YellowHouse Tailoring OS  
**Milestone / Requirement**: R2 — End-to-End Order Lifecycle, Dynamic BOM, Pure SVG QR/Barcode & Print Styling  
**Date**: 2026-09-02  
**Investigator**: Explorer 2 (Teamwork Explorer)  

---

## 1. Executive Summary

An exhaustive codebase investigation across `apps/web` and `apps/api` was conducted to audit and verify all components, algorithms, data structures, and styling relating to **Requirement R2 (End-to-End Order Lifecycle & Dynamic BOM Refinement)**. 

### Key Findings:
1. **Order Intake & Client Profiling**: 
   - Robust multi-step order intake workflow implemented in `apps/web/src/app/(dashboard)/orders/page.tsx` with instant customer profiling via `isQuickAddCustomerOpen` modal, automatic `CUST-` identifier generation, and dynamic synchronization with `yh_customers`.
   - Dynamic draft autosave to `yh_orders_draft` preserves all inputs across route transitions and page refreshes.
   - Fabric SKU generation distinguishes atelier-stocked inventory (e.g., `SKU-SHER-901`, `SKU-LHG-509`, `SKU-BLS-112`) from customer-provided textiles (`CUST-FAB-` timestamped base-36 unique hash).
   - Delivery scheduling defaults to a 14-day lead time with formatted dates and urgent rush flags.
2. **Dynamic Bill of Materials (BOM)**:
   - Full support for **12 distinct luxury bespoke garments** (Blouse, Corset, Shirt, Trouser, 2-Piece Suit, 3-Piece Suit, Sherwani, Bandhgala, Kurta, Lehenga, Anarkali, and Gown).
   - Garment-specific BOM accessory generation auto-populates mandatory and optional trims (threads, YKK metal zippers, horn buttons, gold zari piping, horsehair chest canvas, cancan netting, latkan tassels, padded cups, dori hooks).
   - Dedicated client-supplied trim and fabric handling (`isCustomerProvided`, `isCustomerFabric`) ensures customer-supplied items are excluded from chargeable BOM line items while accurately tracking workshop inventory.
   - Integrated calculation engines: Size-scaled Fabric Yield Engine (`calculateFabricYield`), dynamic Standard Allowed Minutes (`calculateGarmentSam`), bespoke pricing combining ₹42/min artisan rates, ₹750/axis posture surcharges, tiered embroidery fees (₹0–₹28,000), +20% rush surcharges, and exact 50% advance/balance splits.
3. **Pure SVG Vector QR & Barcodes**:
   - Zero-dependency vector generators in `apps/web/src/components/id-codes.tsx` (`QRCodeSVG` 15x15 matrix with 3 invariant finder patterns, and `BarcodeSVG` linear Code-128 bar sequence with start `[2, 1, 1, 2]` and stop `[2, 1, 2, 1]` patterns).
   - Integrated into all 8 printable documents (`OrderReceipt`, `JobCardPrint`, `MeasurementCard`, `CustomerListPrint`, `ScheduleListPrint`, `TechPackSpecPrint`, `MaterialBOMPrint`, `MachineReservationTicketPrint`) and the in-page Delivery Note modal.
4. **Isolated `@media print` Styling**:
   - Clean print styling configured globally in `apps/web/src/app/globals.css` and modularly in `print-layouts.tsx` and `orders/page.tsx`.
   - UI chrome (`aside`, `header`, `.no-print`) is strictly suppressed (`display: none !important`), backgrounds reset to white, text to crisp black, and margin/padding cleared.

---

## 2. Architecture & Code Layout for R2

```
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css                        # @media print rules & chrome suppression
│   │   │   └── (dashboard)/
│   │   │       ├── orders/page.tsx                # Full Order Intake, BOM Editor, Lifecycle, Print Modal
│   │   │       └── measurements/page.tsx          # Fitting Trial Deltas, Snapshots, CAD Mannequin
│   │   ├── components/
│   │   │   ├── id-codes.tsx                       # Pure SVG QRCodeSVG & BarcodeSVG components
│   │   │   ├── print-layouts.tsx                  # OrderReceipt, JobCardPrint, MeasurementCard, BOMPrint, etc.
│   │   │   ├── toast-context.tsx                  # Toast feedback notifications
│   │   │   └── confirm-dialog.tsx                 # Deletion & action confirmations
│   │   ├── lib/
│   │   │   ├── fabric-yield.ts                    # Size-scaled fabric yield calculation
│   │   │   ├── pricing-calculator.ts              # Dynamic Bespoke Pricing calculation engine
│   │   │   ├── sam-calculator.ts                  # Standard Allowed Minutes (SAM) engine
│   │   │   ├── state-sync-utils.ts                # Bidirectional sync (yh_orders <-> yh_production_jobs)
│   │   │   ├── storage-utils.ts                   # Resilient localStorage read/write helpers
│   │   │   └── pom-schemas.ts                     # Points of Measure definitions for 9 categories
│   │   ├── types/
│   │   │   ├── measurement.ts                     # GarmentCategory, PostureProfile, FittingTrialDeltaItem
│   │   │   └── ecosystem.ts                       # Printable records & orders schemas
│   │   └── __tests__/
│   │       ├── m2-order-bom-lifecycle.test.ts     # Core M2/R2 lifecycle, BOM, QR/barcode unit tests
│   │       ├── preview-challenger-m2-deep-stress.test.ts # Deep stress test for BOM, pricing, transitions
│   │       ├── m2-preview-challenger-print-svg.test.ts   # SVG QR/barcode invariants & print CSS tests
│   │       ├── pricing-calculator.test.ts         # Pricing math verification
│   │       └── state-sync.test.ts                 # Order-to-Kanban bidirectional sync tests
└── api/
    └── src/
        └── modules/
            └── measurements/
                ├── measurements.service.ts        # API implementation of POM ease & yield engines
                └── measurements.controller.ts     # REST endpoints for ease and yield calculations
```

---

## 3. Deep Dive: Order Intake & Lifecycle Management

### 3.1 Client Profiling & Quick Add Workflow
- **File**: `apps/web/src/app/(dashboard)/orders/page.tsx` (Lines 204–213, 274–285, 685–744, 2265–2407)
- **Mechanism**:
  - `activeCustomers` loads dynamically from `yh_customers` with a robust fallback to 8 seed patrons (`customerList`).
  - The `QuickAddCustomer` modal (`isQuickAddCustomerOpen`) allows receptionist/tailor to register a walk-in patron in-line without leaving the order draft.
  - Inputs collected: Name, Phone, Email, Gender (`Men` | `Women`), Preferred Fit (`Slim Bespoke`, `Regular Tailored`, `Relaxed Royal`, `Comfort Traditional`), VIP status flag, and special fitting notes.
  - Automatically generates `CUST-XXX` ID, calculates 2-letter monogram initials, logs creation to activity history via `logActivity`, stores to `yh_customers`, and auto-selects the new client in the active order draft.

### 3.2 POM Measurement Linking
- **Files**: `apps/web/src/app/(dashboard)/measurements/page.tsx` (Lines 1448–1609), `apps/web/src/lib/storage-utils.ts`
- **Mechanism**:
  - Saved measurements in `yh_measurements_current` and historical snapshots in `yh_measurement_snapshots` link to clients via `customerId` and `customerName`.
  - In `orders/page.tsx` (Lines 815, 840), each order records `customerId`, `clientName`, and `clientPhone`, ensuring full traceability back to the CAD measurement card and posture profile.

### 3.3 Fabric SKU Generation & Client Fabric Tagging
- **File**: `apps/web/src/app/(dashboard)/orders/page.tsx` (Lines 1501–1530)
- **Implementation**:
  - Checkbox `isCustomerFabric` flags client-supplied yardage.
  - When checked, if the SKU does not already start with `CUST-FAB-`, it automatically generates:
    ```typescript
    `CUST-FAB-${Date.now().toString(36).toUpperCase()}`
    ```
  - Standard catalog fabrics use preset prefixes:
    - `SKU-BLS-112` (Blouse)
    - `SKU-CST-201` (Corset)
    - `SKU-SHRT-101` (Shirt)
    - `SKU-TRS-102` (Trouser)
    - `SKU-SUIT-2PC` / `SKU-SUIT-3PC` (Suits)
    - `SKU-SHER-901` (Sherwani)
    - `SKU-BDG-401` (Bandhgala)
    - `SKU-KRT-302` (Kurta)
    - `SKU-LHG-509` (Lehenga)
    - `SKU-ANK-440` (Anarkali)
    - `SKU-GWN-710` (Gown)
  - Custom fabric swatch photos and lining photos can be uploaded via `FileReader` as base64 data URLs or selected from curated presets (Lines 1590–1698).

### 3.4 Delivery Scheduling & Rush Priorities
- **File**: `apps/web/src/app/(dashboard)/orders/page.tsx` (Lines 287–291, 652–667, 799)
- **Mechanism**:
  - Defaults to `today + 14 days` formatted as `YYYY-MM-DD`.
  - Formats to display strings like `Aug 15`, `Sep 10` using `formatDueDate`.
  - Rush orders (`isUrgent: true`) display a vibrant rose badge (`URGENT`) and automatically trigger a +20% rush labor/embroidery surcharge in `pricing-calculator.ts`.

### 3.5 Fitting Trial Stages & Status Reactivity
- **File**: `apps/web/src/app/(dashboard)/orders/page.tsx` (Lines 45–54, 637–650, 778–794), `apps/web/src/lib/state-sync-utils.ts`
- **State Transition Machine**:
  ```
  DRAFT ────────► CONFIRMED ────────► CUTTING ────────► IN_PRODUCTION
    │                │                 │                   │
    ▼                ▼                 ▼                   ▼
  CANCELLED       CANCELLED         CANCELLED          TRIAL_FITTING
                                                           │
                                                           ▼
  DELIVERED ◄─── READY_FOR_DELIVERY ◄─────────────── QC_CHECK / TRIAL_FITTING
  ```
- **Bidirectional State Sync**:
  - Changing an order's status triggers `syncOrderToJobsStorage(updatedOrder)`.
  - Maps `CONFIRMED` -> `Fabric Inspection`, `CUTTING` -> `Master Cutting`, `IN_PRODUCTION` -> `Assembly Stitching`, `TRIAL_FITTING` -> `Trial Fitting 1`, `QC_CHECK` -> `QC & Ready for Delivery`, `DELIVERED` -> `QC & Ready for Delivery (100% progress)`.
  - Synchronizes back from the Karigar Kanban floor (`yh_production_jobs`) to `yh_orders` via `syncJobToOrdersStorage`.

### 3.6 Fitting Trial Delta Tracking
- **File**: `apps/web/src/app/(dashboard)/measurements/page.tsx` (Lines 144–151, 1613–1689), `apps/web/src/types/measurement.ts` (Lines 109–126)
- **Mechanism**:
  - Compares original target garment measurement against **First Fitting (Trial 1)** and **Second Trial (Trial 2)**.
  - Computes exact alteration deltas ($\Delta 1 = \text{Trial 1} - \text{Original}$, $\Delta 2 = \text{Trial 2} - \text{Original}$).
  - Classifies tolerance:
    - $\Delta = 0.00''$: **Perfect** (`badge-emerald`)
    - $|\Delta| \le 0.25''$: **Tolerance / Minor** (`badge-amber`)
    - $|\Delta| > 0.25''$: **Alteration Required** (`badge-rose`)

---

## 4. Deep Dive: Dynamic Bill of Materials (BOM)

### 4.1 The 12 Garment Presets Matrix

| # | Garment Type | SKU Prefix | Default Meters | Default Price | Bolt Width | Default Buffer Note |
|---|--------------|------------|----------------|---------------|------------|---------------------|
| 1 | Saree Blouse (Single) | `SKU-BLS-112` | 1.0m | ₹3,500 | 44" | 1.0m (up to 42" bust) + 0.8m lining |
| 2 | Corset Blouse / Bustier | `SKU-CST-201` | 1.2m | ₹6,500 | 44" | 1.2m + fused interlining |
| 3 | Bespoke Shirt (Full Sleeve) | `SKU-SHRT-101` | 2.2m | ₹2,800 | 44" | 2.2m (44" width) or 1.6m (58" width) |
| 4 | Bespoke Trouser / Pants | `SKU-TRS-102` | 1.4m | ₹3,200 | 58" | 1.4m (58" width) or 2.2m (44" width) |
| 5 | 2-Piece Suit (Jacket + Trouser) | `SKU-SUIT-2PC` | 3.2m | ₹28,000 | 58" | 3.2m (58" width wool/linen) |
| 6 | 3-Piece Suit (Jacket + Vest + Trouser) | `SKU-SUIT-3PC` | 4.0m | ₹38,000 | 58" | 4.0m (58" width) + 3.0m satin lining |
| 7 | Sherwani + Churidar | `SKU-SHER-901` | 4.5m | ₹32,000 | 44" | 4.5m brocade/raw silk + 2.5m churidar |
| 8 | Bandhgala / Jodhpuri Suit | `SKU-BDG-401` | 3.5m | ₹24,000 | 58" | 3.5m (58" width) |
| 9 | Kurta Pyjama Set | `SKU-KRT-302` | 3.8m | ₹7,500 | 44" | 2.4m Kurta + 2.2m Pyjama/Salwar |
| 10 | Bridal Lehenga (16-24 Kali Flare) | `SKU-LHG-509` | 5.5m | ₹65,000 | 44" | 5.5m main silk + 4.5m lining + 4m cancan |
| 11 | Anarkali Gown / Floor Length Suit | `SKU-ANK-440` | 5.0m | ₹26,000 | 44" | 5.0m flare georgette + 4.0m crepe lining |
| 12 | Evening Haute Couture Gown | `SKU-GWN-710` | 4.8m | ₹35,000 | 58" | 4.8m (58" satin/crepe) + 1.2m train |

### 4.2 Intelligent BOM Generation Rules (`getDefaultBOMForGarment`)
- **File**: `apps/web/src/app/(dashboard)/orders/page.tsx` (Lines 403–532)
- **Trim Provisions**:
  - **Universal Base**: Matching Spun Poly / Silk Thread Spools (2 spools @ ₹60).
  - **Sherwani / Bandhgala / Kurta**:
    - Gold Plated / Antique Metal Kurta Buttons (7 pcs @ ₹80, Mandatory)
    - Horsehair Canvas Chest Piece Reinforcement (1.5m @ ₹350, Optional)
    - Gold Zari Border Piping Trim (3.5m @ ₹90, Optional)
  - **Lehenga / Gown / Anarkali**:
    - Cancan Mesh Netting for Flare Volume (4.0m @ ₹110, Optional)
    - Heavy Zari Waistband Latkan Tassels (2 pcs @ ₹220, Optional)
    - Concealed Side Zipper (18 inch) (1 pc @ ₹65, Mandatory)
  - **Blouse / Corset / Choli**:
    - Heavy Duty Side Invisible Zipper (12 inch) (1 pc @ ₹55, Mandatory)
    - Back Eyelet / Braided Dori Hooks & Loops (8 pairs @ ₹15, Optional)
    - Padded Cup Inserts & Boning Strips (1 pair @ ₹180, Optional)
  - **Trouser / Suit / Churidar**:
    - YKK Concealed Metal Trouser Zipper (7 inch) (1 pc @ ₹45, Mandatory)
    - Waistband Canvas Stiffener (Interlining) (1.2m @ ₹120, Optional)
    - Horn / Resin Jacket Buttons (Set of 6) (1 set @ ₹250, Optional)

### 4.3 Client-Supplied Materials Handling
- Users can toggle `isCustomerProvided` on individual BOM items (e.g. client brought heirloom antique buttons or custom latkans).
- Items marked as `isCustomerProvided` display a green `CLIENT GIVEN` badge and are omitted from atelier chargeable material costs while remaining visible in the cutting ticket.

### 4.4 Price Breakdown & Calculation Engines

1. **Size-Scaled Fabric Yield**:
   $$\text{scaledMeters} = \text{baseYield} \times K_{\text{scale}} \times F_{\text{width}} \times M_{\text{panel}}$$
   $$\text{requiredMeters} = \text{scaledMeters} + \text{patternAllowance} + \text{shrinkageAllowance}$$
   - $F_{\text{width}} = 44 / \text{boltWidth}$ (e.g. 58" bolt reduces meterage by $\approx 24\%$).
   - $K_{\text{scale}} = 0.6 \times (L / L_{\text{ref}}) + 0.4 \times (G / G_{\text{ref}})$.
   - $M_{\text{panel}} = 1.45$ for 24 kalis, $1.20$ for 16 kalis.
2. **Dynamic SAM (Standard Allowed Minutes)**:
   $$\text{totalSAM} = \text{baseSAM} + \text{postureSAM} + \text{customizationSAM}$$
   - Base SAM: Suit 240m, Sherwani 210m, Lehenga 300m, Anarkali 270m, Corset 180m, Blouse 120m, Shirt 60m, Trouser 90m.
   - Posture SAM: Up to +25m per non-normal axis.
   - Customizations: Full canvas (+30m), Custom silk lining (+30m), 16+ kalis (+60m), Fitting trial adjustment (+45m per trial).
   - Embroidery SAM: Light (+45m), Medium (+120m), Heavy (+240m).
3. **Base Labor Cost**:
   $$\text{baseLaborCost} = \text{totalSAM} \times ₹42/\text{min}$$
4. **Surcharges**:
   - Posture Surcharge: $N_{\text{non-normal axes}} \times ₹750$.
   - Embroidery: None ₹0, Light ₹3,500, Medium ₹12,000, Heavy ₹28,000.
   - Rush Order: $+20\% \times (\text{baseLaborCost} + \text{embroiderySurcharge})$.
5. **Deposit Split**:
   - Advance: $\text{round}(\text{totalGarmentPrice} \times 0.50)$.
   - Balance Due: $\text{totalGarmentPrice} - \text{advance}$ (Zero 1-rupee rounding leakage on odd amounts).

---

## 5. Deep Dive: Pure SVG QR & Barcodes and Print Styling

### 5.1 Pure Vector SVG QR & Barcode Components
- **File**: `apps/web/src/components/id-codes.tsx`
- **`QRCodeSVG`**:
  - Renders a 15x15 pure vector `<svg>` grid with crisp sub-pixel rendering (`shape-rendering-crisp`).
  - Encodes 3 fixed locator squares (Finder patterns: Top-Left, Top-Right, Bottom-Left at 5x5 dimensions) with 1-cell borders and center dots.
  - Employs a deterministic hash bit generator across arbitrary strings, URLs, and Unicode.
  - Zero external npm packages (no canvas, no image blobs, no CDN fonts).
- **`BarcodeSVG`**:
  - Generates Code-128 linear barcode `<rect>` stripes using standard start pattern `[2, 1, 1, 2]` and stop pattern `[2, 1, 2, 1]`.
  - Calculates proportional `unitWidth = width / totalUnits` guaranteeing exact SVG width bounding.
  - Includes clean uppercase monospace label underneath.

### 5.2 Document Coverage Matrix

| Document Component | File Location | Dimensions / Format | QR Code Target | Barcode Target |
|--------------------|---------------|---------------------|----------------|----------------|
| **OrderReceipt** | `print-layouts.tsx:74` | Standard A4 Max 800px | `https://yellowhouse.atelier/order/{id}` | Order ID |
| **CustomerListPrint** | `print-layouts.tsx:156` | A4 Landscape 1000px | N/A | Register Title |
| **ScheduleListPrint** | `print-layouts.tsx:213` | A4 Landscape 1000px | N/A | Production Log |
| **MeasurementCard** | `print-layouts.tsx:271` | A5 Portrait (148mm x 210mm) | `https://yellowhouse.atelier/measure/{name}` | `MEAS-{NAME}` |
| **JobCardPrint** | `print-layouts.tsx:330` | Karigar Ticket (100mm x 150mm) | `https://yellowhouse.atelier/job/{id}` | Job ID |
| **TechPackSpecPrint** | `print-layouts.tsx:388` | A4 Tech Pack 1000px | `https://yellowhouse.atelier/license/{key}` | License Key |
| **MaterialBOMPrint** | `print-layouts.tsx:500` | Sourcing Invoice 1000px | `https://yellowhouse.atelier/bom/{orderNumber}` | Order Number |
| **MachineReservationTicketPrint** | `print-layouts.tsx:594` | Access Pass 800px | `https://yellowhouse.atelier/machine/{resNum}` | Reservation Number |
| **Delivery Note Modal** | `orders/page.tsx:2175` | Modal & Print Dialog | `https://yellowhouse.atelier/track/{id}` | Order ID |

### 5.3 Isolated `@media print` CSS Architecture
- **File**: `apps/web/src/app/globals.css` (Lines 280–293)
- **Rules**:
  ```css
  @media print {
    aside, header, .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { background: white !important; color: black !important; }
    main { padding: 0 !important; }
  }
  .print-only {
    display: none;
  }
  ```
- **Modal Isolation in `orders/page.tsx`**:
  ```css
  @media print {
    body * { visibility: hidden; }
    .print-section, .print-section * { visibility: visible; }
    .print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; border: none; box-shadow: none; background: white; color: black; }
  }
  ```

---

## 6. Test Verification & Empirical Proof

### Test Suite Execution Summary
The test matrix across `apps/web` contains **26 dedicated test files** covering R1 through R5.

Specific suites verifying R2 requirements:
1. `src/__tests__/m2-order-bom-lifecycle.test.ts`:
   - 12 Luxury garment presets verification
   - Customer Fabric SKU `CUST-FAB-` prefix and timestamp hash
   - Bolt width fabric yield scaling (44" vs 58")
   - BOM generation for Suit, Blouse, Sherwani, Lehenga
   - Studio chargeable BOM calculation (excluding client-supplied trims)
   - QR 15x15 matrix finder patterns and determinism
   - Barcode start/stop patterns
   - Order stage transitions (`DRAFT` to `DELIVERED`)
   - Bidirectional job card synchronization
2. `src/__tests__/preview-challenger-m2-deep-stress.test.ts`:
   - BOM mutation isolation & fuzzing against arbitrary strings, XSS, and Unicode
   - Extreme pricing calculations (₹0 to ₹100,000/m fabric)
   - All 4 posture axes non-normal surcharge stress (₹3,000)
   - Tiered embroidery (₹0, ₹3,500, ₹12,000, ₹28,000) + +20% rush order surcharge
   - Odd-rupee 50% split zero-leakage check
   - Payment status math (UNPAID, ADVANCE_PAID, FULLY_PAID)
3. `src/__tests__/m2-preview-challenger-print-svg.test.ts`:
   - QR code empty string and 10,000+ character stress tests
   - 10,000-iteration rapid re-render determinism loop
   - Barcode width conservation and geometry bounds
   - All 8 print layout data contracts and `@media print` CSS rules
4. `src/__tests__/pricing-calculator.test.ts` & `src/__tests__/state-sync.test.ts`:
   - Verification of pricing formulas, SAM rates, and local storage state persistence.

---

## 7. Identified Gaps, Observations & Recommendations

### Verified Strengths:
1. **Complete 12-Garment Presets**: All 12 requested luxury silhouette garments are fully defined with realistic fabric yields, SKU prefixes, and default pricing.
2. **Deterministic Vector Barcodes/QR**: The pure SVG implementation avoids all external canvas dependencies, ensuring instant rendering and crisp output on thermal and standard laser printers.
3. **Robust State Sync**: Order creation and status updates seamlessly reflect on the Karigar workshop board and vice versa.
4. **Resilient LocalStorage**: `storage-utils.ts` safely catches exceptions and provides fallback data, preventing runtime crashes on empty or corrupt local storage.

### Minor Observations & Recommendations:
1. **Garment Type Option Naming Consistency**:
   - In `orders/page.tsx`, `garmentOptions` defines `value: 'Blouse'`, `'Corset'`, `'Shirt'`, `'Trouser'`, `'2-Piece Suit'`, `'3-Piece Suit'`, `'Sherwani'`, `'Bandhgala'`, `'Kurta'`, `'Lehenga'`, `'Anarkali'`, `'Gown'`.
   - In `types/measurement.ts`, `GarmentCategory` defines kebab-case names: `'mens-suit'`, `'mens-sherwani'`, `'mens-shirt'`, `'mens-trouser'`, `'womens-blouse'`, `'womens-lehenga'`, `'womens-anarkali'`, `'womens-corset'`, `'womens-gown'`.
   - `orders/page.tsx` contains mapping logic (Lines 598–608) that converts names to `GarmentCategory`. For future extensibility, adding Kurta and Bandhgala to the base `GarmentCategory` type or keeping the mapping helper centralized in `lib/` will make category conversions even cleaner.
2. **Customer Fabric Stock Check**:
   - Customer-supplied fabrics (`CUST-FAB-`) correctly omit fabric raw material cost from the price calculation. Adding a clear badge on the printed Job Ticket indicating "Customer Fabric Verified & Received" ensures Karigars double-check fabric bin tags before cutting.

---
*End of R2 Survey Report.*
