import React, { useEffect, useState, useCallback } from 'react';
import { getMyDailyUpdates, getVisibleDailyUpdates } from './dailyUpdates.api';
import DailyStandupItem from './DailyStandupItem';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutList } from 'lucide-react';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { UpdatesPeopleView } from '../components/UpdatesPeopleView';
import { cn } from '@/lib/utils';

const DailyStandupList: React.FC = () => {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<string>('');
    const { user } = useAuth();

    const fetchUpdates = useCallback(async (date?: string) => {
        setLoading(true);
        try {
            const filters = date ? { date } : {};
            const [myRes, visibleRes] = await Promise.all([
                getMyDailyUpdates(filters),
                getVisibleDailyUpdates(filters)
            ]);

            const allUpdates = [...(myRes.data || []), ...(visibleRes.data || [])];
            const uniqueUpdates = Array.from(new Map(allUpdates.map(u => [u.id, u])).values());
            const sortedUpdates = uniqueUpdates.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setUpdates(sortedUpdates);
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates(dateFilter);
    }, [fetchUpdates, dateFilter]);

    const renderFeed = () => (
        <div className="max-w-2xl mx-auto w-full">
            <UpdatesTimeFilter mode="DAILY" value={dateFilter} onChange={setDateFilter} />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground/80">
                    <LayoutList className="h-5 w-5 text-primary" />
                    {dateFilter ? `Updates for ${new Date(dateFilter).toLocaleDateString()}` : 'Recent Daily Logs'}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUpdates(dateFilter)}
                    disabled={loading}
                    className="h-8 gap-2 rounded-full hover:bg-primary/5 border-primary/20"
                >
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {updates.length === 0 ? (
                <div className="text-center py-20 bg-secondary/5 border-2 border-dashed border-primary/10 rounded-3xl">
                    <p className="text-muted-foreground text-sm">No daily updates found{dateFilter ? ' for this date' : ''}.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {updates.map((update) => (
                        <DailyStandupItem
                            key={update.id}
                            update={update}
                            currentUser={user}
                            onFeedbackAdded={() => fetchUpdates(dateFilter)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return <UpdatesPeopleView defaultType="DAILY" renderFeed={renderFeed} />;
};

export default DailyStandupList;
