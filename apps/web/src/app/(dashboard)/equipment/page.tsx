'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  PlusCircle, 
  UserCheck, 
  MapPin, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  FileText, 
  Coins, 
  Sparkles, 
  Building, 
  Scissors,
  Check,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  WorkshopMachineListing, 
  MachineHardwareCategory, 
  MachineOperationalStatus, 
  MachineReservationRecord 
} from '@/types/ecosystem';
import { 
  SEED_WORKSHOP_MACHINES, 
  SEED_MACHINE_RESERVATIONS 
} from '@/lib/ecosystem-seeds';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { useCurrency } from '@/components/currency-context';
import { MachineCard } from '@/components/ecosystem/machine-card';
import { MachineBookingModal } from '@/components/ecosystem/machine-booking-modal';
import Breadcrumb from '@/components/breadcrumb';

export default function EquipmentPage() {
  const { formatCurrency } = useCurrency();

  // State
  const [activeTab, setActiveTab] = useState<'catalog' | 'schedule' | 'reservations' | 'list_machine'>('catalog');
  const [machines, setMachines] = useState<WorkshopMachineListing[]>([]);
  const [reservations, setReservations] = useState<MachineReservationRecord[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyOperatorAvailable, setOnlyOperatorAvailable] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Booking Modal State
  const [selectedMachineForBooking, setSelectedMachineForBooking] = useState<WorkshopMachineListing | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Selected Reservation for Ticket View
  const [viewingReservation, setViewingReservation] = useState<MachineReservationRecord | null>(null);

  // List New Machine Form State
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineModel, setNewMachineModel] = useState('');
  const [newMachineCategory, setNewMachineCategory] = useState<MachineHardwareCategory>('CNC_LASER_CUTTER');
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityCity, setNewFacilityCity] = useState('Mumbai');
  const [newHourlyRate, setNewHourlyRate] = useState(2000);
  const [newDailyRate, setNewDailyRate] = useState(13500);
  const [newOperatorFee, setNewOperatorFee] = useState(700);
  const [newSecurityDeposit, setNewSecurityDeposit] = useState(6000);
  const [newBedWidth, setNewBedWidth] = useState(70);
  const [newBedLength, setNewBedLength] = useState(120);
  const [newCompatibleMaterials, setNewCompatibleMaterials] = useState('Raw Silk, Wool Crepe, Velvet');
  const [newSupportedFormats, setNewSupportedFormats] = useState('.dxf, .iso, .cut');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800');
  const [newOperatorProvided, setNewOperatorProvided] = useState(true);
  const [listingSuccess, setListingSuccess] = useState(false);

  // Load Data & Handle Storage Events
  const loadData = () => {
    const storedMachines = getLocalStorage<WorkshopMachineListing[]>('yh_workshop_machines', SEED_WORKSHOP_MACHINES);
    setMachines(storedMachines);

    const storedReservations = getLocalStorage<MachineReservationRecord[]>('yh_machine_reservations', SEED_MACHINE_RESERVATIONS);
    setReservations(storedReservations);
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('yh-data-sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('yh-data-sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter Machines
  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = machine.name.toLowerCase().includes(q);
        const matchesModel = machine.modelNumber.toLowerCase().includes(q);
        const matchesFacility = machine.facilityName.toLowerCase().includes(q);
        const matchesCity = machine.facilityLocation?.city?.toLowerCase().includes(q);
        const matchesMats = machine.specs?.compatibleMaterials?.some(m => m.toLowerCase().includes(q));

        if (!matchesName && !matchesModel && !matchesFacility && !matchesCity && !matchesMats) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'ALL' && machine.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && machine.currentStatus !== selectedStatus) {
        return false;
      }

      // Operator filter
      if (onlyOperatorAvailable && !machine.operatorProvided) {
        return false;
      }

      // City filter
      if (selectedCity !== 'ALL' && machine.facilityLocation?.city?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [machines, searchQuery, selectedCategory, selectedStatus, onlyOperatorAvailable, selectedCity]);

  // Handle Book Machine Trigger
  const handleOpenBookingModal = (machine: WorkshopMachineListing) => {
    setSelectedMachineForBooking(machine);
    setIsBookingModalOpen(true);
  };

  // Handle Cancel Reservation
  const handleCancelReservation = (resId: string) => {
    if (!confirm('Are you sure you want to cancel this machine reservation? Escrow deposit will be refunded.')) {
      return;
    }

    const updated = reservations.map(r => {
      if (r.id === resId) {
        return { ...r, reservationStatus: 'CANCELLED' as const, paymentStatus: 'REFUNDED' as const };
      }
      return r;
    });

    setReservations(updated);
    setLocalStorage('yh_machine_reservations', updated);

    window.dispatchEvent(new CustomEvent('yh-data-sync', {
      detail: { key: 'yh_machine_reservations' }
    }));
  };

  // Handle List New Machine Submit
  const handleCreateMachineListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim() || !newFacilityName.trim()) return;

    const newListing: WorkshopMachineListing = {
      id: `mch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newMachineName,
      modelNumber: newMachineModel || 'MODEL-2026',
      category: newMachineCategory,
      facilityName: newFacilityName,
      facilityLocation: {
        address: 'Craft Hub Lane',
        city: newFacilityCity,
        state: newFacilityCity === 'Mumbai' ? 'Maharashtra' : newFacilityCity === 'New Delhi' ? 'Delhi' : 'Karnataka',
        pincode: '400001',
        latitude: 18.9288,
        longitude: 72.8331
      },
      specs: {
        bedWidthInches: Number(newBedWidth) || 60,
        bedLengthInches: Number(newBedLength) || 100,
        laserPowerWatts: newMachineCategory === 'CNC_LASER_CUTTER' ? 180 : undefined,
        needleHeads: newMachineCategory === 'MULTI_HEAD_EMBROIDERY' ? 8 : undefined,
        compatibleMaterials: newCompatibleMaterials.split(',').map(m => m.trim()).filter(Boolean),
        supportedFileFormats: newSupportedFormats.split(',').map(f => f.trim()).filter(Boolean),
        powerRequirement: 'AC 220V / 415V 3-Phase'
      },
      pricing: {
        hourlyRateInr: Number(newHourlyRate) || 1800,
        dailyShiftRateInr: Number(newDailyRate) || 12000,
        operatorAssistanceFeePerHourInr: Number(newOperatorFee) || 600,
        securityDepositInr: Number(newSecurityDeposit) || 5000
      },
      operatorProvided: newOperatorProvided,
      requiresCertification: false,
      currentStatus: 'AVAILABLE',
      imageUrl: newImageUrl,
      rating: 5.0,
      reviewsCount: 1,
      totalHoursRun: 0,
      nextMaintenanceDate: '2026-10-01'
    };

    const updatedMachines = [newListing, ...machines];
    setMachines(updatedMachines);
    setLocalStorage('yh_workshop_machines', updatedMachines);

    window.dispatchEvent(new CustomEvent('yh-data-sync', {
      detail: { key: 'yh_workshop_machines', machine: newListing }
    }));

    setListingSuccess(true);
    setTimeout(() => {
      setListingSuccess(false);
      setActiveTab('catalog');
      setNewMachineName('');
      setNewFacilityName('');
    }, 1500);
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalMachines = machines.length;
    const availableCount = machines.filter(m => m.currentStatus === 'AVAILABLE').length;
    const activeBookingsCount = reservations.filter(r => r.reservationStatus === 'CONFIRMED' || r.reservationStatus === 'IN_PROGRESS').length;
    const totalHoursReserved = reservations
      .filter(r => r.reservationStatus !== 'CANCELLED')
      .reduce((sum, r) => sum + (r.totalDurationHours || 0), 0);
    const facilitiesCount = new Set(machines.map(m => m.facilityName)).size;

    return {
      totalMachines,
      availableCount,
      activeBookingsCount,
      totalHoursReserved,
      facilitiesCount
    };
  }, [machines, reservations]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Equipment & Machines', active: true }
        ]}
      />

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-8 border border-yellow-500/30 bg-gradient-to-r from-[#0B0F19] via-slate-900 to-[#141C2E]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Machines as a Service • High-Tech Atelier Capacity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Workshop Equipment & Machinery Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Reserve industrial Mimaki textile printers, Lectra laser cutters, and Tajima multi-head embroidery machines by the hour or shift with automated 30-minute collision detection.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('list_machine')}
              className="btn-gold py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Equipment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'reservations' ? 'catalog' : 'reservations')}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span>{activeTab === 'reservations' ? 'Machine Catalog' : 'My Active Shifts'}</span>
            </button>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-yellow-400" /> Total Machinery
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">
              {stats.totalMachines} Units
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Available Capacity
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {stats.availableCount} Ready
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" /> Total Hours Reserved
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">
              {stats.totalHoursReserved} Hours
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Building className="w-3.5 h-3.5 text-cyan-400" /> Partner Fashion Hubs
            </span>
            <span className="text-xl font-bold text-cyan-300 font-mono">
              {stats.facilitiesCount} Facilities
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Machinery Catalog ({filteredMachines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Live Shift Calendar & Slots</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reservations'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Bookings & Shifts ({reservations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('list_machine')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'list_machine'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Workshop Equipment</span>
        </button>
      </div>

      {/* TAB 1: MACHINERY CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl glass-card border border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search machine model, facility name, city (Mimaki, Lectra, Tajima, Mumbai)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Hardware Category */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Hardware Types</option>
                  <option value="DIGITAL_TEXTILE_PRINTER">Digital Textile Printers</option>
                  <option value="CNC_LASER_CUTTER">CNC Laser Cutters</option>
                  <option value="MULTI_HEAD_EMBROIDERY">Multi-Head Embroidery</option>
                  <option value="HEAVY_STITCHING_UNIT">Heavy Stitching Units</option>
                  <option value="STEAM_FINISHER_FUSING">Form Finishers & Fusing</option>
                </select>
              </div>

              {/* Operational Status */}
              <div className="md:col-span-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Operational Statuses</option>
                  <option value="AVAILABLE">Available Now</option>
                  <option value="IN_USE">Active Shift</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
            </div>

            {/* Filter Pills & City Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-yellow-400" /> City Hub:
                </span>
                {['ALL', 'Mumbai', 'New Delhi', 'Varanasi', 'Bengaluru'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                      selectedCity === city
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyOperatorAvailable}
                    onChange={(e) => setOnlyOperatorAvailable(e.target.checked)}
                    className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950"
                  />
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-yellow-400" /> Operator Included Only
                  </span>
                </label>

                {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedCity !== 'ALL' || onlyOperatorAvailable) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                      setSelectedStatus('ALL');
                      setSelectedCity('ALL');
                      setOnlyOperatorAvailable(false);
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Machine Grid */}
          {filteredMachines.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Workshop Machinery Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No machines match your active search filters. Try adjusting your query or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedCity('ALL');
                  setOnlyOperatorAvailable(false);
                }}
                className="btn-gold text-xs py-2 px-4 rounded-xl mt-2"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map((mch) => (
                <MachineCard
                  key={mch.id}
                  machine={mch}
                  onBook={handleOpenBookingModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE SCHEDULE & CALENDAR VIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" /> Machine Shift Schedule & Time Allocation
                </h3>
                <p className="text-xs text-slate-400">
                  Visual calendar of upcoming reservation slots across regional fashion labs. 30-minute buffers enforced between shifts.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Confirmed Shift
                </span>
                <span className="flex items-center gap-1 text-blue-400 ml-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> In Progress
                </span>
              </div>
            </div>

            {/* Schedule Timeline Grid */}
            <div className="space-y-4 pt-4">
              {machines.map((machine) => {
                const machineRes = reservations.filter(r => r.machineId === machine.id && r.reservationStatus !== 'CANCELLED');

                return (
                  <div key={machine.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-yellow-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-200">{machine.name}</h4>
                          <span className="text-[11px] text-slate-400">{machine.facilityName} ({machine.facilityLocation?.city})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(machine)}
                        className="btn-gold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book Slot</span>
                      </button>
                    </div>

                    {/* Booked slots chips */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {machineRes.length === 0 ? (
                        <div className="text-[11px] text-emerald-400/90 py-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All upcoming hourly and daily shift windows are open.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Reserved Windows:</span>
                          <div className="flex flex-wrap gap-2">
                            {machineRes.map((res) => (
                              <div
                                key={res.id}
                                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-yellow-500/30 text-xs flex items-center gap-2"
                              >
                                <span className="font-mono text-yellow-400 font-semibold">{res.reservationNumber}</span>
                                <span className="text-slate-400">|</span>
                                <span className="text-slate-300">
                                  {new Date(res.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} ({new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                  {res.totalDurationHours}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY RESERVATIONS & ACTIVE BOOKINGS */}
      {activeTab === 'reservations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Atelier Equipment Reservations & Escrow Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Track upcoming machine reservations, inspection status, and download printable receipts.
                </p>
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No machine reservations found. Book capacity from the Machinery Catalog.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                      <th className="pb-3 px-3">Ticket / Ref</th>
                      <th className="pb-3 px-3">Machine & Facility</th>
                      <th className="pb-3 px-3">Production Job Details</th>
                      <th className="pb-3 px-3">Scheduled Shift</th>
                      <th className="pb-3 px-3">Duration</th>
                      <th className="pb-3 px-3 text-right">Escrow Amount</th>
                      <th className="pb-3 px-3 text-center">Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-yellow-400">
                          {res.reservationNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{res.machineName}</div>
                          <div className="text-[11px] text-slate-400">{res.facilityName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-300 font-medium">{res.jobDetails?.jobTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            {res.jobDetails?.panelCount} Panels • {res.jobDetails?.fabricType}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">
                          <div>{new Date(res.startTime).toLocaleDateString()}</div>
                          <div className="text-slate-500 font-mono">
                            {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {res.totalDurationHours} hrs
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(res.costBreakdown?.totalAmountInr || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            res.reservationStatus === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : res.reservationStatus === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : res.reservationStatus === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {res.reservationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingReservation(res)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="View Ticket"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {res.reservationStatus === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleCancelReservation(res.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIST YOUR EQUIPMENT */}
      {activeTab === 'list_machine' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl glass-card-gold border border-yellow-500/40 bg-slate-950/90 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-yellow-400" /> List Workshop Machinery & Share Capacity
            </h2>
            <p className="text-xs text-slate-400">
              Monetize idle machinery during non-peak atelier hours with automated escrow protection.
            </p>
          </div>

          {listingSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Machine successfully listed and available in regional atelier network!</span>
            </div>
          )}

          <form onSubmit={handleCreateMachineListing} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Machine Name & Hardware Model *</label>
              <input
                type="text"
                required
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                placeholder="e.g. Lectra Vector Fashion Q80 Automated Fabric Cutter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Hardware Category</label>
                <select
                  value={newMachineCategory}
                  onChange={(e) => setNewMachineCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="CNC_LASER_CUTTER">CNC Laser Cutter</option>
                  <option value="DIGITAL_TEXTILE_PRINTER">Digital Textile Printer</option>
                  <option value="MULTI_HEAD_EMBROIDERY">Multi-Head Embroidery</option>
                  <option value="HEAVY_STITCHING_UNIT">Heavy Stitching Unit</option>
                  <option value="STEAM_FINISHER_FUSING">Form Finisher & Fusing Press</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Facility / Atelier Name</label>
                <input
                  type="text"
                  required
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  placeholder="e.g. Shahpur Jat Fashion Lab"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">City / Regional Hub</label>
                <select
                  value={newFacilityCity}
                  onChange={(e) => setNewFacilityCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Varanasi">Varanasi</option>
                  <option value="Bengaluru">Bengaluru</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Hourly Rate (INR)</label>
                <input
                  type="number"
                  min="500"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Daily Shift Rate (8h)</label>
                <input
                  type="number"
                  min="2000"
                  value={newDailyRate}
                  onChange={(e) => setNewDailyRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Operator Fee (/hr)</label>
                <input
                  type="number"
                  min="0"
                  value={newOperatorFee}
                  onChange={(e) => setNewOperatorFee(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Security Deposit</label>
                <input
                  type="number"
                  min="1000"
                  value={newSecurityDeposit}
                  onChange={(e) => setNewSecurityDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Bed Width x Length (Inches)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newBedWidth}
                    onChange={(e) => setNewBedWidth(Number(e.target.value))}
                    placeholder="Width"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                  />
                  <input
                    type="number"
                    value={newBedLength}
                    onChange={(e) => setNewBedLength(Number(e.target.value))}
                    placeholder="Length"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Compatible Fabrics & Materials</label>
                <input
                  type="text"
                  value={newCompatibleMaterials}
                  onChange={(e) => setNewCompatibleMaterials(e.target.value)}
                  placeholder="e.g. Raw Silk, Velvet, Denim, Leather"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Supported File Formats</label>
                <input
                  type="text"
                  value={newSupportedFormats}
                  onChange={(e) => setNewSupportedFormats(e.target.value)}
                  placeholder="e.g. .dxf, .iso, .dst, .tiff"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Machine Photo URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 pt-2">
              <input
                type="checkbox"
                checked={newOperatorProvided}
                onChange={(e) => setNewOperatorProvided(e.target.checked)}
                className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950"
              />
              <span className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-yellow-400" /> Technician Operator Available On-Site
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-gold py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Equipment Listing</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Modal */}
      {selectedMachineForBooking && (
        <MachineBookingModal
          machine={selectedMachineForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedMachineForBooking(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Ticket / Receipt Modal View */}
      {viewingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-card-gold rounded-2xl border border-yellow-500/40 shadow-2xl bg-[#0F172A]/95 overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>Reservation Ticket: {viewingReservation.reservationNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingReservation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 text-sm">{viewingReservation.machineName}</span>
                  <span className="font-mono text-yellow-400 font-bold">{viewingReservation.reservationNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Facility: <span className="text-slate-200 font-semibold">{viewingReservation.facilityName}</span></div>
                  <div>Renter: <span className="text-slate-200 font-semibold">{viewingReservation.userName}</span></div>
                  <div>Scheduled: <span className="text-slate-200">{new Date(viewingReservation.startTime).toLocaleString()}</span></div>
                  <div>Duration: <span className="text-slate-200 font-mono">{viewingReservation.totalDurationHours} Hours</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-300 block">Cost Breakdown:</span>
                <div className="flex justify-between"><span>Machine Base:</span><span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.machineBaseCost || 0)}</span></div>
                <div className="flex justify-between"><span>Operator Fee:</span><span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.operatorFee || 0)}</span></div>
                <div className="flex justify-between"><span>Cleaning & Setup:</span><span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.cleaningFee || 0)}</span></div>
                <div className="flex justify-between"><span>18% GST:</span><span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.taxesInr || 0)}</span></div>
                <div className="flex justify-between"><span>Security Deposit:</span><span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.securityDeposit || 0)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-emerald-400 text-xs">
                  <span>Total Escrow Amount:</span>
                  <span className="font-mono">{formatCurrency(viewingReservation.costBreakdown?.totalAmountInr || 0)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-gold py-2 px-4 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReservation(null)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
