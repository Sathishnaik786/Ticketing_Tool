import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, LayoutList, Search } from 'lucide-react';
import { employeesApi } from '@/services/api';
import { Employee } from '@/types';
import { EmployeeUpdateCard } from './EmployeeUpdateCard';
import { RecentUpdatesCard } from './RecentUpdatesCard';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getVisibleDailyUpdates } from '../daily/dailyUpdates.api';
import { getVisibleWeeklyUpdates } from '../weekly/weeklyUpdates.api';
import { getVisibleMonthlyUpdates } from '../monthly/monthlyUpdates.api';

interface UpdatesPeopleViewProps {
    defaultType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    renderFeed: () => React.ReactNode;
}

export const UpdatesPeopleView: React.FC<UpdatesPeopleViewProps> = ({ defaultType, renderFeed }) => {
    const [viewMode, setViewMode] = useState<'people' | 'feed'>('people');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [dailyUpdates, setDailyUpdates] = useState<any[]>([]);
    const [weeklyUpdates, setWeeklyUpdates] = useState<any[]>([]);
    const [monthlyUpdates, setMonthlyUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
                employeesApi.getAll({ limit: 1000 }),
                getVisibleDailyUpdates({ limit: 100 }),
                getVisibleWeeklyUpdates({ limit: 100 }),
                getVisibleMonthlyUpdates({ limit: 100 })
            ]);

            setEmployees(empRes.data || []);
            setDailyUpdates(dailyRes.data || []);
            setWeeklyUpdates(weeklyRes.data || []);
            setMonthlyUpdates(monthlyRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.position.toLowerCase().includes(searchTerm.toLowerCase());

            if (user?.role === 'EMPLOYEE') {
                return matchesSearch && (emp.userId === user.id || emp.departmentId === (user as any).employee?.departmentId);
            }
            if (user?.role === 'MANAGER') {
                return matchesSearch && (emp.managerId === user.id || emp.userId === user.id);
            }
            return matchesSearch;
        });
    }, [employees, searchTerm, user]);

    const hasUpdate = (empId: string, updates: any[]) => {
        return updates.some(u => u.user_id === empId);
    };

    if (loading && employees.length === 0) {
        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />)}
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-[2rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 p-4 rounded-[2rem] border border-primary/5 backdrop-blur-sm shadow-xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teammates..."
                                className="pl-11 rounded-2xl border-none bg-background/50 h-12 focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-background/40 p-1 rounded-2xl border border-border/50">
                            <Button
                                variant={viewMode === 'people' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('people')}
                                className="rounded-xl h-10 px-6 gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Users className="h-3 w-3" /> People
                            </Button>
                            <Button
                                variant={viewMode === 'feed' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('feed')}
                                className="rounded-xl h-10 px-6 gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                                <LayoutList className="h-3 w-3" /> Feed
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchData}
                            disabled={loading}
                            className="rounded-xl h-12 w-12 border-primary/10 hover:bg-primary/5"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>

                    {viewMode === 'people' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredEmployees.map(emp => (
                                <EmployeeUpdateCard
                                    key={emp.id}
                                    employee={emp}
                                    hasDaily={hasUpdate(emp.userId || emp.id, dailyUpdates)}
                                    hasWeekly={hasUpdate(emp.userId || emp.id, weeklyUpdates)}
                                    hasMonthly={hasUpdate(emp.userId || emp.id, monthlyUpdates)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            {renderFeed()}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <RecentUpdatesCard />
                </div>
            </div>
        </div>
    );
};
