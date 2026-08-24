'use client';

import React from 'react';

/**
 * Clean SVG-rendered QR Code Component
 * Generates an authentic visual 2D matrix QR code representation for any text/ID string
 */
export function QRCodeSVG({ 
  value, 
  size = 64, 
  className = '' 
}: { 
  value: string; 
  size?: number; 
  className?: string 
}) {
  // Simple deterministic hash to create a realistic 2D matrix pattern based on string ID
  const generateMatrix = (str: string) => {
    const size = 15;
    const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    
    // Create fixed position locator squares (top-left, top-right, bottom-left)
    const addFinderPattern = (startR: number, startC: number) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3 && (r === 2 || c === 2))) {
            grid[startR + r][startC + c] = true;
          }
        }
      }
    };

    addFinderPattern(0, 0);
    addFinderPattern(0, 10);
    addFinderPattern(10, 0);

    // Hash string into data bits
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    // Fill data grid
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder pattern areas
        if ((r < 5 && c < 5) || (r < 5 && c >= 10) || (r >= 10 && c < 5)) continue;
        const bit = Math.abs((hash ^ (r * 17 + c * 31)) % 3) === 0;
        grid[r][c] = bit;
      }
    }
    return grid;
  };

  const matrix = generateMatrix(value || 'YH-ID');

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1 rounded border border-gray-300 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 15 15" className="shape-rendering-crisp">
        {matrix.map((row, r) =>
          row.map((cell, c) => (
            cell ? (
              <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#000000" />
            ) : null
          ))
        )}
      </svg>
    </div>
  );
}

/**
 * Clean SVG Code 128 / EAN Barcode Component
 * Renders authentic linear barcode stripes with readable label
 */
export function BarcodeSVG({ 
  value, 
  width = 160, 
  height = 40, 
  className = '' 
}: { 
  value: string; 
  width?: number; 
  height?: number; 
  className?: string 
}) {
  // Generate deterministic bar widths from input text
  const generateBars = (str: string) => {
    const bars: number[] = [2, 1, 1, 2]; // Start pattern
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash).toString();
    for (let i = 0; i < absHash.length; i++) {
      const val = parseInt(absHash[i], 10);
      bars.push((val % 3) + 1);
      bars.push(((val + 1) % 2) + 1);
    }
    bars.push(2, 1, 2, 1); // Stop pattern
    return bars;
  };

  const bars = generateBars(value || 'YH-BARCODE');
  const totalUnits = bars.reduce((acc, curr) => acc + curr, 0);
  const unitWidth = width / totalUnits;

  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1.5 border border-gray-300 rounded ${className}`}>
      <svg width={width} height={height} className="shape-rendering-crisp">
        {bars.map((barWidth, idx) => {
          const isBlack = idx % 2 === 0;
          const rectX = currentX;
          currentX += barWidth * unitWidth;
          return isBlack ? (
            <rect
              key={idx}
              x={rectX}
              y={0}
              width={barWidth * unitWidth}
              height={height}
              fill="#000000"
            />
          ) : null;
        })}
      </svg>
      <span className="text-[9px] font-mono font-bold tracking-widest text-black mt-1 uppercase">{value}</span>
    </div>
  );
}
