import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import type { KnowledgeArticle } from '../services/knowledgeManagementService';

interface ArticleCardProps {
  article: KnowledgeArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to={`/app/articles/${article.id}`}
      className="block rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors space-y-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{article.title}</h3>
        <Badge variant="secondary">{article.status}</Badge>
      </div>
      {article.summary && (
        <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
