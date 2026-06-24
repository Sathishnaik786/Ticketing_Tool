# Feature Flag Usage Report — Phase 8.3

## Telemetry Service

**File:** `frontend/src/services/featureFlagTelemetry.service.ts`

## Tracked Flags

| Flag Key | Env Variable |
|----------|--------------|
| ETMS_UI_V2 | VITE_ENABLE_ETMS_UI_V2 |
| ETMS_NAVIGATION | VITE_ENABLE_ETMS_NAVIGATION |
| ETMS_DASHBOARD | VITE_ENABLE_ETMS_DASHBOARD |
| ETMS_NOTIFICATIONS | VITE_ENABLE_ETMS_NOTIFICATIONS |

## Metrics

- Session count
- Per-flag enabled/disabled state
- Usage count per flag
- Last seen timestamp
- Rollout % helper: `getFeatureFlagRolloutPercent()`

## Storage

LocalStorage key: `ticketra_flag_telemetry` (client-side only, no PII).

## Observability Integration

Each flag emits `feature_flag.{key}` metric when observability enabled.

## Invocation

Automatic on app bootstrap via `trackFeatureFlags()` in `AppBootstrap`.
