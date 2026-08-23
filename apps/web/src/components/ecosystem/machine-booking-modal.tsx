'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Scissors, 
  Layers, 
  Building, 
  User, 
  Phone, 
  Cpu, 
  MapPin, 
  FileCode2, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  WorkshopMachineListing, 
  MachineReservationRecord, 
  ShiftType, 
  GarmentCategory,
  MachineReservationCostBreakdown
} from '@/types/ecosystem';
import { 
  calculateMachineBookingCost, 
  checkMachineSlotCollision 
} from '@/lib/ecosystem-algorithms';
import { SEED_MACHINE_RESERVATIONS } from '@/lib/ecosystem-seeds';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { useCurrency } from '@/components/currency-context';

interface MachineBookingModalProps {
  machine: WorkshopMachineListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reservation: MachineReservationRecord) => void;
}

export const MachineBookingModal: React.FC<MachineBookingModalProps> = ({
  machine,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { formatCurrency } = useCurrency();

  // Booking Form State
  const [bookingType, setBookingType] = useState<'HOURLY' | 'DAILY_SHIFT' | 'PANEL_BATCH'>('HOURLY');
  
  // Date and Time: default tomorrow 10:00 AM to 02:00 PM
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().substring(0, 10);
  });
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [durationHours, setDurationHours] = useState(4);
  const [shiftDays, setShiftDays] = useState(1);
  const [includeOperator, setIncludeOperator] = useState(true);

  // Panel Production Batch Details
  const [jobTitle, setJobTitle] = useState('12x Royal Sherwani Panel Precision Cutting');
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>('mens-sherwani');
  const [panelCount, setPanelCount] = useState(144);
  const [fabricType, setFabricType] = useState('Mulberry Raw Silk (110 GSM)');
  const [boltWidthInches, setBoltWidthInches] = useState(44);
  const [cutFileName, setCutFileName] = useState('brf_2026_089_nested_cutfile.dxf');
  const [specialInstructions, setSpecialInstructions] = useState('Ensure blade sharpness check before cutting raw silk grainlines.');

  // User & Atelier Information
  const [renterName, setRenterName] = useState('Vikramaditya Singhania');
  const [atelierName, setAtelierName] = useState('Singhania Bespoke Atelier');
  const [renterPhone, setRenterPhone] = useState('+91 98201 45678');

  // Confirmation / Receipt View State
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<MachineReservationRecord | null>(null);

  // Calculate Start & End ISO timestamps
  const { startIso, endIso, totalCalculatedHours } = useMemo(() => {
    try {
      const [hours, mins] = startTimeStr.split(':').map(Number);
      const start = new Date(bookingDate);
      start.setHours(hours || 10, mins || 0, 0, 0);

      const end = new Date(start);
      let calculatedHours = durationHours;
      if (bookingType === 'DAILY_SHIFT') {
        calculatedHours = shiftDays * 8;
        end.setTime(start.getTime() + shiftDays * 8 * 60 * 60 * 1000);
      } else if (bookingType === 'PANEL_BATCH') {
        calculatedHours = Math.max(2, Math.ceil(panelCount / 30));
        end.setTime(start.getTime() + calculatedHours * 60 * 60 * 1000);
      } else {
        end.setTime(start.getTime() + durationHours * 60 * 60 * 1000);
      }

      return {
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        totalCalculatedHours: calculatedHours
      };
    } catch {
      return {
        startIso: new Date().toISOString(),
        endIso: new Date(Date.now() + 4 * 3600000).toISOString(),
        totalCalculatedHours: 4
      };
    }
  }, [bookingDate, startTimeStr, durationHours, shiftDays, bookingType, panelCount]);

  // Check Slot Collision
  const collisionResult = useMemo(() => {
    if (!machine) return { hasConflict: false };
    const existing = getLocalStorage<MachineReservationRecord[]>('yh_machine_reservations', SEED_MACHINE_RESERVATIONS);
    return checkMachineSlotCollision(
      existing,
      machine.id,
      startIso,
      endIso,
      undefined,
      30 // 30-min buffer
    );
  }, [machine, startIso, endIso]);

  // Cost Breakdown
  const costBreakdown: MachineReservationCostBreakdown = useMemo(() => {
    if (!machine) {
      return {
        machineBaseCost: 0,
        operatorFee: 0,
        securityDeposit: 0,
        cleaningFee: 0,
        taxesInr: 0,
        totalAmountInr: 0
      };
    }

    const durationParam = bookingType === 'DAILY_SHIFT' ? shiftDays : totalCalculatedHours;
    return calculateMachineBookingCost(machine, bookingType, durationParam, includeOperator);
  }, [machine, bookingType, shiftDays, totalCalculatedHours, includeOperator]);

  if (!isOpen || !machine) return null;

  const handleConfirmReservation = () => {
    if (collisionResult.hasConflict || !renterName || !atelierName) return;
    setIsProcessing(true);

    try {
      const timestamp = Date.now();
      const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const reservationNumber = `RES-2026-MCH-${randHex}`;

      const newReservation: MachineReservationRecord = {
        id: `res_mch_${timestamp}`,
        reservationNumber,
        machineId: machine.id,
        machineName: machine.name,
        machineCategory: machine.category,
        facilityName: machine.facilityName,
        tenantId: 'tenant_flagship_01',
        userId: `user_${renterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        userName: renterName,
        bookingType,
        startTime: startIso,
        endTime: endIso,
        totalDurationHours: totalCalculatedHours,
        includeOperator,
        operatorName: includeOperator ? 'Ramesh Sharma (Senior CNC & Machine Specialist)' : undefined,
        jobDetails: {
          jobTitle,
          garmentCategory,
          cutFileName,
          panelCount: Number(panelCount) || 1,
          fabricType,
          boltWidthInches: Number(boltWidthInches) || 44,
          estimatedRunMinutes: totalCalculatedHours * 50,
          bedEfficiencyPercent: 94.2,
          specialInstructions
        },
        costBreakdown,
        paymentStatus: 'ESCROW_HOLD',
        reservationStatus: 'CONFIRMED',
        checkInInspectionPassed: false,
        checkOutInspectionPassed: false,
        createdAt: new Date(timestamp).toISOString()
      };

      // Persist to yh_machine_reservations
      const existing = getLocalStorage<MachineReservationRecord[]>('yh_machine_reservations', SEED_MACHINE_RESERVATIONS);
      const updated = [newReservation, ...existing];
      setLocalStorage('yh_machine_reservations', updated);

      // Dispatch data sync event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yh-data-sync', {
          detail: { key: 'yh_machine_reservations', reservation: newReservation }
        }));
      }

      setConfirmedReservation(newReservation);
      if (onSuccess) {
        onSuccess(newReservation);
      }
    } catch (err) {
      console.error('Error creating machine reservation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card-gold rounded-2xl border border-yellow-500/40 shadow-2xl shadow-black/80 bg-[#0F172A]/95 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {confirmedReservation ? 'Machine Reservation Confirmed' : 'Reserve High-Tech Workshop Capacity'}
              </h2>
              <p className="text-xs text-slate-400">
                {machine.name} • <span className="text-yellow-400">{machine.facilityName} ({machine.facilityLocation?.city})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {confirmedReservation ? (
            /* CONFIRMED RESERVATION RECEIPT */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-yellow-950/30 via-slate-900 to-slate-900/90 border border-yellow-500/40 text-center space-y-4 shadow-xl">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                    Escrow Locked • Reservation Ticket
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
                    {confirmedReservation.reservationNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Slot: {new Date(confirmedReservation.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — {new Date(confirmedReservation.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                  </p>
                </div>

                {/* Reservation Summary Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800 text-left text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Machine</span>
                    <span className="font-semibold text-slate-200 truncate block">{confirmedReservation.machineName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Facility</span>
                    <span className="font-semibold text-slate-200">{confirmedReservation.facilityName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Job Title</span>
                    <span className="font-semibold text-yellow-300 truncate block">{confirmedReservation.jobDetails?.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Escrow</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {formatCurrency(confirmedReservation.costBreakdown?.totalAmountInr || 0)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3 text-yellow-400" /> Workshop Check-in Protocol:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Please present this digital ticket upon arrival at {machine.facilityName}. Machine calibration and safety briefing starts 15 minutes before the scheduled start time.
                  </p>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="btn-gold py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Reservation Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Done & View Active Shifts</span>
                </button>
              </div>
            </div>
          ) : (
            /* BOOKING CONFIGURATION & FORM */
            <div className="space-y-6">
              {/* Shift Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Booking Shift Model
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookingType('HOURLY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bookingType === 'HOURLY'
                        ? 'bg-yellow-500/10 border-yellow-400 ring-1 ring-yellow-400/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      {bookingType === 'HOURLY' && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                    <div className="font-bold text-xs text-slate-200">Hourly Window</div>
                    <div className="text-[10px] text-slate-400">Flex 1-12 hrs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('DAILY_SHIFT')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bookingType === 'DAILY_SHIFT'
                        ? 'bg-yellow-500/10 border-yellow-400 ring-1 ring-yellow-400/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      {bookingType === 'DAILY_SHIFT' && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                    <div className="font-bold text-xs text-slate-200">Daily Shift (8h)</div>
                    <div className="text-[10px] text-slate-400">Discounted batch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('PANEL_BATCH')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bookingType === 'PANEL_BATCH'
                        ? 'bg-yellow-500/10 border-yellow-400 ring-1 ring-yellow-400/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Layers className="w-4 h-4 text-yellow-400" />
                      {bookingType === 'PANEL_BATCH' && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                    <div className="font-bold text-xs text-slate-200">Panel Production</div>
                    <div className="text-[10px] text-slate-400">By panel quota</div>
                  </button>
                </div>
              </div>

              {/* Date & Time Configuration */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" /> Schedule Parameters & Duration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Reservation Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().substring(0, 10)}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Shift Start Time</label>
                    <input
                      type="time"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  {bookingType === 'HOURLY' ? (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Duration (Hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={durationHours}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  ) : bookingType === 'DAILY_SHIFT' ? (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Shift Count (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={shiftDays}
                        onChange={(e) => setShiftDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Calculated Batch Time</label>
                      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-yellow-400 font-mono">
                        {totalCalculatedHours} Hours ({panelCount} panels)
                      </div>
                    </div>
                  )}
                </div>

                {/* Collision Warning Banner */}
                {collisionResult.hasConflict ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">Schedule Slot Collision Detected</span>
                      <p className="text-[11px] text-rose-200/90 leading-snug">{collisionResult.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Slot is open and verified clear with 30m maintenance buffer.</span>
                  </div>
                )}
              </div>

              {/* Technician Operator Assistance Toggle */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-yellow-400" />
                    Include Certified Technician Operator
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Experienced technician assists with fabric alignment, blade speeds, and CAD nesting calibration.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-yellow-400 font-semibold">
                    +{formatCurrency(machine.pricing?.operatorAssistanceFeePerHourInr || 600)}/hr
                  </span>
                  <input
                    type="checkbox"
                    checked={includeOperator}
                    onChange={(e) => setIncludeOperator(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Panel Production Details Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-yellow-400" /> Production Job Specifications
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-400">Production Job Title *</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. 12x Royal Sherwani Panel Precision Cutting"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Garment Category</label>
                    <select
                      value={garmentCategory}
                      onChange={(e) => setGarmentCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    >
                      <option value="mens-sherwani">Men's Sherwani</option>
                      <option value="mens-suit">Men's Suit</option>
                      <option value="womens-lehenga">Women's Lehenga</option>
                      <option value="womens-anarkali">Women's Anarkali</option>
                      <option value="womens-corset">Women's Corset</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Panel Batch Count</label>
                    <input
                      type="number"
                      min="1"
                      value={panelCount}
                      onChange={(e) => setPanelCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Fabric Swatch / Composition</label>
                    <input
                      type="text"
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      placeholder="e.g. Mulberry Raw Silk 110 GSM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Cut File Identifier (.DXF / .ISO)</label>
                    <input
                      type="text"
                      value={cutFileName}
                      onChange={(e) => setCutFileName(e.target.value)}
                      placeholder="e.g. nested_cutfile_v2.dxf"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Atelier Renter Information */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Renter & Atelier Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-yellow-400" /> Renter Name
                    </label>
                    <input
                      type="text"
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-yellow-400" /> Atelier
                    </label>
                    <input
                      type="text"
                      value={atelierName}
                      onChange={(e) => setAtelierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-yellow-400" /> Phone
                    </label>
                    <input
                      type="text"
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Transparent Cost Breakdown Matrix */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" /> Transparent Shift Cost Breakdown
                  </span>
                  <span className="text-yellow-400 font-mono text-sm">
                    {formatCurrency(costBreakdown.totalAmountInr)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Machine Base Rate</span>
                    <span className="font-mono text-slate-300">{formatCurrency(costBreakdown.machineBaseCost)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Operator Fee</span>
                    <span className="font-mono text-slate-300">{formatCurrency(costBreakdown.operatorFee)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cleaning & Setup</span>
                    <span className="font-mono text-slate-300">{formatCurrency(costBreakdown.cleaningFee)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST Taxes (18%)</span>
                    <span className="font-mono text-slate-300">{formatCurrency(costBreakdown.taxesInr)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Refundable Security Deposit (held in escrow):</span>
                  <span className="font-mono text-amber-400 font-semibold">{formatCurrency(costBreakdown.securityDeposit)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={collisionResult.hasConflict || isProcessing || !renterName || !atelierName}
                  className="btn-gold py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing ? 'Locking Escrow...' : `Lock Shift & Book (${formatCurrency(costBreakdown.totalAmountInr)})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
