import { toast } from 'sonner';
import { apiCall } from '@/services/api';
import { isExecutiveAnalyticsEnabled } from '@/config/features';

export interface ExecutiveKpis {
  openTickets: number;
  closedTickets: number;
  totalTickets: number;
  resolutionPct: number;
  slaCompliancePct: number;
  csatScore: number;
  approvalTurnaroundHours: number;
  knowledgeDeflectionPct: number;
  averageResolutionHours: number;
  escalationCount: number;
  workloadDistribution: Array<{ assigneeId: string; count: number }>;
}

async function analyticsCall<T>(url: string, method: string, body?: unknown): Promise<T> {
  if (!isExecutiveAnalyticsEnabled) {
    const error = new Error('Executive analytics module currently disabled.') as Error & { status?: number };
    error.status = 503;
    toast.error('Executive analytics module currently disabled.');
    throw error;
  }
  try {
    return (await apiCall(url, method, body)) as T;
  } catch (error) {
    const err = error as Error & { status?: number };
    toast.error(err.message || 'Analytics request failed');
    throw err;
  }
}

export const executiveAnalyticsApi = {
  getExecutiveDashboard: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return analyticsCall<{ success: boolean; data: { kpis: ExecutiveKpis } }>(
      `/analytics/executive-dashboard${qs ? `?${qs}` : ''}`,
      'GET'
    );
  },
  getDepartmentDashboard: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return analyticsCall<{ success: boolean; data: { scorecards: unknown[] } }>(
      `/analytics/department-dashboard${qs ? `?${qs}` : ''}`,
      'GET'
    );
  },
  getBusinessUnitDashboard: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return analyticsCall<{ success: boolean; data: { scorecards: unknown[] } }>(
      `/analytics/business-unit-dashboard${qs ? `?${qs}` : ''}`,
      'GET'
    );
  },
  getSla: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return analyticsCall<{ success: boolean; data: unknown }>(`/analytics/sla${qs ? `?${qs}` : ''}`, 'GET');
  },
  getCsat: () => analyticsCall<{ success: boolean; data: unknown }>('/analytics/csat', 'GET'),
  getApprovals: () => analyticsCall<{ success: boolean; data: unknown }>('/analytics/approvals', 'GET'),
  getKnowledge: () => analyticsCall<{ success: boolean; data: unknown }>('/analytics/knowledge', 'GET'),
  getTrends: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params ?? {}).toString();
    return analyticsCall<{ success: boolean; data: { monthly: unknown[] } }>(
      `/analytics/trends${qs ? `?${qs}` : ''}`,
      'GET'
    );
  },
  listReports: () => analyticsCall<{ success: boolean; data: unknown[] }>('/analytics/reports', 'GET'),
  createReport: (payload: {
    name: string;
    report_type: string;
    format?: 'JSON' | 'CSV' | 'XLSX' | 'PDF';
    filters?: Record<string, unknown>;
  }) => analyticsCall<{ success: boolean; data: unknown }>('/analytics/reports', 'POST', payload),
};
