import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isEtmsUiV2Enabled } from '@/config/features';
import { TicketraBrandMark, TicketraWordmark } from '@/components/common/TicketraBrandMark';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  const etmsShell = isEtmsUiV2Enabled;

  return (
    <div
      className={cn(
        'h-[72px] flex items-center shrink-0 relative mt-2',
        collapsed ? 'justify-center' : 'px-5 justify-between'
      )}
    >
      <Link to="/app/dashboard" className="flex items-center gap-3 group">
        <TicketraBrandMark size="lg" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <TicketraWordmark
              className={cn(
                'text-lg font-bold tracking-tight',
                etmsShell ? 'text-slate-900 dark:text-white' : undefined
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium uppercase tracking-wider truncate',
                etmsShell
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-500 tracking-[0.2em] mt-1'
              )}
            >
              {etmsShell ? 'Enterprise Ticket Management' : 'Enterprise OS'}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
