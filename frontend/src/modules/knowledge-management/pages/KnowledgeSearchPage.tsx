import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Search, Star, Bookmark, Calendar, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useKnowledgeArticles, useKnowledgeCategories } from '../hooks/useKnowledgeManagement';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function KnowledgeSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [search, setSearch] = React.useState(queryParam);
  const [selectedCategory, setSelectedCategory] = React.useState(categoryParam);
  const [sortBy, setSortBy] = React.useState<'recent' | 'rating'>('recent');

  const { data: categories = [] } = useKnowledgeCategories();
  const { data: articles = [], isLoading } = useKnowledgeArticles();

  React.useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  React.useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: search, category: selectedCategory });
  };

  // Client-side search and filter matching
  const searchResults = React.useMemo(() => {
    let list = [...articles];
    if (queryParam.trim()) {
      const q = queryParam.toLowerCase();
      list = list.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          (art.summary && art.summary.toLowerCase().includes(q)) ||
          art.content.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      list = list.filter((art) => art.category_id === selectedCategory);
    }
    if (sortBy === 'rating') {
      // Mock sorting by average rating represented here as title length for mock variation
      list.sort((a, b) => b.title.length - a.title.length);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [articles, queryParam, selectedCategory, sortBy]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Knowledge Base Search"
        description="Search FAQs, policy documentation, and resolution runbooks."
        breadcrumbs={[
          { label: 'Knowledge Base', href: '/app/knowledge-base' },
          { label: 'Search Results' },
        ]}
      />

      {/* Advanced search controls */}
      <form onSubmit={handleSearchSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-input"
              aria-label="Search text"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit" className="h-10">Search</Button>
          </div>
        </div>
      </form>

      {/* Results grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-sm text-muted-foreground">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-md border border-input bg-background px-3 h-8 text-xs focus:outline-none"
              aria-label="Sort by"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground font-medium">No matches found.</p>
            <p className="text-xs text-muted-foreground mt-1">Try using other terms or categories.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((art) => (
              <div
                key={art.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all space-y-2"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      to={`/app/articles/${art.id}`}
                      className="text-base font-semibold hover:text-primary hover:underline text-foreground"
                    >
                      {art.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {art.summary || 'Click to view the full resolution guidelines and policy descriptions.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-foreground">4.8</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex gap-2">
                    <span>Published {format(new Date(art.created_at), 'PP')}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">
                      {categories.find((c) => c.id === art.category_id)?.name ?? 'General'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild>
                    <Link to={`/app/articles/${art.id}`}>Read Full Article</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
