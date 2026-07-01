import React, { useState, useEffect } from 'react';
import { TicketraBrandMark } from '@/components/common/TicketraBrandMark';
import BackgroundVisual from './BackgroundVisual';
import ThemeToggle from './ThemeToggle';
import TestimonialCard from './TestimonialCard';

interface GlassLoginLayoutProps {
  children: React.ReactNode;
}

export default function GlassLoginLayout({ children }: GlassLoginLayoutProps) {
  const [index, setIndex] = useState(0);

  // Auto-play index coordinator synchronizing the background visual and testimonial quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#eef0f4] dark:bg-[#0d1117] transition-colors duration-500 overflow-hidden relative selection:bg-orange-500/10 selection:text-orange-500 font-sans">

      {/* ---------------------------------------------------------------------- */}
      {/* LEFT COLUMN: Premium Framed Image Showcase Panel                        */}
      {/* ---------------------------------------------------------------------- */}
      <div className="relative hidden lg:flex lg:w-[50%] xl:w-[54%] flex-col h-screen select-none p-4 xl:p-6 bg-[#eef0f4] dark:bg-[#0d1117]">

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* PREMIUM IMAGE FRAME: rounded, padded, contained — NOT full-bleed   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 rounded-[28px] xl:rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.55)]">

          {/* Slideshow fills the frame — no bleed outside */}
          <BackgroundVisual isSidebar={true} index={index} />

          {/* ── Cinematic darkening gradient at bottom for text readability ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-[3] pointer-events-none" />

          {/* ── Absolute branding watermark — top-left of image frame ── */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
            <TicketraBrandMark size="md" inverted />
          </div>

          {/* ── Glassmorphic Testimonial Card — anchored at bottom of frame ── */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <TestimonialCard index={index} setIndex={setIndex} />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* RIGHT COLUMN: Credentials Glass Login Card                              */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 lg:w-[50%] xl:w-[46%] h-screen overflow-y-auto relative z-10 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">

        {/* Mobile-Only Backdrop */}
        <div className="block lg:hidden">
          <BackgroundVisual isSidebar={false} />
        </div>

        {/* Vercel-style Theme Toggle */}
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-30">
          <ThemeToggle />
        </div>

        {/* Centered login card */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-[440px] mx-auto my-auto space-y-6">
          {children}
        </div>

        {/* Copyright footer */}
        <div className="w-full text-center pt-8 border-t border-slate-200/50 dark:border-white/5 max-w-[440px] mx-auto relative z-10 transition-colors duration-500">
          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 leading-normal select-none">
            © 2026 Ticketra. All rights reserved.
          </span>
        </div>

      </div>
    </div>
  );
}
