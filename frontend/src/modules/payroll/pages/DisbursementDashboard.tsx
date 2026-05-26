import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRightLeft,
  Search,
  Filter,
  Zap,
  Banknote,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Landmark,
  ArrowUpRight,
  MoreHorizontal,
  Download
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
import { usePayrollDisbursements, useProcessDisbursementBatch } from '../hooks/usePayroll';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DisbursementDashboard = () => {
  const { data: disbursements, isLoading } = usePayrollDisbursements();
  const processMutation = useProcessDisbursementBatch();

  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-600 border-0';
        case 'FAILED': return 'bg-rose-500/10 text-rose-600 border-0';
        case 'PROCESSING': return 'bg-blue-500/10 text-blue-600 border-0 animate-pulse';
        default: return 'bg-amber-500/10 text-amber-600 border-0';
    }
  };

  const totalAmount = disbursements?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const processedAmount = disbursements?.filter(d => d.disbursement_status === 'SUCCESS').reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const pendingAmount = disbursements?.filter(d => d.disbursement_status === 'PENDING' || d.disbursement_status === 'PROCESSING').reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const handleProcessAll = () => {
      const pendingIds = disbursements?.filter(d => d.disbursement_status === 'PENDING').map(d => d.id);
      if (pendingIds && pendingIds.length > 0) {
          processMutation.mutate(pendingIds);
      }
  };

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Salary Disbursements"
        description="Bank-integrated payout orchestration engine tracking the full lifecycle of salary credits."
        badge="Payout Center"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <Download className="mr-2 h-4 w-4" /> Export Batch
            </Button>
            <Button 
                className="btn-premium bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                onClick={handleProcessAll}
                disabled={processMutation.isPending || !disbursements?.some(d => d.disbursement_status === 'PENDING')}
            >
                <Zap className="mr-2 h-4 w-4" /> Authorize Batch Payout
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Total Payout"
          value={`₹${(totalAmount / 100000).toFixed(1)}L`}
          icon={Landmark}
          color="primary"
        />
        <EnterpriseStatCard 
          title="Processed"
          value={`₹${(processedAmount / 100000).toFixed(1)}L`}
          icon={CheckCircle2}
          trend={`${((processedAmount / totalAmount) * 100).toFixed(0)}%`}
          trendType="success"
          color="success"
        />
        <EnterpriseStatCard 
          title="In-Flight"
          value={`₹${(pendingAmount / 100000).toFixed(1)}L`}
          icon={Clock}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Failures"
          value={disbursements?.filter(d => d.disbursement_status === 'FAILED').length || 0}
          icon={XCircle}
          trend="0.0% Rate"
          trendType="neutral"
          color="danger"
        />
      </div>

      <EnterpriseCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by employee, bank ref, or status..." 
                  className="rounded-xl pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:ring-emerald-500/20" 
                />
            </div>
            <div className="flex gap-2">
                <Badge variant="outline" className="rounded-xl h-9 px-4 border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900">HDFC Corporate</Badge>
                <Badge variant="outline" className="rounded-xl h-9 px-4 border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900">UPI Payout</Badge>
            </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
            <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
              <TableHead className="table-header-cell">Employee Beneficiary</TableHead>
              <TableHead className="table-header-cell">Transaction Amount</TableHead>
              <TableHead className="table-header-cell text-center">Status</TableHead>
              <TableHead className="table-header-cell">Bank Reference</TableHead>
              <TableHead className="table-header-cell">Timestamp</TableHead>
              <TableHead className="table-header-cell text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="h-20 animate-pulse bg-slate-50/30 border-slate-100" />
              ))
            ) : disbursements?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-64">
                       <EnterpriseEmptyState 
                          title="No Disbursements"
                          description="No salary payouts are scheduled for processing in this window."
                          icon={Banknote}
                       />
                    </TableCell>
                </TableRow>
            ) : (
              disbursements?.map((item, idx) => (
                <TableRow key={item.id} className="border-slate-100 dark:border-white/5 hover:bg-emerald-500/[0.02] transition-colors group">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black text-xs">
                                {item.record?.employee?.first_name[0]}{item.record?.employee?.last_name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.record?.employee?.first_name} {item.record?.employee?.last_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.record?.employee?.employee_id}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 font-mono font-black text-slate-900 dark:text-white">
                    ₹{Number(item.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center py-5">
                    <Badge className={cn("rounded-lg px-3 py-1 font-black text-[10px] uppercase", getStatusStyle(item.disbursement_status))}>
                        {item.disbursement_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 tracking-tighter">
                          {item.bank_reference_no || '---'}
                       </span>
                       <span className="text-[10px] text-slate-400 font-medium">HDFC-DIRECT-PAY</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-slate-400 font-bold text-[10px] uppercase">
                      {item.processed_at ? new Date(item.processed_at).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'PENDING'}
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10">
                        <MoreHorizontal size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </EnterpriseCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <EnterpriseCard title="Payout Velocity" description="Authorization to credit timing analytics.">
            <div className="space-y-8 py-4">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Credit Time</p>
                     <h4 className="text-2xl font-black text-slate-900 dark:text-white">12.4 Minutes</h4>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                     <TrendingUp size={24} />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Success Rate</span>
                     <span className="text-emerald-500">99.98%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '99.98%' }} className="h-full bg-emerald-500" />
                  </div>
               </div>
            </div>
         </EnterpriseCard>
         <EnterpriseCard title="Bank Connectivity" description="Direct integration health indicators.">
            <div className="grid grid-cols-2 gap-4 py-4">
               <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">HDFC API</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latency: 45ms</p>
               </div>
               <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">UPI Gateway</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latency: 120ms</p>
               </div>
            </div>
         </EnterpriseCard>
      </div>
    </div>
  );
};

export default DisbursementDashboard;
