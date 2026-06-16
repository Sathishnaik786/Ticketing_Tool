import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { TicketStatusBadge } from '@/modules/ticketing/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/modules/ticketing/components/TicketPriorityBadge';
import type { QueueTicket } from '../services/ticketAssignmentService';

interface QueueTicketTableProps {
  tickets: QueueTicket[];
  emptyMessage?: string;
}

export function QueueTicketTable({ tickets, emptyMessage = 'No tickets in queue.' }: QueueTicketTableProps) {
  if (!tickets.length) {
    return <p className="text-sm text-muted-foreground" role="status">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="p-3 font-medium">Ticket</th>
            <th className="p-3 font-medium">Title</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Priority</th>
            <th className="p-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-t border-border/40 hover:bg-muted/20">
              <td className="p-3">
                <Link to={`/app/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">
                  {ticket.ticket_number}
                </Link>
              </td>
              <td className="p-3">{ticket.title}</td>
              <td className="p-3"><TicketStatusBadge status={ticket.status} /></td>
              <td className="p-3"><TicketPriorityBadge priority={ticket.priority} /></td>
              <td className="p-3 text-muted-foreground">
                <time dateTime={ticket.updated_at}>{format(new Date(ticket.updated_at), 'PPp')}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
