import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationFilterBar } from '../components/NotificationFilterBar';
import { NotificationList } from '../components/NotificationList';
import { NotificationPreferencesForm } from '../components/NotificationPreferencesForm';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isEtmsNotificationsEnabled } from '@/config/features';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationCenter';

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState('unread');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('');
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');

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

  const { data, isLoading, isError } = useMyNotifications(filters);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data: preferences } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Notification Center"
        description="Enterprise alerts from ticketing, SLA, approvals, communications, knowledge, and analytics."
        className="enterprise-panel mb-0"
      />

      {isEtmsNotificationsEnabled && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
            <TabsTrigger value="unread" className="rounded-lg">Unread</TabsTrigger>
            <TabsTrigger value="mentions" className="rounded-lg">Mentions</TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-lg">Approvals</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg">System</TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-lg">Announcements</TabsTrigger>
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

      {isError ? (
        <p className="text-sm text-destructive">Unable to load notifications.</p>
      ) : (
        <section className="enterprise-panel p-4">
          <NotificationList
            notifications={data?.notifications ?? []}
            isLoading={isLoading}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        </section>
      )}

      <NotificationPreferencesForm
        preferences={preferences}
        onSave={(prefs) => updatePrefs.mutate(prefs)}
        isSaving={updatePrefs.isPending}
      />
    </div>
  );
}
