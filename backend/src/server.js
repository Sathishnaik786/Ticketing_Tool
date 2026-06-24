require('dotenv').config();
require('module-alias/register');

// Setup ts-node compilation for typescript modules loading dynamically
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: "commonjs",
        allowJs: true,
        esModuleInterop: true,
        ignoreDeprecations: "6.0"
    }
});

const app = require('./app');
const config = require('@config');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redis, redisMode, attachEventHandlers } = require('@lib/redis');
const logger = require('@lib/logger');

const PORT = process.env.PORT || config.PORT || 3003;
console.log('Attempting to start server...');

const server = http.createServer(app);

// CORS origins configuration - should match Express CORS configuration
const corsOrigins = config.NODE_ENV === 'production'
    ? [config.FRONTEND_URL, 'https://yviems.netlify.app'].filter(Boolean)
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
            if (!origin)
                return callback(null, true);
            const isAllowed = corsOrigins.indexOf(origin) !== -1;
            callback(null, isAllowed);
        },
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
});

// Socket.IO Redis adapter wiring
const enableSocketRedisEnv = process.env.ENABLE_SOCKET_REDIS;
const enableSocketRedis = enableSocketRedisEnv !== undefined
    ? enableSocketRedisEnv === 'true'
    : config.ENABLE_SOCKET_REDIS;

let redisAdapterEnabled = false;
if (enableSocketRedis) {
    try {
        const pubClient = redis;
        const subClient = redis.duplicate();
        attachEventHandlers(subClient, 'socketio-sub');
        io.adapter(createAdapter(pubClient, subClient));
        redisAdapterEnabled = true;
        logger.info('Socket.IO Redis adapter enabled', {
            mode: redisMode,
        });
    }
    catch (err) {
        redisAdapterEnabled = false;
        logger.error('Failed to initialize Socket.IO Redis adapter, falling back to in-memory adapter', {
            mode: redisMode,
            message: err?.message,
        });
    }
}
else {
    logger.info('Socket.IO Redis adapter disabled via ENABLE_SOCKET_REDIS; using in-memory adapter', {
        mode: redisMode,
    });
}

// Initialize socket handlers
const SocketHandlers = require('./socketHandlers');
SocketHandlers.initialize(io);

// Boot background queue workers during bootstrap
console.log('Booting background workers...');
try {
  require('./modules/workflow-engine/workflow.worker');
  require('./modules/notification-engine/notification.worker');
  require('./modules/approval-engine/approval.worker');
  require('./services/audit/audit.worker');
  require('./modules/sla-engine/sla.worker');
  console.log('✅ All background workers booted successfully.');
} catch (err) {
  console.error('Error booting background workers:', err);
}

// Start listening on port
server.listen(PORT, () => {
    console.log(`Server is actually listening on port ${PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`WebSocket server initialized with ${redisAdapterEnabled ? 'Redis adapter' : 'in-memory adapter (no Redis)'}`);
    logger.info('Server started', {
        port: PORT,
        env: config.NODE_ENV,
        socketRedisAdapter: redisAdapterEnabled ? 'enabled' : 'disabled',
        redisMode,
    });

    // Auto Create Bucket Safely on Backend Startup
    try {
        const { PayslipStorageService } = require('./modules/payroll-bulk-processing/services/payslip-storage.service');
        PayslipStorageService.ensureBucketExists().catch(err => {
            console.error('[STORAGE_INIT_ERROR] Failed to run startup storage initialization:', err);
        });
    }
    catch (err) {
        console.error('[STORAGE_INIT_ERROR] Could not load PayslipStorageService for startup bucket verification:', err);
    }
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process using it or use a different port.`);
    }
    else {
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
