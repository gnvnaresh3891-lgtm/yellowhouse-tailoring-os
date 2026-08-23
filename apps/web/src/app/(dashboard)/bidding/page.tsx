'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  Send, 
  CheckCircle2, 
  Clock, 
  Award, 
  DollarSign, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  X, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Users, 
  FileText, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Briefcase
} from 'lucide-react';
import { 
  ArtisanPortfolioProfile, 
  ProductionDesignBrief, 
  TailorProductionBid, 
  ProductionContractRecord,
  ArtisanSpecialty,
  MilestoneProposalItem,
  ProductionMilestoneStatus
} from '@/types/ecosystem';
import { 
  SEED_ARTISAN_PORTFOLIOS, 
  SEED_PRODUCTION_BRIEFS, 
  SEED_TAILOR_BIDS, 
  SEED_PRODUCTION_CONTRACTS 
} from '@/lib/ecosystem-seeds';
import { transitionContractMilestone } from '@/lib/ecosystem-algorithms';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { dispatchSyncEvent } from '@/lib/state-sync-utils';
import { useToast } from '@/components/toast-context';
import { useCurrency } from '@/components/currency-context';

import { TailorBidCard } from '@/components/ecosystem/tailor-bid-card';
import { BriefSubmissionModal } from '@/components/ecosystem/brief-submission-modal';

export default function BiddingPage() {
  const toast = useToast();
  const { formatCurrency } = useCurrency();

  // State
  const [artisans, setArtisans] = useState<ArtisanPortfolioProfile[]>([]);
  const [briefs, setBriefs] = useState<ProductionDesignBrief[]>([]);
  const [bids, setBids] = useState<TailorProductionBid[]>([]);
  const [contracts, setContracts] = useState<ProductionContractRecord[]>([]);

  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'directory' | 'arena' | 'contracts'>('directory');

  // Filters for Artisan Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Briefs & Bids View State
  const [selectedBrief, setSelectedBrief] = useState<ProductionDesignBrief | null>(null);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [submitBidModalOpen, setSubmitBidModalOpen] = useState(false);
  const [activeBriefForBid, setActiveBriefForBid] = useState<ProductionDesignBrief | null>(null);

  // New Bid Form State
  const [selectedArtisanForBid, setSelectedArtisanForBid] = useState<string>('art_rafiq_zardozi_01');
  const [bidAmountPerUnit, setBidAmountPerUnit] = useState<number>(38000);
  const [bidLeadTimeDays, setBidLeadTimeDays] = useState<number>(30);
  const [bidProposalNotes, setBidProposalNotes] = useState('');
  const [bidSampleSwatches, setBidSampleSwatches] = useState(true);

  // Load Data with Fallback & Event Listener
  const loadData = () => {
    const loadedArtisans = getLocalStorage<ArtisanPortfolioProfile[]>('yh_artisan_portfolios', SEED_ARTISAN_PORTFOLIOS);
    const loadedBriefs = getLocalStorage<ProductionDesignBrief[]>('yh_production_briefs', SEED_PRODUCTION_BRIEFS);
    const loadedBids = getLocalStorage<TailorProductionBid[]>('yh_tailor_bids', SEED_TAILOR_BIDS);
    const loadedContracts = getLocalStorage<ProductionContractRecord[]>('yh_production_contracts', SEED_PRODUCTION_CONTRACTS);

    setArtisans(loadedArtisans);
    setBriefs(loadedBriefs);
    setBids(loadedBids);
    setContracts(loadedContracts);

    if (loadedBriefs.length > 0 && !selectedBrief) {
      setSelectedBrief(loadedBriefs[0]);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('yh-data-sync', handleSync);
      return () => window.removeEventListener('yh-data-sync', handleSync);
    }
  }, []);

  // Filtered Artisans
  const filteredArtisans = useMemo(() => {
    return artisans.filter(art => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = art.masterTailorName.toLowerCase().includes(q);
        const matchesWorkshop = art.workshopName.toLowerCase().includes(q);
        const matchesCity = art.location.city.toLowerCase().includes(q);
        const matchesSpec = art.specialties.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesWorkshop && !matchesCity && !matchesSpec) return false;
      }

      if (selectedSpecialty !== 'ALL') {
        if (!art.specialties.includes(selectedSpecialty as ArtisanSpecialty)) return false;
      }

      if (selectedCity !== 'ALL') {
        if (art.location.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      return true;
    });
  }, [artisans, searchQuery, selectedSpecialty, selectedCity]);

  // Statistics
  const stats = useMemo(() => {
    const totalArtisans = artisans.length;
    const openBriefs = briefs.filter(b => b.status === 'OPEN_FOR_BIDS').length;
    const activeContractsCount = contracts.filter(c => c.currentState !== 'COMPLETED').length;
    const totalEscrowLocked = contracts
      .filter(c => c.escrowStatus === 'HELD_IN_ESCROW' || c.escrowStatus === 'PARTIAL_RELEASE')
      .reduce((sum, c) => sum + c.totalContractAmountInr, 0);

    return {
      totalArtisans,
      openBriefs,
      activeContractsCount,
      totalEscrowLocked
    };
  }, [artisans, briefs, contracts]);

  // Handle Accepting a Bid -> Generates Milestone Escrow Contract
  const handleAcceptBid = (acceptedBid: TailorProductionBid) => {
    const brief = briefs.find(b => b.id === acceptedBid.briefId) || selectedBrief;
    if (!brief) return;

    // 1. Build Milestones from Bid Plan
    const milestones = acceptedBid.milestonePlan && acceptedBid.milestonePlan.length > 0
      ? acceptedBid.milestonePlan.map((m, idx) => ({
          stageIndex: m.stageIndex,
          name: m.milestoneName,
          payoutAmountInr: Math.round((acceptedBid.totalBidAmountInr * m.percentagePayout) / 100),
          percentagePayout: m.percentagePayout,
          targetCompletionDate: new Date(Date.now() + m.daysFromStart * 24 * 60 * 60 * 1000).toISOString(),
          status: (idx === 0 ? 'IN_PROGRESS' : 'PENDING') as ProductionMilestoneStatus
        }))
      : [
          { stageIndex: 1, name: 'Foundation Canvas Cutting', payoutAmountInr: Math.round(acceptedBid.totalBidAmountInr * 0.2), percentagePayout: 20, targetCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'IN_PROGRESS' as ProductionMilestoneStatus },
          { stageIndex: 2, name: 'Skeleton Baste Trial Assembly', payoutAmountInr: Math.round(acceptedBid.totalBidAmountInr * 0.3), percentagePayout: 30, targetCompletionDate: new Date(Date.now() + 16 * 86400000).toISOString(), status: 'PENDING' as ProductionMilestoneStatus },
          { stageIndex: 3, name: 'Artisanal Embroidery & Joining', payoutAmountInr: Math.round(acceptedBid.totalBidAmountInr * 0.3), percentagePayout: 30, targetCompletionDate: new Date(Date.now() + 28 * 86400000).toISOString(), status: 'PENDING' as ProductionMilestoneStatus },
          { stageIndex: 4, name: 'Final QC & Steam Finishing', payoutAmountInr: Math.round(acceptedBid.totalBidAmountInr * 0.2), percentagePayout: 20, targetCompletionDate: new Date(Date.now() + 35 * 86400000).toISOString(), status: 'PENDING' as ProductionMilestoneStatus }
        ];

    // 2. Create Contract Record
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const contractNumber = `CTR-2026-${brief.briefNumber.replace('BRF-', '')}-${randomSuffix}`;
    const newContract: ProductionContractRecord = {
      id: `ctr_${Date.now()}_${randomSuffix}`,
      contractNumber,
      briefId: brief.id,
      briefTitle: brief.title,
      acceptedBidId: acceptedBid.id,
      atelierTenantId: brief.atelierTenantId,
      atelierName: brief.atelierName,
      artisanId: acceptedBid.artisanId,
      artisanWorkshopName: acceptedBid.artisanWorkshopName,
      totalContractAmountInr: acceptedBid.totalBidAmountInr,
      escrowStatus: 'HELD_IN_ESCROW',
      milestones,
      currentState: 'PATTERN_CUTTING',
      signedAt: new Date().toISOString()
    };

    // 3. Update Brief Status
    const updatedBriefs = briefs.map(b => {
      if (b.id === brief.id) {
        return { ...b, status: 'BID_ACCEPTED' as const, updatedAt: new Date().toISOString() };
      }
      return b;
    });

    // 4. Update Bid Status
    const updatedBids = bids.map(b => {
      if (b.id === acceptedBid.id) {
        return { ...b, status: 'ACCEPTED' as const };
      } else if (b.briefId === brief.id) {
        return { ...b, status: 'DECLINED' as const };
      }
      return b;
    });

    const updatedContracts = [newContract, ...contracts];

    // Persist
    setLocalStorage('yh_production_briefs', updatedBriefs);
    setLocalStorage('yh_tailor_bids', updatedBids);
    setLocalStorage('yh_production_contracts', updatedContracts);

    setBriefs(updatedBriefs);
    setBids(updatedBids);
    setContracts(updatedContracts);

    if (selectedBrief?.id === brief.id) {
      setSelectedBrief({ ...brief, status: 'BID_ACCEPTED' });
    }

    dispatchSyncEvent({ source: 'bid-acceptance', entityId: newContract.id });

    toast.success(
      `Bid from ${acceptedBid.artisanName} accepted! Milestone Contract ${contractNumber} generated and ${formatCurrency(acceptedBid.totalBidAmountInr)} held in Escrow.`,
      'Contract Activated'
    );

    setActiveTab('contracts');
  };

  // Handle Milestone Stage Release
  const handleReleaseMilestone = (contractId: string, stageIndex: number) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    const result = transitionContractMilestone(contract, stageIndex, 'APPROVED_AND_PAID');
    if (!result.updatedContract) return;

    const updatedContracts = contracts.map(c => c.id === contractId ? result.updatedContract! : c);
    setLocalStorage('yh_production_contracts', updatedContracts);
    setContracts(updatedContracts);

    dispatchSyncEvent({ source: 'milestone-release', entityId: contractId });

    toast.success(
      `Milestone Stage ${stageIndex} approved! Escrow payment released to ${contract.artisanWorkshopName}.`,
      'Escrow Released'
    );
  };

  // Handle Submitting a New Bid on a Brief
  const handleCreateBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBriefForBid) return;

    const artisanObj = artisans.find(a => a.id === selectedArtisanForBid) || artisans[0];
    const totalBidAmount = bidAmountPerUnit * activeBriefForBid.batchQuantity;

    const newBid: TailorProductionBid = {
      id: `bid_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      briefId: activeBriefForBid.id,
      artisanId: artisanObj.id,
      artisanName: artisanObj.masterTailorName,
      artisanWorkshopName: artisanObj.workshopName,
      artisanAvatar: artisanObj.avatarUrl,
      artisanRating: artisanObj.rating,
      artisanSpecialties: artisanObj.specialties,
      bidAmountPerUnitInr: bidAmountPerUnit,
      totalBidAmountInr: totalBidAmount,
      estimatedLeadTimeDays: bidLeadTimeDays,
      milestonePlan: [
        { stageIndex: 1, milestoneName: 'CAD Cutting & Canvas Foundation', daysFromStart: Math.round(bidLeadTimeDays * 0.2), percentagePayout: 20, deliverableDescription: 'Pattern grading and canvas chest pieces assembly.' },
        { stageIndex: 2, milestoneName: 'Skeleton Fitting Trial Assembly', daysFromStart: Math.round(bidLeadTimeDays * 0.45), percentagePayout: 30, deliverableDescription: 'Baste-stitched trial garment ready for inspection.' },
        { stageIndex: 3, milestoneName: 'Artisanal Handwork & Sleeve Attachment', daysFromStart: Math.round(bidLeadTimeDays * 0.8), percentagePayout: 30, deliverableDescription: 'Specialty embroidery panels and structural stitching.' },
        { stageIndex: 4, milestoneName: 'Final QC, Lining & Steam Pressing', daysFromStart: bidLeadTimeDays, percentagePayout: 20, deliverableDescription: 'Inspection certification and protective garment bagging.' }
      ],
      proposalNotes: bidProposalNotes || 'Dedicated master karigars assigned with precision quality guarantee.',
      sampleSwatchesOffered: bidSampleSwatches,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    };

    const updatedBids = [newBid, ...bids];
    const updatedBriefs = briefs.map(b => {
      if (b.id === activeBriefForBid.id) {
        return { ...b, bidsCount: (b.bidsCount || 0) + 1 };
      }
      return b;
    });

    setLocalStorage('yh_tailor_bids', updatedBids);
    setLocalStorage('yh_production_briefs', updatedBriefs);
    setBids(updatedBids);
    setBriefs(updatedBriefs);

    dispatchSyncEvent({ source: 'new-bid', entityId: newBid.id });

    toast.success(
      `Competitive Bid of ${formatCurrency(bidAmountPerUnit)}/unit submitted for ${activeBriefForBid.title}!`,
      'Bid Submitted'
    );

    setSubmitBidModalOpen(false);
    setActiveBriefForBid(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                Production Bidding & Tailor Ecosystem
                <span className="badge badge-gold uppercase text-[10px]">Layer 4</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Artisan directory, competitive design brief RFQs, and 4-stage milestone escrow contracts
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBriefModalOpen(true)}
            className="px-4 py-2 rounded-xl btn-gold text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-yellow-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Publish Design Brief (RFQ)
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Master Karigars</span>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-yellow-400" />
            {stats.totalArtisans} Artisans
          </div>
          <div className="text-[10px] text-emerald-400">Verified Craft Guilds</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Active Design Briefs</span>
          <div className="text-lg font-bold text-yellow-400 font-mono flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {stats.openBriefs} Open RFQs
          </div>
          <div className="text-[10px] text-slate-400">Accepting artisan bids</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Milestone Contracts</span>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            {stats.activeContractsCount} In Production
          </div>
          <div className="text-[10px] text-slate-400">4-Stage quality inspection</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Escrow Protected</span>
          <div className="text-lg font-bold text-yellow-400 font-mono">
            {formatCurrency(stats.totalEscrowLocked)}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Held in YellowHouse Escrow
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Artisan & Master Tailor Directory ({filteredArtisans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('arena')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'arena'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Bidding Arena & Design Briefs ({briefs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'contracts'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Milestone Escrow Contracts ({contracts.length})
        </button>
      </div>

      {/* VIEW 1: ARTISAN DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by artisan, workshop, specialty, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-9 text-xs"
              />
            </div>

            {/* Specialties Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar">
              {[
                { id: 'ALL', label: 'All Specialties' },
                { id: 'ZARDOZI_EMBROIDERY', label: 'Zardozi' },
                { id: 'MASTER_CANVAS_CUTTING', label: 'Master Cutting' },
                { id: 'TUXEDO_BESPOKE', label: 'Tuxedos' },
                { id: 'LEHENGA_FLARED_CONSTRUCTION', label: 'Lehengas' },
                { id: 'CORSETRY_BONING', label: 'Corsetry' },
              ].map(spec => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedSpecialty(spec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSpecialty === spec.id
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-dark text-xs cursor-pointer py-1.5 w-36"
            >
              <option value="ALL">All Hubs</option>
              <option value="Lucknow">Lucknow (Chowk)</option>
              <option value="Mumbai">Mumbai (Kala Ghoda)</option>
              <option value="New Delhi">Delhi (Shahpur Jat)</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          {/* Grid of Artisans */}
          {filteredArtisans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {filteredArtisans.map(artisan => (
                <TailorBidCard
                  key={artisan.id}
                  artisan={artisan}
                  onRequestCustomBid={() => {
                    setBriefModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Master Karigars Match Selection</h3>
              <p className="text-xs text-slate-400">Try resetting your search query or specialty filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('ALL');
                  setSelectedCity('ALL');
                }}
                className="btn-gold text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BIDDING ARENA & DESIGN BRIEFS */}
      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Briefs List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                Active Design Briefs ({briefs.length})
              </h3>
              <button
                type="button"
                onClick={() => setBriefModalOpen(true)}
                className="text-xs text-yellow-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Brief
              </button>
            </div>

            <div className="space-y-3">
              {briefs.map((b) => {
                const isSelected = selectedBrief?.id === b.id;
                const briefBids = bids.filter(bid => bid.briefId === b.id);

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBrief(b)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'glass-card-gold ring-1 ring-yellow-400/60 shadow-lg'
                        : 'glass-card hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400 text-xs">{b.briefNumber}</span>
                          <span className={`badge ${
                            b.status === 'OPEN_FOR_BIDS' ? 'badge-gold' :
                            b.status === 'BID_ACCEPTED' ? 'badge-emerald' : 'badge-rose'
                          } text-[9px]`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{b.title}</h4>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-white">{b.batchQuantity} Units</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px]">Budget Target:</span>
                        <span className="text-yellow-400 font-bold">{formatCurrency(b.targetBudgetPerUnitInr)}/ea</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[9px]">Bids Received:</span>
                        <span className="text-slate-200 font-bold">{briefBids.length} Bids</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Brief Details & Competitive Bids Comparison */}
          <div className="lg:col-span-7 space-y-5">
            {selectedBrief ? (
              <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
                {/* Brief Header Banner */}
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-gold uppercase text-[10px] font-mono">{selectedBrief.briefNumber}</span>
                    <span className="text-xs text-slate-400">
                      Deadline: {new Date(selectedBrief.deadlineForBids).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedBrief.title}</h3>
                  <p className="text-xs text-slate-400">
                    Garment: <span className="text-yellow-400 font-medium">{selectedBrief.garmentCategory}</span> • Quantity: <span className="text-white font-bold">{selectedBrief.batchQuantity} units</span> • Target Envelope: <span className="text-yellow-400 font-bold">{formatCurrency(selectedBrief.totalBudgetCeilingInr)}</span>
                  </p>
                </div>

                {/* Technical Specifications */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Atelier Technical Brief:</span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>Full Canvas: <span className="text-slate-200">{selectedBrief.specifications.hasFullCanvas ? 'Yes (Floating Chest)' : 'No'}</span></div>
                    <div>Embroidery: <span className="text-yellow-400 uppercase">{selectedBrief.specifications.embroideryLevel}</span></div>
                    <div>Fitting Trials: <span className="text-slate-200">{selectedBrief.specifications.trialFittingCount} Stages</span></div>
                    <div>Lining: <span className="text-slate-300">{selectedBrief.specifications.liningDetails}</span></div>
                  </div>
                </div>

                {/* Competitive Bidding Arena Header */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      Submitted Competitive Bids ({bids.filter(b => b.briefId === selectedBrief.id).length})
                    </h4>
                    <p className="text-[11px] text-slate-400">Compare artisan proposals and lock milestone escrow</p>
                  </div>
                  {selectedBrief.status === 'OPEN_FOR_BIDS' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBriefForBid(selectedBrief);
                        setSubmitBidModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl btn-gold text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Submit Bid as Karigar
                    </button>
                  )}
                </div>

                {/* List of Bids on Selected Brief */}
                <div className="space-y-4">
                  {bids.filter(b => b.briefId === selectedBrief.id).length > 0 ? (
                    bids.filter(b => b.briefId === selectedBrief.id).map(bid => (
                      <TailorBidCard
                        key={bid.id}
                        bid={bid}
                        onAcceptBid={handleAcceptBid}
                      />
                    ))
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                      <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">No artisan bids submitted for this brief yet.</p>
                      {selectedBrief.status === 'OPEN_FOR_BIDS' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBriefForBid(selectedBrief);
                            setSubmitBidModalOpen(true);
                          }}
                          className="text-xs font-bold text-yellow-400 hover:underline"
                        >
                          Submit the first competitive proposal →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 text-slate-400 text-xs">
                Select a design brief from the left to view competitive bids and contract terms.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MILESTONE ESCROW CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-5">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Production Contracts & Escrow Milestone Machine
                </h3>
                <p className="text-xs text-slate-400">
                  4-Stage milestone escrow inspection: Payouts are locked in escrow and released only upon atelier milestone inspection approval
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadData()}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-5 rounded-2xl glass-card bg-slate-950/70 border border-slate-800 space-y-4"
                  >
                    {/* Contract Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-yellow-400 font-mono">{contract.contractNumber}</span>
                          <span className="badge badge-gold uppercase text-[9px]">{contract.currentState.replace(/_/g, ' ')}</span>
                          <span className={`badge ${
                            contract.escrowStatus === 'FULLY_RELEASED' ? 'badge-emerald' : 'badge-amber'
                          } text-[9px]`}>
                            <Lock className="w-2.5 h-2.5" />
                            {contract.escrowStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{contract.briefTitle}</h4>
                        <p className="text-xs text-slate-400">
                          Karigar: <span className="text-slate-200 font-semibold">{contract.artisanWorkshopName}</span> • Signed: {new Date(contract.signedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-slate-400 block">Total Escrow Value</span>
                        <span className="text-base font-bold text-yellow-400">{formatCurrency(contract.totalContractAmountInr)}</span>
                      </div>
                    </div>

                    {/* 4-Stage Interactive Milestone Stepper Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {contract.milestones.map((m) => {
                        const isPaid = m.status === 'APPROVED_AND_PAID';
                        const isInProgress = m.status === 'IN_PROGRESS';

                        return (
                          <div
                            key={m.stageIndex}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
                              isPaid
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : isInProgress
                                ? 'bg-yellow-500/10 border-yellow-500/40 ring-1 ring-yellow-500/30'
                                : 'bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="font-bold text-slate-400 uppercase">Stage {m.stageIndex} ({m.percentagePayout}%)</span>
                                {isPaid ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                  </span>
                                ) : isInProgress ? (
                                  <span className="text-yellow-400 font-bold animate-pulse">Active Inspection</span>
                                ) : (
                                  <span className="text-slate-500">Locked</span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{m.name}</h5>
                              <div className="text-xs font-bold text-yellow-400 font-mono">
                                {formatCurrency(m.payoutAmountInr)}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Target: {new Date(m.targetCompletionDate).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Release Action */}
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => handleReleaseMilestone(contract.id, m.stageIndex)}
                                className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  isInProgress
                                    ? 'btn-gold shadow-sm'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                <Unlock className="w-3 h-3" />
                                Approve & Release
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active milestone contracts yet. Accept a competitive bid from the Bidding Arena to lock escrow and begin production.
              </div>
            )}
          </div>
        </div>
      )}

      {/* BRIEF SUBMISSION MODAL */}
      <BriefSubmissionModal
        isOpen={briefModalOpen}
        onClose={() => setBriefModalOpen(false)}
        onCreated={() => {
          loadData();
          setActiveTab('arena');
        }}
      />

      {/* SUBMIT BID MODAL (As Karigar) */}
      {submitBidModalOpen && activeBriefForBid && (
        <div
          onClick={() => setSubmitBidModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card rounded-2xl p-6 border border-yellow-500/30 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-yellow-400" />
                  Submit Production Bid
                </h3>
                <p className="text-xs text-slate-400">{activeBriefForBid.briefNumber} • {activeBriefForBid.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitBidModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBidSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Select Artisan Workshop</label>
                <select
                  value={selectedArtisanForBid}
                  onChange={(e) => setSelectedArtisanForBid(e.target.value)}
                  className="input-dark text-xs cursor-pointer"
                >
                  {artisans.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.masterTailorName} ({art.workshopName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Bid Amount Per Unit</label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    required
                    value={bidAmountPerUnit}
                    onChange={(e) => setBidAmountPerUnit(Math.max(1000, parseInt(e.target.value) || 1000))}
                    className="input-dark font-mono font-bold text-yellow-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    required
                    value={bidLeadTimeDays}
                    onChange={(e) => setBidLeadTimeDays(Math.max(5, parseInt(e.target.value) || 5))}
                    className="input-dark font-mono font-bold text-yellow-400"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center font-mono text-xs">
                <span className="text-slate-400">Total Contract Value ({activeBriefForBid.batchQuantity} units):</span>
                <span className="text-base font-bold text-yellow-400">{formatCurrency(bidAmountPerUnit * activeBriefForBid.batchQuantity)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Proposal Notes / Workshop Guarantee</label>
                <textarea
                  rows={2}
                  value={bidProposalNotes}
                  onChange={(e) => setBidProposalNotes(e.target.value)}
                  placeholder="Outline your karigar team capacity, micro-zari technique, or fitting trial guarantee..."
                  className="input-dark text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bidSampleSwatches}
                  onChange={(e) => setBidSampleSwatches(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500/30"
                />
                Include free physical embroidery sample strike-off before mounting
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmitBidModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gold text-xs font-bold shadow-md"
                >
                  Submit Competitive Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
