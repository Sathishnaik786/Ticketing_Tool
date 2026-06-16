import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActivityTimeline } from '../components/ActivityTimeline';

export default function ActivityTimelinePage() {
  const [ticketId, setTicketId] = useState('');

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Activity Timeline"
        description="Unified audit timeline including integrated assignment, feedback, and SLA events."
        className="enterprise-panel mb-0"
      />

      <div className="enterprise-panel space-y-2 max-w-md">
        <Label htmlFor="timeline-ticket-id">Ticket ID</Label>
        <Input
          id="timeline-ticket-id"
          placeholder="Enter ticket UUID"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
      </div>

      {ticketId && (
        <div className="enterprise-panel">
          <ActivityTimeline ticketId={ticketId} />
        </div>
      )}
    </div>
  );
}
