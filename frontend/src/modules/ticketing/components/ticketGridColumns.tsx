import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '../types/ticketing.types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';

function formatPerson(
  person?: { first_name?: string; last_name?: string; firstName?: string; lastName?: string; email?: string } | null
): string {
  const first = person?.firstName ?? person?.first_name ?? '';
  const last = person?.lastName ?? person?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || person?.email || '—';
}

export const ticketGridColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'ticket_number',
    header: 'Ticket #',
    cell: ({ row }) => (
      <Link
        to={`/app/tickets/${row.original.id}`}
        className="font-mono text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        onClick={(e) => e.stopPropagation()}
        aria-label={`View ticket ${row.original.ticket_number}: ${row.original.title}`}
      >
        {row.original.ticket_number}
      </Link>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="max-w-[280px] truncate block text-sm" title={row.original.title}>
        {row.original.title}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
    enableSorting: true,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} />,
    enableSorting: true,
  },
  {
    id: 'department',
    accessorFn: (row) => row.department?.name ?? '—',
    header: 'Department',
    enableSorting: true,
  },
  {
    id: 'assignee',
    accessorFn: (row) => formatPerson(row.assignee),
    header: 'Assignee',
    enableSorting: true,
  },
  {
    id: 'requester',
    accessorFn: (row) => formatPerson(row.requester),
    header: 'Requester',
    enableSorting: true,
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => (
      <time className="text-sm text-muted-foreground" dateTime={row.original.created_at}>
        {format(new Date(row.original.created_at), 'PP')}
      </time>
    ),
    enableSorting: true,
  },
];
