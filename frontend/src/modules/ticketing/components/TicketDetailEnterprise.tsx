import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ArrowLeft, Paperclip, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  PageHeader,
  ActionToolbar,
  ActivityTimeline,
  type ActivityTimelineItem,
} from '@/components/design-system';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { TicketCommentList } from './TicketCommentList';
import { TicketCommentForm } from './TicketCommentForm';
import { TicketAttachmentUpload } from './TicketAttachmentUpload';
import { TicketSlaCard } from './TicketSlaCard';
import { TicketAssignments } from './TicketAssignments';
import { TicketAssignmentActions } from '@/modules/ticket-assignment/components/TicketAssignmentActions';
import {
  TicketCommunicationTabTrigger,
  TicketActivityTimelineTabTrigger,
  TicketCommunicationTabContent,
} from '@/modules/communication-tracking/components/TicketCommunicationTab';
import {
  TicketApprovalTabTrigger,
  TicketApprovalTabContent,
} from '@/modules/approval-management/components/TicketApprovalTab';
import { TicketFeedbackTabTrigger, TicketFeedbackTabContent } from '@/modules/ticket-feedback/components/TicketFeedbackTab';
import type { Ticket, TicketComment, TicketAttachment, TicketTimelineEntry, TicketSla, TicketAssignment } from '../types/ticketing.types';
import type { Employee } from '@/types';

function formatPerson(
  person?: { first_name?: string; last_name?: string; firstName?: string; lastName?: string; email?: string } | null
): string {
  const first = person?.firstName ?? person?.first_name ?? '';
  const last = person?.lastName ?? person?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || person?.email || '—';
}

function timelineToActivity(entries: TicketTimelineEntry[]): ActivityTimelineItem[] {
  const labels: Record<string, string> = {
    CREATED: 'Created',
    STATUS_CHANGE: 'Status Changed',
    ASSIGNMENT: 'Assigned',
    REASSIGNMENT: 'Reassigned',
    COMMENT: 'Commented',
    ATTACHMENT: 'Attachment Added',
    CLOSURE: 'Closed',
    REOPEN: 'Reopened',
    RESOLUTION: 'Resolved',
  };

  return entries.map((entry) => ({
    id: entry.id,
    title: labels[entry.activity_type] ?? entry.activity_type.replace(/_/g, ' '),
    description: entry.description ?? undefined,
    timestamp: entry.created_at,
    actor: entry.actor
      ? `${entry.actor.first_name ?? ''} ${entry.actor.last_name ?? ''}`.trim() || entry.actor.email
      : 'System',
  }));
}

export interface TicketDetailEnterpriseProps {
  ticket: Ticket;
  ticketId: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  timeline: TicketTimelineEntry[];
  sla?: TicketSla | null;
  assignments: TicketAssignment[];
  employees: Employee[];
  commentsLoading: boolean;
  attachmentsLoading: boolean;
  timelineLoading: boolean;
  slaLoading: boolean;
  assignmentsLoading: boolean;
  canPostInternal: boolean;
  canAssign: boolean;
  canManageSla: boolean;
  onCreateComment: (values: { content: string; is_internal?: boolean }) => void;
  isCreatingComment: boolean;
  onUploadAttachment: (file: File) => Promise<unknown>;
  isUploading: boolean;
  onAssign: (assigneeId: string) => void;
  onReassign: (assigneeId: string) => void;
  isAssigning: boolean;
}

export function TicketDetailEnterprise({
  ticket,
  ticketId,
  comments,
  attachments,
  timeline,
  sla,
  assignments,
  employees,
  commentsLoading,
  attachmentsLoading,
  timelineLoading,
  slaLoading,
  assignmentsLoading,
  canPostInternal,
  canAssign,
  canManageSla,
  onCreateComment,
  isCreatingComment,
  onUploadAttachment,
  isUploading,
  onAssign,
  onReassign,
  isAssigning,
}: TicketDetailEnterpriseProps) {
  const activityItems = timelineToActivity(timeline);

  return (
    <div className="flex flex-col min-h-0 pb-20 md:pb-0">
      <PageHeader
        title={ticket.title}
        description={`Ticket ${ticket.ticket_number}`}
        breadcrumbs={[
          { label: 'Tickets', href: '/app/tickets' },
          { label: ticket.ticket_number },
        ]}
        compact
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                Back
              </Link>
            </Button>
            <TicketAssignmentActions ticket={ticket} />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4">
        {/* Left column — metadata */}
        <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <section className="rounded-xl border border-border bg-card p-4 space-y-4" aria-label="Ticket metadata">
            <div className="flex flex-wrap gap-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Department</dt>
                <dd className="mt-0.5 font-medium">{ticket.department?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Requester</dt>
                <dd className="mt-0.5">{formatPerson(ticket.requester)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Assignee</dt>
                <dd className="mt-0.5">{formatPerson(ticket.assignee)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Created</dt>
                <dd className="mt-0.5">
                  <time dateTime={ticket.created_at}>{format(new Date(ticket.created_at), 'PPp')}</time>
                </dd>
              </div>
              {ticket.updated_at && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Updated</dt>
                  <dd className="mt-0.5">
                    <time dateTime={ticket.updated_at}>{format(new Date(ticket.updated_at), 'PPp')}</time>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 hidden lg:block" aria-label="SLA summary">
            <h2 className="text-sm font-semibold mb-3">SLA</h2>
            <TicketSlaCard sla={sla} isLoading={slaLoading} canManageSla={canManageSla} />
          </section>
        </aside>

        {/* Center column — description + comments */}
        <main className="lg:col-span-6 space-y-4 order-1 lg:order-2">
          <section className="rounded-xl border border-border bg-card p-4" aria-label="Description">
            <h2 className="text-sm font-semibold mb-2">Description</h2>
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
              {ticket.description ?? 'No description provided.'}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-4" aria-label="Comments">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold">Comments</h2>
              <span className="text-xs text-muted-foreground ml-auto">{comments.length}</span>
            </div>
            <TicketCommentForm
              canPostInternal={canPostInternal}
              isSubmitting={isCreatingComment}
              onSubmit={onCreateComment}
            />
            <div className="mt-4">
              <TicketCommentList comments={comments} isLoading={commentsLoading} />
            </div>
          </section>

          <Tabs defaultValue="attachments" className="lg:hidden">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="attachments">
                <Paperclip className="h-3.5 w-3.5 mr-1" aria-hidden />
                Files
              </TabsTrigger>
              <TabsTrigger value="sla">SLA</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>
            <TabsContent value="attachments" className="rounded-xl border border-border bg-card p-4 mt-2">
              {attachmentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading attachments...</p>
              ) : (
                <TicketAttachmentUpload
                  ticketId={ticketId}
                  attachments={attachments}
                  onUpload={onUploadAttachment}
                  isUploading={isUploading}
                />
              )}
            </TabsContent>
            <TabsContent value="sla" className="rounded-xl border border-border bg-card p-4 mt-2">
              <TicketSlaCard sla={sla} isLoading={slaLoading} canManageSla={canManageSla} />
            </TabsContent>
            <TabsContent value="more" className="mt-2 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-3">Assignments</h3>
                {assignmentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <TicketAssignments
                    assignments={assignments}
                    employees={employees}
                    canAssign={canAssign}
                    onAssign={onAssign}
                    onReassign={onReassign}
                    isSubmitting={isAssigning}
                  />
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-3">Activity</h3>
                <ActivityTimeline items={activityItems} isLoading={timelineLoading} compact />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Right column — SLA, assignments, timeline, cross-module tabs */}
        <aside className="lg:col-span-3 space-y-4 order-3 hidden lg:block">
          <section className="rounded-xl border border-border bg-card p-4" aria-label="Attachments">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold">Attachments</h2>
            </div>
            {attachmentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <TicketAttachmentUpload
                ticketId={ticketId}
                attachments={attachments}
                onUpload={onUploadAttachment}
                isUploading={isUploading}
              />
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4" aria-label="Assignments">
            <h2 className="text-sm font-semibold mb-3">Assignments</h2>
            {assignmentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <TicketAssignments
                assignments={assignments}
                employees={employees}
                canAssign={canAssign}
                onAssign={onAssign}
                onReassign={onReassign}
                isSubmitting={isAssigning}
              />
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4" aria-label="Activity timeline">
            <h2 className="text-sm font-semibold mb-3">Activity</h2>
            <ActivityTimeline items={activityItems} isLoading={timelineLoading} compact />
          </section>
        </aside>
      </div>

      {/* Cross-module tabs */}
      <div className="mt-6">
        <Tabs defaultValue="comms">
          <TabsList aria-label="Related modules" className="flex-wrap h-auto gap-1">
            <TicketCommunicationTabTrigger />
            <TicketActivityTimelineTabTrigger />
            <TicketFeedbackTabTrigger ticket={ticket} />
            <TicketApprovalTabTrigger />
          </TabsList>
          <TicketCommunicationTabContent ticketId={ticketId} />
          <TicketFeedbackTabContent ticket={ticket} ticketId={ticketId} />
          <TicketApprovalTabContent ticketId={ticketId} />
        </Tabs>
      </div>

      {/* Mobile sticky actions */}
      <ActionToolbar mobileSticky className="md:hidden">
        <TicketAssignmentActions ticket={ticket} />
        <Button size="sm" variant="outline" asChild>
          <Link to={`/app/tickets/${ticketId}#comments`}>Comment</Link>
        </Button>
      </ActionToolbar>
    </div>
  );
}
