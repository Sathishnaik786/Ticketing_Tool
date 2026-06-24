import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import EmployeeProgressDashboard from './EmployeeProgressDashboard';
import ManagerTeamDashboard from './ManagerTeamDashboard';
import AdminOrgDashboard from './AdminOrgDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Users, BarChart } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
    const { user, isLoading } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER' || user?.role === 'HR';

    const [activeTab, setActiveTab] = useState('personal');

    React.useEffect(() => {
        if (user) {
            setActiveTab(isAdmin ? 'org' : (isManager ? 'team' : 'personal'));
        }
    }, [user, isAdmin, isManager]);

    if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-muted-foreground uppercase tracking-widest">Loading Intelligence...</div>;
    if (!user) return <div className="p-20 text-center font-black text-destructive uppercase tracking-widest">Unauthorized Access</div>;


    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
                <PageHeader
                    title="Progress & Intelligence"
                    description="Data-driven insights into reporting consistency, team engagement, and organizational growth."
                    className="mb-0"
                />

                {(isAdmin || isManager) && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-secondary/30 p-1 rounded-2xl border border-primary/10 backdrop-blur-md">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger
                                value="personal"
                                className="rounded-xl px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-tighter transition-all"
                            >
                                <LineChart className="h-4 w-4" />
                                My Progress
                            </TabsTrigger>
                            {isManager && (
                                <TabsTrigger
                                    value="team"
                                    className="rounded-xl px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-tighter transition-all"
                                >
                                    <Users className="h-4 w-4" />
                                    Team Insights
                                </TabsTrigger>
                            )}
                            {isAdmin && (
                                <TabsTrigger
                                    value="org"
                                    className="rounded-xl px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-tighter transition-all"
                                >
                                    <BarChart className="h-4 w-4" />
                                    Org Analytics
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                )}
            </div>

            <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                <div className="pt-8">
                    {activeTab === 'personal' && <EmployeeProgressDashboard />}
                    {activeTab === 'team' && <ManagerTeamDashboard />}
                    {activeTab === 'org' && <AdminOrgDashboard />}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
