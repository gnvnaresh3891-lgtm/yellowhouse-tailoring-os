'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ShoppingBag,
  Shield,
  LogOut,
  Briefcase,
  Activity,
  Building2,
  Sparkles,
} from 'lucide-react';

import { filterNavItemsForRole, canUserAccessRoute, getFallbackRedirectRoute } from '@/lib/rbac-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';

import { CommandPalette, useCommandPalette } from '@/components/command-palette';
import { Breadcrumb } from '@/components/breadcrumb';
import { useToast } from '@/components/toast-context';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/components/currency-context';

const coreNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/measurements', label: 'Measurements', icon: Ruler },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/production', label: 'Production', icon: Factory },
  { href: '/staff', label: 'Staff Management', icon: Briefcase },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

const DEFAULT_DEMO_USER = {
  id: 'usr_owner_flagship',
  name: 'Latif Khan',
  email: 'owner@yellowhouse.com',
  role: 'TENANT_OWNER',
  tenant: {
    id: 'tenant-flagship-01',
    name: 'Grand Atelier Flagship',
    code: 'GA-01',
  },
  loggedInAt: new Date().toISOString(),
};

function getRelativeTime(timestamp: string) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(DEFAULT_DEMO_USER);

  const { currentCurrency, setCurrencyByCode } = useCurrency();
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currDropdownRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const { isOpen: cmdOpen, open: openCmd, close: closeCmd, toggle: toggleCmd } = useCommandPalette();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let user = getLocalStorage<any>('yh_auth_user', null);
    if (!user) {
      user = DEFAULT_DEMO_USER;
      setLocalStorage('yh_auth_user', user);
    }
    setCurrentUser(user);

    // Route Guard: enforce access control
    // Strictly preserve /admin passkey bypass: allow /admin to render its own internal Master Admin Passkey Gate on admin/page.tsx
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return;
    }

    if (user.role) {
      if (!canUserAccessRoute(user.role, pathname)) {
        const redirectPath = getFallbackRedirectRoute(user.role, pathname);
        if (redirectPath !== pathname) {
          router.push(redirectPath);
        }
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    const allActs = getLocalStorage<any[]>('yh_activities', []);
    setActivities(allActs.slice(0, 5));
  }, [notificationsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (currDropdownRef.current && !currDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCmd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCmd]);

  const handleLogout = () => {
    removeLocalStorage('yh_auth_user');
    toast.info('Signed out successfully');
    router.push('/login');
  };

  const activeUser = currentUser || DEFAULT_DEMO_USER;
  const userRole = activeUser.role || 'TENANT_OWNER';

  const filteredCoreNavItems = filterNavItemsForRole(coreNavItems, userRole);

  const unreadCount = activities.filter((a) => {
    if (!a.timestamp) return false;
    const timeDiff = Date.now() - new Date(a.timestamp).getTime();
    return timeDiff < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col lg:flex-row relative font-sans antialiased">
      <CommandPalette isOpen={cmdOpen} onClose={closeCmd} />

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* macOS-style Frosted Glass Sidebar (w-64) */}
      <aside
        className={`no-print fixed top-0 left-0 h-full w-64 bg-slate-950/75 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'translate-x-0 shadow-ios-xl' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-0`}
      >
        {/* Atelier Brand Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 group outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-[#C59B27] p-0.5 flex items-center justify-center shadow-ios-gold group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
                YellowHouse
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                <span>Atelier OS</span>
                <Sparkles className="w-2.5 h-2.5 text-yellow-400/70" />
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredCoreNavItems.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2.5 font-display">
                Core Operations
              </p>
              {filteredCoreNavItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? 'bg-yellow-500/15 text-yellow-300 font-semibold border border-yellow-500/25 shadow-[0_1px_10px_rgba(212,175,55,0.12)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-yellow-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {activeUser && (
            <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md shadow-ios-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-amber-600/20 border border-[#D4AF37]/40 text-yellow-300 font-bold flex items-center justify-center text-xs shadow-ios-gold uppercase shrink-0">
                {activeUser?.name
                  ? activeUser.name
                      .split(' ')
                      .map((w: string) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{activeUser.name}</p>
                <p className="text-[10px] text-yellow-400/90 font-medium truncate flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                  <span>{activeUser?.tenant?.name || 'Grand Atelier'}</span>
                </p>
                <p className="text-[9px] text-slate-500 truncate capitalize">
                  {typeof activeUser?.role === 'string'
                    ? activeUser.role.toLowerCase().replace(/_/g, ' ')
                    : 'User'}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Frosted Glass Topbar Header */}
        <header className="no-print sticky top-0 z-30 bg-[#07090E]/75 backdrop-blur-2xl border-b border-white/5 shadow-ios-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Mobile Toggle & Spotlight Search Trigger */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Apple Spotlight Search Trigger (Ctrl+K) */}
              <button
                type="button"
                onClick={openCmd}
                className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-400 text-xs w-72 lg:w-88 transition-all duration-200 shadow-ios-sm active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="flex-1 text-left truncate text-slate-400">Search atelier, orders, clients...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 rounded border border-white/10">
                  <span className="text-[9px]">⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Right: Currency Switcher, Notifications & Profile Badge */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Currency Switcher */}
              <div className="relative" ref={currDropdownRef}>
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#D4AF37]/40 bg-slate-900/60 hover:bg-slate-850/80 text-xs font-semibold text-slate-200 transition-all duration-200 shadow-ios-sm active:scale-[0.98] outline-none"
                  aria-label="Select Currency"
                >
                  <span className="text-sm leading-none">{currentCurrency.flag}</span>
                  <span className="text-yellow-400 font-bold">{currentCurrency.symbol}</span>
                  <span className="hidden sm:inline text-slate-300 font-mono text-[11px]">
                    {currentCurrency.code}
                  </span>
                  <ChevronRight
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      currencyDropdownOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>

                {/* Currency Dropdown Menu */}
                {currencyDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-[#D4AF37]/35 rounded-2xl shadow-ios-xl overflow-hidden z-50 p-2 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
                        Select Currency
                      </span>
                      <span className="text-[10px] text-yellow-400 font-mono">Live Conversion</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1 py-1 custom-scrollbar">
                      {SUPPORTED_CURRENCIES.map((curr) => {
                        const isSelected = curr.code === currentCurrency.code;
                        return (
                          <button
                            key={curr.code}
                            onClick={() => {
                              setCurrencyByCode(curr.code);
                              setCurrencyDropdownOpen(false);
                              toast.success(`Currency switched to ${curr.name} (${curr.symbol})`);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                              isSelected
                                ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-semibold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="text-base">{curr.flag}</span>
                              <div className="text-left">
                                <div className="font-medium text-slate-200">{curr.country}</div>
                                <div className="text-[10px] text-slate-400">{curr.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-yellow-400">
                                {curr.symbol} {curr.code}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Trigger */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2 rounded-full border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-850/80 text-slate-300 hover:text-white transition-all duration-200 shadow-ios-sm active:scale-[0.98]"
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-slate-950 text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2.5xl shadow-ios-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-200 font-display">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {activities.length > 0 ? (
                        <div className="flex flex-col divide-y divide-white/5">
                          {activities.map((act, i) => (
                            <div
                              key={i}
                              className="p-3.5 hover:bg-white/5 transition-colors flex gap-3"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-yellow-400 shadow-sm">
                                <Activity className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-300 truncate">
                                  {act.message || act.description || 'Activity recorded'}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {getRelativeTime(act.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill in Topbar */}
              {activeUser && (
                <div className="flex items-center space-x-2 bg-slate-900/60 pl-1.5 pr-3 py-1 rounded-full border border-white/10 shadow-ios-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-amber-600/20 border border-[#D4AF37]/40 text-yellow-300 font-bold flex items-center justify-center text-[10px] shadow-sm uppercase shrink-0">
                    {activeUser?.name
                      ? activeUser.name
                          .split(' ')
                          .map((w: string) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-slate-200">{activeUser.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb Navigation Bar */}
        <div className="no-print px-4 lg:px-8 py-2.5 border-b border-white/5 bg-[#07090E]/40 backdrop-blur-md">
          <Breadcrumb />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans">
          {children}
        </main>
      </div>
    </div>
  );
}
