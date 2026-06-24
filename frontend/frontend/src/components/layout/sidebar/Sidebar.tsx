import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { isEtmsNavigationEnabled, isEtmsUiV2Enabled } from '@/config/features';
import {
  filterNavGroups,
  getNavGroupsForMode,
  loadSidebarExpandedSections,
  saveSidebarExpandedSections,
} from '@/config/navigation.utils';
import { SidebarHeader } from './SidebarHeader';
import { SidebarGroup } from './SidebarGroup';
import { SidebarFooter } from './SidebarFooter';

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const etmsNav = isEtmsNavigationEnabled;
  const etmsShell = isEtmsUiV2Enabled;

  const navGroups = useMemo(() => {
    const groups = getNavGroupsForMode(etmsNav);
    return filterNavGroups(groups, user);
  }, [etmsNav, user]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    loadSidebarExpandedSections(etmsNav)
  );

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      saveSidebarExpandedSections(next);
      return next;
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen || !asideRef.current) return;

    const panel = asideRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobile();
        return;
      }
      if (event.key !== 'Tab' || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        ref={asideRef}
        aria-label="Main navigation"
        aria-modal={mobileOpen ? true : undefined}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col overflow-hidden',
          etmsShell
            ? 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 lg:h-[calc(100vh-1.5rem)] lg:rounded-xl lg:shadow-sm'
            : 'lg:h-[calc(100vh-1.5rem)] rounded-[2.5rem] bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl lg:liquid-recessed lg:!bg-black/5 dark:lg:!bg-white/5 lg:border-transparent',
          collapsed ? 'w-16' : 'w-[260px]',
          mobileOpen
            ? 'translate-x-0 m-0 h-screen rounded-none top-0 left-0'
            : '-translate-x-full lg:translate-x-0'
        )}
        animate={collapsed ? { width: 64 } : { width: 260 }}
        initial={false}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        <SidebarHeader collapsed={collapsed} />

        <ScrollArea className="flex-1 px-3">
          <nav className="py-4 space-y-5">
            {navGroups.map((group) => (
              <SidebarGroup
                key={group.id}
                group={group}
                collapsed={collapsed}
                isExpanded={expandedSections[group.label] !== false}
                onToggle={() => toggleSection(group.label)}
                onNavigate={closeMobile}
              />
            ))}
          </nav>
        </ScrollArea>

        <SidebarFooter collapsed={collapsed} user={user} onLogout={logout} />
      </motion.aside>
    </TooltipProvider>
  );
}
