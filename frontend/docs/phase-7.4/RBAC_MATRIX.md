# Phase 7.4 — RBAC Matrix

## Ticket access (view / create communications)

| Role | Scope |
|------|-------|
| EMPLOYEE | Own tickets (requester or assignee) |
| MANAGER | Department tickets |
| HR | All tickets |
| ADMIN | All tickets |
| SUPER_ADMIN | All tickets |

## Endpoint permissions

| Endpoint | EMPLOYEE | MANAGER | HR | ADMIN | SUPER_ADMIN |
|----------|----------|---------|-----|-------|-------------|
| POST comment/chat/email/call/internal-note | Own tickets | Dept | All | All | All |
| GET ticket communications | Own | Dept | All | All | All |
| GET timeline | Own | Dept | All | All | All |
| GET analytics | Scoped own | Scoped dept | All | All | All |
| GET dashboard-summary | Own | Dept | All | All | All |

## Visibility rules

- `PUBLIC` communications visible to all authorized viewers on the ticket.
- `INTERNAL` communications visible to users with ticket access (internal notes, internal comments).
- Integrated read-only events inherit source module data; no RBAC bypass.

## Feature flag

When `ENABLE_COMMUNICATION_TRACKING !== 'true'`, all endpoints return **503** regardless of role.
