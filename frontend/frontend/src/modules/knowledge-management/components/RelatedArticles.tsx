import { ArticleCard } from './ArticleCard';
import { useRelatedArticles } from '../hooks/useKnowledgeManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';

interface RelatedArticlesProps {
  articleId: string;
}

export function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const { data, isLoading } = useRelatedArticles(articleId);

  if (isLoading) return <DataTableSkeleton />;

  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">No related articles found.</p>;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Related Articles</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
