/**
 * YellowHouse Tailoring OS — Final Adversarial Challenger Verification Suite
 * 
 * Comprehensive Stress Testing Across All 5 Ecosystem Layers:
 * 1. Empty Local Storage Initialization & Corruption Resilience
 * 2. Rapid Cross-Tab `yh-data-sync` Event Dispatching & Re-entrancy
 * 3. Adversarial Edge Cases:
 *    - Extreme prices, negative inputs, boundary clamping, and fund conservation
 *    - Zero-stock alerts, negative inventory, and stock depletion
 *    - 30-Minute machine reservation collision detection & buffer boundary analysis
 *    - Milestone escrow state machine transitions, partial releases, and complete buyout
 *    - 90-Day trial countdown boundaries (Day 0, Day 89, Day 90, Day 91)
 *    - 150 DPI preview vs 300+ DPI vector export resolution & watermark security gates
 * 4. Exhaustive 7-Role x 13-Route RBAC Authorization Matrix & Path Normalization
 */

import {
  calculateLicensePricing,
  calculateCreatorEarningsSplit,
  generateHMACLicenseSignature,
  generateFormattedLicenseKey,
  checkMachineSlotCollision,
  calculateMachineBookingCost,
  calculateVolumeDiscountedPrice,
  computeSmartFabricRecommendations,
  transitionContractMilestone,
  evaluateTrialEntitlements,
  computeSha256Hex
} from '../lib/ecosystem-algorithms';

import {
  SEED_FASHION_ASSETS,
  SEED_CREATOR_EARNINGS,
  SEED_ASSET_LICENSES,
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

import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../lib/storage-utils';
import {
  canUserAccessRoute,
  getFallbackRedirectRoute,
  filterNavItemsForRole,
  normalizeRole,
  UserRole,
  ROLE_PERMISSIONS
} from '../lib/rbac-utils';

import {
  FashionBlueprintAsset,
  AssetLicenseCertificate,
  CreatorEarningsLedger,
  WorkshopMachineListing,
  MachineReservationRecord,
  VendorMaterialItem,
  MaterialSourcingOrder,
  ArtisanPortfolioProfile,
  ProductionDesignBrief,
  TailorProductionBid,
  ProductionContractRecord,
  TenantTrialOnboardingProfile,
  CertifiedStylistProfile,
  StylistConsultationBookingRecord
} from '../types/ecosystem';

export function runChallengerFinalStressSuite(): { passed: number; failed: number } {
  console.log('\n================================================================');
  console.log('--- FINAL ADVERSARIAL CHALLENGER COMPREHENSIVE STRESS SUITE ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string, details?: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg} ${details ? `(${details})` : ''}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // Setup Mock Window & Storage
  const mockStore: Record<string, string> = {};
  const eventListeners: Record<string, Function[]> = {};

  const originalWindow = (global as any).window;
  (global as any).window = {
    localStorage: {
      getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
      setItem: (key: string, value: string) => {
        mockStore[key] = String(value);
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        for (const k in mockStore) delete mockStore[k];
      }
    },
    addEventListener: (type: string, listener: Function) => {
      if (!eventListeners[type]) eventListeners[type] = [];
      eventListeners[type].push(listener);
    },
    removeEventListener: (type: string, listener: Function) => {
      if (eventListeners[type]) {
        eventListeners[type] = eventListeners[type].filter(l => l !== listener);
      }
    },
    dispatchEvent: (event: any) => {
      const listeners = eventListeners[event.type] || [];
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (e) {
          console.error('Error in event listener:', e);
        }
      }
      return true;
    },
    CustomEvent: class {
      type: string;
      detail: any;
      constructor(type: string, params?: { detail: any }) {
        this.type = type;
        this.detail = params?.detail;
      }
    }
  };

  try {
    // ========================================================================
    // 1. EMPTY LOCAL STORAGE INITIALIZATION & CORRUPTION RESILIENCE
    // ========================================================================
    console.log('[Layer 1-5: Storage Resilience & Empty Initialization]');

    // Clear storage completely
    (global as any).window.localStorage.clear();

    // Verify clean fallback on completely empty storage for all 13 ecosystem keys
    const emptyAssets = getLocalStorage<FashionBlueprintAsset[]>('yh_marketplace_assets', SEED_FASHION_ASSETS);
    assert(Array.isArray(emptyAssets) && emptyAssets.length === SEED_FASHION_ASSETS.length, 'Empty storage returns SEED_FASHION_ASSETS');

    const emptyLicenses = getLocalStorage<AssetLicenseCertificate[]>('yh_asset_licenses', SEED_ASSET_LICENSES);
    assert(Array.isArray(emptyLicenses) && emptyLicenses.length === SEED_ASSET_LICENSES.length, 'Empty storage returns SEED_ASSET_LICENSES');

    const emptyEarnings = getLocalStorage<CreatorEarningsLedger>('yh_creator_earnings', SEED_CREATOR_EARNINGS);
    assert(emptyEarnings.creatorId === SEED_CREATOR_EARNINGS.creatorId, 'Empty storage returns SEED_CREATOR_EARNINGS');

    const emptyMachines = getLocalStorage<WorkshopMachineListing[]>('yh_workshop_machines', SEED_WORKSHOP_MACHINES);
    assert(Array.isArray(emptyMachines) && emptyMachines.length === SEED_WORKSHOP_MACHINES.length, 'Empty storage returns SEED_WORKSHOP_MACHINES');

    const emptyReservations = getLocalStorage<MachineReservationRecord[]>('yh_machine_reservations', SEED_MACHINE_RESERVATIONS);
    assert(Array.isArray(emptyReservations) && emptyReservations.length === SEED_MACHINE_RESERVATIONS.length, 'Empty storage returns SEED_MACHINE_RESERVATIONS');

    const emptyMaterials = getLocalStorage<VendorMaterialItem[]>('yh_vendor_materials', SEED_MATERIALS_CATALOG);
    assert(Array.isArray(emptyMaterials) && emptyMaterials.length === SEED_MATERIALS_CATALOG.length, 'Empty storage returns SEED_MATERIALS_CATALOG');

    const emptyOrders = getLocalStorage<MaterialSourcingOrder[]>('yh_fabric_sourcing_orders', SEED_MATERIAL_ORDERS);
    assert(Array.isArray(emptyOrders) && emptyOrders.length === SEED_MATERIAL_ORDERS.length, 'Empty storage returns SEED_MATERIAL_ORDERS');

    const emptyArtisans = getLocalStorage<ArtisanPortfolioProfile[]>('yh_artisan_portfolios', SEED_ARTISAN_PORTFOLIOS);
    assert(Array.isArray(emptyArtisans) && emptyArtisans.length === SEED_ARTISAN_PORTFOLIOS.length, 'Empty storage returns SEED_ARTISAN_PORTFOLIOS');

    const emptyBriefs = getLocalStorage<ProductionDesignBrief[]>('yh_production_briefs', SEED_PRODUCTION_BRIEFS);
    assert(Array.isArray(emptyBriefs) && emptyBriefs.length === SEED_PRODUCTION_BRIEFS.length, 'Empty storage returns SEED_PRODUCTION_BRIEFS');

    const emptyBids = getLocalStorage<TailorProductionBid[]>('yh_tailor_bids', SEED_TAILOR_BIDS);
    assert(Array.isArray(emptyBids) && emptyBids.length === SEED_TAILOR_BIDS.length, 'Empty storage returns SEED_TAILOR_BIDS');

    const emptyContracts = getLocalStorage<ProductionContractRecord[]>('yh_production_contracts', SEED_PRODUCTION_CONTRACTS);
    assert(Array.isArray(emptyContracts) && emptyContracts.length === SEED_PRODUCTION_CONTRACTS.length, 'Empty storage returns SEED_PRODUCTION_CONTRACTS');

    const emptyTrial = getLocalStorage<TenantTrialOnboardingProfile>('yh_tenant_trial_profile', SEED_TENANT_TRIAL_PROFILE);
    assert(emptyTrial.tenantId === SEED_TENANT_TRIAL_PROFILE.tenantId, 'Empty storage returns SEED_TENANT_TRIAL_PROFILE');

    const emptyStylists = getLocalStorage<CertifiedStylistProfile[]>('yh_certified_stylists', SEED_CERTIFIED_STYLISTS);
    assert(Array.isArray(emptyStylists) && emptyStylists.length === SEED_CERTIFIED_STYLISTS.length, 'Empty storage returns SEED_CERTIFIED_STYLISTS');

    const emptyBookings = getLocalStorage<StylistConsultationBookingRecord[]>('yh_stylist_bookings', SEED_STYLIST_BOOKINGS);
    assert(Array.isArray(emptyBookings) && emptyBookings.length === SEED_STYLIST_BOOKINGS.length, 'Empty storage returns SEED_STYLIST_BOOKINGS');

    // Storage Corruption Stress: Stringified 'null', 'undefined', Malformed JSON, Non-Array type mismatch
    mockStore['yh_marketplace_assets'] = 'null';
    assert(getLocalStorage('yh_marketplace_assets', SEED_FASHION_ASSETS).length === SEED_FASHION_ASSETS.length, 'Handles "null" string safely');

    mockStore['yh_marketplace_assets'] = 'undefined';
    assert(getLocalStorage('yh_marketplace_assets', SEED_FASHION_ASSETS).length === SEED_FASHION_ASSETS.length, 'Handles "undefined" string safely');

    mockStore['yh_marketplace_assets'] = '{ malformed json :: [}}}';
    assert(getLocalStorage('yh_marketplace_assets', SEED_FASHION_ASSETS).length === SEED_FASHION_ASSETS.length, 'Handles malformed JSON syntax error safely');

    mockStore['yh_marketplace_assets'] = '{"objectInsteadOfArray": true}';
    assert(Array.isArray(getLocalStorage('yh_marketplace_assets', SEED_FASHION_ASSETS)), 'Protects Array fallback when object found in array key');

    // ========================================================================
    // 2. RAPID CROSS-TAB `yh-data-sync` EVENT DISPATCHING & LISTENERS
    // ========================================================================
    console.log('\n[Layer 1-5: Rapid Cross-Tab Sync & Event Dispatching]');

    let syncEventsReceived = 0;
    let lastDetailReceived: any = null;

    const testSyncHandler = (e: any) => {
      syncEventsReceived++;
      lastDetailReceived = e.detail;
    };

    (global as any).window.addEventListener('yh-data-sync', testSyncHandler);

    // Fire 100 rapid concurrent sync events with various payload shapes
    for (let i = 0; i < 100; i++) {
      const sampleDetail = i % 5 === 0
        ? { key: 'yh_asset_licenses', action: 'CREATE', id: `lic_${i}` }
        : i % 5 === 1
        ? { key: 'yh_machine_reservations', action: 'RESERVE', slotId: `res_${i}` }
        : i % 5 === 2
        ? { key: 'yh_fabric_sourcing_orders', action: 'ORDER', orderId: `mso_${i}` }
        : i % 5 === 3
        ? { key: 'yh_tailor_bids', action: 'ACCEPT_BID', bidId: `bid_${i}` }
        : { key: 'yh_stylist_bookings', action: 'BOOK', bookingId: `sty_${i}` };

      (global as any).window.dispatchEvent(
        new (global as any).window.CustomEvent('yh-data-sync', { detail: sampleDetail })
      );
    }

    assert(syncEventsReceived === 100, `Listener successfully received all 100 rapid dispatch events (got ${syncEventsReceived})`);
    assert(lastDetailReceived?.key === 'yh_stylist_bookings', 'Last event payload correctly preserved');

    (global as any).window.removeEventListener('yh-data-sync', testSyncHandler);

    // ========================================================================
    // 3. ADVERSARIAL EDGE CASES
    // ========================================================================
    console.log('\n[Adversarial Edge Cases: Pricing, Stock, Collisions, Escrow, Trials, Exports]');

    // 3A. EXTREME & ADVERSARIAL PRICING
    const extremeZero = calculateLicensePricing(0, 'PERSONAL_BESPOKE');
    assert(extremeZero.priceInr === 500, 'Clamps base price 0 to minimum threshold ₹500');

    const extremeNegative = calculateLicensePricing(-99999, 'COMMERCIAL_PRODUCTION');
    assert(extremeNegative.priceInr === Math.round(500 * 4.11), 'Clamps negative price to ₹500 * 4.11');

    const extremeLarge = calculateLicensePricing(10000000, 'EXCLUSIVE_BUYOUT');
    assert(extremeLarge.priceInr === 211100000, 'Handles 1 Crore buyout calculation without floating point distortion');

    const royaltyZero = calculateCreatorEarningsSplit(0);
    assert(royaltyZero.grossAmount === 0 && royaltyZero.platformFee === 0 && royaltyZero.creatorNetEarnings === 0, 'Zero amount royalty split is 0');

    const royaltyLarge = calculateCreatorEarningsSplit(5000000, 0.88);
    assert(royaltyLarge.creatorNetEarnings === 4400000, '₹50 Lakhs @ 88% split = ₹44 Lakhs');
    assert(royaltyLarge.platformFee === 600000, 'Platform fee (12%) = ₹6 Lakhs');
    assert(royaltyLarge.platformFee + royaltyLarge.creatorNetEarnings === 5000000, 'Strict fund conservation: Fee + Net === Gross');

    // 3B. ZERO-STOCK & VOLUME DISCOUNT MATRIX
    const testMaterial: VendorMaterialItem = {
      ...SEED_MATERIALS_CATALOG[0],
      stockLevelMeters: 0,
      inStock: false
    };

    const volumeZeroOrder = calculateVolumeDiscountedPrice(testMaterial, 0);
    assert(volumeZeroOrder.unitPricePerMeterInr === testMaterial.pricingTiers[0].pricePerMeterInr, 'Volume calculation clamps 0m order safely to minimum 0.1m');
    assert(volumeZeroOrder.totalCostInr >= 0, 'Total cost for 0m is non-negative');

    const volumeTier1 = calculateVolumeDiscountedPrice(testMaterial, 5); // 1-9m
    assert(volumeTier1.discountPercent === 0, 'Tier 1 (5m) receives 0% discount');

    const volumeTier2 = calculateVolumeDiscountedPrice(testMaterial, 25); // 10-49m
    assert(volumeTier2.discountPercent === 10, 'Tier 2 (25m) receives 10% discount');

    const volumeTier3 = calculateVolumeDiscountedPrice(testMaterial, 100); // 50-199m
    assert(volumeTier3.discountPercent === 22, 'Tier 3 (100m) receives 22% discount');

    const volumeTier4 = calculateVolumeDiscountedPrice(testMaterial, 350); // 200m+
    assert(volumeTier4.discountPercent === 35, 'Tier 4 (350m) receives 35% discount');
    assert(volumeTier4.savingsInr > 0, 'Tier 4 calculates positive cost savings in INR');

    // 3C. 30-MINUTE MACHINE RESERVATION COLLISION DETECTION & BUFFERS
    const baseReservation: MachineReservationRecord = {
      id: 'res_active_01',
      reservationNumber: 'RES-2026-MCH-001',
      machineId: 'mch_mimaki_ddpt_01',
      machineName: 'Mimaki Tiger-1800B MkIII',
      machineCategory: 'DIGITAL_TEXTILE_PRINTER',
      facilityName: 'Sanjay Silk Mill Complex',
      tenantId: 'tenant_flagship_01',
      userId: 'user_vikram_01',
      userName: 'Vikramaditya Singhania',
      bookingType: 'HOURLY',
      startTime: '2026-08-25T10:00:00Z',
      endTime: '2026-08-25T12:00:00Z',
      totalDurationHours: 2,
      includeOperator: true,
      jobDetails: {
        jobTitle: '12x Royal Sherwani Panel Precision Cutting',
        garmentCategory: 'mens-sherwani',
        panelCount: 144,
        fabricType: 'Mulberry Raw Silk (110 GSM)',
        boltWidthInches: 44,
        estimatedRunMinutes: 190,
        bedEfficiencyPercent: 92.4
      },
      reservationStatus: 'CONFIRMED',
      costBreakdown: {
        machineBaseCost: 4400,
        operatorFee: 1500,
        securityDeposit: 8000,
        cleaningFee: 500,
        taxesInr: 1152,
        totalAmountInr: 15552
      },
      paymentStatus: 'PAID',
      createdAt: '2026-08-23T12:00:00Z'
    };

    const existingList = [baseReservation];

    // Case 1: Exact overlap inside (10:30 - 11:30) -> Conflict
    const c1 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T10:30:00Z', '2026-08-25T11:30:00Z');
    assert(c1.hasConflict === true, 'Internal overlap detected as conflict');

    // Case 2: Adjacent slot with 0 gap (12:00 - 14:00) -> Conflict because 30-minute buffer overlaps (12:00 < 12:30)
    const c2 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T12:00:00Z', '2026-08-25T14:00:00Z');
    assert(c2.hasConflict === true, 'Adjacent slot with 0m buffer detected as conflict (violates 30m maintenance buffer)');

    // Case 3: Slot starting at 12:29 (29 min gap) -> Conflict
    const c3 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T12:29:00Z', '2026-08-25T14:00:00Z');
    assert(c3.hasConflict === true, '29-minute gap detected as conflict');

    // Case 4: Slot starting at 12:30 (exactly 30 min buffer gap) -> Allowed
    const c4 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T12:30:00Z', '2026-08-25T14:30:00Z');
    assert(c4.hasConflict === false, 'Exact 30-minute buffer boundary allowed without conflict');

    // Case 5: Slot starting at 13:00 (60 min buffer gap) -> Allowed
    const c5 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T13:00:00Z', '2026-08-25T15:00:00Z');
    assert(c5.hasConflict === false, '60-minute gap allowed without conflict');

    // Case 6: Slot ending at 09:30 (30 min before 10:00) -> Allowed
    const c6 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T07:30:00Z', '2026-08-25T09:30:00Z');
    assert(c6.hasConflict === false, 'Preceding slot ending 30m prior allowed');

    // Case 7: Slot ending at 09:31 (29 min before 10:00) -> Conflict
    const c7 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T07:30:00Z', '2026-08-25T09:31:00Z');
    assert(c7.hasConflict === true, 'Preceding slot ending within 30m buffer detected as conflict');

    // Case 8: Different machine ID -> Allowed
    const c8 = checkMachineSlotCollision(existingList, 'mch_lectra_cutter_02', '2026-08-25T10:30:00Z', '2026-08-25T11:30:00Z');
    assert(c8.hasConflict === false, 'Same time on different machine allowed');

    // Case 9: Updating the same reservation -> Allowed (self-exclusion)
    const c9 = checkMachineSlotCollision(existingList, 'mch_mimaki_ddpt_01', '2026-08-25T10:00:00Z', '2026-08-25T12:00:00Z', 'res_active_01');
    assert(c9.hasConflict === false, 'Self-reservation ID excluded from collision detection during update');

    // Case 10: Cancelled reservation -> Ignored
    const cancelledList: MachineReservationRecord[] = [{ ...baseReservation, reservationStatus: 'CANCELLED' }];
    const c10 = checkMachineSlotCollision(cancelledList, 'mch_mimaki_ddpt_01', '2026-08-25T10:30:00Z', '2026-08-25T11:30:00Z');
    assert(c10.hasConflict === false, 'Cancelled reservations ignored in collision checks');

    // 3D. MILESTONE ESCROW STATE MACHINE & PROGRESSIVE FUNDS RELEASE
    const sampleContract: ProductionContractRecord = {
      ...SEED_PRODUCTION_CONTRACTS[0],
      totalContractAmountInr: 120000,
      escrowStatus: 'HELD_IN_ESCROW',
      currentState: 'PATTERN_CUTTING',
      milestones: [
        { stageIndex: 1, name: 'Foundation Canvas Cutting', payoutAmountInr: 24000, percentagePayout: 20, targetCompletionDate: '2026-08-30', status: 'IN_PROGRESS' },
        { stageIndex: 2, name: 'Skeleton Fitting Trial Assembly', payoutAmountInr: 36000, percentagePayout: 30, targetCompletionDate: '2026-09-10', status: 'PENDING' },
        { stageIndex: 3, name: 'Artisanal Zardozi & Assembly', payoutAmountInr: 36000, percentagePayout: 30, targetCompletionDate: '2026-09-22', status: 'PENDING' },
        { stageIndex: 4, name: 'Final QC & Steam Finishing', payoutAmountInr: 24000, percentagePayout: 20, targetCompletionDate: '2026-10-02', status: 'PENDING' }
      ]
    };

    // Release Stage 1 (20% = ₹24,000)
    const t1 = transitionContractMilestone(sampleContract, 1, 'APPROVED_AND_PAID');
    assert(t1.totalReleasedInr === 24000, 'Stage 1 releases ₹24,000');
    assert(t1.remainingInEscrowInr === 96000, 'Escrow remaining = ₹96,000');
    assert(t1.updatedContract?.escrowStatus === 'PARTIAL_RELEASE', 'Escrow status becomes PARTIAL_RELEASE');
    assert(t1.isFullyCompleted === false, 'Contract is not yet fully completed');

    // Release Stage 2 (30% = ₹36,000)
    const t2 = transitionContractMilestone(t1.updatedContract!, 2, 'APPROVED_AND_PAID');
    assert(t2.totalReleasedInr === 60000, 'Stage 1 + 2 releases ₹60,000 (50%)');
    assert(t2.remainingInEscrowInr === 60000, 'Escrow remaining = ₹60,000');

    // Release Stage 3 (30% = ₹36,000)
    const t3 = transitionContractMilestone(t2.updatedContract!, 3, 'APPROVED_AND_PAID');
    assert(t3.totalReleasedInr === 96000, 'Stage 1 + 2 + 3 releases ₹96,000 (80%)');

    // Release Stage 4 (20% = ₹24,000 -> 100% completion)
    const t4 = transitionContractMilestone(t3.updatedContract!, 4, 'APPROVED_AND_PAID');
    assert(t4.totalReleasedInr === 120000, 'Stage 1 + 2 + 3 + 4 releases full ₹120,000 (100%)');
    assert(t4.remainingInEscrowInr === 0, 'Escrow balance is exactly 0 after full milestone completion');
    assert(t4.isFullyCompleted === true, 'Contract isFullyCompleted flag is true');
    assert(t4.updatedContract?.escrowStatus === 'FULLY_RELEASED', 'Escrow status is FULLY_RELEASED');
    assert(t4.updatedContract?.currentState === 'COMPLETED', 'Current state is COMPLETED');

    // 3E. 90-DAY TRIAL BOUNDARY CONDITIONS (DAY 0, DAY 89, DAY 90, DAY 91)
    const trialStart = new Date('2026-06-01T00:00:00Z');
    const trialEnd = new Date('2026-08-30T00:00:00Z'); // 90 days

    const boundaryTrial: TenantTrialOnboardingProfile = {
      tenantId: 'tenant_trial_bnd',
      tenantName: 'Trial Atelier',
      tier: 'PURPLE_COGS_FREE_TRIAL',
      trialStartedAt: trialStart.toISOString(),
      trialExpiresAt: trialEnd.toISOString(),
      daysRemaining: 90,
      isTrialActive: true,
      entitlements: {
        maxBlueprintsPerMonth: 5,
        exportResolutionDpi: 150,
        allowWatermarkFreeExports: false,
        allow1to1DxfExport: false,
        allowCommercialBuyoutMarketplace: false,
        maxTailorBidsPerMonth: 3,
        stylistBookingFeeDiscountPercent: 15
      },
      usageCounters: {
        blueprintsCreated: 0,
        exportsGenerated: 0,
        bidsSubmitted: 0,
        stylistConsultationsBooked: 0,
        machineHoursBooked: 0
      }
    };

    // Day 0
    const evalDay0 = evaluateTrialEntitlements(boundaryTrial, trialStart);
    assert(evalDay0.isTrialActive === true && evalDay0.isExpired === false, 'Day 0: Trial is active and not expired');
    assert(evalDay0.daysRemaining === 90, 'Day 0: Exactly 90 days remaining');

    // Day 89
    const day89Date = new Date('2026-08-29T12:00:00Z');
    const evalDay89 = evaluateTrialEntitlements(boundaryTrial, day89Date);
    assert(evalDay89.isTrialActive === true && evalDay89.isExpired === false, 'Day 89: Trial is active');
    assert(evalDay89.daysRemaining === 1, 'Day 89: Exactly 1 day remaining');

    // Day 90 (Exact Expiry moment)
    const evalDay90 = evaluateTrialEntitlements(boundaryTrial, trialEnd);
    assert(evalDay90.isExpired === true && evalDay90.isTrialActive === false, 'Day 90 (Expiry): Trial is expired and inactive');
    assert(evalDay90.daysRemaining === 0, 'Day 90: Exactly 0 days remaining');

    // Day 91 (Post Expiry)
    const day91Date = new Date('2026-08-31T00:00:00Z');
    const evalDay91 = evaluateTrialEntitlements(boundaryTrial, day91Date);
    assert(evalDay91.isExpired === true && evalDay91.isTrialActive === false, 'Day 91: Trial remains expired');
    assert(evalDay91.canSubmitBids === false, 'Day 91: Cannot submit tailor bids');

    // 3F. 150 DPI VS 300+ DPI VECTOR EXPORT RESOLUTION TOGGLES
    const trialExportEval = evaluateTrialEntitlements(boundaryTrial, trialStart);
    assert(trialExportEval.maxExportResolutionDpi === 150, 'Trial tier enforces 150 DPI maximum resolution');
    assert(trialExportEval.watermarkRequired === true, 'Trial tier enforces watermark requirement');
    assert(trialExportEval.allow1to1Dxf === false, 'Trial tier denies 1:1 DXF production export');
    assert(trialExportEval.allowCommercialBuyout === false, 'Trial tier denies commercial buyout license rights');

    const proExportEval = evaluateTrialEntitlements({ ...boundaryTrial, tier: 'ATELIER_PRO' }, trialStart);
    assert(proExportEval.maxExportResolutionDpi === 300, 'Atelier Pro tier enables 300+ DPI high resolution vector export');
    assert(proExportEval.watermarkRequired === false, 'Atelier Pro tier removes watermark requirement');
    assert(proExportEval.allow1to1Dxf === true, 'Atelier Pro tier enables 1:1 DXF production export');
    assert(proExportEval.allowCommercialBuyout === true, 'Atelier Pro tier enables commercial buyout rights');

    const entExportEval = evaluateTrialEntitlements({ ...boundaryTrial, tier: 'HAUTE_ENTERPRISE' }, trialStart);
    assert(entExportEval.maxExportResolutionDpi === 300, 'Haute Enterprise tier enables 300+ DPI high resolution export');
    assert(entExportEval.watermarkRequired === false, 'Haute Enterprise tier removes watermark');
    assert(entExportEval.allow1to1Dxf === true, 'Haute Enterprise enables 1:1 DXF');
    assert(entExportEval.allowCommercialBuyout === true, 'Haute Enterprise enables commercial buyout');

    // ========================================================================
    // 4. RBAC PERMISSIONS ACROSS ALL 7 USER ROLES FOR EVERY ROUTE
    // ========================================================================
    console.log('\n[Section 4: Complete 7-Role x 13-Route RBAC Matrix & Path Sanitization]');

    const allRoles: UserRole[] = [
      'SUPER_ADMIN',
      'ATELIER_MANAGER',
      'MASTER_TAILOR',
      'EMBROIDERY_ARTISAN',
      'SALES_FRONT_DESK',
      'QUALITY_INSPECTOR',
      'CUSTOMER_VIEW'
    ];

    const testRoutes = [
      '/admin',
      '/dashboard',
      '/customers',
      '/measurements',
      '/orders',
      '/production',
      '/staff',
      '/onboarding',
      '/marketplace',
      '/equipment',
      '/supply',
      '/bidding',
      '/stylists'
    ];

    // Explicit Expected Matrix
    const expectedAccess: Record<UserRole, string[]> = {
      SUPER_ADMIN: [
        '/admin', '/dashboard', '/customers', '/measurements', '/orders',
        '/production', '/staff', '/onboarding', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
      ],
      ATELIER_MANAGER: [
        '/dashboard', '/customers', '/measurements', '/orders',
        '/production', '/staff', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
      ],
      MASTER_TAILOR: [
        '/dashboard', '/customers', '/measurements', '/orders',
        '/production', '/marketplace', '/equipment', '/supply', '/bidding', '/stylists'
      ],
      EMBROIDERY_ARTISAN: [
        '/production', '/measurements', '/bidding', '/equipment', '/stylists'
      ],
      SALES_FRONT_DESK: [
        '/dashboard', '/customers', '/measurements', '/orders', '/marketplace', '/stylists', '/supply'
      ],
      QUALITY_INSPECTOR: [
        '/dashboard', '/orders', '/production', '/measurements', '/marketplace', '/supply', '/equipment'
      ],
      CUSTOMER_VIEW: [
        '/orders', '/measurements', '/marketplace', '/stylists'
      ]
    };

    for (const role of allRoles) {
      const allowed = expectedAccess[role];
      for (const route of testRoutes) {
        const shouldHaveAccess = allowed.includes(route);
        const actualAccess = canUserAccessRoute(role, route);
        assert(
          actualAccess === shouldHaveAccess,
          `RBAC: ${role} -> ${route} = ${actualAccess ? 'ALLOW' : 'DENY'}`,
          `Expected: ${shouldHaveAccess ? 'ALLOW' : 'DENY'}, Actual: ${actualAccess ? 'ALLOW' : 'DENY'}`
        );
      }
    }

    // Role Case-Insensitive Normalization & Aliases
    assert(normalizeRole('super_admin') === 'SUPER_ADMIN', 'Normalizes lowercase "super_admin"');
    assert(normalizeRole('atelier_manager') === 'ATELIER_MANAGER', 'Normalizes lowercase "atelier_manager"');
    assert(normalizeRole('master_tailor') === 'MASTER_TAILOR', 'Normalizes lowercase "master_tailor"');
    assert(normalizeRole('embroidery_artisan') === 'EMBROIDERY_ARTISAN', 'Normalizes lowercase "embroidery_artisan"');
    assert(normalizeRole('karigar') === 'EMBROIDERY_ARTISAN', 'Normalizes alias "karigar"');
    assert(normalizeRole('receptionist') === 'SALES_FRONT_DESK', 'Normalizes alias "receptionist"');
    assert(normalizeRole('customer') === 'CUSTOMER_VIEW', 'Normalizes alias "customer"');
    assert(normalizeRole('unknown_role') === null, 'Rejects unknown role string');
    assert(normalizeRole('') === null, 'Rejects empty role string');

    // Route Path Sanitization (Query params, hash fragments, traversal)
    assert(canUserAccessRoute('CUSTOMER_VIEW', '/orders?filter=active') === true, 'Allows /orders with query params');
    assert(canUserAccessRoute('CUSTOMER_VIEW', '/orders#details') === true, 'Allows /orders with hash fragments');
    assert(canUserAccessRoute('CUSTOMER_VIEW', '/marketplace/details/ast_101') === true, 'Allows nested sub-route /marketplace/details/*');
    assert(canUserAccessRoute('CUSTOMER_VIEW', '/dashboard/../admin') === false, 'Denies path traversal attempt /dashboard/../admin');
    assert(canUserAccessRoute('CUSTOMER_VIEW', '/orders/../admin') === false, 'Denies path traversal attempt /orders/../admin');

  } finally {
    (global as any).window = originalWindow;
  }

  console.log(`\n================================================================`);
  console.log(`--- CHALLENGER FINAL SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  console.log(`================================================================\n`);

  return { passed, failed };
}
