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
  ShoppingBag,
  UserPlus,
  Shield,
  LogOut,
  Briefcase,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/measurements', label: 'Measurements', icon: Ruler },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/production', label: 'Production', icon: Factory },
  { href: '/staff', label: 'Staff Management', icon: Briefcase },
  { href: '/onboarding', label: 'Onboarding', icon: UserPlus },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('yh_auth_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      // Redirect to login if not logged in
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('yh_auth_user');
    window.location.href = '/login';
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!currentUser) return false;
    
    // System admin only sees Admin Panel
    if (currentUser.role === 'SYSTEM_ADMIN') {
      return item.href === '/admin';
    }
    
    // Tenant users see everything except Admin Panel and Onboarding
    if (item.href === '/admin' || item.href === '/onboarding') {
      return false;
    }
    
    // Only boutique owners and managers see Staff Management
    if (item.href === '/staff') {
      return currentUser.role === 'TENANT_OWNER' || currentUser.role === 'BRANCH_MANAGER';
    }
    
    return true;
  });

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
          {currentUser && (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10 uppercase">
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentUser.role.replace('_', ' ')}
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

              {/* Search input (Ctrl+K placeholder) */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders, clients, measurements... (Ctrl+K)"
                  className="input-dark pl-10 pr-12 py-2 text-xs w-80 md:w-96"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/80 border border-slate-700/60 rounded">
                  Ctrl+K
                </kbd>
              </div>
            </div>

            {/* Right: Notifications & User Avatar */}
            <div className="flex items-center space-x-4">
              <button
                className="relative p-2.5 rounded-xl border border-slate-800/80 hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </button>

              {currentUser && (
                <>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/40 text-yellow-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-yellow-500/10 uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500">{currentUser.role.replace('_', ' ')}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area with padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
