import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen, Bookmark, Star, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useKnowledgeCategories, useKnowledgeArticles } from '../hooks/useKnowledgeManagement';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useKnowledgeCategories();
  const { data: articles = [], isLoading: articlesLoading } = useKnowledgeArticles();
  const [bookmarkedIds, setBookmarkedIds] = React.useState<string[]>(['1', '3']);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
      toast.success('Bookmark removed');
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      toast.success('Article bookmarked');
    }
  };

  const getCategoryCount = (catId: string) => {
    return articles.filter((a) => a.category_id === catId).length;
  };

  const popularArticles = articles.slice(0, 4);
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Knowledge Base Categories"
        description="Browse documentation, policies, and self-service troubleshooting catalogs."
        breadcrumbs={[
          { label: 'Knowledge Base', href: '/app/knowledge-base' },
          { label: 'Categories' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Categories List */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Service Categories
          </h2>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <p className="text-sm text-muted-foreground">No categories defined yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const count = getCategoryCount(cat.id);
                return (
                  <Link
                    key={cat.id}
                    to={`/app/knowledge-base?category=${cat.id}`}
                    className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors text-base">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {cat.description || 'Guides and instructions relating to this service desk category.'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count} article{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Browse articles</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Popular, Recent, Bookmarks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Popular Articles */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5 border-b pb-2">
              <Star className="h-4 w-4 text-amber-500" />
              Popular Articles
            </h3>
            {articlesLoading ? (
              <div className="h-20 bg-muted animate-pulse rounded" />
            ) : popularArticles.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No articles found.</p>
            ) : (
              <div className="space-y-2">
                {popularArticles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/app/articles/${art.id}`}
                    className="block hover:underline text-xs font-medium text-foreground truncate"
                  >
                    {art.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked articles */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5 border-b pb-2">
              <Bookmark className="h-4 w-4 text-primary" />
              Bookmarks ({bookmarkedIds.length})
            </h3>
            {articlesLoading ? (
              <div className="h-20 bg-muted animate-pulse rounded" />
            ) : bookmarkedIds.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Your bookmarks will appear here.</p>
            ) : (
              <div className="space-y-2.5">
                {articles
                  .filter((art) => bookmarkedIds.includes(art.id))
                  .map((art) => (
                    <div key={art.id} className="flex justify-between items-center text-xs">
                      <Link to={`/app/articles/${art.id}`} className="hover:underline font-medium text-foreground truncate mr-2 flex-1">
                        {art.title}
                      </Link>
                      <Bookmark
                        className="h-3.5 w-3.5 text-primary fill-primary cursor-pointer shrink-0"
                        onClick={(e) => toggleBookmark(art.id, e)}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
