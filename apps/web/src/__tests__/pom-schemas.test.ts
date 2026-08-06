import { getAllGarmentTemplates, getGarmentTemplate, getGarmentTemplatesByGender, POM_SCHEMAS } from '../lib/pom-schemas';
import { GarmentCategory } from '../types/measurement';

describe('POM Schemas Blueprint Verification', () => {
  const allCategories: GarmentCategory[] = [
    'mens-suit',
    'mens-sherwani',
    'mens-shirt',
    'mens-trouser',
    'womens-blouse',
    'womens-lehenga',
    'womens-anarkali',
    'womens-corset',
    'womens-gown'
  ];

  it('should define all 9 garment categories', () => {
    expect(Object.keys(POM_SCHEMAS)).toHaveLength(9);
    for (const cat of allCategories) {
      expect(POM_SCHEMAS[cat]).toBeDefined();
    }
  });

  it('should return templates by category with getAllGarmentTemplates()', () => {
    const templates = getAllGarmentTemplates();
    expect(templates).toHaveLength(9);
  });

  it('should separate templates by gender correctly', () => {
    const menTemplates = getGarmentTemplatesByGender('Men');
    const womenTemplates = getGarmentTemplatesByGender('Women');

    expect(menTemplates).toHaveLength(4);
    expect(womenTemplates).toHaveLength(5);
  });

  it('should ensure each POM item has valid codes, base measurements, and range bounds', () => {
    for (const cat of allCategories) {
      const template = getGarmentTemplate(cat);
      expect(template.poms.length).toBeGreaterThan(0);

      for (const pom of template.poms) {
        expect(pom.code).toBeTruthy();
        expect(pom.name).toBeTruthy();
        expect(pom.baseMeasurement).toBeGreaterThan(0);
        expect(pom.validationRange.min).toBeLessThan(pom.validationRange.max);
        expect(pom.baseMeasurement).toBeGreaterThanOrEqual(pom.validationRange.min);
        expect(pom.baseMeasurement).toBeLessThanOrEqual(pom.validationRange.max);
      }
    }
  });
});
