import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Play, 
  Lock, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Activity,
  ArrowRight,
  Filter,
  Search,
  Download,
  CalendarDays,
  LayoutDashboard,
  Kanban,
  Zap,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayrollCycles, useCreateCycle, useProcessPayroll, useLockCycle } from '../hooks/usePayroll';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  EnterpriseCard, 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseEmptyState,
  EnterpriseErrorState
} from '@/components/payroll/EnterpriseComponents';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

const PayrollCycles = () => {
  const navigate = useNavigate();
  const { data: cycles, isLoading, isError, refetch } = usePayrollCycles();
  const createCycle = useCreateCycle();
  const processPayroll = useProcessPayroll();
  const lockCycle = useLockCycle();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({
    cycle_name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    start_date: '',
    end_date: ''
  });

  if (isLoading) return <PayrollDashboardSkeleton />;
  if (isError) return <EnterpriseErrorState onRetry={() => refetch()} />;

  const handleCreate = async () => {
    await createCycle.mutateAsync(newCycle);
    setIsCreateOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0 rounded-lg px-3 py-1 font-black text-[10px] uppercase">Draft</Badge>;
      case 'PROCESSING': return <Badge className="bg-blue-500/10 text-blue-600 border-0 rounded-lg px-3 py-1 animate-pulse font-black text-[10px] uppercase">Processing</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-500/10 text-emerald-600 border-0 rounded-lg px-3 py-1 font-black text-[10px] uppercase">Completed</Badge>;
      case 'FAILED': return <Badge className="bg-rose-500/10 text-rose-600 border-0 rounded-lg px-3 py-1 font-black text-[10px] uppercase">Failed</Badge>;
      case 'LOCKED': return <Badge className="bg-amber-500/10 text-amber-600 border-0 rounded-lg px-3 py-1 font-black text-[10px] uppercase">Locked</Badge>;
      default: return null;
    }
  };

  const statusColumns = [
    { id: 'DRAFT', label: 'Draft', color: 'slate' },
    { id: 'PROCESSING', label: 'Processing', color: 'blue' },
    { id: 'COMPLETED', label: 'Approved', color: 'emerald' },
    { id: 'LOCKED', label: 'Disbursed', color: 'amber' },
  ];

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Execution Engine"
        description="High-fidelity payroll orchestration and batch execution hub."
        badge="Payroll Cycles"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                  <Button className="btn-premium">
                      <Plus className="mr-2 h-5 w-5" />
                      Initialize Cycle
                  </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-0 shadow-2xl p-0 overflow-hidden">
                  <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-white/5">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create Execution Batch</DialogTitle>
                      <p className="text-sm text-slate-500 mt-1">Define the period and parameters for the new payroll execution batch.</p>
                  </DialogHeader>
                  <div className="p-8 space-y-6">
                      <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cycle Identity</Label>
                          <Input 
                              placeholder="e.g. May 2024 Corporate Payout"
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 px-6 font-bold" 
                              value={newCycle.cycle_name}
                              onChange={(e) => setNewCycle({...newCycle, cycle_name: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Month</Label>
                              <Select 
                                  value={newCycle.month.toString()} 
                                  onValueChange={(v) => setNewCycle({...newCycle, month: parseInt(v)})}
                              >
                                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 px-6 font-bold">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10">
                                      {Array.from({length: 12}).map((_, i) => (
                                          <SelectItem key={i+1} value={(i+1).toString()} className="rounded-xl">
                                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</Label>
                              <Input 
                                  type="number" 
                                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 px-6 font-bold"
                                  value={newCycle.year}
                                  onChange={(e) => setNewCycle({...newCycle, year: parseInt(e.target.value)})}
                              />
                          </div>
                      </div>
                  </div>
                  <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 gap-3">
                      <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => setIsCreateOpen(false)}>Discard</Button>
                      <Button className="rounded-xl h-12 px-10 font-bold bg-primary hover:bg-primary-hover text-white" onClick={handleCreate} disabled={createCycle.isPending}>
                        {createCycle.isPending ? "Initializing..." : "Confirm & Create"}
                      </Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard 
          title="Active Cycles"
          value={cycles?.filter(c => c.status === 'PROCESSING').length || 0}
          icon={Activity}
          color="primary"
        />
        <EnterpriseStatCard 
          title="Total Gross"
          value="₹1.4Cr"
          icon={Landmark}
          trend="+4.2%"
          trendType="danger"
          color="success"
        />
        <EnterpriseStatCard 
          title="Execution Rate"
          value="98.4%"
          icon={Zap}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Audit Compliance"
          value="Secured"
          icon={ShieldCheck}
          color="payroll"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <EnterpriseCard className="lg:col-span-2 p-0 overflow-hidden" title="Cycle Status Kanban">
          <div className="p-8 grid grid-cols-4 gap-6 min-h-[160px]">
            {statusColumns.map((col) => {
              const count = cycles?.filter(c => c.status === col.id).length || 0;
              return (
                <div key={col.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-white/5 pb-3">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", `text-${col.color}-600 dark:text-${col.color}-400`)}>
                      {col.label}
                    </span>
                    <Badge className={cn("rounded-lg border-0 text-white font-black px-2 py-0.5", `bg-${col.color}-600`)}>
                      {count}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {Array.from({length: Math.min(count, 3)}).map((_, i) => (
                      <div key={i} className={cn("h-8 rounded-xl border border-dashed", `border-${col.color}-500/20 bg-${col.color}-500/5`)} />
                    ))}
                    {count === 0 && <div className="h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </EnterpriseCard>

        <EnterpriseCard title="Batch Insights" className="bg-slate-900 text-white border-0 shadow-2xl overflow-hidden relative group">
           <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
             <CalendarDays size={200} />
           </div>
           <div className="space-y-6 relative z-10 py-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex flex-col items-center justify-center text-blue-400">
                  <span className="text-[10px] font-black leading-none uppercase">MAY</span>
                  <span className="text-xl font-black leading-none mt-1">31</span>
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Main Payout</p>
                  <p className="text-[10px] text-white/50 font-black tracking-widest uppercase">Target: Disbursement</p>
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/50">Processing Progress</span>
                    <span className="text-emerald-400">75%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-emerald-500" />
                 </div>
              </div>
           </div>
        </EnterpriseCard>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="section-title uppercase tracking-widest text-xs font-black text-slate-400">Cycle Management</h3>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="h-11 w-72 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 pl-11 text-sm font-bold focus:ring-primary/20" placeholder="Search batches..." />
             </div>
             <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-slate-200 dark:border-white/10">
                <Filter size={18} />
             </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-[2rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))
          ) : cycles?.length === 0 ? (
            <EnterpriseEmptyState 
              title="No Batches Initialized"
              description="Start by creating a new payroll cycle to manage payouts and compliance."
              icon={CalendarDays}
            />
          ) : (
            cycles?.map((cycle, i) => (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <EnterpriseCard className="p-0 overflow-hidden group">
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    <div className="p-8 flex-1 border-r border-slate-100 dark:border-white/5 flex items-center gap-8">
                       <div className={cn(
                          "w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center shadow-inner transition-transform group-hover:scale-105 group-hover:-rotate-3",
                          cycle.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" :
                          cycle.status === 'PROCESSING' ? "bg-blue-500/10 text-blue-600" :
                          "bg-slate-100 dark:bg-white/5 text-slate-500"
                        )}>
                          <span className="text-[10px] font-black leading-none uppercase tracking-tighter">
                            {new Date(cycle.year, cycle.month - 1).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-black leading-none mt-1">{cycle.year}</span>
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                              {cycle.cycle_name}
                            </h3>
                            {getStatusBadge(cycle.status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> Period: {new Date(cycle.start_date).toLocaleDateString()} — {new Date(cycle.end_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Audit Ready</span>
                          </div>
                       </div>
                    </div>

                    <div className="lg:w-[480px] p-8 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-6">
                        <div className="flex gap-10">
                           <div className="text-right space-y-0.5">
                              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Gross Batch</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">₹4.8L</p>
                           </div>
                           <div className="text-right space-y-0.5">
                              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Net Distribution</p>
                              <p className="text-lg font-black text-emerald-600 tabular-nums">₹4.2L</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Link to={`/app/payroll/cycles/${cycle.id}`}>
                                <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                    <Eye size={20} />
                                </Button>
                            </Link>
                            
                            {cycle.status === 'DRAFT' || cycle.status === 'FAILED' ? (
                                <Button 
                                    className="bg-primary hover:bg-primary-hover text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20"
                                    onClick={() => processPayroll.mutate({ cycleId: cycle.id })}
                                    disabled={processPayroll.isPending}
                                >
                                    {processPayroll.isPending ? <Activity className="h-4 w-4 animate-spin" /> : <Play size={18} className="mr-2 fill-current" />}
                                    Run Execute
                                </Button>
                            ) : null}

                            {cycle.status === 'COMPLETED' && !cycle.is_locked ? (
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-amber-500/20"
                                    onClick={() => lockCycle.mutate(cycle.id)}
                                    disabled={lockCycle.isPending}
                                >
                                    <Lock size={18} className="mr-2" /> Finalize
                                </Button>
                            ) : null}
                        </div>
                    </div>
                  </div>
                </EnterpriseCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Eye = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default PayrollCycles;
