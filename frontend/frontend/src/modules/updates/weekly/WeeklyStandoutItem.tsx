import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { addWeeklyFeedback, deleteWeeklyUpdate } from './weeklyUpdates.api';
import { toast } from 'sonner';
import { MessageSquare, Send, Calendar, Star, Trophy, Target, Ban, ArrowRight, Sparkles, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import UpdateUserHeader from '../components/UpdateUserHeader';
import { cn } from '@/lib/utils';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import WeeklyStandoutForm from './WeeklyStandoutForm';
import { DiscussionBoard } from '../components/DiscussionBoard';

interface Feedback {
    id: string;
    from_user_id: string;
    comment: string;
    created_at: string;
}

interface WeeklyStandoutItemProps {
    update: {
        id: string;
        user_id: string;
        title: string;
        content: {
            achievements: string;
            plannedVsDone: string;
            challenges?: string;
            nextWeekPlan?: string;
            selfRating: number;
            week_start?: string;
            week_end?: string;
        };
        created_at: string;
        feedback?: Feedback[];
        user_profile?: {
            id: string;
            name: string;
            role: string;
            position: string;
            profile_image: string;
        };
    };
    currentUser: any;
    onFeedbackAdded?: () => void;
}

const WeeklyStandoutItem: React.FC<WeeklyStandoutItemProps> = ({ update, currentUser, onFeedbackAdded }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteWeeklyUpdate(update.id);
            toast.success('Update deleted successfully');
            if (onFeedbackAdded) onFeedbackAdded();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete update');
        }
    };



    const isOwnUpdate = update.user_id === currentUser?.id;

    const weekRange = (update.content as any).week_start && (update.content as any).week_end
        ? `${format(parseISO((update.content as any).week_start as string), 'dd-MM-yyyy')} → ${format(parseISO((update.content as any).week_end as string), 'dd-MM-yyyy')}`
        : null;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={cn(
                    "h-3 w-3 transition-all duration-300",
                    i < rating ? "text-amber-500 fill-amber-500 group-hover:scale-110" : "text-muted-foreground/20"
                )}
            />
        ));
    };

    const displayProfile = update.user_profile || {
        id: update.user_id,
        name: `User ${update.user_id.substring(0, 8)}`,
        role: 'EMPLOYEE',
        position: 'Team Member',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.user_id}`
    };

    if (isEditing) {
        return (
            <div className="mb-10 animate-in fade-in zoom-in-95 duration-300">
                <WeeklyStandoutForm
                    initialData={update as any}
                    onSuccess={() => { setIsEditing(false); if (onFeedbackAdded) onFeedbackAdded(); }}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <Card className="mb-10 overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-premium transition-all hover:shadow-2xl hover:border-primary/20 group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-primary/40" />
            <CardHeader className="flex flex-row items-center gap-4 pb-4 bg-secondary/5 border-b border-border/10">
                <div className="flex-1 flex items-center justify-between">
                    <UpdateUserHeader
                        userProfile={displayProfile}
                        createdAt={update.created_at}
                        updateTypeLabel="Weekly Stand-out"
                        isOwner={isOwnUpdate}
                    />

                    {weekRange && (
                        <div className="mt-3 ml-[64px] flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[9px] tracking-widest px-2.5 py-1 uppercase flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {weekRange}
                            </Badge>
                        </div>
                    )}

                    {isOwnUpdate && (
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background/80 rounded-full">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-primary/10 shadow-2xl">
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 p-3 text-sm font-medium rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Update Reflection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteAlert(true)}
                                        className="flex items-center gap-2 p-3 text-sm font-medium rounded-xl cursor-pointer text-rose-600 focus:bg-rose-500/5 focus:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove Update
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                                <AlertDialogContent className="rounded-[2.5rem] border-primary/10 shadow-2xl max-w-md">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-bold tracking-tight">Remove Weekly Reflection?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                            This will permanently delete your weekly standout. Historical performance data linked to this report will be lost.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2 mt-4">
                                        <AlertDialogCancel className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 border-primary/10">Dismiss</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-rose-600 hover:bg-rose-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-rose-500/20"
                                        >
                                            Confirm Deletion
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex gap-0.5 bg-background/50 p-1 rounded-lg border border-border/50">
                        {renderStars(update.content.selfRating)}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Self Rating</span>
                </div>
            </CardHeader>

            <CardContent className="pt-8 pb-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-primary/5 p-5 rounded-2xl border border-primary/10 transition-colors group-hover:border-primary/20 min-h-[140px]">
                        <div className="flex items-center gap-2 text-primary">
                            <Trophy className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em]">Key Achievements</h4>
                        </div>
                        <RichTextDisplay content={update.content.achievements} className="text-foreground/90 font-medium" />
                    </div>

                    <div className="space-y-3 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 transition-colors group-hover:border-emerald-500/20 min-h-[140px]">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                            <Target className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em]">Momentum (Done)</h4>
                        </div>
                        <RichTextDisplay content={update.content.plannedVsDone} className="text-foreground/90 font-medium" />
                    </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border/10">
                    {update.content.challenges ? (
                        <div className="space-y-3 px-2">
                            <div className="flex items-center gap-2 text-rose-500">
                                <Ban className="h-4 w-4" />
                                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em]">Friction & Obstacles</h4>
                            </div>
                            <div className="pl-6 border-l-2 border-rose-200 dark:border-rose-900/30">
                                <RichTextDisplay content={update.content.challenges} className="text-rose-700 dark:text-rose-400 font-semibold" />
                            </div>
                        </div>
                    ) : (
                        <div className="px-2">
                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 text-[10px] font-medium uppercase tracking-widest py-1 px-3">
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                Perfect Momentum • No Challenges Reported
                            </Badge>
                        </div>
                    )}

                    {update.content.nextWeekPlan && (
                        <div className="space-y-3 px-2">
                            <div className="flex items-center gap-2 text-indigo-500">
                                <ArrowRight className="h-4 w-4" />
                                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em]">Strategy for Next Week</h4>
                            </div>
                            <div className="pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/40">
                                <RichTextDisplay content={update.content.nextWeekPlan} className="text-foreground/80 font-medium italic" />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <Separator className="opacity-30" />

            <CardFooter className="flex flex-col items-stretch p-6 bg-background/30">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "text-[10px] font-medium uppercase tracking-widest h-10 gap-2 transition-all rounded-xl",
                            update.feedback?.length ? "text-indigo-600 bg-indigo-500/5 px-5" : "text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/5"
                        )}
                        onClick={() => setShowFeedback(!showFeedback)}
                    >
                        <MessageCircle className={cn("h-4 w-4", update.feedback?.length && "fill-indigo-500/10")} />
                        {update.feedback?.length || 0} Peer Reviews
                    </Button>
                </div>

                {showFeedback && (
                    <DiscussionBoard
                        updateId={update.id}
                        initialFeedback={update.feedback || []}
                        currentUserId={currentUser?.id}
                        currentUserRole={currentUser?.role}
                        onAddFeedback={(comment: string) => addWeeklyFeedback(update.id, comment)}
                    />
                )}
            </CardFooter>
        </Card>
    );
};

export default WeeklyStandoutItem;
