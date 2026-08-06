import { FabricYieldInput, FabricYieldResult, GarmentCategory } from '../types/measurement';

const BASE_YIELD_MAP: Record<GarmentCategory, number> = {
  'mens-suit': 5.00,
  'mens-sherwani': 4.50,
  'mens-shirt': 2.20,
  'mens-trouser': 1.40,
  'womens-blouse': 1.00,
  'womens-lehenga': 5.80,
  'womens-anarkali': 6.50,
  'womens-corset': 1.20,
  'womens-gown': 5.50,
};

const REF_GIRTH_MAP: Record<GarmentCategory, number> = {
  'mens-suit': 40.0,
  'mens-sherwani': 40.0,
  'mens-shirt': 40.0,
  'mens-trouser': 40.0,
  'womens-blouse': 36.0,
  'womens-lehenga': 36.0,
  'womens-anarkali': 36.0,
  'womens-corset': 36.0,
  'womens-gown': 36.0,
};

const REF_LENGTH_MAP: Record<GarmentCategory, number> = {
  'mens-suit': 30.0,
  'mens-sherwani': 42.0,
  'mens-shirt': 30.0,
  'mens-trouser': 41.0,
  'womens-blouse': 14.5,
  'womens-lehenga': 42.0,
  'womens-anarkali': 56.0,
  'womens-corset': 13.0,
  'womens-gown': 56.0,
};

export function calculateFabricYield(input: FabricYieldInput): FabricYieldResult {
  const {
    garmentCategory,
    boltWidth,
    patternRepeat = 0,
    shrinkageBufferPercent,
    girthMeasurement,
    lengthMeasurement,
    panelCount,
    hasShrinkage = false
  } = input;

  const baseYieldMeters = BASE_YIELD_MAP[garmentCategory] || 3.00;
  const refGirth = REF_GIRTH_MAP[garmentCategory] || 40.0;
  const refLength = REF_LENGTH_MAP[garmentCategory] || 30.0;

  // 1. Width Utilization Factor (F_width)
  const width = boltWidth && boltWidth > 0 ? boltWidth : 44.0;
  const widthFactor = 44.0 / width;

  // 2. Composite Size Scale Ratio (K_scale)
  let kScale = 1.0;
  if (girthMeasurement || lengthMeasurement) {
    const kGirth = girthMeasurement ? girthMeasurement / refGirth : 1.0;
    const kLength = lengthMeasurement ? lengthMeasurement / refLength : 1.0;
    kScale = 0.6 * kLength + 0.4 * kGirth;
  }

  // 3. Panel Count Multiplier for ethnic flared garments
  let panelMultiplier = 1.0;
  if (panelCount && (garmentCategory === 'womens-lehenga' || garmentCategory === 'womens-anarkali')) {
    if (panelCount >= 24) {
      panelMultiplier = 1.45;
    } else if (panelCount >= 16) {
      panelMultiplier = 1.20;
    } else if (panelCount > 12) {
      panelMultiplier = 1.0 + (panelCount - 12) * 0.0375;
    }
  }

  const scaledMeters = baseYieldMeters * kScale * widthFactor * panelMultiplier;

  // 4. Pattern Repeat Allowance
  let patternAllowanceMeters = 0;
  if (patternRepeat > 0) {
    const patternFactor = Math.min(0.25, (patternRepeat * 0.0254) / baseYieldMeters);
    patternAllowanceMeters = scaledMeters * patternFactor;
  }

  // 5. Shrinkage Allowance
  const shrinkagePercent = shrinkageBufferPercent ?? (hasShrinkage ? 5 : 0);
  const shrinkageAllowanceMeters = (scaledMeters + patternAllowanceMeters) * (shrinkagePercent / 100);

  // 6. Total Required Meters and Yards
  const requiredMeters = Number((scaledMeters + patternAllowanceMeters + shrinkageAllowanceMeters).toFixed(2));
  const requiredYards = Number((requiredMeters * 1.09361).toFixed(2));

  return {
    requiredYards,
    requiredMeters,
    markerEfficiencyPercent: 88.5,
    shrinkageAllowanceMeters: Number(shrinkageAllowanceMeters.toFixed(2)),
    patternAllowanceMeters: Number(patternAllowanceMeters.toFixed(2)),
    baseYieldMeters
  };
}
