'use strict';

/**
 * Telemetry Middleware
 *
 * Hooks into every HTTP response and calls TelemetryService.trackRequest()
 * with a normalized route label, HTTP method, status code, and elapsed time.
 *
 * Design decisions:
 * - Uses the same res.end override pattern as logger.middleware.js to avoid
 *   adding an event-listener per request.
 * - Route normalization prefers req.route.path (Express-populated, with
 *   :param placeholders) over req.path to avoid high-cardinality keys like
 *   /api/tickets/uuid-1234 vs /api/tickets/:id.
 * - Health-check paths are excluded to avoid noise in latency histograms.
 * - All logic is wrapped in try/catch: telemetry MUST NOT crash requests.
 */

const telemetry = require('../services/telemetry/telemetry.service');

const EXCLUDED_PATHS = new Set(['/health', '/health/ping', '/favicon.ico']);

/**
 * Express middleware factory.
 * Usage in app.js:  app.use(telemetryMiddleware);
 */
const telemetryMiddleware = (req, res, next) => {
  // Skip paths that would add noise to latency metrics
  if (EXCLUDED_PATHS.has(req.path)) {
    return next();
  }

  const startAt = process.hrtime.bigint(); // nanosecond-precision

  const originalEnd = res.end;

  res.end = function telemetryEnd(chunk, encoding) {
    try {
      const endAt  = process.hrtime.bigint();
      const durationMs = Number(endAt - startAt) / 1_000_000;

      // Prefer Express-resolved route path for low-cardinality labels.
      // Fall back to req.baseUrl + req.path if the route hasn't resolved yet.
      const routeLabel =
        (req.route && req.route.path)
          ? `${req.baseUrl || ''}${req.route.path}`
          : req.path;

      telemetry.trackRequest(req.method, routeLabel, res.statusCode, durationMs);
    } catch (_) {
      // Telemetry error must never affect the response
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = telemetryMiddleware;
