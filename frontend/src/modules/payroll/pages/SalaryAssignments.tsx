import React from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus,
  History,
  ArrowUpRight,
  User,
  CreditCard,
  Download,
  Filter,
  ArrowUpDown,
  Inbox,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePayrollAssignments } from '../hooks/usePayroll';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  EnterpriseCard, 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseEmptyState,
  EnterpriseErrorState
} from '@/components/payroll/EnterpriseComponents';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

const SalaryAssignments = () => {
  const { data: assignments, isLoading, isError, refetch } = usePayrollAssignments();

  if (isLoading) return <PayrollDashboardSkeleton />;
  if (isError) return <EnterpriseErrorState onRetry={() => refetch()} />;


  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
            <Briefcase size={12} />
            Workforce Mapping
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Salary Assignments</h1>
          <p className="text-slate-500 font-medium max-w-lg">Orchestrate compensation blueprints by mapping structural templates to individual employee profiles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 font-bold">
            <Download className="mr-2 h-4 w-4" />
            Bulk Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-blue-500/25">
            <UserPlus className="mr-2 h-5 w-5" />
            New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Active', value: assignments?.filter(a => a.status === 'ACTIVE').length || 0, color: 'emerald' },
           { label: 'Avg Monthly CTC', value: '₹42,500', color: 'blue' },
           { label: 'Pending Reviews', value: '08', color: 'amber' },
           { label: 'Total Assignments', value: assignments?.length || 0, color: 'indigo' },
         ].map((stat, i) => (
           <Card key={i} className="p-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-sm">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
             <h3 className={cn("text-2xl font-black", `text-${stat.color}-600 dark:text-${stat.color}-400`)}>{stat.value}</h3>
           </Card>
         ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Filter by employee name, ID or structure..." 
              className="h-14 pl-12 rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-slate-900/50">
               <Filter className="mr-2 h-4 w-4" />
               Filters
             </Button>
             <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-slate-900/50">
               <ArrowUpDown className="mr-2 h-4 w-4" />
               Sort
             </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                <TableHead className="min-w-[250px]">Employee Profile</TableHead>
                <TableHead>Assigned Blueprint</TableHead>
                <TableHead>Annual CTC</TableHead>
                <TableHead>Monthly Net</TableHead>
                <TableHead>Effective Since</TableHead>
                <TableHead>Operational Status</TableHead>
                <TableHead className="text-right">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-white/5">
                    {Array(7).fill(0).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full rounded-lg bg-slate-100 dark:bg-white/5" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : assignments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] p-0">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-6">
                        <Inbox size={48} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Assignments Map</h3>
                      <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">
                        Your workforce hasn't been mapped to salary structures yet. Start by creating a new assignment.
                      </p>
                      <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold">
                        Initial Mapping
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                assignments?.map((assignment, i) => (
                  <motion.tr 
                    key={assignment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-b border-slate-100 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
                           {assignment.employee?.first_name?.[0]}{assignment.employee?.last_name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {assignment.employee?.first_name} {assignment.employee?.last_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{assignment.employee?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                           <CreditCard size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">{assignment.structure?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          ₹{Number(assignment.annual_ctc).toLocaleString()}
                       </span>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                          ₹{Number(assignment.monthly_ctc).toLocaleString()}
                       </span>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <History size={12} className="text-blue-500" />
                          {new Date(assignment.effective_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-xl px-4 py-1 font-bold text-[10px] uppercase tracking-widest border-0 shadow-sm",
                        assignment.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                      )}>
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-all">
                          <History size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all">
                          <ArrowUpRight size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SalaryAssignments;
