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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-yellow-500/25 selection:text-yellow-200 antialiased">
      {/* Top Gold Gradient Hairline Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37]/60 via-[#E4BF64] to-[#C59B27]/60 fixed top-0 left-0 z-50 shadow-[0_0_20px_rgba(212,175,55,0.4)]" />

      {/* Decorative Ambient Lighting Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#D4AF37]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Main Content Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative z-10 w-full max-w-7xl mx-auto">
        {/* Apple-grade Centered Brand Header */}
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
          <Link href="/" className="group inline-flex flex-col items-center focus:outline-none">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-[#C59B27] p-0.5 shadow-ios-gold group-hover:scale-105 transition-transform duration-300 mb-3">
              <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
                <Scissors className="w-7 h-7 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-yellow-300 transition-colors">
                YellowHouse
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-[#D4AF37]/30 tracking-wider uppercase">
                OS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal flex items-center gap-1.5">
              <span>Enterprise Bespoke Tailoring Platform</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400/80" />
            </p>
          </Link>
        </div>

        {/* Page Content Container Card */}
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>

      {/* Apple-grade Translucent Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-500 relative z-10 bg-[#07090E]/60 backdrop-blur-md">
        <p className="tracking-tight">
          © 2026 YellowHouse Tailoring OS • Multi-tenant Atelier Management System
        </p>
      </footer>
    </div>
  );
}
