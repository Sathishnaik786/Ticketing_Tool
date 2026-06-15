# Admin UI Guard Report

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 2

---

## Audit Findings

| Surface | Before | Risk |
|---------|--------|------|
| `frontend/src/pages/AdminUsers.tsx` | No role guard | Non-admins could view admin UI |
| `frontend/src/App.tsx:109` | Route under generic ProtectedRoute | All authenticated roles could navigate |
| Sidebar (`AppLayout.tsx`) | No admin/users nav link | Direct URL access only |
| `POST /api/auth/admin/users` | ADMIN middleware | Backend already protected |

---

## Implementation

**File:** `frontend/src/pages/AdminUsers.tsx`

```tsx
if (!user || user.role !== 'ADMIN') {
  return <Navigate to="/app/unauthorized" replace />;
}
```

Guard runs after auth loading completes and before page content renders.

---

## Access Matrix

| Role | `/app/admin/users` | Create User API |
|------|-------------------|-----------------|
| ADMIN | Allowed | 200 |
| HR | Redirect → `/app/unauthorized` | 403 |
| MANAGER | Redirect → `/app/unauthorized` | 403 |
| EMPLOYEE | Redirect → `/app/unauthorized` | 403 |

---

## Preserved Behavior

- Route definition unchanged (`App.tsx`)
- Backend ADMIN middleware unchanged
- Navigation structure unchanged (no sidebar link added)

---

## Tests

| Test | Result |
|------|--------|
| Source guard assertion (backend test suite) | PASS |
| ProtectedRoute frontend tests | PASS |
