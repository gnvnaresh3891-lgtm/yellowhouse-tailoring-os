import { getAllGarmentTemplates, getGarmentTemplate, getGarmentTemplatesByGender, POM_SCHEMAS } from '../lib/pom-schemas';
import { calculateAllEaseResults, calculateDynamicEase, calculatePostureOffset, getFitPreferenceModifier } from '../lib/ease-calculator';
import { calculateFabricYield } from '../lib/fabric-yield';
import { getDynamicGirthAndLength } from '../context/MeasurementEngineContext';
import { GarmentCategory, PomSchemaItem, PostureProfile } from '../types/measurement';
import { runLandmarkValidationTests } from './landmark-validation.test';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  }
}

console.log('\n--- RUNNING M1 UNIT TEST SUITE ---\n');

// 1. POM Schemas Tests
console.log('[Suite 1: POM Schemas]');
const allCategories: GarmentCategory[] = [
  'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
  'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
];

assert(Object.keys(POM_SCHEMAS).length === 9, 'Defines all 9 garment categories');
assert(getAllGarmentTemplates().length === 9, 'getAllGarmentTemplates returns 9 templates');
assert(getGarmentTemplatesByGender('Men').length === 4, '4 Men garment templates');
assert(getGarmentTemplatesByGender('Women').length === 5, '5 Women garment templates');

for (const cat of allCategories) {
  const template = getGarmentTemplate(cat);
  assert(template.poms.length > 0, `Template ${cat} has non-empty POMs array`);
  for (const pom of template.poms) {
    assert(pom.baseMeasurement >= pom.validationRange.min && pom.baseMeasurement <= pom.validationRange.max, `POM ${pom.code} base measurement within valid range`);
  }
}

// 2. Posture Engine Tests
console.log('\n[Suite 2: 4-Axis Posture Profile Modifier Engine]');
const normalPosture: PostureProfile = {
  shoulderSlope: 'normal',
  backCurvature: 'normal',
  abdomenStance: 'normal',
  hipSpineStance: 'normal'
};

assert(calculatePostureOffset('M-SU-01', 'girth', 'Jacket Chest', normalPosture) === 0, 'Normal posture returns 0 offset');

const slopedPosture: PostureProfile = { ...normalPosture, shoulderSlope: 'sloped' };
assert(calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', slopedPosture) === 0.375, 'Sloped shoulders deepens armscye by +0.375"');
assert(calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', slopedPosture) === -0.25, 'Sloped shoulders narrows shoulder width by -0.25"');

const verySlopedPosture: PostureProfile = { ...normalPosture, shoulderSlope: 'very_sloped' };
assert(calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', verySlopedPosture) === 0.625, 'Very sloped shoulders deepens armscye by +0.625"');
assert(calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', verySlopedPosture) === -0.375, 'Very sloped shoulders narrows shoulder width by -0.375"');

const squarePosture: PostureProfile = { ...normalPosture, shoulderSlope: 'square' };
assert(calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', squarePosture) === -0.25, 'Square shoulders shallows armscye by -0.25"');
assert(calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', squarePosture) === 0.25, 'Square shoulders expands shoulder width by +0.25"');

const stoopedPosture: PostureProfile = { ...normalPosture, backCurvature: 'stooped' };
assert(calculatePostureOffset('M-SU-05', 'length', 'Back Length', stoopedPosture) === 0.5, 'Stooped back adds +0.5" to back length');
assert(calculatePostureOffset('M-SU-01', 'girth', 'Jacket Chest', stoopedPosture) === 0.375, 'Stooped back adds +0.375" to chest girth');

const prominentAbdomen: PostureProfile = { ...normalPosture, abdomenStance: 'prominent' };
assert(calculatePostureOffset('M-SU-02', 'girth', 'Waist Girth', prominentAbdomen) === 1.0, 'Prominent abdomen adds +1.0" to waist girth');

// 3. Dynamic Ease Math Tests
console.log('\n[Suite 3: Dynamic Ease Allowance Formulas]');
const samplePomItem: PomSchemaItem = {
  id: 'm-su-01', code: 'M-SU-01', name: 'Jacket Chest Circumference', category: 'girth',
  baseMeasurement: 40.0, defaultEase: 3.5, unit: 'in', validationRange: { min: 30.0, max: 60.0 }
};

const regResult = calculateDynamicEase({
  pomItem: samplePomItem, netBody: 40.0, fitPreference: 'regular', postureProfile: normalPosture
});
assert(regResult.targetGarmentMeasurement === 43.5, 'Regular fit target = 40 + 3.5 = 43.5"');

const slimResult = calculateDynamicEase({
  pomItem: samplePomItem, netBody: 40.0, fitPreference: 'slim', postureProfile: normalPosture
});
assert(slimResult.targetGarmentMeasurement === 42.75, 'Slim fit target = 40 + 3.5 - 0.75 = 42.75"');

const stretchResult = calculateDynamicEase({
  pomItem: samplePomItem, netBody: 40.0, fitPreference: 'regular', postureProfile: normalPosture, stretchPercent: 5
});
assert(stretchResult.stretchFactor === 1.0, '5% stretch factor deduction = 1.0"');
assert(stretchResult.targetGarmentMeasurement === 42.5, 'Target with stretch deduction = 42.5"');

// 4. Fabric Yield Math Tests
console.log('\n[Suite 4: Size-Scaled Fabric Yield Math]');
const suitYield = calculateFabricYield({ garmentCategory: 'mens-suit', boltWidth: 44 });
assert(suitYield.requiredMeters === 5.00, "Men's suit 44\" bolt width base yield = 5.00m");

const sherwaniYield54 = calculateFabricYield({ garmentCategory: 'mens-sherwani', boltWidth: 54 });
assert(sherwaniYield54.requiredMeters === 3.67, "Men's sherwani 54\" bolt width yield = 3.67m");

const lehenga24Kali = calculateFabricYield({ garmentCategory: 'womens-lehenga', boltWidth: 44, panelCount: 24, hasShrinkage: true });
assert(lehenga24Kali.requiredMeters === 8.83, "Women's 24-kali lehenga yield = 8.83m");

// 5. Dynamic POM Resolution & Context Math Tests
console.log('\n[Suite 5: Dynamic POM Resolution across 9 Categories]');
for (const cat of allCategories) {
  const { girthMeasurement, lengthMeasurement } = getDynamicGirthAndLength(cat, {});
  assert(typeof girthMeasurement === 'number' && girthMeasurement > 0, `Category ${cat} resolves valid girth measurement (${girthMeasurement}")`);
  assert(typeof lengthMeasurement === 'number' && lengthMeasurement > 0, `Category ${cat} resolves valid length measurement (${lengthMeasurement}")`);
}

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

// Run M2 Landmark & Validation test suite
runLandmarkValidationTests();

if (failed > 0) {
  process.exit(1);
}
