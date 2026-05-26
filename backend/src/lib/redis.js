const Redis = require('ioredis');
const config = require('@config');
const logger = require('@lib/logger');

/**
 * NOTE: This module is responsible ONLY for initializing Redis clients.
 * - It supports BOTH local Docker Redis and production (e.g. Upstash) via REDIS_URL.
 * - It does NOT change any higher-level caching or Socket.IO logic.
 *
 * ENV BEHAVIOR:
 * - If REDIS_URL is defined -> use it (production / Upstash-friendly)
 *   - If it starts with rediss:// we enable TLS
 * - Else -> fall back to REDIS_HOST / REDIS_PORT (local Docker / bare Redis)
 */

const baseRedisOptions = {
  // Backoff for reconnects – keeps retrying but caps delay to avoid tight loops
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null, // Keep retrying in background safely, avoiding MaxRetriesPerRequestError
  enableReadyCheck: true,
  lazyConnect: false,
};

let redis;
let redisConfig; // For local mode only, kept for backward compatibility exports
let redisMode = 'LOCAL'; // LOCAL vs URL vs URL_TLS

if (process.env.REDIS_URL) {
  // Production / Upstash mode via REDIS_URL
  const redisUrl = process.env.REDIS_URL;
  const isTls = redisUrl.startsWith('rediss://');

  const urlOptions = {
    ...baseRedisOptions,
    // When using rediss:// we enable TLS. Upstash and similar providers expect this.
    ...(isTls
      ? {
          tls: {
            // Upstash typically uses valid certs; we keep this strict by default.
            // If your environment requires relaxed TLS, wire it via env-specific config.
            rejectUnauthorized: true,
          },
        }
      : {}),
  };

  redis = new Redis(redisUrl, urlOptions);
  redisMode = isTls ? 'URL_TLS' : 'URL';

  logger.info('Redis client initialized from REDIS_URL', {
    mode: redisMode,
  });
} else {
  // Local Docker / bare Redis (default for development)
  redisConfig = {
    host: config.REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: config.REDIS_PORT || process.env.REDIS_PORT || 6379,
    password: config.REDIS_PASSWORD || process.env.REDIS_PASSWORD || undefined,
    ...baseRedisOptions,
  };

  redis = new Redis(redisConfig);
  redisMode = 'LOCAL';

  logger.info('Redis client initialized in LOCAL mode', {
    mode: redisMode,
    host: redisConfig.host,
    port: redisConfig.port,
  });
}

// --- Common event handlers for ALL Redis clients created here ---

const attachEventHandlers = (client, contextLabel) => {
  // Guard against missing client
  if (!client) return;

  const label = contextLabel || 'redis';

  client.on('connect', () => {
    logger.info(`Redis connected`, { context: label, mode: redisMode });
  });

  client.on('ready', () => {
    logger.info(`Redis ready`, { context: label, mode: redisMode });
  });

  client.on('error', (err) => {
    // Important: never throw here – app should degrade gracefully
    logger.error('Redis connection error', {
      context: label,
      mode: redisMode,
      message: err?.message,
    });
  });

  client.on('close', () => {
    logger.warn('Redis connection closed', { context: label, mode: redisMode });
  });

  client.on('reconnecting', (delay) => {
    logger.info('Redis reconnecting', {
      context: label,
      mode: redisMode,
      delay,
    });
  });
};

// Attach handlers to the primary client
attachEventHandlers(redis, 'primary');

// Graceful shutdown – only for the primary process-level client
const shutdownHandler = async (signal) => {
  try {
    logger.info('Shutting down Redis client', { signal, mode: redisMode });
    await redis.quit();
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
  redis,
  redisConfig,
  redisMode,
  baseRedisOptions,
  attachEventHandlers,
};

