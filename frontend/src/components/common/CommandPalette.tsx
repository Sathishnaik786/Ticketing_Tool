import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  ChevronRight,
  History,
  Star,
  Navigation,
  LayoutDashboard,
  X,
  FileText,
  User,
  Users,
  Megaphone,
  BookOpen,
  Plus,
  Bell,
  Eye
} from 'lucide-react';
import { useCommand } from '@/contexts/CommandContext';
import { useNavigate } from 'react-router-dom';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useAuth } from '@/contexts/AuthContext';
import { buildCommandRegistry, filterCommandRegistry } from '@/config/navigation.utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { departmentsApi, employeesApi } from '@/services/api';
import { useTickets } from '@/modules/ticketing/hooks/useTicketing';
import { useKnowledgeArticles } from '@/modules/knowledge-management/hooks/useKnowledgeManagement';
import { toast } from 'sonner';

export function CommandPalette() {
  const { isOpen, setIsOpen, query, setQuery, commands } = useCommand();
  const { history } = useNavigationHistory();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Queries to support search resources
  const { data: ticketsResponse } = useTickets();
  const tickets = ticketsResponse?.data || [];

  const { data: articles = [] } = useKnowledgeArticles();

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 100 }),
    queryFn: () => employeesApi.getAll({ limit: 100 }),
  });
  const employees = employeesResponse?.data || [];

  // Announcements mock list (to prevent undefined checks)
  const announcements = useMemo(() => [
    { id: 'ann-1', title: 'Phase 4 operational workspace rollout', category: 'Announcements', href: '/app/communications/announcements' },
    { id: 'ann-2', title: 'Scheduled system backup window - Saturday', category: 'Announcements', href: '/app/communications/announcements' },
  ], []);

  // Standard static navigation registry commands
  const registryCommands = useMemo(() => {
    return filterCommandRegistry(buildCommandRegistry(), user, query).map((item) => ({
      id: item.id,
      title: item.title,
      category: 'Navigation' as const,
      icon: item.icon || Navigation,
      action: () => navigate(item.href),
    }));
  }, [user, query, navigate]);

  // Historic pages visited
  const historyCommands = useMemo(() =>
    history.map(item => ({
      id: `history-${item.path}`,
      title: item.title,
      category: 'Recent Activity' as const,
      icon: History,
      action: () => navigate(item.path)
    })), [history, navigate]
  );

  // Core administrative operator productivity commands
  const systemCommands = useMemo(() => [
    {
      id: 'cmd-create-ticket',
      title: 'Create Ticket',
      category: 'Actions' as const,
      icon: Plus,
      action: () => navigate('/app/tickets/new')
    },
    {
      id: 'cmd-my-queue',
      title: 'Go to My Queue',
      category: 'Actions' as const,
      icon: Eye,
      action: () => navigate('/app/my-queue')
    },
    {
      id: 'cmd-open-notifications',
      title: 'Open Notification Center',
      category: 'Actions' as const,
      icon: Bell,
      action: () => navigate('/app/notifications')
    },
    {
      id: 'cmd-toggle-theme',
      title: 'Toggle Theme (Light / Dark Mode)',
      category: 'Actions' as const,
      icon: LayoutDashboard,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        toast.success(`Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      }
    },
    {
      id: 'cmd-open-profile',
      title: 'Open Profile Settings',
      category: 'Actions' as const,
      icon: User,
      action: () => navigate('/app/profile')
    }
  ], [navigate, theme, setTheme]);

  // Merge search-specific dynamic items if query is typed
  const searchMatchedItems = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: any[] = [];

    // Filter tickets
    tickets.filter((t: any) =>
      t.title.toLowerCase().includes(q) ||
      (t.ticket_number && t.ticket_number.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    ).slice(0, 5).forEach((t: any) => {
      results.push({
        id: `ticket-${t.id}`,
        title: `${t.ticket_number || 'TKT'}: ${t.title}`,
        description: `Status: ${t.status} • Priority: ${t.priority}`,
        category: 'Tickets' as const,
        icon: FileText,
        action: () => navigate(`/app/tickets/${t.id}`)
      });
    });

    // Filter articles
    articles.filter((art: any) =>
      art.title.toLowerCase().includes(q) ||
      (art.summary && art.summary.toLowerCase().includes(q))
    ).slice(0, 4).forEach((art: any) => {
      results.push({
        id: `article-${art.id}`,
        title: art.title,
        description: 'Knowledge Base Article',
        category: 'Knowledge Base' as const,
        icon: BookOpen,
        action: () => navigate(`/app/articles/${art.id}`)
      });
    });

    // Filter people (employees)
    employees.filter((emp: any) => {
      const first = emp.first_name || emp.firstName || '';
      const last = emp.last_name || emp.lastName || '';
      const fullName = `${first} ${last}`.trim() || emp.email || 'Employee';
      return fullName.toLowerCase().includes(q) || (emp.email && emp.email.toLowerCase().includes(q));
    }).slice(0, 4).forEach((emp: any) => {
      const first = emp.first_name || emp.firstName || '';
      const last = emp.last_name || emp.lastName || '';
      const fullName = `${first} ${last}`.trim() || emp.email || 'Employee';
      results.push({
        id: `person-${emp.id}`,
        title: fullName,
        description: `${emp.position || 'Employee'} • ${emp.email || 'No Email'}`,
        category: 'People' as const,
        icon: User,
        action: () => navigate(`/app/employees?search=${first || emp.email || ''}`)
      });
    });

    // Filter departments
    departments.filter((dept: any) =>
      dept.name.toLowerCase().includes(q)
    ).slice(0, 3).forEach((dept: any) => {
      results.push({
        id: `dept-${dept.id}`,
        title: `${dept.name} Department`,
        description: `Code: ${dept.code || 'DEPT'}`,
        category: 'Departments' as const,
        icon: Users,
        action: () => navigate('/app/departments')
      });
    });

    // Filter announcements
    announcements.filter((ann) =>
      ann.title.toLowerCase().includes(q)
    ).forEach((ann) => {
      results.push({
        id: ann.id,
        title: ann.title,
        description: 'Announcement Bulletin',
        category: 'Announcements' as const,
        icon: Megaphone,
        action: () => navigate(ann.href)
      });
    });

    return results;
  }, [query, tickets, articles, employees, departments, announcements, navigate]);

  // Combine static registries, actions list, and searches
  const filteredCommands = useMemo(() => {
    if (query.trim()) {
      // Prioritize actions & matching search results when query exists
      const matchCommands = systemCommands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase())
      );
      const matchNav = registryCommands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase())
      );
      return [...matchCommands, ...searchMatchedItems, ...matchNav];
    }
    return [...systemCommands, ...registryCommands, ...historyCommands];
  }, [query, registryCommands, historyCommands, systemCommands, searchMatchedItems]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, setQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, setIsOpen]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof filteredCommands> = {};
    filteredCommands.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="w-full max-w-2xl bg-white dark:bg-[#0B1020] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-10"
          >
            {/* Search Input Area */}
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-muted/10">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Command size={22} />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search tickets, articles, personnel, actions... (Ctrl+K)"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-xl font-bold placeholder:text-slate-500 text-slate-900 dark:text-white"
              />
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ESC</div>
              </div>
            </div>

            {/* Results Area */}
            <ScrollArea className="flex-1 max-h-[60vh]">
              <div className="p-4 space-y-6">
                {filteredCommands.length > 0 ? (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <div className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Navigation size={10} />
                        {category}
                      </div>
                      <div className="space-y-1">
                        {items.map((command) => {
                          const globalIndex = filteredCommands.indexOf(command);
                          const isSelected = selectedIndex === globalIndex;
                          const Icon = command.icon || Star;

                          return (
                            <button
                              key={command.id}
                              onClick={() => {
                                command.action();
                                setIsOpen(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
                                isSelected ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "hover:bg-white/5 text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-white/5 group-hover:bg-primary/10 group-hover:text-primary"
                              )}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className={cn("font-bold text-sm", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>
                                  {command.title}
                                </p>
                                {command.description && (
                                  <p className={cn("text-[11px] font-medium mt-0.5", isSelected ? "text-white/70" : "text-slate-500")}>
                                    {command.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight size={16} className={cn("transition-transform", isSelected ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                      <Search size={40} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Commands Found</p>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">We couldn't find any resources or commands matching "{query}". Try checking details.</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 flex items-center">↓↑</div>
                  Navigate
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">ENTER</div>
                  Execute
                </div>
              </div>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">ETMS Productivity OS v2.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CommandPalette;
