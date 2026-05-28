import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

const variantClasses: Record<NonNullable<GlassCardProps['variant']>, string> = {
  auto: 'bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 backdrop-blur-3xl rounded-[2rem]',
  light: 'bg-white/[0.22] border border-white/30 backdrop-blur-3xl rounded-[2rem]',
  dark: 'bg-slate-950/[0.22] border border-white/10 backdrop-blur-3xl rounded-[2rem]',
};

/**
 * GlassCard — light glassmorphism card surface.
 *
 * Matches the LoginGlassCard base style and serves as the standard glass
 * surface for all card surfaces on the Landing Page.
 *
 * Variants:
 *   "auto"  (default) — respects the active theme via dark: variants
 *   "light" — forces light glass regardless of theme
 *   "dark"  — forces dark glass regardless of theme
 *
 * Requirements: 5.1, 18.1, 18.5
 */
export function GlassCard({ children, className, variant = 'auto' }: GlassCardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        'relative shadow-[0_24px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 dark:before:from-white/5 before:to-transparent before:opacity-30 before:pointer-events-none before:rounded-[2rem]',
        'after:absolute after:inset-px after:rounded-[2rem] after:border after:border-white/10 dark:after:border-white/5 after:pointer-events-none',
        'hover:shadow-[0_30px_100px_rgba(234,88,12,0.06)] dark:hover:shadow-[0_30px_100px_rgba(234,88,12,0.12)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
