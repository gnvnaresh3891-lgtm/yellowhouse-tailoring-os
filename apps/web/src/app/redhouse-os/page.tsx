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
  HeartHandshake,
  CheckCircle,
  Sliders,
  DollarSign,
  Box,
  Flame,
  BadgePercent,
  Play
} from 'lucide-react';
import { useCurrency } from '@/components/currency-context';
import { useToast } from '@/components/toast-context';

const SERVICES_GRID = [
  {
    id: 'blouses',
    name: 'Bespoke Blouse Stitching',
    tagline: 'Maggam, Aari & Bridal Cut',
    price: 990,
    rating: 4.9,
    reviews: 1420,
    imageBg: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-rose-500/30 hover:border-rose-500/70',
    iconColor: 'text-rose-400',
    tags: ['Princess Cut', 'Padded', 'Maggam Work', 'Deep Back'],
    href: '/redhouse/marketplace'
  },
  {
    id: 'lehenga',
    name: 'Lehenga Choli & Ghagra Sets',
    tagline: 'Bridal, Sangeet & Reception',
    price: 2499,
    rating: 5.0,
    reviews: 890,
    imageBg: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    borderColor: 'border-yellow-500/30 hover:border-yellow-500/70',
    iconColor: 'text-yellow-400',
    tags: ['Can-Can Flare', 'Double Dupatta', 'Heavy Zari', 'Custom Fit'],
    href: '/redhouse/marketplace'
  },
  {
    id: 'salwar',
    name: 'Salwar Kameez & Anarkalis',
    tagline: 'Floor-Length, Pakistani & Straight',
    price: 1199,
    rating: 4.8,
    reviews: 2150,
    imageBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/70',
    iconColor: 'text-emerald-400',
    tags: ['Pant Suit', 'Churidar', 'Sharara / Gharara', 'Lining Added'],
    href: '/redhouse/marketplace'
  },
  {
    id: 'indo-western',
    name: 'Indo-Western & Crop Top Sets',
    tagline: 'Draped Sarees & Capes',
    price: 1899,
    rating: 4.9,
    reviews: 620,
    imageBg: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-indigo-500/30 hover:border-indigo-500/70',
    iconColor: 'text-indigo-400',
    tags: ['Draped Pleats', 'Jacket Overlay', 'Couture Cut', 'Cocktail Wear'],
    href: '/redhouse/bidding'
  },
  {
    id: 'gowns',
    name: 'Evening Gowns & Western Dresses',
    tagline: 'Corsetry, Slits & Mermaid Trains',
    price: 3499,
    rating: 4.9,
    reviews: 410,
    imageBg: 'from-purple-500/20 via-violet-500/10 to-transparent',
    borderColor: 'border-purple-500/30 hover:border-purple-500/70',
    iconColor: 'text-purple-400',
    tags: ['Boning / Cups', 'Floor Train', 'Illusion Mesh', 'Cocktail'],
    href: '/redhouse/stylists'
  },
  {
    id: 'machinery-hardware',
    name: 'Digital Textile Print & Laser Cuts',
    tagline: 'Industrial Hardware On-Demand',
    price: 450,
    unit: '/ hr',
    rating: 5.0,
    reviews: 320,
    imageBg: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-blue-500/30 hover:border-blue-500/70',
    iconColor: 'text-blue-400',
    tags: ['Mimaki Sublimation', 'Lectra Laser', 'Tajima Embroidery', '30m Buffers'],
    href: '/redhouse/equipment'
  }
];

const STEPS = [
  {
    num: '01',
    title: 'Select Garment & Customize',
    desc: 'Pick your silhouette, neckline, sleeve style, or upload sample reference sketches from Instagram/Pinterest.',
    icon: Scissors,
    pill: 'Step 1'
  },
  {
    num: '02',
    title: 'Free Doorstep Measurement',
    desc: 'Our Master Tailor visits your home with sample swatches, or you can send your best-fitting sample garment.',
    icon: Ruler,
    pill: 'Step 2'
  },
  {
    num: '03',
    title: 'Expert Master Stitching',
    desc: 'Crafted by dedicated Karigars with overlocking, seamless piping, and optional hand-embroidered Maggam work.',
    icon: Award,
    pill: 'Step 3'
  },
  {
    num: '04',
    title: 'Free Delivery & Alterations',
    desc: 'Delivered directly to your doorstep in 7-10 days with a 100% Perfect Fit Guarantee and lifetime free adjustments.',
    icon: Truck,
    pill: 'Step 4'
  }
];

const WHY_US = [
  {
    title: '100% Perfect Fit Guarantee',
    desc: 'Free alterations within 30 days if your fit is anything less than flattering.',
    icon: ShieldCheck,
    color: 'text-emerald-400'
  },
  {
    title: '7-Day Turnaround Available',
    desc: 'Express rush stitching for upcoming weddings, festivals, and emergency events.',
    icon: Clock,
    color: 'text-yellow-400'
  },
  {
    title: 'Experienced Master Karigars',
    desc: 'Over 15+ years of bespoke heritage craftsmanship in Hyderabad, Ameerpet & Banjara Hills.',
    icon: Sparkles,
    color: 'text-rose-400'
  },
  {
    title: 'Doorstep Pickup & Delivery',
    desc: 'Never waste time in traffic or crowded tailoring lanes. We handle pickup & delivery.',
    icon: MapPin,
    color: 'text-blue-400'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sravani Reddy',
    location: 'Banjara Hills, Hyderabad',
    service: 'Bridal Lehenga Blouse & Maggam Work',
    quote: 'Urban Tailor stitched 4 blouses for my sister’s wedding. The Maggam embroidery precision and neckline fit were far superior to any local boutique.',
    stars: 5
  },
  {
    name: 'Priyanka Sharma',
    location: 'Gachibowli, Hyderabad',
    service: '3 Designer Salwar Suits',
    quote: 'The doorstep measurement service was so professional. The Master Tailor brought fabric swatch cards and delivered perfectly fitting suits in 7 days!',
    stars: 5
  },
  {
    name: 'Ananya Rao',
    location: 'Jubilee Hills, Hyderabad',
    service: 'Indo-Western Draped Saree Set',
    quote: 'Being able to track every stage from sketch to final stitch gives so much peace of mind. Truly the most modern tailoring experience.',
    stars: 5
  }
];

const FAQS = [
  {
    q: 'How does the Doorstep Measurement & Pickup work?',
    a: 'Simply select your desired garment, click "Book Doorstep Pickup", and pick a date & time. Our stylist/tailor visits your home to take precise body measurements or collect your favorite fitting garment as a reference template.'
  },
  {
    q: 'What is your delivery turnaround time?',
    a: 'Standard delivery is 7 to 10 days. We also provide an Express 3 to 4-day rush delivery option for weddings and festive emergencies.'
  },
  {
    q: 'What if the garment does not fit perfectly?',
    a: 'We offer a 100% Perfect Fit Guarantee. If any adjustment is needed, we arrange a free doorstep pickup, alter it according to your exact notes, and redeliver at zero extra cost.'
  },
  {
    q: 'Can I provide my own dress material / saree?',
    a: 'Yes! You can provide your own fabric, or explore our Vendor Material Sourcing catalog to pick authentic raw silks, organzas, and velvets.'
  },
  {
    q: 'How do I connect with RedHouse OS & YellowHouse Tailoring OS?',
    a: 'RedHouse OS powers our digital design warehouse, machinery sharing, and master tailor bidding network. You can toggle into the full atelier management software anytime.'
  }
];

export default function UrbanTailorInspiredLandingPage() {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Booking Modal State
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    name: '',
    phone: '',
    locality: 'Ameerpet',
    service: 'Bespoke Blouse Stitching',
    date: '2026-08-28',
    timeSlot: '10:00 AM - 01:00 PM',
    notes: ''
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupForm.name || !pickupForm.phone) {
      toast.warning('Please enter your name and phone number.');
      return;
    }
    toast.success(`Doorstep pickup scheduled for ${pickupForm.name} on ${pickupForm.date} (${pickupForm.timeSlot})!`);
    setIsPickupModalOpen(false);
    setPickupForm({
      name: '',
      phone: '',
      locality: 'Ameerpet',
      service: 'Bespoke Blouse Stitching',
      date: '2026-08-28',
      timeSlot: '10:00 AM - 01:00 PM',
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-rose-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 py-2 px-4 text-center text-xs font-bold text-white shadow-md flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Festive Wedding Season Offer: Flat ₹300 OFF on your first Doorstep Tailoring Order! Code: <strong>URBAN300</strong></span>
        <span className="hidden sm:inline opacity-80">| Call/WhatsApp: +91 87908 42828</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP LUXURY NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090E]/90 border-b border-rose-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <Link href="/redhouse-os" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-rose-400 transform group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                    Urban Tailor
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30">
                    Bespoke
                  </span>
                </div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 -mt-0.5">
                  Powered by RedHouse OS
                </span>
              </div>
            </Link>

            {/* NAV LINKS (DESKTOP) */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-300">
              <a href="#services" className="hover:text-rose-400 transition-colors">
                Services & Pricing
              </a>
              <a href="#how-it-works" className="hover:text-rose-400 transition-colors">
                How It Works
              </a>
              <a href="#why-us" className="hover:text-rose-400 transition-colors">
                Why Us
              </a>
              <a href="#testimonials" className="hover:text-rose-400 transition-colors">
                Reviews
              </a>
              <a href="#faqs" className="hover:text-rose-400 transition-colors">
                FAQs
              </a>
              <Link href="/" className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 transition-colors">
                &larr; YellowHouse OS
              </Link>
            </nav>

            {/* ACTION CTA (DESKTOP) */}
            <div className="hidden md:flex items-center space-x-3">
              <a
                href="https://wa.me/918790842828"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setIsPickupModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Doorstep Pickup</span>
              </button>
            </div>

            {/* MOBILE MENU TRIGGER */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-rose-500/20 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold hover:text-rose-400">
              Services & Pricing
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold hover:text-rose-400">
              How It Works
            </a>
            <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold hover:text-rose-400">
              Why Us
            </a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold hover:text-rose-400">
              Reviews
            </a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold hover:text-rose-400">
              FAQs
            </a>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-yellow-400">
              &larr; Switch to YellowHouse OS
            </Link>
            <div className="pt-2 border-t border-slate-900 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); setIsPickupModalOpen(true); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold"
              >
                Book Doorstep Pickup
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (URBAN TAILOR DOORSTEP BESPOKE) */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LEFT HERO TEXT */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-extrabold shadow-xl">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Hyderabad’s #1 Premium Doorstep Custom Tailoring</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Custom Tailoring Crafted For You,{' '}
                <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                  Delivered To Your Doorstep.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience 15+ years of master craftsmanship. From bridal Maggam blouses and designer lehengas to stylish Indo-western silhouettes — we measure, stitch, and deliver right to your home.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setIsPickupModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-base flex items-center justify-center space-x-3 shadow-2xl shadow-rose-600/30 transition-all hover:scale-105"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Free Doorstep Pickup</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#services"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base flex items-center justify-center space-x-2 border border-slate-800 transition-all"
                >
                  <Scissors className="w-5 h-5 text-rose-400" />
                  <span>View Pricing & Catalog</span>
                </a>
              </div>

              {/* TRUST BADGES */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Fit Guarantee</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-yellow-400" /> 7-Day Fast Delivery</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9/5 Rating (5,000+ Fits)</span>
              </div>
            </div>

            {/* RIGHT HERO CARD (INSTANT ESTIMATOR) */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-7 border border-rose-500/30 bg-gradient-to-b from-rose-950/30 via-slate-900/60 to-slate-950 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Quick Doorstep Booking</h3>
                    <p className="text-xs text-slate-400">Tailor visits your home at your scheduled time</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Slots Open Today
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Select Garment Category</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                      value={pickupForm.service}
                      onChange={(e) => setPickupForm({ ...pickupForm, service: e.target.value })}
                    >
                      <option>Bespoke Blouse Stitching (From ₹990)</option>
                      <option>Lehenga Choli & Ghagra Set (From ₹2,499)</option>
                      <option>Salwar Suit & Anarkali (From ₹1,199)</option>
                      <option>Indo-Western & Crop Top (From ₹1,899)</option>
                      <option>Evening Gown / Western Wear (From ₹3,499)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Pickup Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                        value={pickupForm.date}
                        onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Time Slot</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                        value={pickupForm.timeSlot}
                        onChange={(e) => setPickupForm({ ...pickupForm, timeSlot: e.target.value })}
                      >
                        <option>10:00 AM - 01:00 PM</option>
                        <option>01:00 PM - 04:00 PM</option>
                        <option>04:00 PM - 07:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Your Locality in Hyderabad</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                      value={pickupForm.locality}
                      onChange={(e) => setPickupForm({ ...pickupForm, locality: e.target.value })}
                    >
                      <option>Ameerpet / SR Nagar</option>
                      <option>Banjara Hills / Jubilee Hills</option>
                      <option>Gachibowli / HITEC City / Madhapur</option>
                      <option>Kondapur / Miyapur / Kukatpally</option>
                      <option>Secunderabad / Begumpet</option>
                      <option>Other Hyderabad Location</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setIsPickupModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Doorstep Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  ⚡ Free pickup, doorstep measuring & zero upfront cancellation fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SERVICES & PRICING GRID (URBAN TAILOR STYLE) */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 md:py-28 relative bg-[#090C14] border-y border-rose-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Transparent Pricing & Catalog
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Popular Custom Tailoring Services
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Fixed, upfront stitching prices with premium lining, piping, and free alterations included.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_GRID.map((srv) => (
              <div
                key={srv.id}
                className={`glass-card rounded-3xl p-7 border ${srv.borderColor} bg-gradient-to-b ${srv.imageBg} flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-xl`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{srv.rating}</span>
                      <span className="text-slate-500 font-normal">({srv.reviews})</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800">
                      7-Day Delivery
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{srv.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{srv.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold">Starting from</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {formatCurrency(srv.price)}
                    </span>
                    {srv.unit && <span className="text-xs text-slate-400">{srv.unit}</span>}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {srv.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPickupForm({ ...pickupForm, service: srv.name });
                      setIsPickupModalOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Book Pickup
                  </button>
                  <Link
                    href={srv.href}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold"
                    title="View RedHouse Plugin / Blueprints"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (4 CONVENIENT STEPS) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Hassle-Free Process
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              How Doorstep Tailoring Works
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              No multiple trips to crowded markets. Get bespoke outfits stitched in 4 effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-7 rounded-3xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl space-y-4 hover:border-rose-500/50 transition-all hover:scale-[1.02] shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-rose-500 font-mono">{step.num}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {step.pill}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-rose-400 w-fit">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHY CHOOSE US */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-20 md:py-28 relative bg-[#090C14] border-y border-rose-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Bespoke Quality Standard
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Why Over 5,000+ Women Love Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-7 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3.5"
                >
                  <div className={`p-3 rounded-2xl bg-slate-900 w-fit ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TESTIMONIALS */}
      {/* ========================================================================= */}
      <section id="testimonials" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Customer Love
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Real Reviews from Real Clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-7 rounded-3xl bg-slate-950/70 border border-slate-800/90 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-slate-900">
                  <div className="font-bold text-sm text-white">{t.name}</div>
                  <div className="text-[11px] text-rose-400 font-semibold">{t.service}</div>
                  <div className="text-[10px] text-slate-500">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQS */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-20 md:py-28 relative bg-[#090C14] border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
              Got Questions?
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
      {/* 8. FOOTER CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-950 border-t border-rose-500/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready for Your <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Perfect Fit</span>?
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Book a free doorstep measurement slot today. Flat ₹300 OFF on your first order.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsPickupModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-base shadow-2xl flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Free Pickup Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05070A] border-t border-slate-900 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-black text-base text-white">Urban Tailor</div>
            <p className="text-slate-400 leading-relaxed">
              Premium custom tailoring and doorstep measuring in Hyderabad. Powered by the RedHouse OS & YellowHouse Tailoring Platform.
            </p>
            <div className="text-slate-400">📞 +91 87908 42828</div>
            <div className="text-slate-400">📍 Ameerpet & Banjara Hills, Hyderabad</div>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Service Areas</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>Ameerpet & SR Nagar</li>
              <li>Banjara Hills & Jubilee Hills</li>
              <li>Gachibowli & Madhapur</li>
              <li>Kondapur & Hitec City</li>
              <li>Secunderabad & Begumpet</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Tailoring Categories</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>Bespoke Maggam Blouses</li>
              <li>Bridal Lehenga Cholis</li>
              <li>Salwar Kameez & Anarkalis</li>
              <li>Indo-Western Fusion Sets</li>
              <li>Evening Gowns & Drapes</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3">Software & Plugins</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-yellow-400">YellowHouse Atelier OS</Link></li>
              <li><Link href="/redhouse" className="hover:text-rose-400">RedHouse Plugin Hub</Link></li>
              <li><Link href="/marketplace" className="hover:text-white">3D Tech Pack Warehouse</Link></li>
              <li><Link href="/equipment" className="hover:text-white">Machinery Rentals</Link></li>
              <li><Link href="/bidding" className="hover:text-white">Artisan Bidding Network</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. DOORSTEP PICKUP BOOKING POPUP MODAL */}
      {/* ========================================================================= */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-7 border border-rose-500/40 bg-[#0B0F19] max-w-lg w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Book Free Doorstep Pickup</h3>
                <p className="text-xs text-slate-400">Our Master Tailor will visit your home for measurements</p>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sravani Reddy"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  value={pickupForm.name}
                  onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    value={pickupForm.phone}
                    onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Locality in Hyderabad</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    value={pickupForm.locality}
                    onChange={(e) => setPickupForm({ ...pickupForm, locality: e.target.value })}
                  >
                    <option>Ameerpet / SR Nagar</option>
                    <option>Banjara Hills</option>
                    <option>Jubilee Hills</option>
                    <option>Gachibowli / Hitec City</option>
                    <option>Madhapur / Kondapur</option>
                    <option>Secunderabad / Begumpet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Garment to Stitch</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  value={pickupForm.service}
                  onChange={(e) => setPickupForm({ ...pickupForm, service: e.target.value })}
                >
                  <option>Bespoke Blouse Stitching (Starting ₹990)</option>
                  <option>Lehenga Choli & Ghagra Set (Starting ₹2,499)</option>
                  <option>Salwar Kameez & Anarkali (Starting ₹1,199)</option>
                  <option>Indo-Western & Crop Top Set (Starting ₹1,899)</option>
                  <option>Evening Gown / Western Dress (Starting ₹3,499)</option>
                  <option>Fabric & Custom Alterations</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pickup Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    value={pickupForm.date}
                    onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Preferred Time Slot</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                    value={pickupForm.timeSlot}
                    onChange={(e) => setPickupForm({ ...pickupForm, timeSlot: e.target.value })}
                  >
                    <option>10:00 AM - 01:00 PM</option>
                    <option>01:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Special Design / Neckline Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need deep sweetheart back, padded cups, and golden piping..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                  value={pickupForm.notes}
                  onChange={(e) => setPickupForm({ ...pickupForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold shadow-lg"
                >
                  Confirm Doorstep Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
