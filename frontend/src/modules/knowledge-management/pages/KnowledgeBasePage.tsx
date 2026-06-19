import { PageHeader } from '@/components/layout/PageHeader';
import { KnowledgeSearch } from '../components/KnowledgeSearch';
import { ArticleCard } from '../components/ArticleCard';
import { useKnowledgeArticles, useKnowledgeCategories } from '../hooks/useKnowledgeManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KnowledgeBasePage() {
  const { data: categories = [] } = useKnowledgeCategories();
  const { data: articles = [], isLoading } = useKnowledgeArticles();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Knowledge Base"
        description="Self-service articles, FAQs, and troubleshooting guides for Aparna Enterprises."
        className="enterprise-panel mb-0"
      />

      <div className="enterprise-panel">
        <KnowledgeSearch />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Articles</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="enterprise-panel">
          {isLoading ? (
            <DataTableSkeleton />
          ) : !articles.length ? (
            <p className="text-sm text-muted-foreground">No articles available yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="enterprise-panel">
            <CategoryArticles categoryId={cat.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function CategoryArticles({ categoryId }: { categoryId: string }) {
  const { data: articles = [], isLoading } = useKnowledgeArticles({ category_id: categoryId });
  if (isLoading) return <DataTableSkeleton />;
  if (!articles.length) return <p className="text-sm text-muted-foreground">No articles in this category.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
