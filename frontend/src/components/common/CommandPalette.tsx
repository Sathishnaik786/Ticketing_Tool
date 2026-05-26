import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  ChevronRight, 
  History, 
  Star, 
  Navigation, 
  Zap, 
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  CreditCard,
  Settings,
  X
} from 'lucide-react';
import { useCommand } from '@/contexts/CommandContext';
import { useNavigate } from 'react-router-dom';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const { isOpen, setIsOpen, query, setQuery, commands } = useCommand();
  const { history } = useNavigationHistory();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default internal commands
  const internalCommands = useMemo(() => [
    { id: 'nav-dashboard', title: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/app/dashboard') },
    { id: 'nav-employees', title: 'Team Directory', category: 'Navigation', icon: Users, action: () => navigate('/app/employees') },
    { id: 'nav-attendance', title: 'Attendance Workspace', category: 'Navigation', icon: Clock, action: () => navigate('/app/attendance') },
    { id: 'nav-leaves', title: 'Time-Off Requests', category: 'Navigation', icon: Calendar, action: () => navigate('/app/leaves') },
    { id: 'nav-payroll', title: 'Payroll Engine', category: 'Navigation', icon: CreditCard, action: () => navigate('/app/payroll') },
    { id: 'action-payroll', title: 'Run Payroll Cycle', category: 'Actions', icon: Zap, action: () => navigate('/app/payroll/cycles') },
    { id: 'action-report', title: 'Generate Reports', category: 'Actions', icon: History, action: () => navigate('/app/reports') },
    { id: 'sys-settings', title: 'Platform Settings', category: 'System', icon: Settings, action: () => navigate('/app/payroll/settings') },
  ], [navigate]);

  const historyCommands = useMemo(() => 
    history.map(item => ({
      id: `history-${item.path}`,
      title: item.title,
      description: `Visited ${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      category: 'Recent Activity' as any,
      icon: History,
      action: () => navigate(item.path)
    })), [history, navigate]
  );

  const allCommands = useMemo(() => [...internalCommands, ...historyCommands, ...commands], [internalCommands, historyCommands, commands]);

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    const s = query.toLowerCase();
    return allCommands.filter(c => 
      c.title.toLowerCase().includes(s) || 
      c.category.toLowerCase().includes(s)
    );
  }, [allCommands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, setQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, setIsOpen]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof filteredCommands> = {};
    filteredCommands.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="w-full max-w-2xl bg-white dark:bg-[#0B1020] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-10"
          >
            {/* Search Input Area */}
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-muted/10">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Command size={22} />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything... (Pages, Actions, Personnel)"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-xl font-bold placeholder:text-slate-500 text-slate-900 dark:text-white"
              />
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ESC</div>
              </div>
            </div>

            {/* Results Area */}
            <ScrollArea className="flex-1 max-h-[60vh]">
              <div className="p-4 space-y-6">
                {filteredCommands.length > 0 ? (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <div className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Navigation size={10} />
                        {category}
                      </div>
                      <div className="space-y-1">
                        {items.map((command) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = selectedIndex === globalIndex;
                          const Icon = command.icon || Star;

                          return (
                            <button
                              key={command.id}
                              onClick={() => {
                                command.action();
                                setIsOpen(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
                                isSelected ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "hover:bg-white/5 text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary"
                              )}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className={cn("font-bold text-sm", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>
                                  {command.title}
                                </p>
                                {command.description && (
                                  <p className={cn("text-[11px] font-medium mt-0.5", isSelected ? "text-white/70" : "text-slate-500")}>
                                    {command.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight size={16} className={cn("transition-transform", isSelected ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                      <Search size={40} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Failure</p>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">We couldn't find any commands matching your request. Try refining your query.</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 flex items-center">↓↑</div>
                  Navigate
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">ENTER</div>
                  Execute
                </div>
              </div>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">YVI Productivity OS v1.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
