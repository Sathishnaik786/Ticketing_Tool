import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnterpriseEmptyState } from '@/components/common/EnterpriseEmptyState';
import { leavesApi } from '@/services/api';
import { LeaveRequest, LeaveFormData } from '@/types';
import { Plus, Check, X, Calendar, ClipboardList, AlertCircle, Clock, ChevronRight, History } from 'lucide-react';
import { LeaveForm } from '@/components/forms/LeaveForm';
import { CrudModal } from '@/components/modals/CrudModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Leaves() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leavesApi.getAll();
      setLeaves(response.data || []);
    } catch (error: any) {
      console.error('Error fetching leaves:', error);
      const errorMessage = error.message || 'Failed to fetch leave requests';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = () => {
    setEditingLeave(null);
    setIsModalOpen(true);
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await leavesApi.approve(leaveId, user?.id || '', 'Leave approved');
      toast({
        title: 'Success',
        description: 'Leave request approved',
      });
      fetchLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve leave request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await leavesApi.reject(leaveId, user?.id || '', 'Leave rejected');
      toast({
        title: 'Success',
        description: 'Leave request rejected',
      });
      fetchLeaves();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject leave request',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: LeaveFormData) => {
    try {
      if (editingLeave) {
        // Handle update if implemented
      } else {
        await leavesApi.apply({
          employeeId: user?.employeeId || '',
          leaveTypeId: data.leaveTypeId,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        });
      }
      setIsModalOpen(false);
      fetchLeaves();
    } catch (error: any) {
      throw error;
    }
  };

  const stats = useMemo(() => ({
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  }), [leaves]);

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized</div>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Time-Off Requests"
          description="Manage absence requests and track leave balances organization-wide."
          className="enterprise-panel"
        >
          <Button variant="premium" onClick={handleApplyLeave}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </PageHeader>
      </motion.div>

      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingLeave ? 'Review Request' : 'Time-Off Application'}
        size="lg"
      >
        <LeaveForm
          leave={editingLeave || undefined}
          employeeId={user?.employeeId}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </CrudModal>

      {/* Stats Cards */}
      <motion.div
        variants={slideUpVariants}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card className="enterprise-card group">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="enterprise-subheading text-amber-600 dark:text-amber-500">Pending Review</p>
              <div className="text-3xl font-black mt-2">{stats.pending}</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shadow-soft group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card group">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="enterprise-subheading text-emerald-600 dark:text-emerald-500">Approved Requests</p>
              <div className="text-3xl font-black mt-2">{stats.approved}</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-soft group-hover:scale-110 transition-transform">
              <Check size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card group">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="enterprise-subheading text-rose-600 dark:text-rose-500">Declined Requests</p>
              <div className="text-3xl font-black mt-2">{stats.rejected}</div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 shadow-soft group-hover:scale-110 transition-transform">
              <X size={24} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={slideUpVariants}>
        <div className="enterprise-toolbar px-8 py-5">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900 dark:text-white">
              <ClipboardList size={18} className="text-primary" />
              Request History
            </h2>
            <Badge variant="outline" className="bg-background/50 border-white/10 font-black text-[10px] py-1 px-3 uppercase tracking-widest">{leaves.length} Total Records</Badge>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slideUpVariants}>
        {loading ? (
          <div className="rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-8 space-y-6 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/60" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-muted/60 rounded" />
                      <div className="h-3 w-64 bg-muted/40 rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-24 bg-muted/30 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : leaves.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[400px]">Request Scope & Metadata</TableHead>
                <TableHead>Timeline Dynamics</TableHead>
                <TableHead>Operational Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {leaves.map((leave, idx) => (
                  <motion.tr
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    component={TableRow}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-105 transition-all duration-300">
                          <Calendar size={20} />
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-white/5 rounded-lg border-white/5 text-[9px] font-black uppercase tracking-widest">{leave.leaveType?.name}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium italic line-clamp-1 max-w-[300px]">
                            "{leave.reason}"
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Clock size={12} className="text-primary/60" />
                          {leave.startDate} — {leave.endDate}
                        </div>
                        <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                          Coverage: {leave.totalDays} Work Days
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={leave.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {leave.status === 'PENDING' && (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'HR') && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-emerald-600 hover:bg-emerald-500/10 rounded-xl active:scale-90 transition-all"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-rose-600 hover:bg-rose-500/10 rounded-xl active:scale-90 transition-all"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted group/btn transition-all">
                          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        ) : (
          <Card className="enterprise-card border-dashed border-2 border-white/5 bg-white/5">
            <EnterpriseEmptyState
              title="No Active Requests"
              description="There are currently no leave requests in the queue. Everything is handled and synced."
              icon={ClipboardList}
              action={{
                label: "Refresh Queue",
                onClick: fetchLeaves,
                icon: History
              }}
            />
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}