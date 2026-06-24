import React, { useState } from 'react';
import WeeklyStandoutForm from './WeeklyStandoutForm';
import WeeklyStandoutList from './WeeklyStandoutList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutTemplate, PenTool, ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const WeeklyStandoutPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdateCreated = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('list');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title="Weekly Stand-out"
                    description="A high-level review of your weekly impact, achievements, and future focus."
                    className="mb-0"
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
                    <TabsList className="bg-secondary/30 p-1 rounded-2xl border border-primary/20 backdrop-blur-md">
                        <TabsTrigger
                            value="list"
                            className="rounded-xl px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-bold text-xs uppercase tracking-tighter"
                        >
                            <LayoutTemplate className="h-4 w-4" />
                            Impact Feed
                        </TabsTrigger>
                        <TabsTrigger
                            value="new"
                            className="rounded-xl px-5 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-bold text-xs uppercase tracking-tighter"
                        >
                            <PenTool className="h-4 w-4" />
                            Write Report
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                <Tabs value={activeTab} className="w-full mt-8">
                    <TabsContent value="list" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <WeeklyStandoutList key={refreshKey} />
                    </TabsContent>

                    <TabsContent value="new" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <WeeklyStandoutForm onSuccess={handleUpdateCreated} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default WeeklyStandoutPage;
