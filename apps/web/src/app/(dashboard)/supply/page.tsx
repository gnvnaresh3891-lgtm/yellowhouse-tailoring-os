'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Truck, 
  PackageCheck, 
  ShieldCheck, 
  FileSpreadsheet, 
  Calculator, 
  RefreshCw, 
  ArrowRight,
  Info,
  X,
  MapPin,
  Tag,
  Eye,
  DollarSign
} from 'lucide-react';
import { 
  VendorMaterialItem, 
  MaterialSourcingOrder, 
  MaterialCategory, 
  GarmentCategory, 
  FabricRecommendationOption,
  MaterialSourcingOrderItem
} from '@/types/ecosystem';
import { SEED_MATERIALS_CATALOG, SEED_MATERIAL_ORDERS } from '@/lib/ecosystem-seeds';
import { calculateVolumeDiscountedPrice } from '@/lib/ecosystem-algorithms';
import { calculateFabricYield } from '@/lib/fabric-yield';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { dispatchSyncEvent } from '@/lib/state-sync-utils';
import { useToast } from '@/components/toast-context';
import { useCurrency } from '@/components/currency-context';

import { VendorMaterialCard } from '@/components/ecosystem/vendor-material-card';
import { FabricRecommendationWidget } from '@/components/ecosystem/fabric-recommendation-widget';

export default function SupplyPage() {
  const toast = useToast();
  const { formatCurrency } = useCurrency();

  // State: Materials & Orders
  const [materials, setMaterials] = useState<VendorMaterialItem[]>([]);
  const [orders, setOrders] = useState<MaterialSourcingOrder[]>([]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'recommendations' | 'orders' | 'volumeMatrix'>('catalog');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc' | 'drape' | 'stock'>('name');

  // Modals State
  const [quickOrderModalOpen, setQuickOrderModalOpen] = useState(false);
  const [selectedMaterialForOrder, setSelectedMaterialForOrder] = useState<VendorMaterialItem | null>(null);
  const [orderQuantityMeters, setOrderQuantityMeters] = useState<number>(10);
  const [shippingAddress, setShippingAddress] = useState('YellowHouse Flagship Atelier, 14 Rampart Row, Fort, Mumbai 400001');

  // BOM Preview Modal State
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomGarmentCategory, setBomGarmentCategory] = useState<GarmentCategory>('mens-sherwani');
  const [bomBatchUnits, setBomBatchUnits] = useState<number>(5);

  // Bulk Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(50);

  // Load from storage with initial fallback & setup sync event
  const loadData = () => {
    const loadedMaterials = getLocalStorage<VendorMaterialItem[]>('yh_vendor_materials', SEED_MATERIALS_CATALOG);
    const loadedOrders = getLocalStorage<MaterialSourcingOrder[]>('yh_fabric_sourcing_orders', SEED_MATERIAL_ORDERS);
    setMaterials(loadedMaterials);
    setOrders(loadedOrders);
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

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = mat.name.toLowerCase().includes(q);
        const matchesFiber = mat.fiberComposition.toLowerCase().includes(q);
        const matchesColor = mat.colorName.toLowerCase().includes(q);
        const matchesSku = mat.sku.toLowerCase().includes(q);
        const matchesVendor = mat.vendor?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesFiber && !matchesColor && !matchesSku && !matchesVendor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryFilter !== 'ALL') {
        if (selectedCategoryFilter === 'FABRIC' && mat.category !== 'FABRIC') return false;
        if (selectedCategoryFilter === 'LINING' && mat.category !== 'LINING' && mat.category !== 'LININGS') return false;
        if (selectedCategoryFilter === 'INTERFACING' && mat.category !== 'INTERFACING') return false;
        if (selectedCategoryFilter === 'TRIM' && mat.category !== 'TRIM' && mat.category !== 'TRIMS') return false;
        if (selectedCategoryFilter === 'SILK' && !mat.fiberComposition.toLowerCase().includes('silk') && mat.weaveType !== 'Raw Silk') return false;
        if (selectedCategoryFilter === 'VELVET' && !mat.weaveType.toLowerCase().includes('velvet')) return false;
      }

      // In-stock only
      if (inStockOnly && (!mat.inStock || mat.stockLevelMeters <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.pricingTiers?.[0]?.pricePerMeterInr || 0;
      const priceB = b.pricingTiers?.[0]?.pricePerMeterInr || 0;
      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'drape') return (b.drapeScore || 0) - (a.drapeScore || 0);
      if (sortBy === 'stock') return b.stockLevelMeters - a.stockLevelMeters;
      return a.name.localeCompare(b.name);
    });
  }, [materials, searchQuery, selectedCategoryFilter, inStockOnly, sortBy]);

  // Statistics Metrics
  const stats = useMemo(() => {
    const totalSwatches = materials.length;
    const lowStockCount = materials.filter(m => m.stockLevelMeters <= m.reorderThresholdMeters).length;
    const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const uniqueVendorsCount = new Set(materials.map(m => m.vendor?.id).filter(Boolean)).size;
    const totalStockMeters = materials.reduce((sum, m) => sum + (m.stockLevelMeters || 0), 0);

    return {
      totalSwatches,
      lowStockCount,
      activeOrdersCount,
      uniqueVendorsCount,
      totalStockMeters
    };
  }, [materials, orders]);

  // Handlers for Quick Order Modal
  const handleOpenOrderModal = (material: VendorMaterialItem, defaultQuantity: number = 10) => {
    setSelectedMaterialForOrder(material);
    setOrderQuantityMeters(defaultQuantity);
    setQuickOrderModalOpen(true);
  };

  const handleCreateSourcingOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialForOrder) return;

    const volumePricing = calculateVolumeDiscountedPrice(selectedMaterialForOrder, orderQuantityMeters);
    const subtotal = volumePricing.totalCostInr;
    const shipping = selectedMaterialForOrder.vendor?.shippingChargeInr || 250;
    const taxGst = Math.round(subtotal * 0.05); // 5% GST on textiles
    const total = subtotal + shipping + taxGst;

    const orderNumber = `MSO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: MaterialSourcingOrder = {
      id: `mso_${Date.now()}`,
      orderNumber,
      tenantId: 'tenant_flagship_01',
      vendorId: selectedMaterialForOrder.vendor?.id || 'vnd_default',
      vendorName: selectedMaterialForOrder.vendor?.name || 'Verified Textile Guild',
      items: [
        {
          materialId: selectedMaterialForOrder.id,
          materialName: selectedMaterialForOrder.name,
          sku: selectedMaterialForOrder.sku,
          meters: orderQuantityMeters,
          unitPriceInr: volumePricing.unitPricePerMeterInr,
          discountPercent: volumePricing.discountPercent,
          totalCostInr: subtotal
        }
      ],
      subtotalInr: subtotal,
      shippingChargeInr: shipping,
      taxGstInr: taxGst,
      totalAmountInr: total,
      status: 'CONFIRMED',
      trackingNumber: `DELHIVERY-AWB-${Math.floor(1000000 + Math.random() * 9000000)}`,
      shippingAddress,
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update Materials stock
    const updatedMaterials = materials.map(m => {
      if (m.id === selectedMaterialForOrder.id) {
        const newStock = Math.max(0, m.stockLevelMeters - orderQuantityMeters);
        return {
          ...m,
          stockLevelMeters: newStock,
          inStock: newStock > 0
        };
      }
      return m;
    });

    const updatedOrders = [newOrder, ...orders];

    setLocalStorage('yh_vendor_materials', updatedMaterials);
    setLocalStorage('yh_fabric_sourcing_orders', updatedOrders);
    setMaterials(updatedMaterials);
    setOrders(updatedOrders);

    dispatchSyncEvent({ source: 'sourcing-order', entityId: newOrder.id });

    toast.success(
      `Sourcing Order ${orderNumber} placed for ${orderQuantityMeters}m of ${selectedMaterialForOrder.name}!`,
      'Order Confirmed'
    );

    setQuickOrderModalOpen(false);
    setSelectedMaterialForOrder(null);
  };

  // Handler for Recommendation Option Selection
  const handleRecommendationOrder = (option: FabricRecommendationOption, category: GarmentCategory, meters: number) => {
    handleOpenOrderModal(option.primaryFabric, meters);
  };

  // Handler for Multi-Item BOM Generation
  const handleGenerateBOMOrder = () => {
    const singleYield = calculateFabricYield({
      garmentCategory: bomGarmentCategory,
      boltWidth: 44
    }).requiredMeters;

    const totalFabricMeters = Math.round(singleYield * bomBatchUnits * 10) / 10;
    const totalLiningMeters = Math.round(totalFabricMeters * 0.9 * 10) / 10;
    const totalInterfacingMeters = Math.round(bomBatchUnits * 1.2 * 10) / 10;

    // Pick top candidates from catalog
    const primary = materials.find(m => m.category === 'FABRIC') || materials[0];
    const lining = materials.find(m => m.category === 'LINING') || materials[3] || materials[0];
    const interfacing = materials.find(m => m.category === 'INTERFACING') || materials[5] || materials[0];

    const pPrice = calculateVolumeDiscountedPrice(primary, totalFabricMeters);
    const lPrice = calculateVolumeDiscountedPrice(lining, totalLiningMeters);
    const iPrice = calculateVolumeDiscountedPrice(interfacing, totalInterfacingMeters);

    const items: MaterialSourcingOrderItem[] = [
      {
        materialId: primary.id,
        materialName: primary.name,
        sku: primary.sku,
        meters: totalFabricMeters,
        unitPriceInr: pPrice.unitPricePerMeterInr,
        discountPercent: pPrice.discountPercent,
        totalCostInr: pPrice.totalCostInr
      },
      {
        materialId: lining.id,
        materialName: lining.name,
        sku: lining.sku,
        meters: totalLiningMeters,
        unitPriceInr: lPrice.unitPricePerMeterInr,
        discountPercent: lPrice.discountPercent,
        totalCostInr: lPrice.totalCostInr
      },
      {
        materialId: interfacing.id,
        materialName: interfacing.name,
        sku: interfacing.sku,
        meters: totalInterfacingMeters,
        unitPriceInr: iPrice.unitPricePerMeterInr,
        discountPercent: iPrice.discountPercent,
        totalCostInr: iPrice.totalCostInr
      }
    ];

    const subtotal = items.reduce((sum, it) => sum + it.totalCostInr, 0);
    const shipping = 450;
    const taxGst = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + taxGst;

    const orderNumber = `MSO-BOM-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: MaterialSourcingOrder = {
      id: `mso_bom_${Date.now()}`,
      orderNumber,
      tenantId: 'tenant_flagship_01',
      vendorId: primary.vendor?.id || 'vnd_guild',
      vendorName: 'Consolidated Atelier Sourcing Hub',
      items,
      subtotalInr: subtotal,
      shippingChargeInr: shipping,
      taxGstInr: taxGst,
      totalAmountInr: total,
      status: 'CONFIRMED',
      trackingNumber: `BLUEDART-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingAddress,
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...orders];
    setLocalStorage('yh_fabric_sourcing_orders', updatedOrders);
    setOrders(updatedOrders);
    dispatchSyncEvent({ source: 'bom-sourcing-order', entityId: newOrder.id });

    toast.success(
      `Consolidated BOM Sourcing Order ${orderNumber} created for ${bomBatchUnits}x ${bomGarmentCategory}!`,
      'BOM Order Placed'
    );

    setBomModalOpen(false);
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                Supply Layer — Vendor Material Sourcing
                <span className="badge badge-gold uppercase text-[10px]">Layer 3</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Direct textile mill integration, real-time inventory tracking, volume discounts, and physics-based smart recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sourcing Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBomModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
            BOM Sourcing Generator
          </button>
          <button
            type="button"
            onClick={() => {
              if (materials.length > 0) {
                handleOpenOrderModal(materials[0], 25);
              }
            }}
            className="px-4 py-2 rounded-xl btn-gold text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-yellow-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Sourcing Order
          </button>
        </div>
      </div>

      {/* Real-time KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Catalog Swatches</span>
          <div className="text-lg font-bold text-white font-mono">{stats.totalSwatches} Swatches</div>
          <div className="text-[10px] text-yellow-400/90 font-medium">{stats.totalStockMeters}m in network</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Stock Alerts</span>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
            {stats.lowStockCount > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {stats.lowStockCount} Low Stock
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                All Stocked
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500">Auto reorder triggers</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Verified Mills</span>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {stats.uniqueVendorsCount} Vendors
          </div>
          <div className="text-[10px] text-slate-400">Varanasi, Surat & Biella</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Active Sourcing Orders</span>
          <div className="text-lg font-bold text-yellow-400 font-mono">{stats.activeOrdersCount} In Transit</div>
          <div className="text-[10px] text-slate-400">Delhivery & BlueDart synced</div>
        </div>

        <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1 col-span-2 sm:col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Volume Discount</span>
          <div className="text-lg font-bold text-emerald-400 font-mono">Up to 35% OFF</div>
          <div className="text-[10px] text-slate-400">4 Tier wholesale pricing</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Material Catalog ({filteredMaterials.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Smart Recommendation Engine
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Sourcing Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('volumeMatrix')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'volumeMatrix'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          Volume Tier Matrix & Bulk Calculator
        </button>
      </div>

      {/* TAB 1: SWATCH CATALOG & FILTERS */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by fiber, weave, color, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar">
              {['ALL', 'FABRIC', 'LINING', 'INTERFACING', 'SILK', 'VELVET'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategoryFilter === cat
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Materials' : cat}
                </button>
              ))}
            </div>

            {/* In Stock Toggle & Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500/30"
                />
                In Stock Only
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-dark text-xs cursor-pointer py-1.5 w-36"
              >
                <option value="name">Sort: Name</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="drape">Drape Coefficient</option>
                <option value="stock">Stock Quantity</option>
              </select>
            </div>
          </div>

          {/* Grid of Material Swatch Cards */}
          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map(mat => (
                <VendorMaterialCard
                  key={mat.id}
                  material={mat}
                  onOrderClick={(material, quantity) => handleOpenOrderModal(material, quantity || 10)}
                  onSelect={(material) => handleOpenOrderModal(material, 10)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Materials Match Your Filter</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try resetting your search query, adjusting your category filters, or toggling off the in-stock only filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilter('ALL');
                  setInStockOnly(false);
                }}
                className="btn-gold text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMART RECOMMENDATIONS WIDGET */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <FabricRecommendationWidget
            materials={materials}
            onSelectOption={handleRecommendationOrder}
          />
        </div>
      )}

      {/* TAB 3: SOURCING ORDERS TRACKER */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-yellow-400" />
                  Active Sourcing Orders & Logistics Tracker
                </h3>
                <p className="text-xs text-slate-400">Track shipments from partner mills and weaving clusters</p>
              </div>
              <button
                type="button"
                onClick={() => loadData()}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Refresh Orders"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl glass-card bg-slate-950/70 border border-slate-800 hover:border-yellow-500/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-yellow-400 font-mono">{ord.orderNumber}</span>
                        <span className="badge badge-emerald uppercase text-[9px]">{ord.status}</span>
                        <span className="text-xs text-slate-400">• Vendor: <span className="text-slate-200 font-semibold">{ord.vendorName}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {ord.trackingNumber && (
                          <span className="font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            AWB: {ord.trackingNumber}
                          </span>
                        )}
                        <span className="font-bold text-yellow-400 font-mono">{formatCurrency(ord.totalAmountInr)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1.5 font-mono text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300 py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            <span>{it.materialName} ({it.meters}m)</span>
                            <span className="text-[10px] text-slate-500">[{it.sku}]</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {it.discountPercent > 0 && (
                              <span className="badge badge-emerald text-[9px]">-{it.discountPercent}% bulk</span>
                            )}
                            <span className="text-slate-100 font-semibold">{formatCurrency(it.totalCostInr)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Timestamps */}
                    <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-yellow-500" />
                        <span className="truncate max-w-xs">{ord.shippingAddress}</span>
                      </div>
                      <div className="font-mono">
                        Placed: {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No sourcing orders placed yet. Select materials from catalog or recommendation engine.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VOLUME TIER COMPARISON MATRIX & BULK CALCULATOR */}
      {activeTab === 'volumeMatrix' && (
        <div className="space-y-6">
          {/* Interactive Bulk Yield Savings Calculator */}
          <div className="glass-card p-5 rounded-2xl border border-yellow-500/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-4 h-4 text-yellow-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Wholesale Volume Discount Simulator</h3>
                <p className="text-xs text-slate-400">Calculate instant margin gains across yardage tiers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Batch Yield Requirement (Meters):</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="input-dark font-mono font-bold text-yellow-400 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400">Tier Triggered:</span>
                <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  {calcQuantity >= 200 ? 'Tier 4: Wholesale (35% OFF)' :
                   calcQuantity >= 50 ? 'Tier 3: Roll Batch (22% OFF)' :
                   calcQuantity >= 10 ? 'Tier 2: Studio Batch (10% OFF)' :
                   'Tier 1: Sample Cut (Base Rate)'}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400">Average Savings Per Meter:</span>
                <div className="text-sm font-bold text-yellow-400 font-mono">
                  {calcQuantity >= 200 ? '₹450 – ₹850 / meter saved' :
                   calcQuantity >= 50 ? '₹280 – ₹550 / meter saved' :
                   calcQuantity >= 10 ? '₹120 – ₹250 / meter saved' :
                   'Order 10m+ to unlock 10% discount'}
                </div>
              </div>
            </div>
          </div>

          {/* Full Volume Tier Comparison Matrix Table */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 glass-card">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Full Fabric Volume Tier Comparison Matrix</h3>
                <p className="text-xs text-slate-400">Live prices across all 4 procurement brackets</p>
              </div>
              <span className="badge badge-gold uppercase text-[9px]">Direct Mill Pricing</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 font-semibold border-b border-slate-800">
                    <th className="py-3 px-4 font-sans">Material & SKU</th>
                    <th className="py-3 px-4 font-sans">Fiber Composition</th>
                    <th className="py-3 px-4">Tier 1 (1–9m)</th>
                    <th className="py-3 px-4 text-yellow-400">Tier 2 (10–49m @ 10%)</th>
                    <th className="py-3 px-4 text-emerald-400">Tier 3 (50–199m @ 22%)</th>
                    <th className="py-3 px-4 text-rose-400">Tier 4 (200m+ @ 35%)</th>
                    <th className="py-3 px-4 font-sans text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {materials.map((mat) => {
                    const t1 = mat.pricingTiers?.[0]?.pricePerMeterInr || 1200;
                    const t2 = mat.pricingTiers?.[1]?.pricePerMeterInr || Math.round(t1 * 0.9);
                    const t3 = mat.pricingTiers?.[2]?.pricePerMeterInr || Math.round(t1 * 0.78);
                    const t4 = mat.pricingTiers?.[3]?.pricePerMeterInr || Math.round(t1 * 0.65);

                    return (
                      <tr key={mat.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-slate-100 line-clamp-1">{mat.name}</div>
                          <span className="text-[10px] text-slate-500">{mat.sku}</span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300">
                          {mat.fiberComposition}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-semibold">
                          {formatCurrency(t1)}/m
                        </td>
                        <td className="py-3 px-4 text-yellow-400 font-semibold">
                          {formatCurrency(t2)}/m
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">
                          {formatCurrency(t3)}/m
                        </td>
                        <td className="py-3 px-4 text-rose-400 font-semibold">
                          {formatCurrency(t4)}/m
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(mat, calcQuantity)}
                            className="px-3 py-1 rounded-lg btn-gold text-[11px] font-bold"
                          >
                            Order {calcQuantity}m
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SOURCING ORDER MODAL */}
      {quickOrderModalOpen && selectedMaterialForOrder && (
        <div 
          onClick={() => setQuickOrderModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card rounded-2xl p-6 border border-yellow-500/30 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-yellow-400" />
                  Place Sourcing Order
                </h3>
                <p className="text-xs text-slate-400">{selectedMaterialForOrder.vendor?.name || 'Verified Mill'}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickOrderModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSourcingOrder} className="space-y-4">
              {/* Material Info Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div
                  className="w-12 h-12 rounded-lg bg-cover bg-center border border-slate-700 flex-shrink-0"
                  style={{
                    backgroundImage: selectedMaterialForOrder.swatchImageUrl ? `url(${selectedMaterialForOrder.swatchImageUrl})` : undefined,
                    backgroundColor: selectedMaterialForOrder.hexColor || '#1e293b'
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{selectedMaterialForOrder.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{selectedMaterialForOrder.fiberComposition}</p>
                  <span className="text-[10px] text-yellow-400 font-mono">Stock Available: {selectedMaterialForOrder.stockLevelMeters}m</span>
                </div>
              </div>

              {/* Quantity Input with Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Procurement Quantity (Meters):</span>
                  <span className="text-[11px] text-slate-500 font-mono">MOQ: {selectedMaterialForOrder.moqMeters || 1}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderQuantityMeters(prev => Math.max(selectedMaterialForOrder.moqMeters || 1, prev - 5))}
                    className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold flex items-center justify-center"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min={selectedMaterialForOrder.moqMeters || 1}
                    max={selectedMaterialForOrder.stockLevelMeters}
                    step={1}
                    value={orderQuantityMeters}
                    onChange={(e) => setOrderQuantityMeters(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="input-dark text-center font-mono font-bold text-yellow-400 text-base py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderQuantityMeters(prev => Math.min(selectedMaterialForOrder.stockLevelMeters, prev + 5))}
                    className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold flex items-center justify-center"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Live Cost Breakdown */}
              {(() => {
                const p = calculateVolumeDiscountedPrice(selectedMaterialForOrder, orderQuantityMeters);
                const subtotal = p.totalCostInr;
                const shipping = selectedMaterialForOrder.vendor?.shippingChargeInr || 250;
                const tax = Math.round(subtotal * 0.05);
                const total = subtotal + shipping + tax;

                return (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Rate ({orderQuantityMeters}m @ {formatCurrency(p.unitPricePerMeterInr)}/m):</span>
                      <span className="font-semibold text-slate-100">{formatCurrency(subtotal)}</span>
                    </div>
                    {p.discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-400 text-[11px]">
                        <span>Volume Discount Savings:</span>
                        <span>-{formatCurrency(p.savingsInr)} ({p.discountPercent}% OFF)</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Textile GST (5%):</span>
                      <span>+{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Express Mill Courier:</span>
                      <span>+{formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-800 text-white">
                      <span>Total Payable:</span>
                      <span className="text-yellow-400">{formatCurrency(total)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Shipping Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input-dark text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gold text-xs font-bold shadow-md hover:shadow-yellow-500/20"
                >
                  Confirm & Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM SOURCING PREVIEW MODAL */}
      {bomModalOpen && (
        <div 
          onClick={() => setBomModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-card rounded-2xl p-6 border border-yellow-500/30 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
                  Bill of Materials (BOM) Sourcing Generator
                </h3>
                <p className="text-xs text-slate-400">Bundle fabric, cupro lining, and canvas interfacing into a single consolidated order</p>
              </div>
              <button
                type="button"
                onClick={() => setBomModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Garment Style</label>
                  <select
                    value={bomGarmentCategory}
                    onChange={(e) => setBomGarmentCategory(e.target.value as GarmentCategory)}
                    className="input-dark text-xs cursor-pointer"
                  >
                    <option value="mens-sherwani">Imperial Sherwani (5.5m primary)</option>
                    <option value="mens-suit">Savile Row 3-Piece Suit (5.0m primary)</option>
                    <option value="womens-lehenga">24-Kali Flared Lehenga (7.5m primary)</option>
                    <option value="womens-anarkali">Kalidar Anarkali (6.0m primary)</option>
                    <option value="womens-corset">Victorian Corset (2.2m primary)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Batch Units</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bomBatchUnits}
                    onChange={(e) => setBomBatchUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-dark font-mono font-bold text-yellow-400"
                  />
                </div>
              </div>

              {/* Live BOM Calculation Preview */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider font-sans border-b border-slate-800 pb-1">
                  Estimated Consolidated Sourcing Requirements:
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>1. Primary Shell Fabric:</span>
                  <span className="text-slate-100 font-bold">{Math.round(calculateFabricYield({ garmentCategory: bomGarmentCategory, boltWidth: 44 }).requiredMeters * bomBatchUnits * 10) / 10} Meters</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>2. Bemberg Cupro Breathable Lining:</span>
                  <span className="text-slate-100 font-bold">{Math.round(calculateFabricYield({ garmentCategory: bomGarmentCategory, boltWidth: 44 }).requiredMeters * bomBatchUnits * 0.9 * 10) / 10} Meters</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>3. Floating Horsehair Interfacing:</span>
                  <span className="text-slate-100 font-bold">{bomBatchUnits * 1.2} Meters</span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans italic pt-1">
                  * Automatically bundles items, applies wholesale tier discounts, and computes 5% textile GST.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateBOMOrder}
                  className="px-5 py-2 rounded-xl btn-gold text-xs font-bold shadow-md"
                >
                  Generate Consolidated BOM Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
