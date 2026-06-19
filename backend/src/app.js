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
const authMiddleware = require('./middlewares/auth.middleware');
const requireRole = require('./middlewares/role.middleware');

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

// Apply different rate limiting for profile endpoint
app.use('/api/employees/profile', employeeLimiter);

// Apply general rate limiting for other employee routes
app.use('/api/employees', employeeLimiter, cacheMiddleware(), require('./routes/employee.routes'));

// Apply general rate limiting to other routes
app.use('/api/departments', generalLimiter, require('./routes/department.routes'));
app.use('/api/attendance', generalLimiter, require('./routes/attendance.routes'));
app.use('/api/leaves', generalLimiter, require('./routes/leave.routes'));
app.use('/api/documents', generalLimiter, require('./routes/document.routes'));
app.use('/api/reports', generalLimiter, require('./routes/report.routes'));
app.use('/api/projects', generalLimiter, require('./routes/project.routes'));

app.use('/api/analytics', generalLimiter, require('@analytics/analytics.routes'));
app.use('/api/chat', generalLimiter, require('./routes/chat.routes'));
app.use('/api/notifications', generalLimiter, require('./routes/notification.routes'));
app.use('/api/meetups', generalLimiter, require('./routes/meetup.routes'));
app.use('/api/calendar-events', generalLimiter, require('./routes/calendar.routes'));

// Phase-0: Employee Updates Module (Feature Flag: OFF by default in UI, but API is live)
app.use('/api/updates', generalLimiter, require('./modules/updates/updates.routes'));

// Payroll Module
console.log('📦 Mounting Payroll Module...');
const payrollRoutes = require('./modules/payroll/routes/payroll.routes');
console.log('📦 Payroll Module keys:', Object.keys(payrollRoutes));
console.log('📦 Payroll Module .default type:', typeof payrollRoutes.default);

app.use('/api/payroll', adminLimiter, (req, res, next) => {
  console.log(`📦 Payroll Request: ${req.method} ${req.url}`);
  next();
}, payrollRoutes.default || payrollRoutes);

// Phase-1: Payroll Bulk Processing Module
try {
  console.log('📦 Mounting Payroll Bulk Module...');
  const bulkUploadRoutes = require('./modules/payroll-bulk-processing/routes/bulk-upload.routes');
  const employeePayslipRoutes = require('./modules/payroll-bulk-processing/routes/employee-payslip.routes');
  const payslipPublicationRoutes = require('./modules/payroll-bulk-processing/routes/payslip-publication.routes').default;

  // Mount bulk processing routes
  app.use('/api/payroll-bulk', adminLimiter, bulkUploadRoutes.default || bulkUploadRoutes);
  
  // Mount employee payslip viewing routes
  app.use('/api/payroll/payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);

  // Mount payslip publication routes
  app.use('/api/payroll/publication', adminLimiter, payslipPublicationRoutes);
  
  // Employee Self-Service Payslip Access
  app.use('/api/my-payslips', generalLimiter, employeePayslipRoutes.default || employeePayslipRoutes);
} catch (error) {
  console.error('❌ Failed to mount Payroll Bulk Module. Missing dependencies?', error.message);
}

// ETMS Ticketing Module (Feature Flag: ENABLE_TICKETING)
if (process.env.ENABLE_TICKETING === 'true') {
  console.log('📦 Mounting ETMS Ticketing Module...');
  app.use('/api/ticket-categories', generalLimiter, require('./modules/ticketing/ticket-categories.routes'));
  app.use('/api/tickets', generalLimiter, require('./modules/ticketing/ticketing.routes'));
}

// Phase 7.1: CSAT Ticket Feedback Module (Feature Flag: ENABLE_TICKET_FEEDBACK)
if (process.env.ENABLE_TICKET_FEEDBACK === 'true') {
  console.log('📦 Mounting CSAT Ticket Feedback Module...');
  app.use('/api/ticket-feedback', generalLimiter, require('./modules/ticket-feedback/routes/ticket-feedback.routes'));
}

// Phase 7.2: Ticket Assignment & Work Queue (Feature Flag: ENABLE_TICKET_ASSIGNMENTS)
if (process.env.ENABLE_TICKET_ASSIGNMENTS === 'true') {
  console.log('📦 Mounting Ticket Assignment & Work Queue Module...');
  app.use('/api/ticket-assignments', generalLimiter, require('./modules/ticket-assignment/ticket-assignment.routes'));
}

// Phase 7.4: Communication & Activity Tracking (Feature Flag: ENABLE_COMMUNICATION_TRACKING)
if (process.env.ENABLE_COMMUNICATION_TRACKING === 'true') {
  console.log('📦 Mounting Communication & Activity Tracking Module...');
  app.use('/api/communications', generalLimiter, require('./modules/communication-tracking/routes/communication-tracking.routes'));
}

// Phase 7.5: Approval Workflow & Service Catalog (Feature Flag: ENABLE_APPROVAL_ENGINE)
if (process.env.ENABLE_APPROVAL_ENGINE === 'true') {
  console.log('📦 Mounting Approval Workflow & Service Catalog Module...');
  app.use('/api/approvals', generalLimiter, require('./modules/approval-management/routes/approval-management.routes'));
}

// Phase 7.6: Knowledge Base & Self-Service Portal (Feature Flag: ENABLE_KNOWLEDGE_BASE)
if (process.env.ENABLE_KNOWLEDGE_BASE === 'true') {
  console.log('📦 Mounting Knowledge Base & Self-Service Portal Module...');
  app.use('/api/knowledge', generalLimiter, require('./modules/knowledge-management/routes/knowledge-management.routes'));
}

// Phase 7.7: Executive Analytics & BI (Feature Flag: ENABLE_EXECUTIVE_ANALYTICS)
if (process.env.ENABLE_EXECUTIVE_ANALYTICS === 'true') {
  console.log('📦 Mounting Executive Analytics & BI Module...');
  app.use('/api/analytics', generalLimiter, require('./modules/executive-analytics/routes/executive-analytics.routes'));
}

// Phase 7.8: Enterprise Notification & Alert Center (Feature Flag: ENABLE_NOTIFICATION_CENTER)
if (process.env.ENABLE_NOTIFICATION_CENTER === 'true') {
  console.log('📦 Mounting Enterprise Notification & Alert Center Module...');
  app.use('/api/notification-center', generalLimiter, require('./modules/notification-center/routes/notification-center.routes'));
}





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

  // Use existing error middleware
  errorMiddleware(err, req, res, next);
});

module.exports = app;
