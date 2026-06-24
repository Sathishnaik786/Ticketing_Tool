import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useCommunicationAnalytics } from '../hooks/useCommunicationTracking';

export function CommunicationAnalyticsWidget() {
  const { data, isLoading, isError } = useCommunicationAnalytics();

  if (isLoading) return <DataTableSkeleton />;

  if (isError || !data?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Analytics unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = data.data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{metrics.totalCommunications}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Calls</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{metrics.callsLogged}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Emails</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{metrics.emailsSent}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Comments</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{metrics.commentsAdded}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Avg response (min)</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold">{metrics.averageResponseTimeMinutes}</p></CardContent>
      </Card>
    </div>
  );
}
