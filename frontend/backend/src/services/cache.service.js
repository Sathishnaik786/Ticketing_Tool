/**
 * Cache Service
 * Provides Redis-based caching functionality for improved performance
 */
const { redis } = require('@lib/redis');
const config = require('@config');

class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null
   */
  static async get(key) {
    if (!config.ENABLE_CACHE) {
      return null;
    }

    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null; // Fail gracefully - don't break the app
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: from config)
   * @returns {Promise<boolean>} - Success status
   */
  static async set(key, value, ttlSeconds = null) {
    if (!config.ENABLE_CACHE) {
      return false;
    }

    try {
      const ttl = ttlSeconds || config.CACHE_TTL;
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(key) {
    if (!config.ENABLE_CACHE) {
      return false;
    }

    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Redis key pattern (e.g., 'employee:*')
   * @returns {Promise<number>} - Number of keys deleted
   */
  static async deletePattern(pattern) {
    if (!config.ENABLE_CACHE) {
      return 0;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return 0;
    }
  }

  /**
   * Invalidate cache for a specific entity type
   * @param {string} entityType - Entity type (e.g., 'employee', 'project')
   * @param {string|null} entityId - Specific entity ID (optional)
   * @returns {Promise<number>} - Number of keys deleted
   */
  static async invalidateEntity(entityType, entityId = null) {
    if (!config.ENABLE_CACHE) {
      return 0;
    }

    const patterns = [];
    
    if (entityId) {
      // Invalidate specific entity
      patterns.push(`${entityType}:${entityId}`);
      patterns.push(`cache:*/${entityType}s/${entityId}*`);
    }
    
    // Invalidate all entities of this type
    patterns.push(`${entityType}:*`);
    patterns.push(`${entityType}s:*`);
    patterns.push(`cache:*/${entityType}s*`);
    patterns.push(`list:${entityType}s:*`);

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await this.deletePattern(pattern);
      totalDeleted += deleted;
    }

    return totalDeleted;
  }

  /**
   * Generate cache key from request
   * @param {Object} req - Express request object
   * @returns {string} - Cache key
   */
  static generateCacheKey(req) {
    const userContext = req.user ? `:user:${req.user.id}` : '';
    const queryString = Object.keys(req.query).length > 0 
      ? `:${JSON.stringify(req.query)}` 
      : '';
    return `cache:${req.method}:${req.originalUrl}${userContext}${queryString}`;
  }

  /**
   * Check if caching is enabled
   * @returns {boolean}
   */
  static isEnabled() {
    return config.ENABLE_CACHE;
  }

  /**
   * Get cache statistics (for monitoring)
   * @returns {Promise<Object>} - Cache stats
   */
  static async getStats() {
    if (!config.ENABLE_CACHE) {
      return { enabled: false };
    }

    try {
      const info = await redis.info('stats');
      const keyspace = await redis.info('keyspace');
      
      return {
        enabled: true,
        info: info,
        keyspace: keyspace
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return { enabled: true, error: error.message };
    }
  }
}

module.exports = CacheService;




