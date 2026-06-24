import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    ClipboardList,
    LayoutTemplate,
    BookOpenCheck,
    BarChart3,
    Cpu,
    ArrowRight
} from 'lucide-react';

export const UpdatesQuickAccess: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            id: 'daily',
            title: 'Daily Update',
            icon: ClipboardList,
            href: '/app/updates/daily',
            enabled: import.meta.env.VITE_ENABLE_DAILY_UPDATES !== 'false',
            color: 'text-blue-500'
        },
        {
            id: 'weekly',
            title: 'Weekly Report',
            icon: LayoutTemplate,
            href: '/app/updates/weekly',
            enabled: import.meta.env.VITE_ENABLE_WEEKLY_UPDATES !== 'false',
            color: 'text-emerald-500'
        },
        {
            id: 'monthly',
            title: 'Monthly Review',
            icon: BookOpenCheck,
            href: '/app/updates/monthly',
            enabled: import.meta.env.VITE_ENABLE_MONTHLY_UPDATES !== 'false',
            color: 'text-purple-500'
        },
        {
            id: 'analytics',
            title: 'Analytics',
            icon: BarChart3,
            href: '/app/updates/analytics',
            enabled: import.meta.env.VITE_ENABLE_UPDATE_ANALYTICS !== 'false',
            color: 'text-amber-500'
        },
        {
            id: 'automation',
            title: 'Intelligence',
            icon: Cpu,
            href: '/app/updates/automation',
            enabled: (
                import.meta.env.VITE_ENABLE_UPDATE_REMINDERS !== 'false' ||
                import.meta.env.VITE_ENABLE_AI_SUMMARIES !== 'false' ||
                import.meta.env.VITE_ENABLE_EXPORTS !== 'false'
            ),
            color: 'text-indigo-500'
        }
    ].filter(f => f.enabled);

    if (features.length === 0) return null;

    return (
        <Card className="liquid-surface rounded-[2.5rem] border-transparent shadow-none p-2 mt-4">
            <CardHeader className="pb-4">
                <CardTitle className="enterprise-subheading flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Quick Reporting
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {features.map((feature) => (
                        <Button
                            key={feature.id}
                            variant="ghost"
                            className="h-auto py-8 flex-col gap-4 rounded-3xl transition-all duration-500 group relative overflow-hidden"
                            onClick={() => navigate(feature.href)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className={cn(
                                "h-14 w-14 rounded-2xl liquid-elevated flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                                feature.color.replace('text-', 'bg-').replace('-500', '-500/10')
                            )}>
                                <feature.icon className={cn("h-6 w-6", feature.color)} />
                            </div>
                            <div className="text-center relative z-10">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">{feature.title}</span>
                                <div className="flex justify-center mt-3">
                                    <div className="h-1 w-1 rounded-full bg-primary/20 group-hover:w-4 group-hover:bg-primary transition-all duration-500" />
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
