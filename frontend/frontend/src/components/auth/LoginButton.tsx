import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingStep: number;
  loadingTexts: string[];
}

export default function LoginButton({
  isLoading,
  loadingStep,
  loadingTexts,
  className,
  children,
  ...props
}: LoginButtonProps) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className="w-full"
    >
      <Button 
        type="submit" 
        disabled={isLoading}
        className={`w-full h-12 lg:h-13 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-450 text-white font-display font-bold tracking-wide text-sm shadow-[0_8px_20px_rgba(249,115,22,0.12)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.22)] hover:-translate-y-[0.5px] transition-all duration-300 overflow-hidden relative border-none group ${className}`}
        {...props}
      >
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin text-white stroke-[2.5]" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={loadingStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="font-sans font-bold text-white tracking-wide text-xs"
                >
                  {loadingTexts[loadingStep]}
                </motion.span>
              </AnimatePresence>
            </>
          ) : (
            <>
              <span>{children || 'Login'}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 stroke-[2.5]" />
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </motion.div>
  );
}
