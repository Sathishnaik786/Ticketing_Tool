# Performance Remediation Plan

**Project:** Enterprise Ticketing Management System  
**Mode:** Plan Only — No Implementation  
**Date:** 2026-06-18

---

## Current Performance Profile

**Performance Score (Current): 58/100**

---

## Frontend Performance

### F-01 — Eager Page Imports (Bundle Size)

| Field | Detail |
|-------|--------|
| **Current State** | 30+ pages statically imported in `App.tsx:19-58` |
| **Desired State** | `React.lazy()` for all route components; single Suspense boundary |
| **Files Impacted** | `frontend/src/App.tsx` |
| **Migration?** | No |
| **Breaking?** | No — minor loading flash |
| **Rollback** | Revert to static imports |
| **Estimated Impact** | 30-50% reduction in initial JS bundle |

### F-02 — Module Lazy Loading (Positive)

Ticketing, payroll, communication modules already lazy — **preserve pattern**.

### F-03 — Production Console Logging

| Field | Detail |
|-------|--------|
| **Current State** | `api.ts` logs every request |
| **Desired State** | Strip in production via Vite `esbuild.drop` or env guard |
| **Files Impacted** | `frontend/vite.config.ts`, `frontend/src/services/api.ts` |
| **Impact** | Reduced main thread noise; minor perf gain |

### F-04 — TanStack Query Configuration (Positive)

`App.tsx:61-78` — 5min staleTime, no refetch on focus — **good for perf**.

### F-05 — Netlify Asset Caching

| Field | Detail |
|-------|--------|
| **Current State** | No cache headers |
| **Desired State** | Immutable cache for `/assets/*` (see DEPLOYMENT_REMEDIATION_PLAN) |
| **Impact** | Faster repeat visits |

### F-06 — Image Optimization

Profile images via signed URLs — acceptable. Consider lazy loading avatars in employee lists.

### F-07 — Framer Motion / Heavy UI

Landing and AppLayout use framer-motion extensively — monitor bundle. Consider reducing motion on low-end devices.

---

## Backend Performance

### B-01 — Runtime ts-node Compilation

| Field | Detail |
|-------|--------|
| **Current State** | `ts-node.register()` on every boot (`server.js:24-33`) |
| **Desired State** | Precompile TS modules in build; `node dist/server.js` |
| **Files Impacted** | `backend/package.json`, new build script, tsconfig outDir |
| **Impact** | 2-5s faster cold start; lower memory |
| **Rollback** | Keep ts-node dev path |

### B-02 — Puppeteer Memory

| Field | Detail |
|-------|--------|
| **Current State** | Puppeteer in dependencies for payslip PDF |
| **Desired State** | Move to background worker OR use `@sparticuz/chromium` OR external PDF API |
| **Impact** | Prevent Render OOM (512MB-2GB instances) |
| **Rollback** | Keep in-process with memory limit env |

### B-03 — Compression (Positive)

`compression()` middleware enabled — **keep**.

### B-04 — Rate Limiting Overhead

Minimal — keep current tiered limits.

### B-05 — Auth Middleware DB Calls

Every request: Supabase `getUser` + employee lookup + `getUserRole` (user_roles JOIN).

**Optimization (planned):**
- Short TTL Redis cache for `req.user` resolution keyed by token hash
- Invalidate on logout/role change

| Files | `auth.middleware.js`, `cache.service.js` |
| **Risk** | Stale role if cache not invalidated |

### B-06 — N+1 Query Risk in Ticket List

Review `ticketing.repository` / service for list endpoint — ensure JOIN or batch fetch for assignee, category, department.

**Action:** EXPLAIN ANALYZE on staging with 10K tickets before optimizing.

### B-07 — Response Payload Size

Ensure ticket list returns summary DTO, not full ticket + all comments.

---

## Database Performance

### D-01 — Index Coverage (Positive)

Ticketing phase 1 indexes adequate for:
- Filter by status, priority, department, assignee, requester
- Sort by created_at
- SLA due date queries

### D-02 — Potential Missing Composite Index

If common query: `WHERE department_id = ? AND status = ? ORDER BY created_at DESC`

```sql
-- REVIEW ONLY — verify with EXPLAIN before apply
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_dept_status_created
  ON tickets(department_id, status, created_at DESC);
```

### D-03 — Activity Timeline Growth

`ticket_activities` + `ticket_activity_timeline` unbounded.

**Plan:** Pagination (verify in API); future partitioning by month.

### D-04 — Connection Management

Supabase JS client — no explicit pool. For high concurrency, monitor Supabase connection limits.

**Plan:** Supabase connection pooler (transaction mode) for serverless/high-concurrency.

### D-05 — user_roles Lookup

Ensure index on `user_roles(user_id)` — verify in live DB.

---

## Caching Strategy

### Current

| Layer | Status |
|-------|--------|
| Redis | Optional (`ENABLE_CACHE`) |
| Route cache middleware | On `/api/employees` only |
| TanStack Query | Frontend 5min stale |

### Planned

| Layer | Use Case | TTL |
|-------|----------|-----|
| Redis | Auth user resolution | 60s |
| Redis | Ticket categories/subcategories | 300s |
| Redis | Department list | 300s |
| CDN | Static assets | 1 year |
| HTTP Cache-Control | GET /ticket-categories | 60s public |

### Redis on Render

Use Render Redis or Upstash — required for:
- Multi-instance Socket.IO adapter
- Shared cache
- Session cache (if cookie auth)

---

## Socket.IO Performance

| Current | Issue |
|---------|-------|
| In-memory adapter default | No cross-instance broadcast |
| Redis adapter optional | Must enable for scale |

**Plan:**
- `ENABLE_SOCKET_REDIS=true` in production
- Sticky sessions OR Redis adapter (prefer Redis)
- Limit payload size on chat events

---

## Performance Testing Plan (Pre Go-Live)

| Test | Tool | Target |
|------|------|--------|
| API load test | k6 or Artillery | 100 concurrent users, ticket CRUD |
| Ticket list p95 | k6 | < 500ms at 10K records |
| Frontend Lighthouse | CI | Performance > 80 on dashboard |
| Bundle size | vite-bundle-visualizer | Initial JS < 500KB gzip |
| DB query plan | EXPLAIN ANALYZE | No seq scans on ticket list |

---

## Scalability Thresholds (Revised)

| Users | Requirements |
|-------|--------------|
| 100 | Current architecture sufficient with flags enabled |
| 1,000 | Redis cache + adapter; precompile TS; lazy frontend |
| 10,000 | Read replicas consideration; timeline archival; horizontal Render instances |
| 50,000 | Multi-tenant redesign; queue workers; dedicated DB tier |

---

## Implementation Priority

| Priority | Item | Wave |
|----------|------|------|
| P0 | Enable Redis in production | 4 |
| P0 | Precompile TypeScript | 4 |
| P1 | Lazy load App.tsx pages | 5 |
| P1 | Auth response caching | 4 |
| P2 | Netlify cache headers | 6 |
| P2 | Composite index (if EXPLAIN confirms) | 3 |
| P3 | Puppeteer isolation | 4 |
| P3 | Timeline pagination audit | 4 |

---

## Rollback

All performance changes are independently revertible via env flags or git revert. No schema changes required except optional index (use CONCURRENTLY, droppable).

---

*No performance changes implemented.*
