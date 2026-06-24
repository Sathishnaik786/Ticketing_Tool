const logger = require('@lib/logger');

class RedisHealthService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.intervalId = null;
    this.isHealthy = false;
  }

  /**
   * Start the periodic ping interval
   * @param {number} intervalMs 
   */
  start(intervalMs = 60000) {
    if (this.intervalId) return;

    logger.info('[REDIS_HEALTH] Starting periodic health checks');
    this.intervalId = setInterval(() => this.checkHealth(), intervalMs);
    
    // Initial check
    this.checkHealth();
  }

  /**
   * Stop the periodic ping interval
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * PING the Redis server and update health state
   */
  async checkHealth() {
    if (!this.redis) return;

    try {
      // ioredis ping returns 'PONG'
      const result = await this.redis.ping();
      if (result === 'PONG') {
        if (!this.isHealthy) {
          this.isHealthy = true;
          logger.info('[REDIS_HEALTHY] Redis connection is fully operational');
        }
      } else {
        this._markUnhealthy('Unexpected ping response: ' + result);
      }
    } catch (error) {
      this._markUnhealthy(error.message);
    }
  }

  _markUnhealthy(reason) {
    if (this.isHealthy) {
      this.isHealthy = false;
      logger.warn('[REDIS_RECONNECTING] Redis ping failed, connection lost', { reason });
    }
  }
}

module.exports = RedisHealthService;
