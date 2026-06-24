import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsStatCard } from './AnalyticsStatCard';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/animations/motionVariants';
import {
  Users,
  Users2,
  Calendar,
  UserCheck,
  User,
  UserRound,
  CalendarDays,
  UsersRound,
  Briefcase,
  ClipboardList
} from 'lucide-react';
import { AdminOverviewData, ManagerTeamProgressData, HRWorkforceData, EmployeeSelfData } from '@/types';

interface AnalyticsOverviewProps {
  role: string;
  analyticsData?: {
    adminOverview?: AdminOverviewData;
    managerProgress?: ManagerTeamProgressData;
    hrWorkforce?: HRWorkforceData;
    employeeSelf?: EmployeeSelfData;
  };
  loading?: boolean;
}

function AnalyticsOverview({ role, analyticsData, loading = false }: AnalyticsOverviewProps) {
  if (!analyticsData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {loading ? (
        <>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-card/40 rounded-2xl animate-pulse border border-border/40 shadow-sm" />
          ))}
        </>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="contents"
        >
          {role === 'ADMIN' && analyticsData.adminOverview && (
            <>
              <AnalyticsStatCard
                title="Total Employees"
                value={analyticsData.adminOverview.totalEmployees}
                icon={Users}
                change={`${analyticsData.adminOverview.activeEmployees} active`}
                changeType="positive"
              />
              <AnalyticsStatCard
                title="Departments"
                value={analyticsData.adminOverview.totalDepartments}
                icon={Users2}
                change={`${analyticsData.adminOverview.totalWorkItems} work items`}
                changeType="neutral"
              />
              <AnalyticsStatCard
                title="Pending Leaves"
                value={analyticsData.adminOverview.pendingLeaveRequests}
                icon={Calendar}
                change={`${analyticsData.adminOverview.approvedLeaveRequests} approved`}
                changeType="neutral"
              />
              <AnalyticsStatCard
                title="Present Today"
                value={analyticsData.adminOverview.presentToday}
                icon={UserCheck}
                status={analyticsData.adminOverview.presentToday > analyticsData.adminOverview.absentToday ? 'good' : 'warning'}
              />
            </>
          )}

          {role === 'MANAGER' && analyticsData.managerProgress && (
            <>
              <AnalyticsStatCard
                title="Team Size"
                value={analyticsData.managerProgress.teamSize}
                icon={Users}
                change={`${analyticsData.managerProgress.teamCompletedWorkItems} completed`}
                changeType="positive"
              />
              <AnalyticsStatCard
                title="Team Work Items"
                value={analyticsData.managerProgress.teamWorkItems}
                icon={Briefcase}
                change={`${analyticsData.managerProgress.teamPresentToday} present`}
                changeType="positive"
              />
              <AnalyticsStatCard
                title="Pending Leaves"
                value={analyticsData.managerProgress.teamPendingLeaveRequests}
                icon={Calendar}
                change="in team"
                changeType="neutral"
              />
              <AnalyticsStatCard
                title="Completed Work"
                value={analyticsData.managerProgress.teamCompletedWorkItems}
                icon={ClipboardList}
                status="good"
              />
            </>
          )}

          {role === 'HR' && analyticsData.hrWorkforce && (
            <>
              <AnalyticsStatCard
                title="New Hires"
                value={analyticsData.hrWorkforce.newHiresThisMonth}
                icon={UserRound}
                change="this month"
                changeType="positive"
                status="good"
              />
              <AnalyticsStatCard
                title="Avg Tenure"
                value={`${analyticsData.hrWorkforce.averageTenure} years`}
                icon={User}
                change="company average"
                changeType="neutral"
              />
              <AnalyticsStatCard
                title="Upcoming Birthdays"
                value={analyticsData.hrWorkforce.upcomingBirthdays}
                icon={CalendarDays}
                change="this month"
                changeType="neutral"
              />
              <AnalyticsStatCard
                title="Active Employees"
                value={analyticsData.hrWorkforce.employeesByStatus.ACTIVE || 0}
                icon={UsersRound}
                status="good"
              />
            </>
          )}

          {role === 'EMPLOYEE' && analyticsData.employeeSelf && (
            <>
              <AnalyticsStatCard
                title="My Work Items"
                value={analyticsData.employeeSelf.totalWorkItems}
                icon={Briefcase}
                change={`${analyticsData.employeeSelf.completionRate}% completed`}
                changeType="positive"
                status={parseFloat(analyticsData.employeeSelf.completionRate || '0') > 75 ? 'good' : 'warning'}
              />
              <AnalyticsStatCard
                title="Completed"
                value={analyticsData.employeeSelf.completedWorkItems}
                icon={ClipboardList}
                change="tasks done"
                changeType="positive"
                status="good"
              />
              <AnalyticsStatCard
                title="Attendance"
                value={analyticsData.employeeSelf.attendanceThisMonth}
                icon={UserCheck}
                change="this month"
                changeType="positive"
              />
              <AnalyticsStatCard
                title="Leave Requests"
                value={analyticsData.employeeSelf.totalLeaveRequests}
                icon={Calendar}
                change={`${analyticsData.employeeSelf.approvedLeaveRequests} approved`}
                changeType="neutral"
              />
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default AnalyticsOverview;