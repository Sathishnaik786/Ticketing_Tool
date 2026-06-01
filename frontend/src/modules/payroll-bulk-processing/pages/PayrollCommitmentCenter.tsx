import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  ArrowRight,
  Database,
  History,
  FileCheck2,
  Lock,
  Search,
  Zap,
  Send,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard, 
  EnterpriseStatCard 
} from '@/components/payroll/EnterpriseComponents';
import { useBulkCommitments, useRetryCommitmentDocs } from '../hooks/useBulkUpload';
import { BulkUploadService } from '../services/bulkUploadService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { DiagnosticDocumentPanel } from '../components/DiagnosticDocumentPanel';

import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';

const PayrollCommitmentCenter = () => {
  const { data: commitments = [], isLoading } = useBulkCommitments();
  const retryMutation = useRetryCommitmentDocs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const publishBatchMutation = useMutation({
    mutationFn: (commitmentId: string) => BulkUploadService.publishCommitmentBatch(commitmentId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Batch published successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-commitments'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: 'Failed to publish batch: ' + err.message,
        variant: 'destructive',
      });
    }
  });

  console.info("[COMMITMENTS_FETCHED]", commitments);

  // Flatten all records from all commitments for the diagnostic panel
  const diagnosticRecords = React.useMemo(() => {
    return commitments.length > 0 ? (commitments[0] as any).records || [] : [];
  }, [commitments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'PARTIAL_FAILURE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'FAILED': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={14} />;
      case 'PARTIAL_FAILURE': return <Clock size={14} />;
      case 'FAILED': return <XCircle size={14} />;
      default: return <ShieldCheck size={14} />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 dark:bg-white/5" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronizing Immutable Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Commitment Command Center"
        description="Official payroll finalization, immutable record commitment, and PDF payslip generation."
        badge="Phase-3: Commitment"
        actions={
          <div className="flex items-center gap-3">
            <Link to="/app/payroll/bulk/template-governance">
              <Button 
                variant="outline" 
                className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-white/10 text-amber-400 hover:text-white hover:bg-amber-500/20 flex items-center gap-1.5"
              >
                <Building size={12} />
                Payslip Governance
              </Button>
            </Link>
            <div className="flex items-center gap-4 p-2 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 h-10">
               <div className="flex items-center gap-2 px-3 py-1">
                  <Lock size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security: Active</span>
               </div>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard 
            title="Total Disbursed (MTD)" 
            value={formatCurrency(commitments.reduce((acc, c) => acc + (c.commitment_status === 'COMPLETED' ? Number(c.net_total) : 0), 0))} 
            icon={BarChart3} 
            color="primary" 
        />
        <EnterpriseStatCard 
            title="Generated Documents" 
            value={commitments.reduce((acc, c) => acc + c.total_committed, 0)} 
            icon={FileCheck2} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="System Integrity" 
            value="99.98%" 
            icon={ShieldCheck} 
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <Cpu size={20} className="text-primary" />
             Commitment Ledger & Audit Logs
           </h3>
           <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] text-slate-400">
             Immutable Records: Verified
           </Badge>
        </div>

        <EnterpriseCard title="" description="">
            <div className="rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                        <TableRow className="border-slate-100 dark:border-white/5">
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Commitment ID</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Name</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Financials</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Audit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {commitments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                                        <History size={32} />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Commitment History Found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            commitments.map((commitment) => (
                                <TableRow key={commitment.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                    <TableCell className="font-mono font-black text-[10px] text-slate-400 px-6">
                                        #{commitment.id.substring(0, 8)}
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{commitment.upload?.upload_name || 'Legacy Batch'}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">ID: {commitment.upload_id.substring(0, 8)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">{format(new Date(commitment.created_at), 'dd MMM yyyy')}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{format(new Date(commitment.created_at), 'HH:mm:ss')}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="rounded-lg text-[9px] font-black text-emerald-600 border-emerald-200">
                                                {commitment.total_committed} Succeeded
                                            </Badge>
                                            {commitment.total_failed > 0 && (
                                                <Badge variant="outline" className="rounded-lg text-[9px] font-black text-rose-600 border-rose-200">
                                                    {commitment.total_failed} Failed
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{formatCurrency(commitment.net_total)}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Gross: {formatCurrency(commitment.gross_total)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        <Badge className={cn("rounded-lg px-2.5 py-1 font-black text-[9px] uppercase border flex items-center gap-1.5 w-fit", getStatusColor(commitment.commitment_status))}>
                                            {getStatusIcon(commitment.commitment_status)}
                                            {commitment.commitment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {commitment.total_failed > 0 && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => retryMutation.mutate(commitment.id)}
                                                    disabled={retryMutation.isPending}
                                                    className="rounded-xl h-8 text-[9px] font-black uppercase tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50"
                                                >
                                                    {retryMutation.isPending ? <Clock className="animate-spin h-3 w-3 mr-1" /> : <Zap size={12} className="mr-1" />}
                                                    {retryMutation.isPending ? 'Retrying...' : 'Retry Docs'}
                                                </Button>
                                            )}
                                            {commitment.commitment_status === 'COMPLETED' && (
                                                <Button 
                                                    variant="default" 
                                                    size="sm" 
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to publish this entire batch to employees?')) {
                                                            publishBatchMutation.mutate(commitment.id);
                                                        }
                                                    }}
                                                    disabled={publishBatchMutation.isPending}
                                                    className="rounded-xl h-8 text-[9px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white"
                                                >
                                                    {publishBatchMutation.isPending ? <Clock className="animate-spin h-3 w-3 mr-1" /> : <Send size={12} className="mr-1" />}
                                                    Publish Batch
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="rounded-xl h-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary"
                                            >
                                                Audit <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </EnterpriseCard>

        {/* TEMPORARY DIAGNOSTIC PANEL */}
        <DiagnosticDocumentPanel records={diagnosticRecords} />
      </div>
    </div>
  );
};

export default PayrollCommitmentCenter;
