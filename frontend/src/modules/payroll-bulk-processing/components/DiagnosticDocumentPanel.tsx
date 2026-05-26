import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  RefreshCw,
  Database,
  ShieldCheck,
  Link
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BulkUploadService } from '../services/bulkUploadService';

export const DiagnosticDocumentPanel = ({ records = [] }: { records: any[] }) => {
  const [loadingRecordId, setLoadingRecordId] = useState<string | null>(null);
  const BUCKET_NAME = 'payroll-payslips';

  const handleDownload = async (recordId: string, employeeName: string) => {
    try {
      setLoadingRecordId(recordId);
      const url = await BulkUploadService.getAdminPayslipDownloadUrl(recordId);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Failed to retrieve signed download URL");
      }
    } catch (err: any) {
      console.error("Error retrieving download URL:", err);
      alert("Error: " + err.message);
    } finally {
      setLoadingRecordId(null);
    }
  };

  const handleView = async (recordId: string) => {
    try {
      setLoadingRecordId(recordId);
      const url = await BulkUploadService.getAdminPayslipDownloadUrl(recordId);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Failed to retrieve signed view URL");
      }
    } catch (err: any) {
      console.error("Error retrieving view URL:", err);
      alert("Error: " + err.message);
    } finally {
      setLoadingRecordId(null);
    }
  };

  return (
    <div className="mt-20 p-10 rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Search size={20} className="text-amber-400" />
            Tier-1 Document Diagnostic Panel
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">TEMPORARY QA MONITORING: ACTIVE</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-xl font-black uppercase tracking-widest text-[9px] py-1.5 px-3 flex items-center gap-1.5">
            <Database size={10} />
            Bucket: {BUCKET_NAME}
          </Badge>
          <Badge variant="outline" className="border-amber-500/30 text-amber-500 rounded-xl font-black uppercase tracking-widest text-[9px] py-1.5 px-3">
            Live Trace: Enabled
          </Badge>
        </div>
      </div>

      <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02]">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5">
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Employee Code</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Employee Name</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Doc Status</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Upload Verification</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Signed URL status</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6">Storage Path</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-slate-500 py-6 px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  No diagnostic data in buffer
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="border-white/5 hover:bg-white/[0.01] transition-colors">
                  <TableCell className="font-mono text-[9px] text-slate-400 px-6 py-4">
                    {record.employee_code || '---'}
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-white px-6 py-4 uppercase">
                    {record.employee_name || '---'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={cn(
                      "rounded-lg font-black text-[8px] uppercase px-2 py-0.5 border",
                      record.document_status === 'GENERATED' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : record.document_status === 'FAILED'
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                      {record.document_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {record.storage_path ? (
                      <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-tight">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Verified Upload
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] text-rose-400 font-bold uppercase tracking-tight">
                        <XCircle size={12} className="text-rose-500" />
                        Pending/Failed
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {record.document_status === 'GENERATED' ? (
                      <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-tight">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        Link Secure
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                        <Clock size={12} className="text-slate-500" />
                        Not Available
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[9px] text-slate-400 px-6 py-4 truncate max-w-[200px]">
                    {record.storage_path || record.generation_error || '---'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {record.document_status === 'GENERATED' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={loadingRecordId !== null}
                            onClick={() => handleView(record.id)}
                            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5"
                          >
                            {loadingRecordId === record.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye size={12} />
                            )}
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingRecordId !== null}
                            onClick={() => handleDownload(record.id, record.employee_name)}
                            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 flex items-center gap-1.5"
                          >
                            {loadingRecordId === record.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download size={12} />
                            )}
                            Download
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Unavailable</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
