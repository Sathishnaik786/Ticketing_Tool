import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CommunicationDashboardWidgets } from '../components/dashboard/CommunicationDashboardWidgets';

vi.mock('@/config/features', () => ({ isCommunicationTrackingEnabled: true }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'EMPLOYEE', employeeId: 'e1' } }),
}));
vi.mock('../hooks/useCommunicationTracking', () => ({
  useCommunicationDashboardSummary: () => ({
    data: { data: { recentCommunications: [{ id: 'c1', communication_type: 'COMMENT', message: 'Hi', created_at: '2026-06-15T10:00:00.000Z' }] } },
    isLoading: false,
  }),
}));

describe('CommunicationDashboardWidgets', () => {
  it('renders employee recent communications widget', () => {
    render(
      <MemoryRouter>
        <CommunicationDashboardWidgets />
      </MemoryRouter>
    );
    expect(screen.getByText('Recent Communications')).toBeInTheDocument();
    expect(screen.getByText('COMMENT')).toBeInTheDocument();
  });
});
