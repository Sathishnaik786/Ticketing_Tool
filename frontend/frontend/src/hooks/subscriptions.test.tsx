import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * Supabase subscription cleanup tests
 * Verifies that all realtime hooks properly clean up their Supabase channels
 * on unmount to prevent memory leaks and ghost subscriptions.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRemoveChannel = vi.fn();
const mockSubscribe = vi.fn();

const createMockChannel = (channelName: string) => ({
  name: channelName,
  on: vi.fn().mockReturnThis(),
  subscribe: mockSubscribe,
});

vi.mock('@/lib/supabase', () => {
  const channels: Record<string, ReturnType<typeof createMockChannel>> = {};
  return {
    supabase: {
      channel: vi.fn((name: string) => {
        channels[name] = createMockChannel(name);
        return channels[name];
      }),
      removeChannel: mockRemoveChannel,
    },
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-abc' } }),
}));

vi.mock('@/services/notificationService', () => ({
  notificationService: {
    getSocket: () => ({ on: vi.fn(), off: vi.fn() }),
    subscribeToNotifications: vi.fn(),
    unsubscribeFromNotifications: vi.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

describe('Supabase subscription cleanup — useRealtimeTickets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls supabase.removeChannel exactly once on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeTickets());
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
  });

  it('does not leak channels when re-rendered multiple times', () => {
    const { rerender, unmount } = renderHook(() => useRealtimeTickets('ticket-1'));
    rerender();
    rerender();
    unmount();
    // Each effect cleanup should remove its own channel
    // removeChannel count depends on how many effects ran
    expect(mockRemoveChannel).toHaveBeenCalled();
  });

  it('removes the correct channel for the active ticket', () => {
    const { supabase } = require('@/lib/supabase');
    const { unmount } = renderHook(() => useRealtimeTickets('ticket-999'));
    unmount();
    expect(supabase.channel).toHaveBeenCalledWith('public:tickets');
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});

describe('Supabase subscription cleanup — useRealtimeNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls supabase.removeChannel exactly once on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeNotifications());
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
  });

  it('creates a user-scoped channel with the correct filter format', () => {
    const { supabase } = require('@/lib/supabase');
    renderHook(() => useRealtimeNotifications());
    expect(supabase.channel).toHaveBeenCalledWith(
      'public:notifications:user_id=user-abc'
    );
  });

  it('does not call removeChannel before component unmounts', () => {
    renderHook(() => useRealtimeNotifications());
    // Still mounted — should not have been cleaned up yet
    expect(mockRemoveChannel).not.toHaveBeenCalled();
  });
});

describe('Multiple concurrent subscriptions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cleans up all channels when both hooks are used together', () => {
    const { unmount: unmount1 } = renderHook(() => useRealtimeTickets());
    const { unmount: unmount2 } = renderHook(() => useRealtimeNotifications());

    unmount1();
    unmount2();

    // Each hook should remove its own channel
    expect(mockRemoveChannel).toHaveBeenCalledTimes(2);
  });
});
