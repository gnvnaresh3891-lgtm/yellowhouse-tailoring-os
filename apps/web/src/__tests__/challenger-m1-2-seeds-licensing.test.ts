/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Challenger 2 Adversarial Verification Suite: Seed Catalog Integrity & HMAC Licensing
 */

import * as crypto from 'crypto';
import {
  computeSha256Hex,
  generateHMACLicenseSignature,
  generateFormattedLicenseKey,
  calculateLicensePricing,
  calculateCreatorEarningsSplit,
  calculateVolumeDiscountedPrice,
  calculateMachineBookingCost,
  checkMachineSlotCollision,
  computeSmartFabricRecommendations,
  transitionContractMilestone,
  evaluateTrialEntitlements
} from '../lib/ecosystem-algorithms';

import {
  SEED_FASHION_ASSETS,
  SEED_ASSET_LICENSES,
  SEED_CREATOR_EARNINGS,
  SEED_WORKSHOP_MACHINES,
  SEED_MACHINE_RESERVATIONS,
  SEED_MATERIALS_CATALOG,
  SEED_MATERIAL_ORDERS,
  SEED_ARTISAN_PORTFOLIOS,
  SEED_PRODUCTION_BRIEFS,
  SEED_TAILOR_BIDS,
  SEED_PRODUCTION_CONTRACTS,
  SEED_TENANT_TRIAL_PROFILE,
  SEED_CERTIFIED_STYLISTS,
  SEED_STYLIST_BOOKINGS
} from '../lib/ecosystem-seeds';

import {
  AestheticStyle,
  AssetDifficultyLevel,
  AssetFileFormat,
  LicenseTierType,
  MachineHardwareCategory,
  MachineOperationalStatus,
  MaterialCategory,
  ArtisanSpecialty,
  BriefStatus,
  BidStatus,
  ContractEscrowStatus,
  ProductionMilestoneStatus,
  ContractCurrentState,
  SubscriptionTierType,
  StylistBadgeLevel,
  StylistSpecialization,
  ConsultationMode
} from '../types/ecosystem';

import { GarmentCategory } from '../types/measurement';

export function runChallenger2SeedsAndLicensingTests(): { passed: number; failed: number } {
  console.log('\n===============================================================');
  console.log('--- CHALLENGER 2 ADVERSARIAL: SEEDS INTEGRITY & HMAC SUITE ---');
  console.log('===============================================================\n');

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

  // ==========================================================================
  // SECTION 1: GLOBAL & PER-COLLECTION UNIQUE ID ENFORCEMENT
  // ==========================================================================
  console.log('[Challenger Suite 1: Unique ID & Reference Integrity]');

  const allIds = new Set<string>();
  let duplicateCount = 0;

  function checkUnique(id: string, entityType: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      assert(false, `${entityType} has empty or non-string ID: "${id}"`);
      return;
    }
    if (allIds.has(id)) {
      assert(false, `Duplicate ID detected: "${id}" in ${entityType}`);
      duplicateCount++;
    } else {
      allIds.add(id);
    }
  }

  SEED_FASHION_ASSETS.forEach(a => checkUnique(a.id, 'FashionBlueprintAsset'));
  SEED_ASSET_LICENSES.forEach(l => checkUnique(l.id, 'AssetLicenseCertificate'));
  checkUnique(SEED_CREATOR_EARNINGS.creatorId, 'CreatorEarningsLedger');
  SEED_WORKSHOP_MACHINES.forEach(m => checkUnique(m.id, 'WorkshopMachineListing'));
  SEED_MACHINE_RESERVATIONS.forEach(r => checkUnique(r.id, 'MachineReservationRecord'));
  SEED_MATERIALS_CATALOG.forEach(m => checkUnique(m.id, 'VendorMaterialItem'));
  SEED_MATERIAL_ORDERS.forEach(o => checkUnique(o.id, 'MaterialSourcingOrder'));
  SEED_ARTISAN_PORTFOLIOS.forEach(a => checkUnique(a.id, 'ArtisanPortfolioProfile'));
  SEED_PRODUCTION_BRIEFS.forEach(b => checkUnique(b.id, 'ProductionDesignBrief'));
  SEED_TAILOR_BIDS.forEach(t => checkUnique(t.id, 'TailorProductionBid'));
  SEED_PRODUCTION_CONTRACTS.forEach(c => checkUnique(c.id, 'ProductionContractRecord'));
  checkUnique(SEED_TENANT_TRIAL_PROFILE.tenantId, 'TenantTrialProfile');
  SEED_CERTIFIED_STYLISTS.forEach(s => checkUnique(s.id, 'CertifiedStylistProfile'));
  SEED_STYLIST_BOOKINGS.forEach(b => checkUnique(b.id, 'StylistConsultationBookingRecord'));

  assert(duplicateCount === 0, 'Zero duplicate primary entity IDs across entire seed database');

  // Check Foreign Key Reference Integrity
  const assetIdSet = new Set(SEED_FASHION_ASSETS.map(a => a.id));
  const machineIdSet = new Set(SEED_WORKSHOP_MACHINES.map(m => m.id));
  const materialIdSet = new Set(SEED_MATERIALS_CATALOG.map(m => m.id));
  const artisanIdSet = new Set(SEED_ARTISAN_PORTFOLIOS.map(a => a.id));
  const briefIdSet = new Set(SEED_PRODUCTION_BRIEFS.map(b => b.id));
  const bidIdSet = new Set(SEED_TAILOR_BIDS.map(t => t.id));
  const stylistIdSet = new Set(SEED_CERTIFIED_STYLISTS.map(s => s.id));

  SEED_ASSET_LICENSES.forEach(lic => {
    assert(assetIdSet.has(lic.assetId), `Asset license ${lic.id} references existing asset ${lic.assetId}`);
  });

  SEED_MACHINE_RESERVATIONS.forEach(res => {
    assert(machineIdSet.has(res.machineId), `Machine reservation ${res.id} references existing machine ${res.machineId}`);
  });

  SEED_MATERIAL_ORDERS.forEach(order => {
    order.items.forEach(item => {
      assert(materialIdSet.has(item.materialId), `Material order ${order.id} references valid material ${item.materialId}`);
    });
  });

  SEED_PRODUCTION_BRIEFS.forEach(brief => {
    if (brief.techPackAssetId) {
      assert(assetIdSet.has(brief.techPackAssetId), `Brief ${brief.id} references existing tech pack asset ${brief.techPackAssetId}`);
    }
  });

  SEED_TAILOR_BIDS.forEach(bid => {
    assert(briefIdSet.has(bid.briefId), `Bid ${bid.id} references existing brief ${bid.briefId}`);
    assert(artisanIdSet.has(bid.artisanId), `Bid ${bid.id} references existing artisan ${bid.artisanId}`);
  });

  SEED_PRODUCTION_CONTRACTS.forEach(ctr => {
    assert(briefIdSet.has(ctr.briefId), `Contract ${ctr.id} references existing brief ${ctr.briefId}`);
    assert(bidIdSet.has(ctr.acceptedBidId), `Contract ${ctr.id} references existing bid ${ctr.acceptedBidId}`);
    assert(artisanIdSet.has(ctr.artisanId), `Contract ${ctr.id} references existing artisan ${ctr.artisanId}`);
  });

  SEED_STYLIST_BOOKINGS.forEach(bk => {
    assert(stylistIdSet.has(bk.stylistId), `Stylist booking ${bk.id} references existing stylist ${bk.stylistId}`);
  });

  // ==========================================================================
  // SECTION 2: ENUM VALUE INTEGRITY & STRICT SCHEMA CHECK
  // ==========================================================================
  console.log('\n[Challenger Suite 2: Strict Enum Value Integrity]');

  const VALID_GARMENTS = new Set<string>([
    'mens-suit', 'mens-sherwani', 'mens-shirt', 'mens-trouser',
    'womens-blouse', 'womens-lehenga', 'womens-anarkali', 'womens-corset', 'womens-gown'
  ]);

  const VALID_AESTHETICS = new Set<string>([
    'INDO_WESTERN', 'TRADITIONAL_BRIDAL', 'MODERN_SAVILE_ROW',
    'AVANT_GARDE', 'MINIMALIST_COUTURE', 'HERITAGE_ROYAL', 'CONTEMPORARY_STREETWEAR'
  ]);

  const VALID_DIFFICULTIES = new Set<string>([
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER_KARIGAR'
  ]);

  const VALID_FILE_FORMATS = new Set<string>([
    '.dxf', '.clo3d', '.zprj', '.pdf', '.svg', '.ai', '.glb', '.blend'
  ]);

  const VALID_LICENSE_TIERS = new Set<string>([
    'PERSONAL_BESPOKE', 'COMMERCIAL_PRODUCTION', 'EXCLUSIVE_BUYOUT'
  ]);

  const VALID_MACHINE_CATS = new Set<string>([
    'DIGITAL_TEXTILE_PRINTER', 'CNC_LASER_CUTTER', 'MULTI_HEAD_EMBROIDERY',
    'HEAVY_STITCHING_UNIT', 'STEAM_FINISHER_FUSING'
  ]);

  const VALID_MACHINE_STATUSES = new Set<string>([
    'AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE'
  ]);

  const VALID_MATERIAL_CATS = new Set<string>([
    'FABRIC', 'LINING', 'INTERFACING', 'TRIM', 'EMBELLISHMENT_THREAD',
    'COTTON', 'SILK', 'VELVET', 'ORGANZA', 'LININGS', 'TRIMS'
  ]);

  const VALID_ARTISAN_SPECIALTIES = new Set<string>([
    'ZARDOZI_EMBROIDERY', 'MASTER_CANVAS_CUTTING', 'LEHENGA_FLARED_CONSTRUCTION',
    'TUXEDO_BESPOKE', 'CORSETRY_BONING', 'AARI_THREADWORK', 'SHERWANI_STRUCTURE',
    'HAND_ROLLED_BUTTONHOLES', 'ZARDOZI', 'MASTER_CUTTING', 'TUXEDOS', 'LEHENGAS', 'CORSETRY'
  ]);

  const VALID_BRIEF_STATUSES = new Set<string>([
    'DRAFT', 'OPEN_FOR_BIDS', 'BID_ACCEPTED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'
  ]);

  const VALID_BID_STATUSES = new Set<string>([
    'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'
  ]);

  const VALID_ESCROW_STATUSES = new Set<string>([
    'HELD_IN_ESCROW', 'PARTIAL_RELEASE', 'FULLY_RELEASED', 'DISPUTED'
  ]);

  const VALID_MILESTONE_STATUSES = new Set<string>([
    'PENDING', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'APPROVED_AND_PAID'
  ]);

  const VALID_CONTRACT_STATES = new Set<string>([
    'CONTRACT_SIGNED', 'MATERIALS_RECEIVED', 'PATTERN_CUTTING',
    'SKELETON_TRIAL_INSPECTION', 'EMBROIDERY_ASSEMBLY', 'FINAL_QC', 'DISPATCHED', 'COMPLETED'
  ]);

  const VALID_SUB_TIERS = new Set<string>([
    'PURPLE_COGS_FREE_TRIAL', 'ATELIER_PRO', 'HAUTE_ENTERPRISE'
  ]);

  const VALID_STYLIST_BADGES = new Set<string>([
    'PURPLE_COGS_CERTIFIED', 'MASTER_DRAPER', 'TROUSSEAU_ARCHITECT'
  ]);

  const VALID_STYLIST_SPECS = new Set<string>([
    'BRIDAL_TROUSSEAU', 'INDO_WESTERN_FUSION', 'BESPOKE_SUITING_CONSULTANT',
    'ZARDOZI_MOTIF_CURATION', 'COLOR_SEASONAL_ANALYSIS', 'ROYAL_HERITAGE_DRAPING'
  ]);

  const VALID_CONSULTATION_MODES = new Set<string>([
    'IN_PERSON_ATELIER', 'VIRTUAL_HD', 'CLIENT_WARDROBE_VISIT'
  ]);

  // Validate FashionBlueprintAsset enums
  SEED_FASHION_ASSETS.forEach(a => {
    assert(VALID_GARMENTS.has(a.garmentCategory), `Asset ${a.id} has valid garmentCategory ${a.garmentCategory}`);
    assert(VALID_AESTHETICS.has(a.aestheticStyle), `Asset ${a.id} has valid aestheticStyle ${a.aestheticStyle}`);
    assert(VALID_DIFFICULTIES.has(a.difficultyLevel), `Asset ${a.id} has valid difficultyLevel ${a.difficultyLevel}`);
    a.fileFormats.forEach(fmt => {
      assert(VALID_FILE_FORMATS.has(fmt), `Asset ${a.id} format ${fmt} is recognized`);
    });
  });

  // Validate Workshop Machines enums
  SEED_WORKSHOP_MACHINES.forEach(m => {
    assert(VALID_MACHINE_CATS.has(m.category), `Machine ${m.id} has valid category ${m.category}`);
    assert(VALID_MACHINE_STATUSES.has(m.currentStatus), `Machine ${m.id} has valid status ${m.currentStatus}`);
  });

  // Validate Materials enums
  SEED_MATERIALS_CATALOG.forEach(m => {
    assert(VALID_MATERIAL_CATS.has(m.category), `Material ${m.id} has valid category ${m.category}`);
    m.recommendedGarments.forEach(g => {
      assert(VALID_GARMENTS.has(g), `Material ${m.id} recommended garment ${g} is valid`);
    });
  });

  // Validate Artisans enums
  SEED_ARTISAN_PORTFOLIOS.forEach(a => {
    a.specialties.forEach(sp => {
      assert(VALID_ARTISAN_SPECIALTIES.has(sp), `Artisan ${a.id} specialty ${sp} is recognized`);
    });
  });

  // Validate Briefs enums
  SEED_PRODUCTION_BRIEFS.forEach(b => {
    assert(VALID_BRIEF_STATUSES.has(b.status), `Brief ${b.id} status ${b.status} is valid`);
    assert(VALID_GARMENTS.has(b.garmentCategory), `Brief ${b.id} garment ${b.garmentCategory} is valid`);
    b.requiredSpecialties.forEach(sp => {
      assert(VALID_ARTISAN_SPECIALTIES.has(sp), `Brief ${b.id} specialty ${sp} is valid`);
    });
  });

  // Validate Bids enums
  SEED_TAILOR_BIDS.forEach(t => {
    assert(VALID_BID_STATUSES.has(t.status), `Bid ${t.id} status ${t.status} is valid`);
    t.artisanSpecialties.forEach(sp => {
      assert(VALID_ARTISAN_SPECIALTIES.has(sp), `Bid ${t.id} specialty ${sp} is valid`);
    });
  });

  // Validate Contracts enums
  SEED_PRODUCTION_CONTRACTS.forEach(c => {
    assert(VALID_ESCROW_STATUSES.has(c.escrowStatus), `Contract ${c.id} escrow status ${c.escrowStatus} is valid`);
    assert(VALID_CONTRACT_STATES.has(c.currentState), `Contract ${c.id} current state ${c.currentState} is valid`);
    c.milestones.forEach(m => {
      assert(VALID_MILESTONE_STATUSES.has(m.status), `Milestone ${m.stageIndex} status ${m.status} is valid`);
    });
  });

  // Validate Stylists enums
  SEED_CERTIFIED_STYLISTS.forEach(s => {
    assert(VALID_STYLIST_BADGES.has(s.badge), `Stylist ${s.id} badge ${s.badge} is valid`);
    s.specializations.forEach(sp => {
      assert(VALID_STYLIST_SPECS.has(sp), `Stylist ${s.id} spec ${sp} is valid`);
    });
    s.consultationModes.forEach(mode => {
      assert(VALID_CONSULTATION_MODES.has(mode), `Stylist ${s.id} mode ${mode} is valid`);
    });
  });

  // Validate Tenant Trial enums
  assert(VALID_SUB_TIERS.has(SEED_TENANT_TRIAL_PROFILE.tier), `Tenant trial tier ${SEED_TENANT_TRIAL_PROFILE.tier} is valid`);

  // ==========================================================================
  // SECTION 3: URL & MEDIA ASSET PATH VALIDATION
  // ==========================================================================
  console.log('\n[Challenger Suite 3: URL & Asset Path Validation]');

  function isValidUrlOrPath(url: string | undefined): boolean {
    if (!url) return false;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
    // Relative / local absolute paths
    return url.startsWith('/') && url.length > 1 && !url.includes(' ');
  }

  SEED_FASHION_ASSETS.forEach(a => {
    assert(isValidUrlOrPath(a.coverImageUrl), `Asset ${a.id} coverImageUrl is valid: ${a.coverImageUrl}`);
    assert(isValidUrlOrPath(a.creatorAvatar), `Asset ${a.id} creatorAvatar is valid: ${a.creatorAvatar}`);
    a.previewImageUrls.forEach((pUrl, idx) => {
      assert(isValidUrlOrPath(pUrl), `Asset ${a.id} previewImage[${idx}] is valid: ${pUrl}`);
    });
    if (a.model3dUrl) {
      assert(isValidUrlOrPath(a.model3dUrl), `Asset ${a.id} model3dUrl is valid: ${a.model3dUrl}`);
    }
  });

  SEED_WORKSHOP_MACHINES.forEach(m => {
    assert(isValidUrlOrPath(m.imageUrl), `Machine ${m.id} imageUrl is valid: ${m.imageUrl}`);
  });

  SEED_MATERIALS_CATALOG.forEach(mat => {
    assert(isValidUrlOrPath(mat.swatchImageUrl), `Material ${mat.id} swatchImageUrl is valid: ${mat.swatchImageUrl}`);
  });

  SEED_ARTISAN_PORTFOLIOS.forEach(art => {
    assert(isValidUrlOrPath(art.avatarUrl), `Artisan ${art.id} avatarUrl is valid: ${art.avatarUrl}`);
    art.gallery.forEach(g => {
      assert(isValidUrlOrPath(g.imageUrl), `Artisan ${art.id} gallery item ${g.id} imageUrl is valid: ${g.imageUrl}`);
    });
  });

  SEED_CERTIFIED_STYLISTS.forEach(sty => {
    assert(isValidUrlOrPath(sty.avatarUrl), `Stylist ${sty.id} avatarUrl is valid: ${sty.avatarUrl}`);
    sty.portfolioLooks.forEach(pl => {
      assert(isValidUrlOrPath(pl.imageUrl), `Stylist ${sty.id} look ${pl.id} imageUrl is valid: ${pl.imageUrl}`);
    });
  });

  // ==========================================================================
  // SECTION 4: ECONOMIC & INVENTORY SANITY BOUNDS
  // ==========================================================================
  console.log('\n[Challenger Suite 4: Economic & Inventory Sanity Bounds]');

  SEED_FASHION_ASSETS.forEach(a => {
    const p = a.pricingTiers.personalBespoke;
    const c = a.pricingTiers.commercialProduction;
    const e = a.pricingTiers.exclusiveBuyout;

    assert(p.priceInr > 0 && p.priceUsd > 0, `Asset ${a.id} personal tier has positive price`);
    assert(c.priceInr > p.priceInr, `Asset ${a.id} commercial price (₹${c.priceInr}) > personal (₹${p.priceInr})`);
    assert(e.priceInr > c.priceInr, `Asset ${a.id} exclusive buyout price (₹${e.priceInr}) > commercial (₹${c.priceInr})`);

    assert(c.allowedRuns > p.allowedRuns, `Asset ${a.id} commercial allowed runs (${c.allowedRuns}) > personal (${p.allowedRuns})`);
    assert(e.allowedRuns > c.allowedRuns, `Asset ${a.id} buyout allowed runs (${e.allowedRuns}) > commercial (${c.allowedRuns})`);

    assert(a.rating >= 1.0 && a.rating <= 5.0, `Asset ${a.id} rating ${a.rating} within [1.0, 5.0]`);
    assert(a.reviewsCount >= 0, `Asset ${a.id} reviewsCount >= 0`);
    assert(a.downloadsCount >= 0, `Asset ${a.id} downloadsCount >= 0`);
    assert(a.techPackSpecs.patternPiecesCount > 0, `Asset ${a.id} pattern pieces count > 0`);
    assert(a.techPackSpecs.estimatedSewingSamMinutes > 0, `Asset ${a.id} sewing SAM minutes > 0`);
  });

  SEED_WORKSHOP_MACHINES.forEach(m => {
    assert(m.pricing.hourlyRateInr > 0, `Machine ${m.id} hourly rate > 0`);
    assert(m.pricing.dailyShiftRateInr > 0, `Machine ${m.id} daily shift rate > 0`);
    assert(m.pricing.dailyShiftRateInr <= m.pricing.hourlyRateInr * 8, `Machine ${m.id} daily shift rate reflects 8h discount`);
    assert(m.pricing.securityDepositInr >= 0, `Machine ${m.id} security deposit >= 0`);
    assert(m.pricing.operatorAssistanceFeePerHourInr >= 0, `Machine ${m.id} operator fee >= 0`);
    assert(m.rating >= 1.0 && m.rating <= 5.0, `Machine ${m.id} rating within [1.0, 5.0]`);
    assert(m.specs.bedWidthInches > 0 && m.specs.bedLengthInches > 0, `Machine ${m.id} bed dimensions positive`);
  });

  SEED_MATERIALS_CATALOG.forEach(mat => {
    assert(mat.stockLevelMeters >= 0, `Material ${mat.id} stockLevelMeters >= 0`);
    assert(mat.moqMeters > 0, `Material ${mat.id} moqMeters > 0`);
    assert(mat.weightGsm > 0, `Material ${mat.id} weightGsm > 0`);
    assert(mat.boltWidthInches === 36 || mat.boltWidthInches === 44 || mat.boltWidthInches === 54 || mat.boltWidthInches === 58, `Material ${mat.id} bolt width standard (${mat.boltWidthInches}")`);
    assert(mat.drapeScore >= 1 && mat.drapeScore <= 10, `Material ${mat.id} drape score ${mat.drapeScore} within [1, 10]`);
    assert(mat.pricingTiers.length >= 2, `Material ${mat.id} defines multi-tier volume pricing (>=2 tiers)`);

    // Verify volume pricing monotonicity
    for (let i = 1; i < mat.pricingTiers.length; i++) {
      const prev = mat.pricingTiers[i - 1];
      const curr = mat.pricingTiers[i];
      assert(curr.minMeters > prev.minMeters, `Material ${mat.id} tier ${i} minMeters (${curr.minMeters}) > tier ${i - 1} minMeters (${prev.minMeters})`);
      assert(curr.pricePerMeterInr <= prev.pricePerMeterInr, `Material ${mat.id} tier ${i} price (₹${curr.pricePerMeterInr}) <= tier ${i - 1} price (₹${prev.pricePerMeterInr})`);
      assert(curr.discountPercent >= prev.discountPercent, `Material ${mat.id} tier ${i} discount (${curr.discountPercent}%) >= tier ${i - 1} discount (${prev.discountPercent}%)`);
    }
  });

  // Verify Production Contracts Milestone Mathematical Parity
  SEED_PRODUCTION_CONTRACTS.forEach(ctr => {
    const totalMilestoneSum = ctr.milestones.reduce((acc, m) => acc + m.payoutAmountInr, 0);
    const totalPercentSum = ctr.milestones.reduce((acc, m) => acc + m.percentagePayout, 0);
    assert(totalMilestoneSum === ctr.totalContractAmountInr, `Contract ${ctr.id} milestone payouts sum (₹${totalMilestoneSum}) equals total contract amount (₹${ctr.totalContractAmountInr})`);
    assert(totalPercentSum === 100, `Contract ${ctr.id} milestone percentage sum equals 100%`);
  });

  // Verify Creator Earnings Ledger Internal Balance Math
  const ledger = SEED_CREATOR_EARNINGS;
  const computedGrossFromMonths = ledger.monthlyBreakdown.reduce((acc, m) => acc + m.grossInr, 0);
  const computedNetFromMonths = ledger.monthlyBreakdown.reduce((acc, m) => acc + m.netInr, 0);
  assert(ledger.lifetimeGrossInr >= computedGrossFromMonths, `Creator ledger lifetime gross (₹${ledger.lifetimeGrossInr}) >= sum of monthly breakdown (₹${computedGrossFromMonths})`);
  assert(ledger.lifetimeGrossInr === ledger.platformFeeInr + ledger.lifetimeNetPayoutInr, `Lifetime gross equals platformFee + lifetimeNetPayout`);
  assert(ledger.platformFeeInr === Math.round(ledger.lifetimeGrossInr * 0.12), `Platform fee matches exact 12% standard platform take rate`);

  // ==========================================================================
  // SECTION 5: DETERMINISTIC HMAC SIGNATURE & CRYPTO ORACLE VALIDATION
  // ==========================================================================
  console.log('\n[Challenger Suite 5: Cryptographic SHA-256 & HMAC Determinism]');

  // Test Oracle: Verify pure JS SHA-256 against Node.js native crypto implementation
  const testVectors = [
    '',
    'a',
    'abc',
    'message digest',
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
    'The quick brown fox jumps over the lazy dog',
    'The quick brown fox jumps over the lazy dog.',
    'Bespoke Tailoring & Digital Fashion Ecosystem 2026',
    JSON.stringify({ assetId: 'ast_royal_sherwani_01', licensee: 'vikram', amount: 18500 })
  ];

  testVectors.forEach((vector, idx) => {
    const pureJsHash = computeSha256Hex(vector);
    const nativeHash = crypto.createHash('sha256').update(vector, 'utf8').digest('hex');
    assert(pureJsHash === nativeHash, `Test vector [${idx}] ("${vector.substring(0, 24)}...") matches Node.js crypto oracle SHA-256 digest`);
  });

  // Verify HMAC License Signature Determinism & Tamper Detection
  const fixedAssetId = 'ast_royal_sherwani_01';
  const fixedLicenseeId = 'tenant_flagship_01';
  const fixedTier = 'COMMERCIAL_PRODUCTION';
  const fixedTs = 1724420000000;

  const baselineSig = generateHMACLicenseSignature(fixedAssetId, fixedLicenseeId, fixedTier, fixedTs);
  assert(baselineSig.length === 64, 'HMAC license signature is exact 64-char hex string');

  // Repeatability (100 iterations)
  let deterministic = true;
  for (let i = 0; i < 100; i++) {
    if (generateHMACLicenseSignature(fixedAssetId, fixedLicenseeId, fixedTier, fixedTs) !== baselineSig) {
      deterministic = false;
      break;
    }
  }
  assert(deterministic, 'generateHMACLicenseSignature is 100% deterministic over 100 consecutive invocations');

  // Tamper detection across each individual parameter
  const tamperedAssetSig = generateHMACLicenseSignature('ast_royal_sherwani_02', fixedLicenseeId, fixedTier, fixedTs);
  assert(tamperedAssetSig !== baselineSig, 'Tampered asset ID produces distinct signature');

  const tamperedLicenseeSig = generateHMACLicenseSignature(fixedAssetId, 'tenant_flagship_02', fixedTier, fixedTs);
  assert(tamperedLicenseeSig !== baselineSig, 'Tampered licensee ID produces distinct signature');

  const tamperedTierSig = generateHMACLicenseSignature(fixedAssetId, fixedLicenseeId, 'EXCLUSIVE_BUYOUT', fixedTs);
  assert(tamperedTierSig !== baselineSig, 'Tampered license tier produces distinct signature');

  const tamperedTsSig = generateHMACLicenseSignature(fixedAssetId, fixedLicenseeId, fixedTier, fixedTs + 1);
  assert(tamperedTsSig !== baselineSig, 'Tampered timestamp produces distinct signature');

  // License Key format & entropy verification
  const key1 = generateFormattedLicenseKey(fixedAssetId, fixedLicenseeId, fixedTs);
  const key2 = generateFormattedLicenseKey(fixedAssetId, fixedLicenseeId, fixedTs);
  assert(key1 === key2, 'generateFormattedLicenseKey is deterministic for identical inputs');
  assert(/^LIC-YH-\d{4}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(key1), `Generated license key "${key1}" matches regex format ^LIC-YH-YYYY-XXXX-XXXX$`);

  console.log(`\n===============================================================`);
  console.log(`CHALLENGER 2 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===============================================================\n`);

  return { passed, failed };
}
