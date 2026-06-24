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
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { EnterpriseCard } from '@/components/payroll/EnterpriseComponents';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ValidationError {
  field: string;
  message: string;
}

interface BulkUploadRow {
  id: string;
  row_data: any;
  validation_errors: ValidationError[];
  is_valid: boolean;
}

interface RowValidationErrorViewerProps {
  rows: BulkUploadRow[];
}

export const RowValidationErrorViewer = ({ rows }: RowValidationErrorViewerProps) => {
  const errorRows = rows.filter(r => !r.is_valid);

  return (
    <EnterpriseCard 
        title="Structural Validation Audit" 
        description="Deep scan results of individual row schemas."
        className="border-rose-500/10 shadow-rose-500/5"
    >
      <Table>
        <TableHeader className="bg-rose-500/[0.02]">
          <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
            <TableHead className="table-header-cell w-16">Row</TableHead>
            <TableHead className="table-header-cell">Employee Hint</TableHead>
            <TableHead className="table-header-cell">Conflict Mapping</TableHead>
            <TableHead className="table-header-cell text-right">Action State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errorRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={24} />
                   </div>
                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Zero Conflicts Detected</p>
                   <p className="text-[10px] text-slate-500 font-bold">All rows passed structural integrity checks.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            errorRows.map((row, i) => (
              <TableRow key={row.id} className="border-slate-100 dark:border-white/5 hover:bg-rose-500/[0.01] group transition-colors">
                <TableCell className="font-mono text-[10px] font-black text-slate-400">
                  #{i + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {row.row_data['Employee Name'] || row.row_data['Employee Code'] || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {row.row_data['Department'] || 'General'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {row.validation_errors.map((error, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="rounded-lg px-2 py-1 bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-[10px] flex items-center gap-1.5 cursor-help">
                              <AlertCircle size={10} />
                              {error.field}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl bg-slate-900 text-white border-0 p-3 shadow-2xl">
                            <p className="text-xs font-bold">{error.message}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge className="bg-rose-500 text-white font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-md">
                    REJECTED
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </EnterpriseCard>
  );
};
