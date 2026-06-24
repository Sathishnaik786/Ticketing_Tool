import React from 'react';
import { format } from 'date-fns';
import {
    History,
    AtSign,
    Pin,
    MessageSquare,
    CornerDownRight,
    ShieldCheck,
    User,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AuditEvent {
    id: string;
    type: 'COMMENT' | 'REPLY' | 'PIN' | 'UNPIN' | 'MENTION';
    actorName: string;
    actorRole: string;
    targetName?: string;
    content?: string;
    timestamp: string;
}

interface AuditLogPanelProps {
    events: AuditEvent[];
    className?: string;
}

export const AuditLogPanel: React.FC<AuditLogPanelProps> = ({ events, className }) => {
    if (events.length === 0) return null;

    return (
        <div className={cn("bg-card/30 backdrop-blur-xl border border-border/20 rounded-[2rem] overflow-hidden flex flex-col", className)}>
            <div className="p-6 border-b border-border/10 flex items-center justify-between bg-secondary/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <History className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Discussion Audit Trail</h3>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Compliance & Governance Activity</span>
                    </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" /> READ-ONLY ACCESS
                    </span>
                </div>
            </div>

            <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-6">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-8 group">
                            {/* Timeline line */}
                            {index !== events.length - 1 && (
                                <div className="absolute left-3 top-6 bottom-[-24px] w-[1px] bg-gradient-to-b from-border/50 to-transparent" />
                            )}

                            {/* Event Icon */}
                            <div className={cn(
                                "absolute left-0 top-1 p-1.5 rounded-lg border shadow-sm transition-transform group-hover:scale-110",
                                event.type === 'COMMENT' && "bg-blue-500/10 border-blue-500/20 text-blue-600",
                                event.type === 'REPLY' && "bg-purple-500/10 border-purple-500/20 text-purple-600",
                                (event.type === 'PIN' || event.type === 'UNPIN') && "bg-amber-500/10 border-amber-500/20 text-amber-600",
                                event.type === 'MENTION' && "bg-rose-500/10 border-rose-500/20 text-rose-600"
                            )}>
                                {event.type === 'COMMENT' && <MessageSquare className="h-3 w-3" />}
                                {event.type === 'REPLY' && <CornerDownRight className="h-3 w-3" />}
                                {(event.type === 'PIN' || event.type === 'UNPIN') && <Pin className="h-3 w-3" />}
                                event.type === 'MENTION' && <AtSign className="h-3 w-3" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-foreground/90">{event.actorName}</span>
                                        <span className={cn(
                                            "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                            event.actorRole === 'ADMIN' ? "bg-rose-500/10 text-rose-600" :
                                                event.actorRole === 'MANAGER' ? "bg-indigo-500/10 text-indigo-600" : "bg-secondary text-muted-foreground"
                                        )}>
                                            {event.actorRole}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-medium text-muted-foreground/40 tabular-nums">
                                        {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground leading-snug">
                                    {event.type === 'COMMENT' && "Shared a top-level perspective"}
                                    {event.type === 'REPLY' && `Responded to ${event.targetName || 'a peer'}`}
                                    {event.type === 'PIN' && "Elevated this discussion point"}
                                    {event.type === 'UNPIN' && "Removed pinned status"}
                                    {event.type === 'MENTION' && `Synthesized contact for ${event.targetName}`}
                                </p>

                                {event.content && (
                                    <div className="mt-2 p-3 bg-secondary/5 rounded-xl border border-border/10 border-dashed">
                                        <p className="text-[11px] text-foreground/60 italic line-clamp-2">"{event.content}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
