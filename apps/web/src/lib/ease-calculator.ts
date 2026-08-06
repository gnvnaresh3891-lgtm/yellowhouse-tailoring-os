import {
  CalculatedEaseResult,
  FitPreference,
  GarmentCategory,
  PomCategoryType,
  PomSchemaItem,
  PostureProfile
} from '../types/measurement';
import { getGarmentTemplate } from './pom-schemas';

export function calculatePostureOffset(
  pomCode: string,
  pomCategory: PomCategoryType,
  pomName: string,
  posture: PostureProfile
): number {
  let offset = 0;
  const code = pomCode.toUpperCase();
  const name = pomName.toLowerCase();

  // Helper flags for POM classification
  const isArmhole = code.includes('SU-07') || code.includes('SB-08') || name.includes('armscye') || name.includes('armhole');
  const isShoulder = code.includes('SU-04') || code.includes('SH-04') || code.includes('ST-04') || name.includes('shoulder') || name.includes('yoke');
  const isBackLength = code.includes('SU-05') || code.includes('SH-06') || code.includes('ST-05') || code.includes('SB-09') || code.includes('LC-06') || code.includes('AN-04') || code.includes('GO-04') || (pomCategory === 'length' && (name.includes('back') || name.includes('total') || name.includes('hollow')));
  const isAcrossChestFront = code.includes('SH-08') || name.includes('across chest') || name.includes('front neck');
  const isChestBustGirth = code.includes('SU-01') || code.includes('SH-01') || code.includes('ST-02') || code.includes('SB-01') || code.includes('SB-02') || code.includes('LC-04') || code.includes('AN-01') || code.includes('CO-01') || code.includes('CO-02') || code.includes('GO-01') || (pomCategory === 'girth' && (name.includes('chest') || name.includes('bust')));
  const isWaistGirth = code.includes('SU-02') || code.includes('SH-02') || code.includes('ST-03') || code.includes('TR-01') || code.includes('LC-01') || code.includes('AN-02') || code.includes('CO-04') || code.includes('GO-02') || (pomCategory === 'girth' && name.includes('waist'));
  const isCrotchRise = code.includes('TR-08') || name.includes('crotch');
  const isHipGirth = code.includes('SU-03') || code.includes('SH-03') || code.includes('TR-02') || code.includes('LC-02') || code.includes('CO-05') || code.includes('GO-03') || (pomCategory === 'girth' && (name.includes('hip') || name.includes('seat')));
  const isTrouserLength = code.includes('TR-03') || code.includes('TR-04') || name.includes('outseam') || name.includes('inseam');

  // 1. Shoulder Slope Axis
  switch (posture.shoulderSlope) {
    case 'sloped':
      if (isArmhole) offset += 0.375;
      if (isShoulder) offset -= 0.25;
      break;
    case 'very_sloped':
      if (isArmhole) offset += 0.625;
      if (isShoulder) offset -= 0.375;
      break;
    case 'square':
      if (isArmhole) offset -= 0.25;
      if (isShoulder) offset += 0.25;
      break;
    case 'normal':
    default:
      break;
  }

  // 2. Back Curvature Axis
  switch (posture.backCurvature) {
    case 'stooped':
      if (isBackLength) offset += 0.50;
      if (isAcrossChestFront) offset -= 0.25;
      if (isChestBustGirth) offset += 0.375;
      break;
    case 'erect':
      if (isBackLength) offset -= 0.375;
      if (isAcrossChestFront) offset += 0.25;
      if (isChestBustGirth) offset += 0.25;
      break;
    case 'prominent_blade':
      if (isAcrossChestFront || isShoulder) offset += 0.50;
      if (isArmhole) offset += 0.25;
      break;
    case 'normal':
    default:
      break;
  }

  // 3. Abdomen Stance Axis
  switch (posture.abdomenStance) {
    case 'prominent':
      if (isWaistGirth) offset += 1.00;
      if (isCrotchRise) offset += 0.50;
      break;
    case 'flat':
      if (isWaistGirth) offset -= 0.50;
      if (isCrotchRise) offset -= 0.25;
      break;
    case 'normal':
    default:
      break;
  }

  // 4. Hip / Spine Stance Axis
  switch (posture.hipSpineStance) {
    case 'high_hip':
      if (isHipGirth) offset += 0.50;
      if (isTrouserLength) offset += 0.25;
      break;
    case 'sway_back':
      if (isBackLength) offset -= 0.625;
      if (isCrotchRise) offset -= 0.375;
      break;
    case 'normal':
    default:
      break;
  }

  return offset;
}

export function getFitPreferenceModifier(fit: FitPreference, pomCategory: PomCategoryType): number {
  switch (fit) {
    case 'skinny':
      if (pomCategory === 'girth' || pomCategory === 'trouser') return -1.50;
      if (pomCategory === 'width') return -0.50;
      if (pomCategory === 'sleeve') return -0.375;
      return 0.0;
    case 'slim':
      if (pomCategory === 'girth' || pomCategory === 'trouser') return -0.75;
      if (pomCategory === 'width') return -0.25;
      if (pomCategory === 'sleeve') return -0.25;
      return 0.0;
    case 'relaxed':
      if (pomCategory === 'girth' || pomCategory === 'trouser') return 1.25;
      if (pomCategory === 'width') return 0.50;
      if (pomCategory === 'sleeve') return 0.375;
      return 0.0;
    case 'regular':
    default:
      return 0.0;
  }
}

export function calculateDynamicEase(params: {
  pomItem: PomSchemaItem;
  netBody: number;
  fitPreference: FitPreference;
  postureProfile: PostureProfile;
  stretchPercent?: number;
}): CalculatedEaseResult {
  const { pomItem, netBody, fitPreference, postureProfile, stretchPercent = 0 } = params;

  const categoryBaseEase = pomItem.defaultEase;
  const fitPreferenceModifier = getFitPreferenceModifier(fitPreference, pomItem.category);
  const postureOffset = calculatePostureOffset(
    pomItem.code,
    pomItem.category,
    pomItem.name,
    postureProfile
  );

  let stretchFactor = 0;
  if (pomItem.category === 'girth' && stretchPercent > 0) {
    stretchFactor = Number((netBody * (stretchPercent / 100) * 0.5).toFixed(2));
  }

  const targetGarmentMeasurement = Number(
    (netBody + categoryBaseEase + fitPreferenceModifier + postureOffset - stretchFactor).toFixed(2)
  );

  return {
    pomId: pomItem.id,
    netBody,
    categoryBaseEase,
    fitPreferenceModifier,
    postureOffset,
    stretchFactor,
    targetGarmentMeasurement
  };
}

export function calculateAllEaseResults(
  garmentCategory: GarmentCategory,
  measurements: Record<string, number>,
  fitPreference: FitPreference,
  postureProfile: PostureProfile,
  stretchPercent?: number
): Record<string, CalculatedEaseResult> {
  const template = getGarmentTemplate(garmentCategory);
  const results: Record<string, CalculatedEaseResult> = {};

  for (const pom of template.poms) {
    const netBody = measurements[pom.id] ?? measurements[pom.code] ?? pom.baseMeasurement;
    results[pom.id] = calculateDynamicEase({
      pomItem: pom,
      netBody,
      fitPreference,
      postureProfile,
      stretchPercent
    });
  }

  return results;
}
