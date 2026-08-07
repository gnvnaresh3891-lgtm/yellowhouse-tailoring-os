'use client';

import React, { useState, useMemo } from 'react';
import {
  Ruler, Eye, Save, RotateCcw, ChevronDown, ChevronUp,
  Activity, Calculator, Clock, GitCompare, AlertCircle,
  CheckCircle2, Info, Sparkles, History, ArrowRight, 
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

// ============================================================
// TYPE DEFINITIONS (inline for self-contained page)
// ============================================================
type Gender = 'Men' | 'Women';
type GarmentType = 'Sherwani' | 'Suit' | 'Blouse' | 'Lehenga' | 'Anarkali' | 'Corset';
type FitPref = 'Skinny' | 'Slim' | 'Regular' | 'Relaxed';
type UnitSys = 'in' | 'cm';
type ViewMode = 'front' | 'back';

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
    { id: 'an-04', code: 'AN-04', name: 'Anarkali Length', base: 52, min: 42, max: 58, landmarkY: 600 },
    { id: 'an-05', code: 'AN-05', name: 'Shoulder Width', base: 14.5, min: 12, max: 17, landmarkY: 140 },
    { id: 'an-06', code: 'AN-06', name: 'Sleeve Length', base: 22, min: 8, max: 26, landmarkY: 280, landmarkX: 120 },
    { id: 'an-07', code: 'AN-07', name: 'Flare Width', base: 90, min: 60, max: 150, landmarkY: 650 },
  ],
  Corset: [
    { id: 'co-01', code: 'CO-01', name: 'Bust Girth', base: 34, min: 28, max: 46, landmarkY: 210 },
    { id: 'co-02', code: 'CO-02', name: 'Under-Bust Girth', base: 30, min: 24, max: 40, landmarkY: 240 },
    { id: 'co-03', code: 'CO-03', name: 'Waist Girth (Cinched)', base: 26, min: 22, max: 38, landmarkY: 280 },
    { id: 'co-04', code: 'CO-04', name: 'Hip Girth', base: 38, min: 32, max: 50, landmarkY: 360 },
    { id: 'co-05', code: 'CO-05', name: 'Corset Length CF', base: 13, min: 10, max: 16, landmarkY: 300 },
    { id: 'co-06', code: 'CO-06', name: 'Corset Length CB', base: 14, min: 11, max: 17, landmarkY: 310 },
    { id: 'co-07', code: 'CO-07', name: 'Bust Apex Distance', base: 7.5, min: 6, max: 10, landmarkY: 200, landmarkX: 170 },
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
// SVG BODY SILHOUETTE COMPONENT (INLINE)
// ============================================================
function BodySilhouetteSvg({
  gender, viewMode, activePoms, focusedId, measurements, onSelectHotspot, onHoverHotspot
}: {
  gender: Gender;
  viewMode: ViewMode;
  activePoms: PomField[];
  focusedId: string | null;
  measurements: Record<string, number>;
  onSelectHotspot: (id: string) => void;
  onHoverHotspot: (id: string | null) => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-10 w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none" />
      
      <svg viewBox="0 0 400 800" className="w-full max-w-[340px] h-auto select-none relative z-10" style={{ filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.7))' }}>
        <defs>
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.8" />
          </filter>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.9" />
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

        {/* Mannequin Silhouette */}
        {gender === 'Men' ? (
          viewMode === 'front' ? (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck */}
              <path d="M 175 65 C 175 30, 225 30, 225 65 C 225 85, 212 95, 208 105 L 208 120 L 192 120 L 192 105 C 188 95, 175 85, 175 65 Z" />
              {/* Torso & Legs */}
              <path d="M 192 120 C 165 120, 135 125, 125 140 C 115 155, 110 200, 108 230 C 105 270, 105 320, 108 370 C 112 375, 118 375, 120 370 C 122 330, 125 285, 130 240 C 135 240, 142 235, 145 220 C 148 200, 148 185, 150 180 C 150 240, 150 280, 148 340 C 145 370, 145 390, 145 405 C 140 460, 135 550, 130 630 C 125 700, 120 750, 120 760 C 130 765, 145 765, 155 760 C 160 700, 170 600, 180 500 C 185 450, 195 420, 200 405 C 205 420, 215 450, 220 500 C 230 600, 240 700, 245 760 C 255 765, 270 765, 280 760 C 280 750, 275 700, 270 630 C 265 550, 260 460, 255 405 C 255 390, 255 370, 252 340 C 250 280, 250 240, 250 180 C 252 185, 252 200, 255 220 C 258 235, 265 240, 270 240 C 275 285, 278 330, 280 370 C 282 375, 288 375, 292 370 C 295 320, 295 270, 292 230 C 290 200, 285 155, 275 140 C 265 125, 235 120, 208 120 Z" />
              {/* Chest Curves */}
              <path d="M 155 170 C 170 185, 190 190, 200 190 C 210 190, 230 185, 245 170" fill="none" stroke="#334155" strokeWidth="1" />
              {/* Collarbone */}
              <path d="M 160 135 Q 200 150 240 135" fill="none" stroke="#334155" strokeWidth="1" />
            </g>
          ) : (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Back */}
              <path d="M 175 65 C 175 30, 225 30, 225 65 C 225 85, 212 95, 208 105 L 208 120 L 192 120 L 192 105 C 188 95, 175 85, 175 65 Z" />
              {/* Torso & Legs Back */}
              <path d="M 192 120 C 165 120, 135 125, 125 140 C 115 155, 110 200, 108 230 C 105 270, 105 320, 108 370 C 112 375, 118 375, 120 370 C 122 330, 125 285, 130 240 C 135 240, 142 235, 145 220 C 148 200, 148 185, 150 180 C 150 240, 150 280, 148 340 C 145 370, 145 390, 145 405 C 140 460, 135 550, 130 630 C 125 700, 120 750, 120 760 C 130 765, 145 765, 155 760 C 160 700, 170 600, 180 500 C 185 450, 195 420, 200 405 C 205 420, 215 450, 220 500 C 230 600, 240 700, 245 760 C 255 765, 270 765, 280 760 C 280 750, 275 700, 270 630 C 265 550, 260 460, 255 405 C 255 390, 255 370, 252 340 C 250 280, 250 240, 250 180 C 252 185, 252 200, 255 220 C 258 235, 265 240, 270 240 C 275 285, 278 330, 280 370 C 282 375, 288 375, 292 370 C 295 320, 295 270, 292 230 C 290 200, 285 155, 275 140 C 265 125, 235 120, 208 120 Z" />
              {/* Back center seam */}
              <line x1="200" y1="120" x2="200" y2="390" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              {/* Shoulder Blades */}
              <path d="M 160 160 C 170 170, 185 175, 195 160" fill="none" stroke="#334155" strokeWidth="1" />
              <path d="M 240 160 C 230 170, 215 175, 205 160" fill="none" stroke="#334155" strokeWidth="1" />
            </g>
          )
        ) : (
          viewMode === 'front' ? (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Female */}
              <path d="M 178 62 C 178 35, 222 35, 222 62 C 222 80, 210 90, 206 102 L 206 118 L 194 118 L 194 102 C 190 90, 178 80, 178 62 Z" />
              {/* Torso & Legs Female */}
              <path d="M 194 118 C 175 118, 145 125, 135 135 C 125 145, 115 195, 112 220 C 108 260, 108 310, 112 355 C 115 362, 122 362, 125 355 C 128 320, 132 270, 138 230 C 142 230, 145 225, 148 210 C 150 195, 148 185, 150 180 C 152 230, 155 260, 158 290 C 160 320, 158 370, 158 400 C 155 450, 145 540, 140 620 C 135 690, 130 740, 130 750 C 138 755, 150 755, 158 750 C 165 690, 175 580, 185 480 C 190 430, 195 400, 200 390 C 205 400, 210 430, 215 480 C 225 580, 235 690, 242 750 C 250 755, 262 755, 270 750 C 270 740, 265 690, 260 620 C 255 540, 245 450, 242 400 C 242 370, 240 320, 242 290 C 245 260, 248 230, 250 180 C 252 185, 250 195, 252 210 C 255 225, 258 230, 262 230 C 268 270, 272 320, 275 355 C 278 362, 285 362, 288 355 C 292 310, 292 260, 288 220 C 285 195, 275 145, 265 135 C 255 125, 225 118, 206 118 Z" />
              {/* Bust Curves */}
              <path d="M 155 170 C 165 210, 190 220, 200 200 C 210 220, 235 210, 245 170" fill="none" stroke="#334155" strokeWidth="1" />
              {/* Hip definition */}
              <path d="M 155 300 C 145 330, 145 360, 158 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
              <path d="M 245 300 C 255 330, 255 360, 242 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
            </g>
          ) : (
            <g className="fill-[url(#body-grad)] stroke-[#475569] stroke-[1.5]">
              {/* Head & Neck Female Back */}
              <path d="M 178 62 C 178 35, 222 35, 222 62 C 222 80, 210 90, 206 102 L 206 118 L 194 118 L 194 102 C 190 90, 178 80, 178 62 Z" />
              {/* Torso & Legs Female Back */}
              <path d="M 194 118 C 175 118, 145 125, 135 135 C 125 145, 115 195, 112 220 C 108 260, 108 310, 112 355 C 115 362, 122 362, 125 355 C 128 320, 132 270, 138 230 C 142 230, 145 225, 148 210 C 150 195, 148 185, 150 180 C 152 230, 155 260, 158 290 C 160 320, 158 370, 158 400 C 155 450, 145 540, 140 620 C 135 690, 130 740, 130 750 C 138 755, 150 755, 158 750 C 165 690, 175 580, 185 480 C 190 430, 195 400, 200 390 C 205 400, 210 430, 215 480 C 225 580, 235 690, 242 750 C 250 755, 262 755, 270 750 C 270 740, 265 690, 260 620 C 255 540, 245 450, 242 400 C 242 370, 240 320, 242 290 C 245 260, 248 230, 250 180 C 252 185, 250 195, 252 210 C 255 225, 258 230, 262 230 C 268 270, 272 320, 275 355 C 278 362, 285 362, 288 355 C 292 310, 292 260, 288 220 C 285 195, 275 145, 265 135 C 255 125, 225 118, 206 118 Z" />
              {/* Back center seam */}
              <line x1="200" y1="120" x2="200" y2="380" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            </g>
          )
        )}

        {/* Hotspot Nodes */}
        {activePoms.map((pom) => {
          const x = pom.landmarkX ?? 200;
          const y = pom.landmarkY;
          const isFocused = focusedId === pom.id;
          const r = 8;
          const val = measurements[pom.id] ?? pom.base;

          return (
            <g
              key={pom.id}
              className="cursor-pointer"
              onClick={() => onSelectHotspot(pom.id)}
              onMouseEnter={() => onHoverHotspot(pom.id)}
              onMouseLeave={() => onHoverHotspot(null)}
            >
              <circle cx={x} cy={y} r={r + 14} fill="transparent" />
              {isFocused && (
                <>
                  {/* Concentric Radar Pulses */}
                  <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values={`${r + 4};${r + 20};${r + 4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={r + 12} fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values={`${r + 8};${r + 28};${r + 8}`} dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Glowing Laser Crosshairs to Edges */}
                  <line x1="0" y1={y} x2="400" y2={y} stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 4" filter="url(#glow-cyan)" opacity="0.8" />
                  <line x1={x} y1="0" x2={x} y2="800" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 4" filter="url(#glow-cyan)" opacity="0.8" />
                </>
              )}
              {/* Hotspot Base */}
              <circle cx={x} cy={y} r={isFocused ? r + 3 : r} fill={isFocused ? '#F59E0B' : '#10B981'} stroke={isFocused ? '#FFFFFF' : '#020617'} strokeWidth={isFocused ? '2.5' : '1.5'} filter={isFocused ? 'url(#glow-gold)' : ''} className="transition-all duration-300" />
              <circle cx={x} cy={y} r={isFocused ? 3 : 2} fill="#FFFFFF" />
              <text x={x + 15} y={y + 4} className={`text-[10px] font-mono font-bold ${isFocused ? 'fill-amber-400' : 'fill-slate-400'}`} style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.9)' }}>
                {pom.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Detail */}
      {focusedId && (() => {
        const pom = activePoms.find(p => p.id === focusedId);
        if (!pom) return null;
        const val = measurements[pom.id] ?? pom.base;
        return (
          <div className="absolute bottom-4 right-4 bg-[#0B0F19]/95 border border-amber-500/50 rounded-xl p-3 shadow-[0_8px_32px_rgba(245,158,11,0.2)] backdrop-blur-md flex flex-col min-w-[140px] z-20">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-amber-400 text-[10px] uppercase tracking-wider">{pom.code}</span>
            </div>
            <span className="font-semibold text-slate-200 text-xs mb-1">{pom.name}</span>
            <div className="text-right mt-1 border-t border-slate-700/50 pt-1">
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest block">Value</span>
              <span className="font-mono font-bold text-lg text-white">{val}&quot;</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// MAIN MEASUREMENTS WORKSPACE PAGE
// ============================================================
export default function MeasurementsPage() {
  const [selectedGender, setSelectedGender] = useState<Gender>('Men');
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>('Sherwani');
  const [viewMode, setViewMode] = useState<ViewMode>('front');
  const [fitPref, setFitPref] = useState<FitPref>('Regular');
  const [unitSystem, setUnitSystem] = useState<UnitSys>('in');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showTrials, setShowTrials] = useState(false);

  // Posture state
  const [shoulderSlope, setShoulderSlope] = useState<'Normal' | 'Sloped' | 'Square'>('Normal');
  const [chestStance, setChestStance] = useState<'Normal' | 'Forward' | 'Barrel'>('Normal');
  const [backPosture, setBackPosture] = useState<'Normal' | 'Stooped' | 'Erect'>('Normal');
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
    const inVal = unitSystem === 'cm' ? Number((val / 2.54).toFixed(2)) : val;
    setMeasurements(prev => ({ ...prev, [pomId]: inVal }));
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Ruler className="w-6 h-6 text-gold-400" />
            <span>Measurement Workspace</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Interactive body measurement engine with posture profiling</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all ${
              showHistory ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History</span>
          </button>
          <button
            onClick={() => setShowTrials(!showTrials)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all ${
              showTrials ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Fitting Trials</span>
          </button>
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
                  selectedGender === g ? 'bg-gold-500 text-slate-950' : 'text-slate-400 hover:text-white'
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
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 border-gold-400 shadow-md shadow-gold-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
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
                  fitPref === f ? 'bg-gold-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setUnitSystem('in')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${unitSystem === 'in' ? 'bg-gold-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnitSystem('cm')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${unitSystem === 'cm' ? 'bg-gold-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Metric
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
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>2D Body Landmark Diagram</span>
                </h3>
                <p className="text-[10px] text-slate-500 capitalize mt-0.5">
                  {selectedGender} Silhouette — {selectedGarment} ({viewMode} view)
                </p>
              </div>
              <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs">
                <button
                  onClick={() => setViewMode('front')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'front' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setViewMode('back')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'back' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
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
              onSelectHotspot={setFocusedId}
              onHoverHotspot={setFocusedId}
            />

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10B981]" />
                  <span className="text-slate-400">Valid</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_4px_#F59E0B]" />
                  <span className="text-slate-400">Focused</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_#EF4444]" />
                  <span className="text-slate-400">Error</span>
                </div>
              </div>
              <span className="text-slate-600 font-mono">Canvas 0 0 400 800</span>
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
                  <span>POM Input — {selectedGarment}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{activePoms.length} measurement points • {unitLabel} units</p>
              </div>
              <button
                onClick={() => {
                  const reset: Record<string, number> = {};
                  activePoms.forEach(p => { reset[p.id] = p.base; });
                  setMeasurements(prev => ({ ...prev, ...reset }));
                }}
                className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePoms.map((pom) => {
                const rawVal = measurements[pom.id] ?? pom.base;
                const displayVal = convertVal(rawVal);
                const hasError = !!validationErrors[pom.id];
                const isFocused = focusedId === pom.id;

                return (
                  <div
                    key={pom.id}
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      isFocused
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                        : hasError
                        ? 'bg-rose-500/5 border-rose-500/60'
                        : 'bg-slate-900/50 border-slate-800/60 hover:border-slate-700'
                    }`}
                    onMouseEnter={() => setFocusedId(pom.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-gold-400 font-bold px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/20">
                          {pom.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{pom.name}</span>
                      </div>
                      {hasError && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                      {!hasError && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step={unitSystem === 'cm' ? '0.5' : '0.25'}
                        value={displayVal}
                        onFocus={() => setFocusedId(pom.id)}
                        onChange={(e) => handleMeasurementChange(pom.id, parseFloat(e.target.value) || 0)}
                        className={`flex-1 bg-slate-950/80 border rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-gold-400 focus:outline-none transition-all ${
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
                    <p className="text-[9px] text-slate-600 mt-1">
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
                    <CheckCircle2 className="w-4 h-4 mr-1" /> All values valid
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" /> {Object.keys(validationErrors).length} errors
                  </span>
                )}
              </div>
              <button
                disabled={!isValid}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center space-x-2 transition-all ${
                  isValid
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 hover:brightness-110 shadow-gold-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Save Snapshot</span>
              </button>
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
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center">
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
                          ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 border-gold-400'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
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
                          ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 border-gold-400'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
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
                          ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 border-gold-400'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
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
                          ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-slate-950 border-gold-400'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {h}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Sidebar (Conditional) */}
      {showHistory && (
        <div className="glass-card rounded-2xl border border-slate-800/60 p-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-gold-400" />
              <h3 className="font-bold text-sm text-white">Measurement Version History</h3>
            </div>
            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white text-xs transition-colors">
              Close
            </button>
          </div>

          <div className="space-y-3">
            {versionHistory.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  v.status === 'current'
                    ? 'bg-gold-500/5 border-gold-500/30 shadow-md shadow-gold-500/5'
                    : 'bg-slate-900/50 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                      v.status === 'current' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {v.version}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{v.garment}</p>
                      <p className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{v.date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">{v.pomCount} POMs</span>
                    {v.status === 'current' && (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Current</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fitting Trial Delta Comparison (Conditional) */}
      {showTrials && (
        <div className="glass-card rounded-2xl border border-slate-800/60 p-6 animate-fade-in-up">
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
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">POM</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gold-400 uppercase tracking-wider">Original</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Trial 1</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Trial 2</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Δ1</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Δ2</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
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
                    if (Math.abs(d) === 0) return { text: 'Perfect', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
                    if (Math.abs(d) <= 0.25) return { text: 'Tolerance', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
                    return { text: 'Alteration', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
                  };
                  const status = getStatus(fd.delta2);

                  return (
                    <tr key={i} className="border-b border-slate-800/30 last:border-0 table-row-hover">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-300">{fd.pomName}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-gold-400 font-bold">{fd.original}&quot;</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-blue-400">{fd.trial1}&quot;</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-purple-400">{fd.trial2}&quot;</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta1)}`}>
                          {getDeltaIcon(fd.delta1)}
                          <span>{fd.delta1 > 0 ? '+' : ''}{fd.delta1}&quot;</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta2)}`}>
                          {getDeltaIcon(fd.delta2)}
                          <span>{fd.delta2 > 0 ? '+' : ''}{fd.delta2}&quot;</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
