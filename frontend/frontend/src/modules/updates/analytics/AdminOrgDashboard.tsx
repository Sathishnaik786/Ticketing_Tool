import React, { useEffect, useState, useCallback } from 'react';
import { getOrgAnalytics } from './analytics.api';
import { ProgressCard } from './ProgressCards';
import { ConsistencyChart } from './ConsistencyChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, BarChart3, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminOrgDashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
    const [filterValue, setFilterValue] = useState<string>('');

    const fetch = useCallback(async (mode: string, value: string) => {
        setLoading(true);
        try {
            const filters: any = {};
            if (value) {
                if (mode === 'DAILY') filters.date = value;
                if (mode === 'WEEKLY') filters.week = value;
                if (mode === 'MONTHLY') filters.month = value;
            }
            const res = await getOrgAnalytics(filters);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch(filterMode, filterValue);
    }, [filterMode, filterValue, fetch]);

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
                <div className="space-y-8 animate-pulse"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ProgressCard
                            title="Organization Reach"
                            value={data?.uniqueContributors || 0}
                            subtitle="Unique reporters"
                            icon={Globe}
                            colorClass="bg-purple-600"
                        />
                        <ProgressCard
                            title="Intelligence Data"
                            value={data?.totalUpdates || 0}
                            subtitle="Total knowledge entries"
                            icon={BarChart3}
                            colorClass="bg-indigo-600"
                        />
                        <ProgressCard
                            title="System Health"
                            value="Optimal"
                            subtitle="Reporting cycle efficiency"
                            icon={ShieldCheck}
                            colorClass="bg-emerald-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ConsistencyChart data={data?.byType} />

                        <Card className="border-none shadow-xl bg-card/40 backdrop-blur-xl transition-all duration-700 hover:shadow-indigo-500/10 border border-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-lg font-black tracking-tight uppercase">Corporate Compliance Feed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Total Org Footprint</p>
                                                <h5 className="text-4xl font-black tabular-nums">{data?.totalUpdates || 0}</h5>
                                            </div>
                                            <BarChart3 className="h-12 w-12 text-indigo-500/20" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Daily</p>
                                                <p className="text-lg font-black text-amber-500">{data?.byType?.DAILY || 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Weekly</p>
                                                <p className="text-lg font-black text-emerald-500">{data?.byType?.WEEKLY || 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Monthly</p>
                                                <p className="text-lg font-black text-purple-500">{data?.byType?.MONTHLY || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase text-center opacity-40">
                                        Authorized Organization-Wide Visibility
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminOrgDashboard;
