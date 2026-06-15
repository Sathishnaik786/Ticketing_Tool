# Safe Role Fix Plan — Phase 6.5D-A

---

## Root Cause

Application reads `employees.role` (absent in live DB).  
Live authority is `user_roles` → `roles.role_code`.  
Fallback `|| 'EMPLOYEE'` in middleware forces EMPLOYEE dashboard for all users.

---

## Constraints (Honored)

- No database changes
- No ETMS module changes
- No frontend changes
- No auth flow redesign
- Preserve `req.user.role` string shape

---

## Implementation

### New service: `backend/src/services/role-resolution.service.js`

```javascript
getUserRole(db, userId)
  → SELECT user_roles JOIN roles WHERE user_id = ?
  → return roles.role_code uppercased
  → prefer EMS codes (ADMIN/HR/MANAGER/EMPLOYEE) if multiple
  → null if no assignment (caller may fallback EMPLOYEE)
```

### Patch 1: `auth.middleware.js`

Replace:
```javascript
role: employee.role?.toUpperCase() || 'EMPLOYEE',
```
With:
```javascript
const resolvedRole = await getUserRole(supabaseAdmin, data.user.id);
role: resolvedRole || 'EMPLOYEE',
```

### Patch 2: `auth.controller.js` login

Replace:
```javascript
role: employee.role,
```
With:
```javascript
const resolvedRole = await getUserRole(supabaseAdmin, user.id);
role: resolvedRole || 'EMPLOYEE',
```

### Unchanged

- Employee existence gate (login still requires `employees` row)
- `getMe` continues returning `req.user.role`
- `role.middleware.js` unchanged
- All ETMS services unchanged

---

## Rollback

Revert 3 files:
- `role-resolution.service.js` (delete)
- `auth.middleware.js`
- `auth.controller.js`

No DB rollback needed.

---

## Out of Scope (Future)

- `socketHandlers.js` still reads `employee.role` — sockets may show wrong role until separate patch
- `createUser` still writes `users.role` / `employees.role` — provisioning fix for Phase 6.5D-B
- `firstName`/`lastName` on `users` table vs `employees.first_name` — separate profile alignment
