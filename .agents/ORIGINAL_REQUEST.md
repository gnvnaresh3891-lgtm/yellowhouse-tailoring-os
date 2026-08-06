# Original User Request

## Initial Request — 2026-08-06T00:17:45+05:30

Build an advanced, hyper-refined Measurement Engine for Tailoring OS supporting visual 2D body landmarks, dynamic formula-based ease calculation, posture modifiers, and real-time validation for both Men's & Women's bespoke garments.

Working directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Integrity mode: development

## Requirements

### R1. Dynamic Measurement Template & POM Engine
Comprehensive Points of Measure (POM) schemas for Men's (Suits, Sherwanis, Shirts, Trousers) and Women's (Sari Blouse, Lehenga Choli, Anarkali, Corset, Gown) with custom ease allowance logic and posture profile modifiers.

### R2. Visual Body Landmark Diagram & Interactivity
Interactive SVG human body outline with clickable landmark hotspots corresponding to POM inputs and live visual validation.

### R3. Measurement Versioning & Fitting Delta Tracker
Immutable measurement snapshot versioning and delta comparison viewer (Target POM vs Observed Fitting Trial vs Alteration Delta).

## Acceptance Criteria

### Measurement & Fitting Engine
- Render interactive Men's & Women's measurement forms with dynamic POM schemas.
- Compute real-time ease allowances and fabric yield estimations based on posture profile.
- Save versioned measurement snapshots without mutating historical orders.
- Pass automated TypeScript and build checks.

## Follow-up — 2026-08-06T08:03:24Z

Complete the E2E multi-tenant onboarding, authentication, and global admin panel features of YellowHouse Tailoring OS. Ensure the system is fully verified and ready for production deployment.

Working directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Integrity mode: development

## Requirements

### R1. Multi-Tenant Onboarding & Seeding Flow
Create an onboarding workspace that allows new boutique owners to sign up, define a custom tenant slug, and select standard measurement templates (Men's, Women's, or Custom) to seed into their tenant-scoped database structure.

### R2. Role-Based Authentication (RBAC) & JWT Setup
Implement authentication (Login/Register) restricting views based on custom staff roles (TENANT_OWNER, RECEPTIONIST, MASTER_TAILOR, KARIGAR) using secure JWT session cookies.

### R3. Global System Admin Dashboard
Develop a global administration control panel providing statistics on active boutique tenants, global revenue flow, subscription plan tiers, and system health metrics.

### R4. Complete Order-to-Delivery E2E Integration
Connect the multi-tenant onboarding with the customer measurement engine and the production pipeline to trace a complete lifecycle: Tenant Signup → Client Onboarding → Order Creation → Cutting/Stitching → QC → Delivery.

## Acceptance Criteria

### Onboarding & Authentication
- Onboarding page renders slug validation checks, template checkboxes, and owner account setup.
- Authentication guards block unauthorized routes according to user role permissions.
- Users can login/logout cleanly, persisting tenant context dynamically in the Next.js header.

### Admin Panel & System Health
- Admin dashboard displays global tenant listings, status indicators (Active/Suspended), and subscription details.
- Backend API endpoints compile cleanly and respond with appropriate onboarding and session payloads.
- Build checks (npx next build and npm run build in API) pass with zero errors.

