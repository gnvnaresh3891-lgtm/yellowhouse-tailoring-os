'use client';

import React, { useState, useMemo, Suspense } from 'react';
import {
  Ruler, Eye, Save, RotateCcw, ChevronDown, ChevronUp,
  Activity, Calculator, Clock, GitCompare, AlertCircle,
  CheckCircle2, Info, Sparkles, History, ArrowRight, 
  ArrowUpRight, ArrowDownRight, Minus, X, Printer
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';
import { MeasurementCard } from '@/components/print-layouts';

// ============================================================
// TYPE DEFINITIONS (inline for self-contained page)
// ============================================================
type Gender = 'Men' | 'Women';
type GarmentType = 'Sherwani' | 'Suit' | 'Blouse' | 'Lehenga' | 'Anarkali' | 'Corset';
type FitPref = 'Skinny' | 'Slim' | 'Regular' | 'Relaxed';
type UnitSys = 'in' | 'cm';
type ViewMode = 'front' | 'back';
type ShoulderSlope = 'Normal' | 'Sloped' | 'Square';
type ChestStance = 'Normal' | 'Forward' | 'Barrel';
type BackPosture = 'Normal' | 'Stooped' | 'Erect';

const EASE_OFFSETS: Record<string, number> = { 'Skinny': -0.5, 'Slim': 0, 'Regular': 0.5, 'Relaxed': 1.0 };

interface PomField {
  id: string;
  code: string;
  name: string;
  base: number;
  min: number;
  max: number;
  landmarkY: number; // Y position on SVG for hotspot
  landmarkX?: number;
}

interface VersionSnapshot {
  id: string;
  version: string;
  date: string;
  garment: GarmentType;
  status: 'current' | 'archived';
  pomCount: number;
  fitPref?: string;
  customerId?: string;
  customerName?: string;
  pomData?: Record<string, number>;
}

interface FittingDelta {
  pomName: string;
  original: number;
  trial1: number;
  trial2: number;
  delta1: number;
  delta2: number;
}

// ============================================================
// GARMENT-SPECIFIC POM SCHEMAS
// ============================================================
const POM_SCHEMAS: Record<GarmentType, PomField[]> = {
  Sherwani: [
    { id: 'sh-01', code: 'SH-01', name: 'Chest Girth', base: 40, min: 32, max: 56, landmarkY: 200 },
    { id: 'sh-02', code: 'SH-02', name: 'Waist Girth', base: 34, min: 26, max: 50, landmarkY: 280 },
    { id: 'sh-03', code: 'SH-03', name: 'Shoulder Width', base: 18.5, min: 15, max: 22, landmarkY: 140 },
    { id: 'sh-04', code: 'SH-04', name: 'Sleeve Length', base: 25, min: 22, max: 28, landmarkY: 300, landmarkX: 120 },
    { id: 'sh-05', code: 'SH-05', name: 'Sherwani Length', base: 42, min: 36, max: 48, landmarkY: 450 },
    { id: 'sh-06', code: 'SH-06', name: 'Neck Girth', base: 15.5, min: 13, max: 19, landmarkY: 120 },
    { id: 'sh-07', code: 'SH-07', name: 'Bicep Girth', base: 13, min: 10, max: 18, landmarkY: 220, landmarkX: 130 },
    { id: 'sh-08', code: 'SH-08', name: 'Hip Girth', base: 40, min: 34, max: 52, landmarkY: 360 },
  ],
  Suit: [
    { id: 'su-01', code: 'SU-01', name: 'Chest Girth', base: 40, min: 32, max: 56, landmarkY: 200 },
    { id: 'su-02', code: 'SU-02', name: 'Waist Girth', base: 34, min: 26, max: 50, landmarkY: 280 },
    { id: 'su-03', code: 'SU-03', name: 'Shoulder Width', base: 18, min: 15, max: 22, landmarkY: 140 },
    { id: 'su-04', code: 'SU-04', name: 'Sleeve Length', base: 25.5, min: 22, max: 28, landmarkY: 300, landmarkX: 120 },
    { id: 'su-05', code: 'SU-05', name: 'Jacket Length', base: 30, min: 26, max: 34, landmarkY: 400 },
    { id: 'su-06', code: 'SU-06', name: 'Neck Girth', base: 15.5, min: 13, max: 19, landmarkY: 120 },
    { id: 'su-07', code: 'SU-07', name: 'Trouser Waist', base: 34, min: 26, max: 48, landmarkY: 360 },
    { id: 'su-08', code: 'SU-08', name: 'Trouser Outseam', base: 42, min: 36, max: 48, landmarkY: 550 },
    { id: 'su-09', code: 'SU-09', name: 'Trouser Inseam', base: 32, min: 28, max: 36, landmarkY: 580, landmarkX: 220 },
  ],
  Blouse: [
    { id: 'bl-01', code: 'BL-01', name: 'Bust Girth', base: 36, min: 28, max: 48, landmarkY: 210 },
    { id: 'bl-02', code: 'BL-02', name: 'Under-Bust Girth', base: 32, min: 26, max: 42, landmarkY: 240 },
    { id: 'bl-03', code: 'BL-03', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'bl-04', code: 'BL-04', name: 'Shoulder Width', base: 14, min: 12, max: 17, landmarkY: 140 },
    { id: 'bl-05', code: 'BL-05', name: 'Bust Apex Distance', base: 7.5, min: 6, max: 10, landmarkY: 200, landmarkX: 170 },
    { id: 'bl-06', code: 'BL-06', name: 'Front Neck Depth', base: 8, min: 5, max: 12, landmarkY: 135 },
    { id: 'bl-07', code: 'BL-07', name: 'Back Neck Depth', base: 2, min: 1, max: 4, landmarkY: 125 },
    { id: 'bl-08', code: 'BL-08', name: 'Sleeve Length', base: 10, min: 4, max: 24, landmarkY: 250, landmarkX: 130 },
    { id: 'bl-09', code: 'BL-09', name: 'Blouse Length', base: 15, min: 12, max: 20, landmarkY: 330 },
  ],
  Lehenga: [
    { id: 'lh-01', code: 'LH-01', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'lh-02', code: 'LH-02', name: 'Hip Girth', base: 38, min: 32, max: 50, landmarkY: 360 },
    { id: 'lh-03', code: 'LH-03', name: 'Lehenga Length', base: 42, min: 36, max: 48, landmarkY: 550 },
    { id: 'lh-04', code: 'LH-04', name: 'Flare Circumference', base: 120, min: 80, max: 200, landmarkY: 650 },
    { id: 'lh-05', code: 'LH-05', name: 'Kali Panel Count', base: 12, min: 8, max: 24, landmarkY: 500 },
    { id: 'lh-06', code: 'LH-06', name: 'Cancan Height', base: 6, min: 0, max: 12, landmarkY: 620 },
  ],
  Anarkali: [
    { id: 'an-01', code: 'AN-01', name: 'Bust Girth', base: 36, min: 28, max: 48, landmarkY: 210 },
    { id: 'an-02', code: 'AN-02', name: 'Waist Girth', base: 30, min: 24, max: 44, landmarkY: 280 },
    { id: 'an-03', code: 'AN-03', name: 'Hip Girth', base: 38, min: 32, max: 50, landmarkY: 360 },
    { id: 'an-04', code: 'AN-04', name: 'Shoulder Width', base: 14.5, min: 12, max: 18, landmarkY: 140 },
    { id: 'an-05', code: 'AN-05', name: 'Sleeve Length', base: 22, min: 14, max: 26, landmarkY: 300, landmarkX: 120 },
    { id: 'an-06', code: 'AN-06', name: 'Yoke Length', base: 14.5, min: 12, max: 17, landmarkY: 270 },
    { id: 'an-07', code: 'AN-07', name: 'Total Anarkali Length', base: 54, min: 46, max: 62, landmarkY: 600 },
  ],
  Corset: [
    { id: 'co-01', code: 'CO-01', name: 'Bust Girth', base: 34, min: 28, max: 44, landmarkY: 200 },
    { id: 'co-02', code: 'CO-02', name: 'Under-Bust Girth', base: 30, min: 24, max: 40, landmarkY: 230 },
    { id: 'co-03', code: 'CO-03', name: 'Waist (Cinched)', base: 26, min: 20, max: 36, landmarkY: 280 },
    { id: 'co-04', code: 'CO-04', name: 'High Hip Girth', base: 34, min: 28, max: 44, landmarkY: 340 },
    { id: 'co-05', code: 'CO-05', name: 'Busks Front Length', base: 13, min: 10, max: 16, landmarkY: 270 },
    { id: 'co-06', code: 'CO-06', name: 'Side Seam Height', base: 8.5, min: 6, max: 12, landmarkY: 290, landmarkX: 130 },
    { id: 'co-07', code: 'CO-07', name: 'Boning Channel Count', base: 16, min: 10, max: 24, landmarkY: 260 },
  ],
};

const GARMENT_GENDER: Record<GarmentType, Gender> = {
  Sherwani: 'Men', Suit: 'Men',
  Blouse: 'Women', Lehenga: 'Women', Anarkali: 'Women', Corset: 'Women',
};

const MENS_GARMENTS: GarmentType[] = ['Sherwani', 'Suit'];
const WOMENS_GARMENTS: GarmentType[] = ['Blouse', 'Lehenga', 'Anarkali', 'Corset'];

// Version history mock
const versionHistory: VersionSnapshot[] = [
  { id: 'v3', version: 'v3.0', date: 'Aug 5, 2026', garment: 'Sherwani', status: 'current', pomCount: 8 },
  { id: 'v2', version: 'v2.0', date: 'Jul 20, 2026', garment: 'Sherwani', status: 'archived', pomCount: 8 },
  { id: 'v1', version: 'v1.0', date: 'Jun 12, 2026', garment: 'Suit', status: 'archived', pomCount: 9 },
];

// Fitting trial mock data
const fittingDeltas: FittingDelta[] = [
  { pomName: 'Chest Girth', original: 42.5, trial1: 42.0, trial2: 42.25, delta1: -0.5, delta2: -0.25 },
  { pomName: 'Waist Girth', original: 35.0, trial1: 35.5, trial2: 35.25, delta1: +0.5, delta2: +0.25 },
  { pomName: 'Shoulder Width', original: 18.5, trial1: 18.5, trial2: 18.5, delta1: 0, delta2: 0 },
  { pomName: 'Sleeve Length', original: 25.0, trial1: 24.5, trial2: 25.0, delta1: -0.5, delta2: 0 },
  { pomName: 'Sherwani Length', original: 42.0, trial1: 42.0, trial2: 42.0, delta1: 0, delta2: 0 },
  { pomName: 'Neck Girth', original: 15.75, trial1: 16.0, trial2: 15.75, delta1: +0.25, delta2: 0 },
];

// ============================================================
// SVG BODY SILHOUETTE COMPONENT (ENHANCED WITH INTERACTIVE HOTSPOTS)
// ============================================================
function BodySilhouetteSvg({
  gender, viewMode, activePoms, focusedId, measurements, validationErrors,
  shoulderSlope, chestStance, backPosture, heelHeight,
  onSelectHotspot, onHoverHotspot
}: {
  gender: Gender;
  viewMode: ViewMode;
  activePoms: PomField[];
  focusedId: string | null;
  measurements: Record<string, number>;
  validationErrors: Record<string, string>;
  shoulderSlope: ShoulderSlope;
  chestStance: ChestStance;
  backPosture: BackPosture;
  heelHeight: number;
  onSelectHotspot: (id: string) => void;
  onHoverHotspot: (id: string | null) => void;
}) {
  // Dynamic posture modifier offsets
  const shoulderOffsetY = shoulderSlope === 'Sloped' ? 6 : shoulderSlope === 'Square' ? -6 : 0;
  const chestCurveD = chestStance === 'Forward'
    ? 'M 155 170 C 165 195, 195 205, 200 205 C 205 205, 235 195, 245 170'
    : chestStance === 'Barrel'
    ? 'M 150 170 C 160 205, 190 215, 200 215 C 210 215, 240 205, 250 170'
    : 'M 155 170 C 170 185, 190 190, 200 190 C 210 190, 230 185, 245 170';

  const spineDashArray = backPosture === 'Stooped' ? '2 2' : backPosture === 'Erect' ? '8 2' : '4 4';
  const heelOffsetY = (gender === 'Women' && heelHeight > 0) ? heelHeight * 4 : 0;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-10 w-36 h-36 bg-cyan-500/10 blur-[40px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-36 h-36 bg-amber-500/15 blur-[40px] pointer-events-none" />
      
      <svg viewBox="0 0 400 800" className="w-full max-w-[340px] h-auto select-none relative z-10" style={{ filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.7))' }}>
        <defs>
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.8" />
          </filter>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FACC15" floodOpacity="0.9" />
          </filter>
          <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0F172A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>
          <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <pattern id="cad-grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#cad-grid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#334155" strokeWidth="1" opacity="0.5" />
          </pattern>
        </defs>

        {/* Base Blueprint Grid */}
        <rect width="400" height="800" fill="url(#cad-grid-large)" className="opacity-40" />

        {/* CAD Horizontal Alignment Lasers */}
        <g className="opacity-50">
          <line x1="0" y1="120" x2="400" y2="120" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="10" y="115" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Neck Base Line</text>

          <line x1="0" y1="200" x2="400" y2="200" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="10" y="195" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Chest Datum</text>

          <line x1="0" y1="280" x2="400" y2="280" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="10" y="275" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Natural Waistline</text>

          <line x1="0" y1="360" x2="400" y2="360" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="10" y="355" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Seat Height</text>
          
          <line x1="0" y1="550" x2="400" y2="550" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="10" y="545" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Outseam Boundary</text>
        </g>

        {/* Mannequin Silhouette with Posture Modifiers */}
        {gender === 'Men' ? (
          viewMode === 'front' ? (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck */}
              <path d="M 175 65 C 175 30, 225 30, 225 65 C 225 85, 212 95, 208 105 L 208 120 L 192 120 L 192 105 C 188 95, 175 85, 175 65 Z" />
              {/* Torso & Legs with Shoulder Slope Adjustment */}
              <path d={`M 192 120 C 165 120, 135 ${125 + shoulderOffsetY}, 125 ${140 + shoulderOffsetY} C 115 ${155 + shoulderOffsetY}, 110 200, 108 230 C 105 270, 105 320, 108 370 C 112 375, 118 375, 120 370 C 122 330, 125 285, 130 240 C 135 240, 142 235, 145 220 C 148 200, 148 185, 150 180 C 150 240, 150 280, 148 340 C 145 370, 145 390, 145 405 C 140 460, 135 550, 130 630 C 125 700, 120 750, 120 760 C 130 765, 145 765, 155 760 C 160 700, 170 600, 180 500 C 185 450, 195 420, 200 405 C 205 420, 215 450, 220 500 C 230 600, 240 700, 245 760 C 255 765, 270 765, 280 760 C 280 750, 275 700, 270 630 C 265 550, 260 460, 255 405 C 255 390, 255 370, 252 340 C 250 280, 250 240, 250 180 C 252 185, 252 200, 255 220 C 258 235, 265 240, 270 240 C 275 285, 278 330, 280 370 C 282 375, 288 375, 292 370 C 295 320, 295 270, 292 230 C 290 200, 285 ${155 + shoulderOffsetY}, 275 ${140 + shoulderOffsetY} C 265 ${125 + shoulderOffsetY}, 235 120, 208 120 Z`} />
              {/* Dynamic Chest Stance Curve */}
              <path d={chestCurveD} fill="none" stroke={chestStance !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth={chestStance !== 'Normal' ? '1.5' : '1'} />
              {/* Collarbone */}
              <path d={`M 160 ${135 + shoulderOffsetY} Q 200 ${150 + shoulderOffsetY} 240 ${135 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1" />
            </g>
          ) : (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Back */}
              <path d="M 175 65 C 175 30, 225 30, 225 65 C 225 85, 212 95, 208 105 L 208 120 L 192 120 L 192 105 C 188 95, 175 85, 175 65 Z" />
              {/* Torso & Legs Back */}
              <path d={`M 192 120 C 165 120, 135 ${125 + shoulderOffsetY}, 125 ${140 + shoulderOffsetY} C 115 ${155 + shoulderOffsetY}, 110 200, 108 230 C 105 270, 105 320, 108 370 C 112 375, 118 375, 120 370 C 122 330, 125 285, 130 240 C 135 240, 142 235, 145 220 C 148 200, 148 185, 150 180 C 150 240, 150 280, 148 340 C 145 370, 145 390, 145 405 C 140 460, 135 550, 130 630 C 125 700, 120 750, 120 760 C 130 765, 145 765, 155 760 C 160 700, 170 600, 180 500 C 185 450, 195 420, 200 405 C 205 420, 215 450, 220 500 C 230 600, 240 700, 245 760 C 255 765, 270 765, 280 760 C 280 750, 275 700, 270 630 C 265 550, 260 460, 255 405 C 255 390, 255 370, 252 340 C 250 280, 250 240, 250 180 C 252 185, 252 200, 255 220 C 258 235, 265 240, 270 240 C 275 285, 278 330, 280 370 C 282 375, 288 375, 292 370 C 295 320, 295 270, 292 230 C 290 200, 285 ${155 + shoulderOffsetY}, 275 ${140 + shoulderOffsetY} C 265 ${125 + shoulderOffsetY}, 235 120, 208 120 Z`} />
              {/* Back center seam with dynamic posture dash array */}
              <line x1="200" y1="120" x2="200" y2="390" stroke={backPosture !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth="1.5" strokeDasharray={spineDashArray} />
              {/* Shoulder Blades */}
              <path d={`M 160 ${160 + shoulderOffsetY} C 170 ${170 + shoulderOffsetY}, 185 ${175 + shoulderOffsetY}, 195 ${160 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1" />
              <path d={`M 240 ${160 + shoulderOffsetY} C 230 ${170 + shoulderOffsetY}, 215 ${175 + shoulderOffsetY}, 205 ${160 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1" />
            </g>
          )
        ) : (
          viewMode === 'front' ? (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Female */}
              <path d="M 178 62 C 178 35, 222 35, 222 62 C 222 80, 210 90, 206 102 L 206 118 L 194 118 L 194 102 C 190 90, 178 80, 178 62 Z" />
              {/* Torso & Legs Female with Heel Height Shift */}
              <path d={`M 194 118 C 175 118, 145 ${125 + shoulderOffsetY}, 135 ${135 + shoulderOffsetY} C 125 ${145 + shoulderOffsetY}, 115 195, 112 220 C 108 260, 108 310, 112 355 C 115 362, 122 362, 125 355 C 128 320, 132 270, 138 230 C 142 230, 145 225, 148 210 C 150 195, 148 185, 150 180 C 152 230, 155 260, 158 290 C 160 320, 158 370, 158 400 C 155 450, 145 540, 140 620 C 135 690, 130 740, 130 ${750 - heelOffsetY} C 138 ${755 - heelOffsetY}, 150 ${755 - heelOffsetY}, 158 ${750 - heelOffsetY} C 165 690, 175 580, 185 480 C 190 430, 195 400, 200 390 C 205 400, 210 430, 215 480 C 225 580, 235 690, 242 ${750 - heelOffsetY} C 250 ${755 - heelOffsetY}, 262 ${755 - heelOffsetY}, 270 ${750 - heelOffsetY} C 270 740, 265 690, 260 620 C 255 540, 245 450, 242 400 C 242 370, 240 320, 242 290 C 245 260, 248 230, 250 180 C 252 185, 250 195, 252 210 C 255 225, 258 230, 262 230 C 268 270, 272 320, 275 355 C 278 362, 285 362, 288 355 C 292 310, 292 260, 288 220 C 285 195, 275 ${145 + shoulderOffsetY}, 265 ${135 + shoulderOffsetY} C 255 ${125 + shoulderOffsetY}, 225 118, 206 118 Z`} />
              {/* Bust Curves */}
              <path d={chestCurveD} fill="none" stroke={chestStance !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth={chestStance !== 'Normal' ? '1.5' : '1'} />
              {/* Hip definition */}
              <path d="M 155 300 C 145 330, 145 360, 158 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
              <path d="M 245 300 C 255 330, 255 360, 242 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
            </g>
          ) : (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Female Back */}
              <path d="M 178 62 C 178 35, 222 35, 222 62 C 222 80, 210 90, 206 102 L 206 118 L 194 118 L 194 102 C 190 90, 178 80, 178 62 Z" />
              {/* Torso & Legs Female Back */}
              <path d={`M 194 118 C 175 118, 145 ${125 + shoulderOffsetY}, 135 ${135 + shoulderOffsetY} C 125 ${145 + shoulderOffsetY}, 115 195, 112 220 C 108 260, 108 310, 112 355 C 115 362, 122 362, 125 355 C 128 320, 132 270, 138 230 C 142 230, 145 225, 148 210 C 150 195, 148 185, 150 180 C 152 230, 155 260, 158 290 C 160 320, 158 370, 158 400 C 155 450, 145 540, 140 620 C 135 690, 130 740, 130 ${750 - heelOffsetY} C 138 ${755 - heelOffsetY}, 150 ${755 - heelOffsetY}, 158 ${750 - heelOffsetY} C 165 690, 175 580, 185 480 C 190 430, 195 400, 200 390 C 205 400, 210 430, 215 480 C 225 580, 235 690, 242 ${750 - heelOffsetY} C 250 ${755 - heelOffsetY}, 262 ${755 - heelOffsetY}, 270 ${750 - heelOffsetY} C 270 740, 265 690, 260 620 C 255 540, 245 450, 242 400 C 242 370, 240 320, 242 290 C 245 260, 248 230, 250 180 C 252 185, 250 195, 252 210 C 255 225, 258 230, 262 230 C 268 270, 272 320, 275 355 C 278 362, 285 362, 288 355 C 292 310, 292 260, 288 220 C 285 195, 275 ${145 + shoulderOffsetY}, 265 ${135 + shoulderOffsetY} C 255 ${125 + shoulderOffsetY}, 225 118, 206 118 Z`} />
              {/* Back center seam */}
              <line x1="200" y1="120" x2="200" y2="380" stroke={backPosture !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth="1.5" strokeDasharray={spineDashArray} />
            </g>
          )
        )}

        {/* Hotspot Nodes with Radar Ripple & CAD Lasers */}
        {activePoms.map((pom) => {
          let x = pom.landmarkX ?? 200;
          let y = pom.landmarkY;

          // Apply shoulder slope offset to shoulder landmark Y
          if (shoulderOffsetY !== 0 && (pom.code.includes('SH-03') || pom.code.includes('SU-03') || pom.code.includes('BL-04') || pom.code.includes('AN-05'))) {
            y += shoulderOffsetY;
          }
          if (heelOffsetY > 0 && (pom.code.includes('LH-03') || pom.code.includes('AN-04') || pom.code.includes('GO-04'))) {
            y -= heelOffsetY;
          }

          const isFocused = focusedId === pom.id;
          const hasError = !!validationErrors[pom.id];
          const r = 8;

          return (
            <g
              key={pom.id}
              className="cursor-pointer group/hotspot transition-all duration-300"
              onClick={() => onSelectHotspot(pom.id)}
              onMouseEnter={() => onHoverHotspot(pom.id)}
              onMouseLeave={() => onHoverHotspot(null)}
            >
              {/* Invisible Click Expansion Target Area */}
              <circle cx={x} cy={y} r={r + 16} fill="transparent" />

              {isFocused && (
                <>
                  {/* Radar Ripple Animation 1 */}
                  <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#FACC15" strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values={`${r + 4};${r + 22};${r + 4}`} dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Radar Ripple Animation 2 (Staggered) */}
                  <circle cx={x} cy={y} r={r + 14} fill="none" stroke="#EAB308" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values={`${r + 8};${r + 32};${r + 8}`} dur="1.8s" begin="0.45s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" begin="0.45s" repeatCount="indefinite" />
                  </circle>

                  {/* X/Y Crosshair CAD Lasers with animated dash offset */}
                  <line
                    x1="0" y1={y} x2="400" y2={y}
                    stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
                    filter="url(#glow-cyan)" opacity="0.85"
                  >
                    <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
                  </line>
                  <line
                    x1={x} y1="0" x2={x} y2="800"
                    stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
                    filter="url(#glow-cyan)" opacity="0.85"
                  >
                    <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
                  </line>
                </>
              )}

              {/* Core Hotspot Circle */}
              <circle
                cx={x}
                cy={y}
                r={isFocused ? r + 3 : r}
                fill={hasError ? '#EF4444' : isFocused ? '#FACC15' : '#10B981'}
                stroke={isFocused ? '#FFFFFF' : '#0B0F19'}
                strokeWidth={isFocused ? '2.5' : '1.5'}
                filter={isFocused ? 'url(#glow-gold)' : ''}
                className="transition-all duration-300 ease-out"
              />
              <circle cx={x} cy={y} r={isFocused ? 3 : 2} fill="#FFFFFF" />

              {/* Landmark Label */}
              <text
                x={x + 14}
                y={y + 4}
                className={`text-[10px] font-mono font-extrabold tracking-wider ${
                  isFocused ? 'fill-yellow-400' : 'fill-slate-400 group-hover/hotspot:fill-slate-200'
                }`}
                style={{ textShadow: '0px 2px 6px rgba(0,0,0,0.95)' }}
              >
                {pom.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Detail Overlay */}
      {focusedId && (() => {
        const pom = activePoms.find(p => p.id === focusedId);
        if (!pom) return null;
        const val = measurements[pom.id] ?? pom.base;
        const hasError = !!validationErrors[pom.id];
        return (
          <div className="absolute bottom-4 right-4 glass-card-gold rounded-xl p-3 shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-md flex flex-col min-w-[150px] z-20 animate-fade-in">
            <div className="flex items-center justify-between space-x-2 mb-1.5">
              <div className="flex items-center space-x-1.5">
                <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-rose-500' : 'bg-gold-400'} animate-pulse`} />
                <span className="font-mono font-extrabold text-gold-400 text-[10px] uppercase tracking-wider">{pom.code}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-semibold">{pom.min}"–{pom.max}"</span>
            </div>
            <span className="font-semibold text-slate-200 text-xs mb-1">{pom.name}</span>
            <div className="text-right mt-1 border-t border-slate-700/60 pt-1 flex items-baseline justify-end space-x-1">
              <span className="font-mono font-extrabold text-xl text-white">{val}</span>
              <span className="font-mono text-xs text-gold-400 font-bold">in</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// MAIN MEASUREMENTS WORKSPACE CONTENT
// ============================================================
function MeasurementsContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const [customerName, setCustomerName] = useState<string | null>(null);

  const [selectedGender, setSelectedGender] = useState<Gender>('Men');
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>('Sherwani');
  const [viewMode, setViewMode] = useState<ViewMode>('front');
  const [fitPref, setFitPref] = useState<FitPref>('Regular');
  const [unitSystem, setUnitSystem] = useState<UnitSys>('in');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showTrials, setShowTrials] = useState(false);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [selectedVersionSnapshot, setSelectedVersionSnapshot] = useState<VersionSnapshot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (customerId) {
      const customers = getLocalStorage<any[]>('yh_customers', []);
      const customer = customers.find((c: any) => c.id === customerId);
      if (customer) {
        setCustomerName(customer.name);
      }
    }
  }, [customerId]);

  // Posture state
  const [shoulderSlope, setShoulderSlope] = useState<ShoulderSlope>('Normal');
  const [chestStance, setChestStance] = useState<ChestStance>('Normal');
  const [backPosture, setBackPosture] = useState<BackPosture>('Normal');
  const [heelHeight, setHeelHeight] = useState<number>(0);

  // Measurements state
  const activePoms = POM_SCHEMAS[selectedGarment];
  const [measurements, setMeasurements] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const g of Object.values(POM_SCHEMAS)) {
      for (const p of g) { init[p.id] = p.base; }
    }
    return init;
  });

  // Sync state with localStorage on mount
  React.useEffect(() => {
    const stored = getLocalStorage<Record<string, number> | null>('yh_measurements_current', null);
    if (stored) {
      setMeasurements(stored);
    }

    const storedGender = getLocalStorage<Gender | null>('yh_measurements_gender', null);
    if (storedGender) setSelectedGender(storedGender);

    const storedGarment = getLocalStorage<GarmentType | null>('yh_measurements_garment', null);
    if (storedGarment) setSelectedGarment(storedGarment);

    const storedSlope = getLocalStorage<any>('yh_measurements_slope', null);
    if (storedSlope) setShoulderSlope(storedSlope);

    const storedStance = getLocalStorage<any>('yh_measurements_stance', null);
    if (storedStance) setChestStance(storedStance);

    const storedPosture = getLocalStorage<any>('yh_measurements_posture', null);
    if (storedPosture) setBackPosture(storedPosture);

    const storedHeel = getLocalStorage<string | null>('yh_measurements_heel', null);
    if (storedHeel) setHeelHeight(parseInt(storedHeel, 10));

    const initial: VersionSnapshot[] = [
      { 
        id: 'v3', 
        version: 'v3.0', 
        date: 'Aug 5, 2026', 
        garment: 'Sherwani' as GarmentType, 
        status: 'current' as const, 
        pomCount: 8,
        fitPref: 'Slim Bespoke',
        pomData: { 'sh-01': 42.5, 'sh-02': 35.0, 'sh-03': 18.5, 'sh-04': 25.0, 'sh-05': 42.0, 'sh-06': 15.75, 'sh-07': 18.0, 'sh-08': 16.5 }
      },
      { 
        id: 'v2', 
        version: 'v2.0', 
        date: 'Jul 20, 2026', 
        garment: 'Sherwani' as GarmentType, 
        status: 'archived' as const, 
        pomCount: 8,
        fitPref: 'Regular',
        pomData: { 'sh-01': 43.0, 'sh-02': 36.0, 'sh-03': 18.5, 'sh-04': 25.5, 'sh-05': 42.0, 'sh-06': 16.0, 'sh-07': 18.5, 'sh-08': 17.0 }
      },
      { 
        id: 'v1', 
        version: 'v1.0', 
        date: 'Jun 12, 2026', 
        garment: 'Suit' as GarmentType, 
        status: 'archived' as const, 
        pomCount: 9,
        fitPref: 'Regular',
        pomData: { 'su-01': 43.5, 'su-02': 36.5, 'su-03': 18.5, 'su-04': 25.5, 'su-05': 30.5, 'su-06': 16.0, 'su-07': 35.0, 'su-08': 42.5, 'su-09': 32.0 }
      },
    ];
    const storedSnapshots = getLocalStorage<VersionSnapshot[]>('yh_measurement_snapshots', initial);
    setSnapshots(storedSnapshots);
  }, []);

  // Save changes to localStorage
  React.useEffect(() => {
    setLocalStorage('yh_measurements_current', measurements);
    setLocalStorage('yh_measurements_gender', selectedGender);
    setLocalStorage('yh_measurements_garment', selectedGarment);
    setLocalStorage('yh_measurements_slope', shoulderSlope);
    setLocalStorage('yh_measurements_stance', chestStance);
    setLocalStorage('yh_measurements_posture', backPosture);
    setLocalStorage('yh_measurements_heel', heelHeight.toString());
  }, [measurements, selectedGender, selectedGarment, shoulderSlope, chestStance, backPosture, heelHeight]);

  const convertVal = (v: number) => unitSystem === 'cm' ? Number((v * 2.54).toFixed(1)) : v;
  const unitLabel = unitSystem === 'cm' ? 'cm' : 'in';

  // Switch gender resets garment
  const handleGenderChange = (g: Gender) => {
    setSelectedGender(g);
    setSelectedGarment(g === 'Men' ? 'Sherwani' : 'Blouse');
    setFocusedId(null);
  };

  const handleGarmentChange = (g: GarmentType) => {
    setSelectedGarment(g);
    setSelectedGender(GARMENT_GENDER[g]);
    setFocusedId(null);
  };

  const handleMeasurementChange = (pomId: string, val: number) => {
    const inVal = unitSystem === 'cm' ? Number((val / 2.54).toFixed(4)) : val;
    setMeasurements(prev => ({ ...prev, [pomId]: inVal }));
  };

  const handleSaveSnapshot = () => {
    const nextVer = `v${(snapshots.length + 1).toFixed(1)}`;
    const newSnapshot: VersionSnapshot = {
      id: `v-${Date.now()}`,
      version: nextVer,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      garment: selectedGarment,
      status: 'current',
      pomCount: activePoms.length,
      fitPref,
      ...(customerId ? { customerId, customerName: customerName || 'Unknown Customer' } : {})
    };

    const updated = [
      newSnapshot,
      ...snapshots.map(s => s.status === 'current' ? { ...s, status: 'archived' as const } : s)
    ];

    setSnapshots(updated);
    setLocalStorage('yh_measurement_snapshots', updated);
    setToastMessage(`Snapshot ${nextVer} saved successfully!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    for (const pom of activePoms) {
      const v = measurements[pom.id] ?? pom.base;
      if (v < pom.min || v > pom.max) {
        errors[pom.id] = `Value ${v}" outside range (${pom.min}" – ${pom.max}")`;
      }
    }
    return errors;
  }, [activePoms, measurements]);

  const isValid = Object.keys(validationErrors).length === 0;

  return (
    <div className="max-w-7xl xl:max-w-[1500px] mx-auto w-full space-y-6 animate-fade-in relative">
      {/* Glassmorphic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900/90 border border-yellow-500/40 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-2xl shadow-yellow-500/10 text-yellow-400 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Ruler className="w-6 h-6 text-gold-400" />
            <span>Interactive CAD Measurement Engine</span>
            {customerName && (
              <span className="text-sm font-semibold text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full ml-3 border border-slate-700/50 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                {customerName}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">2D landmark SVG vector engine with live CAD laser alignment & posture profiling</p>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip content="Print current CAD anatomical measurement specification sheet">
            <button
              onClick={() => window.print()}
              className="btn-ghost px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
              <span>Print Chart</span>
            </button>
          </Tooltip>

          <Tooltip content="Inspect past CAD measurement snapshots and version logs">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all ${
                showHistory ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'btn-ghost'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History</span>
            </button>
          </Tooltip>

          <Tooltip content="Compare baseline measurements against fitting trial deltas">
            <button
              onClick={() => setShowTrials(!showTrials)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all ${
                showTrials ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'btn-ghost'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Fitting Trials</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card rounded-2xl border border-slate-800/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Toggle */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs">
            {(['Men', 'Women'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => handleGenderChange(g)}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedGender === g ? 'btn-gold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Garment Type */}
          <div className="flex flex-wrap gap-1.5">
            {(selectedGender === 'Men' ? MENS_GARMENTS : WOMENS_GARMENTS).map((g) => (
              <button
                key={g}
                onClick={() => handleGarmentChange(g)}
                className={`px-3.5 py-1.5 text-xs rounded-xl border font-semibold transition-all ${
                  selectedGarment === g
                    ? 'btn-gold border-gold-400'
                    : 'btn-ghost'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Fit Preference */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs">
            {(['Skinny', 'Slim', 'Regular', 'Relaxed'] as FitPref[]).map((f) => (
              <button
                key={f}
                onClick={() => setFitPref(f)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  fitPref === f ? 'btn-gold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Quick Access Version History & Fitting Trials Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs ml-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                showHistory ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History ({snapshots.length})</span>
            </button>

            <button
              onClick={() => setShowTrials(!showTrials)}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                showTrials ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Fitting Trials (2 Runs)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: SVG Body Diagram (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          {/* View Toggle */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gold-400" />
                  <span>2D CAD Interactive Vector Canvas</span>
                </h3>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                  {selectedGender} Silhouette — {selectedGarment} ({viewMode} view)
                </p>
              </div>
              <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs">
                <button
                  onClick={() => setViewMode('front')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'front' ? 'btn-gold' : 'text-slate-400 hover:text-white'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setViewMode('back')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'back' ? 'btn-gold' : 'text-slate-400 hover:text-white'}`}
                >
                  Back
                </button>
              </div>
            </div>

            <BodySilhouetteSvg
              gender={selectedGender}
              viewMode={viewMode}
              activePoms={activePoms}
              focusedId={focusedId}
              measurements={measurements}
              validationErrors={validationErrors}
              shoulderSlope={shoulderSlope}
              chestStance={chestStance}
              backPosture={backPosture}
              heelHeight={heelHeight}
              onSelectHotspot={setFocusedId}
              onHoverHotspot={setFocusedId}
            />

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10B981]" />
                  <span className="text-slate-400">Valid Target</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_4px_#FACC15]" />
                  <span className="text-slate-400">Active Hotspot</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_#EF4444]" />
                  <span className="text-slate-400">Out-of-Range</span>
                </div>
              </div>
              <span className="text-slate-500 font-mono">CAD Vector 400x800</span>
            </div>
          </div>
        </div>

        {/* RIGHT: POM Form + Posture (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* POM Input Form */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-gold-400" />
                  <span>POM Technical Specification — {selectedGarment}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{activePoms.length} measurement points • {unitLabel} units</p>
              </div>
              <Tooltip content="Reset all POM fields to standard base defaults">
                <button
                  onClick={() => {
                    const reset: Record<string, number> = {};
                    activePoms.forEach(p => { reset[p.id] = p.base; });
                    setMeasurements(prev => ({ ...prev, ...reset }));
                  }}
                  className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePoms.map((pom) => {
                const rawVal = measurements[pom.id] ?? pom.base;
                const displayVal = convertVal(rawVal);
                const hasError = !!validationErrors[pom.id];
                const isFocused = focusedId === pom.id;

                const easeOffset = EASE_OFFSETS[fitPref] || 0;
                const isAffected = ['Chest Girth', 'Waist Girth', 'Hip Girth', 'Sleeve Length', 'Bust Girth'].includes(pom.name);

                return (
                  <div
                    key={pom.id}
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      isFocused
                        ? 'bg-gold-500/10 border-gold-400 ring-2 ring-gold-400/40 shadow-lg shadow-gold-500/10'
                        : hasError
                        ? 'bg-rose-500/5 border-rose-500/60'
                        : 'bg-slate-900/50 border-slate-800/60 hover:border-slate-700'
                    }`}
                    onMouseEnter={() => setFocusedId(pom.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-gold-400 font-extrabold px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/20">
                          {pom.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{pom.name}</span>
                        {isAffected && easeOffset !== 0 && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${easeOffset > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                            {easeOffset > 0 ? '+' : ''}{easeOffset} ease
                          </span>
                        )}
                      </div>
                      {hasError ? (
                        <Tooltip content={validationErrors[pom.id]}>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        </Tooltip>
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step={unitSystem === 'cm' ? '0.5' : '0.25'}
                        value={displayVal}
                        onFocus={() => setFocusedId(pom.id)}
                        onChange={(e) => handleMeasurementChange(pom.id, parseFloat(e.target.value) || 0)}
                        className={`flex-1 pom-input ${
                          hasError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-gold-500'
                        }`}
                      />
                      <span className="text-[10px] text-slate-500 font-mono w-6">{unitLabel}</span>
                    </div>

                    {hasError && (
                      <p className="text-[10px] text-rose-400 mt-1.5 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {validationErrors[pom.id]}
                      </p>
                    )}
                    <p className="text-[9px] text-slate-500 mt-1">
                      Range: {convertVal(pom.min)} – {convertVal(pom.max)} {unitLabel}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div className="flex items-center space-x-2 text-xs">
                {isValid ? (
                  <span className="text-emerald-400 flex items-center font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> All values within tolerance
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" /> {Object.keys(validationErrors).length} errors
                  </span>
                )}
              </div>
              <Tooltip content={isValid ? "Save current measurements to version history" : "Fix validation errors to save"}>
                <button
                  disabled={!isValid}
                  onClick={handleSaveSnapshot}
                  className={`btn-gold ${!isValid ? 'opacity-50 cursor-not-allowed filter-none' : ''}`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span>Save Snapshot</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Posture Profile Panel */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gold-400" />
                <h3 className="font-bold text-sm text-white">Posture Profile Modifiers</h3>
              </div>
              {(shoulderSlope !== 'Normal' || chestStance !== 'Normal' || backPosture !== 'Normal' || heelHeight > 0) && (
                <span className="badge badge-gold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Active Modifiers
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shoulder Slope */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Shoulder Slope</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Sloped', 'Square'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setShoulderSlope(opt)}
                      className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        shoulderSlope === opt
                          ? 'btn-gold'
                          : 'btn-ghost'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chest Stance */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Chest Stance</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Forward', 'Barrel'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChestStance(opt)}
                      className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        chestStance === opt
                          ? 'btn-gold'
                          : 'btn-ghost'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back Posture */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Back Posture</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Stooped', 'Erect'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBackPosture(opt)}
                      className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        backPosture === opt
                          ? 'btn-gold'
                          : 'btn-ghost'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heel Height (Women only) */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Heel Height {selectedGender === 'Women' ? '' : '(N/A)'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHeelHeight(h)}
                      disabled={selectedGender === 'Men'}
                      className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        selectedGender === 'Men'
                          ? 'bg-slate-950/30 text-slate-700 border-slate-800/40 cursor-not-allowed'
                          : heelHeight === h
                          ? 'btn-gold'
                          : 'btn-ghost'
                      }`}
                    >
                      {h}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Panel */}
      {showHistory && (
        <div className="glass-card rounded-2xl border border-amber-500/30 p-6 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">CAD Measurement Version History & Snapshots</h3>
                <p className="text-xs text-slate-400">Track historical body fitting revisions, baseline versions, and cutter adjustments.</p>
              </div>
            </div>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors">
              Hide History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {snapshots
              .filter((v) => !customerId || v.customerId === customerId)
              .map((v) => {
                const isSelected = selectedVersionSnapshot?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersionSnapshot(v)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/50'
                        : v.status === 'current'
                        ? 'bg-amber-400/10 border-amber-400/40 hover:border-amber-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full ${
                          v.status === 'current' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {v.version}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {v.date}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{v.garment} Baseline</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Fit Profile: <strong className="text-slate-200">{v.fitPref || 'Regular'}</strong> &bull; {v.pomCount} POM Landmarks</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Click to Inspect Breakdown
                      </span>
                      {v.status !== 'current' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (v.pomData) {
                              setMeasurements(prev => ({ ...prev, ...v.pomData }));
                            }
                            setToastMessage(`Restored snapshot ${v.version} into active workbench!`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="text-xs font-bold text-slate-300 hover:text-amber-300 underline cursor-pointer"
                        >
                          Restore Baseline
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* DISPLAY BELOW: Interactive Historical Snapshot Detail Table */}
          {selectedVersionSnapshot && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                    {selectedVersionSnapshot.version} Snapshot Breakdown
                  </span>
                  <span className="text-xs text-slate-300 font-bold">
                    {selectedVersionSnapshot.garment} &bull; Recorded on {selectedVersionSnapshot.date}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVersionSnapshot(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Inspection
                </button>
              </div>

              {/* Recorded POM Measurements Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedVersionSnapshot.pomData ? (
                  Object.entries(selectedVersionSnapshot.pomData).map(([pomKey, pomValue]) => (
                    <div key={pomKey} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{pomKey.toUpperCase()}</span>
                      <span className="text-lg font-bold text-amber-300 font-mono mt-0.5 block">{pomValue} in</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 p-4 text-center text-xs text-slate-400 italic">
                    Historical baseline measurements recorded with standard anatomical ease allowances.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400">
                  Fit Profile: <strong className="text-white">{selectedVersionSnapshot.fitPref || 'Slim Bespoke'}</strong>
                </span>
                <button
                  onClick={() => {
                    if (selectedVersionSnapshot.pomData) {
                      setMeasurements(prev => ({ ...prev, ...selectedVersionSnapshot.pomData }));
                    }
                    setToastMessage(`Loaded version ${selectedVersionSnapshot.version} values into active workbench!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="btn-gold py-1.5 px-4 text-xs flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load {selectedVersionSnapshot.version} into Cutting Workbench</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fitting Trial Delta Comparison (Conditional) */}
      {showTrials && (
        <div className="glass-card rounded-2xl border border-slate-800/60 p-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Fitting Trial Delta Comparison</h3>
            </div>
            <button onClick={() => setShowTrials(false)} className="text-slate-500 hover:text-white text-xs transition-colors">
              Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider">POM</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gold-400 uppercase tracking-wider">Original</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Trial 1</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Trial 2</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider">Δ1</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider">Δ2</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {fittingDeltas.map((fd, i) => {
                  const getDeltaColor = (d: number) => {
                    if (d === 0) return 'text-emerald-400';
                    if (Math.abs(d) <= 0.25) return 'text-amber-400';
                    return 'text-rose-400';
                  };
                  const getDeltaIcon = (d: number) => {
                    if (d === 0) return <Minus className="w-3 h-3" />;
                    if (d > 0) return <ArrowUpRight className="w-3 h-3" />;
                    return <ArrowDownRight className="w-3 h-3" />;
                  };
                  const getStatus = (d: number) => {
                    if (Math.abs(d) === 0) return { text: 'Perfect', color: 'badge badge-emerald' };
                    if (Math.abs(d) <= 0.25) return { text: 'Tolerance', color: 'badge badge-amber' };
                    return { text: 'Alteration', color: 'badge badge-rose' };
                  };
                  const status = getStatus(fd.delta2);

                  return (
                    <tr key={i} className="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-300">{fd.pomName}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-gold-400 font-bold">{fd.original}"</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-blue-400">{fd.trial1}"</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-purple-400">{fd.trial2}"</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta1)}`}>
                          {getDeltaIcon(fd.delta1)}
                          <span>{fd.delta1 > 0 ? '+' : ''}{fd.delta1}"</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta2)}`}>
                          {getDeltaIcon(fd.delta2)}
                          <span>{fd.delta2 > 0 ? '+' : ''}{fd.delta2}"</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Tooltip content={`Fitting deviation: ${fd.delta2 > 0 ? '+' : ''}${fd.delta2}" relative to baseline`}>
                          <span className={status.color}>
                            {status.text}
                          </span>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Measurement Card Chart (Hidden on screen, rendered on Print) */}
      <MeasurementCard 
        customerName={customerName || 'Bespoke Client'}
        garmentType={selectedGarment}
        fitPref={fitPref}
        measurements={activePoms.reduce((acc, pom) => {
          acc[pom.name] = measurements[pom.id] || pom.base;
          return acc;
        }, {} as Record<string, number>)}
      />
    </div>
  );
}

export default function MeasurementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gold-400">Loading Measurements Workspace...</div>}>
      <MeasurementsContent />
    </Suspense>
  );
}

