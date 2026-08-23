'use client';

import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Video, 
  Building2, 
  Home, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  Palette, 
  Scissors, 
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { CertifiedStylistProfile, StylistSpecialization, ConsultationMode, StylistBadgeLevel } from '@/types/ecosystem';
import { useCurrency } from '@/components/currency-context';

interface StylistCardProps {
  stylist: CertifiedStylistProfile;
  onBookConsultation: (stylist: CertifiedStylistProfile) => void;
  onViewProfile?: (stylist: CertifiedStylistProfile) => void;
  discountPercent?: number;
}

export const SPECIALTY_LABELS: Record<StylistSpecialization, { label: string; icon: any; color: string }> = {
  BRIDAL_TROUSSEAU: { label: 'Bridal Trousseau', icon: Sparkles, color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  INDO_WESTERN_FUSION: { label: 'Indo-Western Fusion', icon: Scissors, color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  BESPOKE_SUITING_CONSULTANT: { label: 'Bespoke Suiting', icon: ShieldCheck, color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  ZARDOZI_MOTIF_CURATION: { label: 'Zardozi Curation', icon: Award, color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  COLOR_SEASONAL_ANALYSIS: { label: 'Color Analysis', icon: Palette, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  ROYAL_HERITAGE_DRAPING: { label: 'Heritage Draping', icon: Tag, color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' }
};

export const BADGE_CONFIG: Record<StylistBadgeLevel, { title: string; subtitle: string; badgeColor: string }> = {
  PURPLE_COGS_CERTIFIED: {
    title: 'Purple Cogs Certified',
    subtitle: 'Vetted Master Stylist',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
  },
  MASTER_DRAPER: {
    title: 'Master Draper',
    subtitle: 'Advanced Silhouette Architect',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
  },
  TROUSSEAU_ARCHITECT: {
    title: 'Trousseau Architect',
    subtitle: 'Haute Bridal Specialist',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
  }
};

export const MODE_LABELS: Record<ConsultationMode, { label: string; icon: any }> = {
  IN_PERSON_ATELIER: { label: 'In-Person Atelier', icon: Building2 },
  VIRTUAL_HD: { label: 'Virtual HD Call', icon: Video },
  CLIENT_WARDROBE_VISIT: { label: 'Wardrobe Visit', icon: Home }
};

export const StylistCard: React.FC<StylistCardProps> = ({
  stylist,
  onBookConsultation,
  onViewProfile,
  discountPercent = 0
}) => {
  const { formatCurrency } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);

  const badge = BADGE_CONFIG[stylist.badge] || BADGE_CONFIG.PURPLE_COGS_CERTIFIED;
  const discountedRate = discountPercent > 0 
    ? Math.round(stylist.hourlyFeeInr * (1 - discountPercent / 100))
    : stylist.hourlyFeeInr;

  const initials = stylist.fullName
    ? stylist.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="relative rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/50 p-5 transition-all duration-300 shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between group">
      {/* Top Banner & Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Avatar & Verification Ring */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-400/40 bg-slate-800 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              {stylist.avatarUrl ? (
                <img 
                  src={stylist.avatarUrl} 
                  alt={stylist.fullName} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-950/60 text-purple-300 font-bold text-lg">
                  {initials}
                </div>
              )}
            </div>
            {/* Experience Pill */}
            <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-slate-950 border border-purple-500/40 text-[9px] font-bold text-purple-300 shadow">
              {stylist.experienceYears}y exp
            </div>
          </div>

          {/* Stylist Name, Badge & Location */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-100 truncate group-hover:text-purple-300 transition-colors">
                {stylist.fullName}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeColor}`}>
                <Zap className="w-2.5 h-2.5 fill-current" />
                {badge.title}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">
              {stylist.title}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
              <MapPin className="w-3 h-3 text-purple-400 flex-shrink-0" />
              <span className="truncate">
                {stylist.location.areaDistrict}, {stylist.location.city}
              </span>
            </div>
          </div>
        </div>

        {/* Rating & Consultations Stats Bar */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-200">{stylist.rating.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">({stylist.reviewsCount} reviews)</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{stylist.consultationsCompletedCount}+</span>
            <span className="text-[10px] text-slate-400">consultations</span>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {isExpanded ? stylist.profileBio : `${stylist.profileBio.slice(0, 110)}...`}
          {stylist.profileBio.length > 110 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="text-purple-400 hover:text-purple-300 ml-1.5 font-semibold text-[11px] inline-flex items-center gap-0.5"
            >
              {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </p>

        {/* Specialties Tags */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Specializations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stylist.specializations.map((spec) => {
              const info = SPECIALTY_LABELS[spec] || { label: spec, icon: Sparkles, color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
              const SpecIcon = info.icon;
              return (
                <span 
                  key={spec}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${info.color}`}
                >
                  <SpecIcon className="w-2.5 h-2.5" />
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Consultation Modes */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Available Modes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stylist.consultationModes.map((mode) => {
              const info = MODE_LABELS[mode] || { label: mode, icon: Video };
              const ModeIcon = info.icon;
              return (
                <span 
                  key={mode}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  <ModeIcon className="w-2.5 h-2.5 text-purple-400" />
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Weekly Schedule Days */}
        {stylist.availableWeeklySlots && stylist.availableWeeklySlots.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" /> Weekly Slots
              </span>
              <span className="text-slate-400 font-normal lowercase">60-90m sessions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {stylist.availableWeeklySlots.map((slot) => (
                <span 
                  key={slot.dayOfWeek}
                  className="px-2 py-0.5 rounded-md bg-purple-950/30 text-purple-300 border border-purple-500/20 text-[10px] font-semibold"
                >
                  {slot.dayOfWeek.slice(0, 3)}: {slot.timeSlots.length} slots
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Look Thumbnail Strip (if any) */}
        {stylist.portfolioLooks && stylist.portfolioLooks.length > 0 && (
          <div className="mb-4 pt-2 border-t border-slate-800/60">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Featured Portfolio
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {stylist.portfolioLooks.map((look) => (
                <div 
                  key={look.id} 
                  className="flex-shrink-0 w-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative group/look"
                  title={look.title}
                >
                  <img 
                    src={look.imageUrl} 
                    alt={look.title} 
                    className="w-full h-14 object-cover group-hover/look:scale-105 transition-transform" 
                  />
                  <div className="p-1 text-[9px] font-medium text-slate-300 truncate bg-slate-900/90">
                    {look.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Booking Footer */}
      <div className="pt-3 border-t border-slate-800/80 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Consultation Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              {discountPercent > 0 ? (
                <>
                  <span className="text-lg font-extrabold text-purple-300">
                    {formatCurrency(discountedRate)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(stylist.hourlyFeeInr)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-slate-100">
                  {formatCurrency(stylist.hourlyFeeInr)}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">/ hr</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <Clock className="w-2.5 h-2.5" /> Instant Slot
            </span>
            <span className="text-[10px] text-slate-400">Escrow Protected</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onBookConsultation(stylist)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-1px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
