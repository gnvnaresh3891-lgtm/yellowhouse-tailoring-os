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
  UserPlus,
  Shield,
  LogOut,
  Briefcase,
  Activity,
} from 'lucide-react';

import { filterNavItemsForRole, canUserAccessRoute, getFallbackRedirectRoute } from '@/lib/rbac-utils';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage-utils';

import { CommandPalette, useCommandPalette } from '@/components/command-palette';
import { Breadcrumb } from '@/components/breadcrumb';
import { useToast } from '@/components/toast-context';

const navItems = [
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
  
  const toast = useToast();
  const { isOpen: cmdOpen, open: openCmd, close: closeCmd, toggle: toggleCmd } = useCommandPalette();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    let user = getLocalStorage<any>('yh_auth_user', null);
    if (!user) {
      user = DEFAULT_DEMO_USER;
      setLocalStorage('yh_auth_user', user);
    }
    setCurrentUser(user);
    
    // Route Guard: enforce access control
    if (user.role) {
      if (!canUserAccessRoute(user.role, pathname)) {
        const redirectPath = getFallbackRedirectRoute(user.role, pathname);
        if (redirectPath !== pathname) {
          router.push(redirectPath);
        }
      }
    }
  }, [pathname, router]);

  React.useEffect(() => {
    const allActs = getLocalStorage<any[]>('yh_activities', []);
    setActivities(allActs.slice(0, 5));
  }, [notificationsOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
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
  const filteredNavItems = filterNavItemsForRole(navItems, activeUser.role || 'TENANT_OWNER');

  const unreadCount = activities.filter(a => {
    if (!a.timestamp) return false;
    const timeDiff = Date.now() - new Date(a.timestamp).getTime();
    return timeDiff < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col lg:flex-row relative">
      <CommandPalette isOpen={cmdOpen} onClose={closeCmd} />

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
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                YellowHouse Tailoring OS
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Enterprise Atelier</span>
            </div>
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
            Main Navigation
          </p>
          {filteredNavItems.map((item) => {
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

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {activeUser && (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10 uppercase">
                {activeUser?.name ? activeUser.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{activeUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {typeof activeUser?.role === 'string' ? activeUser.role.replace(/_/g, ' ') : 'User'}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Search input */}
              <div className="relative hidden md:block" onClick={openCmd}>
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search orders, clients, measurements... (Ctrl+K)"
                  className="input-dark pl-10 pr-12 py-2 text-xs w-80 md:w-96 cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            {/* Right: Notifications & User Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2.5 rounded-xl border border-slate-800/80 hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-slate-950 text-[10px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {activities.length > 0 ? (
                        <div className="flex flex-col">
                          {activities.map((act, i) => (
                            <div key={i} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors flex gap-3 last:border-0">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-yellow-400">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-300 truncate">{act.message || act.description || 'Activity recorded'}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{getRelativeTime(act.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeUser && (
                <>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10 uppercase">
                    {activeUser?.name ? activeUser.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-500">{typeof activeUser?.role === 'string' ? activeUser.role.replace(/_/g, ' ') : 'User'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-4 lg:px-8 py-2 border-b border-slate-800/40">
          <Breadcrumb />
        </div>

        {/* Main Content Area with padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
