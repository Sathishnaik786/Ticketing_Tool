import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKnowledgeArticle } from '../hooks/useKnowledgeManagement';
import { ArticleRating } from '../components/ArticleRating';
import { RelatedArticles } from '../components/RelatedArticles';
import { ArticleFeedbackPanel } from '../components/ArticleFeedbackPanel';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { ArrowLeft } from 'lucide-react';

export default function KnowledgeArticlePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useKnowledgeArticle(id);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <DataTableSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-destructive">Article not found.</p>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/app/knowledge-base">Back to Knowledge Base</Link>
        </Button>
      </div>
    );
  }

  const { article, tags, average_rating, rating_count } = data;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app/knowledge-base">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back
        </Link>
      </Button>

      <PageHeader
        title={article.title}
        description={article.summary ?? undefined}
        className="enterprise-panel mb-0"
      />

      <div className="enterprise-panel space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{article.status}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        {article.published_at && (
          <p className="text-xs text-muted-foreground">
            Published {format(new Date(article.published_at), 'PPP')}
          </p>
        )}

        <article className="prose prose-sm max-w-none whitespace-pre-wrap">{article.content}</article>

        <ArticleRating articleId={id} averageRating={average_rating} ratingCount={rating_count} />
        <RelatedArticles articleId={id} />
        <ArticleFeedbackPanel articleId={id} />
      </div>
    </div>
  );
}
