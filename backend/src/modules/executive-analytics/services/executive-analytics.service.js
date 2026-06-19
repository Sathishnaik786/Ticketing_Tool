const AppError = require('../../../utils/app-error');
const ExecutiveAnalyticsRepository = require('../repositories/executive-analytics.repository');
const { parseSchema, DashboardFilterSchema, CreateReportSchema } = require('../validation/executive-analytics.validation');
const { buildExportBuffer } = require('../utils/executive-analytics.export');
const {
  BUSINESS_UNITS,
  DEPARTMENT_NAMES,
  CLOSED_STATUSES,
  OPEN_STATUSES,
  ENTERPRISE_ROLES,
  DEPARTMENT_ROLES,
} = require('../executive-analytics.constants');

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

function hoursBetween(start, end) {
  if (!start || !end) return null;
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
}

function avg(nums) {
  const valid = nums.filter((n) => n != null && !Number.isNaN(n));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

class ExecutiveAnalyticsService {
  constructor(deps = {}) {
    this.repository = deps.repository || new ExecutiveAnalyticsRepository(deps);
  }

  assertEnterpriseAccess(user) {
    if (!ENTERPRISE_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Enterprise analytics requires HR or Admin access');
    }
  }

  assertDepartmentAccess(user) {
    if (!DEPARTMENT_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Department analytics requires Manager or above');
    }
  }

  denyEmployee(user) {
    if (normalizeRole(user.role) === 'EMPLOYEE') {
      throw AppError.forbidden('Employees do not have analytics access');
    }
  }

  parseFilters(query) {
    return parseSchema(DashboardFilterSchema, query ?? {}, 'Filters');
  }

  async loadCoreData(filters) {
    const [tickets, feedback, approvals, escalations, knowledgeViews, departments] = await Promise.all([
      this.repository.fetchTickets(filters),
      this.repository.fetchFeedback(),
      this.repository.fetchApprovals(),
      this.repository.fetchEscalations(),
      this.repository.fetchKnowledgeViews(),
      this.repository.fetchDepartments(),
    ]);
    return { tickets, feedback, approvals, escalations, knowledgeViews, departments };
  }

  computeKpis(tickets, feedback, approvals, escalations, knowledgeViews) {
    const total = tickets.length;
    const open = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length;
    const closed = tickets.filter((t) => CLOSED_STATUSES.includes(t.status)).length;
    const resolutionPct = total ? Math.round((closed / total) * 100) : 0;

    const withSla = tickets.filter((t) => t.sla_resolution_due_at);
    const slaCompliant = withSla.filter((t) => !t.sla_resolution_breached).length;
    const slaCompliancePct = withSla.length ? Math.round((slaCompliant / withSla.length) * 100) : 100;

    const csatScore = feedback.length
      ? Math.round((avg(feedback.map((f) => f.rating)) * 10)) / 10
      : 0;

    const completedApprovals = approvals.filter((a) => a.completed_at);
    const approvalTurnaroundHours = avg(
      completedApprovals.map((a) => hoursBetween(a.started_at, a.completed_at))
    );

    const searches = knowledgeViews.filter((v) => v.search_query);
    const successful = searches.filter((v) => v.article_id).length;
    const knowledgeDeflectionPct = searches.length
      ? Math.round((successful / searches.length) * 100)
      : 0;

    const resolutionHours = avg(
      tickets
        .filter((t) => t.closed_at || t.resolved_at)
        .map((t) => hoursBetween(t.created_at, t.closed_at || t.resolved_at))
    );

    const escalationCount = escalations.length
      || tickets.filter((t) => t.status === 'ESCALATED').length;

    const workload = tickets.reduce((acc, t) => {
      const key = t.assignee_id || 'unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      openTickets: open,
      closedTickets: closed,
      totalTickets: total,
      resolutionPct,
      slaCompliancePct,
      csatScore,
      approvalTurnaroundHours: Math.round(approvalTurnaroundHours * 10) / 10,
      knowledgeDeflectionPct,
      averageResolutionHours: Math.round(resolutionHours * 10) / 10,
      escalationCount,
      workloadDistribution: Object.entries(workload).map(([assigneeId, count]) => ({
        assigneeId,
        count,
      })),
    };
  }

  async getExecutiveDashboard(user, query) {
    this.denyEmployee(user);
    this.assertEnterpriseAccess(user);
    const filters = this.parseFilters(query);
    const data = await this.loadCoreData(filters);
    const kpis = this.computeKpis(
      data.tickets,
      data.feedback,
      data.approvals,
      data.escalations,
      data.knowledgeViews
    );

    return {
      success: true,
      data: {
        kpis,
        generatedAt: new Date().toISOString(),
        filters,
      },
    };
  }

  async getDepartmentDashboard(user, query) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    const filters = this.parseFilters(query);
    const data = await this.loadCoreData(filters);

    const deptMap = new Map(data.departments.map((d) => [d.id, d.name]));
    const grouped = {};

    for (const dept of data.departments) {
      grouped[dept.id] = {
        departmentId: dept.id,
        departmentName: dept.name,
        tickets: [],
      };
    }

    for (const ticket of data.tickets) {
      if (ticket.department_id && grouped[ticket.department_id]) {
        grouped[ticket.department_id].tickets.push(ticket);
      }
    }

    const scorecards = Object.values(grouped).map((g) => {
      const deptFeedback = data.feedback.filter((f) => {
        const ticket = data.tickets.find((t) => t.id === f.ticket_id);
        return ticket?.department_id === g.departmentId;
      });
      const kpis = this.computeKpis(g.tickets, deptFeedback, data.approvals, data.escalations, []);
      return {
        ...g,
        ticketVolume: g.tickets.length,
        metrics: {
          responseTimeHours: kpis.averageResolutionHours,
          resolutionTimeHours: kpis.averageResolutionHours,
          slaCompliancePct: kpis.slaCompliancePct,
          csatScore: kpis.csatScore,
          escalations: g.tickets.filter((t) => t.status === 'ESCALATED').length,
        },
      };
    });

    if (normalizeRole(user.role) === 'MANAGER' && user.departmentId) {
      return {
        success: true,
        data: {
          scorecards: scorecards.filter((s) => s.departmentId === user.departmentId),
          filters,
        },
      };
    }

    return { success: true, data: { scorecards, filters, departmentNames: DEPARTMENT_NAMES } };
  }

  async getBusinessUnitDashboard(user, query) {
    this.denyEmployee(user);
    this.assertEnterpriseAccess(user);
    const filters = this.parseFilters(query);
    const data = await this.loadCoreData(filters);
    const buRows = await this.repository.fetchBusinessUnits();
    const buMap = await this.repository.fetchBuDepartmentMap();

    const units = buRows.length
      ? buRows.map((u) => u.name)
      : BUSINESS_UNITS;

    const deptToBu = {};
    for (const row of buMap) {
      deptToBu[row.department_id] = row.business_unit_id;
    }

    const buIdToName = Object.fromEntries(buRows.map((u) => [u.id, u.name]));

    const scorecards = units.map((unitName) => {
      const unitTickets = data.tickets.filter((t) => {
        if (filters.business_unit && unitName !== filters.business_unit) return false;
        const buId = deptToBu[t.department_id];
        if (buId && buIdToName[buId]) return buIdToName[buId] === unitName;
        return unitName === 'Corporate Services';
      });

      const unitFeedback = data.feedback.filter((f) => {
        const ticket = data.tickets.find((tk) => tk.id === f.ticket_id);
        return unitTickets.some((ut) => ut.id === ticket?.id);
      });

      const kpis = this.computeKpis(unitTickets, unitFeedback, data.approvals, data.escalations, []);
      return {
        businessUnit: unitName,
        ticketCount: unitTickets.length,
        slaCompliancePct: kpis.slaCompliancePct,
        csatScore: kpis.csatScore,
        approvalTurnaroundHours: kpis.approvalTurnaroundHours,
        resolutionTrend: kpis.resolutionPct,
      };
    });

    return { success: true, data: { scorecards, filters } };
  }

  async getSlaAnalytics(user, query) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    const filters = this.parseFilters(query);
    const { tickets, escalations } = await this.loadCoreData(filters);
    const breached = tickets.filter((t) => t.sla_resolution_breached || t.sla_response_breached);
    return {
      success: true,
      data: {
        totalWithSla: tickets.filter((t) => t.sla_resolution_due_at).length,
        breachedCount: breached.length,
        compliancePct: tickets.length
          ? Math.round(((tickets.length - breached.length) / tickets.length) * 100)
          : 100,
        escalationEvents: escalations.length,
        byPriority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => ({
          priority: p,
          count: tickets.filter((t) => t.priority === p).length,
          breached: breached.filter((t) => t.priority === p).length,
        })),
      },
    };
  }

  async getCsatAnalytics(user) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    const feedback = await this.repository.fetchFeedback();
    return {
      success: true,
      data: {
        totalResponses: feedback.length,
        averageRating: Math.round(avg(feedback.map((f) => f.rating)) * 10) / 10,
        averageResolutionQuality: Math.round(avg(feedback.map((f) => f.resolution_quality)) * 10) / 10,
        averageCommunication: Math.round(avg(feedback.map((f) => f.communication_quality)) * 10) / 10,
        averageResponseTime: Math.round(avg(feedback.map((f) => f.response_time)) * 10) / 10,
      },
    };
  }

  async getApprovalAnalytics(user) {
    this.denyEmployee(user);
    this.assertEnterpriseAccess(user);
    const approvals = await this.repository.fetchApprovals();
    const byStatus = approvals.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    const completed = approvals.filter((a) => a.completed_at);
    return {
      success: true,
      data: {
        total: approvals.length,
        byStatus,
        averageTurnaroundHours: Math.round(
          avg(completed.map((a) => hoursBetween(a.started_at, a.completed_at))) * 10
        ) / 10,
        pending: approvals.filter((a) => a.status === 'PENDING').length,
      },
    };
  }

  async getKnowledgeAnalytics(user) {
    this.denyEmployee(user);
    this.assertEnterpriseAccess(user);
    const [views, articles] = await Promise.all([
      this.repository.fetchKnowledgeViews(),
      this.repository.fetchKnowledgeArticles(),
    ]);
    const articleViews = views.filter((v) => v.article_id);
    const searches = views.filter((v) => v.search_query);
    return {
      success: true,
      data: {
        publishedArticles: articles.length,
        totalViews: articleViews.length,
        searchCount: searches.length,
        deflectionRate: searches.length
          ? Math.round((searches.filter((v) => v.article_id).length / searches.length) * 100)
          : 0,
      },
    };
  }

  async getTrendAnalytics(user, query) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    const filters = this.parseFilters(query);
    const { tickets } = await this.loadCoreData(filters);

    const byMonth = tickets.reduce((acc, t) => {
      const month = t.created_at?.slice(0, 7) || 'unknown';
      if (!acc[month]) acc[month] = { created: 0, closed: 0 };
      acc[month].created += 1;
      if (CLOSED_STATUSES.includes(t.status)) acc[month].closed += 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        monthly: Object.entries(byMonth)
          .map(([month, counts]) => ({ month, ...counts }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
    };
  }

  async listReports(user) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');
    const reports = await this.repository.listReports(user.employeeId);
    return { success: true, data: reports };
  }

  async createReport(user, body) {
    this.denyEmployee(user);
    this.assertDepartmentAccess(user);
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');

    const input = parseSchema(CreateReportSchema, body, 'Report');
    let payload = {};

    switch (input.report_type) {
      case 'EXECUTIVE':
        this.assertEnterpriseAccess(user);
        payload = (await this.getExecutiveDashboard(user, input.filters)).data;
        break;
      case 'DEPARTMENT':
        payload = (await this.getDepartmentDashboard(user, input.filters)).data;
        break;
      case 'BUSINESS_UNIT':
        this.assertEnterpriseAccess(user);
        payload = (await this.getBusinessUnitDashboard(user, input.filters)).data;
        break;
      case 'SLA':
        payload = (await this.getSlaAnalytics(user, input.filters)).data;
        break;
      case 'CSAT':
        payload = (await this.getCsatAnalytics(user)).data;
        break;
      case 'APPROVAL':
        this.assertEnterpriseAccess(user);
        payload = (await this.getApprovalAnalytics(user)).data;
        break;
      case 'KNOWLEDGE':
        this.assertEnterpriseAccess(user);
        payload = (await this.getKnowledgeAnalytics(user)).data;
        break;
      case 'TREND':
        payload = (await this.getTrendAnalytics(user, input.filters)).data;
        break;
      default:
        payload = {};
    }

    const exportMeta = await buildExportBuffer(input.format, payload, input.name);

    const report = await this.repository.createReport({
      name: input.name,
      report_type: input.report_type,
      format: input.format,
      filters: input.filters,
      payload: { ...payload, exportMeta: { contentType: exportMeta.contentType, extension: exportMeta.extension } },
      created_by: user.employeeId,
    });

    return {
      success: true,
      data: {
        report,
        export: {
          format: input.format,
          contentType: exportMeta.contentType,
          extension: exportMeta.extension,
          base64: exportMeta.buffer.toString('base64'),
        },
      },
    };
  }

  async captureSnapshot(user, snapshotType, scopeKey, payload) {
    if (!user.employeeId) throw AppError.forbidden('Employee profile required');
    const snapshot = await this.repository.createSnapshot({
      snapshot_type: snapshotType,
      scope_key: scopeKey,
      payload,
      captured_by: user.employeeId,
    });
    return { success: true, data: snapshot };
  }
}

module.exports = ExecutiveAnalyticsService;
