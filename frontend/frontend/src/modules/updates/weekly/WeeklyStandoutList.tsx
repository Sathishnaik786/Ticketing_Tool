import React, { useEffect, useState, useCallback } from 'react';
import { getMyWeeklyUpdates, getVisibleWeeklyUpdates } from './weeklyUpdates.api';
import WeeklyStandoutItem from './WeeklyStandoutItem';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutTemplate } from 'lucide-react';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { UpdatesPeopleView } from '../components/UpdatesPeopleView';
import { cn } from '@/lib/utils';

const WeeklyStandoutList: React.FC = () => {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [weekFilter, setWeekFilter] = useState<string>('');
    const { user } = useAuth();

    const fetchUpdates = useCallback(async (week?: string) => {
        setLoading(true);
        try {
            const filters = week ? { week } : {};
            const [myRes, visibleRes] = await Promise.all([
                getMyWeeklyUpdates(filters),
                getVisibleWeeklyUpdates(filters)
            ]);

            const allUpdates = [...(myRes.data || []), ...(visibleRes.data || [])];
            const uniqueUpdates = Array.from(new Map(allUpdates.map(u => [u.id, u])).values());
            const sortedUpdates = uniqueUpdates.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setUpdates(sortedUpdates);
        } catch (error) {
            console.error('Error fetching weekly updates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates(weekFilter);
    }, [fetchUpdates, weekFilter]);

    const renderFeed = () => (
        <div className="max-w-4xl mx-auto w-full">
            <UpdatesTimeFilter mode="WEEKLY" value={weekFilter} onChange={setWeekFilter} />

            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black flex items-center gap-2 text-foreground">
                        <LayoutTemplate className="h-6 w-6 text-primary" />
                        {weekFilter ? `Reports for Week of ${new Date(weekFilter).toLocaleDateString()}` : 'Weekly Stand-outs'}
                    </h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUpdates(weekFilter)}
                    disabled={loading}
                    className="h-9 gap-2 rounded-xl border-primary/20"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {updates.length === 0 ? (
                <div className="text-center py-24 bg-secondary/5 border-2 border-dashed border-primary/10 rounded-[2rem]">
                    <p className="text-sm text-muted-foreground">No weekly stand-outs found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {updates.map((update) => (
                        <WeeklyStandoutItem
                            key={update.id}
                            update={update}
                            currentUser={user}
                            onFeedbackAdded={() => fetchUpdates(weekFilter)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return <UpdatesPeopleView defaultType="WEEKLY" renderFeed={renderFeed} />;
};

export default WeeklyStandoutList;
