import type { NotificationEvent } from '../services/notificationCenterService';
import { NotificationCard } from './NotificationCard';

interface NotificationListProps {
  notifications: NotificationEvent[];
  isLoading?: boolean;
  onMarkRead?: (id: string) => void;
}

export function NotificationList({ notifications, isLoading, onMarkRead }: NotificationListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground p-4">Loading notifications...</p>;
  }

  if (!notifications.length) {
    return <p className="text-sm text-muted-foreground p-4">No notifications found.</p>;
  }

  return (
    <ul className="space-y-3">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationCard notification={n} onMarkRead={onMarkRead} />
        </li>
      ))}
    </ul>
  );
}
