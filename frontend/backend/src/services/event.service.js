/**
 * Event Service for Real-Time Broadcasting
 * Handles all real-time event emissions across the application
 */
class EventService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Emit attendance update event
   * @param {string} employeeId - Employee ID
   * @param {Object} attendanceData - Attendance data with userId, departmentId, etc.
   */
  emitAttendanceUpdate(employeeId, attendanceData) {
    if (!this.io) return;

    const eventPayload = {
      employeeId,
      ...attendanceData,
      timestamp: new Date().toISOString()
    };

    // Emit to employee
    if (attendanceData.userId) {
      this.io.to(`user:${attendanceData.userId}`).emit('attendance:updated', eventPayload);
    }

    // Emit to department room
    if (attendanceData.departmentId) {
      this.io.to(`department:${attendanceData.departmentId}`).emit('attendance:updated', eventPayload);
    }

    // Emit to managers/admins for dashboard updates
    this.io.to('role:ADMIN').to('role:HR').to('role:MANAGER').emit('attendance:updated', eventPayload);
  }

  /**
   * Emit leave status update
   * @param {string} leaveId - Leave request ID
   * @param {Object} leaveData - Leave data with userId, approverId, etc.
   */
  emitLeaveUpdate(leaveId, leaveData) {
    if (!this.io) return;

    const eventPayload = {
      leaveId,
      ...leaveData,
      timestamp: new Date().toISOString()
    };

    // Emit to employee
    if (leaveData.userId) {
      this.io.to(`user:${leaveData.userId}`).emit('leave:updated', eventPayload);
    }

    // Emit to approvers
    if (leaveData.approverId) {
      this.io.to(`user:${leaveData.approverId}`).emit('leave:updated', eventPayload);
    }

    // Emit to department managers
    if (leaveData.departmentId) {
      this.io.to(`department:${leaveData.departmentId}`).emit('leave:updated', eventPayload);
    }

    // Emit to all admins/HR for dashboard updates
    this.io.to('role:ADMIN').to('role:HR').emit('leave:updated', eventPayload);
  }

  /**
   * Emit project update
   * @param {string} projectId - Project ID
   * @param {Object} projectData - Project data with managerId, memberIds, etc.
   */
  emitProjectUpdate(projectId, projectData) {
    if (!this.io) return;

    const eventPayload = {
      projectId,
      ...projectData,
      timestamp: new Date().toISOString()
    };

    // Emit to project room (all members)
    this.io.to(`project:${projectId}`).emit('project:updated', eventPayload);

    // Emit to project manager
    if (projectData.managerId) {
      this.io.to(`user:${projectData.managerId}`).emit('project:updated', eventPayload);
    }

    // Emit to project members
    if (projectData.memberIds && Array.isArray(projectData.memberIds)) {
      projectData.memberIds.forEach(memberId => {
        this.io.to(`user:${memberId}`).emit('project:updated', eventPayload);
      });
    }

    // Emit to admins
    this.io.to('role:ADMIN').emit('project:updated', eventPayload);
  }

  /**
   * Emit employee update
   * @param {string} employeeId - Employee ID
   * @param {Object} employeeData - Employee data with userId, departmentId, etc.
   */
  emitEmployeeUpdate(employeeId, employeeData) {
    if (!this.io) return;

    const eventPayload = {
      employeeId,
      ...employeeData,
      timestamp: new Date().toISOString()
    };

    // Emit to employee
    if (employeeData.userId) {
      this.io.to(`user:${employeeData.userId}`).emit('employee:updated', eventPayload);
    }

    // Emit to department
    if (employeeData.departmentId) {
      this.io.to(`department:${employeeData.departmentId}`).emit('employee:updated', eventPayload);
    }

    // Emit to managers (for team updates)
    if (employeeData.managerId) {
      this.io.to(`user:${employeeData.managerId}`).emit('employee:updated', eventPayload);
    }

    // Emit to admins/HR
    this.io.to('role:ADMIN').to('role:HR').emit('employee:updated', eventPayload);
  }

  /**
   * Emit dashboard stats update
   * @param {string} role - User role
   * @param {string} userId - User ID
   * @param {Object} stats - Dashboard stats
   */
  emitDashboardStats(role, userId, stats) {
    if (!this.io) return;

    const eventPayload = {
      ...stats,
      timestamp: new Date().toISOString()
    };

    if (role === 'ADMIN') {
      this.io.to('role:ADMIN').emit('dashboard:stats', eventPayload);
    } else if (role === 'HR') {
      this.io.to('role:HR').emit('dashboard:stats', eventPayload);
    } else if (role === 'MANAGER') {
      this.io.to(`user:${userId}`).emit('dashboard:stats', eventPayload);
    } else {
      this.io.to(`user:${userId}`).emit('dashboard:stats', eventPayload);
    }
  }

  /**
   * Emit department update
   * @param {string} departmentId - Department ID
   * @param {Object} departmentData - Department data
   */
  emitDepartmentUpdate(departmentId, departmentData) {
    if (!this.io) return;

    const eventPayload = {
      departmentId,
      ...departmentData,
      timestamp: new Date().toISOString()
    };

    // Emit to department room
    this.io.to(`department:${departmentId}`).emit('department:updated', eventPayload);

    // Emit to department manager
    if (departmentData.managerId) {
      this.io.to(`user:${departmentData.managerId}`).emit('department:updated', eventPayload);
    }

    // Emit to admins/HR
    this.io.to('role:ADMIN').to('role:HR').emit('department:updated', eventPayload);
  }

  /**
   * Emit data invalidation event (for cache invalidation on frontend)
   * @param {string} entityType - Type of entity (employee, project, etc.)
   * @param {string} userId - User ID to notify
   */
  emitDataInvalidation(entityType, userId = null) {
    if (!this.io) return;

    const eventPayload = {
      type: entityType,
      timestamp: new Date().toISOString()
    };

    if (userId) {
      this.io.to(`user:${userId}`).emit('data:invalidated', eventPayload);
    } else {
      // Broadcast to all connected users
      this.io.emit('data:invalidated', eventPayload);
    }
  }
}

module.exports = EventService;





