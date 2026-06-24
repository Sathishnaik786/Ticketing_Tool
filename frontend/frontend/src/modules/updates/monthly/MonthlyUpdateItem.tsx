import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { addMonthlyFeedback, deleteMonthlyUpdate } from './monthlyUpdates.api';
import { toast } from 'sonner';
import { MessageSquare, Send, Calendar, Target, Rocket, Lightbulb, AlertOctagon, TrendingUp, UserCheck, Sparkles, MessageCircle, ShieldCheck, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import UpdateUserHeader from '../components/UpdateUserHeader';
import { cn } from '@/lib/utils';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import MonthlyUpdateForm from './MonthlyUpdateForm';
import { DiscussionBoard } from '../components/DiscussionBoard';

interface Feedback {
    id: string;
    from_user_id: string;
    comment: string;
    created_at: string;
}

interface MonthlyUpdateItemProps {
    update: {
        id: string;
        user_id: string;
        title: string;
        content: {
            month: string;
            goalsPlanned?: string;
            goalsAchieved: string;
            keyContributions: string;
            learnings?: string;
            risks?: string;
            nextMonthGoals?: string;
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

const MonthlyUpdateItem: React.FC<MonthlyUpdateItemProps> = ({ update, currentUser, onFeedbackAdded }) => {
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteMonthlyUpdate(update.id);
            toast.success('Update deleted successfully');
            if (onFeedbackAdded) onFeedbackAdded();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete update');
        }
    };



    const isOwnUpdate = update.user_id === currentUser?.id;

    const displayMonth = update.content.month
        ? format(parseISO(`${update.content.month}-01`), 'MMMM yyyy')
        : 'Unknown Date';

    const displayProfile = update.user_profile || {
        id: update.user_id,
        name: `User ${update.user_id.substring(0, 8)}`,
        role: 'EMPLOYEE',
        position: 'Team Member',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.user_id}`
    };

    if (isEditing) {
        return (
            <div className="mb-12 animate-in fade-in zoom-in-95 duration-300">
                <MonthlyUpdateForm
                    initialData={update as any}
                    onSuccess={() => { setIsEditing(false); if (onFeedbackAdded) onFeedbackAdded(); }}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <Card className="mb-12 overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-premium transition-all hover:shadow-2xl hover:border-indigo-500/20 group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500" />
            <CardHeader className="flex flex-row items-center gap-5 pb-6 bg-secondary/5 border-b border-border/10">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <UpdateUserHeader
                            userProfile={displayProfile}
                            createdAt={update.created_at}
                            updateTypeLabel="Monthly Update"
                            isOwner={isOwnUpdate}
                        />

                        {isOwnUpdate && (
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-background/80 rounded-full transition-all">
                                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl border-primary/10 shadow-2xl">
                                        <DropdownMenuItem
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-3 p-4 text-sm font-semibold rounded-2xl cursor-pointer focus:bg-indigo-500/5 focus:text-indigo-600 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4 text-indigo-500" />
                                            Modify Growth Report
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setShowDeleteAlert(true)}
                                            className="flex items-center gap-3 p-4 text-sm font-semibold rounded-2xl cursor-pointer text-rose-600 focus:bg-rose-500/5 focus:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                            Archive Update
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                                    <AlertDialogContent className="rounded-[3rem] border-primary/10 shadow-3xl max-w-lg p-10">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black tracking-tighter">Archive Monthly Report?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-base font-medium leading-relaxed text-muted-foreground mt-4">
                                                This will permanently archive your monthly performance report. This may affect historical analysis and growth tracking in your employee journey.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-4 mt-8">
                                            <AlertDialogCancel className="rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] h-14 border-primary/10 px-8">Dissmiss</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-rose-600 hover:bg-rose-700 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] h-14 px-8 shadow-2xl shadow-rose-500/30"
                                            >
                                                Confirm Archival
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                    {update.content.month && (
                        <div className="flex items-center gap-2 mt-3 ml-[64px]">
                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-none font-medium text-[9px] tracking-widest px-2.5 py-0.5 uppercase">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                Cycle : {format(parseISO(`${update.content.month}-01`), 'MMMM yyyy')}
                            </Badge>
                            {isOwnUpdate && (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 font-medium text-[9px] tracking-widest px-2.5 py-0.5 uppercase">
                                    <ShieldCheck className="h-3 w-3 mr-1.5" />
                                    Certified Report
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="py-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1 text-slate-500">
                            <Target className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Initial Objectives</h4>
                        </div>
                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 shadow-inner transition-colors group-hover:bg-muted/40 min-h-[100px]">
                            <RichTextDisplay
                                content={update.content.goalsPlanned}
                                fallback="No specific goals were documented for this performance period."
                                className="text-foreground/70 italic"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1 text-indigo-500">
                            <Rocket className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Strategic Outcomes</h4>
                        </div>
                        <div className="p-6 bg-indigo-500/[0.03] dark:bg-indigo-500/10 rounded-3xl border border-indigo-500/10 shadow-inner transition-colors group-hover:bg-indigo-500/[0.05] min-h-[100px]">
                            <RichTextDisplay content={update.content.goalsAchieved} className="font-semibold text-foreground" />
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center gap-3 px-1 text-purple-600">
                        <TrendingUp className="h-4 w-4" />
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Operational Contributions</h4>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-purple-500/[0.03] to-indigo-500/[0.03] dark:from-purple-500/10 dark:to-indigo-500/10 rounded-3xl border border-purple-500/10 shadow-md transition-all group-hover:shadow-lg">
                        <RichTextDisplay content={update.content.keyContributions} className="font-semibold text-foreground" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-border/10">
                    <div className="space-y-4 px-1">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <Lightbulb className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Knowledge Growth</h4>
                        </div>
                        <div className="pl-6 border-l-2 border-emerald-500/20">
                            <RichTextDisplay
                                content={update.content.learnings}
                                fallback="Capabilities stable; standard operational procedures followed."
                                className="text-foreground/80 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 px-1">
                        <div className="flex items-center gap-3 text-rose-500">
                            <AlertOctagon className="h-4 w-4" />
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Risk Assessment</h4>
                        </div>
                        <div className="pl-6 border-l-2 border-rose-500/20">
                            <RichTextDisplay
                                content={update.content.risks}
                                fallback="No mission-critical risks or external dependencies identified."
                                className="text-foreground/80 font-semibold"
                            />
                        </div>
                    </div>
                </div>

                {update.content.nextMonthGoals && (
                    <div className="mt-8 p-6 bg-secondary/20 rounded-3xl border border-secondary border-dashed transition-all group-hover:bg-secondary/30">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600 mb-3 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Future Projections
                        </h4>
                        <RichTextDisplay
                            content={update.content.nextMonthGoals}
                            className="text-foreground font-semibold italic tracking-tight"
                        />
                    </div>
                )}
            </CardContent>

            <Separator className="opacity-30" />

            <CardFooter className="flex flex-col items-stretch p-8 bg-background/40">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "text-[10px] font-medium uppercase tracking-widest h-11 gap-3 transition-all rounded-2xl",
                            update.feedback?.length
                                ? "text-indigo-600 bg-indigo-500/5 border border-indigo-500/10 px-6 shadow-sm"
                                : "text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/5"
                        )}
                        onClick={() => setShowFeedback(!showFeedback)}
                    >
                        <MessageCircle className={cn("h-4 w-4", update.feedback?.length && "fill-indigo-500/10")} />
                        {update.feedback?.length || 0} Strategic Reviews
                    </Button>
                </div>

                {showFeedback && (
                    <DiscussionBoard
                        updateId={update.id}
                        initialFeedback={update.feedback || []}
                        currentUserId={currentUser?.id}
                        currentUserRole={currentUser?.role}
                        onAddFeedback={(comment: string) => addMonthlyFeedback(update.id, comment)}
                    />
                )}
            </CardFooter>
        </Card>
    );
};

export default MonthlyUpdateItem;
