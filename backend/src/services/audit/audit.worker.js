const { supabaseAdmin } = require('../../lib/supabase');
const { isRedisConnected } = require('../../lib/redis');
const logger = require('../../lib/auditLogger');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processAuditJob = async (job) => {
  const { tenantId, actorId, action, targetEntity, targetId, oldValues, newValues } = job.data;
  
  logger.info(`AuditWorker: processing setting audit log for action: ${action}`);

  const { error } = await supabaseAdmin
    .from('system_audit_logs')
    .insert([{
      tenant_id: tenantId,
      actor_id: actorId || null,
      action,
      target_entity: targetEntity,
      target_id: targetId || null,
      old_values: oldValues || {},
      new_values: newValues || {}
    }]);

  if (error) {
    logger.error('AuditWorker: Failed to insert system_audit_logs record:', error.message);
    throw new Error(error.message);
  }
};

// Start BullMQ background worker if Redis active
if (isRedisConnected() && Worker) {
  new Worker('audit-queue', processAuditJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 5
  });
  logger.info('BullMQ Worker: [audit-queue] initialized.');
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('audit-queue:logSettingAction', async (data) => {
  await processAuditJob({ data });
});

module.exports = {
  processAuditJob
};
