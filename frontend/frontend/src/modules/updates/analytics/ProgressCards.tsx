import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, Calendar, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    trend?: string;
    colorClass: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    title, value, subtitle, icon: Icon, trend, colorClass
}) => {
    const isAmber = colorClass.includes('amber');
    const isEmerald = colorClass.includes('emerald');
    const isIndigo = colorClass.includes('indigo');
    const isPurple = colorClass.includes('purple');

    const iconColor = isAmber ? 'text-amber-500' : isEmerald ? 'text-emerald-500' : isIndigo ? 'text-indigo-500' : 'text-purple-500';
    const bgColor = isAmber ? 'bg-amber-500/10' : isEmerald ? 'bg-emerald-500/10' : isIndigo ? 'bg-indigo-500/10' : 'bg-purple-500/10';

    return (
        <Card className="overflow-hidden border border-white/5 shadow-2xl bg-card/40 backdrop-blur-2xl group hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-7 relative overflow-hidden">
                <div className={cn("absolute -top-12 -right-12 w-40 h-40 blur-3xl opacity-20 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-30", colorClass)} />

                <div className="flex flex-col gap-6">
                    <div className={cn("p-3 rounded-2xl w-fit shadow-inner transition-transform duration-500 group-hover:scale-110", bgColor)}>
                        <Icon className={cn("h-6 w-6", iconColor)} />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">{title}</h3>
                            {trend && (
                                <span className="text-[9px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/10">
                                    <TrendingUp className="h-2.5 w-2.5" /> {trend}
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-heading font-bold tracking-tighter text-foreground leading-none tabular-nums">{value}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium opacity-70 tracking-tight leading-relaxed">{subtitle}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface ProgressCardsProps {
    data: any;
}

export const ProgressCards: React.FC<ProgressCardsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProgressCard
                title="Total Reports"
                value={data?.total || 0}
                subtitle="Aggregated submissions across reporting cycles"
                icon={Calendar}
                colorClass="bg-indigo-500"
            />
            <ProgressCard
                title="Synergy Streak"
                value={`${data?.streak || 0}`}
                subtitle="Consecutive daily engagement milestones"
                icon={Zap}
                trend={data?.streak > 0 ? "Momentum" : "Ready"}
                colorClass="bg-amber-500"
            />
            <ProgressCard
                title="Weekly Impact"
                value={data?.weekly || 0}
                subtitle="Strategic focus areas successfully delivered"
                icon={TrendingUp}
                colorClass="bg-emerald-500"
            />
            <ProgressCard
                title="Monthly Mastery"
                value={data?.monthly || 0}
                subtitle="High-level performance records archived"
                icon={Award}
                colorClass="bg-purple-500"
            />
        </div>
    );
};
