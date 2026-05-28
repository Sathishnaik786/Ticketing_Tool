import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 z-50 p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 text-slate-650 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-white/80 dark:hover:bg-slate-950/80 shadow-sm backdrop-blur-md transition-all duration-300 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none select-none"
      aria-label="Toggle Theme"
    >
      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
        <Sun size={18} className="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 duration-300" />
        <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 duration-300" />
      </div>
    </button>
  );
}
