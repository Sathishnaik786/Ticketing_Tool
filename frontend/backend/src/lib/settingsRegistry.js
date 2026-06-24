const { supabaseAdmin } = require('./supabase');
const redis = require('./redis');

const inMemoryCache = {};
const CACHE_TTL_MS = 5000; // 5 seconds local fallback caching

// Static defaults for failover fallback
const STATIC_DEFAULTS = {
  'workflow.max_depth': '10',
  'sla.check_interval': '60',
  'dashboard.cache_ttl': '300',
  'audit.retention_days': '365',
  'notification.retry_count': '3',
  'security.ssrf_allowed_ips': '[]'
};

const getSetting = async (key) => {
  const now = Date.now();
  
  // 1. Check local Node in-memory cache
  if (inMemoryCache[key] && (now - inMemoryCache[key].timestamp < CACHE_TTL_MS)) {
    return inMemoryCache[key].value;
  }

  // 2. Check Redis cache
  const redisCacheKey = `cache:settings:${key}`;
  const cachedVal = await redis.get(redisCacheKey);
  if (cachedVal !== null) {
    inMemoryCache[key] = { value: cachedVal, timestamp: now };
    return cachedVal;
  }

  // 3. Query PostgreSQL Database (Supabase) via Admin Client (bypass RLS)
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`SettingsRegistry: Supabase lookup warning for key ${key}:`, error.message);
    } else if (data) {
      const val = data.value;
      // Set caches
      inMemoryCache[key] = { value: val, timestamp: now };
      await redis.set(redisCacheKey, val, 300); // 5 mins Redis TTL
      return val;
    }
  } catch (err) {
    console.error(`SettingsRegistry: error reading setting ${key}:`, err.message);
  }

  // 4. Return static fallback default
  const defaultVal = STATIC_DEFAULTS[key];
  if (defaultVal !== undefined) {
    return defaultVal;
  }

  return null;
};

const clearLocalCache = (key) => {
  delete inMemoryCache[key];
  console.log(`SettingsRegistry: local cache cleared for key: ${key}`);
};

// Clear caches dynamically (e.g. triggered by DB updates)
const invalidateCache = async (key) => {
  clearLocalCache(key);
  await redis.del(`cache:settings:${key}`);
  await redis.publish('invalidation:settings', key);
};

// Listen for Pub/Sub invalidation alerts if Redis is active
redis.subscribe('invalidation:settings', (msg) => {
  clearLocalCache(msg);
});

module.exports = {
  getSetting,
  invalidateCache
};
