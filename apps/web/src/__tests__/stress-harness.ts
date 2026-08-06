import { getAllGarmentTemplates, getGarmentTemplate, getGarmentTemplatesByGender, POM_SCHEMAS } from '../lib/pom-schemas';
import { calculateAllEaseResults, calculateDynamicEase, calculatePostureOffset, getFitPreferenceModifier } from '../lib/ease-calculator';
import { calculateFabricYield } from '../lib/fabric-yield';
import { GarmentCategory, PomSchemaItem, PostureProfile } from '../types/measurement';

let passed = 0;
let failed = 0;

function check(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FAIL: [${testName}] ${detail || ''}`);
    failed++;
  } else {
    console.log(`✅ PASS: [${testName}]`);
    passed++;
  }
}

console.log('\n==================================================');
console.log('--- COMPREHENSIVE STRESS TEST HARNESS (M1) ---');
console.log('==================================================\n');

// --- 1. EXISTING UNIT SUITE DISCREPANCY CHECK ---
console.log('--- SECTION 1: Standard Unit Test Verification ---');

const suitYield = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 44 });
check(suitYield.requiredMeters === 5.00, "Men's suit 44\" bolt width yield == 5.00m", `Got ${suitYield.requiredMeters}`);

const sherwaniYield54 = calculateFabricYield({ garmentCategory: 'mens-sherwani', boltWidth: 54 });
check(sherwaniYield54.requiredMeters === 3.67, "Men's sherwani 54\" bolt width yield == 3.67m", `Got ${sherwaniYield54.requiredMeters}`);

const lehenga24Kali = calculateFabricYield({ garmentCategory: 'womens-lehenga', boltWidth: 44, panelCount: 24 });
console.log(`[Diagnostic] lehenga24Kali returned: ${JSON.stringify(lehenga24Kali)}`);
check(lehenga24Kali.requiredMeters === 8.41, "Women's 24-kali lehenga computed math check (5.80 * 1.45 = 8.41m)", `Got ${lehenga24Kali.requiredMeters}`);

// --- 2. ZERO & NEGATIVE MEASUREMENTS ---
console.log('\n--- SECTION 2: Zero & Negative Net Body Measurements ---');

const samplePom: PomSchemaItem = {
  id: 'm-su-01', code: 'M-SU-01', name: 'Jacket Chest', category: 'girth',
  baseMeasurement: 40.0, defaultEase: 3.5, unit: 'in', validationRange: { min: 30.0, max: 60.0 }
};

const normalPosture: PostureProfile = {
  shoulderSlope: 'normal', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal'
};

const zeroNetResult = calculateDynamicEase({
  pomItem: samplePom, netBody: 0, fitPreference: 'regular', postureProfile: normalPosture
});
console.log(`[Diagnostic] Zero net body result: ${zeroNetResult.targetGarmentMeasurement}`);
check(zeroNetResult.targetGarmentMeasurement === 3.5, "Zero net body measurement results in target = ease allowance (3.5\")", `Got ${zeroNetResult.targetGarmentMeasurement}`);
check(!isNaN(zeroNetResult.targetGarmentMeasurement), "Zero net body does not produce NaN");

const negNetResult = calculateDynamicEase({
  pomItem: samplePom, netBody: -10.0, fitPreference: 'regular', postureProfile: normalPosture
});
console.log(`[Diagnostic] Negative net body result: ${negNetResult.targetGarmentMeasurement}`);
check(negNetResult.targetGarmentMeasurement === -6.5, "Negative net body calculation produces numerical result without crashing", `Got ${negNetResult.targetGarmentMeasurement}`);
check(!isNaN(negNetResult.targetGarmentMeasurement), "Negative net body does not produce NaN");

// --- 3. EXTREME POSTURE COMBINATIONS ---
console.log('\n--- SECTION 3: Extreme Posture Combinations ---');

const extremePosture: PostureProfile = {
  shoulderSlope: 'very_sloped',
  backCurvature: 'stooped',
  abdomenStance: 'prominent',
  hipSpineStance: 'sway_back'
};

const extremeChest = calculateDynamicEase({
  pomItem: samplePom, netBody: 40.0, fitPreference: 'regular', postureProfile: extremePosture
});
// Chest girth gets +0.375 from stooped
check(extremeChest.postureOffset === 0.375, "Extreme posture chest girth posture offset == 0.375", `Got ${extremeChest.postureOffset}`);

const waistPom: PomSchemaItem = {
  id: 'm-su-02', code: 'M-SU-02', name: 'Buttoning Waist Point', category: 'girth',
  baseMeasurement: 34.0, defaultEase: 2.5, unit: 'in', validationRange: { min: 26.0, max: 56.0 }
};
const extremeWaist = calculateDynamicEase({
  pomItem: waistPom, netBody: 34.0, fitPreference: 'relaxed', postureProfile: extremePosture
});
// Waist girth gets +1.0 from prominent abdomen
check(extremeWaist.postureOffset === 1.0, "Extreme posture waist girth posture offset == 1.0", `Got ${extremeWaist.postureOffset}`);
check(extremeWaist.targetGarmentMeasurement === 38.75, "Extreme posture waist target == 34 + 2.5 + 1.25 + 1.0 = 38.75", `Got ${extremeWaist.targetGarmentMeasurement}`);

const backLengthPom: PomSchemaItem = {
  id: 'm-su-05', code: 'M-SU-05', name: 'Center Back Jacket Length', category: 'length',
  baseMeasurement: 30.0, defaultEase: 0.0, unit: 'in', validationRange: { min: 24.0, max: 38.0 }
};
const extremeBackLength = calculateDynamicEase({
  pomItem: backLengthPom, netBody: 30.0, fitPreference: 'regular', postureProfile: extremePosture
});
// Back length gets +0.50 from stooped, -0.625 from sway_back -> compound offset = -0.125
check(extremeBackLength.postureOffset === -0.125, "Compound back length offset (stooped + sway_back) == +0.50 - 0.625 = -0.125", `Got ${extremeBackLength.postureOffset}`);

// --- 4. STRETCH DEDUCTION BOUNDS ---
console.log('\n--- SECTION 4: Stretch Deduction Bounds & Non-girth Categories ---');

const stretch100 = calculateDynamicEase({
  pomItem: samplePom, netBody: 40.0, fitPreference: 'regular', postureProfile: normalPosture, stretchPercent: 100
});
check(stretch100.stretchFactor === 20.0, "100% stretch on girth results in 50% net body deduction (20.0\")", `Got ${stretch100.stretchFactor}`);

const stretchNeg = calculateDynamicEase({
  pomItem: samplePom, netBody: 40.0, fitPreference: 'regular', postureProfile: normalPosture, stretchPercent: -10
});
console.log(`[Diagnostic] Negative stretch percent result: stretchFactor=${stretchNeg.stretchFactor}`);
check(stretchNeg.stretchFactor === 0, "Negative stretch percent produces 0 stretch factor (not negative deduction)", `Got ${stretchNeg.stretchFactor}`);

const nonGirthStretch = calculateDynamicEase({
  pomItem: backLengthPom, netBody: 30.0, fitPreference: 'regular', postureProfile: normalPosture, stretchPercent: 20
});
check(nonGirthStretch.stretchFactor === 0, "Stretch deduction ignored on non-girth category (length)", `Got ${nonGirthStretch.stretchFactor}`);

// --- 5. FABRIC YIELD BOLT WIDTH BOUNDARIES & DIV BY ZERO ---
console.log('\n--- SECTION 5: Fabric Yield Bolt Width Boundaries & Division By Zero ---');

const yieldZeroWidth = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 0 });
console.log(`[Diagnostic] Fabric yield with boltWidth=0: requiredMeters=${yieldZeroWidth.requiredMeters}`);
check(!isFinite(yieldZeroWidth.requiredMeters) || isNaN(yieldZeroWidth.requiredMeters) || yieldZeroWidth.requiredMeters > 0, "Fabric yield with boltWidth=0 evaluated");

const yieldNegWidth = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: -44 });
console.log(`[Diagnostic] Fabric yield with boltWidth=-44: requiredMeters=${yieldNegWidth.requiredMeters}`);

const yieldLargeWidth = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 120 });
console.log(`[Diagnostic] Fabric yield with boltWidth=120: requiredMeters=${yieldLargeWidth.requiredMeters}`);
check(yieldLargeWidth.requiredMeters === 1.83, "Fabric yield with 120\" bolt width correctly scales down yardage", `Got ${yieldLargeWidth.requiredMeters}`);

// --- 6. ALL GARMENT CATEGORIES COMPREHENSIVE SCHEMAS CHECK ---
console.log('\n--- SECTION 6: All Garment Schemas & Ease Calculation ---');

const categories: GarmentCategory[] = [
  'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
  'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
];

for (const cat of categories) {
  const tmpl = getGarmentTemplate(cat);
  check(tmpl && tmpl.poms.length > 0, `Template ${cat} loaded with ${tmpl?.poms.length} POMs`);

  const results = calculateAllEaseResults(cat, {}, 'regular', normalPosture);
  check(Object.keys(results).length === tmpl.poms.length, `calculateAllEaseResults for ${cat} returns all ${tmpl.poms.length} POM results`);
  
  for (const pom of tmpl.poms) {
    const res = results[pom.id];
    check(!isNaN(res.targetGarmentMeasurement), `Target measurement for ${pom.code} is valid number (${res.targetGarmentMeasurement})`);
  }
}

console.log(`\n========================================`);
console.log(`STRESS TEST HARNESS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
