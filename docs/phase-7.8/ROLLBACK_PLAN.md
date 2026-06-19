# Phase 7.8 — Rollback Plan

## Level 1: Feature Flag (Instant — Recommended)

1. `ENABLE_NOTIFICATION_CENTER=false` on Render
2. `VITE_ENABLE_NOTIFICATION_CENTER=false` on Netlify
3. Redeploy

Effect: No routes, APIs, nav, UnreadBadge, or polling. Existing notification bell unchanged.

## Level 2: Code Rollback

Revert Phase 7.8 commits. Integration hooks isolated to:
- `app.js`, `features.ts`, `App.tsx`, `AppLayout.tsx` (nav + UnreadBadge only)
- `render.yaml`, `.env.example` files

No changes to ChatService, socket handlers, or existing notification routes.

## Level 3: Database

Run `backend/database/notification_center_phase7_8_rollback.sql`

Drops: `notification_delivery_log`, `notification_center_events`, `notification_preferences`, `notification_templates`

## Verification

- [ ] `/api/notification-center/*` returns 503 or unmounted
- [ ] No Notifications nav group
- [ ] No UnreadBadge in header
- [ ] Existing NotificationBell still works
- [ ] Phase 7.1–7.7 regression pass
