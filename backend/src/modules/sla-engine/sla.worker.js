const slaService = require('./sla.service');
const { isRedisConnected } = require('../../lib/redis');
const { resolveTenantId } = require('../../lib/tenantResolver');
const logger = require('../../lib/auditLogger');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processSlaJob = async (job) => {
  const tenantId = (job && job.data && job.data.tenantId) || await resolveTenantId(null);
  await slaService.checkBreachesAndTriggerEscalations(tenantId);
};

// Start BullMQ background worker if Redis active
if (isRedisConnected() && Worker) {
  new Worker('sla-queue', processSlaJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 2
  });
  logger.info('BullMQ Worker: [sla-queue] initialized.');
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('sla-queue:checkBreaches', async (data) => {
  await processSlaJob({ data });
});

// Local periodic checks fallback (run every 60 seconds)
const runSlaChecks = async () => {
  try {
    const tenantId = await resolveTenantId(null);
    await slaService.checkBreachesAndTriggerEscalations(tenantId);
  } catch (err) {
    logger.error('SLA background check error:', err.message);
  }
};

// Execute every 60 seconds locally
setInterval(runSlaChecks, 60 * 1000);

// Also run once on startup (after 5 seconds)
setTimeout(runSlaChecks, 5000);

module.exports = {
  processSlaJob,
  runSlaChecks
};
