'use client';

import React, { useState } from 'react';
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
  Calendar,
  Layers,
  Users,
  Check,
  ChevronDown,
  MessageCircle,
  Truck,
  Ruler,
  Sliders,
  DollarSign,
  Box,
  Compass,
  Building,
} from 'lucide-react';
import { useCurrency } from '@/components/currency-context';
import { useToast } from '@/components/toast-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ECOSYSTEM_MODULES = [
  {
    id: 'marketplace',
    name: 'Digital Blueprint Exchange',
    tagline: '2D & 3D Pattern Assets, Grade Rules & Tech Packs',
    badge: 'Layer 1 Asset Store',
    badgeVariant: 'gold' as const,
    icon: ShoppingBag,
    href: '/redhouse/marketplace',
    description:
      'Browse and license authenticated CAD patterns, grading markers, and parametric templates for haute couture and bespoke silhouettes.',
  },
  {
    id: 'equipment',
    name: 'Micro-Factory Equipment Sharing',
    tagline: 'High-Precision CNC Cutters & Embroidery Rigs',
    badge: 'Layer 2 Hardware',
    badgeVariant: 'warning' as const,
    icon: Cpu,
    href: '/redhouse/equipment',
    description:
      'Rent machine time across regional micro-factories, reserve automatic spreading tables, and share industrial heavy-stitch facilities.',
  },
  {
    id: 'supply',
    name: 'Certified Fabric & Trims Sourcing',
    tagline: 'Direct Mill Wefts, Super 150s & Handloom Silks',
    badge: 'Layer 3 Supply',
    badgeVariant: 'info' as const,
    icon: Package,
    href: '/redhouse/supply',
    description:
      'Order verified raw materials directly from heritage mills with automated SKU generation, batch tracking, and dye-lot certification.',
  },
  {
    id: 'bidding',
    name: 'Karigar Artisan Bidding Pool',
    tagline: 'On-Demand Hand-Stitch & Zardozi Craftsmen',
    badge: 'Layer 4 Talent',
    badgeVariant: 'gold' as const,
    icon: Users,
    href: '/redhouse/bidding',
    description:
      'Broadcast complex production orders to verified master karigars with escrow-backed piece-rate contracts and SAM milestone auditing.',
  },
  {
    id: 'stylists',
    name: 'Certified Stylist & Fitting Network',
    tagline: 'Doorstep Measurements & Trial Fitting Sessions',
    badge: 'Layer 5 Consultations',
    badgeVariant: 'neutral' as const,
    icon: Award,
    href: '/redhouse/stylists',
    description:
      'Book mobile sartorial stylists who visit client residences with fabric swatch swatches, caliper instruments, and fit trial tools.',
  },
];

const SERVICES_GRID = [
  {
    id: 'blouses',
    name: 'Bespoke Blouse Stitching',
    tagline: 'Bridal, Maggam & Designer Cuts',
    price: 990,
    rating: 4.9,
    reviews: 1420,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    tags: ['Princess Cut', 'Padded', 'Maggam Work', 'Deep Back'],
    categoryBadge: 'Most Popular',
    turnaround: '7 Days',
    href: '/redhouse/marketplace',
  },
  {
    id: 'lehenga',
    name: 'Lehenga Choli & Ghagras',
    tagline: 'Bridal, Sangeet & Reception',
    price: 2499,
    rating: 5.0,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    tags: ['Can-Can Flare', 'Double Dupatta', 'Heavy Zari', 'Custom Fit'],
    categoryBadge: 'Bridal Choice',
    turnaround: '10 Days',
    href: '/redhouse/marketplace',
  },
  {
    id: 'salwar',
    name: 'Salwar Suits & Anarkalis',
    tagline: 'Pakistani, Floor-Length & Straight Cut',
    price: 1199,
    rating: 4.8,
    reviews: 2150,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    tags: ['Pant Suit', 'Churidar', 'Sharara / Gharara', 'Lining Added'],
    categoryBadge: 'Everyday Couture',
    turnaround: '7 Days',
    href: '/redhouse/marketplace',
  },
  {
    id: 'indo-western',
    name: 'Indo-Western & Crop Top Sets',
    tagline: 'Draped Sarees, Capes & Skirts',
    price: 1899,
    rating: 4.9,
    reviews: 620,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    tags: ['Draped Pleats', 'Jacket Overlay', 'Couture Cut', 'Cocktail'],
    categoryBadge: 'Trending',
    turnaround: '7 Days',
    href: '/redhouse/bidding',
  },
  {
    id: 'gowns',
    name: 'Evening Gowns & Western Wear',
    tagline: 'Structured Boning, Corsetry & Slits',
    price: 3499,
    rating: 4.9,
    reviews: 410,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    tags: ['Built-in Cups', 'Floor Train', 'Illusion Mesh', 'Cocktail'],
    categoryBadge: 'Haute Couture',
    turnaround: '10 Days',
    href: '/redhouse/stylists',
  },
  {
    id: 'custom-print',
    name: 'Custom Fabric Printing',
    tagline: 'Digital Sublimation, Silk & Cotton Prints',
    price: 349,
    unit: '/ mtr',
    rating: 4.9,
    reviews: 640,
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    tags: ['Pure Silk Print', 'Organic Cotton', 'High-Res Sublimation', 'Custom Motifs'],
    categoryBadge: 'Print Studio',
    turnaround: '3 Days',
    href: '/redhouse/equipment',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Choose Garment & Silhouette',
    desc: 'Select your pattern, neckline, and structural boning, or link digital sketches from the RedHouse Blueprint exchange.',
    icon: Scissors,
  },
  {
    num: '02',
    title: 'Doorstep Caliper Measurement',
    desc: 'A certified Master Stylist visits your location with POM caliper gauges and fabric swatches to map exact body contours.',
    icon: Ruler,
  },
  {
    num: '03',
    title: 'Master Atelier Crafting',
    desc: 'Hand-cut and assembled by master karigars with floating canvas, reinforced seams, and automated SAM efficiency auditing.',
    icon: Award,
  },
  {
    num: '04',
    title: 'Doorstep Delivery & Alterations',
    desc: 'Delivered directly to your residence with our 100% Perfect Fit Guarantee and lifetime free adjustments.',
    icon: Truck,
  },
];

const WHY_US = [
  {
    title: '100% Perfect Fit Guarantee',
    desc: 'If anything feels imperfect, we adjust and redeliver with zero friction or additional charges.',
    icon: ShieldCheck,
  },
  {
    title: '7-Day Guaranteed Turnaround',
    desc: 'Standardized SAM production allows reliable, precision delivery dates across wedding & formal seasons.',
    icon: Clock,
  },
  {
    title: '15+ Years Craftsmanship',
    desc: 'Serving over 5,000+ discerning patrons across major fashion hubs and heritage atelier districts.',
    icon: Sparkles,
  },
  {
    title: 'Doorstep Sourcing & Fitting',
    desc: 'Zero showroom queues. Seamless mobile appointments for caliper measurements, trials, and deliveries.',
    icon: MapPin,
  },
];

const TESTIMONIALS = [
  {
    name: 'Sravani Reddy',
    location: 'Banjara Hills, Hyderabad',
    service: 'Bridal Lehenga Blouse & Maggam Work',
    quote:
      'The RedHouse ecosystem stitched 4 blouses for my wedding. The Maggam embroidery precision and neckline fit were far superior to any local boutique.',
    stars: 5,
  },
  {
    name: 'Priyanka Sharma',
    location: 'Gachibowli, Hyderabad',
    service: 'Designer Salwar Suits',
    quote:
      'The doorstep measurement service was so courteous and professional. The Master Tailor brought fabric swatch cards and delivered perfectly fitting suits in 7 days!',
    stars: 5,
  },
  {
    name: 'Ananya Rao',
    location: 'Jubilee Hills, Hyderabad',
    service: 'Indo-Western Draped Saree Set',
    quote:
      'Being able to track every stage from digital blueprint to final hand-stitch gives total peace of mind. Truly the premier atelier network.',
    stars: 5,
  },
];

const FAQS = [
  {
    q: 'How does Doorstep Measurement & Pickup work?',
    a: 'Select your garment category, pick your preferred date and time slot, and confirm. Our master stylist arrives with measurement tapes and design catalogs to take precise body measurements or collect your favorite fitting reference garment.',
  },
  {
    q: 'What is your standard delivery turnaround?',
    a: 'Our standard turnaround is 7 to 10 days. Express 3 to 4-day rush delivery is also available for wedding and festive emergencies.',
  },
  {
    q: 'What happens if my garment needs an alteration?',
    a: 'We offer a 100% Perfect Fit Guarantee. If any adjustment is needed, simply request an alteration and our team will pick it up, adjust it to perfection, and redeliver at zero cost.',
  },
  {
    q: 'Can I supply my own fabric or dress material?',
    a: 'Yes, absolutely. You can supply your own material, or choose from our authenticated vendor fabric catalogs (pure silk, velvet, organza, Super 150s wool).',
  },
  {
    q: 'How is RedHouse OS connected to YellowHouse Tailoring OS?',
    a: 'RedHouse OS is the public consumer & B2B exchange layer of YellowHouse Tailoring OS. It connects ateliers, fabric mills, machinery owners, and independent karigars into a collaborative decentralized fashion ecosystem.',
  },
];

export default function RedHouseOSEcosystemPage() {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Doorstep Pickup Modal State
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    name: '',
    phone: '',
    locality: 'Ameerpet',
    service: 'Bespoke Blouse Stitching',
    date: '2026-09-18',
    timeSlot: '10:00 AM - 01:00 PM',
    notes: '',
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupForm.name.trim() || !pickupForm.phone.trim()) {
      toast.warning('Please provide your name and contact phone number.');
      return;
    }
    toast.success(
      `Doorstep appointment confirmed for ${pickupForm.name} on ${pickupForm.date} (${pickupForm.timeSlot})!`
    );
    setIsPickupModalOpen(false);
    setPickupForm({
      name: '',
      phone: '',
      locality: 'Ameerpet',
      service: 'Bespoke Blouse Stitching',
      date: '2026-09-18',
      timeSlot: '10:00 AM - 01:00 PM',
      notes: '',
    });
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 selection:bg-yellow-400 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* LUXURY AMBIENT LIGHTING GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-rose-500/10 via-[#D4AF37]/8 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[650px] h-[650px] bg-gradient-to-t from-purple-900/10 via-amber-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <div className="bg-slate-900/80 border-b border-white/5 text-xs text-slate-400 py-2.5 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Festive Atelier Special:
            </span>
            <span>
              Complimentary Doorstep Caliper Session with promo code:{' '}
              <strong className="text-white font-mono font-bold">REDHOUSE2026</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <a href="tel:+918142424646" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 81424 24646
            </a>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Flagship Hubs: London • Mumbai • Hyderabad
            </span>
          </div>
        </div>
      </div>

      {/* 2. APPLE-GRADE FROSTED GLASS HEADER */}
      <header className="sticky top-0 z-40 glass-topbar transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO */}
            <Link href="/redhouse-os" className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-[#D4AF37] p-0.5 shadow-ios-gold group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-rose-400 group-hover:rotate-12 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-xl text-white tracking-tight group-hover:text-yellow-300 transition-colors">
                    RedHouse
                  </span>
                  <Badge variant="gold" size="sm">OS</Badge>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5">
                  B2B Tailoring Ecosystem
                </span>
              </div>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-300">
              <a href="#modules" className="hover:text-yellow-400 transition-colors">
                Ecosystem Modules
              </a>
              <a href="#services" className="hover:text-yellow-400 transition-colors">
                Couture Services
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#why-us" className="hover:text-white transition-colors">
                Why Us
              </a>
              <a href="#testimonials" className="hover:text-white transition-colors">
                Client Reviews
              </a>
              <a href="#faqs" className="hover:text-white transition-colors">
                FAQs
              </a>
              <Link
                href="/"
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-850 border border-white/10 text-slate-300 hover:text-white hover:border-yellow-400/40 transition-all"
              >
                &larr; Switch to YellowHouse OS
              </Link>
            </nav>

            {/* HEADER ACTIONS */}
            <div className="hidden md:flex items-center space-x-3">
              <a
                href="https://wa.me/918142424646"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/25 flex items-center gap-1.5 transition-colors shadow-ios-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsPickupModalOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Book Doorstep Visit
              </Button>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-850 border border-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-3.5 mx-2 mt-2 animate-fade-in">
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              Ecosystem Modules
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              Couture Services
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              Why Us
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              Reviews
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-200 hover:text-yellow-400 transition-colors"
            >
              FAQs
            </a>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-yellow-300"
            >
              &larr; Switch to YellowHouse OS
            </Link>
            <div className="pt-3 border-t border-white/10">
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPickupModalOpen(true);
                }}
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Book Doorstep Visit
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative py-16 md:py-24 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* HERO LEFT */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-[#D4AF37]/35 text-xs text-yellow-300 font-semibold shadow-ios-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>The Collaborative Digital Fashion & Bespoke Network</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tightest leading-[1.1]">
                Haute Couture Craftsmanship,{' '}
                <span className="bg-gradient-to-r from-yellow-200 via-[#D4AF37] to-rose-400 bg-clip-text text-transparent">
                  Delivered To Your Doorstep.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal tracking-tight">
                Connect directly with certified pattern cutters, digital blueprint exchanges, micro-factory machinery, and doorstep stylists. Backed by the YellowHouse engineering standard.
              </p>

              {/* VISUAL SHOWCASE TILES */}
              <div className="grid grid-cols-3 gap-3.5 py-2">
                <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-32 group">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
                    alt="Bridal Blouses"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">Maggam Blouses</span>
                </Card>

                <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-32 group">
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80"
                    alt="Bridal Lehengas"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">Bridal Lehengas</span>
                </Card>

                <Card variant="glass" padding="none" hoverable className="rounded-2.5xl h-32 group">
                  <img
                    src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80"
                    alt="Indo-Western"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">Indo-Western</span>
                </Card>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setIsPickupModalOpen(true)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-ios-gold"
                >
                  Book Doorstep Caliper Visit
                </Button>

                <a
                  href="#modules"
                  className="btn-apple bg-slate-850/90 text-slate-200 hover:text-white border border-white/10 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold w-full sm:w-auto text-center"
                >
                  Explore Ecosystem Modules
                </a>
              </div>

              {/* METRIC BADGES */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-400 flex-wrap font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> 100% Fit Guarantee
                </span>
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Clock className="w-4 h-4" /> 7-Day Turnaround
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9/5 Rating (5,000+ Orders)
                </span>
              </div>
            </div>

            {/* HERO RIGHT: SCHEDULE CARD */}
            <div className="lg:col-span-5">
              <Card variant="glass" padding="lg" className="rounded-3xl border-white/10 shadow-ios-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight">
                      Schedule Doorstep Appointment
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Master Stylist visits with caliper gauges & swatches
                    </p>
                  </div>
                  <Badge variant="success" size="sm" dot>Slots Open Today</Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Select Garment Category
                    </label>
                    <select
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-medium"
                      value={pickupForm.service}
                      onChange={(e) => setPickupForm({ ...pickupForm, service: e.target.value })}
                    >
                      <option className="bg-slate-900 text-white">Bespoke Blouse Stitching (From ₹990)</option>
                      <option className="bg-slate-900 text-white">Lehenga Choli & Ghagra (From ₹2,499)</option>
                      <option className="bg-slate-900 text-white">Salwar Suit & Anarkali (From ₹1,199)</option>
                      <option className="bg-slate-900 text-white">Indo-Western & Crop Top (From ₹1,899)</option>
                      <option className="bg-slate-900 text-white">Evening Gown / Western Wear (From ₹3,499)</option>
                      <option className="bg-slate-900 text-white">Custom Fabric Printing (From ₹349/mtr)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Preferred Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-mono text-xs"
                        value={pickupForm.date}
                        onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Time Window</label>
                      <select
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-medium text-xs"
                        value={pickupForm.timeSlot}
                        onChange={(e) => setPickupForm({ ...pickupForm, timeSlot: e.target.value })}
                      >
                        <option className="bg-slate-900 text-white">10:00 AM - 01:00 PM</option>
                        <option className="bg-slate-900 text-white">01:00 PM - 04:00 PM</option>
                        <option className="bg-slate-900 text-white">04:00 PM - 07:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Client Locality</label>
                    <select
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-medium"
                      value={pickupForm.locality}
                      onChange={(e) => setPickupForm({ ...pickupForm, locality: e.target.value })}
                    >
                      <option className="bg-slate-900 text-white">Banjara Hills / Jubilee Hills</option>
                      <option className="bg-slate-900 text-white">Ameerpet / SR Nagar</option>
                      <option className="bg-slate-900 text-white">Gachibowli / Hitec City / Madhapur</option>
                      <option className="bg-slate-900 text-white">Kondapur / Miyapur / Kukatpally</option>
                      <option className="bg-slate-900 text-white">Secunderabad / Begumpet</option>
                      <option className="bg-slate-900 text-white">Other Metropolitan Area</option>
                    </select>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setIsPickupModalOpen(true)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full shadow-ios-gold"
                >
                  Proceed to Schedule
                </Button>

                <p className="text-[11px] text-center text-slate-500 font-medium">
                  Complimentary caliper measurement session, zero cancellation penalty.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ECOSYSTEM MARKETPLACE MODULES OVERVIEW GRID */}
      <section id="modules" className="py-20 bg-[#080B14] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="gold" size="sm">Decentralized Platform</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ecosystem Marketplace Modules
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Five interoperable marketplace layers connecting digital CAD patterns, machinery, raw textiles, artisans, and styling professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ECOSYSTEM_MODULES.map((mod) => {
              const IconComp = mod.icon;
              return (
                <Card
                  key={mod.id}
                  variant="glass"
                  padding="lg"
                  hoverable
                  className="rounded-3xl border-white/10 flex flex-col justify-between group shadow-ios-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-white/10 flex items-center justify-center text-yellow-400 shadow-ios-sm group-hover:scale-105 group-hover:border-yellow-400/40 transition-all duration-300">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <Badge variant={mod.badgeVariant} size="sm">
                        {mod.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-yellow-300 transition-colors tracking-tight">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-yellow-400/90 font-mono mt-0.5">{mod.tagline}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/5">
                    <Link
                      href={mod.href}
                      className="btn-apple bg-slate-850 hover:bg-yellow-500/20 text-slate-200 hover:text-yellow-300 border border-white/10 hover:border-yellow-400/40 text-xs font-semibold w-full flex items-center justify-between transition-all"
                    >
                      <span>Launch Module</span>
                      <ArrowRight className="w-4 h-4 text-yellow-400" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. POPULAR COUTURE SERVICES GRID */}
      <section id="services" className="py-20 bg-canvas border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="neutral" size="sm">Transparent Pricing</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bespoke Couture Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Upfront tailored rates with reinforced hand stitching, canvas pieces, and lifetime adjustments included.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_GRID.map((srv) => (
              <Card
                key={srv.id}
                variant="glass"
                padding="none"
                hoverable
                className="rounded-3xl border-white/10 flex flex-col justify-between overflow-hidden group shadow-ios-md"
              >
                {/* Image Header */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D111A] via-transparent to-transparent" />

                  <div className="absolute top-3.5 left-3.5">
                    <Badge variant="gold" size="sm">
                      {srv.categoryBadge}
                    </Badge>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <Badge variant="neutral" size="sm" className="font-mono">
                      <Clock className="w-3 h-3 text-yellow-400 mr-1" />
                      {srv.turnaround}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      <span>{srv.rating}</span>
                      <span className="text-slate-400 font-normal">({srv.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white group-hover:text-yellow-300 transition-colors tracking-tight">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{srv.tagline}</p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Starting from</span>
                      <span className="text-2xl font-black text-white font-mono tabular-nums">
                        {formatCurrency(srv.price)}
                      </span>
                      {srv.unit && <span className="text-xs text-slate-400 font-medium">{srv.unit}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {srv.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-300 font-medium border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/5 flex items-center gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        setPickupForm({ ...pickupForm, service: srv.name });
                        setIsPickupModalOpen(true);
                      }}
                      className="flex-1"
                    >
                      Book Fitting
                    </Button>
                    <Link
                      href={srv.href}
                      className="p-2.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                      title="View Module Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#080B14] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="gold" size="sm">Flawless Process</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Doorstep Bespoke Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No multiple trips to congested fashion markets. Experience couture fitting in 4 smooth steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.num}
                  variant="glass"
                  padding="md"
                  className="rounded-3xl border-white/10 space-y-4 shadow-ios-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-slate-600 font-mono">{step.num}</span>
                    <div className="p-2.5 rounded-2xl bg-yellow-500/15 text-yellow-400 border border-[#D4AF37]/30 shadow-ios-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-display text-base font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{step.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE REDHOUSE */}
      <section id="why-us" className="py-20 bg-canvas border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="neutral" size="sm">Craftsmanship Standard</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Discerning Ateliers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  variant="glass"
                  padding="md"
                  className="rounded-3xl border-white/10 space-y-3 shadow-ios-sm"
                >
                  <div className="p-3 rounded-2xl bg-yellow-500/15 text-yellow-400 w-fit border border-[#D4AF37]/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-base font-bold text-white tracking-tight">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CLIENT REVIEWS */}
      <section id="testimonials" className="py-20 bg-[#080B14] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="gold" size="sm">Verified Reviews</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Loved by Discerning Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.name}
                variant="glass"
                padding="lg"
                className="rounded-3xl border-white/10 space-y-4 shadow-ios-md"
              >
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed font-normal">
                  "{t.quote}"
                </p>
                <div className="pt-3 border-t border-white/5">
                  <div className="font-display font-bold text-sm text-white tracking-tight">{t.name}</div>
                  <div className="text-[11px] text-yellow-400 font-semibold">{t.service}</div>
                  <div className="text-[10px] text-slate-400">{t.location}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQS */}
      <section id="faqs" className="py-20 bg-canvas border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <Badge variant="neutral" size="sm">Knowledge Base</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <Card
                key={faq.q}
                variant="glass"
                padding="none"
                className="rounded-2.5xl border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-semibold text-slate-100 text-sm flex items-center justify-between hover:text-yellow-400 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 shrink-0 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 mt-1 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA BANNER */}
      <section className="py-16 bg-[#080B14] text-white text-center border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 space-y-5">
          <Card variant="gold" padding="lg" className="rounded-3xl border-[#D4AF37]/40 shadow-ios-gold-lg">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready for Your Bespoke Caliper Fit?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Book a complimentary doorstep styling and caliper measurement slot today.
              </p>
              <div className="pt-3">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setIsPickupModalOpen(true)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-ios-gold"
                >
                  Schedule Doorstep Appointment Now
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-950/90 text-slate-400 py-12 text-xs border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2.5">
            <div className="font-display font-bold text-base text-white">RedHouse OS</div>
            <p className="text-slate-400 leading-relaxed">
              Decentralized bespoke tailoring exchange and caliper fitting network. Powered by YellowHouse Tailoring Platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/redhouse" className="hover:text-yellow-400 transition-colors">RedHouse Plugin Hub</Link></li>
              <li><Link href="/marketplace" className="hover:text-yellow-400 transition-colors">3D Tech Pack Warehouse</Link></li>
              <li><Link href="/equipment" className="hover:text-yellow-400 transition-colors">Machinery Rentals</Link></li>
              <li><Link href="/bidding" className="hover:text-yellow-400 transition-colors">Artisan Bidding Network</Link></li>
              <li><Link href="/stylists" className="hover:text-yellow-400 transition-colors">Certified Stylists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-yellow-400 transition-colors">YellowHouse OS Home</Link></li>
              <li><Link href="/onboarding" className="hover:text-yellow-400 transition-colors">Atelier Onboarding</Link></li>
              <li><Link href="/login" className="hover:text-yellow-400 transition-colors">Atelier Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Support & Security</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="mailto:ecosystem@yellowhouse.io" className="hover:text-yellow-400 transition-colors">Contact Support</a></li>
              <li><Link href="/legal/security" className="hover:text-yellow-400 transition-colors">Security & Privacy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-white/5 text-center text-slate-500">
          © 2026 RedHouse OS • YellowHouse Tailoring Technologies Inc. All rights reserved.
        </div>
      </footer>

      {/* DOORSTEP PICKUP MODAL */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 space-y-5 border border-white/15 shadow-ios-xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Book Doorstep Appointment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm your appointment for caliper fitting and fabric swatches
                </p>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Full Name</label>
                <Input
                  type="text"
                  required
                  placeholder="Lord Alistair / Smt. Lakshmi"
                  value={pickupForm.name}
                  onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Contact Phone</label>
                <Input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={pickupForm.phone}
                  onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Date</label>
                  <Input
                    type="date"
                    required
                    value={pickupForm.date}
                    onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Time Window</label>
                  <select
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-medium"
                    value={pickupForm.timeSlot}
                    onChange={(e) => setPickupForm({ ...pickupForm, timeSlot: e.target.value })}
                  >
                    <option className="bg-slate-900 text-white">10:00 AM - 01:00 PM</option>
                    <option className="bg-slate-900 text-white">01:00 PM - 04:00 PM</option>
                    <option className="bg-slate-900 text-white">04:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Locality</label>
                <select
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-[#D4AF37] font-medium"
                  value={pickupForm.locality}
                  onChange={(e) => setPickupForm({ ...pickupForm, locality: e.target.value })}
                >
                  <option className="bg-slate-900 text-white">Banjara Hills / Jubilee Hills</option>
                  <option className="bg-slate-900 text-white">Ameerpet / SR Nagar</option>
                  <option className="bg-slate-900 text-white">Gachibowli / Hitec City / Madhapur</option>
                  <option className="bg-slate-900 text-white">Kondapur / Miyapur / Kukatpally</option>
                  <option className="bg-slate-900 text-white">Secunderabad / Begumpet</option>
                  <option className="bg-slate-900 text-white">Other Metropolitan Area</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPickupModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Confirm Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
