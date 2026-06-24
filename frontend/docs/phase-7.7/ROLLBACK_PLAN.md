# Phase 7.7 — Rollback Plan

## Level 1: Feature Flag (Instant — Recommended)

1. Set `ENABLE_EXECUTIVE_ANALYTICS=false` on Render (backend)
2. Set `VITE_ENABLE_EXECUTIVE_ANALYTICS=false` on Netlify (frontend)
3. Redeploy both services

**Effect:** No analytics routes, APIs, nav, or widgets. All ETMS modules unchanged. Analytics data preserved in `analytics_*` tables.

## Level 2: Code Rollback

Revert Phase 7.7 commits. Integration hooks are isolated to:

- `backend/src/app.js` — conditional `/api/analytics` mount
- `frontend/src/config/features.ts` — `isExecutiveAnalyticsEnabled`
- `frontend/src/App.tsx` — `executiveAnalyticsRoutes`
- `frontend/src/components/layout/AppLayout.tsx` — `executiveAnalyticsNavGroups`
- `render.yaml`, `.env.example` files — flag variables

No changes to ticketing workflows, approval engine, SLA engine, knowledge base, or existing dashboards.

## Level 3: Database Rollback

Run `backend/database/executive_analytics_phase7_7_rollback.sql`

Drops (in order):
- `analytics_dashboard_configs`
- `analytics_saved_filters`
- `analytics_reports`
- `analytics_snapshots`

**Warning:** Destroys saved reports, filters, snapshots, and dashboard configs. Does not affect source ETMS data.

## Verification Checklist

- [ ] `/api/analytics/*` returns 503 or route unmounted
- [ ] No Executive Analytics nav group in sidebar
- [ ] No `/app/executive-dashboard` or related pages accessible
- [ ] Phase 7.1–7.6 regression tests pass
- [ ] Production build passes
- [ ] Ticketing, approvals, SLA, knowledge base operate normally

## Recovery

Re-enable flags and redeploy. If Level 3 was executed, re-run `executive_analytics_phase7_7.sql` to recreate tables and seed configs.
