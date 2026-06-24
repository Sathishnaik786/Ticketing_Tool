import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';

/**
 * Realtime hooks test suite
 * Tests: useRealtimeTickets, useRealtimeNotifications
 *
 * Strategy:
 * - Mock `notificationService`, `supabase`, `useAuth`, `useQueryClient`
 * - Verify socket event subscription and cleanup
 * - Verify Supabase channel subscription and cleanup
 * - Verify QueryClient invalidation triggers
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockInvalidateQueries = vi.fn();
const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
const mockSocket = { on: mockSocketOn, off: mockSocketOff };

const mockSubscribeToNotifications = vi.fn();
const mockUnsubscribeFromNotifications = vi.fn();
const mockGetSocket = vi.fn(() => mockSocket);

vi.mock('@/services/notificationService', () => ({
  notificationService: {
    getSocket: mockGetSocket,
    subscribeToNotifications: mockSubscribeToNotifications,
    unsubscribeFromNotifications: mockUnsubscribeFromNotifications,
  },
}));

const mockRemoveChannel = vi.fn();
const mockChannelSubscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
const mockChannelOn = vi.fn();
const mockChannel = {
  on: () => ({ subscribe: mockChannelSubscribe }),
  subscribe: mockChannelSubscribe,
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  },
}));

// ─── Tests: useRealtimeTickets ────────────────────────────────────────────────

import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';

describe('useRealtimeTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to ticket socket events on mount', () => {
    renderHook(() => useRealtimeTickets());
    expect(mockSocketOn).toHaveBeenCalledWith('ticket:created', expect.any(Function));
    expect(mockSocketOn).toHaveBeenCalledWith('ticket:assigned', expect.any(Function));
    expect(mockSocketOn).toHaveBeenCalledWith('ticket:status-changed', expect.any(Function));
    expect(mockSocketOn).toHaveBeenCalledWith('ticket:priority-changed', expect.any(Function));
    expect(mockSocketOn).toHaveBeenCalledWith('ticket:comment-added', expect.any(Function));
  });

  it('unsubscribes from socket events on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeTickets());
    unmount();
    expect(mockSocketOff).toHaveBeenCalledWith('ticket:created');
    expect(mockSocketOff).toHaveBeenCalledWith('ticket:assigned');
    expect(mockSocketOff).toHaveBeenCalledWith('ticket:status-changed');
    expect(mockSocketOff).toHaveBeenCalledWith('ticket:priority-changed');
    expect(mockSocketOff).toHaveBeenCalledWith('ticket:comment-added');
  });

  it('creates a Supabase channel on mount', () => {
    const { supabase } = require('@/lib/supabase');
    renderHook(() => useRealtimeTickets());
    expect(supabase.channel).toHaveBeenCalledWith('public:tickets');
  });

  it('removes the Supabase channel on unmount', () => {
    const { supabase } = require('@/lib/supabase');
    const { unmount } = renderHook(() => useRealtimeTickets());
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});

// ─── Tests: useRealtimeNotifications ─────────────────────────────────────────

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

describe('useRealtimeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls subscribeToNotifications on mount', () => {
    renderHook(() => useRealtimeNotifications());
    expect(mockSubscribeToNotifications).toHaveBeenCalledWith(expect.any(Function));
  });

  it('calls unsubscribeFromNotifications on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeNotifications());
    unmount();
    expect(mockUnsubscribeFromNotifications).toHaveBeenCalled();
  });

  it('creates a Supabase user-scoped channel', () => {
    const { supabase } = require('@/lib/supabase');
    renderHook(() => useRealtimeNotifications());
    expect(supabase.channel).toHaveBeenCalledWith(
      expect.stringContaining('public:notifications:user_id=user-123')
    );
  });

  it('removes the Supabase channel on unmount', () => {
    const { supabase } = require('@/lib/supabase');
    const { unmount } = renderHook(() => useRealtimeNotifications());
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });
});
