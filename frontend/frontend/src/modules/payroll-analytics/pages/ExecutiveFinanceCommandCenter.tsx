import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  LayoutDashboard
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePie, Pie
} from 'recharts';
import { EnterpriseHeader, EnterpriseStatCard, EnterpriseCard } from '@/components/payroll/EnterpriseComponents';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ExecutiveFinanceCommandCenter = () => {
  // 1. Fetch Executive Intelligence
  const { data: summary, isLoading } = useQuery({
    queryKey: ['executive-payroll-summary'],
    queryFn: async () => {
        // In production, call /api/payroll-analytics/executive-summary
        return {
            totalBurn: 1250000,
            netPayout: 1080000,
            headcount: 45,
            avgSalary: 27777,
            payoutHealth: 100,
            trends: [
                { month: 'Jan', burn: 850000 },
                { month: 'Feb', burn: 890000 },
                { month: 'Mar', burn: 950000 },
                { month: 'Apr', burn: 1100000 },
                { month: 'May', burn: 1250000 }
            ],
            deptCost: [
                { name: 'Engineering', value: 450000 },
                { name: 'Marketing', value: 250000 },
                { name: 'Sales', value: 300000 },
                { name: 'Operations', value: 150000 },
                { name: 'HR', value: 100000 }
            ]
        };
    }
  });

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Executive Finance Command Center"
        description="Strategic workforce-finance intelligence, cost trends, and enterprise payroll health."
        badge="Enterprise Intelligence"
      />

      {/* Primary Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
            title="Enterprise Payroll Burn" 
            value={formatCurrency(summary?.totalBurn || 0)} 
            icon={Activity} 
            color="primary" 
        />
        <EnterpriseStatCard 
            title="Avg. Workforce Cost" 
            value={formatCurrency(summary?.avgSalary || 0)} 
            icon={TrendingUp} 
            color="neutral" 
        />
        <EnterpriseStatCard 
            title="Disbursement Health" 
            value={`${summary?.payoutHealth || 100}%`} 
            icon={ShieldCheck} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="Active Headcount" 
            value={summary?.headcount || 0} 
            icon={Users} 
            color="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Burn Trend */}
        <div className="lg:col-span-2">
            <EnterpriseCard title="Workforce Cost Trends" description="Monthly gross payroll trajectory.">
                <div className="h-[350px] w-full pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={summary?.trends}>
                            <defs>
                                <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [formatCurrency(value), 'Gross Burn']}
                            />
                            <Area type="monotone" dataKey="burn" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBurn)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </EnterpriseCard>
        </div>

        {/* Department Allocation */}
        <div>
            <EnterpriseCard title="Departmental Cost Share" description="Current month allocation.">
                <div className="h-[350px] w-full flex flex-col items-center justify-center pt-8">
                    <ResponsiveContainer width="100%" height="250">
                        <RePie>
                            <Pie
                                data={summary?.deptCost}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {summary?.deptCost?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </RePie>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
                        {summary?.deptCost?.map((dept, index) => (
                            <div key={dept.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[10px] font-black uppercase text-slate-500">{dept.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </EnterpriseCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Treasury Forecast */}
         <EnterpriseCard title="Treasury Forecast" description="Next month requirement projection.">
            <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projected Outflow</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(1325000)}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                        <ArrowUpRight size={10} /> +2.5% Growth
                    </Badge>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                        <span>Confidence Level</span>
                        <span>85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%]" />
                    </div>
                </div>
            </div>
         </EnterpriseCard>

         {/* Anomaly Center */}
         <EnterpriseCard title="Executive Anomalies" description="Strategic risk monitoring.">
            <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-600">
                        <AlertTriangle size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-rose-600">Cost Spike: Sales</p>
                        <p className="text-[9px] font-bold text-slate-500">+18% vs Prev. Month</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                        <Activity size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600">Treasury Delay Risk</p>
                        <p className="text-[9px] font-bold text-slate-500">2 Batches Pending Approval</p>
                    </div>
                </div>
            </div>
         </EnterpriseCard>

         {/* Compliance readiness */}
         <EnterpriseCard title="Compliance Health" description="Legal & tax readiness score.">
            <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.98)} className="text-primary" />
                    </svg>
                    <span className="absolute text-xl font-black">98%</span>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase text-slate-400">Total Statutory Integrity</p>
            </div>
         </EnterpriseCard>
      </div>
    </div>
  );
};

export default ExecutiveFinanceCommandCenter;
