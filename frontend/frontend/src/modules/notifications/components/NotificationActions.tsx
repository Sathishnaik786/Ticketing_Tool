import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Archive, Trash2, Pin, X } from 'lucide-react';

export interface NotificationActionsProps {
  selectedCount: number;
  onMarkRead: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onClearSelection: () => void;
}

export function NotificationActions({
  selectedCount,
  onMarkRead,
  onArchive,
  onDelete,
  onPin,
  onClearSelection,
}: NotificationActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-primary/[0.03] border border-primary/20 rounded-xl animate-in slide-in-from-top-3 duration-250 shadow-sm"
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
          {selectedCount} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
          aria-label="Cancel bulk selection"
        >
          <X className="h-3.5 w-3.5" />
          Deselect
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkRead}
          className="text-xs h-8 rounded-lg"
        >
          <Check className="h-3.5 w-3.5 mr-1 text-primary" />
          Mark Read
        </Button>

        {onPin && (
          <Button
            size="sm"
            variant="outline"
            onClick={onPin}
            className="text-xs h-8 rounded-lg"
          >
            <Pin className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Pin / Unpin
          </Button>
        )}

        {onArchive && (
          <Button
            size="sm"
            variant="outline"
            onClick={onArchive}
            className="text-xs h-8 rounded-lg"
          >
            <Archive className="h-3.5 w-3.5 mr-1 text-indigo-500" />
            Archive
          </Button>
        )}

        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-xs h-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-500/5 border-rose-200"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
export default NotificationActions;
