import { Link } from 'react-router-dom';
import { isKnowledgeBaseEnabled } from '@/config/features';
import { useKnowledgeSearch } from '../hooks/useKnowledgeManagement';
import { BookOpen } from 'lucide-react';

interface KnowledgeSuggestionsPanelProps {
  searchQuery: string;
}

export function KnowledgeSuggestionsPanel({ searchQuery }: KnowledgeSuggestionsPanelProps) {
  const trimmed = searchQuery.trim();
  const { data, isLoading } = useKnowledgeSearch(trimmed, isKnowledgeBaseEnabled && trimmed.length >= 3);

  if (!isKnowledgeBaseEnabled || trimmed.length < 3) return null;

  return (
    <aside
      className="enterprise-panel space-y-4 border-l-4 border-l-primary/30"
      aria-label="Possible solutions from knowledge base"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold">Possible Solutions Found</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Searching knowledge base…</p>
      ) : !data?.count ? (
        <p className="text-sm text-muted-foreground">
          No matching articles. You can continue creating your ticket below.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            These articles may resolve your issue before opening a ticket:
          </p>
          <ul className="space-y-2">
            {data.results.slice(0, 5).map((article) => (
              <li key={article.id}>
                <Link
                  to={`/app/articles/${article.id}`}
                  className="text-sm text-primary hover:underline block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                </Link>
                {article.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{article.summary}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
