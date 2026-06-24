import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRealtimeTickets(currentTicketId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = notificationService.getSocket();

    const handleTicketMutation = (event: any) => {
      // Invalidate tickets lists
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-queue'] });
      queryClient.invalidateQueries({ queryKey: ['team-queue'] });
      queryClient.invalidateQueries({ queryKey: ['notification-center-unread'] });

      // If the modified ticket is the one currently open, invalidate its detail queries
      if (currentTicketId && (event.ticket_id === currentTicketId || event.id === currentTicketId)) {
        queryClient.invalidateQueries({ queryKey: ['ticket-detail', currentTicketId] });
        queryClient.invalidateQueries({ queryKey: ['ticket-timeline', currentTicketId] });
      }

      // Display user alerts for specific actions
      const assigneeId = event.assigned_to_id || event.assignee_id;
      const isAssignedToMe = assigneeId === user.id;

      if (event.type === 'ASSIGNED' && isAssignedToMe) {
        toast.success('Ticket Assigned to You', {
          description: `You have been assigned: ${event.title || 'a new ticket'}`
        });
      } else if (event.type === 'PRIORITY_CHANGED' && isAssignedToMe) {
        toast.info('Priority Escalated', {
          description: `Ticket "${event.title}" priority updated to ${event.priority}`
        });
      }
    };

    if (socket) {
      socket.on('ticket:created', (data) => handleTicketMutation({ ...data, type: 'CREATED' }));
      socket.on('ticket:assigned', (data) => handleTicketMutation({ ...data, type: 'ASSIGNED' }));
      socket.on('ticket:status-changed', (data) => handleTicketMutation({ ...data, type: 'STATUS_CHANGED' }));
      socket.on('ticket:priority-changed', (data) => handleTicketMutation({ ...data, type: 'PRIORITY_CHANGED' }));
      socket.on('ticket:comment-added', (data) => handleTicketMutation({ ...data, type: 'COMMENT_ADDED' }));
    }

    // 2. Setup Supabase Realtime channel if available
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public:tickets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const ticket = payload.new as any;
            handleTicketMutation({
              ...ticket,
              ticket_id: ticket.id,
              type: payload.eventType === 'INSERT' ? 'CREATED' : 'MUTATED',
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (socket) {
        socket.off('ticket:created');
        socket.off('ticket:assigned');
        socket.off('ticket:status-changed');
        socket.off('ticket:priority-changed');
        socket.off('ticket:comment-added');
      }
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, currentTicketId, queryClient]);
}
export default useRealtimeTickets;
