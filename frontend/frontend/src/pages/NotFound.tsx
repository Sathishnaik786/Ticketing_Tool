import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { SearchX, Home, ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Non-existent route access:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-3xl w-full text-center space-y-20 relative z-10"
      >
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-teal-500/20 blur-[120px] rounded-full group-hover:bg-teal-500/30 transition-all duration-1000" />
          <div className="relative w-48 h-48 bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center text-teal-400 shadow-2xl backdrop-blur-3xl mx-auto group-hover:scale-105 transition-transform duration-500">
            <SearchX size={96} strokeWidth={0.5} />
          </div>
          <div className="absolute -top-6 -right-6 bg-teal-500 text-slate-950 font-display font-black text-2xl px-6 py-3 rounded-2xl shadow-2xl rotate-12 uppercase tracking-tighter">
            404
          </div>
        </div>

        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20 mx-auto">
            <Globe size={14} />
            Node Disconnected
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter text-white uppercase leading-[0.85]">Lost in <br /><span className="text-teal-500 text-gradient-teal">EMTS.</span></h1>
          <p className="text-slate-500 text-2xl max-w-lg mx-auto font-bold leading-relaxed uppercase tracking-tight">
            The localized fragment you are searching for does not exist within the current organizational network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-12 rounded-2xl h-24 text-[11px] font-black uppercase tracking-[0.3em] border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all bg-transparent font-sans focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <ArrowLeft size={20} className="mr-4" /> Abort Trace
          </button>
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full px-12 rounded-2xl h-24 text-[11px] font-black uppercase tracking-[0.3em] bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-2xl shadow-teal-500/20 transition-all">
              <Home size={20} className="mr-4" /> Return to Root
            </Button>
          </Link>
        </div>

        <div className="pt-20 flex flex-col items-center gap-6 opacity-40">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
            Route Trace Failed: <span className="text-white ml-2">{location.pathname}</span>
          </div>
          <div className="h-px w-24 bg-white/5" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">EMTS © 2026</p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
