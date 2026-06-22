import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Ticket as TicketIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, DataGrid, ErrorState, ActionToolbar } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { departmentsApi, employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { isEtmsUiV2Enabled } from '@/config/features';
import { useTickets } from '../hooks/useTicketing';
import { TicketFiltersBar } from '../components/TicketFilters';
import { ticketGridColumns } from '../components/ticketGridColumns';
import { useAuth } from '@/contexts/AuthContext';
import type { TicketFilters } from '../types/ticketing.types';
import {
  resolveEffectiveTicketScope,
  buildTicketFiltersForScope,
  getTicketScopePageTitle,
} from '../utils/ticketScope.utils';

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
        sort_by: 'created_at',
        sort_order: 'desc',
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
    effectiveScope,
    user,
  ]);

  useEffect(() => {
    setPage(1);
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
          <Button variant={isEtmsUiV2Enabled ? 'default' : 'premium'} size="sm" asChild>
            <Link to="/app/tickets/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Create Ticket
            </Link>
          </Button>
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
