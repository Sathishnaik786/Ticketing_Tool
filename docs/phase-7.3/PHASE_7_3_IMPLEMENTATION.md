# Phase 7.3 — SLA Management & Escalation Engine

## Status: Architecture Review (Pre-Implementation)

**No code has been written.** This document is the approved blueprint for implementation after architecture review.

---

## 1. Executive Summary

Phase 7.3 adds an enterprise SLA tracking, compliance monitoring, and escalation engine for ETMS. It must integrate with existing Ticketing, Assignments (7.2), Feedback (7.1), Notifications, and RBAC **without modifying any of them**.

The codebase already contains **Phase 1 SLA foundations**:

| Asset | Location | Phase 7.3 relationship |
|-------|----------|------------------------|
| `ticket_sla_rules` | `ticketing_phase1.sql` | Legacy policy store — **leave untouched** |
| `tickets.sla_*` columns | `ticketing_phase1.sql` | Legacy runtime fields — **leave untouched** |
| `ticket_escalations` | `ticketing_phase1.sql` | Legacy workflow table (unused by app) — **leave untouched** |
| `sla.service.js` | `modules/ticketing/` | Legacy due-date calc — **do not modify** |
| `GET /api/tickets/:id/sla` | ticketing routes | Legacy read API — **do not modify** |
| `TicketSlaCard` | frontend ticketing | Legacy SLA tab — **do not modify** |

Phase 7.3 introduces **parallel** tables, APIs, UI, and a background monitor under `ENABLE_SLA_ENGINE`.

---

## 2. Architecture Review — Critical Findings

### 2.1 Table name collision (BLOCKER)

**`ticket_escalations` already exists** in `ticketing_phase1.sql` with a different schema:

- Phase 1: `escalated_from`, `escalated_to`, `status` (PENDING/ACKNOWLEDGED/RESOLVED), `sla_rule_id`
- Phase 7.3 spec: `escalation_type`, `triggered_by_system`, `assigned_to_employee_id`, immutable audit

**Resolution:** Create **`ticket_sla_escalation_events`** (recommended name) instead of reusing `ticket_escalations`. Rollback script drops only Phase 7.3 tables.

### 2.2 Dual SLA runtime tracking

Tickets already receive `sla_response_due_at` / `sla_resolution_due_at` on create via `ticket.service.js` → `sla.service.js`.

**Resolution:** Phase 7.3 engine writes **only** to `ticket_sla`. It does **not** read or write `tickets.sla_*`. When flag is OFF, legacy behavior unchanged. When ON, new dashboards/monitor use `ticket_sla` as source of truth.

### 2.3 Event-driven ticket hook without changing ticket creation

**Resolution:** `sla-monitor.job.js` (every 5 minutes):

1. Finds `tickets` with no matching `ticket_sla` row → creates row + computes due dates from `sla_policies`
2. Evaluates active `ticket_sla` rows for threshold breaches / escalations
3. Updates `first_response_at` by scanning new `ticket_comments` (first non-requester public comment)
4. Updates `resolved_at` when ticket status ∈ `{RESOLVED, CLOSED}`

Eventual consistency: ≤5 minutes after ticket create. Acceptable per enterprise batch SLA monitors.

**Alternative (future):** Postgres `AFTER INSERT` trigger on `tickets` — rejected for v1 to avoid DB-side coupling and keep rollback simple.

### 2.4 Business units (Aparna Enterprises)

No `business_units` entity exists. Departments are flat under EMS.

**Resolution:** Add **`business_units`** table (Phase 7.3 only). Seed the nine Aparna entities. Link policies via `sla_policies.business_unit_id`. Optional **`department_business_unit_map`** join table (department_id, business_unit_id) for executive rollups — avoids ALTER on `departments`.

### 2.5 Notifications

Existing `ChatService.createNotification(userId, type, title, message, link, sourceId)` supports arbitrary `type` strings.

**Resolution:** New **`sla-notification.service.js`** inside `sla-management` module calls `ChatService.createNotification` with types:

- `SLA_WARNING`
- `SLA_BREACH`
- `ESCALATION_CREATED`
- `ESCALATION_RESOLVED`

Do **not** modify `ticketing/notification.service.js`.

### 2.6 Escalation semantics — no ticket mutation

Per spec: escalation engine records audit rows and sends notifications. It does **not**:

- Change ticket status
- Reassign tickets (Phase 7.2 remains the assignment authority)
- Update `tickets.sla_*` breach flags

At 90%/100%, notifications go to Manager / HR / Admin respectively. Optional `assigned_to_employee_id` on escalation event is **informational** (suggested owner), not an assignment.

### 2.7 Frontend coexistence

Ticket detail already has an **SLA tab** (`TicketSlaCard` → legacy API).

**Resolution:** Add separate **"SLA Engine" tab** (flag-gated) via `SlaEnginePanel.tsx` — same pattern as Phase 7.1 Feedback tab. Existing SLA tab unchanged.

### 2.8 SUPER_ADMIN

Exists in EMS/payroll contexts but not in `ticketing.types.js`.

**Resolution:** Treat `SUPER_ADMIN` same as `ADMIN` in sla-management RBAC (module-local check, no change to core RBAC).

---

## 3. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  ENABLE_SLA_ENGINE=true  │  VITE_ENABLE_SLA_ENGINE=true          │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│ sla-management/     │               │ sla-management/     │
│ (backend module)    │               │ (frontend module)   │
│                     │               │                     │
│ sla-monitor.job.js  │◄──5 min──────│ /app/sla-dashboard  │
│ sla-escalation.svc  │               │ /app/escalations    │
│ sla-policy.svc      │               │ SlaEnginePanel      │
│ ticket-sla.svc      │               └─────────────────────┘
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ NEW TABLES ONLY                                                  │
│ business_units │ sla_policies │ ticket_sla │ ticket_sla_escalation_events │
└─────────────────────────────────────────────────────────────────┘
          │ reads (no writes)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ EXISTING (read-only for engine)                                  │
│ tickets │ ticket_comments │ employees │ departments │ notifications │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Phases

### Phase A — Database (Day 1)

1. `backend/database/ticket_sla_phase7_3.sql`
2. `backend/database/ticket_sla_phase7_3_rollback.sql`
3. Seed `business_units` (9 Aparna entities)
4. Seed default `sla_policies` (LOW/MEDIUM/HIGH/CRITICAL defaults from spec)
5. Optional: `department_business_unit_map` seed for pilot departments

**Deliverable:** Migration applied in Supabase; rollback verified in staging.

### Phase B — Backend Core (Days 2–4)

Module: `backend/src/modules/sla-management/`

| File | Responsibility |
|------|----------------|
| `middleware/sla-engine-feature-flag.middleware.js` | 503 when flag off |
| `sla-policy.repository.js` | CRUD + policy resolution cascade |
| `ticket-sla.repository.js` | Runtime SLA rows |
| `escalation.repository.js` | Immutable escalation events |
| `sla-policy.service.js` | Admin policy CRUD + validation |
| `ticket-sla.service.js` | Timer math, compliance %, my/ticket views |
| `sla-escalation.service.js` | 75/90/100% rules, idempotent events |
| `sla-notification.service.js` | Wraps `ChatService.createNotification` |
| `sla-monitor.job.js` | 5-min scheduler: backfill, evaluate, notify |
| `sla-management.controller.js` | HTTP handlers |
| `sla-management.routes.js` | Route registration |
| `sla-management.validation.js` | Zod schemas |

**Mount** in `app.js` (additive only):

```javascript
if (process.env.ENABLE_SLA_ENGINE === 'true') {
  app.use('/api/sla', ..., require('./modules/sla-management/sla-management.routes'));
  slaMonitorJob.start(5 * 60 * 1000);
}
```

On server shutdown / flag disable: `slaMonitorJob.stop()`.

### Phase C — Backend Tests (Day 5)

Target **50+** tests across:

- `sla-policy.service.test.js`
- `ticket-sla.service.test.js`
- `sla-escalation.service.test.js`
- `sla-monitor.job.test.js`
- `sla-management.validation.test.js`
- `sla-management.rbac.test.js`
- `sla-management.controller.test.js`

Regression: run ticketing (39), assignment (49), feedback (34), auth (13) with flag OFF.

### Phase D — Frontend (Days 6–8)

Module: `frontend/src/modules/sla-management/`

| Area | Files |
|------|-------|
| Config | `features.ts` → `isSlaEngineEnabled` |
| API | `slaManagementService.ts` |
| Hooks | `useSlaManagement.ts` |
| Pages | `SlaDashboardPage.tsx`, `EscalationsPage.tsx`, `SlaAnalyticsPage.tsx` |
| Components | `SlaTimerCard.tsx`, `SlaEnginePanel.tsx`, `EscalationHistoryList.tsx`, dashboard widgets |
| Routes | `sla-management.routes.tsx` |
| Nav | `sla-management.nav.ts` |
| Ticket detail | `SlaEngineTab.tsx` (additive slot in `TicketDetailPage.tsx`) |

**Do not modify:** `Dashboard.tsx`, `TicketSlaCard.tsx`, `useSla`, existing notification bell logic.

### Phase E — Frontend Tests (Day 9)

Target **25+** tests: feature flags, dashboards, SLA panel, RBAC visibility, service guards.

### Phase F — Documentation & UAT (Day 10)

Complete all docs in `docs/phase-7.3/`. Execute UAT checklist.

---

## 5. Policy Resolution Cascade

When creating `ticket_sla` for a ticket, resolve `sla_policies` in order (first match wins):

1. `business_unit_id` + `department_id` + `category_id` + `priority`
2. `business_unit_id` + `department_id` + `priority`
3. `department_id` + `category_id` + `priority`
4. `department_id` + `priority`
5. `category_id` + `priority`
6. Global (`business_unit_id`, `department_id`, `category_id` all null) + `priority`

Mirror logic from existing `sla.service.js` with added business unit dimension.

---

## 6. Escalation Threshold Engine

For each active `ticket_sla` where ticket status ∉ `{RESOLVED, CLOSED, CANCELLED}`:

| Consumed % | Action | Escalation level | Notify |
|------------|--------|------------------|--------|
| ≥ 75% response or resolution window | Warning | 1 | Assignee + Requester |
| ≥ 90% | Manager escalation | 2 | Department Manager |
| ≥ 100% (breach) | HR/Admin escalation | 3 | HR + Admin roles |

**Consumed %** = `(now - ticket.created_at) / (due_at - ticket.created_at) × 100` per timer type.

**Idempotency:** Unique constraint on `(ticket_id, escalation_level, escalation_type, date_trunc('hour', triggered_at))` or track last-fired level in `ticket_sla` metadata columns (`last_warning_at`, etc.) to prevent duplicate notifications within a cycle.

---

## 7. Integration Matrix (Read-Only)

| Module | Integration |
|--------|-------------|
| Ticketing | Read `tickets`, `ticket_comments`; no writes to ticket tables |
| Assignment (7.2) | None required v1 (escalation is notify-only) |
| Feedback (7.1) | None |
| Notifications | Write via `ChatService.createNotification` only |
| Auth/RBAC | Use existing `auth.middleware`; module-local role checks |
| Departments | Read `departments`, optional `department_business_unit_map` |

---

## 8. Feature Flag Behavior

| Flag state | Backend | Frontend | Scheduler |
|------------|---------|----------|-----------|
| OFF (default) | Routes not mounted; job not started | No routes/nav/panel | Stopped |
| ON | Full `/api/sla/*` + job every 5 min | Dashboards + SLA Engine tab | Running |

Strict comparison: `=== 'true'` (matches Phase 7.1/7.2).

---

## 9. Success Criteria Checklist

- [ ] Existing ETMS ticket create/assign/close unchanged with flag OFF
- [ ] Phase 7.1 feedback unchanged
- [ ] Phase 7.2 assignment unchanged
- [ ] Legacy `GET /api/tickets/:id/sla` unchanged
- [ ] Configurable `sla_policies` CRUD (Admin)
- [ ] `ticket_sla` rows created for new tickets (≤5 min lag)
- [ ] Escalation events immutable in `ticket_sla_escalation_events`
- [ ] SLA + Escalation dashboards functional
- [ ] RBAC enforced per matrix
- [ ] 50+ backend / 25+ frontend tests pass
- [ ] Production build passes
- [ ] Rollback script verified

---

## 10. Open Decisions (Confirm Before Coding)

| # | Decision | Recommendation |
|---|----------|----------------|
| 1 | Escalation table name | `ticket_sla_escalation_events` |
| 2 | Business unit ↔ department mapping | Join table `department_business_unit_map` |
| 3 | First response detection | First public comment by non-requester employee |
| 4 | Auto-assignment on escalation | **No** (notify-only v1) |
| 5 | Duplicate SLA tab vs replace | **Separate "SLA Engine" tab** |
| 6 | Copy legacy `ticket_sla_rules` into `sla_policies` | One-time seed script in migration |

---

## 11. Related Documents

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_REFERENCE.md](./API_REFERENCE.md)
- [RBAC_MATRIX.md](./RBAC_MATRIX.md)
- [TEST_REPORT.md](./TEST_REPORT.md) — populated post-implementation
- [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md)
- [UAT_CHECKLIST.md](./UAT_CHECKLIST.md)

---

## 12. Approval Gate

**Implementation may begin only after:**

1. Stakeholder confirms escalation table rename (`ticket_sla_escalation_events`)
2. Aparna business unit → department mapping confirmed (or pilot subset)
3. Notify-only escalation (no auto-reassign) accepted for v1
4. 5-minute monitor latency accepted for ticket_sla backfill
