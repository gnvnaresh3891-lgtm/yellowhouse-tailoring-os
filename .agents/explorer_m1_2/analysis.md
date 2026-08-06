# Milestone 1 Frontend Technical Implementation Analysis & Design
**Agent**: `explorer_m1_2` (Frontend Technical Analyst & Designer)  
**Date**: 2026-08-06  
**Workspace**: `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`  
**Target Page**: `apps/web/src/app/onboarding/page.tsx`  

---

## 1. Executive Summary & Architectural Strategy

The **Boutique Onboarding Page** (`/onboarding`) is the entry point for new boutique owners to establish their digital atelier workspace in **YellowHouse Tailoring OS**. This page facilitates:
1. **Atelier Identity & Subdomain Claiming**: Real-time debounced slug checking (`GET /onboarding/check-slug/:slug`) to ensure workspace uniqueness.
2. **Measurement Engine Seeding Setup**: Multi-select checklist for pre-configured POM templates (Men's Bespoke, Women's Couture, Custom).
3. **Atelier Owner Credentials Setup**: Full Name, Email, Password, and Confirm Password validation.
4. **Tenant Workspace Provisioning**: Submitting form data to `POST /onboarding/signup`, storing session JWT tokens and tenant metadata, and redirecting to login/dashboard.

The UI is styled using **Tailwind CSS** following the **Dark Atelier Theme** defined in `apps/web/src/app/globals.css`, leveraging glassmorphic cards (`.glass-card-gold`), gold gradients (`from-yellow-600 to-yellow-500`), dark inputs (`.input-dark`), custom badges, and smooth state transitions.

---

## 2. Component Hierarchy & File Map

```
apps/web/
├── src/
│   ├── app/
│   │   └── onboarding/
│   │       └── page.tsx              # Standalone Onboarding Client Component ('use client')
│   ├── lib/
│   │   ├── api.ts                    # API fetch wrapper with base URL & error handling
│   │   └── slug.ts                   # Slug generator & regex validator helper
│   └── types/
│       └── onboarding.ts             # TypeScript interfaces for onboarding request/response/form
```

---

## 3. Data Schemas & Type Definitions (`apps/web/src/types/onboarding.ts`)

```typescript
export interface TenantPayload {
  id: string;
  name: string;
  slug: string;
}

export interface UserPayload {
  id: string;
  email: string;
  role: 'TENANT_OWNER' | 'RECEPTIONIST' | 'MASTER_TAILOR' | 'KARIGAR' | 'SYSTEM_ADMIN';
}

export interface SignupResponse {
  success: boolean;
  tenant: TenantPayload;
  user: UserPayload;
  token: string;
  message?: string;
}

export interface SlugCheckResponse {
  available: boolean;
  slug: string;
  message?: string;
}

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export interface SlugCheckerState {
  status: SlugStatus;
  message: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  pomsCount: number;
  popular?: boolean;
}

export interface OnboardingFormState {
  boutiqueName: string;
  slug: string;
  isSlugManuallyEdited: boolean;
  templates: string[];
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

---

## 4. Helper Utilities Design

### 4.1 Slug Utility (`apps/web/src/lib/slug.ts`)
```typescript
/**
 * Auto-generates a clean slug from boutique name.
 * e.g., "Savile Row Atelier & Co." -> "savile-row-atelier-co"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')      // Remove non-word characters
    .replace(/\-\-+/g, '-')        // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim leading hyphen
    .replace(/-+$/, '');            // Trim trailing hyphen
}

/**
 * Validates slug format against backend rule: ^[a-z0-9-]+$
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 30) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
```

### 4.2 API Client Helper (`apps/web/src/lib/api.ts`)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data as T;
}
```

---

## 5. Detailed Component State & Interactivity Logic (`apps/web/src/app/onboarding/page.tsx`)

### 5.1 Real-Time Debounced Slug Checker State Flow

1. **Auto-Slug Generation**: As the user types in `Boutique Name`, if `isSlugManuallyEdited` is false, `slug` state is automatically updated using `slugify(name)`.
2. **Manual Slug Override**: Typing directly into the `Workspace Slug` input sets `isSlugManuallyEdited` to `true`.
3. **Debounce Logic**:
   - `useEffect` listens to `formState.slug`.
   - Clears existing `setTimeout` on every keystroke.
   - If `slug.trim() === ''`: sets status to `'idle'`, message `''`.
   - Validates format locally via `isValidSlug(slug)`. If invalid, immediately sets status to `'invalid'` and message to `'3-30 chars, lowercase letters, numbers, hyphens only'` without making an HTTP request.
   - If format is valid: sets status to `'checking'`. Initiates a 350ms debounced timer.
   - Timer fires `GET /onboarding/check-slug/${encodeURIComponent(slug)}`.
   - On response:
     - `available: true` -> status `'available'`, message `'Workspace slug is available!'`
     - `available: false` -> status `'taken'`, message `'Slug is already registered. Try another.'`
   - On error: status `'invalid'`, message `'Failed to verify slug availability.'`

```typescript
// Debounce Hook / Effect Logic
useEffect(() => {
  const targetSlug = formState.slug.trim();
  if (!targetSlug) {
    setSlugState({ status: 'idle', message: '' });
    return;
  }

  if (!isValidSlug(targetSlug)) {
    setSlugState({
      status: 'invalid',
      message: 'Slug must be 3-30 characters (lowercase letters, numbers, hyphens).'
    });
    return;
  }

  setSlugState({ status: 'checking', message: 'Checking availability...' });

  const timer = setTimeout(async () => {
    try {
      const res = await fetchApi<SlugCheckResponse>(`/onboarding/check-slug/${encodeURIComponent(targetSlug)}`);
      if (res.available) {
        setSlugState({ status: 'available', message: 'Workspace slug is available!' });
      } else {
        setSlugState({ status: 'taken', message: 'This slug is already taken.' });
      }
    } catch (err: any) {
      setSlugState({ status: 'invalid', message: err.message || 'Error checking slug.' });
    }
  }, 350);

  return () => clearTimeout(timer);
}, [formState.slug]);
```

---

### 5.2 Measurement Template Selection Logic

The checklist renders 3 distinct template selection cards:
1. **Men's Bespoke** (`mens_bespoke`): Suits, Sherwanis, Shirts, Trousers (31 POMs).
2. **Women's Couture** (`womens_couture`): Sari Blouse, Lehenga Choli, Anarkali, Corset, Evening Gown (39 POMs).
3. **Custom Template** (`custom`): Blank schema container for tailor-defined measurement definitions.

- Pre-selected default: `['mens_bespoke', 'womens_couture']`.
- Interactivity: Clicking a card toggles its presence in `formState.templates`.
- Validation: At least one template must be selected before submit.

---

### 5.3 Owner Credentials & Client-Side Validation

Form validation occurs prior to dispatching `POST /onboarding/signup`:
- **Boutique Name**: Non-empty (`name.trim().length >= 2`).
- **Slug**: Must be in `'available'` status.
- **Templates**: `templates.length > 0`.
- **Full Name**: Non-empty (`fullName.trim().length >= 2`).
- **Email**: Matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- **Password**: `password.length >= 8`.
- **Confirm Password**: `confirmPassword === password`. If mismatched, renders inline error `"Passwords do not match"`.

---

### 5.4 Form Submission & Session Storage Flow

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (slugState.status !== 'available') {
    setError('Please enter a valid and available workspace slug.');
    return;
  }
  if (formState.password !== formState.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  setIsSubmitting(true);
  setError('');

  try {
    const payload = {
      boutiqueName: formState.boutiqueName,
      slug: formState.slug,
      templates: formState.templates,
      fullName: formState.fullName,
      email: formState.email,
      password: formState.password,
    };

    const res = await fetchApi<SignupResponse>('/onboarding/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.token) {
      // 1. Store JWT token & session context
      localStorage.setItem('jwt_token', res.token);
      localStorage.setItem('tenant', JSON.stringify(res.tenant));
      localStorage.setItem('user', JSON.stringify(res.user));

      // 2. Set Cookie for Next.js SSR / middleware compatibility
      document.cookie = `jwt_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `x-tenant-id=${res.tenant.id}; path=/; max-age=86400; SameSite=Lax`;

      // 3. Render success state & navigate
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setError(res.message || 'Onboarding failed. Please try again.');
    }
  } catch (err: any) {
    setError(err.message || 'Network error occurred during workspace creation.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 6. UI Layout & Dark Atelier Styling Details

### 6.1 Theme Tokens & Tailwind CSS Classes
- **Background**: `bg-[#0B0F19] text-slate-100 min-h-screen relative font-sans`
- **Ambient Gold Backdrop Glow**: `absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none`
- **Main Glass Form Card**: `.glass-card-gold p-6 sm:p-10 rounded-3xl border border-yellow-500/20 max-w-3xl mx-auto shadow-2xl shadow-yellow-500/5`
- **Brand Logo Header**:
  - Scissors Icon in Gradient Square: `w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-yellow-500/20`
  - Title: `text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent`
- **Input Styling**: `.input-dark py-2.5 px-4 rounded-xl text-sm focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/20 bg-slate-900/90 border-slate-800`
- **Slug Status Badges**:
  - `available`: `.badge-emerald px-3 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
  - `taken`: `.badge-rose px-3 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/20`
  - `invalid`: `.badge-amber px-3 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/20`
  - `checking`: `.badge-gold px-3 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`
- **Template Card**:
  - Unselected: `bg-slate-900/60 border-slate-800 hover:border-slate-700`
  - Selected: `bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/50 shadow-md shadow-yellow-500/10`
- **Submit CTA Button**: `.btn-gold w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center space-x-2 shadow-xl shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer`

---

## 7. Complete Code Blueprint for Implementation

Below is the complete, ready-to-implement React component specification for `apps/web/src/app/onboarding/page.tsx`:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  Building2,
  Globe,
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
  ShieldCheck,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { slugify, isValidSlug } from '@/lib/slug';
import type {
  OnboardingFormState,
  SlugCheckerState,
  SlugCheckResponse,
  SignupResponse,
  TemplateOption,
} from '@/types/onboarding';

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'mens_bespoke',
    name: "Men's Bespoke Atelier",
    category: 'Western & Ethnic',
    description: 'Pre-loaded POMs for 3-Piece Suits, Royal Sherwanis, Custom Dress Shirts & Tailored Trousers.',
    pomsCount: 31,
    popular: true,
  },
  {
    id: 'womens_couture',
    name: "Women's High Couture",
    category: 'Ethnic & Western',
    description: 'Precision POM schemas for Sari Blouses, Lehenga Cholis, Anarkalis, Structured Corsets & Gowns.',
    pomsCount: 39,
    popular: true,
  },
  {
    id: 'custom',
    name: 'Custom Atelier Canvas',
    category: 'Flexible Bespoke',
    description: 'Blank slate to configure proprietary measurements, custom fitting posture profiles, and POM logic.',
    pomsCount: 0,
    popular: false,
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [formState, setFormState] = useState<OnboardingFormState>({
    boutiqueName: '',
    slug: '',
    isSlugManuallyEdited: false,
    templates: ['mens_bespoke', 'womens_couture'],
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [slugState, setSlugState] = useState<SlugCheckerState>({
    status: 'idle',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Boutique Name change + auto-slug generation
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

  // Handle manual slug input
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormState((prev) => ({
      ...prev,
      slug: val,
      isSlugManuallyEdited: true,
    }));
  };

  // Debounced real-time slug availability check
  useEffect(() => {
    const targetSlug = formState.slug.trim();
    if (!targetSlug) {
      setSlugState({ status: 'idle', message: '' });
      return;
    }

    if (!isValidSlug(targetSlug)) {
      setSlugState({
        status: 'invalid',
        message: 'Must be 3-30 characters (lowercase letters, numbers, hyphens).',
      });
      return;
    }

    setSlugState({ status: 'checking', message: 'Checking availability...' });

    const timer = setTimeout(async () => {
      try {
        const res = await fetchApi<SlugCheckResponse>(
          `/onboarding/check-slug/${encodeURIComponent(targetSlug)}`
        );
        if (res.available) {
          setSlugState({ status: 'available', message: 'Workspace slug is available!' });
        } else {
          setSlugState({ status: 'taken', message: 'Workspace slug is already taken.' });
        }
      } catch (err: any) {
        setSlugState({
          status: 'invalid',
          message: err.message || 'Error checking slug availability.',
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formState.slug]);

  // Toggle template selections
  const toggleTemplate = (templateId: string) => {
    setFormState((prev) => {
      const exists = prev.templates.includes(templateId);
      const nextTemplates = exists
        ? prev.templates.filter((t) => t !== templateId)
        : [...prev.templates, templateId];
      return { ...prev, templates: nextTemplates };
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formState.boutiqueName.trim()) {
      setError('Please enter your boutique name.');
      return;
    }

    if (slugState.status !== 'available') {
      setError('Please provide a valid and available workspace slug.');
      return;
    }

    if (formState.templates.length === 0) {
      setError('Select at least one measurement template.');
      return;
    }

    if (!formState.fullName.trim() || !formState.email.trim()) {
      setError('Please complete owner account details.');
      return;
    }

    if (formState.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        boutiqueName: formState.boutiqueName,
        slug: formState.slug,
        templates: formState.templates,
        fullName: formState.fullName,
        email: formState.email,
        password: formState.password,
      };

      const res = await fetchApi<SignupResponse>('/onboarding/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.token) {
        localStorage.setItem('jwt_token', res.token);
        localStorage.setItem('tenant', JSON.stringify(res.tenant));
        localStorage.setItem('user', JSON.stringify(res.user));

        document.cookie = `jwt_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `x-tenant-id=${res.tenant.id}; path=/; max-age=86400; SameSite=Lax`;

        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(res.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace. Network connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              YellowHouse Tailoring OS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Atelier Onboarding Engine
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-3xl mx-auto w-full my-8">
        <div className="glass-card-gold rounded-3xl p-6 sm:p-10 border border-yellow-500/20 shadow-2xl shadow-yellow-500/5">
          {/* Title & Introduction */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant Workspace Provisioning</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Setup Your Bespoke Boutique Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Configure your boutique domain, select measurement schemas, and create your master atelier owner account.
            </p>
          </div>

          {/* Success Screen Banner */}
          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Workspace Successfully Created!</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Your boutique workspace <span className="text-yellow-400 font-mono font-semibold">{formState.slug}</span> has been provisioned. Redirecting to login...
              </p>
              <div className="flex justify-center pt-2">
                <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Banner */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section 1: Boutique Identity & Subdomain */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    1. Boutique Identity & Workspace Subdomain
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Boutique Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Boutique Name <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Bespoke Tailors"
                      value={formState.boutiqueName}
                      onChange={handleBoutiqueNameChange}
                      className="input-dark"
                    />
                  </div>

                  {/* Workspace Slug */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Workspace Subdomain <span className="text-yellow-400">*</span>
                      </label>
                      {/* Slug Status Indicator */}
                      {slugState.status === 'checking' && (
                        <span className="badge badge-gold flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking...</span>
                        </span>
                      )}
                      {slugState.status === 'available' && (
                        <span className="badge badge-emerald flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Available</span>
                        </span>
                      )}
                      {slugState.status === 'taken' && (
                        <span className="badge badge-rose flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Taken</span>
                        </span>
                      )}
                      {slugState.status === 'invalid' && (
                        <span className="badge badge-amber flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Invalid</span>
                        </span>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="royal-bespoke"
                        value={formState.slug}
                        onChange={handleSlugChange}
                        className={`input-dark font-mono ${
                          slugState.status === 'available'
                            ? 'border-emerald-500/50 focus:border-emerald-500'
                            : slugState.status === 'taken' || slugState.status === 'invalid'
                            ? 'border-rose-500/50 focus:border-rose-500'
                            : ''
                        }`}
                      />
                    </div>

                    {slugState.message && (
                      <p
                        className={`text-[11px] font-medium ${
                          slugState.status === 'available'
                            ? 'text-emerald-400'
                            : slugState.status === 'taken' || slugState.status === 'invalid'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {slugState.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Measurement Template Selection Checklist */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ruler className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      2. Select Measurement Templates to Seed
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formState.templates.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TEMPLATE_OPTIONS.map((tmpl) => {
                    const isSelected = formState.templates.includes(tmpl.id);
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => toggleTemplate(tmpl.id)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/50 shadow-md shadow-yellow-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {tmpl.popular && (
                          <span className="absolute -top-2.5 right-3 bg-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                            Recommended
                          </span>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-white leading-snug">
                              {tmpl.name}
                            </h4>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-yellow-500 border-yellow-500 text-slate-950'
                                  : 'border-slate-700 bg-slate-950'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{tmpl.category}</span>
                          <span className="font-mono text-yellow-400/80">
                            {tmpl.pomsCount > 0 ? `${tmpl.pomsCount} POMs` : 'Custom'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Boutique Owner Account Setup */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    3. Atelier Owner Account Setup
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Owner Full Name <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Master Latif"
                        value={formState.fullName}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Owner Email Address <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="owner@atelier.com"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        value={formState.password}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className="input-dark pl-9"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Confirm Password <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={formState.confirmPassword}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        className="input-dark pl-9"
                      />
                    </div>
                    {formState.confirmPassword &&
                      formState.password !== formState.confirmPassword && (
                        <p className="text-[11px] text-rose-400 font-medium">
                          Passwords do not match.
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={isSubmitting || slugState.status !== 'available'}
                  className={`btn-gold w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center space-x-2 shadow-xl shadow-yellow-500/20 transition-all ${
                    isSubmitting || slugState.status !== 'available'
                      ? 'opacity-60 cursor-not-allowed filter grayscale-[30%]'
                      : 'hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Provisioning Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Atelier Workspace</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-500">
        &copy; {new Date().getFullYear()} YellowHouse Tailoring OS &bull; Enterprise Bespoke Tailoring Engine
      </footer>
    </div>
  );
}
```

---

## 8. Verification & Validation Protocol

To independently verify the frontend onboarding page once implemented by `implementer`:

1. **Static Analysis & Build Verification**:
   - Run `npx next build` in `apps/web`. Ensure zero TypeScript compiler errors or CSS bundle issues.
2. **Slug Debounce Verification**:
   - Input `"Savile Row Atelier"` -> Auto-populates slug `"savile-row"`.
   - After ~350ms pause, verify `GET /onboarding/check-slug/savile-row` is called.
   - Verify badge displays green `Available` when available, or red `Taken` when taken.
   - Input invalid characters `"invalid slug!"` -> Verify immediate amber `Invalid` badge without HTTP call.
3. **Template Checklist Verification**:
   - Toggle options on/off. Verify selection counter updates and `formState.templates` array updates.
4. **Form Submission & Local Storage Verification**:
   - Submit valid form. Verify `POST /onboarding/signup` returns `201 Created` with token & tenant object.
   - Inspect `localStorage.getItem('jwt_token')` and `localStorage.getItem('tenant')`.
   - Verify automatic redirection to `/login` after 1.5 seconds.
