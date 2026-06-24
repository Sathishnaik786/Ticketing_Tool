import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { commentSchema, type CommentFormValues } from '../schemas/ticket.schema';

interface TicketCommentFormProps {
  onSubmit: (values: CommentFormValues) => void;
  isSubmitting?: boolean;
  canPostInternal?: boolean;
}

export function TicketCommentForm({
  onSubmit,
  isSubmitting,
  canPostInternal = false,
}: TicketCommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '', is_internal: false },
  });

  const isInternal = watch('is_internal');

  const submit = (values: CommentFormValues) => {
    onSubmit(values);
    reset({ content: '', is_internal: false });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Add comment form">
      <div className="space-y-2">
        <Label htmlFor="comment-content">Comment</Label>
        <Textarea
          id="comment-content"
          rows={4}
          placeholder="Write your comment..."
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'comment-content-error' : undefined}
          {...register('content')}
        />
        {errors.content && (
          <p id="comment-content-error" className="text-sm text-destructive" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      {canPostInternal && (
        <div className="flex items-center gap-3">
          <Switch
            id="comment-internal"
            checked={isInternal}
            onCheckedChange={(checked) => setValue('is_internal', checked)}
            aria-describedby="comment-internal-help"
          />
          <Label htmlFor="comment-internal">Internal comment (visible to staff only)</Label>
        </div>
      )}
      {canPostInternal && (
        <p id="comment-internal-help" className="text-xs text-muted-foreground">
          Internal comments are hidden from requesters. Backend access rules still apply.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
}
