const AppError = require('../../../utils/app-error');
const TicketFeedbackRepository = require('../repositories/ticket-feedback.repository');
const { parseSchema, SubmitFeedbackSchema, MetricsQuerySchema } = require('../validators/ticket-feedback.validator');

const VIEW_ALL_ROLES = new Set(['ADMIN', 'HR']);
const VIEW_METRICS_ROLES = new Set(['ADMIN', 'HR', 'MANAGER']);

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

function average(values) {
  if (!values.length) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

function computeCsatPercentage(ratings) {
  if (!ratings.length) return 0;
  const satisfied = ratings.filter((r) => r >= 4).length;
  return Math.round((satisfied / ratings.length) * 10000) / 100;
}

function groupAverage(items, keyFn, ratingFn) {
  const groups = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    if (!groups.has(key)) {
      groups.set(key, { name: key, ratings: [] });
    }
    groups.get(key).ratings.push(ratingFn(item));
  });

  return Array.from(groups.values())
    .map((g) => ({
      name: g.name,
      averageRating: average(g.ratings),
      count: g.ratings.length,
    }))
    .sort((a, b) => b.averageRating - a.averageRating);
}

function buildMonthlyTrend(items) {
  const months = new Map();
  items.forEach((item) => {
    const date = new Date(item.submitted_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months.has(key)) {
      months.set(key, []);
    }
    months.get(key).push(item.rating);
  });

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ratings]) => ({
      month,
      averageRating: average(ratings),
      count: ratings.length,
      csatPercentage: computeCsatPercentage(ratings),
    }));
}

class TicketFeedbackService {
  constructor(deps = {}) {
    this.repository = deps.repository || new TicketFeedbackRepository(deps);
  }

  async assertCanViewFeedback(user, ticket) {
    const role = normalizeRole(user.role);

    if (VIEW_ALL_ROLES.has(role)) {
      return;
    }

    if (user.employeeId && ticket.requester_id === user.employeeId) {
      return;
    }

    if (role === 'MANAGER') {
      const userDept = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (userDept && ticket.department_id === userDept) {
        return;
      }
    }

    throw AppError.forbidden('You do not have access to this feedback');
  }

  async submitFeedback(user, body) {
    const payload = parseSchema(SubmitFeedbackSchema, body, 'Feedback');

    if (!user.employeeId) {
      throw AppError.forbidden('Employee profile required to submit feedback');
    }

    const ticket = await this.repository.getTicketById(payload.ticket_id);

    if (ticket.status !== 'CLOSED') {
      throw AppError.badRequest('Feedback is only available for closed tickets');
    }

    if (ticket.requester_id !== user.employeeId) {
      throw AppError.forbidden('Only the ticket requester can submit feedback');
    }

    const existing = await this.repository.findByTicketId(payload.ticket_id);
    if (existing) {
      throw AppError.conflict('Feedback already submitted for this ticket');
    }

    const record = await this.repository.insertFeedback({
      ticket_id: payload.ticket_id,
      submitted_by: user.employeeId,
      rating: payload.rating,
      resolution_quality: payload.resolution_quality,
      communication_quality: payload.communication_quality,
      response_time: payload.response_time,
      comments: payload.comments || null,
      submitted_at: new Date().toISOString(),
    });

    return { success: true, data: record };
  }

  async getFeedbackByTicketId(user, ticketId) {
    const ticket = await this.repository.getTicketById(ticketId);
    await this.assertCanViewFeedback(user, ticket);

    const feedback = await this.repository.findByTicketId(ticketId);
    if (!feedback) {
      throw AppError.notFound('Feedback not found for this ticket');
    }

    return { success: true, data: feedback };
  }

  async getMetrics(user, query = {}) {
    const role = normalizeRole(user.role);
    if (!VIEW_METRICS_ROLES.has(role)) {
      throw AppError.forbidden('You do not have access to feedback metrics');
    }

    const filters = parseSchema(MetricsQuerySchema, query, 'Metrics query');
    const repoFilters = {
      categoryId: filters.category_id,
      fromDate: filters.from_date,
      toDate: filters.to_date,
    };

    if (role === 'MANAGER') {
      const userDept = await this.repository.getEmployeeDepartmentId(user.employeeId);
      if (!userDept) {
        return this.buildMetricsResponse([]);
      }
      repoFilters.departmentId = userDept;
    } else if (filters.department_id) {
      repoFilters.departmentId = filters.department_id;
    }

    const rows = await this.repository.findAllWithTicketContext(repoFilters);
    return { success: true, data: this.buildMetricsResponse(rows) };
  }

  async getEmployeeSubmissionCount(user) {
    if (!user.employeeId) {
      return { success: true, data: { count: 0 } };
    }

    const count = await this.repository.countBySubmitter(user.employeeId);
    return { success: true, data: { count } };
  }

  buildMetricsResponse(rows) {
    const ratings = rows.map((r) => r.rating);
    const resolutionScores = rows.map((r) => r.resolution_quality);
    const communicationScores = rows.map((r) => r.communication_quality);
    const responseScores = rows.map((r) => r.response_time);

    const departmentWise = groupAverage(
      rows,
      (r) => r.tickets?.departments?.name || 'Unknown',
      (r) => r.rating
    );

    const categoryWise = groupAverage(
      rows,
      (r) => r.tickets?.ticket_categories?.name || 'Uncategorized',
      (r) => r.rating
    );

    return {
      averageRating: average(ratings),
      averageCommunicationScore: average(communicationScores),
      averageResolutionScore: average(resolutionScores),
      averageResponseScore: average(responseScores),
      totalFeedback: rows.length,
      csatPercentage: computeCsatPercentage(ratings),
      departmentWiseRating: departmentWise,
      categoryWiseRating: categoryWise,
      monthlyTrend: buildMonthlyTrend(rows),
      topRatedCategories: categoryWise.slice(0, 5),
      lowestRatedCategories: [...categoryWise].sort((a, b) => a.averageRating - b.averageRating).slice(0, 5),
    };
  }
}

module.exports = TicketFeedbackService;
