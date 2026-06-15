# Role Fallback Audit — Phase 6.5D-A

**Scope:** Backend runtime role fallbacks and legacy column reads

---

## Critical Runtime Fallback (Root Cause)

| File | Line | Pattern | Impact |
|------|------|---------|--------|
| **`auth.middleware.js`** | **46** | `employee.role?.toUpperCase() \|\| 'EMPLOYEE'` | **All users → EMPLOYEE** when column absent |

---

## Legacy Column Reads (Not in Live Schema)

| File | Line | Pattern |
|------|------|---------|
| `auth.middleware.js` | 46 | `employee.role` |
| `auth.controller.js` | 364 | `employee.role` (login response) |
| `auth.controller.js` | 196, 228, 247 | `users.role` / `employees.role` (createUser) |
| `socketHandlers.js` | 45-56 | `employee.role` |
| `role-sync.service.js` | 49+ | `employee.role`, `users.role` |
| `enable_ticketing_rls.sql` | 41-56 | `employees.role`, `users.role` (RLS SQL only) |
| `enable_departments_rls.sql` | 29+ | `users.role` (RLS SQL only) |

---

## `|| 'EMPLOYEE'` / Default EMPLOYEE Occurrences

| File | Line | Context |
|------|------|---------|
| `auth.middleware.js` | 46 | **req.user.role assignment** |
| `updates.service.js` | 34 | update author role default |
| `ticketing.types.js` | 99 | `normalizeRole()` — ETMS permission checks |
| `schema2.sql` | 109, 207 | DDL default (not runtime) |
| `create_demo_employees.js` | 48 | script comment |

---

## `ROLES.EMPLOYEE` (ETMS permission map — not dashboard)

| File | Lines |
|------|-------|
| `ticketing.types.js` | 51-63, 99 |

These are permission constants, not auth resolution.

---

## `req.user.role =` Assignment Points

| File | Line | Source |
|------|------|--------|
| `auth.middleware.js` | 43-50 | **Only writer of req.user.role** |

All downstream RBAC reads `req.user.role` set here.

---

## Frontend (informational — not modified in 6.5D-A)

| File | Line | Pattern |
|------|------|---------|
| `Dashboard.tsx` | 58 | `else if (user.role === 'EMPLOYEE')` — consumes wrong backend role |
| `AuthContext.tsx` | 162 | `user?.role \|\| ''` — empty guard only |
| `AppLayout.tsx` | 572 | `user.role \|\| ''` — display only |

No frontend hardcodes EMPLOYEE as auth authority.
