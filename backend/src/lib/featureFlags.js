const { supabaseAdmin } = require('./supabase');
const redis = require('./redis');

const inMemoryFeatures = {};
const CACHE_TTL_MS = 5000; // 5 seconds local TTL

const evaluateFeatureFlag = async (key, context = {}) => {
  const { tenantId = null, departmentId = null, env = process.env.NODE_ENV || 'development' } = context;
  const now = Date.now();
  let feature = null;

  // 1. Check local Node in-memory cache
  if (inMemoryFeatures[key] && (now - inMemoryFeatures[key].timestamp < CACHE_TTL_MS)) {
    feature = inMemoryFeatures[key].feature;
  } else {
    // 2. Check Redis cache
    const redisCacheKey = `cache:features:${key}`;
    try {
      const cachedVal = await redis.get(redisCacheKey);
      if (cachedVal !== null) {
        feature = JSON.parse(cachedVal);
        inMemoryFeatures[key] = { feature, timestamp: now };
      }
    } catch (e) {
      console.error('FeatureFlags: Redis read error:', e.message);
    }
  }

  // 3. Query PostgreSQL via Admin Client if not cached
  if (!feature) {
    try {
      const { data, error } = await supabaseAdmin
        .from('feature_registry')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.warn(`FeatureFlags: Supabase query warning for ${key}:`, error.message);
      } else if (data) {
        feature = data;
        // Cache features
        inMemoryFeatures[key] = { feature, timestamp: now };
        await redis.set(`cache:features:${key}`, JSON.stringify(feature), 300); // 5 mins Redis TTL
      }
    } catch (err) {
      console.error(`FeatureFlags: error reading feature ${key}:`, err.message);
    }
  }

  // If feature does not exist in registry, deny access
  if (!feature) {
    return false;
  }

  // 4. Evaluate rules hierarchy
  
  // Rule A: Check environment restriction
  const envAllowed = feature.target_environments && feature.target_environments.includes(env);
  if (!envAllowed) {
    return false;
  }

  // Rule B: Check if globally enabled
  if (feature.is_globally_enabled) {
    return true;
  }

  // Rule C: Tenant Whitelist check
  if (tenantId && feature.enabled_tenant_ids && feature.enabled_tenant_ids.includes(tenantId)) {
    return true;
  }

  // Rule D: Department Whitelist check
  if (departmentId && feature.enabled_department_ids && feature.enabled_department_ids.includes(departmentId)) {
    return true;
  }

  // Rule E: Percentage rollout check using tenantId hashing
  if (tenantId && feature.rollout_percentage && feature.rollout_percentage > 0) {
    // Simple deterministic string hashing algorithm
    let hash = 0;
    const str = `${tenantId}-${key}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const val = Math.abs(hash) % 100;
    if (val < feature.rollout_percentage) {
      return true;
    }
  }

  return false;
};

// Invalidate caches dynamically
const invalidateFeature = async (key) => {
  delete inMemoryFeatures[key];
  await redis.del(`cache:features:${key}`);
  console.log(`FeatureFlags: cache cleared for feature flag: ${key}`);
};

// Listen for Pub/Sub invalidation alerts if Redis is active
redis.subscribe('invalidation:features', (msg) => {
  invalidateFeature(msg);
});

module.exports = {
  evaluateFeatureFlag,
  invalidateFeature
};
