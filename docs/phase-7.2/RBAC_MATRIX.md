# Phase 7.2 RBAC Matrix

| Action | EMPLOYEE | MANAGER | HR | ADMIN |
|--------|----------|---------|-----|-------|
| Create ticket | ✅ (existing ETMS) | ✅ | ✅ | ✅ |
| Assign ticket | ❌ | ✅ (dept only) | ✅ (all) | ✅ (all) |
| Reassign ticket | ❌ | ✅ (dept only) | ✅ (all) | ✅ (all) |
| View my queue | ✅ | ✅ | ✅ | ✅ |
| View team queue | ❌ | ✅ (dept) | ✅ (all) | ✅ (all) |
| View unassigned | ❌ | ✅ (dept) | ✅ (all) | ✅ (all) |
| View analytics | ❌ | ✅ (dept) | ✅ (all) | ✅ (all) |
| View own ticket history | ✅ (requester/assignee) | ✅ (dept) | ✅ | ✅ |

RBAC enforced in `ticket-assignment.service.js` using existing `ticketing.types.js` `canAssignTicket` (read-only import — no RBAC core changes).
