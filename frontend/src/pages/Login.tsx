import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Zap,
  Activity,
  ChevronRight,
  TrendingUp,
  Coins,
  Users,
  CheckCircle2,
  Sparkles,
  Database
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const loadingTexts = [
    'Establishing Access Key...',
    'Authenticating Credentials...',
    'Verifying Security Tokens...',
    'Preparing Enterprise Workspace...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    
    // Animate loader text changes
    const timer1 = setTimeout(() => setLoadingStep(1), 800);
    const timer2 = setTimeout(() => setLoadingStep(2), 1600);
    const timer3 = setTimeout(() => setLoadingStep(3), 2400);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (error: any) {
      // Clear timers
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      
      const errorMessage = error?.message?.includes('NetworkError') || error?.status === 0
        ? 'Operational database connection failed. Verify server is online.'
        : 'Invalid identity portal email or access key key. Please try again.';

      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Variants for staggered entrance animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans overflow-hidden relative selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* 🌌 High-Fidelity Cinematic Background System */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
        
        {/* Animated deep radial ambient gradients */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.12)_0%,transparent_65%)] blur-[100px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_65%)] blur-[100px]" 
        />
        
        {/* Futuristic Floating Glass Orbs */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-tr from-teal-500/5 to-blue-500/5 border border-white/5 backdrop-blur-[6px] shadow-2xl"
        />
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[45%] w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/5 to-teal-500/5 border border-white/5 backdrop-blur-[4px] shadow-2xl"
        />
      </div>

      {/* 🏛️ LEFT PANEL - Cinematic Institutional & Dashboard Preview */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-16 xl:p-20 relative z-10 select-none border-r border-white/[0.03] overflow-hidden">
        
        {/* Dynamic ambient highlight within the left panel */}
        <div className="absolute top-[30%] -right-[20%] w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

        {/* Corporate Logo Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-teal-500/10 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <img src="/logo.png" alt="YVI EMS Logo" className="w-7 h-7 object-contain brightness-110" />
            </div>
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">
              YVI <span className="text-teal-400">EMS</span>
            </span>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-teal-500/70 ml-0.5">
              Enterprise OS
            </span>
          </div>
        </motion.div>

        {/* Dynamic Storytelling & Dashboard Mockup Grid */}
        <div className="space-y-12 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20 shadow-inner">
               <ShieldCheck size={14} className="text-teal-400 animate-pulse" />
               Institutional Access Required
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,4.8rem)] font-display font-black leading-[0.9] tracking-tighter uppercase text-white">
              Authorize <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">Nexus Hub.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed tracking-wide">
              Establish secure terminal access to the unified workforce intelligence operating system.
            </p>
          </motion.div>

          {/* Interactive B2B Dashboard Mockup Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-5 max-w-2xl"
          >
            {/* Mock Card 1: Payroll Stats */}
            <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-teal-500/20 group/mock transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 opacity-0 group-hover/mock:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
                  <Coins size={20} />
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase">
                  <TrendingUp size={14} />
                  +12.4%
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Gross Payroll Volume</p>
              <p className="text-3xl font-display font-black text-white mt-1 group-hover/mock:text-teal-400 transition-colors">1.84M <span className="text-sm font-sans font-bold text-slate-500">INR</span></p>
            </div>

            {/* Mock Card 2: System Metrics */}
            <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-blue-500/20 group/mock transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover/mock:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Users size={20} />
                </div>
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-black uppercase">
                  <CheckCircle2 size={14} className="text-blue-400 animate-pulse" />
                  Active
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Live Workspace Nodes</p>
              <p className="text-3xl font-display font-black text-white mt-1 group-hover/mock:text-blue-400 transition-colors">2.5K <span className="text-sm font-sans font-bold text-slate-500">Users</span></p>
            </div>
          </motion.div>

          {/* Institutional Trust Indicators */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-white/[0.04]"
          >
            {[
              { text: 'SOC2 Certified', icon: ShieldCheck },
              { text: 'E2E Encryption', icon: Lock },
              { text: '99.9% SLA', icon: Activity }
            ].map((trust, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                <trust.icon size={13} className="text-teal-500" />
                <span>{trust.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Build version and system ledger logs */}
        <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
           <div className="flex items-center gap-2">
             <span>System OS: v2.5.0-PF</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-ping" />
             <span>Institutional Ledger Verified</span>
           </div>
        </div>
      </div>

      {/* 🔐 RIGHT PANEL - Premium Authentication Glass Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10 bg-slate-950/20 backdrop-blur-sm lg:backdrop-blur-none">
        
        {/* Core Glass Card Wrapper */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-lg p-10 sm:p-14 rounded-[2.5rem] bg-slate-900/30 dark:bg-slate-950/45 border border-white/5 hover:border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl transition-all duration-700 relative overflow-hidden group/form"
        >
          {/* Top ambient highlight across the card */}
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-teal-500/10 blur-[60px] pointer-events-none" />

          {/* Form Header */}
          <motion.div variants={itemVariants} className="space-y-4 mb-10">
             <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white">
               Authentication
             </h2>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
               Please enter your corporate credentials to establish a secure session with the enterprise node.
             </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              
              {/* Field 1: Email / Corporate ID */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Identity Portal
                  </Label>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 p-[1px] pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    className="h-16 bg-white/[0.02] border-white/10 rounded-2xl px-6 font-sans font-bold tracking-wide text-white focus:bg-white/[0.04] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-teal-500/50 transition-all placeholder:text-slate-700 relative z-10"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-teal-400 transition-colors pointer-events-none z-20">
                    <Database size={18} />
                  </div>
                </div>
              </motion.div>

              {/* Field 2: Password / Access Key */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Access Key
                  </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[10px] font-black uppercase tracking-wider text-teal-400 hover:text-teal-300 hover:underline transition-colors select-none"
                  >
                    Reset Key
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 p-[1px] pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-16 bg-white/[0.02] border-white/10 rounded-2xl px-6 font-sans font-bold tracking-[0.2em] text-white focus:bg-white/[0.04] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-teal-500/50 transition-all placeholder:text-slate-700 relative z-10"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors z-20 focus:outline-none focus:text-teal-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Primary Access Button */}
            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 sm:h-20 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black uppercase tracking-[0.25em] text-xs shadow-[0_20px_50px_rgba(20,184,166,0.15)] group transition-all duration-500 overflow-hidden relative"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                   {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-slate-950" />
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {loadingTexts[loadingStep]}
                          </motion.span>
                        </AnimatePresence>
                      </>
                   ) : (
                      <>
                        Establish Access 
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                      </>
                   )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </form>

          {/* Quantum Encryption & Security Banner */}
          <motion.div variants={itemVariants} className="pt-8 mt-8 border-t border-white/5 space-y-6">
             <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
                   <Lock size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-200">
                     Quantum Encryption Guard Active
                   </p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                     Your session and local data tokens are fully encrypted.
                   </p>
                </div>
             </div>
             
             <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               © 2026 YVI Enterprise Management Systems. All rights reserved.
             </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
