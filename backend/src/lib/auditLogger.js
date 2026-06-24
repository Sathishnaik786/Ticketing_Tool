const winston = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';

const formatLog = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: logLevel,
  format: formatLog,
  defaultMeta: { service: 'ticketra-etms-esm' },
  transports: [
    new winston.transports.Console()
  ]
});

const info = (message, meta = {}) => {
  logger.info(message, sanitizeMeta(meta));
};

const warn = (message, meta = {}) => {
  logger.warn(message, sanitizeMeta(meta));
};

const error = (message, meta = {}) => {
  logger.error(message, sanitizeMeta(meta));
};

// Security check: Sanitizes sensitive details (tokens, passwords) before writing to disk
const sanitizeMeta = (meta) => {
  if (!meta || typeof meta !== 'object') return meta;
  const clone = { ...meta };
  const sensitiveKeys = ['password', 'token', 'secret', 'credentials', 'authorization'];
  
  Object.keys(clone).forEach(key => {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = sanitizeMeta(clone[key]);
    }
  });
  return clone;
};

module.exports = {
  info,
  warn,
  error,
  logger
};
