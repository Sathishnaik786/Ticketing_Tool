import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}

export function NotificationTabs({ activeTab, onTabChange, counts }: NotificationTabsProps) {
  const tabs = [
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'system', label: 'System' },
    { id: 'announcements', label: 'Announcements' },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-4" role="tablist" aria-label="Notification categories">
      {tabs.map((tab) => {
        const count = counts[tab.id] || 0;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border",
              isActive
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-accent/40"
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-black rounded-lg min-w-5 justify-center",
                    isActive ? "bg-white/20 text-white border-transparent" : "bg-primary/10 text-primary border-transparent"
                  )}
                >
                  {count}
                </Badge>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
export default NotificationTabs;
