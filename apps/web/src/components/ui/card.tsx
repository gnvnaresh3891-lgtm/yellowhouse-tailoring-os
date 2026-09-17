'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export type CardVariant = 'glass' | 'opaque' | 'elevated' | 'gold';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}

export const cardVariants = ({
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  className = '',
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  className?: string;
} = {}) => {
  const baseClasses =
    'rounded-2.5xl relative overflow-hidden transition-all duration-300 font-sans';

  const variantClasses: Record<CardVariant, string> = {
    glass:
      'backdrop-blur-2xl bg-slate-900/60 border border-white/10 shadow-ios-md text-slate-100 [box-shadow:0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]',
    opaque:
      'bg-slate-900 border border-slate-800 text-slate-100 shadow-ios-sm',
    elevated:
      'backdrop-blur-2xl bg-slate-850/80 border border-white/10 shadow-ios-lg text-slate-100 [box-shadow:0_12px_30px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.1)]',
    gold:
      'backdrop-blur-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-900/90 border border-[#D4AF37]/35 shadow-ios-gold text-slate-100 [box-shadow:0_12px_40px_0_rgba(212,175,55,0.14),inset_0_1px_1px_0_rgba(228,191,100,0.3)]',
  };

  const paddingClasses: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const hoverClasses = hoverable
    ? 'cursor-pointer hover:-translate-y-1 hover:border-white/20 hover:shadow-ios-xl'
    : '';

  return twMerge(
    clsx(baseClasses, variantClasses[variant], paddingClasses[padding], hoverClasses, className)
  );
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', padding = 'md', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, hoverable, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(clsx('flex flex-col space-y-1.5 pb-3', className))}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={twMerge(
        clsx(
          'font-display text-base sm:text-lg font-semibold text-slate-100 tracking-tight flex items-center gap-2',
          className
        )
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={twMerge(clsx('text-xs sm:text-sm text-slate-400 font-sans leading-relaxed', className))}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge(clsx('flex-1 min-w-0', className))} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(clsx('flex items-center pt-3 mt-3 border-t border-white/5', className))}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
