import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  History, 
  ShieldCheck, 
  AlertCircle,
  LayoutDashboard,
  ArrowLeft,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard, 
  EnterpriseEmptyState 
} from '@/components/payroll/EnterpriseComponents';
import { UploadDropzone } from './components/UploadDropzone';
import { ValidationSummaryCards } from './components/ValidationSummaryCards';
import { UploadHistoryTable } from './components/UploadHistoryTable';
import { RowValidationErrorViewer } from './components/RowValidationErrorViewer';
import { useBulkUploads, useUploadPayroll, useBulkUploadRows, useBulkUploadDetail } from '../hooks/useBulkUpload';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PayrollUploadCenter = () => {
  const navigate = useNavigate();
  const { data: uploads = [], isLoading: historyLoading, refetch } = useBulkUploads();
  const uploadMutation = useUploadPayroll();
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const { data: uploadDetail } = useBulkUploadDetail(selectedUploadId || '');
  const { data: uploadRows = [] } = useBulkUploadRows(selectedUploadId || '');

  const handleUpload = async (file: File, name: string) => {
    try {
      const result = await uploadMutation.mutateAsync({ file, name });
      navigate(`/app/payroll/bulk/preview/${result.uploadId}`);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };


  const handleDownloadTemplate = () => {
    // Generate a simple CSV/XLSX template structure
    const headers = [
      'Employee Code', 'Employee Name', 'Department', 'Designation', 
      'Month', 'Year', 'Basic', 'HRA', 'Special Allowance', 'Bonus', 
      'PF', 'Professional Tax', 'Income Tax', 'Gross Salary', 'Net Salary',
      'Bank Name', 'Bank Account', 'UAN', 'PAN'
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payroll_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20">
      <EnterpriseHeader 
        title="Payroll Ingestion Engine"
        description="Enterprise-grade bulk upload and structural validation center for payroll master records."
        badge="Batch Processing"
        actions={
          <>
            <Button 
                variant="outline" 
                className="rounded-2xl h-12 px-6 border-border-soft font-bold text-slate-600"
                onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
            <Button className="btn-premium" onClick={() => setSelectedUploadId(null)}>
              <Zap className="mr-2 h-4 w-4" /> New Upload
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {!selectedUploadId ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EnterpriseCard 
                title="Data Upload" 
                description="Securely upload your Excel payroll master for Phase-1 structural validation."
              >
                <UploadDropzone onUpload={handleUpload} isUploading={uploadMutation.isPending} />
              </EnterpriseCard>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <Button variant="ghost" className="font-bold text-slate-500 hover:text-primary" onClick={() => setSelectedUploadId(null)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                </Button>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black uppercase tracking-widest text-[10px]">
                  Batch ID: {selectedUploadId.substring(0, 8)}
                </Badge>
              </div>

              {uploadDetail && (
                <>
                  <ValidationSummaryCards summary={uploadDetail.validation_summary} />
                  
                  <Tabs defaultValue="errors" className="w-full">
                    <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl h-14 w-full justify-start gap-2">
                        <TabsTrigger value="errors" className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 shadow-sm">
                            <AlertCircle size={14} className="mr-2" /> Validation Log
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 shadow-sm">
                            <FileText size={14} className="mr-2" /> Raw Row Data
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-8">
                        <TabsContent value="errors">
                            <RowValidationErrorViewer rows={uploadRows} />
                        </TabsContent>
                        <TabsContent value="raw">
                            <EnterpriseCard title="Raw Data Snapshot" description="Preview of first 100 rows from the parsed file.">
                                <UploadHistoryTable uploads={[]} onViewDetails={() => {}} /> {/* Placeholder for raw table if needed */}
                                <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Data Grid visualization in development for Phase-2</p>
                            </EnterpriseCard>
                        </TabsContent>
                    </div>
                  </Tabs>
                </>
              )}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                 <History size={20} className="text-primary" />
                 Upload History
               </h3>
               <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => refetch()}>
                 <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
               </Button>
            </div>
            <UploadHistoryTable 
              uploads={uploads} 
              onViewDetails={(id) => navigate(`/app/payroll/bulk/preview/${id}`)} 
            />
          </div>
        </div>

        <div className="space-y-10">
          <EnterpriseCard title="Validation Engine Status" description="Structural checks active.">
             <div className="space-y-6 py-4">
                {[
                  { label: 'Schema Integrity', status: 'Active', color: 'bg-emerald-500' },
                  { label: 'DataType Check', status: 'Active', color: 'bg-emerald-500' },
                  { label: 'Cross-Row Deduplication', status: 'Active', color: 'bg-emerald-500' },
                  { label: 'Numeric Variance', status: 'Active', color: 'bg-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.status}</span>
                       <div className={cn("w-2 h-2 rounded-full animate-pulse", item.color)} />
                    </div>
                  </div>
                ))}
             </div>
          </EnterpriseCard>

          <EnterpriseCard title="Operational Matrix" description="System constraints for Phase-1.">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                 <div className="flex items-center gap-2 text-amber-600">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Security Protocol</span>
                 </div>
                 <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                   Files are scanned for MIME integrity. Max file size: 10MB. Row limit per batch: 10,000.
                 </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                 <div className="flex items-center gap-2 text-blue-600">
                    <LayoutDashboard size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Workflow Step</span>
                 </div>
                 <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                   Phase-1 focuses on <span className="font-bold">Validation Only</span>. Record mapping to HR master occurs in Phase-2.
                 </p>
              </div>
            </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default PayrollUploadCenter;
