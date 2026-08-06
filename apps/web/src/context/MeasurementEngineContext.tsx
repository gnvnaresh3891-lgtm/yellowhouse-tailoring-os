'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  FabricYieldResult,
  FitPreference,
  GarmentCategory,
  PostureProfile,
  PomSchemaItem
} from '../types/measurement';
import { calculateFabricYield } from '../lib/fabric-yield';
import { POM_SCHEMAS, getGarmentTemplate } from '../lib/pom-schemas';

export interface MeasurementEngineContextType {
  garmentCategory: GarmentCategory;
  setGarmentCategory: (category: GarmentCategory) => void;
  measurements: Record<string, number>;
  setMeasurements: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  updateMeasurement: (pomId: string, value: number) => void;
  fitPreference: FitPreference;
  setFitPreference: (fit: FitPreference) => void;
  postureProfile: PostureProfile;
  setPostureProfile: React.Dispatch<React.SetStateAction<PostureProfile>>;
  boltWidth: number;
  setBoltWidth: (width: number) => void;
  panelCount: number | undefined;
  setPanelCount: (count: number | undefined) => void;
  hasShrinkage: boolean;
  setHasShrinkage: (has: boolean) => void;
  patternRepeat: number;
  setPatternRepeat: (repeat: number) => void;
  girthMeasurement: number | undefined;
  lengthMeasurement: number | undefined;
  fabricYield: FabricYieldResult;
  resetMeasurements: () => void;
}

/**
 * Resolves primary girth & length measurements dynamically from active schema
 * without hardcoding POM ID subsets across all 9 garment categories.
 */
export function getDynamicGirthAndLength(
  garmentCategory: GarmentCategory,
  measurements: Record<string, number>
): { girthMeasurement?: number; lengthMeasurement?: number } {
  const template = POM_SCHEMAS[garmentCategory] || getGarmentTemplate(garmentCategory);
  if (!template || !template.poms || template.poms.length === 0) {
    return {};
  }

  // 1. Primary Girth POM resolution (Chest/Bust/Waist/Hip)
  const girthPom: PomSchemaItem | undefined =
    template.poms.find((p) => p.category === 'girth' && (p.name.toLowerCase().includes('chest') || p.name.toLowerCase().includes('bust'))) ||
    template.poms.find((p) => p.category === 'girth') ||
    template.poms.find((p) => p.category === 'trouser' && (p.name.toLowerCase().includes('seat') || p.name.toLowerCase().includes('hip') || p.name.toLowerCase().includes('waist'))) ||
    template.poms[0];

  // 2. Primary Length POM resolution (Jacket/Sherwani/Shirt/Blouse/Lehenga/Anarkali/Gown length or Outseam)
  const lengthPom: PomSchemaItem | undefined =
    template.poms.find((p) => p.category === 'length' && (p.name.toLowerCase().includes('length') || p.name.toLowerCase().includes('hollow'))) ||
    template.poms.find((p) => p.category === 'length') ||
    template.poms.find((p) => p.name.toLowerCase().includes('outseam')) ||
    template.poms.find((p) => p.name.toLowerCase().includes('length'));

  const girthMeasurement = girthPom
    ? measurements[girthPom.id] ?? measurements[girthPom.code] ?? girthPom.baseMeasurement
    : undefined;

  const lengthMeasurement = lengthPom
    ? measurements[lengthPom.id] ?? measurements[lengthPom.code] ?? lengthPom.baseMeasurement
    : undefined;

  return { girthMeasurement, lengthMeasurement };
}

const DEFAULT_POSTURE: PostureProfile = {
  shoulderSlope: 'normal',
  backCurvature: 'normal',
  abdomenStance: 'normal',
  hipSpineStance: 'normal',
};

export const MeasurementEngineContext = createContext<MeasurementEngineContextType | undefined>(undefined);

export function MeasurementEngineProvider({ children }: { children: ReactNode }) {
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>('mens-suit');
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');
  const [postureProfile, setPostureProfile] = useState<PostureProfile>(DEFAULT_POSTURE);
  const [boltWidth, setBoltWidth] = useState<number>(44);
  const [panelCount, setPanelCount] = useState<number | undefined>(undefined);
  const [hasShrinkage, setHasShrinkage] = useState<boolean>(false);
  const [patternRepeat, setPatternRepeat] = useState<number>(0);

  // Initialize measurements for all poms across templates
  const [measurements, setMeasurements] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const catKey of Object.keys(POM_SCHEMAS) as GarmentCategory[]) {
      const t = POM_SCHEMAS[catKey];
      for (const pom of t.poms) {
        initial[pom.id] = pom.baseMeasurement;
        initial[pom.code] = pom.baseMeasurement;
      }
    }
    return initial;
  });

  const updateMeasurement = (pomId: string, value: number) => {
    setMeasurements((prev) => ({
      ...prev,
      [pomId]: value,
    }));
  };

  const resetMeasurements = () => {
    const template = POM_SCHEMAS[garmentCategory];
    if (template) {
      setMeasurements((prev) => {
        const next = { ...prev };
        for (const pom of template.poms) {
          next[pom.id] = pom.baseMeasurement;
          next[pom.code] = pom.baseMeasurement;
        }
        return next;
      });
    }
  };

  // Dynamic POM key resolution for active schema
  const { girthMeasurement, lengthMeasurement } = useMemo(
    () => getDynamicGirthAndLength(garmentCategory, measurements),
    [garmentCategory, measurements]
  );

  // Dynamic Fabric Yield recalculation
  const fabricYield = useMemo(
    () =>
      calculateFabricYield({
        garmentCategory,
        boltWidth,
        patternRepeat,
        shrinkageBufferPercent: hasShrinkage ? 5 : 0,
        girthMeasurement,
        lengthMeasurement,
        panelCount,
        hasShrinkage,
      }),
    [garmentCategory, boltWidth, patternRepeat, girthMeasurement, lengthMeasurement, panelCount, hasShrinkage]
  );

  const value: MeasurementEngineContextType = {
    garmentCategory,
    setGarmentCategory,
    measurements,
    setMeasurements,
    updateMeasurement,
    fitPreference,
    setFitPreference,
    postureProfile,
    setPostureProfile,
    boltWidth,
    setBoltWidth,
    panelCount,
    setPanelCount,
    hasShrinkage,
    setHasShrinkage,
    patternRepeat,
    setPatternRepeat,
    girthMeasurement,
    lengthMeasurement,
    fabricYield,
    resetMeasurements,
  };

  return (
    <MeasurementEngineContext.Provider value={value}>
      {children}
    </MeasurementEngineContext.Provider>
  );
}

export function useMeasurementEngine(): MeasurementEngineContextType {
  const ctx = useContext(MeasurementEngineContext);
  if (!ctx) {
    throw new Error('useMeasurementEngine must be used within a MeasurementEngineProvider');
  }
  return ctx;
}
