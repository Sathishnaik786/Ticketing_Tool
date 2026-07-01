import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Users, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Database,
  Fingerprint,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard, 
  EnterpriseStatCard 
} from '@/components/payroll/EnterpriseComponents';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BulkUploadService } from '../services/bulkUploadService';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

const PayrollIdentityPreparation = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: report, isLoading } = useQuery({
    queryKey: ['payroll-identity-readiness'],
    queryFn: BulkUploadService.getIdentityReadiness,
  });

  const normalizeMutation = useMutation({
    mutationFn: (id: string) => BulkUploadService.normalizeEmployeeIdentity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-identity-readiness'] });
      toast.success('Employee identity standardized successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to normalize employee');
    }
  });

  const backfillMutation = useMutation({
    mutationFn: BulkUploadService.backfillCodes,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-identity-readiness'] });
      toast.success(`Successfully generated ${data.count} employee codes`);
    },
    onError: (error: any) => {
      toast.error('Failed to generate codes');
    }
  });

  const handleBackfill = () => {
    if (window.confirm('This will generate sequential employee codes (TK001, TK002...) for all employees who do not have one. This is a one-time setup action. Proceed?')) {
        backfillMutation.mutate();
    }
  };

  const repairMutation = useMutation({
    mutationFn: BulkUploadService.repairIdentityData,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-identity-readiness'] });
      toast.success(`Successfully repaired ${data.successCount} identity records`);
    },
    onError: (error: any) => {
      toast.error('Identity repair failed');
    }
  });

  const handleRepair = () => {
    if (window.confirm('CRITICAL ACTION: This will reconstruct and normalize all payroll identity fields from source master data. Use only if data is corrupted or shifted. Proceed?')) {
        repairMutation.mutate();
    }
  };

  const handleNormalizeAll = async () => {
    if (!report?.missingFields?.length) return;
    
    if (window.confirm(`Are you sure you want to normalize and standardize ${report.missingFields.length} employees? This will update their master records to be payroll-compliant.`)) {
        toast.info('Starting batch normalization...');
        for (const item of report.missingFields) {
            await normalizeMutation.mutateAsync(item.id);
        }
        toast.success('Batch normalization completed');
    }
  };

  const filteredMissing = report?.missingFields?.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10 pb-20">
      <EnterpriseHeader 
        title="Payroll Identity Preparation Center"
        description="Standardize employee master data to achieve 100% automated mapping accuracy during payroll ingestion."
        badge="Enterprise Governance"
        actions={
          <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                onClick={handleBackfill}
                disabled={backfillMutation.isPending}
                className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
                {backfillMutation.isPending ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
                Generate Missing Codes
             </Button>
             <Button 
                variant="outline"
                onClick={handleRepair}
                disabled={repairMutation.isPending}
                className="rounded-2xl h-12 px-6 border-rose-200 dark:border-rose-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-rose-600 hover:bg-rose-50"
             >
                {repairMutation.isPending ? <RefreshCw className="animate-spin" size={14} /> : <AlertTriangle size={14} />}
                Emergency Repair
             </Button>
             <Button 
                onClick={handleNormalizeAll}
                disabled={!report?.missingFields?.length || normalizeMutation.isPending}
                className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2"
             >
                {normalizeMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                Normalize All Identities
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
            title="Total Workforce" 
            value={report?.totalEmployees || 0} 
            icon={Users} 
            color="neutral" 
        />
        <EnterpriseStatCard 
            title="Payroll Ready" 
            value={report?.readyCount || 0} 
            icon={UserCheck} 
            color="success" 
        />
        <EnterpriseStatCard 
            title="Action Required" 
            value={report?.missingFields?.length || 0} 
            icon={UserX} 
            color="danger" 
        />
        <EnterpriseStatCard 
            title="Readiness Score" 
            value={`${Math.round((report?.readyCount / (report?.totalEmployees || 1)) * 100)}%`} 
            icon={CheckCircle2} 
            color="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
            <EnterpriseCard 
                title="Identity Resolution Queue" 
                description="Employees requiring standardization before they can be auto-mapped."
            >
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by employee name..."
                            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-white/5">
                            <TableRow>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 px-6">Employee</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Compliance Gaps</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1,2,3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={3} className="h-20 animate-pulse bg-slate-50/50 dark:bg-white/[0.02]" />
                                    </TableRow>
                                ))
                            ) : filteredMissing.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <CheckCircle2 size={32} className="text-emerald-500 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Workforce is 100% Payroll Ready</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMissing.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                        <TableCell className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{item.name}</p>
                                                {item.existingCode && (
                                                    <p className="text-[10px] font-bold text-slate-400">ID: {item.existingCode}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {item.fields.map((f: string) => (
                                                    <Badge key={f} variant="outline" className="rounded-lg text-[8px] font-black uppercase tracking-tighter text-rose-500 border-rose-200 bg-rose-500/5">
                                                        Missing {f.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                                {!item.eligible && (
                                                    <Badge variant="outline" className="rounded-lg text-[8px] font-black uppercase tracking-tighter text-amber-500 border-amber-200 bg-amber-500/5">
                                                        Payroll Ineligible
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => normalizeMutation.mutate(item.id)}
                                                disabled={normalizeMutation.isPending}
                                                className="h-8 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                                            >
                                                {normalizeMutation.isPending ? <RefreshCw className="animate-spin mr-1" size={12} /> : <Zap size={12} className="mr-1" />}
                                                Standardize
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

        <div className="space-y-6">
            <EnterpriseCard title="Governance Rules" description="Standardization protocols.">
                <div className="space-y-6 py-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <Fingerprint className="text-blue-500 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Numeric Identity Resolution</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                System utilizes enterprise numeric codes (e.g. 153532) as the canonical mapping identifier.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Deterministic Keys</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Identity keys are formatted as <code>CODE|NORMALIZED_NAME</code> to ensure 100% automated matching accuracy.
                            </p>
                        </div>
                    </div>
                </div>
            </EnterpriseCard>

            <EnterpriseCard title="Batch Integrity" description="Identity collision reports.">
                {report?.duplicates?.length > 0 ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                            <AlertTriangle className="text-rose-500" size={20} />
                            <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest">
                                {report.duplicates.length} Collisions Detected
                            </p>
                        </div>
                        <div className="space-y-2">
                            {report.duplicates.map((dup: any, i: number) => (
                                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[9px] font-mono font-bold text-slate-400 truncate">{dup.identityKey}</p>
                                    <p className="text-[10px] font-black text-rose-500 uppercase mt-1">{dup.employeeIds.length} Duplicate Records</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center mx-auto text-emerald-500 opacity-20">
                            <ShieldCheck size={24} />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">No Collisions Detected</p>
                    </div>
                )}
            </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default PayrollIdentityPreparation;
