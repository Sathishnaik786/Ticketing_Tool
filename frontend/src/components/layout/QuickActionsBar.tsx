import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Command, Eye, Settings, Bell, Search, Keyboard } from 'lucide-react';
import { useCommand } from '@/contexts/CommandContext';
import { useNavigate } from 'react-router-dom';

export function QuickActionsBar() {
  const { setIsOpen } = useCommand();
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl p-2 rounded-2xl flex items-center gap-1.5 animate-in slide-in-from-bottom-5 duration-350"
      role="toolbar"
      aria-label="Operator quick actions toolbar"
    >
      <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Keyboard className="h-4 w-4" />
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />

      {/* Action triggers */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Command className="h-3.5 w-3.5 mr-1" />
        Commands <kbd className="ml-1 px-1 bg-muted rounded border text-[8px] font-sans">Ctrl+K</kbd>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/my-queue')}
        className="h-8 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Eye className="h-3.5 w-3.5 mr-1" />
        My Queue
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/notifications')}
        className="h-8 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell className="h-3.5 w-3.5 mr-1" />
        Alerts
      </Button>
    </div>
  );
}
export default QuickActionsBar;
