const { supabaseAdmin } = require('../../lib/supabase');
const { isRedisConnected } = require('../../lib/redis');
const logger = require('../../lib/logger');
const eventStoreService = require('./eventStore.service');
const slaService = require('../sla-engine/sla.service');
const workflowService = require('../workflow-engine/workflow.service');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processEventJob = async (job) => {
  const { eventRecord } = job.data;
  if (!eventRecord) {
    logger.warn('EventWorker: missing eventRecord in job payload.');
    return;
  }
  const { id: eventId, tenant_id: tenantId, event_type: eventType, aggregate_id: aggregateId, payload, actor_id: actorId } = eventRecord;

  logger.info(`EventWorker: processing event ${eventType} (ID: ${eventId})`);

  // Idempotency check
  const handlerName = `EventWorker:${eventType}`;
  await eventStoreService.checkAndProcess(eventId, tenantId, handlerName, async () => {
    switch (eventType) {
      case 'ticket.created': {
        // Apply SLA Policy
        logger.info(`EventWorker: matching SLA for ticket ${aggregateId}`);
        await slaService.matchAndApplySLA(tenantId, aggregateId);
        break;
      }
      case 'catalog.requested': {
        // Start workflow if item_id has associated workflow
        const { item_id, ticket_id, requested_by } = payload;
        if (item_id && ticket_id) {
          logger.info(`EventWorker: fetching workflow_id for catalog item ${item_id}`);
          const { data: item, error } = await supabaseAdmin
            .from('service_catalog_items')
            .select('workflow_id')
            .eq('tenant_id', tenantId)
            .eq('id', item_id)
            .maybeSingle();

          if (error) {
            logger.error(`EventWorker: failed to fetch catalog item ${item_id}: ${error.message}`);
          } else if (item && item.workflow_id) {
            logger.info(`EventWorker: starting workflow ${item.workflow_id} for ticket ${ticket_id}`);
            await workflowService.startWorkflowForTicket(tenantId, ticket_id, item.workflow_id, requested_by || actorId);
          } else {
            logger.info(`EventWorker: no active workflow found for catalog item ${item_id}`);
          }
        }
        break;
      }
      default:
        logger.info(`EventWorker: no background handler registered for event type "${eventType}".`);
        break;
    }
  });
};

if (isRedisConnected() && Worker) {
  new Worker('event-queue', processEventJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 5
  });
  logger.info('BullMQ Worker: [event-queue] initialized.');
}

const eventBus = require('../../lib/eventBus');
// Subscribe to event-queue fallback notifications
eventBus.subscribe('event-queue:ticket.created', async (data) => {
  await processEventJob({ data });
});
eventBus.subscribe('event-queue:catalog.requested', async (data) => {
  await processEventJob({ data });
});

module.exports = {
  processEventJob
};
