import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Ticket as TicketIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { EnterpriseEmptyState } from '@/components/common/EnterpriseEmptyState';
import { departmentsApi, employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { useTickets } from '../hooks/useTicketing';
import { TicketFiltersBar } from '../components/TicketFilters';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketPriorityBadge } from '../components/TicketPriorityBadge';
import type { TicketFilters } from '../types/ticketing.types';

function formatPerson(
  person?: { first_name?: string; last_name?: string; firstName?: string; lastName?: string; email?: string } | null
): string {
  const first = person?.firstName ?? person?.first_name ?? '';
  const last = person?.lastName ?? person?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || person?.email || '—';
}

export default function TicketListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [assigneeId, setAssigneeId] = useState('all');

  const filters: TicketFilters = useMemo(
    () => ({
      page,
      limit: 20,
      search: search || undefined,
      status: status === 'all' ? undefined : (status as TicketFilters['status']),
      priority: priority === 'all' ? undefined : (priority as TicketFilters['priority']),
      department_id: departmentId === 'all' ? undefined : departmentId,
      assignee_id: assigneeId === 'all' ? undefined : assigneeId,
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
    [page, search, status, priority, departmentId, assigneeId]
  );

  const { data, isLoading, isError, error, refetch } = useTickets(filters);

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 200 }),
    queryFn: () => employeesApi.getAll({ limit: 200 }),
  });

  const employees = employeesResponse?.data ?? [];
  const tickets = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Tickets"
        description="Track and manage service requests across your organization."
        className="enterprise-panel mb-0"
      >
        <Button variant="premium" size="sm" asChild>
          <Link to="/app/tickets/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Create Ticket
          </Link>
        </Button>
      </PageHeader>

      <TicketFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(value) => {
          setPriority(value);
          setPage(1);
        }}
        departmentId={departmentId}
        onDepartmentChange={(value) => {
          setDepartmentId(value);
          setPage(1);
        }}
        assigneeId={assigneeId}
        onAssigneeChange={(value) => {
          setAssigneeId(value);
          setPage(1);
        }}
        departments={departments}
        employees={employees}
      />

      {isLoading && (
        <div aria-busy="true" aria-live="polite" className="sr-only">
          Loading tickets
        </div>
      )}
      {isLoading && <DataTableSkeleton />}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6" role="alert">
          <p className="text-sm text-destructive mb-3">
            {(error as Error)?.message ?? 'Failed to load tickets.'}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && tickets.length === 0 && (
        <EnterpriseEmptyState
          title="No tickets found"
          description="Try adjusting your filters or create a new ticket."
          icon={TicketIcon}
          action={{
            label: 'Create Ticket',
            onClick: () => navigate('/app/tickets/new'),
          }}
        />
      )}

      {!isLoading && !isError && tickets.length > 0 && (
        <>
          <div className="enterprise-panel overflow-x-auto">
            <Table aria-label="Tickets list">
              <caption className="sr-only">
                Service tickets with number, title, status, priority, department, assignee, requester, and created date
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Ticket Number</TableHead>
                  <TableHead scope="col">Title</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Priority</TableHead>
                  <TableHead scope="col">Department</TableHead>
                  <TableHead scope="col">Assignee</TableHead>
                  <TableHead scope="col">Created By</TableHead>
                  <TableHead scope="col">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link
                        to={`/app/tickets/${ticket.id}`}
                        className="font-mono text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        aria-label={`View ticket ${ticket.ticket_number}: ${ticket.title}`}
                      >
                        {ticket.ticket_number}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{ticket.title}</TableCell>
                    <TableCell>
                      <TicketStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>{ticket.department?.name ?? '—'}</TableCell>
                    <TableCell>{formatPerson(ticket.assignee)}</TableCell>
                    <TableCell>{formatPerson(ticket.requester)}</TableCell>
                    <TableCell>
                      <time dateTime={ticket.created_at}>
                        {format(new Date(ticket.created_at), 'PP')}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Page {meta?.page ?? page} of {totalPages} • {meta?.total ?? 0} tickets
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
