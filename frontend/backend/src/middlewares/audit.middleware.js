'use strict';

const { recordAudit } = require('../services/audit/audit.service');

/**
 * Determine high-level audit action and entity information based on request path and method.
 * Matches requirements in Phase 9.2 actions to capture.
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @returns {object|null} { action, entityType } or null if skipped
 */
function getAuditAction(req, res) {
  const method = req.method;
  const path = req.path;
  const statusCode = res.statusCode;

  // Only audit successful operations (status codes 2xx)
  if (statusCode < 200 || statusCode >= 300) return null;

  // 1. Ticketing actions
  if (path.match(/^\/api\/(v1\/)?tickets$/)) {
    if (method === 'POST') return { action: 'CREATE_TICKET', entityType: 'TICKET' };
  }
  if (path.match(/^\/api\/(v1\/)?tickets\/[^\/]+$/)) {
    if (method === 'PUT' || method === 'PATCH') return { action: 'UPDATE_TICKET', entityType: 'TICKET' };
  }
  if (path.match(/^\/api\/(v1\/)?tickets\/[^\/]+\/comments$/)) {
    if (method === 'POST') return { action: 'ADD_COMMENT', entityType: 'TICKET' };
  }
  if (path.match(/^\/api\/(v1\/)?tickets\/[^\/]+\/assign$/)) {
    if (method === 'POST' || method === 'PUT') return { action: 'ASSIGN_TICKET', entityType: 'TICKET' };
  }
  if (path.match(/^\/api\/(v1\/)?tickets\/[^\/]+\/reassign$/)) {
    if (method === 'POST' || method === 'PUT') return { action: 'REASSIGN_TICKET', entityType: 'TICKET' };
  }
  if (path.match(/^\/api\/(v1\/)?tickets\/[^\/]+\/status$/)) {
    if (method === 'PATCH' || method === 'PUT') {
      const status = req.body?.status;
      if (status === 'CLOSED') {
        return { action: 'CLOSE_TICKET', entityType: 'TICKET' };
      }
      return { action: 'CHANGE_STATUS', entityType: 'TICKET' };
    }
  }

  // 2. Admin actions
  if (path.match(/^\/api\/(v1\/)?users$/)) {
    if (method === 'POST') return { action: 'CREATE_USER', entityType: 'USER' };
  }
  if (path.match(/^\/api\/(v1\/)?users\/[^\/]+$/)) {
    if (method === 'PUT' || method === 'PATCH') return { action: 'UPDATE_USER', entityType: 'USER' };
    if (method === 'DELETE') return { action: 'DELETE_USER', entityType: 'USER' };
  }
  if (path.match(/^\/api\/(v1\/)?users\/[^\/]+\/role$/)) {
    if (method === 'PATCH' || method === 'PUT') return { action: 'ROLE_CHANGE', entityType: 'USER' };
  }

  // 3. Knowledge Base actions
  if (path.match(/^\/api\/(v1\/)?knowledge\/articles$/) || path.match(/^\/api\/(v1\/)?knowledge$/)) {
    if (method === 'POST') return { action: 'CREATE_ARTICLE', entityType: 'ARTICLE' };
  }
  if (path.match(/^\/api\/(v1\/)?knowledge\/articles\/[^\/]+$/) || path.match(/^\/api\/(v1\/)?knowledge\/[^\/]+$/)) {
    if (method === 'PUT' || method === 'PATCH') return { action: 'UPDATE_ARTICLE', entityType: 'ARTICLE' };
    if (method === 'DELETE') return { action: 'DELETE_ARTICLE', entityType: 'ARTICLE' };
  }

  // 4. Approvals actions
  if (path.match(/^\/api\/(v1\/)?approvals\/[^\/]+\/approve$/)) {
    return { action: 'APPROVE', entityType: 'APPROVAL' };
  }
  if (path.match(/^\/api\/(v1\/)?approvals\/[^\/]+\/reject$/)) {
    return { action: 'REJECT', entityType: 'APPROVAL' };
  }
  if (path.match(/^\/api\/(v1\/)?approvals\/[^\/]+$/) && (method === 'PATCH' || method === 'PUT')) {
    const status = req.body?.status;
    if (status === 'APPROVED') return { action: 'APPROVE', entityType: 'APPROVAL' };
    if (status === 'REJECTED') return { action: 'REJECT', entityType: 'APPROVAL' };
  }

  // 5. Payroll actions
  if (path.match(/^\/api\/(v1\/)?payroll\/generate$/)) {
    return { action: 'GENERATE_PAYROLL', entityType: 'PAYROLL' };
  }
  if (path.match(/^\/api\/(v1\/)?payroll\/[^\/]+\/approve$/)) {
    return { action: 'APPROVE_PAYROLL', entityType: 'PAYROLL' };
  }

  // 6. Authentication actions
  if (path.match(/^\/api\/(v1\/)?auth\/login$/)) {
    return { action: 'LOGIN', entityType: 'AUTH' };
  }
  if (path.match(/^\/api\/(v1\/)?auth\/logout$/)) {
    return { action: 'LOGOUT', entityType: 'AUTH' };
  }
  if (path.match(/^\/api\/(v1\/)?auth\/reset-password$/) || path.match(/^\/api\/(v1\/)?auth\/password-reset$/)) {
    return { action: 'PASSWORD_RESET', entityType: 'AUTH' };
  }

  // General fallback action naming for unmapped mutating writes
  return {
    action: `HTTP_${method}`,
    entityType: path.split('/')[2]?.toUpperCase() || 'UNKNOWN'
  };
}

/**
 * Extract entity UUID from path parameters or response body structure
 */
function getEntityId(req, res, responseBody) {
  const parts = req.path.split('/').filter(Boolean);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Try finding UUID in the request path
  for (const part of parts) {
    if (uuidRegex.test(part)) {
      return part;
    }
  }

  // Check response body for new insertions
  if (responseBody) {
    try {
      const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
      const id = parsed?.id || parsed?.data?.id || parsed?.ticket?.id || parsed?.ticketId || null;
      if (id && uuidRegex.test(id)) {
        return id;
      }
    } catch (e) {
      // Ignore JSON parsing issues
    }
  }

  return null;
}

/**
 * Express middleware to capture mutating requests (POST, PUT, PATCH, DELETE)
 */
const auditMiddleware = (req, res, next) => {
  // Skip GET, health endpoints, and static files
  if (req.method === 'GET') {
    return next();
  }

  const path = req.path;
  if (
    path === '/health' ||
    path.startsWith('/health/') ||
    path.includes('.') ||
    path.startsWith('/static/')
  ) {
    return next();
  }

  // Capture response body for creations/dynamic ID lookups
  const originalSend = res.send;
  let responseBody;
  res.send = function (body) {
    responseBody = body;
    return originalSend.apply(res, arguments);
  };

  res.on('finish', () => {
    try {
      const auditInfo = getAuditAction(req, res);
      if (!auditInfo) return;

      const actorId = req.user?.id || null;
      const ipAddress = req.ip || req.connection?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      const entityId = getEntityId(req, res, responseBody);

      // Perform non-blocking audit recording
      recordAudit({
        actorId,
        action: auditInfo.action,
        entityType: auditInfo.entityType,
        entityId,
        oldValue: req.oldValue || null, // Can be set on req inside controllers
        newValue: req.body || null,
        ipAddress,
        userAgent
      });
    } catch (err) {
      // Middleware should never throw to client
      console.warn('Audit middleware failed to record log', err.message);
    }
  });

  next();
};

module.exports = auditMiddleware;
