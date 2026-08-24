'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Phone, 
  Mail, 
  User, 
  ChevronRight, 
  Crown, 
  Layers, 
  Download, 
  Percent, 
  Zap, 
  FileText, 
  Building2, 
  Video, 
  Home, 
  Plus, 
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  CertifiedStylistProfile, 
  StylistConsultationBookingRecord, 
  TenantTrialOnboardingProfile, 
  StylistSpecialization, 
  ConsultationMode, 
  GarmentCategory 
} from '@/types/ecosystem';
import { 
  SEED_CERTIFIED_STYLISTS, 
  SEED_STYLIST_BOOKINGS, 
  SEED_TENANT_TRIAL_PROFILE 
} from '@/lib/ecosystem-seeds';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { useCurrency } from '@/components/currency-context';
import { useToast } from '@/components/toast-context';
import { StylistCard } from '@/components/ecosystem/stylist-card';
import { TrialStatusBanner } from '@/components/ecosystem/trial-status-banner';
import { Breadcrumb } from '@/components/breadcrumb';
import { evaluateTrialEntitlements } from '@/lib/ecosystem-algorithms';

const CITIES = [
  'ALL',
  'Mumbai',
  'New Delhi',
  'Bengaluru',
  'Lucknow',
  'Jaipur',
  'Kolkata',
  'Hyderabad',
  'Chennai'
];

const SPECIALTY_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Specialties' },
  { id: 'BRIDAL_TROUSSEAU', label: 'Bridal Trousseau' },
  { id: 'BESPOKE_SUITING_CONSULTANT', label: 'Bespoke Suiting' },
  { id: 'ZARDOZI_MOTIF_CURATION', label: 'Zardozi Motif Curation' },
  { id: 'COLOR_SEASONAL_ANALYSIS', label: 'Color Analysis' },
  { id: 'INDO_WESTERN_FUSION', label: 'Indo-Western Fusion' },
  { id: 'ROYAL_HERITAGE_DRAPING', label: 'Heritage Draping' }
];

export default function StylistsPage() {
  const { formatCurrency } = useCurrency();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'directory' | 'bookings' | 'trial'>('directory');
  const [stylists, setStylists] = useState<CertifiedStylistProfile[]>([]);
  const [bookings, setBookings] = useState<StylistConsultationBookingRecord[]>([]);
  const [trialProfile, setTrialProfile] = useState<TenantTrialOnboardingProfile>(SEED_TENANT_TRIAL_PROFILE);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RATING' | 'EXPERIENCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'CONSULTATIONS'>('RATING');

  // Booking Modal State
  const [selectedStylistForBooking, setSelectedStylistForBooking] = useState<CertifiedStylistProfile | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingClientName, setBookingClientName] = useState('');
  const [bookingClientPhone, setBookingClientPhone] = useState('');
  const [bookingClientEmail, setBookingClientEmail] = useState('');
  const [bookingGarment, setBookingGarment] = useState<GarmentCategory>('womens-lehenga');
  const [bookingMode, setBookingMode] = useState<ConsultationMode>('IN_PERSON_ATELIER');
  const [bookingDate, setBookingDate] = useState('2026-08-28');
  const [bookingSlot, setBookingSlot] = useState('11:00 AM');
  const [bookingDuration, setBookingDuration] = useState<60 | 90>(60);
  const [bookingNotes, setBookingNotes] = useState('');

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'ATELIER_PRO' | 'HAUTE_ENTERPRISE'>('ATELIER_PRO');

  // Load Data
  const loadData = () => {
    const storedStylists = getLocalStorage<CertifiedStylistProfile[]>('yh_certified_stylists', SEED_CERTIFIED_STYLISTS);
    setStylists(storedStylists);

    const storedBookings = getLocalStorage<StylistConsultationBookingRecord[]>('yh_stylist_bookings', SEED_STYLIST_BOOKINGS);
    setBookings(storedBookings);

    const storedTrial = getLocalStorage<TenantTrialOnboardingProfile>('yh_tenant_trial_profile', SEED_TENANT_TRIAL_PROFILE);
    setTrialProfile(storedTrial);
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

  const trialDiscountPercent = trialProfile.entitlements.stylistBookingFeeDiscountPercent || 0;

  // Filtered Stylists
  const filteredStylists = useMemo(() => {
    return stylists
      .filter((stylist) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = stylist.fullName.toLowerCase().includes(q);
          const matchesBio = stylist.profileBio.toLowerCase().includes(q);
          const matchesTitle = stylist.title.toLowerCase().includes(q);
          const matchesCity = stylist.location.city.toLowerCase().includes(q);
          const matchesDistrict = stylist.location.areaDistrict.toLowerCase().includes(q);
          const matchesSpecialty = stylist.specializations.some((s) => s.toLowerCase().includes(q));
          if (!matchesName && !matchesBio && !matchesTitle && !matchesCity && !matchesDistrict && !matchesSpecialty) {
            return false;
          }
        }

        // City filter
        if (selectedCity !== 'ALL') {
          if (stylist.location.city.toLowerCase() !== selectedCity.toLowerCase()) {
            return false;
          }
        }

        // Specialty filter
        if (selectedSpecialty !== 'ALL') {
          if (!stylist.specializations.includes(selectedSpecialty as StylistSpecialization)) {
            return false;
          }
        }

        // Mode filter
        if (selectedMode !== 'ALL') {
          if (!stylist.consultationModes.includes(selectedMode as ConsultationMode)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'RATING') return b.rating - a.rating;
        if (sortBy === 'EXPERIENCE') return b.experienceYears - a.experienceYears;
        if (sortBy === 'PRICE_ASC') return a.hourlyFeeInr - b.hourlyFeeInr;
        if (sortBy === 'PRICE_DESC') return b.hourlyFeeInr - a.hourlyFeeInr;
        if (sortBy === 'CONSULTATIONS') return b.consultationsCompletedCount - a.consultationsCompletedCount;
        return 0;
      });
  }, [stylists, searchQuery, selectedCity, selectedSpecialty, selectedMode, sortBy]);

  // Open Booking Modal
  const handleOpenBookingModal = (stylist: CertifiedStylistProfile) => {
    setSelectedStylistForBooking(stylist);
    setBookingClientName('Sunita Mehra');
    setBookingClientPhone('+91 98201 45678');
    setBookingClientEmail('sunita.mehra@luxuryclient.in');
    setBookingMode(stylist.consultationModes[0] || 'IN_PERSON_ATELIER');
    setBookingDuration(60);
    setBookingNotes('Bridal trousseau styling and silhouette drape consultation.');
    
    // Pick first available slot
    if (stylist.availableWeeklySlots && stylist.availableWeeklySlots.length > 0) {
      setBookingSlot(stylist.availableWeeklySlots[0].timeSlots[0] || '11:00 AM');
    }

    setIsBookingModalOpen(true);
  };

  // Submit Booking
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStylistForBooking) return;

    if (!bookingClientName.trim() || !bookingClientPhone.trim()) {
      toast.error('Please enter client name and contact phone number.');
      return;
    }

    const durationMultiplier = bookingDuration === 90 ? 1.5 : 1.0;
    const baseFee = Math.round(selectedStylistForBooking.hourlyFeeInr * durationMultiplier);
    const discountAmount = Math.round(baseFee * (trialDiscountPercent / 100));
    const totalPaid = baseFee - discountAmount;

    const newBooking: StylistConsultationBookingRecord = {
      id: `sty_bk_${Date.now()}`,
      bookingNumber: `STY-2026-${Math.floor(100 + Math.random() * 900)}`,
      stylistId: selectedStylistForBooking.id,
      stylistName: selectedStylistForBooking.fullName,
      stylistAvatar: selectedStylistForBooking.avatarUrl,
      tenantId: trialProfile.tenantId,
      clientName: bookingClientName,
      clientPhone: bookingClientPhone,
      clientEmail: bookingClientEmail,
      garmentCategoryOfInterest: bookingGarment,
      consultationMode: bookingMode,
      scheduledAt: `${bookingDate}T${bookingSlot === '11:00 AM' ? '11:00:00' : '15:00:00'}Z`,
      durationMinutes: bookingDuration,
      feeAmountInr: baseFee,
      discountAppliedInr: discountAmount,
      totalPaidInr: totalPaid,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      clientBriefNotes: bookingNotes,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    setLocalStorage('yh_stylist_bookings', updatedBookings);

    // Update trial usage counters
    const updatedTrial: TenantTrialOnboardingProfile = {
      ...trialProfile,
      usageCounters: {
        ...trialProfile.usageCounters,
        stylistConsultationsBooked: (trialProfile.usageCounters.stylistConsultationsBooked || 0) + 1
      }
    };
    setTrialProfile(updatedTrial);
    setLocalStorage('yh_tenant_trial_profile', updatedTrial);

    // Sync
    window.dispatchEvent(new CustomEvent('yh-data-sync'));

    setIsBookingModalOpen(false);
    toast.success(`Consultation booked with ${selectedStylistForBooking.fullName} (Ref: ${newBooking.bookingNumber})`);
    setActiveTab('bookings');
  };

  // Handle Plan Upgrade
  const handleUpgradeTier = () => {
    const upgradedTier = selectedUpgradeTier;
    const isEnterprise = upgradedTier === 'HAUTE_ENTERPRISE';

    const updatedTrial: TenantTrialOnboardingProfile = {
      ...trialProfile,
      tier: upgradedTier,
      isTrialActive: true,
      entitlements: {
        maxBlueprintsPerMonth: isEnterprise ? 999 : 50,
        exportResolutionDpi: 300,
        allowWatermarkFreeExports: true,
        allow1to1DxfExport: true,
        allowCommercialBuyoutMarketplace: true,
        maxTailorBidsPerMonth: isEnterprise ? 999 : 25,
        stylistBookingFeeDiscountPercent: isEnterprise ? 25 : 20
      }
    };

    setTrialProfile(updatedTrial);
    setLocalStorage('yh_tenant_trial_profile', updatedTrial);
    window.dispatchEvent(new CustomEvent('yh-data-sync'));

    setIsUpgradeModalOpen(false);
    toast.success(`Successfully upgraded atelier account to ${isEnterprise ? 'Haute Enterprise' : 'Atelier Pro'} tier!`);
  };

  // Handle Extend Trial
  const handleExtendTrial = () => {
    const currentExpiry = new Date(trialProfile.trialExpiresAt);
    currentExpiry.setDate(currentExpiry.getDate() + 30);

    const updatedTrial: TenantTrialOnboardingProfile = {
      ...trialProfile,
      trialExpiresAt: currentExpiry.toISOString(),
      daysRemaining: trialProfile.daysRemaining + 30,
      isTrialActive: true
    };

    setTrialProfile(updatedTrial);
    setLocalStorage('yh_tenant_trial_profile', updatedTrial);
    window.dispatchEvent(new CustomEvent('yh-data-sync'));

    toast.success('Trial successfully extended by 30 days!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              Certified Stylists & Trial Hub
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Layer 5: RedHouse OS Onboarding Journey, Certified Area Stylists & Haute Draping Consultation
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stylist Directory ({stylists.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('trial')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'trial'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trial Tier Status
          </button>
        </div>
      </div>

      {/* 3-Month Free Trial Status Banner */}
      <TrialStatusBanner
        trialProfile={trialProfile}
        onUpgradeClick={() => setIsUpgradeModalOpen(true)}
        onExtendTrialClick={handleExtendTrial}
        onViewEntitlementsClick={() => setActiveTab('trial')}
      />

      {/* ========================================================================= */}
      {/* TAB 1: STYLIST DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/20 backdrop-blur-xl space-y-3 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stylists by name, district, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* City Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 text-xs text-slate-200 focus:outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c === 'ALL' ? 'All Hub Cities' : `${c} Hub`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 text-xs text-slate-200 focus:outline-none"
                >
                  {SPECIALTY_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-purple-500/50 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="RATING">Top Rated</option>
                  <option value="EXPERIENCE">Most Experienced</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="CONSULTATIONS">Most Consultations</option>
                </select>
              </div>
            </div>

            {/* Sub-Filters / Chips */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">Consultation Mode:</span>
                <button
                  onClick={() => setSelectedMode('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedMode === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setSelectedMode('IN_PERSON_ATELIER')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                    selectedMode === 'IN_PERSON_ATELIER'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Building2 className="w-3 h-3" /> Atelier Visit
                </button>
                <button
                  onClick={() => setSelectedMode('VIRTUAL_HD')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                    selectedMode === 'VIRTUAL_HD'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Video className="w-3 h-3" /> Virtual HD
                </button>
                <button
                  onClick={() => setSelectedMode('CLIENT_WARDROBE_VISIT')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                    selectedMode === 'CLIENT_WARDROBE_VISIT'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Home className="w-3 h-3" /> Wardrobe Visit
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Showing <strong className="text-purple-300">{filteredStylists.length}</strong> verified stylists
              </div>
            </div>
          </div>

          {/* Stylists Grid */}
          {filteredStylists.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Sparkles className="w-8 h-8 text-purple-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No stylists match your filter criteria</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting the city or specialization filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('ALL');
                  setSelectedSpecialty('ALL');
                  setSelectedMode('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStylists.map((stylist) => (
                <StylistCard
                  key={stylist.id}
                  stylist={stylist}
                  onBookConsultation={handleOpenBookingModal}
                  discountPercent={trialDiscountPercent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSULTATION BOOKINGS TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Consultation Bookings Roster
            </h2>
            <button
              onClick={() => setActiveTab('directory')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Book New Stylist
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Calendar className="w-8 h-8 text-purple-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No consultations booked yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore our certified RedHouse OS stylists to schedule your first bridal or bespoke session.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Browse Stylist Directory
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-purple-300 font-bold text-sm">
                      {booking.stylistAvatar ? (
                        <img src={booking.stylistAvatar} alt={booking.stylistName} className="w-full h-full object-cover" />
                      ) : (
                        booking.stylistName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-300">
                          {booking.bookingNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {booking.bookingStatus}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          &bull; {booking.consultationMode.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                        Consultation with {booking.stylistName} for {booking.clientName}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {booking.durationMinutes} Minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-purple-400" />
                          {booking.clientPhone}
                        </span>
                      </div>

                      {booking.clientBriefNotes && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg mt-2 border border-slate-800/80 italic">
                          "{booking.clientBriefNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between self-stretch md:self-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Paid</span>
                      <div className="flex items-baseline gap-1.5 md:justify-end">
                        <span className="text-lg font-extrabold text-purple-300">
                          {formatCurrency(booking.totalPaidInr)}
                        </span>
                        {booking.discountAppliedInr > 0 && (
                          <span className="text-xs text-emerald-400 font-semibold">
                            (Saved {formatCurrency(booking.discountAppliedInr)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Escrow Locked
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRIAL TIER STATUS & ONBOARDING JOURNEY */}
      {/* ========================================================================= */}
      {activeTab === 'trial' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                RedHouse OS Architecture
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-2">
                Atelier Onboarding Tiers & Security Entitlement Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparing current RedHouse OS 90-Day Free Trial capabilities against Atelier Pro and Haute Enterprise.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Free Trial Tier */}
              <div className={`p-5 rounded-2xl border ${trialProfile.tier === 'PURPLE_COGS_FREE_TRIAL' ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-500/10' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                    Active Plan
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">90-Day Free</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">RedHouse OS Trial</h3>
                <p className="text-xs text-slate-400 mt-1">Designed for emerging studios, fashion design schools & indie creators.</p>
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 5 Blueprint creations / mo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 150 DPI preview export</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 15% Stylist booking discount</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 3 Tailor RFQ bids / mo</div>
                  <div className="flex items-center gap-2 text-amber-400"><Clock className="w-3.5 h-3.5" /> Watermarked previews</div>
                </div>
              </div>

              {/* Atelier Pro */}
              <div className={`p-5 rounded-2xl border ${trialProfile.tier === 'ATELIER_PRO' ? 'bg-amber-950/30 border-yellow-500 shadow-lg shadow-yellow-500/10' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300">
                    Most Popular
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-400">₹14,999 / mo</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">Atelier Pro</h3>
                <p className="text-xs text-slate-400 mt-1">For growing couture ateliers & bespoke menswear tailoring houses.</p>
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> 50 Blueprints / mo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> 300+ DPI Vector & 1:1 DXF</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> Watermark-Free Export</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> 20% Stylist booking discount</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> 25 Tailor RFQ bids / mo</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUpgradeTier('ATELIER_PRO');
                    setIsUpgradeModalOpen(true);
                  }}
                  className="w-full mt-5 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:from-yellow-400 hover:to-amber-400 transition-all"
                >
                  {trialProfile.tier === 'ATELIER_PRO' ? 'Current Tier' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Haute Enterprise */}
              <div className={`p-5 rounded-2xl border ${trialProfile.tier === 'HAUTE_ENTERPRISE' ? 'bg-purple-950/30 border-purple-400 shadow-lg shadow-purple-500/10' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                    High Volume
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-300">₹39,999 / mo</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">Haute Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">Multi-branch luxury fashion houses & international bridal couture brands.</p>
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Unlimited Blueprints & DXF</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 300+ DPI 3D CAD / ZPRJ / DXF</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Commercial Buyout Licensing</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 25% Stylist discount + VIP Concierge</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Priority Machine Scheduler</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUpgradeTier('HAUTE_ENTERPRISE');
                    setIsUpgradeModalOpen(true);
                  }}
                  className="w-full mt-5 py-2 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                >
                  {trialProfile.tier === 'HAUTE_ENTERPRISE' ? 'Current Tier' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOOKING MODAL */}
      {/* ========================================================================= */}
      {isBookingModalOpen && selectedStylistForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                Schedule Appointment
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">
                Book Consultation with {selectedStylistForBooking.fullName}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedStylistForBooking.title} &bull; {selectedStylistForBooking.location.areaDistrict}, {selectedStylistForBooking.location.city}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
              {/* Client Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingClientName}
                    onChange={(e) => setBookingClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 focus:outline-none"
                    placeholder="e.g. Sunita Mehra"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingClientPhone}
                    onChange={(e) => setBookingClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 focus:outline-none"
                    placeholder="+91 98201 45678"
                  />
                </div>
              </div>

              {/* Client Email & Garment Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={bookingClientEmail}
                    onChange={(e) => setBookingClientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 focus:outline-none"
                    placeholder="client@domain.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Garment of Interest
                  </label>
                  <select
                    value={bookingGarment}
                    onChange={(e) => setBookingGarment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 focus:outline-none"
                  >
                    <option value="womens-lehenga">Bridal Lehenga</option>
                    <option value="mens-sherwani">Imperial Sherwani</option>
                    <option value="mens-suit">Bespoke Savile Row Suit</option>
                    <option value="womens-anarkali">Mughal Kalidar Anarkali</option>
                    <option value="womens-blouse">Couture Blouse</option>
                    <option value="womens-gown">Evening Gown</option>
                    <option value="womens-corset">Victorian Corset</option>
                  </select>
                </div>
              </div>

              {/* Consultation Mode */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedStylistForBooking.consultationModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBookingMode(mode)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        bookingMode === mode
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'IN_PERSON_ATELIER' && 'Atelier'}
                      {mode === 'VIRTUAL_HD' && 'Virtual HD'}
                      {mode === 'CLIENT_WARDROBE_VISIT' && 'Wardrobe'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Slot & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none text-xs"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Duration
                  </label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value) as any)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none text-xs"
                  >
                    <option value={60}>60 Mins</option>
                    <option value={90}>90 Mins</option>
                  </select>
                </div>
              </div>

              {/* Brief Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Styling Notes & Specific Requests
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none resize-none"
                  placeholder="e.g. Seeking color palette guidance and silhouette proportion balancing for reception lehenga."
                />
              </div>

              {/* Fee Breakdown Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Base Fee ({bookingDuration}m):</span>
                  <span>{formatCurrency(Math.round(selectedStylistForBooking.hourlyFeeInr * (bookingDuration === 90 ? 1.5 : 1)))}</span>
                </div>
                {trialDiscountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Trial Onboarding Perk ({trialDiscountPercent}% OFF):</span>
                    <span>-{formatCurrency(Math.round(selectedStylistForBooking.hourlyFeeInr * (bookingDuration === 90 ? 1.5 : 1) * (trialDiscountPercent / 100)))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-100 pt-1.5 border-t border-slate-800">
                  <span>Total Amount to Pay:</span>
                  <span className="text-purple-300 font-extrabold">
                    {formatCurrency(
                      Math.round(
                        selectedStylistForBooking.hourlyFeeInr *
                          (bookingDuration === 90 ? 1.5 : 1) *
                          (1 - trialDiscountPercent / 100)
                      )
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30"
                >
                  Confirm & Lock Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPGRADE MODAL */}
      {/* ========================================================================= */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-yellow-500/30 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Upgrade Atelier Account</h3>
                <p className="text-xs text-slate-400">Unlock high-res 300+ DPI vector exports & unlimited blueprints.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setSelectedUpgradeTier('ATELIER_PRO')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedUpgradeTier === 'ATELIER_PRO'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Atelier Pro Tier</span>
                  <span className="font-mono text-xs font-bold">₹14,999 / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">300+ DPI vector DXF, watermark-free downloads, 20% stylist perk.</p>
              </div>

              <div
                onClick={() => setSelectedUpgradeTier('HAUTE_ENTERPRISE')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedUpgradeTier === 'HAUTE_ENTERPRISE'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Haute Enterprise Tier</span>
                  <span className="font-mono text-xs font-bold">₹39,999 / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Unlimited blueprints, commercial IP buyout, priority machine bookings.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeTier}
                className="px-5 py-2 rounded-xl text-slate-950 font-bold bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 shadow-lg shadow-yellow-500/20"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
