/**
 * apps/web/src/lib/staff-utils.ts
 * Centralized Domain Logic, Types, and Utilities for YellowHouse Staff Management and Customer CRM
 *
 * Authoritative Invariants:
 * - 7 Platform Roles: SUPER_ADMIN, TENANT_OWNER, BRANCH_MANAGER, MASTER_TAILOR, RECEPTIONIST, KARIGAR, ACCOUNTANT
 * - 4-Tier VIP Hierarchy: Regular, VIP, Couture, Wedding
 * - Piece-rate artisan payroll strictly at ₹42/min rate
 * - CAD Studio Deep Linking: /measurements?customerId=...
 */

import { getLocalStorage, setLocalStorage } from './storage-utils';

// ============================================================
// 1. STAFF MANAGEMENT & 7 PLATFORM ROLES
// ============================================================

export const PLATFORM_ROLES_LIST = [
  'SUPER_ADMIN',
  'TENANT_OWNER',
  'BRANCH_MANAGER',
  'MASTER_TAILOR',
  'RECEPTIONIST',
  'KARIGAR',
  'ACCOUNTANT',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES_LIST)[number];
export type StaffRole = PlatformRole;

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave' | 'Pending';

export type SkillSpecialization =
  | 'Zardozi Embroidery'
  | 'Aari & Resham Work'
  | 'Pattern Drafting & CAD'
  | 'Bespoke Suit Canvassing'
  | 'Hand Stitching & Darts'
  | 'Lehenga Kali Construction'
  | 'Seam Finishing & Piping'
  | 'Fitting Trial & Alterations'
  | 'Fabric Cutting & Grain Alignment'
  | 'Quality Control & Audit';

export type WorkStation =
  | 'Cutting Table A'
  | 'Cutting Table B'
  | 'Embroidery Frame #1'
  | 'Embroidery Frame #2'
  | 'Sewing Station #1'
  | 'Sewing Station #2'
  | 'Finishing & Pressing'
  | 'Fitting Salon'
  | 'Front Reception'
  | 'Accounts Office';

export interface StaffPerformanceTelemetry {
  samEfficiencyPercent: number;     // e.g. 106% (standard allowed minutes performance)
  activeJobsCount: number;          // Active garment cards currently in progress
  completedOrdersThisMonth: number; // Completed garment pieces
  weeklyHoursLogged: number;        // Accumulated hours this week (e.g. 42h)
  weeklyHoursCapacity: number;      // Maximum planned capacity (e.g. 48h)
  pieceRateEarnedThisMonth: number; // Accrued earnings at ₹42/minute rate
  qualityPassRatePercent: number;   // First-trial pass rate (e.g. 99.2%)
}

export interface StaffMember {
  id: string;                       // e.g. "st-01"
  name: string;                     // Full name
  email: string;                    // Login & notification email
  phone?: string;                   // Contact phone
  role: PlatformRole;               // One of 7 platform roles
  branch: string;                   // e.g. "Main Flagship", "West End Salon"
  status: StaffStatus;              // 'Active' | 'Inactive' | 'On Leave' | 'Pending'
  hiredAt: string;                  // Date hired (YYYY-MM-DD)
  skills: SkillSpecialization[];    // Array of atelier craft specialties
  assignedStation?: WorkStation;    // Physical workstation allocation
  specialization?: string;          // Primary specialty summary
  workstation?: string;             // Workstation summary
  weeklyHours?: number;             // Standard weekly working hours
  weeklyCapacityHours: number;      // Standard weekly working hours capacity (default: 48)
  telemetry?: StaffPerformanceTelemetry;
  notes?: string;                   // Performance notes or certifications
}

export interface StaffFormDraft {
  name: string;
  email: string;
  phone?: string;
  role: PlatformRole;
  branch: string;
  skills: SkillSpecialization[];
  assignedStation: WorkStation;
  specialization?: string;
  workstation?: string;
  weeklyCapacityHours: number;
}

export interface RoleConfig {
  role: PlatformRole;
  label: string;
  description: string;
  badgeVariant: 'gold' | 'info' | 'warning' | 'success' | 'danger' | 'neutral';
  badgeClass: string;
}

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Global system administration, tenant governance, and security passkey audit',
    badgeVariant: 'gold',
    badgeClass: 'badge badge-gold',
  },
  {
    role: 'TENANT_OWNER',
    label: 'Atelier Owner',
    description: 'Proprietor with full salon governance, P&L analytics, and brand oversight',
    badgeVariant: 'gold',
    badgeClass: 'badge badge-gold',
  },
  {
    role: 'BRANCH_MANAGER',
    label: 'Branch Manager',
    description: 'Salon operations, daily job tickets, customer intake, and staff rosters',
    badgeVariant: 'info',
    badgeClass: 'badge badge-blue',
  },
  {
    role: 'MASTER_TAILOR',
    label: 'Master Tailor',
    description: 'Bespoke pattern drafting, 2D CAD calipers, fabric cutting, and trial QC',
    badgeVariant: 'warning',
    badgeClass: 'badge badge-amber',
  },
  {
    role: 'RECEPTIONIST',
    label: 'Receptionist',
    description: 'Client front desk, appointment scheduling, fabric deposits, and billing',
    badgeVariant: 'success',
    badgeClass: 'badge badge-emerald',
  },
  {
    role: 'KARIGAR',
    label: 'Karigar Artisan',
    description: 'Workshop floor artisan executing cutting, embroidery, and assembly stages',
    badgeVariant: 'danger',
    badgeClass: 'badge badge-rose',
  },
  {
    role: 'ACCOUNTANT',
    label: 'Accountant',
    description: 'Financial ledgers, piece-rate artisan payroll at ₹42/min, and GST accounts',
    badgeVariant: 'info',
    badgeClass: 'badge badge-blue',
  },
];

// Provide PLATFORM_ROLES both as an array of string roles (for validation) and as configs
export const PLATFORM_ROLES = PLATFORM_ROLES_LIST;

export const SKILL_SPECIALIZATIONS: SkillSpecialization[] = [
  'Zardozi Embroidery',
  'Aari & Resham Work',
  'Pattern Drafting & CAD',
  'Bespoke Suit Canvassing',
  'Hand Stitching & Darts',
  'Lehenga Kali Construction',
  'Seam Finishing & Piping',
  'Fitting Trial & Alterations',
  'Fabric Cutting & Grain Alignment',
  'Quality Control & Audit',
];

export const WORK_STATIONS: WorkStation[] = [
  'Cutting Table A',
  'Cutting Table B',
  'Embroidery Frame #1',
  'Embroidery Frame #2',
  'Sewing Station #1',
  'Sewing Station #2',
  'Finishing & Pressing',
  'Fitting Salon',
  'Front Reception',
  'Accounts Office',
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st-01',
    name: 'Master Latif Khan',
    email: 'latif.khan@yellowhouse.com',
    phone: '+91 98765 11001',
    role: 'MASTER_TAILOR',
    branch: 'Main Flagship',
    status: 'Active',
    hiredAt: '2026-01-15',
    specialization: 'Pattern Drafting & Canvassing',
    workstation: 'Cutting Table A',
    assignedStation: 'Cutting Table A',
    skills: [
      'Pattern Drafting & CAD',
      'Bespoke Suit Canvassing',
      'Fitting Trial & Alterations',
      'Fabric Cutting & Grain Alignment',
    ],
    weeklyHours: 48,
    weeklyCapacityHours: 48,
    telemetry: {
      samEfficiencyPercent: 114,
      activeJobsCount: 4,
      completedOrdersThisMonth: 18,
      weeklyHoursLogged: 44,
      weeklyHoursCapacity: 48,
      pieceRateEarnedThisMonth: 78500,
      qualityPassRatePercent: 99.5,
    },
    notes: 'Master cutter with 28 years Savile Row & Sherwani experience.',
  },
  {
    id: 'st-02',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@yellowhouse.com',
    phone: '+91 98765 11002',
    role: 'BRANCH_MANAGER',
    branch: 'Main Flagship',
    status: 'Active',
    hiredAt: '2026-02-10',
    specialization: 'Floor Supervision & Operations',
    workstation: 'Fitting Salon',
    assignedStation: 'Fitting Salon',
    skills: ['Quality Control & Audit', 'Fitting Trial & Alterations'],
    weeklyHours: 45,
    weeklyCapacityHours: 45,
    telemetry: {
      samEfficiencyPercent: 102,
      activeJobsCount: 12,
      completedOrdersThisMonth: 42,
      weeklyHoursLogged: 41,
      weeklyHoursCapacity: 45,
      pieceRateEarnedThisMonth: 0,
      qualityPassRatePercent: 98.8,
    },
    notes: 'Directs Main Flagship floor operations and high-value customer trials.',
  },
  {
    id: 'st-03',
    name: 'Rafi Craftsman',
    email: 'rafi.craftsman@yellowhouse.com',
    phone: '+91 98765 11003',
    role: 'KARIGAR',
    branch: 'Main Flagship',
    status: 'Active',
    hiredAt: '2026-03-01',
    specialization: 'Zardozi & Aari Embroidery',
    workstation: 'Embroidery Frame #1',
    assignedStation: 'Embroidery Frame #1',
    skills: ['Zardozi Embroidery', 'Aari & Resham Work', 'Hand Stitching & Darts'],
    weeklyHours: 48,
    weeklyCapacityHours: 48,
    telemetry: {
      samEfficiencyPercent: 108,
      activeJobsCount: 3,
      completedOrdersThisMonth: 12,
      weeklyHoursLogged: 46,
      weeklyHoursCapacity: 48,
      pieceRateEarnedThisMonth: 64200,
      qualityPassRatePercent: 99.1,
    },
    notes: 'Zardozi master craftsman specializing in bridal lehengas and royal crests.',
  },
  {
    id: 'st-04',
    name: 'Anik Dev',
    email: 'anik.dev@yellowhouse.com',
    phone: '+91 98765 11004',
    role: 'RECEPTIONIST',
    branch: 'West End Salon',
    status: 'Active',
    hiredAt: '2026-04-12',
    specialization: 'Front Desk & Client Intake',
    workstation: 'Front Reception',
    assignedStation: 'Front Reception',
    skills: ['Quality Control & Audit'],
    weeklyHours: 40,
    weeklyCapacityHours: 40,
    telemetry: {
      samEfficiencyPercent: 100,
      activeJobsCount: 0,
      completedOrdersThisMonth: 35,
      weeklyHoursLogged: 38,
      weeklyHoursCapacity: 40,
      pieceRateEarnedThisMonth: 0,
      qualityPassRatePercent: 100,
    },
    notes: 'Front desk coordinator managing VIP couture reception.',
  },
  {
    id: 'st-05',
    name: 'Priya Mehta',
    email: 'priya.mehta@yellowhouse.com',
    phone: '+91 98765 11005',
    role: 'ACCOUNTANT',
    branch: 'Main Flagship',
    status: 'Pending',
    hiredAt: '2026-05-01',
    specialization: 'Artisan Payroll & Ledger',
    workstation: 'Accounts Office',
    assignedStation: 'Accounts Office',
    skills: ['Quality Control & Audit'],
    weeklyHours: 40,
    weeklyCapacityHours: 40,
    telemetry: {
      samEfficiencyPercent: 100,
      activeJobsCount: 0,
      completedOrdersThisMonth: 0,
      weeklyHoursLogged: 40,
      weeklyHoursCapacity: 40,
      pieceRateEarnedThisMonth: 0,
      qualityPassRatePercent: 100,
    },
    notes: 'Manages invoicing, artisan piece-rate disbursements, and supplier settlements.',
  },
  {
    id: 'st-06',
    name: 'Vikramaditya Oberoi',
    email: 'owner@yellowhouse.com',
    phone: '+91 98765 11006',
    role: 'TENANT_OWNER',
    branch: 'Main Flagship',
    status: 'Active',
    hiredAt: '2025-11-01',
    specialization: 'Atelier Direction & Strategy',
    workstation: 'Fitting Salon',
    assignedStation: 'Fitting Salon',
    skills: ['Quality Control & Audit', 'Pattern Drafting & CAD'],
    weeklyHours: 50,
    weeklyCapacityHours: 50,
    telemetry: {
      samEfficiencyPercent: 105,
      activeJobsCount: 8,
      completedOrdersThisMonth: 50,
      weeklyHoursLogged: 48,
      weeklyHoursCapacity: 50,
      pieceRateEarnedThisMonth: 0,
      qualityPassRatePercent: 99.8,
    },
    notes: 'Atelier founder and creative director.',
  },
  {
    id: 'st-07',
    name: 'System Security Admin',
    email: 'admin@yellowhouse.com',
    phone: '+91 98765 11007',
    role: 'SUPER_ADMIN',
    branch: 'Global HQ',
    status: 'Active',
    hiredAt: '2025-10-01',
    specialization: 'Platform Security & Audit',
    workstation: 'Accounts Office',
    assignedStation: 'Accounts Office',
    skills: ['Quality Control & Audit'],
    weeklyHours: 40,
    weeklyCapacityHours: 40,
    telemetry: {
      samEfficiencyPercent: 100,
      activeJobsCount: 0,
      completedOrdersThisMonth: 0,
      weeklyHoursLogged: 40,
      weeklyHoursCapacity: 40,
      pieceRateEarnedThisMonth: 0,
      qualityPassRatePercent: 100,
    },
    notes: 'Master security operator managing multi-branch passkey encryption.',
  },
];

/**
 * Validates that a string is one of the authoritative 7 platform roles.
 */
export function isValidPlatformRole(role: string): role is PlatformRole {
  return (PLATFORM_ROLES_LIST as readonly string[]).includes(role);
}

/**
 * Maps staff roles to Apple HIG badge design system classes.
 */
export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'TENANT_OWNER':
      return 'badge badge-gold';
    case 'BRANCH_MANAGER':
    case 'ACCOUNTANT':
      return 'badge badge-blue';
    case 'MASTER_TAILOR':
      return 'badge badge-amber';
    case 'RECEPTIONIST':
      return 'badge badge-emerald';
    case 'KARIGAR':
      return 'badge badge-rose';
    default:
      return 'badge badge-neutral';
  }
}

export function getRoleBadgeVariant(role: string): 'gold' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' {
  const match = ROLE_CONFIGS.find((r) => r.role === role);
  return match ? match.badgeVariant : 'neutral';
}

export function getStatusBadgeVariant(status: StaffStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'neutral';
    case 'On Leave':
    case 'Pending':
      return 'warning';
    default:
      return 'neutral';
  }
}

// ============================================================
// 2. CUSTOMER CRM DOMAIN LOGIC & 4-TIER VIP HIERARCHY
// ============================================================

export type VIPTier = 'Regular' | 'VIP' | 'Couture' | 'Wedding';

export interface Customer {
  id: string;                         // e.g. "CUST-001"
  name: string;                       // Full name
  phone: string;                      // E.164 or formatted: "+91 98765 43210"
  email?: string;                     // Optional email
  gender: 'Men' | 'Women' | 'Unisex'; // Target body morphology
  preferredFit: 'Slim Bespoke' | 'Slim' | 'Regular' | 'Relaxed';
  vipTier: VIPTier;                   // 'Regular' | 'VIP' | 'Couture' | 'Wedding'
  isVip: boolean;                     // Backward-compatibility flag (true if vipTier !== 'Regular')
  totalOrders: number;                // Lifetime order count
  totalSpend: number;                 // Total invoiced amount in INR
  outstandingBalance: number;         // Pending balance in INR
  tags: string[];                     // e.g. ["Bridal", "Bespoke Suiting", "High Value"]
  measurementsCount: number;          // Number of saved CAD snapshot versions
  activeMeasurementId?: string;       // Linked snapshot version ID (e.g. "v3")
  latestSnapshotDate?: string;        // Formatted date of last CAD caliper update
  lastVisit: string;                  // e.g. "Today", "2 days ago", "1 week ago"
  initials: string;                   // e.g. "RM"
  notes?: string;                     // Bespoke tailoring & posture observations
  address?: string;                   // Physical delivery or fitting address
  city?: string;                      // Metropolitan salon branch area
  createdAt: string;                  // ISO 8601 creation timestamp
}

export interface CustomerFilterOptions {
  query?: string;
  searchQuery?: string;
  gender?: 'All' | 'Men' | 'Women';
  vipOnly?: boolean;
  vipTier?: 'ALL' | VIPTier;
  balanceStatus?: 'ALL' | 'OUTSTANDING' | 'SETTLED';
  tag?: string;
  sortBy?: 'RECENT' | 'SPEND_DESC' | 'ORDERS_DESC' | 'NAME_ASC';
}

export type CustomerFilterState = CustomerFilterOptions;

export interface CustomerStats {
  total: number;
  vip: number;
  couture: number;
  wedding: number;
  men: number;
  women: number;
  totalLifetimeRevenue: number;
  totalOutstandingBalance: number;
}

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Rajeshwar Malhotra',
    phone: '+91 98765 43210',
    email: 'rajeshwar.m@example.com',
    gender: 'Men',
    preferredFit: 'Slim Bespoke',
    vipTier: 'Couture',
    isVip: true,
    totalOrders: 6,
    totalSpend: 185000,
    outstandingBalance: 22500,
    tags: ['Bespoke Suiting', 'Sherwani Specialist', 'High Value'],
    measurementsCount: 3,
    activeMeasurementId: 'v3',
    latestSnapshotDate: 'Aug 5, 2026',
    lastVisit: '2 days ago',
    initials: 'RM',
    city: 'South Extension, New Delhi',
    createdAt: '2026-01-10',
    notes: 'Prefers English cut jackets with high armholes, 4-button working surgeon cuffs.',
  },
  {
    id: 'CUST-002',
    name: 'Ananya Sharma',
    phone: '+91 98765 43211',
    email: 'ananya.s@example.com',
    gender: 'Women',
    preferredFit: 'Regular',
    vipTier: 'Wedding',
    isVip: true,
    totalOrders: 4,
    totalSpend: 240000,
    outstandingBalance: 34000,
    tags: ['Bridal', 'High Value', 'Urgent Fitting'],
    measurementsCount: 5,
    activeMeasurementId: 'v5',
    latestSnapshotDate: 'Aug 1, 2026',
    lastVisit: '1 day ago',
    initials: 'AS',
    city: 'Juhu, Mumbai',
    createdAt: '2026-02-14',
    notes: 'Silk blouse waistline preference +1.5 inch ease. 24-kali flared bridal lehenga.',
  },
  {
    id: 'CUST-003',
    name: 'Vikram Singh',
    phone: '+91 98765 43212',
    email: 'vikram.singh@example.com',
    gender: 'Men',
    preferredFit: 'Regular',
    vipTier: 'Regular',
    isVip: false,
    totalOrders: 2,
    totalSpend: 62000,
    outstandingBalance: 0,
    tags: ['Bespoke Suiting'],
    measurementsCount: 1,
    activeMeasurementId: 'v1',
    latestSnapshotDate: 'Jul 15, 2026',
    lastVisit: '1 week ago',
    initials: 'VS',
    city: 'Defence Colony, New Delhi',
    createdAt: '2026-03-01',
    notes: 'Classic two-piece suit fit, double pleated trousers.',
  },
  {
    id: 'CUST-004',
    name: 'Priya Patel',
    phone: '+91 98765 43213',
    email: 'priya.patel@example.com',
    gender: 'Women',
    preferredFit: 'Slim',
    vipTier: 'VIP',
    isVip: true,
    totalOrders: 5,
    totalSpend: 95000,
    outstandingBalance: 0,
    tags: ['Frequent Alteration', 'Corset Blouse'],
    measurementsCount: 2,
    activeMeasurementId: 'v2',
    latestSnapshotDate: 'Jul 28, 2026',
    lastVisit: '3 days ago',
    initials: 'PP',
    city: 'Bandra West, Mumbai',
    createdAt: '2026-03-20',
    notes: 'Contour darts required on all fitted lehengas and corset blouses.',
  },
  {
    id: 'CUST-005',
    name: 'Mohammed Farooq',
    phone: '+91 98765 43214',
    email: 'm.farooq@example.com',
    gender: 'Men',
    preferredFit: 'Relaxed',
    vipTier: 'Regular',
    isVip: false,
    totalOrders: 1,
    totalSpend: 42000,
    outstandingBalance: 42000,
    tags: ['Ethnic Wear'],
    measurementsCount: 1,
    activeMeasurementId: 'v1',
    latestSnapshotDate: 'Aug 5, 2026',
    lastVisit: '2 weeks ago',
    initials: 'MF',
    city: 'Banjara Hills, Hyderabad',
    createdAt: '2026-04-10',
    notes: 'Kurta pajama set specialist fit with 2-inch side ease.',
  },
  {
    id: 'CUST-006',
    name: 'Deepika Nair',
    phone: '+91 98765 43215',
    email: 'deepika.nair@example.com',
    gender: 'Women',
    preferredFit: 'Regular',
    vipTier: 'Wedding',
    isVip: true,
    totalOrders: 3,
    totalSpend: 165000,
    outstandingBalance: 0,
    tags: ['Bridal', 'High Value'],
    measurementsCount: 4,
    activeMeasurementId: 'v4',
    latestSnapshotDate: 'Aug 10, 2026',
    lastVisit: 'Today',
    initials: 'DN',
    city: 'Indiranagar, Bengaluru',
    createdAt: '2026-05-02',
    notes: 'VIP bridal consultation client; floor length Anarkali trials completed.',
  },
  {
    id: 'CUST-007',
    name: 'Arjun Kapoor',
    phone: '+91 98765 43216',
    email: 'arjun.k@example.com',
    gender: 'Men',
    preferredFit: 'Slim Bespoke',
    vipTier: 'VIP',
    isVip: true,
    totalOrders: 4,
    totalSpend: 110000,
    outstandingBalance: 7500,
    tags: ['Bespoke Suiting', 'Bespoke Shirts'],
    measurementsCount: 2,
    activeMeasurementId: 'v2',
    latestSnapshotDate: 'Aug 4, 2026',
    lastVisit: '5 days ago',
    initials: 'AK',
    city: 'Koregaon Park, Pune',
    createdAt: '2026-05-18',
    notes: 'Double-breasted blazer specifications with wide peak lapels.',
  },
  {
    id: 'CUST-008',
    name: 'Meera Reddy',
    phone: '+91 98765 43217',
    email: 'meera.reddy@example.com',
    gender: 'Women',
    preferredFit: 'Slim',
    vipTier: 'Couture',
    isVip: true,
    totalOrders: 3,
    totalSpend: 145000,
    outstandingBalance: 0,
    tags: ['High Value', 'Corset Blouse', 'Urgent Fitting'],
    measurementsCount: 1,
    activeMeasurementId: 'v1',
    latestSnapshotDate: 'Aug 2, 2026',
    lastVisit: '1 week ago',
    initials: 'MR',
    city: 'Alwarpet, Chennai',
    createdAt: '2026-06-01',
    notes: 'Anarkali flared trial pending; structured boning for corset blouse.',
  },
];

export const AVAILABLE_CUSTOMER_TAGS: string[] = [
  'Bridal',
  'Bespoke Suiting',
  'Sherwani Specialist',
  'High Value',
  'Urgent Fitting',
  'Frequent Alteration',
  'Corset Blouse',
  'Ethnic Wear',
];

export function getVipTierBadgeVariant(tier: VIPTier): 'gold' | 'rose' | 'warning' | 'neutral' {
  switch (tier) {
    case 'Couture':
      return 'gold';
    case 'Wedding':
      return 'rose';
    case 'VIP':
      return 'warning';
    case 'Regular':
    default:
      return 'neutral';
  }
}

export function computeCustomerStats(customers: Customer[]): CustomerStats {
  return {
    total: customers.length,
    vip: customers.filter((c) => c.vipTier === 'VIP').length,
    couture: customers.filter((c) => c.vipTier === 'Couture').length,
    wedding: customers.filter((c) => c.vipTier === 'Wedding').length,
    men: customers.filter((c) => c.gender === 'Men').length,
    women: customers.filter((c) => c.gender === 'Women').length,
    totalLifetimeRevenue: customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0),
    totalOutstandingBalance: customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0),
  };
}

/**
 * Multi-facet filtering engine for Customer CRM.
 * Supports keyword search, gender, VIP tier, balance status, tags, and sorting.
 */
export function filterCustomers(
  customers: Customer[],
  options: CustomerFilterOptions = {}
): Customer[] {
  const {
    query = '',
    searchQuery = '',
    gender = 'All',
    vipOnly = false,
    vipTier = 'ALL',
    balanceStatus = 'ALL',
    tag = '',
    sortBy = 'RECENT',
  } = options;

  const rawQuery = (searchQuery || query).trim().toLowerCase();

  return customers
    .filter((c) => {
      // 1. Keyword search (Name, Phone, Email, ID)
      if (rawQuery) {
        const nameMatch = (c.name || '').toLowerCase().includes(rawQuery);
        const phoneMatch = (c.phone || '').toLowerCase().includes(rawQuery);
        const idMatch = (c.id || '').toLowerCase().includes(rawQuery);
        const emailMatch = c.email ? c.email.toLowerCase().includes(rawQuery) : false;
        if (!nameMatch && !phoneMatch && !idMatch && !emailMatch) {
          return false;
        }
      }

      // 2. Gender morphology
      if (gender !== 'All' && c.gender !== gender) {
        return false;
      }

      // 3. VIP boolean toggle
      if (vipOnly && !c.isVip) {
        return false;
      }

      // 4. 4-tier VIP hierarchy
      if (vipTier && vipTier !== 'ALL' && c.vipTier !== vipTier) {
        return false;
      }

      // 5. Balance status
      if (balanceStatus === 'OUTSTANDING' && (c.outstandingBalance || 0) <= 0) {
        return false;
      }
      if (balanceStatus === 'SETTLED' && (c.outstandingBalance || 0) > 0) {
        return false;
      }

      // 6. Tag filter
      if (tag && (!c.tags || !c.tags.includes(tag))) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'SPEND_DESC':
          return (b.totalSpend || 0) - (a.totalSpend || 0);
        case 'ORDERS_DESC':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'NAME_ASC':
          return a.name.localeCompare(b.name);
        case 'RECENT':
        default:
          return new Date(b.createdAt || '2026-01-01').getTime() - new Date(a.createdAt || '2026-01-01').getTime();
      }
    });
}

/**
 * Builds the URL link to 2D CAD studio for a specific customer profile.
 */
export function buildCustomerCadLink(customerId: string): string {
  return `/measurements?customerId=${encodeURIComponent(customerId)}`;
}

/**
 * Filters measurement snapshot records by customerId for isolated profile rendering.
 */
export function filterSnapshotsForCustomer<T extends { customerId?: string; clientId?: string }>(
  snapshots: T[],
  customerId: string
): T[] {
  if (!customerId) return [];
  return snapshots.filter((s) => s.customerId === customerId || s.clientId === customerId);
}
