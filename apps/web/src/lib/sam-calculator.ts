import { GarmentCategory, PostureProfile } from '../types/measurement';

export interface SamCalculationInput {
  garmentCategory: GarmentCategory;
  postureProfile?: PostureProfile;
  panelCount?: number;
  embroideryLevel?: 'none' | 'light' | 'medium' | 'heavy';
  hasFullCanvas?: boolean;
  hasCustomLining?: boolean;
  fittingTrialCount?: number;
}

export interface SamCalculationResult {
  baseSamMinutes: number;
  postureModifierMinutes: number;
  customizationMinutes: number;
  totalSamMinutes: number;
  estimatedLaborHours: number;
}

export const BASE_GARMENT_SAM_MAP: Record<GarmentCategory, number> = {
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

const SHOULDER_SLOPE_SAM_MAP: Record<string, number> = {
  normal: 0,
  sloped: 15,
  very_sloped: 25,
  square: 10,
};

const BACK_CURVATURE_SAM_MAP: Record<string, number> = {
  normal: 0,
  stooped: 20,
  erect: 15,
  prominent_blade: 20,
};

const ABDOMEN_STANCE_SAM_MAP: Record<string, number> = {
  normal: 0,
  prominent: 25,
  flat: 10,
};

const HIP_SPINE_STANCE_SAM_MAP: Record<string, number> = {
  normal: 0,
  high_hip: 15,
  sway_back: 20,
};

export const EMBROIDERY_SAM_MAP: Record<'none' | 'light' | 'medium' | 'heavy', number> = {
  none: 0,
  light: 45,
  medium: 120,
  heavy: 240,
};

export function calculateGarmentSam(input: SamCalculationInput): SamCalculationResult {
  const {
    garmentCategory,
    postureProfile,
    panelCount,
    embroideryLevel = 'none',
    hasFullCanvas = false,
    hasCustomLining = false,
    fittingTrialCount = 0,
  } = input;

  const baseSamMinutes = BASE_GARMENT_SAM_MAP[garmentCategory] ?? 120;

  // Posture Modifier Minutes
  let postureModifierMinutes = 0;
  if (postureProfile) {
    if (postureProfile.shoulderSlope) {
      postureModifierMinutes += SHOULDER_SLOPE_SAM_MAP[postureProfile.shoulderSlope] || 0;
    }
    if (postureProfile.backCurvature) {
      postureModifierMinutes += BACK_CURVATURE_SAM_MAP[postureProfile.backCurvature] || 0;
    }
    if (postureProfile.abdomenStance) {
      postureModifierMinutes += ABDOMEN_STANCE_SAM_MAP[postureProfile.abdomenStance] || 0;
    }
    if (postureProfile.hipSpineStance) {
      postureModifierMinutes += HIP_SPINE_STANCE_SAM_MAP[postureProfile.hipSpineStance] || 0;
    }
  }

  // Customization Minutes
  let customizationMinutes = 0;

  // Panel Count surcharge (ethnic flared garments / general)
  if (panelCount && panelCount > 0) {
    if (panelCount > 16) {
      customizationMinutes += 60;
    } else if (panelCount >= 12) {
      customizationMinutes += 30;
    }
  }

  // Embroidery level surcharge
  if (embroideryLevel && EMBROIDERY_SAM_MAP[embroideryLevel]) {
    customizationMinutes += EMBROIDERY_SAM_MAP[embroideryLevel];
  }

  // Full canvas surcharge
  if (hasFullCanvas) {
    customizationMinutes += 30;
  }

  // Premium silk lining surcharge
  if (hasCustomLining) {
    customizationMinutes += 30;
  }

  // Fitting trial adjustments surcharge (45 mins per trial)
  if (fittingTrialCount && fittingTrialCount > 0) {
    customizationMinutes += fittingTrialCount * 45;
  }

  const totalSamMinutes = baseSamMinutes + postureModifierMinutes + customizationMinutes;
  const estimatedLaborHours = Number((totalSamMinutes / 60).toFixed(1));

  return {
    baseSamMinutes,
    postureModifierMinutes,
    customizationMinutes,
    totalSamMinutes,
    estimatedLaborHours,
  };
}
