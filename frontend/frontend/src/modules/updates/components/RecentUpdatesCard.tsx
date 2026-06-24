import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecentUpdates } from '../hooks/useUpdates';

interface RecentUpdate {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    timestamp: string;
    isRead: boolean;
}

export const RecentUpdatesCard: React.FC = () => {
    const navigate = useNavigate();
    const { data: allUpdates, isLoading: loading } = useRecentUpdates(6);
    const [updates, setUpdates] = useState<RecentUpdate[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (allUpdates) {
            setUpdates(allUpdates);
            setUnreadCount(allUpdates.filter(u => !u.isRead).length);
        }
    }, [allUpdates]);

    const handleUpdateClick = (update: RecentUpdate) => {
        sessionStorage.setItem(`read_update_${update.id}`, 'true');
        setUpdates(prev => prev.map(u => u.id === update.id ? { ...u, isRead: true } : u));
        setUnreadCount(prev => Math.max(0, prev - 1));

        navigate(`/app/updates/employee/${update.userId}?updateId=${update.id}&type=${update.type}`);
    };

    if (loading && updates.length === 0) return null;

    return (
        <Card className="border-primary/10 bg-card/30 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-primary/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl relative">
                        <Zap className="h-4 w-4 text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Activity</CardTitle>
                        <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-[0.2em]">Latest across the team</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className="space-y-2">
                    {updates.map((update) => (
                        <div
                            key={`${update.type}-${update.id}`}
                            onClick={() => handleUpdateClick(update)}
                            className={cn(
                                "group p-3 rounded-2xl transition-all duration-300 cursor-pointer flex items-center gap-4 relative",
                                update.isRead
                                    ? "hover:bg-secondary/40"
                                    : "bg-primary/[0.03] border-l-4 border-primary hover:bg-primary/[0.07]"
                            )}
                        >
                            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background border border-border/50">
                                <AvatarImage src={update.userAvatar} />
                                <AvatarFallback className="text-[10px] uppercase font-black">{update.userName.substring(0, 2)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">
                                    <span className="text-primary">{update.userName}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-bold"> shared a </span>
                                    <span className={cn(
                                        "font-black uppercase tracking-tighter text-[10px]",
                                        update.type === 'DAILY' ? "text-blue-500" : update.type === 'WEEKLY' ? "text-purple-500" : "text-amber-500"
                                    )}>
                                        {update.type} Standup
                                    </span>
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">
                                    {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                                </p>
                            </div>

                            <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                        </div>
                    ))}

                    {updates.length === 0 && !loading && (
                        <div className="py-8 text-center opacity-20">
                            <Sparkles className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs font-black uppercase tracking-widest">No recent pulses</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
