import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Ticket as TicketIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { useAuth } from '@/contexts/AuthContext';
import { ticketingApi } from '../services/ticketingService';
import type { TicketFilters } from '../types/ticketing.types';
import {
  resolveEffectiveTicketScope,
  buildTicketFiltersForScope,
  getTicketScopePageTitle,
} from '../utils/ticketScope.utils';

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
  const [searchParams] = useSearchParams();
  const rawScope = searchParams.get('scope');
  const { user } = useAuth();
  const effectiveScope = resolveEffectiveTicketScope(rawScope, user?.role);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [assigneeId, setAssigneeId] = useState('all');
  
  // Sorting & Selection States
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (rawScope && rawScope !== effectiveScope) {
      navigate(`/app/tickets?scope=${effectiveScope}`, { replace: true });
    }
  }, [rawScope, effectiveScope, navigate]);

  const filters: TicketFilters = useMemo(() => {
    const scoped = buildTicketFiltersForScope(
      effectiveScope,
      user,
      {
        page,
        limit: 20,
        search: search || undefined,
        status: status === 'all' ? undefined : (status as TicketFilters['status']),
        priority: priority === 'all' ? undefined : (priority as TicketFilters['priority']),
        sort_by: sortBy,
        sort_order: sortOrder,
      }
    );

    if (effectiveScope === 'all' || effectiveScope === 'team') {
      if (departmentId !== 'all') scoped.department_id = departmentId;
      if (assigneeId !== 'all') scoped.assignee_id = assigneeId;
    }

    return scoped;
  }, [
    page,
    search,
    status,
    priority,
    departmentId,
    assigneeId,
    sortBy,
    sortOrder,
    effectiveScope,
    user,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedTicketIds([]);
  }, [effectiveScope]);

  const pageTitle = getTicketScopePageTitle(effectiveScope);

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

  // Sorting Handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTicketIds(tickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTicketIds((prev) => [...prev, ticketId]);
    } else {
      setSelectedTicketIds((prev) => prev.filter((id) => id !== ticketId));
    }
  };

  // Bulk Status Change
  const executeBulkStatusChange = async (newStatus: string) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Updating status for ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.changeStatus(id, { status: newStatus as any })
        )
      );
      toast.success(`Successfully updated ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to update tickets: ${err.message}`, { id: toastId });
    }
  };

  // Bulk Assignment Change
  const executeBulkAssign = async (employeeId: string) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Assigning ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.assignTicket(id, { assignee_id: employeeId, assignment_type: 'MANUAL' })
        )
      );
      toast.success(`Successfully assigned ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to assign tickets: ${err.message}`, { id: toastId });
    }
  };

  // CSV Export
  const handleExport = () => {
    setIsExporting(true);
    try {
      if (tickets.length === 0) {
        toast.info('No tickets to export.');
        return;
      }

      const headers = [
        'Ticket Number',
        'Title',
        'Status',
        'Priority',
        'Department',
        'Assignee',
        'Requester',
        'Created Date',
      ];
      
      const rows = tickets.map((t) => [
        t.ticket_number,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.department?.name || '—',
        formatPerson(t.assignee),
        formatPerson(t.requester),
        format(new Date(t.created_at), 'PP'),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ticketra_tickets_${effectiveScope}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Tickets exported successfully');
    } catch (err: any) {
      toast.error(`Failed to export tickets: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Header Sort Wrapper Component
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isSorted = sortBy === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-foreground focus:outline-none font-semibold text-xs tracking-wider uppercase text-muted-foreground transition-colors"
      >
        {children}
        {isSorted && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
      </button>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title={pageTitle}
        description="Track and manage service requests across your organization."
        className="enterprise-panel mb-0"
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            Export CSV
          </Button>
          <Button variant="premium" size="sm" asChild>
            <Link to="/app/tickets/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Ticket
            </Link>
          </Button>
        </div>
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

      {/* Bulk Actions Banner */}
      {selectedTicketIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 enterprise-panel">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">
              {selectedTicketIds.length} selected
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTicketIds([])}>
              Deselect all
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => {
                const val = e.target.value;
                setBulkStatus(val);
                if (val) {
                  executeBulkStatusChange(val);
                  setBulkStatus('');
                }
              }}
              className="text-xs rounded-md border border-input bg-background px-3 py-1.5"
            >
              <option value="">Update Status...</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={bulkAssignee}
              onChange={(e) => {
                const val = e.target.value;
                setBulkAssignee(val);
                if (val) {
                  executeBulkAssign(val);
                  setBulkAssignee('');
                }
              }}
              className="text-xs rounded-md border border-input bg-background px-3 py-1.5"
            >
              <option value="">Assign to...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {formatPerson(emp)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={tickets.length > 0 && selectedTicketIds.length === tickets.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all tickets on this page"
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                  </TableHead>
                  <TableHead scope="col">
                    <SortableHeader field="ticket_number">Ticket Number</SortableHeader>
                  </TableHead>
                  <TableHead scope="col">
                    <SortableHeader field="title">Title</SortableHeader>
                  </TableHead>
                  <TableHead scope="col">
                    <SortableHeader field="status">Status</SortableHeader>
                  </TableHead>
                  <TableHead scope="col">
                    <SortableHeader field="priority">Priority</SortableHeader>
                  </TableHead>
                  <TableHead scope="col">Department</TableHead>
                  <TableHead scope="col">Assignee</TableHead>
                  <TableHead scope="col">Created By</TableHead>
                  <TableHead scope="col">
                    <SortableHeader field="created_at">Created Date</SortableHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTicketIds.includes(ticket.id)}
                        onChange={(e) => handleSelectTicket(ticket.id, e.target.checked)}
                        aria-label={`Select ticket ${ticket.ticket_number}`}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                    </TableCell>
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
