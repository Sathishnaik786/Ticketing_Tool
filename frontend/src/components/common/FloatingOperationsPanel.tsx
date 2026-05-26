import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  HelpCircle, 
  Bell, 
  PhoneCall, 
  Command,
  X,
  Plus,
  Cpu,
  ShieldAlert,
  MessageSquare,
  Activity,
  UserCheck,
  ShieldCheck,
  ActivitySquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FloatingOperationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  const actions = [
    { id: 'ai', icon: Cpu, label: 'Workforce AI', color: 'text-teal-400', glow: 'shadow-teal' },
    { id: 'support', icon: MessageSquare, label: 'Support Hub', color: 'text-blue-400', glow: 'shadow-blue' },
    { id: 'alerts', icon: Bell, label: 'Operational Alerts', color: 'text-amber-400', glow: 'shadow-amber' },
    { id: 'emergency', icon: ShieldAlert, label: 'Governance', color: 'text-rose-400', glow: 'shadow-rose' },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-[200] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 right-0 w-80 bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                     <ActivitySquare size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 leading-none">System Architecture</p>
                     <h4 className="font-display text-sm font-black uppercase tracking-tight text-white mt-1">Operational Control</h4>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
               </button>
            </div>

            {/* Content Area */}
            <div className="p-8 space-y-8 min-h-[300px]">
               {activeTab === 'ai' && (
                 <motion.div 
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                 >
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-500">Workforce Intelligence Core</p>
                       <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                          "System wide audit complete. No governance anomalies detected in Payroll Cycle #42."
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                       {['Analyze Variance', 'Compliance Audit', 'Forecast Churn', 'Risk Assessment'].map(btn => (
                         <button key={btn} className="p-3 rounded-xl border border-white/5 bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all text-left">
                            {btn}
                         </button>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'support' && (
                 <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                 >
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Support Orchestration</p>
                    <div className="space-y-4">
                       {[
                         { name: 'Sarah J.', role: 'Lead Governor', status: 'Online' },
                         { name: 'Nexus Support', role: 'Automated Agent', status: 'Instant' },
                       ].map(h => (
                         <div key={h.name} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                               {h.name[0]}
                            </div>
                            <div>
                               <p className="text-xs font-black text-white uppercase">{h.name}</p>
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{h.role}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Navigation Tabs */}
            <div className="p-4 bg-black/40 flex items-center justify-around">
               {actions.map(action => (
                 <button
                    key={action.id}
                    onClick={() => setActiveTab(action.id)}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-300",
                      activeTab === action.id ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
                    )}
                 >
                    <action.icon size={20} className={cn(activeTab === action.id && action.color)} />
                 </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[1.5rem] bg-teal-500 text-slate-950 flex items-center justify-center shadow-[0_20px_50px_rgba(20,184,166,0.3)] border border-teal-400/50 transition-all duration-500 relative overflow-hidden group",
          isOpen && "rotate-90 bg-slate-900 text-white border-white/10"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
               <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="plus" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
               <Plus size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
