import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '../DataGrid';

interface Row {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
];

const data: Row[] = [
  { id: '1', name: 'Alpha', status: 'Open' },
  { id: '2', name: 'Beta', status: 'Closed' },
];

describe('DataGrid', () => {
  it('renders rows and columns', () => {
    render(<DataGrid data={data} columns={columns} caption="Test grid" />);
    expect(screen.getByRole('table', { name: 'Test grid' })).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataGrid data={[]} columns={columns} isLoading loadingLabel="Loading rows" />);
    expect(screen.getByLabelText('Loading rows')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<DataGrid data={[]} columns={columns} emptyTitle="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('supports row click', () => {
    const onRowClick = vi.fn();
    render(<DataGrid data={data} columns={columns} onRowClick={onRowClick} getRowId={(r) => r.id} />);
    fireEvent.click(screen.getByText('Alpha'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('supports row selection', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataGrid
        data={data}
        columns={columns}
        enableRowSelection
        getRowId={(r) => r.id}
        onRowSelectionChange={onSelectionChange}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(onSelectionChange).toHaveBeenCalled();
  });
});
