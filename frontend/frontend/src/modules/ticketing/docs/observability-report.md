# ETMS Observability Report — Phase 6.5

**Date:** 2026-06-15

---

## Implementation

**Module:** `backend/src/modules/ticketing/lib/ticketing-logger.js`

Structured Winston logs with `module: 'ticketing'` and event names.

---

## Tracked Events

| Event | Trigger | Logged Fields |
|-------|---------|---------------|
| ticket_created | createTicket | ticketId, status, priority, categoryId |
| ticket_assigned | assignTicket | ticketId |
| ticket_reassigned | reassignTicket | ticketId |
| ticket_status_changed | changeStatus | ticketId, status |
| ticket_closed | close via changeStatus | ticketId, status |
| ticket_reopened | reopen via changeStatus | ticketId, status |
| ticket_commented | addComment | ticketId, eventType (public/internal) |
| attachment_uploaded | createAttachment | ticketId, attachmentId, mimeType, fileSize |
| notification_sent | _notify | ticketId, eventType, recipientCount |

---

## PII / Security Controls

- **No** user emails, names, or comment content logged
- **No** JWT or token values logged
- **No** attachment file content or signed URLs logged
- Allowlist-based metadata sanitization in logger

---

## Log Destination

Uses existing EMS Winston configuration:
- `logs/combined-*.log`
- `logs/error-*.log`
- Console (development)

---

## Operational Queries

Example log filter (JSON logs):

```
module:"ticketing" AND event:"ticket_created"
```

---

## Success Criteria

- [x] Lifecycle events instrumented
- [x] PII-safe metadata only
- [x] No EMS module modifications for logging infrastructure
