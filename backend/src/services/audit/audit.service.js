'use strict';

const { supabaseAdmin } = require('../../lib/supabase');
const logger = require('../../lib/logger');

// Queue variables for performance caching
const queue = [];
let isProcessing = false;

/**
 * Mask sensitive fields in old and new JSON values
 * @param {object} obj - Object to mask
 * @returns {object} Masked object
 */
function maskSensitiveFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const copied = Array.isArray(obj) ? [...obj] : { ...obj };
  const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'secret'];

  for (const key in copied) {
    if (Object.prototype.hasOwnProperty.call(copied, key)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        copied[key] = '***MASKED***';
      } else if (typeof copied[key] === 'object') {
        copied[key] = maskSensitiveFields(copied[key]);
      }
    }
  }

  return copied;
}

/**
 * Process the local in-memory audit log queue in batches.
 * This runs asynchronously to prevent blocking the request lifecycle.
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  // Retrieve batch of items
  const batch = [];
  while (queue.length > 0) {
    batch.push(queue.shift());
  }

  try {
    const dbPayloads = batch.map(item => ({
      actor_id: item.actorId,
      action: item.action,
      entity_type: item.entityType,
      entity_id: item.entityId,
      old_value: item.oldValue,
      new_value: item.newValue,
      ip_address: item.ipAddress,
      user_agent: item.userAgent
    }));

    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert(dbPayloads);

    if (error) {
      logger.warn('Failed to insert audit logs batch to Supabase', {
        error: error.message,
        count: batch.length
      });
    }
  } catch (err) {
    logger.warn('Unhandled exception in audit service queue processing', {
      error: err.message,
      count: batch.length
    });
  } finally {
    isProcessing = false;
    // Process remaining items in queue if they accumulated
    if (queue.length > 0) {
      setImmediate(() => {
        processQueue();
      });
    }
  }
}

/**
 * Records an audit log entry.
 * This function guarantees safety: it will never throw errors to the caller.
 *
 * @param {object} params
 * @param {string} [params.actorId] - User UUID who initiated the action
 * @param {string} params.action - High-level action name (e.g. CREATE_TICKET)
 * @param {string} params.entityType - Target entity type (e.g. TICKET)
 * @param {string} [params.entityId] - UUID of the modified entity
 * @param {object} [params.oldValue] - Previous state of the entity
 * @param {object} [params.newValue] - New state of the entity
 * @param {string} [params.ipAddress] - Request source IP
 * @param {string} [params.userAgent] - Requester's Browser User-Agent
 */
function recordAudit(params = {}) {
  try {
    const {
      actorId = null,
      action,
      entityType,
      entityId = null,
      oldValue = null,
      newValue = null,
      ipAddress = null,
      userAgent = null
    } = params;

    if (!action || !entityType) {
      logger.warn('Skipped audit log record due to missing action or entityType', { action, entityType });
      return;
    }

    // Mask sensitive fields in old and new values
    const maskedOld = oldValue ? maskSensitiveFields(oldValue) : null;
    const maskedNew = newValue ? maskSensitiveFields(newValue) : null;

    // Push into the queue
    queue.push({
      actorId,
      action,
      entityType,
      entityId,
      oldValue: maskedOld,
      newValue: maskedNew,
      ipAddress,
      userAgent
    });

    // Schedule processing asynchronously without blocking
    setImmediate(() => {
      processQueue();
    });
  } catch (err) {
    logger.warn('Error in recordAudit method invocation', { error: err.message });
  }
}

module.exports = {
  recordAudit,
  getQueueDepth: () => queue.length,
  isEnabled: () => true
};
