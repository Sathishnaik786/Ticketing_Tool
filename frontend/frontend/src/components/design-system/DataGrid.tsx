import * as React from 'react';
import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  caption?: string;
  className?: string;
  stickyHeader?: boolean;
  compact?: boolean;
}

export function DataGrid<TData>({
  data,
  columns,
  isLoading,
  loadingLabel = 'Loading data...',
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your filters.',
  enableSorting = true,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  onRowClick,
  caption,
  className,
  stickyHeader = true,
  compact = false,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const selectionColumn = React.useMemo((): ColumnDef<TData, unknown> => ({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select row ${row.index + 1}`}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    size: 40,
  }), []);

  const tableColumns = React.useMemo(() => {
    return enableRowSelection ? [selectionColumn, ...columns] : columns;
  }, [enableRowSelection, selectionColumn, columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
    },
    enableSorting,
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(rowSelection) : updater;
          onRowSelectionChange(next);
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getRowId,
    enableRowSelection,
  });

  if (isLoading) {
    return <LoadingState label={loadingLabel} variant="skeleton" rows={6} className={className} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        variant="compact"
        className={className}
      />
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <Table aria-label={caption}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-card' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      className={cn(
                        'text-xs uppercase tracking-wide text-muted-foreground font-medium',
                        compact ? 'h-10 px-3' : 'h-12 px-4',
                        canSort && 'cursor-pointer select-none'
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-muted-foreground" aria-hidden>
                            {sorted === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className={cn(
                  compact ? 'h-10' : 'h-12',
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  row.getIsSelected() && 'bg-primary/5'
                )}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
