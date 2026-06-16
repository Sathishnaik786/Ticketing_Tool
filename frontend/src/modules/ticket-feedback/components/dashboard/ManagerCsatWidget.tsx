import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2, Star } from 'lucide-react';
import { isTicketFeedbackEnabled } from '@/config/features';
import { useFeedbackMetrics } from '../../hooks/useTicketFeedback';

export function ManagerCsatWidget() {
  const { data, isLoading } = useFeedbackMetrics();

  if (!isTicketFeedbackEnabled) {
    return null;
  }

  const metrics = data?.data;

  return (
    <Card className="liquid-surface rounded-[2rem] border-transparent shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
          Department CSAT
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-black flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {metrics?.averageRating?.toFixed(1) ?? '0.0'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Feedback Count</p>
              <p className="text-2xl font-black mt-1">{metrics?.totalFeedback ?? 0}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
