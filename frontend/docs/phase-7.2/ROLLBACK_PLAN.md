# Phase 7.2 Rollback Plan

## Immediate disable (no code deploy)

1. Set `ENABLE_TICKET_ASSIGNMENTS=false` in backend `.env`
2. Set `VITE_ENABLE_TICKET_ASSIGNMENTS=false` in frontend `.env`
3. Restart backend and redeploy/rebuild frontend

**Effect:** All assignment module routes return 503; frontend hides queues, nav, and assignment drawer. Existing ETMS `/api/tickets/:id/assign` endpoints remain unchanged (still gated by `ENABLE_TICKETING` only).

---

## Database rollback (optional)

```sql
-- Run in Supabase SQL editor
\i backend/database/ticket_assignment_phase7_2_rollback.sql
```

Drops only `ticket_assignment_history`. Does **not** touch `ticket_assignments` or `tickets`.

---

## Code removal (if needed)

Delete additive module directories:

- `backend/src/modules/ticket-assignment/`
- `frontend/src/modules/ticket-assignment/`
- `docs/phase-7.2/`

Remove integration lines from:

- `backend/src/app.js` (conditional mount block)
- `frontend/src/App.tsx` (route spread)
- `frontend/src/components/layout/AppLayout.tsx` (nav spread)
- `frontend/src/modules/ticketing/pages/TicketDetailPage.tsx` (AssignmentActions import)

Revert env examples and `features.ts` flag export.

---

## Risk

Rollback is low-risk: no existing table alterations, no auth/RBAC core changes, no dashboard modifications.
