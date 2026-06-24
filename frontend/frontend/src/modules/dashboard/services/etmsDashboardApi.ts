import { apiCall } from '@/services/api';
import type { EtmsDashboardStats } from '@/modules/dashboard/services/etmsDashboardService';

export interface DashboardKpiResponse {
  totalTickets: number;
  openTickets: number;
  overdueTickets: number;
  slaCompliancePercent: number;
  pendingApprovals: number;
  teamPerformanceScore: number;
}

export interface DashboardSlaResponse {
  ticketsByStatus: EtmsDashboardStats['ticketsByStatus'];
  departmentPerformance: EtmsDashboardStats['departmentPerformance'];
}

export interface DashboardActivityResponse {
  recentActivity: EtmsDashboardStats['recentActivity'];
}

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await apiCall(path, 'GET');
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    return null;
  }
}

export async function fetchDashboardKpis(): Promise<DashboardKpiResponse | null> {
  return safeFetch<DashboardKpiResponse>('/dashboard/kpis');
}

export async function fetchDashboardSla(): Promise<DashboardSlaResponse | null> {
  return safeFetch<DashboardSlaResponse>('/dashboard/sla');
}

export async function fetchDashboardActivity(): Promise<DashboardActivityResponse | null> {
  return safeFetch<DashboardActivityResponse>('/dashboard/activity');
}
