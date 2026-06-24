import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Reply as ReplyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiReactionBar } from './EmojiReactionBar';
import { CommentEditor } from './CommentEditor';
import { PinControl } from './PinControl';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserCheck } from 'lucide-react';

export interface EnhancedComment {
    id: string;
    from_user_id: string;
    comment: string;
    created_at: string;
    parentId?: string;
    replies?: EnhancedComment[];
    reactions: Record<string, string[]>;
    text: string;
    isEnhanced: boolean;
    isPinned?: boolean;
}

interface UserProfile {
    id: string;
    name: string;
    profile_image: string;
    position?: string;
}

interface CommentItemProps {
    comment: EnhancedComment;
    userProfile?: UserProfile;
    currentUserId: string;
    currentUserRole?: string;
    onReply: (parentId: string, text: string) => void;
    onReact: (commentId: string, emoji: string) => void;
    onPin?: (commentId: string) => void;
    isReply?: boolean;
    isPinned?: boolean;
    userCache: Record<string, UserProfile>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    currentUserId,
    currentUserRole,
    onReply,
    onReact,
    onPin,
    isReply = false,
    isPinned = false,
    userCache
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSeen, setIsSeen] = useState(() => {
        const seen = sessionStorage.getItem(`seen_${comment.id}`);
        return !!seen;
    });

    const itemRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isSeen) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsSeen(true);
                sessionStorage.setItem(`seen_${comment.id}`, 'true');
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        if (itemRef.current) observer.observe(itemRef.current);
        return () => observer.disconnect();
    }, [comment.id, isSeen]);

    const profile = userCache[comment.from_user_id] || {
        id: comment.from_user_id,
        name: `User ${comment.from_user_id.substring(0, 8)}`,
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.from_user_id}`,
        position: 'Team Member',
        role: 'EMPLOYEE'
    };

    // Helper to highlight mentions
    const renderContent = (text: string) => {
        if (!text) return null;

        // Dynamic regex based on cached names to be precise
        const userNames = Object.values(userCache).map(u => u.name).filter(Boolean);
        if (userNames.length === 0) return text;

        const mentionPattern = `(@(?:${userNames.join('|')}))`;
        const regex = new RegExp(mentionPattern, 'g');
        const parts = text.split(regex);

        return parts.map((part, i) => {
            if (part && part.startsWith('@')) {
                const name = part.substring(1);
                return <span key={i} className="text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded-md text-[0.9em] mx-0.5 shadow-sm">@{name}</span>;
            }
            return part;
        });
    };

    const isAdminOrManager = (role: string) => role === 'ADMIN' || role === 'MANAGER' || role === 'HR';
    const profileRole = (profile as any).role || 'EMPLOYEE';
    const isSpecialUser = isAdminOrManager(profileRole);

    const handleReplySubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        try {
            await onReply(comment.id, replyText);
            setReplyText('');
            setIsReplying(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            ref={itemRef}
            className={cn(
                "group/comment animate-in fade-in slide-in-from-left-2 duration-300",
                isReply ? "ml-12 mt-3" : "mt-4"
            )}
        >
            <div className={cn(
                "flex gap-3 p-4 rounded-2xl border transition-all relative overflow-hidden",
                isReply ? "bg-background/20 border-border/20 blur-none" : "bg-secondary/10 border-border/30 hover:border-primary/20",
                isPinned && "border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20",
                isSpecialUser && !isPinned && "border-indigo-500/20 bg-indigo-500/[0.03]"
            )}>
                {/* Visual Connector for replies */}
                {isReply && (
                    <div className="absolute left-[-24px] top-[-16px] bottom-1/2 w-4 border-l-2 border-b-2 border-border/20 rounded-bl-xl" />
                )}

                {/* Pin Indicator Overlay */}
                {isPinned && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-white rounded-bl-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="h-2.5 w-2.5" /> Pinned Point
                    </div>
                )}

                <Avatar className="h-8 w-8 ring-2 ring-background shrink-0">
                    <AvatarImage src={profile.profile_image} />
                    <AvatarFallback className="text-[10px] font-bold">
                        {profile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-tight truncate max-w-[120px]">
                                    {profile.name}
                                </span>
                                {profileRole === 'ADMIN' && (
                                    <Badge variant="outline" className="h-4 px-1 text-[7px] font-black bg-rose-500/10 text-rose-600 border-none uppercase tracking-tighter">Admin</Badge>
                                )}
                                {profileRole === 'MANAGER' && (
                                    <Badge variant="outline" className="h-4 px-1 text-[7px] font-black bg-indigo-500/10 text-indigo-600 border-none uppercase tracking-tighter">Manager</Badge>
                                )}
                                {isSeen && (
                                    <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-1 ml-auto">
                                        <UserCheck className="h-2.5 w-2.5" /> Seen by you
                                    </span>
                                )}
                            </div>
                            {profile.position && !isReply && (
                                <span className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    {profile.position}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <PinControl
                                isPinned={isPinned}
                                onPin={() => onPin?.(comment.id)}
                                canPin={isAdminOrManager(currentUserRole || '')}
                            />
                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-foreground/80 leading-snug pt-1">
                        {renderContent(comment.text)}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                        <EmojiReactionBar
                            reactions={comment.reactions}
                            onReact={(emoji) => onReact(comment.id, emoji)}
                            currentUserId={currentUserId}
                        />

                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplying(!isReplying)}
                                className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg ml-auto"
                            >
                                <ReplyIcon className="h-3 w-3 mr-1.5" />
                                Reply
                            </Button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                            <CommentEditor
                                value={replyText}
                                onChange={setReplyText}
                                onSubmit={handleReplySubmit}
                                placeholder={`Reply to ${profile.name.split(' ')[0]}...`}
                                isSubmitting={isSubmitting}
                                userCache={userCache}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Render nested replies if any */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
                <div className="space-y-3">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            onReply={onReply}
                            onReact={onReact}
                            onPin={onPin}
                            isReply
                            userCache={userCache}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
