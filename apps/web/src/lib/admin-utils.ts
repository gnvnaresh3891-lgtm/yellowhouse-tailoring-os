/**
 * YellowHouse Tailoring OS — Admin Security Console & Multi-Tenant Management
 * Pure Domain Models, Mathematical Aggregators, RBAC Verification & Utilities.
 *
 * Authoritative Specifications:
 * - PROJECT.md § Milestone 5 & RBAC / Security Invariants
 * - ORIGINAL_REQUEST.md § R1 (Multi-Tenant RBAC & Admin Security Hardening)
 */

export type TenantPlan = 'Enterprise' | 'Pro' | 'Starter';
export type TenantStatus = 'Active' | 'Suspended';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  staffCount: number;
  orders: number;
  mrr: string;
  mrrValue: number;
  owner: string;
  location: string;
  joinedDate: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityName: string;
  reason: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN';
  tenant: {
    id: string;
    name: string;
    code: string;
  };
  loggedInAt: string;
}

export interface PlanDistribution {
  plan: TenantPlan;
  count: number;
  percentage: number;
  color: string;
  badgeClass: string;
}

export interface TenantStats {
  totalTenantsCount: number;
  activeSubsCount: number;
  suspendedSubsCount: number;
  monthlyRevenueVal: number;
  monthlyRevenueStr: string;
  totalOrdersVal: number;
  totalOrdersStr: string;
  karigarPoolCount: number;
  systemUptimeStr: string;
  avgMrrPerTenantVal: number;
  avgMrrPerTenantStr: string;
  distributionData: PlanDistribution[];
}

// Master passkeys accepted by the security challenge
export const MASTER_ADMIN_PASSKEYS: readonly string[] = [
  'yh-admin-2026',
  'admin123',
  'yellowhouse@admin',
] as const;

// Standard Monthly Recurring Revenue (MRR) per tier in INR
export const PLAN_PRICING: Record<TenantPlan, number> = {
  Enterprise: 45000,
  Pro: 25000,
  Starter: 5000,
};

export const DEFAULT_ADMIN_USER: AdminUser = {
  id: 'usr_sysadmin_internal',
  name: 'Platform Administrator',
  email: 'admin@yellowhouse.com',
  role: 'SUPER_ADMIN',
  tenant: {
    id: 'tenant-global-sys',
    name: 'YellowHouse Platform HQ',
    code: 'GLOBAL-HQ',
  },
  loggedInAt: '2026-09-15T00:00:00.000Z',
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 't-1',
    name: 'Royal Silhouette Atelier',
    slug: 'royal-silhouette',
    plan: 'Enterprise',
    status: 'Active',
    staffCount: 12,
    orders: 342,
    mrr: '₹45,000',
    mrrValue: 45000,
    owner: 'Vikramaditya R.',
    location: 'New Delhi',
    joinedDate: 'Jan 2024',
  },
  {
    id: 't-2',
    name: 'Maharani Couture House',
    slug: 'maharani-couture',
    plan: 'Pro',
    status: 'Active',
    staffCount: 8,
    orders: 215,
    mrr: '₹25,000',
    mrrValue: 25000,
    owner: 'Sunita Rao',
    location: 'Jaipur',
    joinedDate: 'Mar 2024',
  },
  {
    id: 't-3',
    name: "Nawab's Bespoke",
    slug: 'nawabs-bespoke',
    plan: 'Pro',
    status: 'Active',
    staffCount: 6,
    orders: 178,
    mrr: '₹25,000',
    mrrValue: 25000,
    owner: 'Tariq Nawab',
    location: 'Lucknow',
    joinedDate: 'Apr 2024',
  },
  {
    id: 't-4',
    name: 'Silk Thread Studio',
    slug: 'silk-thread',
    plan: 'Starter',
    status: 'Active',
    staffCount: 3,
    orders: 89,
    mrr: '₹5,000',
    mrrValue: 5000,
    owner: 'Ananya Sharma',
    location: 'Bengaluru',
    joinedDate: 'May 2024',
  },
  {
    id: 't-5',
    name: 'Zari & Zardozi Works',
    slug: 'zari-zardozi',
    plan: 'Pro',
    status: 'Suspended',
    staffCount: 5,
    orders: 134,
    mrr: '₹0',
    mrrValue: 0,
    owner: 'Farooq Ali',
    location: 'Hyderabad',
    joinedDate: 'Feb 2024',
  },
  {
    id: 't-6',
    name: 'Golden Needle Tailors',
    slug: 'golden-needle',
    plan: 'Starter',
    status: 'Active',
    staffCount: 2,
    orders: 45,
    mrr: '₹5,000',
    mrrValue: 5000,
    owner: 'Ramesh Kumar',
    location: 'Mumbai',
    joinedDate: 'Jun 2024',
  },
];

/**
 * Format an integer or float into Indian Rupee representation (e.g. ₹45,000)
 */
export function formatInrCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Verify whether an admin passkey matches platform security keys
 */
export function isMasterPasskeyValid(passkey: string): boolean {
  if (!passkey || typeof passkey !== 'string') return false;
  const trimmed = passkey.trim();
  return (MASTER_ADMIN_PASSKEYS as readonly string[]).includes(trimmed);
}

/**
 * Execute admin authentication challenge
 */
export function verifyMasterPasskey(passkey: string): {
  success: boolean;
  user?: AdminUser;
  error?: string;
} {
  if (!passkey || typeof passkey !== 'string' || !passkey.trim()) {
    return {
      success: false,
      error: 'Please enter the administrative master passkey.',
    };
  }

  if (isMasterPasskeyValid(passkey)) {
    const adminUser: AdminUser = {
      ...DEFAULT_ADMIN_USER,
      loggedInAt: new Date().toISOString(),
    };
    return {
      success: true,
      user: adminUser,
    };
  }

  return {
    success: false,
    error: 'Invalid administrative passkey. Access restricted to authorized platform personnel.',
  };
}

/**
 * Check whether a given user object possesses administrative role
 */
export function isSuperAdminUser(user: any): boolean {
  if (!user || typeof user !== 'object') return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN';
}

/**
 * Filter tenant directory by search query, subscription plan, and active status
 */
export function filterTenants(
  tenants: Tenant[],
  searchTerm: string = '',
  planFilter: string = 'All',
  statusFilter: string = 'All'
): Tenant[] {
  if (!Array.isArray(tenants)) return [];

  const query = searchTerm.trim().toLowerCase();

  return tenants.filter((t) => {
    const matchesSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      t.slug.toLowerCase().includes(query) ||
      t.owner.toLowerCase().includes(query) ||
      t.location.toLowerCase().includes(query);

    const matchesPlan = planFilter === 'All' || t.plan === planFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });
}

/**
 * Compute global tenant telemetry, revenue, and distribution
 */
export function computeTenantStats(tenants: Tenant[]): TenantStats {
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return {
      totalTenantsCount: 0,
      activeSubsCount: 0,
      suspendedSubsCount: 0,
      monthlyRevenueVal: 0,
      monthlyRevenueStr: '₹0',
      totalOrdersVal: 0,
      totalOrdersStr: '0',
      karigarPoolCount: 0,
      systemUptimeStr: '99.97%',
      avgMrrPerTenantVal: 0,
      avgMrrPerTenantStr: '₹0',
      distributionData: [
        { plan: 'Pro', count: 0, percentage: 0, color: 'bg-blue-500', badgeClass: 'badge-info' },
        { plan: 'Starter', count: 0, percentage: 0, color: 'bg-amber-500', badgeClass: 'badge-warning' },
        { plan: 'Enterprise', count: 0, percentage: 0, color: 'bg-yellow-500', badgeClass: 'badge-gold' },
      ],
    };
  }

  const total = tenants.length;
  const activeCount = tenants.filter((t) => t.status === 'Active').length;
  const suspendedCount = total - activeCount;

  // Revenue is summed only from Active tenants
  const revenue = tenants.reduce((acc, t) => {
    return acc + (t.status === 'Active' ? t.mrrValue : 0);
  }, 0);

  const totalOrders = tenants.reduce((acc, t) => acc + (t.orders || 0), 0);
  const totalStaff = tenants.reduce((acc, t) => acc + (t.staffCount || 0), 0);

  const proCount = tenants.filter((t) => t.plan === 'Pro').length;
  const starterCount = tenants.filter((t) => t.plan === 'Starter').length;
  const enterpriseCount = tenants.filter((t) => t.plan === 'Enterprise').length;

  const avgMrr = total > 0 ? Math.round(revenue / total) : 0;

  return {
    totalTenantsCount: total,
    activeSubsCount: activeCount,
    suspendedSubsCount: suspendedCount,
    monthlyRevenueVal: revenue,
    monthlyRevenueStr: formatInrCurrency(revenue),
    totalOrdersVal: totalOrders,
    totalOrdersStr: totalOrders.toLocaleString('en-IN'),
    karigarPoolCount: totalStaff,
    systemUptimeStr: '99.97%',
    avgMrrPerTenantVal: avgMrr,
    avgMrrPerTenantStr: formatInrCurrency(avgMrr),
    distributionData: [
      {
        plan: 'Pro',
        count: proCount,
        percentage: total > 0 ? Math.round((proCount / total) * 100) : 0,
        color: 'bg-blue-500',
        badgeClass: 'badge-info',
      },
      {
        plan: 'Starter',
        count: starterCount,
        percentage: total > 0 ? Math.round((starterCount / total) * 100) : 0,
        color: 'bg-amber-500',
        badgeClass: 'badge-warning',
      },
      {
        plan: 'Enterprise',
        count: enterpriseCount,
        percentage: total > 0 ? Math.round((enterpriseCount / total) * 100) : 0,
        color: 'bg-yellow-500',
        badgeClass: 'badge-gold',
      },
    ],
  };
}

/**
 * Toggle tenant operational status between Active and Suspended
 */
export function toggleTenantStatus(
  tenants: Tenant[],
  tenantId: string
): { updatedTenants: Tenant[]; affectedTenant?: Tenant; newStatus?: TenantStatus } {
  let affectedTenant: Tenant | undefined;
  let newStatus: TenantStatus | undefined;

  const updatedTenants = tenants.map((t) => {
    if (t.id === tenantId) {
      const toggledStatus: TenantStatus = t.status === 'Active' ? 'Suspended' : 'Active';
      const mrrVal = toggledStatus === 'Suspended' ? 0 : PLAN_PRICING[t.plan] || 0;
      const mrrStr = formatInrCurrency(mrrVal);

      affectedTenant = {
        ...t,
        status: toggledStatus,
        mrr: mrrStr,
        mrrValue: mrrVal,
      };
      newStatus = toggledStatus;
      return affectedTenant;
    }
    return t;
  });

  return { updatedTenants, affectedTenant, newStatus };
}

/**
 * Onboard and provision a new boutique atelier tenant
 */
export function createNewTenant(params: {
  name: string;
  slug: string;
  plan: TenantPlan;
  owner?: string;
  location?: string;
  staffCount?: number;
}): Tenant {
  const plan = params.plan || 'Pro';
  const mrrVal = PLAN_PRICING[plan] || 25000;
  const mrrStr = formatInrCurrency(mrrVal);
  const cleanSlug = (params.slug || params.name || 'atelier')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: params.name.trim(),
    slug: cleanSlug,
    plan,
    status: 'Active',
    staffCount: Math.max(1, params.staffCount || 5),
    orders: 0,
    mrr: mrrStr,
    mrrValue: mrrVal,
    owner: params.owner?.trim() || 'Atelier Master',
    location: params.location?.trim() || 'India',
    joinedDate: 'Just Now',
  };
}

/**
 * Aggregate soft-deleted records from orders, customers, and jobs logs into a unified timeline
 */
export function aggregateAuditLogs(
  deletedOrders: any[] = [],
  deletedCustomers: any[] = [],
  deletedJobs: any[] = []
): AuditLog[] {
  const safeOrders = Array.isArray(deletedOrders) ? deletedOrders : [];
  const safeCustomers = Array.isArray(deletedCustomers) ? deletedCustomers : [];
  const safeJobs = Array.isArray(deletedJobs) ? deletedJobs : [];

  const combined: AuditLog[] = [
    ...safeOrders.map((l: any, idx: number) => ({
      id: l.id || `ord-${idx}-${Date.now()}`,
      action: l.action || 'DELETE_ORDER',
      entity: 'Order',
      entityName: l.orderNumber || l.customerName || l.id || 'Unknown Order',
      reason: l.reason || 'Soft-deleted by atelier operator',
      timestamp: l.timestamp || l.deletedAt || new Date().toISOString(),
    })),
    ...safeCustomers.map((l: any, idx: number) => ({
      id: l.id || `cust-${idx}-${Date.now()}`,
      action: l.action || 'DELETE_CUSTOMER',
      entity: 'Customer',
      entityName: l.customerName || l.fullName || l.name || l.id || 'Unknown Customer',
      reason: l.reason || 'Customer record archived',
      timestamp: l.timestamp || l.deletedAt || new Date().toISOString(),
    })),
    ...safeJobs.map((l: any, idx: number) => ({
      id: l.id || `job-${idx}-${Date.now()}`,
      action: l.action || 'DELETE_JOB',
      entity: 'Job',
      entityName: l.jobTitle || l.garmentType || l.id || 'Unknown Job Ticket',
      reason: l.reason || 'Job ticket removed from floor',
      timestamp: l.timestamp || l.deletedAt || new Date().toISOString(),
    })),
  ];

  // Sort descending: latest first
  combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return combined;
}

/**
 * Generate CSV representation of audit logs
 */
export function generateAuditCsv(logs: AuditLog[]): string {
  const headers = ['ID', 'Timestamp', 'Action', 'Entity', 'Entity Name', 'Reason'];
  const rows = (logs || []).map((l) => [
    l.id,
    new Date(l.timestamp).toLocaleString('en-IN'),
    l.action,
    l.entity,
    `"${(l.entityName || '').replace(/"/g, '""')}"`,
    `"${(l.reason || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
