import { PageHeader } from '@/components/layout/PageHeader';
import { CommunicationAnalyticsWidget } from '../components/CommunicationAnalyticsWidget';
import { useCommunicationAnalytics } from '../hooks/useCommunicationTracking';

export default function CommunicationAnalyticsPage() {
  const { data } = useCommunicationAnalytics();
  const byDept = data?.data.communicationByDepartment ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Communication Analytics"
        description="Enterprise communication metrics and department breakdown."
        className="enterprise-panel mb-0"
      />

      <CommunicationAnalyticsWidget />

      <div className="enterprise-panel">
        <h2 className="text-lg font-semibold mb-4">By department</h2>
        {byDept.length === 0 ? (
          <p className="text-sm text-muted-foreground">No department data available.</p>
        ) : (
          <ul className="space-y-2">
            {byDept.map((row) => (
              <li key={row.name} className="flex justify-between text-sm border-b pb-2">
                <span>{row.name}</span>
                <span className="font-medium">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
