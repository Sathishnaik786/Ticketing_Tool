import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertCircle,
  FileText,
  Users,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  ShieldAlert,
  Search,
  Settings,
  ArrowUpRight,
  History,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  EnterpriseCard, 
  EnterpriseStatCard, 
  EnterpriseHeader,
  EnterpriseErrorState
} from '@/components/payroll/EnterpriseComponents';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';
import { usePayrollWorkflows, usePendingApprovals, usePayrollVariances } from '../hooks/usePayroll';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const GovernanceDashboard = () => {
  const { data: workflows, isLoading: isWorkflowsLoading, isError: isWorkflowsError, refetch: refetchWorkflows } = usePayrollWorkflows();
  const { data: pending, isLoading: isPendingLoading, isError: isPendingError, refetch: refetchPending } = usePendingApprovals();
  const { data: variances, isLoading: isVariancesLoading, isError: isVariancesError, refetch: refetchVariances } = usePayrollVariances();

  const isLoading = isWorkflowsLoading || isPendingLoading || isVariancesLoading;
  const isError = isWorkflowsError || isPendingError || isVariancesError;

  if (isLoading) return <PayrollDashboardSkeleton />;
  if (isError) return <EnterpriseErrorState onRetry={() => {
    refetchWorkflows();
    refetchPending();
    refetchVariances();
  }} />;


  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Payroll Governance"
        description="Enterprise control layer for multi-stage approval orchestrations and risk-mitigated auditing."
        badge="Governance Control"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <History className="mr-2 h-4 w-4" />
              Full Audit Trail
            </Button>
            <Button className="btn-premium">
              <Settings className="mr-2 h-4 w-4" />
              Policy Config
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Workflow Health"
          value="100%"
          icon={ShieldCheck}
          trend="+2.4%"
          trendType="success"
          color="success"
        />
        <EnterpriseStatCard 
          title="Pending Actions"
          value={pending?.length || 0}
          icon={Clock}
          trend="4 Critical"
          trendType="danger"
          color="warning"
        />
        <EnterpriseStatCard 
          title="Open Variances"
          value={variances?.length || 0}
          icon={AlertCircle}
          trend="-12%"
          trendType="success"
          color="danger"
        />
        <EnterpriseStatCard 
          title="SLA Adherence"
          value="98.2%"
          icon={Activity}
          trend="Target: 95%"
          trendType="neutral"
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EnterpriseCard 
            title="Approval Orchestrations"
            description="Active multi-stage approval chains and current routing efficiency."
            headerActions={
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">
                New Workflow <ChevronRight size={16} />
              </Button>
            }
          >
            <div className="space-y-4">
              {workflows?.map((wf, idx) => (
                <motion.div 
                  key={wf.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="liquid-elevated p-6 rounded-[1.5rem] group hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                        <LayoutDashboard size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{wf.workflow_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 border-slate-200">
                            {wf.steps.length} Stages
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium">Avg. Completion: 4.2h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex -space-x-3 mr-6">
                        {wf.steps.map((step, i) => (
                          <TooltipProvider key={step.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black shadow-sm",
                                  i === 0 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                )}>
                                  {step.step_name[0]}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">{step.step_name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                        <ArrowUpRight size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </EnterpriseCard>

          <EnterpriseCard 
            title="Risk Control Matrix"
            description="Automated risk flags and anomaly detection reports."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="liquid-elevated p-4 rounded-2xl border border-rose-500/20 flex items-start gap-4">
                 <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500">
                    <ShieldAlert size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Tax Variance Detected</p>
                    <p className="text-xs text-slate-500 mt-1">12 records in Cycle #24 show &gt;15% deviation from baseline.</p>
                 </div>
              </div>
              <div className="liquid-elevated p-4 rounded-2xl border border-amber-500/20 flex items-start gap-4">
                 <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Late Payout Risk</p>
                    <p className="text-xs text-slate-500 mt-1">3 approvals pending for Batch-A (Due in 18 hours).</p>
                 </div>
              </div>
            </div>
          </EnterpriseCard>
        </div>

        <div className="space-y-8">
          <EnterpriseCard 
            title="Strategic Actions"
            description="Accelerated governance controls."
          >
            <div className="space-y-3">
              <Link to="/app/payroll/governance/approvals">
                <Button className="liquid-elevated w-full justify-between h-14 rounded-2xl hover:border-primary/50 text-slate-900 dark:text-white group border-transparent shadow-none" variant="outline">
                  <span className="flex items-center gap-3 font-bold">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Pending Approvals
                  </span>
                  <Badge className="bg-primary text-white border-0">{pending?.length || 0}</Badge>
                </Button>
              </Link>
              <Link to="/app/payroll/governance/variances">
                <Button className="liquid-elevated w-full justify-between h-14 rounded-2xl hover:border-primary/50 text-slate-900 dark:text-white group border-transparent shadow-none" variant="outline">
                  <span className="flex items-center gap-3 font-bold">
                    <TrendingUp size={18} className="text-amber-500" />
                    Cycle Variances
                  </span>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                </Button>
              </Link>
              <Button className="liquid-elevated w-full justify-between h-14 rounded-2xl hover:border-primary/50 text-slate-900 dark:text-white group border-transparent shadow-none" variant="outline">
                <span className="flex items-center gap-3 font-bold">
                  <ShieldCheck size={18} className="text-blue-500" />
                  Compliance Scorecard
                </span>
                <span className="text-sm font-black text-emerald-500">98/100</span>
              </Button>
            </div>
          </EnterpriseCard>

          <EnterpriseCard 
            title="Operational Integrity"
            description="System-wide health indicators."
          >
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Data Integrity</span>
                     <span className="text-emerald-500">Excellent</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        className="h-full bg-emerald-500"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Approval Speed</span>
                     <span className="text-blue-500">Optimal</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-blue-500"
                     />
                  </div>
               </div>
            </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;

