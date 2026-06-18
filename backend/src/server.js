// [BOOT] Registering global exception handlers at the absolute top
process.on('uncaughtException', (err) => {
  console.error('[BOOT_CRITICAL] Uncaught Exception at startup:', err.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[BOOT_CRITICAL] Unhandled Rejection at startup:', promise, 'reason:', reason?.stack || reason);
  process.exit(1);
});

console.log('[BOOT] Exception handlers registered.');

require('dotenv').config();
require('module-alias/register');

async function bootstrap() {
  console.log('[BOOT] Environment variables audit:');
  const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
  requiredEnvs.forEach((env) => {
    console.log(`[BOOT] ${env} detected: ${process.env[env] ? 'YES ✅' : 'NO ❌'}`);
  });

  console.log('[BOOT] Initializing ts-node compiler register...');
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: "commonjs",
      allowJs: true,
      esModuleInterop: true,
      ignoreDeprecations: "6.0"
    }
  });

  const logger = require('@lib/logger');
  const DockerHealth = require('@/utils/docker-health');
  const RedisHealthService = require('@/services/redis-health.service');

  let redisReady = false;
  if (process.env.ENABLE_REDIS !== 'false') {
    redisReady = await DockerHealth.bootstrapRedis();
  } else {
    logger.info('[REDIS_DISABLED] Redis explicitly disabled in .env');
  }

  const { redis, redisMode, attachEventHandlers } = require('@lib/redis');

  if (redisReady && process.env.ENABLE_REDIS !== 'false') {
    try {
      await redis.connect();
      const healthService = new RedisHealthService(redis);
      healthService.start();
    } catch (err) {
      logger.error('[REDIS_OFFLINE] Initial connect failed, falling back to memory mode', { message: err.message });
      redisReady = false;
    }
  } else {
    logger.info('[REDIS_OFFLINE] Running in memory mode');
    process.env.ENABLE_SOCKET_REDIS = 'false';
    process.env.ENABLE_CACHE = 'false';
  }

  console.log('[BOOT] Loading Express app module...');
  const app = require('./app');
  console.log('[BOOT] Express app module loaded successfully.');

const config = require('@config');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');


const PORT = process.env.PORT || config.PORT || 3003;

console.log('Attempting to start server...');

const server = http.createServer(app);

// CORS origins configuration - should match Express CORS configuration
const productionCorsOrigins = [...new Set([
  config.FRONTEND_URL,
  'https://ticketra.netlify.app',
  'https://yviems.netlify.app',
  ...(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean))];

const corsOrigins = config.NODE_ENV === 'production'
  ? productionCorsOrigins
  : [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'http://localhost:8082',
      'http://127.0.0.1:8082',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:5174',
      'http://127.0.0.1:5174'
    ];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = corsOrigins.indexOf(origin) !== -1;
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
});

/**
 * Socket.IO Redis adapter wiring
 *
 * RULES:
 * - Adapter is enabled ONLY when ENABLE_SOCKET_REDIS === 'true'
 * - Uses the shared primary Redis client plus a dedicated duplicate for subscriptions
 * - ALL Redis clients used here get proper error / lifecycle handlers
 * - If Redis adapter init fails, we gracefully fall back to in-memory adapter
 */

// Prefer explicit env flag, fall back to existing config behavior to avoid breaking changes
const enableSocketRedisEnv = process.env.ENABLE_SOCKET_REDIS;
const enableSocketRedis =
  enableSocketRedisEnv !== undefined
    ? enableSocketRedisEnv === 'true'
    : config.ENABLE_SOCKET_REDIS;

let redisAdapterEnabled = false;

if (enableSocketRedis) {
  try {
    // Primary client is imported from @lib/redis and already has handlers
    const pubClient = redis;
    const subClient = redis.duplicate();

    // Attach robust handlers for the subscription client
    attachEventHandlers(subClient, 'socketio-sub');

    io.adapter(createAdapter(pubClient, subClient));
    redisAdapterEnabled = true;

    logger.info('Socket.IO Redis adapter enabled', {
      mode: redisMode,
    });
  } catch (err) {
    redisAdapterEnabled = false;
    logger.error('Failed to initialize Socket.IO Redis adapter, falling back to in-memory adapter', {
      mode: redisMode,
      message: err?.message,
    });
  }
} else {
  logger.info('Socket.IO Redis adapter disabled via ENABLE_SOCKET_REDIS; using in-memory adapter', {
    mode: redisMode,
  });
}

// Initialize socket handlers
const SocketHandlers = require('./socketHandlers');
SocketHandlers.initialize(io);

// Render requires binding explicitly to 0.0.0.0 in production. Local development defaults to dual-stack.
const BIND_HOST = config.NODE_ENV === 'production' ? '0.0.0.0' : undefined;

server.listen(PORT, BIND_HOST, () => {
  console.log(`Server is actually listening on port ${PORT} (${BIND_HOST || 'dual-stack loopback'})`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(
    `WebSocket server initialized with ${redisAdapterEnabled ? 'Redis adapter' : 'in-memory adapter (no Redis)'}`
  );
  logger.info('Server started', {
    port: PORT,
    env: config.NODE_ENV,
    socketRedisAdapter: redisAdapterEnabled ? 'enabled' : 'disabled',
    redisMode,
  });

  // Phase 3: Auto Create Bucket Safely on Backend Startup
  try {
    const { PayslipStorageService } = require('./modules/payroll-bulk-processing/services/payslip-storage.service');
    PayslipStorageService.ensureBucketExists().catch(err => {
      console.error('[STORAGE_INIT_ERROR] Failed to run startup storage initialization:', err);
    });
  } catch (err) {
    console.error('[STORAGE_INIT_ERROR] Could not load PayslipStorageService for startup bucket verification:', err);
  }
});


server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process using it or use a different port.`);
    } else {
        console.error('Server error:', error);
    }
});

// Prevent immediate exit
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

}

bootstrap().catch(err => {
  console.error('[BOOT_CRITICAL] Server bootstrap failed:', err);
  process.exit(1);
});
