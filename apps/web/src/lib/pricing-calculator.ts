import { GarmentCategory, PostureProfile } from '../types/measurement';
import { calculateFabricYield } from './fabric-yield';
import { calculateGarmentSam } from './sam-calculator';

export interface PricingCalculationInput {
  garmentCategory: GarmentCategory;
  fabricCostPerMeter: number;
  boltWidth?: number;
  patternRepeat?: number;
  shrinkageBufferPercent?: number;
  girthMeasurement?: number;
  lengthMeasurement?: number;
  panelCount?: number;
  postureProfile?: PostureProfile;
  embroideryLevel?: 'none' | 'light' | 'medium' | 'heavy';
  isUrgent?: boolean;
  artisanMinuteRate?: number;
  hasFullCanvas?: boolean;
  hasCustomLining?: boolean;
  fittingTrialCount?: number;
}

export interface PricingCalculationResult {
  fabricYieldMeters: number;
  fabricCost: number;
  baseLaborCost: number;
  postureSurcharge: number;
  embroiderySurcharge: number;
  rushSurcharge: number;
  totalGarmentPrice: number;
  mandatoryAdvance50Percent: number;
  balanceDueOnDelivery: number;
  totalSamMinutes: number;
}

export const EMBROIDERY_PRICE_MAP: Record<'none' | 'light' | 'medium' | 'heavy', number> = {
  none: 0,
  light: 3500,
  medium: 12000,
  heavy: 28000,
};

export const POSTURE_AXIS_TECHNICAL_FEE = 750;
export const DEFAULT_ARTISAN_MINUTE_RATE = 42;

export function calculateBespokePricing(input: PricingCalculationInput): PricingCalculationResult {
  const {
    garmentCategory,
    fabricCostPerMeter,
    boltWidth = 44,
    patternRepeat = 0,
    shrinkageBufferPercent,
    girthMeasurement,
    lengthMeasurement,
    panelCount,
    postureProfile,
    embroideryLevel = 'none',
    isUrgent = false,
    artisanMinuteRate = DEFAULT_ARTISAN_MINUTE_RATE,
    hasFullCanvas = false,
    hasCustomLining = false,
    fittingTrialCount = 0,
  } = input;

  // 1. Calculate Fabric Yield
  const yieldResult = calculateFabricYield({
    garmentCategory,
    boltWidth,
    patternRepeat,
    shrinkageBufferPercent,
    girthMeasurement,
    lengthMeasurement,
    panelCount,
  });
  const fabricYieldMeters = yieldResult.requiredMeters;
  const fabricCost = Math.round(fabricYieldMeters * fabricCostPerMeter);

  // 2. Calculate SAM minutes
  const samResult = calculateGarmentSam({
    garmentCategory,
    postureProfile,
    panelCount,
    embroideryLevel,
    hasFullCanvas,
    hasCustomLining,
    fittingTrialCount,
  });
  const totalSamMinutes = samResult.totalSamMinutes;

  // 3. Base Tailoring Labor Cost
  const baseLaborCost = Math.round(totalSamMinutes * artisanMinuteRate);

  // 4. Posture Surcharge (₹750 per non-normal axis)
  let nonNormalAxisCount = 0;
  if (postureProfile) {
    if (postureProfile.shoulderSlope && postureProfile.shoulderSlope !== 'normal') nonNormalAxisCount++;
    if (postureProfile.backCurvature && postureProfile.backCurvature !== 'normal') nonNormalAxisCount++;
    if (postureProfile.abdomenStance && postureProfile.abdomenStance !== 'normal') nonNormalAxisCount++;
    if (postureProfile.hipSpineStance && postureProfile.hipSpineStance !== 'normal') nonNormalAxisCount++;
  }
  const postureSurcharge = nonNormalAxisCount * POSTURE_AXIS_TECHNICAL_FEE;

  // 5. Embroidery Surcharge
  const embroiderySurcharge = EMBROIDERY_PRICE_MAP[embroideryLevel] || 0;

  // 6. Rush Order Surcharge (+20% on labor + embroidery)
  const rushSurcharge = isUrgent ? Math.round(0.20 * (baseLaborCost + embroiderySurcharge)) : 0;

  // 7. Total Garment Price
  const totalGarmentPrice = fabricCost + baseLaborCost + postureSurcharge + embroiderySurcharge + rushSurcharge;

  // 8. 50% Mandatory Advance & Balance
  const mandatoryAdvance50Percent = Math.round(totalGarmentPrice * 0.5);
  const balanceDueOnDelivery = totalGarmentPrice - mandatoryAdvance50Percent;

  return {
    fabricYieldMeters,
    fabricCost,
    baseLaborCost,
    postureSurcharge,
    embroiderySurcharge,
    rushSurcharge,
    totalGarmentPrice,
    mandatoryAdvance50Percent,
    balanceDueOnDelivery,
    totalSamMinutes,
  };
}
