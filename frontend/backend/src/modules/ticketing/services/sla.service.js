const AppError = require('../../../utils/app-error');
const { successResponse } = require('../ticketing.types');

function handleDbError(error, notFoundMessage = 'SLA rule not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class SlaService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async getApplicableRule({ departmentId = null, categoryId = null, priority }) {
    const queries = [
      { department_id: departmentId, category_id: categoryId, priority },
      { department_id: departmentId, category_id: null, priority },
      { department_id: null, category_id: categoryId, priority },
      { department_id: null, category_id: null, priority },
    ];

    for (const filters of queries) {
      let query = this.db
        .from('ticket_sla_rules')
        .select('*')
        .eq('priority', priority)
        .eq('is_active', true);

      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id);
      } else {
        query = query.is('department_id', null);
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      } else {
        query = query.is('category_id', null);
      }

      const { data, error } = await query.maybeSingle();
      handleDbError(error);
      if (data) {
        return data;
      }
    }

    return null;
  }

  calculateDueDates(rule, baseDate = new Date()) {
    if (!rule) {
      return {
        sla_response_due_at: null,
        sla_resolution_due_at: null,
      };
    }

    const start = new Date(baseDate);
    const responseDue = new Date(start.getTime() + rule.response_time_minutes * 60 * 1000);
    const resolutionDue = new Date(start.getTime() + rule.resolution_time_minutes * 60 * 1000);

    return {
      sla_response_due_at: responseDue.toISOString(),
      sla_resolution_due_at: resolutionDue.toISOString(),
    };
  }

  async resolveDueDates(ticketInput, baseDate = new Date()) {
    const rule = await this.getApplicableRule({
      departmentId: ticketInput.department_id || null,
      categoryId: ticketInput.category_id || null,
      priority: ticketInput.priority || 'MEDIUM',
    });

    return successResponse({
      rule,
      dueDates: this.calculateDueDates(rule, baseDate),
    });
  }
}

module.exports = SlaService;
