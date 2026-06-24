const notificationService = require('./notification.service');
const { isRedisConnected } = require('../../lib/redis');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processNotificationJob = async (job) => {
  const { tenantId, logId, channel, recipient, subject, body, recipientId, templateKey, data } = job.data;
  
  if (templateKey) {
    // Unresolved notification request from workflow/SLA engine
    await notificationService.sendNotification(tenantId, recipientId, templateKey, data);
  } else if (logId) {
    // Resolved dispatch ready for delivery
    await notificationService.processDelivery(tenantId, logId, channel, recipient, subject, body, job.attemptsMade || 1);
  }
};

// Start BullMQ background worker if Redis active
if (isRedisConnected() && Worker) {
  const notifyWorker = new Worker('notify-queue', processNotificationJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 10
  });
  console.log('BullMQ Worker: [notify-queue] initialized.');

  notifyWorker.on('failed', async (job, err) => {
    const logger = require('../../lib/logger');
    logger.error(`BullMQ notify-queue job failed: ${job.id}`, { error: err.message, stack: err.stack });

    const { tenantId, logId } = job.data;
    if (tenantId && logId) {
      const repository = require('./notification.repository');
      try {
        await repository.updateDeliveryLog(tenantId, logId, 'FAILED', err.message, job.attemptsMade, err.stack);
      } catch (dbErr) {
        logger.error(`Failed to update delivery log status to FAILED in DB: ${dbErr.message}`);
      }
    }

    try {
      const redisClient = require('../../lib/redis').getClient();
      await redisClient.rpush('failed:jobs:list', JSON.stringify({
        queue: 'notify-queue',
        jobId: job.id,
        data: job.data,
        failedAt: new Date().toISOString(),
        error: err.message,
        stack: err.stack
      }));
    } catch (redisErr) {
      logger.error('Failed to write job to Dead Letter Queue list in Redis:', redisErr.message);
    }
  });
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('notify-queue:sendNotification', async (data) => {
  await processNotificationJob({ data: data, attemptsMade: 1 });
});

module.exports = {
  processNotificationJob
};
