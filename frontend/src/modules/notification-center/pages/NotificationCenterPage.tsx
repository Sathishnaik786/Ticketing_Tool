import { useState, useMemo, useCallback } from 'react';
import { PageHeader, ActionToolbar, ErrorState } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { isEtmsNotificationsEnabled } from '@/config/features';
import { NotificationFilterBar } from '../components/NotificationFilterBar';
import { NotificationList } from '../components/NotificationList';
import { NotificationPreferencesForm } from '../components/NotificationPreferencesForm';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationCenter';
import {
  archiveNotificationIds,
  filterArchivedNotifications,
} from '../utils/notificationArchive.utils';
import { Archive, CheckCheck, Settings } from 'lucide-react';

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState('unread');
  const [viewTab, setViewTab] = useState('inbox');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('');
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabFilters: Record<string, Record<string, string>> = {
    unread: { status: 'unread' },
    mentions: { type: 'mention' },
    approvals: { source_module: 'approval' },
    system: { source_module: 'system' },
    announcements: { type: 'announcement' },
  };

  const effectiveStatus = isEtmsNotificationsEnabled
    ? tabFilters[activeTab]?.status ?? status
    : status;
  const effectiveModule = isEtmsNotificationsEnabled
    ? tabFilters[activeTab]?.source_module ?? module
    : module;

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (effectiveStatus && effectiveStatus !== 'all') f.status = effectiveStatus;
    if (priority) f.priority = priority;
    if (effectiveModule) f.source_module = effectiveModule;
    if (tabFilters[activeTab]?.type) f.type = tabFilters[activeTab].type!;
    if (search) f.search = search;
    return f;
  }, [effectiveStatus, priority, effectiveModule, search, activeTab]);

  const { data, isLoading, isError, refetch } = useMyNotifications(filters);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data: preferences } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const showArchived = viewTab === 'archived';
  const notifications = useMemo(
    () => filterArchivedNotifications(data?.notifications ?? [], showArchived),
    [data?.notifications, showArchived]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  }, [notifications, selectedIds.size]);

  const handleBulkMarkRead = async () => {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => markRead.mutateAsync(id)));
    setSelectedIds(new Set());
  };

  const handleBulkArchive = () => {
    archiveNotificationIds([...selectedIds]);
    setSelectedIds(new Set());
    refetch();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Notification Center"
        description="Enterprise alerts from ticketing, SLA, approvals, communications, knowledge, and analytics."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" aria-hidden />
            Mark all read
          </Button>
        }
      />

      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList className="h-auto">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-3.5 w-3.5 mr-1" aria-hidden />
            Archived
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-3.5 w-3.5 mr-1" aria-hidden />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 mt-4">
          {isEtmsNotificationsEnabled && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <NotificationFilterBar
            status={status}
            priority={priority}
            module={module}
            search={search}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onModuleChange={setModule}
            onSearchChange={setSearch}
            onMarkAllRead={() => markAllRead.mutate()}
            isMarkingAll={markAllRead.isPending}
          />

          {selectedIds.size > 0 && (
            <ActionToolbar align="between" className="rounded-lg border border-border bg-muted/30 p-3">
              <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkMarkRead} disabled={markRead.isPending}>
                  Mark read
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                  <Archive className="h-3.5 w-3.5 mr-1" aria-hidden />
                  Archive
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Cancel
                </Button>
              </div>
            </ActionToolbar>
          )}

          {notifications.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={selectedIds.size === notifications.length && notifications.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all notifications"
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
          )}

          {isError ? (
            <ErrorState title="Unable to load notifications" variant="compact" onRetry={() => refetch()} />
          ) : (
            <section className="rounded-xl border border-border bg-card p-4">
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                onMarkRead={(id) => markRead.mutate(id)}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                enableSelection
              />
            </section>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkRead={(id) => markRead.mutate(id)}
              emptyMessage="No archived notifications."
            />
          </section>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <NotificationPreferencesForm
            preferences={preferences}
            onSave={(prefs) => updatePrefs.mutate(prefs)}
            isSaving={updatePrefs.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
