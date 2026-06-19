# Phase 8.0.5 — API Audit

**Date:** 2026-06-19  
**Mode:** Audit only

---

## Route Classification Legend

| Status | Meaning |
|--------|---------|
| **ACTIVE** | In production use |
| **DEPRECATED** | Superseded but mounted |
| **LEGACY EMS** | HR/payroll domain |
| **UNUSED** | No FE consumer found |

---

## Complete Route Registry

### Authentication & Platform

| Method | Path | Auth | RBAC | Status |
|--------|------|------|------|--------|
| * | `/api/auth/*` | Mixed | Public login | **ACTIVE** |
| * | `/api/employees/*` | Yes | Role-based | **SHARED ACTIVE** |
| * | `/api/departments/*` | Yes | Mixed | **SHARED ACTIVE** |
| * | `/api/chat/*` | Yes | User-scoped | **SHARED ACTIVE** |
| * | `/api/notifications/*` | Yes | User-scoped | **SHARED ACTIVE** |
| GET | `/health/*` | No | Public | **ACTIVE** |
| GET | `/redis-test` | Yes | SUPER_ADMIN | **ACTIVE** (debug) |
| GET | `/cache-stats` | Yes | SUPER_ADMIN | **ACTIVE** (debug) |

### Legacy EMS Routes (Always Mounted)

| Prefix | Controller/Module | Status |
|--------|-------------------|--------|
| `/api/attendance` | `attendance.controller.js` | **LEGACY EMS ACTIVE** |
| `/api/leaves` | `leave.controller.js` | **LEGACY EMS ACTIVE** |
| `/api/documents` | document routes | **LEGACY EMS ACTIVE** |
| `/api/reports` | `report.controller.js` | **LEGACY EMS ACTIVE** |
| `/api/projects` | project routes | **LEGACY EMS ACTIVE** |
| `/api/meetups` | meetup routes | **LEGACY EMS ACTIVE** |
| `/api/calendar-events` | calendar routes | **LEGACY EMS ACTIVE** |
| `/api/updates` | updates module | **LEGACY EMS ACTIVE** |
| `/api/payroll` | payroll module | **LEGACY EMS ACTIVE** |
| `/api/payroll-bulk` | bulk processing | **LEGACY EMS ACTIVE** |
| `/api/payroll/payslips`, `/api/my-payslips` | payslip routes | **LEGACY EMS ACTIVE** |
| `/api/payroll/publication` | publication | **LEGACY EMS ACTIVE** |
| `/api/analytics` | `@analytics/analytics.routes` | **LEGACY EMS / DEPRECATED** |

### ETMS Routes (Feature-Flag Gated)

| Prefix | Flag | Status |
|--------|------|--------|
| `/api/ticket-categories`, `/api/tickets` | `ENABLE_TICKETING` | **ACTIVE** |
| `/api/ticket-feedback` | `ENABLE_TICKET_FEEDBACK` | **ACTIVE** |
| `/api/ticket-assignments` | `ENABLE_TICKET_ASSIGNMENTS` | **ACTIVE** |
| `/api/communications` | `ENABLE_COMMUNICATION_TRACKING` | **ACTIVE** |
| `/api/approvals` | `ENABLE_APPROVAL_ENGINE` | **ACTIVE** |
| `/api/knowledge` | `ENABLE_KNOWLEDGE_BASE` | **ACTIVE** |
| `/api/analytics` | `ENABLE_EXECUTIVE_ANALYTICS` | **ACTIVE** ⚠ collision |
| `/api/notification-center` | `ENABLE_NOTIFICATION_CENTER` | **ACTIVE** |

---

## Critical Finding: Analytics Route Collision

```
Line 153: app.use('/api/analytics', @analytics/analytics.routes)     // ALWAYS
Line 235: app.use('/api/analytics', executive-analytics.routes)    // IF FLAG
```

Express matches first registered router. Phase 7.7 executive endpoints may never receive traffic for conflicting paths.

**Classification:** `/api/analytics` legacy mount = **DEPRECATED / HIGH RISK**  
**Phase 8.1 action:** Resolve before ETMS analytics production reliance.

---

## ETMS API Endpoint Summary (Phase 7.x)

### Ticketing Core
- CRUD tickets, comments, attachments, watchers, categories, SLA operations

### Phase 7.1 — `/api/ticket-feedback`
- Submit feedback, analytics, ticket-scoped queries

### Phase 7.2 — `/api/ticket-assignments`
- Assign, reassign, queues, history

### Phase 7.4 — `/api/communications`
- Comments, calls, emails, timeline

### Phase 7.5 — `/api/approvals`
- Catalog, workflows, ticket approvals, my-approvals

### Phase 7.6 — `/api/knowledge`
- Articles, search, ratings, analytics

### Phase 7.7 — `/api/analytics`
- Executive/department/BU dashboards, trends, reports

### Phase 7.8 — `/api/notification-center`
- my-notifications, unread-count, preferences, analytics, templates

---

## Cross-Cutting API Quality Review

| Concern | ETMS Modules | Legacy EMS | Platform |
|---------|-------------|------------|----------|
| Authentication | ✓ authMiddleware | ✓ | ✓ |
| Authorization | ✓ RBAC in services | Partial | Partial |
| Validation | ✓ Zod (7.x) | Mixed | Mixed |
| Error handling | ✓ AppError + middleware | Mixed | Mixed |
| Rate limiting | ✓ generalLimiter | ✓ (payroll adminLimiter) | ✓ |
| Feature flag 503 | ✓ strict `=== 'true'` | ✗ not flagged | N/A |
| Pagination | Partial | Partial | Partial |
| API versioning | None | None | None |

---

## Potentially Unused / Low-Traffic APIs

| API | Evidence | Status |
|-----|----------|--------|
| `/api/reports` HR reports | Separate from 7.7 analytics | **LEGACY EMS** — verify usage |
| `/redis-test`, `/cache-stats` | Admin debug | **ACTIVE** but should be env-gated |
| Legacy analytics workforce endpoints | No ETMS FE consumer | **UNUSED** for ETMS |
| `work_items` API (if any) | No modern FE route | **UNUSED** candidate |

---

## API Count Summary

| Category | Route Groups (est.) | Flag Gated |
|----------|---------------------|------------|
| ETMS | 8 modules, ~80+ endpoints | Yes |
| Legacy EMS | 10+ groups, ~150+ endpoints | No |
| Shared platform | 6 groups | No |

**No routes modified. No contracts changed.**
