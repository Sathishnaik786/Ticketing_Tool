const ChatService = require('./chat.service');
const { supabase, supabaseAdmin } = require('@lib/supabase');

class NotificationService {
  // Create notification for a new user
  static async notifyNewUserCreated(userId, adminUserId) {
    await ChatService.createNotification(
      adminUserId,
      'USER_CREATED',
      'New User Created',
      `A new user has been created`,
      `/admin/users`,
      userId
    );
  }

  // Create notification for role change
  static async notifyRoleChanged(userId, adminUserId) {
    await ChatService.createNotification(
      userId,
      'ROLE_CHANGED',
      'Role Updated',
      `Your role has been updated`,
      `/profile`,
      adminUserId
    );
  }

  // Create notification for task assignment
  static async notifyTaskAssigned(taskId, assigneeId, assignerId) {
    const { data: assigner, error: assignerError } = await supabaseAdmin
      .from('employees')
      .select('first_name, last_name')
      .eq('user_id', assignerId)
      .single();

    await ChatService.createNotification(
      assigneeId,
      'TASK_ASSIGNED',
      'Task Assigned',
      assigner ? `${assigner.first_name} ${assigner.last_name} assigned you a task` : 'You have been assigned a task',
      `/tasks/${taskId}`,
      taskId
    );
  }

  // Create notification for leave request
  static async notifyLeaveRequest(leaveId, requesterId, recipientIds) {
    const { data: requester, error: requesterError } = await supabaseAdmin
      .from('employees')
      .select('first_name, last_name')
      .eq('user_id', requesterId)
      .single();

    for (const recipientId of recipientIds) {
      await ChatService.createNotification(
        recipientId,
        'LEAVE_REQUEST',
        'Leave Request',
        requester ? `${requester.first_name} ${requester.last_name} submitted a leave request` : 'A leave request has been submitted',
        `/leaves/${leaveId}`,
        leaveId
      );
    }
  }

  // Create notification for leave approval/rejection
  static async notifyLeaveDecision(leaveId, requesterId, status) {
    const { data: leave, error: leaveError } = await supabase
      .from('leaves')
      .select(`
        id,
        employee_id,
        employees!employee_id (first_name, last_name, user_id)
      `)
      .eq('id', leaveId)
      .single();

    if (!leave || !leave.employees) {
      return;
    }

    const statusText = status === 'APPROVED' ? 'approved' : 'rejected';
    await ChatService.createNotification(
      leave.employees.user_id,
      'LEAVE_STATUS',
      `Leave ${statusText}`,
      `Your leave request has been ${statusText}`,
      `/leaves/${leaveId}`,
      leaveId
    );
  }

  // Create notification for employee message
  static async notifyEmployeeMessage(senderId, recipientId) {
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('employees')
      .select('first_name, last_name')
      .eq('user_id', senderId)
      .single();

    await ChatService.createNotification(
      recipientId,
      'EMPLOYEE_MESSAGE',
      'New Message',
      sender ? `${sender.first_name} ${sender.last_name} sent you a message` : 'You received a message',
      `/chat`,
      senderId
    );
  }

  // Create notification for system alerts
  static async notifySystemAlert(userId, title, message, link = null) {
    await ChatService.createNotification(
      userId,
      'SYSTEM_ALERT',
      title,
      message,
      link,
      null
    );
  }

  // Get role-based notification recipients
  static async getNotificationRecipientsForRole(role) {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('user_id')
      .eq('role', role)
      .eq('status', 'ACTIVE');

    if (error) {
      console.error('Error getting notification recipients:', error);
      return [];
    }

    return employees.map(emp => emp.user_id);
  }

  // Get notification recipients for a specific employee's manager
  static async getManagerRecipients(employeeId) {
    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('manager_id, user_id')
      .eq('id', employeeId)
      .single();

    if (error || !employee || !employee.manager_id) {
      return [];
    }

    const { data: manager, error: managerError } = await supabaseAdmin
      .from('employees')
      .select('user_id')
      .eq('id', employee.manager_id)
      .single();

    if (managerError || !manager) {
      return [];
    }

    return [manager.user_id];
  }

  // Get HR recipients
  static async getHrRecipients() {
    const { data: hrEmployees, error } = await supabaseAdmin
      .from('employees')
      .select('user_id')
      .eq('role', 'HR')
      .eq('status', 'ACTIVE');

    if (error) {
      console.error('Error getting HR recipients:', error);
      return [];
    }

    return hrEmployees.map(emp => emp.user_id);
  }
}

module.exports = NotificationService;