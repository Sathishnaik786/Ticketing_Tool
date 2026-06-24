import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/config/features', () => ({ isTicketFeedbackEnabled: true }));
vi.mock('../services/ticketFeedbackService', () => ({
  ticketFeedbackApi: {
    getFeedbackByTicket: vi.fn().mockResolvedValue({ success: true, data: { id: 'f1', rating: 5 } }),
    submitFeedback: vi.fn().mockResolvedValue({ success: true, data: { id: 'f1', rating: 5 } }),
    getMetrics: vi.fn().mockResolvedValue({ success: true, data: { totalFeedback: 2, csatPercentage: 100 } }),
    getMySubmissionCount: vi.fn().mockResolvedValue({ success: true, data: { count: 1 } }),
  },
}));

import { useTicketFeedback, useFeedbackMetrics, useMyFeedbackCount } from '../hooks/useTicketFeedback';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useTicketFeedback hooks', () => {
  it('fetches ticket feedback', async () => {
    const { result } = renderHook(() => useTicketFeedback('ticket-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.rating).toBe(5);
  });

  it('fetches feedback metrics', async () => {
    const { result } = renderHook(() => useFeedbackMetrics(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.totalFeedback).toBe(2);
  });

  it('fetches my feedback count', async () => {
    const { result } = renderHook(() => useMyFeedbackCount(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.count).toBe(1);
  });
});
