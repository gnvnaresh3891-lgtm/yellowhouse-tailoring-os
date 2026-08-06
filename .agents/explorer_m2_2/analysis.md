# Technical Design & Implementation Analysis: Milestone 2 Frontend (Auth, Contexts, Header & Middleware)

## Executive Summary
This analysis details the exact frontend technical implementation strategy for **YellowHouse Tailoring OS Milestone 2**. It encompasses the dark atelier styled Login (`/login`) and Register (`/register`) pages, client-side state management via `AuthContext` and `TenantContext`, dynamic tenant & user role rendering in the Next.js Dashboard Header, and Edge Route Protection & RBAC via Next.js Auth Middleware (`middleware.ts`).

---

## 1. Architecture & Data Flow Overview

```
                          ┌──────────────────────────┐
                          │   Next.js Middleware     │
                          │   (src/middleware.ts)    │
                          └────────────┬─────────────┘
                                       │ Intercepts Requests
                                       ▼
                   ┌───────────────────────────────────────┐
                   │           App Root Providers          │
                   │    (AuthContext & TenantContext)      │
                   └───────────────────┬───────────────────┘
                                       │ Supplies State & Handlers
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
      ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
      │   /login Page      │ │   /register Page   │ │  Dashboard Header  │
      │ Dark Atelier Theme │ │ Dark Atelier Theme │ │ Tenant/User/Role   │
      │ POST /auth/login   │ │ POST /auth/register│ │ Logout Action      │
      └──────────┬─────────┘ └──────────┬─────────┘ └──────────┬─────────┘
                 │                      │                      │
                 └──────────────────────┴──────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │   Backend API (/auth/*)     │
                         │   HTTP-Only Cookies & JWT   │
                         └─────────────────────────────┘
```

### Key Data Persistence Strategy
1. **JWT Token Storage**:
   - Primary: HTTP-Only cookie `jwt_token` (set by backend `POST /auth/login` and client backup via `document.cookie`).
   - Backup / Client Header: `localStorage.getItem('jwt_token')`.
2. **Tenant Context**:
   - `localStorage.getItem('tenant')` and cookie `x-tenant-id`.
3. **User Context**:
   - `localStorage.getItem('user')` and state in `AuthContext`.
4. **Session Rehydration**:
   - On page mount or refresh, `AuthContext` checks `localStorage` and optionally calls `GET /auth/me` to ensure session validity without causing visual flash.

---

## 2. File Specifications & Exact Technical Designs

### File 1: `apps/web/src/types/auth.ts`
*Type definitions for User, Tenant, Role Permissions, Auth State, and Login/Register payloads.*

```typescript
export type UserRole =
  | 'TENANT_OWNER'
  | 'BRANCH_MANAGER'
  | 'RECEPTIONIST'
  | 'MASTER_TAILOR'
  | 'KARIGAR'
  | 'ACCOUNTANT'
  | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  branchId?: string | null;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  tenant: Tenant;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface QuickDemoUser {
  label: string;
  role: UserRole;
  email: string;
  name: string;
  badgeColor: string;
}
```

---

### File 2: `apps/web/src/context/AuthContext.tsx`
*React Context providing authenticated user state, login/logout handlers, and role-based helper methods.*

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import type { User, UserRole, LoginResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state from localStorage & API on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally verify token with backend
          try {
            const meRes = await fetchApi<{ user: User }>('/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (meRes?.user) {
              setUser(meRes.user);
              localStorage.setItem('user', JSON.stringify(meRes.user));
            }
          } catch (e) {
            // If /auth/me fails (e.g. 401), keep local cached user if offline or clear if invalid
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);

        localStorage.setItem('jwt_token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        if (res.tenant) {
          localStorage.setItem('tenant', JSON.stringify(res.tenant));
        }

        // Set non-httpOnly cookie backup for edge middleware access
        document.cookie = `jwt_token=${res.token}; path=/; max-age=86400; SameSite=Lax`;
        if (res.tenant?.id) {
          document.cookie = `x-tenant-id=${res.tenant.id}; path=/; max-age=86400; SameSite=Lax`;
        }

        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: res.message || 'Login failed. Invalid credentials.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Authentication service unreachable.' };
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');

      document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'x-tenant-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      router.push('/login');
    }
  };

  const hasRole = useCallback(
    (allowedRoles: UserRole[]) => {
      if (!user) return false;
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  const refreshUser = async () => {
    if (!token) return;
    try {
      const meRes = await fetchApi<{ user: User }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes?.user) {
        setUser(meRes.user);
        localStorage.setItem('user', JSON.stringify(meRes.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        role: user?.role || null,
        login,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### File 3: `apps/web/src/context/TenantContext.tsx`
*React Context providing active tenant workspace info, slug badge attributes, and tenant switches.*

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Tenant } from '@/types/auth';

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTenant = localStorage.getItem('tenant');
      if (storedTenant) {
        setTenantState(JSON.parse(storedTenant));
      }
    } catch (err) {
      console.error('Failed to parse tenant from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTenant = (newTenant: Tenant | null) => {
    setTenantState(newTenant);
    if (newTenant) {
      localStorage.setItem('tenant', JSON.stringify(newTenant));
      document.cookie = `x-tenant-id=${newTenant.id}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem('tenant');
      document.cookie = 'x-tenant-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const clearTenant = () => {
    setTenant(null);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        setTenant,
        isLoading,
        clearTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
```

---

### File 4: `apps/web/src/app/providers.tsx`
*Global root provider wrapper uniting AuthProvider and TenantProvider.*

```typescript
'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantProvider>{children}</TenantProvider>
    </AuthProvider>
  );
}
```

---

### File 5: `apps/web/src/app/login/page.tsx`
*Login Page featuring Dark Atelier Theme, Quick Role Preset Selector, Email/Password validation, Cookie/LocalStorage persistence, and redirect handling.*

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Scissors,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Building2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { QuickDemoUser } from '@/types/auth';

const DEMO_PRESETS: QuickDemoUser[] = [
  {
    label: 'Tenant Owner',
    role: 'TENANT_OWNER',
    email: 'owner@atelier.com',
    name: 'Master Latif (Owner)',
    badgeColor: 'bg-amber-500/20 text-yellow-300 border-amber-500/40',
  },
  {
    label: 'Receptionist',
    role: 'RECEPTIONIST',
    email: 'reception@atelier.com',
    name: 'Sarah Jenkins',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    label: 'Master Tailor',
    role: 'MASTER_TAILOR',
    email: 'master@atelier.com',
    name: 'Ustad Tariq',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    label: 'Karigar',
    role: 'KARIGAR',
    email: 'karigar@atelier.com',
    name: 'Rashid Karigar',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPreset = (preset: QuickDemoUser) => {
    setEmail(preset.email);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectPath);
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              YellowHouse Tailoring OS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Enterprise Atelier OS
            </p>
          </div>
        </Link>

        <Link
          href="/onboarding"
          className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center space-x-1"
        >
          <span>Provision New Tenant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-md mx-auto w-full my-8">
        <div className="glass-card-gold rounded-3xl p-6 sm:p-8 border border-yellow-500/20 shadow-2xl shadow-yellow-500/5">
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atelier RBAC Sign In</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Welcome Back to Atelier
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to access tenant workspace, clients & measurement engine
            </p>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <KeyRound className="w-3 h-3 text-yellow-400" />
                <span>Quick Demo Role Switcher</span>
              </span>
              <span className="text-[9px] text-slate-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-yellow-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-yellow-300">
                      {preset.label}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                      {preset.role.split('_')[0]}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 block truncate">{preset.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                Email Address <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="master@atelier.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-9"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Password <span className="text-yellow-400">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-9"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-gold w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-xl shadow-yellow-500/20 transition-all ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Register new staff account?</span>
            <Link
              href="/register"
              className="text-yellow-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-500">
        &copy; {new Date().getFullYear()} YellowHouse Tailoring OS &bull; Enterprise Bespoke Tailoring Platform
      </footer>
    </div>
  );
}
```

---

### File 6: `apps/web/src/app/register/page.tsx`
*Staff Registration Page supporting staff account creation, tenant selection, role picker (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), validation, calling `POST /auth/register`, and success redirect.*

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scissors,
  Mail,
  Lock,
  User,
  Building2,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import type { UserRole, RegisterResponse } from '@/types/auth';

const ROLE_OPTIONS: { role: UserRole; title: string; description: string; badge: string }[] = [
  {
    role: 'TENANT_OWNER',
    title: 'Tenant Owner / Director',
    description: 'Full workspace access, staff management, billing & system configuration.',
    badge: 'bg-amber-500/20 text-yellow-300 border-amber-500/40',
  },
  {
    role: 'RECEPTIONIST',
    title: 'Front-Desk Receptionist',
    description: 'Client onboarding, measurement booking, and order confirmation.',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    role: 'MASTER_TAILOR',
    title: 'Master Cutting Tailor',
    description: 'Bespoke measurement recording, pattern drafting & quality inspection.',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    role: 'KARIGAR',
    title: 'Karigar / Artisan Worker',
    description: 'Workshop job card tracking, stitching tasks & piece-rate earnings.',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('MASTER_TAILOR');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !tenantSlug.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim(),
        tenantSlug: tenantSlug.trim(),
        role: selectedRole,
        password: password,
      };

      const res = await fetchApi<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(res.message || 'Staff registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration service unreachable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              YellowHouse Tailoring OS
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Staff Registration
            </p>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          Already registered? Sign In
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-8">
        <div className="glass-card-gold rounded-3xl p-6 sm:p-10 border border-yellow-500/20 shadow-2xl shadow-yellow-500/5">
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boutique Staff Provisioning</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Create Staff Account
            </h2>
            <p className="text-xs text-slate-400">
              Register an atelier account linked to an existing boutique tenant workspace
            </p>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
              <p className="text-xs text-slate-400">
                Account created for <span className="text-yellow-400 font-semibold">{email}</span>. Redirecting to sign in...
              </p>
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin mx-auto pt-2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Workspace Slug */}
              <div className="space-y-1.5">
                <label htmlFor="tenantSlug" className="text-xs font-semibold text-slate-300">
                  Boutique Workspace Subdomain / Slug <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="tenantSlug"
                    type="text"
                    required
                    placeholder="e.g. royal-bespoke"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="input-dark pl-9 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-yellow-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Master Tariq"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-dark pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                    Email Address <span className="text-yellow-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="tariq@atelier.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-dark pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Role Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Select Staff Role <span className="text-yellow-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.role;
                    return (
                      <div
                        key={opt.role}
                        onClick={() => setSelectedRole(opt.role)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-yellow-500/10 border-yellow-500/60 shadow-md shadow-yellow-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${opt.badge}`}>
                            {opt.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{opt.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Password <span className="text-yellow-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-dark pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-300">
                    Confirm Password <span className="text-yellow-400">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-dark pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-gold w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-xl shadow-yellow-500/20 transition-all ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Staff Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 text-xs text-slate-500">
        &copy; {new Date().getFullYear()} YellowHouse Tailoring OS &bull; Enterprise Bespoke Platform
      </footer>
    </div>
  );
}
```

---

### File 7: `apps/web/src/app/(dashboard)/layout.tsx`
*Updated Next.js Dashboard Layout & Header component integrating AuthContext & TenantContext to render dynamic Tenant Name, Tenant Slug badge, Active User Name, Role badge (`TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`), Initials Avatar, and Logout action.*

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scissors,
  LayoutDashboard,
  Users,
  Ruler,
  Factory,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Building2,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import type { UserRole } from '@/types/auth';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/measurements', label: 'Measurements', icon: Ruler },
  { href: '/production', label: 'Production', icon: Factory },
];

const ROLE_BADGE_STYLES: Record<UserRole, { label: string; style: string }> = {
  TENANT_OWNER: { label: 'Owner', style: 'bg-amber-500/20 text-yellow-300 border-amber-500/40' },
  BRANCH_MANAGER: { label: 'Manager', style: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' },
  RECEPTIONIST: { label: 'Reception', style: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  MASTER_TAILOR: { label: 'Master Tailor', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  KARIGAR: { label: 'Karigar', style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ACCOUNTANT: { label: 'Accountant', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  SYSTEM_ADMIN: { label: 'Global Admin', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

function getInitials(name?: string): string {
  if (!name) return 'AT';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { tenant } = useTenant();

  const userRole = user?.role || 'MASTER_TAILOR';
  const roleBadge = ROLE_BADGE_STYLES[userRole] || ROLE_BADGE_STYLES.MASTER_TAILOR;
  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar (w-64) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-0`}
      >
        {/* Brand Logo & Tenant Badge */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  YellowHouse
                </span>
                <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">
                  Tailoring OS
                </span>
              </div>
            </Link>
            <button
              className="lg:hidden text-slate-400 hover:text-white p-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Tenant Workspace Pill */}
          <div className="p-2 rounded-xl bg-slate-900/80 border border-yellow-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate">
                {tenant?.name || 'YellowHouse Atelier'}
              </span>
            </div>
            {tenant?.slug && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                {tenant.slug}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
            Main Workspace
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-yellow-500/60 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Master Tailor'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${roleBadge.style}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full py-2 px-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Mobile Toggle & Search */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders, clients, measurements... (Ctrl+K)"
                  className="input-dark pl-10 pr-12 py-2 text-xs w-72 lg:w-96"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/80 border border-slate-700/60 rounded">
                  Ctrl+K
                </kbd>
              </div>
            </div>

            {/* Right: Dynamic Tenant, User Role Badges & Logout Button */}
            <div className="flex items-center space-x-3">
              {/* Tenant Badge Pill */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400">Tenant:</span>
                <span className="font-semibold text-yellow-400">{tenant?.name || 'YellowHouse'}</span>
                {tenant?.slug && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                    {tenant.slug}
                  </span>
                )}
              </div>

              {/* User & Role Badge Header Pill */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800/60">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {user?.name || 'Staff User'}
                  </p>
                  <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded border mt-0.5 ${roleBadge.style}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              {/* Header Logout Button */}
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

---

### File 8: `apps/web/src/middleware.ts`
*Next.js Edge Middleware for Route Protection and Role-Based Access Control (RBAC).*

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that bypass authentication
const PUBLIC_PATHS = ['/login', '/register', '/onboarding'];

// Role permission Matrix
const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['TENANT_OWNER', 'SYSTEM_ADMIN'],
  '/customers': ['TENANT_OWNER', 'RECEPTIONIST', 'MASTER_TAILOR', 'BRANCH_MANAGER'],
  '/measurements': ['TENANT_OWNER', 'RECEPTIONIST', 'MASTER_TAILOR', 'BRANCH_MANAGER'],
  '/production': ['TENANT_OWNER', 'RECEPTIONIST', 'MASTER_TAILOR', 'KARIGAR', 'BRANCH_MANAGER'],
};

/**
 * Lightweight edge-compatible JWT parser for extracting payload
 */
function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets & API bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('jwt_token')?.value;
  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // Unauthenticated user trying to access protected route
  if (!tokenCookie && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register
  if (tokenCookie && isPublicRoute && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If token is present, check RBAC route permissions
  if (tokenCookie && !isPublicRoute) {
    const payload = parseJwtPayload(tokenCookie);
    const userRole = payload?.role;

    if (userRole) {
      for (const [routePrefix, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
        if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
          if (!allowedRoles.includes(userRole)) {
            // Role forbidden for this route -> redirect to home dashboard
            const redirectUrl = new URL('/', request.url);
            redirectUrl.searchParams.set('error', 'unauthorized_role');
            return NextResponse.redirect(redirectUrl);
          }
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 3. UI Theme & Style Guidelines (Dark Atelier Aesthetic)
All newly designed UI components follow the established YellowHouse Dark Atelier Design System:
- **Background**: `#0B0F19` (slate-950 dark contrast background).
- **Cards**: `glass-card-gold` (`bg-slate-900/80 border border-yellow-500/20 backdrop-blur-xl shadow-2xl`).
- **Typography**: Amber/Gold gradient headers (`bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent`).
- **Role Badges**:
  - `TENANT_OWNER`: Gold/Amber pill.
  - `RECEPTIONIST`: Sky/Cyan pill.
  - `MASTER_TAILOR`: Emerald/Teal pill.
  - `KARIGAR`: Indigo/Violet pill.

---

## 4. Summary of File Modifications & Additions

| File Path | Status | Purpose |
|---|---|---|
| `apps/web/src/types/auth.ts` | **NEW** | User, Tenant, Role, & Auth Payload interfaces |
| `apps/web/src/context/AuthContext.tsx` | **NEW** | Auth state, login/logout, role checking, token storage |
| `apps/web/src/context/TenantContext.tsx` | **NEW** | Tenant info state, slug tracking, cookie sync |
| `apps/web/src/app/providers.tsx` | **NEW** | Combined Root Context Provider wrapper |
| `apps/web/src/app/login/page.tsx` | **NEW** | Login UI page with dark atelier theme & demo switcher |
| `apps/web/src/app/register/page.tsx` | **NEW** | Staff registration UI page with role selector |
| `apps/web/src/app/(dashboard)/layout.tsx` | **UPDATE** | Connect header/sidebar to dynamic user/tenant/logout state |
| `apps/web/src/middleware.ts` | **NEW** | Next.js Edge Auth & RBAC Route Protection |

---

## 5. Independent Verification Plan

1. **Build Verification**:
   Run `npx next build` in `apps/web` to verify that all pages, context providers, and middleware compile cleanly without TypeScript or React hydration errors.

2. **Route Protection & RBAC Audit**:
   - Access `/` without `jwt_token` cookie -> MUST redirect to `/login?redirect=%2F`.
   - Log in as `KARIGAR` -> attempting to visit `/admin` MUST redirect to `/` with `error=unauthorized_role`.
   - Log in as `TENANT_OWNER` -> access to `/`, `/customers`, `/measurements`, `/production`, `/admin` MUST pass.

3. **Header State Dynamic Sync**:
   - Verify Header displays logged-in user name, dynamic initials avatar, tenant name, tenant slug badge, and role pill.
   - Click "Sign Out" -> cookies & localStorage must be wiped, redirecting cleanly to `/login`.
