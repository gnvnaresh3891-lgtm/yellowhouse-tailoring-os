'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ShoppingBag, 
  Cpu, 
  Package, 
  Award, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Compass, 
  ExternalLink 
} from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';

const MODULES = [
  {
    title: 'Digital Asset Warehouse',
    subtitle: 'Design as a Product',
    description: 'Explore, license, and download 3D fashion tech packs, blueprints, and digital silhouettes with instant SHA-256 license certificates.',
    href: '/redhouse/marketplace',
    icon: ShoppingBag,
    color: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    border: 'border-yellow-500/30 hover:border-yellow-500/60',
    iconColor: 'text-yellow-400',
    badge: 'Layer 1',
    stats: '64+ Blueprints'
  },
  {
    title: 'Workshop Equipment Sharing',
    subtitle: 'High-Tech Machinery Access',
    description: 'Hourly and daily rental booking for Mimaki digital textile printers, Lectra laser cutters, and Tajima multi-head embroidery machines.',
    href: '/redhouse/equipment',
    icon: Cpu,
    color: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    iconColor: 'text-blue-400',
    badge: 'Layer 2',
    stats: '12 Active Units'
  },
  {
    title: 'Vendor Material Sourcing',
    subtitle: 'Smart Fabric AI Recommender',
    description: 'Direct supplier catalogs for organic silk, velvet, and brocades with AI yield estimation and multi-factor budget recommendation.',
    href: '/redhouse/supply',
    icon: Package,
    color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconColor: 'text-emerald-400',
    badge: 'Layer 3',
    stats: '350+ Swatches'
  },
  {
    title: 'Production Bidding & Tailor Hub',
    subtitle: 'Artisan Specialization Network',
    description: 'Post custom design briefs, receive competitive bids from certified Master Tailors & Karigars, and manage 4-stage escrow contracts.',
    href: '/redhouse/bidding',
    icon: Award,
    color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    iconColor: 'text-indigo-400',
    badge: 'Layer 4',
    stats: '28 Master Artisans'
  },
  {
    title: 'Stylists & 3-Month Free Trial',
    subtitle: 'RedHouse OS Onboarding',
    description: 'Certified regional stylist directory across 9 fashion hubs, haute draping consultations, and 90-day trial onboarding tier.',
    href: '/redhouse/stylists',
    icon: Sparkles,
    color: 'from-rose-500/20 via-purple-500/10 to-transparent',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    iconColor: 'text-purple-400',
    badge: 'Layer 5',
    stats: '9 Regional Hubs'
  }
];

export default function RedHouseHubPage() {
  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-8 animate-fade-in pb-16">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'RedHouse OS', active: true }
        ]}
      />

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-500/30 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Fashion & Bespoke Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">RedHouse OS</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The next-generation modular fashion ecosystem designed for independent creators, ateliers, and manufacturers. Access digital blueprints, machine rentals, smart fabric sourcing, tailor bidding, and certified styling consultants.
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Escrow-backed Bidding</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> Instant Tech Pack Licensing</span>
            <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-rose-400" /> 5 Decoupled Layers</span>
          </div>
        </div>
      </div>

      {/* 5 Layer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`group glass-card rounded-2xl p-6 border ${mod.border} bg-gradient-to-b ${mod.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${mod.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                      {mod.stats}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {mod.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{mod.subtitle}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
                <span>Launch Layer</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
