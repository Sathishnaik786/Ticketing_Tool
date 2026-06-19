# Phase 7.6 — Knowledge Base & Self-Service Portal

## Overview

Phase 7.6 adds an **additive, feature-flagged** Enterprise Knowledge Base and Self-Service Portal for Aparna Enterprises ETMS.

## Pre-Conditions Verified

- Phase 7.1–7.5 tests passing
- Production build passing
- Rollback scripts available

## Feature Flags

| Layer | Variable | Enable value |
|-------|----------|--------------|
| Backend | `ENABLE_KNOWLEDGE_BASE` | `true` |
| Frontend | `VITE_ENABLE_KNOWLEDGE_BASE` | `true` |

## Deliverables

### Database
- `backend/database/knowledge_base_phase7_6.sql`
- `backend/database/knowledge_base_phase7_6_rollback.sql`

### Backend
- `backend/src/modules/knowledge-management/`

### Frontend
- `frontend/src/modules/knowledge-management/`

### Integration hooks (minimal additive)
- `backend/src/app.js` — `/api/knowledge` mount
- `frontend/src/config/features.ts` — `isKnowledgeBaseEnabled`
- `frontend/src/App.tsx` — knowledge routes
- `frontend/src/components/layout/AppLayout.tsx` — nav group
- `frontend/src/modules/ticketing/pages/TicketCreatePage.tsx` — `KnowledgeSuggestionsPanel` only

## Capabilities

1. **Knowledge Categories** — IT, HR, Finance, Procurement, Facilities, Administration
2. **Article Lifecycle** — Draft → Review → Published → Archived
3. **Version History** — Automatic versioning on content updates
4. **Search** — Full-text search across published articles
5. **Ratings & Feedback** — Employee self-service engagement
6. **Analytics** — Views, top rated, search trends, deflection metrics
7. **Ticket Deflection** — Suggested articles during ticket creation

## Enable

```env
ENABLE_KNOWLEDGE_BASE=true
VITE_ENABLE_KNOWLEDGE_BASE=true
```

Apply SQL: `backend/database/knowledge_base_phase7_6.sql`

## Rollback

Set flags to `false`, redeploy, optionally run `knowledge_base_phase7_6_rollback.sql`.

See `ROLLBACK_PLAN.md`.
