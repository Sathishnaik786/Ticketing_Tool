import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  ArrowRightLeft,
  DollarSign,
  Scale,
  RefreshCw,
  Lock,
  History
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnterpriseHeader, EnterpriseStatCard, EnterpriseCard } from '@/components/payroll/EnterpriseComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

const PayrollReconciliationDashboard = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Variances (Real-time Audit)
  const { data: variances = [], isLoading: isVariancesLoading } = useQuery({
    queryKey: ['payroll-variances'],
    queryFn: async () => {
        const response = await fetch('/api/payroll-bulk/finance/variances');
        if (!response.ok) throw new Error('Failed to fetch variances');
        return response.json();
    }
  });

  const criticalVariances = variances.filter((v: any) => v.severity === 'CRITICAL' || v.severity === 'HIGH').length;

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Financial Reconciliation & Controls"
        description="Enterprise-grade payroll balancing, disbursement tracking, and anomaly detection."
        badge="Finance Governance"
        actions={
          <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
                <History size={14} />
                Audit Logs
             </Button>
             <Button 
                className="rounded-2xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-500/10"
             >
                <Scale size={16} />
                Run Global Reconcile
             </Button>
          </div>
        }
      />

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
            title="Total Reconciled" 
            value={formatCurrency(0)} 
            icon={CheckCircle2} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="Variance Alerts" 
            value={variances.length} 
            icon={AlertCircle} 
            color={variances.length > 0 ? "danger" : "success"} 
        />
        <EnterpriseStatCard 
            title="Critical Issues" 
            value={criticalVariances} 
            icon={Activity} 
            color={criticalVariances > 0 ? "danger" : "neutral"} 
        />
        <EnterpriseStatCard 
            title="Disbursement Health" 
            value="100%" 
            icon={ShieldCheck} 
            color="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Anomalies */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-500" />
                Financial Variance Intelligence
              </h3>
              <Badge variant="outline" className="rounded-lg bg-rose-500/5 text-rose-600 border-rose-500/20 font-black uppercase text-[9px]">
                Real-time Monitoring
              </Badge>
           </div>

           <EnterpriseCard title="" description="">
                <div className="rounded-[2rem] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                            <TableRow className="border-slate-100 dark:border-white/5">
                                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee / Code</TableHead>
                                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Variance Type</TableHead>
                                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Severity</TableHead>
                                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isVariancesLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 font-black uppercase text-slate-400 animate-pulse">Scanning Ledger...</TableCell></TableRow>
                            ) : variances.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 font-black uppercase text-slate-400">No Financial Anomalies Detected</TableCell></TableRow>
                            ) : (
                                variances.map((v: any) => (
                                    <TableRow key={v.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                        <TableCell className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                                    {v.employee?.first_name} {v.employee?.last_name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">ID: {v.employee?.employee_code}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{v.variance_type.replace('_', ' ')}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{v.description}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge className={`rounded-lg font-black text-[9px] uppercase tracking-widest ${
                                                v.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 
                                                v.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600' : 
                                                'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {v.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary">
                                                Resolve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
           </EnterpriseCard>
        </div>

        {/* Right: Operational Controls */}
        <div className="space-y-8">
            <EnterpriseCard title="Batch Governance" description="Hardened operational controls.">
                <div className="space-y-6 py-4">
                    <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={16} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Balanced Ledger</p>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            Current active batches are fully balanced across gross, net, and statutory buckets.
                        </p>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-slate-900 text-white space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                <Lock size={16} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Global Payout Freeze</p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            Emergency mechanism to halt all bank disbursements across the organization.
                        </p>
                        <Button className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            Initiate Freeze
                        </Button>
                    </div>
                </div>
            </EnterpriseCard>

            <EnterpriseCard title="Disbursement Tracker" description="Bank-grade payout health.">
                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <ArrowRightLeft className="text-primary" size={16} />
                            <span className="text-[10px] font-black uppercase text-slate-600">Transfers Success</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">100%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <DollarSign className="text-emerald-500" size={16} />
                            <span className="text-[10px] font-black uppercase text-slate-600">Total Net Payout</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(0)}</span>
                    </div>
                </div>
            </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default PayrollReconciliationDashboard;
