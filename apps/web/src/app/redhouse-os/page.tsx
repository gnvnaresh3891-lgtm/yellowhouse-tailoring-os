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
  Flame,
  BadgePercent,
  Compass,
  Building,
  HeartHandshake
} from 'lucide-react';
import { useCurrency } from '@/components/currency-context';
import { useToast } from '@/components/toast-context';

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
    href: '/redhouse/marketplace'
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
    href: '/redhouse/marketplace'
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
    href: '/redhouse/marketplace'
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
    href: '/redhouse/bidding'
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
    href: '/redhouse/stylists'
  },
  {
    id: 'machinery-hardware',
    name: 'Textile Print & Laser Cutting',
    tagline: 'Industrial Machinery On-Demand',
    price: 450,
    unit: '/ hr',
    rating: 5.0,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    tags: ['Mimaki Sublimation', 'Lectra Laser', 'Tajima Embroidery', '30m Buffers'],
    categoryBadge: 'B2B Hardware',
    turnaround: 'Instant Slots',
    href: '/redhouse/equipment'
  }
];

const STEPS = [
  {
    num: '01',
    title: 'Choose Garment & Style',
    desc: 'Select your silhouette, neckline, and back design, or share reference sketches from Pinterest or Instagram.',
    icon: Scissors
  },
  {
    num: '02',
    title: 'Doorstep Measurement',
    desc: 'A verified Master Stylist visits your home with fabric swatches, or you can provide a sample garment for fit.',
    icon: Ruler
  },
  {
    num: '03',
    title: 'Master Atelier Crafting',
    desc: 'Hand-cut, stitched, and finished by master karigars with reinforced seams, soft piping, and optional Maggam work.',
    icon: Award
  },
  {
    num: '04',
    title: 'Doorstep Delivery & Alterations',
    desc: 'Delivered directly to your home with our 100% Perfect Fit Guarantee and lifetime free adjustments.',
    icon: Truck
  }
];

const WHY_US = [
  {
    title: '100% Perfect Fit Guarantee',
    desc: 'If anything feels imperfect, we adjust and redeliver at zero extra charge.',
    icon: ShieldCheck
  },
  {
    title: '7-Day Guaranteed Delivery',
    desc: 'Express rush stitching options available for upcoming events, sangeets, and weddings.',
    icon: Clock
  },
  {
    title: '15+ Years Craftsmanship',
    desc: 'Over 5,000+ happy clients across Ameerpet, Banjara Hills, Jubilee Hills & Hitec City.',
    icon: Sparkles
  },
  {
    title: 'Doorstep Convenience',
    desc: 'Zero traffic, zero boutique hassles. Measurements, fabric pickup, and delivery at home.',
    icon: MapPin
  }
];

const TESTIMONIALS = [
  {
    name: 'Sravani Reddy',
    location: 'Banjara Hills, Hyderabad',
    service: 'Bridal Lehenga Blouse & Maggam Work',
    quote: 'UrbanStitch stitched 4 blouses for my wedding. The Maggam embroidery precision and neckline fit were far superior to any local boutique.',
    stars: 5
  },
  {
    name: 'Priyanka Sharma',
    location: 'Gachibowli, Hyderabad',
    service: 'Designer Salwar Suits',
    quote: 'The doorstep measurement service was so courteous and professional. The Master Tailor brought fabric swatch cards and delivered perfectly fitting suits in 7 days!',
    stars: 5
  },
  {
    name: 'Ananya Rao',
    location: 'Jubilee Hills, Hyderabad',
    service: 'Indo-Western Draped Saree Set',
    quote: 'Being able to track every stage from sketch to final stitch gives total peace of mind. Truly Hyderabad’s finest tailoring service.',
    stars: 5
  }
];

const FAQS = [
  {
    q: 'How does Doorstep Measurement & Pickup work?',
    a: 'Select your garment category, pick your preferred date and time slot, and confirm. Our master tailor arrives with measurement tapes and design catalogs to take precise body measurements or collect your favorite fitting reference garment.'
  },
  {
    q: 'What is your standard delivery turnaround?',
    a: 'Our standard turnaround is 7 to 10 days. Express 3 to 4-day rush delivery is also available for wedding and festive emergencies.'
  },
  {
    q: 'What happens if my garment needs an alteration?',
    a: 'We offer a 100% Perfect Fit Guarantee. If any adjustment is needed, simply request an alteration and our team will pick it up, adjust it to perfection, and redeliver at zero cost.'
  },
  {
    q: 'Can I supply my own fabric or dress material?',
    a: 'Yes, absolutely. You can supply your own material, or choose from our authenticated vendor fabric catalogs (pure silk, velvet, organza, linen).'
  },
  {
    q: 'How is RedHouse OS connected to UrbanStitch?',
    a: 'RedHouse OS is the underlying digital fashion engine powering our 3D tech packs, machine rental sharing, and artisan bidding network. You can access the professional atelier tools anytime.'
  }
];

export default function ProfessionalUrbanStitchLightPage() {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Doorstep Modal State
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
      toast.warning('Please provide your name and contact number.');
      return;
    }
    toast.success(`Doorstep pickup confirmed for ${pickupForm.name} on ${pickupForm.date} (${pickupForm.timeSlot})!`);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-rose-500 selection:text-white font-sans antialiased">
      
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <div className="bg-rose-50 border-b border-rose-100 text-xs text-slate-700 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-rose-600">
              <Sparkles className="w-3.5 h-3.5" /> Festive Bridal Offer:
            </span>
            <span>Flat ₹300 OFF on First Doorstep Order. Use code: <strong className="text-rose-700 font-extrabold">STITCH300</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-slate-600 font-medium">
            <a href="tel:+918142424646" className="flex items-center gap-1 hover:text-rose-600 transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> +91 81424 24646
            </a>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Hyderabad • Ameerpet • Banjara Hills
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION (CLEAN WHITE ATELIER LOOK) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* BRAND LOGO */}
            <Link href="/redhouse-os" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-purple-600 to-amber-500 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight">UrbanStitch</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">Bespoke</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Premium Doorstep Tailoring</span>
              </div>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-600">
              <a href="#services" className="hover:text-rose-600 transition-colors">Services & Pricing</a>
              <a href="#how-it-works" className="hover:text-rose-600 transition-colors">How It Works</a>
              <a href="#why-us" className="hover:text-rose-600 transition-colors">Why Us</a>
              <a href="#testimonials" className="hover:text-rose-600 transition-colors">Customer Reviews</a>
              <a href="#faqs" className="hover:text-rose-600 transition-colors">FAQs</a>
              <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">
                &larr; YellowHouse OS
              </Link>
            </nav>

            {/* HEADER ACTIONS */}
            <div className="hidden md:flex items-center space-x-3">
              <a
                href="https://wa.me/918142424646"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setIsPickupModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all hover:shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Pickup</span>
              </button>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600">Services & Pricing</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600">How It Works</a>
            <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600">Why Us</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600">Reviews</a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600">FAQs</a>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-slate-600">&larr; Switch to YellowHouse OS</Link>
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => { setMobileMenuOpen(false); setIsPickupModalOpen(true); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold shadow-md"
              >
                Book Doorstep Pickup
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (BRIGHT & CRISP) */}
      <section className="relative py-16 md:py-24 border-b border-slate-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* HERO LEFT */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Hyderabad’s Premier Doorstep Custom Tailoring</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Custom Tailoring Crafted For You,{' '}
                <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                  Delivered To Your Doorstep.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Enjoy 15+ years of master craftsmanship. From bridal Maggam blouses and designer lehengas to stylish Indo-western silhouettes — our Master Stylists measure, stitch, and deliver right to your home.
              </p>

              {/* HERO VISUAL SHOWCASE TILES */}
              <div className="grid grid-cols-3 gap-3 py-2">
                <div className="relative rounded-2xl overflow-hidden h-28 border border-slate-200 shadow-sm group">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
                    alt="Bridal Blouses"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white">Maggam Blouses</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden h-28 border border-slate-200 shadow-sm group">
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80"
                    alt="Bridal Lehengas"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white">Bridal Lehengas</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden h-28 border border-slate-200 shadow-sm group">
                  <img
                    src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80"
                    alt="Indo-Western"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white">Indo-Western</span>
                </div>
              </div>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setIsPickupModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#services"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center space-x-2 border border-slate-200 transition-colors"
                >
                  <Scissors className="w-4 h-4 text-rose-600" />
                  <span>View Pricing & Catalog</span>
                </a>
              </div>

              {/* METRIC PILLS */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-600 flex-wrap font-semibold">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Fit Guarantee</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-600" /> 7-Day Turnaround</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9/5 Rating (5,000+ Orders)</span>
              </div>
            </div>

            {/* HERO RIGHT (CLEAN WHITE BOOKING CARD) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Schedule Doorstep Pickup</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Master Tailor visits at your convenient time</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Slots Open Today
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Garment Category</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                      value={pickupForm.service}
                      onChange={(e) => setPickupForm({ ...pickupForm, service: e.target.value })}
                    >
                      <option>Bespoke Blouse Stitching (From ₹990)</option>
                      <option>Lehenga Choli & Ghagra (From ₹2,499)</option>
                      <option>Salwar Suit & Anarkali (From ₹1,199)</option>
                      <option>Indo-Western & Crop Top (From ₹1,899)</option>
                      <option>Evening Gown / Western Wear (From ₹3,499)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Pickup Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                        value={pickupForm.date}
                        onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Time Slot</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
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
                    <label className="block text-slate-700 font-bold mb-1">Your Locality in Hyderabad</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                      value={pickupForm.locality}
                      onChange={(e) => setPickupForm({ ...pickupForm, locality: e.target.value })}
                    >
                      <option>Ameerpet / SR Nagar</option>
                      <option>Banjara Hills / Jubilee Hills</option>
                      <option>Gachibowli / Hitec City / Madhapur</option>
                      <option>Kondapur / Miyapur / Kukatpally</option>
                      <option>Secunderabad / Begumpet</option>
                      <option>Other Hyderabad Locality</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setIsPickupModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                >
                  <span>Proceed to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-slate-500 font-medium">
                  Free measurement visit, zero upfront cancellation charge.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SERVICES & PRICING GRID (CLEAN LIGHT CARDS) */}
      <section id="services" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Popular Stitching Services</h2>
            <p className="text-sm text-slate-600">
              Clear, upfront stitching prices with premium lining, piping, and free alterations included.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_GRID.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md"
              >
                {/* Image Header */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-rose-700 shadow-sm border border-slate-200">
                      {srv.categoryBadge}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {srv.turnaround}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      <Star className="w-3 h-3 fill-amber-300" />
                      <span>{srv.rating}</span>
                      <span className="text-slate-200 font-normal">({srv.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{srv.tagline}</p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs text-slate-500 font-medium">Starting from</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">
                        {formatCurrency(srv.price)}
                      </span>
                      {srv.unit && <span className="text-xs text-slate-500 font-medium">{srv.unit}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {srv.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPickupForm({ ...pickupForm, service: srv.name });
                        setIsPickupModalOpen(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow transition-all"
                    >
                      Book Pickup
                    </button>
                    <Link
                      href={srv.href}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                      title="View Technical Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (4 CLEAN WHITE CARDS) */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Convenience First</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How Doorstep Tailoring Works</h2>
            <p className="text-sm text-slate-600">
              No multiple trips to busy markets. Enjoy bespoke stitching in 4 effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-300 font-mono">{step.num}</span>
                    <div className="p-2.5 rounded-xl bg-white text-rose-600 border border-slate-200 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section id="why-us" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Craftsmanship Standard</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Why Hyderabad Chooses Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm"
                >
                  <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 w-fit border border-rose-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section id="testimonials" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Real Experiences</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Loved by 5,000+ Clients</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-7 rounded-3xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-sm"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  "{t.quote}"
                </p>
                <div className="pt-3 border-t border-slate-200">
                  <div className="font-bold text-sm text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-rose-600 font-bold">{t.service}</div>
                  <div className="text-[10px] text-slate-500">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQS */}
      <section id="faqs" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-800 text-sm flex items-center justify-between hover:text-rose-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA (ROSE GRADIENT BANNER) */}
      <section className="py-16 bg-gradient-to-r from-rose-600 via-purple-600 to-amber-600 text-white text-center shadow-inner">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready for Your Perfect Custom Fit?
          </h2>
          <p className="text-sm text-rose-100 font-medium">
            Book a free doorstep measurement slot today. Flat ₹300 OFF on your first order.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsPickupModalOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-white text-rose-700 hover:bg-slate-100 font-extrabold text-sm shadow-xl flex items-center justify-center space-x-2 mx-auto transition-transform hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>Schedule Free Pickup Now</span>
              <ArrowRight className="w-4 h-4 text-rose-600" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. CLEAN LIGHT FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="font-extrabold text-base text-white">UrbanStitch</div>
            <p className="text-slate-400 leading-relaxed">
              Premium custom tailoring and doorstep measuring in Hyderabad. Powered by RedHouse OS & YellowHouse Tailoring Platform.
            </p>
            <div className="text-slate-300 pt-1 font-semibold">📞 +91 81424 24646</div>
            <div className="text-slate-400">📍 Ameerpet & Banjara Hills, Hyderabad</div>
          </div>

          <div>
            <div className="font-bold text-white mb-2.5">Service Areas</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>Ameerpet & SR Nagar</li>
              <li>Banjara Hills & Jubilee Hills</li>
              <li>Gachibowli & Madhapur</li>
              <li>Kondapur & Hitec City</li>
              <li>Secunderabad & Begumpet</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-2.5">Tailoring Services</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>Bespoke Maggam Blouses</li>
              <li>Bridal Lehenga Cholis</li>
              <li>Salwar Kameez & Anarkalis</li>
              <li>Indo-Western Sets</li>
              <li>Western Gowns & Alterations</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-2.5">Platform & Tools</div>
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

      {/* 11. DOORSTEP BOOKING MODAL (CLEAN LIGHT MODAL) */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Book Free Doorstep Pickup</h3>
                <p className="text-xs text-slate-500 font-medium">Our Master Tailor will visit your home for measurements</p>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sravani Reddy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                  value={pickupForm.name}
                  onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 81424 24646"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                    value={pickupForm.phone}
                    onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Locality in Hyderabad</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
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
                <label className="block text-slate-700 font-bold mb-1">Garment to Stitch</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
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
                  <label className="block text-slate-700 font-bold mb-1">Pickup Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                    value={pickupForm.date}
                    onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Time Slot</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
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
                <label className="block text-slate-700 font-bold mb-1">Design / Neckline Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deep sweetheart back, padded cups, golden piping..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                  value={pickupForm.notes}
                  onChange={(e) => setPickupForm({ ...pickupForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all"
                >
                  Confirm Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
