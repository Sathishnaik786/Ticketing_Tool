import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTicketCommunications } from '../hooks/useCommunicationTracking';

vi.mock('@/config/features', () => ({ isCommunicationTrackingEnabled: true }));
vi.mock('../services/communicationTrackingService', () => ({
  communicationTrackingApi: {
    getByTicket: vi.fn().mockResolvedValue({ success: true, data: { communications: [] } }),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useTicketCommunications', () => {
  it('fetches ticket communications', async () => {
    const { result } = renderHook(() => useTicketCommunications('ticket-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.success).toBe(true);
  });
});
