import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Ticket as TicketIcon,
  Download,
  Settings,
  EyeOff,
  MoveLeft,
  MoveRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader, ErrorState, ActionToolbar } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { departmentsApi, employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { isEtmsUiV2Enabled } from '@/config/features';
import { useTickets } from '../hooks/useTicketing';
import { useAuth } from '@/contexts/AuthContext';
import { ticketingApi } from '../services/ticketingService';
import type { TicketFilters, TicketStatus, TicketPriority } from '../types/ticketing.types';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketPriorityBadge } from '../components/TicketPriorityBadge';
import {
  resolveEffectiveTicketScope,
  buildTicketFiltersForScope,
  getTicketScopePageTitle,
} from '../utils/ticketScope.utils';
import { TicketFilterBar, type MultiSelectFilters } from '../components/TicketFilterBar';
import { SavedViewsDropdown, type SavedView } from '../components/SavedViewsDropdown';
import { BulkTicketActions } from '../components/BulkTicketActions';

function formatPerson(
  person?: { first_name?: string; last_name?: string; firstName?: string; lastName?: string; email?: string } | null
): string {
  const first = person?.firstName ?? person?.first_name ?? '';
  const last = person?.lastName ?? person?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || person?.email || '—';
}

const INITIAL_FILTERS: MultiSelectFilters = {
  statuses: [],
  priorities: [],
  departments: [],
  assignees: [],
  categories: [],
  slaStatus: [],
  tags: [],
  watchers: [],
  dateRange: null,
};

const DEFAULT_COLUMNS = [
  { id: 'ticket_number', label: 'Ticket ID', visible: true },
  { id: 'title', label: 'Subject', visible: true },
  { id: 'requester', label: 'Requester', visible: true },
  { id: 'department', label: 'Department', visible: true },
  { id: 'priority', label: 'Priority', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'assignee', label: 'Assignee', visible: true },
  { id: 'created_at', label: 'Created Date', visible: true },
  { id: 'due_date', label: 'Due Date', visible: true },
  { id: 'sla_percent', label: 'SLA status', visible: true },
];

export default function TicketListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawScope = searchParams.get('scope');
  const { user } = useAuth();
  const effectiveScope = resolveEffectiveTicketScope(rawScope, user?.role);

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [multiFilters, setMultiFilters] = React.useState<MultiSelectFilters>(INITIAL_FILTERS);
  
  const [sortBy, setSortBy] = React.useState<string>('created_at');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [selectedTicketIds, setSelectedTicketIds] = React.useState<string[]>([]);
  const [density, setDensity] = React.useState<'compact' | 'comfortable' | 'wide'>('comfortable');
  const [columnsOrder, setColumnsOrder] = React.useState(DEFAULT_COLUMNS);
  const visibleColumns = React.useMemo(() => columnsOrder.filter((col) => col.visible), [columnsOrder]);

  React.useEffect(() => {
    if (rawScope && rawScope !== effectiveScope) {
      navigate(`/app/tickets?scope=${effectiveScope}`, { replace: true });
    }
  }, [rawScope, effectiveScope, navigate]);


  // Sync saved view selections
  const handleSelectView = (view: SavedView) => {
    setSearch(view.search);
    setMultiFilters(view.filters);
    setPage(1);
  };

  // Quick Filter Chips State Checkers
  const toggleQuickFilterChip = (type: 'open' | 'in_progress' | 'overdue' | 'critical' | 'waiting' | 'resolved' | 'mine' | 'team') => {
    const nextFilters = { ...multiFilters };
    if (type === 'open') {
      nextFilters.statuses = nextFilters.statuses.includes('OPEN') ? [] : ['OPEN'];
    } else if (type === 'in_progress') {
      nextFilters.statuses = nextFilters.statuses.includes('IN_PROGRESS') ? [] : ['IN_PROGRESS'];
    } else if (type === 'resolved') {
      nextFilters.statuses = nextFilters.statuses.includes('RESOLVED') ? [] : ['RESOLVED'];
    } else if (type === 'waiting') {
      nextFilters.statuses = nextFilters.statuses.includes('PENDING_USER') ? [] : ['PENDING_USER'];
    } else if (type === 'critical') {
      nextFilters.priorities = nextFilters.priorities.includes('CRITICAL') ? [] : ['CRITICAL'];
    } else if (type === 'overdue') {
      nextFilters.slaStatus = nextFilters.slaStatus.includes('breached') ? [] : ['breached'];
    } else if (type === 'mine') {
      nextFilters.assignees = user?.employeeId && !nextFilters.assignees.includes(user.employeeId) ? [user.employeeId] : [];
    } else if (type === 'team') {
      // Toggle current user department
      if (user?.department_id) {
        nextFilters.departments = nextFilters.departments.includes(user.department_id) ? [] : [user.department_id];
      }
    }
    setMultiFilters(nextFilters);
    setPage(1);
  };

  const filters: TicketFilters = React.useMemo(() => {
    const scoped = buildTicketFiltersForScope(
      effectiveScope,
      user,
      {
        page,
        limit: 20,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }
    );

    // Apply multi-select statuses
    if (multiFilters.statuses.length > 0) {
      // Note: Backend list filter takes a single status, but we select the first active selection as standard,
      // and do local/client filtering for the rest if needed, or fallback.
      scoped.status = multiFilters.statuses[0];
    }
    if (multiFilters.priorities.length > 0) {
      scoped.priority = multiFilters.priorities[0];
    }
    if (multiFilters.departments.length > 0) {
      scoped.department_id = multiFilters.departments[0];
    }
    if (multiFilters.assignees.length > 0) {
      scoped.assignee_id = multiFilters.assignees[0];
    }

    return scoped;
  }, [
    page,
    search,
    multiFilters,
    sortBy,
    sortOrder,
    effectiveScope,
    user,
  ]);

  const { data, isLoading, isError, error, refetch } = useTickets(filters);

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 200 }),
    queryFn: () => employeesApi.getAll({ limit: 200 }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['ticket-categories-list'],
    queryFn: () => ticketingApi.listCategories(),
  });

  const employees = employeesResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];
  const rawTickets = data?.data ?? [];

  // Clientside multi-select filtering fallback
  const tickets = React.useMemo(() => {
    return rawTickets.filter((t) => {
      // Statuses list match
      if (multiFilters.statuses.length > 1 && !multiFilters.statuses.includes(t.status)) {
        return false;
      }
      // Priorities list match
      if (multiFilters.priorities.length > 1 && !multiFilters.priorities.includes(t.priority)) {
        return false;
      }
      // Department list match
      if (multiFilters.departments.length > 1 && t.department_id && !multiFilters.departments.includes(t.department_id)) {
        return false;
      }
      // Assignee list match
      if (multiFilters.assignees.length > 1 && t.assignee_id && !multiFilters.assignees.includes(t.assignee_id)) {
        return false;
      }
      // Categories list match
      if (multiFilters.categories.length > 0 && t.category_id && !multiFilters.categories.includes(t.category_id)) {
        return false;
      }
      // SLA Status list match
      if (multiFilters.slaStatus.length > 0) {
        const isBreached = t.sla_resolution_breached === true;
        const matchesSla = multiFilters.slaStatus.some((sla) => {
          if (sla === 'breached') return isBreached;
          if (sla === 'compliant') return !isBreached;
          return true;
        });
        if (!matchesSla) return false;
      }
      return true;
    });
  }, [rawTickets, multiFilters]);

  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;

  const handleBulkStatus = async (status: TicketStatus) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Updating status to ${status} for ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.changeStatus(id, { status })
        )
      );
      toast.success(`Successfully updated ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err) {
      toast.error(`Failed to update tickets: ${(err as Error).message}`, { id: toastId });
    }
  };

  const handleBulkAssign = async (employeeId: string) => {
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

  const handleBulkPriority = async (priority: TicketPriority) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Updating priority to ${priority} for ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.updateTicket(id, { priority })
        )
      );
      toast.success(`Successfully updated ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err) {
      toast.error(`Failed to update tickets: ${(err as Error).message}`, { id: toastId });
    }
  };

  const handleBulkDepartment = async (deptId: string) => {
    if (selectedTicketIds.length === 0) return;
    const toastId = toast.loading(`Updating department for ${selectedTicketIds.length} tickets...`);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          ticketingApi.updateTicket(id, { department_id: deptId })
        )
      );
      toast.success(`Successfully updated ${selectedTicketIds.length} tickets`, { id: toastId });
      setSelectedTicketIds([]);
      refetch();
    } catch (err) {
      toast.error(`Failed to update tickets: ${(err as Error).message}`, { id: toastId });
    }
  };

  const handleBulkDelete = () => {
    toast.info('Ticket deletion is restricted by compliance policy. Selected tickets cancelled instead.');
    handleBulkStatus('CANCELLED');
  };

  const handleBulkExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const listToExport = tickets.filter((t) => selectedTicketIds.includes(t.id));
    handleExport(formatType, listToExport.length > 0 ? listToExport : tickets);
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf', dataset = tickets) => {
    if (dataset.length === 0) {
      toast.info('No tickets to export.');
      return;
    }

    const headers = [
      'Ticket ID',
      'Subject',
      'Requester',
      'Department',
      'Priority',
      'Status',
      'Assignee',
      'Created Date',
      'Due Date',
    ];

    const rows = dataset.map((t) => [
      t.ticket_number,
      t.title,
      formatPerson(t.requester),
      t.department?.name || '—',
      t.priority,
      t.status,
      formatPerson(t.assignee),
      format(new Date(t.created_at), 'yyyy-MM-dd'),
      t.sla_resolution_due_at ? format(new Date(t.sla_resolution_due_at), 'yyyy-MM-dd') : '—',
    ]);

    if (formatType === 'pdf') {
      // Styled print view
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticketra Export - ${effectiveScope}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                h1 { font-size: 1.5rem; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f5f5f5; }
              </style>
            </head>
            <body>
              <h1>Ticketra ETMS Tickets Report</h1>
              <p>Generated on ${format(new Date(), 'PPp')} (${effectiveScope} scope)</p>
              <table>
                <thead>
                  <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rows.map((row) => `<tr>${row.map((val) => `<td>${val}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        toast.success('PDF report triggered successfully');
      }
    } else {
      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      const blob = new Blob([csvContent], {
        type: formatType === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `ticketra_tickets_${effectiveScope}_${format(new Date(), 'yyyy-MM-dd')}.${formatType === 'csv' ? 'csv' : 'xls'}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Tickets exported as ${formatType.toUpperCase()} successfully`);
    }
  };

  const toggleColumnVisibility = (colId: string) => {
    setColumnsOrder(
      columnsOrder.map((col) => (col.id === colId ? { ...col, visible: !col.visible } : col))
    );
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const nextOrder = [...columnsOrder];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < nextOrder.length) {
      const temp = nextOrder[index];
      nextOrder[index] = nextOrder[targetIndex];
      nextOrder[targetIndex] = temp;
      setColumnsOrder(nextOrder);
    }
  };

  const pageTitle = getTicketScopePageTitle(effectiveScope);

  const paddingClass = {
    compact: 'py-1.5 px-2 text-xs',
    comfortable: 'py-3 px-4 text-sm',
    wide: 'py-5 px-6 text-base',
  }[density];

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTicketIds(tickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const handleToggleSelectRow = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTicketIds([...selectedTicketIds, ticketId]);
    } else {
      setSelectedTicketIds(selectedTicketIds.filter((id) => id !== ticketId));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title={pageTitle}
        description="Ticketra is an Enterprise Ticket Management System providing organizations with robust service capabilities."
        breadcrumbs={[
          { label: 'Tickets', href: '/app/tickets' },
          { label: pageTitle },
        ]}
        actions={
          <div className="flex gap-2">
            <SavedViewsDropdown
              currentFilters={multiFilters}
              currentSearch={search}
              onSelectView={handleSelectView}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 border-input">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>CSV format</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>Excel spreadsheet</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant={isEtmsUiV2Enabled ? 'default' : 'premium'} size="sm" className="h-10" asChild>
              <Link to="/app/tickets/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
              </Link>
            </Button>
          </div>
        }
      />

      {/* Advanced Filter Bar */}
      <TicketFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={multiFilters}
        onFiltersChange={setMultiFilters}
        departmentsList={departments}
        employeesList={employees}
        categoriesList={categories}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center px-1" role="group" aria-label="Quick Filters">
        <span className="text-xs text-muted-foreground font-medium">Quick filters:</span>
        <Button
          variant={multiFilters.statuses.includes('OPEN') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('open')}
          className="h-8 rounded-full text-xs"
        >
          Open
        </Button>
        <Button
          variant={multiFilters.statuses.includes('IN_PROGRESS') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('in_progress')}
          className="h-8 rounded-full text-xs"
        >
          In Progress
        </Button>
        <Button
          variant={multiFilters.statuses.includes('PENDING_USER') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('waiting')}
          className="h-8 rounded-full text-xs"
        >
          Waiting
        </Button>
        <Button
          variant={multiFilters.statuses.includes('RESOLVED') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('resolved')}
          className="h-8 rounded-full text-xs"
        >
          Resolved
        </Button>
        <Button
          variant={multiFilters.slaStatus.includes('breached') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('overdue')}
          className="h-8 rounded-full text-xs border-red-500/30 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Overdue
        </Button>
        <Button
          variant={multiFilters.priorities.includes('CRITICAL') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('critical')}
          className="h-8 rounded-full text-xs border-orange-500/30 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
        >
          Critical
        </Button>
        <Button
          variant={user?.employeeId && multiFilters.assignees.includes(user.employeeId) ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleQuickFilterChip('mine')}
          className="h-8 rounded-full text-xs"
        >
          Mine
        </Button>
        {user?.department_id && (
          <Button
            variant={multiFilters.departments.includes(user.department_id) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleQuickFilterChip('team')}
            className="h-8 rounded-full text-xs"
          >
            My Team
          </Button>
        )}
      </div>

      {/* Bulk actions widget */}
      <BulkTicketActions
        selectedCount={selectedTicketIds.length}
        onClearSelection={() => setSelectedTicketIds([])}
        onBulkAssign={handleBulkAssign}
        onBulkPriority={handleBulkPriority}
        onBulkDepartment={handleBulkDepartment}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        departments={departments}
        employees={employees}
        userRole={user?.role}
      />

      {/* Grid customization parameters */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-muted-foreground">
          Showing {tickets.length} tickets
        </span>
        <div className="flex gap-2 items-center">
          {/* Density Settings */}
          <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
            <Button
              variant={density === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDensity('compact')}
              className="h-8 text-xs px-2.5 rounded-none border-r border-border"
            >
              Compact
            </Button>
            <Button
              variant={density === 'comfortable' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDensity('comfortable')}
              className="h-8 text-xs px-2.5 rounded-none border-r border-border"
            >
              Comfortable
            </Button>
            <Button
              variant={density === 'wide' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDensity('wide')}
              className="h-8 text-xs px-2.5 rounded-none"
            >
              Wide
            </Button>
          </div>

          {/* Column Toggles */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Show / Hide Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columnsOrder.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.visible}
                  onCheckedChange={() => toggleColumnVisibility(col.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isError && (
        <ErrorState
          title="Failed to load tickets"
          message={(error as Error)?.message ?? 'An unexpected error occurred.'}
          onRetry={() => refetch()}
          variant="compact"
        />
      )}

      {/* Enterprise Data Table */}
      {!isError && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table aria-label="Tickets catalog">
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12 py-3 px-4">
                    <Checkbox
                      checked={tickets.length > 0 && selectedTicketIds.length === tickets.length}
                      onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
                      aria-label="Select all tickets"
                    />
                  </TableHead>
                  {visibleColumns.map((col, idx, arr) => (
                      <TableHead key={col.id} className="text-xs uppercase font-semibold text-muted-foreground whitespace-nowrap py-3 px-4">
                        <div className="flex items-center justify-between gap-1 group">
                          <span>{col.label}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Find the absolute index in columnsOrder
                                  const realIdx = columnsOrder.findIndex((c) => c.id === col.id);
                                  moveColumn(realIdx, 'left');
                                }}
                                className="p-0.5 hover:bg-muted rounded"
                                title="Move Left"
                                aria-label={`Move column ${col.label} left`}
                              >
                                <MoveLeft className="h-3 w-3" />
                              </button>
                            )}
                            {idx < arr.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const realIdx = columnsOrder.findIndex((c) => c.id === col.id);
                                  moveColumn(realIdx, 'right');
                                }}
                                className="p-0.5 hover:bg-muted rounded"
                                title="Move Right"
                                aria-label={`Move column ${col.label} right`}
                              >
                                <MoveRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, rIdx) => (
                    <TableRow key={rIdx}>
                      <TableCell className="p-4"><div className="h-4 w-4 bg-muted animate-pulse rounded" /></TableCell>
                      {visibleColumns.map((col) => (
                          <TableCell key={col.id} className="p-4">
                            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-48 text-center text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <p className="font-medium text-base">No tickets matching selection</p>
                        <p className="text-xs">Adjust filters or change your current scope.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((t) => {
                    const isSelected = selectedTicketIds.includes(t.id);
                    return (
                      <TableRow
                        key={t.id}
                        className={`hover:bg-muted/40 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => navigate(`/app/tickets/${t.id}`)}
                      >
                        <TableCell className="py-2 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleToggleSelectRow(t.id, !!checked)}
                            aria-label={`Select ticket ${t.ticket_number}`}
                          />
                        </TableCell>
                        {visibleColumns.map((col) => {
                            let content: React.ReactNode = '—';
                            if (col.id === 'ticket_number') {
                              content = (
                                <Link
                                  to={`/app/tickets/${t.id}`}
                                  className="font-mono text-sm text-primary hover:underline font-semibold"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t.ticket_number}
                                </Link>
                              );
                            } else if (col.id === 'title') {
                              content = <span className="font-medium line-clamp-1">{t.title}</span>;
                            } else if (col.id === 'requester') {
                              content = <span>{formatPerson(t.requester)}</span>;
                            } else if (col.id === 'department') {
                              content = <span>{t.department?.name || '—'}</span>;
                            } else if (col.id === 'priority') {
                              content = <TicketPriorityBadge priority={t.priority} />;
                            } else if (col.id === 'status') {
                              content = <TicketStatusBadge status={t.status} />;
                            } else if (col.id === 'assignee') {
                              content = <span>{formatPerson(t.assignee)}</span>;
                            } else if (col.id === 'created_at') {
                              content = <span>{format(new Date(t.created_at), 'PP')}</span>;
                            } else if (col.id === 'due_date') {
                              content = t.sla_resolution_due_at ? (
                                <span className="text-muted-foreground">{format(new Date(t.sla_resolution_due_at), 'PP')}</span>
                              ) : (
                                '—'
                              );
                            } else if (col.id === 'sla_percent') {
                              const isBreached = t.sla_resolution_breached === true;
                              content = isBreached ? (
                                <Badge variant="destructive" className="text-[10px] font-bold">Breached</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700 border-green-200">Compliant</Badge>
                              );
                            }

                            return (
                              <TableCell key={col.id} className={paddingClass}>
                                {content}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination Actions toolbar */}
      {!isLoading && !isError && tickets.length > 0 && (
        <ActionToolbar align="between" className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Page {meta?.page ?? page} of {totalPages} · {meta?.total ?? tickets.length} tickets
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
    </div>
  );
}
