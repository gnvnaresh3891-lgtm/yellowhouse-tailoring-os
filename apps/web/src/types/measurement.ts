export type GarmentCategory =
  | 'mens-suit'
  | 'mens-sherwani'
  | 'mens-shirt'
  | 'mens-trouser'
  | 'womens-blouse'
  | 'womens-lehenga'
  | 'womens-anarkali'
  | 'womens-corset'
  | 'womens-gown';

export type GenderCategory = 'men' | 'women';

export type PostureAxis = 'shoulderSlope' | 'backCurvature' | 'abdomenStance' | 'hipSpineStance';

export type ShoulderSlopeValue = 'normal' | 'sloped' | 'square' | 'very_sloped';
export type BackCurvatureValue = 'normal' | 'stooped' | 'erect' | 'prominent_blade';
export type AbdomenStanceValue = 'normal' | 'prominent' | 'flat';
export type HipSpineStanceValue = 'normal' | 'high_hip' | 'sway_back';

export interface PostureProfile {
  shoulderSlope: ShoulderSlopeValue;
  backCurvature: BackCurvatureValue;
  abdomenStance: AbdomenStanceValue;
  hipSpineStance: HipSpineStanceValue;
}

export type FitPreference = 'skinny' | 'slim' | 'regular' | 'relaxed';

export type UnitSystem = 'in' | 'cm';

export type PomCategoryType = 'length' | 'girth' | 'width' | 'sleeve' | 'trouser';

export interface PomValidationRange {
  min: number; // in inches
  max: number; // in inches
  step?: number;
}

export interface PomSchemaItem {
  id: string;
  code: string;
  name: string;
  category: PomCategoryType;
  baseMeasurement: number; // baseline net body measurement in inches
  defaultEase: number; // category default ease allowance in inches
  landmarkId?: string; // matching SVG hotspot identifier
  unit: UnitSystem;
  validationRange: PomValidationRange;
  description?: string;
}

export interface GarmentTemplate {
  id: GarmentCategory;
  name: string;
  gender: 'Men' | 'Women';
  category: 'Western' | 'Ethnic' | 'Couture';
  poms: PomSchemaItem[];
}

export interface CalculatedEaseResult {
  pomId: string;
  netBody: number; // inches
  categoryBaseEase: number; // inches
  fitPreferenceModifier: number; // inches
  postureOffset: number; // inches
  stretchFactor: number; // inches deducted for elastic fabric
  targetGarmentMeasurement: number; // netBody + ease breakdown
}

export interface FabricYieldInput {
  garmentCategory: GarmentCategory;
  boltWidth: number; // inches
  patternRepeat?: number; // inches
  shrinkageBufferPercent?: number; // percentage, e.g. 5
  girthMeasurement?: number; // e.g. chest or hip girth
  lengthMeasurement?: number; // total garment length
  panelCount?: number; // for kalis (12, 16, 24)
  hasShrinkage?: boolean;
}

export interface FabricYieldResult {
  requiredYards: number;
  requiredMeters: number;
  markerEfficiencyPercent: number;
  shrinkageAllowanceMeters: number;
  patternAllowanceMeters?: number;
  baseYieldMeters?: number;
}

export interface ValidationState {
  errors: Record<string, string>; // pomId -> error message
  warnings: Record<string, string>; // pomId -> warning message
  isValid: boolean;
}

export interface MeasurementVersionSnapshot {
  id?: string;
  clientId?: string;
  versionNumber: number;
  garmentCategory: GarmentCategory;
  fitPreference: FitPreference;
  postureProfile: PostureProfile;
  measurements: Record<string, number>;
  calculatedGarmentPOMs: Record<string, CalculatedEaseResult>;
  createdAt: string;
}

export interface FittingTrialDeltaItem {
  pomId: string;
  pomName: string;
  targetGarmentMeasurement: number;
  observedFittingTrial: number;
  alterationDelta: number; // observed - target
  toleranceStatus: 'within_tolerance' | 'minor_alteration' | 'major_alteration'; // <=0.25", 0.25-0.75", >0.75"
}

export interface FittingTrialComparison {
  trialId: string;
  trialNumber: number;
  versionNumber: number;
  deltas: Record<string, FittingTrialDeltaItem>;
  masterTailorNotes: string;
  status: 'passed' | 'alteration_required' | 're_cut_required';
  createdAt: string;
}
