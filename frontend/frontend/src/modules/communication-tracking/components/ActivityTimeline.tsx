import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { useTicketActivityTimeline } from '../hooks/useCommunicationTracking';

interface ActivityTimelineProps {
  ticketId: string;
}

export function ActivityTimeline({ ticketId }: ActivityTimelineProps) {
  const { data, isLoading, isError, error } = useTicketActivityTimeline(ticketId);

  if (isLoading) return <DataTableSkeleton />;

  if (isError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {(error as Error)?.message ?? 'Unable to load activity timeline.'}
      </p>
    );
  }

  const events = data?.data.events ?? [];

  if (!events.length) {
    return <p className="text-sm text-muted-foreground">No activity events yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-6" aria-label="Activity timeline">
      {events.map((event) => (
        <li key={event.id} className="ml-6">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" aria-hidden="true" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{event.event_type.replace(/_/g, ' ')}</Badge>
              {event.integrated && <Badge variant="secondary">Integrated</Badge>}
            </div>
            <time className="text-xs text-muted-foreground" dateTime={event.created_at}>
              {format(new Date(event.created_at), 'PPp')}
            </time>
            {Object.keys(event.event_data || {}).length > 0 && (
              <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                {JSON.stringify(event.event_data, null, 2)}
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
