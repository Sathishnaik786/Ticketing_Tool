# ETMS Category Migration Plan — Phase 6.5

**Date:** 2026-06-15

---

## Problem

Sprint 4 temporarily stored category as `[Category: Label]` prefix in ticket description with `category_id = null`.

---

## Solution

Use existing Sprint 1 `ticket_categories` table as first-class entity.

### Seed Categories

| Name | Purpose |
|------|---------|
| IT | Information technology |
| HR | Human resources |
| Finance | Finance requests |
| Payroll | Payroll support |
| Infrastructure | Platform / infra |
| Security | Security & access |
| Facilities | Workplace services |
| Administration | General / other |

**Script:** `backend/database/ticketing_category_seed_and_backfill.sql`

---

## API

| Method | Path | Module |
|--------|------|--------|
| GET | `/api/ticket-categories` | ETMS only |

Mounted when `ENABLE_TICKETING=true`.

---

## Frontend Changes

- `useTicketCategories()` React Query hook
- Create form dropdown bound to `category_id` UUID
- Removed description prefix hack

---

## Backfill Strategy

1. Run seed script (idempotent).
2. UPDATE tickets matching legacy description patterns to set `category_id`.
3. **No description mutation** — preserves audit trail; prefix may remain in older tickets.

---

## Rollback

1. Revert frontend to prior create form (optional).
2. Categories remain in DB — harmless.
3. Remove route mount from `app.js` if needed.
4. Tickets retain `category_id` values.

---

## Data Loss Risk

**None.** Additive seed + nullable backfill only.

---

## Deployment Steps

1. Apply `ticketing_category_seed_and_backfill.sql` in Supabase SQL editor.
2. Deploy backend with `/api/ticket-categories`.
3. Deploy frontend with category dropdown.
4. Verify create ticket sends real `category_id`.
