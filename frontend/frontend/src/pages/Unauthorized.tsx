import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent_70%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full text-center space-y-16 relative z-10"
      >
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-rose-500/20 blur-[100px] rounded-full group-hover:bg-rose-500/30 transition-all duration-1000" />
          <div className="relative w-40 h-40 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-center text-rose-500 shadow-2xl backdrop-blur-3xl mx-auto group-hover:scale-105 transition-transform duration-500">
            <ShieldAlert size={80} strokeWidth={1} />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-rose-500 text-slate-950 font-display font-black text-xs px-4 py-2 rounded-xl shadow-2xl rotate-6 uppercase tracking-widest">
            Identity Blocked
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] border border-rose-500/20 mx-auto">
             <Lock size={14} />
             Clearance Failure
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white uppercase leading-[0.85]">Access <br /><span className="text-rose-500">Denied.</span></h1>
          <p className="text-slate-500 text-xl max-w-md mx-auto font-bold leading-relaxed uppercase tracking-tight">
            Your institutional signature lacks the required authorization levels to interface with this organizational node.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link to="/app/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full px-12 rounded-2xl h-20 text-xs font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={18} className="mr-3" /> Revert Session
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full px-12 rounded-2xl h-20 text-xs font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-200 shadow-2xl shadow-white/5 transition-all">
              <Home size={18} className="mr-3" /> System Root
            </Button>
          </Link>
        </div>

        <div className="pt-16 flex flex-col items-center gap-6 opacity-30">
          <div className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Unauthorized Event Logged to Security Core
          </div>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Ticketra © 2026</p>
        </div>
      </motion.div>
    </div>
  );
}