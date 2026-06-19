const { TIMELINE_EVENT_MAP } = require('../notification-center.constants');

function resolveRecipient(eventData, fallbackId) {
  if (!eventData || typeof eventData !== 'object') return fallbackId;
  return eventData.recipient_id || eventData.assignee_id || eventData.employee_id || fallbackId;
}

function renderTemplate(template, vars) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
}

class NotificationCenterEventSyncService {
  constructor(deps = {}) {
    this.repository = deps.repository;
  }

  async syncForEmployee(employeeId) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let created = 0;

    created += await this.syncTimelineEvents(employeeId, since);
    created += await this.syncApprovals(employeeId, since);
    created += await this.syncFeedback(employeeId, since);
    created += await this.syncKnowledge(employeeId, since);
    created += await this.syncReports(employeeId, since);

    return created;
  }

  async syncAll() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let created = 0;
    created += await this.syncTimelineEvents(null, since);
    created += await this.syncApprovals(null, since);
    created += await this.syncFeedback(null, since);
    created += await this.syncKnowledge(null, since);
    created += await this.syncReports(null, since);
    return created;
  }

  async createEventIfNew({ employeeId, eventType, title, message, sourceModule, sourceId, priority }) {
    if (!employeeId) return 0;

    const prefs = await this.repository.getPreferences(employeeId);
    if (prefs && !prefs.in_app_enabled) return 0;

    const existing = await this.repository.findEventByDedup(employeeId, eventType, sourceModule, sourceId);
    if (existing) return 0;

    const event = await this.repository.createEvent({
      employee_id: employeeId,
      event_type: eventType,
      title,
      message,
      source_module: sourceModule,
      source_id: String(sourceId),
      priority: priority || 'NORMAL',
      status: 'ACTIVE',
      is_read: false,
    });

    if (event) {
      await this.repository.createDeliveryLog({
        event_id: event.id,
        channel: 'IN_APP',
        delivery_status: 'SENT',
      });
      return 1;
    }
    return 0;
  }

  async syncTimelineEvents(employeeId, since) {
    const entries = await this.repository.fetchTimelineEvents(since);
    let created = 0;

    for (const entry of entries) {
      const mapping = TIMELINE_EVENT_MAP[entry.event_type];
      if (!mapping) continue;

      const eventData = entry.event_data || {};
      const recipient = resolveRecipient(eventData, entry.created_by);
      if (employeeId && recipient !== employeeId) continue;

      const ticketId = entry.ticket_id || eventData.ticket_id || entry.id;
      created += await this.createEventIfNew({
        employeeId: recipient,
        eventType: mapping.eventType,
        title: mapping.eventType.replace(/_/g, ' '),
        message: `Activity on ticket ${ticketId}: ${entry.event_type}`,
        sourceModule: mapping.module,
        sourceId: `${entry.id}`,
        priority: mapping.priority,
      });
    }

    return created;
  }

  async syncApprovals(employeeId, since) {
    const approvals = await this.repository.fetchApprovals(since);
    let created = 0;

    const typeMap = {
      PENDING: { eventType: 'APPROVAL_REQUIRED', priority: 'HIGH' },
      APPROVED: { eventType: 'APPROVAL_APPROVED', priority: 'NORMAL' },
      REJECTED: { eventType: 'APPROVAL_REJECTED', priority: 'HIGH' },
    };

    for (const approval of approvals) {
      const mapping = typeMap[approval.status];
      if (!mapping) continue;

      const recipient = approval.started_by;
      if (employeeId && recipient !== employeeId) continue;

      created += await this.createEventIfNew({
        employeeId: recipient,
        eventType: mapping.eventType,
        title: mapping.eventType.replace(/_/g, ' '),
        message: `Approval ${approval.status.toLowerCase()} for ticket ${approval.ticket_id}`,
        sourceModule: 'approval',
        sourceId: approval.id,
        priority: mapping.priority,
      });
    }

    return created;
  }

  async syncFeedback(employeeId, since) {
    const items = await this.repository.fetchFeedback(since);
    let created = 0;

    for (const fb of items) {
      const recipient = fb.submitted_by;
      if (employeeId && recipient !== employeeId) continue;

      created += await this.createEventIfNew({
        employeeId: recipient,
        eventType: 'FEEDBACK_SUBMITTED',
        title: 'Feedback Submitted',
        message: `Feedback submitted for ticket ${fb.ticket_id}`,
        sourceModule: 'feedback',
        sourceId: fb.id,
        priority: 'LOW',
      });
    }

    return created;
  }

  async syncKnowledge(employeeId, since) {
    const articles = await this.repository.fetchPublishedArticles(since);
    let created = 0;

    for (const article of articles) {
      const recipient = article.author_id;
      if (employeeId && recipient !== employeeId) continue;

      created += await this.createEventIfNew({
        employeeId: recipient,
        eventType: 'KNOWLEDGE_PUBLISHED',
        title: 'Article Published',
        message: `Article "${article.title}" was published`,
        sourceModule: 'knowledge',
        sourceId: article.id,
        priority: 'NORMAL',
      });
    }

    return created;
  }

  async syncReports(employeeId, since) {
    const reports = await this.repository.fetchReports(since);
    let created = 0;

    for (const report of reports) {
      const recipient = report.created_by;
      if (employeeId && recipient !== employeeId) continue;

      created += await this.createEventIfNew({
        employeeId: recipient,
        eventType: 'REPORT_GENERATED',
        title: 'Report Generated',
        message: `Report "${report.name}" has been generated`,
        sourceModule: 'analytics',
        sourceId: report.id,
        priority: 'LOW',
      });
    }

    return created;
  }
}

module.exports = NotificationCenterEventSyncService;
module.exports.renderTemplate = renderTemplate;
