import React, { useEffect, useState, useCallback } from 'react';
import { getMyMonthlyUpdates, getVisibleMonthlyUpdates } from './monthlyUpdates.api';
import MonthlyUpdateItem from './MonthlyUpdateItem';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar } from 'lucide-react';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { UpdatesPeopleView } from '../components/UpdatesPeopleView';
import { cn } from '@/lib/utils';

const MonthlyUpdateList: React.FC = () => {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState<string>('');
    const { user } = useAuth();

    const fetchUpdates = useCallback(async (month?: string) => {
        setLoading(true);
        try {
            const filters = month ? { month } : {};
            const [myRes, visibleRes] = await Promise.all([
                getMyMonthlyUpdates(filters),
                getVisibleMonthlyUpdates(filters)
            ]);

            const allUpdates = [...(myRes.data || []), ...(visibleRes.data || [])];
            const uniqueUpdates = Array.from(new Map(allUpdates.map(u => [u.id, u])).values());
            const sortedUpdates = uniqueUpdates.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setUpdates(sortedUpdates);
        } catch (error) {
            console.error('Error fetching monthly updates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates(monthFilter);
    }, [fetchUpdates, monthFilter]);

    const renderFeed = () => (
        <div className="max-w-4xl mx-auto w-full">
            <UpdatesTimeFilter mode="MONTHLY" value={monthFilter} onChange={setMonthFilter} />

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    {monthFilter ? `Reviews for ${monthFilter}` : 'Monthly Impact Reviews'}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUpdates(monthFilter)}
                    disabled={loading}
                    className="h-9 gap-2 rounded-xl border-primary/20"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {updates.length === 0 ? (
                <div className="text-center py-24 bg-secondary/5 border-2 border-dashed border-primary/10 rounded-[2rem]">
                    <p className="text-sm text-muted-foreground">No monthly reviews found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {updates.map((update) => (
                        <MonthlyUpdateItem
                            key={update.id}
                            update={update}
                            currentUser={user}
                            onFeedbackAdded={() => fetchUpdates(monthFilter)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return <UpdatesPeopleView defaultType="MONTHLY" renderFeed={renderFeed} />;
};

export default MonthlyUpdateList;
