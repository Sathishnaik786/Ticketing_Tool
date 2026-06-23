import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Ticket as TicketIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader, DataGrid, ErrorState, ActionToolbar } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { departmentsApi, employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { isEtmsUiV2Enabled } from '@/config/features';
import { useTickets } from '../hooks/useTicketing';
import { TicketFiltersBar } from '../components/TicketFilters';
import { ticketGridColumns } from '../components/ticketGridColumns';
import { useAuth } from '@/contexts/AuthContext';
import { ticketingApi } from '../services/ticketingService';
import type { TicketFilters, TicketStatus } from '../types/ticketing.types';
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
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');
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

  const columns = useMemo(() => ticketGridColumns, []);

  const rowSelection = useMemo(
    () => Object.fromEntries(selectedTicketIds.map((id) => [id, true])),
    [selectedTicketIds]
  );

  const executeBulkStatusChange = async (newStatus: string) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Updating status for ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.changeStatus(id, { status: newStatus as TicketStatus })
        )
      );
      toast.success(`Successfully updated ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err) {
      toast.error(`Failed to update tickets: ${(err as Error).message}`, { id: toastId });
    }
  };

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
    } catch (err) {
      toast.error(`Failed to assign tickets: ${(err as Error).message}`, { id: toastId });
    }
  };

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
      link.setAttribute(
        'download',
        `ticketra_tickets_${effectiveScope}_${format(new Date(), 'yyyy-MM-dd')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Tickets exported successfully');
    } catch (err) {
      toast.error(`Failed to export tickets: ${(err as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title={pageTitle}
        description="Track and manage service requests across your organization."
        breadcrumbs={[
          { label: 'Tickets', href: '/app/tickets' },
          { label: pageTitle },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              Export CSV
            </Button>
            <Button variant={isEtmsUiV2Enabled ? 'default' : 'premium'} size="sm" asChild>
              <Link to="/app/tickets/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Create Ticket
              </Link>
            </Button>
          </div>
        }
      />

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

      {selectedTicketIds.length > 0 && (
        <ActionToolbar align="between" className="rounded-xl border border-primary/20 bg-primary/5 p-3">
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
              aria-label="Bulk update status"
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
              aria-label="Bulk assign tickets"
            >
              <option value="">Assign to...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {formatPerson(emp)}
                </option>
              ))}
            </select>
          </div>
        </ActionToolbar>
      )}

      {isError && (
        <ErrorState
          title="Failed to load tickets"
          message={(error as Error)?.message ?? 'An unexpected error occurred.'}
          onRetry={() => refetch()}
          variant="compact"
        />
      )}

      {!isError && (
        <DataGrid
          data={tickets}
          columns={columns}
          isLoading={isLoading}
          loadingLabel="Loading tickets"
          emptyTitle="No tickets found"
          emptyDescription="Try adjusting your filters or create a new ticket."
          caption="Service tickets with number, title, status, priority, department, assignee, requester, and created date"
          onRowClick={(row) => navigate(`/app/tickets/${row.id}`)}
          stickyHeader
          compact={!isEtmsUiV2Enabled}
          enableSorting={false}
          enableRowSelection
          getRowId={(row) => row.id}
          rowSelection={rowSelection}
          onRowSelectionChange={(selection) => {
            setSelectedTicketIds(Object.keys(selection).filter((id) => selection[id]));
          }}
        />
      )}

      {!isLoading && !isError && tickets.length > 0 && (
        <ActionToolbar align="between" className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Page {meta?.page ?? page} of {totalPages} · {meta?.total ?? 0} tickets
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
        </ActionToolbar>
      )}

      {!isLoading && !isError && tickets.length === 0 && (
        <div className="text-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/tickets/new">
              <TicketIcon className="mr-2 h-4 w-4" aria-hidden />
              Create Ticket
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
