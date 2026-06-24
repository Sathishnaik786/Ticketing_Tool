import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommandDashboardPage } from '../pages/CommandDashboardPage';
import { useEtmsDashboard } from '../hooks/useEtmsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Mock the hook modules
vi.mock('../hooks/useEtmsDashboard', () => ({
  useEtmsDashboard: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the PageHeader component to avoid dependency errors in tests
vi.mock('@/components/design-system', () => ({
  PageHeader: ({ title, description }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
  MetricCard: ({ label, value }: any) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

// Mock Recharts to avoid SVG scaling warnings in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

describe('ETMS Command Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when dashboard is loading', () => {
    const adminUser = { id: '1', role: 'ADMIN' as const, email: 'admin@ticketra.com' };
    vi.mocked(useAuth).mockReturnValue({
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      hasRole: (roles: string | string[]) => {
        return Array.isArray(roles) ? roles.includes(adminUser.role) : roles === adminUser.role;
      },
      updateProfileImage: vi.fn(),
      refreshProfileImage: vi.fn(),
    });

    vi.mocked(useEtmsDashboard).mockReturnValue({
      kpis: undefined,
      ticketStatus: undefined,
      departmentPerformance: [],
      activities: [],
      pendingApprovals: [],
      knowledgeStats: undefined,
      loading: true,
      error: null,
    });

    render(<CommandDashboardPage />);
    expect(screen.queryByText('Ticketra Command Center')).toBeNull();
  });

  it('renders all widgets for ADMIN role', () => {
    const adminUser = { id: '1', role: 'ADMIN' as const, email: 'admin@ticketra.com' };
    vi.mocked(useAuth).mockReturnValue({
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      hasRole: (roles: string | string[]) => {
        return Array.isArray(roles) ? roles.includes(adminUser.role) : roles === adminUser.role;
      },
      updateProfileImage: vi.fn(),
      refreshProfileImage: vi.fn(),
    });

    vi.mocked(useEtmsDashboard).mockReturnValue({
      kpis: {
        totalTickets: 120,
        openTickets: 34,
        assignedTickets: 5,
        overdueTickets: 4,
        resolvedToday: 8,
        slaCompliancePercent: 95.5,
        pendingApprovals: 2,
        knowledgeArticles: 14,
        teamPerformanceScore: 88,
      },
      ticketStatus: { open: 12, inProgress: 14, waiting: 2, resolved: 8, closed: 84 },
      departmentPerformance: [
        { department: 'IT Support', open: 12, avgResolutionHours: 4.5, slaPercent: 94, trend: 'stable' }
      ],
      activities: [
        { id: '1', type: 'created', message: 'TKT-1042 created', timestamp: new Date().toISOString() }
      ],
      pendingApprovals: [
        { id: 'app-1', requester: 'Alice', category: 'IT', requestDate: new Date().toISOString(), status: 'PENDING' }
      ],
      knowledgeStats: {
        totalArticles: 14,
        helpfulRatingsPercent: 92,
        topCategories: [{ category: 'IT Support', count: 8 }]
      },
      loading: false,
      error: null,
    });

    render(<CommandDashboardPage />);
    
    expect(screen.getByText('Ticketra Command Center')).toBeDefined();
    expect(screen.getByText('Pending Approvals')).toBeDefined();
    expect(screen.getByText('Departmental Performance Matrix')).toBeDefined();
    expect(screen.getByText('Live Activity Feed')).toBeDefined();
  });

  it('hides approvals and department performance from EMPLOYEE role', () => {
    const employeeUser = { id: '2', role: 'EMPLOYEE' as const, email: 'employee@ticketra.com' };
    vi.mocked(useAuth).mockReturnValue({
      user: employeeUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      hasRole: (roles: string | string[]) => {
        return Array.isArray(roles) ? roles.includes(employeeUser.role) : roles === employeeUser.role;
      },
      updateProfileImage: vi.fn(),
      refreshProfileImage: vi.fn(),
    });

    vi.mocked(useEtmsDashboard).mockReturnValue({
      kpis: {
        totalTickets: 120,
        openTickets: 34,
        assignedTickets: 5,
        overdueTickets: 4,
        resolvedToday: 8,
        slaCompliancePercent: 95.5,
        pendingApprovals: 2,
        knowledgeArticles: 14,
        teamPerformanceScore: 88,
      },
      ticketStatus: { open: 12, inProgress: 14, waiting: 2, resolved: 8, closed: 84 },
      departmentPerformance: [
        { department: 'IT Support', open: 12, avgResolutionHours: 4.5, slaPercent: 94, trend: 'stable' }
      ],
      activities: [],
      pendingApprovals: [],
      knowledgeStats: {
        totalArticles: 14,
        helpfulRatingsPercent: 92,
        topCategories: []
      },
      loading: false,
      error: null,
    });

    render(<CommandDashboardPage />);

    expect(screen.getByText('Employee Workspace')).toBeDefined();
    expect(screen.queryByText('Departmental Performance Matrix')).toBeNull();
    expect(screen.queryByText('Pending Approvals')).toBeNull();
  });
});
