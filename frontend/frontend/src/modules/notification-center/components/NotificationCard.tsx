import type { NotificationEvent } from '../services/notificationCenterService';

interface NotificationCardProps {
  notification: NotificationEvent;
  onMarkRead?: (id: string) => void;
}

const priorityClass: Record<string, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH: 'border-l-orange-500',
  NORMAL: 'border-l-blue-500',
  LOW: 'border-l-gray-400',
};

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  return (
    <article
      className={`border rounded-lg p-4 border-l-4 ${priorityClass[notification.priority] || priorityClass.NORMAL} ${notification.is_read ? 'opacity-70' : 'bg-muted/30'}`}
    >
      <div className="flex justify-between gap-2 items-start">
        <div>
          <h3 className="font-medium text-sm">{notification.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
            <span>{notification.source_module}</span>
            <span>·</span>
            <span>{notification.event_type}</span>
            <span>·</span>
            <span>{new Date(notification.created_at).toLocaleString()}</span>
          </div>
        </div>
        {!notification.is_read && onMarkRead && (
          <button
            type="button"
            className="text-xs border rounded px-2 py-1 hover:bg-muted shrink-0"
            onClick={() => onMarkRead(notification.id)}
          >
            Mark read
          </button>
        )}
      </div>
    </article>
  );
}
