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
import { AlertCircle, XCircle, Info } from 'lucide-react';
import { BulkUploadRow } from '../types';
import { cn } from '@/lib/utils';

interface RowValidationErrorViewerProps {
  rows: BulkUploadRow[];
}

export const RowValidationErrorViewer: React.FC<RowValidationErrorViewerProps> = ({ rows }) => {
  const failedRows = rows.filter(r => r.upload_status !== 'VALID');

  if (failedRows.length === 0) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Zero Anomalies</h4>
          <p className="text-sm text-slate-500 font-medium">All parsed rows have passed structural and business logic validation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <XCircle className="text-rose-500" size={20} />
          <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Validation Failure Log ({failedRows.length})</h4>
        </div>
        <Badge variant="outline" className="rounded-lg text-rose-500 border-rose-500/20 bg-rose-500/5 font-black uppercase tracking-widest text-[10px]">
          Action Required
        </Badge>
      </div>

      <div className="rounded-[2rem] border border-rose-500/10 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-rose-50/50 dark:bg-rose-950/20">
            <TableRow className="border-rose-100/20 dark:border-white/5">
              <TableHead className="table-header-cell">Row</TableHead>
              <TableHead className="table-header-cell">Identifier</TableHead>
              <TableHead className="table-header-cell">Status</TableHead>
              <TableHead className="table-header-cell">Critical Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failedRows.map((row) => (
              <TableRow key={row.id} className="border-rose-100/20 dark:border-white/5 hover:bg-rose-500/[0.02] transition-colors">
                <TableCell className="font-mono font-black text-xs text-slate-400">
                  #{row.row_number}
                </TableCell>
                <TableCell>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.employee_code || 'MISSING'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{row.employee_name || 'N/A'}</p>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-lg px-2 py-0.5 font-black text-[9px] uppercase",
                    row.upload_status === 'DUPLICATE' ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    {row.upload_status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-1.5">
                    {row.validation_errors.map((error, idx) => (
                      <div key={idx} className="flex items-start gap-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span className="text-rose-500 uppercase font-black text-[9px] mr-1">[{error.path}]:</span>
                          {error.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
