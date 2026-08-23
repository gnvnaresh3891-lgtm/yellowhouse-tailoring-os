# Milestone 3 Technical Analysis: HTML5 Drag-and-Drop Kanban Board & Bidirectional Order Status Sync

## Executive Summary
This report presents a comprehensive investigation of Milestone 3 requirements for YellowHouse Tailoring OS, focusing on the HTML5 Drag-and-Drop Kanban Production Board (`apps/web/src/app/(dashboard)/production/page.tsx`), the Order Management Page (`apps/web/src/app/(dashboard)/orders/page.tsx`), safe state persistence via `storage-utils.ts`, and the automated test suite strategy in `apps/web/src/__tests__/state-sync.test.ts`.

---

## 1. HTML5 Drag-and-Drop & Stage Movement Controls Investigation

### 1.1 Current State Analysis (`production/page.tsx`)
- **Stage Definitions**:
  The workshop board uses 5 distinct Kanban stages defined in `KanbanStage`:
  1. `Fabric Inspection` (Column 1 - 2 initial cards)
  2. `Master Cutting` (Column 2 - 3 initial cards)
  3. `Zardozi/Aari Embroidery` (Column 3 - 2 initial cards)
  4. `Stitching Assembly` (Column 4 - 4 initial cards)
  5. `QC & Ready for Delivery` (Column 5 - 3 initial cards)
- **Current Movement Buttons**:
  - Hovering over a job card reveals sequential movement buttons `←` and `→` which invoke `moveStage(job.id, 'prev')` and `moveStage(job.id, 'next')`.
  - The card detail modal (`selectedCardModal`) provides `← Previous Stage` and `Next Stage →` buttons calling `moveStage`.
- **Identified Gaps**:
  1. **HTML5 Drag-and-Drop Event Handlers Missing**: The JSX elements for job cards (`<div className="glass-card...">`) and columns (`<div className="kanban-column...">`) lack native HTML5 drag-and-drop attributes (`draggable={true}`, `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`).
  2. **Direct Stage Dropdown Missing**: Cards and modal views lack an explicit `<select>` dropdown to allow single-click non-sequential stage jumping (e.g. jumping directly from `Fabric Inspection` to `Stitching Assembly`).

### 1.2 Required HTML5 Drag-and-Drop Implementation Plan
To implement full drag-and-drop capability:
- **Card Draggable Attributes**:
  ```tsx
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('text/plain', job.id);
      e.dataTransfer.effectAllowed = 'move';
      setDraggedJobId(job.id);
    }}
    onDragEnd={() => setDraggedJobId(null)}
    ...
  >
  ```
- **Column Drop Zone Attributes**:
  ```tsx
  <div
    onDragOver={(e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }}
    onDragEnter={(e) => {
      e.preventDefault();
      setDragOverStage(stage);
    }}
    onDragLeave={() => setDragOverStage(null)}
    onDrop={(e) => {
      e.preventDefault();
      const jobId = e.dataTransfer.getData('text/plain');
      if (jobId) {
        moveJobToTargetStage(jobId, stage);
      }
      setDragOverStage(null);
    }}
    className={`kanban-column ... ${dragOverStage === stage ? 'border-yellow-400 bg-yellow-500/5' : ''}`}
  >
  ```
- **Direct Stage Dropdown Component**:
  Add an explicit stage dropdown within the card detail modal and card action toolbar:
  ```tsx
  <select
    value={job.stage}
    onChange={(e) => updateJobStage(job.id, e.target.value as KanbanStage)}
    className="input-dark py-1 px-2 text-xs"
  >
    {stages.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
  ```

---

## 2. Bidirectional Order Status Sync Logic Investigation

### 2.1 Current Sync Mechanics
- **Kanban-to-Order Direction (`yh_production_jobs` → `yh_orders`)**:
  - Currently implemented inside `moveStage` in `production/page.tsx`:
    - Cleaned order ID comparison: `orderId.replace('JC-', '').replace('#YH-', '')`.
    - Stage mapping logic:
      - `Fabric Inspection` → `CONFIRMED`
      - `Master Cutting` → `CUTTING`
      - `Zardozi/Aari Embroidery` / `Stitching Assembly` → `IN_PRODUCTION`
      - `QC & Ready for Delivery` → `READY_FOR_DELIVERY`
- **Order-to-Kanban Direction (`yh_orders` → `yh_production_jobs`)**:
  - **Currently Missing**: In `orders/page.tsx`, when an order is created, a job card is auto-generated (`handleSaveOrder`), but when an existing order's status is updated, there is no sync back to `yh_production_jobs`.
  - Furthermore, `orders/page.tsx` lacks an interactive status selector dropdown in the active orders table or detail drawer to update existing order statuses.

### 2.2 Canonical Mapping Table
To ensure seamless 2-way data flow, the system must enforce a single canonical mapping between `KanbanStage` and `OrderStatus`:

| Workshop Kanban Stage (`yh_production_jobs`) | Corresponding Order Status (`yh_orders`) | Progress % Default |
|---|---|---|
| `Fabric Inspection` | `CONFIRMED` | 15% |
| `Master Cutting` | `CUTTING` | 35% |
| `Zardozi/Aari Embroidery` | `IN_PRODUCTION` | 60% |
| `Stitching Assembly` | `IN_PRODUCTION` | 80% |
| `QC & Ready for Delivery` | `READY_FOR_DELIVERY` | 100% |

### 2.3 Shared Sync Utility Recommendation (`src/lib/state-sync-utils.ts`)
To prevent duplicate mapping code across pages and ensure robust storage operations:
1. `cleanOrderId(id: string): string` — Strips `#YH-`, `JC-`, and leading whitespace.
2. `syncProductionJobToOrder(job: JobCardItem): void` — Reads `yh_orders`, updates matching order status, writes back to `yh_orders`.
3. `syncOrderToProductionJob(order: Order): void` — Reads `yh_production_jobs`, updates or auto-creates matching job card stage and progress, writes back to `yh_production_jobs`.

---

## 3. Unit & Integration Test Strategy (`apps/web/src/__tests__/state-sync.test.ts`)

### 3.1 Test Architecture
Following the pattern established in `storage-utils.test.ts` and `m2-stress.test.ts`, the new test file `state-sync.test.ts` will export a `runStateSyncTests()` function that can be executed synchronously or as part of the `run-tests.ts` runner via `npm test`.

### 3.2 Test Suite Breakdown

1. **Suite 1: Kanban Stage to Order Status Sync**
   - Verify moving a job from `Fabric Inspection` to `Master Cutting` updates matching order status in `yh_orders` to `CUTTING`.
   - Verify moving a job to `QC & Ready for Delivery` updates order status to `READY_FOR_DELIVERY`.
   - Verify ID normalization (`JC-9021` vs `#YH-9021`).

2. **Suite 2: Order Status to Kanban Stage Sync**
   - Verify updating an order status from `CONFIRMED` to `CUTTING` in `yh_orders` updates matching job card stage in `yh_production_jobs` to `Master Cutting`.
   - Verify updating order status to `READY_FOR_DELIVERY` updates job card stage to `QC & Ready for Delivery` and progress to 100%.

3. **Suite 3: Auto-Creation & Edge Case Fallbacks**
   - Verify creating a new order with `CONFIRMED` status auto-spawns a new job card in `yh_production_jobs`.
   - Verify sync functions operate safely when `yh_orders` or `yh_production_jobs` are empty arrays, `null`, or corrupted JSON strings.

4. **Suite 4: Bidirectional Cycle & Idempotency**
   - Verify running `syncProductionJobToOrder` followed by `syncOrderToProductionJob` produces stable, non-mutating state.

---

## 4. Proposed Code Modifications Overview

1. **`apps/web/src/lib/state-sync-utils.ts`** (New File):
   Implement helper functions: `mapStageToOrderStatus`, `mapOrderStatusToStage`, `syncJobToOrdersStorage`, `syncOrderToJobsStorage`.
2. **`apps/web/src/app/(dashboard)/production/page.tsx`**:
   Add native HTML5 drag-and-drop attributes (`draggable`, `onDragStart`, `onDragOver`, `onDrop`), stage dropdown selector in card detail modal, and integrate `syncJobToOrdersStorage`.
3. **`apps/web/src/app/(dashboard)/orders/page.tsx`**:
   Add status update dropdown in order table/modal, and invoke `syncOrderToJobsStorage` on status change.
4. **`apps/web/src/__tests__/state-sync.test.ts`** (New File):
   Implement complete unit and integration test suite for bidirectional state synchronization.
5. **`apps/web/src/__tests__/run-tests.ts`**:
   Import and run `runStateSyncTests()` in the test suite pipeline.
