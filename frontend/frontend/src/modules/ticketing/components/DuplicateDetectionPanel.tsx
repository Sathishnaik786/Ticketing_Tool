import * as React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTickets } from '../hooks/useTicketing';

export interface DuplicateDetectionPanelProps {
  title: string;
}

export function DuplicateDetectionPanel({ title }: DuplicateDetectionPanelProps) {
  const { data: ticketsResponse } = useTickets();
  const tickets = ticketsResponse?.data || [];

  const duplicate = React.useMemo(() => {
    if (!title.trim() || title.length < 5) return null;
    
    const term = title.toLowerCase();
    // Simple fuzzy keyword matching against active tickets
    return tickets.find((t: any) =>
      t.status !== 'RESOLVED' &&
      t.status !== 'CLOSED' &&
      t.status !== 'CANCELLED' &&
      (t.title.toLowerCase().includes(term) || term.includes(t.title.toLowerCase()) || 
       (t.title.toLowerCase().split(' ').filter((w: string) => w.length > 3 && term.includes(w)).length >= 2))
    );
  }, [title, tickets]);

  if (!duplicate) return null;

  return (
    <div
      className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-200/50 rounded-xl animate-in fade-in duration-200"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">
          Potential Duplicate Ticket Logged
        </h4>
        <p className="text-[11px] text-amber-900/80 dark:text-amber-100/70 leading-relaxed">
          We found a matching ticket logged:{" "}
          <Link
            to={`/app/tickets/${duplicate.id}`}
            className="font-bold underline hover:text-amber-700"
          >
            {duplicate.ticket_number || 'TKT'}: {duplicate.title} ({duplicate.status})
          </Link>
          . Please verify before creating another service desk ticket.
        </p>
      </div>
    </div>
  );
}
export default DuplicateDetectionPanel;
