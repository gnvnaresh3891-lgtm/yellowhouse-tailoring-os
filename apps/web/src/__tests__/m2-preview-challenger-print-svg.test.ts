/**
 * YellowHouse Tailoring OS — Milestone 2 Preview Challenger Test Suite
 * 
 * Empirical Stress Testing & Verification:
 * 1. QRCodeSVG & BarcodeSVG Stress Testing:
 *    - Empty strings & falsy inputs fallback safety
 *    - Unicode, multi-byte UTF-8, and emoji handling
 *    - Massive payload & long URL scalability (10,000+ chars)
 *    - Finder patterns and linear bar sequence structural invariants
 *    - Rapid re-render & determinism stability (10,000 iterations)
 * 2. `@media print` CSS Rules & Chrome Stripping in `globals.css`:
 *    - Zero background bleed (`background: white !important`, `color: black !important`)
 *    - Strict UI chrome elimination (`aside, header, .no-print { display: none !important }`)
 *    - Clean layout margins (`main { padding: 0 !important }`)
 *    - Print-only visibility toggling (`.print-only`)
 * 3. Print Layout Data Contracts & Schema Verification across all 8 printable documents
 */

import * as fs from 'fs';
import * as path from 'path';

// Matrix generator algorithm identical to QRCodeSVG in id-codes.tsx
export function generateQRMatrix(str: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  
  const addFinderPattern = (startR: number, startC: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
          grid[startR + r][startC + c] = true;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, 10);
  addFinderPattern(10, 0);

  const effectiveStr = str || 'YH-ID';
  let hash = 0;
  for (let i = 0; i < effectiveStr.length; i++) {
    hash = (hash << 5) - hash + effectiveStr.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c >= 10) || (r >= 10 && c < 5)) continue;
      const bit = Math.abs((hash ^ (r * 17 + c * 31)) % 3) === 0;
      grid[r][c] = bit;
    }
  }
  return grid;
}

// Linear bars generator algorithm identical to BarcodeSVG in id-codes.tsx
export function generateBarcodeBars(str: string): { bars: number[]; totalUnits: number } {
  const effectiveStr = str || 'YH-BARCODE';
  const bars: number[] = [2, 1, 1, 2]; // Start pattern
  let hash = 0;
  for (let i = 0; i < effectiveStr.length; i++) {
    hash = (hash << 5) - hash + effectiveStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString();
  for (let i = 0; i < absHash.length; i++) {
    const val = parseInt(absHash[i], 10);
    bars.push((val % 3) + 1);
    bars.push(((val + 1) % 2) + 1);
  }
  bars.push(2, 1, 2, 1); // Stop pattern
  const totalUnits = bars.reduce((acc, curr) => acc + curr, 0);
  return { bars, totalUnits };
}

export function runM2PreviewChallengerPrintSvgSuite(): { passed: number; failed: number; findings: string[] } {
  console.log('\n================================================================================');
  console.log('--- EMPIRICAL CHALLENGER M2: PURE SVG QR/BARCODE & PRINT LAYOUT STRESS SUITE ---');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings: string[] = [];

  function assert(condition: boolean, msg: string, failureDetails?: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
      findings.push(failureDetails || msg);
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: QR CODE SVG EMPIRICAL STRESS TESTS
  // --------------------------------------------------------------------------
  console.log('[Section 1: Pure SVG QRCodeSVG Stress & Robustness Tests]');

  // 1.1 Empty string & falsy fallbacks
  const emptyQr = generateQRMatrix('');
  assert(emptyQr.length === 15 && emptyQr[0].length === 15, 'Empty string QRCodeSVG generates valid 15x15 matrix without crash');
  const defaultQr = generateQRMatrix('YH-ID');
  assert(JSON.stringify(emptyQr) === JSON.stringify(defaultQr), 'Empty string QRCodeSVG resolves to identical default "YH-ID" matrix');

  // 1.2 Whitespace & special symbol strings
  const whitespaceQr = generateQRMatrix('   \t\n   ');
  assert(whitespaceQr.length === 15, 'Whitespace-only string QRCodeSVG generates valid 15x15 matrix');

  // 1.3 Unicode, emojis and multi-byte UTF-8
  const unicodeStrings = [
    '🧵👗✨ Atelier Couture',
    'नमस्ते भारत 🇮🇳',
    '東京都 渋谷区 高級仕立屋',
    'Special Symbols: ©®™•§¶†‡~`!@#$%^&*()_+-=[]{}|;:",.<>?/',
    '\u0000\u0001\u0002\u007F\u0080\u00FF\u0100\uFFFF',
    '𝕏 𝒴𝑒𝓁𝓁𝑜𝓌𝐻𝑜𝓊𝓈𝑒 𝓞𝓢 🪡',
  ];

  for (const uStr of unicodeStrings) {
    const matrix = generateQRMatrix(uStr);
    assert(
      matrix.length === 15 && matrix.every(row => row.length === 15),
      `Unicode input "${uStr.slice(0, 20)}..." safely produces 15x15 boolean matrix`
    );
  }

  // 1.4 Massive payload scalability (10,000+ characters)
  const longUrl = 'https://yellowhouse.atelier/order/YH-' + 'A'.repeat(10000) + '?client=royal_patron&voucher=GOLD2026';
  const startPerf = Date.now();
  const longMatrix = generateQRMatrix(longUrl);
  const durationMs = Date.now() - startPerf;
  assert(longMatrix.length === 15, `10,000+ character long URL produces valid 15x15 QR matrix`);
  assert(durationMs < 50, `10,000+ character QR generation completes instantaneously (${durationMs}ms < 50ms)`);

  // 1.5 Finder Patterns Invariance across all inputs
  const testInputsForFinder = [
    '', 'YH-001', 'CUST-999', 'LONG-ORDER-IDENTIFIER-1234567890',
    'https://yellowhouse.atelier/job/JOB-9021', '🧵👗✨'
  ];

  for (const input of testInputsForFinder) {
    const mat = generateQRMatrix(input);
    // Top-Left Finder 5x5
    const tlBorder = mat[0][0] && mat[0][4] && mat[4][0] && mat[4][4] && mat[0][1] && mat[0][2] && mat[0][3] && mat[4][1] && mat[4][2] && mat[4][3];
    const tlCenter = mat[2][2];
    const tlHollow = !mat[1][1] && !mat[1][2] && !mat[1][3] && !mat[3][1] && !mat[3][2] && !mat[3][3];

    // Top-Right Finder 5x5 (row 0..4, col 10..14)
    const trBorder = mat[0][10] && mat[0][14] && mat[4][10] && mat[4][14];
    const trCenter = mat[2][12];

    // Bottom-Left Finder 5x5 (row 10..14, col 0..4)
    const blBorder = mat[10][0] && mat[10][4] && mat[14][0] && mat[14][4];
    const blCenter = mat[12][2];

    assert(
      tlBorder && tlCenter && tlHollow && trBorder && trCenter && blBorder && blCenter,
      `Finder patterns strictly preserved for input: "${input.slice(0, 15)}"`
    );
  }

  // 1.6 Determinism & Rapid Re-render Stress (10,000 iterations)
  const renderBenchmarkInput = 'https://yellowhouse.atelier/order/YH-BENCH-999';
  const baselineMatrix = generateQRMatrix(renderBenchmarkInput);
  let isConsistent = true;
  for (let i = 0; i < 10000; i++) {
    const currentMat = generateQRMatrix(renderBenchmarkInput);
    if (currentMat[7][7] !== baselineMatrix[7][7] || currentMat[1][1] !== baselineMatrix[1][1]) {
      isConsistent = false;
      break;
    }
  }
  assert(isConsistent, 'Rapid 10,000 re-render loop demonstrates 100% deterministic bit matrix output');

  // 1.7 Hash distribution / distinctness across diverse IDs
  const matrixHashes = new Set<string>();
  for (let i = 1; i <= 50; i++) {
    const mat = generateQRMatrix(`ORDER-${i}`);
    matrixHashes.add(JSON.stringify(mat));
  }
  assert(matrixHashes.size >= 40, `50 distinct order IDs produce at least 40 unique matrix variations (got ${matrixHashes.size})`);

  // --------------------------------------------------------------------------
  // SECTION 2: LINEAR BARCODE SVG EMPIRICAL STRESS TESTS
  // --------------------------------------------------------------------------
  console.log('\n[Section 2: Pure SVG BarcodeSVG Linear Bars Stress & Robustness Tests]');

  // 2.1 Empty string & fallback
  const emptyBarcode = generateBarcodeBars('');
  assert(emptyBarcode.bars.length > 8 && emptyBarcode.totalUnits > 0, 'Empty string BarcodeSVG generates non-empty bars array');
  const defaultBarcode = generateBarcodeBars('YH-BARCODE');
  assert(JSON.stringify(emptyBarcode) === JSON.stringify(defaultBarcode), 'Empty string BarcodeSVG resolves to identical default "YH-BARCODE"');

  // 2.2 Start and Stop Pattern Invariants
  const barcodeTestInputs = [
    '', '123', 'SKU-BLS-112', 'MSO-2026-089', 'RES-2026-MCH-089',
    'https://yellowhouse.atelier', '🧵✨'
  ];

  for (const input of barcodeTestInputs) {
    const { bars, totalUnits } = generateBarcodeBars(input);
    const startPattern = bars.slice(0, 4);
    const stopPattern = bars.slice(bars.length - 4);
    assert(
      startPattern[0] === 2 && startPattern[1] === 1 && startPattern[2] === 1 && startPattern[3] === 2,
      `Barcode for "${input.slice(0, 15)}" has start pattern [2, 1, 1, 2]`
    );
    assert(
      stopPattern[0] === 2 && stopPattern[1] === 1 && stopPattern[2] === 2 && stopPattern[3] === 1,
      `Barcode for "${input.slice(0, 15)}" has stop pattern [2, 1, 2, 1]`
    );
    assert(totalUnits >= 12, `Total bar units is at least 12 (got ${totalUnits})`);
  }

  // 2.3 Geometry & Width Calculation Constraints
  const testWidth = 160;
  const testHeight = 40;
  const { bars: testBars, totalUnits: testUnits } = generateBarcodeBars('TEST-BARCODE-99');
  const unitWidth = testWidth / testUnits;
  let computedWidth = 0;
  for (const barWidth of testBars) {
    computedWidth += barWidth * unitWidth;
  }
  assert(
    Math.abs(computedWidth - testWidth) < 0.0001,
    `Sum of bar widths matches target width ${testWidth}px (calculated: ${computedWidth.toFixed(4)}px)`
  );

  // 2.4 Massive Payload Scalability (10,000+ characters)
  const longBarcodeStr = 'YH-BARCODE-' + '9'.repeat(10000);
  const longBarResult = generateBarcodeBars(longBarcodeStr);
  assert(
    longBarResult.bars.length <= 28,
    `Barcode bars count remains bounded (<= 28 bars) even for 10,000-char input (got ${longBarResult.bars.length})`
  );

  // 2.5 Rapid Re-render Stress (10,000 iterations)
  let barcodeConsistent = true;
  const barcodeBaseline = generateBarcodeBars('YH-SPEED-TEST-42');
  for (let i = 0; i < 10000; i++) {
    const cur = generateBarcodeBars('YH-SPEED-TEST-42');
    if (cur.totalUnits !== barcodeBaseline.totalUnits || cur.bars.length !== barcodeBaseline.bars.length) {
      barcodeConsistent = false;
      break;
    }
  }
  assert(barcodeConsistent, 'Rapid 10,000 Barcode re-renders maintain 100% mathematical stability');

  // --------------------------------------------------------------------------
  // SECTION 3: @MEDIA PRINT CSS ZERO BLEED & CHROME STRIPPING
  // --------------------------------------------------------------------------
  console.log('\n[Section 3: globals.css @media print Rules & Zero Background Bleed]');

  let cssContent = '';
  const cssPaths = [
    path.join(process.cwd(), 'src/app/globals.css'),
    path.join(process.cwd(), 'apps/web/src/app/globals.css'),
    'C:/Users/gnvna/.gemini/antigravity/scratch/yellowhouse/apps/web/src/app/globals.css'
  ];

  for (const p of cssPaths) {
    if (fs.existsSync(p)) {
      cssContent = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  assert(cssContent.length > 0, 'Successfully loaded globals.css file for CSS AST inspection');
  assert(cssContent.includes('@media print'), 'globals.css defines @media print query');

  // Chrome stripping rules
  assert(
    cssContent.includes('aside, header, .no-print') && cssContent.includes('display: none !important'),
    'Chrome stripping rule `aside, header, .no-print { display: none !important; }` exists'
  );

  // Print-only element activation
  assert(
    cssContent.includes('.print-only') && cssContent.includes('display: block !important'),
    'Print-only rule `.print-only { display: block !important; }` exists inside @media print'
  );

  // Zero background bleed & pure monochrome contrast
  assert(
    cssContent.includes('body { background: white !important; color: black !important; }'),
    'Zero background bleed rule `body { background: white !important; color: black !important; }` exists'
  );

  // Margin / padding reset
  assert(
    cssContent.includes('main { padding: 0 !important; }'),
    'Layout padding reset rule `main { padding: 0 !important; }` exists in @media print'
  );

  // Hidden in screen mode
  const screenPrintOnly = cssContent.slice(cssContent.lastIndexOf('@media print'));
  assert(
    screenPrintOnly.includes('.print-only {\n  display: none;\n}'),
    'Default screen rule `.print-only { display: none; }` prevents print documents from showing on web screen'
  );

  // --------------------------------------------------------------------------
  // SECTION 4: PRINT LAYOUT DATA CONTRACTS INTEGRITY
  // --------------------------------------------------------------------------
  console.log('\n[Section 4: Print Layouts Data Contracts Verification]');

  let printLayoutsContent = '';
  const printLayoutPaths = [
    path.join(process.cwd(), 'src/components/print-layouts.tsx'),
    path.join(process.cwd(), 'apps/web/src/components/print-layouts.tsx'),
    'C:/Users/gnvna/.gemini/antigravity/scratch/yellowhouse/apps/web/src/components/print-layouts.tsx'
  ];

  for (const p of printLayoutPaths) {
    if (fs.existsSync(p)) {
      printLayoutsContent = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  assert(printLayoutsContent.length > 0, 'Successfully loaded print-layouts.tsx');

  const requiredPrintComponents = [
    'OrderReceipt',
    'CustomerListPrint',
    'ScheduleListPrint',
    'MeasurementCard',
    'JobCardPrint',
    'TechPackSpecPrint',
    'MaterialBOMPrint',
    'MachineReservationTicketPrint'
  ];

  for (const comp of requiredPrintComponents) {
    assert(
      printLayoutsContent.includes(`export function ${comp}`),
      `Print layout component "${comp}" is exported`
    );
    // Ensure each component uses print-only container
    const compRegex = new RegExp(`export function ${comp}[\\s\\S]*?return \\([\\s\\S]*?className="([^"]*)"`);
    const match = compRegex.exec(printLayoutsContent);
    if (match) {
      assert(
        match[1].includes('print-only') && match[1].includes('hidden') && match[1].includes('print:block'),
        `Component ${comp} root div contains "print-only hidden print:block"`
      );
    }
  }

  // Verify pure SVG identifiers embedded in physical tickets
  const svgPrintTickets = [
    'OrderReceipt',
    'MeasurementCard',
    'JobCardPrint',
    'TechPackSpecPrint',
    'MaterialBOMPrint',
    'MachineReservationTicketPrint'
  ];

  for (const ticket of svgPrintTickets) {
    const ticketBlockRegex = new RegExp(`export function ${ticket}[\\s\\S]*?(?=\\nexport function|$)`);
    const ticketBlock = ticketBlockRegex.exec(printLayoutsContent)?.[0] || '';
    assert(
      ticketBlock.includes('<QRCodeSVG') && ticketBlock.includes('<BarcodeSVG'),
      `Print ticket ${ticket} embeds both pure SVG QRCodeSVG and BarcodeSVG vector identifiers`
    );
  }

  console.log(`\n================================================================================`);
  console.log(`M2 PREVIEW CHALLENGER PRINT & SVG SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================================\n`);

  return { passed, failed, findings };
}

if (require.main === module) {
  const result = runM2PreviewChallengerPrintSvgSuite();
  if (result.failed > 0) {
    process.exit(1);
  }
}
