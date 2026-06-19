# Phase 7.6 — Rollback Plan

## Level 1: Feature Flag (Instant)

1. `ENABLE_KNOWLEDGE_BASE=false` on Render
2. `VITE_ENABLE_KNOWLEDGE_BASE=false` on Netlify
3. Redeploy

Effect: No routes, APIs, nav, ticket suggestions. Data preserved.

## Level 2: Code Rollback

Revert Phase 7.6 commits. Integration hooks isolated to:
- `app.js`, `features.ts`, `App.tsx`, `AppLayout.tsx`
- `TicketCreatePage.tsx` (suggestions panel import only)

## Level 3: Database

Run `backend/database/knowledge_base_phase7_6_rollback.sql`

## Verification

- [ ] `/api/knowledge/*` returns 503 or unmounted
- [ ] No Knowledge Base nav
- [ ] No suggestions on ticket create
- [ ] Phase 7.1–7.5 regression pass
