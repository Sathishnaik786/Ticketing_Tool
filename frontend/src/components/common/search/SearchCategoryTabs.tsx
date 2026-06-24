import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SearchCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function SearchCategoryTabs({ activeCategory, onCategoryChange }: SearchCategoryTabsProps) {
  const categories = [
    { id: 'all', label: 'All Results' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'kb', label: 'Knowledge Base' },
    { id: 'people', label: 'People' },
    { id: 'announcements', label: 'Announcements' },
  ];

  return (
    <div className="flex gap-1.5 border-b border-border pb-3 overflow-x-auto scrollbar-none" role="tablist" aria-label="Search categories">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 shrink-0",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
export default SearchCategoryTabs;
