const AppError = require('../../utils/app-error');
const { assertPermission, canAssignTicket } = require('../ticketing/ticketing.types');
const TicketAssignmentRepository = require('./ticket-assignment.repository');
const { mapAssignmentTypeToDb } = require('./ticket-assignment.repository');
const {
  parseSchema,
  AssignTicketSchema,
  ReassignTicketSchema,
  QueueQuerySchema,
} = require('./ticket-assignment.validation');

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

class TicketAssignmentService {
  constructor(deps = {}) {
    this.repository = deps.repository || new TicketAssignmentRepository(deps);
  }

  async buildAssignContext(user) {
    const userDepartmentId = await this.repository.getEmployeeDepartmentId(user.employeeId);
    return { userDepartmentId };
  }

  assertCanAssign(user, ticket, context) {
    assertPermission(user, 'ASSIGN_TICKET');
    if (!canAssignTicket(user, ticket, context)) {
      throw AppError.forbidden('You do not have permission to assign this ticket');
    }
  }

  async assignTicket(user, body) {
    const input = parseSchema(AssignTicketSchema, body, 'Assign ticket');
    if (!user.employeeId) {
      throw AppError.forbidden('Employee profile required to assign tickets');
    }

    const ticket = await this.repository.getTicketById(input.ticket_id);
    const context = await this.buildAssignContext(user);
    this.assertCanAssign(user, ticket, context);

    if (ticket.assignee_id) {
      throw AppError.conflict('Ticket is already assigned. Use reassign instead.');
    }

    await this.repository.clearCurrentAssignment(input.ticket_id);

    const dbType = mapAssignmentTypeToDb(input.assignment_type);
    const assignment = await this.repository.insertAssignment({
      ticketId: input.ticket_id,
      assigneeId: input.assigned_to,
      assignedBy: user.employeeId,
      assignmentType: dbType,
      notes: input.reason,
    });

    const nextStatus = ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status;
    const updatedTicket = await this.repository.updateTicketAssignee(
      input.ticket_id,
      input.assigned_to,
      nextStatus
    );

    const history = await this.repository.insertHistory({
      ticketId: input.ticket_id,
      oldAssignee: null,
      newAssignee: input.assigned_to,
      changedBy: user.employeeId,
      reason: input.reason || `Assigned (${input.assignment_type})`,
    });

    return {
      success: true,
      data: { ticket: updatedTicket, assignment, history },
    };
  }

  async reassignTicket(user, ticketId, body) {
    const input = parseSchema(ReassignTicketSchema, body, 'Reassign ticket');
    if (!user.employeeId) {
      throw AppError.forbidden('Employee profile required to reassign tickets');
    }

    const ticket = await this.repository.getTicketById(ticketId);
    const context = await this.buildAssignContext(user);
    this.assertCanAssign(user, ticket, context);

    const previousAssignee = ticket.assignee_id;
    await this.repository.clearCurrentAssignment(ticketId);

    const dbType = mapAssignmentTypeToDb(
      input.assignment_type === 'REASSIGNED' ? 'MANUAL' : input.assignment_type
    );

    const assignment = await this.repository.insertAssignment({
      ticketId,
      assigneeId: input.assigned_to,
      assignedBy: user.employeeId,
      assignmentType: dbType,
      notes: input.reason,
    });

    const updatedTicket = await this.repository.updateTicketAssignee(
      ticketId,
      input.assigned_to,
      ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status
    );

    const history = await this.repository.insertHistory({
      ticketId,
      oldAssignee: previousAssignee,
      newAssignee: input.assigned_to,
      changedBy: user.employeeId,
      reason: input.reason || `Reassigned (${input.assignment_type})`,
    });

    return {
      success: true,
      data: { ticket: updatedTicket, assignment, history },
    };
  }

  async getMyQueue(user, query = {}) {
    if (!user.employeeId) {
      throw AppError.forbidden('Employee profile required');
    }

    const filters = parseSchema(QueueQuerySchema, query, 'Queue query');
    const result = await this.repository.listTickets({
      assigneeId: user.employeeId,
      excludeClosed: true,
      ...filters,
    });

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.count,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async getTeamQueue(user, query = {}) {
    const role = normalizeRole(user.role);
    if (!['MANAGER', 'ADMIN', 'HR'].includes(role)) {
      throw AppError.forbidden('You do not have access to the team queue');
    }

    const filters = parseSchema(QueueQuerySchema, query, 'Queue query');
    let departmentId = null;

    if (role === 'MANAGER') {
      departmentId = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (!departmentId) {
        return { success: true, data: [], meta: { total: 0, page: filters.page, limit: filters.limit } };
      }
    }

    const result = await this.repository.listTickets({
      departmentId,
      excludeClosed: true,
      ...filters,
    });

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.count,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async getUnassigned(user, query = {}) {
    const role = normalizeRole(user.role);
    if (!['MANAGER', 'ADMIN', 'HR'].includes(role)) {
      throw AppError.forbidden('You do not have access to unassigned tickets');
    }

    const filters = parseSchema(QueueQuerySchema, query, 'Queue query');
    let departmentId = null;

    if (role === 'MANAGER') {
      departmentId = await this.repository.getEmployeeDepartmentId(user.employeeId);
    }

    const result = await this.repository.listTickets({
      unassigned: true,
      departmentId,
      excludeClosed: true,
      status: filters.status || 'OPEN',
      priority: filters.priority,
      page: filters.page,
      limit: filters.limit,
    });

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.count,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async getAnalytics(user) {
    const role = normalizeRole(user.role);
    if (!['MANAGER', 'ADMIN', 'HR'].includes(role)) {
      throw AppError.forbidden('You do not have access to assignment analytics');
    }

    let departmentId = null;
    if (role === 'MANAGER') {
      departmentId = await this.repository.getEmployeeDepartmentId(user.employeeId);
    }

    const [teamResult, unassignedResult, history, agentCounts] = await Promise.all([
      this.repository.listTickets({ departmentId, excludeClosed: true, page: 1, limit: 1000 }),
      this.repository.listTickets({ departmentId, unassigned: true, excludeClosed: true, page: 1, limit: 1000 }),
      this.repository.listHistory({}),
      this.repository.countAssignmentsByAssignee(),
    ]);

    const ticketsPerAgent = Array.from(agentCounts.entries()).map(([agentId, count]) => ({
      agentId,
      count,
    }));

    const departmentWorkload = new Map();
    teamResult.data.forEach((ticket) => {
      const key = ticket.department_id || 'unassigned-dept';
      departmentWorkload.set(key, (departmentWorkload.get(key) || 0) + 1);
    });

    const monthlyTrend = new Map();
    history.forEach((entry) => {
      const date = new Date(entry.changed_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend.set(key, (monthlyTrend.get(key) || 0) + 1);
    });

    const overloadedAgents = ticketsPerAgent
      .filter((a) => a.count >= 5)
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        assignmentCount: history.length,
        ticketsPerAgent,
        departmentWorkload: Array.from(departmentWorkload.entries()).map(([departmentIdKey, count]) => ({
          departmentId: departmentIdKey,
          count,
        })),
        averageQueueSize: teamResult.count
          ? Math.round((teamResult.count / Math.max(ticketsPerAgent.length, 1)) * 100) / 100
          : 0,
        assignmentTrend: Array.from(monthlyTrend.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
        totalAssigned: teamResult.count,
        totalUnassigned: unassignedResult.count,
        overloadedAgents,
        queueDistribution: ticketsPerAgent,
      },
    };
  }

  async getTicketHistory(user, ticketId) {
    const ticket = await this.repository.getTicketById(ticketId);
    const role = normalizeRole(user.role);

    if (role === 'EMPLOYEE') {
      const isOwner =
        ticket.requester_id === user.employeeId ||
        ticket.assignee_id === user.employeeId;
      if (!isOwner) {
        throw AppError.forbidden('You do not have access to this ticket history');
      }
    } else if (role === 'MANAGER') {
      const dept = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (dept && ticket.department_id !== dept) {
        throw AppError.forbidden('You do not have access to this ticket history');
      }
    }

    const history = await this.repository.listHistory({ ticketId });
    return { success: true, data: history };
  }
}

module.exports = TicketAssignmentService;
