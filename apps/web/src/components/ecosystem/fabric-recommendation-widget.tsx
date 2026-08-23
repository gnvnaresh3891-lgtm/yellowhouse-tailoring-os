'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  TrendingDown, 
  Crown, 
  CheckCircle2, 
  ShoppingCart, 
  SlidersHorizontal, 
  ArrowRight, 
  BarChart3, 
  ChevronRight, 
  ShieldCheck, 
  Star,
  Info,
  RefreshCw,
  Tag
} from 'lucide-react';
import { 
  VendorMaterialItem, 
  GarmentCategory, 
  SmartFabricRecommendationResult, 
  FabricRecommendationOption 
} from '@/types/ecosystem';
import { computeSmartFabricRecommendations } from '@/lib/ecosystem-algorithms';
import { calculateFabricYield } from '@/lib/fabric-yield';
import { useCurrency } from '@/components/currency-context';

export interface FabricRecommendationWidgetProps {
  materials: VendorMaterialItem[];
  initialCategory?: GarmentCategory;
  onSelectOption?: (option: FabricRecommendationOption, category: GarmentCategory, meters: number) => void;
  className?: string;
}

const ALL_GARMENT_CATEGORIES: { id: GarmentCategory; label: string; gender: 'Men' | 'Women' }[] = [
  { id: 'mens-suit', label: "Savile Row Men's Suit", gender: 'Men' },
  { id: 'mens-sherwani', label: "Imperial Men's Sherwani", gender: 'Men' },
  { id: 'mens-shirt', label: "Bespoke Dress Shirt", gender: 'Men' },
  { id: 'mens-trouser', label: "Pleated Dress Trousers", gender: 'Men' },
  { id: 'womens-lehenga', label: "24-Kali Flared Bridal Lehenga", gender: 'Women' },
  { id: 'womens-anarkali', label: "Flared Kalidar Anarkali", gender: 'Women' },
  { id: 'womens-gown', label: "Couture Evening Gown", gender: 'Women' },
  { id: 'womens-corset', label: "Steel-Boned Architecture Corset", gender: 'Women' },
  { id: 'womens-blouse', label: "Princess-Cut Sari Blouse", gender: 'Women' },
];

const COLOR_PRESETS = [
  { name: 'Royal Ivory', hex: '#FBF7EE' },
  { name: 'Midnight Navy', hex: '#0A1128' },
  { name: 'Carbon Black', hex: '#111111' },
  { name: 'Antique Gold', hex: '#D4AF37' },
  { name: 'Blush Rose', hex: '#F7CAC9' },
  { name: 'Emerald Green', hex: '#064E3B' },
  { name: 'Crimson Wine', hex: '#881337' },
];

export function FabricRecommendationWidget({
  materials,
  initialCategory = 'mens-sherwani',
  onSelectOption,
  className = '',
}: FabricRecommendationWidgetProps) {
  const { formatCurrency } = useCurrency();

  // Widget User Inputs
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>(initialCategory);
  const [maxBudgetPerMeter, setMaxBudgetPerMeter] = useState<number>(2500);
  const [customYieldMeters, setCustomYieldMeters] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [desiredDrape, setDesiredDrape] = useState<'STRUCTURED' | 'FLUID' | 'SCULPTURAL' | 'LIGHTWEIGHT'>('STRUCTURED');
  const [season, setSeason] = useState<'SUMMER_SPRING' | 'WINTER_FESTIVE' | 'MONSOON_ALL_WEATHER'>('WINTER_FESTIVE');
  const [includeLiningAndTrims, setIncludeLiningAndTrims] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');

  // Baseline automatic fabric yield calculation based on garment category
  const defaultCalculatedYield = useMemo(() => {
    return calculateFabricYield({
      garmentCategory: selectedCategory,
      boltWidth: 44
    }).requiredMeters;
  }, [selectedCategory]);

  const activeYieldMeters = customYieldMeters ?? defaultCalculatedYield;

  // Run Recommendation Engine Algorithm
  const recommendations: SmartFabricRecommendationResult = useMemo(() => {
    return computeSmartFabricRecommendations(materials, {
      garmentCategory: selectedCategory,
      targetGarmentType: selectedCategory,
      maxBudgetPerMeter,
      targetBudgetInr: maxBudgetPerMeter * activeYieldMeters,
      minRequiredYieldMeters: activeYieldMeters,
      preferredColorTone: selectedColor,
      desiredDrape,
      season,
      includeLiningAndTrims
    });
  }, [materials, selectedCategory, maxBudgetPerMeter, activeYieldMeters, selectedColor, desiredDrape, season, includeLiningAndTrims]);

  const handleOrderOption = (option: FabricRecommendationOption) => {
    if (onSelectOption) {
      onSelectOption(option, selectedCategory, option.requiredMeters);
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border border-slate-800 space-y-6 ${className}`}>
      {/* Widget Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Smart Fabric Recommendation Engine
                <span className="badge badge-gold uppercase text-[9px]">AI Sourcing</span>
              </h2>
              <p className="text-xs text-slate-400">
                Physics-based drape matching (45%), volume budget optimization (40%), and vendor quality scoring (15%)
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher (Cards vs Matrix) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cards'
                ? 'bg-yellow-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3-Tier Options
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'matrix'
                ? 'bg-yellow-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparison Matrix
          </button>
        </div>
      </div>

      {/* Interactive Controls & Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {/* 1. Target Garment Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Target Garment</span>
            <span className="text-[10px] text-slate-500 font-mono">POM Synced</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as GarmentCategory);
              setCustomYieldMeters(null); // Reset yield to auto for new category
            }}
            className="input-dark text-xs cursor-pointer"
          >
            <optgroup label="Men's Bespoke">
              {ALL_GARMENT_CATEGORIES.filter(c => c.gender === 'Men').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </optgroup>
            <optgroup label="Women's Couture">
              {ALL_GARMENT_CATEGORIES.filter(c => c.gender === 'Women').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 2. Max Budget Per Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Max Budget / Meter</span>
            <span className="font-bold text-yellow-400 font-mono">{formatCurrency(maxBudgetPerMeter)}</span>
          </div>
          <input
            type="range"
            min={500}
            max={6000}
            step={100}
            value={maxBudgetPerMeter}
            onChange={(e) => setMaxBudgetPerMeter(parseInt(e.target.value))}
            className="w-full accent-yellow-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>₹500/m</span>
            <span>₹3,000/m</span>
            <span>₹6,000/m</span>
          </div>
        </div>

        {/* 3. Required Yield Meters & Drape Profile */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Required Fabric Yield</span>
            <span className="font-bold text-yellow-400 font-mono">{activeYieldMeters} meters</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={30}
              step={0.25}
              value={activeYieldMeters}
              onChange={(e) => setCustomYieldMeters(parseFloat(e.target.value) || 1)}
              className="input-dark text-xs font-mono font-bold text-yellow-400 py-1"
            />
            <button
              type="button"
              onClick={() => setCustomYieldMeters(null)}
              title="Reset to CAD auto-calculated yield"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Desired Drape & Season */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Drape Architecture</label>
          <select
            value={desiredDrape}
            onChange={(e) => setDesiredDrape(e.target.value as any)}
            className="input-dark text-xs cursor-pointer"
          >
            <option value="STRUCTURED">STRUCTURED (Achkan, Tuxedo, Heavy Suits)</option>
            <option value="SCULPTURAL">SCULPTURAL (Corsets, Structured Gowns)</option>
            <option value="FLUID">FLUID (Lehengas, Anarkalis, Drapes)</option>
            <option value="LIGHTWEIGHT">LIGHTWEIGHT (Dupattas, Summer Blouses)</option>
          </select>
        </div>

        {/* Second Row of Filters: Color Tone & Lining Toggle */}
        <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Color Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Preferred Color:</span>
            <button
              type="button"
              onClick={() => setSelectedColor('')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedColor === ''
                  ? 'bg-yellow-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Any Tone
            </button>
            {COLOR_PRESETS.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedColor(c.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedColor === c.name
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>

          {/* Include Lining & Trims Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={includeLiningAndTrims}
              onChange={(e) => setIncludeLiningAndTrims(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500/30"
            />
            Include Matching Lining & Artisanal Trims in Estimate
          </label>
        </div>
      </div>

      {/* 3-Tier Recommendation Cards View */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 1. Best Match Option */}
          {recommendations.options.bestMatch && (
            <RecommendationTierCard
              option={recommendations.options.bestMatch}
              badgeLabel="Best Match"
              badgeColor="badge-gold"
              icon={Crown}
              formatCurrency={formatCurrency}
              onOrder={() => handleOrderOption(recommendations.options.bestMatch)}
            />
          )}

          {/* 2. Budget Saver Option */}
          {recommendations.options.budgetSaver && (
            <RecommendationTierCard
              option={recommendations.options.budgetSaver}
              badgeLabel="Budget Saver"
              badgeColor="badge-emerald"
              icon={TrendingDown}
              formatCurrency={formatCurrency}
              onOrder={() => handleOrderOption(recommendations.options.budgetSaver)}
            />
          )}

          {/* 3. Luxury Upgrade Option */}
          {recommendations.options.luxuryUpgrade && (
            <RecommendationTierCard
              option={recommendations.options.luxuryUpgrade}
              badgeLabel="Luxury Upgrade"
              badgeColor="badge-rose"
              icon={Sparkles}
              formatCurrency={formatCurrency}
              onOrder={() => handleOrderOption(recommendations.options.luxuryUpgrade)}
            />
          )}
        </div>
      )}

      {/* Comparison Matrix Tab View */}
      {activeTab === 'matrix' && (
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Evaluation Criterion</th>
                  <th className="py-3 px-4 text-yellow-400">★ Best Match</th>
                  <th className="py-3 px-4 text-emerald-400">⚡ Budget Saver</th>
                  <th className="py-3 px-4 text-rose-400">✦ Luxury Upgrade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recommendations.comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300 bg-slate-950/40">{row.criterion}</td>
                    <td className="py-3 px-4 font-mono text-yellow-400">{row.bestMatchValue}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">{row.budgetSaverValue}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">{row.luxuryUpgradeValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface RecommendationTierCardProps {
  option: FabricRecommendationOption;
  badgeLabel: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  formatCurrency: (amount: number) => string;
  onOrder: () => void;
}

function RecommendationTierCard({
  option,
  badgeLabel,
  badgeColor,
  icon: Icon,
  formatCurrency,
  onOrder
}: RecommendationTierCardProps) {
  const fabric = option.primaryFabric;
  if (!fabric) return null;

  return (
    <div className="relative rounded-2xl glass-card border border-slate-800 hover:border-yellow-500/50 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 group">
      {/* Top Header & Match Fit Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`badge ${badgeColor} shadow-md uppercase text-[10px] flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {badgeLabel}
          </span>
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400">Fit Score:</span>
            <span className="text-xs font-bold text-yellow-400 font-mono">{option.fitScore}%</span>
          </div>
        </div>

        {/* Fabric Swatch Thumbnail & Names */}
        <div className="flex items-start gap-3">
          <div
            className="w-16 h-16 rounded-xl bg-cover bg-center border border-slate-700 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
            style={{
              backgroundImage: fabric.swatchImageUrl ? `url(${fabric.swatchImageUrl})` : undefined,
              backgroundColor: fabric.hexColor || '#1e293b'
            }}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
              {fabric.name}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {fabric.fiberComposition}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: fabric.hexColor }} />
                {fabric.colorName}
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] font-mono text-slate-400">{fabric.weightGsm} GSM</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Summary Grid */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Fabric ({option.requiredMeters}m @ {formatCurrency(option.appliedUnitPriceInr)}/m):</span>
            <span className="font-semibold text-slate-100">{formatCurrency(option.fabricTotalCostInr)}</span>
          </div>

          {(option.liningTotalCostInr || 0) > 0 && (
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Cupro/Habotai Lining:</span>
              <span>+{formatCurrency(option.liningTotalCostInr || 0)}</span>
            </div>
          )}

          {option.estimatedTrimsCostInr > 0 && (
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Artisanal Thread & Trims:</span>
              <span>+{formatCurrency(option.estimatedTrimsCostInr)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-sm font-bold">
            <span className="text-slate-200">Total Material Outlay:</span>
            <span className="text-yellow-400">{formatCurrency(option.grandTotalMaterialCostInr)}</span>
          </div>
        </div>

        {/* Reasoning Bullet Points */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Key Highlights:</span>
          <ul className="space-y-1">
            {option.reasoning.map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400/80 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Action: 1-Click Sourcing Order */}
      <button
        type="button"
        onClick={onOrder}
        className="w-full py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-yellow-500/20"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Add to Sourcing Order ({option.requiredMeters}m)
      </button>
    </div>
  );
}
