# Phase 7.4 — UAT Checklist

## Prerequisites

- [ ] SQL migration applied: `ticket_communication_phase7_4.sql`
- [ ] `ENABLE_COMMUNICATION_TRACKING=true` (backend)
- [ ] `VITE_ENABLE_COMMUNICATION_TRACKING=true` (frontend)
- [ ] Test users: Employee, Manager, HR, Admin

---

## Communication logging

- [ ] Employee adds comment on own ticket via ticket detail Communication tab
- [ ] Agent logs phone call with outcome and duration
- [ ] Agent logs outbound email (SENT)
- [ ] Agent logs received email (RECEIVED)
- [ ] Internal note visible with INTERNAL badge
- [ ] Chat message appears in communication history

---

## Communication panel

- [ ] GET `/api/communications/ticket/:id` returns communications, call logs, email logs
- [ ] Communication tab lists all types chronologically
- [ ] Unauthorized user receives 403 on another user's ticket

---

## Activity timeline

- [ ] New comment creates `COMMENT_ADDED` event
- [ ] Call log creates `CALL_LOGGED` event
- [ ] Assignment history appears as integrated ASSIGNED/REASSIGNED (Phase 7.2)
- [ ] Feedback appears as integrated FEEDBACK_SUBMITTED (Phase 7.1, closed tickets)
- [ ] Activity Timeline tab distinct from existing Timeline tab

---

## Pages

- [ ] `/app/communications` — browse/log by ticket ID
- [ ] `/app/activity-timeline` — view unified timeline
- [ ] `/app/communication-analytics` — metrics dashboard

---

## Analytics

- [ ] Total communications count accurate
- [ ] Calls logged count accurate
- [ ] Emails sent count accurate
- [ ] Comments added count accurate
- [ ] Department breakdown visible for Manager/Admin

---

## Dashboard widgets

- [ ] Employee: Recent Communications widget
- [ ] Manager: Department Communications widget
- [ ] Admin/HR: Enterprise Communications widget
- [ ] Widgets hidden when flag OFF

---

## RBAC

- [ ] Employee cannot access unrelated ticket communications
- [ ] Manager sees department scope only
- [ ] HR/Admin see enterprise scope

---

## Zero regression

- [ ] Existing Comments tab unchanged
- [ ] Existing Timeline tab unchanged
- [ ] Ticket creation/update flows unchanged
- [ ] Phase 7.1 feedback unchanged
- [ ] Phase 7.2 assignment unchanged
- [ ] Feature flag OFF = no nav, no tabs, no API access

---

## Rollback drill

- [ ] Disable flags → ETMS unchanged
- [ ] Rollback SQL executes without error
