import { formatDistanceToNow } from 'date-fns';
import { Lock } from 'lucide-react';
import type { TicketComment } from '../types/ticketing.types';

function formatAuthor(comment: TicketComment): string {
  if (comment.author?.first_name || comment.author?.last_name) {
    return `${comment.author.first_name ?? ''} ${comment.author.last_name ?? ''}`.trim();
  }
  return comment.author?.email ?? 'Unknown user';
}

function sanitizeContent(content: string): string {
  return content.replace(/[<>]/g, '');
}

interface TicketCommentListProps {
  comments: TicketComment[];
  isLoading?: boolean;
}

export function TicketCommentList({ comments, isLoading }: TicketCommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No comments yet. Be the first to add one.
      </p>
    );
  }

  return (
    <ul className="space-y-4" aria-label="Ticket comments">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-xl border border-border/60 bg-background/50 p-4"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold">{formatAuthor(comment)}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {comment.is_internal && (
                <span
                  className="inline-flex items-center gap-1 text-amber-600"
                  aria-label="Internal comment"
                >
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Internal
                </span>
              )}
              <time dateTime={comment.created_at}>
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </time>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words">{sanitizeContent(comment.content)}</p>
        </li>
      ))}
    </ul>
  );
}
