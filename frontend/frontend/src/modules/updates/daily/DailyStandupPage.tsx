import React, { useState } from 'react';
import DailyStandupForm from './DailyStandupForm';
import DailyStandupList from './DailyStandupList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, LayoutList, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const DailyStandupPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdateCreated = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab('list');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Daily Standup"
                description="Keep your team updated with your daily progress and blockers."
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-secondary/20 p-1 rounded-full border border-primary/10">
                        <TabsTrigger
                            value="list"
                            className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                        >
                            <LayoutList className="h-4 w-4" />
                            Recent Updates
                        </TabsTrigger>
                        <TabsTrigger
                            value="new"
                            className="rounded-full px-6 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                        >
                            <PlusCircle className="h-4 w-4" />
                            New Log
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <DailyStandupList key={refreshKey} />
                </TabsContent>

                <TabsContent value="new" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <DailyStandupForm onSuccess={handleUpdateCreated} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DailyStandupPage;
