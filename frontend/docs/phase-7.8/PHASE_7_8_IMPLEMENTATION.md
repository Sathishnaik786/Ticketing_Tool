# Phase 7.8 — Enterprise Notification & Alert Center

## Overview

Phase 7.8 adds an **additive, feature-flagged** Enterprise Notification & Alert Center — a parallel module that centralizes alerts from ticketing, SLA, approvals, communications, knowledge, and analytics **without modifying** existing notification infrastructure.

## Pre-Conditions Verified

- Phase 7.1–7.7 regression passing (442 tests baseline)
- Full regression with Phase 7.8: **504 backend tests pass**
- Production build passing
- Rollback scripts available

## Feature Flags

| Layer | Variable | Enable value |
|-------|----------|--------------|
| Backend | `ENABLE_NOTIFICATION_CENTER` | `true` |
| Frontend | `VITE_ENABLE_NOTIFICATION_CENTER` | `true` |

When OFF: no routes, APIs, pages, widgets, nav, polling, or websocket listeners. ETMS unchanged.

## Deliverables

### Database
- `backend/database/notification_center_phase7_8.sql`
- `backend/database/notification_center_phase7_8_rollback.sql`

### Backend
- `backend/src/modules/notification-center/`

### Frontend
- `frontend/src/modules/notification-center/`

### Integration hooks (minimal additive)
- `backend/src/app.js` — `/api/notification-center` mount
- `frontend/src/config/features.ts` — `isNotificationCenterEnabled`
- `frontend/src/App.tsx` — notification center routes
- `frontend/src/components/layout/AppLayout.tsx` — nav group + `UnreadBadge`

## Architecture

**Parallel module** — does NOT modify:
- Existing `notifications` table
- `ChatService` / `notification.service.js`
- Socket implementation
- Ticketing notification logic

**Event ingestion** — read-only sync from source tables:
- `ticket_activity_timeline` (ticketing, assignment, SLA, communication events)
- `ticket_approvals`, `ticket_feedback`, `knowledge_articles`, `analytics_reports`

Events deduplicated and stored in `notification_center_events` with delivery tracking in `notification_delivery_log`.

## Capabilities

1. **Notification Center** — unread/read filters, priority/module filters, search, mark read/all read
2. **User Preferences** — email, in-app, SMS, push toggles
3. **Notification Analytics** — total, unread, by module, by priority, read %, delivery %
4. **Template Management** — Admin CRUD for `notification_templates`
5. **Unread Badge** — header widget linking to `/app/notifications`

## Enable

```env
ENABLE_NOTIFICATION_CENTER=true
VITE_ENABLE_NOTIFICATION_CENTER=true
```

Apply SQL: `backend/database/notification_center_phase7_8.sql`

## Rollback

Set flags to `false`, redeploy, optionally run `notification_center_phase7_8_rollback.sql`.

See `ROLLBACK_PLAN.md`.
