import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Building2, Briefcase, ClipboardList, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'employee' | 'department' | 'project' | 'task';
  title: string;
  subtitle?: string;
  href: string;
}

interface GlobalSearchProps {
  isMobile?: boolean;
}

export function GlobalSearch({ isMobile = false }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobileView = useIsMobile();

  // Mock search function
  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResults: SearchResult[] = [];
    if (user?.role === 'ADMIN' || user?.role === 'HR') {
      mockResults.push(
        { id: '1', type: 'employee', title: 'John Doe', subtitle: 'Software Engineer', href: '/app/employees/1' },
        { id: '2', type: 'employee', title: 'Jane Smith', subtitle: 'HR Manager', href: '/app/employees/2' },
        { id: '3', type: 'department', title: 'Engineering', href: '/app/departments/1' },
        { id: '4', type: 'department', title: 'Human Resources', href: '/app/departments/2' }
      );
    }

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      mockResults.push(
        { id: '5', type: 'project', title: 'Website Redesign', href: '/app/projects/1' },
        { id: '6', type: 'project', title: 'Mobile App Development', href: '/app/projects/2' },
        { id: '7', type: 'task', title: 'Fix login bug', href: '/app/projects/1/tasks/1' }
      );
    }

    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filteredResults);
    setIsLoading(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query, user?.role]);

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
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="h-4 w-4" />;
      case 'department': return <Building2 className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'task': return <ClipboardList className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  // Mobile Version - Full Screen Overlay
  if (isMobileView || isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary transition-all active:scale-95"
          aria-label="Toggle search"
        >
          <Search className="h-5 w-5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="fixed inset-0 z-[100] bg-slate-950/80 p-4 md:p-6 flex flex-col"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                className="w-full max-w-2xl mx-auto flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden h-[80vh]"
              >
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <Search className="h-5 w-5 text-primary ml-2" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search personnel, units, projects..."
                    className="flex-1 h-12 border-0 focus-visible:ring-0 bg-transparent text-lg font-bold"
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-1">
                    {results.map((result, idx) => (
                      <motion.a
                        key={result.id}
                        href={result.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-all group"
                      >
                        <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          {renderIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{result.title}</div>
                          {result.subtitle && <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{result.subtitle}</div>}
                        </div>
                        <Command size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                      </motion.a>
                    ))}

                    {!isLoading && results.length === 0 && query && (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                          <Search size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">No results found for "{query}"</p>
                          <p className="text-xs text-slate-500">Try a different search term or unit.</p>
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="py-20 text-center">
                        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-white/10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enterprise Intelligent Search v2.0</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Version
  return (
    <div className="relative group/search" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary group-focus-within/search:scale-110 transition-all" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search employees, units, projects..."
          className={cn(
            "pl-11 h-11 transition-all duration-300 border-slate-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm",
            "focus:w-[480px] focus:shadow-2xl focus:border-primary/30"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 pointer-events-none opacity-40 group-focus-within/search:opacity-100 transition-opacity">
          <kbd className="h-5 px-1.5 rounded border border-white/20 bg-white/5 text-[10px] font-black text-white shadow-sm flex items-center gap-1">
            <Command size={8} /> /
          </kbd>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full glass-panel rounded-2xl shadow-2xl z-50 mt-3 max-h-[480px] overflow-hidden flex flex-col border-white/10"
          >
            <div className="p-4 border-b border-white/5 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Command Center</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {results.map((result, idx) => (
                  <motion.a
                    key={result.id}
                    href={result.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all group/result"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/result:text-primary group-hover/result:bg-primary/10 transition-all">
                      {renderIcon(result.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover/result:text-primary transition-colors truncate">{result.title}</div>
                      {result.subtitle && <div className="text-[10px] font-black text-slate-500 uppercase tracking-tight truncate">{result.subtitle}</div>}
                    </div>
                    <div className="opacity-0 group-hover/result:opacity-100 transition-opacity pr-2">
                      <div className="px-2 py-1 rounded bg-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">Execute</div>
                    </div>
                  </motion.a>
                ))}
                
                {isLoading && (
                  <div className="p-12 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                )}

                {!isLoading && results.length === 0 && query && (
                  <div className="p-12 text-center text-slate-500 font-medium text-sm">
                    No results found in enterprise registry.
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}