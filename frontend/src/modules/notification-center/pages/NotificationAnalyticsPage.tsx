import { PageHeader } from '@/components/layout/PageHeader';
import { NotificationAnalyticsWidgets } from '../components/NotificationAnalyticsWidgets';
import { useNotificationAnalytics } from '../hooks/useNotificationCenter';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function NotificationAnalyticsPage() {
  const { data, isLoading, isError } = useNotificationAnalytics();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Notification Analytics"
        description="Enterprise notification metrics by module, priority, and delivery."
        className="enterprise-panel mb-0"
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">Unable to load notification analytics.</p>
      ) : (
        <NotificationAnalyticsWidgets analytics={data} />
      )}
    </div>
  );
}
