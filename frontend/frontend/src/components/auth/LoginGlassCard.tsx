import React from 'react';
import { motion } from 'framer-motion';
import { TicketraBrandMark } from '@/components/common/TicketraBrandMark';

interface LoginGlassCardProps {
  children: React.ReactNode;
}

export default function LoginGlassCard({ children }: LoginGlassCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 18 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-[100%] p-5 sm:p-8 lg:p-10 rounded-[2rem] bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 hover:border-white/45 dark:hover:border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-500 relative overflow-hidden group/form text-slate-900 dark:text-white"
    >
      {/* 💡 Subtle Card Ambient Highlight */}
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-orange-500/5 blur-[50px] pointer-events-none" />
 
      {/* Form Header utilizing sentence-case Space Grotesk */}
      <motion.div variants={textVariants} className="flex flex-col items-center text-center space-y-4 mb-6 w-full select-none">
         <TicketraBrandMark size="xl" className="h-10 lg:h-12" />
         
         <div className="space-y-1">
           <h2 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-slate-800 dark:text-white leading-tight">
             Welcome Back
           </h2>
           <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
             Sign in to access your enterprise workspace.
           </p>
         </div>
      </motion.div>

      {/* Content wrapper */}
      <motion.div variants={textVariants} className="w-full">
        {children}
      </motion.div>
    </motion.div>
  );
}
