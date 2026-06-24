import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TicketFeedback } from '../services/ticketFeedbackService';
import { StarRating } from './StarRating';

interface TicketFeedbackDisplayProps {
  feedback: TicketFeedback;
}

export function TicketFeedbackDisplay({ feedback }: TicketFeedbackDisplayProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Submitted Feedback</CardTitle>
        <p className="text-xs text-muted-foreground">
          Submitted on{' '}
          <time dateTime={feedback.submitted_at}>
            {format(new Date(feedback.submitted_at), 'PPp')}
          </time>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <StarRating value={feedback.rating} label="Overall Rating" />
        <StarRating value={feedback.resolution_quality} label="Resolution Quality" />
        <StarRating value={feedback.communication_quality} label="Communication Quality" />
        <StarRating value={feedback.response_time} label="Response Time" />
        {feedback.comments && (
          <div>
            <p className="text-sm font-medium mb-1">Comments</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedback.comments}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
