import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, ActionToolbar, ErrorState } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, Lock, Paperclip, Smile, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

// Import hooks and widgets
import {
  useTicket,
  useComments,
  useCreateComment,
  useTimeline,
  useSla,
  useUploadAttachment,
  useAttachments,
} from '../hooks/useTicketing';
import { useRealtimeTickets } from '@/hooks/useRealtimeTickets';
import { useRealtimeActivity } from '@/hooks/useRealtimeActivity';

import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { TicketTimeline } from './TicketTimeline';
import { TicketSlaPanel } from './TicketSlaPanel';
import { TicketApprovalPanel } from './TicketApprovalPanel';
import { RelatedTicketsPanel } from './RelatedTicketsPanel';
import { TicketWatchersPanel } from './TicketWatchersPanel';
import { ActivityLogPanel } from './ActivityLogPanel';
import { TicketAttachmentUpload } from './TicketAttachmentUpload';
import { TicketAssignmentActions } from '@/modules/ticket-assignment/components/TicketAssignmentActions';

// Import Collaboration V2 and AI Assist Panel
import { AiAssistPanel } from './AiAssistPanel';
import { OnlineUsersPanel } from './OnlineUsersPanel';
import { TypingIndicator } from './TypingIndicator';
import { MentionUsers } from './MentionUsers';

interface TicketDetailEnterpriseProps {
  ticketId: string;
}

export default function TicketDetailEnterprise({ ticketId }: TicketDetailEnterpriseProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mount real-time operations syncing hooks
  useRealtimeTickets(ticketId);
  useRealtimeActivity(ticketId);

  const { data: ticket, isLoading: ticketLoading, isError, refetch } = useTicket(ticketId);
  const { data: comments = [], isLoading: commentsLoading } = useComments(ticketId, true);
  const { data: attachments = [], isLoading: attachmentsLoading } = useAttachments(ticketId);
  const { data: timeline = [], isLoading: timelineLoading } = useTimeline(ticketId);
  const { isLoading: slaLoading } = useSla(ticketId);

  const createComment = useCreateComment(ticketId);
  const uploadAttachment = useUploadAttachment(ticketId);

  const [commentContent, setCommentContent] = React.useState('');
  const [commentType, setCommentType] = React.useState<'public' | 'internal'>('public');
  const [newTag, setNewTag] = React.useState('');
  const [customTags, setCustomTags] = React.useState<string[]>(['it-ops', 'urgent-access']);
  const [isUploading, setIsUploading] = React.useState(false);

  // Typing and mentions states
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const [mentionSearch, setMentionSearch] = React.useState<string | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-simulate other coworker typing when this user writes
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentContent(val);

    // Detect mention trigger '@'
    const words = val.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) {
      setMentionSearch(lastWord.slice(1));
    } else {
      setMentionSearch(null);
    }

    if (val.trim() && !isTyping) {
      setIsTyping(true);
      // Simulate Sarach is typing in response
      setTypingUsers(['Sarah Jenkins (IT support)']);
    } else if (!val.trim()) {
      setIsTyping(false);
      setTypingUsers([]);
    }
  };

  const applyMention = (username: string) => {
    const words = commentContent.split(' ');
    words.pop(); // Remove the incomplete '@name' word
    const updated = [...words, `@${username} `].join(' ');
    setCommentContent(updated);
    setMentionSearch(null);
    textareaRef.current?.focus();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await createComment.mutateAsync({
        content: commentContent,
        is_internal: commentType === 'internal',
      });
      setCommentContent('');
      setIsTyping(false);
      setTypingUsers([]);
    } catch (err) {
      // Ignored
    }
  };

  const onUploadAttachment = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadAttachment.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  if (ticketLoading) {
    return (
      <div className="p-8 text-center space-y-4 animate-pulse">
        <div className="h-10 w-2/3 bg-muted rounded-xl mx-auto" />
        <div className="h-40 w-full bg-muted rounded-2xl mx-auto" />
      </div>
    );
  }

  if (isError || !ticket) {
    return <ErrorState title="Unable to retrieve ticket details" onRetry={refetch} />;
  }

  const formatPerson = (person: any) => {
    if (!person) return 'Unassigned';
    return `${person.first_name} ${person.last_name || ''}`.trim();
  };

  const canPostInternal = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'HR';
  const isCreatingComment = createComment.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${ticket.ticket_number || 'TKT'}: ${ticket.title}`}
        description={`Opened by ${formatPerson(ticket.requester)} in department ${ticket.department?.name || 'Operations'}`}
        compact
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link to="/app/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to catalog
              </Link>
            </Button>
            <TicketAssignmentActions ticket={ticket} />
          </div>
        }
      />

      {/* JSM 3-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Summary, Requester, Priority, Tags, Attachments */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary / Description */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket Summary</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.title}</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words mt-2">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          {/* Requester details */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Requester</h3>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {ticket.requester?.first_name?.[0] || '?'}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{formatPerson(ticket.requester)}</p>
                <p className="text-muted-foreground truncate">{ticket.requester?.email || 'No email'}</p>
              </div>
            </div>
            <div className="text-xs space-y-1.5 pt-2.5 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-foreground">{ticket.department?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assignee:</span>
                <span className="font-medium text-foreground">{formatPerson(ticket.assignee)}</span>
              </div>
            </div>
          </div>

          {/* Ticket Details & Priority */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Details</h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Priority</span>
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            <div className="text-xs pt-2 border-t border-border flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{format(new Date(ticket.created_at), 'PP')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Labels & Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {customTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1 px-2 py-0.5 rounded-lg">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-[10px] font-black hover:text-red-500">×</button>
                </Badge>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-1.5 mt-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="h-8.5 text-xs rounded-xl border-input/60"
                aria-label="New tag name"
              />
              <Button type="submit" size="sm" variant="outline" className="h-8.5 text-xs rounded-xl">Add</Button>
            </form>
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="h-4 w-4" />
              Attachments ({attachments.length})
            </h3>
            {attachmentsLoading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : (
              <TicketAttachmentUpload
                ticketId={ticketId}
                attachments={attachments}
                onUpload={onUploadAttachment}
                isUploading={isUploading}
              />
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Timeline, Comments, Activities */}
        <div className="lg:col-span-6 space-y-6">
          {/* Comments Panel */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 relative">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold">Reply Workspace</h2>
            </div>

            {/* Comment type tabs */}
            <div className="flex border-b border-border text-xs">
              <button
                onClick={() => setCommentType('public')}
                className={`py-2 px-4 font-semibold border-b-2 -mb-px flex items-center gap-1.5 ${
                  commentType === 'public'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Reply to Customer
              </button>
              {canPostInternal && (
                <button
                  onClick={() => setCommentType('internal')}
                  className={`py-2 px-4 font-semibold border-b-2 -mb-px flex items-center gap-1.5 ${
                    commentType === 'internal'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  Internal Note
                </button>
              )}
            </div>

            {/* Comment editor */}
            <form onSubmit={submitComment} className="space-y-3 relative">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    commentType === 'internal'
                      ? 'Add an internal note. Only team members will see this.'
                      : 'Write a response. This will be sent directly to the requester. Type @ to mention.'
                  }
                  value={commentContent}
                  onChange={handleTyping}
                  rows={4}
                  className={`border-input resize-none focus-visible:ring-1 text-xs rounded-xl ${
                    commentType === 'internal' ? 'focus-visible:ring-amber-500' : 'focus-visible:ring-primary'
                  }`}
                  aria-label="Comment entry area"
                />

                {/* Mention Users Overlay popup */}
                {mentionSearch !== null && (
                  <MentionUsers
                    searchQuery={mentionSearch}
                    onSelect={applyMention}
                    onClose={() => setMentionSearch(null)}
                    targetRef={textareaRef}
                  />
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-1.5 text-muted-foreground">
                  <Button type="button" variant="ghost" size="sm" className="h-7.5 w-7.5 p-0 rounded-lg" title="Attach file">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7.5 w-7.5 p-0 rounded-lg" title="Insert Emoji">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <TypingIndicator typingUsers={typingUsers} />
                  <Button
                    type="submit"
                    size="sm"
                    className={`h-8 px-4 gap-1.5 rounded-xl text-xs font-bold ${
                      commentType === 'internal' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-primary hover:bg-primary/95 text-white'
                    }`}
                    disabled={isCreatingComment || !commentContent.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{commentType === 'internal' ? 'Save Note' : 'Send'}</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-4 border-t border-border/80">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment Thread</h3>
              {commentsLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No comments. Be the first to reply.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {comments.map((comment) => {
                    const isInternal = comment.is_internal === true;
                    return (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isInternal
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-muted/10 border-border/60'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatPerson(comment.author)}</span>
                          <div className="flex items-center gap-1.5">
                            {isInternal && (
                              <Badge className="text-[8px] bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 py-0 px-1.5 rounded">
                                Internal Note
                              </Badge>
                            )}
                            <span className="text-muted-foreground">
                              {format(new Date(comment.created_at), 'p (PP)')}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground break-words leading-relaxed">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* TicketTimeline */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-bold border-b border-border pb-3">Ticket Timeline</h2>
            <ComponentErrorBoundary name="TicketTimeline">
              <TicketTimeline entries={timeline} isLoading={timelineLoading} />
            </ComponentErrorBoundary>
          </div>
        </div>

        {/* RIGHT COLUMN: SLA, Approvals, Link Relations, Watchers, Audit Logs */}
        <div className="lg:col-span-3 space-y-6">
          {/* SLA Status Clock */}
          <ComponentErrorBoundary name="TicketSlaPanel">
            <TicketSlaPanel sla={ticket.sla_resolution_due_at ? {
              response_due_at: ticket.sla_response_due_at || null,
              resolution_due_at: ticket.sla_resolution_due_at || null,
              response_breached: ticket.sla_response_breached || false,
              resolution_breached: ticket.sla_resolution_breached || false,
            } : null} isLoading={slaLoading} />
          </ComponentErrorBoundary>

          {/* AI Co-Pilot Recommendation Widget */}
          <ComponentErrorBoundary name="AiAssistPanel">
            <AiAssistPanel
              ticketTitle={ticket.title}
              ticketDescription={ticket.description || ''}
              onApplyResponse={(text) => {
                setCommentContent(prev => prev + text);
                textareaRef.current?.focus();
              }}
            />
          </ComponentErrorBoundary>

          {/* Online Coworkers Sidebar indicator */}
          <ComponentErrorBoundary name="OnlineUsersPanel">
            <OnlineUsersPanel />
          </ComponentErrorBoundary>

          {/* Approval Step Lists */}
          <ComponentErrorBoundary name="TicketApprovalPanel">
            <TicketApprovalPanel ticketId={ticketId} />
          </ComponentErrorBoundary>

          {/* Related Links */}
          <ComponentErrorBoundary name="RelatedTicketsPanel">
            <RelatedTicketsPanel ticketId={ticketId} />
          </ComponentErrorBoundary>

          {/* Watchers Panel */}
          <ComponentErrorBoundary name="TicketWatchersPanel">
            <TicketWatchersPanel ticketId={ticketId} currentUserEmployeeId={user?.employeeId} />
          </ComponentErrorBoundary>

          {/* Activity Logs */}
          <ComponentErrorBoundary name="ActivityLogPanel">
            <ActivityLogPanel timeline={timeline} isLoading={timelineLoading} />
          </ComponentErrorBoundary>
        </div>
      </div>

      {/* Mobile sticky actions bar */}
      <ActionToolbar mobileSticky className="md:hidden">
        <TicketAssignmentActions ticket={ticket} />
      </ActionToolbar>
    </div>
  );
}
export { TicketDetailEnterprise };
