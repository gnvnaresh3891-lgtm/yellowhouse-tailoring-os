# Original User Request

## Initial Request — 2026-09-02T01:23:50+05:30

Execute an end-to-end comprehensive refinement, luxury UI/UX polish, CAD vector ergonomics audit, and full regression test matrix verification across the entire YellowHouse Tailoring OS B2B SaaS ecosystem.

Working directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Integrity mode: development

## Requirements

### R1. Multi-Tenant RBAC & Admin Security Hardening
- Enforce strict password/passkey protection on /admin (yh-admin-2026) with zero administrative leak on public marketing pages.
- Verify role-based permissions and traversal defense across all 7 platform roles (Tenant Owner, Master Tailor, Branch Manager, Receptionist, Karigar, Accountant, Super Admin) across all 26 application routes.
- Validate clean cross-tenant data isolation and persistent session management in storage.

### R2. End-to-End Order Lifecycle & Dynamic BOM Refinement
- Refine custom tailoring order intake with client profiling, POM measurement linking, fabric SKU generation (CUST-FAB-), and delivery scheduling.
- Verify dynamic Bill of Materials (BOM) for 12 garment types with optional accessories (threads, zippers, buttons, canvas, latkans, cancan, client-supplied materials).
- Validate pure SVG vector QR and Barcode generation on all physical order receipts, job tickets, and printable invoice documents with isolated @media print styling.
- Test fitting trial stage transitions (First Fitting, Second Trial, Alteration Deltas, Final Delivery) and status reactivity.

### R3. 2D CAD Interactive Vector Silhouette & Caliper Workbench Polish
- Refine 2D CAD dress form mannequin visual fidelity with 420x840 pure SVG viewport, 80%–135% zoom scaling, and HUD layer controls.
- Polish garment drape overlays for Sherwani, Suit, Blouse, Lehenga, Anarkali, and Corset with tailored seamlines.
- Validate 4-axis posture morphs (shoulder slope, chest stance, spine curvature, heel height), dynamic caliper ribbons (↔ 42.5 in), and snapshot version history.
- Ensure isolated @media print CSS for clean Measurement Card Chart printing.

### R4. Karigar Workshop Production Board & SAM Efficiency Ledger Polish
- Refine mobile-responsive 5-stage Kanban floor (Cutting, Canvas, Assembly, Finishing, QC) with stage validation and garment timers.
- Verify dynamic Standard Allowed Minutes (SAM) calculation factoring base matrix, fabric multipliers, and posture/embroidery surcharges.
- Validate piece-rate earnings ledger (₹42/min rate), calendar/table timesheets, storage rack logistics, and barcode scanner integration.

### R5. Public Landing Page & Frictionless Customer Demo Experience
- Refine public marketing landing page to strictly display 4 customer-facing atelier demo personas (Owner, Master Tailor, Branch Manager, Karigar) with zero administrative exposure.
- Verify 1-click sandbox session initialization, multi-branch revenue telemetry, interactive posture calculator, and onboarding registration funnel with automatic demo state cleanup.

## Acceptance Criteria

### Security & Access Control
- [ ] Direct navigation to /admin renders the Master Admin Passkey Gate when unauthenticated.
- [ ] Public landing page strictly displays 4 customer-facing atelier roles with 0 administrative exposure.
- [ ] Onboarding completion requires private credential login with cleared demo state.

### Functional Integrity & Usability
- [ ] All 26 static pages compile with 0 TypeScript, ESLint, or Next.js build errors (
pm run build exits 0).
- [ ] Interactive state (measurements, orders, BOM accessories, karigar stages, tenant settings) persists across page reloads.
- [ ] All print layouts (Measurement Cards, Order Receipts, Job Tickets) render with SVG QR codes and isolated @media print styling.
- [ ] Automated and manual test verification passes with 0 regressions across the entire monorepo.