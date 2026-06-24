import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { FileDown, TrendingUp, Users, Calendar, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const deptData = [
  { name: 'Engineering', count: 24, growth: 12 },
  { name: 'Sales', count: 18, growth: 8 },
  { name: 'Operations', count: 15, growth: -2 },
  { name: 'Marketing', count: 12, growth: 5 },
  { name: 'Finance', count: 10, growth: 3 },
  { name: 'HR', count: 8, growth: 15 }
];

const leaveData = [
  { name: 'Annual', value: 85 },
  { name: 'Sick', value: 42 },
  { name: 'Personal', value: 18 }
];

const trendData = [
  { month: 'Jan', rate: 92 },
  { month: 'Feb', rate: 94 },
  { month: 'Mar', rate: 88 },
  { month: 'Apr', rate: 91 },
  { month: 'May', rate: 95 },
  { month: 'Jun', rate: 98 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Reports() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized Session</div>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Analytical Intelligence"
          description="Consolidated organizational metrics and workforce distribution insights."
          className="bg-header-gradient p-8 rounded-3xl border border-border/30 shadow-premium"
        >
          <div className="flex items-center gap-3">
            <Button variant="outlinePremium" size="sm">
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="premium" size="sm">
              <Activity className="mr-2 h-4 w-4" /> Real-time Feed
            </Button>
          </div>
        </PageHeader>
      </motion.div>

      {/* Primary Analytics Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Department Overview */}
        <motion.div variants={slideUpVariants}>
          <Card className="border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden group">
            <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Departmental Density
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-bold">Headcount distribution across divisions</p>
              </div>
              <BarChart3 className="text-muted-foreground/30" />
            </CardHeader>
            <CardContent className="px-6 pb-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    fontSize={10}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '16px',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: '800',
                      fontSize: '12px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorBar)"
                    radius={[10, 10, 0, 0]}
                    barSize={40}
                    animationDuration={1800}
                    animationEasing="ease-out"
                  />
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-8 py-4 bg-muted/10 border-t border-border/20 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Engineering leads with 28%</span>
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp size={12} />
                <span className="text-[10px] font-black italic">+4.2% Growth</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leave Distribution */}
        <motion.div variants={slideUpVariants}>
          <Card className="border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden h-full">
            <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <PieIcon size={20} className="text-emerald-600" />
                  Absence Taxonomy
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-bold">Categorization of approved leave requests</p>
              </div>
              <Calendar className="text-muted-foreground/30" />
            </CardHeader>
            <CardContent className="px-6 pb-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={2000}
                    animationEasing="ease-out"
                  >
                    {leaveData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                        stroke="transparent"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '16px',
                      border: '1px solid hsl(var(--border))',
                      fontWeight: '800'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-[-10px]">
                {leaveData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Trends */}
        <motion.div variants={slideUpVariants} className="lg:col-span-2">
          <Card className="border-border/30 shadow-premium bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden group">
            <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  Personnel Presence Momentum
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-bold">Six-month attendance trajectory analysis</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black">ACTIVE TELEMETRY</Badge>
            </CardHeader>
            <CardContent className="px-6 pb-8 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    fontSize={10}
                    fontWeight="800"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={[80, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '16px',
                      border: '1px solid hsl(var(--border))',
                      fontWeight: '800'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer Insight */}
      <motion.div variants={slideUpVariants} className="flex justify-center">
        <div className="bg-indigo-600/5 border border-indigo-600/10 p-6 rounded-2xl max-w-2xl text-center backdrop-blur-sm">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2">Automated Executive Insight</p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
            "System telemetry indicates a consistent upward trend in personnel presence reaching a peak of 98% in June. This velocity suggests high organizational engagement and health."
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
