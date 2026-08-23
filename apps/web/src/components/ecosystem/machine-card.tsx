'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  UserCheck, 
  Sparkles, 
  Star, 
  FileCode2, 
  ChevronDown, 
  ChevronUp, 
  Layers
} from 'lucide-react';
import { WorkshopMachineListing, MachineOperationalStatus } from '@/types/ecosystem';
import { useCurrency } from '@/components/currency-context';

interface MachineCardProps {
  machine: WorkshopMachineListing;
  onBook: (machine: WorkshopMachineListing) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  onBook
}) => {
  const { formatCurrency } = useCurrency();
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);

  const statusConfig: Record<MachineOperationalStatus, { label: string; color: string; icon: React.ReactNode }> = {
    AVAILABLE: { 
      label: 'Available Now', 
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', 
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 
    },
    IN_USE: { 
      label: 'Active Shift in Progress', 
      color: 'bg-blue-500/15 text-blue-300 border-blue-500/40', 
      icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> 
    },
    MAINTENANCE: { 
      label: 'Scheduled Calibration', 
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/40', 
      icon: <Wrench className="w-3.5 h-3.5 text-amber-400" /> 
    },
    OFFLINE: { 
      label: 'Offline', 
      color: 'bg-slate-500/15 text-slate-400 border-slate-600', 
      icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> 
    }
  };

  const categoryLabels: Record<string, string> = {
    DIGITAL_TEXTILE_PRINTER: 'Direct-to-Fabric Textile Printer',
    CNC_LASER_CUTTER: 'Automated CNC Fabric Laser Cutter',
    MULTI_HEAD_EMBROIDERY: 'Multi-Head Intelligent Embroidery',
    HEAVY_STITCHING_UNIT: 'Heavy-Duty Canvassing & Stitching',
    STEAM_FINISHER_FUSING: 'Specialized Form Finisher & Fusing Press'
  };

  const currentStatus = statusConfig[machine.currentStatus] || statusConfig.AVAILABLE;

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card hover:border-yellow-500/40 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-black/60">
      
      {/* Top Image Preview & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={machine.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'} 
          alt={machine.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/30 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-md shadow-md bg-slate-900/80">
          {currentStatus.icon}
          <span className="text-[11px]">{currentStatus.label}</span>
        </div>

        {/* Operator Badge */}
        {machine.operatorProvided && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[11px] font-semibold backdrop-blur-md shadow-md">
            <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
            <span>Technician Available</span>
          </div>
        )}

        {/* Category Pill overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-yellow-400 text-[11px] font-semibold backdrop-blur-md">
            {categoryLabels[machine.category] || machine.category.replace(/_/g, ' ')}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-amber-400 text-[11px] font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{machine.rating.toFixed(2)}</span>
            <span className="text-slate-400 font-normal">({machine.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-yellow-400 transition-colors line-clamp-1">
              {machine.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-slate-300">{machine.modelNumber}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300 truncate">
                <MapPin className="w-3 h-3 text-yellow-500/80 flex-shrink-0" />
                <span>{machine.facilityName} ({machine.facilityLocation?.city})</span>
              </span>
            </div>
          </div>

          {/* Quick Hardware Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]">
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                <Maximize2 className="w-3 h-3 text-yellow-500/80" /> Max Bed
              </span>
              <span className="font-semibold text-slate-200">
                {machine.specs?.bedWidthInches}" x {machine.specs?.bedLengthInches}"
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-1 border-x border-slate-800">
              <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                <Zap className="w-3 h-3 text-yellow-500/80" /> Power
              </span>
              <span className="font-semibold text-slate-200 truncate max-w-full">
                {machine.specs?.laserPowerWatts ? `${machine.specs.laserPowerWatts}W Laser` : machine.specs?.needleHeads ? `${machine.specs.needleHeads} Heads` : 'Direct Drive'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-yellow-500/80" /> Run Hours
              </span>
              <span className="font-semibold text-slate-200 font-mono">
                {machine.totalHoursRun || 1200}h
              </span>
            </div>
          </div>

          {/* Compatible Materials Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Materials:</span>
            {machine.specs?.compatibleMaterials?.slice(0, 3).map((mat) => (
              <span key={mat} className="px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700 text-slate-300 text-[10px]">
                {mat}
              </span>
            ))}
            {(machine.specs?.compatibleMaterials?.length || 0) > 3 && (
              <span className="text-slate-500 text-[10px]">
                +{machine.specs.compatibleMaterials.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Expandable Technical Specs Section */}
        {isSpecsExpanded && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold">Supported File Formats:</span>
              <div className="flex flex-wrap gap-1">
                {machine.specs?.supportedFileFormats?.map((fmt) => (
                  <span key={fmt} className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-mono text-[10px]">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold">Facility Address & Hub:</span>
              <p className="text-slate-300 text-[11px] leading-snug">
                {machine.facilityLocation?.address}, {machine.facilityLocation?.city}, {machine.facilityLocation?.state} - {machine.facilityLocation?.pincode}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Next Maintenance: <span className="text-slate-200 font-mono">{machine.nextMaintenanceDate}</span></span>
              <span>Deposit: <span className="text-yellow-400 font-mono">{formatCurrency(machine.pricing?.securityDepositInr || 5000)}</span></span>
            </div>
          </div>
        )}

        {/* Pricing & Action Buttons */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Hourly / Shift Rates
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-yellow-400 font-mono">
                  {formatCurrency(machine.pricing?.hourlyRateInr || 1800)}
                </span>
                <span className="text-[11px] text-slate-400">/hr</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({formatCurrency(machine.pricing?.dailyShiftRateInr || 12000)}/shift)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
              className="text-xs text-slate-400 hover:text-yellow-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800/60"
            >
              <span>{isSpecsExpanded ? 'Less Specs' : 'Full Specs'}</span>
              {isSpecsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onBook(machine)}
              disabled={machine.currentStatus === 'OFFLINE' || machine.currentStatus === 'MAINTENANCE'}
              className="btn-gold py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Capacity</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              <span>Hardware Specs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
