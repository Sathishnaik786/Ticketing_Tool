# Observability Architecture — Phase 8.3

## Overview

Provider-based observability abstraction behind `VITE_ENABLE_OBSERVABILITY` (default: **false**).

## Structure

```
frontend/src/services/observability/
├── observability.service.ts   # Core provider + facade
├── sentry.service.ts          # Sentry adapter (stub)
├── analytics.service.ts       # Product analytics events
├── performance.service.ts     # Web vital thresholds
└── index.ts
```

## Interface

```typescript
interface ObservabilityProvider {
  captureException(error, context?)
  captureMessage(message, context?)
  captureMetric(name, value, tags?)
  identifyUser(userId, traits?)
}
```

## Integration Points

| Source | Handler |
|--------|---------|
| RouteErrorBoundary | `captureException` on route errors |
| React Query mutations | `captureException` on mutation errors |
| AppBootstrap | `identifyUser` on auth |
| Web Vitals hook | `captureMetric` via performance.service |
| Feature flag telemetry | `captureMetric` per flag |

## Providers

- **Development:** ConsoleObservabilityProvider (when flag ON)
- **Production default:** NoopObservabilityProvider (zero overhead)
- **Future:** Swap to SentryObservabilityProvider via `observability.setProvider()`

## Rollback

Set `VITE_ENABLE_OBSERVABILITY=false` — no behavioral change.
