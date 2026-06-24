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
    await notificationService.processDelivery(tenantId, logId, channel, recipient, subject, body);
  }
};

// Start BullMQ background worker if Redis active
if (isRedisConnected() && Worker) {
  new Worker('notify-queue', processNotificationJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 10
  });
  console.log('BullMQ Worker: [notify-queue] initialized.');
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('notify-queue:sendNotification', async (data) => {
  await processNotificationJob({ data });
});

module.exports = {
  processNotificationJob
};
