import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationCenterApi } from '../services/notificationCenterService';
import { isNotificationCenterEnabled } from '@/config/features';

export const notificationQueryKeys = {
  list: (filters?: Record<string, string>) => ['notification-center-list', filters] as const,
  unread: ['notification-center-unread'] as const,
  preferences: ['notification-center-preferences'] as const,
  analytics: ['notification-center-analytics'] as const,
};

const pollInterval = isNotificationCenterEnabled ? 60000 : false;

export function useMyNotifications(filters?: Record<string, string>) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters),
    queryFn: async () => (await notificationCenterApi.getMyNotifications(filters)).data,
    enabled: isNotificationCenterEnabled,
    refetchInterval: pollInterval,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unread,
    queryFn: async () => (await notificationCenterApi.getUnreadCount()).data.count,
    enabled: isNotificationCenterEnabled,
    refetchInterval: pollInterval,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences,
    queryFn: async () => (await notificationCenterApi.getPreferences()).data,
    enabled: isNotificationCenterEnabled,
  });
}

export function useNotificationAnalytics() {
  return useQuery({
    queryKey: notificationQueryKeys.analytics,
    queryFn: async () => (await notificationCenterApi.getAnalytics()).data,
    enabled: isNotificationCenterEnabled,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationCenterApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      qc.invalidateQueries({ queryKey: notificationQueryKeys.unread });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationCenterApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationQueryKeys.list() });
      qc.invalidateQueries({ queryKey: notificationQueryKeys.unread });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationCenterApi.updatePreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationQueryKeys.preferences }),
  });
}
