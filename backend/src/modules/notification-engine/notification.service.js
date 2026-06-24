const repository = require('./notification.repository');
const eventStore = require('../event-store/eventStore.service');
const { getQueue } = require('../../lib/queue');
const logger = require('../../lib/auditLogger');
const { supabaseAdmin } = require('../../lib/supabase');

class NotificationService {
  // Simple mustache template interpolator
  interpolate(templateStr, data) {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  async sendNotification(tenantId, recipientId, templateKey, dataPayload) {
    logger.info(`NotificationBroker: preparing alert ${templateKey} for user ${recipientId}`);

    // 1. Resolve user email/details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', recipientId)
      .maybeSingle();

    if (userError || !userData) {
      logger.warn(`NotificationBroker: recipient user profile ${recipientId} not found. Skipping.`);
      return;
    }

    // 2. Fetch user preferences
    const prefs = await repository.getUserPreferences(tenantId, recipientId);
    const pref = prefs.find(p => p.template_key === templateKey);
    const enabledChannels = pref ? pref.enabled_channels : ['IN_APP', 'EMAIL']; // default channels fallback

    // Merge email and recipient data
    const compileData = {
      ...dataPayload,
      recipient_email: userData.email,
      agent_name: userData.email.split('@')[0]
    };

    for (const channel of enabledChannels) {
      try {
        // Fetch matching template definition
        const template = await repository.getTemplate(tenantId, templateKey, channel);
        if (!template) {
          logger.warn(`NotificationBroker: template ${templateKey} not registered for channel ${channel}. Skipping.`);
          continue;
        }

        const subject = this.interpolate(template.subject_template, compileData);
        const body = this.interpolate(template.body_template, compileData);

        // Log entry initialization
        const deliveryLog = await repository.createDeliveryLog({
          tenant_id: tenantId,
          recipient_id: recipientId,
          channel,
          status: 'PENDING',
          payload: { subject, body, recipient: userData.email }
        });

        // Enqueue dispatch
        const queue = getQueue('notify-queue');
        await queue.add('sendNotification', {
          tenantId,
          logId: deliveryLog.id,
          recipientId,
          channel,
          subject,
          body,
          recipient: userData.email
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        });

      } catch (err) {
        logger.error(`NotificationBroker: failed compiling channel ${channel} alert:`, err.message);
      }
    }

    // Record Notification event in EventStore
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'NOTIFICATION',
      aggregate_id: recipientId,
      event_type: 'notification.sent',
      payload: {
        template_key: templateKey,
        channels: enabledChannels
      }
    });
  }

  async processDelivery(tenantId, logId, channel, recipient, subject, body, attempts = 1) {
    logger.info(`NotificationBroker: dispatching alert ${logId} via ${channel} to ${recipient}`);

    try {
      // Simulate real-world dispatches
      if (channel === 'EMAIL') {
        logger.info(`SMTP: sending email to ${recipient}: ${subject}`);
      } else if (channel === 'SLACK' || channel === 'TEAMS') {
        logger.info(`Webhook: post hook payload to channel: ${body}`);
      } else {
        logger.info(`SMS/WhatsApp: dispatch text alert: ${body}`);
      }

      // Mark status as SENT
      await repository.updateDeliveryLog(tenantId, logId, 'SENT', null, attempts);
    } catch (err) {
      logger.error(`NotificationBroker: failed sending channel ${channel} to ${recipient}:`, err.message);
      await repository.updateDeliveryLog(tenantId, logId, 'FAILED', err.message, attempts, err.stack);
      throw err; // Trigger BullMQ retry
    }
  }
}

const serviceInstance = new NotificationService();

module.exports = serviceInstance;
