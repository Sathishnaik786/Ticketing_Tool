# Phase 7.4 — Rollback Plan

## 1. Disable feature flags (immediate)

```bash
# backend/.env
ENABLE_COMMUNICATION_TRACKING=false

# frontend/.env
VITE_ENABLE_COMMUNICATION_TRACKING=false
```

Redeploy backend and frontend. ETMS reverts to pre-7.4 behavior instantly.

---

## 2. Remove route mounts (optional code rollback)

Remove Phase 7.4 block from `backend/src/app.js`:

```javascript
if (process.env.ENABLE_COMMUNICATION_TRACKING === 'true') { ... }
```

Remove from `frontend/src/App.tsx`, `AppLayout.tsx`, `TicketDetailPage.tsx`, `Dashboard.tsx` (additive imports only).

---

## 3. Database rollback

**Warning:** Drops all Phase 7.4 communication and timeline data.

```bash
psql $DATABASE_URL -f backend/database/ticket_communication_phase7_4_rollback.sql
```

Drops (in order):
1. `ticket_activity_timeline`
2. `ticket_email_logs`
3. `ticket_call_logs`
4. `ticket_communications`

---

## 4. Verify post-rollback

- [ ] Existing Comments tab still works (`ticket_comments`)
- [ ] Existing Timeline tab still works (`ticket_activities`)
- [ ] Phase 7.1 feedback unaffected
- [ ] Phase 7.2 assignment unaffected
- [ ] No 503 errors on core ticketing routes
- [ ] Production build passes

---

## Data retention note

Phase 7.4 data is independent. Rollback does not affect `ticket_comments`, `ticket_activities`, or upstream phase tables.
