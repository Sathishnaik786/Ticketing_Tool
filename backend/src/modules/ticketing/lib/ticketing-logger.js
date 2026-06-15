const logger = require('../../../lib/logger');

const ALLOWED_META_KEYS = new Set([
  'ticketId',
  'attachmentId',
  'categoryId',
  'status',
  'priority',
  'eventType',
  'recipientCount',
  'mimeType',
  'fileSize',
  'durationMs',
]);

function sanitizeMeta(meta = {}) {
  return Object.entries(meta).reduce((acc, [key, value]) => {
    if (ALLOWED_META_KEYS.has(key) && value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function logTicketingEvent(event, meta = {}) {
  logger.info('etms_event', {
    module: 'ticketing',
    event,
    ...sanitizeMeta(meta),
  });
}

module.exports = {
  logTicketingEvent,
};
