const { supabase } = require('@lib/supabase');

/**
 * Analytics Service - Computes read-only metrics from existing data
 */
class AnalyticsService {
  /**
   * Get admin overview metrics
   */
  async getAdminOverview() {
    try {
      // Total employees count
      const { count: totalEmployees, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (empError) throw empError;

      // Active employees count
      const { count: activeEmployees, error: activeEmpError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

      if (activeEmpError) throw activeEmpError;

      // Total departments count
      const { count: totalDepartments, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      if (deptError) throw deptError;

      // Total work items count
      const { count: totalWorkItems, error: workError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true });

      // Don't throw error for work items if the table doesn't exist
      if (workError && workError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw workError;
      }

      // Work items by status
      const workStatusCounts = [];
      const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'];
      
      for (const status of statuses) {
        const { count, error: statusError } = await supabase
          .from('work_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        if (!statusError && count !== null) {
          workStatusCounts.push({ status, count });
        } else if (statusError && statusError.code === '42P01') {
          // Table doesn't exist, break the loop
          break;
        }
      }

      // No error to throw since we handled each status individually

      // Attendance metrics for today
      const today = new Date().toISOString().split('T')[0];
      const { count: presentToday, error: presentError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'PRESENT');

      if (presentError) throw presentError;

      const { count: absentToday, error: absentError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .in('status', ['ABSENT', 'HALF_DAY']);

      if (absentError) throw absentError;

      // Leave requests
      const { count: pendingLeaves, error: pendingLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      if (pendingLeaveError) throw pendingLeaveError;

      const { count: approvedLeaves, error: approvedLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'APPROVED');

      if (approvedLeaveError) throw approvedLeaveError;

      return {
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        inactiveEmployees: (totalEmployees || 0) - (activeEmployees || 0),
        totalDepartments: totalDepartments || 0,
        totalWorkItems: totalWorkItems || 0,
        workItemsByStatus: workStatusCounts?.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}) || {},
        presentToday: presentToday || 0,
        absentToday: absentToday || 0,
        pendingLeaveRequests: pendingLeaves || 0,
        approvedLeaveRequests: approvedLeaves || 0
      };
    } catch (error) {
      console.error('Error in getAdminOverview:', error);
      throw error;
    }
  }

  /**
   * Get manager team progress metrics
   */
  async getManagerTeamProgress(managerId) {
    try {
      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, status')
        .eq('manager_id', managerId);

      if (teamError) throw teamError;

      const teamMemberIds = teamMembers?.map(member => member.id) || [];

      // Team work items
      const { count: teamWorkItems, error: workError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds);

      // Don't throw error for work items if the table doesn't exist
      if (workError && workError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw workError;
      }

      // Team work items by status
      const teamWorkStatus = [];
      const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'];
      
      for (const status of statuses) {
        const { count, error: statusError } = await supabase
          .from('work_items')
          .select('*', { count: 'exact', head: true })
          .in('assigned_to', teamMemberIds)
          .eq('status', status);
          
        if (!statusError && count !== null) {
          teamWorkStatus.push({ status, count });
        } else if (statusError && statusError.code === '42P01') {
          // Table doesn't exist, break the loop
          break;
        }
      }

      // No error to throw since we handled each status individually

      // Team attendance for today
      const today = new Date().toISOString().split('T')[0];
      const { count: teamPresent, error: presentError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .in('employee_id', teamMemberIds)
        .eq('date', today)
        .eq('status', 'PRESENT');

      if (presentError) throw presentError;

      // Team leave requests
      const { count: teamPendingLeaves, error: pendingLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .in('employee_id', teamMemberIds)
        .eq('status', 'PENDING');

      if (pendingLeaveError) throw pendingLeaveError;

      // Team completed work items
      const { count: teamCompletedWork, error: completedWorkError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .eq('status', 'COMPLETED');

      // Don't throw error for work items if the table doesn't exist
      if (completedWorkError && completedWorkError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw completedWorkError;
      }

      return {
        teamSize: teamMemberIds.length,
        teamMembers: teamMembers || [],
        teamWorkItems: teamWorkItems || 0,
        teamWorkByStatus: teamWorkStatus?.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}) || {},
        teamPresentToday: teamPresent || 0,
        teamPendingLeaveRequests: teamPendingLeaves || 0,
        teamCompletedWorkItems: teamCompletedWork || 0
      };
    } catch (error) {
      console.error('Error in getManagerTeamProgress:', error);
      throw error;
    }
  }

  /**
   * Get HR workforce metrics
   */
  async getHRWorkforce() {
    try {
      // Total employees by status
      const employeesByStatus = [];
      const employeeStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];
      
      for (const status of employeeStatuses) {
        const { count, error: statusError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        if (!statusError && count !== null) {
          employeesByStatus.push({ status, count });
        }
      }

      // No error to throw since we handled each status individually

      // Total employees by department
      const { data: allDepartments, error: allDeptsError } = await supabase
        .from('departments')
        .select('id, name');
        
      const employeesByDept = [];
      if (allDepartments) {
        for (const dept of allDepartments) {
          const { count, error: deptCountError } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id);
            
          if (!deptCountError && count !== null) {
            employeesByDept.push({
              department: dept.name,
              count
            });
          }
        }
      }

      if (allDeptsError) throw allDeptsError;

      // Average tenure - calculate in JavaScript
      const { data: allEmployeesForTenure, error: tenureError } = await supabase
        .from('employees')
        .select('date_of_joining')
        .not('date_of_joining', 'is', null);

      let avgYearsHR = 0;
      if (allEmployeesForTenure && allEmployeesForTenure.length > 0) {
        const today = new Date();
        const totalYears = allEmployeesForTenure.reduce((sum, emp) => {
          if (emp.date_of_joining) {
            const joinDate = new Date(emp.date_of_joining);
            const diffTime = Math.abs(today.getTime() - joinDate.getTime());
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
            return sum + diffYears;
          }
          return sum;
        }, 0);
        avgYearsHR = totalYears / allEmployeesForTenure.length;
      }

      if (tenureError) throw tenureError;

      // New hires this month
      const currentMonthHire = new Date().toISOString().substring(0, 7); // YYYY-MM
      const { count: newHires, error: newHireError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .ilike('date_of_joining', `${currentMonthHire}%`);

      if (newHireError) throw newHireError;

      // Upcoming birthdays this month
      const currentMonthBirthday = new Date().toISOString().substring(5, 7); // Get MM part of YYYY-MM-DD
      const { count: birthdays, error: birthdayError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .ilike('date_of_birth', '%' + currentMonthBirthday + '-%');

      if (birthdayError) throw birthdayError;

      // Leave usage
      const leaveUsage = [];
      const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      
      for (const status of leaveStatuses) {
        const { count, error: statusError } = await supabase
          .from('leaves')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        if (!statusError && count !== null) {
          leaveUsage.push({ status, count });
        }
      }

      // No error to throw since we handled each status individually

      return {
        employeesByStatus: employeesByStatus?.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}) || {},
        employeesByDepartment: employeesByDept?.map(item => ({
          department: item.department || 'Unknown',
          count: item.count
        })) || [],
        averageTenure: avgYearsHR.toFixed(1),
        newHiresThisMonth: newHires || 0,
        upcomingBirthdays: birthdays || 0,
        leaveRequestsByStatus: leaveUsage?.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}) || {}
      };
    } catch (error) {
      console.error('Error in getHRWorkforce:', error);
      throw error;
    }
  }

  /**
   * Get employee self metrics
   */
  async getEmployeeSelf(employeeId) {
    try {
      // Employee's work items
      const { count: totalWorkItems, error: workError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', employeeId);

      // Don't throw error for work items if the table doesn't exist
      if (workError && workError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw workError;
      }

      // Employee's completed work items
      const { count: completedWorkItems, error: completedWorkError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', employeeId)
        .eq('status', 'COMPLETED');

      // Don't throw error for work items if the table doesn't exist
      if (completedWorkError && completedWorkError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw completedWorkError;
      }

      // Employee's pending work items
      const { count: pendingWorkItems, error: pendingWorkError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', employeeId)
        .eq('status', 'OPEN');

      // Don't throw error for work items if the table doesn't exist
      if (pendingWorkError && pendingWorkError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw pendingWorkError;
      }

      // Employee's in-progress work items
      const { count: inProgressWorkItems, error: inProgressError } = await supabase
        .from('work_items')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', employeeId)
        .eq('status', 'IN_PROGRESS');

      // Don't throw error for work items if the table doesn't exist
      if (inProgressError && inProgressError.code !== '42P01') { // 42P01 is 'undefined_table' in PostgreSQL
        throw inProgressError;
      }

      // Employee's attendance this month
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const { count: presentThisMonth, error: presentError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId)
        .ilike('date', currentMonth + '%')
        .eq('status', 'PRESENT');

      if (presentError) throw presentError;

      // Employee's leave requests
      const { count: totalLeaveRequests, error: totalLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId);

      if (totalLeaveError) throw totalLeaveError;

      const { count: approvedLeaveRequests, error: approvedLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId)
        .eq('status', 'APPROVED');

      if (approvedLeaveError) throw approvedLeaveError;

      // Employee's pending leave requests
      const { count: pendingLeaveRequests, error: pendingLeaveError } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId)
        .eq('status', 'PENDING');

      if (pendingLeaveError) throw pendingLeaveError;

      return {
        totalWorkItems: totalWorkItems || 0,
        completedWorkItems: completedWorkItems || 0,
        pendingWorkItems: pendingWorkItems || 0,
        inProgressWorkItems: inProgressWorkItems || 0,
        completionRate: totalWorkItems > 0 ? 
          ((completedWorkItems || 0) / totalWorkItems * 100).toFixed(1) : 0,
        attendanceThisMonth: presentThisMonth || 0,
        totalLeaveRequests: totalLeaveRequests || 0,
        approvedLeaveRequests: approvedLeaveRequests || 0,
        pendingLeaveRequests: pendingLeaveRequests || 0
      };
    } catch (error) {
      console.error('Error in getEmployeeSelf:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();