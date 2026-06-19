# Phase 7.8 — API Reference

Base: `/api/notification-center` | Auth required | Flag: `ENABLE_NOTIFICATION_CENTER=true`

## Notifications

### GET /my-notifications
Query: `status` (read|unread|all), `priority`, `source_module`, `search`, `limit`, `offset`

Returns user's notifications. Triggers read-only event sync from source tables before listing.

### GET /unread-count
Returns `{ count: number }`. Syncs events first.

### PUT /mark-read/:id
Marks single notification read (owner only).

### PUT /mark-all-read
Marks all user notifications read.

## Preferences

### GET /preferences
Returns user preferences; creates defaults if none exist.

### PUT /preferences
Body: `{ email_enabled?, in_app_enabled?, sms_enabled?, push_enabled? }`

## Analytics

### GET /analytics
**RBAC:** MANAGER, HR, ADMIN, SUPER_ADMIN

Returns: total, unread, readPct, deliveryPct, byModule[], byPriority[]

Manager scope: department employees when `departmentId` available on user.

## Templates (Admin)

### GET /templates
**RBAC:** ADMIN, SUPER_ADMIN

### POST /templates
Body: `{ code, name, type, subject, message_template, is_active? }`

### PUT /templates/:id
Partial update.

### DELETE /templates/:id

## Error Codes

| Code | Condition |
|------|-----------|
| 401 | Missing employee profile |
| 403 | Insufficient role |
| 404 | Notification/template not found |
| 503 | Feature flag disabled |
