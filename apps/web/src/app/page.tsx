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
  Zap,
  Crown,
  Shield,
  UserCheck,
  Key,
  PlayCircle,
  Compass
} from 'lucide-react';
import { setLocalStorage, getLocalStorage } from '@/lib/storage-utils';

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

interface DemoRole {
  role: string;
  name: string;
  email: string;
  title: string;
  label: string;
  badge: string;
  description: string;
  icon: any;
  targetUrl: string;
  accentGradient: string;
  borderColor: string;
  badgeColor: string;
  features: string[];
}

const DEMO_ROLES: DemoRole[] = [
  {
    role: 'TENANT_OWNER',
    name: 'Latif Khan',
    email: 'owner@yellowhouse.com',
    title: 'Tenant Owner & Founder',
    label: 'Owner Sandbox',
    badge: 'Executive Command',
    description: 'Complete visibility into multi-branch financials, store profit margins, master orders, and atelier growth analytics.',
    icon: Crown,
    targetUrl: '/dashboard',
    accentGradient: 'from-amber-500/15 via-yellow-500/5 to-[#0A0D16]',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    badgeColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    features: ['Revenue & P&L Telemetry', 'Multi-Boutique Inventory', 'Automated Pricing Rules', 'Executive Audit Logs']
  },
  {
    role: 'MASTER_TAILOR',
    name: 'Master Latif',
    email: 'master@yellowhouse.com',
    title: 'Master Tailor & Pattern Cutter',
    label: 'Master Workbench',
    badge: '2D CAD Studio',
    description: 'Access the cutting table with real-time anatomical body landmark mapping, posture delta compensations, and version snapshots.',
    icon: Scissors,
    targetUrl: '/measurements',
    accentGradient: 'from-yellow-500/15 via-amber-500/5 to-[#0A0D16]',
    borderColor: 'border-yellow-500/40 hover:border-yellow-400',
    badgeColor: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
    features: ['2D Landmark Vector Engine', 'Posture Delta Calculation', 'Fitting Trial History', 'Measurement Card Printing']
  },
  {
    role: 'BRANCH_MANAGER',
    name: 'Sarah Jenkins',
    email: 'manager@yellowhouse.com',
    title: 'Boutique Branch Manager',
    label: 'Store Operations',
    badge: 'Store Operations',
    description: 'Manage daily client appointments, custom order intake, QR/barcode tagging, payment balance collections, and delivery dates.',
    icon: Building2,
    targetUrl: '/orders',
    accentGradient: 'from-blue-500/15 via-indigo-500/5 to-[#0A0D16]',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    features: ['Real-Time Order Tracking', 'QR & Barcode Generation', 'Client Fitting Reminders', 'Automated Invoicing & Receipts']
  },
  {
    role: 'KARIGAR',
    name: 'Rafi Craftsman',
    email: 'karigar@yellowhouse.com',
    title: 'Artisan Karigar & Craftsman',
    label: 'Karigar Floor',
    badge: 'Workshop Floor',
    description: 'Live mobile-first workshop floor board to track Standard Allowed Minutes (SAM), stage completion, and piece-rate earnings.',
    icon: Zap,
    targetUrl: '/production',
    accentGradient: 'from-purple-500/15 via-pink-500/5 to-[#0A0D16]',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    features: ['Kanban Production Floor', 'Mobile Barcode Scanner', 'SAM Efficiency Tracking', 'Daily Piece-Rate Payouts']
  }
];

export default function MarketingLandingPage() {
  const router = useRouter();

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [launchingRoleId, setLaunchingRoleId] = useState<string | null>(null);
  
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

  const handleQuickDemoLogin = (demo: DemoRole) => {
    setLaunchingRoleId(demo.role);
    const userObject = {
      id: `usr_demo_${demo.role.toLowerCase()}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      tenant: {
        id: 'tenant-flagship-01',
        name: 'Grand Atelier Flagship',
        code: 'GA-01',
      },
      loggedInAt: new Date().toISOString(),
    };

    setLocalStorage('yh_auth_user', userObject);
    setTimeout(() => {
      router.push(demo.targetUrl);
    }, 400);
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
              <a href="#demo-accounts" className="hover:text-amber-400 transition-colors flex items-center space-x-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Roles</span>
              </a>
              <a href="#features" className="hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#cad-engine" className="hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                <span>CAD Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/10 text-amber-300 border border-amber-400/30">v4.2</span>
              </a>
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
              <a href="#demo-accounts" className="px-3.5 py-2 rounded-xl text-amber-300 bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 font-bold text-xs transition-colors flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Sandboxes</span>
              </a>
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
                href="#demo-accounts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 font-bold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Demo Role Sandboxes
                </span>
                <span className="badge badge-gold">4 Roles</span>
              </a>
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
            <a
              href="#demo-accounts"
              className="w-full sm:w-auto px-7 py-4 text-base font-bold flex items-center justify-center space-x-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 shadow-lg shadow-amber-500/10"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>⚡ Try 1-Click Demo Accounts</span>
            </a>
            <a
              href="#cad-engine"
              className="btn-ghost w-full sm:w-auto px-6 py-4 text-base font-semibold flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5 text-slate-400" />
              <span>CAD Pattern Table</span>
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

      {/* ============================================================ */}
      {/* SEPARATE INTERACTIVE DEMO ROLES & 1-CLICK ATELIER SANDBOX   */}
      {/* ============================================================ */}
      <section id="demo-accounts" className="py-20 md:py-28 bg-[#070A12] border-t border-amber-500/25 relative overflow-hidden">
        {/* Ambient background glow pools */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 via-yellow-500/15 to-amber-600/15 text-amber-300 border border-amber-400/40 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/10">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Separate Live Demo Workspaces</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Experience the OS with{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Dedicated Demo Accounts
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Explore YellowHouse Tailoring OS tailored specifically to each role. Select any persona below to immediately launch an authentic interactive session — <span className="text-amber-300 font-semibold">no password or credit card required</span>.
            </p>
          </div>

          {/* 4 Distinct Atelier Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_ROLES.map((demo) => {
              const IconComponent = demo.icon;
              const isLaunching = launchingRoleId === demo.role;

              return (
                <div
                  key={demo.role}
                  className={`rounded-2xl border ${demo.borderColor} bg-gradient-to-b ${demo.accentGradient} p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group shadow-xl backdrop-blur-xl relative overflow-hidden`}
                >
                  {/* Card Header & Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-110 group-hover:border-amber-400/50 transition-all duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${demo.badgeColor}`}>
                        {demo.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {demo.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-1">
                        <span className="font-semibold text-slate-200">{demo.name}</span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 truncate">{demo.email}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[56px]">
                      {demo.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      {demo.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <div className="pt-6 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleQuickDemoLogin(demo)}
                      disabled={isLaunching}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-amber-400 text-slate-100 hover:text-slate-950 border border-slate-700 hover:border-amber-400 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg group/btn cursor-pointer"
                    >
                      {isLaunching ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Launching Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch {demo.label}</span>
                          <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform text-amber-400 group-hover/btn:text-slate-950" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Banner */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Each demo persona operates in an isolated pre-loaded atelier sandbox with authentic sample orders, CAD patterns, and metrics.</span>
            </div>
          </div>
        </div>
      </section>

      {/* BESPOKE ATELIER CAD & MEASUREMENT STUDIO (CLEAN, ELEGANT & REALISTIC) */}
      <section id="cad-engine" className="py-20 md:py-28 bg-[#05070B] border-y border-amber-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-extrabold uppercase tracking-wider">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Digital Cutting Table & CAD Pattern Studio</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Precision <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Bespoke Pattern</span> Engineering
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Real-time anatomical landmark mapping, posture delta compensations, and automatic ease allowances tailored for master cutters.
            </p>
          </div>

          {/* CLEAN ATELIER CAD WORKSTATION */}
          <div className="rounded-3xl border border-amber-500/30 bg-[#0A0D16] shadow-2xl overflow-hidden">
            {/* WORKSTATION HEADER BAR */}
            <div className="bg-[#0D111D] px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                  CAD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Bespoke Pattern Draft Studio</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Profile: Master Savile Row & Heritage Sherwani</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pattern Verified
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono font-semibold">
                  Yield: 98.4%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* REALISTIC TAILOR PATTERN VISUALIZER (LEFT 7 COLS) */}
              <div className="lg:col-span-7 p-6 sm:p-8 bg-[#07090E] border-r border-slate-800 flex flex-col items-center justify-center min-h-[460px] relative">
                {/* Blueprint Grid Canvas */}
                <div className="w-full max-w-md bg-[#0A0D16] rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
                  {/* Subtle cutting table grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Clean Garment Blueprint Graphic */}
                  <div className="relative z-10 w-full max-w-[280px] h-[320px] flex items-center justify-center">
                    <svg viewBox="0 0 280 320" className="w-full h-full">
                      {/* Outer Garment Outline */}
                      <path
                        d="M 90 40 L 140 50 L 190 40 L 230 75 L 210 135 L 190 125 L 190 280 L 90 280 L 90 125 L 70 135 L 50 75 Z"
                        fill="#0F172A"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                      />
                      {/* Lapel & Collar Lines */}
                      <path d="M 120 45 L 140 140 L 160 45" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 2" />
                      <line x1="140" y1="140" x2="140" y2="280" stroke="#FBBF24" strokeWidth="1.5" />
                      {/* Pocket Lines */}
                      <line x1="98" y1="200" x2="128" y2="200" stroke="#94A3B8" strokeWidth="1.5" />
                      <line x1="152" y1="200" x2="182" y2="200" stroke="#94A3B8" strokeWidth="1.5" />
                      <line x1="102" y1="110" x2="126" y2="110" stroke="#94A3B8" strokeWidth="1.5" />

                      {/* Interactive Measurement Callouts */}
                      {LANDMARKS.map((lm) => {
                        const isSelected = activeLandmark.id === lm.id;
                        // Map coordinates to clean SVG box
                        const coords: Record<string, { x: number; y: number; label: string }> = {
                          chest: { x: 140, y: 120, label: 'Chest 42.5"' },
                          shoulder: { x: 140, y: 48, label: 'Shoulder 18.5"' },
                          waist: { x: 140, y: 190, label: 'Waist 36.0"' },
                          sleeve: { x: 58, y: 105, label: 'Sleeve 25.0"' },
                          inseam: { x: 140, y: 280, label: 'Length 42.0"' }
                        };
                        const pt = coords[lm.id] || { x: 140, y: 120, label: lm.name };

                        return (
                          <g
                            key={lm.id}
                            className="cursor-pointer group"
                            onClick={() => setActiveLandmark(lm)}
                          >
                            {/* Hotspot Target */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isSelected ? 9 : 6}
                              className={isSelected ? 'fill-amber-400 stroke-white' : 'fill-slate-800 stroke-amber-400 group-hover:fill-amber-400'}
                              strokeWidth="2"
                            />
                            {isSelected && (
                              <circle cx={pt.x} cy={pt.y} r={16} fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6">
                                <animate attributeName="r" values="9;20;9" dur="2.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                              </circle>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Active Dimension Pill */}
                  <div className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between w-full">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Active Point: {activeLandmark.name}
                    </span>
                    <span className="font-mono font-bold text-amber-400">{activeLandmark.baseVal} {activeLandmark.unit}</span>
                  </div>
                </div>
              </div>

              {/* CLEAN MEASUREMENT CONTROLS (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-[#0A0D16]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Selected Landmark</span>
                      <h3 className="text-xl font-bold text-white">{activeLandmark.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-400">
                      #{activeLandmark.id.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeLandmark.description}
                  </p>

                  {/* MEASUREMENT & POSTURE DELTA TILES */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#07090E] p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold">Net Body Dimension</span>
                      <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                        {activeLandmark.baseVal} <span className="text-xs font-normal text-slate-400">{activeLandmark.unit}</span>
                      </div>
                    </div>

                    <div className="bg-[#07090E] p-3.5 rounded-xl border border-amber-500/30">
                      <span className="text-[11px] text-amber-400 font-semibold">Posture Allowance</span>
                      <div className="text-xs font-bold text-amber-300 mt-2 leading-tight">
                        {activeLandmark.delta}
                      </div>
                    </div>
                  </div>

                  {/* POSTURE MORPH SELECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Posture & Postural Slope:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Standard Erect', 'Stooped', 'High Shoulder', 'Hollow Back'].map((pst) => (
                        <button
                          key={pst}
                          onClick={() => setPostureCompensation(pst)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            postureCompensation === pst
                              ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {pst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AUTOMATED DXF PATTERN SYNC NOTE */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300 leading-snug">
                    <strong className="text-white block font-semibold">Live CAD Cutting Sync</strong>
                    Adjustments automatically recalculate piece-rates, seam allowances, and cutting yield.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BESPOKE ATELIER SERVICES & CRAFTSMANSHIP CATALOG (REDHOUSE OS INSPIRED LUXURY OBSIDIAN THEME) */}
      <section id="services" className="py-24 bg-[#06080E] border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Atelier Portfolio & Turnaround Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Master Craftsmanship Services
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Standardized CAD templates, SAM labor allocation, and precision turnaround tracking across all haute couture categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SERVICE CARD 1: BRIDAL BLOUSE */}
            <div className="bg-[#0A0D16] rounded-3xl border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-xl hover:shadow-amber-500/10">
              <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                  alt="Bespoke Maggam Blouse"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/30 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-md text-amber-300 border border-amber-400/40">
                    Bridal Couture
                  </span>
                </div>
                <div className="absolute top-3.5 right-3.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-200 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    7 Days Turnaround
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-slate-400 font-normal">(1,420 orders)</span>
                  </div>
                  <span className="font-mono font-black text-amber-300 text-sm">From ₹3,500</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Bridal & Maggam Zari Blouses
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Princess cut, padded cups, deep back boning, hand-embroidered Zardozi, and micro-piping seam finishes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">1.0m Fabric</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Padded Cups</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Invisible Zip</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">SAM 180m</span>
                </div>
              </div>
            </div>

            {/* SERVICE CARD 2: BESPOKE SUITING */}
            <div className="bg-[#0A0D16] rounded-3xl border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-xl hover:shadow-amber-500/10">
              <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                  alt="3-Piece Bespoke Suit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/30 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/40">
                    Savile Row Suiting
                  </span>
                </div>
                <div className="absolute top-3.5 right-3.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-200 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    10 Days Turnaround
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                    <span className="text-slate-400 font-normal">(890 orders)</span>
                  </div>
                  <span className="font-mono font-black text-amber-300 text-sm">From ₹28,000</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    2 & 3-Piece Bespoke Tuxedos & Suits
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full floating horsehair canvas chest piece, surgeon cuffs, horn buttons, and pick-stitched peak/notch lapels.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">4.0m Broadloom</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Floating Canvas</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Surgeon Cuffs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">SAM 360m</span>
                </div>
              </div>
            </div>

            {/* SERVICE CARD 3: BRIDAL LEHENGA */}
            <div className="bg-[#0A0D16] rounded-3xl border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden group shadow-xl hover:shadow-amber-500/10">
              <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                  alt="Bridal Lehenga Choli"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/30 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-300 border border-rose-500/40">
                    Grand Heritage
                  </span>
                </div>
                <div className="absolute top-3.5 right-3.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-200 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    14 Days Turnaround
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                    <span className="text-slate-400 font-normal">(620 orders)</span>
                  </div>
                  <span className="font-mono font-black text-amber-300 text-sm">From ₹65,000</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Bridal Lehenga Choli & Ghagra Sets
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    16 to 24-kali flared circumference, structured 4-layer cancan netting, double dupatta draping, and Latkan tassels.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">5.5m Silk</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Cancan Flare</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Heavy Zari</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">SAM 480m</span>
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
