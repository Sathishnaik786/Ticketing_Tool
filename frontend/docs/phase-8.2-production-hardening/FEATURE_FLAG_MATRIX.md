# Feature Flag Matrix

## ETMS Core Flags (4-bit = 16 combinations)

| ETMS_UI_V2 | ETMS_NAV | ETMS_DASH | ETMS_NOTIF | Expected Behavior |
|------------|----------|-----------|------------|-------------------|
| off | off | off | off | Legacy EMS (default) |
| on | off | off | off | ETMS shell, legacy nav |
| on | on | off | off | ETMS sidebar, legacy dashboard |
| on | on | on | off | ETMS sidebar + command dashboard |
| * | * | * | on + NC off | Legacy dual bell (fixed) |
| * | * | * | on + NC on | Unified notifications |

**Test file:** `frontend/src/config/featureFlagMatrix.test.ts` — 19 tests, all combinations render without crash.

## Module Flags

Each phase 7.x module gated independently (`VITE_ENABLE_*`). Nav and routes empty when flag !== `'true'` (strict).

## Consistency Rules

- `useUnifiedNotifications = ETMS_NOTIFICATIONS && NOTIFICATION_CENTER`
- ETMS nav items respect module flags via `filterNavItem()`
- Unknown flags default **false** in `isFeatureFlagEnabled()`
