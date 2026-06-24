import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createWeeklyUpdate, updateWeeklyUpdate } from './weeklyUpdates.api';
import { toast } from 'sonner';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyStandoutFormProps {
    initialData?: {
        id: string;
        title: string;
        created_at: string;
        content: {
            achievements: string;
            plannedVsDone: string;
            challenges?: string;
            nextWeekPlan?: string;
            selfRating?: number;
            week_start?: string;
            week_end?: string;
        }
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const WeeklyStandoutForm: React.FC<WeeklyStandoutFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);

    // Helper to get dates
    const getInitialDates = () => {
        const content = initialData?.content as any;
        if (content?.week_start && content?.week_end) {
            return {
                start: content.week_start as string,
                end: content.week_end as string
            };
        }

        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        return {
            start: monday.toISOString().split('T')[0],
            end: friday.toISOString().split('T')[0]
        };
    };

    const initialDates = getInitialDates();

    const [formData, setFormData] = useState({
        achievements: initialData?.content.achievements || '',
        plannedVsDone: initialData?.content.plannedVsDone || '',
        challenges: initialData?.content.challenges || '',
        nextWeekPlan: initialData?.content.nextWeekPlan || '',
        selfRating: initialData?.content.selfRating?.toString() || '4',
        weekStart: initialDates.start,
        weekEnd: initialDates.end,
        title: initialData?.title || `Weekly Stand-out - ${new Date().toLocaleDateString()}`
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.achievements || !formData.plannedVsDone) {
            toast.error('Please fill in at least achievements and planned vs done fields');
            return;
        }

        if (!formData.weekStart || !formData.weekEnd) {
            toast.error('Please select both start and end dates for the week.');
            return;
        }

        if (new Date(formData.weekEnd) < new Date(formData.weekStart)) {
            toast.error('End date cannot be earlier than start date.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                update_type: 'WEEKLY',
                title: `Weekly Reflection: ${formData.weekStart} to ${formData.weekEnd}`,
                created_at: new Date(formData.weekStart).toISOString(),
                content: {
                    achievements: formData.achievements,
                    plannedVsDone: formData.plannedVsDone,
                    challenges: formData.challenges,
                    nextWeekPlan: formData.nextWeekPlan,
                    selfRating: parseInt(formData.selfRating),
                    week_start: formData.weekStart,
                    week_end: formData.weekEnd
                }
            };

            if (isEdit && initialData) {
                await updateWeeklyUpdate(initialData.id, payload);
                toast.success('Weekly standout updated successfully!');
            } else {
                await createWeeklyUpdate(payload);
                toast.success('Weekly stand-out submitted successfully!');
            }

            if (!isEdit) {
                setFormData({
                    ...formData,
                    achievements: '',
                    plannedVsDone: '',
                    challenges: '',
                    nextWeekPlan: '',
                    selfRating: '4',
                });
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error submitting weekly update:', error);
            toast.error(error.message || 'Failed to submit weekly update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn("w-full max-w-3xl mx-auto shadow-xl border-primary/10 overflow-hidden", isEdit && "border-none shadow-none max-w-none")}>
            {!isEdit && <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-600" />}
            <form onSubmit={handleSubmit}>
                {!isEdit && (
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold tracking-tight">
                                    Week End Stand-out
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Reflect on your accomplishments and plan for the next cycle.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto p-3 bg-secondary/30 rounded-xl border border-primary/10">
                                <div className="flex-1 min-w-[140px]">
                                    <Label htmlFor="weekStart" className="text-[10px] font-black uppercase tracking-widest text-primary mb-1.5 block">Week Start</Label>
                                    <Input
                                        id="weekStart"
                                        type="date"
                                        value={formData.weekStart}
                                        onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                                        className="h-9 font-bold bg-background border-primary/20"
                                        required
                                    />
                                </div>
                                <div className="hidden sm:flex items-center justify-center pt-5">
                                    <ArrowRight className="h-4 w-4 text-primary/40" />
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <Label htmlFor="weekEnd" className="text-[10px] font-black uppercase tracking-widest text-primary mb-1.5 block">Week End</Label>
                                    <Input
                                        id="weekEnd"
                                        type="date"
                                        value={formData.weekEnd}
                                        onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                                        className="h-9 font-bold bg-background border-primary/20"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                )}
                <CardContent className={cn("space-y-6", isEdit && "pt-6")}>
                    {isEdit && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full p-4 bg-secondary/30 rounded-2xl border border-primary/10 mb-8">
                            <div className="flex-1">
                                <Label htmlFor="weekStart" className="text-[10px] font-black uppercase tracking-widest text-primary mb-1.5 block">Week Start</Label>
                                <Input
                                    id="weekStart"
                                    type="date"
                                    value={formData.weekStart}
                                    onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                                    className="h-10 font-bold bg-background border-primary/20"
                                    required
                                />
                            </div>
                            <div className="hidden sm:flex items-center justify-center pt-5">
                                <ArrowRight className="h-4 w-4 text-primary/40" />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="weekEnd" className="text-[10px] font-black uppercase tracking-widest text-primary mb-1.5 block">Week End</Label>
                                <Input
                                    id="weekEnd"
                                    type="date"
                                    value={formData.weekEnd}
                                    onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                                    className="h-10 font-bold bg-background border-primary/20"
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="achievements" className="text-sm font-bold uppercase tracking-wider text-primary">🏆 Key Achievements *</Label>
                            <RichTextEditor
                                value={formData.achievements}
                                onChange={(value) => setFormData({ ...formData, achievements: value })}
                                placeholder="What are you most proud of this week?"
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plannedVsDone" className="text-sm font-bold uppercase tracking-wider text-green-600">📊 Planned vs Completed *</Label>
                            <RichTextEditor
                                value={formData.plannedVsDone}
                                onChange={(value) => setFormData({ ...formData, plannedVsDone: value })}
                                placeholder="What did you plan vs what actually got done?"
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="challenges" className="text-sm font-bold uppercase tracking-wider text-amber-600">🚧 Challenges Encountered</Label>
                        <RichTextEditor
                            value={formData.challenges}
                            onChange={(value) => setFormData({ ...formData, challenges: value })}
                            placeholder="Any roadblocks or lessons learned?"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nextWeekPlan" className="text-sm font-bold uppercase tracking-wider text-indigo-600">🔜 Next Week's Priorities</Label>
                        <RichTextEditor
                            value={formData.nextWeekPlan}
                            onChange={(value) => setFormData({ ...formData, nextWeekPlan: value })}
                            placeholder="What's the main focus for next week?"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold">Self Rating</Label>
                                <p className="text-xs text-muted-foreground">How would you rate your performance this week?</p>
                            </div>
                            <Select
                                value={formData.selfRating}
                                onValueChange={(val) => setFormData({ ...formData, selfRating: val })}
                            >
                                <SelectTrigger className="w-[180px] border-primary/20">
                                    <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                                    <SelectItem value="4">⭐⭐⭐⭐ Great</SelectItem>
                                    <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                                    <SelectItem value="2">⭐⭐ Fair</SelectItem>
                                    <SelectItem value="1">⭐ Poor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className={cn("bg-secondary/5 border-t border-border/50 pt-6 flex gap-2", isEdit && "bg-transparent border-none")}>
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="w-full sm:w-auto ml-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : isEdit ? 'Update Entry' : 'Post Weekly Stand-out'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default WeeklyStandoutForm;
