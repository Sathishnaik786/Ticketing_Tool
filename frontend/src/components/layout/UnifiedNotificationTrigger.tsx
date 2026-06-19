import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnreadNotificationCount } from '@/modules/notification-center/hooks/useNotificationCenter';
import { isNotificationCenterEnabled } from '@/config/features';

export function UnifiedNotificationTrigger() {
  if (!isNotificationCenterEnabled) return null;

  const { data: unread = 0 } = useUnreadNotificationCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 rounded-lg"
      asChild
    >
      <Link to="/app/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {unread > 0 ? `${unread} unread notifications` : 'No unread notifications'}
        </span>
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
