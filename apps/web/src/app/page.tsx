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
  Award,
  ShieldCheck,
  Zap,
  Crown,
  Lock,
  Compass,
} from 'lucide-react';
import { setLocalStorage } from '@/lib/storage-utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';

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
    cx: 140,
    cy: 120,
    baseVal: 42.5,
    unit: 'in',
    delta: '+0.75 in (Stooped Posture Compensation)',
    description: 'Calculates standard scye circumference with posture-adapted back width ease.',
  },
  {
    id: 'shoulder',
    name: 'Shoulder Slope & Incline',
    cx: 140,
    cy: 50,
    baseVal: 18.25,
    unit: 'in',
    delta: '-0.25 in Left Asymmetrical Drop',
    description: 'Dynamic shoulder angle offset compensation for precise collar hugging.',
  },
  {
    id: 'waist',
    name: 'Natural Waist & Prominence',
    cx: 140,
    cy: 190,
    baseVal: 36.0,
    unit: 'in',
    delta: '+0.50 in Seated Comfort Ease',
    description: 'Middle body drop ratio mapped against jacket buttoning point.',
  },
  {
    id: 'sleeve',
    name: 'Sleeve Length & Crown Pitch',
    cx: 60,
    cy: 105,
    baseVal: 25.5,
    unit: 'in',
    delta: 'Pitch Rotated +2.5° Forward',
    description: 'Armhole pitch alignment calculated from shoulder blade profile.',
  },
  {
    id: 'inseam',
    name: 'Trouser Inseam & Rise',
    cx: 140,
    cy: 280,
    baseVal: 31.75,
    unit: 'in',
    delta: 'Standard Half Break Allowance',
    description: 'Crotch depth to ankle hem measurement snapshot.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'YellowHouse transformed our atelier workflow. The posture delta compensation alone reduced our client fitting alterations by 42% in our Savile Row workshop.',
    author: 'Alistair Vance',
    role: 'Master Cutter & Senior Partner',
    atelier: 'Vance & Son Tailors, Savile Row (London)',
    rating: 5,
    badge: 'Savile Row Partner',
  },
  {
    quote:
      'Managing our 4 flagship heritage stores across Mumbai, Delhi & Jaipur was complex before YellowHouse. Karigar piece-rate tracking and fabric yield calculation are now automated on one OS.',
    author: 'Vikramjit Singh',
    role: 'Founder & Creative Director',
    atelier: 'Royal Heritage Sherwani Atelier (New Delhi)',
    rating: 5,
    badge: 'Indian Heritage Couture',
  },
  {
    quote:
      'The SVG pattern landmark viewer gives our master cutters precise measurement variations on iPad screens right at the cutting table. Truly indispensable engineering.',
    author: 'Elena Rossi',
    role: "Chef d'Atelier",
    atelier: 'Milano Su Misura House (Milan)',
    rating: 5,
    badge: 'Italian Bespoke House',
  },
];

const FAQS = [
  {
    question: 'How does the CAD Measurement Engine handle asymmetric client body postures?',
    answer:
      'Our CAD engine utilizes dynamic SVG landmark hotspots with posture delta compensation. It records baseline body measurements alongside specific posture offsets (such as stooped shoulders, high hip, or prominent blades), automatically recalculating pattern armhole depth, scye pitch, and back width snap-lines.',
  },
  {
    question: 'Can Karigars (craftsmen) access the production board easily on mobile devices?',
    answer:
      'Yes! The Karigar Production Board is optimized for touch tablets and mobile smartphones. Karigars can scan barcode tags, track Standard Allowed Minutes (SAM), log stage completions (Cutting, Canvas Stitches, Sleeve Setting, Buttonholes), and view real-time piece-rate earnings in multi-language interfaces.',
  },
  {
    question: 'How does multi-tenant branch synchronization work for multi-boutique brands?',
    answer:
      'YellowHouse OS acts as a unified multi-tenant platform. Global admins can oversee measurement templates, pricing catalogs, fabric inventory, and revenue metrics across 1 to 50+ branches while allowing branch managers localized control over client fittings and karigar assignments.',
  },
  {
    question: 'Is automated client communication included for fitting reminders?',
    answer:
      "All subscription tiers include integrated WhatsApp & SMS status triggers. When an order transitions on the Kanban board to 'First Fitting Ready' or 'Final Hand Finishing', clients receive automated branded notifications with fitting calendar links.",
  },
  {
    question: 'Can we import our historical client measurement cards into YellowHouse OS?',
    answer:
      'Absolutely. Our onboarding suite provides automated CSV/Excel imports, bulk POM template builders, and digitizing tools to convert paper measurement logbooks into encrypted cloud snapshot profiles.',
  },
];

interface DemoRole {
  role: string;
  name: string;
  email: string;
  title: string;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  targetUrl: string;
  badgeVariant: 'gold' | 'warning' | 'info' | 'neutral';
  features: string[];
}

/**
 * STRICTLY exactly 4 customer-facing atelier demo personas.
 * ZERO administrative exposure (SUPER_ADMIN must NEVER appear on the public landing page).
 */
const DEMO_ROLES: DemoRole[] = [
  {
    role: 'TENANT_OWNER',
    name: 'Latif Khan',
    email: 'owner@yellowhouse.com',
    title: 'Tenant Owner & Founder',
    label: 'Owner Sandbox',
    badge: 'Executive Command',
    description:
      'Complete visibility into multi-branch financials, store profit margins, master orders, and atelier growth analytics.',
    icon: Crown,
    targetUrl: '/dashboard',
    badgeVariant: 'gold',
    features: [
      'Revenue & P&L Telemetry',
      'Multi-Boutique Inventory',
      'Automated Pricing Rules',
      'Executive Audit Logs',
    ],
  },
  {
    role: 'MASTER_TAILOR',
    name: 'Master Latif',
    email: 'master@yellowhouse.com',
    title: 'Master Tailor & Pattern Cutter',
    label: 'Master Workbench',
    badge: '2D CAD Studio',
    description:
      'Access the cutting table with real-time anatomical body landmark mapping, posture delta compensations, and version snapshots.',
    icon: Scissors,
    targetUrl: '/measurements',
    badgeVariant: 'warning',
    features: [
      '2D Landmark Vector Engine',
      'Posture Delta Calculation',
      'Fitting Trial History',
      'Measurement Card Printing',
    ],
  },
  {
    role: 'BRANCH_MANAGER',
    name: 'Sarah Jenkins',
    email: 'manager@yellowhouse.com',
    title: 'Boutique Branch Manager',
    label: 'Store Operations',
    badge: 'Store Operations',
    description:
      'Manage daily client appointments, custom order intake, QR/barcode tagging, payment balance collections, and delivery dates.',
    icon: Building2,
    targetUrl: '/orders',
    badgeVariant: 'info',
    features: [
      'Real-Time Order Tracking',
      'QR & Barcode Generation',
      'Client Fitting Reminders',
      'Automated Invoicing & Receipts',
    ],
  },
  {
    role: 'KARIGAR',
    name: 'Rafi Craftsman',
    email: 'karigar@yellowhouse.com',
    title: 'Artisan Karigar & Craftsman',
    label: 'Karigar Floor',
    badge: 'Workshop Floor',
    description:
      'Live mobile-first workshop floor board to track Standard Allowed Minutes (SAM), stage completion, and piece-rate earnings.',
    icon: Zap,
    targetUrl: '/production',
    badgeVariant: 'neutral',
    features: [
      'Kanban Production Floor',
      'Mobile Barcode Scanner',
      'SAM Efficiency Tracking',
      'Daily Piece-Rate Payouts',
    ],
  },
];

export default function MarketingLandingPage() {
  const router = useRouter();

  // Navigation State
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

  // Pricing State
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);

  // CAD Interactive State
  const [activeLandmark, setActiveLandmark] = useState<LandmarkData>(LANDMARKS[0]);
  const [postureCompensation, setPostureCompensation] = useState<string>('Stooped');

  // Testimonials & FAQ State
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Karigar Calculator State
  const [suitCount, setSuitCount] = useState<number>(8);
  const [fabricLengthPerSuit, setFabricLengthPerSuit] = useState<number>(3.3);

  // Derived Karigar values
  const totalFabricMeters = (suitCount * fabricLengthPerSuit).toFixed(1);
  const fabricEfficiency = Math.min(98.5, parseFloat((92.4 + suitCount * 0.4).toFixed(1)));
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
    }, 350);
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 selection:bg-yellow-400 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* LUXURY AMBIENT BACKGROUND GLOW POOLS */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#D4AF37]/12 via-amber-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[650px] h-[650px] bg-gradient-to-t from-amber-500/8 via-yellow-600/4 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* APPLE-GRADE FROSTED TOPBAR */}
      <header className="sticky top-0 z-50 glass-topbar transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO WITH GOLD EMBLEM */}
            <Link href="/" className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-300 via-[#D4AF37] to-[#C59B27] p-0.5 shadow-ios-gold group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-yellow-400 transform group-hover:rotate-12 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl text-white tracking-tight group-hover:text-yellow-300 transition-colors">
                  YellowHouse
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-yellow-400/90 -mt-1">
                  Atelier OS
                </span>
              </div>
            </Link>

            {/* NAVIGATION LINKS (DESKTOP) */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
              <a
                href="#demo-accounts"
                className="hover:text-yellow-400 transition-colors flex items-center space-x-1.5 text-yellow-300 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Demo Personas</span>
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#cad-engine" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <span>CAD Studio</span>
                <Badge variant="gold" size="sm">v4.2</Badge>
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="hover:text-white transition-colors">
                Ateliers
              </a>
              <a href="#faqs" className="hover:text-white transition-colors">
                FAQs
              </a>
              <Link href="/redhouse-os" className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all">
                RedHouse Ecosystem &rarr;
              </Link>
            </nav>

            {/* ACTION BUTTONS (DESKTOP) */}
            <div className="hidden md:flex items-center space-x-3.5">
              <a
                href="#demo-accounts"
                className="px-3.5 py-2 rounded-full text-yellow-300 bg-yellow-500/10 border border-[#D4AF37]/35 hover:bg-yellow-500/20 font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-ios-sm"
              >
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>1-Click Sandboxes</span>
              </a>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 font-medium text-xs transition-colors"
              >
                Sign In
              </Link>
              <Button
                variant="gold"
                size="sm"
                onClick={() => router.push('/onboarding')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start Free Onboarding
              </Button>
            </div>

            {/* MOBILE MENU TRIGGER */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-fade-in mx-2 mt-2">
            <nav className="flex flex-col space-y-2.5 text-sm font-medium text-slate-300">
              <a
                href="#demo-accounts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Demo Personas
                </span>
                <Badge variant="gold" size="sm">4 Personas</Badge>
              </a>
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Core Features
              </a>
              <a
                href="#cad-engine"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>CAD Studio</span>
                <Badge variant="gold" size="sm">v4.2</Badge>
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                Ateliers
              </a>
              <a
                href="#faqs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
              >
                FAQs
              </a>
              <Link
                href="/redhouse-os"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-yellow-300 hover:text-yellow-200 transition-colors"
              >
                RedHouse Ecosystem Portal &rarr;
              </Link>
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col space-y-2.5">
              <Link href="/login" className="btn-apple bg-slate-800/80 text-white w-full">
                Sign In
              </Link>
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/onboarding');
                }}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Free Onboarding
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* ANNOUNCEMENT PILL BADGE */}
          <div className="inline-flex items-center space-x-2 badge-gold px-4 py-1.5 rounded-full mb-8 shadow-ios-gold cursor-default animate-fade-in backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-yellow-300">
              Next-Gen Garment CAD & Karigar Yield Engine v4.2 Live
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
          </div>

          {/* HERO HEADING */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tightest max-w-5xl mx-auto leading-[1.08] mb-6">
            The Garment Engineering Platform for{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">
              Bespoke Ateliers
            </span>
          </h1>

          {/* HERO SUBTITLE */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal tracking-tight">
            Automate measurements, calculate yields, track Karigars, and manage multi-tenant boutiques on an Apple-grade unified operating system.
          </p>

          {/* HERO CALL TO ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button
              variant="gold"
              size="lg"
              onClick={() => handlePlanChoice('starter')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-8 py-3.5 text-base shadow-ios-gold-lg"
            >
              Get Started Free
            </Button>
            <a
              href="#demo-accounts"
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold flex items-center justify-center space-x-2 rounded-full bg-slate-900/80 hover:bg-yellow-500/20 text-yellow-300 border border-[#D4AF37]/40 transition-all duration-300 shadow-ios-md hover:border-yellow-400"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>⚡ Try 1-Click Demo Personas</span>
            </a>
            <a
              href="#cad-engine"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold flex items-center justify-center space-x-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all duration-300 shadow-ios-sm"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>CAD Pattern Studio</span>
            </a>
          </div>

          {/* VISUAL ATELIER PREVIEW STRIP (SQUIRCLE 2.5XL CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
            <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-44 group">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
                alt="Bespoke Master Suiting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/50 to-transparent" />
              <div className="absolute bottom-3.5 left-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400">
                  Master Cutting
                </span>
                <div className="text-xs font-semibold text-white tracking-tight">Savile Row & Bespoke Suiting</div>
              </div>
            </Card>

            <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-44 group">
              <img
                src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80"
                alt="Haute Couture Drapes"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/50 to-transparent" />
              <div className="absolute bottom-3.5 left-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                  Haute Couture
                </span>
                <div className="text-xs font-semibold text-white tracking-tight">Bridal Maggam & Draped Silks</div>
              </div>
            </Card>

            <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-44 group">
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Fabric Materials"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/50 to-transparent" />
              <div className="absolute bottom-3.5 left-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Material Science
                </span>
                <div className="text-xs font-semibold text-white tracking-tight">Super 150s & Cashmere Wefts</div>
              </div>
            </Card>

            <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-44 group">
              <img
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80"
                alt="Artisan Craftsmanship"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/50 to-transparent" />
              <div className="absolute bottom-3.5 left-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Artisan Craft
                </span>
                <div className="text-xs font-semibold text-white tracking-tight">Hand-Stitched Canvas & Lapels</div>
              </div>
            </Card>
          </div>

          {/* LIVE SYSTEM STATUS BAR */}
          <Card variant="glass" padding="md" className="max-w-4xl mx-auto rounded-2.5xl flex flex-wrap items-center justify-between gap-4 text-left border border-white/10 shadow-ios-md">
            <div className="flex items-center space-x-3.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
              <div>
                <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Operational Telemetry
                </div>
                <div className="text-sm font-semibold text-white flex items-center space-x-2">
                  <span>Savile Row & Global Multi-Branch Engine Active</span>
                  <Badge variant="success" size="sm">99.99% Uptime</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-slate-400">Active Karigars</div>
                <div className="text-lg font-bold text-yellow-400 tabular-nums">1,420+</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-slate-400">Fittings Snapshot</div>
                <div className="text-lg font-bold text-white tabular-nums">48,500+</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-slate-400">Fabric Yield Gain</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">+14.2%</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4 CUSTOMER-FACING ATELIER DEMO PERSONAS (ZERO ADMIN LEAK)    */}
      {/* ============================================================ */}
      <section id="demo-accounts" className="py-20 md:py-28 bg-[#090D16] border-t border-white/5 relative overflow-hidden">
        {/* Ambient background glow pools */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-yellow-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-[#D4AF37]/35 text-xs font-semibold uppercase tracking-wider shadow-ios-sm">
              <Crown className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
              <span>Isolated Sandbox Workspaces</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Experience the OS with{' '}
              <span className="bg-gradient-to-r from-yellow-200 via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">
                Dedicated Atelier Personas
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed tracking-tight">
              Explore YellowHouse Tailoring OS tailored specifically to each role. Select any customer-facing persona below to immediately launch an authentic interactive session — <span className="text-yellow-300 font-semibold">no password or credit card required</span>.
            </p>
          </div>

          {/* 4 Distinct Customer-Facing Atelier Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_ROLES.map((demo) => {
              const IconComponent = demo.icon;
              const isLaunching = launchingRoleId === demo.role;

              return (
                <Card
                  key={demo.role}
                  variant="glass"
                  padding="md"
                  hoverable
                  className="rounded-2.5xl flex flex-col justify-between border-white/10 hover:border-[#D4AF37]/40 shadow-ios-md group"
                >
                  {/* Card Top Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-slate-850/90 border border-white/10 flex items-center justify-center text-yellow-400 shadow-ios-sm group-hover:scale-105 group-hover:border-yellow-400/40 transition-all duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Badge variant={demo.badgeVariant} size="sm">
                        {demo.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-yellow-300 transition-colors tracking-tight">
                        {demo.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-1">
                        <span className="font-semibold text-slate-200">{demo.name}</span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 truncate">{demo.email}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[52px]">
                      {demo.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      {demo.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <div className="pt-5 mt-4 border-t border-white/5">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleQuickDemoLogin(demo)}
                      disabled={isLaunching}
                      isLoading={isLaunching}
                      rightIcon={<ArrowRight className="w-4 h-4 text-yellow-400" />}
                      className="w-full hover:border-yellow-400/50 hover:text-yellow-300 font-semibold text-xs"
                    >
                      {isLaunching ? 'Launching Session...' : `Launch ${demo.label}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Assurance Notice */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs text-slate-400 shadow-ios-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Each persona operates in an isolated pre-loaded atelier sandbox with authentic sample orders, CAD patterns, and metrics.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CAD & MEASUREMENT WORKBENCH DEMO */}
      <section id="cad-engine" className="py-20 md:py-28 bg-[#07090E] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-wider">
              <Ruler className="w-3.5 h-3.5 text-yellow-400" />
              <span>Digital Cutting Table & CAD Pattern Studio</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Precision <span className="bg-gradient-to-r from-yellow-200 via-[#D4AF37] to-[#C59B27] bg-clip-text text-transparent">Bespoke Pattern</span> Engineering
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed tracking-tight">
              Real-time anatomical landmark mapping, posture delta compensations, and automatic ease allowances tailored for master cutters.
            </p>
          </div>

          {/* ATELIER CAD WORKBENCH */}
          <Card variant="glass" padding="none" className="rounded-3xl border border-white/10 shadow-ios-xl overflow-hidden">
            {/* WORKSTATION HEADER BAR */}
            <div className="bg-slate-900/90 px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/15 border border-[#D4AF37]/35 text-yellow-400 flex items-center justify-center font-bold text-xs">
                  CAD
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">Bespoke Pattern Draft Studio</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Profile: Master Savile Row & Heritage Sherwani</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <Badge variant="success" size="sm" dot>Pattern Verified</Badge>
                <Badge variant="gold" size="sm">Yield: 98.4%</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* TAILOR PATTERN BLUEPRINT (LEFT 7 COLS) */}
              <div className="lg:col-span-7 p-6 sm:p-8 bg-canvas border-r border-white/10 flex flex-col items-center justify-center min-h-[460px] relative">
                {/* Blueprint Grid Canvas */}
                <div className="w-full max-w-md bg-slate-900/70 rounded-2.5xl border border-white/10 p-6 relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
                  {/* Subtle cutting table grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Garment Blueprint Graphic */}
                  <div className="relative z-10 w-full max-w-[280px] h-[320px] flex items-center justify-center">
                    <svg viewBox="0 0 280 320" className="w-full h-full">
                      {/* Outer Garment Outline */}
                      <path
                        d="M 90 40 L 140 50 L 190 40 L 230 75 L 210 135 L 190 125 L 190 280 L 90 280 L 90 125 L 70 135 L 50 75 Z"
                        fill="#0D111A"
                        stroke="#D4AF37"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                      />
                      {/* Lapel & Collar Lines */}
                      <path d="M 120 45 L 140 140 L 160 45" fill="none" stroke="#E4BF64" strokeWidth="1.5" strokeDasharray="4 2" />
                      <line x1="140" y1="140" x2="140" y2="280" stroke="#E4BF64" strokeWidth="1.5" />
                      {/* Pocket Lines */}
                      <line x1="98" y1="200" x2="128" y2="200" stroke="#64748B" strokeWidth="1.5" />
                      <line x1="152" y1="200" x2="182" y2="200" stroke="#64748B" strokeWidth="1.5" />
                      <line x1="102" y1="110" x2="126" y2="110" stroke="#64748B" strokeWidth="1.5" />

                      {/* Interactive Measurement Callouts */}
                      {LANDMARKS.map((lm) => {
                        const isSelected = activeLandmark.id === lm.id;
                        return (
                          <g
                            key={lm.id}
                            className="cursor-pointer group"
                            onClick={() => setActiveLandmark(lm)}
                          >
                            <circle
                              cx={lm.cx}
                              cy={lm.cy}
                              r={isSelected ? 9 : 6}
                              className={isSelected ? 'fill-yellow-400 stroke-white' : 'fill-slate-800 stroke-yellow-400 group-hover:fill-yellow-400'}
                              strokeWidth="2"
                            />
                            {isSelected && (
                              <circle cx={lm.cx} cy={lm.cy} r={16} fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6">
                                <animate attributeName="r" values="9;18;9" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                              </circle>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Active Dimension Pill */}
                  <div className="mt-4 px-4 py-2.5 rounded-full bg-slate-900/90 border border-white/10 text-xs text-slate-300 flex items-center justify-between w-full shadow-ios-sm">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      Active Point: {activeLandmark.name}
                    </span>
                    <span className="font-mono font-bold text-yellow-400">
                      {activeLandmark.baseVal} {activeLandmark.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* MEASUREMENT CONTROLS (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-surface">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400">
                        Selected Landmark
                      </span>
                      <h3 className="font-display text-xl font-bold text-white tracking-tight">{activeLandmark.name}</h3>
                    </div>
                    <Badge variant="neutral" size="sm" className="font-mono font-bold">
                      #{activeLandmark.id.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeLandmark.description}
                  </p>

                  {/* MEASUREMENT & POSTURE DELTA TILES */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 shadow-ios-sm">
                      <span className="text-[11px] text-slate-400 font-semibold">Net Body Dimension</span>
                      <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
                        {activeLandmark.baseVal} <span className="text-xs font-normal text-slate-400">{activeLandmark.unit}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-[#D4AF37]/35 shadow-ios-sm">
                      <span className="text-[11px] text-yellow-400 font-semibold">Posture Allowance</span>
                      <div className="text-xs font-bold text-yellow-300 mt-2 leading-tight">
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
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            postureCompensation === pst
                              ? 'bg-yellow-500 text-slate-950 font-bold shadow-ios-sm'
                              : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/10'
                          }`}
                        >
                          {pst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AUTOMATED DXF PATTERN SYNC NOTE */}
                <div className="bg-yellow-500/10 border border-yellow-500/25 p-4 rounded-2xl flex items-center space-x-3.5 shadow-ios-sm">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300 leading-snug">
                    <strong className="text-white block font-semibold">Live CAD Cutting Sync</strong>
                    Adjustments automatically recalculate piece-rates, seam allowances, and cutting yield.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* KARIGAR SAM & FABRIC YIELD CALCULATOR PREVIEW WIDGET */}
      <section className="py-20 bg-[#090D16] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/40 shadow-ios-gold-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="gold" size="sm">Interactive Engine</Badge>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Live Karigar Piece-Rate & Yield Calculator
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Test how YellowHouse automatically computes Standard Allowed Minutes (SAM), fabric yardage optimization, and artisan piece-rates per production batch.
                </p>

                <div className="space-y-5 pt-2">
                  {/* SLIDER 1: SUIT BATCH COUNT */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                      <span>Batch Size (Bespoke Suits/Sherwanis):</span>
                      <span className="text-yellow-400 font-mono text-sm tabular-nums">{suitCount} Units</span>
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
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-semibold">
                      <span>Super 150s Fabric per Suit:</span>
                      <span className="text-yellow-400 font-mono text-sm tabular-nums">{fabricLengthPerSuit} Meters</span>
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

              {/* CALCULATED RESULTS TILES */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card variant="opaque" padding="md" className="bg-canvas/90 rounded-2.5xl border-white/10 shadow-ios-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Fabric Required</span>
                    <Layers className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    {totalFabricMeters} <span className="text-sm font-normal text-slate-400">m</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fabric Yield Efficiency: {fabricEfficiency}%</span>
                  </div>
                </Card>

                <Card variant="opaque" padding="md" className="bg-canvas/90 rounded-2.5xl border-white/10 shadow-ios-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Workshop SAM Duration</span>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    {estimatedSAMHours} <span className="text-sm font-normal text-slate-400">hrs</span>
                  </div>
                  <div className="text-xs text-blue-400 mt-2 flex items-center space-x-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Avg 14.5 SAM hours / garment</span>
                  </div>
                </Card>

                <div className="sm:col-span-2 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-transparent p-5 rounded-2.5xl border border-[#D4AF37]/35 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider font-mono">
                      Estimated Karigar Batch Payout (₹42/min)
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tabular-nums">
                      ₹{karigarPayoutINR}
                    </div>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handlePlanChoice('pro')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Automate Payouts
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CORE FEATURES ARCHITECTURE GRID */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="gold" size="sm">Architecture</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Modern Bespoke Operations
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Three core pillars built from the cutting table up to empower cutters, karigars, and atelier owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FEATURE 1: CAD MEASUREMENT ENGINE */}
            <Card variant="glass" padding="lg" hoverable className="rounded-3xl border-white/10 flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-6 border border-[#D4AF37]/30 group-hover:scale-105 transition-transform">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="gold" size="sm">Garment CAD</Badge>
                  <Badge variant="neutral" size="sm">2D SVG</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2.5 group-hover:text-yellow-300 transition-colors">
                  CAD Measurement Engine
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Interactive SVG hotspots, version snapshots, posture delta compensation, dynamic ease calculations, and asymmetrical shoulder mapping.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/5 pt-4">
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
                    <span>Instant printable measurement cards</span>
                  </li>
                </ul>
              </div>

              <a href="#cad-engine" className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>Explore CAD Capabilities</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </Card>

            {/* FEATURE 2: KARIGAR PRODUCTION BOARD */}
            <Card variant="gold" padding="lg" hoverable className="rounded-3xl border-[#D4AF37]/40 flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mb-6 border border-yellow-400/40 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="warning" size="sm">Workshop Floor</Badge>
                  <Badge variant="success" size="sm">SAM Tracking</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2.5 group-hover:text-yellow-300 transition-colors">
                  Karigar Production Board
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Piece-rate earnings, SAM time tracking, 5-stage Kanban control, artisan allocations, and automated payout accounting.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
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
                    <span>Single-step Kanban drag & drop transitions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Touchscreen Karigar tablet support</span>
                  </li>
                </ul>
              </div>

              <a href="#demo-accounts" className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>View Workshop Kanban</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </Card>

            {/* FEATURE 3: MULTI-TENANT ATELIER CONTROL */}
            <Card variant="glass" padding="lg" hoverable className="rounded-3xl border-white/10 flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="info" size="sm">Multi-Tenant</Badge>
                  <Badge variant="neutral" size="sm">Global Routing</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2.5 group-hover:text-yellow-300 transition-colors">
                  Multi-Tenant Boutique Network
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Global metrics, subscription tier billing, branch synchronization, fabric inventory, and role-based permissions across boutiques.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/5 pt-4">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Multi-branch inventory & order sync</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Strict tenant data isolation in storage</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Granular RBAC role governance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Centralized financial analytics</span>
                  </li>
                </ul>
              </div>

              <a href="#pricing" className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                <span>Enterprise Multi-Branch Specs</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING & SUBSCRIPTION MODELS */}
      <section id="pricing" className="py-20 md:py-28 bg-[#080B14] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="gold" size="sm">Transparent Pricing</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Subscription Models for Every Atelier
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Select the plan tailored to your branch network, karigar count, and bespoke volume.
            </p>

            {/* MONTHLY / ANNUAL TOGGLE */}
            <div className="inline-flex items-center p-1 rounded-full bg-slate-900/90 border border-white/10 shadow-ios-sm mt-4">
              <button
                onClick={() => setIsAnnualBilling(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !isAnnualBilling ? 'bg-slate-850 text-white shadow-ios-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnualBilling(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isAnnualBilling ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold shadow-ios-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* PRICING CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* STARTER TIER */}
            <Card variant="glass" padding="lg" className="rounded-3xl border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="neutral" size="sm">Starter</Badge>
                  <span className="text-xs text-slate-400 font-medium">Independent Cutters</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">Atelier Starter</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Essential measurement engine and customer WhatsApp tracking for boutique tailors.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="font-mono text-4xl font-extrabold text-white tabular-nums">
                      ₹{isAnnualBilling ? '4,000' : '5,000'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹48,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/5 pt-6 text-xs text-slate-300">
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Features Included:</div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>1 Branch</strong> location</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>3 Users</strong> (1 Master, 2 Karigars)</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Standard POM measurement templates</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>WhatsApp client notifications</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-slate-400">
                    <Check className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Up to 50 active client fit profiles</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handlePlanChoice('starter')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full"
                >
                  Choose Plan
                </Button>
              </div>
            </Card>

            {/* PRO TIER (WITH GOLD RIBBON) */}
            <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/50 flex flex-col justify-between relative transform lg:-translate-y-2 shadow-ios-gold-lg">
              {/* POPULARITY RIBBON */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-[11px] px-4 py-1 rounded-full uppercase tracking-wider shadow-ios-sm">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <Badge variant="gold" size="sm">Professional</Badge>
                  <span className="text-xs text-yellow-300 font-semibold">Growing Ateliers</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">Atelier Pro</h3>
                <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                  Full 2D CAD cutting engine, dynamic BOM presets, posture compensation, and Karigar SAM ledger.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="font-mono text-4xl font-extrabold text-white tabular-nums">
                      ₹{isAnnualBilling ? '12,000' : '15,000'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹1,44,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6 text-xs text-slate-200">
                  <div className="font-semibold text-yellow-300 text-xs uppercase tracking-wider mb-2">Everything in Starter, plus:</div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>3 Branch</strong> locations</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>10 Users</strong> (Master Cutters & Staff)</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Custom 2D landmark mapping & posture deltas</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Dynamic Bill of Materials (BOM) for 12 presets</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Active Karigar SAM time tracking & payouts</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => handlePlanChoice('pro')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full shadow-ios-gold"
                >
                  Choose Plan
                </Button>
              </div>
            </Card>

            {/* ENTERPRISE TIER */}
            <Card variant="glass" padding="lg" className="rounded-3xl border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info" size="sm">Enterprise</Badge>
                  <span className="text-xs text-slate-400 font-medium">Multi-City Networks</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-2">Atelier Enterprise</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Unlimited multi-tenant branches, custom garment CAD schemas, REST API, and ERP integrations.
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="font-mono text-4xl font-extrabold text-white tabular-nums">
                      ₹{isAnnualBilling ? '36,000' : '45,000'}
                    </span>
                    <span className="text-slate-400 text-xs font-medium ml-2">/ month</span>
                  </div>
                  {isAnnualBilling && (
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Billed annually (₹4,32,000/yr)
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/5 pt-6 text-xs text-slate-300">
                  <div className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Everything in Pro, plus:</div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>Unlimited Branches</strong> & Global Routing</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong>Unlimited Users</strong> & Karigars</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Custom Garment CAD Schemas & 3D Hooks</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Priority 24/7 Support & SLA 99.9%</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>REST API & ERP/POS Integration Access</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handlePlanChoice('enterprise')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full"
                >
                  Choose Plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section id="testimonials" className="py-20 bg-[#07090E] border-t border-white/5 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="gold" size="sm" className="mb-3">Atelier Voices</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-12 tracking-tight">
            Trusted by Premier Savile Row & Indian Heritage Boutiques
          </h2>

          {/* CAROUSEL CARD */}
          <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/35 text-left min-h-[280px] flex flex-col justify-between shadow-ios-gold-lg">
            <div>
              <div className="flex items-center space-x-1.5 mb-5">
                {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">
                  <Badge variant="gold" size="sm">{TESTIMONIALS[testimonialIndex].badge}</Badge>
                </span>
              </div>

              <p className="text-lg sm:text-xl text-slate-100 font-medium leading-relaxed mb-6 italic tracking-tight">
                "{TESTIMONIALS[testimonialIndex].quote}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/10">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  {TESTIMONIALS[testimonialIndex].author}
                </h4>
                <p className="text-xs text-yellow-400 font-medium mt-0.5">
                  {TESTIMONIALS[testimonialIndex].role} —{' '}
                  <span className="text-slate-300">{TESTIMONIALS[testimonialIndex].atelier}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex space-x-1.5 px-1.5">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestimonialIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        testimonialIndex === idx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-slate-700'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQS ACCORDION */}
      <section id="faqs" className="py-20 md:py-28 relative bg-[#090D16] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <Badge variant="neutral" size="sm">Clear Answers</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything you need to know about implementing YellowHouse Tailoring OS in your atelier.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <Card
                  key={index}
                  variant="glass"
                  padding="none"
                  className="rounded-2.5xl border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-trigger-${index}`}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white pr-4 tracking-tight">
                      {faq.question}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-850 flex items-center justify-center text-yellow-400 shrink-0 border border-white/10">
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      className="px-6 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 animate-fade-in"
                    >
                      {faq.answer}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#07090E] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/40 text-center relative overflow-hidden shadow-ios-gold-lg">
            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              <Badge variant="gold" size="sm">Elevate Your Bespoke Operation</Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Ready to Digitize Your Cutting Table & Workshop?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Join master cutters, karigars, and luxury bespoke houses worldwide. Setup takes under 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => handlePlanChoice('starter')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-ios-gold"
                >
                  Start Free Onboarding
                </Button>
                <Link
                  href="/login"
                  className="btn-apple bg-slate-850/90 text-slate-200 hover:text-white border border-white/10 hover:bg-slate-800 px-6 py-3 rounded-full text-sm font-medium w-full sm:w-auto text-center"
                >
                  Existing Atelier Sign In
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* APPLE-GRADE FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950/90 py-14 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* BRAND COLUMN */}
            <div className="md:col-span-2 space-y-3.5">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-ios-sm">
                  <Scissors className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-white text-base tracking-tight">
                  YellowHouse Tailoring OS
                </span>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The premier multi-tenant operating system for bespoke tailors, custom suit ateliers, and Indian heritage sherwani houses. Automating CAD measurements, posture deltas, and Karigar piece-rates.
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">System Operational 99.99% Uptime</span>
              </div>
            </div>

            {/* PRODUCT COLUMN */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#cad-engine" className="hover:text-yellow-400 transition-colors">CAD Studio</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Karigar Board</a></li>
                <li><a href="#pricing" className="hover:text-yellow-400 transition-colors">Pricing Plans</a></li>
                <li><Link href="/onboarding" className="hover:text-yellow-400 transition-colors">Onboarding Wizard</Link></li>
                <li><Link href="/redhouse-os" className="hover:text-yellow-400 transition-colors">RedHouse Ecosystem</Link></li>
              </ul>
            </div>

            {/* SOLUTIONS COLUMN */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Solutions</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Savile Row Ateliers</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Indian Heritage Couture</a></li>
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Multi-Branch Boutiques</a></li>
                <li><a href="#demo-accounts" className="hover:text-yellow-400 transition-colors">Karigar Piece-Rate Pay</a></li>
              </ul>
            </div>

            {/* LEGAL COLUMN */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/legal/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/security" className="hover:text-yellow-400 transition-colors">Security & Isolation</Link></li>
                <li><a href="mailto:support@yellowhouse.io" className="hover:text-yellow-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
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
