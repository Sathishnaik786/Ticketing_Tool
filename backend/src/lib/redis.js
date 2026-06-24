const Redis = require('ioredis');

const enableRedis = process.env.ENABLE_REDIS === 'true';
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let redisPub = null;
let redisSub = null;
let isConnected = false;

if (enableRedis) {
  try {
    const opts = {
      maxRetriesPerRequest: null, // required by BullMQ
      retryStrategy(times) {
        if (times > 3) {
          console.warn(`Redis connection retry limit reached (${times}). Falling back to local in-memory execution.`);
          isConnected = false;
          return null; // Stop retrying
        }
        return Math.min(times * 500, 2000);
      }
    };

    redisClient = new Redis(redisUrl, opts);
    redisPub = new Redis(redisUrl, opts);
    redisSub = new Redis(redisUrl, opts);

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('Redis connected successfully.');
    });

    redisClient.on('error', (err) => {
      console.error('Redis error occurred:', err.message);
      isConnected = false;
    });
  } catch (err) {
    console.error('Failed to initialize Redis client:', err.message);
    enableRedis = false;
  }
} else {
  console.log('Redis is disabled. Operating in local fallback mode.');
}

const getClient = () => redisClient;
const getPub = () => redisPub;
const getSub = () => redisSub;
const isRedisConnected = () => isConnected && enableRedis;

// Helper caching interface
const get = async (key) => {
  if (isRedisConnected()) {
    try {
      return await redisClient.get(key);
    } catch (e) {
      console.error(`Redis GET error for key ${key}:`, e.message);
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
      console.error(`Redis SET error for key ${key}:`, e.message);
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
      console.error(`Redis DEL error for key ${key}:`, e.message);
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
      console.error(`Redis PUBLISH error on channel ${channel}:`, e.message);
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
      console.error(`Redis SUBSCRIBE error on channel ${channel}:`, e.message);
    }
  }
  return false;
};

module.exports = {
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
