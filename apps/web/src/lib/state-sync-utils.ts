import { getLocalStorage, setLocalStorage } from './storage-utils';

export type KanbanStage =
  | 'Fabric Inspection'
  | 'Master Cutting'
  | 'Zardozi/Aari Embroidery'
  | 'Stitching Assembly'
  | 'QC & Ready for Delivery';

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

export type Priority = 'Urgent' | 'Normal';

export type PaymentStatus = 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';

export interface JobCardItem {
  id: string;
  orderId: string;
  client: string;
  garment: string;
  karigar: string;
  samMinutesLogged: number;
  samTotalEstimate: number;
  priority: Priority;
  dueDate: string;
  progress: number;
  stage: KanbanStage;
  fabricDetails?: string;
  notes?: string;
  rack?: string;
  barcodeEnabled?: boolean;
  qrCodeEnabled?: boolean;
  history?: { action: string; timestamp: string; stage?: string }[];
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
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  garmentSummary: string;
  itemCount: number;
  status: OrderStatus;
  totalAmount: number;
  dueDate: string;
  rawDueDate?: string;
  createdAt: string;
  isUrgent?: boolean;
  items?: OrderItemRow[];
  notes?: string;
  customerId?: string;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus?: PaymentStatus;
}

export interface ActivityItem {
  id: string;
  type: 'order_created' | 'order_updated' | 'customer_added' | 'job_moved' | 'payment_received' | 'measurement_saved';
  message: string;
  timestamp: string;
  entityId?: string;
}

// ============================================================
// ID UTILITIES
// ============================================================

export function cleanOrderId(id: string): string {
  if (!id) return '';
  return id
    .trim()
    .replace(/^#?YH-?/i, '')
    .replace(/^JC-?/i, '')
    .replace(/^#?YH-?/i, '')
    .trim();
}

// ============================================================
// STAGE <-> STATUS MAPPING
// ============================================================

export function mapStageToOrderStatus(stage: KanbanStage): OrderStatus {
  switch (stage) {
    case 'Fabric Inspection':
      return 'CONFIRMED';
    case 'Master Cutting':
      return 'CUTTING';
    case 'Zardozi/Aari Embroidery':
      return 'IN_PRODUCTION';
    case 'Stitching Assembly':
      return 'IN_PRODUCTION';
    case 'QC & Ready for Delivery':
      return 'READY_FOR_DELIVERY';
    default:
      return 'CONFIRMED';
  }
}

export function mapOrderStatusToStage(status: OrderStatus): KanbanStage {
  switch (status) {
    case 'DRAFT':
    case 'CONFIRMED':
      return 'Fabric Inspection';
    case 'CUTTING':
      return 'Master Cutting';
    case 'IN_PRODUCTION':
      return 'Stitching Assembly';
    case 'TRIAL_FITTING':
      return 'Stitching Assembly';
    case 'QC_CHECK':
    case 'READY_FOR_DELIVERY':
    case 'DELIVERED':
      return 'QC & Ready for Delivery';
    default:
      return 'Fabric Inspection';
  }
}

// ============================================================
// PROGRESS CALCULATION
// ============================================================

export function getProgressForStage(stage: KanbanStage): number {
  switch (stage) {
    case 'Fabric Inspection':
      return 20;
    case 'Master Cutting':
      return 40;
    case 'Zardozi/Aari Embroidery':
      return 60;
    case 'Stitching Assembly':
      return 80;
    case 'QC & Ready for Delivery':
      return 100;
    default:
      return 20;
  }
}

export function getProgressForStatus(status: OrderStatus): number {
  switch (status) {
    case 'DRAFT':
      return 5;
    case 'CONFIRMED':
      return 15;
    case 'CUTTING':
      return 35;
    case 'IN_PRODUCTION':
      return 75;
    case 'TRIAL_FITTING':
      return 85;
    case 'QC_CHECK':
      return 95;
    case 'READY_FOR_DELIVERY':
    case 'DELIVERED':
      return 100;
    default:
      return 15;
  }
}

// ============================================================
// KARIGAR POOL (round-robin assignment)
// ============================================================

const KARIGAR_POOL = [
  'Karigar Salim',
  'Karigar Latif',
  'Karigar Ahmed',
  'Karigar Usman',
  'Karigar Rafi',
];

let karigarIndex = 0;
function getNextKarigar(): string {
  const karigar = KARIGAR_POOL[karigarIndex % KARIGAR_POOL.length];
  karigarIndex++;
  return karigar;
}

// ============================================================
// SAM ESTIMATES BY GARMENT TYPE
// ============================================================

function estimateSamMinutes(garmentType: string): number {
  const lower = (garmentType || '').toLowerCase();
  if (lower.includes('sherwani')) return 240;
  if (lower.includes('lehenga')) return 300;
  if (lower.includes('suit') || lower.includes('tuxedo')) return 180;
  if (lower.includes('anarkali') || lower.includes('gown')) return 220;
  if (lower.includes('shirt') || lower.includes('kurta')) return 90;
  if (lower.includes('trouser') || lower.includes('churidar') || lower.includes('pant')) return 75;
  if (lower.includes('blouse')) return 60;
  if (lower.includes('corset')) return 150;
  if (lower.includes('waistcoat') || lower.includes('vest')) return 100;
  return 120;
}

// ============================================================
// CROSS-TAB SYNC EVENT
// ============================================================

export function dispatchSyncEvent(detail?: { source?: string; entityId?: string }): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('yh-data-sync', { detail: detail || {} }));
    } catch {
      // Ignore in non-browser test environments
    }
  }
}

// ============================================================
// ACTIVITY LOG
// ============================================================

export function logActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): void {
  const activities = getLocalStorage<ActivityItem[]>('yh_activities', []);
  const newItem: ActivityItem = {
    ...item,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newItem, ...activities].slice(0, 50);
  setLocalStorage('yh_activities', updated);
}

// ============================================================
// SYNC: JOB -> ORDER STATUS
// ============================================================

export function syncJobToOrdersStorage(job: JobCardItem): void {
  const orders = getLocalStorage<Order[]>('yh_orders', []);
  const safeOrders = Array.isArray(orders) ? orders : [];
  const cleanTargetId = cleanOrderId(job.orderId || job.id);
  const targetStatus = mapStageToOrderStatus(job.stage);

  let updated = false;
  const newOrders = safeOrders.map((order) => {
    if (cleanOrderId(order.id) === cleanTargetId) {
      updated = true;
      return { ...order, status: targetStatus };
    }
    return order;
  });

  if (updated) {
    setLocalStorage('yh_orders', newOrders);
    logActivity({
      type: 'job_moved',
      message: `Job ${job.id} moved to ${job.stage}`,
      entityId: job.id,
    });
    dispatchSyncEvent({ source: 'production', entityId: job.id });
  }
}

// ============================================================
// SYNC: ORDER -> JOB CARDS (per-garment-item)
// ============================================================

export function syncOrderToJobsStorage(order: Order): void {
  const jobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const cleanTargetId = cleanOrderId(order.id);
  const targetStage = mapOrderStatusToStage(order.status);
  const targetProgress = getProgressForStatus(order.status);

  const existingJobIds = safeJobs
    .filter((job) => cleanOrderId(job.orderId) === cleanTargetId || cleanOrderId(job.id) === cleanTargetId)
    .map((j) => j.id);

  if (existingJobIds.length > 0) {
    const updatedJobs = safeJobs.map((job) => {
      if (existingJobIds.includes(job.id)) {
        return {
          ...job,
          stage: targetStage,
          progress: targetProgress,
          priority: order.isUrgent ? 'Urgent' as Priority : job.priority,
        };
      }
      return job;
    });
    setLocalStorage('yh_production_jobs', updatedJobs);
  } else if (order.status !== 'DRAFT' && order.status !== 'CANCELLED') {
    const newJobs: JobCardItem[] = [];

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, idx) => {
        newJobs.push({
          id: `JC-${cleanTargetId}-${idx + 1}`,
          orderId: order.id.startsWith('#') ? order.id : `#YH-${cleanTargetId}`,
          client: order.clientName,
          garment: item.garmentType || order.garmentSummary,
          karigar: getNextKarigar(),
          samMinutesLogged: 0,
          samTotalEstimate: estimateSamMinutes(item.garmentType || order.garmentSummary),
          priority: order.isUrgent ? 'Urgent' : 'Normal',
          dueDate: order.dueDate,
          progress: targetProgress,
          stage: targetStage,
          fabricDetails: `${item.fabricSku} — ${item.fabricMeters}m`,
          notes: order.notes || 'Auto-synced from order creation.',
          history: [
            { action: 'Job created from order', timestamp: new Date().toISOString(), stage: targetStage },
          ],
        });
      });
    } else {
      newJobs.push({
        id: `JC-${cleanTargetId}`,
        orderId: order.id.startsWith('#') ? order.id : `#YH-${cleanTargetId}`,
        client: order.clientName,
        garment: order.garmentSummary,
        karigar: getNextKarigar(),
        samMinutesLogged: 0,
        samTotalEstimate: (order.itemCount || 1) * 120,
        priority: order.isUrgent ? 'Urgent' : 'Normal',
        dueDate: order.dueDate,
        progress: targetProgress,
        stage: targetStage,
        notes: order.notes || 'Auto-synced from order creation.',
        history: [
          { action: 'Job created from order', timestamp: new Date().toISOString(), stage: targetStage },
        ],
      });
    }

    const updatedJobs = [...newJobs, ...safeJobs];
    setLocalStorage('yh_production_jobs', updatedJobs);

    logActivity({
      type: 'order_created',
      message: `${newJobs.length} job card(s) created for order ${order.id}`,
      entityId: order.id,
    });
  }

  dispatchSyncEvent({ source: 'orders', entityId: order.id });
}

// ============================================================
// BULK RECONCILIATION (for dashboard init)
// ============================================================

export function syncAllOrdersToJobs(): void {
  const orders = getLocalStorage<Order[]>('yh_orders', []);
  const safeOrders = Array.isArray(orders) ? orders : [];
  const jobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const existingOrderIds = new Set(
    safeJobs.map((j) => cleanOrderId(j.orderId || j.id))
  );

  const orphanOrders = safeOrders.filter(
    (o) => o.status !== 'DRAFT' && o.status !== 'CANCELLED' && !existingOrderIds.has(cleanOrderId(o.id))
  );

  if (orphanOrders.length > 0) {
    orphanOrders.forEach((order) => {
      syncOrderToJobsStorage(order);
    });
  }
}

// ============================================================
// PAYMENT UTILITIES
// ============================================================

export function calculatePaymentStatus(orderOrTotal: Order | number, maybeAdvance?: number): PaymentStatus {
  let total = 0;
  let advance = 0;
  if (typeof orderOrTotal === 'object' && orderOrTotal !== null) {
    total = orderOrTotal.totalAmount || 0;
    advance = orderOrTotal.advanceAmount || 0;
  } else {
    total = Number(orderOrTotal) || 0;
    advance = Number(maybeAdvance) || 0;
  }
  if (advance <= 0) return 'UNPAID';
  if (advance >= total) return 'FULLY_PAID';
  return 'ADVANCE_PAID';
}

export function calculateBalance(orderOrTotal: Order | number, maybeAdvance?: number): number {
  let total = 0;
  let advance = 0;
  if (typeof orderOrTotal === 'object' && orderOrTotal !== null) {
    total = orderOrTotal.totalAmount || 0;
    advance = orderOrTotal.advanceAmount || 0;
  } else {
    total = Number(orderOrTotal) || 0;
    advance = Number(maybeAdvance) || 0;
  }
  return Math.max(0, total - advance);
}
