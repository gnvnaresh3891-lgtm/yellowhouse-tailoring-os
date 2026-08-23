'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Box, 
  Download, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  PlusCircle, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Star, 
  CheckCircle2, 
  Clock, 
  FileCode2, 
  Upload, 
  DollarSign, 
  BarChart3, 
  Tag,
  Scissors,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  FashionBlueprintAsset, 
  GarmentCategory, 
  AestheticStyle, 
  AssetDifficultyLevel, 
  LicenseTierType,
  CreatorEarningsLedger,
  AssetLicenseCertificate
} from '@/types/ecosystem';
import { 
  SEED_FASHION_ASSETS, 
  SEED_CREATOR_EARNINGS, 
  SEED_ASSET_LICENSES 
} from '@/lib/ecosystem-seeds';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { useCurrency } from '@/components/currency-context';
import { AssetCard } from '@/components/ecosystem/asset-card';
import { AssetLicenseModal } from '@/components/ecosystem/asset-license-modal';
import { Breadcrumb } from '@/components/breadcrumb';

export default function MarketplacePage() {
  const { formatCurrency } = useCurrency();

  // State
  const [activeTab, setActiveTab] = useState<'catalog' | 'earnings' | 'upload'>('catalog');
  const [assets, setAssets] = useState<FashionBlueprintAsset[]>([]);
  const [creatorLedger, setCreatorLedger] = useState<CreatorEarningsLedger>(SEED_CREATOR_EARNINGS);
  const [licenses, setLicenses] = useState<AssetLicenseCertificate[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStyle, setSelectedStyle] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [only3DInteractive, setOnly3DInteractive] = useState(false);
  const [sortBy, setSortBy] = useState<'POPULARITY' | 'RATING' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST'>('POPULARITY');

  // Modal State
  const [selectedAssetForLicense, setSelectedAssetForLicense] = useState<FashionBlueprintAsset | null>(null);
  const [selectedTierForLicense, setSelectedTierForLicense] = useState<LicenseTierType>('PERSONAL_BESPOKE');
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // Upload Blueprint Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<GarmentCategory>('mens-sherwani');
  const [uploadStyle, setUploadStyle] = useState<AestheticStyle>('HERITAGE_ROYAL');
  const [uploadDifficulty, setUploadDifficulty] = useState<AssetDifficultyLevel>('INTERMEDIATE');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCoverImage, setUploadCoverImage] = useState('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800');
  const [uploadBasePrice, setUploadBasePrice] = useState(4500);
  const [uploadPiecesCount, setUploadPiecesCount] = useState(16);
  const [uploadSamMinutes, setUploadSamMinutes] = useState(380);
  const [uploadTags, setUploadTags] = useState('Bespoke, Heritage, 3D Clo3D');
  const [uploadIs3D, setUploadIs3D] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load Data & Handle Storage Events
  const loadData = () => {
    const storedAssets = getLocalStorage<FashionBlueprintAsset[]>('yh_marketplace_assets', SEED_FASHION_ASSETS);
    setAssets(storedAssets);

    const storedLedger = getLocalStorage<CreatorEarningsLedger>('yh_creator_earnings', SEED_CREATOR_EARNINGS);
    setCreatorLedger(storedLedger);

    const storedLicenses = getLocalStorage<AssetLicenseCertificate[]>('yh_asset_licenses', SEED_ASSET_LICENSES);
    setLicenses(storedLicenses);
  };

  useEffect(() => {
    loadData();

    const handleSync = (e: Event) => {
      loadData();
    };

    window.addEventListener('yh-data-sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('yh-data-sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter & Sort Logic
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = asset.title.toLowerCase().includes(q);
        const matchesCreator = asset.creatorName.toLowerCase().includes(q);
        const matchesTags = asset.tags?.some(t => t.toLowerCase().includes(q));
        const matchesFormats = asset.fileFormats?.some(f => f.toLowerCase().includes(q));
        const matchesDesc = asset.description?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesCreator && !matchesTags && !matchesFormats && !matchesDesc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'ALL' && asset.garmentCategory !== selectedCategory) {
        return false;
      }

      // Aesthetic Style
      if (selectedStyle !== 'ALL' && asset.aestheticStyle !== selectedStyle) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'ALL' && asset.difficultyLevel !== selectedDifficulty) {
        return false;
      }

      // 3D Simulation Only
      if (only3DInteractive && !asset.is3dInteractive) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'POPULARITY') {
        return (b.downloadsCount || 0) - (a.downloadsCount || 0);
      }
      if (sortBy === 'RATING') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'PRICE_ASC') {
        return (a.pricingTiers?.personalBespoke?.priceInr || 0) - (b.pricingTiers?.personalBespoke?.priceInr || 0);
      }
      if (sortBy === 'PRICE_DESC') {
        return (b.pricingTiers?.personalBespoke?.priceInr || 0) - (a.pricingTiers?.personalBespoke?.priceInr || 0);
      }
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });
  }, [assets, searchQuery, selectedCategory, selectedStyle, selectedDifficulty, only3DInteractive, sortBy]);

  // Handle License Trigger
  const handleOpenLicenseModal = (asset: FashionBlueprintAsset, tier?: LicenseTierType) => {
    setSelectedAssetForLicense(asset);
    setSelectedTierForLicense(tier || 'PERSONAL_BESPOKE');
    setIsLicenseModalOpen(true);
  };

  // Handle Upload Blueprint Submit
  const handleCreateBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadDescription.trim()) return;

    const base = Number(uploadBasePrice) || 4500;
    const newAsset: FashionBlueprintAsset = {
      id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: uploadTitle,
      slug: uploadTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      creatorId: 'creator_latif_01',
      creatorName: 'Master Latif Khan',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      creatorTier: 'MASTER_CREATOR',
      garmentCategory: uploadCategory,
      aestheticStyle: uploadStyle,
      difficultyLevel: uploadDifficulty,
      description: uploadDescription,
      coverImageUrl: uploadCoverImage,
      previewImageUrls: [uploadCoverImage],
      fileFormats: ['.dxf', '.clo3d', '.pdf', '.svg'],
      fileSizeMb: 42.0,
      version: 'v1.0.0',
      rating: 5.0,
      reviewsCount: 1,
      downloadsCount: 0,
      is3dInteractive: uploadIs3D,
      techPackSpecs: {
        seamAllowancesMm: 12.0,
        gradingRange: ['38R', '40R', '42R', '44R'],
        recommendedFabrics: ['Raw Silk', 'Italian Wool', 'Silk Brocade'],
        estimatedSewingSamMinutes: Number(uploadSamMinutes) || 360,
        patternPiecesCount: Number(uploadPiecesCount) || 16,
        liningIncluded: true,
        interfacingSpecifications: 'Full chest canvas + French collar stay',
        embroideryMotifLayers: 2
      },
      pricingTiers: {
        personalBespoke: { priceInr: base, priceUsd: Math.round(base / 82.5), allowedRuns: 3, commercialAllowed: false },
        commercialProduction: { priceInr: Math.round(base * 4.11), priceUsd: Math.round((base * 4.11) / 82.5), allowedRuns: 250, commercialAllowed: true },
        exclusiveBuyout: { priceInr: Math.round(base * 21.11), priceUsd: Math.round((base * 21.11) / 82.5), allowedRuns: 999999, commercialAllowed: true, transfersIp: true }
      },
      licenseTermsSummary: 'Standard YellowHouse authenticated multi-tier license terms apply.',
      tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAssets = [newAsset, ...assets];
    setAssets(updatedAssets);
    setLocalStorage('yh_marketplace_assets', updatedAssets);

    window.dispatchEvent(new CustomEvent('yh-data-sync', {
      detail: { key: 'yh_marketplace_assets', asset: newAsset }
    }));

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setActiveTab('catalog');
      // Reset form
      setUploadTitle('');
      setUploadDescription('');
    }, 1500);
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalBlueprints = assets.length;
    const creatorsCount = new Set(assets.map(a => a.creatorId)).size;
    const simulation3dCount = assets.filter(a => a.is3dInteractive).length;
    const totalDownloads = assets.reduce((sum, a) => sum + (a.downloadsCount || 0), 0);
    const grossRevenue = creatorLedger?.lifetimeGrossInr || 642000;
    const netPayout = creatorLedger?.lifetimeNetPayoutInr || 564960;

    return {
      totalBlueprints,
      creatorsCount,
      simulation3dCount,
      totalDownloads,
      grossRevenue,
      netPayout
    };
  }, [assets, creatorLedger]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Marketplace', active: true }
        ]}
      />

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-8 border border-yellow-500/30 bg-gradient-to-r from-[#0B0F19] via-slate-900 to-[#141C2E]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design as a Product • Next-Gen Digital Fashion Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Digital Asset Warehouse & Blueprint Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              License verified master pattern blueprints, 3D Clo3D simulations, and precision CAD tech packs. Instant cryptographic HMAC licensing with 88% revenue to creators.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="btn-gold py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Blueprint</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'earnings' ? 'catalog' : 'earnings')}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-yellow-400" />
              <span>{activeTab === 'earnings' ? 'Browse Catalog' : 'Creator Earnings'}</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-yellow-400" /> Verified Blueprints
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">
              {stats.totalBlueprints}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Box className="w-3.5 h-3.5 text-yellow-400" /> 3D Simulation Ready
            </span>
            <span className="text-xl font-bold text-yellow-400 font-mono">
              {stats.simulation3dCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Download className="w-3.5 h-3.5 text-yellow-400" /> Total Licensed Runs
            </span>
            <span className="text-xl font-bold text-slate-100 font-mono">
              {stats.totalDownloads}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" /> Creator Net Volume
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatCurrency(stats.netPayout)}
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
          <Layers className="w-4 h-4" />
          <span>Marketplace Catalog ({filteredAssets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'earnings'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Creator Royalties & Sales Tracking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Publish Blueprint</span>
        </button>
      </div>

      {/* TAB 1: MARKETPLACE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter Bar & Search Controls */}
          <div className="p-4 rounded-2xl glass-card border border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blueprints, creators, tags (.dxf, .clo3d, Achkan, Lehenga)..."
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

              {/* Garment Category dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="ALL">All Garment Silhouettes</option>
                  <option value="mens-sherwani">Men's Sherwani & Achkan</option>
                  <option value="mens-suit">Men's Bespoke Suit & Tuxedo</option>
                  <option value="womens-lehenga">Women's Bridal Lehenga</option>
                  <option value="womens-anarkali">Women's Kalidar Anarkali</option>
                  <option value="womens-corset">Women's Architecture Corset</option>
                  <option value="womens-blouse">Women's Couture Blouse</option>
                  <option value="womens-gown">Women's Flared Gown</option>
                  <option value="mens-shirt">Men's Formal Shirt</option>
                  <option value="mens-trouser">Men's Tailored Trouser</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="POPULARITY">Sort: Most Popular Runs</option>
                  <option value="RATING">Sort: Highest Rated</option>
                  <option value="PRICE_ASC">Sort: Price Low to High</option>
                  <option value="PRICE_DESC">Sort: Price High to Low</option>
                  <option value="NEWEST">Sort: Newest Releases</option>
                </select>
              </div>
            </div>

            {/* Secondary Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Filter className="w-3 h-3 text-yellow-400" /> Aesthetic Style:
                </span>
                {['ALL', 'HERITAGE_ROYAL', 'TRADITIONAL_BRIDAL', 'MODERN_SAVILE_ROW', 'AVANT_GARDE'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                      selectedStyle === style
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {style.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {/* 3D Only Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={only3DInteractive}
                    onChange={(e) => setOnly3DInteractive(e.target.checked)}
                    className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950"
                  />
                  <span className="flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-yellow-400" /> 3D Simulation Only
                  </span>
                </label>

                {(searchQuery || selectedCategory !== 'ALL' || selectedStyle !== 'ALL' || only3DInteractive) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                      setSelectedStyle('ALL');
                      setOnly3DInteractive(false);
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Asset Grid */}
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Blueprint Assets Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No designs match your active search or filter criteria. Try adjusting your keyword or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedStyle('ALL');
                  setOnly3DInteractive(false);
                }}
                className="btn-gold text-xs py-2 px-4 rounded-xl mt-2"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onLicense={handleOpenLicenseModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATOR EARNINGS & ROYALTIES */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Earnings Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-yellow-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Lifetime Gross Volume</span>
                <Coins className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                {formatCurrency(creatorLedger.lifetimeGrossInr)}
              </p>
              <span className="text-[11px] text-slate-500 block">
                From {creatorLedger.totalSalesCount} total license issuances
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>88% Net Creator Payout</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(creatorLedger.lifetimeNetPayoutInr)}
              </p>
              <span className="text-[11px] text-slate-500 block">
                Platform fee retained (12%): {formatCurrency(creatorLedger.platformFeeInr)}
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>Available for Withdrawal</span>
                <DollarSign className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-extrabold text-cyan-300 font-mono">
                {formatCurrency(creatorLedger.availableForPayoutInr)}
              </p>
              <span className="text-[11px] text-slate-500 block">
                Pending escrow balance: {formatCurrency(creatorLedger.pendingBalanceInr)}
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Active License Certificates</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100 font-mono">
                {licenses.length}
              </p>
              <span className="text-[11px] text-slate-500 block">
                100% cryptographically attested
              </span>
            </div>
          </div>

          {/* Monthly Sales Breakdown Chart / Visual */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-yellow-400" /> Monthly Revenue Performance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {creatorLedger.monthlyBreakdown?.map((month) => (
                <div key={month.month} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{month.month}</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 text-[10px] font-mono">
                      {month.sales} Sales
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-500">Gross: {formatCurrency(month.grossInr)}</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(month.netInr)}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (month.grossInr / 200000) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" /> Recent License Transactions & Royalty Allocations
              </h3>
              <span className="text-xs text-slate-500 font-mono">Standard 88/12 Split</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="pb-3 px-3">Asset Blueprint</th>
                    <th className="pb-3 px-3">Buyer / Atelier</th>
                    <th className="pb-3 px-3">License Tier</th>
                    <th className="pb-3 px-3 text-right">Gross Amount</th>
                    <th className="pb-3 px-3 text-right">Creator Net (88%)</th>
                    <th className="pb-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {creatorLedger.recentTransactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-200">{tx.assetTitle}</td>
                      <td className="py-3 px-3 text-slate-300">{tx.buyerName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px] font-mono">
                          {tx.licenseType?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">{formatCurrency(tx.amountInr)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(tx.netInr)}</td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISH NEW BLUEPRINT */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl glass-card-gold border border-yellow-500/40 bg-slate-950/90 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-yellow-400" /> Publish Digital Blueprint Asset
            </h2>
            <p className="text-xs text-slate-400">
              Upload your graded fashion blueprint, Clo3D 3D asset, and specifications to the marketplace warehouse.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Blueprint successfully published and synced with marketplace warehouse!</span>
            </div>
          )}

          <form onSubmit={handleCreateBlueprint} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Blueprint Title *</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Imperial Hand-Quilted Velvet Achkan & Churidar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Garment Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="mens-sherwani">Men's Sherwani</option>
                  <option value="mens-suit">Men's Suit</option>
                  <option value="womens-lehenga">Women's Lehenga</option>
                  <option value="womens-anarkali">Women's Anarkali</option>
                  <option value="womens-corset">Women's Corset</option>
                  <option value="womens-blouse">Women's Blouse</option>
                  <option value="womens-gown">Women's Gown</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Aesthetic Style</label>
                <select
                  value={uploadStyle}
                  onChange={(e) => setUploadStyle(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="HERITAGE_ROYAL">Heritage Royal</option>
                  <option value="TRADITIONAL_BRIDAL">Traditional Bridal</option>
                  <option value="MODERN_SAVILE_ROW">Modern Savile Row</option>
                  <option value="AVANT_GARDE">Avant-Garde</option>
                  <option value="MINIMALIST_COUTURE">Minimalist Couture</option>
                  <option value="INDO_WESTERN">Indo-Western</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Difficulty Level</label>
                <select
                  value={uploadDifficulty}
                  onChange={(e) => setUploadDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-yellow-400"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="MASTER_KARIGAR">Master Karigar</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Description & Pattern Blueprint Notes *</label>
              <textarea
                required
                rows={3}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Detail the canvas structure, lapel style, ease allowances, and specific karigar construction instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Base Price (INR)</label>
                <input
                  type="number"
                  min="500"
                  value={uploadBasePrice}
                  onChange={(e) => setUploadBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Pattern Pieces Count</label>
                <input
                  type="number"
                  min="1"
                  value={uploadPiecesCount}
                  onChange={(e) => setUploadPiecesCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Estimated SAM (mins)</label>
                <input
                  type="number"
                  min="10"
                  value={uploadSamMinutes}
                  onChange={(e) => setUploadSamMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Cover Image URL</label>
                <input
                  type="url"
                  value={uploadCoverImage}
                  onChange={(e) => setUploadCoverImage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Search Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="e.g. Achkan, Royal, Zardozi, Clo3D"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 pt-2">
              <input
                type="checkbox"
                checked={uploadIs3D}
                onChange={(e) => setUploadIs3D(e.target.checked)}
                className="rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950"
              />
              <span className="flex items-center gap-1">
                <Box className="w-4 h-4 text-yellow-400" /> Includes 3D Simulation & GLB Mesh
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
                <Upload className="w-4 h-4" />
                <span>Publish to Marketplace</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Asset License Checkout Modal */}
      {selectedAssetForLicense && (
        <AssetLicenseModal
          asset={selectedAssetForLicense}
          initialTier={selectedTierForLicense}
          isOpen={isLicenseModalOpen}
          onClose={() => {
            setIsLicenseModalOpen(false);
            setSelectedAssetForLicense(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
