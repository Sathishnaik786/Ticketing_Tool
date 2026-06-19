# Phase 7.7 — UAT Checklist

## Environment Setup

- [ ] Apply `executive_analytics_phase7_7.sql` to Supabase
- [ ] Set `ENABLE_EXECUTIVE_ANALYTICS=true` (Render)
- [ ] Set `VITE_ENABLE_EXECUTIVE_ANALYTICS=true` (Netlify)
- [ ] Redeploy backend and frontend

## Feature Flag OFF

- [ ] `/api/analytics/executive-dashboard` returns 503
- [ ] No Executive Analytics nav items visible
- [ ] Direct URL `/app/executive-dashboard` not routed

## RBAC

- [ ] EMPLOYEE: no analytics nav; API returns 403
- [ ] MANAGER: Department Analytics, Reports, SLA/CSAT/Trends visible; no Executive or BU dashboards
- [ ] HR / ADMIN / SUPER_ADMIN: full enterprise + BU access
- [ ] FINANCE: denied executive dashboard

## Executive Dashboard

- [ ] KPI cards display: Open, Closed, Resolution %, SLA %, CSAT, Approval Turnaround, Knowledge Deflection, Avg Resolution, Escalations
- [ ] Workload distribution section renders
- [ ] Trend charts show monthly data or empty state
- [ ] Export toolbar triggers report creation (CSV/XLSX/PDF/JSON)

## Department Analytics

- [ ] Scorecards for HR, IT, Finance, Procurement, Facilities, Administration
- [ ] Metrics: ticket volume, SLA %, CSAT, escalations, resolution time
- [ ] Manager sees own department scope when applicable

## Business Unit Analytics

- [ ] All nine Aparna units listed (Realty, RMC, Tiles, Venster, Alteza, Rollform, Unispace, Externa, Corporate Services)
- [ ] SLA %, CSAT, approvals, resolution trends per unit

## Reports

- [ ] GET `/api/analytics/reports` lists saved reports
- [ ] POST `/api/analytics/reports` creates report with selected format
- [ ] Analytics Reports page shows history

## Regression (No Impact)

- [ ] Ticket create/update/close unchanged
- [ ] Approval workflow tab unchanged
- [ ] Knowledge base unchanged
- [ ] SLA tracking unchanged
- [ ] Existing dashboards unchanged

## Rollback Drill

- [ ] Disable flags → analytics hidden within one deploy cycle
- [ ] Optional: run rollback SQL → tables dropped cleanly
- [ ] Re-enable flags → module restores
