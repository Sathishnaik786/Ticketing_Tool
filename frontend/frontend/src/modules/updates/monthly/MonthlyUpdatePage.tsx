import React, { useState } from 'react';
import MonthlyUpdateForm from './MonthlyUpdateForm';
import MonthlyUpdateList from './MonthlyUpdateList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenCheck, LineChart, ShieldPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const MonthlyUpdatePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdateCreated = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('list');
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-2">
                <PageHeader
                    title="Monthly Strategic Updates"
                    description="The historical record of your team's growth, strategic achievements, and future roadmap."
                    className="mb-0"
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="shrink-0">
                    <TabsList className="bg-indigo-500/5 p-1.5 rounded-3xl border border-indigo-500/10 backdrop-blur-2xl shadow-sm">
                        <TabsTrigger
                            value="list"
                            className="rounded-2xl px-6 py-2.5 flex items-center gap-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-indigo-500/30 transition-all duration-500 font-black text-[10px] uppercase tracking-widest"
                        >
                            <LineChart className="h-4 w-4" />
                            Strategic Feed
                        </TabsTrigger>
                        <TabsTrigger
                            value="new"
                            className="rounded-2xl px-6 py-2.5 flex items-center gap-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-indigo-500/30 transition-all duration-500 font-black text-[10px] uppercase tracking-widest"
                        >
                            <ShieldPlus className="h-4 w-4" />
                            Certify Report
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <SeparatorWithText text="INTELLIGENT PERFORMANCE ARCHIVE" />

            <div className="relative">
                <Tabs value={activeTab} className="w-full">
                    <TabsContent value="list" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <MonthlyUpdateList key={refreshKey} />
                    </TabsContent>

                    <TabsContent value="new" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <MonthlyUpdateForm onSuccess={handleUpdateCreated} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

const SeparatorWithText = ({ text }: { text: string }) => (
    <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-border/40"></div>
        <span className="flex-shrink mx-4 text-[9px] font-black text-muted-foreground/40 tracking-[0.4em] uppercase">{text}</span>
        <div className="flex-grow border-t border-border/40"></div>
    </div>
);

export default MonthlyUpdatePage;
