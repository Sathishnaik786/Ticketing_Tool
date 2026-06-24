import { PageHeader } from '@/components/layout/PageHeader';
import { ExportToolbar } from '../components/AnalyticsFilters';
import { useAnalyticsReports, useCreateAnalyticsReport } from '../hooks/useExecutiveAnalytics';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { format } from 'date-fns';

export default function AnalyticsReportsPage() {
  const { data: reports = [], isLoading } = useAnalyticsReports();
  const createReport = useCreateAnalyticsReport();

  const handleExport = (formatType: 'CSV' | 'XLSX' | 'PDF' | 'JSON') => {
    createReport.mutate({
      name: `Analytics Report ${new Date().toISOString().slice(0, 10)}`,
      report_type: 'TREND',
      format: formatType,
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Analytics Reports"
        description="Saved reports and export history."
        className="enterprise-panel mb-0"
      />

      <ExportToolbar onExport={handleExport} isExporting={createReport.isPending} />

      <section className="enterprise-panel">
        {isLoading ? (
          <DataTableSkeleton />
        ) : !reports.length ? (
          <p className="text-sm text-muted-foreground">No reports generated yet. Use export buttons above.</p>
        ) : (
          <ul className="space-y-3">
            {(reports as Array<{ id: string; name: string; report_type: string; format: string; created_at: string }>).map((r) => (
              <li key={r.id} className="flex justify-between border-b py-2 text-sm">
                <span>{r.name}</span>
                <span className="text-muted-foreground">{r.report_type} · {r.format} · {format(new Date(r.created_at), 'PP')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
