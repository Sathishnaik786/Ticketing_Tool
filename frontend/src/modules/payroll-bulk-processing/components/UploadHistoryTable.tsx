import React from 'react';
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
import { ChevronRight, FileText, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BulkUpload } from '../types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UploadHistoryTableProps {
  uploads: BulkUpload[];
  onViewDetails: (id: string) => void;
}

export const UploadHistoryTable: React.FC<UploadHistoryTableProps> = ({ uploads, onViewDetails }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VALIDATED': return 'bg-emerald-500/10 text-emerald-600 border-0';
      case 'VALIDATING': return 'bg-blue-500/10 text-blue-600 border-0 animate-pulse';
      case 'FAILED': return 'bg-rose-500/10 text-rose-600 border-0';
      default: return 'bg-slate-500/10 text-slate-600 border-0';
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
          <TableRow className="border-slate-100 dark:border-white/5">
            <TableHead className="table-header-cell">Upload Batch</TableHead>
            <TableHead className="table-header-cell">Uploaded By</TableHead>
            <TableHead className="table-header-cell">Records</TableHead>
            <TableHead className="table-header-cell">Status</TableHead>
            <TableHead className="table-header-cell">Integrity</TableHead>
            <TableHead className="table-header-cell text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No upload history found
              </TableCell>
            </TableRow>
          ) : (
            uploads.map((upload) => (
              <TableRow key={upload.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{upload.upload_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest mt-0.5">
                        <Clock size={10} /> {format(new Date(upload.created_at), 'dd MMM yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary uppercase">
                      UI
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Admin User</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-black text-xs text-slate-900 dark:text-white">
                  {upload.total_rows}
                </TableCell>
                <TableCell>
                  <Badge className={cn("rounded-lg px-2.5 py-1 font-black text-[10px] uppercase", getStatusStyle(upload.upload_status))}>
                    {upload.upload_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 w-24">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                      <span>{upload.successful_rows} / {upload.total_rows}</span>
                      <span>{upload.total_rows > 0 ? Math.round((upload.successful_rows / upload.total_rows) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${upload.total_rows > 0 ? (upload.successful_rows / upload.total_rows) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewDetails(upload.id)}
                  >
                    <ChevronRight size={20} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
