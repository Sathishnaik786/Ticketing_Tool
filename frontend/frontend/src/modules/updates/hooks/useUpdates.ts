import { useQuery } from '@tanstack/react-query';
import { getVisibleDailyUpdates } from '../daily/dailyUpdates.api';
import { getVisibleWeeklyUpdates } from '../weekly/weeklyUpdates.api';
import { getVisibleMonthlyUpdates } from '../monthly/monthlyUpdates.api';

export const useRecentUpdates = (limit = 5) => {
  return useQuery({
    queryKey: ['updates', 'recent', limit],
    queryFn: async () => {
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        getVisibleDailyUpdates({ limit }),
        getVisibleWeeklyUpdates({ limit }),
        getVisibleMonthlyUpdates({ limit })
      ]);

      const combined = [
        ...(dailyRes.data || []).map((u: any) => ({
          id: u.id,
          userId: u.user_id,
          userName: u.user_profile?.name || 'Someone',
          userAvatar: u.user_profile?.profile_image,
          type: 'DAILY' as const,
          timestamp: u.created_at,
          isRead: !!sessionStorage.getItem(`read_update_${u.id}`)
        })),
        ...(weeklyRes.data || []).map((u: any) => ({
          id: u.id,
          userId: u.user_id,
          userName: u.user_profile?.name || 'Someone',
          userAvatar: u.user_profile?.profile_image,
          type: 'WEEKLY' as const,
          timestamp: u.created_at,
          isRead: !!sessionStorage.getItem(`read_update_${u.id}`)
        })),
        ...(monthlyRes.data || []).map((u: any) => ({
          id: u.id,
          userId: u.user_id,
          userName: u.user_profile?.name || 'Someone',
          userAvatar: u.user_profile?.profile_image,
          type: 'MONTHLY' as const,
          timestamp: u.created_at,
          isRead: !!sessionStorage.getItem(`read_update_${u.id}`)
        }))
      ];

      return combined.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, limit + 1);
    },
    staleTime: 60000, // 1 minute
  });
};
