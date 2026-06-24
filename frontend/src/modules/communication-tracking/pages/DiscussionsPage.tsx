import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MessageSquare, Heart, Bookmark, Search, Plus, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Thread {
  id: string;
  title: string;
  snippet: string;
  category: string;
  author: string;
  date: string;
  replies: number;
  likes: number;
}

export default function DiscussionsPage() {
  const [search, setSearch] = React.useState('');
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [newTitle, setNewTitle] = React.useState('');
  const [newSnippet, setNewSnippet] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('General');

  React.useEffect(() => {
    // Initial mock threads
    setThreads([
      {
        id: 'th-1',
        title: 'Best practices for handling high severity IT incidents',
        snippet: 'How are teams managing communication during major SLA outages? Do you prefer Slack bridges or JSM conference tools?',
        category: 'Best Practice',
        author: 'John Miller',
        date: new Date(Date.now() - 7200000).toISOString(),
        replies: 5,
        likes: 18,
      },
      {
        id: 'th-2',
        title: 'Self-service article formatting tips',
        snippet: 'A few notes on formatting KB instructions to increase our ticket deflection rate.',
        category: 'Documentation',
        author: 'Alice Johnson',
        date: new Date(Date.now() - 172800000).toISOString(),
        replies: 2,
        likes: 11,
      },
    ]);
  }, []);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSnippet.trim()) return;

    const newThread: Thread = {
      id: `th-${Date.now()}`,
      title: newTitle,
      snippet: newSnippet,
      category: activeCategory,
      author: 'Service Agent (You)',
      date: new Date().toISOString(),
      replies: 0,
      likes: 0,
    };

    setThreads([newThread, ...threads]);
    setNewTitle('');
    setNewSnippet('');
    toast.success('Discussion thread created');
  };

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.snippet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Agent Discussions"
        description="Collaborative workspace for service desk agents to align, discuss runbooks, and ask questions."
        breadcrumbs={[
          { label: 'Communications', href: '/app/communications' },
          { label: 'Discussions' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Thread Stream */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussion threads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-input"
              aria-label="Search threads"
            />
          </div>

          <div className="space-y-4">
            {filtered.map((thread) => (
              <div
                key={thread.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all space-y-2"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge variant="secondary" className="text-[9px] mb-1">
                      {thread.category}
                    </Badge>
                    <h3 className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer">
                      {thread.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{thread.snippet}</p>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                  <span>
                    Started by {thread.author} · {new Date(thread.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {thread.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {thread.replies} replies
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start a new thread */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-1.5 border-b pb-2">
            <Plus className="h-4 w-4 text-primary" />
            Start Discussion Thread
          </h3>
          <form onSubmit={handleCreateThread} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Topic Title</label>
              <Input
                placeholder="What do you want to discuss?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-10 text-xs border-input"
                aria-label="Thread title"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-xs focus:outline-none"
                aria-label="Category select"
              >
                <option value="General">General</option>
                <option value="Best Practice">Best Practice</option>
                <option value="Documentation">Documentation</option>
                <option value="Troubleshooting">Troubleshooting</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Details</label>
              <textarea
                placeholder="Provide details or paste question..."
                value={newSnippet}
                onChange={(e) => setNewSnippet(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none"
                aria-label="Thread content"
              />
            </div>
            <Button type="submit" size="sm" className="w-full gap-1" disabled={!newTitle.trim() || !newSnippet.trim()}>
              <Send className="h-3 w-3" />
              Post Thread
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
