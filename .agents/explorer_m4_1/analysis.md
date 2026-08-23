# Milestone 4 UI Polish & CAD Interactive Specification Blueprint

**Project**: YellowHouse Tailoring OS (`yellowhouse`)  
**Target Milestone**: Milestone 4 — UI Polish, Glassmorphism, HSL Gold Theme & CAD Interactive Hotspots  
**Author**: Explorer 1 (`explorer_m4_1`)  
**Date**: 2026-08-08  

---

## 1. Executive Summary

This blueprint provides the complete architectural and styling specification for Milestone 4 of YellowHouse Tailoring OS. It covers:
1. **HSL Gold Theme Architecture & CSS Tokenization**: Transformation to precise HSL-based color tokens with vibrant metallic highlights, glowing gold accents, dark slate depth background (`#0B0F19` / `hsl(222, 47%, 7%)`), and accessible contrast standards.
2. **Glassmorphic Card Specification**: Fine-tuned `.glass-card` and `.glass-card-gold` components featuring backdrop blurs, multi-layered ambient drop-shadows, subtle border highlights, and hover micro-interactions.
3. **Tooltip System Architecture**: Standardized, reusable tooltip patterns (CSS and React-based) with multi-directional placement, smooth scale-fade keyframe transitions, and z-index hierarchy.
4. **Responsive Grid & Layout Bounds**: Fluid grid boundaries (`max-w-7xl`, `2xl:max-w-[1600px]`), standardized padding, and mobile/tablet responsive breakpoints across all viewports.
5. **Interactive SVG Hotspot Animation Engine (CAD Measurement Preview)**: Next-level CAD blueprint interactivity featuring radar ripple pulses, animated crosshair laser alignment guides, dynamic floating measurement callouts, and real-time posture modifier visual feedback.
6. **Detailed Styling Gap Audit Across All 7 Dashboard Pages & Onboarding**: Line-by-line identification of current styling deficiencies and exact CSS/Tailwind remediation directives for `/dashboard`, `/customers`, `/measurements`, `/orders`, `/production`, `/staff`, `/admin`, and `/onboarding`.

---

## 2. HSL Gold Theme & Glassmorphism Design System Specification

### 2.1 CSS Variables & HSL Token System

To achieve a true luxury bespoke tailoring aesthetic, all colors are tokenized using HSL (Hue, Saturation, Lightness). Gold hue is centered at `45deg`, allowing dynamic alpha transparency, glow effects, and metallic gradients without color distortion.

#### Defined Tokens in `globals.css`
```css
:root {
  /* HSL Base Hue Variables */
  --gold-hue: 45;
  --gold-sat: 93%;
  
  /* HSL Gold Palette Tokens */
  --color-gold-50: hsl(var(--gold-hue), var(--gold-sat), 96%);
  --color-gold-100: hsl(var(--gold-hue), var(--gold-sat), 88%);
  --color-gold-200: hsl(var(--gold-hue), var(--gold-sat), 77%);
  --color-gold-300: hsl(var(--gold-hue), var(--gold-sat), 63%);
  --color-gold-400: hsl(var(--gold-hue), var(--gold-sat), 53%);   /* #FACC15 equivalent */
  --color-gold-500: hsl(var(--gold-hue), var(--gold-sat), 47%);   /* #EAB308 Core Metallic Gold */
  --color-gold-600: hsl(var(--gold-hue), 85%, 40%);               /* #CA8A04 Deep Gold */
  --color-gold-700: hsl(var(--gold-hue), 80%, 30%);               /* Shadow Gold */

  /* Dark Slate Background Hierarchy */
  --bg-app: hsl(222, 47%, 7%);        /* #0B0F19 Surface Base */
  --bg-surface-dark: hsl(222, 47%, 10%);/* #101625 Elevated Surface */
  --bg-card: hsl(222, 40%, 12%);       /* #141C2E Card Interior */

  /* Glassmorphic Transparency & Border Tokens */
  --glass-bg: hsla(222, 47%, 10%, 0.75);
  --glass-bg-hover: hsla(222, 47%, 14%, 0.85);
  --glass-border: hsla(0, 0%, 100%, 0.08);
  --glass-border-hover: hsla(0, 0%, 100%, 0.18);
  
  --glass-gold-bg: hsla(222, 43%, 14%, 0.85);
  --glass-gold-border: hsla(var(--gold-hue), var(--gold-sat), 47%, 0.30);
  --glass-gold-border-hover: hsla(var(--gold-hue), var(--gold-sat), 53%, 0.60);
  --glass-gold-glow: hsla(var(--gold-hue), var(--gold-sat), 47%, 0.15);
}
```

---

### 2.2 Glassmorphic Card Engine Specs

Cards throughout YellowHouse Tailoring OS use CSS backdrop blurs combined with dual-layered subtle borders and soft shadow casting.

```css
@layer components {
  /* Standard Glassmorphic Card */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-hover);
    box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  /* Gold Highlighted Glassmorphic Card (VIP/Featured/Active) */
  .glass-card-gold {
    background: var(--glass-gold-bg);
    backdrop-filter: blur(20px) saturate(200%);
    -webkit-backdrop-filter: blur(20px) saturate(200%);
    border: 1px solid var(--glass-gold-border);
    box-shadow: 0 8px 32px 0 var(--glass-gold-glow), inset 0 1px 1px 0 rgba(250, 204, 21, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card-gold:hover {
    border-color: var(--glass-gold-border-hover);
    box-shadow: 0 16px 48px 0 hsla(var(--gold-hue), var(--gold-sat), 47%, 0.25), inset 0 1px 1px 0 rgba(250, 204, 21, 0.4);
    transform: translateY(-2px);
  }

  /* Luxury HSL Gold Button Component */
  .btn-gold {
    background: linear-gradient(135deg, hsl(45, 93%, 47%) 0%, hsl(38, 92%, 50%) 100%);
    color: hsl(222, 47%, 7%);
    font-weight: 700;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    box-shadow: 0 4px 16px hsla(45, 93%, 47%, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-gold:hover {
    filter: brightness(1.1);
    box-shadow: 0 6px 24px hsla(45, 93%, 47%, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transform: translateY(-1.5px);
  }

  .btn-gold:active {
    transform: translateY(0.5px);
    box-shadow: 0 2px 8px hsla(45, 93%, 47%, 0.2);
  }
}
```

---

### 2.3 Universal Tooltip Architecture

Tooltips clarify technical metrics (SAM, POM codes, pricing surcharges, fitting deltas, role permissions) across all pages.

#### CSS Animation Keyframes & Tooltip Rule
```css
@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.tooltip-trigger {
  position: relative;
}

.tooltip-content {
  position: absolute;
  z-index: 60;
  padding: 0.375rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.2;
  color: #f8fafc;
  background-color: hsla(222, 47%, 10%, 0.95);
  border: 1px solid hsla(45, 93%, 47%, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 12px hsla(45, 93%, 47%, 0.15);
  backdrop-filter: blur(12px);
  white-space: nowrap;
  pointer-events: none;
  animation: tooltip-fade-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Tooltip Positions */
.tooltip-top { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 0.5rem; }
.tooltip-bottom { top: 100%; left: 50%; transform: translateX(-50%); margin-top: 0.5rem; }
.tooltip-left { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 0.5rem; }
.tooltip-right { left: 100%; top: 50%; transform: translateY(-50%); margin-left: 0.5rem; }
```

#### Standard React Tooltip Wrapper Blueprint
```tsx
import React, { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="tooltip-trigger inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`tooltip-content tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
}
```

---

### 2.4 Responsive Grid & Boundary Guidelines

To prevent awkward stretching on wide 4K monitors while keeping dense information accessible on laptops and mobile devices:
- **Max Width Container**: Wrap main page contents in `max-w-7xl xl:max-w-[1500px] mx-auto w-full`.
- **Horizontal Padding**: `px-4 sm:px-6 lg:px-8`.
- **Card Grids**:
  - KPI Stat Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5`
  - Two-Column Layouts (e.g. Dashboard/Measurements): `grid grid-cols-1 lg:grid-cols-12 gap-6`
  - Kanban Columns: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4`

---

## 3. Interactive CAD SVG Hotspot Animation Engine

The CAD Measurement preview canvas (`apps/web/src/app/(dashboard)/measurements/page.tsx`) provides interactive 2D anatomical landmarks. Milestone 4 enhances this preview into a live CAD blueprint workspace.

### 3.1 Interactive Hotspot Micro-Interactions Specification

When a user hovers over or clicks a measurement point (e.g. `SH-01` Chest Girth, `BL-05` Bust Apex):

1. **Radar Pulse Waves**: Dual concentric SVG circles radiating outwards from the hotspot node `(cx, cy)` with staggered keyframes.
2. **Crosshair Alignment Lasers**: Horizontal and vertical laser alignment lines extending across the canvas grid with SVG filter dropshadows (`glow-cyan`, `glow-gold`).
3. **Animated Floating Value Callout**: Glassmorphic overlay badge displaying POM code, POM full title, current measurement in metric/inches, and tolerance range status.
4. **Posture Modifier Visual Manipulations**: Dynamic SVG path transformations when posture options are toggled:
   - **Shoulder Slope (`Sloped` / `Square`)**: Rotates shoulder landmark points `(125, 140)` and `(275, 140)` by ±4 degrees.
   - **Chest Stance (`Forward` / `Barrel`)**: Adjusts chest contour curve path `M 155 170 C...` curvature radius.
   - **Back Posture (`Stooped` / `Erect`)**: Modifies spinal alignment dash line `strokeDasharray`.
   - **Heel Height (`0"` – `3"`)**: Dynamically shifts foot base landmark baseline by `-y` pixels in female silhouettes.

### 3.2 Enhanced SVG Hotspot Code Blueprint

```tsx
/* Enhanced Hotspot Group inside BodySilhouetteSvg */
{activePoms.map((pom) => {
  const x = pom.landmarkX ?? 200;
  const y = pom.landmarkY;
  const isFocused = focusedId === pom.id;
  const hasError = !!validationErrors[pom.id];
  const r = 8;
  const val = measurements[pom.id] ?? pom.base;

  return (
    <g
      key={pom.id}
      className="cursor-pointer group/hotspot transition-all duration-300"
      onClick={() => onSelectHotspot(pom.id)}
      onMouseEnter={() => onHoverHotspot(pom.id)}
      onMouseLeave={() => onHoverHotspot(null)}
    >
      {/* Invisible Touch/Click Target Expansion Area */}
      <circle cx={x} cy={y} r={r + 16} fill="transparent" />

      {isFocused && (
        <>
          {/* Radar Ripple Animation 1 */}
          <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#FACC15" strokeWidth="1.5" opacity="0.8">
            <animate attributeName="r" values={`${r + 4};${r + 22};${r + 4}`} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* Radar Ripple Animation 2 (Staggered) */}
          <circle cx={x} cy={y} r={r + 14} fill="none" stroke="#EAB308" strokeWidth="1" opacity="0.5">
            <animate attributeName="r" values={`${r + 8};${r + 32};${r + 8}`} dur="1.8s" begin="0.45s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" begin="0.45s" repeatCount="indefinite" />
          </circle>

          {/* X/Y Crosshair CAD Lasers */}
          <line
            x1="0" y1={y} x2="400" y2={y}
            stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
            filter="url(#glow-cyan)" opacity="0.85"
          >
            <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
          </line>
          <line
            x1={x} y1="0" x2={x} y2="800"
            stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
            filter="url(#glow-cyan)" opacity="0.85"
          >
            <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
          </line>
        </>
      )}

      {/* Core Hotspot Circle */}
      <circle
        cx={x}
        cy={y}
        r={isFocused ? r + 3 : r}
        fill={hasError ? '#EF4444' : isFocused ? '#FACC15' : '#10B981'}
        stroke={isFocused ? '#FFFFFF' : '#0B0F19'}
        strokeWidth={isFocused ? '2.5' : '1.5'}
        filter={isFocused ? 'url(#glow-gold)' : ''}
        className="transition-all duration-300 ease-out"
      />
      <circle cx={x} cy={y} r={isFocused ? 3 : 2} fill="#FFFFFF" />

      {/* Landmark Label */}
      <text
        x={x + 14}
        y={y + 4}
        className={`text-[10px] font-mono font-extrabold tracking-wider ${
          isFocused ? 'fill-yellow-400' : 'fill-slate-400 group-hover/hotspot:fill-slate-200'
        }`}
        style={{ textShadow: '0px 2px 6px rgba(0,0,0,0.95)' }}
      >
        {pom.code}
      </text>
    </g>
  );
})}
```

---

## 4. Comprehensive Styling Gap Analysis Across All Dashboard Pages

Below is the exhaustive page-by-page styling audit identifying current code gaps, visual deficiencies, and exact fixes.

---

### 4.1 Page `/dashboard` (Atelier Workspace Control Center)

#### Current Gaps Identified
1. **KPI Cards Glassmorphism**: Cards use `bg-slate-900/60 border border-slate-800/80` instead of standard `.glass-card` classes.
2. **Missing Tooltips**: Quick action shortcuts (Create Order, Fit Profile, Add Customer) lack explanatory tooltips.
3. **Table Styling Contrast**: Table row divide border `divide-slate-850` uses hardcoded arbitrary hex instead of system HSL/slate classes.
4. **Action Button Shadow**: "New Order" button in header has `shadow-yellow-500/10` which is too subtle; needs `shadow-yellow-500/25` and `.btn-gold`.

#### Remediation Blueprint
- Upgrade KPI Cards to `.glass-card` with hover glow: `glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-yellow-500/40`.
- Add `<Tooltip content="...">` wrapper around KPI info icons and quick action buttons.
- Standardize table borders to `border-slate-800/60` and row hovers to `hover:bg-slate-800/40`.

---

### 4.2 Page `/customers` (Client Directory & VIP Atelier Profiles)

#### Current Gaps Identified
1. **Filter Bar Elevation**: Search & Filter bar uses standard border without backdrop blur or glass depth.
2. **Table Header & Row Hover Alignment**: Table header has hardcoded `bg-slate-950/40`, while rows use `hover:bg-slate-800/40`. Lack of subtle left accent line on selected row.
3. **VIP Badge Styling**: VIP indicators in customer cards use `.badge-gold`, but need a smooth gold glow pulse for high priority clients.
4. **Modal Card Consistency**: "Add Customer" modal uses `glass-card-gold`, but input focus rings use `border-yellow-500/50` without HSL shadow support.

#### Remediation Blueprint
- Wrap search & filter container in `glass-card rounded-2xl p-4 border border-slate-800/80`.
- Add active left border highlight on hovered table rows: `group-hover:border-l-2 group-hover:border-yellow-400`.
- Add `pulse-gold` animation class to VIP status badges in customer drawer.
- Add `<Tooltip content="View fit history and CAD snapshots">` to action buttons in customer rows.

---

### 4.3 Page `/measurements` (CAD Engine & Posture Canvas Workspace)

#### Current Gaps Identified
1. **Control Bar Button Contrast**: Gender, Garment, and Fit preference toggles use mixed style classes (`bg-gold-500 text-slate-950` vs Tailwind `bg-yellow-500`). Needs unified HSL token mapping.
2. **SVG Hotspot Animation**: Selected hotspot only renders static concentric circles without CSS pulse animations (`animate-pulse` or `<animate>` SVG tags).
3. **POM Input Focus State**: Inputs use `pom-input` class which has `bg-slate-950 border-slate-800`, but lacks backdrop blur when displayed over dark glass backgrounds.
4. **Fitting Trial Delta Table**: Delta icons (`ArrowUpRight`, `ArrowDownRight`) lack tooltips explaining tolerance thresholds.

#### Remediation Blueprint
- Update control bar toggle buttons to use standard `.btn-gold` for active states and `.btn-ghost` for inactive states.
- Inject SVG `<animate>` tags into `BodySilhouetteSvg` for radar ripple pulses and crosshair alignment lasers.
- Wrap delta status badges (`Perfect`, `Tolerance`, `Alteration`) with interactive `<Tooltip>`.

---

### 4.4 Page `/orders` (Bespoke Order Creation & Pricing Engine)

#### Current Gaps Identified
1. **Status Badges Styling**: `renderStatusBadge` utility function returns inline Tailwind classes (`bg-yellow-500/10 text-yellow-400 border-yellow-500/20`). Should leverage standard design system `.badge-gold`, `.badge-amber`, `.badge-blue`, `.badge-emerald`, `.badge-rose`.
2. **Order Creation Draft Autosave Card**: Pricing summary box on create order tab has hardcoded `bg-slate-950/80` instead of `.glass-card-gold`.
3. **Fabric Swatch Thumbnails**: Material swatch previews in order item rows lack full zoom image preview tooltips.

#### Remediation Blueprint
- Refactor `renderStatusBadge` to map to design system badge classes:
  - `DRAFT`: `badge bg-slate-800 text-slate-400 border-slate-700`
  - `CONFIRMED`: `badge badge-blue`
  - `CUTTING`: `badge badge-amber`
  - `IN_PRODUCTION`: `badge badge-gold`
  - `TRIAL_FITTING`: `badge bg-purple-500/10 text-purple-400 border-purple-500/20`
  - `QC_CHECK`: `badge bg-orange-500/10 text-orange-400 border-orange-500/20`
  - `READY_FOR_DELIVERY`: `badge badge-emerald`
  - `DELIVERED`: `badge bg-green-500/10 text-green-400 border-green-500/20`
- Upgrade Pricing Calculator sidebar panel in create order view to `glass-card-gold rounded-2xl p-6 border border-yellow-500/30`.
- Attach tooltips to pricing breakdown items (Fabric Yield, Tailoring Labor, Zardozi Surcharge).

---

### 4.5 Page `/production` (Workshop Kanban Board & SAM Tracking)

#### Current Gaps Identified
1. **Kanban Column Height & Scrollability**: Kanban columns use `.kanban-column` (`glass-card rounded-2xl p-4 border border-slate-800 space-y-3 min-h-[300px]`), but lack explicit max-height scrollable areas (`max-h-[calc(100vh-280px)] overflow-y-auto`) when loaded with multiple job cards.
2. **Job Card Drag State**: Dragging job cards lacks visual drag-over indicator feedback styling (`border-dashed border-yellow-500/60 bg-yellow-500/5`).
3. **SAM Progress Bar**: SAM progress bar uses solid colors rather than smooth HSL metallic gold gradients (`bg-gradient-to-r from-yellow-600 to-yellow-400`).
4. **Column Header Indicators**: Column job counters lack tooltips describing stage capacity and workflow rules.

#### Remediation Blueprint
- Add scroll container styling to `.kanban-column`: `glass-card rounded-2xl p-4 border border-slate-800 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar`.
- Add drag-over CSS state class `.kanban-column-drag-over` with dashed gold border and subtle glow backdrop.
- Enhance SAM progress bar inside job cards with `bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 animate-pulse-subtle`.
- Add tooltips on job card priority flags ("Urgent: High-priority delivery requested").

---

### 4.6 Page `/staff` (Atelier Staff Recruitment & RBAC Directory)

#### Current Gaps Identified
1. **Role Badge Mapping**: `getRoleBadgeClass` maps `MASTER_TAILOR` to `badge-amber`, `BRANCH_MANAGER` to `badge-blue`, and `TENANT_OWNER` to `badge-gold`. However, `KARIGAR` and `ACCOUNTANT` use custom inline string classes.
2. **Staff Table Card Wrapper**: Staff directory table is wrapped in a standard div without `.glass-card` elevation.
3. **Recruitment Modal Styling**: Modal overlay backdrop lacks blur intensity (`bg-black/50` vs required `bg-black/75 backdrop-blur-md`).

#### Remediation Blueprint
- Standardize all role badge helper outputs to system badge classes.
- Wrap staff table container in `glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl`.
- Update recruitment modal container to `glass-card-gold rounded-2xl border border-yellow-500/30 p-6 shadow-2xl`.

---

### 4.7 Page `/admin` (Global Super Admin Multi-Tenant Dashboard)

#### Current Gaps Identified
1. **Tenant KPI Cards**: Revenue and tenant metrics cards use standard slate borders without gold accents for Enterprise tier tenants.
2. **Tenant Table Action Icons**: View and Suspend/Activate action buttons lack explicit tooltips.
3. **Plan Badges**: Enterprise plan badge uses `bg-amber-500/10 text-amber-400`; should use `.badge-gold` with Crown icon.

#### Remediation Blueprint
- Apply `.glass-card-gold` to top MRR metric card.
- Add `<Tooltip content="Suspend tenant access">` and `<Tooltip content="Manage tenant subscription">` to tenant table row action buttons.
- Update plan badges: Enterprise -> `.badge-gold`, Pro -> `.badge-blue`, Starter -> `.badge bg-slate-800 text-slate-400`.

---

### 4.8 Page `/onboarding` (Atelier Registration Wizard)

#### Current Gaps Identified
1. **Step Indicator Styling**: Wizard step tabs use generic border styles without gold glow active state.
2. **Template Selection Cards**: Preset template cards (`Men's Ethnic`, `Women's Couture`) lack glassmorphic hover depth.

#### Remediation Blueprint
- Style active wizard step indicator with `.btn-gold` pill badge.
- Upgrade template selection cards to `.glass-card hover:border-yellow-500/50 hover:shadow-yellow-500/10`.

---

## 5. Summary of Architectural Deliverables for Implementation Phase

| Component / Subsystem | Directives for Implementer Agent | Target Files |
|---|---|---|
| **HSL Token System** | Add HSL variables, `.glass-card`, `.glass-card-gold`, `.btn-gold`, and tooltip CSS keyframes | `apps/web/src/app/globals.css`, `apps/web/tailwind.config.js` |
| **Tooltip Component** | Create reusable `<Tooltip content="..." position="...">` React component | `apps/web/src/components/Tooltip.tsx` |
| **CAD Interactive SVG** | Inject radar pulses, crosshair alignment lasers, and posture SVG path transforms | `apps/web/src/app/(dashboard)/measurements/page.tsx` |
| **Dashboard Page Polish** | Upgrade KPI cards to `.glass-card`, add tooltips, standardize table contrast | `apps/web/src/app/(dashboard)/dashboard/page.tsx` |
| **Customers Page Polish** | Upgrade search/filter bar to glassmorphism, add VIP pulse effect and tooltips | `apps/web/src/app/(dashboard)/customers/page.tsx` |
| **Orders Page Polish** | Refactor `renderStatusBadge` to system badges, polish pricing engine card | `apps/web/src/app/(dashboard)/orders/page.tsx` |
| **Production Page Polish** | Add scroll bounds & drag-over state to `.kanban-column`, gradient SAM progress bars | `apps/web/src/app/(dashboard)/production/page.tsx` |
| **Staff & Admin Polish** | Standardize role/plan badges, glass card table containers, and backdrop blurs | `apps/web/src/app/(dashboard)/staff/page.tsx`, `apps/web/src/app/(dashboard)/admin/page.tsx` |

---
*End of Milestone 4 Blueprint — YellowHouse Tailoring OS*
