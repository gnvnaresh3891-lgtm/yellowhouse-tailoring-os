# E2E Test Infra: YellowHouse Tailoring OS

## Test Philosophy
- Requirement-driven unit, integration, stress, and visual vector verification for the entire YellowHouse Tailoring OS monorepo.
- Systematic 4-tier coverage methodology (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, Real-World Fitting & Production Workloads).

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | RBAC 7 Roles & Admin Security Hardening | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Onboarding Funnel & Session Cleanup | R5 | 5 | 5 | ✓ | ✓ |
| 3 | Public Landing Page 4 Atelier Personas | R5 | 5 | 5 | ✓ | ✓ |
| 4 | Client Intake & Profiling | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Fabric SKU Generation (CUST-FAB-) | R2 | 5 | 5 | ✓ | ✓ |
| 6 | 12-Garment Dynamic BOM & Deductions | R2 | 5 | 5 | ✓ | ✓ |
| 7 | Pure SVG QR & Code-128 Barcodes & Print CSS | R2 | 5 | 5 | ✓ | ✓ |
| 8 | 8-Stage Order & Fitting Trial Lifecycle | R2 | 5 | 5 | ✓ | ✓ |
| 9 | 2D CAD Mannequin Viewport (420x840) & Zoom | R3 | 5 | 5 | ✓ | ✓ |
| 10 | 6 Garment Drape Overlays & 4-Axis Morphs | R3 | 5 | 5 | ✓ | ✓ |
| 11 | Caliper Ribbons, Snapshots & 3-Way Deltas | R3 | 5 | 5 | ✓ | ✓ |
| 12 | 5-Stage Kanban Floor & Single-Stage Check | R4 | 5 | 5 | ✓ | ✓ |
| 13 | Dynamic SAM Calculation Engine | R4 | 5 | 5 | ✓ | ✓ |
| 14 | Piece-Rate Timesheet Ledger (₹42/min) | R4 | 5 | 5 | ✓ | ✓ |
| 15 | Rack Logistics & Delivery Note Generation | R4 | 5 | 5 | ✓ | ✓ |

## Test Runner Setup
- Web Test Runner: `npm test` in `apps/web` (executes `src/__tests__/run-tests.ts` over 26 suites with 64,840+ assertions).
- API Test Runner: `npm test` in `apps/api` (executes NestJS/Jest test suites).
- Type Safety: `npx tsc --noEmit` across both workspaces.
- Production Build Validation: `npm run build` across workspaces (compiles 26 static pages).

## Tiered Coverage Thresholds
- Tier 1: Feature Coverage (>=5 tests per feature = >=75 tests).
- Tier 2: Boundary & Corner Cases (empty storage, invalid passkeys, extreme girths, negative/zero inputs, missing trims).
- Tier 3: Cross-Feature Combinations (RBAC + route guard + storage sync + posture morph + BOM calculation).
- Tier 4: Real-World Application Workloads (complete walk-in client -> 2D CAD measurement -> 12-garment BOM -> 5-stage Kanban floor -> ₹42/min timesheet ledger -> delivery note & print).
