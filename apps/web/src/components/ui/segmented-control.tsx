'use client';

import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gold';
  fullWidth?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  className = '',
  id,
  'aria-label': ariaLabel = 'Segmented options',
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector(
      `[data-value="${CSS.escape(value)}"]`
    ) as HTMLElement | null;

    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [value, options]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledOptions = options.filter((o) => !o.disabled);
    if (enabledOptions.length === 0) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % options.length;
      while (options[nextIndex]?.disabled) {
        nextIndex = (nextIndex + 1) % options.length;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + options.length) % options.length;
      while (options[nextIndex]?.disabled) {
        nextIndex = (nextIndex - 1 + options.length) % options.length;
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
      while (options[nextIndex]?.disabled) {
        nextIndex++;
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
      while (options[nextIndex]?.disabled) {
        nextIndex--;
      }
    }

    if (nextIndex >= 0 && options[nextIndex] && !options[nextIndex].disabled) {
      onChange(options[nextIndex].value);
      const nextBtn = containerRef.current?.querySelector(
        `[data-value="${CSS.escape(options[nextIndex].value)}"]`
      ) as HTMLElement | null;
      nextBtn?.focus();
    }
  };

  const sizeClasses = {
    sm: 'h-8 p-0.5 text-xs',
    md: 'h-10 p-1 text-xs sm:text-sm',
    lg: 'h-12 p-1 text-sm sm:text-base',
  };

  const itemPaddingClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5',
    lg: 'px-5 py-2',
  };

  return (
    <div
      ref={containerRef}
      id={id}
      role="radiogroup"
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          'relative inline-flex items-center rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 select-none p-1 font-sans transition-all',
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className
        )
      )}
    >
      {/* Sliding Active Pill Background Indicator */}
      {indicatorStyle.width > 0 && (
        <div
          aria-hidden="true"
          className={twMerge(
            clsx(
              'absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none',
              variant === 'gold'
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-[#D4AF37]/40 shadow-[0_2px_10px_rgba(212,175,55,0.2)]'
                : 'bg-slate-800/95 border border-white/15 shadow-ios-sm'
            )
          )}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      )}

      {/* Option Buttons */}
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            data-value={option.value}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) {
                onChange(option.value);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={twMerge(
              clsx(
                'relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 active:scale-[0.98]',
                itemPaddingClasses[size],
                fullWidth ? 'flex-1' : '',
                isSelected
                  ? variant === 'gold'
                    ? 'text-yellow-400 font-semibold'
                    : 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200',
                option.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
              )
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
