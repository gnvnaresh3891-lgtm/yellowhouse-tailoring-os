## 2026-08-08T00:12:04Z

You are the M4 Implementation Worker for YellowHouse Tailoring OS (`yellowhouse`).
Project Root Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Your Working Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4

Read the reference blueprints carefully before starting:
- ORIGINAL_REQUEST.md: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\ORIGINAL_REQUEST.md
- PROJECT.md: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\PROJECT.md
- Explorer 1 Blueprint (UI Polish & CAD): C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m4_1\analysis.md
- Explorer 2 Blueprint (RBAC & Test Suite): C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\explorer_m4_2\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. CSS & Design System Updates (`globals.css` & `tailwind.config.js`):
   - Add HSL gold CSS variables (`--gold-hue: 45`, etc.), `.glass-card`, `.glass-card-gold`, `.btn-gold`, and tooltip CSS keyframe animations.
2. Create Universal Tooltip Component (`apps/web/src/components/Tooltip.tsx`):
   - Reusable React Tooltip wrapper with position options (`top`, `bottom`, `left`, `right`).
3. Interactive CAD Measurement Engine SVG Hotspots (`apps/web/src/app/(dashboard)/measurements/page.tsx`):
   - Inject radar ripple pulses (`<animate>`), crosshair laser alignment guides, dynamic floating callouts, and posture modifier visual feedback.
4. Refine All 7 Dashboard Pages & Onboarding:
   - `/dashboard`, `/customers`, `/orders`, `/production`, `/staff`, `/admin`, `/onboarding`: Upgrade cards to `.glass-card` / `.glass-card-gold`, apply `.btn-gold`, polish table headers/borders, add tooltips to technical metrics and action buttons, update badge helper styling.
5. RBAC Utility Engine & Route Guards (`apps/web/src/lib/rbac-utils.ts` & `apps/web/src/app/(dashboard)/layout.tsx`):
   - Create `rbac-utils.ts` defining permissions for all 7 user roles (`SUPER_ADMIN`, `ATELIER_MANAGER`, `MASTER_TAILOR`, `EMBROIDERY_ARTISAN`, `SALES_FRONT_DESK`, `QUALITY_INSPECTOR`, `CUSTOMER_VIEW`), `canUserAccessRoute`, `filterNavItemsForRole`, `getFallbackRedirectRoute`.
   - Update `SidebarLayout` in `layout.tsx` to dynamically filter sidebar navigation and enforce route guards.
6. Create RBAC Test Suite & Test Pipeline Integration:
   - Create `apps/web/src/__tests__/rbac-visibility.test.ts` (exporting `runRbacVisibilityTests()`).
   - Wire `runRbacVisibilityTests()` into `apps/web/src/__tests__/run-tests.ts`.
7. Build & Test Verification:
   - Run `npm test` and `npx tsc --noEmit` in both `apps/web` and `apps/api`.
   - Run `npm run build` in root / workspaces.
   - Verify 0 TypeScript errors, 100% tests pass, and production builds complete with exit code 0.

Deliver your complete report in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4\handoff.md` and send a message when done.
