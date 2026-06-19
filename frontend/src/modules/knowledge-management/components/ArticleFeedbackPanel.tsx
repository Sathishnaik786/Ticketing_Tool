import { useState } from 'react';
import { useArticleFeedback } from '../hooks/useKnowledgeManagement';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ArticleFeedbackPanelProps {
  articleId: string;
}

export function ArticleFeedbackPanel({ articleId }: ArticleFeedbackPanelProps) {
  const [message, setMessage] = useState('');
  const feedback = useArticleFeedback(articleId);

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Article Feedback</h3>
      <Textarea
        rows={3}
        placeholder="Was this article helpful? Share your feedback…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!message.trim() || feedback.isPending}
          onClick={() => {
            feedback.mutate({ feedback_type: 'HELPFUL', message });
            setMessage('');
          }}
        >
          Helpful
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!message.trim() || feedback.isPending}
          onClick={() => {
            feedback.mutate({ feedback_type: 'NOT_HELPFUL', message });
            setMessage('');
          }}
        >
          Not Helpful
        </Button>
        <Button
          size="sm"
          disabled={!message.trim() || feedback.isPending}
          onClick={() => {
            feedback.mutate({ feedback_type: 'SUGGESTION', message });
            setMessage('');
          }}
        >
          Submit
        </Button>
      </div>
    </section>
  );
}
