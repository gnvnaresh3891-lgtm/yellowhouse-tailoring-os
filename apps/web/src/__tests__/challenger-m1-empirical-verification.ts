/**
 * YellowHouse Tailoring OS — Challenger 2 Empirical Verification Suite
 * Milestone 1: Apple Design System, UI Primitives, Responsive Layout & Print Media Isolation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface VerificationSummary {
  totalPassed: number;
  totalFailed: number;
  tests: { name: string; status: 'PASS' | 'FAIL'; details?: string }[];
}

export function runChallenger2EmpiricalVerification(): VerificationSummary {
  const tests: { name: string; status: 'PASS' | 'FAIL'; details?: string }[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      tests.push({ name: testName, status: 'PASS' });
      totalPassed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      tests.push({ name: testName, status: 'FAIL', details });
      totalFailed++;
      console.error(`  [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    }
  }

  console.log('\n========================================================================');
  console.log('CHALLENGER 2 EMPIRICAL TEST SUITE: MILESTONE 1 VERIFICATION');
  console.log('========================================================================\n');

  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  const tailwindConfigPath = path.join(webRoot, 'tailwind.config.js');
  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  const dashboardLayoutPath = path.join(webRoot, 'src', 'app', '(dashboard)', 'layout.tsx');
  const uiDir = path.join(webRoot, 'src', 'components', 'ui');

  // --------------------------------------------------------------------------
  // TEST GROUP 1: CSS TOKEN VALIDITY & PALETTE INTEGRITY
  // --------------------------------------------------------------------------
  console.log('[Test Group 1: CSS Token Validity & Palette Integrity]');
  const tailwindConfig = require(tailwindConfigPath);
  const themeExtend = tailwindConfig.theme.extend;

  // 1.1 Font families
  const fonts = themeExtend.fontFamily;
  assert(
    Array.isArray(fonts.sans) && fonts.sans[0] === '-apple-system' && fonts.sans.includes('"SF Pro Text"'),
    'fontFamily.sans includes -apple-system and "SF Pro Text"'
  );
  assert(
    Array.isArray(fonts.display) && fonts.display.includes('"SF Pro Display"'),
    'fontFamily.display includes "SF Pro Display"'
  );
  assert(
    Array.isArray(fonts.mono) && fonts.mono.includes('"SF Mono"'),
    'fontFamily.mono includes "SF Mono"'
  );

  // 1.2 Color palette
  const colors = themeExtend.colors;
  assert(colors.canvas === '#07090E', 'colors.canvas equals #07090E (OLED canvas)');
  assert(
    colors.surface.DEFAULT === '#0D111A' &&
    colors.surface.subtle === '#101625' &&
    colors.surface.elevated === '#141C2E' &&
    colors.surface.card === '#161D2E' &&
    colors.surface.hover === '#1B2438',
    'colors.surface defines 5-tier luminance scale'
  );
  assert(
    colors.gold['500'] === '#D4AF37' &&
    colors.gold['600'] === '#C59B27' &&
    colors.gold['400'] === '#E4BF64' &&
    colors.gold.DEFAULT === '#D4AF37',
    'colors.gold defines atelier gold standard (#D4AF37 / #C59B27 / #E4BF64)'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 2: SHADOW TOKEN MULTI-LAYER DEFINITIONS
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 2: Shadow Token Multi-Layer Definitions]');
  const shadows = themeExtend.boxShadow;

  function countShadowLayers(shadowStr: string): number {
    return shadowStr.split(/,(?![^(]*\))/).length;
  }

  const multiLayerShadowKeys = ['ios-sm', 'ios-md', 'ios-lg', 'ios-xl', 'ios-gold', 'ios-gold-lg'];
  for (const key of multiLayerShadowKeys) {
    const shadowVal = shadows[key];
    assert(typeof shadowVal === 'string' && shadowVal.length > 0, `boxShadow.${key} exists`);
    const layerCount = countShadowLayers(shadowVal);
    assert(
      layerCount >= 2,
      `boxShadow.${key} is multi-layered with >= 2 layers (found ${layerCount} layers: "${shadowVal}")`
    );
  }

  // Verify hairline shadow
  const hairline = shadows.hairline;
  assert(
    hairline === 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
    `boxShadow.hairline correctly defined as inner top bevel highlight (${hairline})`
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 3: SPRING CURVE CUBIC-BEZIER PHYSICS
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 3: Spring Curve Cubic-Bezier Physics]');
  const timingFns = themeExtend.transitionTimingFunction;

  function parseCubicBezier(bezierStr: string): [number, number, number, number] | null {
    const match = bezierStr.match(/cubic-bezier\s*\(\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*\)/);
    if (!match) return null;
    return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4])];
  }

  // Cubic Bezier curve formula B(t) = (1-t)^3 * P0 + 3*(1-t)^2*t * P1 + 3*(1-t)*t^2 * P2 + t^3 * P3
  // P0 = (0, 0), P3 = (1, 1)
  function evaluateBezier(p1: number, p2: number, t: number): number {
    return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
  }

  // 3.1 Spring Token
  const springStr = timingFns.spring;
  assert(springStr === 'cubic-bezier(0.16, 1, 0.3, 1)', `transitionTimingFunction.spring is cubic-bezier(0.16, 1, 0.3, 1)`);
  const springPts = parseCubicBezier(springStr);
  assert(springPts !== null, 'spring cubic-bezier is valid CSS syntax');
  if (springPts) {
    const [x1, y1, x2, y2] = springPts;
    assert(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1, 'spring X control points are within [0, 1]');
    // Verify rapid initial acceleration & ease-out deceleration
    const yAtEarly = evaluateBezier(y1, y2, 0.2); // t=0.2
    assert(yAtEarly > 0.45, `spring exhibits rapid early rise (at t=0.2, Y=${yAtEarly.toFixed(3)} > 0.45)`);
  }

  // 3.2 Spring-Bounce Token
  const bounceStr = timingFns['spring-bounce'];
  assert(bounceStr === 'cubic-bezier(0.34, 1.56, 0.64, 1)', `transitionTimingFunction.spring-bounce is cubic-bezier(0.34, 1.56, 0.64, 1)`);
  const bouncePts = parseCubicBezier(bounceStr);
  assert(bouncePts !== null, 'spring-bounce cubic-bezier is valid CSS syntax');
  if (bouncePts) {
    const [x1, y1, x2, y2] = bouncePts;
    assert(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1, 'spring-bounce X control points are within [0, 1]');
    assert(y1 > 1.0, `spring-bounce exhibits overshoot physics (y1=${y1} > 1.0)`);
    // Sample curve to verify peak overshoot above 1.0
    let maxOverShoot = 0;
    for (let t = 0.1; t <= 0.9; t += 0.05) {
      const y = evaluateBezier(y1, y2, t);
      if (y > maxOverShoot) maxOverShoot = y;
    }
    assert(maxOverShoot > 1.1, `spring-bounce reaches peak overshoot Y=${maxOverShoot.toFixed(3)} > 1.10`);
  }

  // 3.3 Spring Durations
  const durations = themeExtend.transitionDuration;
  assert(durations.spring === '300ms', 'transitionDuration.spring is 300ms');
  assert(durations['spring-fast'] === '200ms', 'transitionDuration.spring-fast is 200ms');
  assert(durations['spring-slow'] === '450ms', 'transitionDuration.spring-slow is 450ms');

  // --------------------------------------------------------------------------
  // TEST GROUP 4: PRINT MEDIA ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 4: Print Media Isolation]');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  // 4.1 Global CSS @media print block
  assert(globalsCss.includes('@media print'), 'globals.css contains @media print declaration');
  assert(
    globalsCss.includes('aside, header, .no-print { display: none !important; }'),
    '@media print hides aside, header, and .no-print elements with !important'
  );
  assert(
    globalsCss.includes('.print-only { display: block !important; }'),
    '@media print displays .print-only elements with !important'
  );
  assert(
    globalsCss.includes('body { background: white !important; color: black !important; }'),
    '@media print resets body to pure white background and pure black ink'
  );
  assert(
    globalsCss.includes('main { padding: 0 !important; }'),
    '@media print resets main container padding to 0 !important'
  );
  assert(
    globalsCss.includes('.print-only {\n  display: none;\n}') || globalsCss.includes('.print-only { display: none; }'),
    'Default screen mode strictly hides .print-only'
  );

  // 4.2 Dashboard Layout Print Isolation Invariants
  const dashboardLayoutCode = fs.readFileSync(dashboardLayoutPath, 'utf8');
  assert(
    dashboardLayoutCode.includes('<aside') &&
    dashboardLayoutCode.includes('className={`no-print') || dashboardLayoutCode.includes('no-print fixed'),
    'Sidebar <aside> element is marked with class "no-print"'
  );
  assert(
    dashboardLayoutCode.includes('<header className="no-print'),
    'Topbar <header> element is marked with class "no-print"'
  );
  assert(
    dashboardLayoutCode.includes('className="no-print px-4 lg:px-8 py-2.5 border-b'),
    'Breadcrumb navigation bar is marked with class "no-print"'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 5: RESPONSIVE LAYOUT MECHANISMS
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 5: Responsive Layout Mechanisms]');

  // 5.1 Sidebar responsive drawer
  assert(
    dashboardLayoutCode.includes('lg:translate-x-0') && dashboardLayoutCode.includes('-translate-x-full'),
    'Sidebar is off-canvas (-translate-x-full) by default on mobile and pinned (lg:translate-x-0) on desktop'
  );
  assert(
    dashboardLayoutCode.includes('mobileMenuOpen ? \'translate-x-0 shadow-ios-xl\' : \'-translate-x-full\''),
    'Sidebar animates on-canvas when mobileMenuOpen is true'
  );

  // 5.2 Mobile Backdrop and Body Scroll Lock
  assert(
    dashboardLayoutCode.includes('mobileMenuOpen && (') && dashboardLayoutCode.includes('fixed inset-0 bg-black/70'),
    'Mobile backdrop overlay renders conditionally when mobileMenuOpen is true'
  );
  assert(
    dashboardLayoutCode.includes("document.body.style.overflow = 'hidden'"),
    'Body scroll locking is active while mobileMenuOpen is true'
  );

  // 5.3 Responsive Topbar Elements
  assert(
    dashboardLayoutCode.includes('hidden md:flex') && dashboardLayoutCode.includes('Search atelier, orders, clients...'),
    'Spotlight Search bar is responsive (hidden on mobile, visible md+)'
  );
  assert(
    dashboardLayoutCode.includes('hidden sm:inline') && dashboardLayoutCode.includes('currentCurrency.code'),
    'Currency code label is responsive (hidden on xs mobile, visible sm+)'
  );
  assert(
    dashboardLayoutCode.includes('hidden sm:block') && dashboardLayoutCode.includes('activeUser.name'),
    'User profile name is responsive (hidden on xs mobile, visible sm+)'
  );
  assert(
    dashboardLayoutCode.includes('p-4 sm:p-6 lg:p-8'),
    'Main viewport uses progressive responsive padding (p-4 -> sm:p-6 -> lg:p-8)'
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 6: WCAG AA/AAA CONTRAST EMPIRICAL CALCULATION
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 6: WCAG AA/AAA Color Contrast]');

  function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function relativeLuminance([r, g, b]: [number, number, number]): number {
    const srgb = [r / 255, g / 255, b / 255].map((val) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  function contrastRatio(hex1: string, hex2: string): number {
    const lum1 = relativeLuminance(hexToRgb(hex1));
    const lum2 = relativeLuminance(hexToRgb(hex2));
    const brighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  // 6.1 Text on OLED canvas
  const canvasRatio = contrastRatio('#F1F5F9', '#07090E');
  assert(
    canvasRatio >= 7.0,
    `Primary text #F1F5F9 on OLED canvas #07090E meets WCAG AAA standard (Ratio: ${canvasRatio.toFixed(2)}:1 >= 7.0:1)`
  );

  // 6.2 Slate-400 secondary text on surface #0D111A
  const slateTextRatio = contrastRatio('#94A3B8', '#0D111A');
  assert(
    slateTextRatio >= 4.5,
    `Secondary text #94A3B8 on surface #0D111A meets WCAG AA standard (Ratio: ${slateTextRatio.toFixed(2)}:1 >= 4.5:1)`
  );

  // 6.3 Dark text #07090E on Gold button #D4AF37
  const goldBtnRatio = contrastRatio('#07090E', '#D4AF37');
  assert(
    goldBtnRatio >= 4.5,
    `Dark text #07090E on Gold button #D4AF37 meets WCAG AA standard (Ratio: ${goldBtnRatio.toFixed(2)}:1 >= 4.5:1)`
  );

  console.log('\n========================================================================');
  console.log(`CHALLENGER 2 SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('========================================================================\n');

  return { totalPassed, totalFailed, tests };
}

if (require.main === module) {
  const summary = runChallenger2EmpiricalVerification();
  if (summary.totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
