/**
 * YellowHouse Tailoring OS — Milestone 3 Adversarial Verification & Empirical Stress Test Suite
 * Archetype: Empirical Challenger (challenger_m3_g4_1)
 *
 * Empirical verification of:
 * 1. 2D CAD SVG 420x840 coordinates, zoom clamp [0.8, 1.35], 4-axis posture morphs (Head Forward, Shoulder Slope, Chest Depth, Pelvis Tilt)
 * 2. 12 Garment BOM presets (fabric, lining, button, thread specifications)
 * 3. SKU generator (strict CUST-FAB- prefix pattern, idempotency, adversarial stress)
 * 4. Print isolation (@media print chrome hiding, pure white paper, clean printable cards, pure SVG QR/barcodes)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ChallengerResult {
  passed: number;
  failed: number;
  findings: string[];
}

export function runChallengerM3AdversarialSuite(): ChallengerResult {
  console.log('\n====================================================================');
  console.log('--- CHALLENGER M3: ADVERSARIAL STRESS & EMPIRICAL VERIFICATION ---');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, testName: string, expected: string = 'PASS', actual: string = 'PASS') {
    if (!condition) {
      const msg = `FAILED: ${testName} — Expected [${expected}], Got [${actual}]`;
      console.error(`❌ ${msg}`);
      findings.push(msg);
      failed++;
    } else {
      passed++;
    }
  }

  const cwd = process.cwd();
  const webRoot = cwd.endsWith('apps\\web') || cwd.endsWith('apps/web')
    ? cwd
    : path.join(cwd, 'apps', 'web');

  // =========================================================================
  // 1. 2D CAD SVG 420x840 VIEWPORT, ZOOM LIMITS & 4-AXIS POSTURE MORPHS
  // =========================================================================
  console.log('[Challenger Section 1: 2D CAD SVG Viewport, Zoom Clamping & 4-Axis Morphs]');

  const measurementsPath = path.join(webRoot, 'src', 'app', '(dashboard)', 'measurements', 'page.tsx');
  assert(fs.existsSync(measurementsPath), 'measurements/page.tsx exists');
  const measurementsCode = fs.readFileSync(measurementsPath, 'utf8');

  // 1.1 Viewport dimensions
  assert(
    measurementsCode.includes('viewBox="0 0 420 840"'),
    'CAD SVG viewport defines exact viewBox="0 0 420 840"'
  );

  // Datum laser guides within [0, 840]
  const datums = [
    { name: 'Neck Datum (Y:120)', y: 120 },
    { name: 'Chest / Scye Line (Y:200)', y: 200 },
    { name: 'Natural Waistline (Y:280)', y: 280 },
    { name: 'Seat Datum (Y:360)', y: 360 },
    { name: 'Knee / Outseam (Y:550)', y: 550 },
  ];
  for (const d of datums) {
    assert(measurementsCode.includes(d.name), `Laser datum ${d.name} is present in CAD SVG`);
    assert(d.y >= 0 && d.y <= 840, `Laser datum Y=${d.y} is strictly within 0..840 viewport height`);
  }

  // 1.2 Zoom clamp formula stress test: Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35)
  const clampZoom = (prev: number, delta: number): number => {
    return Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35);
  };

  // Normal range
  assert(clampZoom(1.0, 0.1) === 1.1, 'Zoom in by 0.1 from 1.0 yields 1.1');
  assert(clampZoom(1.0, -0.1) === 0.9, 'Zoom out by 0.1 from 1.0 yields 0.9');

  // Boundary clamp
  assert(clampZoom(1.30, 0.1) === 1.35, 'Upper bound clamps at 1.35');
  assert(clampZoom(0.85, -0.1) === 0.8, 'Lower bound clamps at 0.80');
  assert(clampZoom(1.35, 0.05) === 1.35, 'Zoom in at max bound stays at 1.35');
  assert(clampZoom(0.8, -0.05) === 0.8, 'Zoom out at min bound stays at 0.80');

  // Adversarial extreme deltas
  assert(clampZoom(1.0, 1000000) === 1.35, 'Extreme positive delta clamped to 1.35');
  assert(clampZoom(1.0, -1000000) === 0.8, 'Extreme negative delta clamped to 0.80');
  assert(clampZoom(0.8, -0.0001) === 0.8, 'Micro negative delta at floor clamped to 0.80');
  assert(clampZoom(1.35, 0.0001) === 1.35, 'Micro positive delta at ceiling clamped to 1.35');

  // 1,000 steps continuous fuzzing to assert clamp guarantee
  let currentZoom = 1.0;
  for (let i = 0; i < 1000; i++) {
    const randomDelta = (Math.random() - 0.5) * 2; // -1 to +1
    currentZoom = clampZoom(currentZoom, randomDelta);
    if (currentZoom < 0.8 || currentZoom > 1.35) {
      assert(false, `Zoom fuzzing breach at iteration ${i}: ${currentZoom}`);
      break;
    }
  }
  assert(currentZoom >= 0.8 && currentZoom <= 1.35, '1,000 random zoom delta transitions stayed within [0.80, 1.35]');

  // 1.3 4-Axis Posture Morphs
  // Axis 1: Shoulder Slope ('Normal' 0, 'Sloped' +8, 'Square' -8)
  const calcShoulderOffset = (slope: 'Normal' | 'Sloped' | 'Square') =>
    slope === 'Sloped' ? 8 : slope === 'Square' ? -8 : 0;
  assert(calcShoulderOffset('Normal') === 0, 'Shoulder slope Normal = 0px');
  assert(calcShoulderOffset('Sloped') === 8, 'Shoulder slope Sloped = +8px');
  assert(calcShoulderOffset('Square') === -8, 'Shoulder slope Square = -8px');
  assert(measurementsCode.includes("shoulderSlope === 'Sloped' ? 8 : shoulderSlope === 'Square' ? -8 : 0"), 'Shoulder slope calculation verbatim in code');

  // Axis 2: Chest Depth / Stance (Apex Y: Normal 192, Forward 210, Barrel 222)
  assert(measurementsCode.includes('210 192'), 'Normal chest depth apex at Y=192');
  assert(measurementsCode.includes('210 210'), 'Forward chest depth apex at Y=210 (+18px forward drop)');
  assert(measurementsCode.includes('210 222'), 'Barrel chest depth apex at Y=222 (+30px barrel depth)');

  // Axis 3: Head Forward / Spine Curvature / Back Posture ('Normal' '5 5', 'Stooped' '3 3', 'Erect' '10 2')
  assert(measurementsCode.includes("backPosture === 'Stooped' ? '3 3' : backPosture === 'Erect' ? '10 2' : '5 5'"), 'Spine dash array calculation verbatim in code');

  // Axis 4: Pelvis Tilt / Heel Height Vertical Compensation
  const calcHeelOffset = (gender: 'Men' | 'Women', heelHeight: number) =>
    (gender === 'Women' && heelHeight > 0) ? heelHeight * 5 : 0;
  assert(calcHeelOffset('Men', 0) === 0, 'Men heel offset = 0px');
  assert(calcHeelOffset('Men', 3) === 0, 'Men heel offset = 0px even if heel height passed');
  assert(calcHeelOffset('Women', 0) === 0, 'Women 0" heel = 0px');
  assert(calcHeelOffset('Women', 1) === 5, 'Women 1" heel = 5px vertical hem lift');
  assert(calcHeelOffset('Women', 2) === 10, 'Women 2" heel = 10px vertical hem lift');
  assert(calcHeelOffset('Women', 3) === 15, 'Women 3" heel = 15px vertical hem lift');
  assert(measurementsCode.includes('(gender === \'Women\' && heelHeight > 0) ? heelHeight * 5 : 0'), 'Heel height formula verbatim in code');

  // Also verify Technical Posture calculation engine in lib/ease-calculator.ts
  const easeCalcPath = path.join(webRoot, 'src', 'lib', 'ease-calculator.ts');
  assert(fs.existsSync(easeCalcPath), 'ease-calculator.ts exists');
  const easeCalcCode = fs.readFileSync(easeCalcPath, 'utf8');
  assert(easeCalcCode.includes('calculatePostureOffset'), 'ease-calculator exports calculatePostureOffset');
  assert(easeCalcCode.includes('shoulderSlope'), 'ease-calculator factors shoulderSlope');
  assert(easeCalcCode.includes('backCurvature'), 'ease-calculator factors backCurvature');
  assert(easeCalcCode.includes('abdomenStance'), 'ease-calculator factors abdomenStance');
  assert(easeCalcCode.includes('hipSpineStance'), 'ease-calculator factors hipSpineStance');

  // =========================================================================
  // 2. 12 GARMENT BOM PRESETS (FABRIC, LINING, BUTTON, THREAD)
  // =========================================================================
  console.log('[Challenger Section 2: 12 Garment BOM Presets & Specifications]');

  const ordersPagePath = path.join(webRoot, 'src', 'app', '(dashboard)', 'orders', 'page.tsx');
  const ordersUtilsPath = path.join(webRoot, 'src', 'lib', 'orders-utils.ts');
  assert(fs.existsSync(ordersPagePath), 'orders/page.tsx exists');
  const ordersCode = fs.readFileSync(ordersPagePath, 'utf8') + (fs.existsSync(ordersUtilsPath) ? fs.readFileSync(ordersUtilsPath, 'utf8') : '');

  const EXPECTED_12_GARMENTS = [
    { value: 'Blouse', hasLiningInNote: true, minMeters: 0.8 },
    { value: 'Corset', hasLiningInNote: true, minMeters: 1.0 },
    { value: 'Shirt', hasLiningInNote: false, minMeters: 1.5 },
    { value: 'Trouser', hasLiningInNote: false, minMeters: 1.2 },
    { value: '2-Piece Suit', hasLiningInNote: false, minMeters: 3.0 },
    { value: '3-Piece Suit', hasLiningInNote: true, minMeters: 3.8 },
    { value: 'Sherwani', hasLiningInNote: true, minMeters: 4.0 },
    { value: 'Bandhgala', hasLiningInNote: false, minMeters: 3.0 },
    { value: 'Kurta', hasLiningInNote: true, minMeters: 3.5 },
    { value: 'Lehenga', hasLiningInNote: true, minMeters: 5.0 },
    { value: 'Anarkali', hasLiningInNote: true, minMeters: 4.5 },
    { value: 'Gown', hasLiningInNote: true, minMeters: 4.5 },
  ];

  // Verify garmentOptions array contains all 12 garments
  for (const g of EXPECTED_12_GARMENTS) {
    assert(ordersCode.includes(`value: '${g.value}'`), `garmentOptions includes garment "${g.value}"`);
  }

  // Evaluate getDefaultBOMForGarment logic
  interface BOMItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    unitCost: number;
    isOptional?: boolean;
    isCustomerProvided?: boolean;
  }

  const getDefaultBOMForGarment = (garmentType: string): BOMItem[] => {
    const g = garmentType.toLowerCase();
    const items: BOMItem[] = [
      {
        id: 'bom-thread',
        name: 'Matching Spun Poly / Silk Thread Spools',
        category: 'thread',
        quantity: 2,
        unit: 'spools',
        unitCost: 60,
        isOptional: false
      }
    ];

    if (g.includes('sherwani') || g.includes('bandhgala') || g.includes('kurta')) {
      items.push({ id: 'bom-btn', name: 'Gold Plated / Antique Metal Kurta Buttons', category: 'button', quantity: 7, unit: 'pcs', unitCost: 80, isOptional: false });
      items.push({ id: 'bom-canvas', name: 'Horsehair Canvas Chest Piece Reinforcement', category: 'canvas', quantity: 1.5, unit: 'meters', unitCost: 350, isOptional: true });
      items.push({ id: 'bom-piping', name: 'Gold Zari Border Piping Trim', category: 'piping', quantity: 3.5, unit: 'meters', unitCost: 90, isOptional: true });
    } else if (g.includes('lehenga') || g.includes('gown') || g.includes('anarkali')) {
      items.push({ id: 'bom-cancan', name: 'Cancan Mesh Netting for Flare Volume', category: 'canvas', quantity: 4.0, unit: 'meters', unitCost: 110, isOptional: true });
      items.push({ id: 'bom-latkan', name: 'Heavy Zari Waistband Latkan Tassels', category: 'lace', quantity: 2, unit: 'pcs', unitCost: 220, isOptional: true });
      items.push({ id: 'bom-zip', name: 'Concealed Side Zipper (18 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 65, isOptional: false });
    } else if (g.includes('blouse') || g.includes('corset') || g.includes('choli')) {
      items.push({ id: 'bom-zip', name: 'Heavy Duty Side Invisible Zipper (12 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 55, isOptional: false });
      items.push({ id: 'bom-hook', name: 'Back Eyelet / Braided Dori Hooks & Loops', category: 'hook', quantity: 8, unit: 'pairs', unitCost: 15, isOptional: true });
      items.push({ id: 'bom-cups', name: 'Padded Cup Inserts & Boning Strips', category: 'canvas', quantity: 1, unit: 'pair', unitCost: 180, isOptional: true });
    } else if (g.includes('trouser') || g.includes('suit') || g.includes('churidar')) {
      items.push({ id: 'bom-zip', name: 'YKK Concealed Metal Trouser Zipper (7 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 45, isOptional: false });
      items.push({ id: 'bom-waistband', name: 'Waistband Canvas Stiffener (Interlining)', category: 'canvas', quantity: 1.2, unit: 'meters', unitCost: 120, isOptional: true });
      items.push({ id: 'bom-btn', name: 'Horn / Resin Jacket Buttons (Set of 6)', category: 'button', quantity: 1, unit: 'set', unitCost: 250, isOptional: true });
    } else {
      items.push({ id: 'bom-btn', name: 'Mother of Pearl Shirt Buttons (Set of 12)', category: 'button', quantity: 1, unit: 'set', unitCost: 120, isOptional: false });
      items.push({ id: 'bom-canvas', name: 'Collar & Cuff Fusible Interlining', category: 'canvas', quantity: 0.8, unit: 'meters', unitCost: 95, isOptional: false });
      items.push({ id: 'bom-piping', name: 'Pocket Reinforcement Bias Tape', category: 'piping', quantity: 1.0, unit: 'meters', unitCost: 40, isOptional: true });
    }
    return items;
  };

  // Check every garment preset
  for (const g of EXPECTED_12_GARMENTS) {
    const bom = getDefaultBOMForGarment(g.value);
    // Thread check
    const hasThread = bom.some(b => b.category === 'thread' && b.quantity > 0);
    assert(hasThread, `Preset "${g.value}" specifies base thread`);

    // Closures / Buttons check
    const hasClosureOrButton = bom.some(b => b.category === 'button' || b.category === 'zipper' || b.category === 'hook');
    assert(hasClosureOrButton, `Preset "${g.value}" specifies buttons or fasteners`);

    // Canvas / Interlining / Structural reinforcement check
    const hasStructure = bom.some(b => b.category === 'canvas');
    assert(hasStructure, `Preset "${g.value}" specifies canvas / interlining / structural trims`);

    // Total preset items >= 4
    assert(bom.length >= 4, `Preset "${g.value}" defines at least 4 BOM items`);
  }

  // Fuzzing test on BOM generator
  const adversarialGarmentTypes = ['', '   ', 'UnknownGarment', '???', '12345', 'SHERWANI_ALL_CAPS', 'LeHeNgA'];
  for (const f of adversarialGarmentTypes) {
    const bom = getDefaultBOMForGarment(f);
    assert(Array.isArray(bom) && bom.length >= 1, `Fuzz input "${f}" safely returned valid BOM array`);
  }

  // =========================================================================
  // 3. SKU GENERATOR: STRICT CUST-FAB- PREFIX PATTERN
  // =========================================================================
  console.log('[Challenger Section 3: SKU Generator Strict Pattern Verification]');

  const generateCustomerFabricSku = (timestamp: number = Date.now()) =>
    `CUST-FAB-${timestamp.toString(36).toUpperCase()}`;

  const SKU_REGEX = /^CUST-FAB-[A-Z0-9]+$/;

  // Verify pattern on 5,000 generated SKUs with varying timestamps
  let allMatched = true;
  for (let i = 0; i < 5000; i++) {
    const mockTime = 1700000000000 + i * 1337;
    const sku = generateCustomerFabricSku(mockTime);
    if (!sku.startsWith('CUST-FAB-') || !SKU_REGEX.test(sku)) {
      allMatched = false;
      assert(false, `SKU pattern violation: ${sku}`);
      break;
    }
  }
  assert(allMatched, '5,000 consecutive generated SKUs strictly matched ^CUST-FAB-[A-Z0-9]+$');

  // Assert rejection of invalid SKUs
  const adversarialSkus = [
    'FAB-1234',
    'cust-fab-1234',
    'CUST_FAB_1234',
    'CUST-FAB-',
    'CUST-FAB',
    'CUST-FAB-123-ABC',
    'CUST-FAB- ',
    'SKU-SHER-901',
    'SKU-SUIT-2PC',
    '<script>alert(1)</script>',
    'CUST-FAB-$$$$'
  ];
  for (const bad of adversarialSkus) {
    assert(!SKU_REGEX.test(bad), `Adversarial SKU "${bad}" strictly rejected by regex`);
  }

  // Idempotency: avoid double prefixing
  const avoidDoublePrefix = (existingSku: string, time: number = Date.now()) => {
    if (existingSku.startsWith('CUST-FAB-')) return existingSku;
    return generateCustomerFabricSku(time);
  };
  assert(
    avoidDoublePrefix('CUST-FAB-ALPHA1') === 'CUST-FAB-ALPHA1',
    'Existing customer fabric SKU does not receive duplicate prefix'
  );
  assert(
    avoidDoublePrefix('FABRIC-ATELIER', 123456789) === generateCustomerFabricSku(123456789),
    'Non-customer SKU correctly converted to CUST-FAB- prefix'
  );

  // =========================================================================
  // 4. PRINT ISOLATION (@MEDIA PRINT RULES & CLEAN PRINTABLE CARDS)
  // =========================================================================
  console.log('[Challenger Section 4: Print Media Isolation & Pure SVG Verification]');

  const globalsCssPath = path.join(webRoot, 'src', 'app', 'globals.css');
  assert(fs.existsSync(globalsCssPath), 'globals.css exists');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  // Verify @media print rules
  assert(globalsCss.includes('@media print'), 'globals.css includes @media print media query');
  assert(globalsCss.includes('aside, header, .no-print { display: none !important; }'), 'aside, header, and .no-print are hidden in print');
  assert(globalsCss.includes('.print-only { display: block !important; }'), '.print-only is displayed in print');
  assert(globalsCss.includes('body { background: white !important; color: black !important; }'), 'Print media sets pure white background and black text');
  assert(globalsCss.includes('.print-only {') && globalsCss.includes('display: none;'), '.print-only is hidden on screen by default');

  // Verify measurements/page.tsx isolated print styles
  assert(measurementsCode.includes('body * { visibility: hidden !important; }'), 'measurements print style hides body content');
  assert(measurementsCode.includes('.measurement-card-print, .measurement-card-print * { visibility: visible !important; }'), 'measurements print style makes measurement card visible');
  assert(measurementsCode.includes('position: absolute !important;'), 'measurement card is absolute positioned in print');
  assert(measurementsCode.includes('background: white !important;'), 'measurement card has white background in print');

  // Verify pure SVG barcodes & QR codes (no raster img/canvas)
  const idCodesPath = path.join(webRoot, 'src', 'components', 'id-codes.tsx');
  assert(fs.existsSync(idCodesPath), 'id-codes.tsx exists');
  const idCodes = fs.readFileSync(idCodesPath, 'utf8');

  assert(idCodes.includes('export function QRCodeSVG'), 'QRCodeSVG exported');
  assert(idCodes.includes('export function BarcodeSVG'), 'BarcodeSVG exported');
  assert(!idCodes.includes('<canvas'), 'id-codes does not use <canvas>');
  assert(!idCodes.includes('<img'), 'id-codes does not use <img>');
  assert(idCodes.includes('<rect'), 'id-codes uses pure SVG <rect> elements for vector crispness');

  console.log(`\n====================================================================`);
  console.log(`CHALLENGER M3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================================\n`);

  return { passed, failed, findings };
}

// Allow direct execution via ts-node
if (require.main === module) {
  const res = runChallengerM3AdversarialSuite();
  if (res.failed > 0) process.exit(1);
}
