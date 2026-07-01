import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'p-2 rounded-xl border text-slate-600 dark:text-slate-300',
        'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        'hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
        'focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none',
        className
      )}
      aria-label="Toggle theme"
      type="button"
    >
      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
        <Sun size={18} className="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
        <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
      </div>
    </button>
  );
}

export default ThemeToggle;
