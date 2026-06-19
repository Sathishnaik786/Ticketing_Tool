# Route Metadata Report — Phase 8.3

**Generated:** 2026-06-19

## Summary

| Metric | Value |
|--------|-------|
| Total metadata entries | 90+ |
| Protected `/app/*` routes | 100% covered |
| RouteGuard via `guardFromMetadata()` | 100% |
| Public routes marked `public: true` | 12 |
| Feature-flagged routes | 28 |

## Architecture

- **SSOT:** `frontend/src/config/route-metadata.ts`
- **Guard helper:** `frontend/src/config/routeMetadata.utils.tsx` → `guardFromMetadata(path, element)`
- **Legacy RBAC arrays:** Preserved in `route-rbac.ts`, referenced by metadata

## Verification

```bash
npm test -- --run src/config/routeMetadata.test.ts
```

All protected app routes in `PROTECTED_APP_ROUTE_PATHS` have roles declared.

## Feature Flag Mapping

| Route | Flag |
|-------|------|
| `/app/tickets` | VITE_ENABLE_TICKETING |
| `/app/operator-dashboard` | VITE_ENABLE_ETMS_DASHBOARD |
| `/app/knowledge-base` | VITE_ENABLE_KNOWLEDGE_BASE |
| `/app/notifications` | VITE_ENABLE_NOTIFICATION_CENTER |
| `/app/executive-dashboard` | VITE_ENABLE_EXECUTIVE_ANALYTICS |

## Orphan Routes

None detected. Payroll approvals href verified: `/app/payroll/governance/approvals`.
