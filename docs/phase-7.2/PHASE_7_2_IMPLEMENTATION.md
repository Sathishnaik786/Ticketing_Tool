# Phase 7.2 — Ticket Assignment & Work Queue Management

## Summary

Enterprise assignment and work queue module, fully feature-flagged and additive. Uses the **existing** `ticket_assignments` table from ETMS Phase 1 and adds a new `ticket_assignment_history` audit table.

---

## Architecture

```
ENABLE_TICKET_ASSIGNMENTS / VITE_ENABLE_TICKET_ASSIGNMENTS
                    │
    ┌───────────────┴───────────────┐
    ▼                               ▼
backend/src/modules/          frontend/src/modules/
ticket-assignment/            ticket-assignment/
    │                               │
    ├─ POST /api/ticket-assignments ├─ /app/my-queue
    ├─ PUT  .../:ticketId/reassign  ├─ /app/team-queue
    ├─ GET  .../my-queue            ├─ /app/assignment-analytics
    ├─ GET  .../team-queue          └─ Assignment Drawer (ticket detail)
    ├─ GET  .../unassigned
    └─ GET  .../analytics
```

**Not modified:** EMS core, ETMS ticket creation, auth, RBAC core, dashboards, Phase 7.1 feedback, existing ticketing routes.

---

## Database

| Table | Status |
|-------|--------|
| `ticket_assignments` | **Pre-existing** (ticketing_phase1.sql) — not altered |
| `ticket_assignment_history` | **New** (ticket_assignment_phase7_2.sql) |

### ticket_assignment_history

| Column | Type |
|--------|------|
| id | UUID PK |
| ticket_id | UUID FK → tickets |
| old_assignee | UUID FK → employees (nullable) |
| new_assignee | UUID FK → employees (nullable) |
| changed_by | UUID FK → employees |
| reason | TEXT |
| changed_at | TIMESTAMPTZ |

**Apply:** `backend/database/ticket_assignment_phase7_2.sql`  
**Rollback:** `backend/database/ticket_assignment_phase7_2_rollback.sql`

---

## API Endpoints

Base: `/api/ticket-assignments` (when `ENABLE_TICKET_ASSIGNMENTS=true`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Assign ticket |
| PUT | `/:ticketId/reassign` | Reassign ticket |
| GET | `/my-queue` | Current user's assigned tickets |
| GET | `/team-queue` | Department / org queue |
| GET | `/unassigned` | Unassigned tickets |
| GET | `/analytics` | Workload analytics |
| GET | `/history/:ticketId` | Assignment audit history |

### Assign body

```json
{
  "ticket_id": "uuid",
  "assigned_to": "uuid",
  "assignment_type": "MANUAL",
  "reason": "optional"
}
```

Assignment types `AUTO`, `ESCALATED`, `REASSIGNED` are mapped to existing DB enum values (`MANUAL`, `QUEUE`, etc.) without altering `ticket_assignments` constraints.

---

## RBAC

See [RBAC_MATRIX.md](./RBAC_MATRIX.md).

---

## Frontend Screens

| Screen | Path | Roles |
|--------|------|-------|
| My Queue | `/app/my-queue` | All |
| Team Queue | `/app/team-queue` | Manager, HR, Admin |
| Assignment Analytics | `/app/assignment-analytics` | Manager, HR, Admin |
| Assignment Drawer | Ticket detail header | Manager, HR, Admin |

Queue summary widgets are on queue pages (dashboard not modified per Phase 7.2 rules).

---

## Feature Flags

| Layer | Variable | Default |
|-------|----------|---------|
| Backend | `ENABLE_TICKET_ASSIGNMENTS` | `false` |
| Frontend | `VITE_ENABLE_TICKET_ASSIGNMENTS` | `false` |

---

## Test Results

See [TEST_REPORT.md](./TEST_REPORT.md).

---

## Rollback

See [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md).

---

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md).
