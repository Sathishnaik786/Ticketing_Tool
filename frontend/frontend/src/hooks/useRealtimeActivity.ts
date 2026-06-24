import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRealtimeActivity(ticketId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = notificationService.getSocket();

    const handleNewActivity = (activity: any) => {
      // Invalidate general activities logs
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-timeline'] });

      if (ticketId && activity.ticket_id === ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket-timeline', ticketId] });
        queryClient.invalidateQueries({ queryKey: ['ticket-detail', ticketId] });
      }

      // If it's an escalation or warning, trigger a critical alert toast
      if (activity.type === 'SLA_WARNING' || activity.type === 'SLA_BREACHED' || activity.type === 'ESCALATION') {
        toast.warning(`Critical Event: ${activity.title || 'SLA Warning Alert'}`, {
          description: activity.description || '',
          duration: 6000,
        });
      }
    };

    // Listen to activities socket
    if (socket) {
      socket.on('activity:new', handleNewActivity);
    }

    // 2. Setup Supabase Realtime channel if available
    let channel: any = null;
    if (supabase) {
      let filterString = '';
      if (ticketId) {
        filterString = `ticket_id=eq.${ticketId}`;
      }

      channel = supabase
        .channel(`public:activities:${ticketId || 'all'}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
            filter: filterString || undefined,
          },
          (payload) => {
            handleNewActivity(payload.new);
          }
        )
        .subscribe();
    }

    return () => {
      if (socket) {
        socket.off('activity:new', handleNewActivity);
      }
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, ticketId, queryClient]);
}
export default useRealtimeActivity;
