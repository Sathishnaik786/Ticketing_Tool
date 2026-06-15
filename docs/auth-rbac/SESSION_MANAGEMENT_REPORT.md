# Session Management Report

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 6

---

## Pre-Fix Audit

| Component | Token Refresh |
|-----------|---------------|
| `AuthContext.tsx` | None — 401 cleared token only |
| `authApi` / `api.ts` | No retry on 401 |
| `auth.controller.js` login | Returned `access_token` only |

---

## Implementation

### Backend (additive)

**File:** `backend/src/controllers/auth.controller.js`

Login response now includes:

```json
{
  "token": "<access_token>",
  "refresh_token": "<refresh_token>"
}
```

Existing `token` field preserved — no breaking change.

### Frontend

**File:** `frontend/src/services/authSession.ts`

- Stores `token` and `refresh_token` in localStorage
- `tryRefreshSession()` calls `supabase.auth.refreshSession({ refresh_token })`
- Deduplicates concurrent refresh attempts

**File:** `frontend/src/services/api.ts`

- On HTTP 401 (except `/auth/login`), attempts one token refresh
- Retries original request with new access token
- Clears storage if refresh fails

**File:** `frontend/src/contexts/AuthContext.tsx`

- Login stores both tokens via `setAuthTokens`
- Profile fetch on 401 attempts refresh before clearing session

---

## Behavior

| Scenario | Action |
|----------|--------|
| Valid session | Normal API calls |
| Expired access token | Auto-refresh via Supabase |
| Refresh succeeds | New tokens stored, request retried |
| Refresh fails | Tokens cleared, user logged out on next protected action |

---

## Constraints Preserved

- Supabase-compatible (no custom JWT generation)
- Existing login API endpoint unchanged
- Auth middleware still validates Supabase access tokens

---

## Tests

| Test | Result |
|------|--------|
| Login returns refresh_token | PASS (source check) |
| api.ts 401 refresh retry | PASS (source check) |
| tryRefreshSession implemented | PASS (source check) |
