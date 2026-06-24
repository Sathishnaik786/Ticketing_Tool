# Phase 7.3 RBAC Matrix

RBAC enforced in `sla-management` service layer. Uses existing `auth.middleware` for authentication only — **no changes** to `role.middleware` or `ticketing.types.js`.

`SUPER_ADMIN` treated as superset of `ADMIN` (module-local).

---

## Permissions

| Action | EMPLOYEE | MANAGER | HR | ADMIN | SUPER_ADMIN |
|--------|----------|---------|-----|-------|-------------|
| View own ticket SLA (`/sla/ticket/:id`) | ✅ requester/assignee | ✅ dept | ✅ all | ✅ all | ✅ all |
| View my SLA queue (`/sla/my`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| View SLA dashboard | ❌ | ✅ dept | ✅ all | ✅ all | ✅ all |
| View escalations | ❌ | ✅ dept | ✅ all | ✅ all | ✅ all |
| View analytics | ❌ | ✅ dept | ✅ all | ✅ all | ✅ all |
| Create SLA policy | ❌ | ❌ | ❌ | ✅ | ✅ |
| Update SLA policy | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete/deactivate policy | ❌ | ❌ | ❌ | ✅ | ✅ |
| SLA Engine tab (ticket detail) | ✅ own | ✅ dept | ✅ all | ✅ all | ✅ all |
| SLA Dashboard page | ❌ | ✅ | ✅ | ✅ | ✅ |
| Escalations page | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## Scoping Rules

### Manager

- Department determined by `employees.department_id` of authenticated user
- Ticket visible if `tickets.department_id` matches manager's department
- Dashboard/analytics filtered to department (+ mapped business unit if configured)

### HR / Admin / SUPER_ADMIN

- Organization-wide visibility
- Optional filters by `business_unit_id`, `department_id`

### Employee

- Ticket visible if user is `requester_id` or `assignee_id` (via employeeId)
- No access to org-wide dashboards or escalation lists

---

## Notification Recipients (Escalation Engine)

| Event | Recipients |
|-------|------------|
| SLA_WARNING (75%) | Ticket assignee, requester |
| MANAGER_ESCALATION (90%) | Department manager (`departments.manager_id`) |
| SLA_BREACH / ADMIN_ESCALATION (100%) | Users with HR or ADMIN role |

Notification delivery uses existing `notifications` table + socket push pattern.

---

## Frontend Visibility

| Component | Flag OFF | Flag ON |
|-----------|----------|---------|
| SLA Engine tab | Hidden | Role-based |
| `/app/sla-dashboard` | Route absent | Manager+ |
| `/app/escalations` | Route absent | Manager+ |
| Legacy SLA tab | Unchanged | Unchanged |
