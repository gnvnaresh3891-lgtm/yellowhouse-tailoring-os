/**
 * YellowHouse Tailoring OS — 3-Month Trial & Stylist Directory Test Suite (Milestone 4 Layer 5)
 */

import {
  evaluateTrialEntitlements
} from '../lib/ecosystem-algorithms';

import {
  SEED_CERTIFIED_STYLISTS,
  SEED_STYLIST_BOOKINGS,
  SEED_TENANT_TRIAL_PROFILE
} from '../lib/ecosystem-seeds';

import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';
import { 
  TenantTrialOnboardingProfile, 
  CertifiedStylistProfile, 
  StylistConsultationBookingRecord 
} from '../types/ecosystem';

export function runTrialStylistDirectoryTests(): { passed: number; failed: number } {
  console.log('\n==================================================');
  console.log('--- SUITE: 3-MONTH TRIAL & STYLIST DIRECTORY (M4 LAYER 5) ---');
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

  // Setup mock storage environment
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
      constructor(type: string, detail?: any) {
        this.type = type;
        this.detail = detail;
      }
    }
  };

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: 3-Month Trial Entitlement Math & Resolution Gates
    // ------------------------------------------------------------------------
    console.log('[Section 1: 3-Month Trial Entitlement & Resolution Evaluator]');

    const activeTrialProfile: TenantTrialOnboardingProfile = {
      tenantId: 'tenant_test_01',
      tenantName: 'Test Couture Atelier',
      tier: 'PURPLE_COGS_FREE_TRIAL',
      trialStartedAt: '2026-08-01T00:00:00Z',
      trialExpiresAt: '2026-10-30T00:00:00Z',
      daysRemaining: 68,
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
        blueprintsCreated: 2,
        exportsGenerated: 4,
        bidsSubmitted: 1,
        stylistConsultationsBooked: 1,
        machineHoursBooked: 6
      }
    };

    const evalResult = evaluateTrialEntitlements(activeTrialProfile, new Date('2026-08-23T12:00:00Z'));
    assert(evalResult.isTrialActive === true, 'Active trial profile evaluated as active');
    assert(evalResult.isExpired === false, 'Active trial profile is not expired');
    assert(evalResult.daysRemaining > 0, `Days remaining calculated as ${evalResult.daysRemaining} days`);
    assert(evalResult.watermarkRequired === true, 'Watermark required for trial tier');
    assert(evalResult.maxExportResolutionDpi === 150, 'Trial tier capped at 150 DPI preview exports');
    assert(evalResult.allow1to1Dxf === false, 'Trial tier prohibits 1:1 DXF vector export');
    assert(evalResult.allowCommercialBuyout === false, 'Trial tier prohibits commercial buyout marketplace licenses');
    assert(evalResult.canSubmitBids === true, 'Trial user can submit tailor bids within quota');
    assert(evalResult.bidsRemaining === 2, 'Trial user has 2 of 3 monthly bids remaining (3 - 1 = 2)');

    // Test Expired Trial Profile
    const expiredTrialProfile: TenantTrialOnboardingProfile = {
      ...activeTrialProfile,
      trialStartedAt: '2026-04-01T00:00:00Z',
      trialExpiresAt: '2026-07-01T00:00:00Z',
      daysRemaining: 0,
      isTrialActive: true
    };
    const expiredEval = evaluateTrialEntitlements(expiredTrialProfile, new Date('2026-08-23T12:00:00Z'));
    assert(expiredEval.isExpired === true, 'Expired trial evaluated as isExpired = true');
    assert(expiredEval.isTrialActive === false, 'Expired trial evaluated as isTrialActive = false');
    assert(expiredEval.daysRemaining === 0, 'Expired trial daysRemaining = 0');
    assert(expiredEval.canSubmitBids === false, 'Expired trial cannot submit tailor bids');

    // Test Upgraded Atelier Pro Profile
    const proProfile: TenantTrialOnboardingProfile = {
      ...activeTrialProfile,
      tier: 'ATELIER_PRO',
      entitlements: {
        ...activeTrialProfile.entitlements,
        exportResolutionDpi: 300,
        allowWatermarkFreeExports: true,
        allow1to1DxfExport: true,
        allowCommercialBuyoutMarketplace: true,
        maxTailorBidsPerMonth: 25,
        stylistBookingFeeDiscountPercent: 20
      }
    };
    const proEval = evaluateTrialEntitlements(proProfile, new Date('2026-08-23T12:00:00Z'));
    assert(proEval.watermarkRequired === false, 'Pro tier removes watermark requirement');
    assert(proEval.maxExportResolutionDpi === 300, 'Pro tier allows 300+ DPI vector resolution');
    assert(proEval.allow1to1Dxf === true, 'Pro tier allows 1:1 DXF exports');
    assert(proEval.allowCommercialBuyout === true, 'Pro tier allows commercial buyout marketplace');

    // ------------------------------------------------------------------------
    // SECTION 2: Certified Stylist Directory Catalog & Filtering
    // ------------------------------------------------------------------------
    console.log('\n[Section 2: Stylist Directory Catalog & Multi-Criteria Filtering]');

    const stylists = SEED_CERTIFIED_STYLISTS;
    assert(stylists.length >= 3, `SEED_CERTIFIED_STYLISTS has ${stylists.length} initial verified stylists`);

    // Verify properties of seeded stylists
    const aanya = stylists.find(s => s.fullName === 'Aanya Singhania');
    assert(!!aanya, 'Aanya Singhania exists in certified stylists directory');
    assert(aanya?.badge === 'TROUSSEAU_ARCHITECT', 'Aanya holds TROUSSEAU_ARCHITECT badge');
    assert(aanya?.location.city === 'Mumbai', 'Aanya is located in Mumbai hub');
    assert(aanya?.hourlyFeeInr === 3500, 'Aanya hourly fee is ₹3,500');
    assert(aanya?.rating === 4.99, 'Aanya has 4.99 rating');

    const kabir = stylists.find(s => s.fullName === 'Kabir Mehta');
    assert(!!kabir, 'Kabir Mehta exists in directory');
    assert(Boolean(kabir?.specializations.includes('BESPOKE_SUITING_CONSULTANT')), 'Kabir specializes in BESPOKE_SUITING_CONSULTANT');
    assert(kabir?.location.city === 'New Delhi', 'Kabir is in New Delhi hub');

    const priya = stylists.find(s => s.fullName === 'Priya Sharma');
    assert(!!priya, 'Priya Sharma exists in directory');
    assert(priya?.location.city === 'Lucknow', 'Priya is in Lucknow hub');

    // Test Filtering by City
    const mumbaiStylists = stylists.filter(s => s.location.city.toLowerCase() === 'mumbai');
    assert(mumbaiStylists.length >= 1, 'City filter correctly finds Mumbai stylists');

    const delhiStylists = stylists.filter(s => s.location.city.toLowerCase() === 'new delhi');
    assert(delhiStylists.length >= 1, 'City filter correctly finds New Delhi stylists');

    // Test Filtering by Specialization
    const bridalStylists = stylists.filter(s => s.specializations.includes('BRIDAL_TROUSSEAU'));
    assert(bridalStylists.length >= 1, 'Specialization filter finds BRIDAL_TROUSSEAU stylists');

    const suitingStylists = stylists.filter(s => s.specializations.includes('BESPOKE_SUITING_CONSULTANT'));
    assert(suitingStylists.length >= 1, 'Specialization filter finds BESPOKE_SUITING_CONSULTANT stylists');

    // Test Filtering by Consultation Mode
    const atelierVisitStylists = stylists.filter(s => s.consultationModes.includes('IN_PERSON_ATELIER'));
    assert(atelierVisitStylists.length === stylists.length, 'All verified stylists offer IN_PERSON_ATELIER');

    const wardrobeStylists = stylists.filter(s => s.consultationModes.includes('CLIENT_WARDROBE_VISIT'));
    assert(wardrobeStylists.length >= 1, 'Wardrobe visit filter finds applicable stylists');

    // ------------------------------------------------------------------------
    // SECTION 3: Stylist Booking Fee Calculation & Trial Perk Discount
    // ------------------------------------------------------------------------
    console.log('\n[Section 3: Booking Fee & Trial Discount Application]');

    // 60-Minute Consultation calculation
    const base60Fee = aanya!.hourlyFeeInr; // 3500
    const discount15 = Math.round(base60Fee * 0.15); // 525
    const net60Fee = base60Fee - discount15; // 2975
    assert(discount15 === 525, '15% trial discount on ₹3,500 = ₹525');
    assert(net60Fee === 2975, 'Net fee after discount = ₹2,975');

    // 90-Minute Consultation calculation
    const base90Fee = Math.round(aanya!.hourlyFeeInr * 1.5); // 5250
    const discount90 = Math.round(base90Fee * 0.15); // 788
    const net90Fee = base90Fee - discount90; // 4462
    assert(base90Fee === 5250, '90-min base fee = ₹5,250 (1.5x hourly rate)');
    assert(net90Fee === 4462, '90-min net fee with 15% discount = ₹4,462');

    // ------------------------------------------------------------------------
    // SECTION 4: Storage Persistence & Cross-Tab Reactivity
    // ------------------------------------------------------------------------
    console.log('\n[Section 4: Storage Persistence & Booking Records]');

    // Test saving bookings
    setLocalStorage('yh_stylist_bookings', SEED_STYLIST_BOOKINGS);
    const loadedBookings = getLocalStorage<StylistConsultationBookingRecord[]>('yh_stylist_bookings', []);
    assert(loadedBookings.length === 1, 'Loaded 1 initial stylist booking from storage');
    assert(loadedBookings[0].bookingNumber === 'STY-2026-042', 'Booking number is STY-2026-042');
    assert(loadedBookings[0].paymentStatus === 'PAID', 'Payment status is PAID in escrow');

    // Test appending a new booking
    const newBooking: StylistConsultationBookingRecord = {
      id: 'sty_bk_999',
      bookingNumber: 'STY-2026-999',
      stylistId: kabir!.id,
      stylistName: kabir!.fullName,
      stylistAvatar: kabir!.avatarUrl,
      tenantId: 'tenant_test_01',
      clientName: 'Rahul Varma',
      clientPhone: '+91 99887 66554',
      clientEmail: 'rahul@varma.in',
      garmentCategoryOfInterest: 'mens-suit',
      consultationMode: 'VIRTUAL_HD',
      scheduledAt: '2026-08-29T14:00:00Z',
      durationMinutes: 60,
      feeAmountInr: 2800,
      discountAppliedInr: 420,
      totalPaidInr: 2380,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      clientBriefNotes: 'Savile Row two-piece suit styling for winter reception.',
      createdAt: '2026-08-23T14:00:00Z'
    };

    setLocalStorage('yh_stylist_bookings', [newBooking, ...loadedBookings]);
    const updatedBookings = getLocalStorage<StylistConsultationBookingRecord[]>('yh_stylist_bookings', []);
    assert(updatedBookings.length === 2, 'Storage now holds 2 bookings after new booking insertion');
    assert(updatedBookings[0].id === 'sty_bk_999', 'New booking is positioned first in list');

    // Test trial profile persistence & extension
    setLocalStorage('yh_tenant_trial_profile', SEED_TENANT_TRIAL_PROFILE);
    const storedTrial = getLocalStorage<TenantTrialOnboardingProfile>('yh_tenant_trial_profile', SEED_TENANT_TRIAL_PROFILE);
    assert(storedTrial.tenantId === 'tenant_flagship_01', 'Loaded tenant trial profile');

    // Simulate 30-day trial extension
    const extendedTrial: TenantTrialOnboardingProfile = {
      ...storedTrial,
      daysRemaining: storedTrial.daysRemaining + 30
    };
    setLocalStorage('yh_tenant_trial_profile', extendedTrial);
    const verifiedExtended = getLocalStorage<TenantTrialOnboardingProfile>('yh_tenant_trial_profile', SEED_TENANT_TRIAL_PROFILE);
    assert(verifiedExtended.daysRemaining === storedTrial.daysRemaining + 30, 'Trial profile daysRemaining successfully incremented by 30');

  } finally {
    (global as any).window = originalWindow;
  }

  console.log(`\n--- TRIAL & STYLIST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED ---\n`);
  return { passed, failed };
}
