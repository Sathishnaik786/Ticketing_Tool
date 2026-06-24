# Dashboard Integration Report

## Current State

| Dashboard | Data Source | Badge |
|-----------|-------------|-------|
| HR Dashboard (`/app/dashboard`) | Live API | — |
| Operator Dashboard | `etmsDashboardService` (mock) | Demo Data |
| SLA Dashboard | `etmsDashboardService` (mock) | Demo Data |
| Executive Analytics | Backend APIs (phase 7.7) | — |

## Service Abstraction

`modules/dashboard/services/etmsDashboardService.ts` provides:
- Loading states via React Query hooks
- Error + retry in consuming pages
- `isDemoData: true` flag surfaced as visible badge

## Backend Endpoints

Phase 7.7 executive analytics endpoints exist and are wired. ETMS command/SLA dashboards await dedicated backend endpoints — **demo mode acceptable** behind `ETMS_DASHBOARD` flag.

## Recommendation

Connect operator/SLA dashboards when `/api/v1/etms/dashboard/*` endpoints are available. Until then, Demo Data badge prevents silent mock usage.
