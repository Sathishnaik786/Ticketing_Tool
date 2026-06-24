import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileJson, FileText, CheckCircle2 } from 'lucide-react';
import { exportUpdates } from './automation.api';
import { toast } from 'sonner';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GovernanceExport: React.FC = () => {
    const [exporting, setExporting] = useState(false);
    const [filterMode, setFilterMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
    const [filterValue, setFilterValue] = useState<string>('');

    const handleExport = async (type?: string) => {
        setExporting(true);
        try {
            const filters: any = {};
            if (type) filters.type = type;
            if (filterValue) {
                if (filterMode === 'DAILY') filters.date = filterValue;
                if (filterMode === 'WEEKLY') filters.week = filterValue;
                if (filterMode === 'MONTHLY') filters.month = filterValue;
            }

            const res = await exportUpdates(filters);
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `EMTS_Export_${type || 'ALL'}_${filterValue || new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            toast.success('Governance export generated successfully.');
        } catch (e) {
            toast.error('Export failed.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-600" />
            <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <FileDown className="h-5 w-5 text-indigo-600" />
                    Audit & Governance Exports
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Export raw data for compliance, HR reviews, or external auditing.</p>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-background/40 rounded-2xl border border-indigo-500/10 mb-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">Time Range Filter</span>
                        <Tabs value={filterMode} onValueChange={(v: any) => { setFilterMode(v); setFilterValue(''); }} className="bg-secondary/30 p-1 rounded-xl w-fit">
                            <TabsList className="bg-transparent h-7">
                                <TabsTrigger value="DAILY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-5">Day</TabsTrigger>
                                <TabsTrigger value="WEEKLY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-5">Week</TabsTrigger>
                                <TabsTrigger value="MONTHLY" className="text-[10px] font-bold uppercase tracking-tighter rounded-lg h-5">Month</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <UpdatesTimeFilter mode={filterMode} value={filterValue} onChange={setFilterValue} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'DAILY', label: 'Daily Logs', icon: FileText },
                        { id: 'WEEKLY', label: 'Weekly Reports', icon: FileText },
                        { id: 'MONTHLY', label: 'Monthly Reviews', icon: FileText }
                    ].map((item) => (
                        <Button
                            key={item.id}
                            variant="outline"
                            className="h-24 flex-col gap-3 rounded-2xl border-indigo-500/10 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all font-bold"
                            onClick={() => handleExport(item.id)}
                            disabled={exporting}
                        >
                            <item.icon className="h-6 w-6 text-indigo-500" />
                            <div className="text-center">
                                <span className="block text-xs uppercase tracking-widest">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">JSON format</span>
                            </div>
                        </Button>
                    ))}
                </div>

                <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black">Full Knowledge Portability</h4>
                            <p className="text-xs text-muted-foreground">Download all updates filtered by range.</p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        className="rounded-xl font-black text-xs uppercase h-10 px-6"
                        onClick={() => handleExport()}
                        disabled={exporting}
                    >
                        <FileJson className="h-4 w-4 mr-2" />
                        Export Master File
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default GovernanceExport;
