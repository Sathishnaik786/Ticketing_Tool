'use strict';

/**
 * NoopTelemetryProvider
 *
 * Silent implementation of the TelemetryProvider interface.
 * Used when ENABLE_OBSERVABILITY=false (default in dev / staging that hasn't
 * opted into monitoring yet).
 *
 * All methods are intentionally empty — zero overhead, zero side-effects.
 */
class NoopTelemetryProvider {
  /**
   * @param {string} _method
   * @param {string} _route
   * @param {number} _statusCode
   * @param {number} _durationMs
   */
  trackRequest(_method, _route, _statusCode, _durationMs) {}

  /**
   * @param {Error|unknown} _error
   * @param {Record<string,unknown>} [_context]
   */
  trackError(_error, _context) {}

  /**
   * @param {string} _query
   * @param {number} _durationMs
   */
  trackDbQuery(_query, _durationMs) {}

  /**
   * @param {'hit'|'miss'|'set'|'delete'} _type
   * @param {boolean} _hit
   */
  trackCacheEvent(_type, _hit) {}

  /**
   * @returns {{ provider: string, enabled: boolean }}
   */
  getStatus() {
    return { provider: 'noop', enabled: false };
  }
}

module.exports = NoopTelemetryProvider;
