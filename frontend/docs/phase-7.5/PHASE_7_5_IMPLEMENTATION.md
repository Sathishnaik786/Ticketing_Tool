# Phase 7.5 — Approval Workflow & Service Catalog Engine

## Overview

Phase 7.5 adds an **additive, feature-flagged** approval workflow and service catalog module for Aparna Enterprises ETMS. When disabled, ETMS behavior is unchanged.

## Feature Flags

| Layer | Variable | Enable value |
|-------|----------|--------------|
| Backend | `ENABLE_APPROVAL_ENGINE` | `true` |
| Frontend | `VITE_ENABLE_APPROVAL_ENGINE` | `true` |

## Deliverables

### Database
- `backend/database/approval_engine_phase7_5.sql`
- `backend/database/approval_engine_phase7_5_rollback.sql`

### Backend module
- `backend/src/modules/approval-management/`

### Frontend module
- `frontend/src/modules/approval-management/`

### Integration hooks (minimal additive)
- `backend/src/app.js` — conditional `/api/approvals` mount
- `frontend/src/config/features.ts` — `isApprovalEngineEnabled`
- `frontend/src/App.tsx` — approval routes
- `frontend/src/components/layout/AppLayout.tsx` — nav group
- `frontend/src/modules/ticketing/pages/TicketDetailPage.tsx` — **Approval Workflow** tab only

## Capabilities

1. **Service Catalog** — IT, HR, Finance, Procurement, Facility, Administration services with seeded Aparna items
2. **Approval Workflows** — Single and multi-level workflows with configurable steps
3. **Ticket Approvals** — Start, approve, reject lifecycle per ticket
4. **Multi-Level Approvals** — Sequential step progression (e.g. Manager → Finance → Procurement)
5. **Audit Trail** — `approval_history` records all actions
6. **Dashboard & Analytics** — Pending widget, my approvals, status analytics

## Apply Migration

```bash
# In Supabase SQL editor (staging first)
# Run: backend/database/approval_engine_phase7_5.sql
```

## Enable Module

```env
# backend/.env / Render
ENABLE_APPROVAL_ENGINE=true

# frontend/.env / Netlify
VITE_ENABLE_APPROVAL_ENGINE=true
```

## Rollback

1. Set both flags to `false` (or remove)
2. Redeploy frontend + backend
3. Optionally run `approval_engine_phase7_5_rollback.sql`

See `ROLLBACK_PLAN.md` for full procedure.

## Test Commands

```bash
# Backend Phase 7.5 tests
node --test backend/src/modules/approval-management/tests/*.test.js

# Frontend Phase 7.5 tests
cd frontend && npm test -- src/modules/approval-management/tests
```

## Compliance

- No existing ETMS tables altered
- No existing APIs modified
- No existing ticket tabs modified (new tab only)
- Fully rollbackable via feature flag + SQL rollback script
