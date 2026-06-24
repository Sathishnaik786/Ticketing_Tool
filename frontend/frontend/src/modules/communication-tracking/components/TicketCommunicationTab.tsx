import { isCommunicationTrackingEnabled } from '@/config/features';
import { TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommunicationPanel } from './CommunicationPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { CallLogForm } from './CallLogForm';
import { EmailLogForm } from './EmailLogForm';
import { InternalNoteForm } from './InternalNoteForm';
import {
  useAddCommunicationComment,
  useLogCommunicationCall,
  useLogCommunicationEmail,
  useAddInternalNote,
} from '../hooks/useCommunicationTracking';

interface TicketCommunicationTabProps {
  ticketId: string;
}

export function TicketCommunicationTabTrigger() {
  if (!isCommunicationTrackingEnabled) return null;
  return <TabsTrigger value="communications">Communication</TabsTrigger>;
}

export function TicketActivityTimelineTabTrigger() {
  if (!isCommunicationTrackingEnabled) return null;
  return <TabsTrigger value="activity-timeline">Activity Timeline</TabsTrigger>;
}

export function TicketCommunicationTabContent({ ticketId }: TicketCommunicationTabProps) {
  const addComment = useAddCommunicationComment(ticketId);
  const logCall = useLogCommunicationCall(ticketId);
  const logEmail = useLogCommunicationEmail(ticketId);
  const addNote = useAddInternalNote(ticketId);

  if (!isCommunicationTrackingEnabled) return null;

  return (
    <>
      <TabsContent value="communications" className="enterprise-panel space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold">Add comment</h3>
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
            <textarea
              name="message"
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              placeholder="Add a communication comment…"
              required
            />
            <button type="submit" className="text-sm font-medium text-primary" disabled={addComment.isPending}>
              {addComment.isPending ? 'Posting…' : 'Post comment'}
            </button>
          </form>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div><h3 className="text-sm font-semibold mb-3">Log call</h3><CallLogForm onSubmit={(v) => logCall.mutate({ ticket_id: ticketId, ...v })} isSubmitting={logCall.isPending} /></div>
          <div><h3 className="text-sm font-semibold mb-3">Log email</h3><EmailLogForm onSubmit={(v) => logEmail.mutate({ ticket_id: ticketId, ...v })} isSubmitting={logEmail.isPending} /></div>
        </section>
        <section>
          <h3 className="text-sm font-semibold mb-3">Internal note</h3>
          <InternalNoteForm onSubmit={(v) => addNote.mutate({ ticket_id: ticketId, ...v })} isSubmitting={addNote.isPending} />
        </section>
        <CommunicationPanel ticketId={ticketId} />
      </TabsContent>

      <TabsContent value="activity-timeline" className="enterprise-panel">
        <ActivityTimeline ticketId={ticketId} />
      </TabsContent>
    </>
  );
}
