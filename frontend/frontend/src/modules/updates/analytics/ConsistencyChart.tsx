import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface ConsistencyChartProps {
    data: any;
}

export const ConsistencyChart: React.FC<ConsistencyChartProps> = ({ data }) => {
    const chartData = [
        { name: 'Daily', value: data?.daily || 0, color: '#f59e0b' },
        { name: 'Weekly', value: data?.weekly || 0, color: '#10b981' },
        { name: 'Monthly', value: data?.monthly || 0, color: '#8b5cf6' },
    ];

    return (
        <Card className="enterprise-card h-[450px]">
            <CardHeader className="pb-8">
                <CardTitle className="enterprise-subheading">Reporting Consistency</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor', opacity: 0.4 }}
                                dy={15}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
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
                            <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={50} animationDuration={2000}>
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.color} 
                                        fillOpacity={0.8}
                                        className="hover:fill-opacity-100 transition-all duration-300" 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
