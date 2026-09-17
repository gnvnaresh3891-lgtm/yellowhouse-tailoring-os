'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'squircle';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      shape = 'squircle',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeClasses = {
      sm: 'h-8 text-xs py-1.5',
      md: 'h-10 text-sm py-2',
      lg: 'h-12 text-base py-3',
    };

    const shapeClasses = {
      pill: 'rounded-full px-4',
      squircle: 'rounded-xl px-3.5',
    };

    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-300 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full bg-slate-900/70 border text-slate-100 placeholder-slate-500 backdrop-blur-xl transition-all duration-200 outline-none select-text',
                'border-white/10 hover:border-white/20',
                'focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[inputSize],
                shapeClasses[shape],
                hasLeftIcon && 'pl-10',
                hasRightIcon && 'pr-10',
                error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-100',
                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-400 font-medium tracking-tight mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 font-normal mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
