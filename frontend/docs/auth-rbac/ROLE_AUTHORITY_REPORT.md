# Role Authority Report — Phase 6.5D-A

---

## Question: Which model does code use?

**Answer: D) Mixed model — code targets A+B; live DB uses C**

| Model | Description | Live DB | Application Code (pre-fix) |
|-------|-------------|---------|------------------------------|
| **A** | `employees.role` | **Column absent** | **Primary runtime read** |
| **B** | `users.role` | **Column absent** | createUser writes; RLS fallback |
| **C** | `user_roles` → `roles.role_code` | **Populated & authoritative** | **Never read in app code** |
| **D** | Mixed | C in DB, A in code | **Mismatch** |

---

## Runtime Authority Matrix (Pre-Fix)

| Source | Intended | Actually used at login/session | Live data |
|--------|----------|-------------------------------|-----------|
| `employees.role` | Yes | Yes — returns undefined | N/A |
| `users.role` | Mirror | No (not read in middleware) | N/A |
| `user_roles` → `roles` | No in code | **No** | ADMIN/HR/MANAGER/EMPLOYEE assigned |
| Fallback `'EMPLOYEE'` | Edge case | **Yes — always triggered** | Masks correct DB roles |

---

## ETMS

ETMS uses `req.user.role` from middleware (`ticketing.types.js:102-105`).  
Same broken source — ETMS inherits EMPLOYEE for all users pre-fix.  
Fixing middleware fixes ETMS without touching ticketing module code.

---

## Post-Fix Authority (Implemented)

| Source | Used? |
|--------|-------|
| `getUserRole(userId)` via `user_roles` JOIN `roles` | **Yes — primary** |
| `employees.role` | No |
| `users.role` | No |
| Fallback `'EMPLOYEE'` | Only when no `user_roles` row |
