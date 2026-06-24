import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  TrendingDown,
  DollarSign,
  FileText,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';
import { BulkUploadService } from '../services/bulkUploadService';
import { Button } from '@/components/ui/button';
import { DownloadPayrollTemplateButton } from '../components/DownloadPayrollTemplateButton';
import { 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseCard, 
  EnterpriseErrorState,
  EnterpriseEmptyState
} from '@/components/payroll/EnterpriseComponents';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { 
  useBulkUploadDetail, 
  useBulkPreview, 
  useMapEmployees, 
  useCommitUpload 
} from '../hooks/useBulkUpload';

const PayrollUploadPreview = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch Details via Centralized Hooks
  const { 
    data: upload, 
    isLoading: isUploadLoading, 
    error: uploadError,
    refetch: refetchUpload 
  } = useBulkUploadDetail(uploadId!);

  const { 
    data: preview, 
    isLoading: isPreviewLoading, 
    error: previewError,
    refetch: refetchPreview 
  } = useBulkPreview(uploadId!);

  // 2. Operations via Standardized Hooks
  const mapMutation = useMapEmployees();
  const commitMutation = useCommitUpload();

  // Handle successful commit navigation
  React.useEffect(() => {
    if (commitMutation.isSuccess) {
      navigate('/app/payroll/bulk/commitments');
    }
  }, [commitMutation.isSuccess, navigate]);

  const handleRetry = () => {
    refetchUpload();
    refetchPreview();
  };

  if (isUploadLoading || isPreviewLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 dark:bg-white/5" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Bootstrapping Operational Intelligence...</p>
      </div>
    );
  }

  if (uploadError || previewError) {
    return (
      <div className="p-20">
        <EnterpriseErrorState 
          title="Batch Synchronization Failure"
          description="The operational layer could not retrieve the requested payroll batch. This may be due to network instability or an expired batch session."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!upload) {
    return (
      <div className="p-20">
        <EnterpriseEmptyState 
          title="Batch Not Found"
          description="The requested payroll upload batch does not exist or has been archived."
          icon={Database}
          action={
            <Button onClick={() => navigate('/payroll/bulk')} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
              Return to Upload Center
            </Button>
          }
        />
      </div>
    );
  }


  const mappingSuccessRate = preview ? Math.round((preview.matched_rows / preview.total_rows) * 100) : 0;

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Payroll Operational Preview"
        description={`Executing batch: ${upload?.upload_name || 'Standard Batch'}`}
        badge="Phase 1 Execution"
        actions={
          <div className="flex items-center gap-4">
             <DownloadPayrollTemplateButton />
             <Button 
                onClick={() => mapMutation.mutate(uploadId!)}
                disabled={mapMutation.isPending}
                className="rounded-2xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-500/10"
             >
                {mapMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                Run Auto-Mapping
             </Button>
             <Button 
                onClick={() => commitMutation.mutate(uploadId!)}
                disabled={preview?.preview_status !== 'READY' || commitMutation.isPending}
                className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2"
             >
                {commitMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                Commit Payroll
             </Button>
          </div>
        }
      />

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
            title="Total Payout" 
            value={formatCurrency(preview?.net_total || 0)} 
            icon={DollarSign} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="Total Deductions" 
            value={formatCurrency((preview?.gross_total || 0) - (preview?.net_total || 0))} 
            icon={TrendingDown} 
            color="danger" 
        />
        <EnterpriseStatCard 
            title="Mapping Success" 
            value={`${mappingSuccessRate}%`} 
            icon={CheckCircle2} 
            color={mappingSuccessRate === 100 ? "success" : "primary"} 
        />
        <EnterpriseStatCard 
            title="Batch Status" 
            value={preview?.preview_status || 'PENDING'} 
            icon={FileText} 
            color={preview?.preview_status === 'READY' ? "success" : "neutral"} 
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <LayoutDashboard size={20} className="text-primary" />
             Payroll Row Intelligence
           </h3>
           <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-3 py-1 bg-primary/5 text-primary border-primary/20">
                Deterministic Resolution: Active
              </Badge>
           </div>
        </div>

        <EnterpriseCard title="" description="">
            <div className="rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                        <TableRow className="border-slate-100 dark:border-white/5">
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Salary</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Additions</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Deductions</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Net Payout</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {preview?.metadata?.calculatedDetails?.map((row: any) => (
                            <TableRow key={row.rowId} className="border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{row.employeeName}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-bold text-slate-400">ID: {row.employeeCode}</p>
                                            <Badge variant="outline" className="text-[8px] h-4 font-black bg-slate-100 dark:bg-white/5 uppercase">
                                                {row.metadata?.salaryStructureType || 'AUTO'}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatCurrency(row.base)}</p>
                                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">B: {formatCurrency(row.base)} | H: {formatCurrency(row.hra)}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-emerald-600">{formatCurrency((row.additions?.bonus || 0) + (row.additions?.incentives || 0) + (row.additions?.overtime || 0))}</p>
                                        <p className="text-[9px] font-medium text-emerald-600/60 uppercase tracking-tighter">OT: {formatCurrency(row.additions?.overtime || 0)}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-rose-600">{formatCurrency((row.deductions?.pf || 0) + (row.deductions?.tds || 0) + (row.deductions?.esi || 0) + (row.deductions?.pt || 0) + (row.deductions?.other || 0))}</p>
                                        <p className="text-[9px] font-medium text-rose-600/60 uppercase tracking-tighter">PF: {formatCurrency(row.deductions?.pf || 0)} | TX: {formatCurrency(row.deductions?.tds || 0)}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                                    {formatCurrency(row.net)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <Badge className={cn(
                                        "rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-1 border",
                                        row.calculationStatus === 'VALID' 
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                            : row.calculationStatus === 'VALIDATION_ERROR'
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    )}>
                                        {row.calculationStatus === 'VALID' ? 'VERIFIED' : row.notes || row.calculationStatus}
                                    </Badge>
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

export default PayrollUploadPreview;
