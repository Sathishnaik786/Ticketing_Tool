import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher';
import { useShortcuts } from '@/hooks/useShortcuts';
import { isEtmsUiV2Enabled } from '@/config/features';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { Header } from '@/components/layout/Header';

const CommandPalette = lazy(() =>
  import('@/components/common/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const etmsShell = isEtmsUiV2Enabled;

  useShortcuts();

  return (
    <div
      className={cn(
        'h-screen flex w-full text-foreground overflow-hidden font-sans antialiased',
        'selection:bg-blue-500/20 relative z-0',
        etmsShell
          ? 'bg-slate-50 dark:bg-slate-950 lg:p-3 lg:gap-3'
          : 'lg:p-3 lg:gap-3 dark:bg-[#020617]'
      )}
      style={etmsShell ? undefined : { background: '#c1e1ec' }}
    >
      {!etmsShell && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/15 dark:bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/15 dark:bg-cyan-600/20 blur-[120px] rounded-full" />
        </div>
      )}

      <a
        href="#main-app-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[250] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 dark:focus:bg-slate-950 dark:focus:text-white focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-blue-500 font-medium text-sm"
      >
        Skip to main content
      </a>

      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <QuickActionLauncher />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen lg:h-full gap-3">
        <Header />

        <main
          id="main-app-content"
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden scrollbar-premium relative focus:outline-none',
            etmsShell
              ? 'bg-white dark:bg-slate-900 lg:rounded-xl lg:border lg:border-slate-200 dark:lg:border-slate-800'
              : 'liquid-recessed lg:rounded-[2.5rem]'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
