'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const badgeVariants = ({
  variant = 'neutral',
  size = 'sm',
  className = '',
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
} = {}) => {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full tracking-tight select-none backdrop-blur-md font-sans transition-colors';

  const variantClasses: Record<BadgeVariant, string> = {
    neutral:
      'bg-slate-800/70 text-slate-300 border border-white/10 shadow-sm',
    gold:
      'bg-yellow-500/15 text-yellow-300 border border-[#D4AF37]/35 shadow-[0_0_12px_rgba(212,175,55,0.12)]',
    success:
      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning:
      'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info:
      'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return twMerge(clsx(baseClasses, variantClasses[variant], sizeClasses[size], className));
};

const dotVariantColors: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-400',
  gold: 'bg-yellow-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-blue-400',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'sm', dot = false, children, ...props }, ref) => {
    return (
      <span ref={ref} className={badgeVariants({ variant, size, className })} {...props}>
        {dot && (
          <span
            className={twMerge(
              clsx('w-1.5 h-1.5 rounded-full shrink-0', dotVariantColors[variant])
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
