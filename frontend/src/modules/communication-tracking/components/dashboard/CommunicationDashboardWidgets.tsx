import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isCommunicationTrackingEnabled } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunicationDashboardSummary } from '../../hooks/useCommunicationTracking';

function RecentCommunicationsCard({ title }: { title: string }) {
  const { data, isLoading } = useCommunicationDashboardSummary();
  const items = data?.data.recentCommunications ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/communications">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent communications.</p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <li key={item.id} className="text-sm border-b pb-2 last:border-0">
                <span className="font-medium">{item.communication_type}</span>
                <p className="text-muted-foreground truncate">{item.message}</p>
                <time className="text-xs text-muted-foreground" dateTime={item.created_at}>
                  {format(new Date(item.created_at), 'PP')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunicationDashboardWidgets() {
  const { user } = useAuth();

  if (!isCommunicationTrackingEnabled || !user) return null;

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RecentCommunicationsCard title="Recent Communications" />
      </div>
    );
  }

  if (user.role === 'MANAGER') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RecentCommunicationsCard title="Department Communications" />
      </div>
    );
  }

  if (user.role === 'ADMIN' || user.role === 'HR' || user.role === 'SUPER_ADMIN') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RecentCommunicationsCard title="Enterprise Communications" />
      </div>
    );
  }

  return null;
}
