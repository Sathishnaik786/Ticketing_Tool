# ETMS Notification Validation Report — Phase 6.5

**Date:** 2026-06-15  
**Scope:** ETMS notification integration layer only

---

## Flow Architecture

```
Ticket Action (ETMS service)
  → NotificationService (ticketing module)
  → ChatService.createNotification (EMS shared DB write)
  → notification-integration.service (optional SocketHandlers.emitNotification)
  → notifications table
  → GET /api/notifications (EMS REST)
  → NotificationBell (frontend)
```

---

## Event Coverage

| Business Event | DB Type | Recipient(s) | Status |
|----------------|---------|--------------|--------|
| Ticket Created | TICKET_CREATED | Requester | Fixed (Phase 6.5) |
| Ticket Assigned | TICKET_ASSIGNED | Assignee | Verified |
| Ticket Reassigned | TICKET_ASSIGNED (title: Reassigned) | New assignee | Fixed |
| Comment Added | TICKET_COMMENT | Requester + assignee (non-author) | Verified |
| Internal Comment | — | Skipped | Fixed |
| Status Changed | TICKET_UPDATED | Requester + assignee | Fixed |
| Ticket Closed | TICKET_UPDATED (title: Closed) | Requester + assignee | Fixed |
| Ticket Reopened | TICKET_UPDATED (title: Reopened) | Requester | Fixed |
| Ticket Escalated | TICKET_ESCALATED | Requester | Fixed |

---

## Link Validation

Notification links updated to frontend routes: `/app/tickets/:ticketId` (Phase 6.5 fix in `notification.service.js`).

---

## Real-Time Push

ETMS `notification-integration.service.js` invokes `SocketHandlers.emitNotification` when Socket.IO is available. This is **best-effort** and does not modify EMS socket handler code.

**Fallback:** REST polling via existing NotificationBell queries.

---

## Unread Count / Mark Read

Uses existing EMS endpoints — no ETMS changes required:
- `GET /api/notifications/unread-count`
- `POST /api/notifications/read/:id`
- `POST /api/notifications/read-all`

---

## Gaps / Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| RLS on notification insert via anon client | Medium | Document for ops; ETMS uses same EMS path as other modules |
| Watchers not notified | Low | Backlog — not in Phase 6.5 scope |
| No ticket-specific NotificationBell icons | Low | Generic display acceptable |

---

## Success Criteria

- [x] All primary ticket lifecycle events produce notifications
- [x] Internal comments suppressed
- [x] Links route to ETMS detail page
- [x] Optional real-time push without EMS core changes
- [ ] Full UAT sign-off pending business validation
