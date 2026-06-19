# Dashboard API Integration Report — Phase 8.3

## API Client

**File:** `frontend/src/modules/dashboard/services/etmsDashboardApi.ts`

## Endpoints (Frontend Contract)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/dashboard/kpis` | KPI metrics |
| `GET /api/dashboard/sla` | SLA + department performance |
| `GET /api/dashboard/activity` | Recent activity feed |

## Service Layer

**File:** `etmsDashboardService.ts`

- Parallel fetch of all three endpoints
- **Success:** Returns live data with `isDemoData: false`
- **Failure:** Falls back to demo dataset with `isDemoData: true`
- UI shows visible **Demo Data** badge when fallback active

## React Query Integration

Existing hooks in dashboard module use `fetchEtmsDashboardStats()` — no UI changes required.

## Backend Status

Endpoints are **frontend-ready**. Backend routes not yet implemented — graceful fallback ensures no regression.

## Testing

```bash
npm test -- --run src/modules/dashboard/services/etmsDashboardService.test.ts
```
