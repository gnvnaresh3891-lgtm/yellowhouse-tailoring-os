'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  Ruler,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Star,
  Menu,
  X,
  Sliders,
  Check,
  ChevronLeft,
  Eye,
  ShoppingBag,
  Cpu,
  Package,
  Award,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LandmarkData {
  id: string;
  name: string;
  cx: number;
  cy: number;
  baseVal: number;
  unit: string;
  delta: string;
  description: string;
}

const LANDMARKS: LandmarkData[] = [
  {
    id: 'chest',
    name: 'Chest / Bust Circumference',
    cx: 200,
    cy: 160,
    baseVal: 42.5,
    unit: 'in',
    delta: '+0.75 in (Stooped Shoulder Compensation)',
    description: 'Calculates standard scye circumference with posture-adapted back width ease.'
  },
  {
    id: 'shoulder',
    name: 'Shoulder Slope & Incline',
    cx: 200,
    cy: 110,
    baseVal: 18.25,
    unit: 'in',
    delta: '-0.25 in Left Asymmetrical Drop',
    description: 'Dynamic shoulder angle offset compensation for precise collar hugging.'
  },
  {
    id: 'waist',
    name: 'Natural Waist & Prominence',
    cx: 200,
    cy: 230,
    baseVal: 36.0,
    unit: 'in',
    delta: '+0.50 in Seated Comfort Ease',
    description: 'Middle body drop ratio mapped against jacket buttoning point.'
  },
  {
    id: 'sleeve',
    name: 'Sleeve Length & Crown Pitch',
    cx: 125,
    cy: 210,
    baseVal: 25.5,
    unit: 'in',
    delta: 'Pitch Rotated +2.5° Forward',
    description: 'Armhole pitch alignment calculated from shoulder blade profile.'
  },
  {
    id: 'inseam',
    name: 'Trouser Inseam & Rise',
    cx: 175,
    cy: 350,
    baseVal: 31.75,
    unit: 'in',
    delta: 'Standard Half Break Allowance',
    description: 'Crotch depth to ankle hem measurement snapshot.'
  }
];

const TESTIMONIALS = [
  {
    quote: "YellowHouse transformed our atelier workflow. The posture delta compensation alone reduced our client fitting alterations by 42% in our Savile Row workshop.",
    author: "Alistair Vance",
    role: "Master Cutter & Senior Partner",
    atelier: "Vance & Son Tailors, Savile Row (London)",
    rating: 5,
    badge: "Savile Row Partner"
  },
  {
    quote: "Managing our 4 flagship heritage stores across Mumbai, Delhi & Jaipur was complex before YellowHouse. Karigar piece-rate tracking and fabric yield calculation are now automated on one OS.",
    author: "Vikramjit Singh",
    role: "Founder & Creative Director",
    atelier: "Royal Heritage Sherwani Atelier (New Delhi)",
    rating: 5,
    badge: "Indian Heritage Couture"
  },
  {
    quote: "The SVG pattern landmark viewer gives our master cutters precise measurement variations on iPad screens right at the cutting table. Truly indispensable engineering.",
    author: "Elena Rossi",
    role: "Chef d'Atelier",
    atelier: "Milano Su Misura House (Milan)",
    rating: 5,
    badge: "Italian Bespoke House"
  }
];

const FAQS = [
  {
    question: "How does the CAD Measurement Engine handle asymmetric client body postures?",
    answer: "Our CAD engine utilizes dynamic SVG landmark hotspots with posture delta compensation. It records baseline body measurements alongside specific posture offsets (such as stooped shoulders, high hip, or prominent blades), automatically recalculating pattern armhole depth, scye pitch, and back width snap-lines."
  },
  {
    question: "Can Karigars (craftsmen) access the production board easily on mobile devices?",
    answer: "Yes! The Karigar Production Board is optimized for touch tablets and mobile smartphones. Karigars can scan barcode tags, track Standard Allowed Minutes (SAM), log stage completions (Cutting, Canvas Stitches, Sleeve Setting, Buttonholes), and view real-time piece-rate earnings in multi-language interfaces."
  },
  {
    question: "How does multi-tenant branch synchronization work for multi-boutique brands?",
    answer: "YellowHouse OS acts as a unified multi-tenant platform. Global admins can oversee measurement templates, pricing catalogs, fabric inventory, and revenue metrics across 1 to 50+ branches while allowing branch managers localized control over client fittings and karigar assignments."
  },
  {
    question: "Is automated client communication included for fitting reminders?",
    answer: "All subscription tiers include integrated WhatsApp & SMS status triggers. When an order transitions on the Kanban board to 'First Fitting Ready' or 'Final Hand Finishing', clients receive automated branded notifications with fitting calendar links."
  },
  {
    question: "Can we import our historical client measurement cards into YellowHouse OS?",
    answer: "Absolutely. Our onboarding suite provides automated CSV/Excel imports, bulk POM template builders, and AI-assisted digitizing tools to convert paper measurement logbooks into encrypted cloud snapshot profiles."
  }
];

export default function MarketingLandingPage() {
  const router = useRouter();

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);
  const [activeLandmark, setActiveLandmark] = useState<LandmarkData>(LANDMARKS[0]);
  const [postureCompensation, setPostureCompensation] = useState<string>('Stooped');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Karigar Calculator State
  const [suitCount, setSuitCount] = useState<number>(8);
  const [fabricLengthPerSuit, setFabricLengthPerSuit] = useState<number>(3.3);

  // Derived Karigar values
  const totalFabricMeters = (suitCount * fabricLengthPerSuit).toFixed(1);
  const fabricEfficiency = Math.min(98.5, parseFloat((92.4 + (suitCount * 0.4)).toFixed(1)));
  const estimatedSAMHours = (suitCount * 14.5).toFixed(1);
  const karigarPayoutINR = (suitCount * 4200).toLocaleString('en-IN');

  const handlePlanChoice = (plan: string) => {
    router.push(`/onboarding?plan=${plan}`);
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* LUXURY BACKGROUND GRADIENT LIGHTING */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-amber-500/15 via-yellow-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-t from-purple-900/10 via-amber-950/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090E]/90 border-b border-amber-500/15 transition-all duration-300 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO WITH GOLD EMBLEM */}
            <Link href="/" className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#0A0D16] rounded-[14px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-amber-400 transform group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  YellowHouse
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400/90 -mt-1">
                  Atelier OS
                </span>
              </div>
            </Link>

            {/* NAVIGATION LINKS (DESKTOP) */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
              <a href="#features" className="hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#cad-engine" className="hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                <span>CAD Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/10 text-amber-300 border border-amber-400/30">v4.2</span>
              </a>
              <Link href="/redhouse-os" className="hover:text-rose-400 transition-colors flex items-center space-x-1.5">
                <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent font-bold">Stitchly Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">B2C</span>
              </Link>
              <a href="#pricing" className="hover:text-amber-400 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="hover:text-amber-400 transition-colors">
                Ateliers
              </a>
              <a href="#faqs" className="hover:text-amber-400 transition-colors">
                FAQs
              </a>
            </nav>

            {/* ACTION BUTTONS (DESKTOP) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 font-semibold text-xs transition-colors">
                Log In
              </Link>
              <Link href="/onboarding" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105">
                <span>Start Free Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* MOBILE MENU TRIGGER */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-2 pb-6 space-y-4 animate-fade-in">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300 pt-2">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-yellow-400"
              >
                Core Features
              </a>
              <a
                href="#cad-engine"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-yellow-400 flex items-center justify-between"
              >
                <span>CAD Engine</span>
                <span className="badge badge-gold">v4.2</span>
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-yellow-400"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-yellow-400"
              >
                Ateliers
              </a>
              <a
                href="#faqs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800/60 hover:text-yellow-400"
              >
                FAQs
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-800 flex flex-col space-y-3">
              <Link href="/login" className="btn-ghost text-center w-full">
                Log In
              </Link>
              <Link href="/onboarding" className="btn-gold text-center w-full justify-center flex items-center space-x-2">
                <span>Start Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* BADGE ANNOUNCEMENT */}
          <div className="inline-flex items-center space-x-2 badge badge-gold px-3.5 py-1.5 rounded-full mb-8 shadow-lg shadow-yellow-500/10 cursor-default animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-yellow-300">
              Next-Gen Garment CAD & Karigar Yield Engine v4.2 Live
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
          </div>

          {/* MAIN HEADING */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            The Garment Engineering Platform for{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Bespoke Ateliers
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Automate measurements, calculate yields, track Karigars, and manage multi-tenant boutiques on a unified operating system.
          </p>

          {/* HERO CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => handlePlanChoice('starter')}
              className="btn-gold w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center space-x-3 shadow-xl shadow-yellow-500/25 transition-transform hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/redhouse-os"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-rose-600/20 via-purple-600/20 to-amber-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-rose-400" />
              <span>Stitchly Consumer Portal</span>
            </Link>
            <a
              href="#cad-engine"
              className="btn-ghost w-full sm:w-auto px-8 py-4 text-base font-semibold flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5 text-slate-400" />
              <span>Interactive CAD Demo</span>
            </a>
          </div>

          {/* VISUAL ATELIER PREVIEW STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden h-40 border border-amber-500/30 shadow-2xl group bg-[#0A0D16]">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
                alt="Bespoke Master Suiting"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Master Cutting</span>
                <div className="text-xs font-bold text-white">Savile Row & Bespoke Suiting</div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-40 border border-amber-500/30 shadow-2xl group bg-[#0A0D16]">
              <img
                src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80"
                alt="Haute Couture Drapes"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Haute Couture</span>
                <div className="text-xs font-bold text-white">Bridal Maggam & Draped Silks</div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-40 border border-amber-500/30 shadow-2xl group bg-[#0A0D16]">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Fabric Materials"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Material Science</span>
                <div className="text-xs font-bold text-white">Super 150s & Cashmere Wefts</div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-40 border border-amber-500/30 shadow-2xl group bg-[#0A0D16]">
              <img
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80"
                alt="Artisan Craftsmanship"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Artisan Craft</span>
                <div className="text-xs font-bold text-white">Hand-Stitched Canvas & Lapels</div>
              </div>
            </div>
          </div>

          {/* LIVE SYSTEM STATUS BAR */}
          <div className="glass-card max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Status</div>
                <div className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Savile Row & Global Multi-Branch Engine Active</span>
                  <span className="badge badge-emerald">99.99% Uptime</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-slate-400">Active Karigars</div>
                <div className="text-lg font-extrabold text-yellow-400">1,420+</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400">Fittings Snapshot</div>
                <div className="text-lg font-extrabold text-white">48,500+</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-xs text-slate-400">Fabric Yield Gain</div>
                <div className="text-lg font-extrabold text-emerald-400">+14.2%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLO3D INTERACTIVE 3D/2D GARMENT SIMULATION ENGINE */}
      <section id="cad-engine" className="py-20 md:py-28 bg-[#05070B] border-y border-amber-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider mb-4">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>CLO3D-Style Garment Physics & Pattern Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Interactive <span className="bg-gradient-to-r from-cyan-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">3D Digital Avatar</span> & Pattern CAD
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Real-time parametric cloth simulation, fabric tension heatmap strain analysis, and dynamic 2D DXF pattern sync directly on the cutting table.
            </p>
          </div>

          {/* CLO3D WORKBENCH INTERFACE */}
          <div className="rounded-3xl border border-amber-500/30 bg-[#0A0D16] shadow-2xl overflow-hidden">
            {/* WORKSTATION TOP CONTROL BAR */}
            <div className="bg-[#0D111D] px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 border-l border-slate-800 pl-4">
                  YellowHouse CLO-Engine // Workspace: <span className="text-amber-400">Bespoke_Sherwani_Tux_v4.2.zprj</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Physics: 60 FPS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300">
                  Strain Map: Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* 3D AVATAR SIMULATOR VIEWPORT (LEFT SIDE) */}
              <div className="lg:col-span-7 p-6 sm:p-8 bg-[#07090E] border-r border-slate-800 relative flex flex-col items-center justify-center min-h-[500px]">
                {/* Viewport Floating Controls */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300">
                    3D Simulation Viewport
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-extrabold text-amber-300">
                    {postureCompensation} Silhouette
                  </span>
                </div>

                {/* CLO3D HIGH-TECH INTERACTIVE SVG AVATAR & 3D WIREFRAME */}
                <div className="relative w-full max-w-md h-[460px] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 400 460" className="w-full h-full relative z-10 filter drop-shadow-2xl">
                    <defs>
                      <radialGradient id="mesh-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="fabric-silk" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#334155" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                      </linearGradient>
                      <pattern id="wireframe-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#0284C7" strokeWidth="0.5" strokeOpacity="0.3" />
                      </pattern>
                    </defs>

                    {/* Radial Atmosphere Glow */}
                    <circle cx="200" cy="230" r="180" fill="url(#mesh-glow)" />

                    {/* 3D Wireframe Silhouette Mesh */}
                    <g className="fill-[url(#fabric-silk)] stroke-[#0284C7] stroke-[1.2]">
                      {/* Avatar Head / Collar Mount */}
                      <ellipse cx="200" cy="45" rx="26" ry="32" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
                      {/* Torso Garment Form with 3D Contour Curves */}
                      <path d="M 174 52 C 145 60, 115 80, 105 105 C 95 130, 92 180, 94 230 C 96 290, 102 340, 110 390 C 130 400, 180 405, 200 405 C 220 405, 270 400, 290 390 C 298 340, 304 290, 306 230 C 308 180, 305 130, 295 105 C 285 80, 255 60, 226 52 Z" />
                      {/* Left Sleeve Drape */}
                      <path d="M 105 105 C 80 140, 65 200, 58 280 C 72 286, 92 284, 98 276 C 105 210, 115 160, 125 125 Z" opacity="0.85" />
                      {/* Right Sleeve Drape */}
                      <path d="M 295 105 C 320 140, 335 200, 342 280 C 328 286, 308 284, 302 276 C 295 210, 285 160, 275 125 Z" opacity="0.85" />
                    </g>

                    {/* CLO3D 3D CONTOUR TOPOLOGY ISOLINES */}
                    <g stroke="#38BDF8" strokeWidth="0.8" opacity="0.4" fill="none">
                      <path d="M 120 120 Q 200 145 280 120" />
                      <path d="M 112 165 Q 200 195 288 165" />
                      <path d="M 108 215 Q 200 245 292 215" />
                      <path d="M 106 265 Q 200 295 294 265" />
                      <path d="M 108 315 Q 200 340 292 315" />
                      <path d="M 110 365 Q 200 385 290 365" />
                      {/* Vertical Seam Line */}
                      <line x1="200" y1="52" x2="200" y2="405" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
                    </g>

                    {/* FABRIC STRAIN / TENSION HEATMAP OVERLAY */}
                    <g opacity="0.6">
                      {/* Shoulder tension (High strain zone) */}
                      <ellipse cx="140" cy="95" rx="20" ry="12" fill="#EF4444" filter="blur(8px)" opacity="0.5" />
                      <ellipse cx="260" cy="95" rx="20" ry="12" fill="#EF4444" filter="blur(8px)" opacity="0.5" />
                      {/* Waist comfort ease (Optimal tension green zone) */}
                      <ellipse cx="200" cy="235" rx="55" ry="18" fill="#10B981" filter="blur(10px)" opacity="0.4" />
                    </g>

                    {/* DYNAMIC LANDMARK HOTSPOTS */}
                    {LANDMARKS.map((lm) => {
                      const isSelected = activeLandmark.id === lm.id;
                      const r = 7;
                      return (
                        <g
                          key={lm.id}
                          className="cursor-pointer transition-all duration-300"
                          onClick={() => setActiveLandmark(lm)}
                        >
                          <circle cx={lm.cx} cy={lm.cy} r={r + 14} fill="transparent" />
                          {isSelected && (
                            <circle cx={lm.cx} cy={lm.cy} r={r + 8} fill="none" stroke="#F59E0B" strokeWidth="2">
                              <animate attributeName="r" values={`${r + 4};${r + 18};${r + 4}`} dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle
                            cx={lm.cx}
                            cy={lm.cy}
                            r={isSelected ? r + 3 : r}
                            className={isSelected ? 'fill-amber-400 stroke-white' : 'fill-cyan-400 stroke-slate-900'}
                            strokeWidth="2"
                          />
                          <text
                            x={lm.cx + (lm.cx > 200 ? 18 : -18)}
                            y={lm.cy + 4}
                            textAnchor={lm.cx > 200 ? 'start' : 'end'}
                            className={`text-[11px] font-mono font-extrabold ${isSelected ? 'fill-amber-400' : 'fill-cyan-300'}`}
                          >
                            {lm.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* 3D HUD Tooltips */}
                  <div className="absolute bottom-3 left-3 bg-[#0A0D16]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/30 text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CLO-Tension: <strong className="text-white">Optimal 14.2 kPa</strong></span>
                  </div>
                </div>
              </div>

              {/* 2D PATTERN & POSTURE PARAMETER CONTROLS (RIGHT SIDE) */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-[#0A0D16]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Parametric Point of Measurement</span>
                      <h3 className="text-xl font-extrabold text-white">{activeLandmark.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                      ID: #{activeLandmark.id.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeLandmark.description}
                  </p>

                  {/* MEASUREMENT READOUTS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#07090E] p-3.5 rounded-xl border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-semibold">Net Body Circumference</div>
                      <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                        {activeLandmark.baseVal} <span className="text-xs font-normal text-slate-400">{activeLandmark.unit}</span>
                      </div>
                    </div>

                    <div className="bg-[#07090E] p-3.5 rounded-xl border border-amber-500/30">
                      <div className="text-[11px] text-amber-400 font-semibold">Posture Compensation</div>
                      <div className="text-xs font-bold text-amber-300 mt-2 leading-tight">
                        {activeLandmark.delta}
                      </div>
                    </div>
                  </div>

                  {/* POSTURE PRESET SWITCHER */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Avatar Spine & Posture Morph:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Standard Erect', 'Stooped', 'High Shoulder', 'Hollow Back'].map((pst) => (
                        <button
                          key={pst}
                          onClick={() => setPostureCompensation(pst)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            postureCompensation === pst
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {pst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WORKFLOW SYNC STATUS */}
                <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-2xl flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-extrabold text-white">DXF/AAMA Pattern Sync Active</div>
                    <div className="text-slate-400 mt-0.5">3D draping variations automatically recalculate 2D cutting table yields in real-time.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID (3 COLUMNS REQUIREMENT) */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="badge badge-gold mb-3 inline-block">Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Engineered for Modern Bespoke Operations
            </h2>
            <p className="text-slate-300 text-lg">
              Three core pillars built from the cutting table up to empower cutters, karigars, and atelier owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FEATURE 1: CAD MEASUREMENT ENGINE */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between hover:border-yellow-500/40 transition-all duration-300 group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 text-yellow-400 flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <Scissors className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="badge badge-gold">Garment CAD</span>
                  <span className="badge badge-blue font-mono">2D SVG</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                  CAD Measurement Engine
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Interactive SVG hotspots, version snapshots, posture delta compensation, dynamic ease calculations, and asymmetrical shoulder mapping.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>SVG Hotspot visual landmark pinning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Historical version snapshots & fit logs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Asymmetrical posture delta compensation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Instant PDF client measurement cards</span>
                  </li>
                </ul>
              </div>

              <a href="#cad-engine" className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>Explore CAD Capabilities</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* FEATURE 2: KARIGAR PRODUCTION BOARD */}
            <div className="glass-card-gold rounded-2xl p-8 border border-slate-800 flex flex-col justify-between hover:border-yellow-500/50 transition-all duration-300 group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 text-yellow-400 flex items-center justify-center mb-6 border border-yellow-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="badge badge-amber">Workshop Board</span>
                  <span className="badge badge-emerald">SAM Tracking</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                  Karigar Production Board
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Piece-rate earnings, SAM time tracking, Kanban control, stage-by-stage artisan allocations, and automated payout accounting.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Real-time Piece-Rate earnings calculation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>SAM (Standard Allowed Minutes) time tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Interactive Kanban drag & drop control</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Touchscreen Karigar tablet support</span>
                  </li>
                </ul>
              </div>

              <a href="#calculator" className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>View Workshop Kanban</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* FEATURE 3: MULTI-TENANT ADMIN CONTROL */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between hover:border-yellow-500/40 transition-all duration-300 group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="badge badge-blue">Multi-Tenant</span>
                  <span className="badge badge-gold">Global Metrics</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                  Multi-Tenant Admin Control
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Global metrics, subscription tier billing, branch synchronization, fabric inventory, and role-based permissions across boutiques.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Multi-branch inventory & order sync</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Subscription tier & usage metrics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Granular RBAC access controls</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Centralized financial analytics</span>
                  </li>
                </ul>
              </div>

              <a href="#pricing" className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>Enterprise Multi-Branch Specs</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETITOR COMPARISON GRID SECTION */}
      <section className="py-16 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="badge badge-gold">Market Comparison</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Premier Ateliers Choose YellowHouse OS
            </h2>
            <p className="text-slate-400 text-sm">
              How we compare against legacy tailoring systems (Sunrise Software, Atelierware, Garment Desk).
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-5 px-6">Core Operational Vectors</th>
                    <th className="py-5 px-4 text-center text-yellow-400 font-extrabold bg-yellow-500/5 border-x border-yellow-500/20">YellowHouse Tailoring OS</th>
                    <th className="py-5 px-4 text-center">Legacy ERP (Sunrise / Atelierware)</th>
                    <th className="py-5 px-4 text-center">Order Trackers (Garment Desk)</th>
                    <th className="py-5 px-4 text-center">Mobile Books (TailorWale)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>CAD Body Landmark Engine</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Interactive SVG posture & point-of-measurement mappings</div>
                    </td>
                    <td className="py-4 px-4 text-center bg-yellow-500/5 border-x border-yellow-500/20">
                      <span className="text-yellow-400 font-extrabold">✓ Fully Integrated (v4.2)</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Text-Only Inputs</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ No Measurement Tools</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Static Notes Only</td>
                  </tr>
                  
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>Dynamic Posture Compensation</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Auto-corrects ease based on Stooped/Erect/Swayback profile</div>
                    </td>
                    <td className="py-4 px-4 text-center bg-yellow-500/5 border-x border-yellow-500/20">
                      <span className="text-yellow-400 font-extrabold">✓ Real-time Math Engine</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Manual Calculation</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Not Supported</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Not Supported</td>
                  </tr>

                  <tr className="hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>Karigar Piece-Rate Ledger</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Automated SAM (Standard Allowed Minutes) payout formulas</div>
                    </td>
                    <td className="py-4 px-4 text-center bg-yellow-500/5 border-x border-yellow-500/20">
                      <span className="text-yellow-400 font-extrabold">✓ Dynamic Ledger</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-300">✓ Barcode-Only Scan</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Manual Payroll</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Not Supported</td>
                  </tr>

                  <tr className="hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>WhatsApp Fitting delta checks</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Client trial confirmations and advance deposit link billing</div>
                    </td>
                    <td className="py-4 px-4 text-center bg-yellow-500/5 border-x border-yellow-500/20">
                      <span className="text-yellow-400 font-extrabold">✓ Native Alerts (91% Conv.)</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Basic SMS Alerts</td>
                    <td className="py-4 px-4 text-center text-slate-300">✓ CRM Notifications</td>
                    <td className="py-4 px-4 text-center text-slate-300">✓ Simple Alerts</td>
                  </tr>

                  <tr className="hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>Multi-Tenant Boutique Scaling</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Decoupled branch management with centralized platform billing</div>
                    </td>
                    <td className="py-4 px-4 text-center bg-yellow-500/5 border-x border-yellow-500/20">
                      <span className="text-yellow-400 font-extrabold">✓ Enterprise SaaS Architecture</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Single DB Installations</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ No Multi-Branch Isolation</td>
                    <td className="py-4 px-4 text-center text-slate-500">✗ Local Mobile Device Lock</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* KARIGAR SAM & FABRIC YIELD CALCULATOR PREVIEW WIDGET */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-gold rounded-3xl p-6 sm:p-10 border border-yellow-500/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="badge badge-gold">Interactive Tool</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Live Karigar Piece-Rate & Yield Calculator
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Test how YellowHouse automatically computes Standard Allowed Minutes (SAM), fabric yardage optimization, and artisan piece-rates per production batch.
                </p>

                <div className="space-y-5 pt-2">
                  {/* SLIDER 1: SUIT BATCH COUNT */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                      <span>Batch Size (Bespoke Suits/Sherwanis):</span>
                      <span className="text-yellow-400 font-mono text-sm">{suitCount} Units</span>
                    </div>
                    <input
                      type="range"
                      id="suit-batch-slider"
                      min="1"
                      max="30"
                      value={suitCount}
                      onChange={(e) => setSuitCount(parseInt(e.target.value) || 1)}
                      aria-label="Batch size in bespoke suits or sherwanis"
                      aria-valuemin={1}
                      aria-valuemax={30}
                      aria-valuenow={suitCount}
                      aria-valuetext={`${suitCount} units`}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>

                  {/* SLIDER 2: FABRIC LENGTH PER SUIT */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                      <span>Super 150s Fabric per Suit:</span>
                      <span className="text-yellow-400 font-mono text-sm">{fabricLengthPerSuit} Meters</span>
                    </div>
                    <input
                      type="range"
                      id="fabric-length-slider"
                      min="2.5"
                      max="4.5"
                      step="0.1"
                      value={fabricLengthPerSuit}
                      onChange={(e) => setFabricLengthPerSuit(parseFloat(e.target.value) || 2.5)}
                      aria-label="Fabric length per suit in meters"
                      aria-valuemin={2.5}
                      aria-valuemax={4.5}
                      aria-valuenow={fabricLengthPerSuit}
                      aria-valuetext={`${fabricLengthPerSuit} meters`}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* CALCULATED RESULTS CONTAINER */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Fabric Required</span>
                    <Layers className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {totalFabricMeters} <span className="text-sm font-normal text-slate-400">m</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fabric Yield Efficiency: {fabricEfficiency}%</span>
                  </div>
                </div>

                <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Workshop SAM Duration</span>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {estimatedSAMHours} <span className="text-sm font-normal text-slate-400">hrs</span>
                  </div>
                  <div className="text-xs text-blue-400 mt-2 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Avg 14.5 SAM hours / garment</span>
                  </div>
                </div>

                <div className="sm:col-span-2 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-transparent p-5 rounded-2xl border border-yellow-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
                      Estimated Karigar Batch Payout
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 font-mono">
                      ₹{karigarPayoutINR}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlanChoice('pro')}
                    className="btn-gold text-xs font-bold px-4 py-2.5 shrink-0 flex items-center space-x-1.5"
                  >
                    <span>Automate Payouts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION MODELS SECTION (REQUIREMENT 1) */}
      <section id="pricing" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="badge badge-gold mb-3 inline-block">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Subscription Models for Every Atelier
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Select the plan tailored to your branch network, karigar count, and bespoke volume.
            </p>

            {/* MONTHLY / ANNUAL BILLING TOGGLE */}
            <div className="inline-flex items-center space-x-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setIsAnnualBilling(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isAnnualBilling ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnualBilling(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isAnnualBilling ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* PRICING CARDS GRID (3 CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* CARD 1: ATELIER STARTER */}
            <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between relative hover:border-slate-700 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-gold">Starter</span>
                  <span className="text-xs text-slate-400">Independent Cutters</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Atelier Starter</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Essential measurement engine and customer WhatsApp tracking for boutique tailors.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-white">
                      ₹{isAnnualBilling ? '4,000' : '5,000'}
                    </span>
                    <span className="text-slate-400 text-sm font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹48,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-300">
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Features Included:</div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>1 Branch</strong> location</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>3 Users</strong> (1 Master, 2 Karigars)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Standard POM measurement templates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>WhatsApp client notifications</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Up to 50 active client fit profiles</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => handlePlanChoice('starter')}
                  className="btn-ghost w-full justify-center py-3 text-sm font-bold flex items-center space-x-2"
                >
                  <span>Choose Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2: ATELIER PRO (POPULARITY RIBBON REQUIREMENT) */}
            <div className="glass-card-gold rounded-3xl p-8 border-2 border-yellow-500/60 flex flex-col justify-between relative transform lg:-translate-y-3 shadow-2xl shadow-yellow-500/10">
              {/* POPULARITY RIBBON */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-yellow-500/30 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>Most Popular for Ateliers</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 pt-2">
                  <span className="badge badge-gold">Pro Tier</span>
                  <span className="badge badge-emerald">Recommended</span>
                </div>

                <h3 className="text-2xl font-extrabold text-white mb-2">Atelier Pro</h3>
                <p className="text-slate-300 text-xs mb-6">
                  Complete posture compensation CAD engine and full active Karigar piece-rate tracking.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-yellow-400">
                      ₹{isAnnualBilling ? '20,000' : '25,000'}
                    </span>
                    <span className="text-slate-300 text-sm font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹2,40,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-800/80 pt-6 text-sm text-slate-200">
                  <div className="font-semibold text-yellow-400 text-xs uppercase tracking-wider mb-2">Everything in Starter, plus:</div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>3 Branches</strong> synchronization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>10 Users</strong> (Master Cutters & Staff)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Custom 2D landmark mapping & posture deltas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Advanced ease calculation & fabric yield engine</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Active Karigar SAM time tracking & payouts</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => handlePlanChoice('pro')}
                  className="btn-gold w-full justify-center py-3.5 text-base font-extrabold flex items-center space-x-2 shadow-lg shadow-yellow-500/30"
                >
                  <span>Choose Plan</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CARD 3: ATELIER ENTERPRISE */}
            <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between relative hover:border-slate-700 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-blue">Enterprise</span>
                  <span className="text-xs text-slate-400">Multi-City Networks</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Atelier Enterprise</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Unlimited multi-tenant branches, custom garment CAD schemas, and API access.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-white">
                      ₹{isAnnualBilling ? '36,000' : '45,000'}
                    </span>
                    <span className="text-slate-400 text-sm font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹4,32,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-300">
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Everything in Pro, plus:</div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>Unlimited Branches</strong> & Global Routing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>Unlimited Users</strong> & Karigars</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Custom Garment CAD Schemas & 3D Hooks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Priority 24/7 Support & SLA 99.9%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>REST API & ERP/POS Integration Access</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => handlePlanChoice('enterprise')}
                  className="btn-ghost w-full justify-center py-3 text-sm font-bold flex items-center space-x-2"
                >
                  <span>Choose Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL SECTION */}
      <section id="testimonials" className="py-20 bg-slate-950/80 border-y border-slate-800/80 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge badge-gold mb-3 inline-block">Atelier Voices</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12">
            Trusted by Premier Savile Row & Indian Heritage Boutiques
          </h2>

          {/* CAROUSEL CARD */}
          <div className="glass-card-gold rounded-3xl p-8 sm:p-12 border border-yellow-500/30 relative text-left min-h-[300px] flex flex-col justify-between shadow-2xl">
            <div>
              {/* STAR RATING */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-3 badge badge-gold text-xs">
                  {TESTIMONIALS[testimonialIndex].badge}
                </span>
              </div>

              {/* QUOTE TEXT */}
              <p className="text-xl sm:text-2xl text-slate-100 font-medium leading-relaxed mb-8 italic">
                "{TESTIMONIALS[testimonialIndex].quote}"
              </p>
            </div>

            {/* AUTHOR FOOTER & CAROUSEL CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <h4 className="text-lg font-bold text-white">
                  {TESTIMONIALS[testimonialIndex].author}
                </h4>
                <p className="text-sm text-yellow-400 font-medium">
                  {TESTIMONIALS[testimonialIndex].role} — <span className="text-slate-300">{TESTIMONIALS[testimonialIndex].atelier}</span>
                </p>
              </div>

              {/* ARROW CONTROLS */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 text-slate-300 hover:text-white transition-all"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-1.5 px-2">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestimonialIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        testimonialIndex === idx ? 'w-6 bg-yellow-400' : 'w-2 bg-slate-700'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 text-slate-300 hover:text-white transition-all"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section id="faqs" className="py-20 md:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge badge-gold mb-3 inline-block">Clear Answers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Everything you need to know about implementing YellowHouse Tailoring OS in your workshop.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-trigger-${index}`}
                  >
                    <span className="text-base font-bold text-white pr-4">
                      {faq.question}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-yellow-400 shrink-0">
                      {isOpen ? <ChevronDown className="w-5 h-5 transform rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 transition-transform" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      className="px-6 pb-6 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 animate-fade-in"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-gold rounded-3xl p-10 sm:p-16 border border-yellow-500/40 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <span className="badge badge-gold px-3.5 py-1.5 rounded-full text-xs">
                Elevate Your Bespoke Operation
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Ready to Digitize Your Cutting Table & Workshop?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Join master cutters, karigars, and luxury bespoke houses worldwide. Setup takes under 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handlePlanChoice('starter')}
                  className="btn-gold px-8 py-4 text-base font-bold w-full sm:w-auto flex items-center justify-center space-x-3 shadow-xl shadow-yellow-500/30"
                >
                  <span>Start Free Onboarding</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  href="/login"
                  className="btn-ghost px-8 py-4 text-base font-semibold w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <span>Existing Client Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-16 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* BRAND COLUMN */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-950 font-bold">
                  <Scissors className="w-5 h-5" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">
                  YellowHouse Tailoring OS
                </span>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The premier multi-tenant operating system for bespoke tailors, custom suit ateliers, and Indian heritage sherwani houses. Automating CAD measurements, posture deltas, and Karigar piece-rates.
              </p>

              <div className="flex items-center space-x-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">System Operational 99.99% Uptime</span>
              </div>
            </div>

            {/* PRODUCT COLUMN */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#cad-engine" className="hover:text-yellow-400 transition-colors">CAD Engine</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Karigar Board</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">POM Templates</a></li>
                <li><a href="#pricing" className="hover:text-yellow-400 transition-colors">Pricing Plans</a></li>
                <li><Link href="/onboarding" className="hover:text-yellow-400 transition-colors">Onboarding Wizard</Link></li>
              </ul>
            </div>

            {/* SOLUTIONS COLUMN */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Solutions</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Savile Row Ateliers</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Indian Heritage Couture</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Multi-Branch Boutiques</a></li>
                <li><a href="#calculator" className="hover:text-yellow-400 transition-colors">Karigar Piece-Rate Pay</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">WhatsApp Fitting Alerts</a></li>
              </ul>
            </div>

            {/* LEGAL & COMPANY COLUMN */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Legal & Company</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link href="/legal/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/security" className="hover:text-yellow-400 transition-colors">Security & GDPR</Link></li>
                <li><Link href="/docs/api" className="hover:text-yellow-400 transition-colors">API Documentation</Link></li>
                <li><a href="mailto:support@yellowhouse.io" className="hover:text-yellow-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © 2026 YellowHouse Tailoring OS Inc. All rights reserved. Built for bespoke masters worldwide.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/legal/privacy" className="hover:text-yellow-400 transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-yellow-400 transition-colors">Terms</Link>
              <a href="mailto:support@yellowhouse.io" className="hover:text-yellow-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
