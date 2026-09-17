'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, LayoutDashboard, ShoppingBag, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 animate-fade-in">
      <Card
        variant="glass"
        padding="lg"
        className="max-w-md w-full text-center space-y-6 shadow-ios-xl relative overflow-hidden border border-white/10"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Icon & 404 Badge */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2.5xl bg-amber-500/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-ios-gold">
            <Scissors className="w-8 h-8 rotate-45" />
          </div>
          <Badge variant="gold" size="sm" className="font-mono text-xs px-3 py-1">
            HTTP 404 • ROUTE UNRECOGNIZED
          </Badge>
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            Bespoke Silhouette Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
            The atelier pattern, client profile, or platform route you are searching for has been
            relocated, altered, or does not exist.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link href="/dashboard" className="block w-full">
            <Button
              variant="gold"
              size="md"
              className="w-full text-slate-950 font-bold gap-2 cursor-pointer shadow-ios-gold"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/redhouse/marketplace" className="block w-full">
            <Button
              variant="secondary"
              size="md"
              className="w-full text-slate-200 gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Digital Marketplace</span>
            </Button>
          </Link>
        </div>

        {/* Atelier Footer Note */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 font-mono">
          YellowHouse Tailoring OS • Navigation Engine
        </div>
      </Card>
    </div>
  );
}
