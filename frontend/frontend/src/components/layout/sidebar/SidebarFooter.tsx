import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Dot, HelpCircle, LogOut, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isEtmsUiV2Enabled } from '@/config/features';

interface SidebarFooterProps {
  collapsed: boolean;
  user: {
    email?: string | null;
    firstName?: string;
    lastName?: string;
    role?: string;
    profile_image?: string;
    [key: string]: any;
  } | null;
  onLogout: () => void;
}

export function SidebarFooter({ collapsed, user, onLogout }: SidebarFooterProps) {
  const etmsShell = isEtmsUiV2Enabled;
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="p-4 lg:p-5 border-t border-slate-200/60 dark:border-slate-800/60">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-3 w-full rounded-xl p-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              etmsShell
                ? 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                : 'liquid-elevated active:scale-[0.98]',
              collapsed && 'justify-center p-2'
            )}
            aria-label="User menu"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <span className="text-sm font-semibold">{initials}</span>
                  </div>
                )}
              </div>
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck size={10} aria-hidden /> {user?.role}
                </p>
              </motion.div>
            )}
            {!collapsed && (
              <ChevronRight size={14} className="text-slate-400 shrink-0" aria-hidden />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'center' : 'end'}
          className="w-60 rounded-xl p-2"
        >
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Signed in</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link to="/app/profile">
              <User className="h-4 w-4 mr-2" aria-hidden />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer">
            <HelpCircle className="h-4 w-4 mr-2" aria-hidden />
            Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!collapsed && (
        <div className="mt-3 px-1 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          <span>v2.6.0-ETMS</span>
          <Dot className="text-blue-500" aria-hidden />
          <span>{etmsShell ? 'Ticketra' : 'EMTS'}</span>
        </div>
      )}
    </div>
  );
}
