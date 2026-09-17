/**
 * YellowHouse Tailoring OS — 2D CAD Mathematical & Geometric Utilities
 * Clamping formulas, 4-axis posture modifiers, caliper steppers, and snapshot versioning helpers.
 */

import { ShoulderSlope, ChestStance, BackPosture, Gender, VersionSnapshot } from './cad-schemas';

/**
 * Clamps zoom level strictly between 80% and 135% (0.80 to 1.35)
 */
export const clampZoom = (prev: number, delta: number): number => {
  return Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35);
};

/**
 * Axis 1: Shoulder Slope Offset (Normal 0px, Sloped +8px, Square -8px)
 */
export const getShoulderOffsetY = (slope: ShoulderSlope): number => {
  return slope === 'Sloped' ? 8 : slope === 'Square' ? -8 : 0;
};

/**
 * Axis 2: Chest Stance Curve Apex (Normal Y:192, Forward Y:210, Barrel Y:222)
 */
export const getChestCurve = (stance: ChestStance): string => {
  if (stance === 'Forward') return 'M 160 170 C 170 200, 205 210, 210 210 C 215 210, 250 200, 260 170';
  if (stance === 'Barrel') return 'M 155 170 C 165 212, 200 222, 210 222 C 220 222, 255 212, 265 170';
  return 'M 160 170 C 175 188, 200 192, 210 192 C 220 192, 245 188, 260 170';
};

/**
 * Axis 3: Back Posture Spine DashArray (Normal '5 5', Stooped '3 3', Erect '10 2')
 */
export const getSpineDash = (posture: BackPosture): string => {
  return posture === 'Stooped' ? '3 3' : posture === 'Erect' ? '10 2' : '5 5';
};

/**
 * Axis 4: Heel Height Compensation (Women: heelHeight * 5px; Men: 0px)
 */
export const getHeelOffset = (gender: Gender, heelInches: number): number => {
  return (gender === 'Women' && heelInches > 0) ? heelInches * 5 : 0;
};

/**
 * Dynamic Caliper Steppers clamped to [min, max]
 */
export const applyStepper = (current: number, delta: number, min: number, max: number): number => {
  const next = Number((current + delta).toFixed(2));
  return Math.min(Math.max(next, min), max);
};

/**
 * Snapshot Version History: increments version to v(n+1).0, archives prior current snapshots
 */
export const saveNewSnapshot = (
  snapshots: VersionSnapshot[],
  garment: string,
  pomData: Record<string, number>,
  extraProps: Partial<VersionSnapshot> = {}
): VersionSnapshot[] => {
  const nextVer = `v${(snapshots.length + 1).toFixed(1)}`;
  const newSnapshot: VersionSnapshot = {
    id: `v-${Date.now()}`,
    version: nextVer,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    garment: garment as any,
    status: 'current',
    pomCount: Object.keys(pomData).length,
    pomData,
    ...extraProps
  };
  return [
    newSnapshot,
    ...snapshots.map(s => s.status === 'current' ? { ...s, status: 'archived' as const } : s)
  ];
};
