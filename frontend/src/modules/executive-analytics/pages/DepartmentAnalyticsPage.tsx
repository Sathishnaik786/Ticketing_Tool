import { PageHeader } from '@/components/layout/PageHeader';
import { DepartmentScorecard } from '../components/DepartmentScorecard';
import { useDepartmentAnalytics } from '../hooks/useExecutiveAnalytics';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function DepartmentAnalyticsPage() {
  const { data, isLoading, isError } = useDepartmentAnalytics();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Department Analytics"
        description="Ticket volume, SLA, CSAT, and escalations by department."
        className="enterprise-panel mb-0"
      />

      <section className="enterprise-panel">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load department analytics.</p>
        ) : (
          <DepartmentScorecard scorecards={(data?.scorecards ?? []) as never} />
        )}
      </section>
    </div>
  );
}
