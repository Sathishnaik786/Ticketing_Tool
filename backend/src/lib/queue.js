const { isRedisConnected, getClient } = require('./redis');

let QueueInstance = null;
let bullmqLoaded = false;
let Queue = null;

try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
  bullmqLoaded = true;
} catch (err) {
  console.warn('BullMQ is not installed in the package.json. Initializing mock queue fallback.');
}

const queues = {};

const initializeQueue = (queueName) => {
  const useRedis = isRedisConnected() && bullmqLoaded;

  if (useRedis) {
    try {
      const client = getClient();
      queues[queueName] = new Queue(queueName, {
        connection: client
      });
      console.log(`BullMQ Queue [${queueName}] initialized.`);
    } catch (err) {
      console.error(`Failed to initialize BullMQ queue [${queueName}]:`, err.message);
      setupMockQueue(queueName);
    }
  } else {
    setupMockQueue(queueName);
  }
};

const setupMockQueue = (queueName) => {
  // Mock Queue interface to execute tasks synchronously via local EventBus if needed
  queues[queueName] = {
    add: async (jobName, data, opts) => {
      // Import eventBus dynamically to avoid circular dependencies
      const eventBus = require('./eventBus');
      const logger = require('./auditLogger');
      
      logger.info(`[MockQueue:${queueName}] Job enqueued: ${jobName}`, { jobName, data });
      
      // Dispatch immediately to event bus subscribers so that handlers execute synchronously
      // Trigger execution event: queueName.jobName
      setTimeout(() => {
        eventBus.emit(`${queueName}:${jobName}`, data);
      }, 0);

      return { id: `mock-job-${Date.now()}`, data };
    },
    close: async () => {}
  };
  console.log(`Mock Queue [${queueName}] initialized (In-memory fallback).`);
};

// Initialize all required system queues
const initAllQueues = () => {
  const systemQueues = [
    'workflow-queue',
    'approval-queue',
    'notify-queue',
    'sla-queue',
    'audit-queue'
  ];

  systemQueues.forEach(initializeQueue);
};

const getQueue = (queueName) => {
  if (!queues[queueName]) {
    initializeQueue(queueName);
  }
  return queues[queueName];
};

module.exports = {
  initAllQueues,
  getQueue
};
