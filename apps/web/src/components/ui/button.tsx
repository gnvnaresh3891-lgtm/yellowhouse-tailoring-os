'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const buttonVariants = ({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] font-sans tracking-tight';

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-slate-100 text-slate-950 hover:bg-white hover:shadow-ios-md active:bg-slate-200 shadow-ios-sm font-semibold',
    secondary:
      'bg-slate-850/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-white/10 backdrop-blur-md shadow-ios-sm',
    gold:
      'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-slate-950 font-semibold shadow-ios-gold hover:shadow-ios-gold-lg hover:brightness-105 active:brightness-95 border-t border-white/30',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-white/5 active:bg-white/10',
    danger:
      'bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25 active:bg-rose-500/35 hover:text-rose-300',
    outline:
      'border border-white/15 text-slate-200 hover:bg-white/5 hover:border-white/30 active:bg-white/10',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs rounded-full gap-1.5',
    md: 'h-10 px-4 text-sm rounded-full gap-2',
    lg: 'h-12 px-6 text-base rounded-full gap-2.5',
    icon: 'h-10 w-10 p-0 rounded-full flex items-center justify-center',
    'icon-sm': 'h-8 w-8 p-0 rounded-full flex items-center justify-center',
  };

  return twMerge(clsx(baseClasses, variantClasses[variant], sizeClasses[size], className));
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
