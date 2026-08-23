'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  DollarSign, 
  FileText, 
  Images, 
  X, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Percent,
  Scissors
} from 'lucide-react';
import { ArtisanPortfolioProfile, TailorProductionBid, ArtisanSpecialty, ArtisanGalleryItem } from '@/types/ecosystem';
import { useCurrency } from '@/components/currency-context';

export interface TailorBidCardProps {
  artisan?: ArtisanPortfolioProfile;
  bid?: TailorProductionBid;
  onAcceptBid?: (bid: TailorProductionBid) => void;
  onRequestCustomBid?: (artisan: ArtisanPortfolioProfile) => void;
  onSelect?: (artisan: ArtisanPortfolioProfile) => void;
  showGalleryByDefault?: boolean;
  className?: string;
}

export function TailorBidCard({
  artisan,
  bid,
  onAcceptBid,
  onRequestCustomBid,
  onSelect,
  className = '',
}: TailorBidCardProps) {
  const { formatCurrency } = useCurrency();
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<ArtisanGalleryItem | null>(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [milestonesExpanded, setMilestonesExpanded] = useState(false);

  // If a bid is provided, extract artisan data from either profile or bid info
  const name = artisan?.masterTailorName || bid?.artisanName || 'Master Artisan';
  const workshop = artisan?.workshopName || bid?.artisanWorkshopName || 'Artisan Workshop';
  const avatar = artisan?.avatarUrl || bid?.artisanAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  const rating = artisan?.rating || bid?.artisanRating || 4.9;
  const specialties = artisan?.specialties || bid?.artisanSpecialties || [];

  const formatSpecialtyLabel = (spec: string) => {
    return spec
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCapacityPercent = () => {
    if (!artisan || !artisan.monthlyCapacityGarments) return 50;
    return Math.min(100, Math.round((artisan.activeOrdersCount / artisan.monthlyCapacityGarments) * 100));
  };

  return (
    <>
      <div 
        onClick={() => artisan && onSelect && onSelect(artisan)}
        className={`relative rounded-2xl glass-card p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4 ${
          bid?.status === 'ACCEPTED' ? 'glass-card-gold ring-1 ring-yellow-500/50' : ''
        } ${className}`}
      >
        {/* Card Header: Avatar, Name, Verification, Rating */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={avatar}
                  alt={name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
                {artisan?.verifiedBadge !== false && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                  {name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{workshop}</p>
                {artisan?.location && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-medium">
                    <MapPin className="w-2.5 h-2.5 text-yellow-500" />
                    <span>{artisan.location.hubZone ? `${artisan.location.hubZone}, ` : ''}{artisan.location.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating & Experience Badge */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-lg">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 font-mono">{rating.toFixed(2)}</span>
                {artisan?.reviewsCount && (
                  <span className="text-[10px] text-slate-500">({artisan.reviewsCount})</span>
                )}
              </div>
              {artisan?.experienceYears && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {artisan.experienceYears}+ yrs master exp
                </span>
              )}
            </div>
          </div>

          {/* Specialties Badges */}
          <div className="flex flex-wrap gap-1">
            {specialties.map((spec, idx) => (
              <span 
                key={idx} 
                className="badge badge-gold text-[9px] uppercase tracking-wider font-semibold"
              >
                {formatSpecialtyLabel(spec)}
              </span>
            ))}
          </div>

          {/* If Bid is Attached: Bid Terms & Lead Time Box */}
          {bid && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-yellow-500/30 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Proposed Bid (Per Unit):</span>
                <span className="text-base font-bold text-yellow-400">{formatCurrency(bid.bidAmountPerUnitInr)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800">
                <span>Total Contract Proposal:</span>
                <span className="font-bold text-slate-100">{formatCurrency(bid.totalBidAmountInr)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  Estimated Lead Time:
                </span>
                <span className="font-semibold text-slate-200">{bid.estimatedLeadTimeDays} Days</span>
              </div>

              {bid.sampleSwatchesOffered && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" />
                  Physical sample swatches & embroidery strike-off included
                </div>
              )}

              {/* Proposal Notes */}
              {bid.proposalNotes && (
                <p className="text-[11px] text-slate-300 font-sans italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  &ldquo;{bid.proposalNotes}&rdquo;
                </p>
              )}

              {/* 4-Stage Milestone Breakdown Toggle */}
              {bid.milestonePlan && bid.milestonePlan.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMilestonesExpanded(!milestonesExpanded);
                    }}
                    className="text-[11px] text-yellow-400/90 hover:text-yellow-300 flex items-center justify-between w-full py-1 font-sans font-medium"
                  >
                    <span>View 4-Stage Milestone Escrow Plan</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${milestonesExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {milestonesExpanded && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-800 animate-in fade-in duration-150">
                      {bid.milestonePlan.map((m, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>Stage {m.stageIndex}: {m.milestoneName}</span>
                            <span className="text-yellow-400">{m.percentagePayout}% (Day {m.daysFromStart})</span>
                          </div>
                          <p className="text-slate-400 font-sans text-[10px]">{m.deliverableDescription}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Artisan Profile Capacity & SAM Rates (when rendering in Artisan Directory mode) */}
          {!bid && artisan && (
            <div className="space-y-2 pt-1">
              {/* Capacity Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Current Atelier Load:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {artisan.activeOrdersCount} / {artisan.monthlyCapacityGarments} units ({getCapacityPercent()}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      getCapacityPercent() > 85 ? 'bg-rose-500' : getCapacityPercent() > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${getCapacityPercent()}%` }}
                  />
                </div>
              </div>

              {/* Standard SAM / Hourly Rate Metrics */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-center">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Standard SAM</span>
                  <span className="text-xs font-bold text-yellow-400">
                    {formatCurrency(artisan.standardMinuteSamRateInr)}
                    <span className="text-[9px] text-slate-400 font-normal"> /min</span>
                  </span>
                </div>
                <div className="border-l border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Completed Bids</span>
                  <span className="text-xs font-bold text-slate-200">
                    {artisan.completedBidsCount || 0} <span className="text-[9px] text-emerald-400 font-normal">({artisan.onTimeDeliveryRatePercent}% on-time)</span>
                  </span>
                </div>
              </div>

              {/* Gallery Thumbnails Preview */}
              {artisan.gallery && artisan.gallery.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Images className="w-3 h-3 text-yellow-500" />
                      Artisanal Portfolio Gallery ({artisan.gallery.length})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryModalOpen(true);
                      }}
                      className="text-[10px] text-yellow-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {artisan.gallery.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGalleryItem(item);
                          setGalleryModalOpen(true);
                        }}
                        className="relative h-14 rounded-lg overflow-hidden border border-slate-700 bg-cover bg-center cursor-pointer group/thumb hover:scale-102 transition-transform"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-slate-950/40 group-hover/thumb:bg-slate-950/10 transition-colors" />
                        <span className="absolute bottom-0.5 left-1 right-1 text-[8px] font-medium text-white truncate drop-shadow">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t border-slate-800">
          {bid ? (
            <div className="flex items-center gap-2">
              {bid.status === 'ACCEPTED' ? (
                <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Bid Accepted — Milestone Contract Active
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAcceptBid) onAcceptBid(bid);
                  }}
                  className="w-full py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-yellow-500/20"
                >
                  <Check className="w-4 h-4" />
                  Accept Bid & Lock Escrow
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Images className="w-3.5 h-3.5" />
                Portfolio
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (artisan && onRequestCustomBid) onRequestCustomBid(artisan);
                }}
                className="flex-1 py-2 rounded-xl btn-gold text-xs font-bold transition-transform flex items-center justify-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                Invite to Brief
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Artisan Sample Gallery Modal */}
      {galleryModalOpen && (
        <div 
          onClick={() => setGalleryModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-card rounded-2xl p-5 border border-yellow-500/30 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Images className="w-4 h-4 text-yellow-400" />
                  Artisanal Sample Gallery — {name}
                </h3>
                <p className="text-xs text-slate-400">{workshop} • {artisan?.location?.city || 'Master Karigar'}</p>
              </div>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(artisan?.gallery || []).map((item, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 space-y-2 p-2.5">
                  <div 
                    className="h-48 w-full rounded-lg bg-cover bg-center border border-slate-800"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="badge badge-gold text-[9px] uppercase">{item.garmentCategory}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Technique: <span className="text-yellow-400">{item.technique}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications footer */}
            {artisan?.certifications && artisan.certifications.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Accreditations & Guild Certifications:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {artisan.certifications.map((cert, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-400" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
