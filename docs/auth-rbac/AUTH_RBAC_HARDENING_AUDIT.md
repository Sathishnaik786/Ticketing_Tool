# AUTH RBAC Hardening — Pre-Implementation Audit

**Date:** 2026-06-15  
**Type:** Read-only audit (Phase 6.5B)  
**Scope:** EMS + ETMS authentication and RBAC

---

## Executive Summary

Authorization at runtime uses **`employees.role`** via `auth.middleware.js`. The `users.role` column is written at user creation but **not synced** on employee role updates, causing drift. MANAGER/HR can update employee records including `role` via `PUT /api/employees/:id`. AdminUsers page lacks frontend ADMIN guard. ProtectedRoute redirects to `/unauthorized` (404). Logout clears localStorage only. No session refresh. `JWT_SECRET` is required at boot but unused in auth code paths.

---

## 1. users.role Usage Locations

| File | Lines | Purpose | API Auth? |
|------|-------|---------|-----------|
| `backend/src/controllers/auth.controller.js` | 24–27, 52–56 | check-email, forgot-password lookup | No |
| `backend/src/controllers/auth.controller.js` | 191–197 | createUser insert | No (provisioning) |
| `backend/src/controllers/auth.controller.js` | 263 | createUser rollback delete | No |
| `backend/database/enable_ticketing_rls.sql` | 47–57 | RLS fallback `ticketing_get_employee_role()` | RLS only |
| `backend/database/enable_departments_rls.sql` | 29, 37, 54, 71 | Department RLS policies | RLS only |
| `backend/src/modules/payroll/.../payroll-notification.service.ts` | 22–24 | Comment/assumption in notification query | Payroll only |

**Finding:** No runtime API authorization reads `users.role` directly. Drift affects RLS fallback only.

---

## 2. employees.role Usage Locations

| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/middlewares/auth.middleware.js` | 25–46 | **Authoritative** — sets `req.user.role` |
| `backend/src/controllers/auth.controller.js` | 320–364 | Login response role |
| `backend/src/socketHandlers.js` | 28–56 | Socket auth role |
| `backend/src/controllers/employee.controller.js` | 209–216, 394, 453 | getAll scoping, update mapping |
| All module controllers | various | `req.user.role` checks (from middleware) |
| ETMS `ticketing.types.js` | via `user.role` on `req.user` | Service RBAC |

**Finding:** ETMS uses `req.user.role` sourced from `employees.role` — correct.

---

## 3. AdminUsers Page Guards

| Check | Result |
|-------|--------|
| `frontend/src/pages/AdminUsers.tsx` | **No role guard** — lines 191–193 only auth loading |
| `frontend/src/App.tsx` | Route at line 109 — all roles in parent ProtectedRoute |
| Sidebar (`AppLayout.tsx`) | **No admin/users nav entry** found — direct URL only |
| Backend `POST /auth/admin/users` | **ADMIN only** — `auth.routes.js:12` |

**Risk:** MEDIUM — non-admin users can view Admin UI; mutations partially protected by backend.

---

## 4. ProtectedRoute Unauthorized Redirects

**File:** `frontend/src/components/ProtectedRoute.tsx`

| Line | Current | Expected |
|------|---------|----------|
| 25 | `<Navigate to="/login" />` | Correct |
| 28 | `<Navigate to="/unauthorized" />` | **Should be `/app/unauthorized`** |

Unauthorized page registered at `App.tsx:116` as `/app/unauthorized`.

---

## 5. Employee Role Update Permissions

**File:** `backend/src/routes/employee.routes.js`

| Route | Middleware | Can update role? |
|-------|------------|------------------|
| `PUT /:id` | ADMIN, HR, **MANAGER** | **Yes** — controller accepts `role` field |
| `POST /` | ADMIN, HR | Can pass role in body |

**File:** `backend/src/controllers/employee.controller.js:376–472`

- Maps `role` into update payload (line 394)
- No ADMIN-only check before role update
- Does not sync to `users.role`

**Risk:** CRITICAL — MANAGER can escalate privileges via API.

---

## 6. Logout Implementation

**File:** `frontend/src/contexts/AuthContext.tsx:101–104`

```typescript
localStorage.removeItem('token');
setUser(null);
```

- No `supabase.auth.signOut()`
- No query cache clear
- No refresh token removal
- No redirect

---

## 7. Supabase Session Refresh

| Component | Refresh support |
|-----------|-----------------|
| `AuthContext.tsx` | **None** |
| `authApi.login` | Returns access_token only |
| `api.ts` | No 401 refresh retry |
| `lib/supabase.ts` | Client exists but not used for auth session |

---

## 8. JWT_SECRET Usage

| Location | Usage |
|----------|-------|
| `backend/src/server.js:19` | Required env check |
| `backend/src/config/index.js:6` | Exported in config |
| `backend/package.json` | `jsonwebtoken` dependency |
| `backend/src/**/*.js` | **No jwt.sign / jwt.verify** |

Auth uses Supabase `access_token` validated via `supabase.auth.getUser()`.

---

## 9. RLS Dependencies on users.role

| File | Dependency |
|------|------------|
| `enable_ticketing_rls.sql` | Fallback in `ticketing_get_employee_role()` |
| `enable_departments_rls.sql` | Direct `users.role` checks |

**Constraint:** Do not modify RLS in this phase — sync keeps `users.role` aligned.

---

## 10. ETMS Dependencies on employees.role

| Layer | Source |
|-------|--------|
| `auth.middleware.js` | `employees.role` → `req.user.role` |
| ETMS services | `user.role` from `req.user` |
| ETMS RLS | `ticketing_get_employee_role()` — employees first |

**No ETMS service changes required.**

---

## Recommended Fixes

| Blocker | Fix | Files |
|---------|-----|-------|
| 1 Role drift | Sync `users.role` on employee role change with rollback | `services/role-sync.service.js`, `employee.controller.js` |
| 2 Admin UI | ADMIN guard on AdminUsers | `AdminUsers.tsx` |
| 3 ProtectedRoute | Redirect to `/app/unauthorized` | `ProtectedRoute.tsx` |
| 4 Escalation | ADMIN-only role changes | `employee.controller.js` |
| 5 Logout | signOut + cache clear + redirect | `AuthContext.tsx`, `authSession.ts` |
| 6 Session | Store refresh_token, refresh on 401 | `auth.controller.js`, `AuthContext.tsx`, `api.ts` |
| 7 JWT_SECRET | Document only — no runtime removal | Report only |

---

## Risk Analysis

| Risk | Severity | Post-fix target |
|------|----------|-----------------|
| Manager role escalation | CRITICAL | Resolved (Blocker 4) |
| users/employees role drift | MEDIUM | Resolved (Blocker 1) |
| Admin UI exposure | MEDIUM | Resolved (Blocker 2) |
| Wrong unauthorized route | MEDIUM | Resolved (Blocker 3) |
| Stale Supabase session | LOW | Resolved (Blocker 5–6) |
