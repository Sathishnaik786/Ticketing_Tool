# Auth Role Resolution Trace — Phase 6.5D-A

**Type:** Read-only trace (pre-fix)  
**Root cause:** Proven — see line 46 fallback below

---

## Flow Diagram

```
Browser POST /api/auth/login
    │
    ▼
auth.controller.js:login (291-379)
    ├─ supabase.auth.signInWithPassword          → auth.users ✓
    ├─ employees SELECT * WHERE user_id            → row exists ✓
    ├─ role: employee.role                         → undefined (column absent)
    └─ returns user.role = undefined               → JSON omits or null

AuthContext.login (101-108)
    ├─ setAuthTokens
    └─ fetchUserProfile() → GET /api/auth/me

GET /api/auth/me
    │
    ▼
auth.middleware.js (3-58)  ← AUTHORITATIVE for session role
    ├─ supabase.auth.getUser(token)
    ├─ employees SELECT * WHERE user_id
    ├─ role: employee.role?.toUpperCase() || 'EMPLOYEE'   ← LINE 46 BUG
    └─ req.user.role = 'EMPLOYEE' (always, when employee.role absent)

auth.controller.js:getMe (432-446)
    └─ returns role: req.user.role  → 'EMPLOYEE'

AuthContext (63-65)
    └─ setUser(response.data.user)  → user.role = 'EMPLOYEE'

Dashboard.tsx (55-58)
    ├─ user.role === 'ADMIN'   → false
    ├─ user.role === 'MANAGER' → false
    ├─ user.role === 'HR'      → false
    └─ user.role === 'EMPLOYEE' → true  → Employee dashboard

AppLayout.tsx (197-198)
    └─ sidebar filters by user.role → EMPLOYEE nav only

ProtectedRoute.tsx (27-28)
    └─ allowedRoles includes all 4 → passes (no role block)
```

---

## Where Role Is Loaded

| Step | File | Lines | Source |
|------|------|-------|--------|
| Login | `auth.controller.js` | 364 | `employee.role` (absent) |
| Middleware | `auth.middleware.js` | 46 | `employee.role?.toUpperCase() \|\| 'EMPLOYEE'` |
| getMe | `auth.controller.js` | 438 | `req.user.role` (from middleware) |
| Frontend state | `AuthContext.tsx` | 63-65 | `/auth/me` response |
| Dashboard | `Dashboard.tsx` | 55-58 | `user.role` from context |
| Sidebar | `AppLayout.tsx` | 197-198 | `user.role` from context |

---

## Where Role Becomes EMPLOYEE

| Location | Line | Trigger |
|----------|------|---------|
| **`auth.middleware.js`** | **46** | `employee.role` undefined → `\|\| 'EMPLOYEE'` |
| `auth.controller.js` login | 364 | `employee.role` undefined (no fallback, but me() overwrites) |
| `ticketing.types.js` | 99 | `normalizeRole` default (ETMS only, not dashboard) |
| `updates.service.js` | 34 | unrelated fallback |

**Primary dashboard bug:** `auth.middleware.js:46`

---

## Live DB Evidence (2026-06-15)

| Email | `employee.role` | `user_roles → roles.role_code` | Middleware pre-fix |
|-------|-----------------|--------------------------------|--------------------|
| admin@etms.com | undefined | ADMIN | EMPLOYEE |
| hr@etms.com | undefined | HR | EMPLOYEE |
| manager@etms.com | undefined | MANAGER | EMPLOYEE |
| employee@etms.com | undefined | EMPLOYEE | EMPLOYEE |

`user_roles` is populated correctly; application never reads it pre-fix.
