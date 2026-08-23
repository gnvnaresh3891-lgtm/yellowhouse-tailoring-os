## 2026-08-23T14:34:10Z
Assigned to Milestone 4:
Scope and Exclusively Owned Files for Milestone 4:
1. `apps/web/src/components/ecosystem/stylist-card.tsx`
2. `apps/web/src/components/ecosystem/trial-status-banner.tsx`
3. `apps/web/src/app/(dashboard)/stylists/page.tsx`
4. `apps/web/src/app/(dashboard)/layout.tsx` & `apps/web/src/lib/rbac-utils.ts` & `apps/web/src/components/command-palette.tsx` (Dashboard nav integration & RBAC route permissions)
5. `apps/web/src/components/print-layouts.tsx` (Add TechPackSpecPrint, MaterialBOMPrint, MachineReservationTicketPrint)
6. `apps/web/src/__tests__/trial-stylist-directory.test.ts` & `apps/web/src/__tests__/print-and-rbac-expansion.test.ts` (Unit tests integrated into test runner)

Requirements:
- 0 TypeScript/ESLint errors on `npx tsc --noEmit`.
- Run `npm test` in `apps/web` and ensure all test suites pass with zero regressions.
- Write handoff report and message parent.
