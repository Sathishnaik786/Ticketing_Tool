import React from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Layers, 
  Calendar,
  ExternalLink,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  Package,
  Users
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  EnterpriseCard, 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseEmptyState,
  EnterpriseErrorState
} from '@/components/payroll/EnterpriseComponents';
import { usePayrollStructures } from '../hooks/usePayroll';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

const SalaryStructures = () => {
  const { data: structures, isLoading, isError, refetch } = usePayrollStructures();

  if (isLoading) return <PayrollDashboardSkeleton />;
  if (isError) return <EnterpriseErrorState onRetry={() => refetch()} />;


  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            <Layers size={12} />
            Structural Blueprints
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Salary Structures</h1>
          <p className="text-slate-500 font-medium max-w-lg">Define and version reusable salary templates for multi-role workforce orchestration.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 font-bold">
            <Download className="mr-2 h-4 w-4" />
            Export Templates
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-emerald-500/25">
            <Plus className="mr-2 h-5 w-5" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input 
            placeholder="Search blueprints by name or ID..." 
            className="h-14 pl-12 rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-emerald-500/20"
          />
        </div>
        <Button variant="outline" className="h-14 rounded-2xl px-6 border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-slate-900/50">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="enterprise-card h-64 animate-pulse" />
          ))
        ) : structures?.length === 0 ? (
          <div className="enterprise-panel col-span-full h-80 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-200 dark:border-white/5">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Blueprints Defined</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
              Create reusable templates to standardize salary calculations across your organization.
            </p>
            <Button className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-8 font-bold">
              Initialize First Template
            </Button>
          </div>
        ) : (
          structures?.map((structure, i) => (
            <motion.div
              key={structure.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="enterprise-card p-0 group overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 border border-transparent">
                <CardHeader className="p-8 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Layers size={24} />
                    </div>
                    {structure.is_active ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Draft
                      </div>
                    )}
                  </div>
                  <div className="mt-6 space-y-2">
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {structure.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {structure.description || 'Enterprise-grade salary template for standardized calculations.'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Components</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{structure.components?.length || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Utilization</p>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-emerald-500" />
                        <p className="text-lg font-black text-slate-900 dark:text-white">12</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {structure.components?.slice(0, 3).map((sc, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 text-[10px] font-bold uppercase tracking-tight">
                        {sc.component?.code}
                      </span>
                    ))}
                    {(structure.components?.length || 0) > 3 && (
                      <span className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest self-center">
                        +{structure.components!.length - 3} More
                      </span>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={12} className="text-emerald-500" />
                      Ref: {new Date(structure.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all">
                        <Edit size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all">
                        <ExternalLink size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalaryStructures;
