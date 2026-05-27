import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const TESTIMONIALS = [
  {
    quote: "With YVI EMS, our global workforce operations are perfectly synchronized. It is the gold standard for workforce management.",
    author: "Sarah Jenkins",
    role: "Chief People Officer",
    company: "Vanguard Enterprises"
  },
  {
    quote: "The seamless payroll compliance and audit workflows saved our finance teams hundreds of operational hours each quarter.",
    author: "David Chen",
    role: "VP of Global Payroll & Finance",
    company: "Horizon Logistics"
  },
  {
    quote: "An absolute masterpiece in enterprise software design. Legibility, responsiveness, and premium UX combined into one.",
    author: "Elena Rostova",
    role: "Principal Architect & Developer",
    company: "Acme Tech Labs"
  }
];

interface TestimonialCardProps {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function TestimonialCard({ index, setIndex }: TestimonialCardProps) {
  const current = TESTIMONIALS[index];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    // Card is positioned absolutely by parent (bottom-6 left-6 right-6) — fills full width
    <div className="bg-white/[0.18] border border-white/25 backdrop-blur-2xl p-5 xl:p-6 rounded-[1.5rem] text-white shadow-[0_10px_40px_rgba(0,0,0,0.22)] transition-all duration-500 relative overflow-hidden group/card hover:border-white/35 hover:bg-white/[0.22]">
        
        {/* Subtle interior sheens */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent pointer-events-none" />

        <div className="space-y-6 relative z-10">
          
          {/* Quote text wrapper with dynamic height & smooth Framer Motion transitions */}
          <div className="min-h-[72px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="text-sm sm:text-base font-medium leading-relaxed font-sans tracking-tight text-white/95"
              >
                “{current.quote}”
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Divider line */}
          <div className="h-[1px] w-full bg-white/10" />

          {/* Author info and Chevron navigation buttons */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <AnimatePresence mode="wait">
                <motion.h4
                  key={index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-sm font-semibold tracking-wide text-white"
                >
                  {current.author}
                </motion.h4>
              </AnimatePresence>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-xs font-normal text-white/70 tracking-normal"
                >
                  {current.role} • <span className="font-semibold text-orange-400">{current.company}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Micro-interactive navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 focus:outline-none"
                aria-label="Previous Review"
              >
                <ArrowLeft size={16} className="stroke-[2.5]" />
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 focus:outline-none"
                aria-label="Next Review"
              >
                <ArrowRight size={16} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>
    </div>
  );
}
