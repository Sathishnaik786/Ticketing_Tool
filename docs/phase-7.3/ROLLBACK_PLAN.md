# Phase 7.3 Rollback Plan

## Level 1 — Immediate disable (no deploy)

1. Set `ENABLE_SLA_ENGINE=false` in backend `.env`
2. Set `VITE_ENABLE_SLA_ENGINE=false` in frontend `.env`
3. Restart backend (stops `sla-monitor.job.js`)
4. Rebuild/redeploy frontend

**Effect:**

- No `/api/sla` routes
- No scheduler runs
- No SLA Engine UI
- Legacy ETMS SLA tab (`GET /api/tickets/:id/sla`) continues unchanged
- Phase 7.1 / 7.2 unaffected

---

## Level 2 — Database rollback

Run in Supabase SQL editor:

```sql
-- backend/database/ticket_sla_phase7_3_rollback.sql
```

Drops (in order):

1. `ticket_sla_escalation_events`
2. `ticket_sla`
3. `sla_policies`
4. `department_business_unit_map`
5. `business_units`

**Does NOT drop:**

- `ticket_sla_rules` (Phase 1)
- `ticket_escalations` (Phase 1)
- `tickets.sla_*` columns
- Any EMS / ticketing / assignment / feedback tables

---

## Level 3 — Code removal

Delete modules:

- `backend/src/modules/sla-management/`
- `frontend/src/modules/sla-management/`
- `docs/phase-7.3/` (optional)

Revert additive integration lines in:

- `backend/src/app.js` (mount + job start)
- `backend/.env.example`
- `frontend/src/App.tsx` (route spread)
- `frontend/src/components/layout/AppLayout.tsx` (nav spread)
- `frontend/src/config/features.ts`
- `frontend/.env.example`
- `frontend/src/modules/ticketing/pages/TicketDetailPage.tsx` (SlaEngineTab slot only)

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Orphan notifications with SLA types | Low | Notifications remain readable; types are strings |
| ticket_sla rows after rollback | N/A | Table dropped |
| Legacy SLA confusion (two tabs) | Low | Engine tab hidden when flag OFF |
| Scheduler runs after disable | Medium | `job.stop()` on shutdown + flag check inside tick |

---

## Recovery

Re-enable flags and re-run migration. Monitor will backfill `ticket_sla` for open tickets within one 5-minute cycle.
