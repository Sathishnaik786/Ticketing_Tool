const AppError = require('../../../utils/app-error');
const { ACTIVITY_TYPES, successResponse } = require('../ticketing.types');

function handleDbError(error, notFoundMessage = 'Resource not found') {
  if (!error) return;
  if (error.code === 'PGRST116') {
    throw AppError.notFound(notFoundMessage);
  }
  throw AppError.internal('Unable to complete the requested operation');
}

class ActivityService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async logActivity({
    ticketId,
    actorId,
    activityType,
    oldValue = null,
    newValue = null,
    description = null,
  }) {
    const { data, error } = await this.db
      .from('ticket_activities')
      .insert([{
        ticket_id: ticketId,
        actor_id: actorId,
        activity_type: activityType,
        old_value: oldValue,
        new_value: newValue,
        description,
      }])
      .select()
      .single();

    handleDbError(error, 'Activity not found');
    return data;
  }

  async getTimeline(ticketId, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.db
      .from('ticket_activities')
      .select('*', { count: 'exact' })
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    handleDbError(error, 'Timeline not found');

    return successResponse(data || [], {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit) || 0,
    });
  }
}

module.exports = ActivityService;
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
