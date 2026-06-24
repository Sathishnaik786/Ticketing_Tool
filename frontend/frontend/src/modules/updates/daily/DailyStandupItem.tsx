import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { addDailyFeedback, deleteDailyUpdate } from './dailyUpdates.api';
import { toast } from 'sonner';
import { MessageSquare, Send, CheckCircle2, History, Target, AlertCircle, Sparkles, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import UpdateUserHeader from '../components/UpdateUserHeader';
import { cn } from '@/lib/utils';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DailyStandupForm from './DailyStandupForm';
import { DiscussionBoard } from '../components/DiscussionBoard';

interface Feedback {
    id: string;
    from_user_id: string;
    comment: string;
    created_at: string;
}

interface DailyStandupItemProps {
    update: {
        id: string;
        user_id: string;
        title: string;
        content: {
            yesterday: string;
            today: string;
            blockers?: string;
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

const DailyStandupItem: React.FC<DailyStandupItemProps> = ({ update, currentUser, onFeedbackAdded }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteDailyUpdate(update.id);
            toast.success('Update deleted successfully');
            if (onFeedbackAdded) onFeedbackAdded();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete update');
        }
    };



    const isOwnUpdate = update.user_id === currentUser?.id;

    const displayProfile = update.user_profile || {
        id: update.user_id,
        name: `User ${update.user_id.substring(0, 8)}`,
        role: 'EMPLOYEE',
        position: 'Team Member',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.user_id}`
    };

    if (isEditing) {
        return (
            <div className="mb-8 animate-in fade-in zoom-in-95 duration-300">
                <DailyStandupForm
                    initialData={update as any}
                    onSuccess={() => { setIsEditing(false); if (onFeedbackAdded) onFeedbackAdded(); }}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <Card className="mb-8 overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-premium transition-all hover:shadow-2xl hover:border-primary/20 group/card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 bg-secondary/5 border-b border-border/10">
                <UpdateUserHeader
                    userProfile={displayProfile}
                    createdAt={update.created_at}
                    updateTypeLabel="Daily Standup"
                    isOwner={isOwnUpdate}
                />

                {isOwnUpdate && (
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background/80 rounded-full">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-primary/10 shadow-2xl">
                                <DropdownMenuItem
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 p-3 text-sm font-medium rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Entry
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteAlert(true)}
                                    className="flex items-center gap-2 p-3 text-sm font-medium rounded-xl cursor-pointer text-rose-600 focus:bg-rose-500/5 focus:text-rose-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Update
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                            <AlertDialogContent className="rounded-[2.5rem] border-primary/10 shadow-2xl max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                        This will permanently remove your daily standup. This action cannot be undone and may affect your activity logs.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2 mt-4">
                                    <AlertDialogCancel className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 border-primary/10">Keep it</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-rose-600 hover:bg-rose-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-rose-500/20"
                                    >
                                        Yes, Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-6 pb-6 space-y-6">
                <div className="space-y-6">
                    {update.content.yesterday && (
                        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 transition-colors group-hover/card:border-primary/20">
                            <div className="absolute -left-[9px] top-0 p-1 bg-background rounded-full border border-slate-200 dark:border-slate-800">
                                <History className="h-3 w-3 text-slate-400" />
                            </div>
                            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                Retrospective
                            </h4>
                            <RichTextDisplay content={update.content.yesterday} className="text-muted-foreground" />
                        </div>
                    )}

                    {update.content.today && (
                        <div className="relative pl-6 border-l-2 border-emerald-200 dark:border-emerald-900/30 transition-colors group-hover/card:border-emerald-500/20">
                            <div className="absolute -left-[9px] top-0 p-1 bg-background rounded-full border border-emerald-200 dark:border-emerald-900/30">
                                <Target className="h-3 w-3 text-emerald-500" />
                            </div>
                            <h4 className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mb-2">
                                Today's Focus
                            </h4>
                            <RichTextDisplay content={update.content.today} className="text-foreground font-medium" />
                        </div>
                    )}

                    {update.content.blockers ? (
                        <div className="relative pl-6 border-l-2 border-rose-200 dark:border-rose-900/30 transition-colors group-hover/card:border-rose-500/20">
                            <div className="absolute -left-[9px] top-0 p-1 bg-background rounded-full border border-rose-200 dark:border-rose-900/30">
                                <AlertCircle className="h-3 w-3 text-rose-500" />
                            </div>
                            <h4 className="text-[10px] font-semibold text-rose-600 dark:text-rose-500 uppercase tracking-[0.2em] mb-2">
                                Blockers & Risks
                            </h4>
                            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                                <RichTextDisplay content={update.content.blockers} className="text-rose-700 dark:text-rose-400 font-semibold" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative pl-6">
                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 text-[10px] font-medium uppercase tracking-widest py-1 px-3">
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                On Track • No Blockers
                            </Badge>
                        </div>
                    )}
                </div>
            </CardContent>

            <Separator className="opacity-30" />

            <CardFooter className="flex flex-col items-stretch p-4 bg-background/40">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "text-[10px] font-medium uppercase tracking-widest h-9 gap-2 transition-all rounded-xl",
                            update.feedback?.length ? "text-primary bg-primary/5 px-4" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                        onClick={() => setShowFeedback(!showFeedback)}
                    >
                        <MessageSquare className={cn("h-4 w-4", update.feedback?.length && "fill-primary/20")} />
                        {update.feedback?.length || 0} Discussions
                    </Button>

                    {update.feedback?.length === 0 && !showFeedback && (
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mr-2">
                            No feedback yet
                        </span>
                    )}
                </div>

                {showFeedback && (
                    <DiscussionBoard
                        updateId={update.id}
                        initialFeedback={update.feedback || []}
                        currentUserId={currentUser?.id}
                        currentUserRole={currentUser?.role}
                        onAddFeedback={(comment: string) => addDailyFeedback(update.id, comment)}
                    />
                )}
            </CardFooter>
        </Card>
    );
};

export default DailyStandupItem;
