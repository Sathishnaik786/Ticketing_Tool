const { exec } = require('child_process');
const util = require('util');
const logger = require('@lib/logger');

const execAsync = util.promisify(exec);

/**
 * Docker Health and Bootstrap Utility
 */
class DockerHealth {
  /**
   * Check if Docker is installed and running
   */
  static async detectDocker() {
    try {
      await execAsync('docker info');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Audit the Redis container status
   * Returns: { exists: boolean, running: boolean }
   */
  static async auditRedisContainer() {
    try {
      const { stdout } = await execAsync('docker ps -a --format "{{.Names}}||{{.State}}" --filter "name=redis"');
      
      if (!stdout.trim()) {
        return { exists: false, running: false };
      }

      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const [name, state] = line.split('||');
        if (name === 'redis') {
          return { exists: true, running: state === 'running' };
        }
      }
      return { exists: false, running: false };
    } catch (error) {
      logger.error('Failed to audit redis container', { message: error.message });
      return { exists: false, running: false };
    }
  }

  /**
   * Start an existing stopped Redis container
   */
  static async startRedisContainer() {
    try {
      logger.info('[REDIS_AUTO_START] Starting existing Redis container...');
      await execAsync('docker start redis');
      // Wait a moment for Redis to initialize inside the container
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      logger.error('Failed to start Redis container', { message: error.message });
      return false;
    }
  }

  /**
   * Create and start a new Redis container
   */
  static async createRedisContainer() {
    try {
      logger.info('[REDIS_CONTAINER_CREATED] Creating new Redis container...');
      await execAsync('docker run -d --name redis -p 6379:6379 redis:7-alpine');
      // Wait a moment for Redis to initialize inside the container
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      logger.error('Failed to create Redis container', { message: error.message });
      return false;
    }
  }

  /**
   * Master Bootstrap Function
   * Returns true if Docker is running and Redis container is ready.
   * Returns false if Docker is unavailable (graceful fallback).
   */
  static async bootstrapRedis() {
    logger.info('[DOCKER_AUDIT] Auditing local Docker environment...');
    
    const dockerRunning = await this.detectDocker();
    if (!dockerRunning) {
      logger.warn('[DOCKER_OFFLINE] Docker daemon not found or not running. Proceeding with in-memory mode.');
      return false;
    }

    logger.info('[DOCKER_RUNNING] Docker daemon detected.');
    const { exists, running } = await this.auditRedisContainer();

    if (exists) {
      logger.info('[REDIS_CONTAINER_FOUND] Redis container exists.');
      if (!running) {
        const started = await this.startRedisContainer();
        if (!started) return false;
      } else {
        logger.info('[REDIS_RUNNING] Redis container is already running.');
      }
      return true;
    } else {
      logger.info('[REDIS_MISSING] Redis container not found. Auto-creating...');
      const created = await this.createRedisContainer();
      return created;
    }
  }
}

module.exports = DockerHealth;
