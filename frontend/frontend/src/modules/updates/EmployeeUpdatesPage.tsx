import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    LayoutList,
    ArrowLeft,
    Target,
    History,
    Timer,
    MessageCircle,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '@/services/api';
import { getVisibleDailyUpdates } from './daily/dailyUpdates.api';
import { getVisibleWeeklyUpdates } from './weekly/weeklyUpdates.api';
import { getVisibleMonthlyUpdates } from './monthly/monthlyUpdates.api';
import DailyStandupItem from './daily/DailyStandupItem';
import WeeklyStandoutItem from './weekly/WeeklyStandoutItem';
import MonthlyUpdateItem from './monthly/MonthlyUpdateItem';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const EmployeeUpdatesPage: React.FC = () => {
    const { employeeId } = useParams<{ employeeId: string }>();
    const [searchParams] = useSearchParams();
    const updateIdToHighlight = searchParams.get('updateId');
    const initialTab = searchParams.get('type')?.toLowerCase() || 'daily';

    const [employee, setEmployee] = useState<any>(null);
    const [updates, setUpdates] = useState<{ daily: any[], weekly: any[], monthly: any[] }>({
        daily: [],
        weekly: [],
        monthly: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user } = useAuth();
    const navigate = useNavigate();

    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!employeeId) return;
            setLoading(true);
            try {
                // We use visible updates API which supports filtering by user_id via RLS and query params if we had them,
                // but since the backend might not have user_id filter in the API yet, we fetch all and filter client-side.
                // NOTE: In a real production app, we'd add ?user_id= to the API. 
                // Given the "no backend change" rule, we fetch what's visible to the user and filter.

                const [empRes, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
                    employeesApi.getById(employeeId),
                    getVisibleDailyUpdates({ limit: 50 }),
                    getVisibleWeeklyUpdates({ limit: 50 }),
                    getVisibleMonthlyUpdates({ limit: 50 })
                ]);

                if (empRes) {
                    setEmployee(empRes);

                    // Filter updates for this specific employee using their userId
                    const filterId = empRes.userId;

                    setUpdates({
                        daily: (dailyRes.data || []).filter((u: any) => u.user_id === filterId),
                        weekly: (weeklyRes.data || []).filter((u: any) => u.user_id === filterId),
                        monthly: (monthlyRes.data || []).filter((u: any) => u.user_id === filterId)
                    });
                }
            } catch (error) {
                console.error('Error fetching employee updates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId]);

    useEffect(() => {
        if (updateIdToHighlight && !loading) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [updateIdToHighlight, loading]);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-8">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />)}
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-black uppercase">Employee Not Found</h2>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto px-4 py-8">
            <header className="relative p-10 bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700 scale-150 rotate-12">
                    <Timer className="h-40 w-40 text-primary" />
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
                    <Avatar className="h-32 w-32 ring-8 ring-background/50 shadow-2xl transition-transform duration-500 hover:rotate-6">
                        <AvatarImage src={employee.profile_image || employee.avatar} />
                        <AvatarFallback className="text-3xl font-black bg-primary/10">{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="text-center md:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-4xl font-black tracking-tight">{employee.firstName} {employee.lastName}</h1>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                                {employee.role}
                            </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-[12px]">
                            {employee.position}
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            {employee.department?.name || 'Operations'}
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Continuity</span>
                                <span className="text-xl font-black text-blue-500">{updates.daily.length} <span className="text-[10px]">logs</span></span>
                            </div>
                            <div className="w-[1px] h-8 bg-border/40" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Strategy</span>
                                <span className="text-xl font-black text-purple-500">{updates.weekly.length} <span className="text-[10px]">plans</span></span>
                            </div>
                            <div className="w-[1px] h-8 bg-border/40" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Growth</span>
                                <span className="text-xl font-black text-amber-500">{updates.monthly.length} <span className="text-[10px]">reviews</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 md:ml-auto">
                        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-primary/10 hover:bg-primary/5 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Feed
                        </Button>
                    </div>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-10">
                    <TabsList className="h-16 bg-secondary/20 p-2 rounded-[2rem] border border-primary/5 shadow-inner">
                        <TabsTrigger value="daily" className="h-12 px-8 rounded-2xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                            <Timer className="h-4 w-4" /> Daily
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="h-12 px-8 rounded-2xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                            <Target className="h-4 w-4" /> Weekly
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="h-12 px-8 rounded-2xl flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                            <History className="h-4 w-4" /> Monthly
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="daily" className="space-y-6 focus-visible:outline-none">
                    {updates.daily.length === 0 ? (
                        <div className="py-20 text-center bg-secondary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 italic text-muted-foreground/40">No daily logs shared yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
                            {updates.daily.map(u => (
                                <div
                                    key={u.id}
                                    ref={u.id === updateIdToHighlight ? highlightRef : null}
                                    className={cn(
                                        "transition-all duration-1000",
                                        u.id === updateIdToHighlight ? "ring-4 ring-primary ring-offset-8 ring-offset-background rounded-3xl animate-pulse-glow" : ""
                                    )}
                                >
                                    <DailyStandupItem update={u} currentUser={user} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="weekly" className="space-y-6 focus-visible:outline-none">
                    {updates.weekly.length === 0 ? (
                        <div className="py-20 text-center bg-secondary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 italic text-muted-foreground/40">No weekly plans shared yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                            {updates.weekly.map(u => (
                                <div
                                    key={u.id}
                                    ref={u.id === updateIdToHighlight ? highlightRef : null}
                                    className={cn(
                                        "transition-all duration-1000",
                                        u.id === updateIdToHighlight ? "ring-4 ring-primary ring-offset-8 ring-offset-background rounded-3xl animate-pulse-glow" : ""
                                    )}
                                >
                                    <WeeklyStandoutItem update={u} currentUser={user} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="monthly" className="space-y-6 focus-visible:outline-none">
                    {updates.monthly.length === 0 ? (
                        <div className="py-20 text-center bg-secondary/5 rounded-[2.5rem] border-2 border-dashed border-primary/10 italic text-muted-foreground/40">No monthly reviews shared yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                            {updates.monthly.map(u => (
                                <div
                                    key={u.id}
                                    ref={u.id === updateIdToHighlight ? highlightRef : null}
                                    className={cn(
                                        "transition-all duration-1000",
                                        u.id === updateIdToHighlight ? "ring-4 ring-primary ring-offset-8 ring-offset-background rounded-3xl animate-pulse-glow" : ""
                                    )}
                                >
                                    <MonthlyUpdateItem update={u} currentUser={user} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EmployeeUpdatesPage;
