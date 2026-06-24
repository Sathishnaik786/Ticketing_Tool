import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { EnhancedComment, CommentItem } from './CommentItem';
import { Send, MessageSquare, Loader2, History } from 'lucide-react';
import { toast } from 'sonner';
import { employeesApi } from '@/services/api';
import { cn } from '@/lib/utils';
import { CommentEditor } from './CommentEditor';
import { AuditLogPanel, AuditEvent } from './AuditLogPanel';

interface DiscussionBoardProps {
    updateId: string;
    initialFeedback?: any[];
    currentUserId: string;
    currentUserRole?: string;
    onAddFeedback: (comment: string) => Promise<any>;
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({
    updateId,
    initialFeedback = [],
    currentUserId,
    currentUserRole,
    onAddFeedback
}) => {
    const [comments, setComments] = useState<EnhancedComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userCache, setUserCache] = useState<Record<string, any>>({});
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const channelRef = useRef<any>(null);

    // Initial parsing of feedback
    const parseComment = (raw: any): EnhancedComment => {
        try {
            if (raw.comment.startsWith('{')) {
                const data = JSON.parse(raw.comment);
                return {
                    id: raw.id,
                    from_user_id: raw.from_user_id,
                    comment: raw.comment,
                    created_at: raw.created_at,
                    parentId: data.pid,
                    reactions: data.rx || {},
                    text: data.txt || data.text || raw.comment,
                    isEnhanced: true
                };
            }
        } catch (e) { }

        return {
            id: raw.id,
            from_user_id: raw.from_user_id,
            comment: raw.comment,
            created_at: raw.created_at,
            reactions: {},
            text: raw.comment,
            isEnhanced: false
        };
    };

    // Initialize comments and synthesize reactions/replies
    useEffect(() => {
        const parsed = initialFeedback.map(parseComment);
        setComments(parsed);
    }, [initialFeedback]);

    // Group comments into a tree
    const organizedComments = useMemo(() => {
        const topLevel: EnhancedComment[] = [];
        const replyMap: Record<string, EnhancedComment[]> = {};
        const reactionMap: Record<string, Record<string, string[]>> = {};
        const pinMap: Record<string, { pinned: boolean, timestamp: string }> = {};

        // Pass 1: Categorize and parse synthetic events
        comments.forEach(c => {
            try {
                if (c.comment.startsWith('{')) {
                    const data = JSON.parse(c.comment);

                    // Handle Reactions
                    if (data.type === 'reaction' && data.pid && data.emoji) {
                        if (!reactionMap[data.pid]) reactionMap[data.pid] = {};
                        if (!reactionMap[data.pid][data.emoji]) reactionMap[data.pid][data.emoji] = [];
                        if (!reactionMap[data.pid][data.emoji].includes(c.from_user_id)) {
                            reactionMap[data.pid][data.emoji].push(c.from_user_id);
                        }
                        return;
                    }

                    // Handle Pin/Unpin
                    if ((data.type === 'pin' || data.type === 'unpin') && data.pid) {
                        const isPinned = data.type === 'pin';
                        if (!pinMap[data.pid] || new Date(c.created_at) > new Date(pinMap[data.pid].timestamp)) {
                            pinMap[data.pid] = { pinned: isPinned, timestamp: c.created_at };
                        }
                        return;
                    }
                }
            } catch (e) { }

            if (c.parentId) {
                if (!replyMap[c.parentId]) replyMap[c.parentId] = [];
                replyMap[c.parentId].push(c);
            } else {
                topLevel.push({ ...c });
            }
        });

        // Pass 2: Attach replies, reactions, and pins
        const findAndAttach = (list: EnhancedComment[]) => {
            list.forEach(c => {
                c.replies = replyMap[c.id] || [];
                c.isPinned = pinMap[c.id]?.pinned || false;

                const directReactions = reactionMap[c.id] || {};
                const combined: Record<string, string[]> = { ...(c.reactions || {}) };
                Object.entries(directReactions).forEach(([emoji, users]) => {
                    if (!combined[emoji]) combined[emoji] = [];
                    users.forEach(u => {
                        if (!combined[emoji].includes(u)) combined[emoji].push(u);
                    });
                });
                c.reactions = combined;

                if (c.replies.length > 0) findAndAttach(c.replies);
            });
        };

        findAndAttach(topLevel);

        // Sort: Pinned items bubble to top, then by date
        topLevel.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        return topLevel;
    }, [comments]);

    const auditEvents = useMemo(() => {
        const events: AuditEvent[] = [];
        comments.forEach(c => {
            const profile = userCache[c.from_user_id] || { name: 'Unknown User', role: 'EMPLOYEE' };

            try {
                if (c.comment.startsWith('{')) {
                    const data = JSON.parse(c.comment);
                    if (data.type === 'pin' || data.type === 'unpin') {
                        events.push({
                            id: c.id,
                            type: data.type === 'pin' ? 'PIN' : 'UNPIN',
                            actorName: profile.name,
                            actorRole: profile.role,
                            timestamp: c.created_at
                        });
                        return;
                    }
                    if (data.type === 'enhanced') {
                        if (data.pid) {
                            events.push({
                                id: c.id,
                                type: 'REPLY',
                                actorName: profile.name,
                                actorRole: profile.role,
                                content: data.txt,
                                timestamp: c.created_at
                            });
                        } else {
                            events.push({
                                id: c.id,
                                type: 'COMMENT',
                                actorName: profile.name,
                                actorRole: profile.role,
                                content: data.txt,
                                timestamp: c.created_at
                            });
                        }
                        return;
                    }
                }
            } catch (e) { }

            if (!c.parentId) {
                events.push({
                    id: c.id,
                    type: 'COMMENT',
                    actorName: profile.name,
                    actorRole: profile.role,
                    content: c.text,
                    timestamp: c.created_at
                });
            }
        });

        return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [comments, userCache]);

    // Fetch user profiles for identity enrichment
    useEffect(() => {
        const fetchProfiles = async () => {
            setIsLoadingProfiles(true);
            try {
                const response = await employeesApi.getAll({ limit: 1000 });
                const cache: Record<string, any> = {};
                response.data.forEach((emp: any) => {
                    cache[emp.user_id] = {
                        id: emp.user_id,
                        name: `${emp.first_name} ${emp.last_name}`,
                        profile_image: emp.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.user_id}`,
                        position: emp.position,
                        role: emp.role
                    };
                });
                setUserCache(cache);
            } catch (error) {
                console.error('Error fetching profiles:', error);
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        fetchProfiles();
    }, []);

    // Real-time subscription
    useEffect(() => {
        if (!updateId || !supabase) return;

        channelRef.current = supabase
            .channel(`updates-feedback-${updateId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'employee_update_feedback',
                    filter: `update_id=eq.${updateId}`
                },
                (payload) => {
                    const newFeedback = payload.new;
                    setComments(prev => {
                        // Check for duplicates
                        if (prev.some(c => c.id === newFeedback.id)) return prev;
                        return [...prev, parseComment(newFeedback)];
                    });
                }
            )
            .subscribe();

        return () => {
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [updateId]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Check for mentions in text and extract IDs
            const mentions: string[] = [];
            const mentionMatches = newComment.match(/@[\w\s]+/g);
            if (mentionMatches) {
                mentionMatches.forEach(m => {
                    const name = m.substring(1).trim();
                    const user = Object.values(userCache).find((u: any) => u.name === name);
                    if (user) mentions.push(user.id);
                });
            }

            // Enhanced format for comments
            const payload = JSON.stringify({
                type: 'enhanced',
                txt: newComment.trim(),
                mn: mentions,
                rx: {}
            });
            await onAddFeedback(payload);
            setNewComment('');
            toast.success('Comment posted');
        } catch (error: any) {
            toast.error('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (parentId: string, text: string) => {
        const payload = JSON.stringify({
            type: 'enhanced',
            pid: parentId,
            txt: text.trim(),
            rx: {}
        });
        await onAddFeedback(payload);
    };

    const handlePin = async (commentId: string) => {
        const isCurrentlyPinned = organizedComments.find(c => c.id === commentId)?.isPinned;
        const payload = JSON.stringify({
            type: isCurrentlyPinned ? 'unpin' : 'pin',
            pid: commentId
        });
        await onAddFeedback(payload);
        toast.info(isCurrentlyPinned ? 'Unpinned' : 'Pinned to top');
    };

    const handleReact = async (commentId: string, emoji: string) => {
        const alreadyReacted = comments.some(c => {
            try {
                const data = JSON.parse(c.comment);
                return data.type === 'reaction' && data.pid === commentId && data.emoji === emoji && c.from_user_id === currentUserId;
            } catch (e) { return false; }
        });

        if (alreadyReacted) {
            toast.info('Already reacted with this emoji');
            return;
        }

        const payload = JSON.stringify({
            type: 'reaction',
            pid: commentId,
            emoji: emoji
        });
        await onAddFeedback(payload);
    };

    return (
        <div className="space-y-6 mt-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <MessageSquare className="h-3 w-3 text-primary" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary/80">Discussion Thread</h3>
                </div>
                <div className="flex items-center gap-3">
                    {(currentUserRole === 'HR' || currentUserRole === 'ADMIN') && (
                        <button
                            onClick={() => setShowAuditLog(!showAuditLog)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                showAuditLog ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            )}
                        >
                            <History className="h-3 w-3" />
                            {showAuditLog ? 'Close Audit Log' : 'View Audit Log'}
                        </button>
                    )}
                    {isLoadingProfiles && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Syncing Identities...
                        </div>
                    )}
                </div>
            </div>

            {showAuditLog && (currentUserRole === 'HR' || currentUserRole === 'ADMIN') && (
                <AuditLogPanel events={auditEvents} className="animate-in slide-in-from-top-4 duration-500" />
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10">
                {organizedComments.length === 0 ? (
                    <div className="text-center py-10 bg-secondary/5 rounded-3xl border border-dashed border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest opacity-40">No activity yet</p>
                    </div>
                ) : (
                    organizedComments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            onReply={handleReply}
                            onReact={handleReact}
                            onPin={handlePin}
                            isPinned={comment.isPinned}
                            userCache={userCache}
                        />
                    ))
                )}
            </div>

            <div className="flex gap-2 relative group items-end pb-2">
                <CommentEditor
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleSend}
                    isSubmitting={isSubmitting}
                    userCache={userCache}
                />
            </div>
        </div>
    );
};
