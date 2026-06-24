import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';
import type { NavGroup } from '@/config/navigation.utils';
import { isEtmsUiV2Enabled } from '@/config/features';

interface SidebarGroupProps {
  group: NavGroup;
  collapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function SidebarGroup({
  group,
  collapsed,
  isExpanded,
  onToggle,
  onNavigate,
}: SidebarGroupProps) {
  const etmsShell = isEtmsUiV2Enabled;
  const GroupIcon = group.icon;

  return (
    <div className="space-y-1" role="group" aria-label={group.label}>
      {!collapsed && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className={cn(
            'flex items-center justify-between w-full px-3 py-1.5 mb-1 rounded-lg transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            etmsShell
              ? group.isLegacy
                ? 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              : 'liquid-metadata text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300'
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            {GroupIcon && (
              <GroupIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
              {group.label}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={cn('shrink-0 transition-transform opacity-60', !isExpanded && '-rotate-90')}
            aria-hidden
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {(isExpanded || collapsed) && (
          <motion.div
            initial={collapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden space-y-0.5"
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                isLegacy={group.isLegacy}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
