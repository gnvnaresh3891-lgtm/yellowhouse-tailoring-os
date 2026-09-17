'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Store,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { slugify, isValidSlug } from '@/lib/slug';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  badgeVariant: 'gold' | 'info' | 'success' | 'warning';
  icon: React.ElementType;
}

const TEMPLATE_OPTIONS: TemplateItem[] = [
  {
    id: 'mens_ethnic',
    name: "Men's Ethnic",
    category: 'Ethnic & Royal',
    description:
      'Pre-loaded POMs for Sherwanis, Kurta Pyjamas, Nehru Jackets, Dhoti Sets & Royal Bandhgalas.',
    pomsCount: 28,
    badgeVariant: 'gold',
    icon: Layers,
  },
  {
    id: 'mens_western',
    name: "Men's Western",
    category: 'Bespoke Western',
    description:
      'Precision POM schemas for 3-Piece Suits, Dinner Tuxedos, Blazers, Dress Shirts & Trousers.',
    pomsCount: 32,
    badgeVariant: 'info',
    icon: Shirt,
  },
  {
    id: 'womens_ethnic',
    name: "Women's Ethnic",
    category: 'Couture Ethnic',
    description:
      'Structured POM blueprints for Lehenga Cholis, Heavy Sari Blouses, Anarkalis & Gararas.',
    pomsCount: 36,
    badgeVariant: 'success',
    icon: Crown,
  },
  {
    id: 'womens_couture',
    name: "Women's Couture",
    category: 'High Couture',
    description:
      'Advanced measurement logic for Evening Gowns, Structured Corsetry, Ballgowns & Draped Capes.',
    pomsCount: 40,
    badgeVariant: 'warning',
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

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        templates:
          Array.isArray(draft.templates) && draft.templates.length > 0
            ? draft.templates
            : prev.templates,
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

  return (
    <div className="min-h-screen bg-canvas text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden font-sans selection:bg-yellow-500/25 selection:text-yellow-200">
      {/* Decorative Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#D4AF37]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 animate-fade-in flex flex-col items-center relative z-10">
        <Link href="/" className="group inline-flex flex-col items-center focus:outline-none">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-[#C59B27] p-0.5 shadow-ios-gold group-hover:scale-105 transition-transform duration-300 mb-2.5">
            <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
              <Scissors className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-yellow-300 transition-colors">
              YellowHouse
            </h1>
            <Badge variant="gold" size="sm">OS</Badge>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <Card variant="glass" padding="lg" className="rounded-3xl border-white/10 shadow-ios-xl">
          {isSuccess ? (
            /* SUCCESS PROVISIONING SCREEN WITH DEMO DATA EVICTION */
            <div className="py-8 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-ios-lg">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Workspace Provisioned Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Atelier <span className="text-yellow-400 font-mono font-bold">{formState.boutiqueName}</span> has been activated under{' '}
                  <span className="text-white font-mono font-bold">{formState.email}</span>. Please sign in with your credentials to enter your private isolated workspace.
                </p>
              </div>

              <div className="pt-4 flex justify-center max-w-sm mx-auto">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    // CRITICAL INTEGRITY INVARIANT: Clean up all demo data upon sign-in
                    removeLocalStorage('yh_auth_user');
                    removeLocalStorage('yh_customers');
                    removeLocalStorage('yh_orders');
                    removeLocalStorage('yh_measurements_current');
                    removeLocalStorage('yh_onboarding_draft');
                    router.push('/login');
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full shadow-ios-gold"
                >
                  Sign In to Workspace
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* WIZARD HEADER & PROGRESS INDICATOR */}
              <div className="text-center mb-8 space-y-3">
                <div className="inline-flex items-center space-x-2 badge-gold px-3.5 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>3-Step Atelier Setup Wizard</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Multi-Tenant Atelier Onboarding
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Configure your boutique identity, seed measurement schemas, and activate your master owner account.
                </p>

                {/* APPLE-GRADE CONTINUOUS 3-STEP PROGRESS PILL */}
                <div className="pt-3 max-w-md mx-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { num: 1, label: 'Atelier Identity' },
                      { num: 2, label: 'CAD Blueprints' },
                      { num: 3, label: 'Owner Launch' },
                    ].map((s) => (
                      <div key={s.num} className="flex flex-col items-center space-y-1.5">
                        <div
                          className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                            step >= s.num
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-ios-gold'
                              : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-semibold tracking-tight transition-colors ${
                            step >= s.num ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {s.num}. {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2.5 animate-fade-in shadow-ios-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: IDENTITY & SLUG VERIFICATION */}
              {step === 1 && (
                <form onSubmit={handleNextFromStep1} className="space-y-6 animate-fade-in">
                  <div className="space-y-1 border-b border-white/5 pb-3">
                    <h3 className="font-display text-base font-bold text-white flex items-center space-x-2 tracking-tight">
                      <Building2 className="w-4 h-4 text-yellow-400" />
                      <span>1. Boutique Details & Workspace Identity</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        id="boutiqueName"
                        label="Boutique / Atelier Name *"
                        type="text"
                        required
                        placeholder="e.g. Royal Savile Row Atelier"
                        value={formState.boutiqueName}
                        onChange={handleBoutiqueNameChange}
                        leftIcon={<Store className="w-4 h-4" />}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <Input
                        id="city"
                        label="City *"
                        type="text"
                        required
                        placeholder="e.g. Mumbai / London"
                        value={formState.city}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, city: e.target.value }))
                        }
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <Input
                        id="phone"
                        label="Phone *"
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formState.phone}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        leftIcon={<Phone className="w-4 h-4" />}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label
                        htmlFor="tenantSlug"
                        className="block text-xs font-semibold text-slate-300 tracking-tight"
                      >
                        Custom Tenant Subdomain Slug *
                      </label>
                      <input
                        id="tenantSlug"
                        type="text"
                        required
                        placeholder="royal-savile-row"
                        value={formState.slug}
                        onChange={handleSlugChange}
                        className={`w-full bg-slate-900/70 border rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 backdrop-blur-xl font-mono transition-all outline-none ${
                          slugState.status === 'invalid' || slugState.status === 'taken'
                            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : slugState.status === 'available'
                            ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-white/10 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                        }`}
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
                              <span className="text-emerald-400 font-medium">{slugState.message}</span>
                            </>
                          )}
                          {(slugState.status === 'taken' || slugState.status === 'invalid') && (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span className="text-rose-400 font-medium">{slugState.message}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <Button
                      type="submit"
                      variant="gold"
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Blueprints
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: BLUEPRINT PRESET SELECTION */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1 border-b border-white/5 pb-3">
                    <h3 className="font-display text-base font-bold text-white flex items-center space-x-2 tracking-tight">
                      <Ruler className="w-4 h-4 text-yellow-400" />
                      <span>2. Measurement Template Selection</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TEMPLATE_OPTIONS.map((tmpl) => {
                      const isSelected = formState.templates.includes(tmpl.id);
                      const IconComponent = tmpl.icon;
                      return (
                        <Card
                          key={tmpl.id}
                          variant={isSelected ? 'gold' : 'glass'}
                          padding="md"
                          hoverable
                          onClick={() => toggleTemplate(tmpl.id)}
                          className={`rounded-2.5xl cursor-pointer border transition-all ${
                            isSelected
                              ? 'border-[#D4AF37]/50 shadow-ios-gold'
                              : 'border-white/10 hover:border-white/20 shadow-ios-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-850 flex items-center justify-center text-yellow-400 border border-white/10">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <h4 className="font-display text-sm font-bold text-white tracking-tight">{tmpl.name}</h4>
                            </div>
                            <Badge variant={tmpl.badgeVariant} size="sm">
                              {tmpl.pomsCount} POMs
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.description}</p>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="gold"
                      size="md"
                      onClick={handleNextFromStep2}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Owner Setup
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: ATELIER OWNER SETUP & LAUNCH */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in">
                  <div className="space-y-1 border-b border-white/5 pb-3">
                    <h3 className="font-display text-base font-bold text-white flex items-center space-x-2 tracking-tight">
                      <User className="w-4 h-4 text-yellow-400" />
                      <span>3. Atelier Owner Account Setup</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="ownerName"
                      label="Owner Full Name *"
                      type="text"
                      required
                      placeholder="Master Latif"
                      value={formState.ownerName}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, ownerName: e.target.value }))
                      }
                      leftIcon={<User className="w-4 h-4" />}
                    />

                    <Input
                      id="ownerEmail"
                      label="Owner Email *"
                      type="email"
                      required
                      placeholder="latif@atelier.com"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, email: e.target.value }))
                      }
                      leftIcon={<Mail className="w-4 h-4" />}
                    />

                    <Input
                      id="password"
                      label="Password (min. 6 chars) *"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={formState.password}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, password: e.target.value }))
                      }
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-200 transition-colors pointer-events-auto"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <Input
                      id="confirmPassword"
                      label="Confirm Password *"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={formState.confirmPassword}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 hover:text-slate-200 transition-colors pointer-events-auto"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="gold"
                      size="md"
                      isLoading={isSubmitting}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="shadow-ios-gold"
                    >
                      {isSubmitting ? 'Provisioning...' : 'Launch My Atelier'}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
