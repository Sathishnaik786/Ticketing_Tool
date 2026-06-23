const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const config = require('@config');
const errorMiddleware = require('@middlewares/error.middleware');
const logger = require('./lib/logger');
const loggingMiddleware = require('./middlewares/logger.middleware');
const telemetryMiddleware = require('./middlewares/telemetry.middleware');
const telemetry = require('./services/telemetry/telemetry.service');
const authMiddleware = require('./middlewares/auth.middleware');
const requireRole = require('./middlewares/role.middleware');
const auditMiddleware = require('./middlewares/audit.middleware');
const v1Router = require('./routes/v1');


const app = express();

// Render (and other reverse proxies) set X-Forwarded-For — required for express-rate-limit v8
app.set('trust proxy', 1);

function getAllowedOrigins() {
  if (config.NODE_ENV !== 'production') {
    return [
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
      'http://127.0.0.1:5174',
    ];
  }

  const extra = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([
    config.FRONTEND_URL,
    'https://ticketra.netlify.app',
    'https://yviems.netlify.app',
    ...extra,
  ].filter(Boolean))];
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.indexOf(origin) !== -1;
    callback(null, isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Rate limiting
console.log('Initializing production-grade rate limiters...');
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const employeeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
// Removed global generalLimiter to avoid double-limiting on specific routes

// Compression middleware (gzip responses)
app.use(compression());

// Structured logging middleware (before routes)
app.use(loggingMiddleware);

// Telemetry middleware — tracks request latency & status codes per route
app.use(telemetryMiddleware);

// HTTP request logging (morgan - for compatibility)
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Audit middleware — captures all mutating database requests (POST/PUT/PATCH/DELETE)
app.use(auditMiddleware);


// Cache middleware (optional - can be applied per route)
const { cacheMiddleware } = require('./middlewares/cache.middleware');

// API Routes
// Mount versioned routes under /api/v1
app.use('/api/v1', v1Router);

// Forward legacy endpoints internally to v1 handlers
app.use('/api', v1Router);






// Debug and health route protection middleware
app.use((req, res, next) => {
  const path = req.path;
  const isDebugRoute = 
    path === '/redis-test' ||
    path === '/cache-stats' ||
    path === '/debug' ||
    path.startsWith('/debug/') ||
    path === '/health' ||
    path.startsWith('/health/');

  if (isDebugRoute) {
    const enableDebug = process.env.ENABLE_DEBUG_ROUTES === 'true' && process.env.NODE_ENV === 'development';
    if (!enableDebug) {
      return res.status(404).json({ success: false, message: 'API Route not found' });
    }
  }
  next();
});

// Health check routes
app.use('/health', publicLimiter, require('./routes/health.routes'));

// Redis test endpoint (SUPER_ADMIN only)
app.get('/redis-test', adminLimiter, authMiddleware, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { redis } = require('@lib/redis');
    await redis.set('health', 'ok', 'EX', 10);
    const value = await redis.get('health');
    res.status(200).json({
      redis: value,
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      redis: null,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cache stats endpoint (SUPER_ADMIN only)
app.get('/cache-stats', adminLimiter, authMiddleware, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const CacheService = require('./services/cache.service');
    const stats = await CacheService.getStats();
    res.status(200).json({
      success: true,
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Error handler with structured logging
app.use((err, req, res, next) => {
  // Log error with structured logger
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    role: req.user?.role,
    ip: req.ip
  });

  // Track error in telemetry service
  telemetry.trackError(err, {
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    role: req.user?.role,
  });

  // Use existing error middleware
  errorMiddleware(err, req, res, next);
});

module.exports = app;
