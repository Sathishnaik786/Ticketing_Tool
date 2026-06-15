import { format } from 'date-fns';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
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
    queryKey: queryKeys.employees({ limit: 200 }),
    queryFn: () => employeesApi.getAll({ limit: 200 }),
  });

  const employees = employeesResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="p-8" aria-busy="true" aria-live="polite">
        <p className="sr-only">Loading ticket details</p>
        <DataTableSkeleton />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6" role="alert">
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? 'Unable to load ticket details.'}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/app/tickets">Back to tickets</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList aria-label="Ticket detail sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
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
            <DataTableSkeleton />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
