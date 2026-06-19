# Phase 7.7 — Executive Analytics & Business Intelligence Platform

## Overview

Phase 7.7 adds an **additive, feature-flagged** Executive Analytics & BI layer for Aparna Enterprises ETMS. All analytics are **read-only** against existing ETMS data; writes occur only in new `analytics_*` tables.

## Pre-Conditions Verified

- Phase 7.1–7.6 regression passing (349 tests baseline)
- Full regression with Phase 7.7: **442 backend tests pass**
- Production build passing
- Rollback scripts available

## Feature Flags

| Layer | Variable | Enable value |
|-------|----------|--------------|
| Backend | `ENABLE_EXECUTIVE_ANALYTICS` | `true` |
| Frontend | `VITE_ENABLE_EXECUTIVE_ANALYTICS` | `true` |

When OFF: no routes, pages, nav, widgets, or API calls. ETMS unchanged.

## Deliverables

### Database
- `backend/database/executive_analytics_phase7_7.sql`
- `backend/database/executive_analytics_phase7_7_rollback.sql`

### Backend
- `backend/src/modules/executive-analytics/`

### Frontend
- `frontend/src/modules/executive-analytics/`

### Integration hooks (minimal additive)
- `backend/src/app.js` — `/api/analytics` mount
- `frontend/src/config/features.ts` — `isExecutiveAnalyticsEnabled`
- `frontend/src/App.tsx` — executive analytics routes
- `frontend/src/components/layout/AppLayout.tsx` — nav group

## Capabilities

1. **Executive Dashboard** — Enterprise KPIs (open/closed tickets, resolution %, SLA %, CSAT, approval turnaround, knowledge deflection, resolution time, escalations, workload)
2. **Department Analytics** — HR, IT, Finance, Procurement, Facilities, Administration scorecards
3. **Business Unit Analytics** — Aparna Realty, RMC, Tiles, Venster, Alteza, Rollform, Unispace, Externa, Corporate Services
4. **Specialized Analytics** — SLA, CSAT, Approvals, Knowledge, Trends
5. **Reports & Exports** — CSV, XLSX, PDF, JSON; saved reports in `analytics_reports`
6. **Dashboard Snapshots** — Optional capture to `analytics_snapshots`

## Data Sources (Read Only)

`tickets`, `ticket_feedback`, `ticket_assignment_history`, `ticket_sla`, `ticket_sla_escalation_events`, `ticket_communications`, `ticket_activity_timeline`, `ticket_approvals`, `knowledge_articles`, `knowledge_article_views`, `departments`, `business_units` (with fallback constants if table absent)

## Enable

```env
ENABLE_EXECUTIVE_ANALYTICS=true
VITE_ENABLE_EXECUTIVE_ANALYTICS=true
```

Apply SQL: `backend/database/executive_analytics_phase7_7.sql`

## Rollback

Set flags to `false`, redeploy, optionally run `executive_analytics_phase7_7_rollback.sql`.

See `ROLLBACK_PLAN.md`.
