import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createDailyUpdate, updateDailyUpdate } from './dailyUpdates.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DailyStandupFormProps {
    initialData?: {
        id: string;
        title: string;
        created_at: string;
        content: {
            yesterday: string;
            today: string;
            blockers?: string;
        }
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const DailyStandupForm: React.FC<DailyStandupFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        yesterday: initialData?.content.yesterday || '',
        today: initialData?.content.today || '',
        blockers: initialData?.content.blockers || '',
        date: initialData?.created_at ? initialData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        title: initialData?.title || `Daily Update - ${new Date().toLocaleDateString()}`
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.yesterday || !formData.today) {
            toast.error('Please fill in at least yesterday and today fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                update_type: 'DAILY',
                title: formData.title,
                created_at: `${formData.date}T12:00:00Z`,
                content: {
                    yesterday: formData.yesterday,
                    today: formData.today,
                    blockers: formData.blockers
                }
            };

            if (isEdit && initialData) {
                await updateDailyUpdate(initialData.id, payload);
                toast.success('Daily update updated successfully!');
            } else {
                await createDailyUpdate(payload);
                toast.success('Daily update submitted successfully!');
            }

            if (!isEdit) {
                setFormData({
                    yesterday: '',
                    today: '',
                    blockers: '',
                    date: new Date().toISOString().split('T')[0],
                    title: `Daily Update - ${new Date().toLocaleDateString()}`
                });
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error submitting daily update:', error);
            toast.error(error.message || 'Failed to submit daily update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn("w-full max-w-2xl mx-auto shadow-lg border-primary/10", isEdit && "border-none shadow-none max-w-none")}>
            <form onSubmit={handleSubmit}>
                {!isEdit && (
                    <CardHeader>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                            New Daily Standup
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary/20 rounded-xl border border-primary/5">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Log Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => {
                                    const d = e.target.value;
                                    setFormData({
                                        ...formData,
                                        date: d,
                                        title: `Daily Update - ${new Date(d).toLocaleDateString()}`
                                    });
                                }}
                                className="bg-background font-bold border-primary/20"
                                required
                            />
                        </div>
                        <div className="flex-1 flex items-center">
                            <p className="text-[10px] text-muted-foreground italic">
                                {isEdit ? "Updating a past log allows you to maintain accuracy in your records." : "Submit updates for any day you missed to maintain your streak."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yesterday">What did you do yesterday? *</Label>
                        <RichTextEditor
                            value={formData.yesterday}
                            onChange={(value) => setFormData({ ...formData, yesterday: value })}
                            placeholder="List your key achievements from yesterday..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="today">What will you do today? *</Label>
                        <RichTextEditor
                            value={formData.today}
                            onChange={(value) => setFormData({ ...formData, today: value })}
                            placeholder="What are your goals for today?"
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="blockers">Any blockers?</Label>
                        <RichTextEditor
                            value={formData.blockers}
                            onChange={(value) => setFormData({ ...formData, blockers: value })}
                            placeholder="Anything stopping your progress?"
                            className="min-h-[80px]"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="w-full sm:w-auto ml-auto"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : isEdit ? 'Update Entry' : 'Submit Update'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default DailyStandupForm;
