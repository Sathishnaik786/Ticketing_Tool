# Phase 7.3 API Reference

Base path: `/api/sla`  
Feature flag: `ENABLE_SLA_ENGINE=true`  
Auth: Bearer token (existing `auth.middleware`)

When flag is OFF: routes not mounted (404 from app, not 503 on individual routes unless middleware pattern matches 7.1/7.2).

---

## User / Operator Endpoints

### GET /api/sla/my

Current user's tickets with SLA status (assignee or requester).

**Query:** `page`, `limit`, `status` (active|breached|approaching)

**Response:**

```json
{
  "success": true,
  "data": [{
    "ticket_id": "uuid",
    "ticket_number": "TKT-2026-00001",
    "response_due_at": "ISO",
    "resolution_due_at": "ISO",
    "response_breached": false,
    "resolution_breached": false,
    "response_remaining_pct": 42,
    "resolution_remaining_pct": 68,
    "sla_status": "ON_TRACK | APPROACHING | BREACHED"
  }],
  "meta": { "total": 10, "page": 1, "limit": 20 }
}
```

---

### GET /api/sla/ticket/:ticketId

SLA detail for one ticket + escalation history.

**Roles:** Employee (own ticket), Manager (dept), HR/Admin (all)

---

### GET /api/sla/dashboard

Executive/operational dashboard aggregates.

**Widgets data:**

- `activeSla` — count of open tickets with ticket_sla
- `approachingBreach` — ≥75% consumed on either timer
- `breached` — response_breached OR resolution_breached
- `compliancePct` — `(total - breached) / total × 100`

**Query (optional):** `business_unit_id`, `department_id`, `from_date`, `to_date`

**Roles:** Manager (dept-scoped), HR/Admin (all)

---

### GET /api/sla/escalations

Paginated escalation events.

**Query:** `page`, `limit`, `department_id`, `priority`, `escalation_type`, `open_only`

**Roles:** Manager, HR, Admin

---

### GET /api/sla/analytics

Extended analytics for executive reporting.

**Returns:**

- `enterpriseSlaPct`
- `departmentSlaPct[]`
- `businessUnitSlaPct[]`
- `averageResolutionTimeMinutes`
- `escalationTrend[]` (monthly)
- `priorityAnalysis[]`

**Roles:** Manager, HR, Admin, SUPER_ADMIN

---

## Admin Endpoints

### POST /api/sla/policies

Create SLA policy.

**Body:**

```json
{
  "name": "Corporate Services - HIGH",
  "business_unit_id": "uuid|null",
  "department_id": "uuid|null",
  "category_id": "uuid|null",
  "priority": "HIGH",
  "response_time_minutes": 60,
  "resolution_time_minutes": 480,
  "is_active": true
}
```

**Roles:** ADMIN, SUPER_ADMIN

---

### PUT /api/sla/policies/:id

Update policy (does not retroactively recalculate open ticket_sla unless explicit `recalculate=true` query — v2 consideration).

---

### DELETE /api/sla/policies/:id

Soft-delete via `is_active=false` (preferred) or hard delete if no ticket_sla references.

---

## Unchanged Legacy Endpoints

These remain owned by the ticketing module and are **not** modified:

| Endpoint | Module |
|----------|--------|
| `GET /api/tickets/:ticketId/sla` | ticketing |
| All ticket CRUD/assign/comment routes | ticketing |
| All `/api/ticket-assignments/*` | ticket-assignment (7.2) |
| All `/api/ticket-feedback/*` | ticket-feedback (7.1) |

---

## Error Codes

| Code | Meaning |
|------|---------|
| 503 | SLA engine disabled (if middleware applied) |
| 403 | RBAC denial |
| 404 | Ticket or policy not found |
| 409 | Duplicate policy scope |
