'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-yellow-500/30 selection:text-yellow-300">
      {/* Top Gold Gradient Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 fixed top-0 left-0 z-50 shadow-[0_0_20px_rgba(234,179,8,0.5)]" />

      {/* Decorative Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative z-10 w-full max-w-7xl mx-auto">
        {/* YellowHouse Tailoring OS Centered Logo Header */}
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
          <Link href="/" className="group inline-flex flex-col items-center focus:outline-none">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all duration-300 transform group-hover:scale-105 mb-3">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Scissors className="w-7 h-7 text-yellow-400 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                YellowHouse
              </h1>
              <span className="badge-gold text-xs px-2 py-0.5 uppercase tracking-wider font-mono font-semibold">
                OS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium flex items-center gap-1.5">
              <span>Enterprise Bespoke Tailoring Platform</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500/80" />
            </p>
          </Link>
        </div>

        {/* Page Content Container */}
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>

      {/* Auth Layout Footer */}
      <footer className="py-6 border-t border-slate-800/40 text-center text-xs text-slate-500 relative z-10 bg-[#0B0F19]/80 backdrop-blur-md">
        <p>© 2026 YellowHouse Tailoring OS • Multi-tenant Atelier Management System</p>
      </footer>
    </div>
  );
}
