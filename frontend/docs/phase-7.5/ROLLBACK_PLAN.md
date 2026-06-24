# Phase 7.5 — Rollback Plan

## Level 1: Feature Flag (Instant, No Data Loss)

1. Set `ENABLE_APPROVAL_ENGINE=false` on Render
2. Set `VITE_ENABLE_APPROVAL_ENGINE=false` on Netlify
3. Redeploy both services

**Effect:** Routes, APIs, nav, and ticket tab hidden. ETMS unchanged. Data preserved.

## Level 2: Code Rollback

Remove or revert Phase 7.5 commits. Integration hooks are isolated:
- `app.js` conditional block
- `features.ts` flag
- `App.tsx` / `AppLayout.tsx` spreads
- `TicketDetailPage.tsx` tab imports

No existing module logic depends on approval engine.

## Level 3: Database Rollback

Run in Supabase (staging first):

```sql
-- backend/database/approval_engine_phase7_5_rollback.sql
```

Drops:
- approval_history
- ticket_approvals
- approval_workflow_steps
- approval_workflows
- service_catalog_items
- service_catalogs

**Warning:** Destroys all approval and catalog data.

## Verification Checklist

- [ ] `/api/approvals/*` returns 503 or route not mounted
- [ ] Frontend nav has no Approvals section
- [ ] Ticket detail has no Approval Workflow tab
- [ ] Phase 7.1–7.4 tests pass
- [ ] Ticketing and auth tests pass
- [ ] Production build succeeds

## Recovery

Re-enable flags and re-run `approval_engine_phase7_5.sql` if tables were dropped.
