import {
  cleanOrderId,
  mapStageToOrderStatus,
  mapOrderStatusToStage,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  JobCardItem,
  Order,
  KanbanStage,
  OrderStatus,
} from '../lib/state-sync-utils';
import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';

export function runStateSyncTests() {
  console.log('\n[Suite: Bidirectional State Synchronization Engine]');

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

  // 1. Order ID Normalization Utility Tests
  assert(cleanOrderId('#YH-9021') === '9021', 'cleanOrderId("#YH-9021") returns "9021"');
  assert(cleanOrderId('JC-9021') === '9021', 'cleanOrderId("JC-9021") returns "9021"');
  assert(cleanOrderId('9021') === '9021', 'cleanOrderId("9021") returns "9021"');
  assert(cleanOrderId('  #YH-9035  ') === '9035', 'cleanOrderId trims leading and trailing spaces');
  assert(cleanOrderId('') === '', 'cleanOrderId handling empty string returns empty string');

  // 2. Canonical Stage to Order Status Mapping Matrix Tests
  assert(mapStageToOrderStatus('Fabric Inspection') === 'CONFIRMED', 'Fabric Inspection maps to CONFIRMED');
  assert(mapStageToOrderStatus('Master Cutting') === 'CUTTING', 'Master Cutting maps to CUTTING');
  assert(mapStageToOrderStatus('Zardozi/Aari Embroidery') === 'IN_PRODUCTION', 'Zardozi Embroidery maps to IN_PRODUCTION');
  assert(mapStageToOrderStatus('Stitching Assembly') === 'IN_PRODUCTION', 'Stitching Assembly maps to IN_PRODUCTION');
  assert(mapStageToOrderStatus('QC & Ready for Delivery') === 'READY_FOR_DELIVERY', 'QC & Ready for Delivery maps to READY_FOR_DELIVERY');

  // 3. Canonical Order Status to Stage Mapping Matrix Tests
  assert(mapOrderStatusToStage('DRAFT') === 'Fabric Inspection', 'DRAFT maps to Fabric Inspection');
  assert(mapOrderStatusToStage('CONFIRMED') === 'Fabric Inspection', 'CONFIRMED maps to Fabric Inspection');
  assert(mapOrderStatusToStage('CUTTING') === 'Master Cutting', 'CUTTING maps to Master Cutting');
  assert(mapOrderStatusToStage('IN_PRODUCTION') === 'Stitching Assembly', 'IN_PRODUCTION maps to Stitching Assembly');
  assert(mapOrderStatusToStage('READY_FOR_DELIVERY') === 'QC & Ready for Delivery', 'READY_FOR_DELIVERY maps to QC & Ready for Delivery');
  assert(mapOrderStatusToStage('DELIVERED') === 'QC & Ready for Delivery', 'DELIVERED maps to QC & Ready for Delivery');

  // Setup Mock In-Memory Storage for Testing Storage Sync Functions
  const mockStorage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (k: string) => (k in mockStorage ? mockStorage[k] : null),
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    },
  };
  (globalThis as any).window = {
    localStorage: mockLocalStorage,
  };

  // 4. syncJobToOrdersStorage Test
  const testOrders: Order[] = [
    {
      id: '#YH-9021',
      clientName: 'Rajeshwar Malhotra',
      clientPhone: '+91 98765 43210',
      garmentSummary: 'Sherwani',
      itemCount: 1,
      status: 'CONFIRMED',
      totalAmount: 45000,
      dueDate: 'Aug 15',
      createdAt: '2026-08-01',
    },
    {
      id: '#YH-9018',
      clientName: 'Ananya Sharma',
      clientPhone: '+91 98765 43211',
      garmentSummary: 'Lehenga Choli',
      itemCount: 1,
      status: 'CONFIRMED',
      totalAmount: 68000,
      dueDate: 'Aug 12',
      createdAt: '2026-07-28',
    },
  ];
  setLocalStorage('yh_orders', testOrders);

  const jobToSync: JobCardItem = {
    id: 'JC-9021',
    orderId: '#YH-9021',
    client: 'Rajeshwar Malhotra',
    garment: 'Sherwani',
    karigar: 'Karigar Latif',
    samMinutesLogged: 65,
    samTotalEstimate: 180,
    priority: 'Urgent',
    dueDate: 'Aug 12',
    progress: 35,
    stage: 'Master Cutting',
  };

  syncJobToOrdersStorage(jobToSync);

  const syncedOrders = getLocalStorage<Order[]>('yh_orders', []);
  const syncedOrder9021 = syncedOrders.find((o) => cleanOrderId(o.id) === '9021');
  assert(syncedOrder9021 !== undefined, 'Order #YH-9021 exists in storage');
  assert(syncedOrder9021?.status === 'CUTTING', 'Job move to Master Cutting synced order status to CUTTING');

  const unmodifiedOrder9018 = syncedOrders.find((o) => cleanOrderId(o.id) === '9018');
  assert(unmodifiedOrder9018?.status === 'CONFIRMED', 'Unrelated order status remains unmodified');

  // 5. syncOrderToJobsStorage Test
  const testJobs: JobCardItem[] = [
    {
      id: 'JC-9021',
      orderId: '#YH-9021',
      client: 'Rajeshwar Malhotra',
      garment: 'Sherwani',
      karigar: 'Karigar Latif',
      samMinutesLogged: 65,
      samTotalEstimate: 180,
      priority: 'Urgent',
      dueDate: 'Aug 12',
      progress: 35,
      stage: 'Master Cutting',
    },
  ];
  setLocalStorage('yh_production_jobs', testJobs);

  const updatedOrderToSync: Order = {
    id: '#YH-9021',
    clientName: 'Rajeshwar Malhotra',
    clientPhone: '+91 98765 43210',
    garmentSummary: 'Sherwani',
    itemCount: 1,
    status: 'READY_FOR_DELIVERY',
    totalAmount: 45000,
    dueDate: 'Aug 15',
    createdAt: '2026-08-01',
  };

  syncOrderToJobsStorage(updatedOrderToSync);

  const syncedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const syncedJob9021 = syncedJobs.find((j) => cleanOrderId(j.id) === '9021');
  assert(syncedJob9021 !== undefined, 'Job JC-9021 exists in storage');
  assert(syncedJob9021?.stage === 'QC & Ready for Delivery', 'Order status update READY_FOR_DELIVERY synced job stage to QC & Ready for Delivery');
  assert(syncedJob9021?.progress === 100, 'Order status update READY_FOR_DELIVERY updated job progress to 100%');

  // 6. Auto-Creation of Missing Job Cards on Order Creation
  const newOrderToSync: Order = {
    id: '#YH-9999',
    clientName: 'New VIP Client',
    clientPhone: '+91 99999 88888',
    garmentSummary: 'Bespoke Tuxedo',
    itemCount: 1,
    status: 'CONFIRMED',
    totalAmount: 50000,
    dueDate: 'Aug 30',
    createdAt: '2026-08-07',
  };

  syncOrderToJobsStorage(newOrderToSync);

  const postAutoCreateJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  const autoCreatedJob = postAutoCreateJobs.find((j) => cleanOrderId(j.id) === '9999');
  assert(autoCreatedJob !== undefined, 'Newly created order #YH-9999 auto-spawned a job card in storage');
  assert(autoCreatedJob?.stage === 'Fabric Inspection', 'Auto-spawned job card defaults to Fabric Inspection stage');
  assert(autoCreatedJob?.client === 'New VIP Client', 'Auto-spawned job card preserves client name');

  // 7. Idempotency & Edge Case Verification
  syncJobToOrdersStorage(jobToSync);
  syncOrderToJobsStorage(updatedOrderToSync);
  const reSyncedJobs = getLocalStorage<JobCardItem[]>('yh_production_jobs', []);
  assert(reSyncedJobs.length === postAutoCreateJobs.length, 'Repeated sync calls maintain idempotent state length');

  return { passed, failed };
}
