/**
 * Cache Middleware
 * Automatically caches GET request responses
 */
const CacheService = require('../services/cache.service');
const config = require('@config');

/**
 * Cache middleware for GET requests
 * @param {number} ttlSeconds - Cache TTL in seconds (optional, uses config default)
 * @returns {Function} - Express middleware
 */
const cacheMiddleware = (ttlSeconds = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if disabled
    if (!config.ENABLE_CACHE) {
      return next();
    }

    // Skip cache if query param noCache is present
    if (req.query.noCache === 'true') {
      return next();
    }

    // Skip cache for authenticated routes that need fresh data
    // (can be customized per route)
    if (req.query.skipCache === 'true') {
      return next();
    }

    // Generate cache key
    const cacheKey = CacheService.generateCacheKey(req);

    try {
      // Try to get from cache
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        // Add cache header
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success !== false) {
          const ttl = ttlSeconds || config.CACHE_TTL;
          CacheService.set(cacheKey, data, ttl).catch(err => {
            console.error('Failed to cache response:', err.message);
          });
        }
        
        // Add cache header
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next(); // Continue even if cache fails
    }
  };
};

/**
 * Manual cache invalidation middleware
 * Call this after mutations to invalidate related cache
 */
const invalidateCache = async (req, res, next) => {
  // This is called after successful mutations
  // Extract entity type from route
  const route = req.route?.path || req.path;
  const entityType = route.split('/')[2] || 'unknown'; // e.g., /api/employees -> employees
  
  try {
    await CacheService.invalidateEntity(entityType);
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
    // Don't fail the request if cache invalidation fails
  }
  
  next();
};

module.exports = {
  cacheMiddleware,
  invalidateCache
};




