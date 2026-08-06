import { calculatePostureOffset } from '../lib/ease-calculator';
import { PostureProfile } from '../types/measurement';

describe('4-Axis Posture Profile Offset Engine', () => {
  const normalPosture: PostureProfile = {
    shoulderSlope: 'normal',
    backCurvature: 'normal',
    abdomenStance: 'normal',
    hipSpineStance: 'normal'
  };

  it('should return 0 offset for all normal posture axes', () => {
    const offset = calculatePostureOffset('M-SU-01', 'girth', 'Jacket Chest', normalPosture);
    expect(offset).toBe(0);
  });

  it('should adjust armscye and shoulder width for sloped shoulders', () => {
    const slopedPosture: PostureProfile = { ...normalPosture, shoulderSlope: 'sloped' };

    const armscyeOffset = calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', slopedPosture);
    const shoulderOffset = calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', slopedPosture);

    expect(armscyeOffset).toBe(0.375);
    expect(shoulderOffset).toBe(-0.25);
  });

  it('should adjust armscye and shoulder width for very sloped shoulders', () => {
    const verySlopedPosture: PostureProfile = { ...normalPosture, shoulderSlope: 'very_sloped' };

    const armscyeOffset = calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', verySlopedPosture);
    const shoulderOffset = calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', verySlopedPosture);

    expect(armscyeOffset).toBe(0.625);
    expect(shoulderOffset).toBe(-0.375);
  });

  it('should adjust armscye and shoulder width for square shoulders', () => {
    const squarePosture: PostureProfile = { ...normalPosture, shoulderSlope: 'square' };

    const armscyeOffset = calculatePostureOffset('M-SU-07', 'width', 'Armscye Depth', squarePosture);
    const shoulderOffset = calculatePostureOffset('M-SU-04', 'width', 'Shoulder Width', squarePosture);

    expect(armscyeOffset).toBe(-0.25);
    expect(shoulderOffset).toBe(0.25);
  });

  it('should adjust back length and chest girth for stooped back curvature', () => {
    const stoopedPosture: PostureProfile = { ...normalPosture, backCurvature: 'stooped' };

    const lengthOffset = calculatePostureOffset('M-SU-05', 'length', 'Back Length', stoopedPosture);
    const chestOffset = calculatePostureOffset('M-SU-01', 'girth', 'Jacket Chest', stoopedPosture);

    expect(lengthOffset).toBe(0.5);
    expect(chestOffset).toBe(0.375);
  });

  it('should adjust waist girth for prominent abdomen stance', () => {
    const prominentPosture: PostureProfile = { ...normalPosture, abdomenStance: 'prominent' };

    const waistOffset = calculatePostureOffset('M-SU-02', 'girth', 'Buttoning Waist Point', prominentPosture);
    expect(waistOffset).toBe(1.0);
  });

  it('should calculate compound posture offsets when multiple axes are active', () => {
    const compoundPosture: PostureProfile = {
      shoulderSlope: 'sloped', // -0.25 on shoulder width
      backCurvature: 'stooped', // +0.375 on chest girth
      abdomenStance: 'prominent', // +1.0 on waist girth
      hipSpineStance: 'high_hip' // +0.5 on hip girth
    };

    const waistOffset = calculatePostureOffset('M-SU-02', 'girth', 'Waist Girth', compoundPosture);
    expect(waistOffset).toBe(1.0);

    const chestOffset = calculatePostureOffset('M-SU-01', 'girth', 'Chest Girth', compoundPosture);
    expect(chestOffset).toBe(0.375);
  });
});
