import * as React from 'react';
import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKnowledgeArticles } from '@/modules/knowledge-management/hooks/useKnowledgeManagement';

export interface SuggestedKnowledgeArticlesProps {
  query: string;
}

export function SuggestedKnowledgeArticles({ query }: SuggestedKnowledgeArticlesProps) {
  const { data: articles = [] } = useKnowledgeArticles();

  const suggested = React.useMemo(() => {
    if (!query.trim() || query.length < 5) return [];

    const q = query.toLowerCase();
    // Rank articles based on tag/keyword match
    return articles.filter((art: any) =>
      art.title.toLowerCase().includes(q) ||
      (art.summary && art.summary.toLowerCase().includes(q)) ||
      (art.content && art.content.toLowerCase().split(' ').some((w: string) => w.length > 4 && q.includes(w)))
    ).slice(0, 3);
  }, [query, articles]);

  if (suggested.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5 pl-1">
        <BookOpen className="h-4 w-4 text-emerald-500" />
        Suggested Self-Service Guides
      </h4>

      <div className="grid grid-cols-1 gap-2">
        {suggested.map((art: any) => (
          <Link
            key={art.id}
            to={`/app/articles/${art.id}`}
            className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/30 hover:border-emerald-500/20 transition-all group"
          >
            <div className="min-w-0 flex-1 pr-4 space-y-0.5">
              <div className="text-xs font-bold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {art.title}
              </div>
              {art.summary && (
                <div className="text-[10px] text-muted-foreground truncate leading-none">
                  {art.summary}
                </div>
              )}
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
export default SuggestedKnowledgeArticles;
