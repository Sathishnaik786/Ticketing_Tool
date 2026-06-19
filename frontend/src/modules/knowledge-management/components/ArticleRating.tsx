import { useState } from 'react';
import { useRateArticle } from '../hooks/useKnowledgeManagement';

interface ArticleRatingProps {
  articleId: string;
  averageRating?: number | null;
  ratingCount?: number;
}

export function ArticleRating({ articleId, averageRating, ratingCount }: ArticleRatingProps) {
  const [selected, setSelected] = useState(0);
  const rate = useRateArticle(articleId);

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Rate this article</h3>
      {averageRating != null && (
        <p className="text-xs text-muted-foreground">
          Average: {averageRating.toFixed(1)} ({ratingCount ?? 0} ratings)
        </p>
      )}
      <div className="flex gap-1" role="group" aria-label="Article rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-lg ${selected >= star || (averageRating ?? 0) >= star ? 'text-yellow-500' : 'text-muted-foreground'}`}
            onClick={() => {
              setSelected(star);
              rate.mutate(star);
            }}
            disabled={rate.isPending}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  );
}
