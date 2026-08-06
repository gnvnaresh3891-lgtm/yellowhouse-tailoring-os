import { getDynamicGirthAndLength } from '../context/MeasurementEngineContext';
import { calculateFabricYield } from '../lib/fabric-yield';
import { GarmentCategory } from '../types/measurement';

describe('MeasurementEngineContext Dynamic POM Resolution', () => {
  const allCategories: GarmentCategory[] = [
    'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
    'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
  ];

  it('should dynamically resolve non-undefined girth and length measurements across all 9 garment categories', () => {
    for (const category of allCategories) {
      const { girthMeasurement, lengthMeasurement } = getDynamicGirthAndLength(category, {});
      expect(girthMeasurement).toBeDefined();
      expect(typeof girthMeasurement).toBe('number');
      expect(girthMeasurement!).toBeGreaterThan(0);

      expect(lengthMeasurement).toBeDefined();
      expect(typeof lengthMeasurement).toBe('number');
      expect(lengthMeasurement!).toBeGreaterThan(0);
    }
  });

  it('should recalculate fabric yield dynamically when measurement inputs change', () => {
    const defaultRes = calculateFabricYield({
      garmentCategory: 'womens-lehenga',
      boltWidth: 44,
      girthMeasurement: 36,
      lengthMeasurement: 42,
      panelCount: 16
    });

    const scaledRes = calculateFabricYield({
      garmentCategory: 'womens-lehenga',
      boltWidth: 44,
      girthMeasurement: 48,
      lengthMeasurement: 50,
      panelCount: 16
    });

    expect(scaledRes.requiredMeters).toBeGreaterThan(defaultRes.requiredMeters);
  });
});
