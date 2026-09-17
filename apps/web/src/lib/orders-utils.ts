/**
 * YellowHouse Tailoring OS — Orders & Dynamic BOM Utilities
 * Types, presets, fabric SKU generators, BOM templates, state transitions, and dashboard telemetry.
 */

import { isOrderOverdue, computeDaysOverdue } from './date-utils';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'CUTTING'
  | 'IN_PRODUCTION'
  | 'TRIAL_FITTING'
  | 'QC_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface BOMItem {
  id: string;
  name: string;
  category: 'thread' | 'zipper' | 'button' | 'lining' | 'canvas' | 'lace' | 'hook' | 'piping' | 'fabric' | 'other';
  quantity: number;
  unit: string;
  unitCost: number;
  isOptional?: boolean;
  isCustomerProvided?: boolean;
  receivedDate?: string;
}

export interface OrderItemRow {
  id: string;
  garmentType: string;
  fabricSku: string;
  fabricMeters: number;
  unitPrice: number;
  fabricImage?: string;
  liningImage?: string;
  materialNotes?: string;
  isCustomerFabric?: boolean;
  customerFabricNotes?: string;
  bomItems?: BOMItem[];
  linkedPomId?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  clientName: string;
  clientPhone: string;
  garmentSummary: string;
  itemCount: number;
  status: OrderStatus;
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus?: 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
  dueDate: string;
  rawDueDate?: string;
  createdAt: string;
  isUrgent?: boolean;
  items?: OrderItemRow[];
  notes?: string;
  pomSnapshotLinked?: boolean;
  daysOverdue?: number;
}

export interface OrderFormDraft {
  selectedClientId: string;
  dueDate: string;
  notes: string;
  advanceAmount?: number;
  items: OrderItemRow[];
  updatedAt: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  isVip: boolean;
}

export interface GarmentOption {
  label: string;
  value: string;
  defaultMeters: number;
  defaultPrice: number;
  skuPrefix: string;
  boltWidth?: number;
  bufferNote?: string;
}

export type GarmentOptionPreset = GarmentOption;

export const initialOrders: Order[] = [
  {
    id: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    clientPhone: '+91 98765 43210',
    garmentSummary: 'Sherwani + Churidar',
    itemCount: 2,
    status: 'IN_PRODUCTION',
    totalAmount: 45000,
    advanceAmount: 22500,
    dueDate: 'Aug 15',
    createdAt: '2026-08-01',
    isUrgent: true,
    pomSnapshotLinked: true
  },
  {
    id: '#YH-9018',
    clientName: 'Ananya Sharma',
    clientPhone: '+91 98765 43211',
    garmentSummary: 'Lehenga Choli',
    itemCount: 1,
    status: 'TRIAL_FITTING',
    totalAmount: 68000,
    advanceAmount: 34000,
    dueDate: 'Aug 12',
    createdAt: '2026-07-28',
    isUrgent: true,
    pomSnapshotLinked: true
  },
  {
    id: '#YH-8994',
    clientName: 'Priya Patel',
    clientPhone: '+91 98765 43213',
    garmentSummary: 'Sari Blouse (x3)',
    itemCount: 3,
    status: 'QC_CHECK',
    totalAmount: 12000,
    advanceAmount: 12000,
    dueDate: 'Aug 10',
    createdAt: '2026-07-25',
    pomSnapshotLinked: true
  },
  {
    id: '#YH-9025',
    clientName: 'Vikram Singh',
    clientPhone: '+91 98765 43212',
    garmentSummary: '3-Piece Suit',
    itemCount: 1,
    status: 'CUTTING',
    totalAmount: 35000,
    advanceAmount: 15000,
    dueDate: 'Aug 20',
    createdAt: '2026-08-03'
  },
  {
    id: '#YH-9030',
    clientName: 'Deepika Nair',
    clientPhone: '+91 98765 43215',
    garmentSummary: 'Anarkali Gown',
    itemCount: 1,
    status: 'DELIVERED',
    totalAmount: 28000,
    advanceAmount: 28000,
    dueDate: 'Aug 5',
    createdAt: '2026-07-20'
  },
  {
    id: '#YH-9033',
    clientName: 'Mohammed Farooq',
    clientPhone: '+91 98765 43214',
    garmentSummary: 'Bandhgala + Trouser',
    itemCount: 2,
    status: 'DRAFT',
    totalAmount: 42000,
    advanceAmount: 0,
    dueDate: 'Aug 25',
    createdAt: '2026-08-05'
  },
  {
    id: '#YH-9035',
    clientName: 'Arjun Kapoor',
    clientPhone: '+91 98765 43216',
    garmentSummary: 'Bespoke Shirt (x5)',
    itemCount: 5,
    status: 'CONFIRMED',
    totalAmount: 15000,
    advanceAmount: 7500,
    dueDate: 'Aug 18',
    createdAt: '2026-08-04'
  },
  {
    id: '#YH-9038',
    clientName: 'Meera Reddy',
    clientPhone: '+91 98765 43217',
    garmentSummary: 'Corset Blouse',
    itemCount: 1,
    status: 'READY_FOR_DELIVERY',
    totalAmount: 22000,
    advanceAmount: 22000,
    dueDate: 'Aug 8',
    createdAt: '2026-08-02'
  }
];

export const customerList: CustomerOption[] = [
  { id: 'CUST-001', name: 'Rajeshwar Malhotra', phone: '+91 98765 43210', isVip: true },
  { id: 'CUST-002', name: 'Ananya Sharma', phone: '+91 98765 43211', isVip: true },
  { id: 'CUST-003', name: 'Vikram Singh', phone: '+91 98765 43212', isVip: false },
  { id: 'CUST-004', name: 'Priya Patel', phone: '+91 98765 43213', isVip: false },
  { id: 'CUST-005', name: 'Mohammed Farooq', phone: '+91 98765 43214', isVip: false },
  { id: 'CUST-006', name: 'Deepika Nair', phone: '+91 98765 43215', isVip: true },
  { id: 'CUST-007', name: 'Arjun Kapoor', phone: '+91 98765 43216', isVip: false },
  { id: 'CUST-008', name: 'Meera Reddy', phone: '+91 98765 43217', isVip: false }
];

export const garmentOptions: GarmentOption[] = [
  { label: 'Saree Blouse (Single)', value: 'Blouse', defaultMeters: 1.0, defaultPrice: 3500, skuPrefix: 'SKU-BLS-112', boltWidth: 44, bufferNote: '1.0m (up to 42" bust) + 0.8m lining' },
  { label: 'Corset Blouse / Bustier', value: 'Corset', defaultMeters: 1.2, defaultPrice: 6500, skuPrefix: 'SKU-CST-201', boltWidth: 44, bufferNote: '1.2m + fused interlining' },
  { label: 'Bespoke Shirt (Full Sleeve)', value: 'Shirt', defaultMeters: 2.2, defaultPrice: 2800, skuPrefix: 'SKU-SHRT-101', boltWidth: 44, bufferNote: '2.2m (44" width) or 1.6m (58" width)' },
  { label: 'Bespoke Trouser / Pants', value: 'Trouser', defaultMeters: 1.4, defaultPrice: 3200, skuPrefix: 'SKU-TRS-102', boltWidth: 58, bufferNote: '1.4m (58" width) or 2.2m (44" width)' },
  { label: '2-Piece Suit (Jacket + Trouser)', value: '2-Piece Suit', defaultMeters: 3.2, defaultPrice: 28000, skuPrefix: 'SKU-SUIT-2PC', boltWidth: 58, bufferNote: '3.2m (58" width wool/linen)' },
  { label: '3-Piece Suit (Jacket + Vest + Trouser)', value: '3-Piece Suit', defaultMeters: 4.0, defaultPrice: 38000, skuPrefix: 'SKU-SUIT-3PC', boltWidth: 58, bufferNote: '4.0m (58" width) + 3.0m satin lining' },
  { label: 'Sherwani + Churidar', value: 'Sherwani', defaultMeters: 4.5, defaultPrice: 32000, skuPrefix: 'SKU-SHER-901', boltWidth: 44, bufferNote: '4.5m brocade/raw silk + 2.5m churidar' },
  { label: 'Bandhgala / Jodhpuri Suit', value: 'Bandhgala', defaultMeters: 3.5, defaultPrice: 24000, skuPrefix: 'SKU-BDG-401', boltWidth: 58, bufferNote: '3.5m (58" width)' },
  { label: 'Kurta Pyjama Set', value: 'Kurta', defaultMeters: 3.8, defaultPrice: 7500, skuPrefix: 'SKU-KRT-302', boltWidth: 44, bufferNote: '2.4m Kurta + 2.2m Pyjama/Salwar' },
  { label: 'Bridal Lehenga (16-24 Kali Flare)', value: 'Lehenga', defaultMeters: 5.5, defaultPrice: 65000, skuPrefix: 'SKU-LHG-509', boltWidth: 44, bufferNote: '5.5m main silk + 4.5m lining + 4m cancan' },
  { label: 'Anarkali Gown / Floor Length Suit', value: 'Anarkali', defaultMeters: 5.0, defaultPrice: 26000, skuPrefix: 'SKU-ANK-440', boltWidth: 44, bufferNote: '5.0m flare georgette + 4.0m crepe lining' },
  { label: 'Evening Haute Couture Gown', value: 'Gown', defaultMeters: 4.8, defaultPrice: 35000, skuPrefix: 'SKU-GWN-710', boltWidth: 58, bufferNote: '4.8m (58" satin/crepe) + 1.2m train' }
];

/**
 * Customer fabric SKU generator: strictly uppercase alphanumeric ^CUST-FAB-[A-Z0-9]+$
 * Optional random suffix prevents millisecond collisions in batch order creation.
 */
export const generateCustomerFabricSku = (
  timestamp: number = Date.now(),
  randomSuffix: string = ''
): string => {
  const base = timestamp.toString(36).toUpperCase();
  const suffix = randomSuffix ? randomSuffix.toUpperCase() : '';
  return `CUST-FAB-${base}${suffix}`;
};

/**
 * Validates whether a SKU conforms to the customer fabric SKU specification
 */
export function isCustomerFabricSku(sku: string | undefined | null): boolean {
  if (!sku) return false;
  return /^CUST-FAB-[A-Z0-9]+$/.test(sku);
}

/**
 * Resilient lookup for garment presets matching value, label, or substring/composite strings
 * e.g. 'Sherwani + Churidar' -> Sherwani preset, 'Lehenga Choli' -> Lehenga preset
 */
export function findGarmentPreset(
  garmentType: string | undefined | null,
  options: GarmentOption[] = garmentOptions
): GarmentOption {
  if (!garmentType) return options[0];
  const normalized = garmentType.trim().toLowerCase();

  // 1. Exact value match
  const exactVal = options.find(g => g.value.toLowerCase() === normalized);
  if (exactVal) return exactVal;

  // 2. Exact label match
  const exactLabel = options.find(g => g.label.toLowerCase() === normalized);
  if (exactLabel) return exactLabel;

  // 3. Substring match
  const partial = options.find(g =>
    normalized.includes(g.value.toLowerCase()) ||
    g.value.toLowerCase().includes(normalized) ||
    normalized.includes(g.label.toLowerCase())
  );
  if (partial) return partial;

  return options[0];
}

/**
 * Resolves fabric SKU on toggle:
 * - When toggled ON (isCustomer = true): generates fresh CUST-FAB- SKU if not already prefixed
 * - When toggled OFF (isCustomer = false): reverts to garment preset catalog skuPrefix
 */
export function resolveFabricSku(
  currentSku: string | undefined,
  isCustomer: boolean,
  garmentType: string,
  options: GarmentOption[] = garmentOptions
): string {
  if (isCustomer) {
    if (!currentSku || !currentSku.startsWith('CUST-FAB-')) {
      return generateCustomerFabricSku();
    }
    return currentSku;
  } else {
    const preset = findGarmentPreset(garmentType, options);
    return preset ? preset.skuPrefix : options[0].skuPrefix;
  }
}

/**
 * Alias for resolveFabricSku
 */
export const resolveCustomerFabricSku = resolveFabricSku;

/**
 * Dynamic BOM generator for all 12 garment types with optional accessories and client supplies
 */
export const getDefaultBOMForGarment = (garmentType: string): BOMItem[] => {
  const g = garmentType.toLowerCase();
  const items: BOMItem[] = [
    {
      id: `bom-${Date.now()}-1`,
      name: 'Matching Spun Poly / Silk Thread Spools',
      category: 'thread',
      quantity: 2,
      unit: 'spools',
      unitCost: 60,
      isOptional: false
    }
  ];

  if (g.includes('sherwani') || g.includes('bandhgala') || g.includes('kurta')) {
    items.push(
      { id: `bom-${Date.now()}-2`, name: 'Gold Plated / Antique Metal Kurta Buttons', category: 'button', quantity: 7, unit: 'pcs', unitCost: 80, isOptional: false },
      { id: `bom-${Date.now()}-3`, name: 'Horsehair Canvas Chest Piece Reinforcement', category: 'canvas', quantity: 1.5, unit: 'meters', unitCost: 350, isOptional: true },
      { id: `bom-${Date.now()}-4`, name: 'Gold Zari Border Piping Trim', category: 'piping', quantity: 3.5, unit: 'meters', unitCost: 90, isOptional: true }
    );
  } else if (g.includes('lehenga') || g.includes('gown') || g.includes('anarkali')) {
    items.push(
      { id: `bom-${Date.now()}-5`, name: 'Cancan Mesh Netting for Flare Volume', category: 'canvas', quantity: 4.0, unit: 'meters', unitCost: 110, isOptional: true },
      { id: `bom-${Date.now()}-6`, name: 'Heavy Zari Waistband Latkan Tassels', category: 'lace', quantity: 2, unit: 'pcs', unitCost: 220, isOptional: true },
      { id: `bom-${Date.now()}-7`, name: 'Concealed Side Zipper (18 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 65, isOptional: false }
    );
  } else if (g.includes('blouse') || g.includes('corset') || g.includes('choli')) {
    items.push(
      { id: `bom-${Date.now()}-8`, name: 'Heavy Duty Side Invisible Zipper (12 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 55, isOptional: false },
      { id: `bom-${Date.now()}-9`, name: 'Back Eyelet / Braided Dori Hooks & Loops', category: 'hook', quantity: 8, unit: 'pairs', unitCost: 15, isOptional: true },
      { id: `bom-${Date.now()}-10`, name: 'Molded Bust Padding Cups (Pair)', category: 'canvas', quantity: 1, unit: 'pair', unitCost: 120, isOptional: true }
    );
  } else if (g.includes('suit')) {
    items.push(
      { id: `bom-${Date.now()}-11`, name: 'Natural Horn / Corozo Suit Buttons (Front + Sleeve)', category: 'button', quantity: 12, unit: 'pcs', unitCost: 45, isOptional: false },
      { id: `bom-${Date.now()}-12`, name: 'Fusible Hair Canvas + Shoulder Pads', category: 'canvas', quantity: 1, unit: 'set', unitCost: 450, isOptional: false },
      { id: `bom-${Date.now()}-13`, name: 'Viscose/Bemberg Premium Sleeve & Body Lining', category: 'lining', quantity: 2.8, unit: 'meters', unitCost: 280, isOptional: false }
    );
  } else if (g.includes('shirt')) {
    items.push(
      { id: `bom-${Date.now()}-14`, name: 'Mother of Pearl / Troca Shell Shirt Buttons', category: 'button', quantity: 14, unit: 'pcs', unitCost: 20, isOptional: false },
      { id: `bom-${Date.now()}-15`, name: 'High-Density Collar & Cuff Fusible Interlining', category: 'canvas', quantity: 0.6, unit: 'meters', unitCost: 140, isOptional: false },
      { id: `bom-${Date.now()}-15b`, name: 'Pocket Reinforcement Bias Tape', category: 'piping', quantity: 1.0, unit: 'meters', unitCost: 40, isOptional: true }
    );
  } else if (g.includes('trouser')) {
    items.push(
      { id: `bom-${Date.now()}-16`, name: 'Metal Slide Trouser Clasp & Anchor Buttons', category: 'hook', quantity: 2, unit: 'sets', unitCost: 40, isOptional: false },
      { id: `bom-${Date.now()}-17`, name: 'Brass Fly Zipper (8 inch)', category: 'zipper', quantity: 1, unit: 'pcs', unitCost: 35, isOptional: false },
      { id: `bom-${Date.now()}-18`, name: 'Pocketing Twill Lining Fabric', category: 'lining', quantity: 0.5, unit: 'meters', unitCost: 80, isOptional: false }
    );
  }

  return items;
};

/**
 * Strict state transition machine adhering to fitting trial lifecycle
 */
export const getValidNextStatuses = (current: OrderStatus): OrderStatus[] => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CONFIRMED', 'CUTTING', 'CANCELLED'],
    CUTTING: ['CUTTING', 'IN_PRODUCTION', 'CANCELLED'],
    IN_PRODUCTION: ['IN_PRODUCTION', 'TRIAL_FITTING', 'CANCELLED'],
    TRIAL_FITTING: ['TRIAL_FITTING', 'READY_FOR_DELIVERY', 'QC_CHECK', 'CANCELLED'],
    QC_CHECK: ['QC_CHECK', 'READY_FOR_DELIVERY', 'CANCELLED'],
    READY_FOR_DELIVERY: ['READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    DELIVERED: ['DELIVERED', 'CANCELLED'],
    CANCELLED: ['CANCELLED']
  };
  return transitions[current] || ['CANCELLED'];
};

export const isValidTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return getValidNextStatuses(from).includes(to);
};

export const getOrderStatusBadgeText = (status: string): string => {
  switch (status) {
    case 'DRAFT': return 'DRAFT';
    case 'CONFIRMED': return 'CONFIRMED';
    case 'CUTTING': return 'CUTTING';
    case 'IN_PRODUCTION': return 'PRODUCTION';
    case 'TRIAL_FITTING': return 'TRIAL';
    case 'QC_CHECK': return 'QC';
    case 'READY_FOR_DELIVERY': return 'READY';
    case 'DELIVERED': return 'DELIVERED';
    default: return status;
  }
};

// =========================================================================
// EXECUTIVE ATELIER TELEMETRY FUNCTIONS & CONSTANTS
// =========================================================================

export const WORKSHOP_STAGES = [
  'Fabric Inspection',
  'Master Cutting',
  'Zardozi/Aari Embroidery',
  'Stitching Assembly',
  'QC & Ready for Delivery'
];

export const STAGE_DOT_COLORS: Record<string, string> = {
  'Fabric Inspection': 'bg-slate-400',
  'Master Cutting': 'bg-amber-400',
  'Zardozi/Aari Embroidery': 'bg-purple-400',
  'Stitching Assembly': 'bg-blue-400',
  'QC & Ready for Delivery': 'bg-emerald-400'
};

export const computeActiveOrders = (orders: any[]): number =>
  orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'DRAFT').length;

export const computeUrgentJobs = (jobs: any[]): number =>
  jobs.filter(j => j.priority === 'Urgent' && j.stage !== 'QC & Ready for Delivery').length;

export const computeTotalRevenue = (orders: any[]): number =>
  orders.filter(o => o.status !== 'DRAFT').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

export const computeTotalCollected = (orders: any[]): number =>
  orders.filter(o => o.status !== 'DRAFT').reduce((sum, o) => sum + (o.advanceAmount || 0), 0);

export const isCollectedGood = (rev: number, col: number): boolean =>
  rev > 0 && (col / rev) > 0.5;

export const computeDeliveryRate = (orders: any[]): number => {
  const total = orders.filter(o => o.status !== 'DRAFT').length;
  if (total === 0) return 0;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;
  return Math.round((delivered / total) * 100);
};

export const computeOverdueOrders = (orders: any[], referenceDate?: string | Date): any[] => {
  const ref = referenceDate ? (typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate) : new Date();
  return orders
    .filter(o => {
      if (o.status === 'DELIVERED' || o.status === 'DRAFT') return false;
      return isOrderOverdue(o.dueDate, ref, o.createdAt);
    })
    .map(o => {
      const days = computeDaysOverdue(o.dueDate, ref, o.createdAt);
      return { ...o, daysOverdue: days || 1 };
    });
};
