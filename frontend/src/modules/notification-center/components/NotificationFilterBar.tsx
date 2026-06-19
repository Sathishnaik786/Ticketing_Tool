interface NotificationFilterBarProps {
  status: string;
  priority: string;
  module: string;
  search: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onModuleChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onMarkAllRead?: () => void;
  isMarkingAll?: boolean;
}

export function NotificationFilterBar({
  status,
  priority,
  module,
  search,
  onStatusChange,
  onPriorityChange,
  onModuleChange,
  onSearchChange,
  onMarkAllRead,
  isMarkingAll,
}: NotificationFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center enterprise-panel p-4">
      <input
        type="search"
        placeholder="Search notifications..."
        className="border rounded px-3 py-1.5 text-sm min-w-[200px]"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select className="border rounded px-2 py-1.5 text-sm" value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="all">All</option>
        <option value="unread">Unread</option>
        <option value="read">Read</option>
      </select>
      <select className="border rounded px-2 py-1.5 text-sm" value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
        <option value="">All priorities</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="NORMAL">Normal</option>
        <option value="LOW">Low</option>
      </select>
      <select className="border rounded px-2 py-1.5 text-sm" value={module} onChange={(e) => onModuleChange(e.target.value)}>
        <option value="">All modules</option>
        <option value="ticketing">Ticketing</option>
        <option value="assignment">Assignment</option>
        <option value="sla">SLA</option>
        <option value="communication">Communication</option>
        <option value="approval">Approval</option>
        <option value="feedback">Feedback</option>
        <option value="knowledge">Knowledge</option>
        <option value="analytics">Analytics</option>
      </select>
      {onMarkAllRead && (
        <button
          type="button"
          className="text-sm border rounded px-3 py-1.5 hover:bg-muted ml-auto disabled:opacity-50"
          onClick={onMarkAllRead}
          disabled={isMarkingAll}
        >
          Mark all read
        </button>
      )}
    </div>
  );
}
