import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createMonthlyUpdate, getMyMonthlyUpdates, updateMonthlyUpdate } from './monthlyUpdates.api';
import { toast } from 'sonner';
import { CalendarDays, Rocket, Target, Brain, AlertTriangle, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyUpdateFormProps {
    initialData?: {
        id: string;
        title: string;
        created_at: string;
        content: {
            month: string;
            goalsPlanned?: string;
            goalsAchieved: string;
            keyContributions: string;
            learnings?: string;
            risks?: string;
            nextMonthGoals?: string;
        }
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const MonthlyUpdateForm: React.FC<MonthlyUpdateFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        month: initialData?.content.month || new Date().toISOString().slice(0, 7), // YYYY-MM
        goalsPlanned: initialData?.content.goalsPlanned || '',
        goalsAchieved: initialData?.content.goalsAchieved || '',
        keyContributions: initialData?.content.keyContributions || '',
        learnings: initialData?.content.learnings || '',
        risks: initialData?.content.risks || '',
        nextMonthGoals: initialData?.content.nextMonthGoals || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.goalsAchieved || !formData.keyContributions) {
            toast.error('Please report your achievements and key contributions.');
            return;
        }

        setLoading(true);
        try {
            // Check for duplicates (Frontend check for UX)
            const myUpdates = await getMyMonthlyUpdates();
            const existing = myUpdates.data?.find((u: any) => u.content.month === formData.month && (!isEdit || u.id !== initialData?.id));

            if (existing) {
                toast.error(`You have already submitted a report for ${formData.month}.`);
                setLoading(false);
                return;
            }

            const payload = {
                update_type: 'MONTHLY',
                title: `Monthly Growth Report - ${formData.month}`,
                created_at: `${formData.month}-01T12:00:00Z`,
                content: { ...formData }
            };

            if (isEdit && initialData) {
                await updateMonthlyUpdate(initialData.id, payload);
                toast.success('Monthly update updated successfully!');
            } else {
                await createMonthlyUpdate(payload);
                toast.success('Monthly update submitted successfully!');
            }

            if (!isEdit) {
                setFormData({
                    month: new Date().toISOString().slice(0, 7),
                    goalsPlanned: '',
                    goalsAchieved: '',
                    keyContributions: '',
                    learnings: '',
                    risks: '',
                    nextMonthGoals: ''
                });
            }

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error submitting monthly update:', error);
            toast.error(error.message || 'Failed to submit monthly update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn("w-full max-w-4xl mx-auto shadow-2xl border-indigo-500/10 overflow-hidden bg-card/50 backdrop-blur-sm", isEdit && "border-none shadow-none max-w-none bg-transparent")}>
            {!isEdit && <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />}
            <form onSubmit={handleSubmit}>
                {!isEdit && (
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-indigo-500/10 rounded-lg">
                                <CalendarDays className="h-6 w-6 text-indigo-600" />
                            </span>
                            Performance & Growth Report
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Document your journey, milestones, and strategic goals for the month.
                        </p>
                    </CardHeader>
                )}

                <CardContent className={cn("space-y-8", isEdit && "pt-6")}>
                    <div className="flex flex-col sm:flex-row gap-6 p-4 bg-secondary/20 rounded-2xl border border-secondary/30">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="month" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reporting Month</Label>
                            <Input
                                id="month"
                                type="month"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                className="bg-background font-bold border-indigo-500/20"
                                required
                            />
                        </div>
                        <div className="flex-[2] flex items-center">
                            <p className="text-xs text-muted-foreground italic">
                                {isEdit ? "Accuracy in monthly reports ensures your historical impact is properly valued." : "Tip: Monthly reports are critical for performance reviews. Be specific about outcomes."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="goalsPlanned" className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                <Target className="h-4 w-4" /> Goals Planned
                            </Label>
                            <RichTextEditor
                                value={formData.goalsPlanned}
                                onChange={(value) => setFormData({ ...formData, goalsPlanned: value })}
                                placeholder="What were the primary objectives for this month?"
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="goalsAchieved" className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                <Rocket className="h-4 w-4" /> Goals Achieved *
                            </Label>
                            <RichTextEditor
                                value={formData.goalsAchieved}
                                onChange={(value) => setFormData({ ...formData, goalsAchieved: value })}
                                placeholder="What results were delivered?"
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="keyContributions" className="flex items-center gap-2 text-sm font-bold text-purple-600">
                            <Rocket className="h-4 w-4" /> Strategic Contributions *
                        </Label>
                        <RichTextEditor
                            value={formData.keyContributions}
                            onChange={(value) => setFormData({ ...formData, keyContributions: value })}
                            placeholder="Highlight significant impact on projects or team processes."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label htmlFor="learnings" className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                                <Brain className="h-4 w-4" /> Growth & Learnings
                            </Label>
                            <RichTextEditor
                                value={formData.learnings}
                                onChange={(value) => setFormData({ ...formData, learnings: value })}
                                placeholder="What new skills or knowledge did you acquire?"
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="risks" className="flex items-center gap-2 text-sm font-bold text-rose-600">
                                <AlertTriangle className="h-4 w-4" /> Blockers & Risks
                            </Label>
                            <RichTextEditor
                                value={formData.risks}
                                onChange={(value) => setFormData({ ...formData, risks: value })}
                                placeholder="What hindered your progress or poses a future risk?"
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/50">
                        <Label htmlFor="nextMonthGoals" className="flex items-center gap-2 text-sm font-bold text-blue-600">
                            <FastForward className="h-4 w-4" /> Next Month Objectives
                        </Label>
                        <RichTextEditor
                            value={formData.nextMonthGoals}
                            onChange={(value) => setFormData({ ...formData, nextMonthGoals: value })}
                            placeholder="What are the key priorities for the upcoming month?"
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>

                <CardFooter className={cn("bg-secondary/10 border-t border-border/50 py-6 flex gap-2", isEdit && "bg-transparent border-none")}>
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="w-full sm:w-auto ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-10 rounded-2xl shadow-xl shadow-indigo-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : isEdit ? 'Save Changes' : 'Authorize & Submit Monthly Report'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default MonthlyUpdateForm;
