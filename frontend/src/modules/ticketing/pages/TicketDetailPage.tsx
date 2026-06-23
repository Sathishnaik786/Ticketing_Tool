import { format } from 'date-fns';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, ErrorState, LoadingState } from '@/components/design-system';
import { isEtmsUiV2Enabled } from '@/config/features';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import {
  isEtmsUiV2Enabled,
  isApprovalEngineEnabled,
  isCommunicationTrackingEnabled,
} from '@/config/features';
import {
  useTicket,
  useComments,
  useCreateComment,
  useAttachments,
  useUploadAttachment,
  useTimeline,
  useSla,
  useTicketAssignments,
  useAssignTicket,
  useReassignTicket,
} from '../hooks/useTicketing';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketPriorityBadge } from '../components/TicketPriorityBadge';
import { TicketCommentList } from '../components/TicketCommentList';
import { TicketCommentForm } from '../components/TicketCommentForm';
import { TicketAttachmentUpload } from '../components/TicketAttachmentUpload';
import { TicketTimeline } from '../components/TicketTimeline';
import { TicketSlaCard } from '../components/TicketSlaCard';
import { TicketAssignments } from '../components/TicketAssignments';
import { TicketDetailEnterprise } from '../components/TicketDetailEnterprise';
import { TicketFeedbackTabTrigger, TicketFeedbackTabContent } from '@/modules/ticket-feedback/components/TicketFeedbackTab';
import { TicketAssignmentActions } from '@/modules/ticket-assignment/components/TicketAssignmentActions';
import { TicketAuditTimeline } from '../components/TicketAuditTimeline';

import {
  TicketCommunicationTabTrigger,
  TicketActivityTimelineTabTrigger,
  TicketCommunicationTabContent,
} from '@/modules/communication-tracking/components/TicketCommunicationTab';
import {
  TicketApprovalTabTrigger,
  TicketApprovalTabContent,
} from '@/modules/approval-management/components/TicketApprovalTab';

function formatPerson(
  person?: { first_name?: string; last_name?: string; firstName?: string; lastName?: string; email?: string } | null
): string {
  const first = person?.firstName ?? person?.first_name ?? '';
  const last = person?.lastName ?? person?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || person?.email || '—';
}

function canAssign(role?: string): boolean {
  return role === 'ADMIN' || role === 'HR' || role === 'MANAGER';
}

function canPostInternal(role?: string): boolean {
  return role === 'ADMIN' || role === 'HR' || role === 'MANAGER';
}

function canManageSla(role?: string): boolean {
  return role === 'ADMIN' || role === 'HR';
}

export default function TicketDetailPage() {
  const { ticketId = '' } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const includeInternal = canPostInternal(user?.role);
  const canViewAudit = user?.role === 'ADMIN' || user?.role === 'HR';

  const { data: ticket, isLoading, isError, error } = useTicket(ticketId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(ticketId, includeInternal);
  const { data: attachments = [], isLoading: attachmentsLoading } = useAttachments(ticketId);
  const { data: timeline = [], isLoading: timelineLoading } = useTimeline(ticketId);
  const { data: sla, isLoading: slaLoading } = useSla(ticketId);
  const { data: assignments = [], isLoading: assignmentsLoading } = useTicketAssignments(ticketId);

  const createComment = useCreateComment(ticketId);
  const uploadAttachment = useUploadAttachment(ticketId);
  const assignTicket = useAssignTicket(ticketId);
  const reassignTicket = useReassignTicket(ticketId);

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 200 } as any),
    queryFn: () => employeesApi.getAll({ limit: 200 }),
  });

  const employees = employeesResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <LoadingState label="Loading ticket details" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="p-4 md:p-8">
        <ErrorState
          title="Unable to load ticket"
          message={(error as Error)?.message ?? 'Ticket details could not be loaded.'}
          variant="default"
        />
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/app/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  if (isEtmsUiV2Enabled) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <TicketDetailEnterprise
          ticket={ticket}
          ticketId={ticketId}
          comments={comments}
          attachments={attachments}
          timeline={timeline}
          sla={sla}
          assignments={assignments}
          employees={employees}
          commentsLoading={commentsLoading}
          attachmentsLoading={attachmentsLoading}
          timelineLoading={timelineLoading}
          slaLoading={slaLoading}
          assignmentsLoading={assignmentsLoading}
          canPostInternal={includeInternal}
          canAssign={canAssign(user?.role)}
          canManageSla={canManageSla(user?.role)}
          onCreateComment={(values) => createComment.mutate(values)}
          isCreatingComment={createComment.isPending}
          onUploadAttachment={(file) => uploadAttachment.mutateAsync(file)}
          isUploading={uploadAttachment.isPending}
          onAssign={(assigneeId) => assignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })}
          onReassign={(assigneeId) => reassignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })}
          isAssigning={assignTicket.isPending || reassignTicket.isPending}
        />
      </div>
    );
  }

  // Modern 3-Column Layout when ETMS V2 UI is enabled
  if (isEtmsUiV2Enabled) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <PageHeader
          title={ticket.title}
          description={`Ticket ${ticket.ticket_number}`}
          className="enterprise-panel mb-0"
        >
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <TicketAssignmentActions ticket={ticket} />
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Metadata & Team Actions */}
          <div className="lg:col-span-3 space-y-6">
            <div className="enterprise-panel space-y-6">
              <h3 className="text-sm font-semibold border-b pb-2">Ticket Metadata</h3>
              
              <div className="flex flex-wrap gap-3">
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>

              <dl className="space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Department</dt>
                  <dd className="text-sm mt-1 font-medium">{ticket.department?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Requester</dt>
                  <dd className="text-sm mt-1 font-medium">{formatPerson(ticket.requester)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Assignee</dt>
                  <dd className="text-sm mt-1 font-medium">{formatPerson(ticket.assignee)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Created Date</dt>
                  <dd className="text-sm mt-1">
                    <time dateTime={ticket.created_at}>{format(new Date(ticket.created_at), 'PPp')}</time>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Updated Date</dt>
                  <dd className="text-sm mt-1">
                    {ticket.updated_at ? (
                      <time dateTime={ticket.updated_at}>{format(new Date(ticket.updated_at), 'PPp')}</time>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="enterprise-panel">
              <h3 className="text-sm font-semibold border-b pb-2 mb-4">Assignments</h3>
              {assignmentsLoading ? (
                <DataTableSkeleton />
              ) : (
                <TicketAssignments
                  assignments={assignments}
                  employees={employees}
                  canAssign={canAssign(user?.role)}
                  onAssign={(assigneeId) =>
                    assignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })
                  }
                  onReassign={(assigneeId) =>
                    reassignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })
                  }
                  isSubmitting={assignTicket.isPending || reassignTicket.isPending}
                />
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Description, Conversation (Comments), Attachments */}
          <div className="lg:col-span-6 space-y-6">
            <div className="enterprise-panel space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Description</h3>
              <p className="text-sm whitespace-pre-wrap break-words">{ticket.description ?? '—'}</p>
            </div>

            <div className="enterprise-panel space-y-6">
              <h3 className="text-sm font-semibold border-b pb-2">Comments & Logs</h3>
              <TicketCommentForm
                canPostInternal={includeInternal}
                isSubmitting={createComment.isPending}
                onSubmit={(values) => createComment.mutate(values)}
              />
              <TicketCommentList comments={comments} isLoading={commentsLoading} />
            </div>

            {isCommunicationTrackingEnabled && (
              <div className="enterprise-panel space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Client Communications</h3>
                <Tabs defaultValue="communications" className="w-full">
                  <TicketCommunicationTabContent ticketId={ticketId} />
                </Tabs>
              </div>
            )}

            <div className="enterprise-panel space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Attachments</h3>
              {attachmentsLoading ? (
                <DataTableSkeleton />
              ) : (
                <TicketAttachmentUpload
                  ticketId={ticketId}
                  attachments={attachments}
                  onUpload={(file) => uploadAttachment.mutateAsync(file)}
                  isUploading={uploadAttachment.isPending}
                />
              )}
            </div>

            <Tabs defaultValue="feedback" className="w-full">
              <TicketFeedbackTabContent ticket={ticket} ticketId={ticketId} />
            </Tabs>
          </div>

          {/* RIGHT COLUMN: SLA, Approvals, Activity log */}
          <div className="lg:col-span-3 space-y-6">
            <div className="enterprise-panel space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">SLA Status</h3>
              <TicketSlaCard
                sla={sla}
                isLoading={slaLoading}
                canManageSla={canManageSla(user?.role)}
              />
            </div>

            {isApprovalEngineEnabled && (
              <div className="enterprise-panel space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Approvals</h3>
                <Tabs defaultValue="approval-workflow" className="w-full">
                  <TicketApprovalTabContent ticketId={ticketId} />
                </Tabs>
              </div>
            )}

            <div className="enterprise-panel space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Timeline</h3>
              <TicketTimeline entries={timeline} isLoading={timelineLoading} />
            </div>

            {canViewAudit && (
              <div className="enterprise-panel">
                <TicketAuditTimeline ticketId={ticketId} />
              </div>
            )}


            {isCommunicationTrackingEnabled && (
              <div className="enterprise-panel space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Activity Timeline</h3>
                <Tabs defaultValue="activity-timeline" className="w-full">
                  <TicketCommunicationTabContent ticketId={ticketId} />
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to original tab-based view
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title={ticket.title}
        description={`Ticket ${ticket.ticket_number}`}
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList aria-label="Ticket detail sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          {canViewAudit && <TabsTrigger value="audit-timeline">Audit Timeline</TabsTrigger>}
          <TicketCommunicationTabTrigger />
          <TicketActivityTimelineTabTrigger />
          <TicketFeedbackTabTrigger ticket={ticket} />
          <TicketApprovalTabTrigger />
        </TabsList>

        <TabsContent value="overview" className="enterprise-panel space-y-6">
          <div className="flex flex-wrap gap-3">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Description</dt>
              <dd className="text-sm mt-1 whitespace-pre-wrap break-words">{ticket.description ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Department</dt>
              <dd className="text-sm mt-1">{ticket.department?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Requester</dt>
              <dd className="text-sm mt-1">{formatPerson(ticket.requester)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Assignee</dt>
              <dd className="text-sm mt-1">{formatPerson(ticket.assignee)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Created Date</dt>
              <dd className="text-sm mt-1">
                <time dateTime={ticket.created_at}>{format(new Date(ticket.created_at), 'PPp')}</time>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Updated Date</dt>
              <dd className="text-sm mt-1">
                {ticket.updated_at ? (
                  <time dateTime={ticket.updated_at}>{format(new Date(ticket.updated_at), 'PPp')}</time>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </TabsContent>

        <TabsContent value="comments" className="enterprise-panel space-y-6">
          <TicketCommentForm
            canPostInternal={includeInternal}
            isSubmitting={createComment.isPending}
            onSubmit={(values) => createComment.mutate(values)}
          />
          <TicketCommentList comments={comments} isLoading={commentsLoading} />
        </TabsContent>

        <TabsContent value="attachments" className="enterprise-panel">
          {attachmentsLoading ? (
            <LoadingState variant="inline" label="Loading attachments" />
          ) : (
            <TicketAttachmentUpload
              ticketId={ticketId}
              attachments={attachments}
              onUpload={(file) => uploadAttachment.mutateAsync(file)}
              isUploading={uploadAttachment.isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="timeline" className="enterprise-panel">
          <TicketTimeline entries={timeline} isLoading={timelineLoading} />
        </TabsContent>

        <TabsContent value="sla" className="enterprise-panel">
          <TicketSlaCard
            sla={sla}
            isLoading={slaLoading}
            canManageSla={canManageSla(user?.role)}
          />
        </TabsContent>

        <TabsContent value="assignments" className="enterprise-panel">
          {assignmentsLoading ? (
            <LoadingState variant="inline" label="Loading assignments" />
          ) : (
            <TicketAssignments
              assignments={assignments}
              employees={employees}
              canAssign={canAssign(user?.role)}
              onAssign={(assigneeId) =>
                assignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })
              }
              onReassign={(assigneeId) =>
                reassignTicket.mutate({ assignee_id: assigneeId, assignment_type: 'MANUAL' })
              }
              isSubmitting={assignTicket.isPending || reassignTicket.isPending}
            />
          )}
        </TabsContent>

        <TicketFeedbackTabContent ticket={ticket} ticketId={ticketId} />
        <TicketCommunicationTabContent ticketId={ticketId} />
        <TicketApprovalTabContent ticketId={ticketId} />
        {canViewAudit && (
          <TabsContent value="audit-timeline" className="enterprise-panel">
            <TicketAuditTimeline ticketId={ticketId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
