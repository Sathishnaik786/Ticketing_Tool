import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BellRing, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationCenter: React.FC = () => {
    // In a real app, this would fetch from a notifications API
    const mockNotifications = [
        { id: 1, type: 'REMINDER', title: 'Daily Standup Missing', message: 'You haven\'t posted your daily standup for today.', time: '2 hours ago', status: 'UNREAD' },
        { id: 2, type: 'SUCCESS', title: 'Monthly Report Certified', message: 'Your monthly strategic update was successfully archived.', time: '1 day ago', status: 'READ' },
        { id: 3, type: 'INFO', title: 'Team Activity High', message: '90% of your team has already posted their weekly updates.', time: '2 days ago', status: 'READ' }
    ];

    return (
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-3xl overflow-hidden">
            <CardHeader className="bg-secondary/5 border-b border-border/50">
                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-indigo-500" />
                    Automation Log
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                    {mockNotifications.map((n) => (
                        <div key={n.id} className={`p-6 flex gap-4 transition-colors hover:bg-secondary/10 ${n.status === 'UNREAD' ? 'bg-indigo-500/5' : ''}`}>
                            <div className="h-fit p-2 rounded-xl bg-background shadow-sm">
                                {n.type === 'REMINDER' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                {n.type === 'SUCCESS' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                {n.type === 'INFO' && <Info className="h-4 w-4 text-blue-500" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-black">{n.title}</h4>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{n.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationCenter;
