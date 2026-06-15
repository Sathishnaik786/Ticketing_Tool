# ETMS UAT Checklist — Phase 6.5

**Environment:** Staging with `ENABLE_TICKETING=true` and `VITE_ENABLE_TICKETING=true`

---

## Prerequisites

- [ ] Category seed script applied
- [ ] `ticket-attachments` Supabase bucket exists
- [ ] Test users: EMPLOYEE, MANAGER, HR, ADMIN

---

## EMPLOYEE Scenarios

| # | Scenario | Expected | Actual | Pass/Fail |
|---|----------|----------|--------|-----------|
| E1 | Create ticket with category + department | Ticket created, redirect to detail | | |
| E2 | View own ticket in list | Ticket visible | | |
| E3 | Add public comment | Comment appears | | |
| E4 | Upload PDF attachment (<4MB) | Attachment listed, download works | | |
| E5 | Cannot see internal comments | Internal comments hidden | | |
| E6 | Receive notification on status change | Notification in bell | | |

---

## MANAGER Scenarios

| # | Scenario | Expected | Actual | Pass/Fail |
|---|----------|----------|--------|-----------|
| M1 | View department tickets | Scoped list returned | | |
| M2 | Assign ticket to employee | Assignee updated, notification sent | | |
| M3 | Reassign ticket | History updated, notification sent | | |
| M4 | Add internal comment | Visible to staff only | | |

---

## HR Scenarios

| # | Scenario | Expected | Actual | Pass/Fail |
|---|----------|----------|--------|-----------|
| H1 | View all tickets | Full list accessible | | |
| H2 | View SLA tab | SLA data displayed | | |
| H3 | Close ticket | Status CLOSED, notification sent | | |

---

## ADMIN Scenarios

| # | Scenario | Expected | Actual | Pass/Fail |
|---|----------|----------|--------|-----------|
| A1 | Full ticket lifecycle | Create → assign → resolve → close | | |
| A2 | Reopen closed ticket | Status REOPENED | | |
| A3 | Feature flag off | No sidebar/routes/API 503 | | |

---

## Accessibility Spot Checks

| # | Check | Pass/Fail |
|---|-------|-----------|
| AC1 | Keyboard navigate create form | |
| AC2 | Screen reader announces form errors | |
| AC3 | Table caption/headers present | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| QA Lead | | | |
| Engineering | | | |
