module.exports = {
    PORT: process.env.PORT || 3003,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL,
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300,
    ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
    ENABLE_SOCKET_REDIS: process.env.ENABLE_SOCKET_REDIS !== 'false'
};