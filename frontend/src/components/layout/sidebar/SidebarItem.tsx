import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isNavItemActive, type NavItem } from '@/config/navigation.utils';
import { isEtmsUiV2Enabled } from '@/config/features';

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  isLegacy?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({ item, collapsed, isLegacy, onNavigate }: SidebarItemProps) {
  const location = useLocation();
  const isActive = isNavItemActive(item, location.pathname, location.search);
  const etmsShell = isEtmsUiV2Enabled;
  const Icon = item.icon;

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        collapsed ? 'justify-center' : '',
        etmsShell
          ? isActive
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-100 dark:border-blue-900/50'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          : isActive
            ? 'liquid-capsule-active'
            : 'liquid-capsule-hover border-transparent text-slate-600 dark:text-slate-400 font-medium'
      )}
    >
      {etmsShell && isActive && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-blue-600 dark:bg-blue-400"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          etmsShell
            ? isActive
              ? 'text-blue-600 dark:text-blue-400'
              : isLegacy
                ? 'text-stone-500'
                : 'text-slate-500 dark:text-slate-400'
            : isActive
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-slate-500 dark:text-slate-400'
        )}
        aria-hidden
      />
      {!collapsed && <span className="text-sm tracking-tight truncate">{item.title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.title}
          {isLegacy ? ' (Legacy)' : ''}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
