# Phase 7.8 — RBAC Matrix

Uses existing ETMS roles only.

| Capability | EMPLOYEE | MANAGER | HR | ADMIN | SUPER_ADMIN |
|------------|----------|---------|-----|-------|-------------|
| View own notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unread count / badge | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mark read / mark all | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update preferences | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notification Analytics | — | ✓ (dept) | ✓ | ✓ | ✓ |
| Template CRUD | — | — | — | ✓ | ✓ |

## Frontend Nav

- **Notifications** — all authenticated users
- **Notification Analytics** — MANAGER, HR, ADMIN, SUPER_ADMIN

## Notes

- Existing `/api/notifications` (ChatService bell) remains unchanged
- Notification Center is a separate parallel system at `/api/notification-center`
- Feature flag OFF hides all nav, routes, badge, and polling
