import { calculateGarmentSam, BASE_GARMENT_SAM_MAP, EMBROIDERY_SAM_MAP } from '../lib/sam-calculator';
import { GarmentCategory, PostureProfile } from '../types/measurement';

export function runSamCalculatorTests() {
  console.log('\n[Suite: Dynamic SAM Calculation Engine]');

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

  // 1. Base SAM Matrix Validation for all 9 Garment Categories
  const categories: GarmentCategory[] = [
    'mens-suit',
    'mens-sherwani',
    'mens-shirt',
    'mens-trouser',
    'womens-blouse',
    'womens-lehenga',
    'womens-anarkali',
    'womens-corset',
    'womens-gown',
  ];

  const expectedBaseMap: Record<GarmentCategory, number> = {
    'mens-suit': 240,
    'mens-sherwani': 210,
    'mens-shirt': 60,
    'mens-trouser': 90,
    'womens-blouse': 120,
    'womens-lehenga': 300,
    'womens-anarkali': 270,
    'womens-corset': 180,
    'womens-gown': 240,
  };

  for (const cat of categories) {
    const res = calculateGarmentSam({ garmentCategory: cat });
    assert(
      res.baseSamMinutes === expectedBaseMap[cat],
      `Base SAM for ${cat} equals ${expectedBaseMap[cat]} mins`
    );
    assert(
      res.postureModifierMinutes === 0,
      `Default posture modifier for ${cat} equals 0`
    );
    assert(
      res.customizationMinutes === 0,
      `Default customization minutes for ${cat} equals 0`
    );
    assert(
      res.totalSamMinutes === expectedBaseMap[cat],
      `Total SAM for baseline ${cat} equals base SAM`
    );
  }

  // 2. Posture Modifier Math Evaluation
  const normalPosture: PostureProfile = {
    shoulderSlope: 'normal',
    backCurvature: 'normal',
    abdomenStance: 'normal',
    hipSpineStance: 'normal',
  };

  const normalRes = calculateGarmentSam({ garmentCategory: 'mens-suit', postureProfile: normalPosture });
  assert(normalRes.postureModifierMinutes === 0, 'Normal posture returns 0 posture modifier minutes');

  const complexPosture: PostureProfile = {
    shoulderSlope: 'sloped', // +15
    backCurvature: 'stooped', // +20
    abdomenStance: 'prominent', // +25
    hipSpineStance: 'sway_back', // +20
  };
  const complexRes = calculateGarmentSam({ garmentCategory: 'mens-suit', postureProfile: complexPosture });
  assert(complexRes.postureModifierMinutes === 80, 'Complex non-normal posture profile sums correctly (+15+20+25+20 = 80 mins)');
  assert(complexRes.totalSamMinutes === 240 + 80, 'Total SAM includes base (240) + posture (80) = 320 mins');

  const alternatePosture: PostureProfile = {
    shoulderSlope: 'very_sloped', // +25
    backCurvature: 'erect', // +15
    abdomenStance: 'flat', // +10
    hipSpineStance: 'high_hip', // +15
  };
  const altRes = calculateGarmentSam({ garmentCategory: 'womens-gown', postureProfile: alternatePosture });
  assert(altRes.postureModifierMinutes === 65, 'Alternate posture profile sums correctly (+25+15+10+15 = 65 mins)');

  // 3. Customization & Surcharge Math Evaluation
  const lehenga24Panel = calculateGarmentSam({
    garmentCategory: 'womens-lehenga',
    panelCount: 24, // >16 -> +60 mins
    embroideryLevel: 'heavy', // +240 mins
    hasFullCanvas: true, // +30 mins
    hasCustomLining: true, // +30 mins
    fittingTrialCount: 2, // 2 * 45 = 90 mins
  });

  const expectedCustomization = 60 + 240 + 30 + 30 + 90; // 450 mins
  assert(lehenga24Panel.customizationMinutes === expectedCustomization, `Lehenga customization mins equals sum of surcharges (${expectedCustomization} mins)`);
  assert(lehenga24Panel.totalSamMinutes === 300 + expectedCustomization, `Total SAM equals base (300) + custom (${expectedCustomization}) = ${300 + expectedCustomization} mins`);
  assert(lehenga24Panel.estimatedLaborHours === Number(((300 + expectedCustomization) / 60).toFixed(1)), 'Estimated labor hours correctly converted and formatted');

  // 4. Embroidery Fee Breakdown Test
  assert(EMBROIDERY_SAM_MAP.none === 0, 'Embroidery none = 0 mins');
  assert(EMBROIDERY_SAM_MAP.light === 45, 'Embroidery light = 45 mins');
  assert(EMBROIDERY_SAM_MAP.medium === 120, 'Embroidery medium = 120 mins');
  assert(EMBROIDERY_SAM_MAP.heavy === 240, 'Embroidery heavy = 240 mins');

  return { passed, failed };
}
