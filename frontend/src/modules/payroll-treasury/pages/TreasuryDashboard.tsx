import React from 'react';
import { 
  Building2, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Download,
  Zap,
  Lock,
  FileText
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
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

const TreasuryDashboard = () => {
  // 1. Fetch Disbursement Batches
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['treasury-batches'],
    queryFn: async () => {
        // Mock data for Phase 4
        return [
            {
                id: 'BCH-001',
                batch_reference: 'SAL/BCH/1715754000',
                total_amount: 1250000,
                employee_count: 45,
                status: 'PENDING',
                created_at: new Date().toISOString()
            }
        ];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
        toast.success('Batch Approved by Finance (Checker Step)');
    }
  });

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Treasury Operations & Salary Release"
        description="Enterprise treasury control center for salary disbursements, bank integration, and UTR reconciliation."
        badge="Treasury Governance"
        actions={
          <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
                <Building2 size={14} />
                Bank Config
             </Button>
             <Button 
                className="rounded-2xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-500/10"
             >
                <Zap size={16} />
                Initiate New Batch
             </Button>
          </div>
        }
      />

      {/* Treasury KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
            title="Pending Approval" 
            value={formatCurrency(1250000)} 
            icon={Clock} 
            color="warning" 
        />
        <EnterpriseStatCard 
            title="Total Disbursed (MTD)" 
            value={formatCurrency(0)} 
            icon={CheckCircle2} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="Failed Transfers" 
            value={0} 
            icon={AlertTriangle} 
            color="danger" 
        />
        <EnterpriseStatCard 
            title="Bank Connectivity" 
            value="Active" 
            icon={ShieldCheck} 
            color="primary" 
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <ArrowRightLeft size={20} className="text-primary" />
             Active Disbursement Batches
           </h3>
           <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20 font-black uppercase text-[9px] px-3 py-1">
             Maker-Checker Protocol: Enabled
           </Badge>
        </div>

        <EnterpriseCard title="" description="">
            <div className="rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                        <TableRow className="border-slate-100 dark:border-white/5">
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Reference</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Employees</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {batches.map((batch: any) => (
                            <TableRow key={batch.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{batch.batch_reference}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Generated: {new Date(batch.created_at).toLocaleDateString()}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                                    {formatCurrency(batch.total_amount)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center text-xs font-bold text-slate-600">
                                    {batch.employee_count}
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge className="rounded-lg font-black text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-600 border-amber-500/20">
                                        {batch.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <FileText size={14} className="mr-2" /> Details
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            onClick={() => approveMutation.mutate(batch.id)}
                                            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Lock size={12} /> Approve (Checker)
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200"
                                        >
                                            <Download size={12} className="mr-2" /> Bank File
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </EnterpriseCard>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
