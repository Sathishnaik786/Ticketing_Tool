# Protected Route Fix Report

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 3

---

## Issue

`ProtectedRoute.tsx` redirected unauthorized users to `/unauthorized`, but the Unauthorized page is registered at `/app/unauthorized` in `App.tsx:116`. This caused a 404 for wrong-role users.

---

## Fix

**File:** `frontend/src/components/ProtectedRoute.tsx`

| Condition | Redirect Target |
|-----------|----------------|
| Unauthenticated | `/login` |
| Wrong role | `/app/unauthorized` (fixed) |
| Authorized | Page access via `<Outlet />` |

```tsx
if (allowedRoles && !allowedRoles.includes(user.role)) {
  return <Navigate to="/app/unauthorized" replace />;
}
```

---

## Preserved Behavior

- No route restructuring
- No auth flow changes
- No login flow changes
- AppLayout wrapper unchanged

---

## Tests

**File:** `frontend/src/components/__tests__/ProtectedRoute.test.tsx`

| Scenario | Expected | Result |
|----------|----------|--------|
| Unauthenticated | `/login` | PASS |
| Wrong role (EMPLOYEE → ADMIN route) | `/app/unauthorized` | PASS |
| Authorized ADMIN | Page renders | PASS |
