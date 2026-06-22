'use strict';

/**
 * TelemetryService — Backend Observability Facade
 *
 * Single source of truth for all backend telemetry.  Identical in philosophy
 * to the frontend ObservabilityProvider pattern already in place.
 *
 * Active provider is selected once at module load time based on env vars:
 *   ENABLE_OBSERVABILITY=true  → SentryTelemetryProvider (logs + future Sentry)
 *   ENABLE_OBSERVABILITY=false → NoopTelemetryProvider   (zero overhead)
 *
 * Provider can be swapped at runtime via setProvider() for testing.
 *
 * Usage:
 *   const telemetry = require('@/services/telemetry/telemetry.service');
 *   telemetry.trackRequest('GET', '/api/tickets', 200, 42);
 *   telemetry.trackError(new Error('oops'), { userId: '123' });
 */

const NoopTelemetryProvider   = require('./noop.service');
const SentryTelemetryProvider = require('./sentry.service');

// ─── Provider selection ───────────────────────────────────────────────────────

function _createProvider() {
  const enabled  = process.env.ENABLE_OBSERVABILITY === 'true';
  const providerName = (process.env.OBSERVABILITY_PROVIDER || 'sentry').toLowerCase();

  if (!enabled) {
    return new NoopTelemetryProvider();
  }

  // Extensible: add more providers here (datadog, opentelemetry, etc.)
  if (providerName === 'noop') {
    return new NoopTelemetryProvider();
  }

  return new SentryTelemetryProvider();
}

let _provider = _createProvider();

// ─── Facade ───────────────────────────────────────────────────────────────────

const TelemetryService = {
  /**
   * Track an HTTP request/response cycle.
   * Called by telemetry.middleware.js after each response.
   *
   * @param {string} method       HTTP verb (GET, POST…)
   * @param {string} route        Normalized path (req.route.path or req.path)
   * @param {number} statusCode   HTTP status code
   * @param {number} durationMs   Elapsed time from request start to response end
   */
  trackRequest(method, route, statusCode, durationMs) {
    try {
      _provider.trackRequest(method, route, statusCode, durationMs);
    } catch (_) {
      // Telemetry must NEVER crash the app
    }
  },

  /**
   * Track an application error (uncaught, middleware-caught, or manual).
   *
   * @param {Error|unknown} error
   * @param {Record<string,unknown>} [context]  Extra tags/metadata
   */
  trackError(error, context = {}) {
    try {
      _provider.trackError(error, context);
    } catch (_) {
      // Telemetry must NEVER crash the app
    }
  },

  /**
   * Track a database query execution time.
   * Useful to surface slow queries in logs before adding a real APM agent.
   *
   * @param {string} query       Sanitized query label — NO user PII
   * @param {number} durationMs
   */
  trackDbQuery(query, durationMs) {
    try {
      _provider.trackDbQuery(query, durationMs);
    } catch (_) {
      // Telemetry must NEVER crash the app
    }
  },

  /**
   * Track a cache hit / miss / set / delete event.
   *
   * @param {'hit'|'miss'|'set'|'delete'} type
   * @param {boolean} hit   true for cache hit, false for miss
   */
  trackCacheEvent(type, hit) {
    try {
      _provider.trackCacheEvent(type, hit);
    } catch (_) {
      // Telemetry must NEVER crash the app
    }
  },

  /**
   * Get current telemetry status for health endpoint.
   * @returns {{ provider: string, enabled: boolean, [key: string]: unknown }}
   */
  getStatus() {
    try {
      return _provider.getStatus();
    } catch (_) {
      return { provider: 'unknown', enabled: false };
    }
  },

  /**
   * Swap the active provider (used in tests or hot-reload scenarios).
   * @param {NoopTelemetryProvider|SentryTelemetryProvider} provider
   */
  setProvider(provider) {
    _provider = provider;
  },

  /**
   * Re-initialise provider from environment (useful after env mutation in tests).
   */
  resetProvider() {
    _provider = _createProvider();
  },
};

module.exports = TelemetryService;
