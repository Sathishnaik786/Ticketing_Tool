# Phase 7.8 — UAT Checklist

## Setup

- [ ] Apply `notification_center_phase7_8.sql`
- [ ] Enable `ENABLE_NOTIFICATION_CENTER=true` / `VITE_ENABLE_NOTIFICATION_CENTER=true`
- [ ] Redeploy

## Feature Flag OFF

- [ ] `/api/notification-center/my-notifications` returns 503
- [ ] No Notifications nav
- [ ] No UnreadBadge in header
- [ ] Existing NotificationBell unchanged

## Notification Center

- [ ] `/app/notifications` loads
- [ ] Filters: unread/read, priority, module, search
- [ ] Mark read / mark all read
- [ ] Preferences form toggles save

## Event Sync (Read-Only)

- [ ] Ticket timeline activity creates center events
- [ ] Approval status changes appear
- [ ] Knowledge publish events appear
- [ ] Report generated events appear
- [ ] No duplicate events on refresh (dedup)

## Analytics (Manager+)

- [ ] `/app/notification-analytics` loads for Manager
- [ ] Widgets: total, unread, read %, delivery %, by module, by priority
- [ ] Employee denied analytics API (403)

## Templates (Admin)

- [ ] List/create/update/delete templates

## Regression

- [ ] Ticketing, feedback, assignment, SLA, communications, approvals, knowledge, analytics unchanged
- [ ] Existing `/api/notifications` bell works

## Rollback Drill

- [ ] Disable flags → module hidden
- [ ] Optional SQL rollback → tables dropped cleanly
