import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Command, Navigation } from 'lucide-react';
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
} from '@/config/navigation.utils';

interface GlobalSearchProps {
  isMobile?: boolean;
}

export function GlobalSearch({ isMobile = false }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobileView = useIsMobile();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return filterSearchRegistry(buildSearchRegistry(), user, query).slice(0, 12);
  }, [query, user]);

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
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const resultList = (
    <div className="space-y-1">
      {results.map((result) => (
        <Link
          key={result.id}
          to={result.href}
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
        >
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary">
            <Navigation className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{result.title}</div>
            <div className="text-[10px] text-slate-500 truncate">{result.href}</div>
          </div>
        </Link>
      ))}
      {query && results.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">No matching destinations.</p>
      )}
    </div>
  );

  if (isMobileView || isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500"
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
              className="fixed inset-0 z-[100] bg-slate-950/80 p-4 flex flex-col"
              role="dialog"
              aria-label="Search navigation"
            >
              <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages and actions..."
                    className="border-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close search">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-3">{resultList}</ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search tickets, pages, actions..."
        className="pl-10 h-10 rounded-xl"
        aria-label="Global search"
        aria-controls={isOpen && query ? 'global-search-results' : undefined}
      />
      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            id="global-search-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 w-full mt-2 rounded-xl border bg-white dark:bg-slate-900 shadow-lg z-50 max-h-80 overflow-hidden"
            role="listbox"
          >
            <ScrollArea className="p-2">{resultList}</ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
