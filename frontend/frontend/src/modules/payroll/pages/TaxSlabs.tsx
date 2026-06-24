import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CreditCard, 
  Edit, 
  Trash2, 
  ChevronRight,
  Calculator,
  ArrowUpRight,
  TrendingUp,
  Percent,
  History,
  Info,
  ArrowRightLeft,
  FileText,
  BarChart3,
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
  EnterpriseErrorState
} from '@/components/payroll/EnterpriseComponents';
import { useTaxSlabs } from '../hooks/usePayroll';
import { cn } from '@/lib/utils';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

const TaxSlabs = () => {
  const { data: slabs, isLoading, isError, refetch } = useTaxSlabs();

  if (isLoading) return <PayrollDashboardSkeleton />;
  if (isError) return <EnterpriseErrorState onRetry={() => refetch()} />;


  const oldRegime = slabs?.filter(s => s.regime_name === 'OLD') || [];
  const newRegime = slabs?.filter(s => s.regime_name === 'NEW') || [];

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Tax Slabs Configuration"
        description="Manage personal income tax regimes and statutory slabs for accurate deduction orchestration."
        badge="Tax Compliance"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <FileText className="mr-2 h-4 w-4" />
              Tax Comparison Report
            </Button>
            <Button className="btn-premium bg-amber-600 hover:bg-amber-700 shadow-amber-500/25">
              <Plus className="mr-2 h-4 w-4" />
              Define Slab
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Active Regimes"
          value={2}
          icon={Calculator}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Max Tax Rate"
          value="30%"
          icon={Percent}
          color="danger"
        />
        <EnterpriseStatCard 
          title="Avg Tax Impact"
          value="14.2%"
          icon={BarChart3}
          trend="-0.5%"
          trendType="success"
          color="primary"
        />
        <EnterpriseStatCard 
          title="Policy Health"
          value="Stable"
          icon={ShieldCheck}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Regime */}
          <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                  <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                          <TrendingUp className="text-emerald-500" size={24} />
                          New Tax Regime
                      </h3>
                      <p className="text-xs font-medium text-slate-500">Default regime for FY 2026-27</p>
                  </div>
                  <Badge className="rounded-xl px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border-0 font-bold uppercase tracking-widest text-[10px]">
                    Current Standard
                  </Badge>
              </div>

              <EnterpriseCard className="p-0 overflow-hidden border-emerald-500/20 shadow-emerald-500/5">
                <Table>
                    <TableHeader className="bg-emerald-500/[0.03]">
                        <TableRow className="border-emerald-500/10 hover:bg-transparent">
                            <TableHead className="table-header-cell text-emerald-700 dark:text-emerald-400">Income Bracket (Annual)</TableHead>
                            <TableHead className="table-header-cell text-emerald-700 dark:text-emerald-400 text-right">Tax Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {newRegime.map((slab, i) => (
                            <TableRow key={slab.id} className="border-emerald-500/5 hover:bg-emerald-500/[0.02] transition-colors">
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                            ₹{slab.minimum_income.toLocaleString()} - {slab.maximum_income ? `₹${slab.maximum_income.toLocaleString()}` : '∞'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-5">
                                    <div className="flex items-center justify-end gap-3">
                                        {slab.tax_percentage > 0 && (
                                            <span className="text-[10px] text-slate-400 font-bold">+4% Cess</span>
                                        )}
                                        <Badge className={cn(
                                          "rounded-lg px-3 py-1 font-black text-sm border-0",
                                          slab.tax_percentage === 0 
                                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' 
                                            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        )}>
                                            {slab.tax_percentage}%
                                        </Badge>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </EnterpriseCard>
          </div>

          {/* Old Regime */}
          <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                  <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                          <History className="text-slate-400" size={24} />
                          Old Tax Regime
                      </h3>
                      <p className="text-xs font-medium text-slate-500">Legacy system with itemized deductions</p>
                  </div>
                  <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Legacy Support
                  </Badge>
              </div>

              <EnterpriseCard className="p-0 overflow-hidden border-slate-200/50">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                            <TableHead className="table-header-cell">Income Bracket (Annual)</TableHead>
                            <TableHead className="table-header-cell text-right">Tax Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {oldRegime.map((slab, i) => (
                            <TableRow key={slab.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-black">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                                            ₹{slab.minimum_income.toLocaleString()} - {slab.maximum_income ? `₹${slab.maximum_income.toLocaleString()}` : '∞'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-5">
                                    <Badge className={cn(
                                      "rounded-lg px-3 py-1 font-black text-sm border-0",
                                      slab.tax_percentage === 0 
                                        ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' 
                                        : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    )}>
                                        {slab.tax_percentage}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </EnterpriseCard>
          </div>
      </div>

      <EnterpriseCard 
        title="Tax Regime Impact Analysis"
        description="Comparative analysis of tax efficiency across income cohorts."
        className="border-amber-500/20 shadow-amber-500/5"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 py-4">
           <div className="flex-1 space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">New Regime Adoption</span>
                    <span className="text-emerald-500">82%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-emerald-500" />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Tax Saving Efficiency</span>
                    <span className="text-amber-500">15.4% Optimized</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} className="h-full bg-amber-500" />
                 </div>
              </div>
           </div>
           <div className="w-full md:w-1/3 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
                 <ArrowRightLeft size={32} />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Strategy Shift</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Most employees (Income less than ₹15L) are better off under the New Regime due to higher rebate limits.</p>
           </div>
        </div>
      </EnterpriseCard>
    </div>
  );
};

export default TaxSlabs;
