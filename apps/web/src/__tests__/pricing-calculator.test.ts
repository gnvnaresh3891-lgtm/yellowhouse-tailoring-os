import { calculateBespokePricing, EMBROIDERY_PRICE_MAP, POSTURE_AXIS_TECHNICAL_FEE } from '../lib/pricing-calculator';
import { GarmentCategory, PostureProfile } from '../types/measurement';

export function runPricingCalculatorTests() {
  console.log('\n[Suite: Bespoke Order Pricing Engine]');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // 1. Basic Men's Suit Pricing Calculation
  const suitPricing = calculateBespokePricing({
    garmentCategory: 'mens-suit',
    fabricCostPerMeter: 3000,
    boltWidth: 44,
  });

  // Base fabric yield = 5.00m. Fabric Cost = 5.00 * 3000 = 15000.
  assert(suitPricing.fabricYieldMeters === 5.00, "Men's suit yield equals 5.00 meters");
  assert(suitPricing.fabricCost === 15000, 'Fabric cost equals ₹15,000 (5.00m * ₹3,000)');
  // Base SAM = 240 mins. Base Labor = 240 * 42 = 10080.
  assert(suitPricing.totalSamMinutes === 240, 'Total SAM minutes equals 240 mins');
  assert(suitPricing.baseLaborCost === 10080, 'Base labor cost equals ₹10,080 (240m * ₹42/m)');
  assert(suitPricing.postureSurcharge === 0, 'Normal posture surcharge equals ₹0');
  assert(suitPricing.embroiderySurcharge === 0, 'Embroidery none surcharge equals ₹0');
  assert(suitPricing.rushSurcharge === 0, 'Non-rush order surcharge equals ₹0');
  assert(suitPricing.totalGarmentPrice === 15000 + 10080, 'Total garment price equals ₹25,080');
  assert(suitPricing.mandatoryAdvance50Percent === 12540, 'Mandatory 50% advance equals ₹12,540');
  assert(suitPricing.balanceDueOnDelivery === 12540, 'Balance due on delivery equals ₹12,540');

  // 2. Posture & Embroidery Surcharge Math Validation
  const postureWithNonNormal: PostureProfile = {
    shoulderSlope: 'sloped', // non-normal
    backCurvature: 'stooped', // non-normal
    abdomenStance: 'normal',
    hipSpineStance: 'sway_back', // non-normal
  }; // 3 non-normal axes

  const sherwaniPricing = calculateBespokePricing({
    garmentCategory: 'mens-sherwani',
    fabricCostPerMeter: 4000,
    postureProfile: postureWithNonNormal,
    embroideryLevel: 'medium', // ₹12,000
    isUrgent: true,
  });

  // 3 non-normal posture axes * 750 = 2250
  assert(sherwaniPricing.postureSurcharge === 3 * POSTURE_AXIS_TECHNICAL_FEE, 'Posture surcharge for 3 non-normal axes equals ₹2,250');
  assert(sherwaniPricing.embroiderySurcharge === EMBROIDERY_PRICE_MAP.medium, 'Medium embroidery surcharge equals ₹12,000');

  // Check base SAM: 210 (sherwani base) + 15 (sloped) + 20 (stooped) + 20 (sway back) + 120 (medium embroidery) = 385 mins
  assert(sherwaniPricing.totalSamMinutes === 385, 'Total SAM includes posture and embroidery additions (385 mins)');
  const expectedSherwaniBaseLabor = 385 * 42; // 16170
  assert(sherwaniPricing.baseLaborCost === expectedSherwaniBaseLabor, `Sherwani labor cost equals ₹${expectedSherwaniBaseLabor}`);

  // Rush Surcharge: +20% on labor + embroidery = 0.20 * (16170 + 12000) = 0.20 * 28170 = 5634
  const expectedRushFee = Math.round(0.20 * (expectedSherwaniBaseLabor + 12000));
  assert(sherwaniPricing.rushSurcharge === expectedRushFee, `Rush surcharge equals +20% of labor+embroidery (₹${expectedRushFee})`);

  // Fabric Cost: sherwani base yield 4.50m * 4000 = 18000
  assert(sherwaniPricing.fabricCost === 18000, 'Fabric cost equals ₹18,000');

  // Total Garment Price = 18000 + 16170 + 2250 + 12000 + 5634 = 54054
  const expectedTotalSherwani = 18000 + expectedSherwaniBaseLabor + 2250 + 12000 + expectedRushFee;
  assert(sherwaniPricing.totalGarmentPrice === expectedTotalSherwani, `Total garment price equals ₹${expectedTotalSherwani}`);
  assert(sherwaniPricing.mandatoryAdvance50Percent === Math.round(expectedTotalSherwani * 0.5), '50% advance accurately calculated');
  assert(sherwaniPricing.balanceDueOnDelivery === expectedTotalSherwani - Math.round(expectedTotalSherwani * 0.5), 'Balance due matches remaining 50%');

  // 3. Women's Lehenga End-to-End Dynamic Integration
  const lehengaPricing = calculateBespokePricing({
    garmentCategory: 'womens-lehenga',
    fabricCostPerMeter: 5000,
    panelCount: 24, // panelMultiplier 1.45 for yield, +60 mins for SAM
    embroideryLevel: 'heavy', // ₹28,000
    isUrgent: false,
  });

  // Base yield 5.80m * 1.45 = 8.41m. Fabric cost = 8.41 * 5000 = 42050.
  assert(lehengaPricing.fabricYieldMeters === 8.41, 'Lehenga 24-panel scaled yield equals 8.41 meters');
  assert(lehengaPricing.fabricCost === Math.round(8.41 * 5000), 'Lehenga fabric cost equals ₹42,050');
  assert(lehengaPricing.embroiderySurcharge === 28000, 'Heavy zardozi embroidery surcharge equals ₹28,000');

  return { passed, failed };
}
