# Phase 7.1 — Customer Satisfaction (CSAT) Module

## Summary

Independent CSAT feedback collection for closed ETMS tickets. Fully gated by feature flags; when disabled, the platform behaves exactly as before.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Feature Flags                            │
│  Backend: ENABLE_TICKET_FEEDBACK=true                        │
│  Frontend: VITE_ENABLE_TICKET_FEEDBACK=true                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│  ticket-feedback/   │           │  ticket-feedback/   │
│  (backend module)   │           │  (frontend module)  │
│                     │           │                     │
│  routes → controller│           │  pages, hooks,      │
│  → service → repo   │           │  dashboard widgets  │
└─────────┬───────────┘           └─────────┬───────────┘
          │                                 │
          ▼                                 ▼
   ticket_feedback table            Ticket Detail "Feedback" tab
   (new, additive)                  Feedback Analytics page
```

**Design principles**
- No changes to `tickets` table or ticketing business logic
- Additive routes, nav items, and dashboard widgets only
- Strict `=== 'true'` feature flag checks (same pattern as ETMS ticketing)

---

## Database Design

**File:** `backend/database/ticket_feedback_phase7_1.sql`  
**Rollback:** `backend/database/ticket_feedback_phase7_1_rollback.sql`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | `gen_random_uuid()` |
| `ticket_id` | UUID FK → `tickets.id` | UNIQUE (one feedback per ticket) |
| `submitted_by` | UUID FK → `employees.id` | Requester employee |
| `rating` | INTEGER | CHECK 1–5 |
| `resolution_quality` | INTEGER | CHECK 1–5 |
| `communication_quality` | INTEGER | CHECK 1–5 |
| `response_time` | INTEGER | CHECK 1–5 |
| `comments` | TEXT | Optional, max 1000 chars (app validation) |
| `submitted_at` | TIMESTAMPTZ | Default NOW() |
| `created_at` / `updated_at` | TIMESTAMPTZ | Auto-maintained |

**Apply order**
1. `ticketing_phase1.sql` (prerequisite)
2. `ticket_feedback_phase7_1.sql`

---

## API Design

Base path: `/api/ticket-feedback` (mounted only when `ENABLE_TICKET_FEEDBACK=true`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/` | Submit feedback | 201 Created |
| `GET` | `/ticket/:ticketId` | View feedback for ticket | 200 |
| `GET` | `/metrics` | Aggregated CSAT metrics | 200 |
| `GET` | `/my-count` | Employee submission count | 200 |

### POST `/api/ticket-feedback`

**Rules**
- Ticket must exist
- Ticket status must be `CLOSED`
- User must be ticket requester (`requester_id === employeeId`)
- No existing feedback for ticket

**Body**
```json
{
  "ticket_id": "uuid",
  "rating": 5,
  "resolution_quality": 4,
  "communication_quality": 5,
  "response_time": 4,
  "comments": "optional"
}
```

### GET `/api/ticket-feedback/metrics`

**Response fields**
- `averageRating`, `averageCommunicationScore`, `averageResolutionScore`, `averageResponseScore`
- `totalFeedback`, `csatPercentage` (ratings ≥ 4 / total × 100)
- `departmentWiseRating`, `categoryWiseRating`, `monthlyTrend`
- `topRatedCategories`, `lowestRatedCategories`

**Query params (optional):** `department_id`, `category_id`, `from_date`, `to_date`

---

## RBAC Matrix

| Action | EMPLOYEE | MANAGER | HR | ADMIN |
|--------|----------|---------|-----|-------|
| Submit feedback (own closed ticket) | ✅ | ❌ | ❌ | ❌ |
| View own feedback | ✅ | — | — | — |
| View department feedback | ❌ | ✅ | — | — |
| View all feedback | ❌ | ❌ | ✅ | ✅ |
| View metrics | ❌ | ✅ (dept-scoped) | ✅ | ✅ |

---

## Frontend Screens

| Screen | Path | Visibility |
|--------|------|------------|
| Feedback tab | `/app/tickets/:ticketId` | Flag ON + ticket `CLOSED` |
| Feedback Analytics | `/app/feedback-analytics` | Flag ON + ADMIN/HR/MANAGER |
| Employee widget | Dashboard | Flag ON + EMPLOYEE |
| Manager widget | Dashboard | Flag ON + MANAGER |
| Admin/HR widget | Dashboard | Flag ON + ADMIN/HR |

### Feedback form
- Overall star rating (1–5)
- Resolution Quality, Communication Quality, Response Time (1–5 each)
- Optional comments (max 1000 chars)
- Post-submit: thank-you message + read-only display

---

## Feature Flags

| Environment | Variable | Default |
|-------------|----------|---------|
| Backend | `ENABLE_TICKET_FEEDBACK` | `false` |
| Frontend | `VITE_ENABLE_TICKET_FEEDBACK` | `false` |

When **OFF**: no routes, nav, API calls, widgets, or ticket tab.

---

## Test Results

| Suite | Count | Result |
|-------|-------|--------|
| Backend ticket-feedback | 34 | ✅ Pass |
| Frontend ticket-feedback | 22 | ✅ Pass |
| Backend ticketing (regression) | 39 | ✅ Pass |
| Frontend ticketing (regression) | 16 | ✅ Pass |
| Auth RBAC hardening (regression) | 13 | ✅ Pass |
| Frontend production build | — | ✅ Pass |

---

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Regression in ticketing | No ticketing service/route changes; additive tab only |
| Feedback before closure | Server validates `status === 'CLOSED'` |
| Duplicate submissions | DB UNIQUE on `ticket_id` + service check |
| Unauthorized metrics access | Role checks in service layer |
| Feature enabled without DB migration | API returns 500; apply SQL first |

---

## Rollback Plan

1. Set `ENABLE_TICKET_FEEDBACK=false` and `VITE_ENABLE_TICKET_FEEDBACK=false`
2. Restart backend and rebuild/redeploy frontend
3. (Optional) Run `ticket_feedback_phase7_1_rollback.sql` to drop table

No rollback needed for existing EMS/ETMS tables or routes.

---

## Regression Report

| Area | Modified? | Impact |
|------|-----------|--------|
| Authentication | No | None |
| RBAC (core) | No | None |
| Ticketing APIs | No | None |
| Ticket lifecycle | No | None |
| Existing dashboards | No | New widgets only (return `null` when flag off) |
| Existing navigation | No | Additive spread of `ticketFeedbackNavGroups` |
| `tickets` table | No | None |

**Minimal integration touchpoints**
- `TicketDetailPage.tsx` — additive Feedback tab components
- `Dashboard.tsx` — one new widget import
- `App.tsx` / `AppLayout.tsx` — spread new routes/nav
- `app.js` — conditional route mount

---

## File Inventory

### Backend
- `backend/database/ticket_feedback_phase7_1.sql`
- `backend/database/ticket_feedback_phase7_1_rollback.sql`
- `backend/src/modules/ticket-feedback/` (controllers, services, repositories, routes, validators, middleware, tests)

### Frontend
- `frontend/src/modules/ticket-feedback/` (pages, components, hooks, services, routes, nav, tests)
- `frontend/src/config/features.ts` — `isTicketFeedbackEnabled`

---

## Enable Instructions

```bash
# backend/.env
ENABLE_TICKET_FEEDBACK=true

# frontend/.env
VITE_ENABLE_TICKET_FEEDBACK=true
```

Apply database migration in Supabase SQL editor, then restart services.
