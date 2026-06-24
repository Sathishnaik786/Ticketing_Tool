const workflowService = require('./workflow.service');
const { isRedisConnected } = require('../../lib/redis');

let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  // Safe load if bullmq not installed
}

const processWorkflowJob = async (job) => {
  const { tenantId, ticketId, versionId, stepId, depth } = job.data;
  await workflowService.executeStepDetails(tenantId, ticketId, versionId, stepId, depth);
};

// Initializing the BullMQ background worker loop if Redis is connected
if (isRedisConnected() && Worker) {
  new Worker('workflow-queue', processWorkflowJob, {
    connection: require('../../lib/redis').getClient(),
    concurrency: 5
  });
  console.log('BullMQ Worker: [workflow-queue] initialized.');
}

// Local EventBus listener fallback
const eventBus = require('../../lib/eventBus');
eventBus.subscribe('workflow-queue:processStep', async (data) => {
  await processWorkflowJob({ data });
});

module.exports = {
  processWorkflowJob
};
