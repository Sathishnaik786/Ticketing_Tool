import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Zap, 
  UserPlus, 
  Clock, 
  CalendarPlus, 
  Building2, 
  FileText,
  CreditCard,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function QuickActionLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { id: 'add-emp', title: 'Onboard Personnel', icon: UserPlus, path: '/app/employees', color: 'bg-blue-500' },
    { id: 'run-pay', title: 'Execute Payroll', icon: CreditCard, path: '/app/payroll/cycles', color: 'bg-indigo-500' },
    { id: 'mark-att', title: 'Clock Registry', icon: Clock, path: '/app/attendance', color: 'bg-emerald-500' },
    { id: 'req-lv', title: 'Time-Off Request', icon: CalendarPlus, path: '/app/leaves', color: 'bg-amber-500' },
    { id: 'new-dept', title: 'Define Department', icon: Building2, path: '/app/departments', color: 'bg-rose-500' },
    { id: 'gen-rep', title: 'Generate Insight', icon: FileText, path: '/app/reports', color: 'bg-violet-500' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {actions.map((action, idx) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: idx * 0.05, duration: 0.2, ease: [0.2, 0, 0, 1] }}
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className="group flex items-center gap-3 pr-2"
              >
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  {action.title}
                </span>
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110 active:scale-95",
                  action.color
                )}>
                  <action.icon size={20} />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative group",
          isOpen ? "bg-slate-900 dark:bg-white rotate-45" : "bg-primary hover:scale-110 active:scale-95"
        )}
      >
        {isOpen ? (
          <X size={28} className={cn("transition-colors", isOpen ? "text-white dark:text-slate-900" : "text-white")} />
        ) : (
          <>
            <Zap size={28} className="relative z-10" />
            <div className="absolute inset-0 bg-primary rounded-[2rem] animate-ping opacity-20" />
          </>
        )}
      </button>
    </div>
  );
}
