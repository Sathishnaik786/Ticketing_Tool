import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  ShieldAlert,
  ArrowUpRight,
  User,
  History,
  Activity,
  ArrowRight,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
  EnterpriseCard, 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseEmptyState 
} from '@/components/payroll/EnterpriseComponents';
import { usePayrollVariances } from '../hooks/usePayroll';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const VarianceDashboard = () => {
  const { data: variances, isLoading } = usePayrollVariances();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
        case 'CRITICAL': return 'bg-rose-500/10 text-rose-600 border-0 shadow-sm shadow-rose-500/10';
        case 'HIGH': return 'bg-orange-500/10 text-orange-600 border-0';
        case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 border-0';
        default: return 'bg-blue-500/10 text-blue-600 border-0';
    }
  };

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Variance Detection"
        description="Automated anomaly detection engine identifying payroll deviations through multi-cycle baseline analysis."
        badge="Anomaly Intelligence"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <History className="mr-2 h-4 w-4" /> Baseline History
            </Button>
            <Button className="btn-premium bg-amber-600 hover:bg-amber-700 shadow-amber-500/25">
              <Zap className="mr-2 h-4 w-4" /> Run Fresh Audit
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard 
          title="Total Anomalies"
          value={variances?.length || 0}
          icon={Activity}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Critical Risks"
          value={variances?.filter(v => v.severity === 'CRITICAL').length || 0}
          icon={ShieldAlert}
          color="danger"
        />
        <EnterpriseStatCard 
          title="Avg. Delta"
          value="12.4%"
          icon={TrendingUp}
          trend="+1.2%"
          trendType="danger"
          color="primary"
        />
      </div>

      <EnterpriseCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filter by employee, type or severity..." 
                  className="rounded-xl pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:ring-amber-500/20" 
                />
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                 <Filter className="mr-2 h-4 w-4" /> Filter Severity
               </Button>
            </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
            <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
              <TableHead className="table-header-cell">Employee Case</TableHead>
              <TableHead className="table-header-cell">Category</TableHead>
              <TableHead className="table-header-cell text-right">Baseline</TableHead>
              <TableHead className="table-header-cell text-right">Current</TableHead>
              <TableHead className="table-header-cell">Variance Delta</TableHead>
              <TableHead className="table-header-cell text-center">Severity</TableHead>
              <TableHead className="table-header-cell text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="h-20 animate-pulse bg-slate-50/30 border-slate-100" />
              ))
            ) : variances?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-64">
                       <EnterpriseEmptyState 
                          title="No Anomalies"
                          description="Current processing cycle matches all baseline projections perfectly."
                          icon={CheckCircle2}
                       />
                    </TableCell>
                </TableRow>
            ) : (
              variances?.map((variance, idx) => (
                <TableRow key={variance.id} className="border-slate-100 dark:border-white/5 hover:bg-amber-500/[0.02] transition-colors group">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                            <AvatarFallback className="bg-amber-500/10 text-amber-600 font-black text-xs">
                                {variance.record?.employee?.first_name[0]}{variance.record?.employee?.last_name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{variance.record?.employee?.first_name} {variance.record?.employee?.last_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{variance.record?.employee?.employee_id}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge variant="outline" className="rounded-lg text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-500">
                      {variance.variance_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-5 text-slate-400 font-mono font-bold text-sm">
                    ₹{Number(variance.previous_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-5 text-slate-900 dark:text-white font-mono font-black text-sm">
                    ₹{Number(variance.current_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-5">
                      <div className="flex items-center gap-2 font-black tabular-nums">
                          {variance.variance_percentage > 0 ? (
                              <div className="flex items-center gap-1 text-rose-500">
                                <TrendingUp size={14} />
                                <span>+{Math.abs(variance.variance_percentage).toFixed(1)}%</span>
                              </div>
                          ) : (
                              <div className="flex items-center gap-1 text-emerald-500">
                                <TrendingDown size={14} />
                                <span>-{Math.abs(variance.variance_percentage).toFixed(1)}%</span>
                              </div>
                          )}
                      </div>
                  </TableCell>
                  <TableCell className="text-center py-5">
                    <Badge className={cn("rounded-lg px-3 py-1 font-black text-[10px] uppercase", getSeverityStyle(variance.severity))}>
                        {variance.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                          <Eye size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                          <MoreHorizontal size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </EnterpriseCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <EnterpriseCard title="Risk Heatmap" description="Frequency of anomalies across operational categories.">
            <div className="grid grid-cols-2 gap-4 py-4">
               {[
                 { label: 'Earning Fluctuations', count: 12, color: 'bg-rose-500' },
                 { label: 'Statutory Mismatch', count: 3, color: 'bg-amber-500' },
                 { label: 'Deduction Delta', count: 8, color: 'bg-orange-500' },
                 { label: 'New Joinee Sync', count: 2, color: 'bg-blue-500' },
               ].map((cat, i) => (
                 <div key={i} className="p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.label}</span>
                       <Badge className={cn("rounded-lg border-0 text-white font-black", cat.color)}>{cat.count}</Badge>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count/15)*100}%` }} className={cn("h-full", cat.color)} />
                    </div>
                 </div>
               ))}
            </div>
         </EnterpriseCard>
         <EnterpriseCard title="Baseline Health" description="Statistical stability of payroll calculations.">
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-6 text-center">
               <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                  <ShieldCheck size={40} />
               </div>
               <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Optimal</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[240px]">Payroll calculation engine is maintaining a 99.8% stability rating against historical baselines.</p>
               </div>
               <Button variant="outline" className="rounded-xl font-bold text-primary border-primary/20 hover:bg-primary/5">
                  Update Baseline Models
               </Button>
            </div>
         </EnterpriseCard>
      </div>
    </div>
  );
};

export default VarianceDashboard;
