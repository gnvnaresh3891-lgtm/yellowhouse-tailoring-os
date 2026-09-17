/**
 * YellowHouse Tailoring OS — Milestone 1 Test Suite
 * Apple-Grade Design System Foundation, UI Primitives & Navigation Shells
 * 
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 1 & Interface Contracts
 * - ORIGINAL_REQUEST.md § R1-R3 (Apple-Grade Design System, SF Pro, 8px grid, Frosted Translucency)
 * - Explorer 2 Design System Survey & Blueprint
 * 
 * Verifies:
 * 1. Apple design system tokens in tailwind.config.js and globals.css:
 *    - SF Pro font hierarchy (sans, display, mono)
 *    - 8px spatial grid alignment
 *    - iOS depth shadow tokens (shadow-ios-sm through shadow-ios-xl, shadow-ios-gold, hairline)
 *    - Continuous squircle and pill corner radii (rounded-2.5xl, rounded-3xl, rounded-4xl, rounded-full)
 *    - Hardware-accelerated spring curves (cubic-bezier(0.16, 1, 0.3, 1)) and duration tokens
 *    - OLED dark canvas (#07090E) with curated warm atelier gold (#D4AF37, #C59B27)
 *    - Strict @media print isolation maintaining pure white paper, pure black text, and hiding UI chrome
 * 
 * 2. Centralized Apple UI primitives in src/components/ui/:
 *    - Button: variants (primary, secondary, gold, ghost, danger, outline), sizes (sm, md, lg, icon),
 *      tactile spring active:scale-[0.98], loading state, icon slots, accessibility
 *    - Card: variants (glass, opaque, elevated, gold), padding (none, sm, md, lg), squircle radius (rounded-2.5xl),
 *      compound parts (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), hoverable states
 *    - Badge: variants (neutral, gold, success, warning, danger, info), sizes (sm, md), pill geometry (rounded-full),
 *      translucent frosted blur, optional status dot indicator
 *    - SegmentedControl: options rendering, active pill indicator, keyboard navigation (Arrow keys, Home, End),
 *      touch scaling active:scale-[0.96]
 *    - Input: squircle and pill shapes, size tiers, warm atelier gold focus rings, label, helper text,
 *      error states, left/right icon slots
 * 
 * 3. DashboardLayout and AuthLayout structural requirements:
 *    - /admin bypass invariant: direct navigation to /admin skips layout redirect to allow Master Passkey Gate rendering
 *    - Core navigation items: /dashboard, /customers, /measurements, /orders, /production, /staff, /admin
 *    - Role-based navigation filtering via filterNavItemsForRole (strict admin isolation for non-admin roles)
 *    - Integration of Command Palette (Ctrl+K), Currency Switcher, Breadcrumbs, Toast Notifications
 *    - AuthLayout minimal centered Apple-grade shell with ambient gold glow and brand identity
 * 
 * 4. Adversarial & Boundary Stress Testing:
 *    - XSS & HTML injection escaping in primitives
 *    - Extreme boundary inputs (empty, 1000+ chars, invalid variants, missing optional props)
 *    - Deeply nested compound component structures
 *    - Special characters & multi-byte UTF-8 symbols
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Import RBAC utilities
import {
  UserRole,
  canUserAccessRoute,
  filterNavItemsForRole,
  getFallbackRedirectRoute,
} from '../lib/rbac-utils';

export interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runM1AppleDesignSystemTests(): TestResult {
  console.log('\n================================================================');
  console.log('--- MILESTONE 1: APPLE DESIGN SYSTEM, UI PRIMITIVES & SHELL ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, failureDetails?: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
      if (failureDetails) {
        findings.push(failureDetails);
      }
    } else {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    }
  }

  // Resolve base paths reliably
  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  const tailwindConfigPath = path.join(webRoot, 'tailwind.config.js');
  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  const dashboardLayoutPath = path.join(webRoot, 'src', 'app', '(dashboard)', 'layout.tsx');
  const authLayoutPath = path.join(webRoot, 'src', 'app', '(auth)', 'layout.tsx');
  const uiDir = path.join(webRoot, 'src', 'components', 'ui');

  /**
   * Helper to safely transpile and load TSX modules in CommonJS ts-node runtime
   * where tsconfig uses "jsx": "preserve" for Next.js build.
   */
  function loadTsxModule(filePath: string): any {
    const code = fs.readFileSync(filePath, 'utf8');
    const transpileResult = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    });

    const moduleExports: any = {};
    const customRequire = (id: string) => {
      if (id === 'react' || id === 'React') return React;
      if (id === 'react-dom/server') return { renderToStaticMarkup };
      if (id === 'clsx') return require('clsx');
      if (id === 'tailwind-merge') return require('tailwind-merge');
      if (id === 'lucide-react') return require('lucide-react');
      if (id.startsWith('@/')) {
        const relPath = id.slice(2);
        const resolved = path.join(webRoot, 'src', relPath);
        if (fs.existsSync(resolved + '.ts') || fs.existsSync(resolved + '.tsx')) {
          return loadTsxModule(fs.existsSync(resolved + '.tsx') ? resolved + '.tsx' : resolved + '.ts');
        }
        return require(resolved);
      }
      return require(id);
    };

    const fn = new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      'React',
      transpileResult.outputText
    );
    const moduleObj = { exports: moduleExports };
    fn(moduleExports, customRequire, moduleObj, filePath, path.dirname(filePath), React);
    return moduleObj.exports;
  }

  // ==========================================================================
  // SECTION 1: APPLE DESIGN SYSTEM TOKENS IN TAILWIND.CONFIG.JS
  // ==========================================================================
  console.log('[Subsuite 1: Tailwind CSS Apple Design System Tokens]');

  assert(fs.existsSync(tailwindConfigPath), 'tailwind.config.js exists at apps/web root');

  let tailwindConfig: any = {};
  try {
    tailwindConfig = require(tailwindConfigPath);
    assert(true, 'Successfully required and parsed tailwind.config.js');
  } catch (err: any) {
    assert(false, 'Failed to require tailwind.config.js', err.message);
  }

  const extend = tailwindConfig?.theme?.extend || {};

  // 1.1 SF Pro Typography Hierarchy
  const fontFamily = extend.fontFamily || {};
  assert(Array.isArray(fontFamily.sans), 'fontFamily.sans is defined as an array');
  const sansStr = (fontFamily.sans || []).join(' ');
  assert(
    sansStr.includes('-apple-system') &&
      sansStr.includes('BlinkMacSystemFont') &&
      (sansStr.includes('SF Pro') || sansStr.includes('"SF Pro"')),
    'fontFamily.sans prioritizes Apple system fonts (-apple-system, BlinkMacSystemFont, SF Pro)'
  );

  assert(Array.isArray(fontFamily.display), 'fontFamily.display is defined as an array');
  const displayStr = (fontFamily.display || []).join(' ');
  assert(
    displayStr.includes('SF Pro Display') || displayStr.includes('SF Pro'),
    'fontFamily.display specifies SF Pro Display optical typography'
  );

  assert(Array.isArray(fontFamily.mono), 'fontFamily.mono is defined as an array');
  const monoStr = (fontFamily.mono || []).join(' ');
  assert(
    monoStr.includes('SF Mono') || monoStr.includes('ui-monospace'),
    'fontFamily.mono specifies SF Mono / ui-monospace for tabular figures'
  );

  // 1.2 Monochromatic Canvas & Atelier Gold Palette
  const colors = extend.colors || {};
  assert(colors.canvas === '#07090E', 'colors.canvas is OLED pitch black (#07090E)');

  const goldColors = colors.gold || {};
  assert(
    goldColors['500'] === '#D4AF37' || goldColors.DEFAULT === '#D4AF37',
    'colors.gold.500 or DEFAULT is Canonical Warm Atelier Gold (#D4AF37)'
  );
  assert(
    goldColors['600'] === '#C59B27',
    'colors.gold.600 is Deep Burnished Gold (#C59B27)'
  );
  assert(
    goldColors['400'] === '#E4BF64' || goldColors['400'] === '#FACC15',
    'colors.gold.400 is defined for highlights'
  );

  const surfaceColors = colors.surface || {};
  assert(
    surfaceColors.DEFAULT === '#0D111A' && surfaceColors.card === '#161D2E',
    'colors.surface defines layered dark luminance hierarchy (surface & card)'
  );

  // 1.3 Multi-Layered Soft iOS Ambient Shadows (Zero Hard Borders)
  const boxShadow = extend.boxShadow || {};
  assert(Boolean(boxShadow['ios-sm']), 'boxShadow.ios-sm token exists for subtle elevation');
  assert(Boolean(boxShadow['ios-md']), 'boxShadow.ios-md token exists for standard cards');
  assert(Boolean(boxShadow['ios-lg']), 'boxShadow.ios-lg token exists for hovered cards & drawers');
  assert(Boolean(boxShadow['ios-xl']), 'boxShadow.ios-xl token exists for modal sheets & popovers');
  assert(Boolean(boxShadow['ios-gold']), 'boxShadow.ios-gold token exists for luxury atelier glow');
  assert(Boolean(boxShadow['hairline']), 'boxShadow.hairline token exists for top inner bevel highlights');

  // Verify inner hairline top highlight
  const hairline = boxShadow['hairline'] || '';
  assert(
    hairline.includes('inset 0 1px 0 0') && hairline.includes('rgba(255, 255, 255'),
    'hairline shadow applies 1px translucent inner top reflection simulating glass bevel'
  );

  // 1.4 Generous Squircle and Pill Corner Radii
  const borderRadius = extend.borderRadius || {};
  assert(
    borderRadius['2.5xl'] === '1.25rem' || borderRadius['2.5xl'] === '20px',
    'borderRadius.2.5xl is defined as 20px (1.25rem) for squircle cards'
  );
  assert(
    borderRadius['3xl'] === '1.5rem' || borderRadius['3xl'] === '24px',
    'borderRadius.3xl is defined as 24px (1.5rem)'
  );
  assert(
    borderRadius['4xl'] === '2rem' || borderRadius['4xl'] === '32px',
    'borderRadius.4xl is defined as 32px (2rem)'
  );
  assert(
    borderRadius['squircle'] === '1.5rem' || borderRadius['squircle'] === '1.25rem',
    'borderRadius.squircle is explicitly registered'
  );

  // 1.5 Hardware-Accelerated Apple Spring Physics Timings
  const timingFn = extend.transitionTimingFunction || {};
  assert(
    timingFn['spring'] === 'cubic-bezier(0.16, 1, 0.3, 1)',
    'transitionTimingFunction.spring is canonical Apple decelerating spring cubic-bezier(0.16, 1, 0.3, 1)'
  );
  assert(
    Boolean(timingFn['spring-bounce']),
    'transitionTimingFunction.spring-bounce token registered'
  );

  const durationTokens = extend.transitionDuration || {};
  assert(
    durationTokens['spring'] === '300ms',
    'transitionDuration.spring defaults to 300ms'
  );

  // ==========================================================================
  // SECTION 2: GLOBALS.CSS TOKENS, FROSTED GLASS & PRINT ISOLATION
  // ==========================================================================
  console.log('\n[Subsuite 2: Globals.css Utilities, Glassmorphism & Print Isolation]');

  assert(fs.existsSync(globalsCssPath), 'globals.css exists at src/app/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  // 2.1 CSS Variables & Palette Tokens
  assert(globalsCss.includes('--canvas: #07090E'), 'globals.css defines --canvas: #07090E');
  assert(globalsCss.includes('--gold-primary: #D4AF37'), 'globals.css defines --gold-primary: #D4AF37');
  assert(globalsCss.includes('--gold-deep: #C59B27'), 'globals.css defines --gold-deep: #C59B27');

  // 2.2 Typography & Tabular Numerals
  assert(globalsCss.includes('.font-display'), 'globals.css provides .font-display utility');
  assert(globalsCss.includes('.font-sans'), 'globals.css provides .font-sans utility');
  assert(
    globalsCss.includes('tabular-nums') && globalsCss.includes('font-variant-numeric: tabular-nums'),
    'globals.css configures font-variant-numeric: tabular-nums for CAD, BOM, and SAM figures'
  );

  // 2.3 Frosted Glass Classes
  assert(globalsCss.includes('.glass-card'), 'globals.css defines .glass-card component class');
  assert(
    globalsCss.includes('backdrop-filter: blur(24px)') || globalsCss.includes('backdrop-filter: blur(20px)'),
    '.glass-card utilizes 20-24px backdrop blur'
  );
  assert(
    globalsCss.includes('saturate(180%)'),
    '.glass-card includes saturation boost for authentic iOS Control Center glass feel'
  );
  assert(
    globalsCss.includes('cubic-bezier(0.16, 1, 0.3, 1)'),
    '.glass-card hover transition utilizes cubic-bezier(0.16, 1, 0.3, 1)'
  );

  assert(globalsCss.includes('.glass-panel'), 'globals.css defines .glass-panel utility for floating sheets');
  assert(globalsCss.includes('.glass-topbar'), 'globals.css defines .glass-topbar utility for header chrome');
  assert(globalsCss.includes('.border-hairline'), 'globals.css defines .border-hairline utility');

  // 2.4 Strict @media print Isolation Invariants
  assert(globalsCss.includes('@media print'), 'globals.css defines @media print query block');
  assert(
    globalsCss.includes('aside, header, .no-print') && globalsCss.includes('display: none !important'),
    '@media print hides UI chrome (aside, header, .no-print { display: none !important; })'
  );
  assert(
    globalsCss.includes('.print-only') && globalsCss.includes('display: block !important'),
    '@media print unhides printable documents (.print-only { display: block !important; })'
  );
  assert(
    globalsCss.includes('body { background: white !important; color: black !important; }'),
    '@media print forces clean white paper and pure black ink'
  );
  assert(
    globalsCss.includes('main { padding: 0 !important; }'),
    '@media print eliminates application main padding'
  );
  assert(
    globalsCss.includes('.print-only {\n  display: none;\n}') ||
      globalsCss.includes('.print-only { display: none; }') ||
      globalsCss.includes('.print-only {\n  display: none !important;\n}') ||
      globalsCss.includes('.print-only { display: none !important; }'),
    '.print-only elements are strictly hidden outside print mode'
  );

  // ==========================================================================
  // SECTION 3: UI PRIMITIVES IN SRC/COMPONENTS/UI/
  // ==========================================================================
  console.log('\n[Subsuite 3: Centralized Apple UI Primitives]');

  // 3.1 Primitives file existence
  const buttonFile = path.join(uiDir, 'button.tsx');
  const cardFile = path.join(uiDir, 'card.tsx');
  const badgeFile = path.join(uiDir, 'badge.tsx');
  const segmentedControlFile = path.join(uiDir, 'segmented-control.tsx');
  const inputFile = path.join(uiDir, 'input.tsx');

  assert(fs.existsSync(buttonFile), 'src/components/ui/button.tsx exists');
  assert(fs.existsSync(cardFile), 'src/components/ui/card.tsx exists');
  assert(fs.existsSync(badgeFile), 'src/components/ui/badge.tsx exists');
  assert(fs.existsSync(segmentedControlFile), 'src/components/ui/segmented-control.tsx exists');
  assert(fs.existsSync(inputFile), 'src/components/ui/input.tsx exists');

  // Load modules dynamically
  let buttonModule: any = {};
  let cardModule: any = {};
  let badgeModule: any = {};
  let segmentedControlModule: any = {};
  let inputModule: any = {};

  try {
    buttonModule = loadTsxModule(buttonFile);
    assert(typeof buttonModule.Button === 'object' || typeof buttonModule.Button === 'function', 'button.tsx exports Button component');
    assert(typeof buttonModule.buttonVariants === 'function', 'button.tsx exports buttonVariants helper');
  } catch (err: any) {
    assert(false, 'load button.tsx module failed', err.message);
  }

  try {
    cardModule = loadTsxModule(cardFile);
    assert(typeof cardModule.Card === 'object' || typeof cardModule.Card === 'function', 'card.tsx exports Card component');
    assert(typeof cardModule.CardHeader === 'object' || typeof cardModule.CardHeader === 'function', 'card.tsx exports CardHeader');
    assert(typeof cardModule.CardTitle === 'object' || typeof cardModule.CardTitle === 'function', 'card.tsx exports CardTitle');
    assert(typeof cardModule.CardDescription === 'object' || typeof cardModule.CardDescription === 'function', 'card.tsx exports CardDescription');
    assert(typeof cardModule.CardContent === 'object' || typeof cardModule.CardContent === 'function', 'card.tsx exports CardContent');
    assert(typeof cardModule.CardFooter === 'object' || typeof cardModule.CardFooter === 'function', 'card.tsx exports CardFooter');
    assert(typeof cardModule.cardVariants === 'function', 'card.tsx exports cardVariants helper');
  } catch (err: any) {
    assert(false, 'load card.tsx module failed', err.message);
  }

  try {
    badgeModule = loadTsxModule(badgeFile);
    assert(typeof badgeModule.Badge === 'object' || typeof badgeModule.Badge === 'function', 'badge.tsx exports Badge component');
    assert(typeof badgeModule.badgeVariants === 'function', 'badge.tsx exports badgeVariants helper');
  } catch (err: any) {
    assert(false, 'load badge.tsx module failed', err.message);
  }

  try {
    segmentedControlModule = loadTsxModule(segmentedControlFile);
    assert(typeof segmentedControlModule.SegmentedControl === 'function', 'segmented-control.tsx exports SegmentedControl component');
  } catch (err: any) {
    assert(false, 'load segmented-control.tsx module failed', err.message);
  }

  try {
    inputModule = loadTsxModule(inputFile);
    assert(typeof inputModule.Input === 'object' || typeof inputModule.Input === 'function', 'input.tsx exports Input component');
  } catch (err: any) {
    assert(false, 'load input.tsx module failed', err.message);
  }

  // 3.2 Button Primitive Tests
  console.log('--- Subsuite 3.2: Button Primitive ---');
  const { Button, buttonVariants } = buttonModule;
  const buttonVariantsList = ['primary', 'secondary', 'gold', 'ghost', 'danger', 'outline'];
  const buttonSizesList = ['sm', 'md', 'lg', 'icon', 'icon-sm'];

  for (const v of buttonVariantsList) {
    const classes = buttonVariants({ variant: v });
    assert(classes.length > 0, `buttonVariants({ variant: '${v}' }) returns valid class string`);
    assert(classes.includes('active:scale-[0.98]'), `Button variant '${v}' includes tactile press active:scale-[0.98]`);
    assert(classes.includes('rounded-full'), `Button variant '${v}' maintains continuous pill rounded-full radius`);
  }

  for (const s of buttonSizesList) {
    const classes = buttonVariants({ size: s });
    assert(classes.length > 0, `buttonVariants({ size: '${s}' }) returns valid class string`);
  }

  // Button rendering tests
  const defaultBtnHtml = renderToStaticMarkup(React.createElement(Button, null, 'Click Me'));
  assert(defaultBtnHtml.includes('<button') && defaultBtnHtml.includes('Click Me'), 'Button renders default primary button with child text');
  assert(defaultBtnHtml.includes('rounded-full'), 'Rendered Button contains rounded-full class');
  assert(defaultBtnHtml.includes('active:scale-[0.98]'), 'Rendered Button contains active:scale-[0.98]');

  const goldBtnHtml = renderToStaticMarkup(React.createElement(Button, { variant: 'gold' }, 'Atelier Action'));
  assert(goldBtnHtml.includes('#D4AF37') && goldBtnHtml.includes('#C59B27'), 'Gold Button renders atelier gold gradient');
  assert(goldBtnHtml.includes('shadow-ios-gold'), 'Gold Button renders shadow-ios-gold');

  const disabledBtnHtml = renderToStaticMarkup(React.createElement(Button, { disabled: true }, 'Disabled'));
  assert(disabledBtnHtml.includes('disabled=""') || disabledBtnHtml.includes('disabled'), 'Disabled Button sets native disabled attribute');

  const loadingBtnHtml = renderToStaticMarkup(React.createElement(Button, { isLoading: true }, 'Saving'));
  assert(loadingBtnHtml.includes('animate-spin'), 'Loading Button renders spinning loader icon');
  assert(loadingBtnHtml.includes('disabled'), 'Loading Button automatically disables interactive click');

  const iconBtnHtml = renderToStaticMarkup(
    React.createElement(
      Button,
      {
        leftIcon: React.createElement('span', { id: 'icon-left' }, '⬅'),
        rightIcon: React.createElement('span', { id: 'icon-right' }, '➡'),
      },
      'Icon Button'
    )
  );
  assert(iconBtnHtml.includes('id="icon-left"') && iconBtnHtml.includes('id="icon-right"'), 'Button renders leftIcon and rightIcon correctly');

  // 3.3 Card Primitive Tests
  console.log('--- Subsuite 3.3: Card Primitive ---');
  const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants } = cardModule;
  const cardVariantsList = ['glass', 'opaque', 'elevated', 'gold'];
  const cardPaddingsList = ['none', 'sm', 'md', 'lg'];

  for (const v of cardVariantsList) {
    const classes = cardVariants({ variant: v });
    assert(classes.includes('rounded-2.5xl'), `Card variant '${v}' uses squircle rounded-2.5xl radius`);
    if (v === 'glass' || v === 'elevated') {
      assert(classes.includes('backdrop-blur-2xl'), `Card variant '${v}' uses backdrop-blur-2xl translucency`);
    }
  }

  for (const p of cardPaddingsList) {
    const classes = cardVariants({ padding: p });
    assert(classes.length > 0, `cardVariants({ padding: '${p}' }) returns valid classes`);
  }

  const hoverCardClasses = cardVariants({ hoverable: true });
  assert(
    hoverCardClasses.includes('hover:-translate-y-1') && hoverCardClasses.includes('hover:shadow-ios-xl'),
    'Card with hoverable=true includes smooth hover lift and deep elevation shadow'
  );

  // Card compound parts rendering
  const compoundCardHtml = renderToStaticMarkup(
    React.createElement(
      Card,
      { variant: 'glass', padding: 'lg', hoverable: true },
      React.createElement(
        CardHeader,
        null,
        React.createElement(CardTitle, null, 'Order Summary'),
        React.createElement(CardDescription, null, 'Bespoke 3-Piece Savile Row Suit')
      ),
      React.createElement(CardContent, null, React.createElement('p', null, 'Fabric SKU: CUST-FAB-7821')),
      React.createElement(CardFooter, null, React.createElement(Button, { variant: 'gold', size: 'sm' }, 'View BOM'))
    )
  );

  assert(compoundCardHtml.includes('Order Summary'), 'Compound Card renders CardTitle');
  assert(compoundCardHtml.includes('Bespoke 3-Piece Savile Row Suit'), 'Compound Card renders CardDescription');
  assert(compoundCardHtml.includes('CUST-FAB-7821'), 'Compound Card renders CardContent');
  assert(compoundCardHtml.includes('View BOM'), 'Compound Card renders CardFooter action');
  assert(compoundCardHtml.includes('rounded-2.5xl'), 'Compound Card renders squircle rounded-2.5xl');

  // 3.4 Badge Primitive Tests
  console.log('--- Subsuite 3.4: Badge Primitive ---');
  const { Badge, badgeVariants } = badgeModule;
  const badgeVariantsList = ['neutral', 'gold', 'success', 'warning', 'danger', 'info'];
  const badgeSizesList = ['sm', 'md'];

  for (const v of badgeVariantsList) {
    const classes = badgeVariants({ variant: v });
    assert(classes.includes('rounded-full'), `Badge variant '${v}' uses pill rounded-full geometry`);
    assert(classes.includes('backdrop-blur-md'), `Badge variant '${v}' includes subtle frosted backdrop blur`);
  }

  for (const s of badgeSizesList) {
    const classes = badgeVariants({ size: s });
    assert(classes.length > 0, `badgeVariants({ size: '${s}' }) produces size classes`);
  }

  const plainBadgeHtml = renderToStaticMarkup(React.createElement(Badge, { variant: 'gold' }, 'VIP Client'));
  assert(plainBadgeHtml.includes('VIP Client'), 'Badge renders children text');
  assert(plainBadgeHtml.includes('rounded-full'), 'Badge renders rounded-full pill shape');
  assert(plainBadgeHtml.includes('text-yellow-300'), 'Gold Badge renders yellow/gold text');

  const dotBadgeHtml = renderToStaticMarkup(
    React.createElement(Badge, { variant: 'success', dot: true }, 'First Fitting')
  );
  assert(dotBadgeHtml.includes('rounded-full shrink-0') && dotBadgeHtml.includes('bg-emerald-400'), 'Badge with dot=true renders status indicator dot');

  // 3.5 SegmentedControl Primitive Tests
  console.log('--- Subsuite 3.5: SegmentedControl Primitive ---');
  const { SegmentedControl } = segmentedControlModule;
  const sampleSegments = [
    { value: 'cad', label: '2D CAD' },
    { value: 'calipers', label: 'Calipers' },
    { value: 'drape', label: 'Garment Drape', disabled: false },
    { value: 'history', label: 'History', disabled: true },
  ];

  let selectedSegment = 'cad';
  const segmentedHtml = renderToStaticMarkup(
    React.createElement(SegmentedControl, {
      options: sampleSegments,
      value: selectedSegment,
      onChange: (val: string) => { selectedSegment = val; },
    })
  );

  assert(segmentedHtml.includes('2D CAD'), 'SegmentedControl renders option label "2D CAD"');
  assert(segmentedHtml.includes('Calipers'), 'SegmentedControl renders option label "Calipers"');
  assert(segmentedHtml.includes('Garment Drape'), 'SegmentedControl renders option label "Garment Drape"');
  assert(segmentedHtml.includes('History'), 'SegmentedControl renders option label "History"');
  assert(segmentedHtml.includes('rounded-full'), 'SegmentedControl wrapper and buttons use rounded-full pill styling');
  assert(segmentedHtml.includes('disabled=""') || segmentedHtml.includes('disabled'), 'SegmentedControl marks disabled option with disabled attribute');
  assert(segmentedHtml.includes('data-value="cad"'), 'SegmentedControl attaches data-value attributes for sliding indicator tracking');

  // 3.6 Input Primitive Tests
  console.log('--- Subsuite 3.6: Input Primitive ---');
  const { Input } = inputModule;
  const basicInputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      label: 'Client Name',
      placeholder: 'Enter patron full name',
      defaultValue: 'Lord Alistair',
    })
  );

  assert(basicInputHtml.includes('<label'), 'Input renders <label> element when label prop provided');
  assert(basicInputHtml.includes('Client Name'), 'Input label displays label text');
  assert(basicInputHtml.includes('Lord Alistair'), 'Input sets defaultValue');
  assert(basicInputHtml.includes('focus:border-[#D4AF37]'), 'Input includes warm atelier gold focus ring focus:border-[#D4AF37]');
  assert(basicInputHtml.includes('rounded-xl'), 'Input default squircle shape uses rounded-xl');

  const pillInputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      shape: 'pill',
      placeholder: 'Search patterns (Ctrl+K)',
    })
  );
  assert(pillInputHtml.includes('rounded-full'), 'Input with shape="pill" renders rounded-full');

  const errorInputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      label: 'POM Measurement',
      error: 'Value must be between 30.0 and 60.0 inches',
    })
  );
  assert(errorInputHtml.includes('border-rose-500'), 'Input with error applies border-rose-500 state');
  assert(errorInputHtml.includes('Value must be between 30.0 and 60.0 inches'), 'Input renders error message paragraph');

  const iconInputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      leftIcon: React.createElement('span', { id: 'search-icon' }, '🔍'),
      rightIcon: React.createElement('span', { id: 'clear-icon' }, '✖'),
    })
  );
  assert(iconInputHtml.includes('id="search-icon"') && iconInputHtml.includes('pl-10'), 'Input renders leftIcon and applies left padding pl-10');
  assert(iconInputHtml.includes('id="clear-icon"') && iconInputHtml.includes('pr-10'), 'Input renders rightIcon and applies right padding pr-10');

  // ==========================================================================
  // SECTION 4: DASHBOARDLAYOUT & AUTHLAYOUT STRUCTURAL INTEGRITY
  // ==========================================================================
  console.log('\n[Subsuite 4: DashboardLayout & AuthLayout Structural Requirements]');

  // 4.1 DashboardLayout Source Inspection
  assert(fs.existsSync(dashboardLayoutPath), 'DashboardLayout exists at src/app/(dashboard)/layout.tsx');
  const dashboardLayoutCode = fs.readFileSync(dashboardLayoutPath, 'utf8');

  // Critical Invariant: /admin Passkey Bypass
  assert(
    dashboardLayoutCode.includes("pathname === '/admin'") &&
      dashboardLayoutCode.includes("pathname.startsWith('/admin/')") &&
      dashboardLayoutCode.includes('return;'),
    'DashboardLayout contains critical /admin passkey bypass invariant (pathname === "/admin" || pathname.startsWith("/admin/")) return;'
  );

  // Core Navigation Items
  const requiredNavRoutes = [
    '/dashboard',
    '/customers',
    '/measurements',
    '/orders',
    '/production',
    '/staff',
    '/admin',
  ];

  for (const route of requiredNavRoutes) {
    assert(
      dashboardLayoutCode.includes(`href: '${route}'`) || dashboardLayoutCode.includes(`href: "${route}"`),
      `DashboardLayout registers core route: ${route}`
    );
  }

  // Apple Shell Features
  assert(
    dashboardLayoutCode.includes('CommandPalette') && dashboardLayoutCode.includes('useCommandPalette'),
    'DashboardLayout integrates Spotlight-style Command Palette (Ctrl+K / Cmd+K)'
  );
  assert(
    dashboardLayoutCode.includes('useCurrency') && dashboardLayoutCode.includes('SUPPORTED_CURRENCIES'),
    'DashboardLayout integrates multi-currency switcher'
  );
  assert(
    dashboardLayoutCode.includes('Breadcrumb'),
    'DashboardLayout includes hierarchical Breadcrumb navigation'
  );
  assert(
    dashboardLayoutCode.includes('useToast'),
    'DashboardLayout connects Toast notification feedback'
  );

  // Role-Based Navigation Filtering Logic
  const allPlatformRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ATELIER_MANAGER',
    'MASTER_TAILOR',
    'EMBROIDERY_ARTISAN',
    'SALES_FRONT_DESK',
    'QUALITY_INSPECTOR',
    'CUSTOMER_VIEW',
    'ACCOUNTANT',
  ];

  const coreNavEntries = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/customers', label: 'Customers' },
    { href: '/measurements', label: 'Measurements' },
    { href: '/orders', label: 'Orders' },
    { href: '/production', label: 'Production' },
    { href: '/staff', label: 'Staff Management' },
    { href: '/admin', label: 'Admin Panel' },
  ];

  // Verify filterNavItemsForRole against every role
  for (const role of allPlatformRoles) {
    const filtered = filterNavItemsForRole(coreNavEntries, role);
    assert(Array.isArray(filtered), `filterNavItemsForRole returns array for role ${role}`);

    if (role === 'SUPER_ADMIN') {
      const hasAdmin = filtered.some((item) => item.href === '/admin');
      assert(hasAdmin, 'SUPER_ADMIN sees /admin in navigation items');
    } else {
      const hasAdmin = filtered.some((item) => item.href === '/admin');
      assert(!hasAdmin, `Non-admin role ${role} has /admin stripped from navigation items (zero admin leak)`);
    }

    if (role === 'EMBROIDERY_ARTISAN') {
      const hasStaff = filtered.some((item) => item.href === '/staff');
      assert(!hasStaff, 'Karigar (EMBROIDERY_ARTISAN) cannot see /staff in navigation items');
    }
  }

  // 4.2 AuthLayout Source Inspection
  assert(fs.existsSync(authLayoutPath), 'AuthLayout exists at src/app/(auth)/layout.tsx');
  const authLayoutCode = fs.readFileSync(authLayoutPath, 'utf8');

  assert(
    authLayoutCode.includes('#07090E') || authLayoutCode.includes('bg-canvas') || authLayoutCode.includes('#0B0F19'),
    'AuthLayout utilizes deep dark canvas background'
  );
  assert(
    authLayoutCode.includes('Scissors'),
    'AuthLayout features YellowHouse iconic Scissors brand mark'
  );
  assert(
    authLayoutCode.includes('YellowHouse'),
    'AuthLayout displays YellowHouse title'
  );
  assert(
    authLayoutCode.includes('bg-gradient-to-r') && (authLayoutCode.includes('#D4AF37') || authLayoutCode.includes('yellow-600') || authLayoutCode.includes('amber')),
    'AuthLayout includes top gold ambient accent strip'
  );
  assert(
    authLayoutCode.includes('blur-3xl'),
    'AuthLayout renders ambient blurred lighting spheres'
  );

  // ==========================================================================
  // SECTION 5: ADVERSARIAL EDGE CASES & CONTRACT ROBUSTNESS
  // ==========================================================================
  console.log('\n[Subsuite 5: Adversarial Edge Cases & Contract Robustness]');

  // 5.1 XSS and HTML injection escaping in primitives
  const maliciousPayload = `<script>alert('xss')</script><img src="x" onerror="alert(1)">`;
  const xssButtonHtml = renderToStaticMarkup(
    React.createElement(Button, null, maliciousPayload)
  );
  assert(
    !xssButtonHtml.includes('<script>') && xssButtonHtml.includes('&lt;script&gt;'),
    'Button safely escapes raw HTML/script tags in children'
  );

  const xssBadgeHtml = renderToStaticMarkup(
    React.createElement(Badge, null, maliciousPayload)
  );
  assert(
    !xssBadgeHtml.includes('<script>') && xssBadgeHtml.includes('&lt;script&gt;'),
    'Badge safely escapes raw HTML/script tags in children'
  );

  const xssInputHtml = renderToStaticMarkup(
    React.createElement(Input, {
      label: maliciousPayload,
      error: maliciousPayload,
      helperText: maliciousPayload,
    })
  );
  assert(
    !xssInputHtml.includes('<script>'),
    'Input safely escapes HTML in label, error, and helperText'
  );

  // 5.2 Extreme length string stress
  const longText = 'BESPOKE_'.repeat(100);
  const longButtonHtml = renderToStaticMarkup(React.createElement(Button, null, longText));
  assert(longButtonHtml.includes(longText), 'Button renders 800-character text without stack overflow or crash');

  // 5.3 Empty inputs & null handling
  const emptyButtonHtml = renderToStaticMarkup(React.createElement(Button, null));
  assert(emptyButtonHtml.includes('<button'), 'Button with empty children renders valid button element');

  const emptyCardHtml = renderToStaticMarkup(React.createElement(Card, null));
  assert(emptyCardHtml.includes('<div'), 'Card with no children renders valid div element');

  // 5.4 Segmented control edge cases
  const singleOptionSegment = [{ value: 'single', label: 'Only One' }];
  const singleSegmentHtml = renderToStaticMarkup(
    React.createElement(SegmentedControl, {
      options: singleOptionSegment,
      value: 'single',
      onChange: () => {},
    })
  );
  assert(singleSegmentHtml.includes('Only One'), 'SegmentedControl handles single option list without error');

  const emptyOptionsSegment: any[] = [];
  const emptySegmentHtml = renderToStaticMarkup(
    React.createElement(SegmentedControl, {
      options: emptyOptionsSegment,
      value: '',
      onChange: () => {},
    })
  );
  assert(emptySegmentHtml.includes('<div'), 'SegmentedControl handles empty options array gracefully');

  // 5.5 Multi-byte UTF-8, currency & sartorial typography
  const sartorialUnicode = '✂️ 📐 ₹42,500 £3,200 €3,800 🧵 Savile Row • Haute Couture';
  const unicodeCardHtml = renderToStaticMarkup(
    React.createElement(
      Card,
      null,
      React.createElement(CardTitle, null, sartorialUnicode)
    )
  );
  assert(unicodeCardHtml.includes('Savile Row'), 'Card renders Unicode sartorial and multi-currency characters cleanly');

  // 5.6 Invalid prop variant tolerance
  const fallbackBtnClass = buttonVariants({ variant: 'non-existent' as any });
  assert(fallbackBtnClass.length > 0, 'buttonVariants handles invalid variant name gracefully with base classes');

  const fallbackCardClass = cardVariants({ variant: 'invalid-card' as any });
  assert(fallbackCardClass.length > 0, 'cardVariants handles invalid variant name gracefully with base classes');

  // 5.7 Compound hierarchy nesting stress (3 levels of nested cards)
  const nestedHierarchyHtml = renderToStaticMarkup(
    React.createElement(
      Card,
      { variant: 'glass' },
      React.createElement(
        Card,
        { variant: 'elevated' },
        React.createElement(
          Card,
          { variant: 'gold' },
          React.createElement(Badge, { variant: 'gold', dot: true }, 'Deep Nested'),
          React.createElement(Button, { variant: 'gold', size: 'sm' }, 'Nested Action')
        )
      )
    )
  );
  assert(
    nestedHierarchyHtml.includes('Deep Nested') && nestedHierarchyHtml.includes('Nested Action'),
    '3-level deeply nested Card, Badge, and Button hierarchy renders without layout error or crash'
  );

  console.log(`\n================================================================`);
  console.log(`MILESTONE 1 RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  return { passed, failed, findings };
}

// Standalone execution support
if (require.main === module) {
  const result = runM1AppleDesignSystemTests();
  if (result.failed > 0) {
    console.error(`\nTest suite finished with ${result.failed} failures.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${result.passed} tests passed successfully!`);
    process.exit(0);
  }
}
