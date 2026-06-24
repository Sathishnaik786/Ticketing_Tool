const logger = require('../lib/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, IP, user agent, and response time
 */
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();

  // Skip logging for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    role: req.user?.role
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log response
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      role: req.user?.role
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else {
      logger.info('Request completed', logData);
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = loggingMiddleware;




