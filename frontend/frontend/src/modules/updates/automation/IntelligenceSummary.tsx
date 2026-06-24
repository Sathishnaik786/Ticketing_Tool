import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, BookOpen, Quote, Calendar, Lightbulb, TrendingUp, Info } from 'lucide-react';
import { getIntelligenceSummary } from './automation.api';
import { toast } from 'sonner';
import UpdatesTimeFilter from '../components/UpdatesTimeFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const IntelligenceSummary: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [filterMode, setFilterMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
    const [filterValue, setFilterValue] = useState<string>('');

    const handleGenerate = async (type: string) => {
        setLoading(true);
        try {
            const filters: any = {};
            if (filterValue) {
                if (filterMode === 'DAILY') filters.date = filterValue;
                if (filterMode === 'WEEKLY') filters.week = filterValue;
                if (filterMode === 'MONTHLY') filters.month = filterValue;
            }
            const res = await getIntelligenceSummary(type, filters);
            setSummary(res.data);
            toast.success('AI insights generated');
        } catch (e) {
            toast.error('Failed to generate summary.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-white/5 shadow-premium bg-card/40 backdrop-blur-3xl overflow-hidden relative group transition-all duration-500 hover:shadow-indigo-500/10 rounded-[2.5rem]">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                <Sparkles className="h-40 w-40 text-indigo-500" />
            </div>

            <CardHeader className="space-y-8 p-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-heading font-semibold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                            </div>
                            Impact Synthesis
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium ml-12">Cognitive analysis of employee activity logs</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-background/40 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="flex flex-col gap-4">
                        <Tabs value={filterMode} onValueChange={(v: any) => { setFilterMode(v); setFilterValue(''); }} className="bg-secondary/30 p-1 rounded-2xl w-fit border border-white/5">
                            <TabsList className="bg-transparent h-8">
                                <TabsTrigger value="DAILY" className="text-[10px] font-medium uppercase tracking-widest rounded-xl h-6 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Day</TabsTrigger>
                                <TabsTrigger value="WEEKLY" className="text-[10px] font-medium uppercase tracking-widest rounded-xl h-6 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Week</TabsTrigger>
                                <TabsTrigger value="MONTHLY" className="text-[10px] font-medium uppercase tracking-widest rounded-xl h-6 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Month</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <UpdatesTimeFilter mode={filterMode} value={filterValue} onChange={setFilterValue} />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerate('WEEKLY')}
                            disabled={loading}
                            className="text-[10px] font-medium uppercase tracking-widest rounded-2xl h-11 px-6 border-indigo-500/20 hover:bg-indigo-500/10 transition-all hover:scale-105"
                        >
                            <Calendar className="h-4 w-4 mr-2 opacity-60" />
                            Summary
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGenerate('MONTHLY')}
                            disabled={loading || !filterValue}
                            className="text-[10px] font-medium uppercase tracking-widest rounded-2xl h-11 px-6 bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Synthesize
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="min-h-[200px] flex flex-col justify-center p-8 pt-0 relative z-10">
                {!summary ? (
                    <div className="text-center py-14 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
                        <BookOpen className="h-10 w-10 text-muted-foreground/10 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest opacity-40 max-w-xs mx-auto">
                            {filterValue
                                ? `Engine ready for ${filterValue}`
                                : 'Select operational range to begin'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative p-8 bg-indigo-500/[0.03] rounded-[2.5rem] border border-indigo-500/10">
                            <Quote className="absolute top-4 left-4 h-10 w-10 text-indigo-500/5" />
                            <p className="text-base font-semibold text-foreground/90 leading-relaxed italic relative z-10">
                                {summary.text || (typeof summary === 'string' ? summary : 'Synthesis complete.')}
                            </p>
                        </div>

                        {summary.keyHighlights && Array.isArray(summary.keyHighlights) && summary.keyHighlights.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2 text-emerald-600">
                                        <TrendingUp className="h-4 w-4" />
                                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Critical Gains</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {summary.keyHighlights.map((h: string, i: number) => (
                                            <li key={i} className="text-xs font-medium flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-8 bg-purple-500/[0.03] rounded-[2.5rem] border border-purple-500/10 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-purple-600">
                                        <Lightbulb className="h-4 w-4" />
                                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em]">Strategic Pivot</h4>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-2 italic">
                                        " {summary.suggestion} "
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-[9px] font-semibold text-purple-500/40 uppercase tracking-widest">
                                        <Info className="h-3 w-3" />
                                        AI Generated Advisory
                                    </div>
                                </div>
                            </div>
                        )}

                        {summary === "Not enough data to generate a summary." && (
                            <div className="bg-amber-500/5 p-8 rounded-[2rem] border border-amber-500/10 text-center">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Data Insufficiency</p>
                                <p className="text-[10px] text-muted-foreground mt-2 font-medium">Post more updates to enable high-fidelity synthesis.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default IntelligenceSummary;
