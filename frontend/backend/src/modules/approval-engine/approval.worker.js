const approvalService = require('./approval.service');
const { isRedisConnected } = require('../../lib/redis');
const logger = require('../../lib/auditLogger');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processApprovalJob = async (job) => {
  const { name, data } = job;
  const jobName = name || job.name;
  
  logger.info(`ApprovalWorker: processing job ${jobName}`);

  if (jobName === 'createApproval') {
    const { tenantId, ticketId, stepName, assignedRole, assignedUserId } = data;
    await approvalService.evaluateAndCreateAssignments(tenantId, ticketId, stepName, assignedRole, assignedUserId);
  } else if (jobName === 'monitorEscalation') {
    const { tenantId, assignmentId } = data;
    await approvalService.runEscalationProcess(tenantId, assignmentId);
  }
};

// Start BullMQ background worker if Redis active
if (isRedisConnected() && Worker) {
  new Worker('approval-queue', processApprovalJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 5
  });
  logger.info('BullMQ Worker: [approval-queue] initialized.');
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('approval-queue:createApproval', async (data) => {
  await processApprovalJob({ name: 'createApproval', data });
});
eventBus.subscribe('approval-queue:monitorEscalation', async (data) => {
  await processApprovalJob({ name: 'monitorEscalation', data });
});

module.exports = {
  processApprovalJob
};
