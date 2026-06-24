import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKDROP_IMAGES = [
  '/workspace_bg_1.png',
  '/workspace_bg_2.png',
  '/workspace_bg_3.png'
];

interface BackgroundVisualProps {
  isSidebar?: boolean;
  index?: number;
}

export default function BackgroundVisual({ isSidebar = false, index: propIndex }: BackgroundVisualProps) {
  const [localIndex, setLocalIndex] = useState(0);

  useEffect(() => {
    if (propIndex !== undefined) return;
    const timer = setInterval(() => {
      setLocalIndex((prev) => (prev + 1) % BACKDROP_IMAGES.length);
    }, 6000); // Transition every 6 seconds
    return () => clearInterval(timer);
  }, [propIndex]);

  const activeIndex = propIndex !== undefined ? propIndex : localIndex;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-colors duration-500 bg-[#f8fafc] dark:bg-slate-950">
      
      {/* 🖼/ Workspace Slideshow Backdrop */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: isSidebar ? 1 : 1.03 }}
            animate={{ opacity: isSidebar ? 1 : 0.85, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ${
              isSidebar ? 'blur-none' : 'blur-[3px]'
            }`}
            style={{ backgroundImage: `url('${BACKDROP_IMAGES[activeIndex]}')` }}
          />
        </AnimatePresence>
      </div>

      {/* 🎬 Atmospheric Contrast Film Overlay */}
      <div className={`absolute inset-0 z-1 transition-colors duration-500 ${
        isSidebar 
          ? 'bg-slate-950/[0.15] dark:bg-slate-950/[0.3]' 
          : 'bg-slate-950/[0.04] dark:bg-slate-950/[0.4]'
      }`} />
      
      {/* 🌌 High-Fidelity Responsive Dot Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] z-2"
        style={{ 
          maskImage: 'radial-gradient(circle at 50% 50%, black 85%, transparent 100%)', 
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 85%, transparent 100%)' 
        }}
      />
      
      {/* 🔮 Soft Radial Ambient Warmth (Orange Accent) */}
      <motion.div 
        animate={{
          scale: [1, 1.12, 0.96, 1],
          x: [0, 15, -10, 0],
          y: [0, -10, 15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] left-[5%] w-[60%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.02)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_60%)] blur-[120px] z-2" 
      />

      {/* ☄/ Soft Slate/Blue Glow on Bottom Right */}
      <motion.div 
        animate={{
          scale: [1, 0.96, 1.05, 1],
          x: [0, -20, 15, 0],
          y: [0, 15, -10, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[25%] right-[5%] w-[60%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_60%)] blur-[140px] z-2" 
      />
      
      {/* Cinematic Vignette Frame */}
      <div className={`absolute inset-0 z-2 ${
        isSidebar
          ? 'bg-[radial-gradient(circle_at_center,transparent_55%,rgba(2,6,23,0.3)_100%)]'
          : 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(248,250,252,0.15)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)]'
      }`} />
    </div>
  );
}
