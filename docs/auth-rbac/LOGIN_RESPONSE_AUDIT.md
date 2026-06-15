# Login Response Audit — Phase 6.5D-A

---

## POST /api/auth/login

**File:** `backend/src/controllers/auth.controller.js:358-374`

### Pre-fix response shape

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<auth.users.id>",
      "email": "admin@etms.com",
      "role": null,
      "profile_image": null,
      "firstName": undefined,
      "lastName": undefined,
      "employeeId": "<employees.id>"
    },
    "token": "<access_token>",
    "refresh_token": "<refresh_token>"
  }
}
```

**Role source pre-fix:** `employee.role` (line 364) — **undefined** in live schema.

### Post-fix response shape

Same contract; `role` now from `getUserRole(supabaseAdmin, user.id)`:

```json
"role": "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"
```

Fallback `'EMPLOYEE'` only if no `user_roles` assignment exists.

---

## GET /api/auth/me

**File:** `backend/src/controllers/auth.controller.js:432-446`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "role": "<from req.user.role>",
      "position": null,
      "profile_image": null,
      "firstName": null,
      "lastName": null,
      "employeeId": "..."
    }
  }
}
```

**Role source:** `req.user.role` set by `auth.middleware.js` (line 438).

**Frontend authority:** `AuthContext.tsx:63-65` calls `/auth/me` after login — **this is what drives Dashboard and sidebar**.

---

## Role Value Chain (Post-Fix)

```
user_roles.role_id → roles.role_code
        │
        ▼
getUserRole(userId)  [role-resolution.service.js]
        │
        ├─► auth.middleware.js → req.user.role
        │         └─► getMe → response.data.user.role
        │
        └─► auth.controller.js login → response.data.user.role
```

---

## Verified Live Mapping

| Email | login/me role (post-fix) | roles.role_code |
|-------|--------------------------|-----------------|
| admin@etms.com | ADMIN | ADMIN |
| hr@etms.com | HR | HR |
| manager@etms.com | MANAGER | MANAGER |
| employee@etms.com | EMPLOYEE | EMPLOYEE |
