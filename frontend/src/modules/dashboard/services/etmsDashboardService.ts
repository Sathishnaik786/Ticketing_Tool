/**
 * ETMS dashboard data — API-first with demo fallback.
 */
import {
  fetchDashboardActivity,
  fetchDashboardKpis,
  fetchDashboardSla,
} from './etmsDashboardApi';

export interface EtmsDashboardStats {
  totalTickets: number;
  openTickets: number;
  overdueTickets: number;
  slaCompliancePercent: number;
  pendingApprovals: number;
  teamPerformanceScore: number;
  ticketsByStatus: { open: number; inProgress: number; resolved: number; closed: number };
  departmentPerformance: { department: string; open: number; slaPercent: number; avgResolutionHours: number }[];
  recentActivity: { id: string; type: string; message: string; timestamp: string }[];
  isDemoData: boolean;
}

const DEMO_STATS: EtmsDashboardStats = {
  totalTickets: 1284,
  openTickets: 142,
  overdueTickets: 18,
  slaCompliancePercent: 94.2,
  pendingApprovals: 23,
  teamPerformanceScore: 87,
  ticketsByStatus: { open: 58, inProgress: 84, resolved: 312, closed: 830 },
  departmentPerformance: [
    { department: 'HR', open: 24, slaPercent: 96, avgResolutionHours: 4.2 },
    { department: 'IT', open: 51, slaPercent: 91, avgResolutionHours: 6.8 },
    { department: 'Admin', open: 18, slaPercent: 97, avgResolutionHours: 3.1 },
    { department: 'Finance', open: 31, slaPercent: 89, avgResolutionHours: 8.4 },
    { department: 'Operations', open: 18, slaPercent: 93, avgResolutionHours: 5.6 },
  ],
  recentActivity: [
    { id: '1', type: 'created', message: 'TKT-1042 created by Jane Doe', timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: '2', type: 'assigned', message: 'TKT-1041 assigned to John Smith', timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: '3', type: 'escalated', message: 'TKT-1039 escalated to IT L2', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '4', type: 'resolved', message: 'TKT-1038 resolved in 2h 14m', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '5', type: 'approval', message: 'Approval completed for TKT-1035', timestamp: new Date(Date.now() - 10800000).toISOString() },
  ],
  isDemoData: true,
};

export async function fetchEtmsDashboardStats(): Promise<EtmsDashboardStats> {
  const [kpis, sla, activity] = await Promise.all([
    fetchDashboardKpis(),
    fetchDashboardSla(),
    fetchDashboardActivity(),
  ]);

  if (kpis && sla && activity) {
    return {
      ...kpis,
      ticketsByStatus: sla.ticketsByStatus,
      departmentPerformance: sla.departmentPerformance,
      recentActivity: activity.recentActivity,
      isDemoData: false,
    };
  }

  return { ...DEMO_STATS, isDemoData: true };
}

export async function fetchEtmsSlaStats(): Promise<Pick<EtmsDashboardStats, 'ticketsByStatus' | 'departmentPerformance' | 'slaCompliancePercent' | 'isDemoData'>> {
  const sla = await fetchDashboardSla();
  const kpis = await fetchDashboardKpis();
  if (sla && kpis) {
    return {
      ticketsByStatus: sla.ticketsByStatus,
      departmentPerformance: sla.departmentPerformance,
      slaCompliancePercent: kpis.slaCompliancePercent,
      isDemoData: false,
    };
  }
  return {
    ticketsByStatus: DEMO_STATS.ticketsByStatus,
    departmentPerformance: DEMO_STATS.departmentPerformance,
    slaCompliancePercent: DEMO_STATS.slaCompliancePercent,
    isDemoData: true,
  };
}
