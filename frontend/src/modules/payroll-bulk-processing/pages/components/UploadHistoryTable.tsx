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
import { ChevronRight, FileSpreadsheet, Clock, AlertCircle } from 'lucide-react';
import { EnterpriseCard } from '@/components/payroll/EnterpriseComponents';
import { cn } from '@/lib/utils';

interface BulkUpload {
  id: string;
  file_name: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  created_at: string;
}

interface UploadHistoryTableProps {
  uploads: BulkUpload[];
  onViewDetails: (id: string) => void;
}

export const UploadHistoryTable = ({ uploads, onViewDetails }: UploadHistoryTableProps) => {
  return (
    <EnterpriseCard className="p-0 overflow-hidden" title="Ingestion History">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
            <TableHead className="table-header-cell">Batch Identity</TableHead>
            <TableHead className="table-header-cell">Ingestion State</TableHead>
            <TableHead className="table-header-cell text-right">Volume</TableHead>
            <TableHead className="table-header-cell text-right">Quality</TableHead>
            <TableHead className="table-header-cell text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No ingestion batches found
              </TableCell>
            </TableRow>
          ) : (
            uploads.map((upload) => (
              <TableRow 
                key={upload.id} 
                className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] group transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                        {upload.file_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        <Clock size={10} /> {new Date(upload.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest border-0",
                    upload.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                    upload.status === 'VALIDATED' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-amber-500/10 text-amber-600'
                  )}>
                    {upload.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-black text-slate-900 dark:text-white tabular-nums">
                  {upload.total_rows} rows
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-emerald-500">{upload.valid_rows} OK</span>
                       {upload.error_rows > 0 && (
                         <span className="text-xs font-bold text-rose-500">{upload.error_rows} Err</span>
                       )}
                    </div>
                    <div className="w-20 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-emerald-500" 
                         style={{ width: `${(upload.valid_rows / upload.total_rows) * 100}%` }} 
                       />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => onViewDetails(upload.id)}
                  >
                    <ChevronRight size={18} className="text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </EnterpriseCard>
  );
};
