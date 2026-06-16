# Phase 7.2 API Reference

Base URL: `/api/ticket-assignments`  
Auth: Bearer token required  
Feature flag: `ENABLE_TICKET_ASSIGNMENTS=true`

---

## POST /

Assign an unassigned ticket.

**Body**
```json
{
  "ticket_id": "uuid",
  "assigned_to": "uuid",
  "assignment_type": "MANUAL | AUTO | ESCALATED | REASSIGNED | ROUND_ROBIN | QUEUE | SKILL_BASED",
  "reason": "string (optional, max 1000)"
}
```

**Response:** `201 Created`

**Errors:** `400` validation, `403` RBAC, `409` already assigned

---

## PUT /:ticketId/reassign

Reassign a ticket to a new agent.

**Body**
```json
{
  "assigned_to": "uuid",
  "assignment_type": "REASSIGNED",
  "reason": "optional"
}
```

**Response:** `200 OK`

---

## GET /my-queue

Tickets assigned to the authenticated employee.

**Query:** `page`, `limit`, `status`, `priority`

**Response:** `{ success, data: Ticket[], meta: { total, page, limit } }`

---

## GET /team-queue

Department or organization queue.

**Roles:** Manager (department-scoped), HR, Admin (all)

---

## GET /unassigned

Unassigned open tickets.

**Roles:** Manager, HR, Admin

---

## GET /analytics

Returns:

- `assignmentCount`
- `ticketsPerAgent`
- `departmentWorkload`
- `averageQueueSize`
- `assignmentTrend`
- `totalAssigned` / `totalUnassigned`
- `overloadedAgents` (≥5 tickets)
- `queueDistribution`

---

## GET /history/:ticketId

Immutable assignment audit trail from `ticket_assignment_history`.
