import { Link } from 'react-router-dom';
import { Plus, Menu, ChevronLeft, ChevronRight, MessageCircle, Command, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalSearch } from '@/components/common/GlobalSearch';
import { ChatDrawer } from '@/components/common/ChatDrawer';
import { OnlineIndicator } from '@/components/common/OnlineIndicator';
import { ThemeToggle } from '@/components/auth/ThemeToggle';
import { DepartmentSelector } from '@/components/layout/DepartmentSelector';
import { QuickCreateTicketButton } from '@/components/layout/QuickCreateTicketButton';
import { UnifiedNotificationTrigger } from '@/components/layout/UnifiedNotificationTrigger';
import { useCommand } from '@/contexts/CommandContext';
import { useUnreadNotificationCount } from '@/modules/notification-center/hooks/useNotificationCenter';
import {
  isEtmsUiV2Enabled,
  isTicketingEnabled,
} from '@/config/features';
import { useUnifiedNotificationsUi } from '@/config/notifications.ui';
import { TicketraBrandMark, TicketraWordmark } from '@/components/common/TicketraBrandMark';
import { useState } from 'react';

export function Header() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const { user } = useAuth();
  const { setIsOpen: setCommandOpen } = useCommand();
  const etmsShell = isEtmsUiV2Enabled;
  const unifiedNotifications = useUnifiedNotificationsUi();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch unread count for real-time header bell indicator
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex items-center transition-all duration-300',
          'h-14 px-3 sm:px-4',
          etmsShell
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:rounded-xl lg:mx-0 lg:shadow-sm'
            : 'h-[72px] lg:h-14 lg:p-1.5 lg:px-2 lg:rounded-full lg:liquid-recessed lg:!bg-black/5 dark:lg:!bg-white/5 lg:border-transparent bg-white/70 dark:bg-slate-950/55 backdrop-blur-3xl border-b border-slate-200/60 dark:border-white/10'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-1 rounded-lg"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:flex items-center gap-1 mr-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-lg',
              etmsShell
                ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'rounded-full liquid-capsule-hover'
            )}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <Link to="/app/dashboard" className="flex lg:hidden items-center gap-2 mr-2">
          <TicketraBrandMark size="md" />
          <TicketraWordmark className="text-lg font-bold" />
        </Link>

        {/* Global Search and Shortcuts remind badge */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-auto px-4 items-center gap-2">
          <GlobalSearch />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="h-9 w-9 rounded-xl border hover:bg-muted text-muted-foreground"
            title="Open command palette (Ctrl+K)"
          >
            <Command size={16} />
          </Button>
        </div>
        
        <div className="lg:hidden flex-1 max-w-[140px] flex items-center gap-1">
          <GlobalSearch isMobile />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <Command size={14} />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {etmsShell && isTicketingEnabled && <QuickCreateTicketButton />}
          {!etmsShell && isTicketingEnabled && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-9 w-9 rounded-full"
              asChild
            >
              <Link to="/app/tickets/new" aria-label="Create ticket">
                <Plus className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {etmsShell && <DepartmentSelector />}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatOpen(true)}
            className="h-9 w-9 rounded-lg"
            aria-label="Open chat"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </Button>

          {/* Unified Bell and Unread Counter */}
          {unifiedNotifications ? (
            <UnifiedNotificationTrigger />
          ) : (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg relative"
                asChild
              >
                <Link to="/app/notifications" aria-label="Notifications center">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center border border-white dark:border-slate-900 animate-in zoom-in-50">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          )}

          {etmsShell && <ThemeToggle className="hidden sm:flex" />}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {user && (
            <OnlineIndicator
              firstName={user.firstName || ''}
              lastName={user.lastName || ''}
              email={user.email || ''}
              profileImage={user.profile_image}
              position={user.position || ''}
              role={user.role || ''}
              className={etmsShell ? 'rounded-lg border border-slate-200 dark:border-slate-700' : 'liquid-capsule-hover border-transparent'}
            />
          )}
        </div>
      </header>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
