import { calculateAllEaseResults, calculateDynamicEase, getFitPreferenceModifier } from '../lib/ease-calculator';
import { getGarmentTemplate } from '../lib/pom-schemas';
import { PomSchemaItem, PostureProfile } from '../types/measurement';

describe('Dynamic Ease Allowance Calculator', () => {
  const samplePomItem: PomSchemaItem = {
    id: 'm-su-01',
    code: 'M-SU-01',
    name: 'Jacket Chest Circumference',
    category: 'girth',
    baseMeasurement: 40.0,
    defaultEase: 3.5,
    unit: 'in',
    validationRange: { min: 30.0, max: 60.0 }
  };

  const normalPosture: PostureProfile = {
    shoulderSlope: 'normal',
    backCurvature: 'normal',
    abdomenStance: 'normal',
    hipSpineStance: 'normal'
  };

  it('should compute exact target measurement for regular fit and normal posture', () => {
    const result = calculateDynamicEase({
      pomItem: samplePomItem,
      netBody: 40.0,
      fitPreference: 'regular',
      postureProfile: normalPosture
    });

    expect(result.netBody).toBe(40.0);
    expect(result.categoryBaseEase).toBe(3.5);
    expect(result.fitPreferenceModifier).toBe(0.0);
    expect(result.postureOffset).toBe(0.0);
    expect(result.stretchFactor).toBe(0.0);
    expect(result.targetGarmentMeasurement).toBe(43.5); // 40 + 3.5
  });

  it('should apply fit preference modifiers correctly', () => {
    expect(getFitPreferenceModifier('skinny', 'girth')).toBe(-1.5);
    expect(getFitPreferenceModifier('slim', 'girth')).toBe(-0.75);
    expect(getFitPreferenceModifier('relaxed', 'girth')).toBe(1.25);

    const slimResult = calculateDynamicEase({
      pomItem: samplePomItem,
      netBody: 40.0,
      fitPreference: 'slim',
      postureProfile: normalPosture
    });

    expect(slimResult.fitPreferenceModifier).toBe(-0.75);
    expect(slimResult.targetGarmentMeasurement).toBe(42.75); // 40 + 3.5 - 0.75
  });

  it('should compute stretch factor deduction for elastic fabrics', () => {
    const stretchResult = calculateDynamicEase({
      pomItem: samplePomItem,
      netBody: 40.0,
      fitPreference: 'regular',
      postureProfile: normalPosture,
      stretchPercent: 5 // 5% stretch -> 40 * 0.05 * 0.5 = 1.0 inch deduction
    });

    expect(stretchResult.stretchFactor).toBe(1.0);
    expect(stretchResult.targetGarmentMeasurement).toBe(42.5); // 40 + 3.5 - 1.0
  });

  it('should compute all ease results for a complete garment template', () => {
    const results = calculateAllEaseResults(
      'mens-suit',
      { 'm-su-01': 42.0, 'm-su-02': 36.0 },
      'slim',
      normalPosture
    );

    const template = getGarmentTemplate('mens-suit');
    expect(Object.keys(results)).toHaveLength(template.poms.length);
    expect(results['m-su-01'].netBody).toBe(42.0);
  });
});
