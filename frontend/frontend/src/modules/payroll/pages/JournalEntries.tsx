import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ArrowRightLeft, 
  ArrowUpRight, 
  Download, 
  Search,
  CheckCircle2,
  History,
  FileSpreadsheet,
  Plus,
  Filter,
  BarChart3,
  Scale,
  Coins,
  ChevronRight
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
import { usePayrollJournals } from '../hooks/usePayroll';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const JournalEntries = () => {
  const { data: journals, isLoading } = usePayrollJournals();

  const totalDebit = journals?.reduce((sum, j) => sum + Number(j.total_debit), 0) || 0;
  const totalCredit = journals?.reduce((sum, j) => sum + Number(j.total_credit), 0) || 0;

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Journal Entries"
        description="Double-entry accounting orchestration for payroll expenses, statutory payables, and disbursements."
        badge="Financial Ledger"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Ledger
            </Button>
            <Button className="btn-premium bg-violet-600 hover:bg-violet-700 shadow-violet-500/25">
              <Plus className="mr-2 h-4 w-4" />
              Manual Posting
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Total Posted"
          value={`₹${(totalDebit / 100000).toFixed(1)}L`}
          icon={Coins}
          color="finance"
        />
        <EnterpriseStatCard 
          title="Balanced Status"
          value={totalDebit === totalCredit ? 'Perfect' : 'Mismatch'}
          icon={Scale}
          color="success"
        />
        <EnterpriseStatCard 
          title="Pending Posts"
          value={journals?.filter(j => j.journal_status === 'DRAFT').length || 0}
          icon={History}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Journal Health"
          value="99.9%"
          icon={BarChart3}
          color="primary"
        />
      </div>

      <EnterpriseCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search ledger by JV number, cycle, or description..." 
                  className="rounded-xl pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:ring-violet-500/20" 
                />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                 <Filter className="mr-2 h-4 w-4" /> Filter By Entity
               </Button>
            </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
            <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
              <TableHead className="table-header-cell">Journal Reference</TableHead>
              <TableHead className="table-header-cell">Posting Date</TableHead>
              <TableHead className="table-header-cell text-center">Status</TableHead>
              <TableHead className="table-header-cell text-right">Debit Allocation</TableHead>
              <TableHead className="table-header-cell text-right">Credit Allocation</TableHead>
              <TableHead className="table-header-cell text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="h-20 animate-pulse bg-slate-50/30 border-slate-100" />
              ))
            ) : journals?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-64">
                       <EnterpriseEmptyState 
                          title="Ledger Empty"
                          description="No financial journals have been posted for this period yet."
                          icon={BookOpen}
                       />
                    </TableCell>
                </TableRow>
            ) : (
              journals?.map((journal, idx) => (
                <TableRow key={journal.id} className="border-slate-100 dark:border-white/5 hover:bg-violet-500/[0.02] transition-colors group">
                  <TableCell className="py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-black text-xs">
                            JV
                         </div>
                         <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-violet-600 transition-colors">
                            {journal.journal_number}
                         </span>
                      </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-bold text-xs uppercase">
                      {new Date(journal.posting_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "rounded-lg px-3 py-1 font-black text-[10px] uppercase border-0",
                      journal.journal_status === 'POSTED' 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    )}>
                        {journal.journal_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">₹{Number(journal.total_debit).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-bold text-slate-500 text-sm">₹{Number(journal.total_credit).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-violet-600 hover:bg-violet-500/10">
                            <BookOpen size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10">
                            <Download size={18} />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </EnterpriseCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <EnterpriseCard title="Financial Summary" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payroll Liability</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">₹{(totalDebit/1000).toFixed(1)}k</span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUpRight size={14} /> 4.2%</span>
                     </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-violet-500" />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statutory Payables</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">₹12.4k</span>
                        <span className="text-xs font-bold text-amber-500 flex items-center"><ArrowRightLeft size={14} /> Stable</span>
                     </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-emerald-500" />
                  </div>
               </div>
            </div>
         </EnterpriseCard>

         <EnterpriseCard title="Quick Insights" className="bg-violet-500/5 border-violet-500/10">
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">All recent cycles are correctly posted to the general ledger without variances.</p>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                     <AlertCircle size={16} />
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">3 manual entries pending audit verification in the 'Statutory' category.</p>
               </div>
            </div>
         </EnterpriseCard>
      </div>
    </div>
  );
};

const AlertCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

export default JournalEntries;
