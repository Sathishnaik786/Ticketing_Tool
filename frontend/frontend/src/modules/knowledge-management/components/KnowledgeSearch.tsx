import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useKnowledgeSearch } from '../hooks/useKnowledgeManagement';
import { ArticleCard } from './ArticleCard';

interface KnowledgeSearchProps {
  onQueryChange?: (query: string) => void;
  showResults?: boolean;
}

export function KnowledgeSearch({ onQueryChange, showResults = true }: KnowledgeSearchProps) {
  const [query, setQuery] = useState('');
  const { data, isLoading, isFetching } = useKnowledgeSearch(query, showResults && query.length >= 2);

  const handleChange = (value: string) => {
    setQuery(value);
    onQueryChange?.(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search knowledge base…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-9"
          aria-label="Search knowledge base"
        />
      </div>
      {showResults && query.length >= 2 && (
        <div className="space-y-3">
          {isLoading || isFetching ? (
            <p className="text-sm text-muted-foreground">Searching…</p>
          ) : data?.count === 0 ? (
            <p className="text-sm text-muted-foreground">No articles found for &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{data?.count} result(s) for &ldquo;{query}&rdquo;</p>
              <div className="grid gap-3 md:grid-cols-2">
                {data?.results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
