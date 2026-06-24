# 12 — RBAC Matrix
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Role Definitions

| Role | Description | Scope |
|---|---|---|
| `SUPER_ADMIN` | Platform-level super user (reserved) | All tenants |
| `ADMIN` | Tenant administrator — full system access | Single tenant |
| `HR` | Human Resources — payroll, employee, approvals | Single tenant |
| `MANAGER` | Department/Team manager | Department |
| `TEAM_LEAD` | Team leader — limited agent management | Team |
| `AGENT` | IT support agent — ticket resolution | Assigned tickets |
| `EMPLOYEE` | End user — self-service only | Own records only |
| `AUDITOR` | Read-only audit access | Audit logs + reports |

---

## 2. Existing Modules — RBAC (Preserved)

| Module | SUPER_ADMIN | ADMIN | HR | MANAGER | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|
| Tickets (view all) | ✅ | ✅ | ✅ | ✅ (dept) | ✅ (assigned) | ✅ (own) | ✅ (read) |
| Tickets (create) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tickets (reassign) | ✅ | ✅ | ❌ | ✅ (dept) | ❌ | ❌ | ❌ |
| Tickets (close) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approvals (approve) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Knowledge Base (edit) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Knowledge Base (publish) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Payroll (view) | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ✅ (own) | ✅ |
| Payroll (edit) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Executive Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (read) |
| Notification Center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (own) | ❌ |

---

## 3. Phase 5.0 Modules — RBAC Matrix

### 3.1 Workflow Engine

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| List workflows | ✅ | ✅ | ❌ | ✅ (view) | ❌ | ❌ | ❌ | ✅ (read) |
| Create workflow | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit workflow | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish workflow | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete workflow | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own executions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve workflow step | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View execution analytics | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 3.2 SLA Policy Engine

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| View SLA policies | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Create/Edit SLA policy | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete SLA policy | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View SLA on own tickets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View SLA analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Acknowledge SLA breach | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 3.3 Service Catalog

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| Browse catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Submit service request | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View own requests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View all requests | ✅ | ✅ | ✅ | ✅ (dept) | ❌ | ❌ | ❌ | ✅ |
| Create/Edit catalog item | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Build/Edit form | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage categories | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.4 Automation Rules Engine

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| View automation rules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create/Edit rules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Enable/Disable rules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete rules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View automation logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.5 Executive Intelligence

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| Executive Command Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (read) |
| Service Health Dashboard | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Capacity Planning | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Department Insights | ✅ | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| Generate/Download Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| KPI configuration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.6 AI Copilot

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| Use AI suggestions (tickets) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| AI ticket classification | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| AI knowledge suggestions | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Submit AI feedback | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Configure AI settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View AI usage/cost | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.7 Audit & Compliance

| Action | SUPER_ADMIN | ADMIN | HR | MANAGER | TEAM_LEAD | AGENT | EMPLOYEE | AUDITOR |
|---|---|---|---|---|---|---|---|---|
| View full audit log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View own audit entries | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export audit log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete audit entries | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Note:** Audit logs are immutable. No role can delete them.

---

## 4. Permission Implementation Pattern

```typescript
// frontend/src/hooks/useRbac.ts
export function useCanAccess(permission: string): boolean {
  const { user } = useAuth();
  return PERMISSION_MAP[permission]?.includes(user.role) ?? false;
}

// Usage in component:
const canManageWorkflows = useCanAccess('workflow:manage');
if (!canManageWorkflows) return <AccessDenied />;
```

```javascript
// backend/src/middlewares/rbac.middleware.js
const PERMISSION_MAP = {
  'workflow:manage':        ['SUPER_ADMIN', 'ADMIN'],
  'workflow:approve':       ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT'],
  'sla:manage':             ['SUPER_ADMIN', 'ADMIN'],
  'catalog:manage':         ['SUPER_ADMIN', 'ADMIN'],
  'catalog:request':        ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'AGENT', 'EMPLOYEE'],
  'automation:manage':      ['SUPER_ADMIN', 'ADMIN'],
  'intelligence:view':      ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'],
  'ai:use':                 ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEAD', 'AGENT'],
  'ai:configure':           ['SUPER_ADMIN', 'ADMIN'],
  'audit:view':             ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'],
};

export const rbac = (permissions) => (req, res, next) => {
  const userRole = req.user.role;
  const allowed = permissions.some(p => PERMISSION_MAP[p]?.includes(userRole));
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  next();
};
```

---

## 5. Data Isolation Rules

| Module | Isolation Rule |
|---|---|
| Workflows | Tenant-scoped (`tenant_id` filter on all queries) |
| Service Requests | User sees own; Managers see department; Admin sees all |
| SLA Analytics | Department managers see only their department |
| Automation Logs | Admin-only; Auditor read-only |
| AI Interactions | Admin sees all usage; Users see own interactions |
| Audit Logs | Admin + Auditor full access; Others see own entries |
