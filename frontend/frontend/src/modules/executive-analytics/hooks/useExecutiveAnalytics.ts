import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { executiveAnalyticsApi } from '../services/executiveAnalyticsService';

export const analyticsQueryKeys = {
  executive: ['analytics-executive'] as const,
  department: ['analytics-department'] as const,
  businessUnit: ['analytics-bu'] as const,
  trends: ['analytics-trends'] as const,
  reports: ['analytics-reports'] as const,
};

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: analyticsQueryKeys.executive,
    queryFn: async () => (await executiveAnalyticsApi.getExecutiveDashboard()).data,
  });
}

export function useDepartmentAnalytics() {
  return useQuery({
    queryKey: analyticsQueryKeys.department,
    queryFn: async () => (await executiveAnalyticsApi.getDepartmentDashboard()).data,
  });
}

export function useBusinessUnitAnalytics() {
  return useQuery({
    queryKey: analyticsQueryKeys.businessUnit,
    queryFn: async () => (await executiveAnalyticsApi.getBusinessUnitDashboard()).data,
  });
}

export function useTrendAnalytics() {
  return useQuery({
    queryKey: analyticsQueryKeys.trends,
    queryFn: async () => (await executiveAnalyticsApi.getTrends()).data,
  });
}

export function useAnalyticsReports() {
  return useQuery({
    queryKey: analyticsQueryKeys.reports,
    queryFn: async () => (await executiveAnalyticsApi.listReports()).data,
  });
}

export function useCreateAnalyticsReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: executiveAnalyticsApi.createReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: analyticsQueryKeys.reports }),
  });
}
