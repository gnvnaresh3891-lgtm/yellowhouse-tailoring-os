'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Send, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Scissors,
  Upload,
  Plus
} from 'lucide-react';
import { 
  ProductionDesignBrief, 
  GarmentCategory, 
  ArtisanSpecialty 
} from '@/types/ecosystem';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { dispatchSyncEvent } from '@/lib/state-sync-utils';
import { useToast } from '@/components/toast-context';
import { useCurrency } from '@/components/currency-context';

export interface BriefSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (brief: ProductionDesignBrief) => void;
}

const GARMENT_OPTIONS: { id: GarmentCategory; label: string }[] = [
  { id: 'mens-suit', label: "Men's Bespoke 3-Piece Suit / Tuxedo" },
  { id: 'mens-sherwani', label: "Men's Imperial Jodhpuri Sherwani" },
  { id: 'mens-shirt', label: "Men's Bespoke Dress Shirt" },
  { id: 'mens-trouser', label: "Men's Tailored Pleated Trousers" },
  { id: 'womens-lehenga', label: "Women's 24-Kali Flared Bridal Lehenga" },
  { id: 'womens-anarkali', label: "Women's Kalidar Floor-Length Anarkali" },
  { id: 'womens-gown', label: "Women's Couture Evening Gown" },
  { id: 'womens-corset', label: "Women's Victorian Boned Corset" },
  { id: 'womens-blouse', label: "Women's Structured Sari Blouse" },
];

const SPECIALTY_OPTIONS: { id: ArtisanSpecialty; label: string }[] = [
  { id: 'ZARDOZI_EMBROIDERY', label: 'Zardozi Micro-Embroidery' },
  { id: 'MASTER_CANVAS_CUTTING', label: 'Master Canvas Pattern Cutting' },
  { id: 'LEHENGA_FLARED_CONSTRUCTION', label: '24-Kali Flared Construction' },
  { id: 'TUXEDO_BESPOKE', label: 'Savile Row Bespoke Tuxedos' },
  { id: 'CORSETRY_BONING', label: 'Spiral Steel Corsetry Boning' },
  { id: 'AARI_THREADWORK', label: 'Traditional Aari Threadwork' },
  { id: 'SHERWANI_STRUCTURE', label: 'Imperial Sherwani Canvas Structure' },
  { id: 'HAND_ROLLED_BUTTONHOLES', label: 'Hand-Rolled Milanese Buttonholes' },
];

export function BriefSubmissionModal({
  isOpen,
  onClose,
  onCreated,
}: BriefSubmissionModalProps) {
  const toast = useToast();
  const { formatCurrency } = useCurrency();

  // Form State
  const [title, setTitle] = useState('');
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>('mens-sherwani');
  const [batchQuantity, setBatchQuantity] = useState<number>(12);
  const [targetBudgetPerUnitInr, setTargetBudgetPerUnitInr] = useState<number>(38000);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-10-15');
  const [deadlineForBids, setDeadlineForBids] = useState('2026-09-05');
  const [fabricSuppliedByAtelier, setFabricSuppliedByAtelier] = useState(true);
  const [techPackUrl, setTechPackUrl] = useState('/techpacks/sample_brief_techpack.pdf');
  const [selectedSpecialties, setSelectedSpecialties] = useState<ArtisanSpecialty[]>([
    'ZARDOZI_EMBROIDERY',
    'SHERWANI_STRUCTURE'
  ]);

  // Specifications
  const [hasFullCanvas, setHasFullCanvas] = useState(true);
  const [embroideryLevel, setEmbroideryLevel] = useState<'none' | 'light' | 'medium' | 'heavy'>('heavy');
  const [trialFittingCount, setTrialFittingCount] = useState<number>(2);
  const [liningDetails, setLiningDetails] = useState('Bemberg Cupro Antique Gold #D4AF37');
  const [interfacingDetails, setInterfacingDetails] = useState('Double floating horsehair canvas chest piece + French collar stay');
  const [specialInstructions, setSpecialInstructions] = useState('Strict CAD grainline alignment. Skeleton baste trial inspection required for size 40R before full batch closure.');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalBudgetCeiling = batchQuantity * targetBudgetPerUnitInr;

  const toggleSpecialty = (spec: ArtisanSpecialty) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide a descriptive title for your production brief');
      return;
    }

    if (batchQuantity < 1) {
      toast.error('Batch quantity must be at least 1 unit');
      return;
    }

    if (targetBudgetPerUnitInr <= 0) {
      toast.error('Target budget per unit must be greater than ₹0');
      return;
    }

    setSubmitting(true);

    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const briefId = `brf_${Date.now()}_${randomSuffix}`;
      const briefNumber = `BRF-2026-${randomSuffix}`;

      const newBrief: ProductionDesignBrief = {
        id: briefId,
        briefNumber,
        atelierTenantId: 'tenant_flagship_01',
        atelierName: 'YellowHouse Flagship Atelier',
        title: title.trim(),
        garmentCategory,
        batchQuantity,
        targetBudgetPerUnitInr,
        totalBudgetCeilingInr: totalBudgetCeiling,
        targetDeliveryDate: new Date(targetDeliveryDate).toISOString(),
        deadlineForBids: new Date(deadlineForBids).toISOString(),
        fabricSuppliedByAtelier,
        techPackUrl,
        requiredSpecialties: selectedSpecialties,
        specifications: {
          hasFullCanvas,
          embroideryLevel,
          trialFittingCount,
          liningDetails,
          interfacingDetails
        },
        status: 'OPEN_FOR_BIDS',
        bidsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Persist to storage
      const existingBriefs = getLocalStorage<ProductionDesignBrief[]>('yh_production_briefs', []);
      const updated = [newBrief, ...existingBriefs];
      setLocalStorage('yh_production_briefs', updated);

      // Dispatch cross-tab sync
      dispatchSyncEvent({ source: 'brief-submission', entityId: briefId });

      toast.success(
        `Production Brief ${briefNumber} successfully published to verified artisan network!`,
        'Brief Published'
      );

      if (onCreated) {
        onCreated(newBrief);
      }

      onClose();
    } catch (err) {
      console.error('Error creating production brief:', err);
      toast.error('Failed to submit design brief. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-card rounded-2xl p-6 border border-yellow-500/30 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Publish Production Design Brief (RFQ)
                <span className="badge badge-gold uppercase text-[9px]">Artisan Network</span>
              </h2>
              <p className="text-xs text-slate-400">
                Broadcast custom bespoke tailoring requirements to master tailors and certified karigar guilds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Brief Title & Garment Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Brief Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 12x Imperial Gold Zardozi Sherwanis for Royal Winter Collection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-dark text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Garment Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={garmentCategory}
                onChange={(e) => setGarmentCategory(e.target.value as GarmentCategory)}
                className="input-dark text-xs cursor-pointer"
              >
                {GARMENT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Quantity & Budget Ceiling Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Batch Quantity (Units) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-dark font-mono font-bold text-yellow-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Target Budget Per Unit (INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                required
                value={targetBudgetPerUnitInr}
                onChange={(e) => setTargetBudgetPerUnitInr(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-dark font-mono font-bold text-yellow-400"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <span className="text-xs text-slate-400">Total Budget Envelope:</span>
              <span className="text-base font-bold text-yellow-400 font-mono">
                {formatCurrency(totalBudgetCeiling)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {batchQuantity} units @ {formatCurrency(targetBudgetPerUnitInr)}/ea
              </span>
            </div>
          </div>

          {/* 3. Delivery Schedule & Bidding Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                Target Completion & Delivery Date
              </label>
              <input
                type="date"
                required
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="input-dark text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Bid Submission Deadline
              </label>
              <input
                type="date"
                required
                value={deadlineForBids}
                onChange={(e) => setDeadlineForBids(e.target.value)}
                className="input-dark text-xs font-mono"
              />
            </div>
          </div>

          {/* 4. Required Artisan Specialties (Multi-Select) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Required Artisan Specializations & Techniques</span>
              <span className="text-[10px] text-slate-400">Select all that apply</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SPECIALTY_OPTIONS.map((spec) => {
                const active = selectedSpecialties.includes(spec.id);
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => toggleSpecialty(spec.id)}
                    className={`p-2 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-2 ${
                      active
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      active ? 'bg-yellow-500 text-slate-950 font-bold' : 'border border-slate-700'
                    }`}>
                      {active && '✓'}
                    </div>
                    <span className="text-[11px] leading-tight">{spec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Garment Construction Specifications */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              Technical Construction Specifications
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Embroidery Intensity</label>
                <select
                  value={embroideryLevel}
                  onChange={(e) => setEmbroideryLevel(e.target.value as any)}
                  className="input-dark text-xs cursor-pointer"
                >
                  <option value="none">None / Clean Tailored</option>
                  <option value="light">Light Border & Cuff Accent (₹3,500 eq)</option>
                  <option value="medium">Medium Motif & Chest Panels (₹12,000 eq)</option>
                  <option value="heavy">Heavy All-Over Imperial Zardozi (₹28,000 eq)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Milestone Fitting Trials</label>
                <select
                  value={trialFittingCount}
                  onChange={(e) => setTrialFittingCount(parseInt(e.target.value))}
                  className="input-dark text-xs cursor-pointer"
                >
                  <option value={1}>1 Skeleton Trial</option>
                  <option value={2}>2 Trials (Skeleton + Forward Baste)</option>
                  <option value={3}>3 Trials (Skeleton + Intermediate + Final)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={hasFullCanvas}
                    onChange={(e) => setHasFullCanvas(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500/30"
                  />
                  Floating Full Canvas Chest
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Lining Specifications</label>
                <input
                  type="text"
                  value={liningDetails}
                  onChange={(e) => setLiningDetails(e.target.value)}
                  placeholder="e.g. Bemberg Cupro Antique Gold #D4AF37"
                  className="input-dark text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Interfacing & Canvas Details</label>
                <input
                  type="text"
                  value={interfacingDetails}
                  onChange={(e) => setInterfacingDetails(e.target.value)}
                  placeholder="e.g. Double horsehair canvas + French stays"
                  className="input-dark text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-slate-300">Special Instructions / Technical Notes</label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Include CAD tolerance limits, sleevehead baste requirements, or milestone proof photo standards..."
                className="input-dark text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-yellow-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing Brief...' : 'Publish Brief to Karigars'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
