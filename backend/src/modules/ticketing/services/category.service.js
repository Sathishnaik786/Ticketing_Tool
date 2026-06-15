const AppError = require('../../../utils/app-error');
const { successResponse } = require('../ticketing.types');

class CategoryService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
  }

  async listCategories(user) {
    if (!user?.id) {
      throw AppError.unauthorized('Authentication required');
    }

    const { data, error } = await this.db
      .from('ticket_categories')
      .select('id, name, description, department_id, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw AppError.internal('Unable to fetch ticket categories');
    }

    return successResponse(data || []);
  }
}

module.exports = CategoryService;
