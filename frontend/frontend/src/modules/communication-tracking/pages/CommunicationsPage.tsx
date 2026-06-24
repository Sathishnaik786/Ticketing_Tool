import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CommunicationPanel } from '../components/CommunicationPanel';
import { CallLogForm } from '../components/CallLogForm';
import { EmailLogForm } from '../components/EmailLogForm';
import { InternalNoteForm } from '../components/InternalNoteForm';
import {
  useAddCommunicationComment,
  useLogCommunicationCall,
  useLogCommunicationEmail,
  useAddInternalNote,
} from '../hooks/useCommunicationTracking';

export default function CommunicationsPage() {
  const [ticketId, setTicketId] = useState('');
  const addComment = useAddCommunicationComment(ticketId);
  const logCall = useLogCommunicationCall(ticketId);
  const logEmail = useLogCommunicationEmail(ticketId);
  const addNote = useAddInternalNote(ticketId);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Communications"
        description="Unified communication history and logging for ETMS tickets."
        className="enterprise-panel mb-0"
      />

      <div className="enterprise-panel space-y-2 max-w-md">
        <Label htmlFor="ticket-id">Ticket ID</Label>
        <Input
          id="ticket-id"
          placeholder="Enter ticket UUID"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
      </div>

      {ticketId && (
        <>
          <div className="enterprise-panel space-y-4">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const message = String(fd.get('message') || '').trim();
                if (!message) return;
                addComment.mutate({ ticket_id: ticketId, message });
                e.currentTarget.reset();
              }}
            >
              <textarea name="message" className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm" placeholder="Comment…" required />
              <button type="submit" className="text-sm font-medium text-primary">Post comment</button>
            </form>
            <div className="grid gap-6 lg:grid-cols-2">
              <CallLogForm onSubmit={(v) => logCall.mutate({ ticket_id: ticketId, ...v })} isSubmitting={logCall.isPending} />
              <EmailLogForm onSubmit={(v) => logEmail.mutate({ ticket_id: ticketId, ...v })} isSubmitting={logEmail.isPending} />
            </div>
            <InternalNoteForm onSubmit={(v) => addNote.mutate({ ticket_id: ticketId, ...v })} isSubmitting={addNote.isPending} />
          </div>
          <div className="enterprise-panel">
            <CommunicationPanel ticketId={ticketId} />
          </div>
        </>
      )}
    </div>
  );
}
