import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
    recentUpdates: any[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ recentUpdates }) => {
    // Simple trend mapping - counting updates per day for the last 10 updates (just as proxy for actual trend)
    const sorted = [...recentUpdates].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const chartData = sorted.map(u => ({
        date: format(new Date(u.created_at), 'MMM dd'),
        impact: u.update_type === 'DAILY' ? 1 : u.update_type === 'WEEKLY' ? 3 : 7
    }));

    return (
        <Card className="enterprise-card h-[450px]">
            <CardHeader className="pb-8">
                <CardTitle className="enterprise-subheading">Activity Momentum</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor', opacity: 0.4 }}
                                dy={15}
                            />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{
                                    fontSize: '12px',
                                    fontWeight: '900',
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="impact"
                                stroke="var(--primary)"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorImpact)"
                                animationDuration={2500}
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)', shadow: '0 0 20px var(--primary)' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
