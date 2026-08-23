/**
 * YellowHouse Tailoring OS — Machine Equipment Sharing Test Suite (Milestone 2 Layer 2)
 */

import {
  calculateMachineBookingCost,
  checkMachineSlotCollision
} from '../lib/ecosystem-algorithms';

import {
  SEED_WORKSHOP_MACHINES,
  SEED_MACHINE_RESERVATIONS
} from '../lib/ecosystem-seeds';

import { getLocalStorage, setLocalStorage } from '../lib/storage-utils';
import { WorkshopMachineListing, MachineReservationRecord } from '../types/ecosystem';

export function runEquipmentSharingTests(): { passed: number; failed: number } {
  console.log('\n==================================================');
  console.log('--- SUITE: MACHINE EQUIPMENT SHARING (M2 LAYER 2) ---');
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

  // --------------------------------------------------------------------------
  // 1. WORKSHOP MACHINERY SEED INTEGRITY
  // --------------------------------------------------------------------------
  console.log('[Test Group 1: Workshop Machinery Seeds & Specification Check]');

  assert(Array.isArray(SEED_WORKSHOP_MACHINES) && SEED_WORKSHOP_MACHINES.length >= 5, 'SEED_WORKSHOP_MACHINES contains 5 high-tech machinery units');

  for (const mch of SEED_WORKSHOP_MACHINES) {
    assert(!!mch.id, `Machine ${mch.id} has valid ID`);
    assert(!!mch.name && mch.name.length > 5, `Machine ${mch.id} has descriptive name`);
    assert(mch.specs?.bedWidthInches > 0, `Machine ${mch.id} specifies bed width`);
    assert(mch.specs?.bedLengthInches > 0, `Machine ${mch.id} specifies bed length`);
    assert(mch.specs?.compatibleMaterials?.length > 0, `Machine ${mch.id} lists compatible materials`);
    assert(mch.pricing?.hourlyRateInr > 0, `Machine ${mch.id} has hourly rate`);
    assert(mch.pricing?.dailyShiftRateInr > mch.pricing.hourlyRateInr, `Machine ${mch.id} daily shift exceeds hourly rate`);
    assert(mch.pricing?.securityDepositInr > 0, `Machine ${mch.id} has security deposit`);
  }

  // --------------------------------------------------------------------------
  // 2. PRICING & COST BREAKDOWN (HOURLY, DAILY, PANEL BATCH, 18% GST)
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 2: Machine Shift Pricing Calculations]');

  const mimaki = SEED_WORKSHOP_MACHINES[0]; // Hourly: 1800, Daily: 12000, Op: 600, Dep: 5000

  // 2.1 Hourly booking with operator
  const hourlyCostWithOp = calculateMachineBookingCost(mimaki, 'HOURLY', 3, true);
  assert(hourlyCostWithOp.machineBaseCost === 1800 * 3, 'Hourly base cost for 3h is ₹5,400');
  assert(hourlyCostWithOp.operatorFee === 600 * 3, 'Operator fee for 3h is ₹1,800');
  assert(hourlyCostWithOp.cleaningFee === 500, 'Standard cleaning fee is ₹500');
  const expectedTax = Math.round((5400 + 1800 + 500) * 0.18);
  assert(hourlyCostWithOp.taxesInr === expectedTax, `18% GST taxes match ₹${expectedTax}`);
  assert(hourlyCostWithOp.securityDeposit === 5000, 'Security deposit is ₹5,000');
  assert(hourlyCostWithOp.totalAmountInr === 5400 + 1800 + 500 + expectedTax + 5000, 'Total includes all line items and deposit');

  // 2.2 Hourly booking without operator
  const hourlyCostNoOp = calculateMachineBookingCost(mimaki, 'HOURLY', 2, false);
  assert(hourlyCostNoOp.machineBaseCost === 3600, 'Hourly base cost for 2h without operator is ₹3,600');
  assert(hourlyCostNoOp.operatorFee === 0, 'Operator fee is ₹0 when operator is toggled off');

  // 2.3 Daily shift booking
  const dailyCost = calculateMachineBookingCost(mimaki, 'DAILY_SHIFT', 2, true);
  assert(dailyCost.machineBaseCost === 12000 * 2, '2 daily shifts base cost is ₹24,000');
  assert(dailyCost.operatorFee === 600 * (2 * 8), '2 daily shifts (16h) operator fee is ₹9,600');

  // --------------------------------------------------------------------------
  // 3. COLLISION DETECTION ALGORITHM WITH 30-MINUTE BUFFER
  // --------------------------------------------------------------------------
  console.log('\n[Test Group 3: Automated Collision Detection Algorithm]');

  const testReservations: MachineReservationRecord[] = [
    {
      id: 'res_active_01',
      reservationNumber: 'RES-2026-MCH-001',
      machineId: 'mch_mimaki_tx300_01',
      machineName: 'Mimaki Printer',
      machineCategory: 'DIGITAL_TEXTILE_PRINTER',
      facilityName: 'Kala Ghoda Lab',
      tenantId: 't1',
      userId: 'u1',
      userName: 'User 1',
      bookingType: 'HOURLY',
      startTime: '2026-08-25T10:00:00Z',
      endTime: '2026-08-25T14:00:00Z',
      totalDurationHours: 4,
      includeOperator: true,
      jobDetails: {
        jobTitle: 'Silk Printing',
        garmentCategory: 'mens-sherwani',
        panelCount: 10,
        fabricType: 'Silk',
        boltWidthInches: 44,
        estimatedRunMinutes: 180,
        bedEfficiencyPercent: 90
      },
      costBreakdown: {
        machineBaseCost: 7200,
        operatorFee: 2400,
        securityDeposit: 5000,
        cleaningFee: 500,
        taxesInr: 1818,
        totalAmountInr: 16918
      },
      paymentStatus: 'ESCROW_HOLD',
      reservationStatus: 'CONFIRMED',
      createdAt: '2026-08-23T10:00:00Z'
    }
  ];

  // Conflict 1: Exact Overlap
  const c1 = checkMachineSlotCollision(testReservations, 'mch_mimaki_tx300_01', '2026-08-25T10:00:00Z', '2026-08-25T14:00:00Z');
  assert(c1.hasConflict === true, 'Detects conflict on exact time overlap');

  // Conflict 2: Within 30-minute buffer before (starts at 09:45, ends at 10:00)
  const c2 = checkMachineSlotCollision(testReservations, 'mch_mimaki_tx300_01', '2026-08-25T08:00:00Z', '2026-08-25T09:45:00Z', undefined, 30);
  assert(c2.hasConflict === true, 'Detects conflict when slot ends within 30-minute pre-buffer');

  // Conflict 3: Within 30-minute buffer after (starts at 14:15, ends at 16:00)
  const c3 = checkMachineSlotCollision(testReservations, 'mch_mimaki_tx300_01', '2026-08-25T14:15:00Z', '2026-08-25T16:00:00Z', undefined, 30);
  assert(c3.hasConflict === true, 'Detects conflict when slot starts within 30-minute post-buffer');

  // Non-conflict 1: Starts safely after buffer (starts at 14:35)
  const ok1 = checkMachineSlotCollision(testReservations, 'mch_mimaki_tx300_01', '2026-08-25T14:35:00Z', '2026-08-25T18:00:00Z', undefined, 30);
  assert(ok1.hasConflict === false, 'Allows reservation slot when scheduled 35 minutes after prior reservation');

  // Non-conflict 2: Different machine (different machine ID)
  const ok2 = checkMachineSlotCollision(testReservations, 'mch_lectra_laser_02', '2026-08-25T10:00:00Z', '2026-08-25T14:00:00Z');
  assert(ok2.hasConflict === false, 'Different machines do not collide on identical timestamps');

  // Non-conflict 3: Existing reservation is cancelled
  const cancelledRes: MachineReservationRecord[] = [
    { ...testReservations[0], reservationStatus: 'CANCELLED' }
  ];
  const ok3 = checkMachineSlotCollision(cancelledRes, 'mch_mimaki_tx300_01', '2026-08-25T10:00:00Z', '2026-08-25T14:00:00Z');
  assert(ok3.hasConflict === false, 'Ignores cancelled reservations during collision check');

  return { passed, failed };
}
