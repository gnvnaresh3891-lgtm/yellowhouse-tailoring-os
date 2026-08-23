# Original User Request

## 2026-08-07T07:46:23Z

Perform a comprehensive end-to-end audit and refinement of YellowHouse Tailoring OS. Identify and resolve any remaining bugs, improve validation rules, polish UI aesthetics, verify all routing flows, and establish unit/integration test suites.

Working directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Integrity mode: benchmark

## Requirements

### R1. Deep Source Code Audit & Warning Resolution
Scan all pages, layouts, and components for dead code, unused imports, or typescript errors. Ensure safety on local storage accesses and nested property checks.

### R2. Complete E2E Flow Auditing & Verification
Verify the integration flow from Onboarding → Customer Management → CAD Measurements → Order Creation → Kanban Production board, correcting any desynced states or hardcoded mock fallbacks.

### R3. Premium UI & Micro-Interactions Polish
Refine design details (vibrant HSL colors, smooth transitions, correct button shapes, tooltips, responsive grid limits) to ensure a premium user experience across all form factors.

### R4. Automated Unit & Integration Testing
Add verification scripts or unit/integration tests to programmatically check onboarding flows, RBAC role-based page visibility, and local storage state persistence.

## Acceptance Criteria

### Audit Integrity
- [ ] No compilation warnings or typescript errors during production build.
- [ ] Zero runtime exceptions when navigating between routes or loading pages with empty local storage.

### Flow Correctness & State Sync
- [ ] All forms (onboarding, orders, measurements, staff recruitment) persist input parameters dynamically to local storage.
- [ ] Drag-and-drop or stage movement on the Kanban board synchronizes status back to active orders correctly.

### Automated Test Suite
- [ ] Implement a runnable unit/integration test suite covering the core business rules (e.g. standard allowed minutes calculation, order price calculations, state sync).
- [ ] All tests pass cleanly during the build pipeline.
