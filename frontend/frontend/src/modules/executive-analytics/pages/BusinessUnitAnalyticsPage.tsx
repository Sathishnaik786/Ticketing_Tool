import { PageHeader } from '@/components/layout/PageHeader';
import { BusinessUnitScorecard } from '../components/BusinessUnitScorecard';
import { useBusinessUnitAnalytics } from '../hooks/useExecutiveAnalytics';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function BusinessUnitAnalyticsPage() {
  const { data, isLoading, isError } = useBusinessUnitAnalytics();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Business Unit Analytics"
        description="Aparna Enterprises business unit performance scorecards."
        className="enterprise-panel mb-0"
      />

      <section className="enterprise-panel">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load business unit analytics.</p>
        ) : (
          <BusinessUnitScorecard scorecards={(data?.scorecards ?? []) as never} />
        )}
      </section>
    </div>
  );
}
