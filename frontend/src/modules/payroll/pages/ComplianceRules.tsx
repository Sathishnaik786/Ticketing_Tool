import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Search,
  Download,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useComplianceRules } from '../hooks/usePayroll';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ComplianceRules = () => {
  const { data: rules, isLoading, isError, refetch } = useComplianceRules();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
            <ShieldCheck size={12} />
            Statutory Compliance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Compliance Rules</h1>
          <p className="text-slate-500 font-medium max-w-lg">Configure and govern statutory deduction logic including PF, ESI, and localized tax regulations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 font-bold">
            <Download className="mr-2 h-4 w-4" />
            Audit Logs
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-cyan-500/25">
            <Plus className="mr-2 h-5 w-5" />
            Create Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="rounded-[2.5rem] border-0 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <Info size={18} className="text-cyan-500" />
                      Statutory Overview
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">Current active regulatory rates.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                  <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                              <FileText size={16} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">EPF (Employer)</span>
                      </div>
                      <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border-0 px-3 py-1 font-bold">12.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                              <FileText size={16} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ESI (Employer)</span>
                      </div>
                      <Badge className="rounded-lg bg-emerald-500/10 text-emerald-600 border-0 px-3 py-1 font-bold">3.25%</Badge>
                  </div>
                  <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                              <Settings size={16} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">LWF Cap</span>
                      </div>
                      <Badge className="rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-0 px-3 py-1 font-bold">₹25.00</Badge>
                  </div>
              </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 rounded-[2.5rem] border-0 bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <ShieldCheck size={180} />
              </div>
              <CardContent className="p-10 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                          <Calendar size={36} />
                      </div>
                      <div className="space-y-2 flex-1">
                          <h3 className="text-2xl font-black tracking-tight uppercase">Regulatory Update: July 2024</h3>
                          <p className="text-white/80 font-medium leading-relaxed max-w-md">
                            New Labor Code Alignment directives detected. Ensure all statutory components are reviewed before the next processing cycle.
                          </p>
                          <div className="flex items-center gap-4 pt-4">
                             <Button className="bg-white text-cyan-600 hover:bg-white/90 font-black rounded-xl h-12 px-8 shadow-xl shadow-black/10">
                                Review Alignment
                             </Button>
                             <button className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                Dismiss <ArrowRight size={16} />
                             </button>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 px-2">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <Input placeholder="Search active rules by name or code..." className="h-14 pl-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold" />
            </div>
            <div className="flex items-center gap-3">
                {['PF', 'ESI', 'LWF', 'PT'].map((cat) => (
                   <button key={cat} className="px-5 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-cyan-500 hover:text-cyan-600 transition-all">
                      {cat}
                   </button>
                ))}
            </div>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                <TableHead className="min-w-[200px]">Rule Definition</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Logic</TableHead>
                <TableHead>Value/Rate</TableHead>
                <TableHead>Validity Period</TableHead>
                <TableHead>Governance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-white/5 h-20">
                     <TableCell colSpan={7}><div className="h-12 w-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64">
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                      <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
                        <AlertTriangle size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Compliance Feed Offline</h4>
                        <p className="text-sm text-slate-500">Statutory rules could not be synchronized from the regulatory engine.</p>
                      </div>
                      <Button onClick={() => refetch()} variant="outline" className="rounded-xl h-10 px-6 font-bold border-rose-200 text-rose-600 hover:bg-rose-50">
                        Retry Connection
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rules?.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center gap-4">
                         <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                            <Layers size={32} />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Rules</h4>
                            <p className="text-sm text-slate-500 font-medium">Define your first statutory rule to begin payroll orchestration.</p>
                         </div>
                      </div>
                   </TableCell>
                </TableRow>
              ) : (
                rules?.map((rule, i) => (
                  <motion.tr 
                    key={rule?.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-b border-slate-100 dark:border-white/5 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5 transition-all"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{rule.rule_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold font-mono tracking-tighter uppercase">{rule.rule_code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-xl px-4 py-1 bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-0 font-bold text-[10px] uppercase tracking-widest">
                          {rule.rule_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {rule.calculation_type}
                       </span>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                             {rule.calculation_type === 'PERCENTAGE' ? `${rule.percentage_value}%` : `₹${rule.fixed_amount || 0}`}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-cyan-500" />
                          From {new Date(rule.effective_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </div>
                    </TableCell>
                    <TableCell>
                      {rule.is_active ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                          <CheckCircle2 size={12} />
                          Authorized
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
                          <AlertTriangle size={12} />
                          Legacy
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-cyan-600 hover:bg-cyan-500/10 transition-all">
                          <Edit size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                          <Trash2 size={18} />
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

export default ComplianceRules;
