import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTickets, useTicket } from '../hooks/useTicketing';

vi.mock('@/config/features', () => ({
  isTicketingEnabled: true,
}));

const listTicketsMock = vi.fn();
const getTicketMock = vi.fn();

vi.mock('../services/ticketingService', () => ({
  ticketingApi: {
    listTickets: (...args: unknown[]) => listTicketsMock(...args),
    getTicket: (...args: unknown[]) => getTicketMock(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTicketing hooks', () => {
  beforeEach(() => {
    listTicketsMock.mockReset();
    getTicketMock.mockReset();
  });

  it('loads tickets successfully', async () => {
    listTicketsMock.mockResolvedValue({
      success: true,
      data: [{ id: '1', ticket_number: 'TKT-1', title: 'Test', status: 'OPEN', priority: 'LOW', created_at: new Date().toISOString() }],
      meta: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const { result } = renderHook(() => useTickets({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('surfaces ticket query errors', async () => {
    getTicketMock.mockRejectedValue(Object.assign(new Error('Ticket not found.'), { status: 404 }));

    const { result } = renderHook(() => useTicket('missing-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});
