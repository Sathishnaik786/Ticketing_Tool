import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export default function PremiumButton({
  children,
  className,
  isLoading = false,
  loadingText = 'Loading...',
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        // Base layout and shape
        'h-12 px-8 rounded-2xl',
        // Orange gradient background
        'bg-gradient-to-r from-orange-600 to-orange-500',
        'hover:from-orange-500 hover:to-orange-400',
        // Text
        'text-white font-display font-semibold tracking-wide text-sm',
        // Shadow and hover lift
        'shadow-[0_8px_20px_rgba(249,115,22,0.12)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.22)]',
        'hover:-translate-y-[0.5px]',
        // Transitions
        'transition-all duration-300',
        // Overflow and positioning for shimmer
        'overflow-hidden relative border-none',
        // Group for shimmer trigger
        'group',
        // Focus ring
        'focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none',
        // Disabled state
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {/* Shimmer overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
