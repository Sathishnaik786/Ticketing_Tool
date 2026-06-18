# RBAC Consolidation Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No Implementation  
**Date:** 2026-06-18

---

## Current State Analysis

### Authority Sources in Codebase

| Source | Location | Used At Runtime? | Written On User Create? |
|--------|----------|-------------------|-------------------------|
| `user_roles` → `roles.role_code` | `role-resolution.service.js` | **Yes** (login, auth middleware) | **No** |
| `employees.role` | `auth.controller.js`, `rbac_schema.sql`, ticketing RLS | Legacy writes; RLS fallback | Yes |
| `users.role` | `auth.controller.js`, `fixed_schema.sql` | No (not read at login) | Yes |
| Static `PERMISSIONS` map | `ticketing.types.js` | Yes (ticketing service layer) | N/A |
| `ROLE_PERMISSIONS_MAP` | `payroll/config/rbac.config.ts` | Yes (payroll module) | N/A |
| `requireRole()` middleware | `role.middleware.js` | Yes (route level) | N/A |
| `hasViewAllAccess()` | `ownership.middleware.js` | Yes (SUPER_ADMIN) | N/A |
| Frontend `Role` type | `types/index.ts` | Yes (UI guards) | N/A |
| Sidebar `item.roles` | `AppLayout.tsx` | Yes (nav filter) | N/A |

### Documented Prior Analysis

`docs/auth-rbac/ROLE_AUTHORITY_REPORT.md` confirms post-fix middleware reads `user_roles`, but **createUser gap remains verified** (no insert into `user_roles`).

### Schema Gap

`user_roles` and `roles` tables are referenced in SQL policies (`schema.sql:185-195`) and application code, but **no CREATE TABLE DDL exists** in `backend/database/*.sql`. Tables likely created manually in Supabase or via undocumented migration.

---

## Problem Statement

1. **Write path ≠ read path:** User creation writes `employees.role`; login reads `user_roles`.
2. **Three parallel permission systems:** DB roles, ticketing static map, payroll static map.
3. **RLS uses different role source** than API (`enable_ticketing_rls.sql` → `employees.role`).
4. **Frontend type system incomplete:** Missing `SUPER_ADMIN`, `FINANCE`.
5. **No permission-level UI:** Navigation uses coarse roles, not granular permissions.

---

## Recommended Single Source of Truth

### Primary Authority (Runtime)

```
auth.users (Supabase Auth identity)
    ↓
public.user_roles (assignments)
    ↓
public.roles (role_code, role_name, is_active)
    ↓
public.role_permissions (optional Phase 2)
    ↓
public.permissions (permission_code)
```

### Deprecated (Retain for Backward Compatibility Only)

| Column/Pattern | Status |
|----------------|--------|
| `employees.role` | **Read-only mirror** during transition; stop writing |
| `users.role` | **Read-only mirror** during transition; stop writing |
| Static `PERMISSIONS` in ticketing | **Migrate to** shared permission service reading DB or shared config module |
| Payroll `ROLE_PERMISSIONS_MAP` | **Migrate to** shared permission service |

### Runtime Resolution Flow (Target)

```
Request → auth.middleware
       → getUserRole(supabaseAdmin, userId)     // from user_roles
       → getUserPermissions(supabaseAdmin, userId)  // NEW
       → req.user = { id, email, role, employeeId, permissions[] }
       → route middleware: requirePermission('tickets.view_all')
       → service layer: assertPermission(user, 'ASSIGN_TICKET')
```

---

## Recommended Architecture

### Layer 1 — Database (Authoritative)

- `roles` — role definitions including SUPER_ADMIN, FINANCE if needed
- `permissions` — granular codes: `tickets.create`, `tickets.view_all`, `payroll.process`, etc.
- `role_permissions` — many-to-many
- `user_roles` — user assignments with `assigned_at`, optional `department_scope`

### Layer 2 — Backend Service (Single Module)

New module (planned, not implemented):

```
backend/src/services/rbac/
  role-resolution.service.js    (extend existing)
  permission-resolution.service.js  (NEW)
  rbac.constants.js               (EMS_ROLE_CODES, etc.)
```

Replace direct `requireRole('ADMIN')` with `requirePermission('...')` incrementally.

### Layer 3 — RLS Helper Functions (Database)

Update `ticketing_get_employee_role()` to read from `user_roles` via SECURITY DEFINER function instead of `employees.role`.

### Layer 4 — Frontend

- Extend `Role` type or move to `permissions: string[]` on user object from `/auth/me`
- `usePermission('tickets.view_all')` hook
- Sidebar filters on permissions, not hardcoded roles

---

## Migration Strategy

### Stage A — Discovery (No writes)

1. Export live Supabase schema: roles, permissions, user_roles counts
2. Compare with `employees.role` / `users.role` if columns exist
3. Document drift report

### Stage B — Data Backfill (Additive SQL)

```sql
-- Pseudocode — NOT FOR EXECUTION WITHOUT REVIEW
-- For each employee with role X and no user_roles row:
--   INSERT INTO user_roles (user_id, role_id, assigned_at)
--   SELECT e.user_id, r.id, NOW()
--   FROM employees e JOIN roles r ON r.role_code = e.role
--   WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = e.user_id);
```

Rollback: delete backfilled rows where `assigned_at = backfill_batch_timestamp`.

### Stage C — Write Path Fix

Modify `createUser` to:
1. Insert auth user
2. Insert `users` row (identity only — no role column long term)
3. Insert `employees` row (no role column long term)
4. **Insert `user_roles`** with resolved `role_id`

### Stage D — Dual-Read Period (2 weeks staging)

`getUserRole()` logic:
1. Read `user_roles` (primary)
2. If null, fallback `employees.role` (log warning)
3. Emit metric for fallback usage

### Stage E — RLS Function Update

New SQL migration updating `ticketing_get_employee_role()` to use `user_roles`.

### Stage F — Deprecate Static Maps

- Ticketing: replace `PERMISSIONS` with shared service
- Payroll: replace `ROLE_PERMISSIONS_MAP` with shared service
- Keep static map as fallback behind `RBAC_LEGACY_MODE=true` flag

---

## Backward Compatibility Strategy

| Mechanism | Purpose |
|-----------|---------|
| Dual-read fallback | Prevent lockout during migration |
| `RBAC_LEGACY_MODE` env flag | Re-enable static maps if DB permissions fail |
| Mirror columns retained | Do not drop `employees.role` until Stage G |
| Feature flag per module | Ticketing can migrate before payroll |
| Audit log on role changes | Track every user_roles mutation |

**NEVER (per safety rules):** Drop columns, drop constraints, remove feature flags without approval.

---

## Files Impacted (Implementation Phase)

| File | Change Type |
|------|-------------|
| `backend/src/controllers/auth.controller.js` | Insert user_roles on create |
| `backend/src/services/role-resolution.service.js` | Add permission resolution |
| `backend/src/middlewares/role.middleware.js` | Extend or add requirePermission |
| `backend/src/modules/ticketing/ticketing.types.js` | Delegate to RBAC service |
| `backend/src/modules/payroll/config/rbac.config.ts` | Delegate to RBAC service |
| `backend/database/enable_ticketing_rls.sql` | New version via additive migration |
| `frontend/src/types/index.ts` | Extend user type with permissions |
| `frontend/src/contexts/AuthContext.tsx` | Store permissions from /auth/me |
| `frontend/src/components/layout/AppLayout.tsx` | Permission-based nav |
| `frontend/src/App.tsx` | SUPER_ADMIN in ProtectedRoute |
| New SQL backfill scripts | Additive only |

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Users lose admin access after backfill | Critical | Staging dry-run; SUPER_ADMIN bootstrap account verified first |
| RLS recursion returns | High | SECURITY DEFINER functions; test in staging |
| Payroll/ticketing permission mismatch | High | Module-by-module migration |
| Frontend shows wrong nav | Medium | Dual-read + permission hook tests |

---

## Rollback Plan

1. Set `RBAC_LEGACY_MODE=true`
2. Restore `getUserRole()` fallback to `employees.role` only
3. Revert createUser to write employees.role (if user_roles insert causes failures)
4. RLS: keep old function definition in rollback SQL script

---

## Success Criteria

- [ ] 100% of active users have `user_roles` row matching intended access
- [ ] createUser atomically creates user_roles assignment
- [ ] Login role matches admin-assigned role in UI
- [ ] Ticketing RBAC tests pass (`communication-tracking.rbac.test.js`, `ticket-assignment.rbac.test.js`)
- [ ] Zero fallback reads from deprecated columns in production logs (7-day window)

---

*No implementation performed. Requires approval before any code or SQL changes.*
