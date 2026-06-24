import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Filter,
  ArrowRight,
  DownloadCloud,
  ChevronRight,
  Wallet,
  Coins,
  ReceiptText,
  ShieldAlert,
  Loader2
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
import { useEmployeePayslips, useGeneratePayslip } from '../hooks/usePayroll';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { BulkUploadService } from '../../payroll-bulk-processing/services/bulkUploadService';

const EmployeePayslips = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  console.info("[PAYSLIPS_FETCH_START] Employee ID:", user?.id);

  // 1. Fetch manual core payslips
  const { data: manualPayslips, isLoading: isLoadingManual, isError: isErrorManual, refetch: refetchManual } = useEmployeePayslips(user?.id!);

  // 2. Fetch bulk-uploaded payslips
  const { data: bulkPayslips, isLoading: isLoadingBulk, isError: isErrorBulk, refetch: refetchBulk } = useQuery({
    queryKey: ['bulk-payslips', user?.id],
    queryFn: () => BulkUploadService.getMyPayslips(),
    enabled: !!user?.id
  });

  const isLoading = isLoadingManual || isLoadingBulk;
  const isError = isErrorManual || isErrorBulk;

  const refetch = () => {
    refetchManual();
    refetchBulk();
  };

  // 3. Merge and normalize payslips from both pipelines defensively
  const mergedPayslips = React.useMemo(() => {
    const list: any[] = [];
    
    // Process manual core payslips
    if (Array.isArray(manualPayslips)) {
      manualPayslips.forEach((p: any) => {
        if (!p) return;
        list.push({
          id: p.id || `manual-${Math.random()}`,
          type: 'MANUAL',
          payslipNumber: p.payslip_number || 'N/A',
          generatedAt: p.generated_at || new Date().toISOString(),
          cycleName: p.record?.cycle?.cycle_name || 'Core Payroll Statement',
          netSalary: p.record?.net_salary || 0,
          grossSalary: p.record?.gross_salary || 0,
          recordId: p.record_id || p.record?.id,
          pdfUrl: p.pdf_url
        });
      });
    }

    // Process bulk payslips
    if (Array.isArray(bulkPayslips)) {
      bulkPayslips.forEach((p: any) => {
        if (!p) return;
        // Parse batch details or format month name
        let cycleName = 'Bulk Payroll Statement';
        const match = p.payslip_number?.match(/PAY-(\d{4})(\d{2})/);
        if (match) {
          const year = match[1];
          const monthNum = parseInt(match[2]);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          if (monthNum >= 1 && monthNum <= 12) {
            cycleName = `${months[monthNum - 1]} ${year} Payroll Statement`;
          }
        }
        
        list.push({
          id: p.id || `bulk-${Math.random()}`,
          type: 'BULK',
          payslipNumber: p.payslip_number || 'N/A',
          generatedAt: p.generated_at || new Date().toISOString(),
          cycleName,
          netSalary: p.metadata?.net || p.net_salary || 0,
          grossSalary: p.metadata?.gross || p.gross_salary || 0,
          recordId: p.payroll_record_id,
          pdfUrl: p.pdf_url
        });
      });
    }

    console.info("[PAYSLIPS_FETCH_SUCCESS] Merged count:", list.length);

    // Sort by generatedAt descending (newest first)
    return list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }, [manualPayslips, bulkPayslips]);

  console.info("[PAYSLIPS_RENDER] Rendering count:", mergedPayslips.length);

  const filteredPayslips = React.useMemo(() => {
    return mergedPayslips.filter(p => 
      p.cycleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payslipNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mergedPayslips, searchTerm]);

  const totalNetYtd = mergedPayslips.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
  const lastGross = mergedPayslips[0]?.grossSalary || 0;

  // Handle viewing a payslip (fetches secure signed URL from storage)
  const handleView = async (payslip: any) => {
    try {
      console.info("[DOWNLOAD_TRIGGERED] Action: VIEW, ID:", payslip.id);
      setActionLoadingId(payslip.id);
      
      let url = '';
      if (payslip.type === 'BULK') {
        url = await BulkUploadService.getPayslipDownloadUrl(payslip.id);
      } else {
        if (payslip.recordId) {
          url = await BulkUploadService.getAdminPayslipDownloadUrl(payslip.recordId);
        } else {
          throw new Error('Record reference missing');
        }
      }

      console.info("[SIGNED_URL_RECEIVED] URL successfully generated");
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Failed to retrieve secure view URL");
      }
    } catch (err: any) {
      console.error("Error retrieving view link:", err);
      alert("Error: " + (err.message || "Document is currently unavailable. Please contact HR."));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle downloading a payslip
  const handleDownload = async (payslip: any) => {
    try {
      console.info("[DOWNLOAD_TRIGGERED] Action: DOWNLOAD, ID:", payslip.id);
      setActionLoadingId(payslip.id);
      
      let url = '';
      if (payslip.type === 'BULK') {
        url = await BulkUploadService.getPayslipDownloadUrl(payslip.id);
      } else {
        if (payslip.recordId) {
          url = await BulkUploadService.getAdminPayslipDownloadUrl(payslip.recordId);
        } else {
          throw new Error('Record reference missing');
        }
      }

      console.info("[SIGNED_URL_RECEIVED] URL successfully generated");
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Failed to retrieve secure signed URL");
      }
    } catch (err: any) {
      console.error("Error retrieving download link:", err);
      alert("Error: " + (err.message || "Document is currently unavailable. Please contact HR."));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="My Payslips"
        description="Official payroll statements and verified financial records for your employment."
        badge="Employment Records"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <DownloadCloud className="mr-2 h-4 w-4" /> Download YTD Zip
            </Button>
            <Button className="btn-premium">
              <Filter className="mr-2 h-4 w-4" />
              Tax Year: 2026-27
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Net Received (YTD)"
          value={`₹${(totalNetYtd / 100000).toFixed(2)}L`}
          icon={Wallet}
          color="success"
        />
        <EnterpriseStatCard 
          title="Avg. Monthly"
          value={`₹${(lastGross / 1000).toFixed(1)}k`}
          icon={Coins}
          color="primary"
        />
        <EnterpriseStatCard 
          title="Tax Withheld"
          value="₹42.5k"
          icon={CreditCard}
          color="danger"
        />
        <EnterpriseStatCard 
          title="Verified Status"
          value="Secured"
          icon={ShieldCheck}
          color="payroll"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="section-title uppercase tracking-widest text-xs font-black text-slate-400">Statement History</h3>
              <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                      placeholder="Search month..." 
                      className="rounded-xl pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
           </div>

           {isLoading ? (
             <div className="space-y-4">
               {Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-32 rounded-[2rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
               ))}
             </div>
           ) : isError ? (
             <EnterpriseCard className="p-12 text-center flex flex-col items-center gap-6 border-rose-500/20 bg-rose-500/5">
                <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 shadow-inner">
                   <ShieldAlert size={48} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Sync Failed</h3>
                   <p className="text-slate-500 font-medium max-w-sm">We encountered a secure protocol error while fetching your statements. Please verify your connection or re-authenticate.</p>
                </div>
                <Button onClick={() => refetch()} className="rounded-2xl h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/25">
                   Retry Sync
                </Button>
             </EnterpriseCard>
           ) : filteredPayslips.length === 0 ? (
             <EnterpriseEmptyState 
                title="No Records Found"
                description={searchTerm ? `We couldn't find any payslips matching "${searchTerm}".` : "You haven't received any payslips in this financial year yet."}
                icon={ReceiptText}
             />
           ) : (
             <div className="space-y-4">
               {filteredPayslips.map((payslip, idx) => (
                 <motion.div
                   key={payslip?.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                 >
                   <EnterpriseCard className="p-0 overflow-hidden group">
                      <div className="flex flex-col md:flex-row md:items-stretch">
                         <div className="p-6 md:p-8 flex-1 border-r border-slate-100 dark:border-white/5 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                               <FileText size={32} />
                            </div>
                            <div className="flex-1 space-y-1">
                               <div className="flex items-center gap-3">
                                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{payslip.cycleName}</h4>
                                  <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border-0 font-bold text-[10px]">
                                      Verified Statement
                                  </Badge>
                               </div>
                               <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                  <span>ID: {payslip.payslipNumber}</span>
                                  <span>•</span>
                                  <span>Generated: {new Date(payslip.generatedAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                         <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8 md:w-80 flex flex-col justify-center gap-4">
                            <div className="flex justify-between items-end">
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Payable</p>
                                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">₹{Number(payslip.netSalary).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={actionLoadingId !== null}
                                    onClick={() => handleView(payslip)}
                                    className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                                  >
                                      {actionLoadingId === payslip.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Eye size={18} />
                                      )}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={actionLoadingId !== null}
                                    onClick={() => handleDownload(payslip)}
                                    className="rounded-xl h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all flex items-center justify-center"
                                  >
                                      {actionLoadingId === payslip.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Download size={18} />
                                      )}
                                  </Button>
                               </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500" style={{ width: '100%' }} />
                            </div>
                         </div>
                      </div>
                   </EnterpriseCard>
                 </motion.div>
               ))}
             </div>
           )}
        </div>

        <div className="space-y-8">
           <EnterpriseCard title="Salary Insight" description="Your compensation growth metrics.">
              <div className="space-y-6 py-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annual CTC</p>
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white">₹18.5L</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                       <TrendingUp size={24} />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Tax Efficiency</span>
                          <span className="text-emerald-500">82%</span>
                       </div>
                       <Progress value={82} className="h-2" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">PF Accumulation</span>
                          <span className="text-blue-500">₹4.2k/mo</span>
                       </div>
                       <Progress value={45} className="h-2 bg-blue-500/10" />
                    </div>
                 </div>
              </div>
           </EnterpriseCard>

           <EnterpriseCard title="Quick Assistance" description="Payroll support and queries.">
              <div className="space-y-3 py-2">
                 <Button variant="outline" className="w-full justify-between h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/50 text-slate-900 dark:text-white group">
                    <span className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight">
                       <ReceiptText size={18} className="text-indigo-500" />
                       Investment Proofs
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
                 <Button variant="outline" className="w-full justify-between h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/50 text-slate-900 dark:text-white group">
                    <span className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight">
                       <CreditCard size={18} className="text-amber-500" />
                       Bank Details Update
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
              </div>
           </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslips;
