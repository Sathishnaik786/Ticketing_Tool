# ETMS Ticketing API — Sprint 3

Base URL: `/api/tickets`

All endpoints require:

1. `ENABLE_TICKETING=true` on the backend server
2. `Authorization: Bearer <JWT>` header

When ticketing is disabled, all endpoints return **503**:

```json
{
  "success": false,
  "message": "Ticketing module disabled"
}
```

When authentication is missing or invalid, EMS `authMiddleware` returns **401** before the controller runs.

---

## Route Registration (Manual Step)

Add to `backend/src/app.js` after other module routes:

```javascript
// ETMS Ticketing Module (Feature Flag: ENABLE_TICKETING)
if (process.env.ENABLE_TICKETING === 'true') {
  app.use('/api/tickets', generalLimiter, require('./modules/ticketing/ticketing.routes'));
}
```

Add to `backend/.env`:

```env
ENABLE_TICKETING=false
```

Set `ENABLE_TICKETING=true` only when ready to expose ticketing APIs.

---

## Rollback (Sprint 3)

1. Remove or comment out the `app.use('/api/tickets', ...)` block in `app.js`
2. Set `ENABLE_TICKETING=false` in environment
3. Optionally delete Sprint 3 files:
   - `ticketing.controller.js`
   - `ticketing.routes.js`
   - `middleware/ticketing-feature-flag.middleware.js`
   - `middleware/upload.middleware.js`
   - `API.md`
   - `tests/ticketing.controller.test.js`

Sprint 2 services remain intact and unreachable without route registration.

---

## Tickets

### Create Ticket

| | |
|---|---|
| **Endpoint** | `POST /api/tickets` |
| **Auth** | Required |
| **Roles** | ADMIN, HR, MANAGER, EMPLOYEE |

**Request:**

```json
{
  "title": "VPN not working",
  "description": "Unable to connect to corporate VPN from home network.",
  "department_id": "550e8400-e29b-41d4-a716-446655440020",
  "category_id": null,
  "subcategory_id": null,
  "priority": "MEDIUM"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "ticket_number": "TKT-2026-00001",
    "title": "VPN not working",
    "status": "OPEN",
    "priority": "MEDIUM"
  }
}
```

---

### List Tickets

| | |
|---|---|
| **Endpoint** | `GET /api/tickets` |
| **Auth** | Required |
| **Roles** | Scoped by service RBAC (own / department / all) |

**Query params:** `page`, `limit`, `status`, `priority`, `department_id`, `assignee_id`, `requester_id`, `search`, `sort_by`, `sort_order`

**Response (200):**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get Ticket by ID

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId` |
| **Auth** | Required |
| **Roles** | Requester, assignee, watcher, manager (dept), HR, ADMIN |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "ticket_number": "TKT-2026-00001",
    "title": "VPN not working",
    "status": "OPEN"
  }
}
```

---

### Update Ticket

| | |
|---|---|
| **Endpoint** | `PATCH /api/tickets/:ticketId` |
| **Auth** | Required |
| **Roles** | Owner, manager (dept), HR, ADMIN |

**Request:**

```json
{
  "title": "VPN not working - updated",
  "priority": "HIGH"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { }
}
```

---

### Change Status

| | |
|---|---|
| **Endpoint** | `PATCH /api/tickets/:ticketId/status` |
| **Auth** | Required |
| **Roles** | Assignee, manager (dept), HR, ADMIN; requester for limited transitions |

**Request:**

```json
{
  "status": "IN_PROGRESS",
  "resolution_notes": null
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "IN_PROGRESS"
  }
}
```

---

### Close Ticket

| | |
|---|---|
| **Endpoint** | `PATCH /api/tickets/:ticketId/close` |
| **Auth** | Required |
| **Roles** | Per service RBAC |

**Request:**

```json
{
  "resolution_notes": "Issue resolved after VPN client reinstall."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "CLOSED"
  }
}
```

---

### Reopen Ticket

| | |
|---|---|
| **Endpoint** | `PATCH /api/tickets/:ticketId/reopen` |
| **Auth** | Required |
| **Roles** | Per service RBAC |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "REOPENED"
  }
}
```

---

## Comments

### Create Comment

| | |
|---|---|
| **Endpoint** | `POST /api/tickets/:ticketId/comments` |
| **Auth** | Required |
| **Roles** | Users with ticket access; internal comments require manager/HR/admin |

**Request:**

```json
{
  "content": "Please restart your VPN client and try again.",
  "is_internal": false
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "comment-uuid",
    "content": "Please restart your VPN client and try again.",
    "is_internal": false
  }
}
```

---

### List Comments

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/comments` |
| **Auth** | Required |
| **Query** | `includeInternal=true` (managers/HR/admin only) |

**Response (200):**

```json
{
  "success": true,
  "data": []
}
```

---

## Attachments

### Upload Attachment

| | |
|---|---|
| **Endpoint** | `POST /api/tickets/:ticketId/attachments` |
| **Auth** | Required |
| **Content-Type** | `multipart/form-data` |
| **Field** | `file` |
| **Max size** | 4 MB |
| **Allowed MIME** | PDF, DOCX, XLSX, PNG, JPEG, ZIP |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "attachment-uuid",
    "file_name": "screenshot.png",
    "file_path": "tickets/{ticketId}/{uuid}-screenshot.png"
  }
}
```

---

### List Attachments

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/attachments` |
| **Auth** | Required |

**Response (200):**

```json
{
  "success": true,
  "data": []
}
```

---

### Get Signed URL

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/attachments/:attachmentId/url` |
| **Auth** | Required |
| **Query** | `expiresIn` (seconds, default 3600) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "attachment": { },
    "signed_url": "https://...",
    "expires_in": 3600
  }
}
```

---

## Assignments

### Assign Ticket

| | |
|---|---|
| **Endpoint** | `POST /api/tickets/:ticketId/assign` |
| **Auth** | Required |
| **Roles** | MANAGER (dept), HR, ADMIN |

**Request:**

```json
{
  "assignee_id": "550e8400-e29b-41d4-a716-446655440013",
  "assignment_type": "MANUAL",
  "notes": "Assign to L1 support"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "ticket": { "status": "ASSIGNED" },
    "assignment": { }
  }
}
```

---

### Reassign Ticket

| | |
|---|---|
| **Endpoint** | `POST /api/tickets/:ticketId/reassign` |
| **Auth** | Required |
| **Roles** | MANAGER (dept), HR, ADMIN |

**Request:** Same as assign.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "ticket": { },
    "assignment": { }
  }
}
```

---

### Assignment History

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/assignments` |
| **Auth** | Required |

**Response (200):**

```json
{
  "success": true,
  "data": []
}
```

---

## Watchers

### Add Watcher

| | |
|---|---|
| **Endpoint** | `POST /api/tickets/:ticketId/watchers` |
| **Auth** | Required |

**Request (optional — defaults to self):**

```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { }
}
```

---

### List Watchers

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/watchers` |
| **Auth** | Required |

**Response (200):**

```json
{
  "success": true,
  "data": []
}
```

---

### Remove Watcher

| | |
|---|---|
| **Endpoint** | `DELETE /api/tickets/:ticketId/watchers/:employeeId` |
| **Auth** | Required |

**Response (200):**

```json
{
  "success": true,
  "data": { }
}
```

---

## Timeline

### Get Activity Timeline

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/timeline` |
| **Auth** | Required |
| **Query** | `page`, `limit` |

**Response (200):**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "pages": 0
  }
}
```

---

## SLA

### Get SLA Details

| | |
|---|---|
| **Endpoint** | `GET /api/tickets/:ticketId/sla` |
| **Auth** | Required |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "priority": "MEDIUM",
    "sla_response_due_at": "2026-01-01T02:00:00.000Z",
    "sla_resolution_due_at": "2026-01-02T00:00:00.000Z",
    "sla_response_breached": false,
    "sla_resolution_breached": false,
    "applicable_rule": { },
    "calculated_due_dates": { }
  }
}
```

---

## Error Responses

Handled by global error middleware via `AppError`:

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Authentication required (auth middleware) |
| 403 | Forbidden (service RBAC) |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |
| 503 | Ticketing module disabled |

**Example (403):**

```json
{
  "success": false,
  "message": "Access denied"
}
```

**Example (400):**

```json
{
  "success": false,
  "message": "Create ticket validation failed",
  "details": [
    { "path": "title", "message": "String must contain at least 3 character(s)" }
  ]
}
```

---

## Middleware Stack

```text
ticketingFeatureFlag → authMiddleware → [uploadAttachment] → controller → service
```

Authorization is enforced in Sprint 2 services, not duplicated in controllers.
