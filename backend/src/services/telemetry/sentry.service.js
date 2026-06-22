'use strict';

/**
 * SentryTelemetryProvider
 *
 * Production-grade telemetry provider.
 *
 * CURRENT BEHAVIOR (no SENTRY_DSN configured):
 *   - Writes structured JSON lines to the Winston logger under the
 *     [TELEMETRY] namespace so every request, error, DB query, and cache
 *     event is captured in the existing log rotation pipeline.
 *   - In-memory p95 latency tracking via a 100-sample sliding window.
 *
 * FUTURE BEHAVIOR (when @sentry/node is installed and SENTRY_DSN is set):
 *   - Un-comment the Sentry SDK block below.
 *   - All trackError() calls will go to Sentry as captured exceptions.
 *   - All trackRequest() calls will be emitted as Sentry performance spans.
 *
 * This file is the ONLY place that needs to change when real Sentry is wired.
 */
const logger = require('@lib/logger');

// ─── In-memory sliding window for latency percentiles ────────────────────────
const WINDOW_SIZE = 100;
const _latencyBuckets = {};   // route → number[]

function _record(route, durationMs) {
  if (!_latencyBuckets[route]) _latencyBuckets[route] = [];
  const bucket = _latencyBuckets[route];
  bucket.push(durationMs);
  if (bucket.length > WINDOW_SIZE) bucket.shift();
}

function _percentile(route, p) {
  const bucket = (_latencyBuckets[route] || []).slice().sort((a, b) => a - b);
  if (!bucket.length) return null;
  const idx = Math.ceil((p / 100) * bucket.length) - 1;
  return bucket[Math.max(0, idx)];
}

// ─── Error counters ────────────────────────────────────────────────────────────
let _totalErrors = 0;
let _totalRequests = 0;

// ─── Provider ─────────────────────────────────────────────────────────────────

class SentryTelemetryProvider {
  /**
   * Track an HTTP request completion.
   * @param {string} method   HTTP verb
   * @param {string} route    Normalized route path (e.g. '/api/tickets')
   * @param {number} statusCode
   * @param {number} durationMs
   */
  trackRequest(method, route, statusCode, durationMs) {
    _totalRequests++;
    _record(route, durationMs);

    const p95 = _percentile(route, 95);

    logger.info('[TELEMETRY] request', {
      method,
      route,
      statusCode,
      durationMs,
      p95LatencyMs: p95,
      totalRequests: _totalRequests,
    });

    // ── Sentry Performance Span (un-comment once @sentry/node is installed) ──
    // const Sentry = require('@sentry/node');
    // Sentry.withScope((scope) => {
    //   scope.setTag('route', route);
    //   scope.setTag('method', method);
    //   scope.setExtra('durationMs', durationMs);
    //   scope.setExtra('statusCode', statusCode);
    // });
  }

  /**
   * Track an application error.
   * @param {Error|unknown} error
   * @param {Record<string,unknown>} [context]
   */
  trackError(error, context = {}) {
    _totalErrors++;

    const errMessage = error instanceof Error ? error.message : String(error);
    const errStack  = error instanceof Error ? error.stack  : undefined;

    logger.error('[TELEMETRY] error', {
      error: errMessage,
      stack: errStack,
      totalErrors: _totalErrors,
      ...context,
    });

    // ── Sentry Exception Capture (un-comment once @sentry/node is installed) ──
    // const Sentry = require('@sentry/node');
    // Sentry.withScope((scope) => {
    //   Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    //   Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    // });
  }

  /**
   * Track a database query execution time.
   * @param {string} query       Sanitized query label (no PII)
   * @param {number} durationMs
   */
  trackDbQuery(query, durationMs) {
    if (durationMs > 1000) {
      logger.warn('[TELEMETRY] slow_db_query', { query, durationMs });
    } else {
      logger.info('[TELEMETRY] db_query', { query, durationMs });
    }
  }

  /**
   * Track a cache hit or miss.
   * @param {'hit'|'miss'|'set'|'delete'} type
   * @param {boolean} hit
   */
  trackCacheEvent(type, hit) {
    logger.info('[TELEMETRY] cache_event', { type, hit });
  }

  /**
   * Return current telemetry health snapshot.
   * @returns {{ provider: string, enabled: boolean, totalRequests: number, totalErrors: number }}
   */
  getStatus() {
    return {
      provider: 'sentry',
      enabled: true,
      totalRequests: _totalRequests,
      totalErrors: _totalErrors,
    };
  }
}

module.exports = SentryTelemetryProvider;
