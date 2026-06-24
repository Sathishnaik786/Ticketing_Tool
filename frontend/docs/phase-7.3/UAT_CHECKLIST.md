# Phase 7.3 UAT Checklist

## Prerequisites

- [ ] `ticketing_phase1.sql` applied
- [ ] `ticket_sla_phase7_3.sql` applied
- [ ] `ENABLE_TICKETING=true`, `ENABLE_SLA_ENGINE=true`
- [ ] `VITE_ENABLE_TICKETING=true`, `VITE_ENABLE_SLA_ENGINE=true`
- [ ] Test users: employee, manager, hr, admin @etms.com

---

## Feature Flag OFF Verification

- [ ] With `ENABLE_SLA_ENGINE=false`: no `/api/sla` routes (404)
- [ ] No SLA Engine tab on ticket detail
- [ ] No Work Queues / SLA nav items from sla-management
- [ ] No scheduler logs in backend
- [ ] Legacy SLA tab still works (unchanged)
- [ ] Ticket create / assign / close / feedback unchanged

---

## Policy Management (Admin)

- [ ] Create global CRITICAL policy (15m / 4h)
- [ ] Create department-scoped MEDIUM policy
- [ ] Create business-unit-scoped policy
- [ ] Deactivate policy → not used for new ticket_sla rows
- [ ] Non-admin cannot POST/PUT/DELETE policies (403)

---

## SLA Runtime

- [ ] Create ticket → within 5 min, `ticket_sla` row appears
- [ ] Response/resolution due dates match policy
- [ ] First public agent comment sets `first_response_at`
- [ ] Resolve/close ticket sets `resolved_at`
- [ ] Employee sees SLA Engine tab on own ticket
- [ ] Employee cannot see org SLA dashboard

---

## Escalation Engine

- [ ] Simulate ticket approaching 75% → SLA_WARNING notification
- [ ] At 90% → manager notification + escalation event row
- [ ] At 100% → breach flags + HR/Admin notification
- [ ] Duplicate run does not duplicate events (idempotency)
- [ ] Ticket status/assignee NOT auto-changed by engine

---

## Dashboards

- [ ] `/app/sla-dashboard` — Active, Approaching, Breached, Compliance %
- [ ] `/app/escalations` — open/closed counts, by department, by priority
- [ ] Manager sees department-scoped data only
- [ ] HR/Admin sees enterprise data

---

## Analytics

- [ ] Enterprise SLA %
- [ ] Department SLA %
- [ ] Business Unit SLA % (when mapping seeded)
- [ ] Average resolution time
- [ ] Escalation trend chart data
- [ ] Priority analysis breakdown

---

## RBAC

- [ ] Employee: my SLA + own ticket panel only
- [ ] Manager: dept dashboard + escalations
- [ ] HR: all metrics
- [ ] Admin: policy CRUD + all metrics

---

## Regression

- [ ] Phase 7.1 feedback submit/view still works
- [ ] Phase 7.2 assign/reassign/queues still work
- [ ] Existing notifications (ticket assigned, etc.) unchanged
- [ ] Auth login / role dashboards unchanged

---

## Rollback Drill

- [ ] Disable flags → verify zero SLA engine behavior
- [ ] Run rollback SQL in staging → verify Phase 1 tables intact
