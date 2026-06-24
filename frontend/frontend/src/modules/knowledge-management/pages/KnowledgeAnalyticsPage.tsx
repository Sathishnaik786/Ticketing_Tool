import { PageHeader } from '@/components/layout/PageHeader';
import { useKnowledgeAnalytics } from '../hooks/useKnowledgeManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function KnowledgeAnalyticsPage() {
  const { data, isLoading, isError } = useKnowledgeAnalytics();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Knowledge Analytics"
        description="Article views, ratings, search trends, and ticket deflection metrics."
        className="enterprise-panel mb-0"
      />

      <section className="enterprise-panel space-y-6">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">Unable to load knowledge analytics.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total Articles" value={data?.totalArticles ?? 0} />
              <MetricCard label="Published" value={data?.publishedArticles ?? 0} />
              <MetricCard label="Total Views" value={data?.totalViews ?? 0} />
              <MetricCard label="Deflection Rate" value={`${data?.ticketDeflectionRate ?? 0}%`} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-3">Top Rated</h2>
                <ul className="space-y-2">
                  {(data?.topRated ?? []).map((item) => (
                    <li key={item.article_id} className="flex justify-between text-sm border-b py-2">
                      <span>{item.title}</span>
                      <span className="font-medium">{item.average.toFixed(1)} ★</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-3">Most Viewed</h2>
                <ul className="space-y-2">
                  {(data?.mostViewed ?? []).map((item) => (
                    <li key={item.article_id} className="flex justify-between text-sm border-b py-2">
                      <span>{item.title}</span>
                      <span className="font-medium">{item.views}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Search Trends</h2>
              <ul className="space-y-2">
                {(data?.searchTrends ?? []).slice(0, 10).map((item) => (
                  <li key={item.query} className="flex justify-between text-sm border-b py-2">
                    <span>{item.query}</span>
                    <span className="font-medium">{item.count}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Failed searches: {data?.failedSearches ?? 0} · Successful: {data?.successfulSearches ?? 0}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
