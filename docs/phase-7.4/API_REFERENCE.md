# Phase 7.4 — API Reference

Base path: `/api/communications`  
Requires: `ENABLE_COMMUNICATION_TRACKING=true`, valid JWT

All endpoints return `{ success: boolean, data?: object, message?: string }` on success.

---

## POST /comment

Log a communication comment (stored in `ticket_communications`, not `ticket_comments`).

```json
{
  "ticket_id": "uuid",
  "message": "string",
  "visibility": "PUBLIC | INTERNAL",
  "subject": "optional"
}
```

**Response:** `201` — `{ communication, timeline }`

---

## POST /chat

Log a chat message.

```json
{
  "ticket_id": "uuid",
  "message": "string",
  "direction": "INBOUND | OUTBOUND | INTERNAL"
}
```

---

## POST /email

Log an email and create email log entry.

```json
{
  "ticket_id": "uuid",
  "sender": "string",
  "recipient": "string",
  "cc": "optional",
  "subject": "string",
  "body": "string",
  "status": "SENT | FAILED | RECEIVED"
}
```

---

## POST /call-log

Log a phone call.

```json
{
  "ticket_id": "uuid",
  "customer_name": "optional",
  "phone_number": "optional",
  "call_start_at": "ISO8601",
  "call_end_at": "ISO8601 optional",
  "duration_seconds": 120,
  "call_summary": "optional",
  "outcome": "NO_ANSWER | CONNECTED | RESOLVED | FOLLOWUP_REQUIRED"
}
```

---

## POST /internal-note

Log an internal system note (visibility INTERNAL).

```json
{
  "ticket_id": "uuid",
  "message": "string",
  "subject": "optional"
}
```

---

## GET /ticket/:ticketId

Returns unified communication bundle:

```json
{
  "ticket_id": "uuid",
  "communications": [],
  "call_logs": [],
  "email_logs": []
}
```

---

## GET /timeline/:ticketId

Returns merged timeline including read-only integrated events from assignment, feedback, and SLA modules.

```json
{
  "ticket_id": "uuid",
  "events": [
    {
      "id": "uuid",
      "event_type": "COMMENT_ADDED",
      "event_data": {},
      "created_at": "ISO8601",
      "integrated": false
    }
  ]
}
```

---

## GET /analytics

Query params: `from`, `to` (optional ISO dates)

```json
{
  "totalCommunications": 0,
  "callsLogged": 0,
  "emailsSent": 0,
  "commentsAdded": 0,
  "averageResponseTimeMinutes": 0,
  "communicationByDepartment": [{ "name": "IT", "count": 5 }],
  "communicationByBusinessUnit": [],
  "recentCommunications": []
}
```

---

## GET /dashboard-summary

Role-scoped recent communications for dashboard widgets.

---

## Error codes

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 403 | RBAC denied |
| 404 | Ticket not found |
| 503 | Module disabled |
