import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, ArrowRight, Loader2 } from 'lucide-react';
import { isTicketingEnabled } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { ticketingApi } from '../../services/ticketingService';

export const TicketsQuickAccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: openTickets, isLoading: openLoading } = useQuery({
    queryKey: ['tickets', 'dashboard', 'open'],
    queryFn: () =>
      ticketingApi.listTickets({
        status: 'OPEN',
        limit: 1,
        page: 1,
      }),
    enabled: isTicketingEnabled,
  });

  const { data: assignedTickets, isLoading: assignedLoading } = useQuery({
    queryKey: ['tickets', 'dashboard', 'assigned', user?.id],
    queryFn: () =>
      ticketingApi.listTickets({
        assignee_id: user?.employeeId ?? user?.id,
        limit: 1,
        page: 1,
        sort_by: 'updated_at',
        sort_order: 'desc',
      }),
    enabled: isTicketingEnabled && !!user,
  });

  const { data: recentTickets, isLoading: recentLoading } = useQuery({
    queryKey: ['tickets', 'dashboard', 'recent'],
    queryFn: () =>
      ticketingApi.listTickets({
        limit: 1,
        page: 1,
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    enabled: isTicketingEnabled,
  });

  if (!isTicketingEnabled) {
    return null;
  }

  const isLoading = openLoading || assignedLoading || recentLoading;
  const openCount = openTickets?.meta?.total ?? 0;
  const assignedCount = assignedTickets?.meta?.total ?? 0;
  const recentTicket = recentTickets?.data?.[0];

  return (
    <Card className="liquid-surface rounded-[2.5rem] border-transparent shadow-none p-2 mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="enterprise-subheading flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" aria-hidden="true" />
          Service Desk
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Open Tickets</p>
              <p className="text-3xl font-black mt-2">{openCount}</p>
            </div>
            <div className="rounded-2xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Assigned to Me</p>
              <p className="text-3xl font-black mt-2">{assignedCount}</p>
            </div>
            <div className="rounded-2xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent Ticket</p>
              <p className="text-sm font-semibold mt-2 truncate">
                {recentTicket?.ticket_number ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{recentTicket?.title ?? 'No tickets yet'}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="premium" size="sm" onClick={() => navigate('/app/tickets')}>
            View Tickets
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/tickets/new')}>
            Create Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
