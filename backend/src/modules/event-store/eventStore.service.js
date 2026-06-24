const repository = require('./eventStore.repository');
const eventBus = require('../../lib/eventBus');

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

  // 2. Dispatch the event payload to the distributed application Event Bus
  eventBus.emit(event_type, eventRecord);

  return eventRecord;
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
