import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  History,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard 
} from '@/components/payroll/EnterpriseComponents';
import { useMyPayslips } from '../hooks/useBulkUpload';
import { BulkUploadService } from '../services/bulkUploadService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EmployeePayslipsPage = () => {
  const { data: payslips = [], isLoading } = useMyPayslips();

  const handleDownload = async (payslipId: string, fileName: string) => {
    try {
      const url = await BulkUploadService.getPayslipDownloadUrl(payslipId);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloading payslip...');
    } catch (error) {
      toast.error('Failed to generate download link');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <EnterpriseHeader 
        title="Your Financial Ledger"
        description="Secure access to your immutable salary statements and historical payroll documentation."
        badge="Self-Service Portal"
        actions={
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Enterprise Grade Encryption</span>
             </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
               <History size={20} className="text-primary" />
               Historical Statements
             </h3>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest border-slate-200">
                    <Search size={14} className="mr-2" /> Filter Period
                </Button>
             </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-48 rounded-[2rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
                ))}
            </div>
          ) : payslips.length === 0 ? (
            <div className="p-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                    <FileText size={32} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No statements available yet</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Statements appear here once payroll is processed</p>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {payslips.map((payslip, index) => (
                    <motion.div 
                        key={payslip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-primary transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className="bg-primary/10 text-primary border-none rounded-lg text-[9px] font-black uppercase">Verified</Badge>
                        </div>
                        
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText size={28} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        Statement: {format(new Date(payslip.generated_at), 'MMMM yyyy')}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} className="text-primary" /> Generated {format(new Date(payslip.generated_at), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <p className="text-[9px] text-slate-400 font-mono font-bold truncate">REF: {payslip.payslip_number}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-top border-slate-50 dark:border-white/5 flex items-center justify-between">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5"
                            >
                                View Online <ChevronRight size={14} className="ml-1" />
                            </Button>
                            <Button 
                                size="sm" 
                                className="rounded-xl h-10 px-6 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 flex items-center gap-2"
                                onClick={() => handleDownload(payslip.id, `Payslip_${payslip.payslip_number}.pdf`)}
                            >
                                <Download size={14} /> Download
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
          )}
        </div>

        <div className="space-y-10">
          <EnterpriseCard title="Financial Insights" description="Yearly projection summary.">
            <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Yearly Gross</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">---</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Net Disbursed</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">---</p>
                    </div>
                </div>
            </div>
          </EnterpriseCard>

          <EnterpriseCard title="Verification Hub" description="Validate your statement.">
             <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck size={20} />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Every statement generated by the EMTS ingestion engine carries a unique hash signature for regulatory compliance and fraud prevention.
                </p>
                <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200">
                    Verify Signature
                </Button>
             </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslipsPage;
