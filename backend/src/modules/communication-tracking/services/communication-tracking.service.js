const AppError = require('../../../utils/app-error');
const CommunicationTrackingRepository = require('../repositories/communication-tracking.repository');
const {
  parseSchema,
  CommentSchema,
  ChatSchema,
  EmailSchema,
  CallLogSchema,
  InternalNoteSchema,
} = require('../validation/communication-tracking.validation');

const VIEW_ALL_ROLES = new Set(['ADMIN', 'HR', 'SUPER_ADMIN']);
const VIEW_DEPT_ROLES = new Set(['MANAGER']);

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

function computeDurationSeconds(startAt, endAt, provided) {
  if (typeof provided === 'number') return provided;
  if (!startAt || !endAt) return null;
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.round((end - start) / 1000);
}

class CommunicationTrackingService {
  constructor(deps = {}) {
    this.repository = deps.repository || new CommunicationTrackingRepository(deps);
  }

  async assertCanAccessTicket(user, ticket) {
    const role = normalizeRole(user.role);

    if (VIEW_ALL_ROLES.has(role)) return;

    if (user.employeeId) {
      if (ticket.requester_id === user.employeeId || ticket.assignee_id === user.employeeId) {
        return;
      }
    }

    if (VIEW_DEPT_ROLES.has(role) && user.employeeId) {
      const deptId = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (deptId && ticket.department_id === deptId) return;
    }

    throw AppError.forbidden('You do not have access to this ticket');
  }

  canViewInternal(user) {
    const role = normalizeRole(user.role);
    return VIEW_ALL_ROLES.has(role) || VIEW_DEPT_ROLES.has(role) || role === 'EMPLOYEE';
  }

  async addComment(user, body) {
    const input = parseSchema(CommentSchema, body, 'Comment');
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const ticket = await this.repository.getTicketById(input.ticket_id);
    await this.assertCanAccessTicket(user, ticket);

    const communication = await this.repository.insertCommunication({
      ticket_id: input.ticket_id,
      communication_type: 'COMMENT',
      direction: input.visibility === 'INTERNAL' ? 'INTERNAL' : 'OUTBOUND',
      subject: input.subject || null,
      message: input.message,
      created_by: user.employeeId,
      visibility: input.visibility,
    });

    const timeline = await this.repository.insertTimelineEvent({
      ticket_id: input.ticket_id,
      event_type: 'COMMENT_ADDED',
      event_data: { communication_id: communication.id, visibility: input.visibility },
      created_by: user.employeeId,
    });

    return { success: true, data: { communication, timeline } };
  }

  async addChat(user, body) {
    const input = parseSchema(ChatSchema, body, 'Chat');
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const ticket = await this.repository.getTicketById(input.ticket_id);
    await this.assertCanAccessTicket(user, ticket);

    const visibility = input.direction === 'INTERNAL' ? 'INTERNAL' : 'PUBLIC';
    const communication = await this.repository.insertCommunication({
      ticket_id: input.ticket_id,
      communication_type: 'CHAT',
      direction: input.direction,
      message: input.message,
      created_by: user.employeeId,
      visibility,
    });

    const timeline = await this.repository.insertTimelineEvent({
      ticket_id: input.ticket_id,
      event_type: 'CHAT_MESSAGE',
      event_data: { communication_id: communication.id, direction: input.direction },
      created_by: user.employeeId,
    });

    return { success: true, data: { communication, timeline } };
  }

  async addInternalNote(user, body) {
    const input = parseSchema(InternalNoteSchema, body, 'Internal note');
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const ticket = await this.repository.getTicketById(input.ticket_id);
    await this.assertCanAccessTicket(user, ticket);

    const communication = await this.repository.insertCommunication({
      ticket_id: input.ticket_id,
      communication_type: 'SYSTEM_NOTE',
      direction: 'INTERNAL',
      subject: input.subject || null,
      message: input.message,
      created_by: user.employeeId,
      visibility: 'INTERNAL',
    });

    const timeline = await this.repository.insertTimelineEvent({
      ticket_id: input.ticket_id,
      event_type: 'SYSTEM_NOTE',
      event_data: { communication_id: communication.id },
      created_by: user.employeeId,
    });

    return { success: true, data: { communication, timeline } };
  }

  async logEmail(user, body) {
    const input = parseSchema(EmailSchema, body, 'Email');
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const ticket = await this.repository.getTicketById(input.ticket_id);
    await this.assertCanAccessTicket(user, ticket);

    const emailLog = await this.repository.insertEmailLog({
      ticket_id: input.ticket_id,
      sender: input.sender,
      recipient: input.recipient,
      cc: input.cc || null,
      subject: input.subject,
      body: input.body,
      status: input.status,
    });

    await this.repository.insertCommunication({
      ticket_id: input.ticket_id,
      communication_type: 'EMAIL',
      direction: input.status === 'RECEIVED' ? 'INBOUND' : 'OUTBOUND',
      subject: input.subject,
      message: input.body,
      created_by: user.employeeId,
      visibility: 'PUBLIC',
    });

    const eventType = input.status === 'RECEIVED' ? 'EMAIL_RECEIVED' : 'EMAIL_SENT';
    const timeline = await this.repository.insertTimelineEvent({
      ticket_id: input.ticket_id,
      event_type: eventType,
      event_data: { email_log_id: emailLog.id, status: input.status, recipient: input.recipient },
      created_by: user.employeeId,
    });

    return { success: true, data: { emailLog, timeline } };
  }

  async logCall(user, body) {
    const input = parseSchema(CallLogSchema, body, 'Call log');
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const ticket = await this.repository.getTicketById(input.ticket_id);
    await this.assertCanAccessTicket(user, ticket);

    const durationSeconds = computeDurationSeconds(
      input.call_start_at,
      input.call_end_at,
      input.duration_seconds
    );

    const callLog = await this.repository.insertCallLog({
      ticket_id: input.ticket_id,
      employee_id: user.employeeId,
      customer_name: input.customer_name || null,
      phone_number: input.phone_number || null,
      call_start_at: input.call_start_at,
      call_end_at: input.call_end_at || null,
      duration_seconds: durationSeconds,
      call_summary: input.call_summary || null,
      outcome: input.outcome,
    });

    await this.repository.insertCommunication({
      ticket_id: input.ticket_id,
      communication_type: 'PHONE_CALL',
      direction: 'OUTBOUND',
      subject: `Call: ${input.outcome}`,
      message: input.call_summary || `Phone call logged (${input.outcome})`,
      created_by: user.employeeId,
      visibility: 'PUBLIC',
    });

    const timeline = await this.repository.insertTimelineEvent({
      ticket_id: input.ticket_id,
      event_type: 'CALL_LOGGED',
      event_data: {
        call_log_id: callLog.id,
        outcome: input.outcome,
        duration_seconds: durationSeconds,
      },
      created_by: user.employeeId,
    });

    return { success: true, data: { callLog, timeline } };
  }

  async getTicketCommunications(user, ticketId) {
    const ticket = await this.repository.getTicketById(ticketId);
    await this.assertCanAccessTicket(user, ticket);

    const includeInternal = this.canViewInternal(user);
    const [communications, callLogs, emailLogs] = await Promise.all([
      this.repository.listCommunicationsByTicket(ticketId, { includeInternal }),
      this.repository.listCallLogsByTicket(ticketId),
      this.repository.listEmailLogsByTicket(ticketId),
    ]);

    return {
      success: true,
      data: {
        ticket_id: ticketId,
        communications,
        call_logs: callLogs,
        email_logs: emailLogs,
      },
    };
  }

  buildIntegratedTimelineEvents(ticketId, {
    storedEvents,
    assignmentHistory,
    feedbackRows,
    slaEscalations,
  }) {
    const integrated = [...storedEvents];

    assignmentHistory.forEach((row) => {
      const isReassign = row.old_assignee != null || row.old_assignee_id != null;
      integrated.push({
        id: `assignment-${row.id}`,
        ticket_id: ticketId,
        event_type: isReassign ? 'REASSIGNED' : 'ASSIGNED',
        event_data: {
          old_assignee_id: row.old_assignee ?? row.old_assignee_id,
          new_assignee_id: row.new_assignee ?? row.new_assignee_id,
          reason: row.reason,
          source: 'phase_7_2_readonly',
        },
        created_by: row.changed_by,
        created_at: row.changed_at,
        actor: null,
        integrated: true,
      });
    });

    feedbackRows.forEach((row) => {
      integrated.push({
        id: `feedback-${row.id}`,
        ticket_id: ticketId,
        event_type: 'FEEDBACK_SUBMITTED',
        event_data: {
          rating: row.rating,
          source: 'phase_7_1_readonly',
        },
        created_by: row.submitted_by,
        created_at: row.submitted_at,
        actor: null,
        integrated: true,
      });
    });

    slaEscalations.forEach((row) => {
      integrated.push({
        id: `sla-${row.id}`,
        ticket_id: ticketId,
        event_type: row.event_type === 'WARNING' ? 'SLA_WARNING' : 'ESCALATION',
        event_data: { ...row, source: 'phase_7_3_readonly' },
        created_by: row.triggered_by || null,
        created_at: row.created_at,
        actor: null,
        integrated: true,
      });
    });

    return integrated.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getTicketTimeline(user, ticketId) {
    const ticket = await this.repository.getTicketById(ticketId);
    await this.assertCanAccessTicket(user, ticket);

    const [storedEvents, assignmentHistory, feedbackRows, slaEscalations] = await Promise.all([
      this.repository.listTimelineEvents(ticketId),
      this.repository.listAssignmentHistory(ticketId),
      this.repository.listFeedbackForTicket(ticketId),
      this.repository.listSlaEscalations(ticketId),
    ]);

    const events = this.buildIntegratedTimelineEvents(ticketId, {
      storedEvents,
      assignmentHistory,
      feedbackRows,
      slaEscalations,
    });

    return { success: true, data: { ticket_id: ticketId, events } };
  }

  async filterTicketsForUser(user, tickets) {
    const role = normalizeRole(user.role);
    if (VIEW_ALL_ROLES.has(role)) return tickets;

    if (VIEW_DEPT_ROLES.has(role) && user.employeeId) {
      const deptId = await this.repository.getEmployeeDepartmentId(user.employeeId);
      return tickets.filter((t) => t.department_id === deptId);
    }

    if (user.employeeId) {
      return tickets.filter(
        (t) => t.requester_id === user.employeeId || t.assignee_id === user.employeeId
      );
    }

    return [];
  }

  async getAnalytics(user, query = {}) {
    const role = normalizeRole(user.role);
    if (!VIEW_ALL_ROLES.has(role) && !VIEW_DEPT_ROLES.has(role) && role !== 'EMPLOYEE') {
      throw AppError.forbidden('You do not have access to communication analytics');
    }

    const fromDate = query.from || null;
    const toDate = query.to || null;
    const filters = { fromDate, toDate };

    const [communications, callLogs, emailLogs] = await Promise.all([
      this.repository.listCommunicationsForAnalytics(filters),
      this.repository.listCallLogsForAnalytics(filters),
      this.repository.listEmailLogsForAnalytics(filters),
    ]);

    const ticketIds = [...new Set([
      ...communications.map((c) => c.ticket_id),
      ...callLogs.map((c) => c.ticket_id),
      ...emailLogs.map((e) => e.ticket_id),
    ])];

    const tickets = await this.repository.getTicketsByIds(ticketIds);
    const scopedTickets = await this.filterTicketsForUser(user, tickets);
    const scopedIds = new Set(scopedTickets.map((t) => t.id));

    const scopedComms = communications.filter((c) => scopedIds.has(c.ticket_id));
    const scopedCalls = callLogs.filter((c) => scopedIds.has(c.ticket_id));
    const scopedEmails = emailLogs.filter((e) => scopedIds.has(e.ticket_id));

    const commentsAdded = scopedComms.filter((c) => c.communication_type === 'COMMENT').length;
    const emailsSent = scopedEmails.filter((e) => e.status === 'SENT').length;

    const deptIds = [...new Set(scopedTickets.map((t) => t.department_id).filter(Boolean))];
    const departments = await this.repository.getDepartmentsByIds(deptIds);
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    const byDepartment = {};
    scopedComms.forEach((c) => {
      const ticket = scopedTickets.find((t) => t.id === c.ticket_id);
      const deptName = deptMap.get(ticket?.department_id) || 'Unassigned';
      byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;
    });

    const responsePairs = [];
    scopedComms
      .filter((c) => c.communication_type === 'COMMENT')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .forEach((comment, idx, arr) => {
        if (idx === 0) return;
        const prev = arr[idx - 1];
        const diffMs = new Date(comment.created_at) - new Date(prev.created_at);
        if (diffMs > 0) responsePairs.push(diffMs / 60000);
      });

    const avgResponseMinutes = responsePairs.length
      ? Math.round((responsePairs.reduce((a, b) => a + b, 0) / responsePairs.length) * 100) / 100
      : 0;

    return {
      success: true,
      data: {
        totalCommunications: scopedComms.length,
        callsLogged: scopedCalls.length,
        emailsSent,
        commentsAdded,
        averageResponseTimeMinutes: avgResponseMinutes,
        communicationByDepartment: Object.entries(byDepartment).map(([name, count]) => ({
          name,
          count,
        })),
        communicationByBusinessUnit: [],
        recentCommunications: scopedComms.slice(0, 10),
      },
    };
  }

  async getDashboardSummary(user) {
    const role = normalizeRole(user.role);
    let ticketIds = null;

    if (role === 'EMPLOYEE' && user.employeeId) {
      const { data } = await this.repository.db
        .from('tickets')
        .select('id, department_id, requester_id, assignee_id')
        .or(`requester_id.eq.${user.employeeId},assignee_id.eq.${user.employeeId}`);

      const scoped = await this.filterTicketsForUser(user, data || []);
      ticketIds = scoped.map((t) => t.id);
    } else if (VIEW_DEPT_ROLES.has(role) && user.employeeId) {
      const deptId = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (deptId) {
        const { data } = await this.repository.db
          .from('tickets')
          .select('id')
          .eq('department_id', deptId);
        ticketIds = (data || []).map((t) => t.id);
      }
    }

    const recent = await this.repository.getRecentCommunications(8, ticketIds);
    return { success: true, data: { recentCommunications: recent, role } };
  }
}

module.exports = CommunicationTrackingService;
