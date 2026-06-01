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

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Production-safe allowlist for CORS
    const allowedOrigins = config.NODE_ENV === 'production'
      ? ['https://yviems.netlify.app', config.FRONTEND_URL]
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
console.log('Initializing rate limiters with high dev limits...');
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Boosted for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More permissive rate limiter for profile endpoint
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth specific limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
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

// HTTP request logging (morgan - for compatibility)
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cache middleware (optional - can be applied per route)
const { cacheMiddleware } = require('./middlewares/cache.middleware');

// Routes (to be added)
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
// Compatibility route for direct auth access
app.use('/auth', authLimiter, require('./routes/auth.routes'));

// Apply different rate limiting for profile endpoint
app.use('/api/employees/profile', profileLimiter);
app.use('/employees/profile', profileLimiter);

// Apply general rate limiting for other employee routes
app.use('/api/employees', generalLimiter, cacheMiddleware(), require('./routes/employee.routes'));
app.use('/employees', generalLimiter, cacheMiddleware(), require('./routes/employee.routes'));

// Apply general rate limiting to other routes
app.use('/api/departments', generalLimiter, require('./routes/department.routes'));
app.use('/departments', generalLimiter, require('./routes/department.routes'));
app.use('/api/attendance', generalLimiter, require('./routes/attendance.routes'));
app.use('/attendance', generalLimiter, require('./routes/attendance.routes'));
app.use('/api/leaves', generalLimiter, require('./routes/leave.routes'));
app.use('/leaves', generalLimiter, require('./routes/leave.routes'));
app.use('/api/documents', generalLimiter, require('./routes/document.routes'));
app.use('/documents', generalLimiter, require('./routes/document.routes'));
app.use('/api/reports', generalLimiter, require('./routes/report.routes'));
app.use('/reports', generalLimiter, require('./routes/report.routes'));
app.use('/api/projects', generalLimiter, require('./routes/project.routes'));
app.use('/projects', generalLimiter, require('./routes/project.routes'));

app.use('/api/analytics', generalLimiter, require('@analytics/analytics.routes'));
app.use('/analytics', generalLimiter, require('@analytics/analytics.routes'));
app.use('/api/chat', generalLimiter, require('./routes/chat.routes'));
app.use('/chat', generalLimiter, require('./routes/chat.routes'));
app.use('/api/notifications', generalLimiter, require('./routes/notification.routes'));
app.use('/notifications', generalLimiter, require('./routes/notification.routes'));
app.use('/api/meetups', generalLimiter, require('./routes/meetup.routes'));
app.use('/meetups', generalLimiter, require('./routes/meetup.routes'));
app.use('/api/calendar-events', generalLimiter, require('./routes/calendar.routes'));
app.use('/calendar-events', generalLimiter, require('./routes/calendar.routes'));

// Phase-0: Employee Updates Module (Feature Flag: OFF by default in UI, but API is live)
app.use('/api/updates', generalLimiter, require('./modules/updates/updates.routes'));
app.use('/updates', generalLimiter, require('./modules/updates/updates.routes'));

// Payroll Module
console.log('📦 Mounting Payroll Module...');
const payrollRoutes = require('./modules/payroll/routes/payroll.routes');
console.log('📦 Payroll Module keys:', Object.keys(payrollRoutes));
console.log('📦 Payroll Module .default type:', typeof payrollRoutes.default);

app.use('/api/payroll', generalLimiter, (req, res, next) => {
  console.log(`📦 Payroll Request: ${req.method} ${req.url}`);
  next();
}, payrollRoutes.default || payrollRoutes);

app.use('/payroll', generalLimiter, payrollRoutes.default || payrollRoutes);

// Phase-1: Payroll Bulk Processing Module
try {
  console.log('📦 Mounting Payroll Bulk Module...');
  const bulkUploadRoutes = require('./modules/payroll-bulk-processing/routes/bulk-upload.routes');
  const employeePayslipRoutes = require('./modules/payroll-bulk-processing/routes/employee-payslip.routes');
  const payslipPublicationRoutes = require('./modules/payroll-bulk-processing/routes/payslip-publication.routes').default;

  // Mount bulk processing routes
  app.use('/api/payroll-bulk', generalLimiter, bulkUploadRoutes.default || bulkUploadRoutes);
  app.use('/payroll-bulk', generalLimiter, bulkUploadRoutes.default || bulkUploadRoutes);
  
  // Mount employee payslip viewing routes
  app.use('/api/payroll/payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
  app.use('/payroll/payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);

  // Mount payslip publication routes
  app.use('/api/payroll/publication', generalLimiter, payslipPublicationRoutes);
  app.use('/payroll/publication', generalLimiter, payslipPublicationRoutes);
  
  // Employee Self-Service Payslip Access
  app.use('/api/my-payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
  app.use('/my-payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
} catch (error) {
  console.error('❌ Failed to mount Payroll Bulk Module. Missing dependencies?', error.message);
}





// Health check routes
app.use('/health', require('./routes/health.routes'));

// Redis test endpoint (for development/testing)
app.get('/redis-test', async (req, res) => {
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

// Cache stats endpoint (for monitoring)
app.get('/cache-stats', async (req, res) => {
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

  // Use existing error middleware
  errorMiddleware(err, req, res, next);
});

module.exports = app;