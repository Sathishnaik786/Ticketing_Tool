# Role Sync Implementation

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 1

---

## Source of Truth

| Column | Authority | Used By |
|--------|-----------|---------|
| `employees.role` | **Primary** | Auth middleware, API RBAC, ETMS |
| `users.role` | **Mirror** | RLS fallback, user provisioning |

Runtime authorization always reads `employees.role` via `auth.middleware.js`. The `users.role` column is retained and synchronized whenever an administrator changes an employee role.

---

## Implementation

**Service:** `backend/src/services/role-sync.service.js`

| Function | Purpose |
|----------|---------|
| `syncEmployeeRoleUpdate(db, { employeeId, newRole, actorUserId })` | Transactional role sync |
| `assertAdminCanModifyRole(actorRole, body)` | ADMIN-only role field guard |
| `assertValidRole(role)` | Validates ADMIN/HR/MANAGER/EMPLOYEE |

**Integration:** `backend/src/controllers/employee.controller.js`

- Role field removed from generic `fieldMap` update
- Role changes routed through `syncEmployeeRoleUpdate(supabaseAdmin, ...)`
- Non-role profile updates remain available to HR/MANAGER per existing routes

---

## Sync Flow

```
ADMIN PUT /api/employees/:id { role: "MANAGER" }
        │
        ▼
assertAdminCanModifyRole(req.user.role, body) ──403──► MANAGER/HR/EMPLOYEE
        │
        ▼
syncEmployeeRoleUpdate
        │
        ├─1─► UPDATE employees.role = newRole
        │
        ├─2─► UPDATE users.role = newRole (by employee.user_id)
        │
        └─3─► logger.info('role_sync_success', { previousRole, newRole, actorUserId })
```

---

## Rollback Flow

```
Step 1 succeeds (employees.role updated)
        │
        ▼
Step 2 fails (users.role update error)
        │
        ├─► ROLLBACK employees.role = previousRole
        │
        ├─► logger.error('role_sync_rollback', ...)
        │
        └─► throw AppError.internal('Role sync failed; employee role restored')
```

If step 1 fails, no partial state is written and an internal error is returned.

---

## Audit Logging

Structured Winston events:

- `role_sync_success`
- `role_sync_rollback`
- `role_sync_employee_update_failed`

Each event includes `employeeId`, `userId`, `previousRole`, `newRole`, and `actorUserId`.

---

## Constraints Preserved

- `users.role` column **not removed**
- RLS policies **not modified**
- Auth API contracts **not changed**
- ETMS / Sprint 1–4 services **not modified**

---

## Tests

**File:** `backend/src/tests/auth-rbac-hardening.test.js`

| Test | Result |
|------|--------|
| Role update syncs both tables | PASS |
| Users update failure rolls back employee role | PASS |
| Employee update failure throws without partial sync | PASS |
