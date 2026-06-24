import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { CheckCheck, Settings, BellOff } from 'lucide-react';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationCenter';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { NotificationTabs } from '@/modules/notifications/components/NotificationTabs';
import { NotificationFilters } from '@/modules/notifications/components/NotificationFilters';
import { NotificationCard } from '@/modules/notifications/components/NotificationCard';
import { NotificationActions } from '@/modules/notifications/components/NotificationActions';
import { NotificationPreferenceDrawer } from '@/modules/notifications/components/NotificationPreferenceDrawer';
import { NotificationSkeleton } from '@/modules/notifications/components/NotificationSkeleton';
import { toast } from 'sonner';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = React.useState('unread');
  const [search, setSearch] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [module, setModule] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isPrefOpen, setIsPrefOpen] = React.useState(false);

  // Mount real-time subscription hook
  useRealtimeNotifications();

  // Define tab parameters mapping to backend properties
  const tabFilters: Record<string, Record<string, string>> = {
    unread: { status: 'unread' },
    mentions: { type: 'mention' },
    approvals: { source_module: 'approval' },
    system: { source_module: 'system' },
    announcements: { source_module: 'announcement' },
  };

  const queryFilters = React.useMemo(() => {
    const f: Record<string, string> = { ...tabFilters[activeTab] };
    if (search) f.search = search;
    if (priority) f.priority = priority;
    if (module) f.source_module = module;
    return f;
  }, [activeTab, search, priority, module]);

  const { data, isLoading, isError, refetch } = useMyNotifications(queryFilters);
  const { data: preferences } = useNotificationPreferences();
  
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const updatePrefs = useUpdateNotificationPreferences();

  const notificationsList = data?.notifications || [];

  // Group notifications by relative date headers (Today, Yesterday, Older)
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, typeof notificationsList> = {
      Today: [],
      Yesterday: [],
      Older: []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notificationsList.forEach((notif) => {
      const d = new Date(notif.created_at);
      if (d >= today) {
        groups.Today.push(notif);
      } else if (d >= yesterday) {
        groups.Yesterday.push(notif);
      } else {
        groups.Older.push(notif);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [notificationsList]);

  // Tab count indicators (counts of unread notifications matching each tab category)
  const tabCounts = React.useMemo(() => {
    const all = data?.notifications || [];
    return {
      unread: all.filter((n) => !n.read).length,
      mentions: all.filter((n) => n.type === 'mention' && !n.read).length,
      approvals: all.filter((n) => n.source_module === 'approval' && !n.read).length,
      system: all.filter((n) => n.source_module === 'system' && !n.read).length,
      announcements: all.filter((n) => (n.source_module === 'announcement' || n.type === 'announcement') && !n.read).length,
    };
  }, [data]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = async () => {
    await Promise.all(selectedIds.map((id) => markRead.mutateAsync(id)));
    setSelectedIds([]);
    toast.success('Selected notifications marked as read');
  };

  const handleResetFilters = () => {
    setSearch('');
    setPriority('');
    setModule('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Command Notification Center"
        description="Real-time operational alerts across service desk ticketing, approvals, SLA warnings, and broadcasts."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="rounded-xl h-9"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" aria-hidden />
              Mark all read
            </Button>
            <Button
              variant="outlinePremium"
              size="sm"
              onClick={() => setIsPrefOpen(true)}
              className="rounded-xl h-9"
            >
              <Settings className="h-4 w-4 mr-1.5" aria-hidden />
              Preferences
            </Button>
          </div>
        }
      />

      {/* Tabs list navigation */}
      <ComponentErrorBoundary name="NotificationTabs">
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedIds([]);
          }}
          counts={tabCounts}
        />
      </ComponentErrorBoundary>

      {/* Filters options toolbar */}
      <ComponentErrorBoundary name="NotificationFilters">
        <NotificationFilters
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          module={module}
          onModuleChange={setModule}
          onReset={handleResetFilters}
        />
      </ComponentErrorBoundary>

      {/* Bulk action selection banner */}
      <ComponentErrorBoundary name="NotificationActions">
        <NotificationActions
          selectedCount={selectedIds.length}
          onMarkRead={handleBulkMarkRead}
          onClearSelection={() => setSelectedIds([])}
        />
      </ComponentErrorBoundary>

      {/* Primary alerts viewport */}
      <ComponentErrorBoundary name="NotificationList">
        <div className="space-y-6">
          {isLoading ? (
            <NotificationSkeleton />
          ) : isError ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <p className="text-sm text-rose-500">Failed to load alerts feed. Please retry.</p>
              <Button onClick={() => refetch()} className="mt-4" variant="outline">Retry</Button>
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="text-center py-16 border rounded-[2rem] border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-muted/65 flex items-center justify-center text-muted-foreground">
                <BellOff className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Alerts feed clear</p>
                <p className="text-xs text-muted-foreground">You do not have any notifications matching this filter.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedNotifications.map(([dateGroup, items]) => (
                <div key={dateGroup} className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 pl-1">
                    {dateGroup}
                  </h3>
                  <div className="space-y-3">
                    {items.map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        notification={notif}
                        onMarkRead={(id) => markRead.mutate(id)}
                        isSelected={selectedIds.includes(notif.id)}
                        onSelectToggle={handleSelectToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ComponentErrorBoundary>

      {/* Sliding slide-out Preferences panel drawer */}
      <ComponentErrorBoundary name="NotificationPreferenceDrawer">
        <NotificationPreferenceDrawer
          isOpen={isPrefOpen}
          onClose={() => setIsPrefOpen(false)}
          preferences={preferences}
          onSave={(prefs) => {
            updatePrefs.mutate(prefs);
            setIsPrefOpen(false);
            toast.success('Alert preferences saved successfully');
          }}
          isSaving={updatePrefs.isPending}
        />
      </ComponentErrorBoundary>
    </div>
  );
}
