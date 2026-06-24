import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/config/features', () => ({ isTicketAssignmentsEnabled: true }));
vi.mock('../services/ticketAssignmentService', () => ({
  ticketAssignmentApi: {
    getMyQueue: vi.fn().mockResolvedValue({ success: true, data: [], meta: { total: 0 } }),
    getTeamQueue: vi.fn().mockResolvedValue({ success: true, data: [], meta: { total: 2 } }),
    getUnassigned: vi.fn().mockResolvedValue({ success: true, data: [], meta: { total: 1 } }),
    getAnalytics: vi.fn().mockResolvedValue({
      success: true,
      data: { assignmentCount: 5, totalAssigned: 2, totalUnassigned: 1, averageQueueSize: 1 },
    }),
    assignTicket: vi.fn(),
    reassignTicket: vi.fn(),
    getTicketHistory: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

import { useMyQueue, useTeamQueue, useUnassignedQueue, useAssignmentAnalytics } from '../hooks/useTicketAssignment';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useTicketAssignment hooks', () => {
  it('loads my queue', async () => {
    const { result } = renderHook(() => useMyQueue(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.meta?.total).toBe(0);
  });

  it('loads team queue', async () => {
    const { result } = renderHook(() => useTeamQueue(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.meta?.total).toBe(2);
  });

  it('loads unassigned queue', async () => {
    const { result } = renderHook(() => useUnassignedQueue(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.meta?.total).toBe(1);
  });

  it('loads analytics', async () => {
    const { result } = renderHook(() => useAssignmentAnalytics(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.assignmentCount).toBe(5);
  });
});
