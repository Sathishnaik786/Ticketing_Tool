import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertTriangle,
  Check,
  Pin,
  Archive,
  Trash2,
  Bell,
  MessageCircle,
  FileCheck,
  Megaphone,
  CreditCard,
  Shield,
  Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_module: string;
  type: string;
  pinned?: boolean;
  link?: string;
}

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  isSelected?: boolean;
  onSelectToggle?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onMarkRead,
  onArchive,
  onDelete,
  onPin,
  isSelected,
  onSelectToggle,
}: NotificationCardProps) {
  const getIcon = () => {
    const mod = notification.source_module?.toLowerCase() || '';
    const type = notification.type?.toLowerCase() || '';

    if (mod === 'approval') return <FileCheck className="h-5 w-5 text-emerald-500" />;
    if (mod === 'payroll') return <CreditCard className="h-5 w-5 text-indigo-500" />;
    if (mod === 'system') return <Shield className="h-5 w-5 text-rose-500" />;
    if (type === 'announcement' || mod === 'announcement') return <Megaphone className="h-5 w-5 text-amber-500" />;
    if (type === 'mention' || type === 'comment') return <MessageCircle className="h-5 w-5 text-blue-500" />;
    
    if (notification.priority === 'CRITICAL' || notification.priority === 'HIGH') {
      return <AlertTriangle className="h-5 w-5 text-rose-500" />;
    }
    return <Bell className="h-5 w-5 text-primary" />;
  };

  const getPriorityStyle = () => {
    switch (notification.priority) {
      case 'CRITICAL':
        return 'border-l-4 border-l-rose-600 bg-rose-500/5';
      case 'HIGH':
        return 'border-l-4 border-l-amber-500 bg-amber-500/5';
      case 'MEDIUM':
        return 'border-l-4 border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-4 border-l-transparent';
    }
  };

  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  }, [notification.created_at]);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border border-border/40 transition-all duration-300 hover:shadow-md",
        notification.read ? "bg-card/45 opacity-75" : "bg-card shadow-sm hover:border-primary/20",
        getPriorityStyle(),
        notification.pinned && "bg-amber-500/[0.02] border-amber-500/10",
        isSelected && "bg-primary/[0.03] border-primary/30"
      )}
      role="article"
      aria-labelledby={`notification-title-${notification.id}`}
    >
      {/* Multi-select check */}
      {onSelectToggle && (
        <div className="pt-1.5 shrink-0">
          <Checkbox
            checked={!!isSelected}
            onCheckedChange={() => onSelectToggle(notification.id)}
            aria-label={`Select notification: ${notification.title}`}
          />
        </div>
      )}

      {/* Module/Type Icon container */}
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border/10",
        notification.read ? "bg-muted/30" : "bg-muted/80 shadow-inner"
      )}>
        {getIcon()}
      </div>

      {/* Notification Text details */}
      <div className="flex-1 min-w-0 pr-16 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            id={`notification-title-${notification.id}`}
            className={cn(
              "font-bold text-sm tracking-tight truncate",
              notification.read ? "text-slate-600 dark:text-slate-400 font-medium" : "text-slate-900 dark:text-white"
            )}
          >
            {notification.title}
          </h4>
          {notification.pinned && (
            <span className="flex items-center text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-lg">
              Pinned
            </span>
          )}
          {!notification.read && (
            <Circle className="h-2 w-2 text-primary fill-primary shrink-0 animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 pt-0.5">
          <span>{notification.source_module.toUpperCase()}</span>
          <span>•</span>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Slide-out / Hover Action Palette */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-card via-card pl-6 py-2 rounded-l-xl">
        {onPin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPin(notification.id)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
            title={notification.pinned ? "Unpin notification" : "Pin notification"}
          >
            <Pin className={cn("h-4 w-4", notification.pinned && "fill-current text-amber-500")} />
          </Button>
        )}
        
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkRead(notification.id)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        {onArchive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArchive(notification.id)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10"
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(notification.id)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
            title="Delete permanently"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
export default NotificationCard;
