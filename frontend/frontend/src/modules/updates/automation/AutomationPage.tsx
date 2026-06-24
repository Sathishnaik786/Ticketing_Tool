import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import ReminderSettings from './ReminderSettings';
import IntelligenceSummary from './IntelligenceSummary';
import GovernanceExport from './GovernanceExport';
import NotificationCenter from './NotificationCenter';
import { Cpu, Sparkles, FileDown, BellRing } from 'lucide-react';


const AutomationPage: React.FC = () => {
    const isRemindersEnabled = import.meta.env.VITE_ENABLE_UPDATE_REMINDERS !== 'false';
    const isAISummariesEnabled = import.meta.env.VITE_ENABLE_AI_SUMMARIES !== 'false';
    const isExportsEnabled = import.meta.env.VITE_ENABLE_EXPORTS !== 'false';

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
            <PageHeader
                title="Intelligence & Governance"
                description="Leverage automation to maintain reporting consistency and extract strategic value from team logs."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Intelligence Layer */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Intelligence</h2>
                    </div>

                    {isAISummariesEnabled ? (
                        <IntelligenceSummary />
                    ) : (
                        <div className="p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center bg-muted/20">
                            <Cpu className="h-10 w-10 text-muted-foreground/20 mb-4" />
                            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest opacity-40">AI Summary Layer Inactive</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <div className="flex items-center gap-3 px-2 mb-8">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <BellRing className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Activity Log</h2>
                        </div>
                        <NotificationCenter />
                    </div>
                </div>

                {/* Automation & Reminders */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <Cpu className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Automation</h2>
                    </div>

                    {isRemindersEnabled ? (
                        <ReminderSettings />
                    ) : (
                        <div className="p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center bg-muted/20">
                            <Cpu className="h-10 w-10 text-muted-foreground/20 mb-4" />
                            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest opacity-40">Reminders Layer Inactive</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Governance & Compliance */}
            {isExportsEnabled && (
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <FileDown className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Governance</h2>
                    </div>
                    <GovernanceExport />
                </div>
            )}

            <p className="text-center text-[10px] font-bold text-muted-foreground opacity-20 uppercase tracking-[1em] pt-10">End of Intelligence Module</p>
        </div>
    );
};

export default AutomationPage;
