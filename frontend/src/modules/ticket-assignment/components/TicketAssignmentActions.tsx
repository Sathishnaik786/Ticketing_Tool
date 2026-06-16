import { isTicketAssignmentsEnabled } from '@/config/features';
import { AssignmentDrawer } from './AssignmentDrawer';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';

interface TicketAssignmentActionsProps {
  ticket: Ticket;
}

export function TicketAssignmentActions({ ticket }: TicketAssignmentActionsProps) {
  if (!isTicketAssignmentsEnabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <AssignmentDrawer ticket={ticket} />
    </div>
  );
}
