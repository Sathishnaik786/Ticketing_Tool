# Phase 7.7 — RBAC Matrix

Uses existing ETMS roles only (no RBAC schema changes).

| Capability | EMPLOYEE | MANAGER | HR | ADMIN | SUPER_ADMIN | FINANCE |
|------------|----------|---------|-----|-------|-------------|---------|
| Executive Dashboard | — | — | ✓ | ✓ | ✓ | — |
| Department Analytics | — | ✓ (own dept) | ✓ | ✓ | ✓ | — |
| Business Unit Analytics | — | — | ✓ | ✓ | ✓ | — |
| SLA Analytics | — | ✓ | ✓ | ✓ | ✓ | — |
| CSAT Analytics | — | ✓ | ✓ | ✓ | ✓ | — |
| Approval Analytics | — | — | ✓ | ✓ | ✓ | — |
| Knowledge Analytics | — | — | ✓ | ✓ | ✓ | — |
| Trend Analytics | — | ✓ | ✓ | ✓ | ✓ | — |
| List / Create Reports | — | ✓ | ✓ | ✓ | ✓ | — |
| Enterprise report types | — | — | ✓ | ✓ | ✓ | — |

## Frontend Nav Gating

Nav items include `roles` arrays matching backend enforcement:

- **Executive Dashboard** — HR, ADMIN, SUPER_ADMIN
- **Department Analytics** — MANAGER, HR, ADMIN, SUPER_ADMIN
- **Business Unit Analytics** — HR, ADMIN, SUPER_ADMIN
- **Analytics Reports** — MANAGER, HR, ADMIN, SUPER_ADMIN

## Notes

- EMPLOYEE receives **403** on all `/api/analytics/*` endpoints
- FINANCE is denied enterprise dashboards (same as Phase 7.x pattern)
- Manager department scope uses `user.departmentId` when filtering department dashboard
- Feature flag OFF hides all nav/routes regardless of role
