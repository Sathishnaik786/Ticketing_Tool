import { Link } from 'react-router-dom';
import { Plus, Menu, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
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
import {
  isEtmsNotificationsEnabled,
  isNotificationCenterEnabled,
  isEtmsUiV2Enabled,
  isTicketingEnabled,
} from '@/config/features';
import { useUnifiedNotificationsUi } from '@/config/notifications.ui';
import { TicketraBrandMark, TicketraWordmark } from '@/components/common/TicketraBrandMark';
import { NotificationBell } from '@/components/common/NotificationBell';
import { UnreadBadge } from '@/modules/notification-center/components/UnreadBadge';
import { useState } from 'react';

export function Header() {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const { user } = useAuth();
  const etmsShell = isEtmsUiV2Enabled;
  const unifiedNotifications = useUnifiedNotificationsUi();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex items-center transition-all duration-300',
          'h-14 px-3 sm:px-4',
          etmsShell
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:rounded-xl lg:mx-0 lg:shadow-sm'
            : 'h-[72px] lg:h-14 lg:p-1.5 lg:px-2 lg:rounded-full lg:liquid-recessed lg:!bg-black/5 dark:lg:!bg-white/5 lg:border-transparent bg-white/70 dark:bg-[#030B17]/55 backdrop-blur-3xl border-b border-slate-200/60 dark:border-white/10'
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

        <div className="hidden lg:block flex-1 max-w-xl mx-auto px-4">
          <GlobalSearch />
        </div>
        <div className="lg:hidden flex-1 max-w-[140px]">
          <GlobalSearch isMobile />
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

          {unifiedNotifications ? (
            <UnifiedNotificationTrigger />
          ) : (
            <>
              <NotificationBell />
              {isNotificationCenterEnabled && <UnreadBadge />}
            </>
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
