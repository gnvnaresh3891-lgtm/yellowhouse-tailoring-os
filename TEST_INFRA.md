# E2E Test Infra: Tailoring OS Measurement Engine

## Test Philosophy
- Requirement-driven unit & integration verification for Tailoring OS Measurement Engine.
- Systematic 4-tier coverage methodology (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, Real-World Fitting Workloads).

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | 9 Garment POM Schemas | R1 | 5 | 5 | ✓ | ✓ |
| 2 | 4-Axis Posture Engine | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Dynamic Ease & Fabric Yield Math | R1 | 5 | 5 | ✓ | ✓ |
| 4 | Dynamic Form Engine & Validation | R1 | 5 | 5 | ✓ | ✓ |
| 5 | Interactive 2D SVG Body Diagram | R2 | 5 | 5 | ✓ | ✓ |
| 6 | Bidirectional Landmark-to-POM Mapping | R2 | 5 | 5 | ✓ | ✓ |
| 7 | Live Color Validation Highlighting | R2 | 5 | 5 | ✓ | ✓ |
| 8 | Immutable Version Snapshotting | R3 | 5 | 5 | ✓ | ✓ |
| 9 | 3-Way Fitting Delta Tracker | R3 | 5 | 5 | ✓ | ✓ |
| 10 | Master Tailor Notes Ledger | R3 | 5 | 5 | ✓ | ✓ |

## Test Runner Setup
- Unit & Math engine tests: Vitest runner located in `apps/web/src/__tests__/` and `apps/api/src/modules/measurements/__tests__/`.
- Type Safety: `npx tsc --noEmit` across `apps/web` and `apps/api`.
- Build Validation: `npm run build` across workspaces.

## Tiered Coverage Thresholds
- Tier 1: Feature Coverage (>=5 tests per feature = >=50 tests).
- Tier 2: Boundary & Corner Cases (empty inputs, extreme girths, out-of-range proportions).
- Tier 3: Cross-Feature Combinations (posture + ease + fit preference + stretch combinations).
- Tier 4: Real-World Application Workloads (complete fitting lifecycle: client profile -> target POM snapshot -> trial fitting -> delta matrix).
