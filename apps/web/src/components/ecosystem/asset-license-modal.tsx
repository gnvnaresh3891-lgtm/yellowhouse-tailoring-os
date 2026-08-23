'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Crown, 
  Check, 
  Lock, 
  Download, 
  Printer, 
  FileCheck, 
  Key, 
  Building, 
  User, 
  Mail, 
  Coins, 
  Scissors, 
  ExternalLink,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { 
  FashionBlueprintAsset, 
  LicenseTierType, 
  AssetLicenseCertificate, 
  CreatorEarningsLedger,
  CreatorTransactionRecord
} from '@/types/ecosystem';
import { 
  calculateLicensePricing, 
  calculateCreatorEarningsSplit, 
  generateHMACLicenseSignature, 
  generateFormattedLicenseKey 
} from '@/lib/ecosystem-algorithms';
import { SEED_CREATOR_EARNINGS } from '@/lib/ecosystem-seeds';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { useCurrency } from '@/components/currency-context';

interface AssetLicenseModalProps {
  asset: FashionBlueprintAsset | null;
  initialTier?: LicenseTierType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (certificate: AssetLicenseCertificate) => void;
}

export const AssetLicenseModal: React.FC<AssetLicenseModalProps> = ({
  asset,
  initialTier = 'PERSONAL_BESPOKE',
  isOpen,
  onClose,
  onSuccess
}) => {
  const { formatCurrency } = useCurrency();

  const [selectedTier, setSelectedTier] = useState<LicenseTierType>(initialTier);
  const [buyerName, setBuyerName] = useState('Vikramaditya Singhania');
  const [buyerOrg, setBuyerOrg] = useState('Singhania Bespoke Atelier');
  const [buyerEmail, setBuyerEmail] = useState('vikram@singhaniacouture.in');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedCertificate, setIssuedCertificate] = useState<AssetLicenseCertificate | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !asset) return null;

  const basePrice = asset.pricingTiers?.personalBespoke?.priceInr || 4500;
  const pricingConfig = calculateLicensePricing(basePrice, selectedTier);
  const splitInfo = calculateCreatorEarningsSplit(pricingConfig.priceInr, 0.88);

  const handleCheckout = () => {
    if (!buyerName || !buyerOrg || !agreeTerms) return;
    setIsProcessing(true);

    try {
      const timestamp = Date.now();
      const buyerId = `buyer_${buyerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const sha256Signature = generateHMACLicenseSignature(asset.id, buyerId, selectedTier, timestamp);
      const licenseKey = generateFormattedLicenseKey(asset.id, buyerId, timestamp);

      const newCertificate: AssetLicenseCertificate = {
        id: `lic_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        licenseKey,
        assetId: asset.id,
        assetTitle: asset.title,
        buyerId,
        buyerName,
        buyerOrganization: buyerOrg,
        tier: selectedTier,
        pricePaid: pricingConfig.priceInr,
        currency: 'INR',
        issuedAt: new Date(timestamp).toISOString(),
        sha256Signature,
        allowedRuns: pricingConfig.allowedRuns,
        recordedRuns: 0,
        status: 'ACTIVE',
        downloadUrl: `/downloads/${asset.slug}_full_blueprint_bundle.zip`
      };

      // 1. Persist to yh_asset_licenses
      const existingLicenses = getLocalStorage<AssetLicenseCertificate[]>('yh_asset_licenses', []);
      const updatedLicenses = [newCertificate, ...existingLicenses];
      setLocalStorage('yh_asset_licenses', updatedLicenses);

      // 2. Persist to yh_creator_earnings
      const currentLedger = getLocalStorage<CreatorEarningsLedger>('yh_creator_earnings', SEED_CREATOR_EARNINGS);
      const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"

      const newTx: CreatorTransactionRecord = {
        id: `tx_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
        assetTitle: asset.title,
        buyerName: buyerOrg || buyerName,
        amountInr: pricingConfig.priceInr,
        netInr: splitInfo.creatorNetEarnings,
        date: new Date().toISOString(),
        licenseType: selectedTier
      };

      const updatedMonthly = [...(currentLedger.monthlyBreakdown || [])];
      const monthIdx = updatedMonthly.findIndex(m => m.month === currentMonth);
      if (monthIdx >= 0) {
        updatedMonthly[monthIdx] = {
          ...updatedMonthly[monthIdx],
          sales: updatedMonthly[monthIdx].sales + 1,
          grossInr: updatedMonthly[monthIdx].grossInr + pricingConfig.priceInr,
          netInr: updatedMonthly[monthIdx].netInr + splitInfo.creatorNetEarnings
        };
      } else {
        updatedMonthly.unshift({
          month: currentMonth,
          sales: 1,
          grossInr: pricingConfig.priceInr,
          netInr: splitInfo.creatorNetEarnings
        });
      }

      const updatedLedger: CreatorEarningsLedger = {
        ...currentLedger,
        creatorId: asset.creatorId,
        totalSalesCount: (currentLedger.totalSalesCount || 0) + 1,
        lifetimeGrossInr: (currentLedger.lifetimeGrossInr || 0) + pricingConfig.priceInr,
        platformFeeInr: (currentLedger.platformFeeInr || 0) + splitInfo.platformFee,
        lifetimeNetPayoutInr: (currentLedger.lifetimeNetPayoutInr || 0) + splitInfo.creatorNetEarnings,
        availableForPayoutInr: (currentLedger.availableForPayoutInr || 0) + splitInfo.creatorNetEarnings,
        monthlyBreakdown: updatedMonthly,
        recentTransactions: [newTx, ...(currentLedger.recentTransactions || [])].slice(0, 20)
      };

      setLocalStorage('yh_creator_earnings', updatedLedger);

      // 3. Dispatch Reactive Window Event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yh-data-sync', {
          detail: {
            key: 'yh_asset_licenses',
            certificate: newCertificate,
            ledger: updatedLedger
          }
        }));
      }

      setIssuedCertificate(newCertificate);
      if (onSuccess) {
        onSuccess(newCertificate);
      }
    } catch (err) {
      console.error('Error processing asset license checkout:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySignature = () => {
    if (issuedCertificate?.sha256Signature) {
      navigator.clipboard.writeText(issuedCertificate.sha256Signature);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const tiers: Array<{
    id: LicenseTierType;
    name: string;
    description: string;
    runs: string;
    icon: React.ReactNode;
    commercial: boolean;
    ipTransfer: boolean;
    recommended?: boolean;
  }> = [
    {
      id: 'PERSONAL_BESPOKE',
      name: 'Personal Bespoke',
      description: 'Single atelier bespoke client workflow with full 3D CAD pattern pieces and grading.',
      runs: '3 Custom Executions',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      commercial: false,
      ipTransfer: false
    },
    {
      id: 'COMMERCIAL_PRODUCTION',
      name: 'Commercial Production',
      description: 'Ready-to-wear production batch rights, nested marker files, and mass manufacturing allowance.',
      runs: '250 Production Units',
      icon: <Award className="w-5 h-5 text-amber-400" />,
      commercial: true,
      ipTransfer: false,
      recommended: true
    },
    {
      id: 'EXCLUSIVE_BUYOUT',
      name: 'Exclusive IP Buyout',
      description: 'Permanent acquisition of all intellectual property, source 3D assets, and delisting from market.',
      runs: 'Unlimited / Full IP Transfer',
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      commercial: true,
      ipTransfer: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card-gold rounded-2xl border border-yellow-500/40 shadow-2xl shadow-black/80 bg-[#0F172A]/95 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {issuedCertificate ? 'Official License Certificate Issued' : 'Acquire Fashion Blueprint License'}
              </h2>
              <p className="text-xs text-slate-400">
                {asset.title} • By <span className="text-yellow-400 font-medium">{asset.creatorName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {issuedCertificate ? (
            /* SUCCESS / CERTIFICATE VIEW */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Certificate Ribbon Header */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-b from-yellow-950/30 via-slate-900 to-slate-900/90 border border-yellow-500/40 text-center space-y-4 shadow-xl">
                <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/15 border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <FileCheck className="w-8 h-8 text-yellow-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-yellow-400 font-bold">
                    YellowHouse Tailoring OS • Authenticated License
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
                    {issuedCertificate.licenseKey}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Issued on {new Date(issuedCertificate.issuedAt).toLocaleDateString('en-US', { dateStyle: 'full' })}
                  </p>
                </div>

                {/* Certificate Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800 text-left text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Licensee</span>
                    <span className="font-semibold text-slate-200">{issuedCertificate.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Organization</span>
                    <span className="font-semibold text-slate-200">{issuedCertificate.buyerOrganization}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">License Tier</span>
                    <span className="font-semibold text-yellow-300">{issuedCertificate.tier.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Production Quota</span>
                    <span className="font-semibold text-emerald-400">{issuedCertificate.allowedRuns} Runs</span>
                  </div>
                </div>

                {/* Cryptographic Proof Hash */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block flex items-center gap-1">
                      <Key className="w-3 h-3 text-yellow-400" /> HMAC-SHA256 Cryptographic Signature:
                    </span>
                    <p className="text-[11px] font-mono text-yellow-300/90 truncate">
                      {issuedCertificate.sha256Signature}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySignature}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700 flex-shrink-0"
                    title="Copy Signature Hash"
                  >
                    {copiedHash ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={issuedCertificate.downloadUrl}
                  download
                  className="btn-gold py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CAD Bundle (.ZIP)</span>
                </a>

                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-yellow-400" />
                  <span>Print Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Done & View Warehouse</span>
                </button>
              </div>
            </div>
          ) : (
            /* LICENSE SELECTION & CHECKOUT FORM */
            <div className="space-y-6">
              {/* Tier Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select License Tier & Usage Rights
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiers.map((t) => {
                    const price = calculateLicensePricing(basePrice, t.id).priceInr;
                    const isSelected = selectedTier === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-yellow-500/10 border-yellow-400 ring-1 ring-yellow-400/50 shadow-lg shadow-yellow-950/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                        }`}
                      >
                        {t.recommended && (
                          <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                            Popular
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                              {t.icon}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-slate-100">{t.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-snug">{t.description}</p>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Quota: {t.runs}</span>
                          <span className="text-base font-bold text-yellow-400 font-mono">
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Creator Royalty & Fee Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Transparent 88/12 Creator Revenue Split
                  </span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {formatCurrency(pricingConfig.priceInr)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Total Gross Outlay</span>
                    <span className="font-mono font-bold text-slate-200">{formatCurrency(splitInfo.grossAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Platform Fee (12%)</span>
                    <span className="font-mono text-slate-400">{formatCurrency(splitInfo.platformFee)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Net to Creator (88%)</span>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(splitInfo.creatorNetEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Buyer & Atelier Details Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Licensee & Atelier Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-yellow-400" /> Master Tailor / Buyer Full Name
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Vikramaditya Singhania"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-yellow-400" /> Atelier / Brand Organization
                    </label>
                    <input
                      type="text"
                      value={buyerOrg}
                      onChange={(e) => setBuyerOrg(e.target.value)}
                      placeholder="e.g. Singhania Bespoke Atelier"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-yellow-400" /> Delivery Email (CAD ZIP delivery)
                    </label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="e.g. atelier@domain.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-yellow-500 focus:ring-yellow-400 bg-slate-950"
                />
                <span>
                  I understand that this license grants usage according to the selected tier specifications. A cryptographically verifiable HMAC-SHA256 signature certificate will be generated and logged to the atelier ledger.
                </span>
              </label>

              {/* Checkout Action Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!buyerName || !buyerOrg || !agreeTerms || isProcessing}
                  className="btn-gold py-2.5 px-6 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing ? 'Issuing Certificate...' : `Authorize & License (${formatCurrency(pricingConfig.priceInr)})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
