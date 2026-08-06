import { getGarmentTemplate, getAllGarmentTemplates } from '../../../../apps/web/src/lib/pom-schemas';
import { calculateAllEaseResults, calculateDynamicEase, calculatePostureOffset, getFitPreferenceModifier } from '../../../../apps/web/src/lib/ease-calculator';
import { calculateFabricYield } from '../../../../apps/web/src/lib/fabric-yield';
import { MeasurementsService } from '../../../../apps/api/src/modules/measurements/measurements.service';
import { GarmentCategory, PostureProfile, FitPreference } from '../../../../apps/web/src/types/measurement';

async function runEmpiricalVerification() {
  console.log("=== EMPIRICAL VERIFICATION HARNESS (CHALLENGER M1_2_R2) ===");
  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failCount++;
      failures.push(description);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Verification of 9 Garment Categories in Web and API
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Garment Templates Parity Across All 9 Categories ---");
  const webTemplates = getAllGarmentTemplates();
  const apiService = new MeasurementsService(null as any);
  const apiTemplates = apiService.getGarmentTemplates();

  assert(webTemplates.length === 9, `Web defines exactly 9 garment templates (found ${webTemplates.length})`);
  assert(apiTemplates.length === 9, `API defines exactly 9 garment templates (found ${apiTemplates.length})`);

  const expectedCategories: GarmentCategory[] = [
    'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
    'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
  ];

  for (const cat of expectedCategories) {
    const webT = getGarmentTemplate(cat);
    const apiT = apiTemplates.find(t => t.id === cat);
    assert(!!webT, `Web template exists for '${cat}'`);
    assert(!!apiT, `API template exists for '${cat}'`);
    if (webT && apiT) {
      assert(webT.poms.length === apiT.poms.length, `POM count match for '${cat}': Web=${webT.poms.length}, API=${apiT.poms.length}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 2: Verification of Context POM ID Extraction Logic (All 9 Categories)
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: MeasurementEngineContext Girth & Length POM ID Extractions ---");
  
  // Test girth and length extraction for each category
  const girthKeys = [
    'm-su-01', 'm-sh-01', 'm-st-02', 'm-tr-02', 'm-tr-01',
    'w-sb-02', 'w-lc-04', 'w-lc-01', 'w-an-01', 'w-co-02', 'w-go-01'
  ];
  const lengthKeys = [
    'm-su-05', 'm-sh-06', 'm-st-05', 'm-tr-03',
    'w-sb-09', 'w-lc-03', 'w-an-04', 'w-co-06', 'w-go-04'
  ];

  for (const cat of expectedCategories) {
    const template = getGarmentTemplate(cat);
    const mockMeasurements: Record<string, number> = {};
    for (const pom of template.poms) {
      mockMeasurements[pom.id] = pom.baseMeasurement + 5; // offset base measurement
    }

    // Simulate MeasurementEngineContext extraction logic
    const extractedGirth =
      mockMeasurements['m-su-01'] ??
      mockMeasurements['m-sh-01'] ??
      mockMeasurements['m-st-02'] ??
      mockMeasurements['m-tr-02'] ??
      mockMeasurements['m-tr-01'] ??
      mockMeasurements['w-sb-02'] ??
      mockMeasurements['w-lc-04'] ??
      mockMeasurements['w-lc-01'] ??
      mockMeasurements['w-an-01'] ??
      mockMeasurements['w-co-02'] ??
      mockMeasurements['w-go-01'] ??
      template.poms.find((p) => p.category === 'girth' || p.category === 'trouser')?.baseMeasurement;

    const extractedLength =
      mockMeasurements['m-su-05'] ??
      mockMeasurements['m-sh-06'] ??
      mockMeasurements['m-st-05'] ??
      mockMeasurements['m-tr-03'] ??
      mockMeasurements['w-sb-09'] ??
      mockMeasurements['w-lc-03'] ??
      mockMeasurements['w-an-04'] ??
      mockMeasurements['w-co-06'] ??
      mockMeasurements['w-go-04'] ??
      template.poms.find((p) => p.category === 'length')?.baseMeasurement;

    assert(extractedGirth !== undefined && extractedGirth > 0, `Extracted girth for '${cat}' is valid: ${extractedGirth}`);
    assert(extractedLength !== undefined && extractedLength > 0, `Extracted length for '${cat}' is valid: ${extractedLength}`);
  }

  // -------------------------------------------------------------
  // TEST 3: Ease Calculation Parity Between Web and API
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Web vs API Ease Calculation Parity ---");
  const testPosture: PostureProfile = {
    shoulderSlope: 'very_sloped',
    backCurvature: 'stooped',
    abdomenStance: 'prominent',
    hipSpineStance: 'high_hip'
  };

  for (const cat of expectedCategories) {
    const webT = getGarmentTemplate(cat);
    const defaultMeasurements: Record<string, number> = {};
    for (const pom of webT.poms) {
      defaultMeasurements[pom.code] = pom.baseMeasurement;
      defaultMeasurements[pom.id] = pom.baseMeasurement;
    }

    const webEase = calculateAllEaseResults(cat, defaultMeasurements, 'slim', testPosture);
    const apiEase = apiService.calculateEase({
      garmentCategory: cat,
      measurements: defaultMeasurements,
      fitPreference: 'slim',
      postureProfile: testPosture
    });

    for (const pom of webT.poms) {
      const webResult = webEase[pom.id];
      const apiResult = apiEase.calculatedGarmentPOMs[pom.code];

      assert(!!webResult, `Web ease result exists for ${cat}:${pom.code}`);
      assert(!!apiResult, `API ease result exists for ${cat}:${pom.code}`);

      if (webResult && apiResult) {
        assert(webResult.postureOffset === apiResult.postureOffset,
          `Posture offset match for ${cat}:${pom.code} (${webResult.postureOffset} vs ${apiResult.postureOffset})`);
        assert(webResult.targetGarmentMeasurement === apiResult.targetGarmentMeasurement,
          `Target measurement match for ${cat}:${pom.code} (${webResult.targetGarmentMeasurement} vs ${apiResult.targetGarmentMeasurement})`);
      }
    }
  }

  // -------------------------------------------------------------
  // TEST 4: Fabric Yield Parity & Discrepancy Analysis
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: Web vs API Fabric Yield Parity ---");
  
  // 4a. 44" bolt width standard yield
  const suitYieldWeb = calculateFabricYield({
    garmentCategory: 'mens-suit',
    boltWidth: 44,
    patternRepeat: 0,
    shrinkageBufferPercent: 5,
    girthMeasurement: 40.0,
    lengthMeasurement: 30.0
  });
  const suitYieldApi = apiService.calculateFabricYield({
    garmentCategory: 'mens-suit',
    fabricWidthInches: 44,
    chestOrHipSizeInches: 40.0,
    hasShrinkage: true
  });

  assert(suitYieldWeb.requiredMeters === suitYieldApi.estimatedMeters,
    `Suit yield match: Web=${suitYieldWeb.requiredMeters}m vs API=${suitYieldApi.estimatedMeters}m`);

  // 4b. Women's 24-kali lehenga yield parity
  const lehengaWeb = calculateFabricYield({
    garmentCategory: 'womens-lehenga',
    boltWidth: 44,
    panelCount: 24,
    hasShrinkage: true,
    shrinkageBufferPercent: 5,
    girthMeasurement: 36.0,
    lengthMeasurement: 42.0
  });
  const lehengaApi = apiService.calculateFabricYield({
    garmentCategory: 'womens-lehenga',
    fabricWidthInches: 44,
    panelCount: 24,
    hasShrinkage: true,
    chestOrHipSizeInches: 36.0
  });

  assert(lehengaWeb.requiredMeters === lehengaApi.estimatedMeters,
    `24-kali lehenga yield match: Web=${lehengaWeb.requiredMeters}m vs API=${lehengaApi.estimatedMeters}m`);

  // -------------------------------------------------------------
  // TEST 5: Edge Case Testing (Zero/Falsy values, Invalid Input)
  // -------------------------------------------------------------
  console.log("\n--- TEST 5: Edge Cases & Defensive Guards ---");

  // 5a. Zero/Negative bolt width defensive fallback
  const zeroBoltWeb = calculateFabricYield({
    garmentCategory: 'mens-suit',
    boltWidth: 0
  });
  const zeroBoltApi = apiService.calculateFabricYield({
    garmentCategory: 'mens-suit',
    fabricWidthInches: 0
  });
  assert(!isNaN(zeroBoltWeb.requiredMeters) && zeroBoltWeb.requiredMeters > 0, `Web handles boltWidth=0 gracefully (${zeroBoltWeb.requiredMeters}m)`);
  assert(!isNaN(zeroBoltApi.estimatedMeters) && zeroBoltApi.estimatedMeters > 0, `API handles boltWidth=0 gracefully (${zeroBoltApi.estimatedMeters}m)`);

  // 5b. Falsy / 0 Measurement value in API calculateEase
  const zeroMeasurementApi = apiService.calculateEase({
    garmentCategory: 'mens-suit',
    measurements: { 'M-SU-01': 0 },
    fitPreference: 'regular'
  });
  console.log(`[Diagnostic] API calculateEase with M-SU-01=0 netBody: ${zeroMeasurementApi.calculatedGarmentPOMs['M-SU-01'].netBody}`);
  const zeroMeasurementWeb = calculateAllEaseResults('mens-suit', { 'm-su-01': 0 }, 'regular', {
    shoulderSlope: 'normal', backCurvature: 'normal', abdomenStance: 'normal', hipSpineStance: 'normal'
  });
  console.log(`[Diagnostic] Web calculateEase with m-su-01=0 netBody: ${zeroMeasurementWeb['m-su-01'].netBody}`);

  assert(zeroMeasurementWeb['m-su-01'].netBody === 0, `Web preserves 0 measurement value`);
  assert(zeroMeasurementApi.calculatedGarmentPOMs['M-SU-01'].netBody === 0, `API preserves 0 measurement value (checking if || converted 0 to baseMeasurement)`);

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================");

  if (failCount > 0) {
    console.log("\nFailure Details:");
    failures.forEach(f => console.log(`- ${f}`));
  }
}

runEmpiricalVerification().catch(err => {
  console.error("Fatal verification error:", err);
});
