import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Navigation, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  buildSearchRegistry,
  filterSearchRegistry,
  type SearchRegistryItem,
} from '@/config/navigation.utils';
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSearchSuggestions,
  type SearchHistoryEntry,
} from '@/utils/searchHistory.utils';

interface GlobalSearchProps {
  isMobile?: boolean;
}

type SearchResultItem = SearchRegistryItem & { section: 'results' };
type DisplayItem =
  | SearchResultItem
  | { id: string; title: string; href?: string; section: 'recent' | 'suggestion'; query?: string };

export function GlobalSearch({ isMobile = false }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryEntry[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobileView = useIsMobile();

  const registry = useMemo(() => buildSearchRegistry(), []);

  const suggestions = useMemo(
    () => getSearchSuggestions(registry.map((r) => r.title)),
    [registry]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return filterSearchRegistry(registry, user, query)
      .slice(0, 12)
      .map((item) => ({ ...item, section: 'results' as const }));
  }, [query, user, registry]);

  const displayItems: DisplayItem[] = useMemo(() => {
    if (query.trim()) return results;

    const recent: DisplayItem[] = recentSearches.map((entry) => ({
      id: `recent-${entry.query}`,
      title: entry.query,
      href: entry.href,
      section: 'recent' as const,
      query: entry.query,
    }));

    const suggested: DisplayItem[] = suggestions
      .filter((s) => !recentSearches.some((r) => r.query.toLowerCase() === s.toLowerCase()))
      .slice(0, 6)
      .map((s) => ({
        id: `suggestion-${s}`,
        title: s,
        section: 'suggestion' as const,
        query: s,
      }));

    return [...recent, ...suggested];
  }, [query, results, recentSearches, suggestions]);

  const refreshRecent = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent, isOpen]);

  useEffect(() => {
    setActiveIndex(displayItems.length > 0 ? 0 : -1);
  }, [displayItems.length, query]);

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

  const handleSelect = (item: DisplayItem) => {
    if ('href' in item && item.href) {
      addRecentSearch(item.title, item.href);
      navigate(item.href);
      setIsOpen(false);
      setQuery('');
      refreshRecent();
      return;
    }

    const searchQuery = 'query' in item && item.query ? item.query : item.title;
    setQuery(searchQuery);
    addRecentSearch(searchQuery);
    refreshRecent();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || displayItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % displayItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? displayItems.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(displayItems[activeIndex]);
    }
  };

  const resultList = (
    <div ref={listRef} role="listbox" aria-label="Search results">
      {!query.trim() && recentSearches.length > 0 && (
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</span>
          <button
            type="button"
            className="text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearRecentSearches();
              refreshRecent();
            }}
          >
            Clear
          </button>
        </div>
      )}
      {!query.trim() && suggestions.length > 0 && recentSearches.length === 0 && (
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Suggestions
        </p>
      )}

      <div className="space-y-0.5">
        {displayItems.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon =
            item.section === 'recent' ? Clock : item.section === 'suggestion' ? Sparkles : Navigation;

          if ('href' in item && item.href && item.section === 'results') {
            return (
              <Link
                key={item.id}
                to={item.href}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  addRecentSearch(item.title, item.href);
                  setIsOpen(false);
                  setQuery('');
                  refreshRecent();
                }}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg transition-colors group',
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{item.href}</div>
                </div>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => handleSelect(item)}
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left',
                isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
              )}
            >
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{item.title}</div>
                {item.section === 'suggestion' && (
                  <div className="text-[10px] text-muted-foreground">Suggested search</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {query && results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No matching destinations.</p>
      )}
    </div>
  );

  const searchInput = (
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
        placeholder="Search tickets, pages, actions..."
        className="border-0 focus-visible:ring-0 flex-1"
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
          className="p-2.5 rounded-xl bg-muted text-muted-foreground"
          aria-label="Open search"
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
              <div className="w-full max-w-2xl mx-auto bg-card rounded-xl border shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-3 border-b flex items-center gap-2">
                  {searchInput}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close search">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-2" id="global-search-results">
                  {resultList}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
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
        placeholder="Search tickets, pages, actions..."
        className="pl-10 h-10 rounded-xl"
        aria-label="Global search"
        aria-controls={isOpen ? 'global-search-results' : undefined}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="global-search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 w-full mt-2 rounded-xl border bg-card shadow-lg z-50 max-h-80 overflow-hidden"
          >
            <ScrollArea className="p-2">{resultList}</ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
