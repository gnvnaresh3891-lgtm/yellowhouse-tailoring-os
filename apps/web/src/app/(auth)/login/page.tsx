'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Building2, 
  LogOut,
  Sparkles,
  UserCheck
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

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    code: string;
  };
  loggedInAt: string;
}

const DEMO_ACCOUNTS = [
  {
    role: 'TENANT_OWNER',
    name: 'Latif Khan',
    email: 'owner@yellowhouse.com',
    label: 'Tenant Owner',
    color: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
  },
  {
    role: 'MASTER_TAILOR',
    name: 'Master Latif',
    email: 'master@yellowhouse.com',
    label: 'Master Tailor',
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    role: 'BRANCH_MANAGER',
    name: 'Sarah Jenkins',
    email: 'manager@yellowhouse.com',
    label: 'Branch Manager',
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  },
  {
    role: 'KARIGAR',
    name: 'Rafi Craftsman',
    email: 'karigar@yellowhouse.com',
    label: 'Karigar Artisan',
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    role: 'SYSTEM_ADMIN',
    name: 'Admin Director',
    email: 'admin@yellowhouse.com',
    label: 'System Admin',
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeUser, setActiveUser] = useState<StoredUser | null>(null);

  // Check for existing active session in localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('yh_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as StoredUser;
        setActiveUser(parsed);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Determine role based on email if matched demo, else default to TENANT_OWNER
      const matchedDemo = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase()
      );
      
      const role = matchedDemo ? matchedDemo.role : 'TENANT_OWNER';
      const userName = matchedDemo 
        ? matchedDemo.name 
        : email.split('@')[0].replace('.', ' ').toUpperCase();

      const userObject: StoredUser = {
        id: `usr_${Date.now().toString(36)}`,
        name: userName,
        email: email,
        role: role,
        tenant: {
          id: 'tenant-flagship-01',
          name: 'Grand Atelier Flagship',
          code: 'GA-01',
        },
        loggedInAt: new Date().toISOString(),
      };

      // Mock auth store in localStorage
      localStorage.setItem('yh_auth_user', JSON.stringify(userObject));
      setActiveUser(userObject);
      setLoading(false);
      
      if (role === 'SYSTEM_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }, 600);
  };

  const handleQuickLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword('password123');
    setErrorMessage('');
    
    setLoading(true);
    setTimeout(() => {
      const userObject: StoredUser = {
        id: `usr_${Date.now().toString(36)}`,
        name: demo.name,
        email: demo.email,
        role: demo.role,
        tenant: {
          id: 'tenant-flagship-01',
          name: 'Grand Atelier Flagship',
          code: 'GA-01',
        },
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem('yh_auth_user', JSON.stringify(userObject));
      setActiveUser(userObject);
      setLoading(false);
      
      if (demo.role === 'SYSTEM_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }, 400);
  };

  const handleSignOut = () => {
    localStorage.removeItem('yh_auth_user');
    setActiveUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="space-y-6">
      {/* If User is already signed in, show Role Badge & Session Summary */}
      {activeUser ? (
        <div className="glass-card-gold rounded-2xl p-6 sm:p-8 space-y-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center font-bold text-lg shadow-lg">
                {activeUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{activeUser.name}</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </h2>
                <p className="text-xs text-slate-400">{activeUser.email}</p>
              </div>
            </div>
            {/* Role Badge */}
            <span className={getRoleBadgeClass(activeUser.role)}>
              {activeUser.role}
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                Tenant Atelier:
              </span>
              <span className="font-semibold text-slate-200">
                {activeUser.tenant.name} ({activeUser.tenant.code})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Assigned Role:</span>
              <span className="font-semibold text-yellow-400">{activeUser.role}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Session Status:</span>
              <span className="text-emerald-400 font-mono">ACTIVE_LOCAL_AUTH</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push('/')}
              className="btn-gold w-full flex items-center justify-center space-x-2 py-3"
            >
              <span>Go to Atelier Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="btn-ghost w-full flex items-center justify-center space-x-2 py-2.5 text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account / Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Sign In Card */
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight text-center">
              Sign In to Your Atelier
            </h2>
            <p className="text-xs text-slate-400 text-center mt-1.5">
              Enter your credentials to access YellowHouse Tailoring OS
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-rose-400 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
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
                  placeholder="master@yellowhouse.com"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to your registered atelier email.');
                  }}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500/30 accent-yellow-500"
                />
                <span>Remember me on this atelier workstation</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center space-x-2 py-3 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Quick Demo Sign In</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleQuickLogin(acc)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${acc.color} hover:brightness-110`}
                >
                  <span className="font-semibold text-slate-200">{acc.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link to Register */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an atelier account?{' '}
              <Link
                href="/register"
                className="font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-4 transition-colors"
              >
                Register Atelier Account
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
