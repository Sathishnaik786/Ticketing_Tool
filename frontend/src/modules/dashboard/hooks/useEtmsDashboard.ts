import { useQuery } from '@tanstack/react-query';
import { isEtmsDashboardEnabled } from '@/config/features';
import { fetchEtmsDashboardStats } from '../services/etmsDashboardService';

export function useEtmsDashboard() {
  return useQuery({
    queryKey: ['etms-dashboard-stats'],
    queryFn: fetchEtmsDashboardStats,
    enabled: isEtmsDashboardEnabled,
    staleTime: 60_000,
  });
}
