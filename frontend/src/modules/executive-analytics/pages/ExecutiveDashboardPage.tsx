import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCards } from '../components/KpiCards';
import { TrendCharts } from '../components/TrendCharts';
import { ExportToolbar } from '../components/AnalyticsFilters';
import { useExecutiveDashboard, useTrendAnalytics, useCreateAnalyticsReport } from '../hooks/useExecutiveAnalytics';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function ExecutiveDashboardPage() {
  const { data, isLoading, isError } = useExecutiveDashboard();
  const trends = useTrendAnalytics();
  const createReport = useCreateAnalyticsReport();

  const handleExport = (format: 'CSV' | 'XLSX' | 'PDF' | 'JSON') => {
    createReport.mutate({
      name: `Executive Dashboard ${new Date().toISOString().slice(0, 10)}`,
      report_type: 'EXECUTIVE',
      format,
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Executive Dashboard"
        description="Enterprise KPIs and trends for Aparna Enterprises ETMS."
        className="enterprise-panel mb-0"
      />

      <ExportToolbar onExport={handleExport} isExporting={createReport.isPending} />

      <section className="enterprise-panel space-y-6">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load executive dashboard.</p>
        ) : data?.kpis ? (
          <KpiCards kpis={data.kpis} />
        ) : null}
      </section>

      <section className="enterprise-panel">
        {trends.isLoading ? (
          <DataTableSkeleton />
        ) : (
          <TrendCharts monthly={(trends.data?.monthly ?? []) as Array<{ month: string; created: number; closed: number }>} />
        )}
      </section>
    </div>
  );
}
