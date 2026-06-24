import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 1. Setup Socket.IO subscription
    const handleNewNotification = (notification: any) => {
      // Invalidate both notifications queries keys
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-center-list'] });
      queryClient.invalidateQueries({ queryKey: ['notification-center-unread'] });

      // Trigger user-facing notification toast
      toast.info(notification.title || 'New Alert Recieved', {
        description: notification.message || '',
        action: notification.link ? {
          label: 'View details',
          onClick: () => window.location.assign(notification.link)
        } : undefined
      });
    };

    // Connect and subscribe to socket.io events
    notificationService.subscribeToNotifications(handleNewNotification);

    // 2. Setup Supabase Realtime channel if available
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel(`public:notifications:user_id=${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            handleNewNotification(payload.new);
          }
        )
        .subscribe();
    }

    return () => {
      notificationService.unsubscribeFromNotifications();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, queryClient]);
}
export default useRealtimeNotifications;
