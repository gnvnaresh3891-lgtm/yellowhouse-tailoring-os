'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Crown, 
  Layers, 
  Download, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calendar,
  Percent
} from 'lucide-react';
import { TenantTrialOnboardingProfile } from '@/types/ecosystem';
import { evaluateTrialEntitlements } from '@/lib/ecosystem-algorithms';

interface TrialStatusBannerProps {
  trialProfile: TenantTrialOnboardingProfile;
  onUpgradeClick?: () => void;
  onExtendTrialClick?: () => void;
  onViewEntitlementsClick?: () => void;
  className?: string;
}

export const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({
  trialProfile,
  onUpgradeClick,
  onExtendTrialClick,
  onViewEntitlementsClick,
  className = ''
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const evaluation = evaluateTrialEntitlements(trialProfile);
  const isFreeTrial = trialProfile.tier === 'PURPLE_COGS_FREE_TRIAL';
  const totalTrialDays = 90;
  const daysPassed = Math.max(0, totalTrialDays - evaluation.daysRemaining);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((daysPassed / totalTrialDays) * 100)));

  // If already on Pro or Enterprise tier
  if (!isFreeTrial) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-yellow-500/30 p-4 sm:p-5 shadow-xl ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 p-0.5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  {trialProfile.tier === 'HAUTE_ENTERPRISE' ? 'Haute Enterprise Active' : 'Atelier Pro Tier Active'}
                </span>
                <span className="text-xs text-slate-400">Unlimited Studio Access</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                Full 300+ DPI vector exports, watermark-free blueprints, and priority machine booking enabled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onViewEntitlementsClick || onUpgradeClick}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-yellow-400" />
              <span>Tier Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Banner Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Trial Badge & Days Remaining */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 p-0.5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
                Purple Cogs 90-Day Free Trial
              </span>
              {evaluation.isExpired ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Trial Expired
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {evaluation.daysRemaining} Days Remaining
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-100 mt-1">
              {evaluation.isExpired
                ? 'Your 90-day trial has concluded. Upgrade to Atelier Pro to restore full CAD exports.'
                : `Active onboarding tier for ${trialProfile.tenantName}. 150 DPI preview exports active.`}
            </p>
          </div>
        </div>

        {/* Right: Progress Bar & Upgrade Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap sm:flex-nowrap">
          {/* Progress Indicator */}
          <div className="hidden sm:flex flex-col min-w-[140px] text-right">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Day {daysPassed} of {totalTrialDays}</span>
              <span className="font-bold text-purple-300">{percentElapsed}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentElapsed}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1"
            >
              <span>{detailsExpanded ? 'Hide Details' : 'Entitlements'}</span>
              {detailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {onExtendTrialClick && (
              <button
                onClick={onExtendTrialClick}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 transition-all flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Extend</span>
              </button>
            )}

            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all flex items-center gap-1.5 font-sans group"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Watermarked Export Warning Bar */}
      {evaluation.watermarkRequired && (
        <div className="relative z-10 mt-3 pt-3 border-t border-purple-500/20 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Trial Watermark Active:</strong> Blueprints and tech pack downloads are gated to <strong>150 DPI preview quality</strong> with watermark. Upgrade to Pro for <strong>300+ DPI vector DXF</strong> exports.
            </span>
          </div>
          <button
            onClick={onUpgradeClick}
            className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 underline underline-offset-2 flex-shrink-0"
          >
            Remove Watermark
          </button>
        </div>
      )}

      {/* Expanded Entitlements Matrix */}
      {detailsExpanded && (
        <div className="relative z-10 mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in text-xs">
          {/* Blueprint Quota */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium"><Layers className="w-3.5 h-3.5 text-purple-400" /> Blueprint Quota</span>
              <span className="font-bold text-slate-200">
                {trialProfile.usageCounters.blueprintsCreated} / {trialProfile.entitlements.maxBlueprintsPerMonth}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (trialProfile.usageCounters.blueprintsCreated / trialProfile.entitlements.maxBlueprintsPerMonth) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Monthly trial creations</span>
          </div>

          {/* Export Resolution */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium"><Download className="w-3.5 h-3.5 text-blue-400" /> Export Gate</span>
              <span className="font-bold text-amber-400">150 DPI</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Raster preview only &bull; Pro unlocks 300+ DPI DXF
            </p>
          </div>

          {/* Stylist Discount */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium"><Percent className="w-3.5 h-3.5 text-emerald-400" /> Stylist Perk</span>
              <span className="font-bold text-emerald-400">{trialProfile.entitlements.stylistBookingFeeDiscountPercent}% OFF</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Applied automatically to all stylist bookings
            </p>
          </div>

          {/* Tailor Bids Remaining */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Tailor RFQ Bids</span>
              <span className="font-bold text-slate-200">
                {trialProfile.usageCounters.bidsSubmitted} / {trialProfile.entitlements.maxTailorBidsPerMonth}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {evaluation.bidsRemaining} brief submissions remaining this month
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
