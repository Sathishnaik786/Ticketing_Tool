import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { departmentsApi, employeesApi } from '@/services/api';
import { useTickets } from '@/modules/ticketing/hooks/useTicketing';
import { useKnowledgeArticles } from '@/modules/knowledge-management/hooks/useKnowledgeManagement';
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSearchSuggestions,
  type SearchHistoryEntry,
} from '@/utils/searchHistory.utils';
import { SearchCategoryTabs } from './search/SearchCategoryTabs';
import { SearchRecentHistory } from './search/SearchRecentHistory';
import { SearchSuggestions } from './search/SearchSuggestions';
import { SearchResultsPanel, type SearchResult } from './search/SearchResultsPanel';

interface GlobalSearchProps {
  isMobile?: boolean;
}

export function GlobalSearch({ isMobile = false }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryEntry[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);
    return () => clearTimeout(handler);
  }, [query]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobileView = useIsMobile();

  // Queries to load data for search indexing
  const { data: ticketsResponse } = useTickets();
  const tickets = ticketsResponse?.data || [];

  const { data: articles = [] } = useKnowledgeArticles();

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 100 }),
    queryFn: () => employeesApi.getAll({ limit: 100 }),
  });
  const employees = employeesResponse?.data || [];

  const announcements = useMemo(() => [
    { id: 'ann-1', title: 'Phase 4 operational workspace rollout', category: 'announcements' as const, href: '/app/communications/announcements', description: 'Enterprise alert features guide' },
    { id: 'ann-2', title: 'Scheduled system backup window - Saturday', category: 'announcements' as const, href: '/app/communications/announcements', description: 'System ops announcements' },
  ], []);

  // Map database elements into unified SearchResult nodes
  const searchResultsList = useMemo((): SearchResult[] => {
    if (!debouncedQuery.trim()) return [];

    const q = debouncedQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Tickets
    tickets.filter((t: any) =>
      t.title.toLowerCase().includes(q) ||
      (t.ticket_number && t.ticket_number.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    ).forEach((t: any) => {
      results.push({
        id: `ticket-${t.id}`,
        title: `${t.ticket_number || 'TKT'}: ${t.title}`,
        description: `Status: ${t.status} • Priority: ${t.priority}`,
        category: 'tickets',
        href: `/app/tickets/${t.id}`
      });
    });

    // KB Articles
    articles.filter((art: any) =>
      art.title.toLowerCase().includes(q) ||
      (art.summary && art.summary.toLowerCase().includes(q))
    ).forEach((art: any) => {
      results.push({
        id: `article-${art.id}`,
        title: art.title,
        description: art.summary || 'Knowledge base article documentation',
        category: 'kb',
        href: `/app/articles/${art.id}`
      });
    });

    // People
    employees.filter((emp: any) => {
      const first = emp.first_name || emp.firstName || '';
      const last = emp.last_name || emp.lastName || '';
      const fullName = `${first} ${last}`.trim() || emp.email || 'Employee';
      return fullName.toLowerCase().includes(q) || (emp.email && emp.email.toLowerCase().includes(q));
    }).forEach((emp: any) => {
      const first = emp.first_name || emp.firstName || '';
      const last = emp.last_name || emp.lastName || '';
      const fullName = `${first} ${last}`.trim() || emp.email || 'Employee';
      results.push({
        id: `person-${emp.id}`,
        title: fullName,
        description: `${emp.position || 'Employee'} • ${emp.email || 'No Email'}`,
        category: 'people',
        href: `/app/employees?search=${first || emp.email || ''}`
      });
    });

    // Announcements
    announcements.filter((ann) =>
      ann.title.toLowerCase().includes(q)
    ).forEach((ann) => {
      results.push({
        id: ann.id,
        title: ann.title,
        description: ann.description,
        category: 'announcements',
        href: ann.href
      });
    });

    return results;
  }, [debouncedQuery, tickets, articles, employees, announcements]);

  const activeFilteredResults = useMemo(() => {
    if (activeCategory === 'all') return searchResultsList;
    return searchResultsList.filter((r) => r.category === activeCategory);
  }, [searchResultsList, activeCategory]);

  const popularSuggestions = useMemo(() => {
    const list = ['my tickets', 'create ticket', 'approvals', 'knowledge base', 'payroll status'];
    return getSearchSuggestions(list);
  }, []);

  const refreshRecent = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent, isOpen]);

  useEffect(() => {
    setActiveIndex(activeFilteredResults.length > 0 ? 0 : -1);
  }, [activeFilteredResults.length, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (item: SearchResult | SearchHistoryEntry) => {
    addRecentSearch(item.query || item.title, item.href);
    if (item.href) {
      navigate(item.href);
      setIsOpen(false);
      setQuery('');
      refreshRecent();
    }
  };

  const handleSuggestionSelect = (val: string) => {
    setQuery(val);
    addRecentSearch(val);
    refreshRecent();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || activeFilteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % activeFilteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? activeFilteredResults.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(activeFilteredResults[activeIndex]);
    }
  };

  const searchBodyContent = (
    <div className="p-4 space-y-6">
      {/* Category Tabs */}
      {query && (
        <SearchCategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* Main Results or suggestions/recent history */}
      {query.trim() ? (
        <SearchResultsPanel
          results={searchResultsList}
          activeCategory={activeCategory}
          onItemSelect={handleSelect}
          activeIndex={activeIndex}
        />
      ) : (
        <div className="space-y-6">
          <SearchRecentHistory
            history={recentSearches}
            onSelect={handleSelect}
            onClear={() => {
              clearRecentSearches();
              refreshRecent();
            }}
          />
          <SearchSuggestions
            suggestions={popularSuggestions}
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}
    </div>
  );

  const searchInputNode = (
    <>
      <Search className="h-5 w-5 text-primary flex-shrink-0" aria-hidden />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleInputKeyDown}
        placeholder="Search tickets, articles, personnel... (Press '/' to search)"
        className="border-0 focus-visible:ring-0 flex-1 h-9 text-xs"
        aria-label="Global search"
        aria-controls={isOpen ? 'global-search-results' : undefined}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
      />
    </>
  );

  if (isMobileView || isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-muted text-muted-foreground"
          aria-label="Open search drawer"
        >
          <Search className="h-5 w-5" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm p-4 flex flex-col"
              role="dialog"
              aria-label="Search navigation"
            >
              <div className="w-full max-w-2xl mx-auto bg-card rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-4 border-b flex items-center gap-2">
                  {searchInputNode}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close search">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1" id="global-search-results">
                  {searchBodyContent}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative flex items-center bg-muted/40 rounded-xl border border-border/40 px-3 py-1">
        <Search className="h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search tickets, articles, personnel... (Press '/' to search)"
          className="border-0 bg-transparent focus-visible:ring-0 pl-2 pr-6 h-9 text-xs flex-1 shadow-none"
          aria-label="Global search"
          role="combobox"
          aria-expanded={isOpen}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="global-search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 w-full mt-2 rounded-[2rem] border bg-card shadow-2xl z-50 max-h-[75vh] overflow-hidden"
          >
            <ScrollArea className="max-h-[70vh]">{searchBodyContent}</ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default GlobalSearch;
