import { isTicketFeedbackEnabled } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useSubmitTicketFeedback, useTicketFeedback } from '../hooks/useTicketFeedback';
import { TicketFeedbackDisplay } from './TicketFeedbackDisplay';
import { TicketFeedbackForm } from './TicketFeedbackForm';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';

interface TicketFeedbackPanelProps {
  ticket: Ticket;
  ticketId: string;
}

export function TicketFeedbackPanel({ ticket, ticketId }: TicketFeedbackPanelProps) {
  const { user } = useAuth();
  const isRequester = user?.employeeId === ticket.requester_id;
  const { data, isLoading, isError, error } = useTicketFeedback(ticketId);
  const submitFeedback = useSubmitTicketFeedback(ticketId);

  if (!isTicketFeedbackEnabled || ticket.status !== 'CLOSED') {
    return null;
  }

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  const existingFeedback = data?.data;
  const notFound = isError && (error as Error & { status?: number })?.status === 404;

  if (existingFeedback) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Thank you for your feedback
        </p>
        <TicketFeedbackDisplay feedback={existingFeedback} />
      </div>
    );
  }

  if (!isRequester) {
    return (
      <p className="text-sm text-muted-foreground">
        {notFound ? 'No feedback has been submitted for this ticket yet.' : 'Feedback is not available.'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please rate your support experience for this closed ticket.
      </p>
      <TicketFeedbackForm
        onSubmit={(values) => submitFeedback.mutate(values)}
        isSubmitting={submitFeedback.isPending}
        disabled={submitFeedback.isSuccess}
      />
    </div>
  );
}
