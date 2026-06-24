# Phase 7.4 — Communication & Activity Tracking Engine

## Summary

Unified communication history and activity timeline for ETMS tickets. Fully feature-flagged and additive — does **not** modify `ticket_comments`, `ticket_activities`, ticketing services, Phase 7.1–7.3 modules, or existing dashboard logic beyond one optional widget import.

---

## Architecture

```
ENABLE_COMMUNICATION_TRACKING / VITE_ENABLE_COMMUNICATION_TRACKING
                    │
    ┌───────────────┴───────────────┐
    ▼                               ▼
backend/src/modules/          frontend/src/modules/
communication-tracking/       communication-tracking/
    │                               │
    ├─ POST /api/communications/comment     ├─ /app/communications
    ├─ POST /api/communications/chat          ├─ /app/activity-timeline
    ├─ POST /api/communications/email         ├─ /app/communication-analytics
    ├─ POST /api/communications/call-log      ├─ Ticket detail tabs (Communication, Activity Timeline)
    ├─ GET  .../ticket/:ticketId              └─ Dashboard widgets (feature-flagged)
    ├─ GET  .../timeline/:ticketId
    └─ GET  .../analytics
```

---

## Database (new tables only)

| Table | Purpose |
|-------|---------|
| `ticket_communications` | Unified comment/chat/email/call/meeting/system note store |
| `ticket_call_logs` | Structured phone call records |
| `ticket_email_logs` | Structured email records |
| `ticket_activity_timeline` | Phase 7.4 audit timeline events |

**Apply:** `backend/database/ticket_communication_phase7_4.sql`  
**Rollback:** `backend/database/ticket_communication_phase7_4_rollback.sql`

---

## Feature flags

| Layer | Variable | Default |
|-------|----------|---------|
| Backend | `ENABLE_COMMUNICATION_TRACKING=true` | `false` |
| Frontend | `VITE_ENABLE_COMMUNICATION_TRACKING=true` | `false` |

When flags are **off**, routes return 503 and UI components render `null` — ETMS behaves unchanged.

---

## Integrations (read-only)

| Module | Source | Timeline events |
|--------|--------|-----------------|
| Phase 7.2 Assignment | `ticket_assignment_history` | `ASSIGNED`, `REASSIGNED` |
| Phase 7.1 Feedback | `ticket_feedback` | `FEEDBACK_SUBMITTED` |
| Phase 7.3 SLA (when deployed) | `ticket_sla_escalation_events` | `SLA_WARNING`, `ESCALATION` |

No writes to upstream modules. Integrated events are marked `integrated: true` in API responses.

---

## Ticket detail (additive tabs)

| Tab label | Tab value | Component |
|-----------|-----------|-----------|
| Communication | `communications` | Forms + `CommunicationPanel` |
| Activity Timeline | `activity-timeline` | `ActivityTimeline` (Phase 7.4 engine) |

Existing **Timeline** tab (`ticket_activities`) is unchanged.

---

## Test coverage

| Suite | Count | Status |
|-------|-------|--------|
| Phase 7.4 backend | 66 | Pass |
| Phase 7.4 frontend | 36 | Pass |
| Regression (ticketing, 7.1, 7.2) | 185 | Pass |
| Production build | — | Pass |

---

## Enable locally

```bash
# backend/.env
ENABLE_COMMUNICATION_TRACKING=true

# frontend/.env
VITE_ENABLE_COMMUNICATION_TRACKING=true
```

Apply SQL migration against Supabase/PostgreSQL before enabling in production.
