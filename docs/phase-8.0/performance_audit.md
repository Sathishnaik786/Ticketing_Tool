# Phase 8.0.8 — Performance Audit

**Date:** 2026-06-19  
**Mode:** Audit only

---

## Frontend Bundle Analysis

| Metric | Value | Assessment |
|--------|-------|------------|
| Main chunk (`index-*.js`) | ~2,700 KB (~752 KB gzip) | **Critical** — exceeds 500 KB warning |
| TicketDetailPage chunk | ~81 KB | Acceptable (lazy) |
| ETMS modules | Lazy-loaded via `React.lazy` | **Good** |
| EMS payroll modules | Lazy in routes | **Good** |
| Build tool | Vite 5 | **Good** |

### Recommendations (Phase 8.1+)

- Manual chunk splitting for `recharts`, `@fullcalendar`, `xlsx`, payroll modules
- Route-based code splitting for EMS vs ETMS domains
- Tree-shake unused Radix components

---

## React Rendering

| Pattern | Status |
|---------|--------|
| React Query staleTime 5min | **Good** — reduces refetch |
| `refetchOnWindowFocus: false` | **Good** |
| ETMS 7.8 polling 60s | Acceptable when flag on |
| Framer Motion in AppLayout | **Medium** — animation cost on every page |
| Large nav list re-renders | **Medium** — 50+ nav items |

---

## API / Query Performance

| Area | Finding | Severity |
|------|---------|----------|
| Executive analytics | Loads multiple tables in parallel | **Medium** — OK with indexes |
| Notification center sync | Syncs on every list fetch | **Medium** — 7-day window capped |
| Legacy analytics service | 111+ line aggregations | **Medium** — EMS only |
| Cache middleware | On `/api/employees` | **Good** |
| Redis | Optional (`ENABLE_REDIS=false` in render.yaml) | **Gap** for scale |
| Pagination | Partial — some list endpoints unbounded | **Medium** |
| N+1 queries | Possible in ticket detail (comments, watchers) | **Medium** — verify with profiling |

---

## Database Performance

| Area | Status |
|------|--------|
| ETMS indexes in phase SQL | **Good** |
| `indexes.sql` legacy | Needs prod comparison |
| Payroll table volume | **High** — 80+ tables, potential query complexity |
| Missing live `EXPLAIN` data | **Gap** — audit repo-only |
| Connection pooling | Supabase managed | **Good** |
| Service role single connection pattern | **Medium** — no pool tuning visible |

---

## Caching Strategy

| Layer | Implemented | Notes |
|-------|-------------|-------|
| HTTP cache headers (Netlify) | ✓ | Static assets |
| Redis response cache | Partial | Employee routes |
| React Query client cache | ✓ | 5min stale |
| CDN | Netlify | ✓ |
| API response ETags | ✗ | Not implemented |

---

## Realtime / Socket.IO

| Concern | Status |
|---------|--------|
| Socket.IO without Redis adapter in prod | **Medium** — `ENABLE_SOCKET_REDIS=false` |
| Single Render instance | OK for current scale |
| Notification polling (7.8) | Fallback when flag on — no socket added |

---

## Performance Test Gaps

- No load testing scripts in repo
- No Lighthouse CI
- No bundle size budget in CI
- Playwright E2E exists but not automated

---

## Performance Score

| Domain | Score (1-10) |
|--------|--------------|
| ETMS module design | 7 |
| EMS module design | 6 |
| Bundle size | 4 |
| Caching | 6 |
| DB indexing (repo) | 7 |
| Scalability readiness | 5 |

**No performance changes made in Phase 8.0.**
