'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Percent, 
  Star, 
  MapPin, 
  ShoppingCart, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { VendorMaterialItem, VolumePricingTier } from '@/types/ecosystem';
import { calculateVolumeDiscountedPrice } from '@/lib/ecosystem-algorithms';
import { useCurrency } from '@/components/currency-context';

export interface VendorMaterialCardProps {
  material: VendorMaterialItem;
  onOrderClick?: (material: VendorMaterialItem, quantityMeters?: number) => void;
  onSelect?: (material: VendorMaterialItem) => void;
  selected?: boolean;
  showDetailedMetrics?: boolean;
  className?: string;
}

export function VendorMaterialCard({
  material,
  onOrderClick,
  onSelect,
  selected = false,
  showDetailedMetrics = true,
  className = '',
}: VendorMaterialCardProps) {
  const { formatCurrency } = useCurrency();
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const [quickOrderMeters, setQuickOrderMeters] = useState<number>(material.moqMeters || 5);
  const [isOrdering, setIsOrdering] = useState(false);

  const isLowStock = material.stockLevelMeters <= material.reorderThresholdMeters;
  const isOutOfStock = !material.inStock || material.stockLevelMeters <= 0;

  // Calculate volume price preview based on current quick-order quantity
  const volumePricing = calculateVolumeDiscountedPrice(material, quickOrderMeters);

  // Drape description helper
  const getDrapeLabel = (drape: number) => {
    if (drape <= 3.0) return 'Structured / Rigid';
    if (drape <= 5.5) return 'Medium Structured';
    if (drape <= 7.5) return 'Flowing / Semi-Fluid';
    return 'Ultra Fluid / Liquid';
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'FABRIC':
      case 'SILK':
      case 'VELVET':
      case 'ORGANZA':
      case 'COTTON':
        return 'badge-gold';
      case 'LINING':
      case 'LININGS':
        return 'badge-blue';
      case 'INTERFACING':
        return 'badge-amber';
      case 'TRIM':
      case 'TRIMS':
        return 'badge-emerald';
      default:
        return 'badge-gold';
    }
  };

  const handleQuickOrderSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrderClick) {
      onOrderClick(material, quickOrderMeters);
    }
    setIsOrdering(false);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(material)}
      className={`relative group rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
        selected ? 'glass-card-gold ring-2 ring-yellow-400/80 shadow-lg shadow-yellow-500/10' : 'glass-card hover:border-slate-700'
      } ${className}`}
    >
      {/* Top Swatch Visual Header */}
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
        {/* Background Image / Color Fill */}
        {material.swatchImageUrl ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${material.swatchImageUrl})` }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: material.hexColor || '#1e293b' }}
          >
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">{material.weaveType}</span>
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Stock Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="badge badge-rose shadow-md backdrop-blur-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="badge badge-amber shadow-md backdrop-blur-md animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Low Stock: {material.stockLevelMeters}m
            </span>
          ) : (
            <span className="badge badge-emerald shadow-md backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              In Stock: {material.stockLevelMeters}m
            </span>
          )}

          <span className={`badge ${getCategoryBadgeClass(material.category)} shadow-md backdrop-blur-md uppercase text-[9px]`}>
            {material.category}
          </span>
        </div>

        {/* Color Hex Preview Circle & SKU */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div
            className="w-6 h-6 rounded-full border-2 border-white/80 shadow-md flex-shrink-0"
            style={{ backgroundColor: material.hexColor || '#ffffff' }}
            title={`Color: ${material.colorName} (${material.hexColor})`}
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
            {material.sku}
          </span>
        </div>

        {/* Bottom Swatch Info on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between z-10">
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: material.hexColor }} />
              {material.colorName}
            </div>
            {material.pantoneCode && (
              <span className="text-[10px] text-slate-400 font-mono">Pantone: {material.pantoneCode}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">from</span>
            <div className="text-sm font-bold text-yellow-400 font-mono">
              {formatCurrency(material.pricingTiers?.[0]?.pricePerMeterInr || 1200)}
              <span className="text-[10px] text-slate-400 font-normal"> /m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Material Name & Fiber Composition */}
          <div>
            <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-1 group-hover:text-yellow-400 transition-colors">
              {material.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 font-medium mt-0.5">
              {material.fiberComposition} • {material.weaveType}
            </p>
          </div>

          {/* Physical Fabric Attributes (GSM, Bolt Width, Drape) */}
          {showDetailedMetrics && (
            <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Weight</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">{material.weightGsm} <span className="text-[9px] text-slate-400">GSM</span></span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Bolt Width</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">{material.boltWidthInches}&quot; <span className="text-[9px] text-slate-400">({Math.round(material.boltWidthInches * 2.54)}cm)</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Drape</span>
                <span className="text-xs font-semibold text-yellow-400 font-mono">{material.drapeScore || 5.0}<span className="text-[9px] text-slate-400">/10</span></span>
              </div>
            </div>
          )}

          {/* Drape Status Descriptor Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Drape Profile:</span>
              <span className="text-slate-300 font-medium">{getDrapeLabel(material.drapeScore || 5)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, ((material.drapeScore || 5) / 10) * 100))}%` }}
              />
            </div>
          </div>

          {/* Vendor Information */}
          {material.vendor && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1 text-slate-300 truncate max-w-[65%]">
                {material.vendor.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
                <span className="truncate font-medium">{material.vendor.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                <span className="flex items-center gap-0.5 text-yellow-400 font-semibold font-mono text-[11px]">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {material.vendor.rating?.toFixed(1) || '4.9'}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {material.vendor.city}
                </span>
              </div>
            </div>
          )}

          {/* Recommended Garment Categories Tags */}
          {material.recommendedGarments && material.recommendedGarments.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {material.recommendedGarments.slice(0, 3).map((garment, idx) => (
                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-yellow-500/70" />
                  {garment.replace('-', ' ')}
                </span>
              ))}
              {material.recommendedGarments.length > 3 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  +{material.recommendedGarments.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Volume Discount Popover Trigger & Quick Order Button */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          {/* Volume Tiers Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumePopover(!showVolumePopover);
              }}
              className="w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-yellow-400/90 font-medium">
                <Percent className="w-3 h-3" />
                Volume Discount Tiers (Up to 35% off)
              </span>
              {showVolumePopover ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Volume Tiers Breakdown Popover */}
            {showVolumePopover && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full mb-2 left-0 right-0 z-30 p-3 rounded-xl glass-card bg-slate-950/95 border border-yellow-500/30 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Tiered Volume Pricing
                  </span>
                  <span className="text-[10px] text-slate-400">MOQ: {material.moqMeters || 1}m</span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  {material.pricingTiers && material.pricingTiers.length > 0 ? (
                    material.pricingTiers.map((tier: VolumePricingTier, idx: number) => {
                      const range = tier.maxMeters ? `${tier.minMeters} – ${tier.maxMeters}m` : `${tier.minMeters}m+`;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300"
                        >
                          <span className="text-[11px]">{range}</span>
                          <div className="flex items-center gap-2">
                            {tier.discountPercent > 0 && (
                              <span className="badge badge-emerald text-[9px]">
                                -{tier.discountPercent}%
                              </span>
                            )}
                            <span className="font-bold text-yellow-400">
                              {formatCurrency(tier.pricePerMeterInr)}/m
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-slate-400 text-center py-1">Standard pricing applies</div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Bulk discounts auto-applied at checkout based on total line quantity.
                </p>
              </div>
            )}
          </div>

          {/* Quick Order Expandable or Direct Action */}
          {isOrdering ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-xl bg-slate-950 border border-yellow-500/40 space-y-2 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Order Quantity (Meters):</span>
                <span className="text-[10px] text-slate-400">Max: {material.stockLevelMeters}m</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickOrderMeters(prev => Math.max(material.moqMeters || 1, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-sm flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min={material.moqMeters || 1}
                  max={material.stockLevelMeters || 9999}
                  step={0.5}
                  value={quickOrderMeters}
                  onChange={(e) => setQuickOrderMeters(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="input-dark text-center font-mono font-bold text-yellow-400 py-1"
                />
                <button
                  type="button"
                  onClick={() => setQuickOrderMeters(prev => Math.min(material.stockLevelMeters, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Live Cost Calculation with Volume Discount */}
              <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">Unit Price:</span>
                  <span className="text-slate-200">{formatCurrency(volumePricing.unitPricePerMeterInr)}/m</span>
                  {volumePricing.discountPercent > 0 && (
                    <span className="text-[9px] text-emerald-400 ml-1">({volumePricing.discountPercent}% off)</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Total Cost:</span>
                  <span className="text-sm font-bold text-yellow-400">{formatCurrency(volumePricing.totalCostInr)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOrdering(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickOrderSubmit}
                  className="flex-1 py-1.5 rounded-lg btn-gold text-xs font-bold transition-transform"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (onOrderClick) {
                  setIsOrdering(true);
                }
              }}
              className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'btn-gold shadow-md hover:shadow-yellow-500/20'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isOutOfStock ? 'Sold Out' : 'Quick Sourcing Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
