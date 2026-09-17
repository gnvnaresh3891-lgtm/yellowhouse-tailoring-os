'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { setLocalStorage } from '@/lib/storage-utils';

const ROLE_OPTIONS = [
  {
    value: 'TENANT_OWNER',
    label: 'TENANT_OWNER — Atelier Owner / Founder',
    desc: 'Full system control & multi-branch administration',
  },
  {
    value: 'BRANCH_MANAGER',
    label: 'BRANCH_MANAGER — Branch / Store Manager',
    desc: 'Manages daily shop workflow & order assignments',
  },
  {
    value: 'RECEPTIONIST',
    label: 'RECEPTIONIST — Order Desk & Front Office',
    desc: 'Handles client intake, appointments & invoicing',
  },
  {
    value: 'MASTER_TAILOR',
    label: 'MASTER_TAILOR — Master Cutter & Stylist',
    desc: 'Creates patterns, takes measurements & manages fittings',
  },
  {
    value: 'KARIGAR',
    label: 'KARIGAR — Workshop Craftsman / Artisan',
    desc: 'Stitching, embroidery & workshop task execution',
  },
  {
    value: 'ACCOUNTANT',
    label: 'ACCOUNTANT — Financials & Billing Manager',
    desc: 'Manages ledger, payouts & financial reporting',
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [atelierName, setAtelierName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TENANT_OWNER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    role: string;
    atelierName: string;
  } | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);
    const finalAtelierName = atelierName.trim() || 'Grand Atelier';

    setTimeout(() => {
      const userPayload = {
        id: `usr_${Date.now().toString(36)}`,
        name: fullName.trim(),
        email: email.trim(),
        role: role,
        tenant: {
          id: `tenant_${finalAtelierName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: finalAtelierName,
          code: finalAtelierName.slice(0, 3).toUpperCase() + '-01',
        },
        loggedInAt: new Date().toISOString(),
      };

      setLocalStorage('yh_auth_user', userPayload);

      setRegisteredUser({
        name: fullName.trim(),
        email: email.trim(),
        role: role,
        atelierName: finalAtelierName,
      });

      setLoading(false);
    }, 500);
  };

  const getRoleBadgeVariant = (roleVal: string) => {
    switch (roleVal) {
      case 'TENANT_OWNER':
        return 'gold';
      case 'BRANCH_MANAGER':
        return 'info';
      case 'MASTER_TAILOR':
        return 'warning';
      case 'RECEPTIONIST':
        return 'success';
      case 'KARIGAR':
        return 'neutral';
      case 'ACCOUNTANT':
        return 'info';
      default:
        return 'gold';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {registeredUser ? (
        /* Success Card after Registration */
        <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/40 shadow-ios-gold-lg space-y-6 animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-ios-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Account Created Successfully!
            </h2>
            <p className="text-xs text-slate-300">
              Welcome to YellowHouse Tailoring OS,{' '}
              <span className="font-semibold text-yellow-400">{registeredUser.name}</span>.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-3 text-xs shadow-ios-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Atelier / House:</span>
              <span className="font-semibold text-white">{registeredUser.atelierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-slate-300">{registeredUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Role:</span>
              <Badge variant={getRoleBadgeVariant(registeredUser.role)} size="sm">
                {registeredUser.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="gold"
              size="lg"
              onClick={() => router.push('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full shadow-ios-gold"
            >
              Proceed to Atelier Dashboard
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push('/login')}
              className="w-full text-slate-300"
            >
              Back to Login Page
            </Button>
          </div>
        </Card>
      ) : (
        /* Register Form Card */
        <Card variant="glass" padding="lg" className="rounded-3xl shadow-ios-xl border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Register Atelier Account
            </h2>
            <p className="text-xs text-slate-400">
              Set up your tailoring business workspace & team role
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3 flex items-start space-x-2.5 text-rose-300 text-xs animate-fade-in shadow-ios-sm">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Master Latif Khan"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            {/* Atelier / House Name */}
            <Input
              label="Atelier / House Name"
              type="text"
              value={atelierName}
              onChange={(e) => setAtelierName(e.target.value)}
              placeholder="Savile Row Bespoke Atelier"
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="latif@savilerow.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {/* Role Selector Dropdown */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 tracking-tight">
                  Select Team Role
                </label>
                <span className="text-[10px] text-yellow-400 font-mono">RBAC Controlled</span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-yellow-500">
                  <Shield className="w-4 h-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/70 border border-white/10 text-slate-100 rounded-xl pl-10 pr-8 py-2.5 text-xs font-medium focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none backdrop-blur-xl transition-all cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 italic pl-1 leading-snug">
                {ROLE_OPTIONS.find((r) => r.value === role)?.desc}
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
                required
              />
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2 shadow-ios-gold"
            >
              Create Account
            </Button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-3 border-t border-white/5">
            <p className="text-xs text-slate-400">
              Already have an atelier account?{' '}
              <Link
                href="/login"
                className="font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
