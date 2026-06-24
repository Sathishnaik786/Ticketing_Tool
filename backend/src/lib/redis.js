const Redis = require('ioredis');
const config = require('@config');
const logger = require('./logger');

const enableRedis = process.env.ENABLE_REDIS === 'true' || config.ENABLE_CACHE || false;
const redisUrl = process.env.REDIS_URL;

const baseRedisOptions = {
  retryStrategy: (times) => {
    if (times > 5) {
      console.warn(`Redis connection retry limit reached (${times}). Falling back to local in-memory execution.`);
      return null; // Stop retrying
    }
    return Math.min(times * 100, 2000);
  },
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: true,
  lazyConnect: false,
};

let redisClient = null;
let redisPub = null;
let redisSub = null;
let redisConfig = null;
let redisMode = 'DISABLED';
let isConnected = false;

const attachEventHandlers = (client, contextLabel) => {
  if (!client) return;
  const label = contextLabel || 'redis';
  client.on('connect', () => {
    logger.info(`Redis connected`, { context: label, mode: redisMode });
    if (label === 'primary') {
      isConnected = true;
    }
  });
  client.on('ready', () => {
    logger.info(`Redis ready`, { context: label, mode: redisMode });
    if (label === 'primary') {
      isConnected = true;
    }
  });
  client.on('error', (err) => {
    logger.error('Redis connection error', {
      context: label,
      mode: redisMode,
      message: err?.message,
    });
    if (label === 'primary') {
      isConnected = false;
    }
  });
  client.on('close', () => {
    logger.warn('Redis connection closed', { context: label, mode: redisMode });
    if (label === 'primary') {
      isConnected = false;
    }
  });
  client.on('reconnecting', (delay) => {
    logger.info('Redis reconnecting', {
      context: label,
      mode: redisMode,
      delay,
    });
  });
};

if (enableRedis) {
  try {
    if (redisUrl) {
      const isTls = redisUrl.startsWith('rediss://');
      const urlOptions = {
        ...baseRedisOptions,
        ...(isTls
          ? {
              tls: {
                rejectUnauthorized: false, // relaxed TLS for cloud providers
              },
            }
          : {}),
      };
      redisClient = new Redis(redisUrl, urlOptions);
      redisPub = new Redis(redisUrl, urlOptions);
      redisSub = new Redis(redisUrl, urlOptions);
      redisMode = isTls ? 'URL_TLS' : 'URL';
      logger.info('Redis initialized from REDIS_URL', { mode: redisMode });
    } else {
      redisConfig = {
        host: process.env.REDIS_HOST || config.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || config.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || config.REDIS_PASSWORD || undefined,
        ...baseRedisOptions,
      };
      redisClient = new Redis(redisConfig);
      redisPub = new Redis(redisConfig);
      redisSub = new Redis(redisConfig);
      redisMode = 'LOCAL';
      logger.info('Redis initialized in LOCAL mode', {
        mode: redisMode,
        host: redisConfig.host,
        port: redisConfig.port,
      });
    }

    attachEventHandlers(redisClient, 'primary');
    attachEventHandlers(redisPub, 'pub');
    attachEventHandlers(redisSub, 'sub');
  } catch (err) {
    logger.error('Failed to initialize Redis client:', { message: err.message });
    isConnected = false;
  }
} else {
  logger.info('Redis is disabled. Operating in local fallback mode.');
}

const getClient = () => redisClient;
const getPub = () => redisPub;
const getSub = () => redisSub;
const isRedisConnected = () => isConnected && (redisClient !== null);

// Helper caching interface for backward compatibility
const get = async (key) => {
  if (isRedisConnected()) {
    try {
      return await redisClient.get(key);
    } catch (e) {
      logger.error(`Redis GET error for key ${key}:`, { message: e.message });
    }
  }
  return null;
};

const set = async (key, value, ttlSeconds = null) => {
  if (isRedisConnected()) {
    try {
      if (ttlSeconds) {
        await redisClient.set(key, value, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (e) {
      logger.error(`Redis SET error for key ${key}:`, { message: e.message });
    }
  }
  return false;
};

const del = async (key) => {
  if (isRedisConnected()) {
    try {
      await redisClient.del(key);
      return true;
    } catch (e) {
      logger.error(`Redis DEL error for key ${key}:`, { message: e.message });
    }
  }
  return false;
};

const publish = async (channel, message) => {
  if (isRedisConnected() && redisPub) {
    try {
      await redisPub.publish(channel, message);
      return true;
    } catch (e) {
      logger.error(`Redis PUBLISH error on channel ${channel}:`, { message: e.message });
    }
  }
  return false;
};

const subscribe = async (channel, onMessage) => {
  if (isRedisConnected() && redisSub) {
    try {
      await redisSub.subscribe(channel);
      redisSub.on('message', (chan, msg) => {
        if (chan === channel) {
          onMessage(msg);
        }
      });
      return true;
    } catch (e) {
      logger.error(`Redis SUBSCRIBE error on channel ${channel}:`, { message: e.message });
    }
  }
  return false;
};

// Graceful shutdown
const shutdownHandler = async (signal) => {
  try {
    if (redisClient) {
      logger.info('Shutting down Redis client', { signal, mode: redisMode });
      await redisClient.quit();
    }
    if (redisPub) await redisPub.quit();
    if (redisSub) await redisSub.quit();
  } catch (err) {
    logger.error('Error during Redis shutdown', {
      signal,
      mode: redisMode,
      message: err?.message,
    });
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdownHandler('SIGINT'));
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

module.exports = {
  redis: redisClient,
  redisConfig,
  redisMode,
  baseRedisOptions,
  attachEventHandlers,
  getClient,
  getPub,
  getSub,
  isRedisConnected,
  get,
  set,
  del,
  publish,
  subscribe
};
