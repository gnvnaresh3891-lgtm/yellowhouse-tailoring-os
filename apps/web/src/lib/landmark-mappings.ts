import {
  GarmentCategory,
  GenderCategory,
  PomSchemaItem,
  PostureProfile,
  ValidationState
} from '../types/measurement';
import { getGarmentTemplate, POM_SCHEMAS } from './pom-schemas';

export type AnatomicalView = 'front' | 'back' | 'side';

export interface LandmarkCoordinates {
  x: number; // 0 - 400 ViewBox width
  y: number; // 0 - 800 ViewBox height
  r?: number; // hotspot circle radius
}

export interface MeasurementGuideline {
  type: 'horizontal_band' | 'vertical_tape' | 'arc_line' | 'point_pin';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curvature?: number;
}

export interface LandmarkDefinition {
  id: string;
  label: string;
  gender: GenderCategory;
  primaryView: AnatomicalView;
  coordinates: LandmarkCoordinates;
  guideline: MeasurementGuideline;
  description: string;
}

export type HotspotStatus = 'valid' | 'warning' | 'error' | 'focused' | 'inactive';

export interface HotspotColorConfig {
  status: HotspotStatus;
  hex: string;
  fillClass: string;
  strokeClass: string;
  glowClass: string;
  badgeBg: string;
  pulseAnimationClass: string;
}

export interface ProportionCheckResult {
  pomId: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface PostureAlertTrigger {
  axis: string;
  value: string;
  affectedPomIds: string[];
  affectedLandmarkIds: string[];
  alertMessage: string;
  patternEffectNote: string;
}

export const LANDMARK_DEFINITIONS: Record<string, LandmarkDefinition> = {
  // --- MEN'S ANATOMICAL HOTSPOTS ---
  'hs-mens-neck': {
    id: 'hs-mens-neck',
    label: 'Neck / Band Collar Base',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 115, r: 10 },
    guideline: { type: 'horizontal_band', startX: 168, startY: 115, endX: 232, endY: 115 },
    description: 'Base of neck surrounding C7 vertebra to front collar band'
  },
  'hs-mens-shoulder': {
    id: 'hs-mens-shoulder',
    label: 'Shoulder Width (Acromion Point)',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 130, y: 135, r: 10 },
    guideline: { type: 'horizontal_band', startX: 130, startY: 135, endX: 270, endY: 135 },
    description: 'Distance across shoulders between acromion bone tips'
  },
  'hs-mens-across-chest': {
    id: 'hs-mens-across-chest',
    label: 'Across Chest Width',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 165, r: 9 },
    guideline: { type: 'horizontal_band', startX: 150, startY: 165, endX: 250, endY: 165 },
    description: 'Front width between armpit creases'
  },
  'hs-mens-chest': {
    id: 'hs-mens-chest',
    label: 'Chest Apex Circumference',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 190, r: 12 },
    guideline: { type: 'horizontal_band', startX: 145, startY: 190, endX: 255, endY: 190 },
    description: 'Fullest girth around chest under armpits'
  },
  'hs-mens-armscye': {
    id: 'hs-mens-armscye',
    label: 'Armscye / Armhole Base',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 145, y: 180, r: 9 },
    guideline: { type: 'arc_line', startX: 130, startY: 135, endX: 145, endY: 220, curvature: 15 },
    description: 'Armhole scye contour depth from shoulder tip'
  },
  'hs-mens-bicep': {
    id: 'hs-mens-bicep',
    label: 'Full Bicep Girth',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 115, y: 230, r: 10 },
    guideline: { type: 'horizontal_band', startX: 100, startY: 230, endX: 130, endY: 230 },
    description: 'Transverse bicep circumference at arm flex'
  },
  'hs-mens-sleeve': {
    id: 'hs-mens-sleeve',
    label: 'Sleeve Length (Crown-to-Wrist)',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 105, y: 300, r: 10 },
    guideline: { type: 'vertical_tape', startX: 130, startY: 135, endX: 100, endY: 370 },
    description: 'Length from shoulder crown bone down to wrist bone'
  },
  'hs-mens-cuff': {
    id: 'hs-mens-cuff',
    label: 'Wrist / Cuff Circumference',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 100, y: 370, r: 9 },
    guideline: { type: 'horizontal_band', startX: 88, startY: 370, endX: 112, endY: 370 },
    description: 'Wrist joint circumference for sleeve cuff fit'
  },
  'hs-mens-waist': {
    id: 'hs-mens-waist',
    label: 'Jacket / Shirt Natural Waist',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 280, r: 11 },
    guideline: { type: 'horizontal_band', startX: 152, startY: 280, endX: 248, endY: 280 },
    description: 'Natural waistline at jacket top button level'
  },
  'hs-mens-trouser-waist': {
    id: 'hs-mens-trouser-waist',
    label: 'Trouser Waistband Height',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 330, r: 11 },
    guideline: { type: 'horizontal_band', startX: 148, startY: 330, endX: 252, endY: 330 },
    description: 'Waistband wearing height for trousers'
  },
  'hs-mens-hip': {
    id: 'hs-mens-hip',
    label: 'Full Seat / Hip Girth',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 360, r: 12 },
    guideline: { type: 'horizontal_band', startX: 145, startY: 360, endX: 255, endY: 360 },
    description: 'Fullest seat and hip circumference'
  },
  'hs-mens-jacket-len': {
    id: 'hs-mens-jacket-len',
    label: 'Center Back Jacket Length',
    gender: 'men',
    primaryView: 'back',
    coordinates: { x: 200, y: 340, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 115, endX: 200, endY: 340 },
    description: 'Vertical drop line from C7 vertebra seam to hem'
  },
  'hs-mens-shirt-len': {
    id: 'hs-mens-shirt-len',
    label: 'Back Shirt Tail Length',
    gender: 'men',
    primaryView: 'back',
    coordinates: { x: 200, y: 350, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 115, endX: 200, endY: 350 },
    description: 'Center back neck collar base to curved shirt tail'
  },
  'hs-mens-sherwani-len': {
    id: 'hs-mens-sherwani-len',
    label: 'Royal Sherwani Full Length',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 580, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 115, endX: 200, endY: 580 },
    description: 'Full vertical length from C7 vertebra seam down to below knee'
  },
  'hs-mens-crotch': {
    id: 'hs-mens-crotch',
    label: 'Crotch Rise Depth',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 200, y: 410, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 330, endX: 200, endY: 410 },
    description: 'Vertical distance from trouser waistband to crotch intersection'
  },
  'hs-mens-thigh': {
    id: 'hs-mens-thigh',
    label: 'Upper Thigh Girth',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 165, y: 470, r: 11 },
    guideline: { type: 'horizontal_band', startX: 145, startY: 470, endX: 185, endY: 470 },
    description: 'Thigh circumference 1 inch below crotch seam'
  },
  'hs-mens-knee': {
    id: 'hs-mens-knee',
    label: 'Knee Midpoint Circumference',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 165, y: 590, r: 10 },
    guideline: { type: 'horizontal_band', startX: 150, startY: 590, endX: 180, endY: 590 },
    description: 'Trouser leg width at knee joint midpoint'
  },
  'hs-mens-ankle': {
    id: 'hs-mens-ankle',
    label: 'Leg Opening / Hem',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 165, y: 730, r: 9 },
    guideline: { type: 'horizontal_band', startX: 152, startY: 730, endX: 178, endY: 730 },
    description: 'Bottom leg cuff opening circumference'
  },
  'hs-mens-outseam': {
    id: 'hs-mens-outseam',
    label: 'Trouser Outseam Length',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 140, y: 530, r: 10 },
    guideline: { type: 'vertical_tape', startX: 148, startY: 330, endX: 154, endY: 740 },
    description: 'Outer leg seam from waistband down to bottom hem'
  },
  'hs-mens-inseam': {
    id: 'hs-mens-inseam',
    label: 'Trouser Inseam Length',
    gender: 'men',
    primaryView: 'front',
    coordinates: { x: 185, y: 570, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 410, endX: 176, endY: 740 },
    description: 'Inner leg seam from crotch intersection down to bottom hem'
  },

  // --- WOMEN'S ANATOMICAL HOTSPOTS ---
  'hs-womens-front-neck': {
    id: 'hs-womens-front-neck',
    label: 'Front Neck Drop Depth',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 130, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 118, endX: 200, endY: 130 },
    description: 'Front neckline drop from shoulder neck point'
  },
  'hs-womens-back-neck': {
    id: 'hs-womens-back-neck',
    label: 'Back Neck Drop Depth',
    gender: 'women',
    primaryView: 'back',
    coordinates: { x: 200, y: 140, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 118, endX: 200, endY: 140 },
    description: 'Back neckline drop for deep-cut blouses or cholis'
  },
  'hs-womens-upperbust': {
    id: 'hs-womens-upperbust',
    label: 'Upper Bust / Overbust',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 175, r: 11 },
    guideline: { type: 'horizontal_band', startX: 148, startY: 175, endX: 252, endY: 175 },
    description: 'High chest girth above full bust under armpits'
  },
  'hs-womens-fullbust': {
    id: 'hs-womens-fullbust',
    label: 'Full Bust Apex Peak',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 205, r: 12 },
    guideline: { type: 'horizontal_band', startX: 142, startY: 205, endX: 258, endY: 205 },
    description: 'Fullest apex girth around bust cup peaks'
  },
  'hs-womens-underbust': {
    id: 'hs-womens-underbust',
    label: 'Underbust / Empire Band',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 230, r: 11 },
    guideline: { type: 'horizontal_band', startX: 150, startY: 230, endX: 250, endY: 230 },
    description: 'Ribcage band girth directly underneath bust cups'
  },
  'hs-womens-apex-dist': {
    id: 'hs-womens-apex-dist',
    label: 'Bust Apex Distance (N-to-N)',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 205, r: 9 },
    guideline: { type: 'horizontal_band', startX: 170, startY: 205, endX: 230, endY: 205 },
    description: 'Span width between left and right bust apex points'
  },
  'hs-womens-apex-height': {
    id: 'hs-womens-apex-height',
    label: 'Apex Height (Shoulder-to-Apex)',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 170, y: 165, r: 9 },
    guideline: { type: 'vertical_tape', startX: 140, startY: 135, endX: 170, endY: 205 },
    description: 'Vertical drop line from high shoulder neck point to bust apex'
  },
  'hs-womens-armscye': {
    id: 'hs-womens-armscye',
    label: 'Armhole / Armscye Depth',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 152, y: 175, r: 9 },
    guideline: { type: 'arc_line', startX: 140, startY: 135, endX: 148, endY: 210, curvature: 12 },
    description: 'Armhole scye arc circumference depth'
  },
  'hs-womens-sleeve': {
    id: 'hs-womens-sleeve',
    label: 'Sleeve Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 120, y: 290, r: 10 },
    guideline: { type: 'vertical_tape', startX: 140, startY: 135, endX: 110, endY: 360 },
    description: 'Shoulder tip down arm to wrist or elbow'
  },
  'hs-womens-waist': {
    id: 'hs-womens-waist',
    label: 'Natural Waist / Corset Cinch',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 275, r: 11 },
    guideline: { type: 'horizontal_band', startX: 155, startY: 275, endX: 245, endY: 275 },
    description: 'Natural waistline cinching position'
  },
  'hs-womens-highhip': {
    id: 'hs-womens-highhip',
    label: 'High Hip Curve',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 325, r: 11 },
    guideline: { type: 'horizontal_band', startX: 148, startY: 325, endX: 252, endY: 325 },
    description: 'High hip spring curve 4 inches below waist'
  },
  'hs-womens-hip': {
    id: 'hs-womens-hip',
    label: 'Full Hip / Seat Girth',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 365, r: 12 },
    guideline: { type: 'horizontal_band', startX: 142, startY: 365, endX: 258, endY: 365 },
    description: 'Fullest hip and seat circumference'
  },
  'hs-womens-blouse-len': {
    id: 'hs-womens-blouse-len',
    label: 'Sari Blouse Total Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 245, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 135, endX: 200, endY: 245 },
    description: 'High shoulder point to bottom blouse band hem'
  },
  'hs-womens-choli-len': {
    id: 'hs-womens-choli-len',
    label: 'Choli Back Length',
    gender: 'women',
    primaryView: 'back',
    coordinates: { x: 200, y: 260, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 135, endX: 200, endY: 260 },
    description: 'Back shoulder seam down to choli bottom edge'
  },
  'hs-womens-yoke-len': {
    id: 'hs-womens-yoke-len',
    label: 'Empire Yoke Height',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 235, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 135, endX: 200, endY: 235 },
    description: 'Shoulder seam down to empire join line'
  },
  'hs-womens-sh-waist': {
    id: 'hs-womens-sh-waist',
    label: 'Shoulder to Waist Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 270, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 135, endX: 200, endY: 270 },
    description: 'High shoulder point down to natural waistline'
  },
  'hs-womens-busk-len': {
    id: 'hs-womens-busk-len',
    label: 'Steel Busk Front Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 255, r: 9 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 175, endX: 200, endY: 325 },
    description: 'Center front steel busk length for corsets'
  },
  'hs-womens-lehenga-len': {
    id: 'hs-womens-lehenga-len',
    label: 'Lehenga Length (Waist to Floor with Heels)',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 155, y: 500, r: 10 },
    guideline: { type: 'vertical_tape', startX: 155, startY: 275, endX: 156, endY: 738 },
    description: 'Navel waistband to floor including high heels'
  },
  'hs-womens-gown-len': {
    id: 'hs-womens-gown-len',
    label: 'Anarkali / Evening Gown Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 720, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 135, endX: 200, endY: 738 },
    description: 'Shoulder seam down to bottom floor hem'
  },
  'hs-womens-hollow-hem': {
    id: 'hs-womens-hollow-hem',
    label: 'Hollow to Hem Floor Length',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 430, r: 10 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 118, endX: 200, endY: 738 },
    description: 'Hollow of neck down to floor hem'
  },
  'hs-womens-train': {
    id: 'hs-womens-train',
    label: 'Evening Gown Train Sweep',
    gender: 'women',
    primaryView: 'back',
    coordinates: { x: 200, y: 765, r: 11 },
    guideline: { type: 'vertical_tape', startX: 200, startY: 738, endX: 200, endY: 780 },
    description: 'Trailing skirt train length extending past floor hem'
  },
  'hs-womens-flare': {
    id: 'hs-womens-flare',
    label: 'Umbrella Flare Circle Hem',
    gender: 'women',
    primaryView: 'front',
    coordinates: { x: 200, y: 745, r: 12 },
    guideline: { type: 'horizontal_band', startX: 60, startY: 745, endX: 340, endY: 745 },
    description: 'Total bottom skirt hem flare circumference'
  }
};

// --- BIDIRECTIONAL LOOKUP FUNCTIONS ---

export function getLandmarkForPom(
  garmentCategory: GarmentCategory,
  pomId: string
): LandmarkDefinition | undefined {
  const template = getGarmentTemplate(garmentCategory);
  const pom = template.poms.find((p) => p.id === pomId || p.code.toLowerCase() === pomId.toLowerCase());
  if (!pom || !pom.landmarkId) return undefined;
  return LANDMARK_DEFINITIONS[pom.landmarkId];
}

export function getPomForLandmark(
  garmentCategory: GarmentCategory,
  landmarkId: string
): PomSchemaItem | undefined {
  const template = getGarmentTemplate(garmentCategory);
  return template.poms.find((p) => p.landmarkId === landmarkId);
}

export function getLandmarksForGarment(
  garmentCategory: GarmentCategory,
  view?: AnatomicalView
): LandmarkDefinition[] {
  const template = getGarmentTemplate(garmentCategory);
  const landmarks: LandmarkDefinition[] = [];
  const added = new Set<string>();

  for (const pom of template.poms) {
    if (pom.landmarkId && LANDMARK_DEFINITIONS[pom.landmarkId] && !added.has(pom.landmarkId)) {
      const lm = LANDMARK_DEFINITIONS[pom.landmarkId];
      if (!view || lm.primaryView === view || (view === 'front' && lm.primaryView === 'side')) {
        landmarks.push(lm);
        added.add(pom.landmarkId);
      }
    }
  }

  return landmarks;
}

// --- ANATOMICAL PROPORTION SANITY EVALUATION ---

export function evaluateAnatomicalProportions(
  garmentCategory: GarmentCategory,
  measurements: Record<string, number>,
  postureProfile?: PostureProfile
): ProportionCheckResult[] {
  const results: ProportionCheckResult[] = [];
  const template = getGarmentTemplate(garmentCategory);

  // Helper to get measurement by POM ID
  const getVal = (id: string): number | undefined => {
    return measurements[id];
  };

  // 1. Women's Bust Tiering: Underbust < Upper Bust < Full Bust
  const upperBust = getVal('w-sb-01') ?? getVal('w-co-01');
  const fullBust = getVal('w-sb-02') ?? getVal('w-lc-04') ?? getVal('w-an-01') ?? getVal('w-co-02') ?? getVal('w-go-01');
  const underbust = getVal('w-sb-03') ?? getVal('w-lc-05') ?? getVal('w-an-02') ?? getVal('w-co-03');

  if (upperBust !== undefined && fullBust !== undefined && upperBust >= fullBust) {
    const fullBustPom = template.poms.find((p) => p.id === 'w-sb-02' || p.id === 'w-co-02' || p.id === 'w-co-01' || p.id === 'w-sb-01');
    if (fullBustPom) {
      results.push({
        pomId: fullBustPom.id,
        severity: 'error',
        message: `Upper Bust (${upperBust}") cannot exceed or equal Full Bust Peak (${fullBust}").`
      });
    }
  }

  if (underbust !== undefined && upperBust !== undefined && underbust >= upperBust) {
    const underbustPom = template.poms.find((p) => p.id === 'w-sb-03' || p.id === 'w-co-03');
    if (underbustPom) {
      results.push({
        pomId: underbustPom.id,
        severity: 'error',
        message: `Underbust Band (${underbust}") cannot exceed or equal Upper Bust (${upperBust}").`
      });
    }
  }

  if (underbust !== undefined && fullBust !== undefined && underbust >= fullBust) {
    const underbustPom = template.poms.find((p) => p.id === 'w-sb-03' || p.id === 'w-lc-05' || p.id === 'w-an-02' || p.id === 'w-co-03');
    if (underbustPom) {
      results.push({
        pomId: underbustPom.id,
        severity: 'error',
        message: `Underbust Band (${underbust}") cannot exceed Full Bust Peak (${fullBust}").`
      });
    }
  }

  // 2. Trouser Seam Length: Inseam < Outseam
  const inseam = getVal('m-tr-04');
  const outseam = getVal('m-tr-03');
  const riseVal = getVal('m-tr-08');

  if (inseam !== undefined && outseam !== undefined) {
    if (inseam >= outseam) {
      results.push({
        pomId: 'm-tr-04',
        severity: 'error',
        message: `Inseam length (${inseam}") must be strictly less than Outseam length (${outseam}").`
      });
    } else {
      const crotchRiseDelta = outseam - inseam;
      if (crotchRiseDelta < 7.0 || crotchRiseDelta > 16.0) {
        results.push({
          pomId: riseVal !== undefined ? 'm-tr-08' : 'm-tr-03',
          severity: 'warning',
          message: `Crotch rise delta (${crotchRiseDelta.toFixed(1)}") is unusual for standard trouser draft (expected 7.0" - 16.0").`
        });
      }
    }
  }

  // 3. Men's Chest vs Waist Girth Invariant
  const chest = getVal('m-su-01') ?? getVal('m-sh-01') ?? getVal('m-st-02');
  const waist = getVal('m-su-02') ?? getVal('m-sh-02') ?? getVal('m-st-03');

  if (chest !== undefined && waist !== undefined) {
    if (waist > chest + 4.0 && postureProfile?.abdomenStance !== 'prominent') {
      const waistPom = template.poms.find((p) => p.id === 'm-su-02' || p.id === 'm-sh-02' || p.id === 'm-st-03');
      if (waistPom) {
        results.push({
          pomId: waistPom.id,
          severity: 'warning',
          message: `Waist girth (${waist}") significantly exceeds Chest girth (${chest}"). Set Abdomen Stance to 'Prominent' if intentional.`
        });
      }
    }
  }

  // 4. Neck-to-Chest Ratio Sanity
  const neck = getVal('m-sh-05') ?? getVal('m-st-01');
  if (neck !== undefined && chest !== undefined) {
    if (neck > chest * 0.50 || neck < chest * 0.28) {
      const neckPom = template.poms.find((p) => p.id === 'm-sh-05' || p.id === 'm-st-01');
      if (neckPom) {
        results.push({
          pomId: neckPom.id,
          severity: 'warning',
          message: `Neck circumference (${neck}") is out of standard proportion relative to Chest girth (${chest}").`
        });
      }
    }
  }

  // 5. Shoulder-to-Chest Ratio Sanity
  const shoulder = getVal('m-su-04') ?? getVal('m-sh-04') ?? getVal('m-st-04');
  if (shoulder !== undefined && chest !== undefined) {
    if (shoulder > chest * 0.60 || shoulder < chest * 0.35) {
      const shoulderPom = template.poms.find((p) => p.id === 'm-su-04' || p.id === 'm-sh-04' || p.id === 'm-st-04');
      if (shoulderPom) {
        results.push({
          pomId: shoulderPom.id,
          severity: 'warning',
          message: `Shoulder width (${shoulder}") is out of proportion relative to Chest girth (${chest}").`
        });
      }
    }
  }

  // 6. Apex Distance Ratio (Women's)
  const apexDist = getVal('w-sb-04');
  if (apexDist !== undefined && fullBust !== undefined) {
    if (apexDist > fullBust * 0.32 || apexDist < fullBust * 0.14) {
      results.push({
        pomId: 'w-sb-04',
        severity: 'warning',
        message: `Bust apex distance (${apexDist}") is disproportionate relative to Full Bust (${fullBust}").`
      });
    }
  }

  // 7. Corset Tight-Lace Sanity
  const waistCinchTarget = getVal('w-co-04');
  const corsetUnderbust = getVal('w-co-03');
  if (waistCinchTarget !== undefined && corsetUnderbust !== undefined) {
    if (waistCinchTarget > corsetUnderbust + 2.0) {
      results.push({
        pomId: 'w-co-04',
        severity: 'warning',
        message: `Corset waist target exceeds underbust line, defying waist-reduction silhouette.`
      });
    }
  }

  return results;
}

// --- POSTURE ALERT TRIGGER LOGIC ---

export function getPostureAlertTriggers(postureProfile: PostureProfile): PostureAlertTrigger[] {
  const triggers: PostureAlertTrigger[] = [];

  if (postureProfile.shoulderSlope === 'sloped') {
    triggers.push({
      axis: 'shoulderSlope',
      value: 'sloped',
      affectedPomIds: ['m-su-07', 'w-sb-08'],
      affectedLandmarkIds: ['hs-mens-armscye', 'hs-womens-armscye'],
      alertMessage: 'Sloped shoulders (+0.25" Armscye depth drop, shoulder seam angle lowered 3°).',
      patternEffectNote: 'Lower shoulder slope seam angle by 3° and increase armscye depth.'
    });
  } else if (postureProfile.shoulderSlope === 'very_sloped') {
    triggers.push({
      axis: 'shoulderSlope',
      value: 'very_sloped',
      affectedPomIds: ['m-su-07', 'w-sb-08'],
      affectedLandmarkIds: ['hs-mens-armscye', 'hs-womens-armscye'],
      alertMessage: 'Very sloped shoulders (+0.50" Armscye depth drop, shoulder pad insertion required).',
      patternEffectNote: 'Lower shoulder slope seam angle by 5° and add shoulder pad buffer.'
    });
  } else if (postureProfile.shoulderSlope === 'square') {
    triggers.push({
      axis: 'shoulderSlope',
      value: 'square',
      affectedPomIds: ['m-su-07', 'w-sb-08'],
      affectedLandmarkIds: ['hs-mens-armscye', 'hs-womens-armscye'],
      alertMessage: 'Square shoulders (-0.25" Armscye depth drop, shoulder seam angle raised 2°).',
      patternEffectNote: 'Raise shoulder tip point by 0.25" to prevent neck compression.'
    });
  }

  if (postureProfile.backCurvature === 'stooped') {
    triggers.push({
      axis: 'backCurvature',
      value: 'stooped',
      affectedPomIds: ['m-su-05', 'm-st-05', 'm-sh-08'],
      affectedLandmarkIds: ['hs-mens-jacket-len', 'hs-mens-across-chest'],
      alertMessage: 'Stooped back (+0.75" Center Back extension to prevent collar gap).',
      patternEffectNote: 'Extend Center Back seam length and widen upper scapula ease.'
    });
  } else if (postureProfile.backCurvature === 'erect') {
    triggers.push({
      axis: 'backCurvature',
      value: 'erect',
      affectedPomIds: ['m-su-05', 'm-st-05'],
      affectedLandmarkIds: ['hs-mens-jacket-len'],
      alertMessage: 'Erect posture (-0.375" Center Back reduction to eliminate lumbar waist rolls).',
      patternEffectNote: 'Reduce lumbar back curve to eliminate fabric pooling.'
    });
  } else if (postureProfile.backCurvature === 'prominent_blade') {
    triggers.push({
      axis: 'backCurvature',
      value: 'prominent_blade',
      affectedPomIds: ['m-su-04', 'm-sh-04'],
      affectedLandmarkIds: ['hs-mens-shoulder'],
      alertMessage: 'Prominent scapula (+0.50" Across Back width, shoulder blade dart expanded).',
      patternEffectNote: 'Expand shoulder blade dart intake by 0.50".'
    });
  }

  if (postureProfile.abdomenStance === 'prominent') {
    triggers.push({
      axis: 'abdomenStance',
      value: 'prominent',
      affectedPomIds: ['m-su-02', 'm-st-03', 'w-lc-01'],
      affectedLandmarkIds: ['hs-mens-waist', 'hs-womens-waist'],
      alertMessage: 'Prominent abdomen (+1.0" Front Waist length & buttoning ease extension).',
      patternEffectNote: 'Add +1.0" front waist length and curve center front line.'
    });
  } else if (postureProfile.abdomenStance === 'flat') {
    triggers.push({
      axis: 'abdomenStance',
      value: 'flat',
      affectedPomIds: ['m-su-02', 'm-st-03'],
      affectedLandmarkIds: ['hs-mens-waist'],
      alertMessage: 'Flat abdomen (-0.50" Front Waist ease streamlined).',
      patternEffectNote: 'Trim front waist ease for ultra-clean fit.'
    });
  }

  if (postureProfile.hipSpineStance === 'high_hip') {
    triggers.push({
      axis: 'hipSpineStance',
      value: 'high_hip',
      affectedPomIds: ['m-tr-02', 'w-lc-02', 'w-co-05'],
      affectedLandmarkIds: ['hs-mens-hip', 'hs-womens-highhip'],
      alertMessage: 'High hip (+0.50" High Hip ease & raised side seam shaping).',
      patternEffectNote: 'Raise hip curve peak 2" higher on side seam.'
    });
  } else if (postureProfile.hipSpineStance === 'sway_back') {
    triggers.push({
      axis: 'hipSpineStance',
      value: 'sway_back',
      affectedPomIds: ['m-tr-08', 'w-lc-06'],
      affectedLandmarkIds: ['hs-mens-crotch', 'hs-womens-choli-len'],
      alertMessage: 'Sway back stance (-0.50" Back Waist rise hollowed out to avoid fabric pooling).',
      patternEffectNote: 'Hollow back waistband seam by 0.50".'
    });
  }

  return triggers;
}

// --- COLOR-CODING STATE RESOLUTION LOGIC ---

export function getHotspotColorConfig(
  pomId: string | undefined,
  validationState: ValidationState,
  postureProfile: PostureProfile,
  isFocused: boolean
): HotspotColorConfig {
  const hasError = pomId ? !!validationState.errors[pomId] : false;
  const hasWarning = pomId ? !!validationState.warnings[pomId] : false;

  if (hasError) {
    return {
      status: isFocused ? 'focused' : 'error',
      hex: '#EF4444',
      fillClass: 'fill-rose-500',
      strokeClass: 'stroke-rose-400',
      glowClass: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      pulseAnimationClass: 'animate-ping'
    };
  }

  if (hasWarning) {
    return {
      status: isFocused ? 'focused' : 'warning',
      hex: '#F59E0B',
      fillClass: 'fill-amber-500',
      strokeClass: 'stroke-amber-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      pulseAnimationClass: 'animate-pulse'
    };
  }

  if (isFocused) {
    return {
      status: 'focused',
      hex: '#EAB308',
      fillClass: 'fill-amber-400',
      strokeClass: 'stroke-amber-300',
      glowClass: 'drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      pulseAnimationClass: 'animate-pulse'
    };
  }

  return {
    status: 'valid',
    hex: '#10B981',
    fillClass: 'fill-emerald-500',
    strokeClass: 'stroke-emerald-400',
    glowClass: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    pulseAnimationClass: 'none'
  };
}
