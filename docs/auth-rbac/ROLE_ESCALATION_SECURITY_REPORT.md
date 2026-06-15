# Role Escalation Security Report

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 4

---

## Critical Finding (Pre-Fix)

**File:** `backend/src/controllers/employee.controller.js`

MANAGER and HR could pass `role` in `PUT /api/employees/:id` body. The controller mapped `role` directly into the Supabase update with no ADMIN check.

---

## Fix

**Guard:** `assertAdminCanModifyRole` in `backend/src/services/role-sync.service.js`

Applied in:

- `employee.controller.js` → `create` (blocks non-ADMIN role assignment)
- `employee.controller.js` → `update` (blocks non-ADMIN role changes)

Only **ADMIN** may modify:

- `role`
- privilege level (via role field)

HR/MANAGER may still update profile fields (name, department, status, etc.) per existing route middleware.

---

## Escalation Matrix (Post-Fix)

| Actor | Action | HTTP Status |
|-------|--------|-------------|
| EMPLOYEE | `PUT /employees/:id { role: "ADMIN" }` | 403 |
| MANAGER | `PUT /employees/:id { role: "ADMIN" }` | 403 |
| HR | `PUT /employees/:id { role: "ADMIN" }` | 403 |
| ADMIN | `PUT /employees/:id { role: "HR" }` | 200 |

**Create user:** `POST /auth/admin/users` remains ADMIN-only (unchanged).

---

## ETMS / Ticketing Impact

No changes to Sprint 1–4 ticketing services. ETMS RBAC continues to use `req.user.role` from `employees.role` via auth middleware.

---

## Tests

| Test | Result |
|------|--------|
| MANAGER role escalation denied | PASS |
| HR role escalation denied | PASS |
| EMPLOYEE role escalation denied | PASS |
| ADMIN role change allowed (service layer) | PASS |
