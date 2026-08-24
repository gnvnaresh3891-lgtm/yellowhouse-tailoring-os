'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  ShoppingBag,
  Cpu,
  Package,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  Star,
  ChevronRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Layers,
  Users,
  Compass,
  FileCheck,
  Building,
  Check,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { REGISTERED_PLUGINS } from '@/lib/plugin-registry';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Pick or Upload Blueprint',
    desc: 'Choose from 64+ graded digital silhouettes and 3D tech packs, or upload your proprietary CAD drafts.',
    icon: ShoppingBag,
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  {
    step: '02',
    title: 'Source Fabric & Rent Machinery',
    desc: 'Match silk, velvet, or linen with AI smart budgeting and book industrial laser cutters or Tajima embroidery machines.',
    icon: Cpu,
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30'
  },
  {
    step: '03',
    title: 'BPO Artisan Tailor Bidding',
    desc: 'Post your design brief to verified Master Cutters & Karigars with 4-stage milestone escrow security.',
    icon: Award,
    color: 'from-rose-500/20 to-purple-500/10',
    border: 'border-rose-500/30'
  },
  {
    step: '04',
    title: 'Direct Doorstep Delivery',
    desc: 'Quality inspected, barcode tracked, and dispatched directly to your client or studio with guaranteed turnaround.',
    icon: Package,
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30'
  }
];

const METRICS = [
  { value: '64+', label: 'Digital 3D Blueprints', desc: 'Ready-to-cut tech packs' },
  { value: '12', label: 'Industrial Machines', desc: 'Printers, laser cutters & embroidery' },
  { value: '350+', label: 'Verified Fabric Swatches', desc: 'Pure silk, velvet & organic cotton' },
  { value: '28', label: 'Master Tailor Guilds', desc: 'Bespoke suit & zardozi karigars' },
  { value: '9', label: 'Regional Stylist Hubs', desc: 'On-demand haute consultations' }
];

const FAQS = [
  {
    q: 'What is RedHouse OS?',
    a: 'RedHouse OS is a comprehensive digital fashion ecosystem and tailoring infrastructure platform. It transforms fashion design from a slow bespoke service into scalable digital products, machine-sharing rental networks, intelligent material sourcing, and crowdsourced artisan manufacturing.'
  },
  {
    q: 'How does the hot-swappable plugin architecture work?',
    a: 'Every capability in RedHouse OS (Digital Assets, Machine Rentals, Fabric Sourcing, Tailor Bidding, Stylist Directory) exists as an independent plugin. You can toggle them on or off inside your atelier settings without altering your core boutique operations.'
  },
  {
    q: 'Can designers sell their tech packs and blueprints for passive income?',
    a: 'Yes! Designers upload graded 3D tech packs (.dxf, .clo3d, .pdf) with instant cryptographic SHA-256 licensing and receive 88% direct creator royalties on every sale.'
  },
  {
    q: 'How is tailor bidding and milestone escrow secured?',
    a: 'Orders are backed by a 4-stage smart milestone contract (20% foundation, 30% skeleton trial, 30% assembly/embroidery, 20% QC & dispatch). Funds are locked safely in escrow and released only upon your milestone approval.'
  },
  {
    q: 'Is there a free trial for emerging creators?',
    a: 'Yes, every new studio receives 90-day RedHouse OS Free Trial access with blueprint exports, 15% consultation discounts, and tailor bidding access.'
  }
];

export default function RedHouseStandaloneLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-rose-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-rose-600/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-t from-amber-600/10 via-rose-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. STANDALONE TOP NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090E]/85 border-b border-rose-500/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO */}
            <Link href="/redhouse-os" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-400 transform group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                  RedHouse OS
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-400/90 -mt-1">
                  Digital Fashion Ecosystem
                </span>
              </div>
            </Link>

            {/* NAV LINKS (DESKTOP) */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-300">
              <a href="#plugins" className="hover:text-rose-400 transition-colors">
                Plugins & Layers
              </a>
              <a href="#how-it-works" className="hover:text-rose-400 transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-rose-400 transition-colors">
                Capabilities
              </a>
              <a href="#faqs" className="hover:text-rose-400 transition-colors">
                FAQs
              </a>
              <Link href="/" className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900/90 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 transition-colors">
                &larr; Switch to YellowHouse OS
              </Link>
            </nav>

            {/* ACTION BUTTONS (DESKTOP) */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login" className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/redhouse"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-extrabold shadow-lg shadow-rose-600/25 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <span>Launch Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-rose-500/20 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            <a
              href="#plugins"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 hover:text-rose-400"
            >
              Plugins & Layers
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 hover:text-rose-400"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 hover:text-rose-400"
            >
              Capabilities
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 hover:text-rose-400"
            >
              FAQs
            </a>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-yellow-400"
            >
              Switch to YellowHouse OS
            </Link>
            <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
              <Link href="/redhouse" className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow-lg">
                Launch Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* BADGE */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold mb-8 shadow-xl shadow-rose-500/10 animate-fade-in">
            <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>The Open Digital Fashion & On-Demand Tailoring Infrastructure</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6">
            Turn Fashion Design into a{' '}
            <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              Scalable Digital Product
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A modular plug-and-play operating system for independent creators, ateliers, and manufacturers. Access 3D blueprints, rent high-tech machinery, source organic fabrics, and crowdsource master tailoring.
          </p>

          {/* HERO CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/redhouse"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-base flex items-center justify-center space-x-3 shadow-2xl shadow-rose-600/30 transition-all hover:scale-105"
            >
              <span>Explore RedHouse Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/redhouse/marketplace"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-base flex items-center justify-center space-x-2 border border-slate-800 transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-rose-400" />
              <span>Browse 3D Tech Packs</span>
            </Link>
          </div>

          {/* METRIC PILLS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto pt-6 border-t border-slate-900">
            {METRICS.map((m) => (
              <div key={m.label} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">{m.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PLUGINS & 5 ECOSYSTEM LAYERS */}
      {/* ========================================================================= */}
      <section id="plugins" className="py-20 md:py-28 relative bg-[#090C14] border-y border-rose-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Hot-Swappable Plugin Layers
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              5 Independent Powerhouse Modules
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Each layer functions as an independent, sandboxed plugin. Use them individually or together to supercharge your atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Plugin 1 */}
            <div className="glass-card rounded-3xl p-7 border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 via-slate-900/40 to-slate-950 flex flex-col justify-between hover:border-yellow-500/60 transition-all hover:scale-[1.02] shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-yellow-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                    Layer 1 Plugin
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Digital Asset Warehouse</h3>
                  <p className="text-xs font-semibold text-yellow-400 mt-0.5">Design as a Product</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sell blueprints to hundreds of clients worldwide. Fixed pricing, instant licensing, 3D tech packs (.dxf, .clo3d, .pdf), and 88% direct creator royalties.
                </p>
                <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">SHA-256 Certificates</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Commercial Buyout</span>
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  href="/redhouse/marketplace"
                  className="w-full py-2.5 px-4 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Launch Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Plugin 2 */}
            <div className="glass-card rounded-3xl p-7 border border-blue-500/30 bg-gradient-to-b from-blue-500/10 via-slate-900/40 to-slate-950 flex flex-col justify-between hover:border-blue-500/60 transition-all hover:scale-[1.02] shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-blue-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Layer 2 Plugin
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Workshop Equipment Sharing</h3>
                  <p className="text-xs font-semibold text-blue-400 mt-0.5">High-Tech Machine Rental</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hourly and daily rentals for industrial Mimaki digital textile printers, Lectra CNC laser cutters, and Tajima multi-head embroidery machines with 30-min collision buffers.
                </p>
                <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Operator Support</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Collision Avoidance</span>
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  href="/redhouse/equipment"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Rent Machinery</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Plugin 3 */}
            <div className="glass-card rounded-3xl p-7 border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-900/40 to-slate-950 flex flex-col justify-between hover:border-emerald-500/60 transition-all hover:scale-[1.02] shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-emerald-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Layer 3 Plugin
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Vendor Material Sourcing</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">Smart Fabric AI Matcher</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct vendor catalogs for organic silk, velvet, brocade, and linings. Multi-factor AI recommender evaluating drape weight (45%), budget (40%), and vendor rating (15%).
                </p>
                <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Tier Discounts</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">AI Yield Calc</span>
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  href="/redhouse/supply"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Source Materials</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Plugin 4 */}
            <div className="glass-card rounded-3xl p-7 border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-slate-900/40 to-slate-950 flex flex-col justify-between hover:border-indigo-500/60 transition-all hover:scale-[1.02] shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-indigo-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Layer 4 Plugin
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Production Bidding Network</h3>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5">Artisan Specialization BPO</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post custom design briefs and receive competitive bids from verified Master Tailors & Karigars. Includes 4-stage milestone escrow payment protection.
                </p>
                <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">4-Stage Escrow</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Zardozi & Tuxedos</span>
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  href="/redhouse/bidding"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Submit Brief & Bid</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Plugin 5 */}
            <div className="glass-card rounded-3xl p-7 border border-rose-500/30 bg-gradient-to-b from-rose-500/10 via-slate-900/40 to-slate-950 flex flex-col justify-between hover:border-rose-500/60 transition-all hover:scale-[1.02] shadow-xl md:col-span-2 lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-rose-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Layer 5 Plugin
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Stylists & 3-Month Free Onboarding</h3>
                  <p className="text-xs font-semibold text-rose-400 mt-0.5">Certified Regional Draping & Styling</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Book direct 1-on-1 consultations with certified bridal trousseau consultants, haute draping architects, and hair/makeup specialists across 9 major fashion hubs.
                </p>
                <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">90-Day Free Trial</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">DPI Export Controls</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">9 Regional Hubs</span>
                </div>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/80">
                <Link
                  href="/redhouse/stylists"
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span>Book Stylist & Start 90-Day Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Streamlined Flow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              From Concept to Finished Garment
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              A frictionless 4-step execution pipeline bringing transparency to modern tailoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className={`p-6 rounded-3xl bg-gradient-to-b ${s.color} border ${s.border} backdrop-blur-xl relative overflow-hidden space-y-4 shadow-lg`}
                >
                  <div className="text-4xl font-black text-white/20 font-mono">
                    {s.step}
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white w-fit">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FAQS SECTION */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-20 md:py-28 relative bg-[#090C14] border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Answers & Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-slate-950/70 border border-slate-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-200 text-sm sm:text-base flex items-center justify-between hover:text-rose-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-rose-400 transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-900 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION & FOOTER */}
      {/* ========================================================================= */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-950 border-t border-rose-500/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Build on <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">RedHouse OS</span>?
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Launch your digital fashion products, book precision machinery, and manage artisan contracts in one unified workspace.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/redhouse"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-base shadow-2xl flex items-center space-x-2"
            >
              <span>Launch Plugin Marketplace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05070A] border-t border-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 RedHouse OS. Open Digital Fashion & Tailoring Ecosystem.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-yellow-400 transition-colors">
              YellowHouse Atelier OS
            </Link>
            <Link href="/redhouse" className="hover:text-rose-400 transition-colors">
              Plugin Registry
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Studio Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
