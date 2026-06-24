import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader title="Tickets" description="Manage service requests" />
    );
    expect(screen.getByRole('heading', { name: 'Tickets' })).toBeInTheDocument();
    expect(screen.getByText('Manage service requests')).toBeInTheDocument();
  });

  it('renders breadcrumbs and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Detail"
          breadcrumbs={[{ label: 'Home', href: '/app' }, { label: 'Detail' }]}
          actions={<button type="button">Create</button>}
        />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('supports legacy children prop as actions', () => {
    render(
      <PageHeader title="Legacy" actions={undefined}>
        <button type="button">Legacy Action</button>
      </PageHeader>
    );
    expect(screen.getByRole('button', { name: 'Legacy Action' })).toBeInTheDocument();
  });
});
