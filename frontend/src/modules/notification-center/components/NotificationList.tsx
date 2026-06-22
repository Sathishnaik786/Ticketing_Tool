import type { NotificationEvent } from '../services/notificationCenterService';
import { NotificationCard } from './NotificationCard';
import { LoadingState, EmptyState } from '@/components/design-system';
import { Bell } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface NotificationListProps {
  notifications: NotificationEvent[];
  isLoading?: boolean;
  onMarkRead?: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  enableSelection?: boolean;
  emptyMessage?: string;
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkRead,
  selectedIds,
  onToggleSelect,
  enableSelection = false,
  emptyMessage = 'No notifications found.',
}: NotificationListProps) {
  if (isLoading) {
    return <LoadingState label="Loading notifications" variant="skeleton" rows={4} />;
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title={emptyMessage}
        icon={Bell}
        variant="compact"
      />
    );
  }

  return (
    <ul className="space-y-3" role="list" aria-label="Notifications">
      {notifications.map((n) => (
        <li key={n.id} className="flex items-start gap-3">
          {enableSelection && onToggleSelect && (
            <Checkbox
              checked={selectedIds?.has(n.id) ?? false}
              onCheckedChange={() => onToggleSelect(n.id)}
              aria-label={`Select notification: ${n.title}`}
              className="mt-4"
            />
          )}
          <div className="flex-1 min-w-0">
            <NotificationCard notification={n} onMarkRead={onMarkRead} />
          </div>
        </li>
      ))}
    </ul>
  );
}
