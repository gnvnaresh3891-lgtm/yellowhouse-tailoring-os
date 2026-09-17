/**
 * YellowHouse Tailoring OS — 2D CAD Studio Schemas & Types
 * Types, POM landmark definitions, ease offsets, and fitting trial deltas.
 */

export type Gender = 'Men' | 'Women';
export type GarmentType = 'Sherwani' | 'Suit' | 'Blouse' | 'Lehenga' | 'Anarkali' | 'Corset';
export type FitPref = 'Skinny' | 'Slim' | 'Regular' | 'Relaxed';
export type UnitSys = 'in' | 'cm';
export type ViewMode = 'front' | 'back';
export type ShoulderSlope = 'Normal' | 'Sloped' | 'Square';
export type ChestStance = 'Normal' | 'Forward' | 'Barrel';
export type BackPosture = 'Normal' | 'Stooped' | 'Erect';

export const EASE_OFFSETS: Record<string, number> = {
  'Skinny': -0.5,
  'Slim': 0,
  'Regular': 0.5,
  'Relaxed': 1.0
};

export interface PomField {
  id: string;
  code: string;
  name: string;
  base: number;
  min: number;
  max: number;
  landmarkY: number; // Y position on SVG for hotspot
  landmarkX?: number;
}

export interface VersionSnapshot {
  id: string;
  version: string;
  date: string;
  garment: GarmentType;
  status: 'current' | 'archived';
  pomCount: number;
  fitPref?: string;
  customerId?: string;
  customerName?: string;
  pomData?: Record<string, number>;
}

export interface FittingDelta {
  pomName: string;
  original: number;
  trial1: number;
  trial2: number;
  delta1: number;
  delta2: number;
}

export const POM_SCHEMAS: Record<GarmentType, PomField[]> = {
  Sherwani: [
    { id: 'sh-01', code: 'SH-01', name: 'Chest Girth', base: 40, min: 32, max: 56, landmarkY: 200 },
    { id: 'sh-02', code: 'SH-02', name: 'Waist Girth', base: 34, min: 26, max: 50, landmarkY: 280 },
    { id: 'sh-03', code: 'SH-03', name: 'Shoulder Width', base: 18.5, min: 15, max: 22, landmarkY: 140 },
    { id: 'sh-04', code: 'SH-04', name: 'Sleeve Length', base: 25, min: 22, max: 28, landmarkY: 300, landmarkX: 120 },
    { id: 'sh-05', code: 'SH-05', name: 'Sherwani Length', base: 42, min: 36, max: 48, landmarkY: 450 },
    { id: 'sh-06', code: 'SH-06', name: 'Neck Girth', base: 15.5, min: 13, max: 19, landmarkY: 120 },
    { id: 'sh-07', code: 'SH-07', name: 'Bicep Girth', base: 13, min: 10, max: 18, landmarkY: 220, landmarkX: 130 },
    { id: 'sh-08', code: 'SH-08', name: 'Hip Girth', base: 40, min: 34, max: 52, landmarkY: 360 },
  ],
  Suit: [
    { id: 'su-01', code: 'SU-01', name: 'Chest Girth', base: 40, min: 32, max: 56, landmarkY: 200 },
    { id: 'su-02', code: 'SU-02', name: 'Waist Girth', base: 34, min: 26, max: 50, landmarkY: 280 },
    { id: 'su-03', code: 'SU-03', name: 'Shoulder Width', base: 18, min: 15, max: 22, landmarkY: 140 },
    { id: 'su-04', code: 'SU-04', name: 'Sleeve Length', base: 25.5, min: 22, max: 28, landmarkY: 300, landmarkX: 120 },
    { id: 'su-05', code: 'SU-05', name: 'Jacket Length', base: 30, min: 26, max: 34, landmarkY: 400 },
    { id: 'su-06', code: 'SU-06', name: 'Neck Girth', base: 15.5, min: 13, max: 19, landmarkY: 120 },
    { id: 'su-07', code: 'SU-07', name: 'Trouser Waist', base: 34, min: 26, max: 48, landmarkY: 360 },
    { id: 'su-08', code: 'SU-08', name: 'Trouser Outseam', base: 42, min: 36, max: 48, landmarkY: 550 },
    { id: 'su-09', code: 'SU-09', name: 'Trouser Inseam', base: 32, min: 28, max: 36, landmarkY: 580, landmarkX: 220 },
  ],
  Blouse: [
    { id: 'bl-01', code: 'BL-01', name: 'Bust Girth', base: 36, min: 28, max: 48, landmarkY: 210 },
    { id: 'bl-02', code: 'BL-02', name: 'Under-Bust Girth', base: 32, min: 26, max: 42, landmarkY: 240 },
    { id: 'bl-03', code: 'BL-03', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'bl-04', code: 'BL-04', name: 'Shoulder Width', base: 14, min: 12, max: 17, landmarkY: 140 },
    { id: 'bl-05', code: 'BL-05', name: 'Bust Apex Distance', base: 7.5, min: 6, max: 10, landmarkY: 200, landmarkX: 170 },
    { id: 'bl-06', code: 'BL-06', name: 'Front Neck Depth', base: 8, min: 5, max: 12, landmarkY: 135 },
    { id: 'bl-07', code: 'BL-07', name: 'Back Neck Depth', base: 2, min: 1, max: 4, landmarkY: 125 },
    { id: 'bl-08', code: 'BL-08', name: 'Sleeve Length', base: 10, min: 4, max: 24, landmarkY: 250, landmarkX: 130 },
    { id: 'bl-09', code: 'BL-09', name: 'Blouse Length', base: 15, min: 12, max: 20, landmarkY: 330 },
  ],
  Lehenga: [
    { id: 'lh-01', code: 'LH-01', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'lh-02', code: 'LH-02', name: 'Hip Girth', base: 38, min: 32, max: 50, landmarkY: 360 },
    { id: 'lh-03', code: 'LH-03', name: 'Lehenga Length', base: 42, min: 36, max: 48, landmarkY: 550 },
    { id: 'lh-04', code: 'LH-04', name: 'Flare Circumference', base: 120, min: 80, max: 200, landmarkY: 650 },
    { id: 'lh-05', code: 'LH-05', name: 'Kali Panel Count', base: 12, min: 8, max: 24, landmarkY: 500 },
    { id: 'lh-06', code: 'LH-06', name: 'Cancan Height', base: 6, min: 0, max: 12, landmarkY: 620 },
  ],
  Anarkali: [
    { id: 'an-01', code: 'AN-01', name: 'Bust Girth', base: 36, min: 28, max: 48, landmarkY: 210 },
    { id: 'an-02', code: 'AN-02', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'an-03', code: 'AN-03', name: 'Hip Girth', base: 38, min: 32, max: 50, landmarkY: 360 },
    { id: 'an-04', code: 'AN-04', name: 'Shoulder Width', base: 14.5, min: 12, max: 18, landmarkY: 140 },
    { id: 'an-05', code: 'AN-05', name: 'Sleeve Length', base: 22, min: 14, max: 26, landmarkY: 300, landmarkX: 120 },
    { id: 'an-06', code: 'AN-06', name: 'Yoke Length', base: 14.5, min: 12, max: 17, landmarkY: 270 },
    { id: 'an-07', code: 'AN-07', name: 'Total Anarkali Length', base: 54, min: 46, max: 62, landmarkY: 600 },
  ],
  Corset: [
    { id: 'co-01', code: 'CO-01', name: 'Bust Girth', base: 34, min: 28, max: 44, landmarkY: 200 },
    { id: 'co-02', code: 'CO-02', name: 'Under-Bust Girth', base: 30, min: 24, max: 40, landmarkY: 230 },
    { id: 'co-03', code: 'CO-03', name: 'Waist (Cinched)', base: 26, min: 20, max: 36, landmarkY: 280 },
    { id: 'co-04', code: 'CO-04', name: 'High Hip Girth', base: 34, min: 28, max: 44, landmarkY: 340 },
    { id: 'co-05', code: 'CO-05', name: 'Busks Front Length', base: 13, min: 10, max: 16, landmarkY: 270 },
    { id: 'co-06', code: 'CO-06', name: 'Side Seam Height', base: 8.5, min: 6, max: 12, landmarkY: 290, landmarkX: 130 },
    { id: 'co-07', code: 'CO-07', name: 'Boning Channel Count', base: 16, min: 10, max: 24, landmarkY: 260 },
  ],
};

export const GARMENT_GENDER: Record<GarmentType, Gender> = {
  Sherwani: 'Men',
  Suit: 'Men',
  Blouse: 'Women',
  Lehenga: 'Women',
  Anarkali: 'Women',
  Corset: 'Women',
};

export const MENS_GARMENTS: GarmentType[] = ['Sherwani', 'Suit'];
export const WOMENS_GARMENTS: GarmentType[] = ['Blouse', 'Lehenga', 'Anarkali', 'Corset'];

export const fittingDeltas: FittingDelta[] = [
  { pomName: 'Chest Girth', original: 42.5, trial1: 42.0, trial2: 42.25, delta1: -0.5, delta2: -0.25 },
  { pomName: 'Waist Girth', original: 35.0, trial1: 35.5, trial2: 35.25, delta1: +0.5, delta2: +0.25 },
  { pomName: 'Shoulder Width', original: 18.5, trial1: 18.5, trial2: 18.5, delta1: 0, delta2: 0 },
  { pomName: 'Sleeve Length', original: 25.0, trial1: 24.5, trial2: 25.0, delta1: -0.5, delta2: 0 },
  { pomName: 'Sherwani Length', original: 42.0, trial1: 42.0, trial2: 42.0, delta1: 0, delta2: 0 },
  { pomName: 'Neck Girth', original: 15.75, trial1: 16.0, trial2: 15.75, delta1: +0.25, delta2: 0 },
];

// =========================================================================
// 2D CAD STUDIO CALCULATION & TRANSFORM HELPERS
// =========================================================================

export const clampZoom = (prev: number, delta: number): number => {
  return Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35);
};

export const getShoulderOffsetY = (slope: ShoulderSlope | string): number => {
  return slope === 'Sloped' ? 8 : slope === 'Square' ? -8 : 0;
};

export const getChestCurve = (stance: ChestStance | string): string => {
  if (stance === 'Forward') return 'M 160 170 C 170 200, 205 210, 210 210 C 215 210, 250 200, 260 170';
  if (stance === 'Barrel') return 'M 155 170 C 165 212, 200 222, 210 222 C 220 222, 255 212, 265 170';
  return 'M 160 170 C 175 188, 200 192, 210 192 C 220 192, 245 188, 260 170';
};

export const getSpineDash = (posture: BackPosture | string): string => {
  return posture === 'Stooped' ? '3 3' : posture === 'Erect' ? '10 2' : '5 5';
};

export const getHeelOffset = (gender: Gender | string, heelInches: number): number => {
  return (gender === 'Women' && heelInches > 0) ? heelInches * 5 : 0;
};

export const applyStepper = (current: number, delta: number, min: number, max: number): number => {
  const next = Number((current + delta).toFixed(2));
  return Math.min(Math.max(next, min), max);
};

export const saveNewSnapshot = (snapshots: any[], garment: string, pomData: Record<string, number>) => {
  const nextVer = `v${(snapshots.length + 1).toFixed(1)}`;
  const newSnapshot = {
    id: `v-${Date.now()}`,
    version: nextVer,
    date: 'Aug 16, 2026',
    garment,
    status: 'current',
    pomCount: Object.keys(pomData).length,
    pomData
  };
  return [
    newSnapshot,
    ...snapshots.map(s => s.status === 'current' ? { ...s, status: 'archived' } : s)
  ];
};

