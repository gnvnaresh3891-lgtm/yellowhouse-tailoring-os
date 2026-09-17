'use client';

import React, { useState, useMemo, Suspense } from 'react';
import {
  Ruler, Eye, Save, RotateCcw, ChevronDown, ChevronUp,
  Activity, Calculator, Clock, GitCompare, AlertCircle,
  CheckCircle2, Info, Sparkles, History, ArrowRight, 
  ArrowUpRight, ArrowDownRight, Minus, Plus, X, Printer,
  ZoomIn, ZoomOut, Maximize2, Layers, Crosshair, Grid,
  SlidersHorizontal, EyeOff, Tag, Compass, Scissors, ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getLocalStorage, setLocalStorage } from '@/lib/storage-utils';
import { Tooltip } from '@/components/Tooltip';
import { MeasurementCard } from '@/components/print-layouts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';

import {
  EASE_OFFSETS,
  POM_SCHEMAS,
  GARMENT_GENDER,
  MENS_GARMENTS,
  WOMENS_GARMENTS,
  fittingDeltas,
  type Gender,
  type GarmentType,
  type FitPref,
  type UnitSys,
  type ViewMode,
  type ShoulderSlope,
  type ChestStance,
  type BackPosture,
  type PomField,
  type VersionSnapshot,
  type FittingDelta
} from '@/lib/cad-schemas';

// ============================================================
// LUXURY 2D CAD VECTOR DRESS FORM & PATTERN STUDIO CANVAS
// ============================================================
function BodySilhouetteSvg({
  gender, viewMode, selectedGarment, activePoms, focusedId, measurements, validationErrors,
  shoulderSlope, chestStance, backPosture, heelHeight, unitSystem, fitPref,
  onSelectHotspot, onHoverHotspot, onUpdateMeasurement
}: {
  gender: Gender;
  viewMode: ViewMode;
  selectedGarment: GarmentType;
  activePoms: PomField[];
  focusedId: string | null;
  measurements: Record<string, number>;
  validationErrors: Record<string, string>;
  shoulderSlope: ShoulderSlope;
  chestStance: ChestStance;
  backPosture: BackPosture;
  heelHeight: number;
  unitSystem: UnitSys;
  fitPref: FitPref;
  onSelectHotspot: (id: string) => void;
  onHoverHotspot: (id: string | null) => void;
  onUpdateMeasurement?: (id: string, val: number) => void;
}) {
  // CAD Canvas Layer Toggles & Zoom State strictly within 80% to 135% (0.80 to 1.35)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showDrapeOverlay, setShowDrapeOverlay] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [caliperFilterMode, setCaliperFilterMode] = useState<'ALL' | 'KEY' | 'FOCUSED'>('ALL');
  const [showDatumLasers, setShowDatumLasers] = useState<boolean>(true);
  const [showGridScales, setShowGridScales] = useState<boolean>(true);

  // Dynamic 4-axis posture modifier offsets
  const shoulderOffsetY = shoulderSlope === 'Sloped' ? 8 : shoulderSlope === 'Square' ? -8 : 0;
  const chestCurveD = chestStance === 'Forward'
    ? 'M 160 170 C 170 200, 205 210, 210 210 C 215 210, 250 200, 260 170'
    : chestStance === 'Barrel'
    ? 'M 155 170 C 165 212, 200 222, 210 222 C 220 222, 255 212, 265 170'
    : 'M 160 170 C 175 188, 200 192, 210 192 C 220 192, 245 188, 260 170';

  const spineDashArray = backPosture === 'Stooped' ? '3 3' : backPosture === 'Erect' ? '10 2' : '5 5';
  const heelOffsetY = (gender === 'Women' && heelHeight > 0) ? heelHeight * 5 : 0;

  const unitLabel = unitSystem === 'cm' ? 'cm' : 'in';
  const formatVal = (v: number) => unitSystem === 'cm' ? (v * 2.54).toFixed(1) : v.toString();
  const convertVal = (v: number) => unitSystem === 'cm' ? Number((v * 2.54).toFixed(1)) : v;

  // Zoom level clamp formula strictly between 80% and 135%
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.8), 1.35));
  };

  return (
    <div className="relative flex flex-col items-center bg-[#07090E] rounded-3xl border border-white/10 shadow-2xl overflow-hidden group/canvas">
      {/* CAD Toolbar / Layer Control HUD Bar */}
      <div className="w-full px-4 py-2.5 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-20 text-xs backdrop-blur-2xl">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            onClick={() => setShowDrapeOverlay(!showDrapeOverlay)}
            className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all text-[11px] ${
              showDrapeOverlay ? 'bg-[#D4AF37]/20 text-amber-300 border border-[#D4AF37]/40 shadow-sm' : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
            title="Toggle Garment Drape Overlay Silhouette"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Drape</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-900/80 p-0.5 rounded-full border border-white/10">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all text-[11px] ${
                showDimensions ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Caliper Dimension Callouts"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Calipers</span>
            </button>
            {showDimensions && (
              <div className="flex items-center pr-1 space-x-0.5 text-[10px] font-mono">
                {(['ALL', 'KEY', 'FOCUSED'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCaliperFilterMode(mode)}
                    className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
                      caliperFilterMode === mode
                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {mode === 'ALL' ? 'All' : mode === 'KEY' ? 'Key' : 'Active'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDatumLasers(!showDatumLasers)}
            className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all text-[11px] ${
              showDatumLasers ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
            title="Toggle Horizontal Laser Datum Lines"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Lasers</span>
          </button>

          <button
            onClick={() => setShowGridScales(!showGridScales)}
            className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all text-[11px] ${
              showGridScales ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
            }`}
            title="Toggle CAD Blueprint Grid & Rulers"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-full border border-white/10">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-amber-300 px-2 select-none min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1.0 && (
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors ml-1 text-[10px] font-semibold"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Vector Drawing Viewport with Exact viewBox="0 0 420 840" */}
      <div className="relative w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden min-h-[560px]">
        {/* Ambient Backlight Glows */}
        <div className="absolute top-1/4 -left-12 w-48 h-48 bg-cyan-500/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-12 w-48 h-48 bg-amber-500/15 blur-[50px] pointer-events-none" />

        {/* SVG Viewport with Dynamic Zoom Scale */}
        <div 
          className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 420 840"
            className="w-full max-w-[370px] h-auto select-none relative z-10"
            style={{ filter: 'drop-shadow(0px 12px 28px rgba(0,0,0,0.85))' }}
          >
            <defs>
              <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.85" />
              </filter>
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FACC15" floodOpacity="0.95" />
              </filter>
              <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" floodOpacity="0.85" />
              </filter>

              {/* High-End Tailor Dress Form Realistic Mannequin Gradients */}
              <linearGradient id="mannequin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#111827" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#0B0F19" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#030712" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="metallic-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <linearGradient id="stand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Fine CAD Blueprint Grids */}
              <pattern id="cad-grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" />
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.6" />
              </pattern>
              <pattern id="cad-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#cad-grid-fine)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#334155" strokeWidth="0.8" opacity="0.4" />
              </pattern>
            </defs>

            {/* Base CAD Blueprint Canvas Grid */}
            {showGridScales && (
              <rect x="20" y="20" width="380" height="800" fill="url(#cad-grid-major)" className="opacity-50" />
            )}

            {/* Precision CAD Calibration Ruler Borders */}
            {showGridScales && (
              <g className="opacity-60 select-none">
                {/* Top Ruler Bar */}
                <rect x="20" y="5" width="380" height="15" fill="#0B0F19" stroke="#1E293B" strokeWidth="0.5" />
                {[50, 100, 150, 200, 250, 300, 350, 400].map((tick) => (
                  <g key={`top-tick-${tick}`}>
                    <line x1={tick} y1="5" x2={tick} y2="15" stroke="#475569" strokeWidth="0.8" />
                    <text x={tick} y="13" textAnchor="middle" className="fill-slate-500 text-[6px] font-mono font-bold">{tick}</text>
                  </g>
                ))}

                {/* Left Ruler Bar */}
                <rect x="5" y="20" width="15" height="800" fill="#0B0F19" stroke="#1E293B" strokeWidth="0.5" />
                {[100, 200, 300, 400, 500, 600, 700, 800].map((tick) => (
                  <g key={`left-tick-${tick}`}>
                    <line x1="5" y1={tick} x2="15" y2={tick} stroke="#475569" strokeWidth="0.8" />
                    <text x="13" y={tick + 2} textAnchor="end" className="fill-slate-500 text-[6px] font-mono font-bold">{tick}</text>
                  </g>
                ))}
              </g>
            )}

            {/* Horizontal CAD Laser Datum Alignment Lasers */}
            {showDatumLasers && (
              <g className="opacity-70 transition-opacity">
                {/* Neck Datum */}
                <line x1="20" y1="120" x2="400" y2="120" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="26" y="115" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Neck Datum (Y:120)</text>

                {/* Chest / Bust Datum */}
                <line x1="20" y1="200" x2="400" y2="200" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="26" y="195" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Chest / Scye Line (Y:200)</text>

                {/* Natural Waistline */}
                <line x1="20" y1="280" x2="400" y2="280" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="26" y="275" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Natural Waistline (Y:280)</text>

                {/* Seat / Hip Height */}
                <line x1="20" y1="360" x2="400" y2="360" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="26" y="355" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Seat Datum (Y:360)</text>
                
                {/* Outseam / Hem Boundary */}
                <line x1="20" y1="550" x2="400" y2="550" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="26" y="545" className="fill-[#38BDF8] text-[8px] font-mono tracking-widest uppercase">Knee / Outseam (Y:550)</text>
              </g>
            )}

            {/* Atelier Mannequin Stand Base & Polished Finial */}
            <g>
              {/* Wooden / Metallic Top Finial */}
              <ellipse cx="210" cy="55" rx="14" ry="7" fill="url(#metallic-gold)" stroke="#D97706" strokeWidth="1.5" />
              <path d="M 204 55 L 206 40 Q 210 32 214 40 L 216 55 Z" fill="url(#metallic-gold)" />
              <circle cx="210" cy="32" r="5" fill="url(#metallic-gold)" stroke="#D97706" strokeWidth="1" />

              {/* Cast Iron Stand Base (Bottom) */}
              <rect x="207" y="740" width="6" height="60" fill="url(#stand-grad)" stroke="#475569" strokeWidth="1" />
              <ellipse cx="210" cy="800" rx="45" ry="12" fill="#0B0F19" stroke="#F59E0B" strokeWidth="1.5" />
              <ellipse cx="210" cy="800" rx="35" ry="8" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            </g>

            {/* ============================================================ */}
            {/* MANNEQUIN SILHOUETTE BODY FORM (ANATOMICALLY CONTOURED)      */}
            {/* ============================================================ */}
            {gender === 'Men' ? (
              viewMode === 'front' ? (
                <g className="fill-[url(#mannequin-grad)] stroke-[#475569] stroke-[1.5]">
                  {/* Head & Neck Base */}
                  <path d="M 185 65 C 185 40, 235 40, 235 65 C 235 85, 222 98, 218 108 L 218 120 L 202 120 L 202 108 C 198 98, 185 85, 185 65 Z" />
                  
                  {/* Torso Silhouette with Dynamic Shoulder Slope */}
                  <path d={`M 202 120 C 175 120, 145 ${125 + shoulderOffsetY}, 135 ${140 + shoulderOffsetY} C 125 ${155 + shoulderOffsetY}, 120 200, 118 230 C 115 270, 115 320, 118 370 C 122 375, 128 375, 130 370 C 132 330, 135 285, 140 240 C 145 240, 152 235, 155 220 C 158 200, 158 185, 160 180 C 160 240, 160 280, 158 340 C 155 370, 155 390, 155 405 C 150 460, 145 550, 140 630 C 135 700, 130 750, 130 760 C 140 765, 155 765, 165 760 C 170 700, 180 600, 190 500 C 195 450, 205 420, 210 405 C 215 420, 225 450, 230 500 C 240 600, 250 700, 255 760 C 265 765, 280 765, 290 760 C 290 750, 285 700, 280 630 C 275 550, 270 460, 265 405 C 265 390, 265 370, 262 340 C 260 280, 260 240, 260 180 C 262 185, 262 200, 265 220 C 268 235, 275 240, 280 240 C 285 285, 288 330, 290 370 C 292 375, 298 375, 302 370 C 305 320, 305 270, 302 230 C 300 200, 295 ${155 + shoulderOffsetY}, 285 ${140 + shoulderOffsetY} C 275 ${125 + shoulderOffsetY}, 245 120, 218 120 Z`} />
                  
                  {/* Princess Seams & Clavicles */}
                  <path d={`M 170 ${135 + shoulderOffsetY} Q 210 ${150 + shoulderOffsetY} 250 ${135 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1.2" />
                  <path d="M 180 180 C 180 240, 175 280, 180 340" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />
                  <path d="M 240 180 C 240 240, 245 280, 240 340" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />
                  
                  {/* Chest Stance Curve */}
                  <path d={chestCurveD} fill="none" stroke={chestStance !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth={chestStance !== 'Normal' ? '1.8' : '1'} />
                </g>
              ) : (
                <g className="fill-[url(#mannequin-grad)] stroke-[#475569] stroke-[1.5]">
                  {/* Head & Neck Back */}
                  <path d="M 185 65 C 185 40, 235 40, 235 65 C 235 85, 222 98, 218 108 L 218 120 L 202 120 L 202 108 C 198 98, 185 85, 185 65 Z" />
                  
                  {/* Torso Silhouette Back */}
                  <path d={`M 202 120 C 175 120, 145 ${125 + shoulderOffsetY}, 135 ${140 + shoulderOffsetY} C 125 ${155 + shoulderOffsetY}, 120 200, 118 230 C 115 270, 115 320, 118 370 C 122 375, 128 375, 130 370 C 132 330, 135 285, 140 240 C 145 240, 152 235, 155 220 C 158 200, 158 185, 160 180 C 160 240, 160 280, 158 340 C 155 370, 155 390, 155 405 C 150 460, 145 550, 140 630 C 135 700, 130 750, 130 760 C 140 765, 155 765, 165 760 C 170 700, 180 600, 190 500 C 195 450, 205 420, 210 405 C 215 420, 225 450, 230 500 C 240 600, 250 700, 255 760 C 265 765, 280 765, 290 760 C 290 750, 285 700, 280 630 C 275 550, 270 460, 265 405 C 265 390, 265 370, 262 340 C 260 280, 260 240, 260 180 C 262 185, 262 200, 265 220 C 268 235, 275 240, 280 240 C 285 285, 288 330, 290 370 C 292 375, 298 375, 302 370 C 305 320, 305 270, 302 230 C 300 200, 295 ${155 + shoulderOffsetY}, 285 ${140 + shoulderOffsetY} C 275 ${125 + shoulderOffsetY}, 245 120, 218 120 Z`} />
                  
                  {/* Center Back Spine Seam with Posture Adaptation */}
                  <line x1="210" y1="120" x2="210" y2="390" stroke={backPosture !== 'Normal' ? '#FACC15' : '#475569'} strokeWidth="1.8" strokeDasharray={spineDashArray} />
                  
                  {/* Scapula Shoulder Blades */}
                  <path d={`M 170 ${160 + shoulderOffsetY} C 180 ${170 + shoulderOffsetY}, 195 ${175 + shoulderOffsetY}, 205 ${160 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1.2" />
                  <path d={`M 250 ${160 + shoulderOffsetY} C 240 ${170 + shoulderOffsetY}, 225 ${175 + shoulderOffsetY}, 215 ${160 + shoulderOffsetY}`} fill="none" stroke="#334155" strokeWidth="1.2" />
                </g>
              )
            ) : (
              viewMode === 'front' ? (
                <g className="fill-[url(#mannequin-grad)] stroke-[#475569] stroke-[1.5]">
                  {/* Female Head & Neck */}
                  <path d="M 188 62 C 188 38, 232 38, 232 62 C 232 80, 220 90, 216 102 L 216 118 L 204 118 L 204 102 C 200 90, 188 80, 188 62 Z" />
                  
                  {/* Female Torso Silhouette with Heel Offset */}
                  <path d={`M 204 118 C 185 118, 155 ${125 + shoulderOffsetY}, 145 ${135 + shoulderOffsetY} C 135 ${145 + shoulderOffsetY}, 125 195, 122 220 C 118 260, 118 310, 122 355 C 125 362, 132 362, 135 355 C 138 320, 142 270, 148 230 C 152 230, 155 225, 158 210 C 160 195, 158 185, 160 180 C 162 230, 165 260, 168 290 C 170 320, 168 370, 168 400 C 165 450, 155 540, 150 620 C 145 690, 140 740, 140 ${750 - heelOffsetY} C 148 ${755 - heelOffsetY}, 160 ${755 - heelOffsetY}, 168 ${750 - heelOffsetY} C 175 690, 185 580, 195 480 C 200 430, 205 400, 210 390 C 215 400, 220 430, 225 480 C 235 580, 245 690, 252 ${750 - heelOffsetY} C 260 ${755 - heelOffsetY}, 272 ${755 - heelOffsetY}, 280 ${750 - heelOffsetY} C 280 740, 275 690, 270 620 C 265 540, 255 450, 252 400 C 252 370, 250 320, 252 290 C 255 260, 258 230, 260 180 C 262 185, 260 195, 262 210 C 265 225, 268 230, 272 230 C 278 270, 282 320, 285 355 C 288 362, 295 362, 298 355 C 302 310, 302 260, 298 220 C 295 195, 285 ${145 + shoulderOffsetY}, 275 ${135 + shoulderOffsetY} C 265 ${125 + shoulderOffsetY}, 235 118, 216 118 Z`} />
                  
                  {/* Bust Contours & Princess Lines */}
                  <path d={chestCurveD} fill="none" stroke={chestStance !== 'Normal' ? '#FACC15' : '#334155'} strokeWidth={chestStance !== 'Normal' ? '1.8' : '1'} />
                  <path d="M 175 190 Q 185 240 180 290" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
                  <path d="M 245 190 Q 235 240 240 290" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
                  <path d="M 165 300 C 155 330, 155 360, 168 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.7" />
                  <path d="M 255 300 C 265 330, 265 360, 252 390" fill="none" stroke="#334155" strokeWidth="1" opacity="0.7" />
                </g>
              ) : (
                <g className="fill-[url(#mannequin-grad)] stroke-[#475569] stroke-[1.5]">
                  {/* Female Head & Neck Back */}
                  <path d="M 188 62 C 188 38, 232 38, 232 62 C 232 80, 220 90, 216 102 L 216 118 L 204 118 L 204 102 C 200 90, 188 80, 188 62 Z" />
                  
                  {/* Female Torso Back */}
                  <path d={`M 204 118 C 185 118, 155 ${125 + shoulderOffsetY}, 145 ${135 + shoulderOffsetY} C 135 ${145 + shoulderOffsetY}, 125 195, 122 220 C 118 260, 118 310, 122 355 C 125 362, 132 362, 135 355 C 138 320, 142 270, 148 230 C 152 230, 155 225, 158 210 C 160 195, 158 185, 160 180 C 162 230, 165 260, 168 290 C 170 320, 168 370, 168 400 C 165 450, 155 540, 150 620 C 145 690, 140 740, 140 ${750 - heelOffsetY} C 148 ${755 - heelOffsetY}, 160 ${755 - heelOffsetY}, 168 ${750 - heelOffsetY} C 175 690, 185 580, 195 480 C 200 430, 205 400, 210 390 C 215 400, 220 430, 225 480 C 235 580, 245 690, 252 ${750 - heelOffsetY} C 260 ${755 - heelOffsetY}, 272 ${755 - heelOffsetY}, 280 ${750 - heelOffsetY} C 280 740, 275 690, 270 620 C 265 540, 255 450, 252 400 C 252 370, 250 320, 252 290 C 255 260, 258 230, 260 180 C 262 185, 260 195, 262 210 C 265 225, 268 230, 272 230 C 278 270, 282 320, 285 355 C 288 362, 295 362, 298 355 C 302 310, 302 260, 298 220 C 295 195, 285 ${145 + shoulderOffsetY}, 275 ${135 + shoulderOffsetY} C 265 ${125 + shoulderOffsetY}, 235 118, 216 118 Z`} />
                  
                  {/* Center Back Spine Seam */}
                  <line x1="210" y1="120" x2="210" y2="380" stroke={backPosture !== 'Normal' ? '#FACC15' : '#475569'} strokeWidth="1.8" strokeDasharray={spineDashArray} />
                </g>
              )
            )}

            {/* ============================================================ */}
            {/* GARMENT-SPECIFIC VECTOR DRAPE OVERLAYS (6 GARMENTS)          */}
            {/* ============================================================ */}
            {showDrapeOverlay && (
              <g className="transition-all duration-300">
                {/* 1. SHERWANI OVERLAY (Royal Bandhgala Placket & Mandarin Collar) */}
                {selectedGarment === 'Sherwani' && (
                  <g className="stroke-[#F59E0B] stroke-[1.8] fill-none">
                    {/* Mandarin Collar Band */}
                    <path d="M 196 112 Q 210 118 224 112 L 224 122 Q 210 128 196 122 Z" fill="#F59E0B" fillOpacity="0.15" />
                    {/* Front Center Placket */}
                    <line x1="210" y1="122" x2="210" y2="450" stroke="#F59E0B" strokeWidth="2" />
                    {/* Sherwani Ornate Button Dots */}
                    {[145, 175, 205, 235, 265, 295, 325, 355, 385].map((btnY) => (
                      <circle key={`sh-btn-${btnY}`} cx="210" cy={btnY} r="2.5" fill="#FACC15" stroke="#78350F" strokeWidth="0.8" />
                    ))}
                    {/* Chest Welt Pocket & Pocket Square */}
                    <line x1="162" y1="195" x2="185" y2="195" stroke="#F59E0B" strokeWidth="1.5" />
                    <path d="M 168 195 L 173 186 L 178 195 Z" fill="#FACC15" fillOpacity="0.8" stroke="none" />
                    {/* Flared Lower Hem Sweep */}
                    <path d="M 148 450 Q 210 465 272 450" stroke="#F59E0B" strokeWidth="1.8" />
                    {/* Side Slits */}
                    <line x1="148" y1="360" x2="148" y2="450" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.2" />
                    <line x1="272" y1="360" x2="272" y2="450" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.2" />
                  </g>
                )}

                {/* 2. SUIT OVERLAY (Savile Row Peak Lapel, Pocket Welt & Trousers) */}
                {selectedGarment === 'Suit' && (
                  <g className="stroke-[#38BDF8] stroke-[1.8] fill-none">
                    {/* Peak Lapel Roll Lines */}
                    <path d="M 194 120 L 175 185 L 195 210 L 210 270" strokeWidth="1.8" />
                    <path d="M 226 120 L 245 185 L 225 210 L 210 270" strokeWidth="1.8" />
                    {/* Lapel Flower Buttonhole */}
                    <line x1="180" y1="165" x2="186" y2="160" stroke="#38BDF8" strokeWidth="1.5" />
                    {/* 2-Button Closure */}
                    <circle cx="210" cy="275" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                    <circle cx="210" cy="305" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                    {/* Breast Pocket Welt */}
                    <line x1="160" y1="190" x2="184" y2="190" stroke="#38BDF8" strokeWidth="1.5" />
                    {/* Flap Pockets */}
                    <line x1="145" y1="330" x2="175" y2="330" stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="245" y1="330" x2="275" y2="330" stroke="#38BDF8" strokeWidth="1.5" />
                    {/* Jacket Cutaway Hem */}
                    <path d="M 152 400 Q 210 415 268 400" strokeWidth="1.8" />
                    {/* Trouser Center Press Creases */}
                    <line x1="172" y1="410" x2="148" y2="750" stroke="#38BDF8" strokeDasharray="6 3" strokeWidth="1.2" />
                    <line x1="248" y1="410" x2="272" y2="750" stroke="#38BDF8" strokeDasharray="6 3" strokeWidth="1.2" />
                  </g>
                )}

                {/* 3. BLOUSE OVERLAY (Couture Necklines & Princess Darts) */}
                {selectedGarment === 'Blouse' && (
                  <g className="stroke-[#EC4899] stroke-[1.8] fill-none">
                    {/* Sweetheart Neckline Front */}
                    {viewMode === 'front' ? (
                      <path d="M 175 130 Q 192 170 210 155 Q 228 170 245 130" strokeWidth="2" fill="#EC4899" fillOpacity="0.1" />
                    ) : (
                      <path d="M 175 130 Q 210 200 245 130" strokeWidth="2" fill="#EC4899" fillOpacity="0.1" />
                    )}
                    {/* Bust Apex Points */}
                    {viewMode === 'front' && (
                      <>
                        <circle cx="180" cy="200" r="2.5" fill="#EC4899" />
                        <circle cx="240" cy="200" r="2.5" fill="#EC4899" />
                        {/* Princess Cut Darts */}
                        <path d="M 158 165 Q 180 200 178 330" strokeWidth="1.4" strokeDasharray="4 2" />
                        <path d="M 262 165 Q 240 200 242 330" strokeWidth="1.4" strokeDasharray="4 2" />
                      </>
                    )}
                    {/* Underbust Band */}
                    <line x1="165" y1="240" x2="255" y2="240" stroke="#EC4899" strokeWidth="1.2" strokeDasharray="3 2" />
                    {/* Blouse Bottom Hem Line */}
                    <path d="M 158 330 Q 210 340 262 330" strokeWidth="2" />
                  </g>
                )}

                {/* 4. LEHENGA OVERLAY (12-Kali Flared Yoke Panels & Cancan) */}
                {selectedGarment === 'Lehenga' && (
                  <g className="stroke-[#10B981] stroke-[1.8] fill-none">
                    {/* High-Rise Embroidered Waistband */}
                    <path d="M 165 280 Q 210 290 255 280 L 257 295 Q 210 305 163 295 Z" fill="#10B981" fillOpacity="0.2" strokeWidth="1.8" />
                    {/* Radiating 12 Kalis Flare Panels */}
                    {[
                      { x1: 170, x2: 80 },
                      { x1: 185, x2: 130 },
                      { x1: 200, x2: 180 },
                      { x1: 210, x2: 210 },
                      { x1: 220, x2: 240 },
                      { x1: 235, x2: 290 },
                      { x1: 250, x2: 340 },
                    ].map((k, i) => (
                      <line key={`lh-kali-${i}`} x1={k.x1} y1="295" x2={k.x2} y2="700" stroke="#10B981" strokeWidth="1.2" strokeDasharray="5 3" />
                    ))}
                    {/* Broad Bottom Flare Sweep */}
                    <path d="M 75 700 Q 210 740 345 700" strokeWidth="2.5" />
                    {/* Cancan Ring Guide */}
                    <path d="M 105 620 Q 210 650 315 620" stroke="#10B981" strokeDasharray="3 3" strokeWidth="1" />
                  </g>
                )}

                {/* 5. ANARKALI OVERLAY (Empire Bodice & Umbrella Kalis) */}
                {selectedGarment === 'Anarkali' && (
                  <g className="stroke-[#A855F7] stroke-[1.8] fill-none">
                    {/* Empire Bodice Yoke */}
                    <line x1="165" y1="270" x2="255" y2="270" strokeWidth="2" stroke="#A855F7" />
                    {/* Umbrella Kalidar Flare lines */}
                    {[
                      { x: 100 }, { x: 140 }, { x: 180 }, { x: 210 }, { x: 240 }, { x: 280 }, { x: 320 }
                    ].map((k, i) => (
                      <line key={`an-k-${i}`} x1="210" y1="270" x2={k.x} y2="600" stroke="#A855F7" strokeWidth="1.2" strokeDasharray="4 2" />
                    ))}
                    {/* Floor Sweep Hem */}
                    <path d="M 95 600 Q 210 630 325 600" strokeWidth="2" />
                  </g>
                )}

                {/* 6. CORSET OVERLAY (Sweetheart Busks & Boning Channels) */}
                {selectedGarment === 'Corset' && (
                  <g className="stroke-[#F59E0B] stroke-[1.8] fill-none">
                    {/* Sweetheart Décolletage */}
                    <path d="M 165 180 Q 185 215 210 195 Q 235 215 255 180" strokeWidth="2" fill="#F59E0B" fillOpacity="0.1" />
                    {/* Steel Busk Center Front Clasp Hooks */}
                    <line x1="210" y1="195" x2="210" y2="340" stroke="#FACC15" strokeWidth="2.5" />
                    {[215, 245, 275, 305, 335].map((buskY) => (
                      <rect key={`busk-hook-${buskY}`} x="208" y={buskY} width="4" height="4" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
                    ))}
                    {/* 8 Spiral Steel Boning Channels */}
                    {[-35, -24, -12, 12, 24, 35].map((offset) => (
                      <path
                        key={`bone-${offset}`}
                        d={`M ${210 + offset * 0.9} 200 Q ${210 + offset * 0.7} 280 ${210 + offset} 340`}
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                        strokeDasharray="4 2"
                      />
                    ))}
                    {/* Bottom Cinch Sweep */}
                    <path d="M 160 340 Q 210 365 260 340" strokeWidth="2" />
                  </g>
                )}
              </g>
            )}

            {/* ============================================================ */}
            {/* REAL-TIME DIMENSION CALIPER RIBBONS (↔ 42.5 in)             */}
            {/* ============================================================ */}
            {showDimensions && (
              <g className="select-none">
                {activePoms.map((pom) => {
                  const isFocused = focusedId === pom.id;
                  if (caliperFilterMode === 'FOCUSED' && !isFocused) return null;
                  if (caliperFilterMode === 'KEY' && !isFocused && !['SH-01', 'SU-01', 'BL-01', 'SH-02', 'SU-02', 'BL-03'].includes(pom.code)) return null;
                  if (caliperFilterMode === 'ALL' && !isFocused && !['SH-01', 'SU-01', 'BL-01', 'SH-02', 'SU-02', 'BL-03', 'SH-03', 'SU-03', 'BL-04', 'SH-05', 'SU-05', 'SH-08', 'SU-08', 'LH-01', 'LH-02', 'LH-03', 'AN-01', 'AN-02', 'CO-01', 'CO-02'].includes(pom.code)) return null;

                  const y = pom.landmarkY + (shoulderOffsetY !== 0 && (pom.code.includes('SH-03') || pom.code.includes('SU-03')) ? shoulderOffsetY : 0);
                  const rawVal = measurements[pom.id] ?? pom.base;
                  const displayStr = `↔ ${formatVal(rawVal)} ${unitLabel}`;

                  // Dynamic caliper spread calculation based on measurement deviation
                  const spreadOffset = Math.max(-10, Math.min(22, ((rawVal - pom.base) / pom.base) * 26));
                  const leftX = Math.max(50, 75 - spreadOffset);
                  const rightX = Math.min(370, 345 + spreadOffset);

                  return (
                    <g 
                      key={`caliper-${pom.id}`} 
                      className="transition-all duration-300 cursor-pointer group/caliper pointer-events-auto"
                      onClick={() => onSelectHotspot(pom.id)}
                      onMouseEnter={() => onHoverHotspot(pom.id)}
                      onMouseLeave={() => onHoverHotspot(null)}
                    >
                      {/* Left & Right Caliper Wings with Dynamic Horizontal Spread */}
                      <line x1={leftX} y1={y} x2="135" y2={y} stroke={isFocused ? '#FACC15' : '#38BDF8'} strokeWidth={isFocused ? '2' : '1.2'} />
                      <line x1="285" y1={y} x2={rightX} y2={y} stroke={isFocused ? '#FACC15' : '#38BDF8'} strokeWidth={isFocused ? '2' : '1.2'} />
                      
                      {/* End Boundary Ticks */}
                      <line x1={leftX} y1={y - 6} x2={leftX} y2={y + 6} stroke={isFocused ? '#FACC15' : '#38BDF8'} strokeWidth="1.8" />
                      <line x1={rightX} y1={y - 6} x2={rightX} y2={y + 6} stroke={isFocused ? '#FACC15' : '#38BDF8'} strokeWidth="1.8" />
                      
                      {/* Directional Arrow Tips */}
                      <polygon points={`${leftX + 4},${y - 3} ${leftX},${y} ${leftX + 4},${y + 3}`} fill={isFocused ? '#FACC15' : '#38BDF8'} />
                      <polygon points={`${rightX - 4},${y - 3} ${rightX},${y} ${rightX - 4},${y + 3}`} fill={isFocused ? '#FACC15' : '#38BDF8'} />

                      {/* Dimension Ribbon Tag */}
                      <rect 
                        x="160" y={y - 10} width="100" height="20" rx="6" 
                        fill="#0F172A" 
                        stroke={isFocused ? '#FACC15' : '#38BDF8'} 
                        strokeWidth={isFocused ? '1.5' : '0.8'} 
                        className="shadow-lg transition-all group-hover/caliper:fill-slate-800"
                        opacity="0.9"
                      />
                      <text 
                        x="210" y={y + 4} 
                        textAnchor="middle" 
                        className={`text-[9.5px] font-mono font-bold select-none ${isFocused ? 'fill-yellow-400' : 'fill-sky-300 group-hover/caliper:fill-white'}`}
                      >
                        {displayStr}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ============================================================ */}
            {/* INTERACTIVE HOTSPOT NODES WITH RADAR PULSE & LASER TRACKING  */}
            {/* ============================================================ */}
            {activePoms.map((pom) => {
              let x = pom.landmarkX ?? 210;
              let y = pom.landmarkY;

              if (shoulderOffsetY !== 0 && (pom.code.includes('SH-03') || pom.code.includes('SU-03') || pom.code.includes('BL-04') || pom.code.includes('AN-05'))) {
                y += shoulderOffsetY;
              }
              if (heelOffsetY > 0 && (pom.code.includes('LH-03') || pom.code.includes('AN-04') || pom.code.includes('GO-04'))) {
                y -= heelOffsetY;
              }

              const isFocused = focusedId === pom.id;
              const hasError = !!validationErrors[pom.id];
              const r = 8;
              const rawVal = measurements[pom.id] ?? pom.base;

              return (
                <g
                  key={pom.id}
                  className="cursor-pointer group/hotspot transition-all duration-300"
                  onClick={() => onSelectHotspot(pom.id)}
                  onMouseEnter={() => onHoverHotspot(pom.id)}
                  onMouseLeave={() => onHoverHotspot(null)}
                >
                  {/* Invisible Hitbox Expansion */}
                  <circle cx={x} cy={y} r={r + 18} fill="transparent" />

                  {isFocused && (
                    <>
                      {/* Radar Pulse 1 */}
                      <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#FACC15" strokeWidth="1.8" opacity="0.8">
                        <animate attributeName="r" values={`${r + 4};${r + 26};${r + 4}`} dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.85;0;0.85" dur="1.8s" repeatCount="indefinite" />
                      </circle>

                      {/* Radar Pulse 2 */}
                      <circle cx={x} cy={y} r={r + 16} fill="none" stroke="#EAB308" strokeWidth="1.2" opacity="0.5">
                        <animate attributeName="r" values={`${r + 8};${r + 36};${r + 8}`} dur="1.8s" begin="0.45s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" begin="0.45s" repeatCount="indefinite" />
                      </circle>

                      {/* Laser Alignment Crosshairs */}
                      <line
                        x1="20" y1={y} x2="400" y2={y}
                        stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
                        filter="url(#glow-cyan)" opacity="0.9"
                      >
                        <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
                      </line>
                      <line
                        x1={x} y1="20" x2={x} y2="820"
                        stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4"
                        filter="url(#glow-cyan)" opacity="0.9"
                      >
                        <animate attributeName="stroke-dashoffset" values="8;0" dur="0.8s" repeatCount="indefinite" />
                      </line>
                    </>
                  )}

                  {/* Core Hotspot Button Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isFocused ? r + 3 : r}
                    fill={hasError ? '#EF4444' : isFocused ? '#FACC15' : '#10B981'}
                    stroke={isFocused ? '#FFFFFF' : '#0B0F19'}
                    strokeWidth={isFocused ? '2.5' : '1.8'}
                    filter={isFocused ? 'url(#glow-gold)' : hasError ? 'url(#glow-rose)' : 'url(#glow-emerald)'}
                    className="transition-all duration-300 ease-out"
                  />
                  <circle cx={x} cy={y} r={isFocused ? 3.5 : 2} fill="#FFFFFF" />

                  {/* POM Code & Value Badge Tag */}
                  <g transform={`translate(${x + 14}, ${y - 8})`}>
                    <rect
                      x="0" y="0" width={isFocused ? 88 : 48} height="18" rx="5"
                      fill={isFocused ? '#1E293B' : '#0F172A'}
                      stroke={isFocused ? '#FACC15' : '#334155'}
                      strokeWidth={isFocused ? '1.2' : '0.8'}
                      className="shadow-md"
                    />
                    <text
                      x="6"
                      y="12"
                      className={`text-[9px] font-mono font-extrabold tracking-wider ${
                        isFocused ? 'fill-yellow-400' : 'fill-slate-300'
                      }`}
                    >
                      {pom.code}
                    </text>
                    {isFocused && (
                      <text x="46" y="12" className="text-[9px] font-mono font-bold fill-white">
                        {formatVal(rawVal)}{unitLabel}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Quick-Adjust HUD Overlay for Selected Hotspot with Dynamic Caliper Steppers */}
        {focusedId && (() => {
          const pom = activePoms.find(p => p.id === focusedId);
          if (!pom) return null;
          const rawVal = measurements[pom.id] ?? pom.base;
          const hasError = !!validationErrors[pom.id];
          const rangePercent = Math.max(0, Math.min(100, Math.round(((rawVal - pom.min) / (pom.max - pom.min)) * 100)));
          const easeOffset = EASE_OFFSETS[fitPref] || 0;
          const finishedVal = Number((rawVal + easeOffset).toFixed(2));
          const dualVal = unitSystem === 'in' ? `${(rawVal * 2.54).toFixed(1)} cm` : `${(rawVal / 2.54).toFixed(1)} in`;

          return (
            <div className="absolute bottom-4 right-4 glass-card-gold rounded-3xl p-4 shadow-[0_20px_50px_rgba(245,158,11,0.3)] backdrop-blur-2xl flex flex-col min-w-[240px] max-w-[280px] z-30 animate-fade-in border border-[#D4AF37]/50">
              <div className="flex items-center justify-between space-x-2 mb-2 pb-2 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${hasError ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse`} />
                  <span className="font-mono font-extrabold text-amber-300 text-xs uppercase tracking-wider">{pom.code}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{pom.min}"–{pom.max}" range</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-display truncate">{pom.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{dualVal}</span>
              </div>
              
              <div className="flex items-baseline justify-between mt-2 pt-1">
                <span className="text-[11px] text-slate-400">Target Value:</span>
                <div className="flex items-baseline space-x-1">
                  <span className="font-mono font-black text-2xl text-amber-300">{formatVal(rawVal)}</span>
                  <span className="font-mono text-xs text-amber-400 font-bold">{unitLabel}</span>
                </div>
              </div>

              {/* Anatomical Tolerance Range Progress Bar */}
              <div className="w-full mt-2">
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
                  <span>{convertVal(pom.min)}{unitLabel}</span>
                  <span className="text-amber-300/90">{rangePercent}% tolerance</span>
                  <span>{convertVal(pom.max)}{unitLabel}</span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-white/10">
                  <div 
                    className={`h-full transition-all duration-300 ${hasError ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-[#D4AF37]'}`} 
                    style={{ width: `${rangePercent}%` }} 
                  />
                </div>
              </div>

              {/* Live Ease Calculation Preview */}
              <div className="mt-2.5 px-2 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Finished Garment:</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatVal(finishedVal)}{unitLabel} <span className="text-slate-400 font-normal">({easeOffset >= 0 ? '+' : ''}{easeOffset}" {fitPref})</span>
                </span>
              </div>

              {/* Dynamic Caliper Steppers (-0.5", -0.25", +0.25", +0.5") strictly clamped */}
              {onUpdateMeasurement && (
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => onUpdateMeasurement(pom.id, Math.max(pom.min, Number((rawVal - 0.5).toFixed(2))))}
                    className="py-1 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-white hover:border-amber-400 text-[10px] font-mono font-bold transition-colors active:scale-95"
                  >
                    -0.5"
                  </button>
                  <button
                    onClick={() => onUpdateMeasurement(pom.id, Math.max(pom.min, Number((rawVal - 0.25).toFixed(2))))}
                    className="py-1 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-white hover:border-amber-400 text-[10px] font-mono font-bold transition-colors active:scale-95"
                  >
                    -0.25"
                  </button>
                  <button
                    onClick={() => onUpdateMeasurement(pom.id, Math.min(pom.max, Number((rawVal + 0.25).toFixed(2))))}
                    className="py-1 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-white hover:border-amber-400 text-[10px] font-mono font-bold transition-colors active:scale-95"
                  >
                    +0.25"
                  </button>
                  <button
                    onClick={() => onUpdateMeasurement(pom.id, Math.min(pom.max, Number((rawVal + 0.5).toFixed(2))))}
                    className="py-1 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-white hover:border-amber-400 text-[10px] font-mono font-bold transition-colors active:scale-95"
                  >
                    +0.5"
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
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

  // 4-Axis Posture profile state
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

  // Sync state with localStorage on mount (yh_measurements_current, yh_measurement_snapshots)
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
    if (storedSnapshots.length > 0) {
      setSelectedVersionSnapshot(storedSnapshots[0]);
    }
  }, []);

  // Save changes to localStorage (yh_measurements_current)
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

  const applyStepper = (pomId: string, delta: number) => {
    const pom = activePoms.find(p => p.id === pomId);
    if (!pom) return;
    const current = measurements[pom.id] ?? pom.base;
    const next = Number((current + delta).toFixed(2));
    const clamped = Math.min(Math.max(next, pom.min), pom.max);
    handleMeasurementChange(pom.id, clamped);
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
      pomData: { ...measurements },
      ...(customerId ? { customerId, customerName: customerName || 'Unknown Customer' } : {})
    };

    const updated = [
      newSnapshot,
      ...snapshots.map(s => s.status === 'current' ? { ...s, status: 'archived' as const } : s)
    ];

    setSnapshots(updated);
    setLocalStorage('yh_measurement_snapshots', updated);
    setToastMessage(`Snapshot ${nextVer} saved to version history!`);
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
    <div className="max-w-7xl xl:max-w-[1540px] mx-auto w-full space-y-8 animate-fade-in relative pb-16 font-sans">
      {/* Strict Isolated @media print CSS for Measurement Card Chart printing */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .measurement-card-print, .measurement-card-print * { visibility: visible !important; }
          .measurement-card-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Glassmorphic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900/95 border border-[#D4AF37]/50 backdrop-blur-2xl px-5 py-3.5 rounded-2xl shadow-2xl shadow-yellow-500/10 text-amber-300 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-3">
                <span>2D CAD Mannequin & Caliper Studio</span>
                {customerName && (
                  <Badge variant="gold" size="sm">
                    {customerName}
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                420x840 pure SVG viewport, 4-axis anatomical posture morphs, dynamic caliper steppers, and snapshot versioning.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip content="Print current CAD anatomical measurement specification sheet">
            <Button
              variant="secondary"
              size="md"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4 text-[#D4AF37]" />}
            >
              Print Chart
            </Button>
          </Tooltip>

          <Tooltip content="Inspect past CAD measurement snapshots and version logs">
            <Button
              variant={showHistory ? 'gold' : 'secondary'}
              size="md"
              onClick={() => setShowHistory(!showHistory)}
              leftIcon={<History className="w-4 h-4" />}
            >
              Version History ({snapshots.length})
            </Button>
          </Tooltip>

          <Tooltip content="Compare baseline measurements against fitting trial deltas">
            <Button
              variant={showTrials ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowTrials(!showTrials)}
              leftIcon={<GitCompare className="w-4 h-4 text-blue-400" />}
            >
              Fitting Trials
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Control Bar - Apple Frosted Glass with Segmented Controls */}
      <Card variant="glass" padding="sm" className="border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Toggle */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-white/10 text-xs">
              {(['Men', 'Women'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenderChange(g)}
                  className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                    selectedGender === g 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Garment Drape Overlays Selector */}
            <div className="flex flex-wrap gap-1.5">
              {(selectedGender === 'Men' ? MENS_GARMENTS : WOMENS_GARMENTS).map((g) => (
                <button
                  key={g}
                  onClick={() => handleGarmentChange(g)}
                  className={`px-3.5 py-1.5 text-xs rounded-full border font-semibold transition-all ${
                    selectedGarment === g
                      ? 'bg-amber-400/20 text-amber-300 border-[#D4AF37]/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Fit Preference */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-white/10 text-xs">
              {(['Skinny', 'Slim', 'Regular', 'Relaxed'] as FitPref[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFitPref(f)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    fitPref === f 
                      ? 'bg-slate-100 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => setUnitSystem('in')}
              className={`px-3 py-1 rounded-full font-mono font-bold transition-all ${
                unitSystem === 'in' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              IN (↔ in)
            </button>
            <button
              onClick={() => setUnitSystem('cm')}
              className={`px-3 py-1 rounded-full font-mono font-bold transition-all ${
                unitSystem === 'cm' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              CM (cm)
            </button>
          </div>
        </div>
      </Card>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT: 2D CAD SVG Dress Form (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <Card variant="glass" padding="md" className="border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2 font-display">
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                  <span>2D CAD Interactive Vector Canvas</span>
                </h3>
                <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                  {selectedGender} Silhouette — {selectedGarment} ({viewMode} view)
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('front')}
                  className={`px-3.5 py-1 rounded-full font-semibold transition-all ${
                    viewMode === 'front' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setViewMode('back')}
                  className={`px-3.5 py-1 rounded-full font-semibold transition-all ${
                    viewMode === 'back' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            <BodySilhouetteSvg
              gender={selectedGender}
              viewMode={viewMode}
              selectedGarment={selectedGarment}
              activePoms={activePoms}
              focusedId={focusedId}
              measurements={measurements}
              validationErrors={validationErrors}
              shoulderSlope={shoulderSlope}
              chestStance={chestStance}
              backPosture={backPosture}
              heelHeight={heelHeight}
              unitSystem={unitSystem}
              fitPref={fitPref}
              onSelectHotspot={setFocusedId}
              onHoverHotspot={setFocusedId}
              onUpdateMeasurement={handleMeasurementChange}
            />

            {/* Viewport Legend */}
            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                  <span className="text-slate-400">Valid</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#FACC15]" />
                  <span className="text-slate-400">Selected Hotspot</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#EF4444]" />
                  <span className="text-slate-400">Out-of-Range</span>
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">Pure SVG 420x840</span>
            </div>
          </Card>
        </div>

        {/* RIGHT: POM Form + 4-Axis Posture Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* POM Input Form with Dynamic Caliper Steppers */}
          <Card variant="glass" padding="md" className="border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2 font-display">
                  <Ruler className="w-4 h-4 text-[#D4AF37]" />
                  <span>POM Technical Specification — {selectedGarment}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activePoms.length} measurement points &bull; {unitLabel} units</p>
              </div>
              <Tooltip content="Reset all POM fields to standard base defaults">
                <button
                  onClick={() => {
                    const reset: Record<string, number> = {};
                    activePoms.forEach(p => { reset[p.id] = p.base; });
                    setMeasurements(prev => ({ ...prev, ...reset }));
                  }}
                  className="p-2 bg-slate-900/60 border border-white/10 rounded-full text-slate-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activePoms.map((pom) => {
                const rawVal = measurements[pom.id] ?? pom.base;
                const displayVal = convertVal(rawVal);
                const hasError = !!validationErrors[pom.id];
                const isFocused = focusedId === pom.id;

                const easeOffset = EASE_OFFSETS[fitPref] || 0;
                const isAffected = ['Chest Girth', 'Waist Girth', 'Hip Girth', 'Sleeve Length', 'Bust Girth'].includes(pom.name);
                const rangePercent = Math.max(0, Math.min(100, Math.round(((rawVal - pom.min) / (pom.max - pom.min)) * 100)));
                const finishedVal = Number((rawVal + (isAffected ? easeOffset : 0)).toFixed(2));
                const dualVal = unitSystem === 'in' ? `${(rawVal * 2.54).toFixed(1)} cm` : `${(rawVal / 2.54).toFixed(1)} in`;

                return (
                  <div
                    key={pom.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                      isFocused
                        ? 'bg-amber-950/20 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-lg shadow-yellow-500/5'
                        : hasError
                        ? 'bg-rose-950/20 border-rose-500/60'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                    onMouseEnter={() => setFocusedId(pom.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-amber-300 font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                          {pom.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{pom.name}</span>
                        {isAffected && easeOffset !== 0 && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${easeOffset > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                            {easeOffset > 0 ? '+' : ''}{easeOffset} ease
                          </span>
                        )}
                      </div>
                      {hasError ? (
                        <Tooltip content={validationErrors[pom.id]}>
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        </Tooltip>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                      )}
                    </div>

                    {/* Caliper Stepper Row */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step={unitSystem === 'cm' ? '0.5' : '0.25'}
                        value={displayVal}
                        onFocus={() => setFocusedId(pom.id)}
                        onChange={(e) => handleMeasurementChange(pom.id, parseFloat(e.target.value) || 0)}
                        className={`flex-1 pom-input rounded-xl ${
                          hasError ? 'border-rose-500 focus:border-rose-400' : 'border-white/10 focus:border-[#D4AF37]'
                        }`}
                      />
                      <span className="text-xs text-slate-400 font-mono w-6 text-center">{unitLabel}</span>
                    </div>

                    {/* Stepper buttons -0.5", -0.25", +0.25", +0.5" strictly clamped */}
                    <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => applyStepper(pom.id, -0.5)}
                        className="py-1 rounded-lg bg-slate-950/60 border border-white/10 text-slate-300 hover:text-white hover:border-[#D4AF37] text-[10px] font-mono font-bold transition-colors active:scale-95"
                      >
                        -0.5"
                      </button>
                      <button
                        onClick={() => applyStepper(pom.id, -0.25)}
                        className="py-1 rounded-lg bg-slate-950/60 border border-white/10 text-slate-300 hover:text-white hover:border-[#D4AF37] text-[10px] font-mono font-bold transition-colors active:scale-95"
                      >
                        -0.25"
                      </button>
                      <button
                        onClick={() => applyStepper(pom.id, 0.25)}
                        className="py-1 rounded-lg bg-slate-950/60 border border-white/10 text-slate-300 hover:text-white hover:border-[#D4AF37] text-[10px] font-mono font-bold transition-colors active:scale-95"
                      >
                        +0.25"
                      </button>
                      <button
                        onClick={() => applyStepper(pom.id, 0.5)}
                        className="py-1 rounded-lg bg-slate-950/60 border border-white/10 text-slate-300 hover:text-white hover:border-[#D4AF37] text-[10px] font-mono font-bold transition-colors active:scale-95"
                      >
                        +0.5"
                      </button>
                    </div>

                    {/* Tolerance Progress Bar */}
                    <div className="w-full mt-2.5 pt-2 border-t border-white/5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                        <span>{convertVal(pom.min)} {unitLabel}</span>
                        <span className={hasError ? 'text-rose-400 font-semibold' : 'text-amber-300/80 font-medium'}>
                          {rangePercent}% tolerance
                        </span>
                        <span>{convertVal(pom.max)} {unitLabel}</span>
                      </div>
                      <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-white/10">
                        <div 
                          className={`h-full transition-all duration-300 ${hasError ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-[#D4AF37]'}`} 
                          style={{ width: `${rangePercent}%` }} 
                        />
                      </div>
                    </div>

                    {/* Finished Garment Readout & Dual Readout */}
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] font-mono text-slate-400">
                      <span>Dual: <span className="text-slate-300 font-semibold">{dualVal}</span></span>
                      {isAffected && easeOffset !== 0 ? (
                        <span className="text-amber-300/90 font-medium">Finished with {fitPref} ease: {finishedVal}"</span>
                      ) : (
                        <span className="text-slate-500">Base Anatomical</span>
                      )}
                    </div>

                    {hasError && (
                      <p className="text-[10px] text-rose-400 mt-1.5 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {validationErrors[pom.id]}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Range: {convertVal(pom.min)} – {convertVal(pom.max)} {unitLabel}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center space-x-2 text-xs">
                {isValid ? (
                  <span className="text-emerald-400 flex items-center font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> All POM values within anatomical tolerance
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> {Object.keys(validationErrors).length} errors to rectify
                  </span>
                )}
              </div>
              <Tooltip content={isValid ? "Save current measurements to version history" : "Fix validation errors to save"}>
                <Button
                  variant="gold"
                  size="md"
                  disabled={!isValid}
                  onClick={handleSaveSnapshot}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Snapshot
                </Button>
              </Tooltip>
            </div>
          </Card>

          {/* 4-Axis Posture Profile Panel */}
          <Card variant="glass" padding="md" className="border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">4-Axis Posture Profile Morphs</h3>
                  <p className="text-xs text-slate-400">Anatomical stance modifiers dynamically adjusting CAD draft lines</p>
                </div>
              </div>
              {(shoulderSlope !== 'Normal' || chestStance !== 'Normal' || backPosture !== 'Normal' || heelHeight > 0) && (
                <Badge variant="gold" size="sm">
                  Active Morphs
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Shoulder Slope */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Shoulder Slope</span>
                  <span className="text-[#D4AF37] font-mono text-[11px]">{shoulderSlope === 'Sloped' ? '+8px' : shoulderSlope === 'Square' ? '-8px' : '0px'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Sloped', 'Square'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setShoulderSlope(opt)}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        shoulderSlope === opt
                          ? 'bg-amber-400/20 text-amber-300 border-[#D4AF37]/50 shadow-sm'
                          : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chest Stance */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Chest Stance</span>
                  <span className="text-[#D4AF37] font-mono text-[11px]">Apex {chestStance === 'Forward' ? 'Y:210' : chestStance === 'Barrel' ? 'Y:222' : 'Y:192'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Forward', 'Barrel'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setChestStance(opt)}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        chestStance === opt
                          ? 'bg-amber-400/20 text-amber-300 border-[#D4AF37]/50 shadow-sm'
                          : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Back Posture */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Spine Curvature</span>
                  <span className="text-[#D4AF37] font-mono text-[11px]">Dash {backPosture === 'Stooped' ? '3 3' : backPosture === 'Erect' ? '10 2' : '5 5'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Normal', 'Stooped', 'Erect'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBackPosture(opt)}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        backPosture === opt
                          ? 'bg-amber-400/20 text-amber-300 border-[#D4AF37]/50 shadow-sm'
                          : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Heel Height (Women only, 5px per inch) */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Heel Height {selectedGender === 'Women' ? '' : '(Women Only)'}</span>
                  <span className="text-[#D4AF37] font-mono text-[11px]">{selectedGender === 'Women' ? `${heelHeight * 5}px hem lift` : '0px'}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHeelHeight(h)}
                      disabled={selectedGender === 'Men'}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        selectedGender === 'Men'
                          ? 'bg-slate-950/20 text-slate-700 border-white/5 cursor-not-allowed'
                          : heelHeight === h
                          ? 'bg-amber-400/20 text-amber-300 border-[#D4AF37]/50 shadow-sm'
                          : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {h}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Snapshot Version History Panel (yh_measurement_snapshots) */}
      {showHistory && (
        <Card variant="glass" padding="md" className="border-amber-500/30 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-display">CAD Measurement Version History & Snapshots</h3>
                <p className="text-xs text-slate-400">Track historical body fitting revisions, baseline versions, and cutter adjustments.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
            >
              Hide History
            </Button>
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
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-950/30 border-[#D4AF37] shadow-lg shadow-yellow-500/10 ring-2 ring-[#D4AF37]/40'
                        : v.status === 'current'
                        ? 'bg-amber-950/15 border-amber-400/40 hover:border-amber-400'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={v.status === 'current' ? 'gold' : 'neutral'} size="sm">
                          {v.version}
                        </Badge>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {v.date}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors font-display">
                          {v.garment} Baseline
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Fit Profile: <strong className="text-slate-200">{v.fitPref || 'Regular'}</strong> &bull; {v.pomCount} POM Landmarks
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-4">
                      <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Inspect Breakdown
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

          {/* Detailed Snapshot Inspection Breakdown */}
          {selectedVersionSnapshot && (
            <div className="mt-6 p-5 rounded-3xl bg-slate-950/90 border border-amber-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="gold" size="sm">
                    {selectedVersionSnapshot.version} Snapshot Breakdown
                  </Badge>
                  <span className="text-xs text-slate-300 font-semibold">
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
                  Object.entries(selectedVersionSnapshot.pomData).map(([pomKey, pomValue]) => {
                    const pomNameMap: Record<string, string> = {
                      'sh-01': 'Chest Girth',
                      'sh-02': 'Waist Girth',
                      'sh-03': 'Shoulder Width',
                      'sh-04': 'Sleeve Length',
                      'sh-05': 'Sherwani Length',
                      'sh-06': 'Neck Girth',
                      'sh-07': 'Armhole Circumference',
                      'sh-08': 'Bicep Girth',
                      'su-01': 'Jacket Chest',
                      'su-02': 'Jacket Waist',
                      'su-03': 'Shoulder Width',
                      'su-04': 'Sleeve Length',
                      'su-05': 'Jacket Length',
                      'su-06': 'Neck Girth',
                      'su-07': 'Trouser Waist',
                      'su-08': 'Trouser Outseam',
                      'su-09': 'Trouser Inseam',
                    };
                    const title = pomNameMap[pomKey] || pomKey.toUpperCase();

                    return (
                      <div key={pomKey} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block tracking-wider">{title}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold text-amber-300 font-mono">{pomValue}</span>
                          <span className="text-xs text-slate-500 font-mono">in</span>
                        </div>
                      </div>
                    );
                  })
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
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    if (selectedVersionSnapshot.pomData) {
                      setMeasurements(prev => ({ ...prev, ...selectedVersionSnapshot.pomData }));
                    }
                    setToastMessage(`Loaded version ${selectedVersionSnapshot.version} values into active workbench!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Load {selectedVersionSnapshot.version} into Cutting Workbench
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Fitting Trial Delta Comparison */}
      {showTrials && (
        <Card variant="glass" padding="md" className="border-white/10 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white font-display">Fitting Trial Delta Comparison</h3>
            </div>
            <button onClick={() => setShowTrials(false)} className="text-slate-400 hover:text-white text-xs transition-colors">
              Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 bg-slate-950/30">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider">POM Landmark</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">Original</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Trial 1</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Trial 2</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider">Δ1</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider">Δ2</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                  const getStatusBadge = (d: number) => {
                    if (Math.abs(d) === 0) return <Badge variant="success" size="sm">Perfect</Badge>;
                    if (Math.abs(d) <= 0.25) return <Badge variant="warning" size="sm">Tolerance</Badge>;
                    return <Badge variant="danger" size="sm">Alteration</Badge>;
                  };

                  return (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-200">{fd.pomName}</td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-amber-300 font-bold">{fd.original}"</td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-blue-400">{fd.trial1}"</td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs text-purple-400">{fd.trial2}"</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta1)}`}>
                          {getDeltaIcon(fd.delta1)}
                          <span>{fd.delta1 > 0 ? '+' : ''}{fd.delta1}"</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono text-xs font-semibold flex items-center justify-center space-x-1 ${getDeltaColor(fd.delta2)}`}>
                          {getDeltaIcon(fd.delta2)}
                          <span>{fd.delta2 > 0 ? '+' : ''}{fd.delta2}"</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getStatusBadge(fd.delta2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Printable Measurement Card Chart with isolated @media print styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          .measurement-card-print, .measurement-card-print * {
            visibility: visible !important;
          }
          .measurement-card-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
      <div className="measurement-card-print font-sans">
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
    </div>
  );
}

export default function MeasurementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#D4AF37] font-semibold">Loading Measurements Workspace...</div>}>
      <MeasurementsContent />
    </Suspense>
  );
}
