'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scissors, LayoutDashboard, Users, Ruler, Layers,
  Search, Bell, Menu, X, ChevronRight, LogOut, Settings
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/measurements', label: 'Measurements', icon: Ruler },
  { href: '/production', label: 'Production', icon: Layers },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-0`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-gold-500/20 animate-float">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">YellowHouse</h1>
              <p className="text-[10px] text-slate-400 font-medium">Tailoring OS</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] bg-gold-500/10 border border-gold-500/30 text-gold-400 px-2.5 py-1 rounded-full font-mono font-medium">
              Flagship Atelier
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-4 mb-3">Navigation</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item group ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold-500/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border border-gold-500/40 text-gold-400 font-bold flex items-center justify-center text-xs shadow-lg shadow-gold-500/10">
              ML
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Master Latif</p>
              <p className="text-[10px] text-slate-500">Head Atelier Master</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, clients, phone..."
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/40 w-72 transition-all"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 rounded-xl border border-slate-800/60 hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
              </button>
              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800/60">
                <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-400 font-bold flex items-center justify-center text-[10px]">
                  ML
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Master Latif</p>
                  <p className="text-[10px] text-slate-500">Atelier Master</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
