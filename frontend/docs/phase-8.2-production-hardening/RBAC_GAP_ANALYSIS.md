# RBAC Gap Analysis

## Pre-Fix State

Most sensitive routes relied on **sidebar hiding only**. Direct URL access was possible for:

- Executive analytics pages
- Payroll governance and finance routes
- KB analytics / article editor
- Notification analytics
- Operator / SLA dashboards

## Post-Fix Mitigations

| Area | Guard | Roles |
|------|-------|-------|
| Admin users | RouteGuard | ADMIN |
| Executive analytics | RouteGuard | HR, ADMIN (+ Manager where applicable) |
| Payroll module | RouteGuard per route | ADMIN, HR, MANAGER, EMPLOYEE (path-specific) |
| KB analytics / editor | RouteGuard | Manager+, HR |
| Notification analytics | RouteGuard | Manager+, HR, ADMIN |
| Operator / SLA dashboards | RouteGuard | As nav registry |

## Remaining Gaps

| Route | Risk | Mitigation |
|-------|------|------------|
| EMS pages (employees, leaves, etc.) | Low — ProtectedRoute allows all app roles | Acceptable for EMS |
| Approval dashboard | Medium — no route guard | Nav + API RBAC |
| Communications | Medium | Backend middleware |
| Ticket scopes | Low — fixed via scope utils + redirect | Tested |

## SUPER_ADMIN / FINANCE

Nav references `SUPER_ADMIN` and `FINANCE`; normalized to `ADMIN` in nav filtering and RouteGuard.
