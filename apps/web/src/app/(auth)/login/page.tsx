'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  LogOut,
  Sparkles,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const DEMO_PERSONAS = [
  {
    role: 'TENANT_OWNER',
    name: 'Latif Khan',
    email: 'owner@yellowhouse.com',
    label: 'Tenant Owner',
    badgeVariant: 'gold' as const,
  },
  {
    role: 'MASTER_TAILOR',
    name: 'Master Latif',
    email: 'master@yellowhouse.com',
    label: 'Master Tailor',
    badgeVariant: 'warning' as const,
  },
  {
    role: 'BRANCH_MANAGER',
    name: 'Sarah Jenkins',
    email: 'manager@yellowhouse.com',
    label: 'Branch Manager',
    badgeVariant: 'info' as const,
  },
  {
    role: 'KARIGAR',
    name: 'Rafi Craftsman',
    email: 'karigar@yellowhouse.com',
    label: 'Karigar Artisan',
    badgeVariant: 'neutral' as const,
  },
  {
    role: 'SYSTEM_ADMIN',
    name: 'Admin Director',
    email: 'admin@yellowhouse.com',
    label: 'System Admin',
    badgeVariant: 'gold' as const,
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
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
  const [activeUser, setActiveUser] = useState<StoredUser | null>(null);

  // Check for existing active session in localStorage on mount
  useEffect(() => {
    const savedUser = getLocalStorage<StoredUser | null>('yh_auth_user', null);
    if (savedUser) {
      setActiveUser(savedUser);
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
      const matchedDemo = DEMO_PERSONAS.find(
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

      setLocalStorage('yh_auth_user', userObject);
      setActiveUser(userObject);
      setLoading(false);

      if (role === 'SYSTEM_ADMIN' || role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }, 450);
  };

  const handleQuickLogin = (demo: typeof DEMO_PERSONAS[0]) => {
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

      setLocalStorage('yh_auth_user', userObject);
      setActiveUser(userObject);
      setLoading(false);
      if (demo.role === 'SYSTEM_ADMIN' || demo.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }, 350);
  };

  const handleSignOut = () => {
    removeLocalStorage('yh_auth_user');
    setActiveUser(null);
    setEmail('');
    setPassword('');
  };

  const getBadgeVariant = (role: string) => {
    switch (role) {
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
      {/* If User is already signed in, show Apple-grade Demo Session Status Card */}
      {activeUser ? (
        <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/40 shadow-ios-gold-lg space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-[#D4AF37]/40 text-yellow-400 flex items-center justify-center font-display font-bold text-base shadow-ios-sm">
                {activeUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-1.5 tracking-tight">
                  <span>{activeUser.name}</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </h2>
                <p className="text-xs text-slate-400 font-mono">{activeUser.email}</p>
              </div>
            </div>
            {/* Role Badge */}
            <Badge variant={getBadgeVariant(activeUser.role)} size="sm">
              {activeUser.role}
            </Badge>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs shadow-ios-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-yellow-400" />
                Tenant Atelier:
              </span>
              <span className="font-semibold text-slate-100">
                {activeUser.tenant.name} ({activeUser.tenant.code})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Assigned Role:</span>
              <span className="font-semibold text-yellow-400 font-mono">{activeUser.role}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Session Status:</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE_LOCAL_AUTH
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              variant="gold"
              size="lg"
              onClick={() => router.push('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full shadow-ios-gold"
            >
              Go to Atelier Dashboard
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="w-full text-slate-400 hover:text-white"
            >
              Switch Account / Sign Out
            </Button>
          </div>
        </Card>
      ) : (
        /* Sign In Card */
        <Card variant="glass" padding="lg" className="rounded-3xl shadow-ios-xl border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Sign In to Your Atelier
            </h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access YellowHouse Tailoring OS
            </p>
          </div>

          {errorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3 flex items-start space-x-2.5 text-rose-300 text-xs animate-fade-in shadow-ios-sm">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="master@yellowhouse.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 tracking-tight">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordMsg('Password reset link sent to your email.');
                    setTimeout(() => setForgotPasswordMsg(''), 3500);
                  }}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {forgotPasswordMsg && (
                <div className="text-emerald-400 text-[11px] text-right animate-fade-in font-medium">
                  {forgotPasswordMsg}
                </div>
              )}

              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-white/20 text-yellow-500 focus:ring-yellow-500/30 accent-yellow-500"
                />
                <span>Remember this atelier workstation</span>
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2 shadow-ios-gold"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Personas 1-Click Access */}
          <div className="pt-4 border-t border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>1-Click Demo Sandbox:</span>
              </span>
              <span className="text-[10px] text-slate-500">Instant test login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-yellow-400/40 text-[11px] font-medium transition-all text-left flex items-center justify-between"
                >
                  <span className="truncate">{demo.label}</span>
                  <ArrowRight className="w-3 h-3 text-yellow-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* New Atelier Registration CTA */}
          <div className="pt-3 border-t border-white/5 text-center text-xs text-slate-400 space-y-1.5">
            <div>
              Don't have an atelier workspace yet?{' '}
              <Link href="/onboarding" className="text-yellow-400 font-semibold hover:underline">
                Start Free Onboarding
              </Link>
            </div>
            <div>
              Need to create a team account?{' '}
              <Link
                href="/register"
                className="text-slate-300 font-semibold hover:text-yellow-300 underline underline-offset-4 transition-colors"
              >
                Register Atelier Account
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
