import { Link } from 'react-router-dom';
import { useUnreadNotificationCount } from '../hooks/useNotificationCenter';
import { isNotificationCenterEnabled } from '@/config/features';

export function UnreadBadge() {
  const { data: count = 0 } = useUnreadNotificationCount();

  if (!isNotificationCenterEnabled) return null;

  return (
    <Link
      to="/app/notifications"
      className="relative inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
      aria-label="Notification center"
    >
      Alerts
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
