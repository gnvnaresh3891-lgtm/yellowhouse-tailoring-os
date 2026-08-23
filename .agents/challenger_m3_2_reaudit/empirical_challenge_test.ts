import { getLocalStorage, setLocalStorage } from '../../apps/web/src/lib/storage-utils';
import {
  getProgressForStage,
  syncJobToOrdersStorage,
  syncOrderToJobsStorage,
  KanbanStage,
  JobCardItem,
  Order
} from '../../apps/web/src/lib/state-sync-utils';

// Mock window and localStorage for Node env
declare const window: any;

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    localStorage: new LocalStorageMock(),
  };
}

console.log('=== EMPIRICAL CHALLENGE 2 TEST HARNESS ===');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${description}`);
    failCount++;
  }
}

// ---------------------------------------------------------
// TEST GROUP 1: LocalStorage Non-Array State Resilience
// ---------------------------------------------------------
console.log('\n--- Group 1: LocalStorage Non-Array State Resilience ---');

const malformedValues = [
  { name: 'JSON Object', raw: '{"key": "val"}' },
  { name: 'JSON Number', raw: '12345' },
  { name: 'JSON String', raw: '"just a string"' },
  { name: 'JSON Boolean true', raw: 'true' },
  { name: 'JSON Boolean false', raw: 'false' },
  { name: 'Invalid JSON syntax', raw: '{ invalid json object' },
  { name: 'Null string', raw: 'null' },
  { name: 'Undefined string', raw: 'undefined' },
  { name: 'Empty string', raw: '' },
];

for (const item of malformedValues) {
  window.localStorage.clear();
  window.localStorage.setItem('yh_orders', item.raw);
  window.localStorage.setItem('yh_production_jobs', item.raw);

  // Test getLocalStorage directly with array fallback
  const resultOrders = getLocalStorage<any[]>('yh_orders', []);
  assert(
    Array.isArray(resultOrders) && resultOrders.length === 0,
    `getLocalStorage handles stored ${item.name} safely and returns fallback empty array`
  );

  // Test syncJobToOrdersStorage under malformed storage
  let jobSyncSuccess = true;
  try {
    syncJobToOrdersStorage({
      id: 'JC-100',
      orderId: 'YH-100',
      client: 'Empirical Client',
      garment: 'Suit',
      karigar: 'Ahmed',
      samMinutesLogged: 10,
      samTotalEstimate: 120,
      priority: 'Normal',
      dueDate: 'Aug 20',
      progress: 20,
      stage: 'Fabric Inspection',
    });
  } catch (err: any) {
    jobSyncSuccess = false;
    console.error(`Crash during syncJobToOrdersStorage with ${item.name}:`, err?.message);
  }
  assert(jobSyncSuccess, `syncJobToOrdersStorage does not throw error on ${item.name}`);

  // Test syncOrderToJobsStorage under malformed storage
  let orderSyncSuccess = true;
  try {
    syncOrderToJobsStorage({
      id: '#YH-200',
      clientName: 'Empirical Client 2',
      clientPhone: '+91 9000000000',
      garmentSummary: 'Sherwani',
      itemCount: 1,
      status: 'CONFIRMED',
      totalAmount: 30000,
      dueDate: 'Aug 22',
      createdAt: '2026-08-01',
    });
  } catch (err: any) {
    orderSyncSuccess = false;
    console.error(`Crash during syncOrderToJobsStorage with ${item.name}:`, err?.message);
  }
  assert(orderSyncSuccess, `syncOrderToJobsStorage does not throw error on ${item.name}`);
}

// ---------------------------------------------------------
// TEST GROUP 2: Kanban Stage Progress Percentage Alignment
// ---------------------------------------------------------
console.log('\n--- Group 2: Kanban Stage Progress Percentage Alignment ---');

const expectedStageProgress: Record<KanbanStage, number> = {
  'Fabric Inspection': 20,
  'Master Cutting': 40,
  'Zardozi/Aari Embroidery': 60,
  'Stitching Assembly': 80,
  'QC & Ready for Delivery': 100,
};

for (const [stage, expectedPercentage] of Object.entries(expectedStageProgress)) {
  const calculated = getProgressForStage(stage as KanbanStage);
  assert(
    calculated === expectedPercentage,
    `getProgressForStage('${stage}') === ${expectedPercentage}% (Actual: ${calculated}%)`
  );
}

// Test default fallback for unknown stage string
const unknownStageProgress = getProgressForStage('Unknown Stage' as KanbanStage);
assert(
  unknownStageProgress === 20,
  `getProgressForStage('Unknown Stage') falls back to 20% (Actual: ${unknownStageProgress}%)`
);

console.log('\n=========================================');
console.log(`TOTAL RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('=========================================');

if (failCount > 0) {
  process.exit(1);
}
