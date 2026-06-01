import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  TrendingUp
} from 'lucide-react';
import { reportsApi, analyticsApi } from '@/services/api';
import { DashboardStats, AdminOverviewData, ManagerTeamProgressData, HRWorkforceData, EmployeeSelfData } from '@/types';
import AnalyticsOverview from '@/components/dashboard/AnalyticsOverview';
import { UpdatesQuickAccess } from '@/components/dashboard/UpdatesQuickAccess';
import { EnterpriseHeader, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';



export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        setAnalyticsLoading(true);
        let data;
        if (user.role === 'ADMIN') data = { adminOverview: (await analyticsApi.getAdminOverview()).data };
        else if (user.role === 'MANAGER') data = { managerProgress: (await analyticsApi.getManagerTeamProgress()).data };
        else if (user.role === 'HR') data = { hrWorkforce: (await analyticsApi.getHRWorkforce()).data };
        else if (user.role === 'EMPLOYEE') data = { employeeSelf: (await analyticsApi.getEmployeeSelf()).data };

        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    // Feature Flag Debug Log (Dev Only)
    if (import.meta.env.DEV) {
      console.log('Update Feature Flags:', {
        DAILY: import.meta.env.VITE_ENABLE_DAILY_UPDATES,
        WEEKLY: import.meta.env.VITE_ENABLE_WEEKLY_UPDATES,
        MONTHLY: import.meta.env.VITE_ENABLE_MONTHLY_UPDATES,
        ANALYTICS: import.meta.env.VITE_ENABLE_UPDATE_ANALYTICS,
        REMINDERS: import.meta.env.VITE_ENABLE_UPDATE_REMINDERS,
      });
    }

    if (user) {
      fetchStats();
      fetchAnalytics();
    }
  }, [user]);


  if (authLoading || loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="enterprise-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-48 rounded-xl bg-muted/40" />
            <Skeleton className="h-5 w-80 rounded-lg bg-muted/20" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl bg-muted/30" />
            <Skeleton className="h-10 w-40 rounded-xl bg-muted/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="enterprise-card space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24 rounded bg-muted/30" />
                  <Skeleton className="h-10 w-16 rounded-lg bg-muted/40" />
                </div>
                <Skeleton className="h-14 w-14 rounded-2xl bg-muted/30" />
              </div>
              <Skeleton className="h-6 w-32 rounded-full bg-muted/20" />
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-muted/10" />
            </div>
          ))}
        </div>

        <div className="enterprise-panel min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-7 w-56 rounded bg-muted/30" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-lg bg-muted/20" />
              <Skeleton className="h-9 w-24 rounded-lg bg-muted/20" />
            </div>
          </div>
          <Skeleton className="h-[300px] w-full rounded-2xl bg-muted/20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
          <UserX size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">Please log in to your account with authorized credentials to view the dashboard analytics.</p>
        <Button className="mt-6" variant="outlinePremium">Go to Sign In</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="enterprise-section"
    >
      <motion.div variants={slideUpVariants} className="space-y-6">
        <EnterpriseHeader
          title="Executive Hub"
          description={`Intelligent workspace for ${user.firstName || 'User'}. Tracking operations and personnel health.`}
          badge="Real-time Synchronization"
          actions={(
            <div className="flex items-center gap-3">
              <Button variant="outlinePremium" size="sm" className="hidden sm:flex">
                <Calendar className="mr-2 h-4 w-4" />
                Planning
              </Button>
              <Button variant="premium" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Intelligence Report
              </Button>
            </div>
          )}
        />
      </motion.div>

      {/* Employee Updates: High Visibility Access */}
      <motion.div variants={slideUpVariants} className="z-10 relative mb-5">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="enterprise-subheading">Action Center</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
        </div>
        <UpdatesQuickAccess />
      </motion.div>

      {/* Employee Quick Actions */}
      {user?.role === 'EMPLOYEE' && (
        <motion.div variants={slideUpVariants} className="z-10 relative">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="enterprise-subheading">My Financials</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="enterprise-card group cursor-pointer hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all duration-300"
              onClick={() => navigate('/app/payroll/my-payslips')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <FileText className="w-6 h-6 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors flex items-center gap-2">
                    My Payslips
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and download your published salary statements.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={slideUpVariants}
        className="space-y-6 mb-5"
      >
        <div className="flex items-center justify-between px-2">
          <h2 className="enterprise-subheading">Real-time Metrics</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <EnterpriseStatCard
            title="Total Workforce"
            value={stats?.totalEmployees?.toLocaleString() || '0'}
            icon={Users}
            trend="+2.4% Momentum"
            trendType="success"
            color="primary"
          />
          <EnterpriseStatCard
            title="Pending Actions"
            value={stats?.pendingLeaves?.toLocaleString() || '0'}
            icon={FileText}
            trend="Needs Attention"
            trendType="warning"
            color="warning"
          />
          <EnterpriseStatCard
            title="Active Presence"
            value={stats?.presentToday?.toLocaleString() || '0'}
            icon={UserCheck}
            trend="Stability Normal"
            trendType="neutral"
            color="success"
          />
          <EnterpriseStatCard
            title="Operational Rate"
            value={`${stats?.attendanceRate?.toFixed(1) || '0'}%`}
            icon={TrendingUp}
            trend="Peak Efficiency"
            trendType="success"
            color="payroll"
          />
        </div>
      </motion.div>

      {/* Analytics Overview */}
      <motion.div variants={slideUpVariants} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="enterprise-subheading">Workforce Intelligence</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
        </div>
        <AnalyticsOverview
          role={user?.role || ''}
          analyticsData={analyticsData}
          loading={analyticsLoading}
        />
      </motion.div>
    </motion.div>
  );
}