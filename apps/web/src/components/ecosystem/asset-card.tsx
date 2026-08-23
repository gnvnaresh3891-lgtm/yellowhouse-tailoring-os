'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Star, 
  Layers, 
  Clock, 
  Ruler, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Box, 
  FileCode2, 
  Scissors, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { FashionBlueprintAsset, LicenseTierType } from '@/types/ecosystem';
import { useCurrency } from '@/components/currency-context';

interface AssetCardProps {
  asset: FashionBlueprintAsset;
  onLicense: (asset: FashionBlueprintAsset, selectedTier?: LicenseTierType) => void;
  onView3DPreview?: (asset: FashionBlueprintAsset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onLicense,
  onView3DPreview,
}) => {
  const { formatCurrency } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    INTERMEDIATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ADVANCED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MASTER_KARIGAR: 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-500/20'
  };

  const creatorTierBadges: Record<string, { label: string; color: string }> = {
    MASTER_CREATOR: { label: 'Master Creator', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' },
    CERTIFIED_ATELIER: { label: 'Certified Atelier', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' },
    INDIE_DESIGNER: { label: 'Indie Designer', color: 'bg-slate-500/15 text-slate-300 border-slate-500/40' }
  };

  const images = asset.previewImageUrls && asset.previewImageUrls.length > 0 
    ? asset.previewImageUrls 
    : [asset.coverImageUrl];

  const currentImage = images[activeImageIdx] || asset.coverImageUrl;

  const personalPrice = asset.pricingTiers?.personalBespoke?.priceInr || 4500;
  const commercialPrice = asset.pricingTiers?.commercialProduction?.priceInr || 18500;
  const buyoutPrice = asset.pricingTiers?.exclusiveBuyout?.priceInr || 95000;

  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        asset.featured 
          ? 'glass-card-gold ring-1 ring-yellow-500/40 shadow-xl shadow-yellow-950/20' 
          : 'glass-card hover:border-yellow-600/40 hover:shadow-2xl hover:shadow-black/50'
      }`}
    >
      {/* Featured Banner Ribbon */}
      {asset.featured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/90 to-amber-600/90 text-slate-950 text-xs font-bold shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          <span>Featured Masterpiece</span>
        </div>
      )}

      {/* 3D Interactive Badge */}
      {asset.is3dInteractive && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-yellow-500/40 text-yellow-400 text-xs font-semibold shadow-lg backdrop-blur-md">
          <Box className="w-3.5 h-3.5 animate-pulse" />
          <span>3D Simulation</span>
        </div>
      )}

      {/* Image Preview & Gallery */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={currentImage} 
          alt={asset.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/20 pointer-events-none" />

        {/* Multi-image thumbnail selector */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImageIdx === idx ? 'w-6 bg-yellow-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Preview slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Category & Difficulty Badges overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-medium backdrop-blur-md uppercase tracking-wider">
            {asset.garmentCategory?.replace('mens-', "Men's ")?.replace('womens-', "Women's ")?.replace('-', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium backdrop-blur-md uppercase tracking-wider ${difficultyColors[asset.difficultyLevel] || difficultyColors.INTERMEDIATE}`}>
            {asset.difficultyLevel.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Title, Creator, & Rating */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-yellow-400 transition-colors line-clamp-1">
              {asset.title}
            </h3>
          </div>

          {/* Creator Profile */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={asset.creatorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                alt={asset.creatorName} 
                className="w-5 h-5 rounded-full object-cover ring-1 ring-yellow-500/30"
              />
              <span className="text-slate-300 font-medium">{asset.creatorName}</span>
              <span className={`px-1.5 py-0.2 rounded border text-[10px] ${creatorTierBadges[asset.creatorTier]?.color || 'border-slate-700 text-slate-400'}`}>
                {creatorTierBadges[asset.creatorTier]?.label || 'Creator'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{asset.rating.toFixed(2)}</span>
              <span className="text-slate-500 font-normal">({asset.reviewsCount})</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {asset.description}
          </p>
        </div>

        {/* Tech Pack Quick Specs Matrix */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]">
          <div className="flex flex-col items-center justify-center text-center p-1">
            <span className="text-slate-500 flex items-center gap-1 mb-0.5">
              <Scissors className="w-3 h-3 text-yellow-500/80" /> Pieces
            </span>
            <span className="font-semibold text-slate-200">
              {asset.techPackSpecs?.patternPiecesCount || 12} CAD
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-1 border-x border-slate-800">
            <span className="text-slate-500 flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-yellow-500/80" /> Est. SAM
            </span>
            <span className="font-semibold text-slate-200">
              {asset.techPackSpecs?.estimatedSewingSamMinutes || 360}m
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-1">
            <span className="text-slate-500 flex items-center gap-1 mb-0.5">
              <Download className="w-3 h-3 text-yellow-500/80" /> Licensed
            </span>
            <span className="font-semibold text-slate-200">
              {asset.downloadsCount || 0} runs
            </span>
          </div>
        </div>

        {/* File Format Badges & Tags */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex flex-wrap gap-1">
            {asset.fileFormats?.slice(0, 4).map((fmt) => (
              <span 
                key={fmt} 
                className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300"
              >
                {fmt}
              </span>
            ))}
            {(asset.fileFormats?.length || 0) > 4 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400">
                +{asset.fileFormats.length - 4}
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {asset.fileSizeMb} MB
          </span>
        </div>

        {/* Expandable Extended Tech Pack Specifications */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5">
              <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-yellow-400" />
                <span>Grading Sizes & Seam Specs:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {asset.techPackSpecs?.gradingRange?.map((size) => (
                  <span key={size} className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px] font-mono">
                    {size}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                  Seam: {asset.techPackSpecs?.seamAllowancesMm}mm
                </span>
              </div>
            </div>

            {asset.techPackSpecs?.recommendedFabrics && asset.techPackSpecs.recommendedFabrics.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold">Recommended Fabrics:</span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {asset.techPackSpecs.recommendedFabrics.join(', ')}
                </p>
              </div>
            )}

            {asset.techPackSpecs?.interfacingSpecifications && (
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold">Interfacing / Canvas:</span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {asset.techPackSpecs.interfacingSpecifications}
                </p>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-yellow-950/20 border border-yellow-500/20 text-[11px] text-yellow-200/90 leading-relaxed">
              <span className="font-semibold text-yellow-400">License Terms: </span>
              {asset.licenseTermsSummary}
            </div>
          </div>
        )}

        {/* Pricing Tiers & Action Buttons */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Starting License
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-yellow-400 font-mono">
                  {formatCurrency(personalPrice)}
                </span>
                <span className="text-[11px] text-slate-500">/ 3 bespoke runs</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-400 hover:text-yellow-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
            >
              <span>{isExpanded ? 'Less Specs' : 'Full Specs'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onLicense(asset, 'PERSONAL_BESPOKE')}
              className="btn-gold text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>License Blueprint</span>
            </button>

            <button
              type="button"
              onClick={() => onLicense(asset, 'COMMERCIAL_PRODUCTION')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 hover:border-yellow-500/40 flex items-center justify-center gap-1.5 transition-all"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Commercial Tier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
