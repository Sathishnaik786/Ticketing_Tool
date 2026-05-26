const express = require('express');
const router = express.Router();
const { redis } = require('@lib/redis');
const { supabase } = require('@lib/supabase');
const CacheService = require('../services/cache.service');
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

  // Determine overall status
  const allHealthy = Object.values(health.services).every(
    service => service.status === 'healthy' || service.status === 'enabled' || service.status === 'disabled'
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

module.exports = router;




