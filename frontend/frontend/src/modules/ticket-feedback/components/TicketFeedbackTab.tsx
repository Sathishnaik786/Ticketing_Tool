import { isTicketFeedbackEnabled } from '@/config/features';
import { TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';
import { TicketFeedbackPanel } from './TicketFeedbackPanel';

interface TicketFeedbackTabProps {
  ticket: Ticket;
  ticketId: string;
}

export function TicketFeedbackTabTrigger({ ticket }: Pick<TicketFeedbackTabProps, 'ticket'>) {
  if (!isTicketFeedbackEnabled || ticket.status !== 'CLOSED') {
    return null;
  }

  return <TabsTrigger value="feedback">Feedback</TabsTrigger>;
}

export function TicketFeedbackTabContent({ ticket, ticketId }: TicketFeedbackTabProps) {
  if (!isTicketFeedbackEnabled || ticket.status !== 'CLOSED') {
    return null;
  }

  return (
    <TabsContent value="feedback" className="enterprise-panel">
      <TicketFeedbackPanel ticket={ticket} ticketId={ticketId} />
    </TabsContent>
  );
}
