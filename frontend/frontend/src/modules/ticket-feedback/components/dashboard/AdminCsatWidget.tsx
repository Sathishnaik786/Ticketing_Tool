import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { isTicketFeedbackEnabled } from '@/config/features';
import { useFeedbackMetrics } from '../../hooks/useTicketFeedback';

export function AdminCsatWidget() {
  const { data, isLoading } = useFeedbackMetrics();

  if (!isTicketFeedbackEnabled) {
    return null;
  }

  const metrics = data?.data;

  return (
    <Card className="liquid-surface rounded-[2rem] border-transparent shadow-none md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          Overall CSAT
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">CSAT %</p>
              <p className="text-2xl font-black mt-1">{metrics?.csatPercentage?.toFixed(1) ?? '0.0'}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-black mt-1">{metrics?.averageRating?.toFixed(1) ?? '0.0'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Top Category</p>
              <p className="text-sm font-semibold mt-1 truncate">
                {metrics?.topRatedCategories?.[0]?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Lowest Category</p>
              <p className="text-sm font-semibold mt-1 truncate">
                {metrics?.lowestRatedCategories?.[0]?.name ?? '—'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
