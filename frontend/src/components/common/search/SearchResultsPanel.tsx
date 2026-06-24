import * as React from 'react';
import { FileText, BookOpen, User, Megaphone, FolderKanban, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'tickets' | 'kb' | 'people' | 'announcements' | 'projects';
  href: string;
}

export interface SearchResultsPanelProps {
  results: SearchResult[];
  activeCategory: string;
  isLoading?: boolean;
  onItemSelect: (item: SearchResult) => void;
  activeIndex: number;
}

export function SearchResultsPanel({
  results,
  activeCategory,
  isLoading = false,
  onItemSelect,
  activeIndex,
}: SearchResultsPanelProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tickets':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'kb':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'people':
        return <User className="h-4 w-4 text-indigo-500" />;
      case 'announcements':
        return <Megaphone className="h-4 w-4 text-amber-500" />;
      case 'projects':
        return <FolderKanban className="h-4 w-4 text-rose-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredResults = React.useMemo(() => {
    if (activeCategory === 'all') return results;
    return results.filter((r) => r.category === activeCategory);
  }, [results, activeCategory]);

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3 animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded mx-auto" />
        <div className="h-3 w-1/2 bg-muted rounded mx-auto" />
        <div className="h-3.5 w-1/4 bg-muted rounded mx-auto" />
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-xs italic">
        No results found matching this criteria.
      </div>
    );
  }

  // Group by category for visual display if category is 'all'
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach((res) => {
      if (!groups[res.category]) groups[res.category] = [];
      groups[res.category].push(res);
    });
    return Object.entries(groups);
  }, [filteredResults]);

  const categoryLabels: Record<string, string> = {
    tickets: 'Service Desk Tickets',
    kb: 'Knowledge Documentation',
    people: 'Personnel Directory',
    announcements: 'Organizational Bulletins',
    projects: 'Operations Projects',
  };

  let globalCounter = 0;

  return (
    <div className="space-y-4" role="listbox" aria-label="Search items list">
      {groupedResults.map(([category, items]) => (
        <div key={category} className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 py-1 flex items-center gap-1.5 border-b border-border/20">
            {getCategoryIcon(category)}
            {categoryLabels[category] || category.toUpperCase()}
          </h4>

          <div className="space-y-0.5 mt-1.5">
            {items.map((item) => {
              const currentGlobalIndex = globalCounter++;
              const isActive = activeIndex === currentGlobalIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => onItemSelect(item)}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 border border-transparent text-left",
                    isActive
                      ? "bg-primary text-white shadow-md border-primary/20 scale-[1.01]"
                      : "hover:bg-muted/50 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className={cn("text-xs font-bold truncate", isActive ? "text-white" : "text-foreground")}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div className={cn("text-[10px] truncate mt-0.5", isActive ? "text-white/80" : "text-muted-foreground")}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 opacity-0 transition-all", isActive ? "opacity-100 translate-x-0 text-white" : "group-hover:opacity-100 group-hover:-translate-x-1")} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
export default SearchResultsPanel;
