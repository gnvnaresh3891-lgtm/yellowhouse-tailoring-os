/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Comprehensive, High-Fidelity Mock Datasets Across All 5 Layers:
 * 
 * 1. Layer 1: Fashion Blueprint Assets, License Certificates, Creator Earnings Ledger
 * 2. Layer 2: Workshop Machinery Listings, Machine Reservation Records
 * 3. Layer 3: Vendor Material Swatch Catalog, Sourcing Orders
 * 4. Layer 4: Artisan Specialty Portfolios, Production Design Briefs, Tailor Bids, Production Contracts
 * 5. Layer 5: Tenant Trial Onboarding Profile, Certified Stylist Directory, Consultation Bookings
 */

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

// ============================================================================
// LAYER 1: DIGITAL ASSET WAREHOUSE & DESIGN MARKETPLACE SEEDS
// ============================================================================

export const SEED_FASHION_ASSETS: FashionBlueprintAsset[] = [
  {
    id: 'ast_royal_sherwani_01',
    title: 'Royal Jodhpuri Achkan & Churidhar 3D Tech Pack',
    slug: 'royal-jodhpuri-achkan-3d-tech-pack',
    creatorId: 'creator_latif_01',
    creatorName: 'Master Latif Khan',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    creatorTier: 'MASTER_CREATOR',
    garmentCategory: 'mens-sherwani',
    aestheticStyle: 'HERITAGE_ROYAL',
    difficultyLevel: 'MASTER_KARIGAR',
    description: 'High-precision imperial Jodhpuri Achkan featuring structured canvas chest, high Mandarin collar, and articulated 2-piece armscye. Includes 3D Garment CAD simulations, vector DXF pattern pieces, and zardozi panel layout guide.',
    coverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    previewImageUrls: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800'
    ],
    fileFormats: ['.dxf', '.clo3d', '.zprj', '.pdf', '.ai'],
    fileSizeMb: 48.5,
    version: 'v2.1.0',
    rating: 4.96,
    reviewsCount: 38,
    downloadsCount: 142,
    is3dInteractive: true,
    model3dUrl: '/models/sherwani_achkan.glb',
    techPackSpecs: {
      seamAllowancesMm: 12.5,
      gradingRange: ['38R', '40R', '42R', '44R', '46R'],
      recommendedFabrics: ['Mulberry Raw Silk 110 GSM', 'Silk Brocade', 'Italian Wool Crepe'],
      estimatedSewingSamMinutes: 420,
      patternPiecesCount: 18,
      liningIncluded: true,
      interfacingSpecifications: 'Horsehair canvas full chest + fusible French collar stay',
      embroideryMotifLayers: 4
    },
    pricingTiers: {
      personalBespoke: { priceInr: 4500, priceUsd: 55, allowedRuns: 3, commercialAllowed: false },
      commercialProduction: { priceInr: 18500, priceUsd: 220, allowedRuns: 250, commercialAllowed: true },
      exclusiveBuyout: { priceInr: 95000, priceUsd: 1150, allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
    },
    licenseTermsSummary: 'Personal tier permits 3 bespoke client executions. Commercial tier permits 250 units. IP buyout removes asset permanently from marketplace.',
    tags: ['Sherwani', 'Achkan', 'Jodhpuri', 'Bespoke', 'Zardozi', 'Heritage'],
    featured: true,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z'
  },
  {
    id: 'ast_lehenga_24kali_02',
    title: 'Imperial 24-Kali Flared Bridal Lehenga & Sweetheart Choli',
    slug: 'imperial-24-kali-bridal-lehenga',
    creatorId: 'creator_aanya_02',
    creatorName: 'Aanya Singhania Couture',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    creatorTier: 'CERTIFIED_ATELIER',
    garmentCategory: 'womens-lehenga',
    aestheticStyle: 'TRADITIONAL_BRIDAL',
    difficultyLevel: 'ADVANCED',
    description: 'Architectural 24-kali flared circular silhouette with 6.2-meter ghera flare, integrated can-can reinforcement grid, and princess-cut structured sweetheart choli.',
    coverImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
    previewImageUrls: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'
    ],
    fileFormats: ['.dxf', '.clo3d', '.pdf', '.svg'],
    fileSizeMb: 62.0,
    version: 'v1.4.0',
    rating: 4.92,
    reviewsCount: 54,
    downloadsCount: 210,
    is3dInteractive: true,
    model3dUrl: '/models/lehenga_24kali.glb',
    techPackSpecs: {
      seamAllowancesMm: 15.0,
      gradingRange: ['32', '34', '36', '38', '40', '42'],
      recommendedFabrics: ['Silk Velvet 9000', 'Mulberry Habotai', 'Silk Organza'],
      estimatedSewingSamMinutes: 580,
      patternPiecesCount: 28,
      liningIncluded: true,
      interfacingSpecifications: 'Double buckram waistband + triple horsehair can-can cage',
      embroideryMotifLayers: 6
    },
    pricingTiers: {
      personalBespoke: { priceInr: 5200, priceUsd: 65, allowedRuns: 3, commercialAllowed: false },
      commercialProduction: { priceInr: 22000, priceUsd: 265, allowedRuns: 150, commercialAllowed: true },
      exclusiveBuyout: { priceInr: 120000, priceUsd: 1450, allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
    },
    licenseTermsSummary: 'Full graded nested DXF patterns for 24-kali ghera with waistband reinforcement diagrams.',
    tags: ['Lehenga', 'Bridal', '24-Kali', 'Choli', 'Can-Can', 'Couture'],
    featured: true,
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-18T16:20:00Z'
  },
  {
    id: 'ast_savilerow_tuxedo_03',
    title: 'Savile Row Single-Breasted Peak Lapel Bespoke Tuxedo',
    slug: 'savile-row-peak-lapel-tuxedo',
    creatorId: 'creator_james_03',
    creatorName: 'Lord & Latif Bespoke',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    creatorTier: 'MASTER_CREATOR',
    garmentCategory: 'mens-suit',
    aestheticStyle: 'MODERN_SAVILE_ROW',
    difficultyLevel: 'MASTER_KARIGAR',
    description: 'Quintessential Savile Row bespoke tuxedo featuring floating full canvas chest piece, hand-padded grosgrain silk peak lapels, roped shoulder sleevehead, and side-adjuster trousers.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    previewImageUrls: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'
    ],
    fileFormats: ['.dxf', '.clo3d', '.zprj', '.pdf', '.ai'],
    fileSizeMb: 52.3,
    version: 'v3.0.1',
    rating: 4.98,
    reviewsCount: 72,
    downloadsCount: 315,
    is3dInteractive: true,
    model3dUrl: '/models/savile_row_tuxedo.glb',
    techPackSpecs: {
      seamAllowancesMm: 12.0,
      gradingRange: ['36R', '38R', '40R', '42R', '44R', '46R', '48R'],
      recommendedFabrics: ['Super 150s Wool Barathea', 'Italian Wool Crepe', 'Bemberg Cupro Lining'],
      estimatedSewingSamMinutes: 520,
      patternPiecesCount: 24,
      liningIncluded: true,
      interfacingSpecifications: 'Floating camel hair full canvas + hand-padded lapels',
      embroideryMotifLayers: 0
    },
    pricingTiers: {
      personalBespoke: { priceInr: 6000, priceUsd: 75, allowedRuns: 3, commercialAllowed: false },
      commercialProduction: { priceInr: 25000, priceUsd: 300, allowedRuns: 300, commercialAllowed: true },
      exclusiveBuyout: { priceInr: 140000, priceUsd: 1700, allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
    },
    licenseTermsSummary: 'Master pattern with English drape chest suppression and roped sleeve crown geometry.',
    tags: ['Tuxedo', 'Savile Row', 'Full Canvas', 'Peak Lapel', 'Barathea'],
    featured: true,
    createdAt: '2026-05-20T11:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: 'ast_anarkali_couture_04',
    title: 'Flared Floor-Length Mughal Kalidar Anarkali Suite',
    slug: 'flared-mughal-kalidar-anarkali',
    creatorId: 'creator_aanya_02',
    creatorName: 'Aanya Singhania Couture',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    creatorTier: 'CERTIFIED_ATELIER',
    garmentCategory: 'womens-anarkali',
    aestheticStyle: 'HERITAGE_ROYAL',
    difficultyLevel: 'INTERMEDIATE',
    description: '32-piece kalidar silhouette with high empire waistline, sheer silk organza churidar sleeves, and integrated weighted hem border.',
    coverImageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    previewImageUrls: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800'
    ],
    fileFormats: ['.dxf', '.pdf', '.svg'],
    fileSizeMb: 34.2,
    version: 'v1.1.0',
    rating: 4.89,
    reviewsCount: 22,
    downloadsCount: 95,
    is3dInteractive: false,
    techPackSpecs: {
      seamAllowancesMm: 10.0,
      gradingRange: ['34', '36', '38', '40', '42'],
      recommendedFabrics: ['Silk Organza', 'Mulberry Habotai', 'Banarasi Brocade'],
      estimatedSewingSamMinutes: 380,
      patternPiecesCount: 36,
      liningIncluded: true,
      interfacingSpecifications: 'Fusible collar stand and reinforced yoke facing',
      embroideryMotifLayers: 3
    },
    pricingTiers: {
      personalBespoke: { priceInr: 3800, priceUsd: 48, allowedRuns: 3, commercialAllowed: false },
      commercialProduction: { priceInr: 15500, priceUsd: 190, allowedRuns: 200, commercialAllowed: true },
      exclusiveBuyout: { priceInr: 80000, priceUsd: 980, allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
    },
    licenseTermsSummary: 'Complete CAD grading with individual kali nested marker plans.',
    tags: ['Anarkali', 'Mughal', 'Kalidar', 'Organza', 'Floor-Length'],
    featured: false,
    createdAt: '2026-07-12T08:30:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'ast_corset_boned_05',
    title: 'Victorian Overbust Steel-Boned Architecture Corset',
    slug: 'victorian-overbust-boned-corset',
    creatorId: 'creator_elena_05',
    creatorName: 'Elena Vance Atelier',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    creatorTier: 'INDIE_DESIGNER',
    garmentCategory: 'womens-corset',
    aestheticStyle: 'AVANT_GARDE',
    difficultyLevel: 'ADVANCED',
    description: '14-panel hourglass waist reduction pattern with spiral steel boning channels, busk closure front, and two-piece grommet lace-up back.',
    coverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    previewImageUrls: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'
    ],
    fileFormats: ['.dxf', '.clo3d', '.pdf'],
    fileSizeMb: 28.5,
    version: 'v2.0.0',
    rating: 4.95,
    reviewsCount: 31,
    downloadsCount: 160,
    is3dInteractive: true,
    model3dUrl: '/models/victorian_corset.glb',
    techPackSpecs: {
      seamAllowancesMm: 12.0,
      gradingRange: ['24', '26', '28', '30', '32'],
      recommendedFabrics: ['Silk Brocade', 'Heavy Cotton Coutil', 'Silk Duchesse Satin'],
      estimatedSewingSamMinutes: 310,
      patternPiecesCount: 16,
      liningIncluded: true,
      interfacingSpecifications: 'Double layer English cotton coutil with waist waist-tape anchor',
      embroideryMotifLayers: 1
    },
    pricingTiers: {
      personalBespoke: { priceInr: 3200, priceUsd: 40, allowedRuns: 3, commercialAllowed: false },
      commercialProduction: { priceInr: 13000, priceUsd: 160, allowedRuns: 100, commercialAllowed: true },
      exclusiveBuyout: { priceInr: 65000, priceUsd: 800, allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
    },
    licenseTermsSummary: 'Precision boning channel coordinates and waist reduction delta tables.',
    tags: ['Corset', 'Boning', 'Hourglass', 'Coutil', 'Avant-Garde'],
    featured: false,
    createdAt: '2026-07-25T14:00:00Z',
    updatedAt: '2026-08-21T09:00:00Z'
  }
];

export const SEED_ASSET_LICENSES: AssetLicenseCertificate[] = [
  {
    id: 'lic_cert_01',
    licenseKey: 'LIC-YH-2026-8A4F-29B1',
    assetId: 'ast_royal_sherwani_01',
    assetTitle: 'Royal Jodhpuri Achkan & Churidhar 3D Tech Pack',
    buyerId: 'tenant_flagship_01',
    buyerName: 'Vikramaditya Singhania',
    buyerOrganization: 'Singhania Bespoke Atelier',
    tier: 'COMMERCIAL_PRODUCTION',
    pricePaid: 18500,
    currency: 'INR',
    issuedAt: '2026-08-15T11:20:00Z',
    sha256Signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    allowedRuns: 250,
    recordedRuns: 12,
    status: 'ACTIVE',
    downloadUrl: '/downloads/lic_cert_01_bundle.zip'
  }
];

export const SEED_CREATOR_EARNINGS: CreatorEarningsLedger = {
  creatorId: 'creator_latif_01',
  totalSalesCount: 142,
  lifetimeGrossInr: 642000,
  platformFeeInr: 77040,
  lifetimeNetPayoutInr: 564960,
  pendingBalanceInr: 48500,
  availableForPayoutInr: 125000,
  monthlyBreakdown: [
    { month: '2026-08', sales: 24, grossInr: 108000, netInr: 95040 },
    { month: '2026-07', sales: 38, grossInr: 172000, netInr: 151360 },
    { month: '2026-06', sales: 42, grossInr: 190000, netInr: 167200 }
  ],
  recentTransactions: [
    {
      id: 'tx_001',
      assetTitle: 'Royal Jodhpuri Achkan & Churidhar 3D Tech Pack',
      buyerName: 'Singhania Bespoke Atelier',
      amountInr: 18500,
      netInr: 16280,
      date: '2026-08-15T11:20:00Z',
      licenseType: 'COMMERCIAL_PRODUCTION'
    },
    {
      id: 'tx_002',
      assetTitle: 'Royal Jodhpuri Achkan & Churidhar 3D Tech Pack',
      buyerName: 'Kala Ghoda Menswear',
      amountInr: 4500,
      netInr: 3960,
      date: '2026-08-18T16:45:00Z',
      licenseType: 'PERSONAL_BESPOKE'
    }
  ]
};

// ============================================================================
// LAYER 2: MACHINE ACCESS & EQUIPMENT SHARING SEEDS
// ============================================================================

export const SEED_WORKSHOP_MACHINES: WorkshopMachineListing[] = [
  {
    id: 'mch_mimaki_tx300_01',
    name: 'Mimaki Tx300P-1800 Direct-to-Fabric Digital Textile Printer',
    modelNumber: 'Tx300P-1800B',
    category: 'DIGITAL_TEXTILE_PRINTER',
    facilityName: 'Kala Ghoda Digital Fashion Lab',
    facilityLocation: {
      address: 'Building 4, K. Dubash Marg, Kala Ghoda, Fort',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 18.9288,
      longitude: 72.8331
    },
    specs: {
      bedWidthInches: 72,
      bedLengthInches: 1200,
      maxSpeedMetersPerHour: 66,
      compatibleMaterials: ['Mulberry Silk', 'Cotton Twill', 'Linen', 'Silk Organza', 'Modal'],
      supportedFileFormats: ['.tiff', '.pdf', '.ai', '.psd'],
      powerRequirement: 'AC 220V 30A 3-Phase'
    },
    pricing: {
      hourlyRateInr: 1800,
      dailyShiftRateInr: 12000,
      operatorAssistanceFeePerHourInr: 600,
      securityDepositInr: 5000
    },
    operatorProvided: true,
    requiresCertification: false,
    currentStatus: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    rating: 4.94,
    reviewsCount: 29,
    totalHoursRun: 1240,
    nextMaintenanceDate: '2026-09-15'
  },
  {
    id: 'mch_lectra_laser_02',
    name: 'Lectra Vector Fashion Q80 Automated CNC Fabric Cutter',
    modelNumber: 'VectorFashion-Q80',
    category: 'CNC_LASER_CUTTER',
    facilityName: 'Shahpur Jat Atelier Innovation Hub',
    facilityLocation: {
      address: '124 Fashion Lane, Shahpur Jat',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110049',
      latitude: 28.5489,
      longitude: 77.2155
    },
    specs: {
      bedWidthInches: 70,
      bedLengthInches: 110,
      laserPowerWatts: 200,
      maxPlyThicknessMm: 50,
      compatibleMaterials: ['Wool Crepe', 'Raw Silk', 'Velvet', 'Denim', 'Interfacing', 'Leather'],
      supportedFileFormats: ['.dxf', '.iso', '.cut', '.gerber'],
      powerRequirement: '415V 3-Phase 16kW'
    },
    pricing: {
      hourlyRateInr: 2200,
      dailyShiftRateInr: 14500,
      operatorAssistanceFeePerHourInr: 750,
      securityDepositInr: 8000
    },
    operatorProvided: true,
    requiresCertification: true,
    currentStatus: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
    rating: 4.98,
    reviewsCount: 41,
    totalHoursRun: 2150,
    nextMaintenanceDate: '2026-09-01'
  },
  {
    id: 'mch_tajima_emb_03',
    name: 'Tajima TMEZ-SC 12-Head High-Speed Intelligent Embroidery Machine',
    modelNumber: 'TMEZ-SC1512',
    category: 'MULTI_HEAD_EMBROIDERY',
    facilityName: 'Varanasi Heritage Embroidery Center',
    facilityLocation: {
      address: 'C-28/4 Chowk Silk Bazaar',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      latitude: 25.3176,
      longitude: 82.9739
    },
    specs: {
      bedWidthInches: 48,
      bedLengthInches: 240,
      needleHeads: 12,
      maxSpeedMetersPerHour: 1100,
      compatibleMaterials: ['Raw Silk', 'Velvet 9000', 'Organza', 'Chiffon', 'Brocade'],
      supportedFileFormats: ['.dst', '.pes', '.exp', '.emb'],
      powerRequirement: '3-Phase 380V 2.5kW'
    },
    pricing: {
      hourlyRateInr: 2500,
      dailyShiftRateInr: 16500,
      operatorAssistanceFeePerHourInr: 800,
      securityDepositInr: 10000
    },
    operatorProvided: true,
    requiresCertification: true,
    currentStatus: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800',
    rating: 4.91,
    reviewsCount: 33,
    totalHoursRun: 1890,
    nextMaintenanceDate: '2026-09-10'
  },
  {
    id: 'mch_durkopp_stitching_04',
    name: 'Durkopp Adler 867 Heavy-Duty Canvassing & Tailoring Unit',
    modelNumber: 'DA-867-M-PREMIUM',
    category: 'HEAVY_STITCHING_UNIT',
    facilityName: 'Indiranagar Master Tailor Workshop',
    facilityLocation: {
      address: '742 100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9719,
      longitude: 77.6412
    },
    specs: {
      bedWidthInches: 32,
      bedLengthInches: 48,
      maxSpeedMetersPerHour: 3800,
      compatibleMaterials: ['Heavy Wool Barathea', 'Leather', 'Multi-layer Canvas', 'Velvet'],
      supportedFileFormats: ['.cnc'],
      powerRequirement: '230V Single Phase 750W Direct Drive'
    },
    pricing: {
      hourlyRateInr: 950,
      dailyShiftRateInr: 6500,
      operatorAssistanceFeePerHourInr: 450,
      securityDepositInr: 3000
    },
    operatorProvided: false,
    requiresCertification: false,
    currentStatus: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800',
    rating: 4.88,
    reviewsCount: 19,
    totalHoursRun: 850,
    nextMaintenanceDate: '2026-09-20'
  },
  {
    id: 'mch_veit_steamer_05',
    name: 'Veit 8326 Specialized Form Finisher & Fusing Press System',
    modelNumber: 'Veit-8326-Multiform',
    category: 'STEAM_FINISHER_FUSING',
    facilityName: 'Kala Ghoda Digital Fashion Lab',
    facilityLocation: {
      address: 'Building 4, K. Dubash Marg, Kala Ghoda, Fort',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 18.9288,
      longitude: 72.8331
    },
    specs: {
      bedWidthInches: 42,
      bedLengthInches: 60,
      maxPlyThicknessMm: 20,
      compatibleMaterials: ['Pure Wool', 'Raw Silk', 'Velvet', 'Cashmere'],
      supportedFileFormats: [],
      powerRequirement: '400V 3-Phase 18kW Steam Generator'
    },
    pricing: {
      hourlyRateInr: 1200,
      dailyShiftRateInr: 8000,
      operatorAssistanceFeePerHourInr: 500,
      securityDepositInr: 4000
    },
    operatorProvided: true,
    requiresCertification: false,
    currentStatus: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800',
    rating: 4.96,
    reviewsCount: 25,
    totalHoursRun: 960,
    nextMaintenanceDate: '2026-09-25'
  }
];

export const SEED_MACHINE_RESERVATIONS: MachineReservationRecord[] = [
  {
    id: 'res_mch_089',
    reservationNumber: 'RES-2026-MCH-089',
    machineId: 'mch_lectra_laser_02',
    machineName: 'Lectra Vector Fashion Q80 Automated CNC Fabric Cutter',
    machineCategory: 'CNC_LASER_CUTTER',
    facilityName: 'Shahpur Jat Atelier Innovation Hub',
    tenantId: 'tenant_flagship_01',
    userId: 'user_vikram_01',
    userName: 'Vikramaditya Singhania',
    bookingType: 'HOURLY',
    startTime: '2026-08-25T10:00:00Z',
    endTime: '2026-08-25T14:00:00Z',
    totalDurationHours: 4,
    includeOperator: true,
    operatorName: 'Ramesh Sharma (Senior CNC Technician)',
    jobDetails: {
      jobTitle: '12x Royal Sherwani Panel Precision Cutting',
      garmentCategory: 'mens-sherwani',
      cutFileName: 'brf_2026_089_nested_cutfile.dxf',
      panelCount: 144,
      fabricType: 'Mulberry Raw Silk (110 GSM)',
      boltWidthInches: 44,
      estimatedRunMinutes: 190,
      bedEfficiencyPercent: 92.4,
      specialInstructions: 'Ensure blade sharpness check before cutting raw silk grainlines.'
    },
    costBreakdown: {
      machineBaseCost: 8800,
      operatorFee: 3000,
      securityDeposit: 8000,
      cleaningFee: 500,
      taxesInr: 2214,
      totalAmountInr: 22514
    },
    paymentStatus: 'ESCROW_HOLD',
    reservationStatus: 'CONFIRMED',
    checkInInspectionPassed: false,
    checkOutInspectionPassed: false,
    createdAt: '2026-08-23T11:00:00Z'
  }
];

// ============================================================================
// LAYER 3: VENDOR MATERIAL SOURCING SEEDS
// ============================================================================

export const SEED_MATERIALS_CATALOG: VendorMaterialItem[] = [
  {
    id: 'mat_mulberry_silk_01',
    sku: 'MAT-SLK-RAW-001',
    name: 'Pure Mulberry Raw Silk (110 GSM Handloom Weave)',
    category: 'FABRIC',
    fiberComposition: '100% Pure Mulberry Silk',
    weaveType: 'Raw Silk',
    weightGsm: 110,
    boltWidthInches: 44,
    drapeScore: 4.5,
    breathabilityScore: 8.5,
    shrinkagePercent: 3.5,
    elasticityPercent: 0,
    colorName: 'Royal Ivory',
    hexColor: '#FBF7EE',
    pantoneCode: '11-0601 TCX',
    swatchImageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
    vendor: {
      id: 'vnd_varanasi_guild_01',
      name: 'Varanasi Silk Weaver Guild',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      verified: true,
      rating: 4.95,
      leadTimeDays: 2,
      shippingChargeInr: 250
    },
    stockLevelMeters: 480,
    reorderThresholdMeters: 100,
    moqMeters: 2.0,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 1850, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 1665, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 1443, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 1202, discountPercent: 35 }
    ],
    recommendedGarments: ['mens-sherwani', 'womens-blouse', 'womens-lehenga', 'mens-suit'],
    tags: ['Mulberry Silk', 'Raw Silk', 'Ivory', 'Bespoke', 'Wedding'],
    inStock: true
  },
  {
    id: 'mat_silk_velvet_02',
    sku: 'MAT-VLV-9000-002',
    name: 'Micro-Velvet 9000 (Haute Couture Weight)',
    category: 'FABRIC',
    fiberComposition: 'Silk Pile on Cotton Base',
    weaveType: 'Micro-Velvet 9000',
    weightGsm: 340,
    boltWidthInches: 44,
    drapeScore: 7.2,
    breathabilityScore: 6.0,
    shrinkagePercent: 2.0,
    elasticityPercent: 2.5,
    colorName: 'Midnight Regal Navy',
    hexColor: '#0A1128',
    pantoneCode: '19-4024 TCX',
    swatchImageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600',
    vendor: {
      id: 'vnd_surat_textiles_02',
      name: 'Surat Royal Velvet Mills',
      city: 'Surat',
      state: 'Gujarat',
      verified: true,
      rating: 4.88,
      leadTimeDays: 3,
      shippingChargeInr: 300
    },
    stockLevelMeters: 320,
    reorderThresholdMeters: 80,
    moqMeters: 3.0,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 2200, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 1980, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 1716, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 1430, discountPercent: 35 }
    ],
    recommendedGarments: ['womens-lehenga', 'mens-sherwani', 'womens-gown', 'mens-suit'],
    tags: ['Velvet', 'Micro Velvet', 'Navy', 'Bridal', 'Winter Festive'],
    inStock: true
  },
  {
    id: 'mat_wool_barathea_03',
    sku: 'MAT-WOL-BAR-003',
    name: 'Super 150s Merino Wool Barathea (Savile Row Tuxedo Weave)',
    category: 'FABRIC',
    fiberComposition: '100% Super 150s Australian Merino Wool',
    weaveType: 'Italian Wool Crepe',
    weightGsm: 280,
    boltWidthInches: 58,
    drapeScore: 3.8,
    breathabilityScore: 9.0,
    shrinkagePercent: 1.0,
    elasticityPercent: 1.5,
    colorName: 'Pitch Carbon Black',
    hexColor: '#111111',
    pantoneCode: '19-4005 TCX',
    swatchImageUrl: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600',
    vendor: {
      id: 'vnd_biella_imports_03',
      name: 'Biella Wool Merchants India',
      city: 'Mumbai',
      state: 'Maharashtra',
      verified: true,
      rating: 4.98,
      leadTimeDays: 2,
      shippingChargeInr: 350
    },
    stockLevelMeters: 210,
    reorderThresholdMeters: 50,
    moqMeters: 2.5,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 3800, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 3420, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 2964, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 2470, discountPercent: 35 }
    ],
    recommendedGarments: ['mens-suit', 'mens-trouser', 'mens-sherwani'],
    tags: ['Barathea', 'Wool', 'Tuxedo', 'Savile Row', 'Super 150s'],
    inStock: true
  },
  {
    id: 'mat_bemberg_lining_04',
    sku: 'MAT-LIN-CUP-004',
    name: 'Bemberg Cupro Twill Breathable Jacket Lining',
    category: 'LINING',
    fiberComposition: '100% Cupro Rayon (Cotton Linter)',
    weaveType: 'Bemberg Cupro Twill',
    weightGsm: 85,
    boltWidthInches: 54,
    drapeScore: 9.2,
    breathabilityScore: 9.8,
    shrinkagePercent: 1.5,
    elasticityPercent: 0,
    colorName: 'Antique Gold',
    hexColor: '#D4AF37',
    swatchImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
    vendor: {
      id: 'vnd_biella_imports_03',
      name: 'Biella Wool Merchants India',
      city: 'Mumbai',
      state: 'Maharashtra',
      verified: true,
      rating: 4.98,
      leadTimeDays: 2,
      shippingChargeInr: 150
    },
    stockLevelMeters: 650,
    reorderThresholdMeters: 150,
    moqMeters: 1.5,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 450, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 405, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 351, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 292, discountPercent: 35 }
    ],
    recommendedGarments: ['mens-suit', 'mens-sherwani', 'womens-gown', 'womens-blouse'],
    tags: ['Cupro', 'Bemberg', 'Lining', 'Gold', 'Breathable'],
    inStock: true
  },
  {
    id: 'mat_silk_organza_05',
    sku: 'MAT-ORG-SLK-005',
    name: 'Translucent Crisp Silk Organza (38 GSM)',
    category: 'FABRIC',
    fiberComposition: '100% Mulberry Silk',
    weaveType: 'Silk Organza',
    weightGsm: 38,
    boltWidthInches: 44,
    drapeScore: 8.8,
    breathabilityScore: 9.5,
    shrinkagePercent: 2.0,
    elasticityPercent: 0,
    colorName: 'Blush Rose Quartz',
    hexColor: '#F7CAC9',
    swatchImageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    vendor: {
      id: 'vnd_varanasi_guild_01',
      name: 'Varanasi Silk Weaver Guild',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      verified: true,
      rating: 4.95,
      leadTimeDays: 2,
      shippingChargeInr: 200
    },
    stockLevelMeters: 410,
    reorderThresholdMeters: 90,
    moqMeters: 2.0,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 1250, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 1125, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 975, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 812, discountPercent: 35 }
    ],
    recommendedGarments: ['womens-anarkali', 'womens-lehenga', 'womens-blouse', 'womens-gown'],
    tags: ['Organza', 'Silk', 'Blush', 'Translucent', 'Bridal Dupatta'],
    inStock: true
  },
  {
    id: 'mat_canvas_interfacing_06',
    sku: 'MAT-INT-HRS-006',
    name: 'Traditional Floating Horsehair Chest Canvas Interfacing',
    category: 'INTERFACING',
    fiberComposition: '40% Horsehair, 40% Wool, 20% Cotton',
    weaveType: 'Horsehair Canvas Interfacing',
    weightGsm: 240,
    boltWidthInches: 36,
    drapeScore: 2.0,
    breathabilityScore: 8.0,
    shrinkagePercent: 0.5,
    elasticityPercent: 0,
    colorName: 'Natural Oatmeal',
    hexColor: '#E6D7C3',
    swatchImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
    vendor: {
      id: 'vnd_biella_imports_03',
      name: 'Biella Wool Merchants India',
      city: 'Mumbai',
      state: 'Maharashtra',
      verified: true,
      rating: 4.98,
      leadTimeDays: 2,
      shippingChargeInr: 180
    },
    stockLevelMeters: 290,
    reorderThresholdMeters: 60,
    moqMeters: 1.0,
    pricingTiers: [
      { minMeters: 1, maxMeters: 9, pricePerMeterInr: 850, discountPercent: 0 },
      { minMeters: 10, maxMeters: 49, pricePerMeterInr: 765, discountPercent: 10 },
      { minMeters: 50, maxMeters: 199, pricePerMeterInr: 663, discountPercent: 22 },
      { minMeters: 200, maxMeters: null, pricePerMeterInr: 552, discountPercent: 35 }
    ],
    recommendedGarments: ['mens-suit', 'mens-sherwani'],
    tags: ['Horsehair', 'Canvas', 'Floating Canvas', 'Savile Row Structure'],
    inStock: true
  }
];

export const SEED_MATERIAL_ORDERS: MaterialSourcingOrder[] = [
  {
    id: 'mso_2026_001',
    orderNumber: 'MSO-2026-089',
    tenantId: 'tenant_flagship_01',
    vendorId: 'vnd_varanasi_guild_01',
    vendorName: 'Varanasi Silk Weaver Guild',
    items: [
      {
        materialId: 'mat_mulberry_silk_01',
        materialName: 'Pure Mulberry Raw Silk (110 GSM Handloom Weave)',
        sku: 'MAT-SLK-RAW-001',
        meters: 60,
        unitPriceInr: 1443,
        discountPercent: 22,
        totalCostInr: 86580
      }
    ],
    subtotalInr: 86580,
    shippingChargeInr: 250,
    taxGstInr: 4329,
    totalAmountInr: 91159,
    status: 'CONFIRMED',
    trackingNumber: 'DELHIVERY-AWB-9842104',
    shippingAddress: 'YellowHouse Atelier, 14 Rampart Row, Fort, Mumbai 400001',
    paymentStatus: 'PAID',
    createdAt: '2026-08-22T09:30:00Z',
    updatedAt: '2026-08-22T14:00:00Z'
  }
];

// ============================================================================
// LAYER 4: PRODUCTION BIDDING & TAILOR ECOSYSTEM SEEDS
// ============================================================================

export const SEED_ARTISAN_PORTFOLIOS: ArtisanPortfolioProfile[] = [
  {
    id: 'art_rafiq_zardozi_01',
    artisanId: 'user_rafiq_01',
    workshopName: 'Master Rafiq & Sons Imperial Zardozi Atelier',
    masterTailorName: 'Ustad Rafiq Ahmed',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    specialties: ['ZARDOZI_EMBROIDERY', 'AARI_THREADWORK', 'SHERWANI_STRUCTURE'],
    experienceYears: 34,
    location: {
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      country: 'India',
      hubZone: 'Chowk Heritage Karigar Cluster'
    },
    monthlyCapacityGarments: 20,
    activeOrdersCount: 8,
    standardMinuteSamRateInr: 55,
    hourlyRateInr: 1400,
    verifiedBadge: true,
    rating: 4.97,
    reviewsCount: 86,
    completedBidsCount: 142,
    onTimeDeliveryRatePercent: 98.2,
    gallery: [
      {
        id: 'gal_01',
        title: 'Dabka & Nakshi Hand-Embroidered Velvet Sherwani',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        garmentCategory: 'mens-sherwani',
        technique: '24-Karat Gold Zari Micro-Zardozi'
      },
      {
        id: 'gal_02',
        title: 'Botanical Peacock Motif 24-Kali Bridal Skirt',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
        garmentCategory: 'womens-lehenga',
        technique: 'Aari Threadwork & French Knots'
      }
    ],
    certifications: ['National Master Artisan Guild (Class A)', 'All India Handloom & Handicrafts Council']
  },
  {
    id: 'art_latif_canvas_02',
    artisanId: 'user_latif_master_02',
    workshopName: 'Master Latif Bespoke Cutting & Suiting Lab',
    masterTailorName: 'Master Latif Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    specialties: ['MASTER_CANVAS_CUTTING', 'TUXEDO_BESPOKE', 'HAND_ROLLED_BUTTONHOLES'],
    experienceYears: 28,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      hubZone: 'Kala Ghoda Heritage Tailoring Quarter'
    },
    monthlyCapacityGarments: 25,
    activeOrdersCount: 11,
    standardMinuteSamRateInr: 65,
    hourlyRateInr: 1800,
    verifiedBadge: true,
    rating: 4.99,
    reviewsCount: 114,
    completedBidsCount: 230,
    onTimeDeliveryRatePercent: 99.4,
    gallery: [
      {
        id: 'gal_03',
        title: 'Savile Row Floating Canvas Dinner Jacket',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
        garmentCategory: 'mens-suit',
        technique: 'Hand-Padded Chest Canvas & Roped Sleeve Crown'
      }
    ],
    certifications: ['Savile Row Academy Certified Cutter', 'Master Bespoke Tailor Guild of Western India']
  }
];

export const SEED_PRODUCTION_BRIEFS: ProductionDesignBrief[] = [
  {
    id: 'brf_winter_sherwani_01',
    briefNumber: 'BRF-2026-089',
    atelierTenantId: 'tenant_flagship_01',
    atelierName: 'YellowHouse Flagship Atelier',
    title: '12x Imperial Gold Zardozi Sherwani for Royal Winter Wedding Collection',
    garmentCategory: 'mens-sherwani',
    batchQuantity: 12,
    targetBudgetPerUnitInr: 42000,
    totalBudgetCeilingInr: 504000,
    targetDeliveryDate: '2026-10-15T18:00:00Z',
    deadlineForBids: '2026-09-01T23:59:59Z',
    fabricSuppliedByAtelier: true,
    techPackAssetId: 'ast_royal_sherwani_01',
    techPackUrl: '/techpacks/brf_2026_089_techpack.pdf',
    requiredSpecialties: ['ZARDOZI_EMBROIDERY', 'SHERWANI_STRUCTURE'],
    specifications: {
      hasFullCanvas: true,
      embroideryLevel: 'heavy',
      trialFittingCount: 2,
      liningDetails: 'Bemberg Cupro Antique Gold #D4AF37',
      interfacingDetails: 'Double canvas chest piece with hand-stitched collar stays'
    },
    status: 'OPEN_FOR_BIDS',
    bidsCount: 2,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-23T12:00:00Z'
  }
];

export const SEED_TAILOR_BIDS: TailorProductionBid[] = [
  {
    id: 'bid_rafiq_01',
    briefId: 'brf_winter_sherwani_01',
    artisanId: 'art_rafiq_zardozi_01',
    artisanName: 'Ustad Rafiq Ahmed',
    artisanWorkshopName: 'Master Rafiq & Sons Imperial Zardozi Atelier',
    artisanAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    artisanRating: 4.97,
    artisanSpecialties: ['ZARDOZI_EMBROIDERY', 'SHERWANI_STRUCTURE'],
    bidAmountPerUnitInr: 38500,
    totalBidAmountInr: 462000,
    estimatedLeadTimeDays: 35,
    milestonePlan: [
      { stageIndex: 1, milestoneName: 'Canvas Cutting & Foundation Prep', daysFromStart: 7, percentagePayout: 20, deliverableDescription: 'Precision CAD cutting of all 12 units and canvas pad assembly.' },
      { stageIndex: 2, milestoneName: 'Skeleton Trial Inspection', daysFromStart: 16, percentagePayout: 30, deliverableDescription: 'Fitting trial assembly for lead size 40R with baste stitching.' },
      { stageIndex: 3, milestoneName: 'Zardozi Hand Embroidery & Sleeve Joining', daysFromStart: 28, percentagePayout: 30, deliverableDescription: 'Full front panel, cuff, and collar gold dabka hand zardozi.' },
      { stageIndex: 4, milestoneName: 'Final QC, Lining & Steam Pressing', daysFromStart: 35, percentagePayout: 20, deliverableDescription: 'Final inspection, buttonholes, pressing, and dispatch packaging.' }
    ],
    proposalNotes: 'Our team of 8 master karigars in Lucknow will dedicate exclusive addas to this batch. We include micro-zari samples for approval before mounting panels.',
    sampleSwatchesOffered: true,
    status: 'SUBMITTED',
    submittedAt: '2026-08-21T14:15:00Z'
  }
];

export const SEED_PRODUCTION_CONTRACTS: ProductionContractRecord[] = [
  {
    id: 'ctr_2026_089_01',
    contractNumber: 'CTR-2026-BRF089-01',
    briefId: 'brf_winter_sherwani_01',
    briefTitle: '12x Imperial Gold Zardozi Sherwani for Royal Winter Wedding Collection',
    acceptedBidId: 'bid_rafiq_01',
    atelierTenantId: 'tenant_flagship_01',
    atelierName: 'YellowHouse Flagship Atelier',
    artisanId: 'art_rafiq_zardozi_01',
    artisanWorkshopName: 'Master Rafiq & Sons Imperial Zardozi Atelier',
    totalContractAmountInr: 462000,
    escrowStatus: 'HELD_IN_ESCROW',
    milestones: [
      {
        stageIndex: 1,
        name: 'Canvas Cutting & Foundation Prep',
        payoutAmountInr: 92400,
        percentagePayout: 20,
        targetCompletionDate: '2026-09-05T18:00:00Z',
        status: 'IN_PROGRESS'
      },
      {
        stageIndex: 2,
        name: 'Skeleton Trial Inspection',
        payoutAmountInr: 138600,
        percentagePayout: 30,
        targetCompletionDate: '2026-09-15T18:00:00Z',
        status: 'PENDING'
      },
      {
        stageIndex: 3,
        name: 'Zardozi Hand Embroidery & Sleeve Joining',
        payoutAmountInr: 138600,
        percentagePayout: 30,
        targetCompletionDate: '2026-09-28T18:00:00Z',
        status: 'PENDING'
      },
      {
        stageIndex: 4,
        name: 'Final QC, Lining & Steam Pressing',
        payoutAmountInr: 92400,
        percentagePayout: 20,
        targetCompletionDate: '2026-10-10T18:00:00Z',
        status: 'PENDING'
      }
    ],
    currentState: 'PATTERN_CUTTING',
    signedAt: '2026-08-22T16:00:00Z'
  }
];

// ============================================================================
// LAYER 5: 3-MONTH FREE TRIAL & STYLIST DIRECTORY SEEDS
// ============================================================================

export const SEED_TENANT_TRIAL_PROFILE: TenantTrialOnboardingProfile = {
  tenantId: 'tenant_flagship_01',
  tenantName: 'YellowHouse Flagship Atelier',
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

export const SEED_CERTIFIED_STYLISTS: CertifiedStylistProfile[] = [
  {
    id: 'sty_aanya_01',
    fullName: 'Aanya Singhania',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Senior Bridal Couture & Draping Architect',
    badge: 'TROUSSEAU_ARCHITECT',
    profileBio: '14+ years curating high-profile bridal trousseaus across Mumbai, London, and Dubai. Specializes in 24-kali lehenga proportion balancing, heritage drape architecture, and seasonal color matching.',
    experienceYears: 14,
    location: {
      areaDistrict: 'Kala Ghoda / Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    specializations: ['BRIDAL_TROUSSEAU', 'ROYAL_HERITAGE_DRAPING', 'COLOR_SEASONAL_ANALYSIS'],
    consultationModes: ['IN_PERSON_ATELIER', 'VIRTUAL_HD', 'CLIENT_WARDROBE_VISIT'],
    hourlyFeeInr: 3500,
    rating: 4.99,
    reviewsCount: 92,
    consultationsCompletedCount: 240,
    portfolioLooks: [
      {
        id: 'pl_01',
        title: 'Royal Emerald Velvet Bridal Silhouette',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
        occasion: 'Royal Wedding Trousseau',
        garmentCategory: 'womens-lehenga'
      }
    ],
    availableWeeklySlots: [
      { dayOfWeek: 'Tuesday', timeSlots: ['11:00 AM', '03:00 PM', '05:30 PM'] },
      { dayOfWeek: 'Thursday', timeSlots: ['10:30 AM', '02:00 PM', '04:30 PM'] },
      { dayOfWeek: 'Saturday', timeSlots: ['12:00 PM', '03:30 PM', '06:00 PM'] }
    ]
  },
  {
    id: 'sty_kabir_02',
    fullName: 'Kabir Mehta',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Bespoke Suiting & Menswear Stylist',
    badge: 'PURPLE_COGS_CERTIFIED',
    profileBio: 'Savile Row trained bespoke stylist helping discerning gentlemen craft capsule bespoke wardrobes, black-tie event ensembles, and modern Indo-Western silhouettes.',
    experienceYears: 9,
    location: {
      areaDistrict: 'Shahpur Jat / Mehrauli',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110049',
      country: 'India'
    },
    specializations: ['BESPOKE_SUITING_CONSULTANT', 'INDO_WESTERN_FUSION'],
    consultationModes: ['IN_PERSON_ATELIER', 'VIRTUAL_HD'],
    hourlyFeeInr: 2800,
    rating: 4.93,
    reviewsCount: 48,
    consultationsCompletedCount: 110,
    portfolioLooks: [
      {
        id: 'pl_02',
        title: 'Double-Breasted Jodhpuri Bandhgala Ensemble',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
        occasion: 'Bespoke Red Carpet Gala',
        garmentCategory: 'mens-suit'
      }
    ],
    availableWeeklySlots: [
      { dayOfWeek: 'Monday', timeSlots: ['02:00 PM', '04:00 PM'] },
      { dayOfWeek: 'Wednesday', timeSlots: ['11:00 AM', '03:00 PM'] },
      { dayOfWeek: 'Friday', timeSlots: ['01:00 PM', '05:00 PM'] }
    ]
  },
  {
    id: 'sty_priya_03',
    fullName: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    title: 'Heritage Zardozi & Motif Curation Specialist',
    badge: 'MASTER_DRAPER',
    profileBio: 'Specializes in vintage royal embroidery motifs, traditional Lucknowi Chikankari curation, and modern fusion styling.',
    experienceYears: 11,
    location: {
      areaDistrict: 'Chowk / Hazratganj',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226003',
      country: 'India'
    },
    specializations: ['ZARDOZI_MOTIF_CURATION', 'ROYAL_HERITAGE_DRAPING'],
    consultationModes: ['IN_PERSON_ATELIER', 'VIRTUAL_HD'],
    hourlyFeeInr: 2400,
    rating: 4.96,
    reviewsCount: 65,
    consultationsCompletedCount: 175,
    portfolioLooks: [
      {
        id: 'pl_03',
        title: 'Gold Dabka Zardozi Sherwani Ensemble',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        occasion: 'Imperial Royal Wedding',
        garmentCategory: 'mens-sherwani'
      }
    ],
    availableWeeklySlots: [
      { dayOfWeek: 'Tuesday', timeSlots: ['10:00 AM', '02:00 PM'] },
      { dayOfWeek: 'Thursday', timeSlots: ['03:00 PM', '06:00 PM'] }
    ]
  }
];

export const SEED_STYLIST_BOOKINGS: StylistConsultationBookingRecord[] = [
  {
    id: 'sty_bk_001',
    bookingNumber: 'STY-2026-042',
    stylistId: 'sty_aanya_01',
    stylistName: 'Aanya Singhania',
    stylistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    tenantId: 'tenant_flagship_01',
    clientName: 'Sunita Mehra',
    clientPhone: '+91 98201 45678',
    clientEmail: 'sunita.mehra@luxuryclient.in',
    garmentCategoryOfInterest: 'womens-lehenga',
    consultationMode: 'IN_PERSON_ATELIER',
    scheduledAt: '2026-08-26T15:00:00Z',
    durationMinutes: 60,
    feeAmountInr: 3500,
    discountAppliedInr: 525,
    totalPaidInr: 2975,
    paymentStatus: 'PAID',
    bookingStatus: 'CONFIRMED',
    clientBriefNotes: 'Looking for 24-kali flared bridal lehenga styling for destination Udaipur royal wedding.',
    stylistRecommendationNotes: 'Recommended Velvet 9000 Midnight Navy with micro-zardozi gold border and Habotai silk lining.',
    createdAt: '2026-08-22T10:00:00Z'
  }
];

// Aliases for convenience & compatibility
export const SEED_FASHION_BLUEPRINTS = SEED_FASHION_ASSETS;
export const SEED_VENDOR_MATERIALS = SEED_MATERIALS_CATALOG;
export const SEED_FABRIC_SOURCING_ORDERS = SEED_MATERIAL_ORDERS;
export const SEED_ARTISAN_PROFILES = SEED_ARTISAN_PORTFOLIOS;
