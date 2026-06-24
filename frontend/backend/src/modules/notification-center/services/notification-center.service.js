const AppError = require('../../../utils/app-error');
const NotificationCenterRepository = require('../repositories/notification-center.repository');
const NotificationCenterEventSyncService = require('./notification-center-event-sync.service');
const {
  parseSchema,
  NotificationFilterSchema,
  PreferencesSchema,
  TemplateSchema,
  TemplateUpdateSchema,
  AnalyticsFilterSchema,
} = require('../validators/notification-center.validation');
const { ANALYTICS_ROLES, TEMPLATE_ADMIN_ROLES } = require('../notification-center.constants');

function normalizeRole(role) {
  return String(role || 'EMPLOYEE').toUpperCase();
}

class NotificationCenterService {
  constructor(deps = {}) {
    this.repository = deps.repository || new NotificationCenterRepository(deps);
    this.eventSync = deps.eventSync || new NotificationCenterEventSyncService({ repository: this.repository });
  }

  assertAuthenticated(user) {
    if (!user?.employeeId) {
      throw AppError.unauthorized('Employee profile required');
    }
  }

  assertAnalyticsAccess(user) {
    if (!ANALYTICS_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Notification analytics requires Manager or Admin access');
    }
  }

  assertTemplateAdmin(user) {
    if (!TEMPLATE_ADMIN_ROLES.includes(normalizeRole(user.role))) {
      throw AppError.forbidden('Template management requires Admin access');
    }
  }

  async syncEvents(user) {
    await this.eventSync.syncForEmployee(user.employeeId);
  }

  async getMyNotifications(user, query) {
    this.assertAuthenticated(user);
    await this.syncEvents(user);
    const filters = parseSchema(NotificationFilterSchema, query ?? {}, 'Filters');
    const notifications = await this.repository.listEvents(user.employeeId, filters);
    return { success: true, data: { notifications, filters } };
  }

  async getUnreadCount(user) {
    this.assertAuthenticated(user);
    await this.syncEvents(user);
    const count = await this.repository.countUnread(user.employeeId);
    return { success: true, data: { count } };
  }

  async markRead(user, eventId) {
    this.assertAuthenticated(user);
    const updated = await this.repository.markRead(eventId, user.employeeId);
    if (!updated) throw AppError.notFound('Notification not found');
    return { success: true, data: updated };
  }

  async markAllRead(user) {
    this.assertAuthenticated(user);
    await this.repository.markAllRead(user.employeeId);
    return { success: true, data: { marked: true } };
  }

  async getPreferences(user) {
    this.assertAuthenticated(user);
    let prefs = await this.repository.getPreferences(user.employeeId);
    if (!prefs) {
      prefs = await this.repository.upsertPreferences(user.employeeId, {
        email_enabled: true,
        in_app_enabled: true,
        sms_enabled: false,
        push_enabled: false,
      });
    }
    return { success: true, data: prefs };
  }

  async updatePreferences(user, body) {
    this.assertAuthenticated(user);
    const prefs = parseSchema(PreferencesSchema, body ?? {}, 'Preferences');
    const updated = await this.repository.upsertPreferences(user.employeeId, prefs);
    return { success: true, data: updated };
  }

  async getAnalytics(user, query) {
    this.assertAnalyticsAccess(user);
    const filters = parseSchema(AnalyticsFilterSchema, query ?? {}, 'Analytics filters');

    let employeeIds;
    if (normalizeRole(user.role) === 'MANAGER' && user.departmentId) {
      const deptEmployees = await this.repository.fetchEmployeesByDepartment(user.departmentId);
      employeeIds = deptEmployees.map((e) => e.id);
    }

    const events = await this.repository.fetchEventsForAnalytics({
      ...filters,
      employee_ids: employeeIds,
    });

    const eventIds = events.map((e) => e.id);
    const deliveries = await this.repository.fetchDeliveryLogs(eventIds);

    const total = events.length;
    const unread = events.filter((e) => !e.is_read).length;
    const readPct = total ? Math.round(((total - unread) / total) * 100) : 0;

    const byModule = {};
    const byPriority = {};
    for (const e of events) {
      byModule[e.source_module] = (byModule[e.source_module] || 0) + 1;
      byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
    }

    const sent = deliveries.filter((d) => d.delivery_status === 'SENT').length;
    const deliveryPct = deliveries.length ? Math.round((sent / deliveries.length) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        unread,
        readPct,
        deliveryPct,
        byModule: Object.entries(byModule).map(([module, count]) => ({ module, count })),
        byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
      },
    };
  }

  async listTemplates(user) {
    this.assertTemplateAdmin(user);
    const templates = await this.repository.listTemplates();
    return { success: true, data: templates };
  }

  async createTemplate(user, body) {
    this.assertTemplateAdmin(user);
    const row = parseSchema(TemplateSchema, body ?? {}, 'Template');
    const created = await this.repository.createTemplate(row);
    return { success: true, data: created };
  }

  async updateTemplate(user, id, body) {
    this.assertTemplateAdmin(user);
    const row = parseSchema(TemplateUpdateSchema, body ?? {}, 'Template');
    const updated = await this.repository.updateTemplate(id, row);
    if (!updated) throw AppError.notFound('Template not found');
    return { success: true, data: updated };
  }

  async deleteTemplate(user, id) {
    this.assertTemplateAdmin(user);
    await this.repository.deleteTemplate(id);
    return { success: true, data: { deleted: true } };
  }
}

module.exports = NotificationCenterService;
