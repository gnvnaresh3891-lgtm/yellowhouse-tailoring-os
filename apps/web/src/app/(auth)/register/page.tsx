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
  Scissors
} from 'lucide-react';
// Helper for rendering role badges
function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'TENANT_OWNER':
      return 'badge-gold';
    case 'BRANCH_MANAGER':
      return 'badge-blue';
    case 'MASTER_TAILOR':
      return 'badge-amber';
    case 'RECEPTIONIST':
      return 'badge-emerald';
    case 'KARIGAR':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md';
    case 'ACCOUNTANT':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md';
    default:
      return 'badge-gold';
  }
}

const ROLE_OPTIONS = [
  { value: 'TENANT_OWNER', label: 'TENANT_OWNER — Atelier Owner / Founder', desc: 'Full system control & multi-branch administration' },
  { value: 'BRANCH_MANAGER', label: 'BRANCH_MANAGER — Branch / Store Manager', desc: 'Manages daily shop workflow & order assignments' },
  { value: 'RECEPTIONIST', label: 'RECEPTIONIST — Order Desk & Front Office', desc: 'Handles client intake, appointments & invoicing' },
  { value: 'MASTER_TAILOR', label: 'MASTER_TAILOR — Master Cutter & Stylist', desc: 'Creates patterns, takes measurements & manages fittings' },
  { value: 'KARIGAR', label: 'KARIGAR — Workshop Craftsman / Artisan', desc: 'Stitching, embroidery & workshop task execution' },
  { value: 'ACCOUNTANT', label: 'ACCOUNTANT — Financials & Billing Manager', desc: 'Manages ledger, payouts & financial reporting' },
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
        name: fullName,
        email: email,
        role: role,
        tenant: {
          id: `tenant_${finalAtelierName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: finalAtelierName,
          code: finalAtelierName.slice(0, 3).toUpperCase() + '-01',
        },
        loggedInAt: new Date().toISOString(),
      };

      // Mock auth store in localStorage
      localStorage.setItem('yh_auth_user', JSON.stringify(userPayload));

      setRegisteredUser({
        name: fullName,
        email: email,
        role: role,
        atelierName: finalAtelierName,
      });

      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {registeredUser ? (
        /* Success Card after Registration */
        <div className="glass-card-gold rounded-2xl p-6 sm:p-8 space-y-6 border border-yellow-500/40 animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Account Created Successfully!
            </h2>
            <p className="text-xs text-slate-300">
              Welcome to YellowHouse Tailoring OS, <span className="font-semibold text-yellow-400">{registeredUser.name}</span>.
            </p>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Atelier / Shop:</span>
              <span className="font-semibold text-white">{registeredUser.atelierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-slate-300">{registeredUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Role:</span>
              <span className={getRoleBadgeClass(registeredUser.role)}>
                {registeredUser.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-gold w-full flex items-center justify-center space-x-2 py-3"
            >
              <span>Proceed to Atelier Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/login"
              className="btn-ghost w-full flex items-center justify-center space-x-2 py-2.5 text-center block text-slate-300"
            >
              <span>Back to Login Page</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Register Form Card */
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight text-center">
              Register Atelier Account
            </h2>
            <p className="text-xs text-slate-400 text-center mt-1.5">
              Set up your tailoring business workspace & team role
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-rose-400 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Master Latif Khan"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            {/* Atelier / House Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Atelier / House Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Savile Row Bespoke Atelier"
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="latif@savilerow.com"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            {/* Role Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select Team Role</span>
                <span className="text-[10px] text-yellow-400/90 font-mono">RBAC Controlled</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-yellow-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-dark pl-10 pr-8 py-2.5 appearance-none bg-slate-900 text-xs font-medium focus:ring-1 focus:ring-yellow-500/50 cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 italic pl-1">
                {ROLE_OPTIONS.find((r) => r.value === role)?.desc}
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-dark pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center space-x-2 py-3 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-2 border-t border-slate-800/80">
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
        </div>
      )}
    </div>
  );
}
