import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Calculator,
  LayoutGrid,
  ChevronDown,
  Download,
  ArrowUpDown,
  ListFilter,
  Inbox,
  Layout
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { usePayrollComponents } from '../hooks/usePayroll';
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

const SalaryComponents = () => {
  const { data: components, isLoading, isError, refetch } = usePayrollComponents();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = components?.filter(c => 
    c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  if (isError) {
    return (
      <div className="py-20">
        <EnterpriseErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
            <Calculator size={12} />
            Salary Engine
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Salary Components</h1>
          <p className="text-slate-500 font-medium max-w-lg">Manage dynamic earning and deduction types with complex formula support.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 font-bold">
            <Download className="mr-2 h-4 w-4" />
            Export Rules
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-indigo-500/25">
            <Plus className="mr-2 h-5 w-5" />
            Define Component
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="enterprise-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <LayoutGrid size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Total</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{components?.length || 0}</h3>
            </div>
          </div>
        </div>
        <div className="enterprise-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Earnings</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {components?.filter(c => c.component_category === 'EARNING').length || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="enterprise-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Deductions</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {components?.filter(c => c.component_category === 'DEDUCTION').length || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="enterprise-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ListFilter size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Custom Formula</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {components?.filter(c => c.formula).length || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Search by code, name or category..." 
              className="form-input-premium pl-12 h-14"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-slate-900/50">
               <Filter className="mr-2 h-4 w-4" />
               Category
               <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
             </Button>
             <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-slate-900/50">
               <ArrowUpDown className="mr-2 h-4 w-4" />
               Sort
             </Button>
          </div>
        </div>

        <div className="enterprise-panel p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead className="min-w-[200px]">Component Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Logic Type</TableHead>
                <TableHead className="min-w-[250px]">Formula / Definition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Operations</TableHead>
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
              ) : filteredComponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] p-0">
                    <EnterpriseEmptyState 
                      title="No components found"
                      description={searchTerm ? `We couldn't find any salary components matching "${searchTerm}".` : "We couldn't find any salary components in the system."}
                      icon={Inbox}
                      action={searchTerm ? <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button> : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredComponents.map((component, i) => (
                  <motion.tr 
                    key={component?.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-b border-slate-100 dark:border-white/5 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all"
                  >
                    <TableCell>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl text-xs tracking-tight">
                        {component.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm">
                           <Layout size={18} className="text-slate-500" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white tracking-tight">{component.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-xl px-4 py-1 font-bold text-[10px] uppercase tracking-widest border-0",
                        component.component_category === 'EARNING' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                      )}>
                        {component.component_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {component.calculation_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {component.formula ? (
                        <div className="flex items-center gap-2 group/formula">
                          <code className="text-[11px] font-bold bg-slate-900 text-amber-400 px-4 py-2 rounded-xl border border-white/5 block max-w-[300px] truncate shadow-inner">
                            {component.formula}
                          </code>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover/formula:opacity-100 transition-opacity">
                            <Edit size={12} />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium italic">Fixed Value Component</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {component.is_active ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                          Paused
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl">
                          <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-bold cursor-pointer group focus:bg-indigo-500/10 focus:text-indigo-600 transition-all">
                            <Edit size={16} className="text-slate-400 group-focus:text-indigo-600" />
                            Modify Logic
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-bold cursor-pointer text-rose-500 focus:bg-rose-500/10 transition-all">
                            <Trash2 size={16} />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default SalaryComponents;
