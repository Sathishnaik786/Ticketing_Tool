import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Megaphone,
  Pin,
  ThumbsUp,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Paperclip,
  Bookmark,
  ChevronDown,
  ChevronUp,
  CornerDownRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  pinned: boolean;
  priority: 'URGENT' | 'ALERT' | 'INFO';
  tags: string[];
  likes: number;
  comments: Comment[];
  attachments?: { name: string; size: string }[];
  read: boolean;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [likedIds, setLikedIds] = React.useState<string[]>([]);
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const mock: Announcement[] = [
      {
        id: 'ann-1',
        title: 'ETMS System Upgrade & Migration Scheduled',
        content: 'We will be migrating the ticketing engine databases to Supabase Postgres v16 next Sunday at 02:00 UTC. Expect up to 10 minutes of operational delay. Please ensure all critical tickets are resolved before the maintenance window starts.',
        author: 'Infrastructure Operations Lead',
        date: new Date(Date.now() - 3600000).toISOString(),
        pinned: true,
        priority: 'URGENT',
        tags: ['infrastructure', 'maintenance'],
        likes: 24,
        read: false,
        attachments: [
          { name: 'upgrade_schedule_runbook.pdf', size: '2.4 MB' },
          { name: 'backup_contingency_plan.docx', size: '1.1 MB' }
        ],
        comments: [
          { id: 'c-1', author: 'Jane HR Manager', content: 'Will active payroll tasks be impacted by the ticketing database upgrade?', date: new Date(Date.now() - 1800000).toISOString() },
          { id: 'c-2', author: 'Infrastructure Operations Lead', content: 'No, payroll uses separate databases and will remain 100% operational.', date: new Date(Date.now() - 900000).toISOString() }
        ]
      },
      {
        id: 'ann-2',
        title: 'Rollout of Self-Service Help Articles',
        content: 'We have updated the knowledge base categories with guides for credentials, hardware setups, and software access forms. Operators should refer requests to these articles to decrease average resolution times.',
        author: 'Service Desk Manager',
        date: new Date(Date.now() - 86400000).toISOString(),
        pinned: false,
        priority: 'INFO',
        tags: ['documentation', 'knowledge'],
        likes: 15,
        read: true,
        comments: []
      },
      {
        id: 'ann-3',
        title: 'Security Compliance Auditing Checklist',
        content: 'Please ensure all employee profile detail fields have correct MFA options configured. We will trigger security audits of system administrators this week.',
        author: 'InfoSec Compliance Lead',
        date: new Date(Date.now() - 172800000).toISOString(),
        pinned: false,
        priority: 'ALERT',
        tags: ['security', 'compliance'],
        likes: 18,
        read: false,
        comments: [
          { id: 'c-3', author: 'Marcus Team Manager', content: 'MFA setup guide link shared in General Slack channels.', date: new Date(Date.now() - 72000000).toISOString() }
        ]
      }
    ];
    setAnnouncements(mock);
  }, []);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter((item) => item !== id));
      setAnnouncements(
        announcements.map((ann) => (ann.id === id ? { ...ann, likes: ann.likes - 1 } : ann))
      );
    } else {
      setLikedIds([...likedIds, id]);
      setAnnouncements(
        announcements.map((ann) => (ann.id === id ? { ...ann, likes: ann.likes + 1 } : ann))
      );
      toast.success('Announcement liked');
    }
  };

  const handleMarkRead = (id: string) => {
    setAnnouncements(
      announcements.map((ann) => (ann.id === id ? { ...ann, read: true } : ann))
    );
  };

  const toggleComments = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddComment = (id: string) => {
    const text = newCommentText[id] || '';
    if (!text.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
      content: text,
      date: new Date().toISOString(),
    };

    setAnnouncements(
      announcements.map((ann) =>
        ann.id === id ? { ...ann, comments: [...ann.comments, newComment] } : ann
      )
    );
    setNewCommentText((prev) => ({ ...prev, [id]: '' }));
    toast.success('Comment added to bulletin');
  };

  const getPriorityBadge = (p: Announcement['priority']) => {
    switch (p) {
      case 'URGENT':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-200 text-[9px] font-black rounded-lg gap-1">
            <AlertTriangle className="h-3 w-3" />
            URGENT
          </Badge>
        );
      case 'ALERT':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-200 text-[9px] font-black rounded-lg gap-1">
            <AlertTriangle className="h-3 w-3" />
            ALERT
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-200 text-[9px] font-black rounded-lg gap-1">
            <Info className="h-3 w-3" />
            INFO
          </Badge>
        );
    }
  };

  // Categories list extracted from mock announcements
  const allCategories = React.useMemo(() => {
    const tags = new Set<string>();
    announcements.forEach((ann) => ann.tags.forEach((t) => tags.add(t)));
    return ['all', ...Array.from(tags)];
  }, [announcements]);

  const filteredAnnouncements = React.useMemo(() => {
    return announcements.filter((ann) => {
      const matchSearch =
        ann.title.toLowerCase().includes(search.toLowerCase()) ||
        ann.content.toLowerCase().includes(search.toLowerCase());
      const matchTag = activeCategory === 'all' || ann.tags.includes(activeCategory);
      return matchSearch && matchTag;
    });
  }, [announcements, search, activeCategory]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Broadcast Announcements Center"
        description="Global organizational broadcasts, infrastructure notices, and security alerts."
        breadcrumbs={[
          { label: 'Communications', href: '/app/communications' },
          { label: 'Announcements' },
        ]}
      />

      {/* Toolbar & Category Chips */}
      <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
            aria-label="Search announcements"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground border hover:bg-accent/40'
              }`}
            >
              {cat === 'all' ? 'All Tags' : `#${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-[2rem] border-border/60 bg-muted/5">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No announcements match search query</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => handleMarkRead(ann.id)}
              className={`rounded-3xl border bg-card p-6 space-y-4 relative transition-all duration-300 hover:shadow-md cursor-pointer ${
                ann.pinned ? 'border-primary/20 shadow-sm' : 'border-border/60'
              } ${!ann.read && 'ring-2 ring-primary/25 border-primary/25'}`}
            >
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(ann.priority)}
                  {!ann.read && (
                    <Badge className="bg-primary text-white text-[8px] font-black tracking-widest rounded-lg">
                      NEW
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {ann.pinned && (
                    <Badge className="bg-amber-500/10 text-amber-600 border border-amber-200 text-[9px] font-black rounded-lg gap-1">
                      <Pin className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Pinned
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title & Author Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="h-4.5 w-4.5 text-primary shrink-0" />
                  {ann.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Posted by <strong className="text-foreground">{ann.author}</strong> · {new Date(ann.date).toLocaleDateString()} at {new Date(ann.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Content */}
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>

              {/* Attachments Section */}
              {ann.attachments && ann.attachments.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/10">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    Attached Resources ({ann.attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ann.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border border-border/30 rounded-xl text-xs hover:bg-muted/50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Downloading file: ${file.name}`);
                        }}
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</span>
                        <span className="text-[9px] text-muted-foreground">({file.size})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1.5">
                {ann.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0.5 rounded-lg border-transparent">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-4 items-center text-xs text-muted-foreground pt-3 border-t border-border/20">
                <button
                  onClick={(e) => handleLike(ann.id, e)}
                  className={`flex items-center gap-1.5 hover:text-foreground text-xs font-semibold transition-colors ${
                    likedIds.includes(ann.id) ? 'text-primary' : ''
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {ann.likes} Likes
                </button>
                <button
                  onClick={(e) => toggleComments(ann.id, e)}
                  className="flex items-center gap-1.5 hover:text-foreground text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  {ann.comments.length} Comments
                  {expandedComments[ann.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              {/* Comments Collapsible Panel */}
              {expandedComments[ann.id] && (
                <div className="space-y-4 pt-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  {/* Comments feed */}
                  {ann.comments.length > 0 && (
                    <div className="space-y-3 pl-4 border-l border-border/30">
                      {ann.comments.map((comm) => (
                        <div key={comm.id} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                            <strong className="text-foreground">{comm.author}</strong>
                            <span>{relativeTime(comm.date)}</span>
                          </div>
                          <div className="flex gap-2 items-start">
                            <CornerDownRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/10 flex-1">
                              {comm.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment textarea */}
                  <div className="flex gap-2 items-start">
                    <Textarea
                      placeholder="Post a comment... Use @name to mention coworker."
                      value={newCommentText[ann.id] || ''}
                      onChange={(e) =>
                        setNewCommentText((prev) => ({ ...prev, [ann.id]: e.target.value }))
                      }
                      className="text-xs h-16 rounded-xl border-input/60 resize-none flex-1"
                      aria-label="New comment content"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(ann.id)}
                      className="bg-primary hover:bg-primary/95 text-white h-9 rounded-xl px-4"
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Relative date helper
function relativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'just now';
  }
}
