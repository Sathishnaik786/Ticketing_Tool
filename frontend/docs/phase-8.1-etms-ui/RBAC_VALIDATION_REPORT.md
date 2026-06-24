# RBAC Validation Report — ETMS UI Transformation

**Date:** 2026-06-19  
**Scope:** Navigation registry + existing route/page guards  
**Principle:** Preserve all existing RBAC — no weakening

---

## Auth Model (Unchanged)

| Layer | Implementation | Status |
|-------|----------------|--------|
| Route gate | `ProtectedRoute` — ADMIN, HR, MANAGER, EMPLOYEE | Preserved |
| Nav filter | `filterNavGroups()` / `filterNavItem()` | Preserved + centralized |
| Page guards | Sparse (AdminUsers, Employees, etc.) | Unchanged |

---

## Role Type Alignment

**Canonical `Role` type:** `ADMIN | HR | MANAGER | EMPLOYEE`

| Nav reference | Handling in registry filter |
|---------------|----------------------------|
| `SUPER_ADMIN` | Normalized → `ADMIN` for nav visibility |
| `FINANCE` | Normalized → `ADMIN` for nav visibility |

**Note:** Normalization affects sidebar display only. No route or API changes.

---

## Navigation Item RBAC Matrix

### ETMS Primary (when flags enabled)

| Item | Roles | Preserved from |
|------|-------|----------------|
| Dashboard | All | Executive Overview |
| My Tickets | All 4 | ticketing.nav.ts |
| Team Tickets | ADMIN, HR, MANAGER | New (scoped list) |
| All Tickets | ADMIN, HR, MANAGER | New (scoped list) |
| Create Ticket | All 4 | ticketing.nav.ts |
| Assigned To Me | All 4 | ticket-assignment.nav.ts |
| Team Assignments | ADMIN, HR, MANAGER | ticket-assignment.nav.ts |
| Workload | ADMIN, HR, MANAGER | ticket-assignment.nav.ts |
| Approvals (all) | None on items | approval-management.nav.ts |
| KB Articles | None | knowledge-management.nav.ts |
| Article Editor | MANAGER, ADMIN, SUPER_ADMIN, EMPLOYEE | Preserved |
| KB Analytics | MANAGER, ADMIN, SUPER_ADMIN, HR | Preserved |
| Communications | None | communication-tracking.nav.ts |
| Executive Dashboard | HR, ADMIN, SUPER_ADMIN | executive-analytics.nav.ts |
| SLA Dashboard | HR, ADMIN, SUPER_ADMIN, MANAGER | New |
| Department Analytics | MANAGER, HR, ADMIN, SUPER_ADMIN | Preserved |
| Notifications | None / partial | notification-center.nav.ts |
| Users | ADMIN | AdminUsers page guard |
| Departments | All | departments nav |
| Settings | ADMIN | Strategic Assets |
| Feedback Analytics | ADMIN, HR, MANAGER | ticket-feedback.nav.ts |

### Legacy EMS

| Item | Roles | Preserved from |
|------|-------|----------------|
| Payroll | ADMIN, HR | Workforce Intelligence |
| Attendance | All | HCM |
| Leaves | All | HCM |
| Projects | All | (was unrouted in nav) |
| Meetups | All | Executive Overview |
| Updates | All | Dashboard widget |
| Reports | ADMIN, HR, MANAGER | Strategic Assets |
| Documents | ADMIN, HR | Strategic Assets |

### Legacy Deep Payroll (legacy nav mode)

All 20 payroll sub-items retain original role arrays including FINANCE → ADMIN normalization.

---

## Validation Scenarios

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | EMPLOYEE sees no Administration group | Hidden | Pass (unit test) |
| 2 | ADMIN sees Users nav item | Visible | Pass (unit test) |
| 3 | EMPLOYEE direct URL `/app/admin/users` | Page blocks (ADMIN only) | Pass (unchanged) |
| 4 | FINANCE role user (if backend sends) | Finance nav via ADMIN norm | Improved |
| 5 | SUPER_ADMIN nav items | Visible to ADMIN | Improved |
| 6 | Feature flag OFF hides ETMS groups | Hidden | Pass |
| 7 | Legacy EMS collapsed default | Collapsed | Pass (unit test) |

---

## Gaps (Pre-existing — Not Introduced)

| Gap | Risk | Recommendation |
|-----|------|----------------|
| No page guard on `/app/projects` | Medium | Future: add MANAGER+ guard |
| Phase 7 routes rely on nav hiding | Medium | Backend must enforce |
| Nav-only RBAC for approvals/comms | Medium | Preserve; document |

**No RBAC weakening in this transformation.**

---

## Migration Notes

- Enable `VITE_ENABLE_ETMS_NAVIGATION=true` to activate new nav order
- Legacy nav mode (`false`) reconstructs original 9-group sidebar from same registry
- All `roles` arrays copied verbatim from prior `AppLayout.tsx` and `*.nav.ts` files
