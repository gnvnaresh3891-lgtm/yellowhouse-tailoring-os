/**
 * YellowHouse Tailoring OS — Bespoke Tailoring & Digital Fashion Ecosystem
 * Unified TypeScript Models & Type Definitions for All 5 Ecosystem Layers:
 * 
 * Layer 1: Digital Asset Warehouse & Design Marketplace ("Design as a Product")
 * Layer 2: Machine Access & Workshop Equipment Sharing Marketplace
 * Layer 3: Supply Layer — Vendor Material Sourcing & Smart Recommendations
 * Layer 4: Production Bidding & Tailor / Manufacturer Ecosystem
 * Layer 5: 3-Month Free Trial Onboarding & Professional Stylist Directory ("RedHouse OS")
 */

import { GarmentCategory } from './measurement';

// Re-export GarmentCategory for ecosystem consumers
export type { GarmentCategory };

// ============================================================================
// LAYER 1: DIGITAL ASSET WAREHOUSE & DESIGN MARKETPLACE
// ============================================================================

export type AestheticStyle =
  | 'INDO_WESTERN'
  | 'TRADITIONAL_BRIDAL'
  | 'MODERN_SAVILE_ROW'
  | 'AVANT_GARDE'
  | 'MINIMALIST_COUTURE'
  | 'HERITAGE_ROYAL'
  | 'CONTEMPORARY_STREETWEAR';

export type AssetDifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER_KARIGAR';

export type AssetFileFormat = '.dxf' | '.clo3d' | '.zprj' | '.pdf' | '.svg' | '.ai' | '.glb' | '.blend';

export type LicenseTierType = 'PERSONAL_BESPOKE' | 'COMMERCIAL_PRODUCTION' | 'EXCLUSIVE_BUYOUT';

// Aliases for compatibility
export type LicenseType = LicenseTierType;
export type AssetCategory = GarmentCategory;

export interface TechPackSpecData {
  seamAllowancesMm: number;
  gradingRange: string[]; // e.g. ['36R', '38R', '40R', '42R', '44R', '46R']
  recommendedFabrics: string[];
  estimatedSewingSamMinutes: number;
  patternPiecesCount: number;
  liningIncluded: boolean;
  interfacingSpecifications?: string;
  embroideryMotifLayers?: number;
}

export interface LicenseTierPricing {
  priceInr: number;
  priceUsd: number;
  allowedRuns: number; // e.g. 3 for personal, 250 for commercial, 999999 for buyout
  commercialAllowed: boolean;
  transfersIp?: boolean;
}

export interface FashionBlueprintAsset {
  id: string;
  title: string;
  slug: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorTier: 'MASTER_CREATOR' | 'CERTIFIED_ATELIER' | 'INDIE_DESIGNER';
  garmentCategory: GarmentCategory;
  aestheticStyle: AestheticStyle;
  difficultyLevel: AssetDifficultyLevel;
  description: string;
  coverImageUrl: string;
  previewImageUrls: string[];
  fileFormats: AssetFileFormat[];
  fileSizeMb: number;
  version: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  is3dInteractive: boolean;
  model3dUrl?: string;
  techPackSpecs: TechPackSpecData;
  pricingTiers: {
    personalBespoke: LicenseTierPricing;
    commercialProduction: LicenseTierPricing;
    exclusiveBuyout: LicenseTierPricing;
  };
  licenseTermsSummary: string;
  tags: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetLicenseCertificate {
  id: string;
  licenseKey: string; // e.g. "LIC-YH-2026-X892-F91A"
  assetId: string;
  assetTitle: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string;
  tier: LicenseTierType;
  pricePaid: number;
  currency: 'INR' | 'USD';
  issuedAt: string;
  sha256Signature: string;
  allowedRuns: number;
  recordedRuns: number;
  status: 'ACTIVE' | 'EXHAUSTED' | 'REVOKED';
  downloadUrl: string;
}

export interface CreatorMonthlySales {
  month: string; // "2026-08"
  sales: number;
  grossInr: number;
  netInr: number;
}

export interface CreatorTransactionRecord {
  id: string;
  assetTitle: string;
  buyerName: string;
  amountInr: number;
  netInr: number;
  date: string;
  licenseType: LicenseTierType;
}

export interface CreatorEarningsLedger {
  creatorId: string;
  totalSalesCount: number;
  lifetimeGrossInr: number;
  platformFeeInr: number; // 12% standard platform fee
  lifetimeNetPayoutInr: number;
  pendingBalanceInr: number;
  availableForPayoutInr: number;
  monthlyBreakdown: CreatorMonthlySales[];
  recentTransactions: CreatorTransactionRecord[];
}

// ============================================================================
// LAYER 2: MACHINE ACCESS & WORKSHOP EQUIPMENT SHARING
// ============================================================================

export type MachineHardwareCategory =
  | 'DIGITAL_TEXTILE_PRINTER'
  | 'CNC_LASER_CUTTER'
  | 'MULTI_HEAD_EMBROIDERY'
  | 'HEAVY_STITCHING_UNIT'
  | 'STEAM_FINISHER_FUSING';

// Aliases for compatibility
export type MachineType =
  | 'DIGITAL_TEXTILE_PRINTER'
  | 'LASER_CUTTER'
  | 'EMBROIDERY_MACHINE'
  | 'TOOL_POSITIONING_UNIT'
  | 'STEAM_FINISHER_FUSING'
  | MachineHardwareCategory;

export type ShiftType = 'HOURLY' | 'DAILY_FULL_SHIFT' | 'DAILY_SHIFT' | 'PANEL_BATCH';

export type MachineOperationalStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OFFLINE';

export interface MachineHardwareSpecs {
  bedWidthInches: number;
  bedLengthInches: number;
  maxSpeedMetersPerHour?: number;
  needleHeads?: number;
  laserPowerWatts?: number;
  maxPlyThicknessMm?: number;
  compatibleMaterials: string[];
  supportedFileFormats: string[];
  powerRequirement: string;
}

export interface MachineLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface MachinePricingConfig {
  hourlyRateInr: number;
  dailyShiftRateInr: number; // 8 hrs discounted
  operatorAssistanceFeePerHourInr: number;
  securityDepositInr: number;
}

export interface WorkshopMachineListing {
  id: string;
  name: string;
  modelNumber: string;
  category: MachineHardwareCategory;
  facilityName: string;
  facilityLocation: MachineLocation;
  specs: MachineHardwareSpecs;
  pricing: MachinePricingConfig;
  operatorProvided: boolean;
  requiresCertification: boolean;
  currentStatus: MachineOperationalStatus;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  totalHoursRun: number;
  nextMaintenanceDate: string;
}

export interface PanelProductionJobDetails {
  jobTitle: string;
  garmentCategory: GarmentCategory;
  cutFileUrl?: string;
  cutFileName?: string;
  panelCount: number;
  fabricType: string;
  boltWidthInches: number;
  estimatedRunMinutes: number;
  bedEfficiencyPercent: number;
  specialInstructions?: string;
}

export interface MachineReservationCostBreakdown {
  machineBaseCost: number;
  operatorFee: number;
  securityDeposit: number;
  cleaningFee: number;
  taxesInr: number; // 18% GST on services
  totalAmountInr: number;
}

export interface MachineReservationRecord {
  id: string;
  reservationNumber: string; // e.g. "RES-2026-MCH-089"
  machineId: string;
  machineName: string;
  machineCategory: MachineHardwareCategory;
  facilityName: string;
  tenantId: string;
  userId: string;
  userName: string;
  bookingType: 'HOURLY' | 'DAILY_SHIFT' | 'DAILY_FULL_SHIFT' | 'PANEL_BATCH';
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  totalDurationHours: number;
  includeOperator: boolean;
  operatorName?: string;
  jobDetails: PanelProductionJobDetails;
  costBreakdown: MachineReservationCostBreakdown;
  paymentStatus: 'ESCROW_HOLD' | 'PAID' | 'REFUNDED' | 'SECURITY_FORFEITED';
  reservationStatus: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checkInInspectionPassed?: boolean;
  checkOutInspectionPassed?: boolean;
  createdAt: string;
}

// ============================================================================
// LAYER 3: SUPPLY LAYER — VENDOR MATERIAL SOURCING & SMART RECOMMENDATIONS
// ============================================================================

export type MaterialCategory =
  | 'FABRIC'
  | 'LINING'
  | 'INTERFACING'
  | 'TRIM'
  | 'EMBELLISHMENT_THREAD'
  | 'COTTON'
  | 'SILK'
  | 'VELVET'
  | 'ORGANZA'
  | 'LININGS'
  | 'TRIMS';

export type WeaveType =
  | 'Raw Silk'
  | 'Mulberry Habotai'
  | 'Silk Brocade / Banarasi'
  | 'Micro-Velvet 9000'
  | 'Silk Organza'
  | 'Italian Wool Crepe'
  | 'Egyptian Giza Twill'
  | 'Bemberg Cupro Twill'
  | 'Horsehair Canvas Interfacing'
  | 'Giza Cotton Sateen'
  | 'French Chiffon'
  | string;

export interface VolumePricingTier {
  minMeters: number;
  maxMeters: number | null; // null represents unbounded upper range
  pricePerMeterInr: number;
  discountPercent: number;
}

export interface VendorSupplierInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  verified: boolean;
  rating: number;
  leadTimeDays: number;
  shippingChargeInr: number;
}

export interface VendorMaterialItem {
  id: string;
  sku: string; // e.g. "MAT-SLK-RAW-001"
  name: string;
  category: MaterialCategory;
  fiberComposition: string; // e.g. "100% Pure Mulberry Silk"
  weaveType: WeaveType;
  weightGsm: number;
  boltWidthInches: number; // 44, 54, or 58
  drapeScore: number; // 1 (stiff / structured) to 10 (ultra fluid / liquid drape)
  breathabilityScore: number; // 1 to 10
  shrinkagePercent: number;
  elasticityPercent: number;
  colorName: string;
  hexColor: string;
  pantoneCode?: string;
  swatchImageUrl: string;
  vendor: VendorSupplierInfo;
  stockLevelMeters: number;
  reorderThresholdMeters: number;
  moqMeters: number;
  pricingTiers: VolumePricingTier[];
  recommendedGarments: GarmentCategory[];
  tags: string[];
  inStock: boolean;
}

export interface SmartRecommendationInput {
  targetGarmentType?: GarmentCategory;
  garmentCategory?: GarmentCategory;
  targetBudgetInr?: number;
  maxBudgetPerMeter?: number;
  minRequiredYieldMeters?: number;
  preferredColorTone?: string;
  desiredDrape?: 'STRUCTURED' | 'FLUID' | 'SCULPTURAL' | 'LIGHTWEIGHT';
  season?: 'SUMMER_SPRING' | 'WINTER_FESTIVE' | 'MONSOON_ALL_WEATHER';
  preferredFibers?: string[];
  includeLiningAndTrims?: boolean;
  girthMeasurement?: number;
  lengthMeasurement?: number;
  panelCount?: number;
}

export interface FabricRecommendationOption {
  optionType: 'BEST_MATCH' | 'BUDGET_SAVER' | 'LUXURY_UPGRADE';
  primaryFabric: VendorMaterialItem;
  appliedUnitPriceInr: number;
  requiredMeters: number;
  fabricTotalCostInr: number;
  matchingLining?: VendorMaterialItem;
  liningTotalCostInr?: number;
  estimatedTrimsCostInr: number;
  grandTotalMaterialCostInr: number;
  budgetUtilizationPercent: number;
  fitScore: number; // 0 to 100
  reasoning: string[];
}

// Aliases for compatibility
export type FabricRecommendationScore = FabricRecommendationOption;

export interface SmartFabricRecommendationResult {
  garmentCategory: GarmentCategory;
  targetBudgetInr: number;
  calculatedYieldMeters: number;
  options: {
    bestMatch: FabricRecommendationOption;
    budgetSaver: FabricRecommendationOption;
    luxuryUpgrade: FabricRecommendationOption;
  };
  comparisonMatrix: Array<{
    criterion: string;
    bestMatchValue: string;
    budgetSaverValue: string;
    luxuryUpgradeValue: string;
  }>;
}

export type SmartRecommendationResult = SmartFabricRecommendationResult;

export interface MaterialSourcingOrderItem {
  materialId: string;
  materialName: string;
  sku: string;
  meters: number;
  unitPriceInr: number;
  discountPercent: number;
  totalCostInr: number;
}

export interface MaterialSourcingOrder {
  id: string;
  orderNumber: string; // e.g. "MSO-2026-089"
  tenantId: string;
  vendorId: string;
  vendorName: string;
  items: MaterialSourcingOrderItem[];
  subtotalInr: number;
  shippingChargeInr: number;
  taxGstInr: number; // 5% GST on textiles
  totalAmountInr: number;
  status: 'DRAFT' | 'ORDER_PLACED' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  shippingAddress: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LAYER 4: PRODUCTION BIDDING & TAILOR / MANUFACTURER ECOSYSTEM
// ============================================================================

export type ArtisanSpecialty =
  | 'ZARDOZI_EMBROIDERY'
  | 'MASTER_CANVAS_CUTTING'
  | 'LEHENGA_FLARED_CONSTRUCTION'
  | 'TUXEDO_BESPOKE'
  | 'CORSETRY_BONING'
  | 'AARI_THREADWORK'
  | 'SHERWANI_STRUCTURE'
  | 'HAND_ROLLED_BUTTONHOLES'
  | 'ZARDOZI'
  | 'MASTER_CUTTING'
  | 'TUXEDOS'
  | 'LEHENGAS'
  | 'CORSETRY';

// Alias for compatibility
export type ArtisanSpecialization = ArtisanSpecialty;

export interface ArtisanGalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  garmentCategory: GarmentCategory;
  technique: string;
}

export interface ArtisanPortfolioProfile {
  id: string;
  artisanId: string;
  workshopName: string;
  masterTailorName: string;
  avatarUrl: string;
  specialties: ArtisanSpecialty[];
  experienceYears: number;
  location: {
    city: string;
    state: string;
    country: string;
    hubZone: string; // e.g. "Kala Ghoda Craft Cluster"
  };
  monthlyCapacityGarments: number;
  activeOrdersCount: number;
  standardMinuteSamRateInr: number; // e.g. ₹42 - ₹65/min
  hourlyRateInr: number;
  verifiedBadge: boolean;
  rating: number;
  reviewsCount: number;
  completedBidsCount: number;
  onTimeDeliveryRatePercent: number;
  gallery: ArtisanGalleryItem[];
  certifications: string[];
}

export type BriefStatus =
  | 'DRAFT'
  | 'OPEN_FOR_BIDS'
  | 'BID_ACCEPTED'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProductionDesignBriefSpecifications {
  hasFullCanvas: boolean;
  embroideryLevel: 'none' | 'light' | 'medium' | 'heavy';
  trialFittingCount: number;
  liningDetails: string;
  interfacingDetails: string;
}

export interface ProductionDesignBrief {
  id: string;
  briefNumber: string; // e.g. "BRF-2026-089"
  atelierTenantId: string;
  atelierName: string;
  title: string;
  garmentCategory: GarmentCategory;
  batchQuantity: number;
  targetBudgetPerUnitInr: number;
  totalBudgetCeilingInr: number;
  targetDeliveryDate: string; // ISO Date
  deadlineForBids: string;
  fabricSuppliedByAtelier: boolean;
  techPackAssetId?: string;
  techPackUrl?: string;
  requiredSpecialties: ArtisanSpecialty[];
  specifications: ProductionDesignBriefSpecifications;
  status: BriefStatus;
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type BidStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface MilestoneProposalItem {
  stageIndex: number;
  milestoneName: string;
  daysFromStart: number;
  percentagePayout: number; // e.g. 20, 30, 30, 20 (sums to 100)
  deliverableDescription: string;
}

export interface TailorProductionBid {
  id: string;
  briefId: string;
  artisanId: string;
  artisanName: string;
  artisanWorkshopName: string;
  artisanAvatar: string;
  artisanRating: number;
  artisanSpecialties: ArtisanSpecialty[];
  bidAmountPerUnitInr: number;
  totalBidAmountInr: number;
  estimatedLeadTimeDays: number;
  milestonePlan: MilestoneProposalItem[];
  proposalNotes: string;
  sampleSwatchesOffered: boolean;
  status: BidStatus;
  submittedAt: string;
}

export type ContractEscrowStatus = 'HELD_IN_ESCROW' | 'PARTIAL_RELEASE' | 'FULLY_RELEASED' | 'DISPUTED';

export type ProductionMilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED_AND_PAID';

export interface ProductionContractMilestone {
  stageIndex: number;
  name: string;
  payoutAmountInr: number;
  percentagePayout: number;
  targetCompletionDate: string;
  status: ProductionMilestoneStatus;
  proofImages?: string[];
  artisanNotes?: string;
  atelierApprovalNotes?: string;
  approvedAt?: string;
}

// Alias for compatibility
export type EscrowMilestoneStage = ProductionContractMilestone;

export type ContractCurrentState =
  | 'CONTRACT_SIGNED'
  | 'MATERIALS_RECEIVED'
  | 'PATTERN_CUTTING'
  | 'SKELETON_TRIAL_INSPECTION'
  | 'EMBROIDERY_ASSEMBLY'
  | 'FINAL_QC'
  | 'DISPATCHED'
  | 'COMPLETED';

export interface ProductionContractRecord {
  id: string;
  contractNumber: string; // e.g. "CTR-2026-BRF089-01"
  briefId: string;
  briefTitle: string;
  acceptedBidId: string;
  atelierTenantId: string;
  atelierName: string;
  artisanId: string;
  artisanWorkshopName: string;
  totalContractAmountInr: number;
  escrowStatus: ContractEscrowStatus;
  milestones: ProductionContractMilestone[];
  currentState: ContractCurrentState;
  signedAt: string;
  completedAt?: string;
}

// ============================================================================
// LAYER 5: 3-MONTH FREE TRIAL ONBOARDING & STYLIST DIRECTORY ("REDHOUSE OS")
// ============================================================================

export type SubscriptionTierType = 'PURPLE_COGS_FREE_TRIAL' | 'ATELIER_PRO' | 'HAUTE_ENTERPRISE';

export interface TrialTierEntitlements {
  maxBlueprintsPerMonth: number;
  exportResolutionDpi: number; // 150 for trial, 300+ for Pro
  allowWatermarkFreeExports: boolean;
  allow1to1DxfExport: boolean;
  allowCommercialBuyoutMarketplace: boolean;
  maxTailorBidsPerMonth: number;
  stylistBookingFeeDiscountPercent: number;
}

export interface TenantTrialUsageCounters {
  blueprintsCreated: number;
  exportsGenerated: number;
  bidsSubmitted: number;
  stylistConsultationsBooked: number;
  machineHoursBooked: number;
}

export interface TenantTrialOnboardingProfile {
  tenantId: string;
  tenantName: string;
  tier: SubscriptionTierType;
  trialStartedAt: string; // ISO 8601
  trialExpiresAt: string; // trialStartedAt + 90 days
  daysRemaining: number;
  isTrialActive: boolean;
  entitlements: TrialTierEntitlements;
  usageCounters: TenantTrialUsageCounters;
}

export type StylistBadgeLevel = 'PURPLE_COGS_CERTIFIED' | 'MASTER_DRAPER' | 'TROUSSEAU_ARCHITECT';

export type StylistSpecialization =
  | 'BRIDAL_TROUSSEAU'
  | 'INDO_WESTERN_FUSION'
  | 'BESPOKE_SUITING_CONSULTANT'
  | 'ZARDOZI_MOTIF_CURATION'
  | 'COLOR_SEASONAL_ANALYSIS'
  | 'ROYAL_HERITAGE_DRAPING';

// Alias for compatibility
export type StylistSpecialty = StylistSpecialization;

export type ConsultationMode = 'IN_PERSON_ATELIER' | 'VIRTUAL_HD' | 'CLIENT_WARDROBE_VISIT';

export interface StylistPortfolioLook {
  id: string;
  title: string;
  imageUrl: string;
  occasion: string;
  garmentCategory: GarmentCategory;
}

export interface StylistWeeklySlot {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeSlots: string[]; // e.g. ["10:00 AM", "02:00 PM", "04:30 PM"]
}

export interface CertifiedStylistProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  title: string; // e.g. "Senior Bridal & Couture Draping Specialist"
  badge: StylistBadgeLevel;
  profileBio: string;
  experienceYears: number;
  location: {
    areaDistrict: string; // e.g. "Kala Ghoda / Colaba"
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  specializations: StylistSpecialization[];
  consultationModes: ConsultationMode[];
  hourlyFeeInr: number;
  rating: number;
  reviewsCount: number;
  consultationsCompletedCount: number;
  portfolioLooks: StylistPortfolioLook[];
  availableWeeklySlots: StylistWeeklySlot[];
}

export interface StylistConsultationBookingRecord {
  id: string;
  bookingNumber: string; // e.g. "STY-2026-042"
  stylistId: string;
  stylistName: string;
  stylistAvatar: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  garmentCategoryOfInterest: GarmentCategory;
  consultationMode: ConsultationMode;
  scheduledAt: string; // ISO 8601
  durationMinutes: number; // 60 or 90
  feeAmountInr: number;
  discountAppliedInr: number;
  totalPaidInr: number;
  paymentStatus: 'PAID' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  clientBriefNotes: string;
  stylistRecommendationNotes?: string;
  createdAt: string;
}
