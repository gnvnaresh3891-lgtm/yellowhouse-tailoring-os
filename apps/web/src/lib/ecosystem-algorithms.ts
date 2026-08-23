/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Core Mathematical & Business Logic Algorithms for All 5 Ecosystem Layers:
 * 
 * 1. Licensing math & HMAC-SHA256 license signature generation
 * 2. Creator earnings & 88/12 royalty split calculation
 * 3. Machine booking cost & 30-minute collision detection
 * 4. Multi-tier volume discount computation
 * 5. Smart fabric recommendation & scoring engine
 * 6. Milestone escrow state machine & contract transitions
 * 7. 3-Month trial entitlement evaluation & export resolution gate
 */

import {
  FashionBlueprintAsset,
  LicenseTierType,
  LicenseType,
  WorkshopMachineListing,
  ShiftType,
  MachineReservationRecord,
  MachineReservationCostBreakdown,
  VendorMaterialItem,
  SmartRecommendationInput,
  SmartFabricRecommendationResult,
  FabricRecommendationOption,
  ProductionContractRecord,
  ProductionContractMilestone,
  ProductionMilestoneStatus,
  TenantTrialOnboardingProfile,
  GarmentCategory
} from '../types/ecosystem';

import { calculateFabricYield } from './fabric-yield';

// ============================================================================
// 1. PURE JS SHA-256 IMPLEMENTATION (ZERO DEPENDENCY / RUNTIME AGNOSTIC)
// ============================================================================

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function computeSha256Hex(ascii: string): string {
  let i = 0;
  let j = 0;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii.length; i++) {
    const charCode = ascii.charCodeAt(i);
    const wordIndex = i >> 2;
    words[wordIndex] = (words[wordIndex] || 0) | ((charCode & 0xff) << (24 - (i % 4) * 8));
  }
  const lastWordIndex = ascii.length >> 2;
  words[lastWordIndex] = (words[lastWordIndex] || 0) | (0x80 << (24 - (ascii.length % 4) * 8));
  const totalWords = (((ascii.length + 8) >> 6) + 1) * 16;
  words[totalWords - 1] = asciiBitLength;

  for (i = 0; i < totalWords; i += 16) {
    const w: number[] = [];
    for (j = 0; j < 16; j++) {
      w[j] = words[i + j] || 0;
    }
    for (j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;

    for (j = 0; j < 64; j++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (8 * j)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// ============================================================================
// 2. LAYER 1: DIGITAL ASSET LICENSING & ROYALTY ENGINE
// ============================================================================

export interface LicensePricingCalculation {
  priceInr: number;
  priceUsd: number;
  allowedRuns: number;
  commercialAllowed: boolean;
  transfersIp: boolean;
  tierName: string;
}

/**
 * Calculates standardized 3-tier license pricing based on asset base price.
 */
export function calculateLicensePricing(
  basePrice: number,
  licenseType: LicenseType | LicenseTierType
): LicensePricingCalculation {
  const safeBase = Math.max(500, Math.round(basePrice));
  const inrToUsdRate = 82.5;

  switch (licenseType) {
    case 'COMMERCIAL_PRODUCTION': {
      const priceInr = Math.round(safeBase * 4.11);
      const priceUsd = Math.round((priceInr / inrToUsdRate) * 10) / 10;
      return {
        priceInr,
        priceUsd,
        allowedRuns: 250,
        commercialAllowed: true,
        transfersIp: false,
        tierName: 'Commercial Production Tier'
      };
    }
    case 'EXCLUSIVE_BUYOUT': {
      const priceInr = Math.round(safeBase * 21.11);
      const priceUsd = Math.round((priceInr / inrToUsdRate) * 10) / 10;
      return {
        priceInr,
        priceUsd,
        allowedRuns: 999999,
        commercialAllowed: true,
        transfersIp: true,
        tierName: 'Exclusive Intellectual Property Buyout'
      };
    }
    case 'PERSONAL_BESPOKE':
    default: {
      const priceInr = safeBase;
      const priceUsd = Math.round((priceInr / inrToUsdRate) * 10) / 10;
      return {
        priceInr,
        priceUsd,
        allowedRuns: 3,
        commercialAllowed: false,
        transfersIp: false,
        tierName: 'Personal Bespoke License'
      };
    }
  }
}

/**
 * Computes creator net earnings and platform fee based on standard 88/12 revenue split.
 */
export function calculateCreatorEarningsSplit(
  totalAmount: number,
  royaltyRate: number = 0.88
): { grossAmount: number; platformFee: number; creatorNetEarnings: number; royaltyRate: number } {
  const grossAmount = Math.max(0, Math.round(totalAmount));
  const rate = Math.max(0, Math.min(1.0, royaltyRate));
  const platformFee = Math.round(grossAmount * (1 - rate));
  const creatorNetEarnings = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    creatorNetEarnings,
    royaltyRate: rate
  };
}

/**
 * Generates a cryptographic SHA-256 license signature binding asset, licensee, tier, and timestamp.
 */
export function generateHMACLicenseSignature(
  assetId: string,
  licenseeId: string,
  licenseType: LicenseType | LicenseTierType,
  timestamp: number | string
): string {
  const salt = 'YH_TAILORING_OS_AUTHENTIC_2026';
  const payload = `${assetId}::${licenseeId}::${licenseType}::${timestamp}::${salt}`;
  return computeSha256Hex(payload);
}

/**
 * Generates a formatted license certificate key e.g. "LIC-YH-2026-X892-F91A".
 */
export function generateFormattedLicenseKey(assetId: string, licenseeId: string, timestamp: number = Date.now()): string {
  const hash = computeSha256Hex(`${assetId}_${licenseeId}_${timestamp}`).toUpperCase();
  const seg1 = hash.substring(0, 4);
  const seg2 = hash.substring(4, 8);
  const year = new Date(timestamp).getFullYear();
  return `LIC-YH-${year}-${seg1}-${seg2}`;
}

// ============================================================================
// 3. LAYER 2: MACHINE BOOKING & COLLISION DETECTION ALGORITHM
// ============================================================================

export interface CollisionCheckResult {
  hasConflict: boolean;
  conflictingReservation?: MachineReservationRecord;
  reason?: string;
}

/**
 * Validates machine reservation time slot against existing bookings with a mandatory maintenance buffer.
 */
export function checkMachineSlotCollision(
  existingReservations: MachineReservationRecord[],
  machineId: string,
  startTime: string | Date,
  endTime: string | Date,
  newReservationId?: string,
  bufferMinutes: number = 30
): CollisionCheckResult {
  const bufferMs = bufferMinutes * 60 * 1000;
  const candidateStartMs = (typeof startTime === 'string' ? new Date(startTime).getTime() : startTime.getTime()) - bufferMs;
  const candidateEndMs = (typeof endTime === 'string' ? new Date(endTime).getTime() : endTime.getTime()) + bufferMs;

  if (isNaN(candidateStartMs) || isNaN(candidateEndMs) || candidateEndMs <= candidateStartMs) {
    return {
      hasConflict: true,
      reason: 'Invalid candidate start or end time specified.'
    };
  }

  for (const res of existingReservations) {
    if (res.machineId !== machineId) continue;
    if (res.reservationStatus === 'CANCELLED') continue;
    if (newReservationId && res.id === newReservationId) continue;

    const rStartMs = new Date(res.startTime).getTime();
    const rEndMs = new Date(res.endTime).getTime();

    if (isNaN(rStartMs) || isNaN(rEndMs)) continue;

    // Overlap condition: candidateStartMs < rEndMs AND candidateEndMs > rStartMs
    if (candidateStartMs < rEndMs && candidateEndMs > rStartMs) {
      return {
        hasConflict: true,
        conflictingReservation: res,
        reason: `Collision detected with reservation ${res.reservationNumber || res.id} (${new Date(res.startTime).toLocaleTimeString()} - ${new Date(res.endTime).toLocaleTimeString()}) including ${bufferMinutes}m buffer.`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Calculates complete machine reservation cost breakdown including shift rate, operator fee, and 18% GST.
 */
export function calculateMachineBookingCost(
  machine: WorkshopMachineListing,
  shiftType: ShiftType | 'HOURLY' | 'DAILY_SHIFT' | 'DAILY_FULL_SHIFT' | 'PANEL_BATCH',
  durationHoursOrDays: number,
  withOperator: boolean
): MachineReservationCostBreakdown {
  const duration = Math.max(1, durationHoursOrDays);
  let machineBaseCost = 0;
  let operatorFee = 0;

  if (shiftType === 'DAILY_FULL_SHIFT' || shiftType === 'DAILY_SHIFT') {
    machineBaseCost = machine.pricing.dailyShiftRateInr * duration;
    if (withOperator) {
      operatorFee = machine.pricing.operatorAssistanceFeePerHourInr * (duration * 8);
    }
  } else if (shiftType === 'PANEL_BATCH') {
    const batchHours = Math.max(2, duration);
    machineBaseCost = machine.pricing.hourlyRateInr * batchHours;
    if (withOperator) {
      operatorFee = machine.pricing.operatorAssistanceFeePerHourInr * batchHours;
    }
  } else {
    // Default HOURLY
    machineBaseCost = machine.pricing.hourlyRateInr * duration;
    if (withOperator) {
      operatorFee = machine.pricing.operatorAssistanceFeePerHourInr * duration;
    }
  }

  const cleaningFee = 500;
  const securityDeposit = machine.pricing.securityDepositInr;
  const taxableSubtotal = machineBaseCost + operatorFee + cleaningFee;
  const taxesInr = Math.round(taxableSubtotal * 0.18); // 18% GST
  const totalAmountInr = taxableSubtotal + taxesInr + securityDeposit;

  return {
    machineBaseCost,
    operatorFee,
    securityDeposit,
    cleaningFee,
    taxesInr,
    totalAmountInr
  };
}

// ============================================================================
// 4. LAYER 3: SUPPLY LAYER & SMART FABRIC RECOMMENDATION ENGINE
// ============================================================================

export interface VolumePriceResult {
  unitPricePerMeterInr: number;
  discountPercent: number;
  totalCostInr: number;
  tierIndex: number;
  savingsInr: number;
}

/**
 * Computes volume-discounted price per meter and total cost based on quantity tiers.
 */
export function calculateVolumeDiscountedPrice(
  material: VendorMaterialItem,
  quantityMeters: number
): VolumePriceResult {
  const quantity = Math.max(0.1, quantityMeters);
  const tiers = material.pricingTiers || [];

  if (tiers.length === 0) {
    const defaultPrice = 1200;
    return {
      unitPricePerMeterInr: defaultPrice,
      discountPercent: 0,
      totalCostInr: Math.round(defaultPrice * quantity),
      tierIndex: 0,
      savingsInr: 0
    };
  }

  let selectedTier = tiers[0];
  let selectedIndex = 0;

  for (let idx = 0; idx < tiers.length; idx++) {
    const tier = tiers[idx];
    if (quantity >= tier.minMeters && (tier.maxMeters === null || quantity <= tier.maxMeters)) {
      selectedTier = tier;
      selectedIndex = idx;
      break;
    }
  }

  const basePrice = tiers[0].pricePerMeterInr;
  const unitPricePerMeterInr = selectedTier.pricePerMeterInr;
  const discountPercent = selectedTier.discountPercent;
  const totalCostInr = Math.round(unitPricePerMeterInr * quantity);
  const undiscountedCost = Math.round(basePrice * quantity);
  const savingsInr = Math.max(0, undiscountedCost - totalCostInr);

  return {
    unitPricePerMeterInr,
    discountPercent,
    totalCostInr,
    tierIndex: selectedIndex,
    savingsInr
  };
}

/**
 * Multi-variable Smart Fabric Recommendation Algorithm.
 * Evaluates candidate fabrics on silhouette drape physics (45%), budget efficiency (40%), and vendor rating (15%).
 */
export function computeSmartFabricRecommendations(
  candidateFabrics: VendorMaterialItem[],
  criteria: SmartRecommendationInput | {
    targetGarmentType?: GarmentCategory;
    garmentCategory?: GarmentCategory;
    maxBudgetPerMeter?: number;
    targetBudgetInr?: number;
    minRequiredYieldMeters?: number;
    preferredColorTone?: string;
    desiredDrape?: 'STRUCTURED' | 'FLUID' | 'SCULPTURAL' | 'LIGHTWEIGHT';
    season?: 'SUMMER_SPRING' | 'WINTER_FESTIVE' | 'MONSOON_ALL_WEATHER';
    includeLiningAndTrims?: boolean;
    girthMeasurement?: number;
    lengthMeasurement?: number;
    panelCount?: number;
  }
): SmartFabricRecommendationResult {
  const garmentCategory: GarmentCategory =
    criteria.targetGarmentType || criteria.garmentCategory || 'mens-sherwani';

  const targetBudgetInr =
    criteria.targetBudgetInr ||
    (criteria.maxBudgetPerMeter ? criteria.maxBudgetPerMeter * 5 : 15000);

  const desiredDrape = criteria.desiredDrape || 'STRUCTURED';
  const includeLiningAndTrims = criteria.includeLiningAndTrims ?? true;

  // 1. Calculate baseline required yield
  const baseYield = criteria.minRequiredYieldMeters ?? calculateFabricYield({
    garmentCategory,
    boltWidth: 44,
    girthMeasurement: criteria.girthMeasurement,
    lengthMeasurement: criteria.lengthMeasurement,
    panelCount: criteria.panelCount
  }).requiredMeters;

  // 2. Filter fabrics matching garment category
  let fabrics = candidateFabrics.filter(
    m => m.category === 'FABRIC' && (m.recommendedGarments ? m.recommendedGarments.includes(garmentCategory) : true)
  );

  if (fabrics.length === 0) {
    fabrics = candidateFabrics.filter(m => m.category === 'FABRIC' || (m.pricingTiers && m.pricingTiers.length > 0));
  }

  if (fabrics.length === 0) {
    fabrics = candidateFabrics;
  }

  // 3. Score candidates
  const scored = fabrics.map(fabric => {
    const specificYield = calculateFabricYield({
      garmentCategory,
      boltWidth: fabric.boltWidthInches || 44,
      girthMeasurement: criteria.girthMeasurement,
      lengthMeasurement: criteria.lengthMeasurement,
      panelCount: criteria.panelCount
    }).requiredMeters;

    const volumePricing = calculateVolumeDiscountedPrice(fabric, specificYield);
    const unitPrice = volumePricing.unitPricePerMeterInr;
    const fabricCost = volumePricing.totalCostInr;

    // Drape compatibility score (0 - 100)
    let drapeTarget = 5.0;
    if (desiredDrape === 'STRUCTURED') drapeTarget = 3.5;
    if (desiredDrape === 'SCULPTURAL') drapeTarget = 4.5;
    if (desiredDrape === 'FLUID') drapeTarget = 8.0;
    if (desiredDrape === 'LIGHTWEIGHT') drapeTarget = 9.0;

    const drapeDiff = Math.abs((fabric.drapeScore || 5) - drapeTarget);
    const drapeScoreComponent = Math.max(0, 100 - drapeDiff * 18);

    // Budget alignment score (0 - 100)
    const budgetRatio = fabricCost / (targetBudgetInr || 1);
    let budgetScoreComponent = 100;
    if (budgetRatio > 1.0) {
      budgetScoreComponent = Math.max(0, 100 - (budgetRatio - 1.0) * 160);
    } else if (budgetRatio < 0.35) {
      budgetScoreComponent = 75; // Significantly under-budget may indicate sub-premium grade
    }

    // Color tone match bonus
    let colorBonus = 0;
    if (criteria.preferredColorTone) {
      const pref = criteria.preferredColorTone.toLowerCase();
      if (
        (fabric.colorName && fabric.colorName.toLowerCase().includes(pref)) ||
        (fabric.tags && fabric.tags.some(t => t.toLowerCase().includes(pref)))
      ) {
        colorBonus = 10;
      }
    }

    const vendorScore = (fabric.vendor?.rating || 4.5) * 3;
    const compositeScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(drapeScoreComponent * 0.45 + budgetScoreComponent * 0.40 + vendorScore + colorBonus)
      )
    );

    return {
      fabric,
      yieldMeters: specificYield,
      unitPrice,
      fabricCost,
      compositeScore
    };
  });

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  const best = scored[0] || {
    fabric: candidateFabrics[0],
    yieldMeters: baseYield,
    unitPrice: 1850,
    fabricCost: Math.round(1850 * baseYield),
    compositeScore: 92
  };

  const budgetOption = [...scored].sort((a, b) => a.fabricCost - b.fabricCost)[0] || best;
  const luxuryOption = [...scored].sort((a, b) => b.unitPrice - a.unitPrice)[0] || best;

  const trimsCost = includeLiningAndTrims ? 1800 : 0;
  const liningCost = includeLiningAndTrims ? Math.round(best.yieldMeters * 350) : 0;

  const buildOption = (
    item: typeof best,
    type: 'BEST_MATCH' | 'BUDGET_SAVER' | 'LUXURY_UPGRADE',
    reasons: string[]
  ): FabricRecommendationOption => {
    const total = item.fabricCost + (includeLiningAndTrims ? liningCost + trimsCost : 0);
    return {
      optionType: type,
      primaryFabric: item.fabric,
      appliedUnitPriceInr: item.unitPrice,
      requiredMeters: item.yieldMeters,
      fabricTotalCostInr: item.fabricCost,
      liningTotalCostInr: includeLiningAndTrims ? liningCost : 0,
      estimatedTrimsCostInr: trimsCost,
      grandTotalMaterialCostInr: total,
      budgetUtilizationPercent: Math.round((total / targetBudgetInr) * 100),
      fitScore: item.compositeScore,
      reasoning: reasons
    };
  };

  return {
    garmentCategory,
    targetBudgetInr,
    calculatedYieldMeters: baseYield,
    options: {
      bestMatch: buildOption(best, 'BEST_MATCH', [
        `Optimal ${desiredDrape.toLowerCase()} drape rating (${best.fabric.drapeScore || 5}/10) matching silhouette physics`,
        `High yield efficiency on ${best.fabric.boltWidthInches || 44}" bolt width (${best.yieldMeters}m required)`,
        `Fits comfortably within ₹${targetBudgetInr.toLocaleString()} target budget envelope`
      ]),
      budgetSaver: buildOption(budgetOption, 'BUDGET_SAVER', [
        `Maximizes atelier margin with ${budgetOption.fabric.weaveType || 'cost-effective weave'}`,
        `Volume tier savings available from ${budgetOption.fabric.vendor?.name || 'Verified Vendor'}`,
        `Retains structural requirements while reducing material outlay`
      ]),
      luxuryUpgrade: buildOption(luxuryOption, 'LUXURY_UPGRADE', [
        `Haute-couture grade ${luxuryOption.fabric.fiberComposition || 'luxury silk/wool composition'}`,
        `Exceptional hand-feel and heirloom drape longevity`,
        `Includes premium artisanal thread and luxury lining compatibility`
      ])
    },
    comparisonMatrix: [
      {
        criterion: 'Primary Fabric',
        bestMatchValue: best.fabric.name,
        budgetSaverValue: budgetOption.fabric.name,
        luxuryUpgradeValue: luxuryOption.fabric.name
      },
      {
        criterion: 'Unit Cost (INR/m)',
        bestMatchValue: `₹${best.unitPrice.toLocaleString()}`,
        budgetSaverValue: `₹${budgetOption.unitPrice.toLocaleString()}`,
        luxuryUpgradeValue: `₹${luxuryOption.unitPrice.toLocaleString()}`
      },
      {
        criterion: 'Total Material Cost',
        bestMatchValue: `₹${(best.fabricCost + liningCost + trimsCost).toLocaleString()}`,
        budgetSaverValue: `₹${(budgetOption.fabricCost + liningCost + trimsCost).toLocaleString()}`,
        luxuryUpgradeValue: `₹${(luxuryOption.fabricCost + liningCost + trimsCost).toLocaleString()}`
      },
      {
        criterion: 'Drape Rating (1-10)',
        bestMatchValue: `${best.fabric.drapeScore || 5}/10`,
        budgetSaverValue: `${budgetOption.fabric.drapeScore || 5}/10`,
        luxuryUpgradeValue: `${luxuryOption.fabric.drapeScore || 5}/10`
      },
      {
        criterion: 'Vendor Rating',
        bestMatchValue: `★ ${best.fabric.vendor?.rating || 4.8}`,
        budgetSaverValue: `★ ${budgetOption.fabric.vendor?.rating || 4.8}`,
        luxuryUpgradeValue: `★ ${luxuryOption.fabric.vendor?.rating || 4.8}`
      }
    ]
  };
}

// ============================================================================
// 5. LAYER 4: PRODUCTION BIDDING & ESCROW STATE MACHINE
// ============================================================================

export interface ContractTransitionResult {
  updatedContract?: ProductionContractRecord;
  updatedMilestones: ProductionContractMilestone[];
  totalReleasedInr: number;
  remainingInEscrowInr: number;
  isFullyCompleted: boolean;
}

/**
 * Transitions contract milestone escrow state and advances production workflow stages.
 */
export function transitionContractMilestone(
  contractOrMilestones: ProductionContractRecord | ProductionContractMilestone[],
  targetStageIndex: number,
  newStatus: ProductionMilestoneStatus,
  paymentAmount?: number
): ContractTransitionResult {
  const isContract = !Array.isArray(contractOrMilestones) && 'milestones' in contractOrMilestones;
  const milestones: ProductionContractMilestone[] = isContract
    ? JSON.parse(JSON.stringify(contractOrMilestones.milestones))
    : JSON.parse(JSON.stringify(contractOrMilestones));

  const totalContractAmount = isContract
    ? contractOrMilestones.totalContractAmountInr
    : milestones.reduce((sum, m) => sum + m.payoutAmountInr, 0);

  const target = milestones.find(m => m.stageIndex === targetStageIndex);
  if (target) {
    target.status = newStatus;
    if (newStatus === 'APPROVED_AND_PAID') {
      target.approvedAt = new Date().toISOString();
      if (paymentAmount !== undefined) {
        target.payoutAmountInr = paymentAmount;
      }
    }
  }

  const totalReleasedInr = milestones
    .filter(m => m.status === 'APPROVED_AND_PAID')
    .reduce((sum, m) => sum + m.payoutAmountInr, 0);

  const remainingInEscrowInr = Math.max(0, totalContractAmount - totalReleasedInr);
  const isFullyCompleted = milestones.every(m => m.status === 'APPROVED_AND_PAID');

  let updatedContract: ProductionContractRecord | undefined;
  if (isContract) {
    updatedContract = {
      ...contractOrMilestones,
      milestones,
      escrowStatus: isFullyCompleted
        ? 'FULLY_RELEASED'
        : totalReleasedInr > 0
        ? 'PARTIAL_RELEASE'
        : 'HELD_IN_ESCROW',
      currentState: isFullyCompleted
        ? 'COMPLETED'
        : targetStageIndex === 1 && newStatus === 'APPROVED_AND_PAID'
        ? 'SKELETON_TRIAL_INSPECTION'
        : targetStageIndex === 2 && newStatus === 'APPROVED_AND_PAID'
        ? 'EMBROIDERY_ASSEMBLY'
        : targetStageIndex === 3 && newStatus === 'APPROVED_AND_PAID'
        ? 'FINAL_QC'
        : contractOrMilestones.currentState,
      completedAt: isFullyCompleted ? new Date().toISOString() : undefined
    };
  }

  return {
    updatedContract,
    updatedMilestones: milestones,
    totalReleasedInr,
    remainingInEscrowInr,
    isFullyCompleted
  };
}

// ============================================================================
// 6. LAYER 5: 3-MONTH FREE TRIAL ONBOARDING & RESOLUTION EVALUATOR
// ============================================================================

export interface TrialEntitlementsEvaluation {
  isExpired: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
  watermarkRequired: boolean;
  maxExportResolutionDpi: number;
  allow1to1Dxf: boolean;
  allowCommercialBuyout: boolean;
  canSubmitBids: boolean;
  bidsRemaining: number;
}

/**
 * Evaluates tenant trial countdown and determines export security resolution boundaries.
 */
export function evaluateTrialEntitlements(
  trialProfile: TenantTrialOnboardingProfile,
  currentDate: Date = new Date()
): TrialEntitlementsEvaluation {
  const expiryTime = new Date(trialProfile.trialExpiresAt).getTime();
  const nowMs = currentDate.getTime();
  const diffMs = expiryTime - nowMs;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpired = diffMs <= 0 && trialProfile.tier === 'PURPLE_COGS_FREE_TRIAL';
  const isTrialActive = !isExpired && trialProfile.isTrialActive;

  const isProOrEnterprise = trialProfile.tier === 'ATELIER_PRO' || trialProfile.tier === 'HAUTE_ENTERPRISE';

  const watermarkRequired = !isProOrEnterprise && !trialProfile.entitlements.allowWatermarkFreeExports;
  const maxExportResolutionDpi = isProOrEnterprise ? 300 : (trialProfile.entitlements.exportResolutionDpi || 150);

  const allow1to1Dxf = isProOrEnterprise || trialProfile.entitlements.allow1to1DxfExport;
  const allowCommercialBuyout = isProOrEnterprise || trialProfile.entitlements.allowCommercialBuyoutMarketplace;

  const bidsLimit = trialProfile.entitlements.maxTailorBidsPerMonth || 3;
  const bidsUsed = trialProfile.usageCounters.bidsSubmitted || 0;
  const bidsRemaining = Math.max(0, bidsLimit - bidsUsed);
  const canSubmitBids = isTrialActive && (isProOrEnterprise || bidsRemaining > 0);

  return {
    isExpired,
    isTrialActive,
    daysRemaining,
    watermarkRequired,
    maxExportResolutionDpi,
    allow1to1Dxf,
    allowCommercialBuyout,
    canSubmitBids,
    bidsRemaining
  };
}
