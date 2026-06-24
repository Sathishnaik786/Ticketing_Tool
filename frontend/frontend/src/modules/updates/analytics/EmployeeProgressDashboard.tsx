import React, { useEffect, useState } from 'react';
import { getMyAnalytics } from './analytics.api';
import { ProgressCards } from './ProgressCards';
import { ConsistencyChart } from './ConsistencyChart';
import { TrendChart } from './TrendChart';
import { Skeleton } from '@/components/ui/skeleton';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmployeeProgressDashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
    const [filterValue, setFilterValue] = useState<string>('');

    const fetch = async (mode: string, value: string) => {
        setLoading(true);
        try {
            const filters: any = {};
            if (value) {
                if (mode === 'DAILY') filters.date = value;
                if (mode === 'WEEKLY') filters.week = value;
                if (mode === 'MONTHLY') filters.month = value;
            }
            const res = await getMyAnalytics(filters);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch(filterMode, filterValue);
    }, [filterMode, filterValue]);

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Tabs value={filterMode} onValueChange={(v: any) => { setFilterMode(v); setFilterValue(''); }} className="bg-secondary/30 p-1 rounded-xl">
                    <TabsList className="bg-transparent h-8">
                        <TabsTrigger value="DAILY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-6">Day</TabsTrigger>
                        <TabsTrigger value="WEEKLY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-6">Week</TabsTrigger>
                        <TabsTrigger value="MONTHLY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-6">Month</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="w-full sm:w-auto">
                    <UpdatesTimeFilter mode={filterMode} value={filterValue} onChange={setFilterValue} />
                </div>
            </div>

            {loading ? (
                <div className="space-y-8 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
                    </div>
                </div>
            ) : (
                <>
                    <ProgressCards data={data} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ConsistencyChart data={data} />
                        <TrendChart recentUpdates={data?.recent || []} />
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeeProgressDashboard;
