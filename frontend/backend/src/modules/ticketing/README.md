# ETMS Ticketing Module — Sprint 2 (Backend Foundation)

Sprint 2 delivers the **service layer only** for the Enterprise Ticketing Management System (ETMS). No routes, controllers, or EMS modifications are included in this phase.

## Architecture

```text
(Sprint 3+) Route → Controller → Service → supabaseAdmin
(Sprint 2)           Service → supabaseAdmin
```

This module follows the same layering conventions as `backend/src/modules/updates/`:

- **Types** — constants, RBAC map, status machine
- **Validators** — Zod input schemas
- **Services** — business logic, RBAC enforcement, audit logging
- **Tests** — unit tests with mocked Supabase client

All database access uses **`supabaseAdmin` only**. RBAC is enforced in services, not delegated to RLS.

## Directory Structure

```text
backend/src/modules/ticketing/
├── ticketing.types.js
├── validators/
│   └── ticketing.validator.js
├── services/
│   ├── ticket.service.js
│   ├── comment.service.js
│   ├── attachment.service.js
│   ├── assignment.service.js
│   ├── watcher.service.js
│   ├── activity.service.js
│   ├── sla.service.js
│   ├── notification.service.js
│   └── ticket-access.helper.js
├── tests/
│   ├── helpers/mock-supabase.js
│   ├── ticket.service.test.js
│   ├── comment.service.test.js
│   ├── assignment.service.test.js
│   ├── watcher.service.test.js
│   ├── sla.service.test.js
│   └── validation.test.js
└── README.md
```

Supporting utility:

```text
backend/src/utils/app-error.js
```

## RBAC

Roles: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`

Permissions are centralized in `ticketing.types.js` (`PERMISSIONS` map). Services call `assertPermission()` and ticket-scoped helpers (`canViewTicket`, `canManageTicket`, `canAssignTicket`).

| Permission | ADMIN | HR | MANAGER | EMPLOYEE |
|------------|-------|-----|---------|----------|
| Create ticket | ✅ | ✅ | ✅ | ✅ |
| View all tickets | ✅ | ✅ | ❌ | ❌ |
| View department tickets | ✅ | ✅ | ✅ | ❌ |
| Assign ticket | ✅ | ✅ | ✅ | ❌ |
| Internal comments | ✅ | ✅ | ✅ | ❌ |
| Manage SLA | ✅ | ✅ | ❌ | ❌ |

## Status Lifecycle

Valid transitions are enforced by `validateStatusTransition()`:

```text
OPEN → ASSIGNED | CANCELLED
ASSIGNED → IN_PROGRESS | REOPENED
IN_PROGRESS → PENDING_USER | RESOLVED | ESCALATED
PENDING_USER → IN_PROGRESS | RESOLVED
RESOLVED → CLOSED | REOPENED
REOPENED → ASSIGNED
```

## Services

| Service | Responsibility |
|---------|----------------|
| `TicketService` | CRUD, list, status changes, close, reopen |
| `CommentService` | Public/internal comments |
| `AttachmentService` | Upload metadata, signed URLs (4MB max) |
| `AssignmentService` | Assign, reassign, history |
| `WatcherService` | Add/remove/list watchers |
| `ActivityService` | Audit timeline in `ticket_activities` |
| `SlaService` | Rule lookup, due date calculation |
| `NotificationService` | Wraps `ChatService.createNotification()` |

Every mutation writes to `ticket_activities`.

## Validation

Zod schemas in `validators/ticketing.validator.js`:

- `CreateTicketSchema`
- `UpdateTicketSchema`
- `AssignTicketSchema`
- `CreateCommentSchema`
- `UploadAttachmentSchema`
- `AddWatcherSchema`
- `TicketListQuerySchema`

Use `parseSchema()` to throw `AppError` (400) on validation failure.

## Error Handling

Services throw `AppError` from `backend/src/utils/app-error.js`:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

Supabase errors are never returned directly to callers.

## Testing

Run ticketing unit tests:

```bash
cd backend
node --test src/modules/ticketing/tests/*.test.js
```

Includes Sprint 2 service tests and Sprint 3 controller tests.

## Sprint Boundaries

### Sprint 2 ✅

- Types, validators, services, tests, README
- `AppError` utility

### Sprint 3 ✅

- Controllers, routes, feature flag middleware, upload middleware
- `API.md`, controller tests
- Route registration documented (manual `app.js` step)

### Sprint 4+ ⛔

- Frontend ticketing UI
- Storage bucket provisioning
- Email notifications

### Not in scope

- Database / RLS changes
- EMS module modifications
- Automatic `app.js` modification

## Rollback

Sprint 2 rollback is file deletion only:

```bash
rm -rf backend/src/modules/ticketing
rm -f backend/src/utils/app-error.js   # only if not used elsewhere
```

No EMS routes, database tables, or configuration changes need reverting.

## Prerequisites

- Sprint 1 database schema applied
- Supabase Storage bucket `ticket-attachments` (required before attachment uploads in production)
- `ChatService` available for in-app notifications

## Regression Policy

Sprint 2 adds new files only. Existing EMS authentication, employees, departments, attendance, leaves, payroll, and analytics modules are untouched.
