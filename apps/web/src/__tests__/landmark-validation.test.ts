import {
  evaluateAnatomicalProportions,
  getHotspotColorConfig,
  getLandmarkForPom,
  getLandmarksForGarment,
  getPomForLandmark,
  getPostureAlertTriggers,
  LANDMARK_DEFINITIONS
} from '../lib/landmark-mappings';
import { POM_SCHEMAS } from '../lib/pom-schemas';
import { GarmentCategory, PostureProfile, ValidationState } from '../types/measurement';

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

export function runLandmarkValidationTests() {
  console.log('\n--- RUNNING M2 LANDMARK & VALIDATION TEST SUITE ---\n');

  // 1. Landmark Coordinates & Definitions Test
  console.log('[Suite 1: Landmark Coordinates & Master Definitions]');
  const totalLandmarks = Object.keys(LANDMARK_DEFINITIONS).length;
  assert(totalLandmarks >= 35, `Master registry defines at least 35 unique hotspots (found ${totalLandmarks})`);

  for (const [id, lm] of Object.entries(LANDMARK_DEFINITIONS)) {
    assert(lm.id === id, `Landmark key matches id '${id}'`);
    assert(lm.coordinates.x >= 0 && lm.coordinates.x <= 400, `Landmark '${id}' X coordinate within 0-400`);
    assert(lm.coordinates.y >= 0 && lm.coordinates.y <= 800, `Landmark '${id}' Y coordinate within 0-800`);
    assert(lm.gender === 'men' || lm.gender === 'women', `Landmark '${id}' has valid gender category`);
    assert(lm.guideline.startX >= 0 && lm.guideline.endX <= 400, `Landmark '${id}' guideline bounds within 0-400`);
  }

  // 2. Bidirectional POM-to-Landmark Mapping Coverage
  console.log('\n[Suite 2: Bidirectional POM-to-Landmark Mappings]');
  const categories: GarmentCategory[] = [
    'mens-suit',
    'mens-sherwani',
    'mens-shirt',
    'mens-trouser',
    'womens-blouse',
    'womens-lehenga',
    'womens-anarkali',
    'womens-corset',
    'womens-gown'
  ];

  let mappedPomCount = 0;
  for (const cat of categories) {
    const template = POM_SCHEMAS[cat];
    assert(template !== undefined, `Category '${cat}' template exists`);

    for (const pom of template.poms) {
      assert(!!pom.landmarkId, `POM ${pom.code} (${cat}) has landmarkId assigned`);
      if (pom.landmarkId) {
        mappedPomCount++;
        const lm = getLandmarkForPom(cat, pom.id);
        assert(lm !== undefined, `getLandmarkForPom returns definition for ${pom.code}`);
        assert(lm?.id === pom.landmarkId, `Mapped landmark ID matches ${pom.landmarkId}`);

        const reversePom = getPomForLandmark(cat, pom.landmarkId);
        assert(reversePom !== undefined, `getPomForLandmark returns POM for landmark ${pom.landmarkId}`);
      }
    }

    const frontLandmarks = getLandmarksForGarment(cat, 'front');
    assert(frontLandmarks.length > 0, `getLandmarksForGarment returns front landmarks for ${cat}`);
  }
  assert(mappedPomCount >= 63, `Mapped all 63+ POM schema items across 9 categories (found ${mappedPomCount})`);

  // 3. Anatomical Proportion Sanity Checks
  console.log('\n[Suite 3: Anatomical Proportion Sanity Evaluation]');
  const normalPosture: PostureProfile = {
    shoulderSlope: 'normal',
    backCurvature: 'normal',
    abdomenStance: 'normal',
    hipSpineStance: 'normal'
  };

  // Rule 3.1: Women's Bust Tiering Invariant (Underbust < Upper Bust < Full Bust)
  const invalidBustTier: Record<string, number> = {
    'w-sb-01': 38.0, // Upper Bust
    'w-sb-02': 36.0, // Full Bust Peak (INVALID: Upper Bust > Full Bust)
    'w-sb-03': 30.0  // Underbust
  };
  const bustPropResults = evaluateAnatomicalProportions('womens-blouse', invalidBustTier, normalPosture);
  assert(bustPropResults.some((r) => r.severity === 'error' && r.message.includes('Upper Bust')), 'Upper bust > Full bust triggers Rose Red proportion error');

  const invalidUnderbustTier: Record<string, number> = {
    'w-sb-01': 34.0, // Upper Bust
    'w-sb-02': 36.0, // Full Bust Peak
    'w-sb-03': 35.0  // Underbust (INVALID: Underbust > Upper Bust)
  };
  const underbustPropResults = evaluateAnatomicalProportions('womens-blouse', invalidUnderbustTier, normalPosture);
  assert(underbustPropResults.some((r) => r.severity === 'error' && r.message.includes('Underbust Band')), 'Underbust > Upper bust triggers Rose Red proportion error');

  const validBustTier: Record<string, number> = {
    'w-sb-01': 34.0, // Upper Bust
    'w-sb-02': 36.0, // Full Bust Peak
    'w-sb-03': 30.0  // Underbust
  };
  const validBustPropResults = evaluateAnatomicalProportions('womens-blouse', validBustTier, normalPosture);
  assert(validBustPropResults.filter((r) => r.severity === 'error').length === 0, 'Valid bust tiering produces zero proportion errors');

  // Rule 3.2: Trouser Inseam < Outseam
  const invalidTrouserSeams: Record<string, number> = {
    'm-tr-03': 30.0, // Outseam
    'm-tr-04': 35.0  // Inseam (INVALID: Inseam > Outseam)
  };
  const seamPropResults = evaluateAnatomicalProportions('mens-trouser', invalidTrouserSeams, normalPosture);
  assert(seamPropResults.some((r) => r.severity === 'error' && r.pomId === 'm-tr-04'), 'Inseam >= Outseam triggers Rose Red proportion error');

  const validTrouserSeams: Record<string, number> = {
    'm-tr-03': 41.0, // Outseam
    'm-tr-04': 31.0  // Inseam (Rise = 10.0")
  };
  const validSeamPropResults = evaluateAnatomicalProportions('mens-trouser', validTrouserSeams, normalPosture);
  assert(validSeamPropResults.filter((r) => r.severity === 'error').length === 0, 'Valid trouser seams produce zero proportion errors');

  // Rule 3.3: Men's Chest vs Waist Girth Invariant
  const waistExceedsChest: Record<string, number> = {
    'm-su-01': 40.0, // Chest
    'm-su-02': 46.0  // Waist (INVALID: Waist > Chest + 4.0")
  };
  const chestWaistPropResults = evaluateAnatomicalProportions('mens-suit', waistExceedsChest, normalPosture);
  assert(chestWaistPropResults.some((r) => r.severity === 'warning' && r.message.includes('Waist girth')), 'Waist > Chest + 4.0" triggers Amber Gold warning');

  const prominentAbdomenPosture: PostureProfile = { ...normalPosture, abdomenStance: 'prominent' };
  const prominentAbdomenResults = evaluateAnatomicalProportions('mens-suit', waistExceedsChest, prominentAbdomenPosture);
  assert(prominentAbdomenResults.filter((r) => r.pomId === 'm-su-02').length === 0, 'Prominent abdomen stance accepts waist > chest without warning');

  // Rule 3.4: Corset Waist Cinch Target
  const invalidCorsetWaist: Record<string, number> = {
    'w-co-03': 30.0, // Underbust
    'w-co-04': 34.0  // Waist Cinch Target (INVALID: > Underbust + 2.0")
  };
  const corsetPropResults = evaluateAnatomicalProportions('womens-corset', invalidCorsetWaist, normalPosture);
  assert(corsetPropResults.some((r) => r.severity === 'warning' && r.pomId === 'w-co-04'), 'Corset waist > Underbust + 2.0" triggers warning');

  // 4. Posture Alert Triggers Test
  console.log('\n[Suite 4: Posture Alert Trigger Logic]');
  const slopedTriggers = getPostureAlertTriggers({ ...normalPosture, shoulderSlope: 'sloped' });
  assert(slopedTriggers.length === 1 && slopedTriggers[0].affectedLandmarkIds.includes('hs-mens-armscye'), 'Sloped shoulders generates posture alert for armscye');

  const multiPostureProfile: PostureProfile = {
    shoulderSlope: 'very_sloped',
    backCurvature: 'stooped',
    abdomenStance: 'prominent',
    hipSpineStance: 'sway_back'
  };
  const multiTriggers = getPostureAlertTriggers(multiPostureProfile);
  assert(multiTriggers.length === 4, 'Multiple posture offsets trigger 4 distinct posture alerts');

  // 5. Color-Coding State Config Test
  console.log('\n[Suite 5: Color-Coding State Config Matrix]');
  const errorValState: ValidationState = {
    errors: { 'm-su-01': 'Out of range error' },
    warnings: {},
    isValid: false
  };
  const errorColor = getHotspotColorConfig('m-su-01', errorValState, normalPosture, false);
  assert(errorColor.hex === '#EF4444' && errorColor.status === 'error', 'Error validation state resolves to Rose Red #EF4444');

  const warningValState: ValidationState = {
    errors: {},
    warnings: { 'm-su-02': 'Posture warning' },
    isValid: true
  };
  const warningColor = getHotspotColorConfig('m-su-02', warningValState, normalPosture, false);
  assert(warningColor.hex === '#F59E0B' && warningColor.status === 'warning', 'Warning validation state resolves to Amber Gold #F59E0B');

  const validValState: ValidationState = { errors: {}, warnings: {}, isValid: true };
  const validColor = getHotspotColorConfig('m-su-01', validValState, normalPosture, false);
  assert(validColor.hex === '#10B981' && validColor.status === 'valid', 'Valid state resolves to Emerald Green #10B981');

  const focusedColor = getHotspotColorConfig('m-su-01', validValState, normalPosture, true);
  assert(focusedColor.status === 'focused' && focusedColor.hex === '#EAB308', 'Active focus resolves to Gold #EAB308');

  console.log(`\n========================================`);
  console.log(`LANDMARK TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly
runLandmarkValidationTests();
