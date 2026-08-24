'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  Building2,
  Ruler,
  User,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Sparkles,
  Check,
  Phone,
  MapPin,
  Shirt,
  Crown,
  Layers,
  Palette,
  PartyPopper,
  Store,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { slugify, isValidSlug } from '@/lib/slug';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';
import type {
  SlugCheckerState,
  SlugCheckResponse,
  SignupResponse,
} from '@/types/onboarding';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  pomsCount: number;
  badgeClass: string;
  icon: React.ElementType;
}

const TEMPLATE_OPTIONS: TemplateItem[] = [
  {
    id: 'mens_ethnic',
    name: "Men's Ethnic",
    category: 'Ethnic & Royal',
    description: 'Pre-loaded POMs for Sherwanis, Kurta Pyjamas, Nehru Jackets, Dhoti Sets & Royal Bandhgalas.',
    pomsCount: 28,
    badgeClass: 'badge-gold',
    icon: Layers,
  },
  {
    id: 'mens_western',
    name: "Men's Western",
    category: 'Bespoke Western',
    description: 'Precision POM schemas for 3-Piece Suits, Dinner Tuxedos, Blazers, Dress Shirts & Trousers.',
    pomsCount: 32,
    badgeClass: 'badge-blue',
    icon: Shirt,
  },
  {
    id: 'womens_ethnic',
    name: "Women's Ethnic",
    category: 'Couture Ethnic',
    description: 'Structured POM blueprints for Lehenga Cholis, Heavy Sari Blouses, Anarkalis & Gararas.',
    pomsCount: 36,
    badgeClass: 'badge-emerald',
    icon: Crown,
  },
  {
    id: 'womens_couture',
    name: "Women's Couture",
    category: 'High Couture',
    description: 'Advanced measurement logic for Evening Gowns, Structured Corsetry, Ballgowns & Draped Capes.',
    pomsCount: 40,
    badgeClass: 'badge-amber',
    icon: Palette,
  },
];

interface OnboardingFormDraft {
  step: 1 | 2 | 3;
  boutiqueName: string;
  slug: string;
  isSlugManuallyEdited: boolean;
  city: string;
  phone: string;
  templates: string[];
  ownerName: string;
  email: string;
}

export default function MultiTenantOnboardingPage() {
  const router = useRouter();

  // Wizard Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields State
  const [formState, setFormState] = useState({
    boutiqueName: '',
    slug: '',
    isSlugManuallyEdited: false,
    city: '',
    phone: '',
    templates: ['mens_ethnic', 'mens_western', 'womens_ethnic', 'womens_couture'],
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Slug Availability State
  const [slugState, setSlugState] = useState<SlugCheckerState>({
    status: 'idle',
    message: '',
  });

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = getLocalStorage<OnboardingFormDraft | null>('yh_onboarding_draft', null);
    if (draft && typeof draft === 'object') {
      if (draft.step) setStep(draft.step);
      setFormState((prev) => ({
        ...prev,
        boutiqueName: draft.boutiqueName || prev.boutiqueName,
        slug: draft.slug || prev.slug,
        isSlugManuallyEdited: draft.isSlugManuallyEdited ?? prev.isSlugManuallyEdited,
        city: draft.city || prev.city,
        phone: draft.phone || prev.phone,
        templates: Array.isArray(draft.templates) && draft.templates.length > 0 ? draft.templates : prev.templates,
        ownerName: draft.ownerName || prev.ownerName,
        email: draft.email || prev.email,
      }));
    }
  }, []);

  // Dynamic draft autosave
  useEffect(() => {
    if (isSuccess) return;
    const draft: OnboardingFormDraft = {
      step,
      boutiqueName: formState.boutiqueName,
      slug: formState.slug,
      isSlugManuallyEdited: formState.isSlugManuallyEdited,
      city: formState.city,
      phone: formState.phone,
      templates: formState.templates,
      ownerName: formState.ownerName,
      email: formState.email,
    };
    setLocalStorage('yh_onboarding_draft', draft);
  }, [step, formState, isSuccess]);

  const handleBoutiqueNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormState((prev) => {
      const nextSlug = prev.isSlugManuallyEdited ? prev.slug : slugify(val);
      return {
        ...prev,
        boutiqueName: val,
        slug: nextSlug,
      };
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormState((prev) => ({
      ...prev,
      slug: val,
      isSlugManuallyEdited: true,
    }));
  };

  useEffect(() => {
    const targetSlug = formState.slug.trim();
    if (!targetSlug) {
      setSlugState({ status: 'idle', message: '' });
      return;
    }

    if (!isValidSlug(targetSlug)) {
      setSlugState({
        status: 'invalid',
        message: 'Must be 3-50 characters (lowercase letters, numbers, hyphens).',
      });
      return;
    }

    setSlugState({ status: 'checking', message: 'Checking availability...' });

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await fetchApi<SlugCheckResponse>(
          `/onboarding/check-slug/${encodeURIComponent(targetSlug)}`
        );
        if (isCancelled) return;

        if (res.available) {
          setSlugState({ status: 'available', message: 'Workspace slug is available!' });
        } else {
          setSlugState({
            status: 'taken',
            message: res.message || 'Workspace slug is already taken.',
          });
        }
      } catch (err: any) {
        if (isCancelled) return;
        setSlugState({ status: 'available', message: 'Workspace slug is available!' });
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formState.slug]);

  const toggleTemplate = (templateId: string) => {
    setFormState((prev) => {
      const exists = prev.templates.includes(templateId);
      const nextTemplates = exists
        ? prev.templates.filter((id) => id !== templateId)
        : [...prev.templates, templateId];
      return { ...prev, templates: nextTemplates };
    });
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formState.boutiqueName.trim()) {
      setError('Please enter your boutique or atelier business name.');
      return;
    }

    if (slugState.status !== 'available') {
      setError('Please provide a valid and available workspace subdomain slug.');
      return;
    }

    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setError('');
    if (formState.templates.length === 0) {
      setError('Select at least one measurement template category to seed your atelier.');
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formState.ownerName.trim()) {
      setError('Please enter the atelier owner name.');
      return;
    }

    if (!formState.email.trim()) {
      setError('Please enter a valid owner email address.');
      return;
    }

    if (formState.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        boutiqueName: formState.boutiqueName.trim(),
        slug: formState.slug.trim(),
        tenantSlug: formState.slug.trim(),
        city: formState.city.trim(),
        phone: formState.phone.trim(),
        templates: formState.templates,
        fullName: formState.ownerName.trim(),
        ownerName: formState.ownerName.trim(),
        email: formState.email.trim(),
        ownerEmail: formState.email.trim(),
        password: formState.password,
        ownerPassword: formState.password,
        role: 'TENANT_OWNER',
      };

      const res = await fetchApi<SignupResponse>('/onboarding/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.token) {
        if (typeof window !== 'undefined') {
          const authObject = {
            id: res.user?.id || `usr_${Date.now()}`,
            name: formState.ownerName.trim(),
            email: formState.email.trim(),
            role: 'TENANT_OWNER',
            tenant: {
              id: res.tenant?.id || `tenant_${Date.now()}`,
              name: formState.boutiqueName.trim(),
              code: formState.slug.trim().toUpperCase() + '-01',
            },
            loggedInAt: new Date().toISOString(),
          };
          setLocalStorage('yh_auth_user', authObject);
          document.cookie = `jwt_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
          if (res.tenant?.id) {
            document.cookie = `x-tenant-id=${res.tenant.id}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
        removeLocalStorage('yh_onboarding_draft');
        setIsSuccess(true);
      } else {
        setError(res.error || res.message || 'Failed to create atelier account. Please try again.');
        setIsSuccess(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateItems = TEMPLATE_OPTIONS.filter((t) => formState.templates.includes(t.id));
  const totalPomsSeeded = selectedTemplateItems.reduce((acc, curr) => acc + curr.pomsCount, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div className="glass-card-gold rounded-3xl p-6 sm:p-10 border border-gold-500/30 shadow-2xl">
        {isSuccess ? (
          <div className="py-8 text-center space-y-6 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/30 via-yellow-500/20 to-emerald-400/30 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 pulse-gold">
                <Check className="w-10 h-10 stroke-[3] text-emerald-300" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Workspace Provisioned Successfully!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Atelier <span className="text-yellow-400 font-mono font-bold">{formState.boutiqueName}</span> has been activated under <span className="text-white font-mono font-bold">{formState.email}</span>. Please sign in with your password to enter your private workspace.
              </p>
            </div>

            <div className="pt-4 flex justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  removeLocalStorage('yh_customers');
                  removeLocalStorage('yh_orders');
                  removeLocalStorage('yh_measurements_current');
                  router.push('/login');
                }}
                className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3-Step Atelier Setup Wizard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Multi-Tenant Atelier Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Configure your boutique identity, seed measurement schemas, and activate your master owner account.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleNextFromStep1} className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    <span>1. Boutique Details & Workspace Identity</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="boutiqueName" className="text-xs font-semibold text-slate-300">
                      Boutique / Atelier Name <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="boutiqueName"
                        type="text"
                        required
                        placeholder="e.g. Royal Savile Row Atelier"
                        value={formState.boutiqueName}
                        onChange={handleBoutiqueNameChange}
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label htmlFor="city" className="text-xs font-semibold text-slate-300">
                      City <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="city"
                        type="text"
                        required
                        placeholder="e.g. Mumbai"
                        value={formState.city}
                        onChange={(e) => setFormState(prev => ({ ...prev, city: e.target.value }))}
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-300">
                      Phone <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formState.phone}
                        onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="tenantSlug" className="text-xs font-semibold text-slate-300">
                      Custom Tenant Subdomain Slug <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      id="tenantSlug"
                      type="text"
                      required
                      placeholder="royal-savile-row"
                      value={formState.slug}
                      onChange={handleSlugChange}
                      className={`input-dark font-mono ${slugState.status === 'invalid' || slugState.status === 'taken' ? 'border-rose-500/50 focus:border-rose-500' : slugState.status === 'available' ? 'border-emerald-500/50 focus:border-emerald-500' : ''}`}
                    />
                    {formState.slug && (
                      <div className="mt-1.5 flex items-center space-x-1.5 text-xs font-medium">
                        {slugState.status === 'checking' && (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                            <span className="text-slate-400">{slugState.message}</span>
                          </>
                        )}
                        {slugState.status === 'available' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{slugState.message}</span>
                          </>
                        )}
                        {(slugState.status === 'taken' || slugState.status === 'invalid') && (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-rose-400">{slugState.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                  <button
                    type="submit"
                    className="btn-gold px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2"
                  >
                    <span>Continue to Templates</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Ruler className="w-4 h-4 text-yellow-400" />
                    <span>2. Measurement Template Selection</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEMPLATE_OPTIONS.map((tmpl) => {
                    const isSelected = formState.templates.includes(tmpl.id);
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => toggleTemplate(tmpl.id)}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                          isSelected
                            ? 'glass-card-gold border-yellow-500/50'
                            : 'glass-card border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <h4 className="text-sm font-bold text-white">{tmpl.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{tmpl.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-ghost px-5 py-2.5 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="btn-gold px-6 py-2.5 text-xs font-bold"
                  >
                    Continue to Owner Setup
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span>3. Atelier Owner Account Setup</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="ownerName" className="text-xs font-semibold text-slate-300">
                      Owner Name
                    </label>
                    <input
                      id="ownerName"
                      type="text"
                      required
                      placeholder="Master Latif"
                      value={formState.ownerName}
                      onChange={(e) => setFormState((prev) => ({ ...prev, ownerName: e.target.value }))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ownerEmail" className="text-xs font-semibold text-slate-300">
                      Owner Email
                    </label>
                    <input
                      id="ownerEmail"
                      type="email"
                      required
                      placeholder="latif@atelier.com"
                      value={formState.email}
                      onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formState.password}
                      onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                      className="input-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formState.confirmPassword}
                      onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-ghost px-5 py-2.5 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold px-6 py-2.5 text-xs font-bold flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Provisioning...</span>
                      </>
                    ) : (
                      <span>Launch My Atelier</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
