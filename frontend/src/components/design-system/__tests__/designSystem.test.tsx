import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';
import { EmptyState } from '../EmptyState';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { ActivityTimeline } from '../ActivityTimeline';
import { ActionToolbar } from '../ActionToolbar';
import { Inbox } from 'lucide-react';

describe('FilterBar', () => {
  it('renders search input and fires onChange', () => {
    const onChange = vi.fn();
    render(<FilterBar search={{ value: '', onChange, placeholder: 'Filter...' }} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });
});

describe('EmptyState', () => {
  it('renders title and action', () => {
    const onClick = vi.fn();
    render(
      <EmptyState title="No items" description="Create one" icon={Inbox} action={{ label: 'Create', onClick }} />
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('LoadingState', () => {
  it('renders spinner with label', () => {
    render(<LoadingState label="Loading data" />);
    expect(screen.getByText('Loading data')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders alert with retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState title="Error" message="Failed" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('ActivityTimeline', () => {
  it('renders timeline items', () => {
    render(
      <ActivityTimeline
        items={[
          { id: '1', title: 'Created', timestamp: new Date().toISOString(), actor: 'Jane' },
        ]}
      />
    );
    expect(screen.getByLabelText('Activity timeline')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });
});

describe('ActionToolbar', () => {
  it('renders toolbar with actions', () => {
    render(
      <ActionToolbar label="Page actions">
        <button type="button">Save</button>
      </ActionToolbar>
    );
    expect(screen.getByRole('toolbar', { name: 'Page actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
