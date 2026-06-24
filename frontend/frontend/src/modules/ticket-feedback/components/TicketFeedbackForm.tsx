import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';

interface TicketFeedbackFormProps {
  onSubmit: (values: {
    rating: number;
    resolution_quality: number;
    communication_quality: number;
    response_time: number;
    comments?: string;
  }) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function TicketFeedbackForm({ onSubmit, isSubmitting = false, disabled = false }: TicketFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [resolutionQuality, setResolutionQuality] = useState(0);
  const [communicationQuality, setCommunicationQuality] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [comments, setComments] = useState('');

  const isValid =
    rating >= 1 &&
    resolutionQuality >= 1 &&
    communicationQuality >= 1 &&
    responseTime >= 1 &&
    comments.length <= 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || disabled) return;
    onSubmit({
      rating,
      resolution_quality: resolutionQuality,
      communication_quality: communicationQuality,
      response_time: responseTime,
      comments: comments.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Ticket feedback form">
      <StarRating
        id="overall-rating"
        label="Overall Rating"
        value={rating}
        onChange={setRating}
        disabled={disabled}
      />
      <StarRating
        id="resolution-quality"
        label="Resolution Quality (1-5)"
        value={resolutionQuality}
        onChange={setResolutionQuality}
        disabled={disabled}
      />
      <StarRating
        id="communication-quality"
        label="Communication Quality (1-5)"
        value={communicationQuality}
        onChange={setCommunicationQuality}
        disabled={disabled}
      />
      <StarRating
        id="response-time"
        label="Response Time (1-5)"
        value={responseTime}
        onChange={setResponseTime}
        disabled={disabled}
      />

      <div className="space-y-2">
        <label htmlFor="feedback-comments" className="text-sm font-medium">
          Comments (optional)
        </label>
        <Textarea
          id="feedback-comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          maxLength={1000}
          rows={4}
          disabled={disabled}
          placeholder="Share additional details about your experience..."
        />
        <p className="text-xs text-muted-foreground text-right">{comments.length}/1000</p>
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting || disabled}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
