import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Inbox,
  Filter,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import { usePendingApprovals, useApproveStep } from '../hooks/usePayroll';
import { Textarea } from '@/components/ui/textarea';
import { 
  EnterpriseCard, 
  EnterpriseHeader, 
  EnterpriseStatCard, 
  EnterpriseEmptyState 
} from '@/components/payroll/EnterpriseComponents';
import { cn } from '@/lib/utils';

const ApprovalQueue = () => {
  const { data: pending, isLoading } = usePendingApprovals();
  const approveMutation = useApproveStep();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const handleApprove = async () => {
    if (selectedId) {
      await approveMutation.mutateAsync({ id: selectedId, comments });
      setSelectedId(null);
      setComments('');
    }
  };

  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Approval Queue"
        description="High-priority payroll authorizations and cycle verification center."
        badge="Strategic Authorization"
        actions={
          <>
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-border-soft font-bold">
              <Filter className="mr-2 h-4 w-4" />
              Filter Queue
            </Button>
            <Button className="btn-premium">
              <Zap className="mr-2 h-4 w-4" />
              Bulk Authorize
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard 
          title="Pending Total"
          value={pending?.length || 0}
          icon={Clock}
          color="warning"
        />
        <EnterpriseStatCard 
          title="Critical SLA"
          value={pending?.filter(p => (p.step?.sla_hours || 0) < 24).length || 0}
          icon={Zap}
          color="danger"
        />
        <EnterpriseStatCard 
          title="Authorized Today"
          value="12"
          icon={CheckCircle2}
          color="success"
        />
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 rounded-[2rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))
        ) : pending?.length === 0 ? (
          <EnterpriseEmptyState 
            title="Authorization Clean"
            description="Your queue is currently empty. All payroll cycles have been processed and authorized."
            icon={ShieldCheck}
          />
        ) : (
          <div className="space-y-4">
            {pending?.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <EnterpriseCard className="p-0 overflow-hidden group">
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    <div className="p-8 flex-1 border-r border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <UserCheck size={32} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.cycle?.cycle_name}</h3>
                            <Badge className="rounded-lg bg-primary/10 text-primary border-0 font-bold uppercase tracking-widest text-[10px]">
                                {item.step?.step_name}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> SLA: {item.step?.sla_hours}h</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> Received: {new Date(item.created_at || '').toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-emerald-500" /> Low Risk Profile</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-80 p-8 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center items-center gap-4">
                        <div className="flex items-center gap-3 w-full">
                            <Dialog open={selectedId === item.id} onOpenChange={(open) => !open && setSelectedId(null)}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                                        onClick={() => setSelectedId(item.id)}
                                    >
                                        <Check size={18} className="mr-2" />
                                        Authorize
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-0 shadow-2xl p-0 overflow-hidden">
                                    <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-white/5">
                                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Authorization Review</DialogTitle>
                                        <p className="text-sm text-slate-500 mt-1">Reviewing {item.cycle?.cycle_name} • {item.step?.step_name}</p>
                                    </DialogHeader>
                                    <div className="p-8 space-y-6">
                                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                          <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
                                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">By authorizing this step, you confirm that all financial variances have been verified for this cycle.</p>
                                        </div>
                                        <div className="space-y-3">
                                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Reviewer Comments</label>
                                          <Textarea 
                                              placeholder="Verified gross totals, variance checks complete..." 
                                              className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 min-h-[120px] focus:ring-primary/20"
                                              value={comments}
                                              onChange={(e) => setComments(e.target.value)}
                                          />
                                        </div>
                                    </div>
                                    <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 gap-3">
                                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => setSelectedId(null)}>Cancel</Button>
                                        <Button 
                                          className="rounded-xl h-12 px-8 bg-primary hover:bg-primary-hover text-white font-bold shadow-xl shadow-primary/20"
                                          onClick={handleApprove} 
                                          disabled={approveMutation.isPending}
                                        >
                                            Confirm Authorization
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="rounded-xl h-12 px-4 border-rose-500/30 text-rose-500 hover:bg-rose-500/5 font-bold">
                                <XCircle size={18} />
                            </Button>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5">
                          View Cycle Details <ArrowUpRight size={12} />
                        </button>
                    </div>
                  </div>
                </EnterpriseCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default ApprovalQueue;
