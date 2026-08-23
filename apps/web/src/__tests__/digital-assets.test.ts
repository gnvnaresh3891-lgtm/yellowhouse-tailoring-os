/**
 * YellowHouse Tailoring OS — Digital Asset Warehouse & Licensing Test Suite (Milestone 2 Layer 1)
 */

import {
  calculateLicensePricing,
  calculateCreatorEarningsSplit,
  generateHMACLicenseSignature,
  generateFormattedLicenseKey,
  computeSha256Hex
} from '../lib/ecosystem-algorithms';

import {
  SEED_FASHION_ASSETS,
  SEED_FASHION_BLUEPRINTS,
  SEED_ASSET_LICENSES,
  SEED_CREATOR_EARNINGS
} from '../lib/ecosystem-seeds';

import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';
import { FashionBlueprintAsset, AssetLicenseCertificate, CreatorEarningsLedger } from '../types/ecosystem';

export function runDigitalAssetsTests(): { passed: number; failed: number } {
  console.log('\n==================================================');
  console.log('--- SUITE: DIGITAL ASSET WAREHOUSE & LICENSING (M2 LAYER 1) ---');
  console.log('==================================================\n');

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

  // Setup mock storage
  const mockStore: Record<string, string> = {};
  const originalWindow = (global as any).window;
  (global as any).window = {
    localStorage: {
      getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
      setItem: (key: string, value: string) => {
        mockStore[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        for (const k in mockStore) delete mockStore[k];
      }
    },
    dispatchEvent: () => true,
    CustomEvent: class {
      type: string;
      detail: any;
      constructor(type: string, params?: { detail: any }) {
        this.type = type;
        this.detail = params?.detail;
      }
    }
  };

  // --------------------------------------------------------------------------
  // 1. SEED CATALOG & STRUCTURE INTEGRITY
  // --------------------------------------------------------------------------
  console.log('[Test Group 1: Blueprint Seed Catalog & Spec Integrity]');

  assert(Array.isArray(SEED_FASHION_ASSETS) && SEED_FASHION_ASSETS.length >= 5, 'SEED_FASHION_ASSETS contains at least 5 curated master blueprints');
  assert(SEED_FASHION_BLUEPRINTS === SEED_FASHION_ASSETS, 'SEED_FASHION_BLUEPRINTS alias references SEED_FASHION_ASSETS');

  for (const asset of SEED_FASHION_ASSETS) {
    assert(!!asset.id && typeof asset.id === 'string', `Asset ${asset.id} has valid id`);
    assert(!!asset.title && asset.title.length > 5, `Asset ${asset.id} has descriptive title`);
    assert(asset.techPackSpecs?.patternPiecesCount > 0, `Asset ${asset.id} specifies CAD pattern pieces count`);
    assert(asset.techPackSpecs?.estimatedSewingSamMinutes > 0, `Asset ${asset.id} specifies sewing SAM minutes`);
    assert(asset.techPackSpecs?.gradingRange?.length > 0, `Asset ${asset.id} includes graded sizing ranges`);
    assert(asset.fileFormats?.length > 0, `Asset ${asset.id} lists supported vector / 3D formats`);
    assert(asset.pricingTiers?.personalBespoke?.priceInr > 0, `Asset ${asset.id} has personal pricing`);
    assert(asset.pricingTiers?.commercialProduction?.priceInr > asset.pricingTiers.personalBespoke.priceInr, `Asset ${asset.id} commercial pricing exceeds personal pricing`);
    assert(asset.pricingTiers?.exclusiveBuyout?.priceInr > asset.pricingTiers.commercialProduction.priceInr, `Asset ${asset.id} buyout pricing exceeds commercial tier`);
  }

  // --------------------------------------------------------------------------
  // 2. PRICING TIERS & MULTIPLIERS
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 2: License Tier Calculations]');

  const testBasePrices = [3000, 4500, 6000, 10000];
  for (const base of testBasePrices) {
    const personal = calculateLicensePricing(base, 'PERSONAL_BESPOKE');
    assert(personal.priceInr === base, `Personal tier price matches base price ₹${base}`);
    assert(personal.allowedRuns === 3, 'Personal tier allows exactly 3 runs');
    assert(personal.commercialAllowed === false, 'Personal tier denies commercial mass production');
    assert(personal.transfersIp === false, 'Personal tier does not transfer IP');

    const commercial = calculateLicensePricing(base, 'COMMERCIAL_PRODUCTION');
    const expectedCommercial = Math.round(base * 4.11);
    assert(commercial.priceInr === expectedCommercial, `Commercial tier price ₹${commercial.priceInr} matches ₹${expectedCommercial}`);
    assert(commercial.allowedRuns === 250, 'Commercial tier allows 250 runs');
    assert(commercial.commercialAllowed === true, 'Commercial tier enables commercial manufacturing');

    const buyout = calculateLicensePricing(base, 'EXCLUSIVE_BUYOUT');
    const expectedBuyout = Math.round(base * 21.11);
    assert(buyout.priceInr === expectedBuyout, `Buyout tier price ₹${buyout.priceInr} matches ₹${expectedBuyout}`);
    assert(buyout.allowedRuns === 999999, 'Buyout tier allows unlimited runs');
    assert(buyout.transfersIp === true, 'Buyout tier transfers intellectual property');
  }

  // --------------------------------------------------------------------------
  // 3. 88/12 CREATOR ROYALTY REVENUE SPLIT MATH
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 3: Creator Royalty Split Math (88/12 Split)]');

  const grossTestAmounts = [1000, 4500, 18500, 95000, 140000];
  for (const gross of grossTestAmounts) {
    const split = calculateCreatorEarningsSplit(gross);
    const expectedPlatformFee = Math.round(gross * 0.12);
    const expectedNet = gross - expectedPlatformFee;

    assert(split.grossAmount === gross, `Gross amount is exactly ₹${gross}`);
    assert(split.platformFee === expectedPlatformFee, `Platform fee is ₹${expectedPlatformFee} (12%)`);
    assert(split.creatorNetEarnings === expectedNet, `Creator net earnings is ₹${expectedNet} (88%)`);
    assert(split.platformFee + split.creatorNetEarnings === gross, 'Conservation of funds: Fee + Net === Gross');
  }

  // --------------------------------------------------------------------------
  // 4. HMAC-SHA256 SIGNATURE GENERATION & VERIFIABLE CERTIFICATES
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 4: Cryptographic HMAC Signature & Key Generation]');

  const sigA = generateHMACLicenseSignature('ast_sherwani_01', 'buyer_vikram', 'COMMERCIAL_PRODUCTION', 1724420000000);
  const sigB = generateHMACLicenseSignature('ast_sherwani_01', 'buyer_vikram', 'COMMERCIAL_PRODUCTION', 1724420000000);
  assert(sigA === sigB, 'HMAC signature generation is deterministic for identical parameters');
  assert(sigA.length === 64, 'HMAC signature is a standard 64-character SHA-256 hexadecimal string');

  const sigDifferentBuyer = generateHMACLicenseSignature('ast_sherwani_01', 'buyer_other', 'COMMERCIAL_PRODUCTION', 1724420000000);
  assert(sigA !== sigDifferentBuyer, 'HMAC signature differs when buyer identity changes');

  const sigDifferentTier = generateHMACLicenseSignature('ast_sherwani_01', 'buyer_vikram', 'EXCLUSIVE_BUYOUT', 1724420000000);
  assert(sigA !== sigDifferentTier, 'HMAC signature differs when license tier changes');

  const formattedKey = generateFormattedLicenseKey('ast_sherwani_01', 'buyer_vikram', 1724420000000);
  assert(formattedKey.startsWith('LIC-YH-'), 'Formatted license key begins with LIC-YH-');
  assert(formattedKey.split('-').length === 5, 'Formatted license key contains 5 segments (LIC-YH-YEAR-SEG1-SEG2)');

  // --------------------------------------------------------------------------
  // 5. LOCALSTORAGE PERSISTENCE & TRANSACTION LOGGING
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 5: LocalStorage Persistence & Cross-Tab Sync]');

  const testCert: AssetLicenseCertificate = {
    id: 'lic_test_100',
    licenseKey: formattedKey,
    assetId: 'ast_sherwani_01',
    assetTitle: 'Imperial Jodhpuri Achkan',
    buyerId: 'buyer_vikram',
    buyerName: 'Vikramaditya Singhania',
    buyerOrganization: 'Singhania Bespoke Atelier',
    tier: 'COMMERCIAL_PRODUCTION',
    pricePaid: 18500,
    currency: 'INR',
    issuedAt: new Date().toISOString(),
    sha256Signature: sigA,
    allowedRuns: 250,
    recordedRuns: 0,
    status: 'ACTIVE',
    downloadUrl: '/downloads/test_blueprint.zip'
  };

  const initialLicenses = getLocalStorage<AssetLicenseCertificate[]>('yh_asset_licenses', []);
  setLocalStorage('yh_asset_licenses', [testCert, ...initialLicenses]);

  const retrieved = getLocalStorage<AssetLicenseCertificate[]>('yh_asset_licenses', []);
  assert(retrieved.length === 1, 'Successfully stored and retrieved license certificate in local storage');
  assert(retrieved[0].licenseKey === formattedKey, 'Retrieved certificate matches license key');
  assert(retrieved[0].sha256Signature === sigA, 'Retrieved certificate preserves cryptographic hash');

  return { passed, failed };
}
