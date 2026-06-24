import { useQuery } from '@tanstack/react-query';
import { isEtmsDashboardEnabled } from '@/config/features';
import { dashboardService } from '../services/dashboard.service';
import type { EtmsDashboardStats } from '../types/dashboard.types';

export function useEtmsDashboard() {
  const { data, isLoading, error } = useQuery<EtmsDashboardStats>({
    queryKey: ['etms-dashboard-stats-combined'],
    queryFn: dashboardService.getCombinedDashboardData,
    enabled: isEtmsDashboardEnabled,
    staleTime: 30_000,
  });

  return {
    kpis: data?.kpis,
    ticketStatus: data?.ticketStatus,
    departmentPerformance: data?.departmentPerformance || [],
    activities: data?.activities || [],
    pendingApprovals: data?.pendingApprovals || [],
    knowledgeStats: data?.knowledgeStats,
    loading: isLoading,
    error,
  };
}
