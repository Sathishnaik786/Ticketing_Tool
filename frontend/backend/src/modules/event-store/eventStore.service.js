const repository = require('./eventStore.repository');
const eventBus = require('../../lib/eventBus');
const logger = require('../../lib/logger');

const recordEvent = async (eventPayload) => {
  const {
    tenant_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    meta_data = {},
    actor_id = null,
    event_version = 1
  } = eventPayload;

  if (!tenant_id || !aggregate_type || !aggregate_id || !event_type || !payload) {
    throw new Error('EventStore Service: missing required event fields.');
  }

  // 1. Write event directly to the database ledger
  const eventRecord = await repository.insertEvent({
    tenant_id,
    aggregate_type,
    aggregate_id,
    event_type,
    event_version,
    payload,
    meta_data,
    actor_id
  });

  // Log event using winston audit logger
  logger.info(`Audit Event: ${event_type}`, {
    tenant_id,
    aggregate_type,
    aggregate_id,
    event_type,
    actor_id,
    event_version,
    payload: sanitizePayload(payload)
  });

  // 2. Dispatch the event payload to the distributed application Event Bus
  eventBus.emit(event_type, eventRecord);

  // 3. Enqueue job in BullMQ event-queue for background processors
  try {
    const { getQueue } = require('../../lib/queue');
    const queue = getQueue('event-queue');
    if (queue) {
      await queue.add(event_type, { eventRecord });
    }
  } catch (err) {
    logger.error(`EventStore: failed to enqueue event ${event_type} to BullMQ event-queue:`, { error: err.message });
  }

  return eventRecord;
};

// Helper sanitization for logging to prevent leakage of credentials
const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = { ...payload };
  const sensitiveKeys = ['password', 'token', 'secret', 'credentials', 'authorization'];
  Object.keys(clone).forEach(key => {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      clone[key] = '[REDACTED]';
    }
  });
  return clone;
};

const getHistory = async (tenantId, aggregateType, aggregateId) => {
  return await repository.getEventsForAggregate(tenantId, aggregateType, aggregateId);
};

const checkAndProcess = async (eventId, tenantId, handlerName, handlerCallback) => {
  // Idempotency check: attempt to register processed log
  const registered = await repository.registerProcessedEvent(eventId, tenantId, handlerName);
  if (!registered) {
    console.log(`EventStore Service: duplicate event ${eventId} already processed by ${handlerName}. Skipping.`);
    return;
  }
  await handlerCallback();
};

module.exports = {
  recordEvent,
  getHistory,
  checkAndProcess
};
