const express = require('express');
const router = express.Router();
const { redis } = require('@lib/redis');
const { supabase } = require('@lib/supabase');
const CacheService = require('../services/cache.service');
const TelemetryService = require('../services/telemetry/telemetry.service');
const AuditService = require('../services/audit/audit.service');
const config = require('@config');


/**
 * Comprehensive health check endpoint
 * Checks server, database, Redis, and cache status
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    services: {}
  };

  // Check Redis connection safely without hanging when maxRetriesPerRequest is null
  try {
    if (redis.status !== 'ready') {
      throw new Error(`Redis connection is not ready (current status: ${redis.status})`);
    }
    await redis.ping();
    health.services.redis = {
      status: 'healthy',
      connected: true
    };
  } catch (error) {
    health.services.redis = {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check Database connection
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    health.services.database = {
      status: 'healthy',
      connected: true
    };
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check Cache status
  try {
    const cacheEnabled = CacheService.isEnabled();
    health.services.cache = {
      status: cacheEnabled ? 'enabled' : 'disabled',
      enabled: cacheEnabled
    };
  } catch (error) {
    health.services.cache = {
      status: 'error',
      error: error.message
    };
  }

  // Check Telemetry status
  try {
    const telemetryStatus = TelemetryService.getStatus();
    health.services.telemetry = {
      status: 'ok',
      ...telemetryStatus,
    };
  } catch (error) {
    health.services.telemetry = {
      status: 'error',
      error: error.message
    };
  }

  // Check Audit status (Phase 9.2)
  try {
    const auditEnabled = AuditService.isEnabled();
    const queueDepth = AuditService.getQueueDepth();
    health.services.audit = {
      status: auditEnabled ? 'enabled' : 'disabled',
      enabled: auditEnabled,
      queueDepth
    };
    health.audit = {
      enabled: auditEnabled,
      queueDepth
    };
  } catch (error) {
    health.services.audit = {
      status: 'error',
      error: error.message
    };
    health.audit = {
      enabled: false,
      error: error.message
    };
  }

  // Determine overall status
  const allHealthy = Object.values(health.services).every(
    service => service.status === 'healthy' || service.status === 'enabled' || service.status === 'disabled' || service.status === 'ok'
  );

  const statusCode = health.status === 'ok' && allHealthy ? 200 : 503;
  
  res.status(statusCode).json(health);

});

/**
 * Simple health check (for load balancers)
 */
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * Detailed Redis status health check
 */
router.get('/redis', async (req, res) => {
  try {
    if (redis.status !== 'ready') {
      throw new Error(`Redis connection is not ready (current status: ${redis.status})`);
    }
    await redis.ping();
    const info = await redis.info('memory');
    
    // Parse memory metrics from Redis INFO output
    const lines = info.split('\r\n');
    const metrics = {};
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        metrics[parts[0]] = parts[1];
      }
    });

    res.status(200).json({
      status: 'healthy',
      connected: true,
      timestamp: new Date().toISOString(),
      details: {
        status: redis.status,
        memory: {
          used_memory_human: metrics.used_memory_human || 'unknown',
          used_memory_peak_human: metrics.used_memory_peak_human || 'unknown'
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      connected: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Detailed BullMQ queue depth and counts health check
 */
router.get('/queues', async (req, res) => {
  const queueNames = [
    'workflow-queue',
    'approval-queue',
    'notify-queue',
    'sla-queue',
    'audit-queue',
    'event-queue'
  ];
  const { getQueue } = require('../lib/queue');
  const queueDetails = {};
  let overallStatus = 'healthy';
  
  for (const qName of queueNames) {
    try {
      const queue = getQueue(qName);
      if (queue && typeof queue.getJobCounts === 'function') {
        const counts = await queue.getJobCounts();
        queueDetails[qName] = {
          status: 'active',
          jobCounts: counts
        };
      } else {
        queueDetails[qName] = {
          status: 'mock/in-memory',
          jobCounts: { active: 0, completed: 0, failed: 0 }
        };
      }
    } catch (err) {
      overallStatus = 'degraded';
      queueDetails[qName] = {
        status: 'error',
        error: err.message
      };
    }
  }
  
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    queues: queueDetails
  });
});

module.exports = router;




