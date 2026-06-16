import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useFeedbackMetrics } from '../hooks/useTicketFeedback';

export default function FeedbackAnalyticsPage() {
  const { data, isLoading } = useFeedbackMetrics();
  const metrics = data?.data;

  if (isLoading) {
    return (
      <div className="p-8">
        <DataTableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Feedback Analytics"
        description="Customer satisfaction metrics across closed tickets"
        className="enterprise-panel mb-0"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Average Rating" value={metrics?.averageRating?.toFixed(2) ?? '0.00'} />
        <MetricCard title="CSAT %" value={`${metrics?.csatPercentage?.toFixed(1) ?? '0.0'}%`} />
        <MetricCard title="Total Feedback" value={String(metrics?.totalFeedback ?? 0)} />
        <MetricCard title="Avg Communication" value={metrics?.averageCommunicationScore?.toFixed(2) ?? '0.00'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard title="Department Wise Rating" items={metrics?.departmentWiseRating ?? []} />
        <RankingCard title="Category Wise Rating" items={metrics?.categoryWiseRating ?? []} />
      </div>

      <Card className="enterprise-panel">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {(metrics?.monthlyTrend ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback data yet.</p>
          ) : (
            <div className="space-y-3">
              {metrics?.monthlyTrend.map((row) => (
                <div key={row.month} className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-sm font-medium">{row.month}</span>
                  <span className="text-sm text-muted-foreground">
                    Avg {row.averageRating.toFixed(1)} · CSAT {row.csatPercentage.toFixed(1)}% · {row.count} responses
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="enterprise-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; averageRating: number; count: number }>;
}) {
  return (
    <Card className="enterprise-panel">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available.</p>
        ) : (
          items.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-semibold">
                {item.averageRating.toFixed(1)} ({item.count})
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
