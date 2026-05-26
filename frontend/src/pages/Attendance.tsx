import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnterpriseEmptyState } from '@/components/common/EnterpriseEmptyState';
import { attendanceApi } from '@/services/api';
import { Attendance } from '@/types';
import { Clock, LogIn, Calendar, Download, Search, Users, MapPin, SearchCheck, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const AttendancePage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getReport();
      setAttendance(response.data || []);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      const errorMessage = error.message || 'Failed to initialize attendance feed';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const stats = useMemo(() => ({
    present: attendance.filter(a => a.status === 'PRESENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
    leave: attendance.filter(a => a.status === 'ON_LEAVE').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length
  }), [attendance]);

  const filteredAttendance = useMemo(() => {
    if (!searchTerm) return attendance;
    const s = searchTerm.toLowerCase();
    return attendance.filter(a =>
      `${a.employee?.firstName} ${a.employee?.lastName}`.toLowerCase().includes(s) ||
      a.employee?.email?.toLowerCase().includes(s)
    );
  }, [attendance, searchTerm]);

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized Session</div>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Daily Attendance"
          description="Real-time monitoring of personnel presence and check-in metrics."
          className="enterprise-panel"
        >
          <div className="flex items-center gap-3">
            <Button variant="outlinePremium" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button variant="premium" size="sm">
              <LogIn className="mr-2 h-4 w-4" /> Check In
            </Button>
          </div>
        </PageHeader>
      </motion.div>

      {/* Analytics Grid */}
      <motion.div
        variants={slideUpVariants}
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="enterprise-card group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="enterprise-subheading">Present Personnel</p>
                <div className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-500">{stats.present}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-soft group-hover:scale-110 transition-transform">
                <Users size={22} />
              </div>
            </div>
            <div className="mt-5 h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="enterprise-subheading">Late Arrivals</p>
                <div className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-500">{stats.late}</div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shadow-soft group-hover:scale-110 transition-transform">
                <Clock size={22} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="enterprise-subheading">Documented Leave</p>
                <div className="text-3xl font-black mt-2 text-sky-600 dark:text-sky-500">{stats.leave}</div>
              </div>
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 shadow-soft group-hover:scale-110 transition-transform">
                <Calendar size={22} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="enterprise-subheading">Absent/Excused</p>
                <div className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-500">{stats.absent}</div>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 shadow-soft group-hover:scale-110 transition-transform">
                <AlertCircle size={22} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Toolbar */}
      <motion.div variants={slideUpVariants}>
        <div className="enterprise-toolbar px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900 dark:text-white">
              <History size={18} className="text-primary" />
              Live Attendance Feed
            </h2>
            <div className="relative w-full md:w-96 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Locate personnel record..."
                className="h-11 pl-10 rounded-xl bg-background/50 border-white/10 focus:border-primary/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slideUpVariants}>
        {loading ? (
          <div className="rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-8 space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/60" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted/60 rounded" />
                      <div className="h-3 w-48 bg-muted/40 rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-24 bg-muted/40 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredAttendance.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[350px]">Personnel Details</TableHead>
                <TableHead>Check-In Dynamics</TableHead>
                <TableHead>Status Trace</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredAttendance.map((record, idx) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    component={TableRow}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 rounded-2xl border border-white/10 shadow-sm group-hover:scale-105 transition-all duration-300">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                              {record.employee?.firstName?.[0]}{record.employee?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white dark:border-slate-950",
                            record.status === 'PRESENT' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : record.status === 'LATE' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-slate-400"
                          )} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                              <MapPin size={10} className="text-primary/40" />
                              Main HQ · Block A
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Entry Time</span>
                          <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">{record.checkIn || '--:--'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Exit Time</span>
                          <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">{record.checkOut || '--:--'}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={record.status} className="shadow-sm" />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-xs hover:bg-primary/10 hover:text-primary transition-all">
                        Details
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        ) : (
          <Card className="enterprise-card border-dashed border-2 border-white/5 bg-white/5">
            <EnterpriseEmptyState
              title="No Intelligence Trace"
              description="We could not locate any active personnel records matching your search scope. Try adjusting your parameters."
              icon={SearchCheck}
              action={{
                label: "Refresh Feed",
                onClick: fetchAttendance,
                icon: History
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Footer Status */}
      <motion.div variants={slideUpVariants}>
        <div className="enterprise-toolbar py-4 px-8 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Personnel Stream Active</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">System Operational</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AttendancePage;