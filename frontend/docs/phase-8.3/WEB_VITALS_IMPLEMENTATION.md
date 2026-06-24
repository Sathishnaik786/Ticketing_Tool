# Web Vitals Implementation — Phase 8.3

## Metrics Captured

| Metric | Target | Handler |
|--------|--------|---------|
| LCP | < 2.5s | `recordWebVital('LCP', value)` |
| CLS | < 0.1 | `recordWebVital('CLS', value)` |
| INP | < 200ms | `recordWebVital('INP', value)` |
| FCP | < 1.8s | `recordWebVital('FCP', value)` |
| TTFB | < 800ms | `recordWebVital('TTFB', value)` |

## Implementation

- **Hook:** `frontend/src/hooks/useWebVitals.ts`
- **Library:** `web-vitals` (dynamic import)
- **Wiring:** Called from `AppBootstrap` on every session
- **Dev output:** Console with ✓/⚠ against thresholds
- **Prod:** Metrics via observability provider (when enabled)

## Provider Abstraction

`performance.service.ts` exposes `WEB_VITAL_THRESHOLDS` and `recordWebVital()` for future backend ingestion.

## Future API

```typescript
POST /api/telemetry/web-vitals
{ name: 'LCP', value: 2100, rating: 'good' }
```

Not implemented — console/observability only (no breaking API changes).
