import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareHeart, Loader2 } from 'lucide-react';
import { isTicketFeedbackEnabled } from '@/config/features';
import { useMyFeedbackCount } from '../../hooks/useTicketFeedback';

export function EmployeeFeedbackWidget() {
  const { data, isLoading } = useMyFeedbackCount();

  if (!isTicketFeedbackEnabled) {
    return null;
  }

  return (
    <Card className="liquid-surface rounded-[2rem] border-transparent shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4 text-primary" aria-hidden="true" />
          My Feedback Submitted
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <p className="text-3xl font-black">{data?.data?.count ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
