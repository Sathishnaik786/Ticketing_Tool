# 15 — Performance Review
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Performance Targets

| Metric | Target | Current Baseline |
|---|---|---|
| Dashboard page load (P95) | < 2s | ~1.8s |
| Ticket list query (1000 rows) | < 500ms | ~350ms |
| SLA monitor cron execution | < 30s/run | N/A (new) |
| AI suggestion latency (P90) | < 3s | N/A (new) |
| Executive KPI API | < 1s (cached) | N/A (new) |
| Workflow step execution | < 200ms | N/A (new) |
| Automation rule evaluation | < 100ms/rule | N/A (new) |
| Catalog browse | < 500ms | N/A (new) |
| Vector similarity search | < 200ms | N/A (new) |

---

## 2. Database Performance

### 2.1 Critical Indexes

```sql
-- SLA monitor (scans every 1 minute — must be O(log N))
CREATE INDEX idx_sla_active_response
  ON sla_assignments(response_due_at)
  WHERE response_met_at IS NULL AND paused_at IS NULL;

CREATE INDEX idx_sla_active_resolution
  ON sla_assignments(resolution_due_at)
  WHERE resolution_met_at IS NULL AND paused_at IS NULL;

-- Workflow execution step lookups
CREATE INDEX idx_wf_step_exec_execution
  ON workflow_step_executions(execution_id, status);

-- Automation rule trigger lookup (hot path)
CREATE INDEX idx_automation_rules_trigger
  ON automation_rules(tenant_id, trigger_type, is_active, run_order);

-- Intelligence snapshot queries
CREATE INDEX idx_intelligence_dept_date
  ON intelligence_snapshots(department_id, snapshot_date DESC);

-- AI suggestion deduplication (cache check)
CREATE INDEX idx_ai_suggestions_lookup
  ON ai_suggestions(entity_type, entity_id, suggestion_type, created_at DESC);

-- Audit log queries (read-heavy, immutable)
CREATE INDEX idx_audit_entity
  ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor
  ON audit_logs(actor_id, created_at DESC);
```

### 2.2 Slow Query Prevention

| Query Pattern | Risk | Mitigation |
|---|---|---|
| `SELECT * FROM audit_logs` | Full table scan | Require date range filter; add BRIN index on created_at |
| `SELECT ... FROM tickets JOIN sla_assignments JOIN sla_breaches` | N+1 joins | Use CTEs; limit result set before joining |
| Vector similarity search over 100k+ embeddings | Slow scan | Use IVFFlat index; limit to `LIMIT 10 PROBES 5` |
| Automation rule evaluation (unfiltered) | Full rule scan | Filter by trigger_type + is_active + tenant_id in index |

### 2.3 Connection Pooling

Current Supabase connection pool: default (20 connections)

Phase 5 adds background jobs (BullMQ workers) that hold connections.

**Recommendation:** Use Supabase connection pooler (pgBouncer) in transaction mode:
```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
Target: 100 pooled connections max.

---

## 3. Caching Strategy

### 3.1 Redis Cache Layers

| Data | TTL | Cache Key Pattern | Invalidation |
|---|---|---|---|
| Executive KPI scorecards | 30s | `kpi:{tenantId}:{dateRange}` | On ticket resolve/create |
| Dashboard aggregates | 60s | `dash:{tenantId}:{type}` | On state change |
| SLA analytics | 5min | `sla:analytics:{tenantId}` | On breach/assignment |
| Automation rules | 60s | `rules:{tenantId}:{triggerType}` | On rule save |
| Catalog items | 5min | `catalog:{tenantId}:list` | On item update |
| AI suggestions | 24h | `ai:{hash(feature+input)}` | Never (content-addressed) |
| KB embeddings query | 1h | `rag:{hash(query)}` | On KB article update |

### 3.2 TanStack Query Client-Side Caching

```typescript
// frontend/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s default — Phase 5 widgets
      gcTime: 5 * 60 * 1000,     // 5min GC
      retry: 2,
      refetchOnWindowFocus: false, // Prevent dashboard thrash
    },
  },
});

// Override per query for Phase 5:
// KPI scorecard: staleTime = 30s, refetchInterval = 60s
// SLA analytics: staleTime = 2min
// Catalog items: staleTime = 5min
// AI suggestions: staleTime = 5min, retry = 1 (AI cost control)
```

---

## 4. Realtime Scaling

### Current Architecture
- Socket.IO connected to Express.js (single process)
- Supabase Realtime for DB-level subscriptions

### Phase 5 New Realtime Channels
- `workflow:step:{executionId}` — Notify approvers of pending steps
- `sla:breach:{tenantId}` — Live SLA breach alerts
- `automation:log:{tenantId}` — Live rule execution feed

### Scaling Recommendations
| Load | Solution |
|---|---|
| < 100 concurrent users | Current Socket.IO setup (single process) |
| 100–500 concurrent users | Socket.IO with Redis adapter (`socket.io-redis`) |
| 500+ concurrent users | Migrate to Supabase Realtime only; remove Socket.IO |

---

## 5. Background Job Performance

### BullMQ Queue Configuration

```javascript
// High-priority queues (fast workers)
const slaMonitorWorker = new Worker('sla:monitor', processSla, {
  connection: redis,
  concurrency: 1,         // Single cron run at a time
  lockDuration: 60_000,   // 60s lock
});

// Standard-priority queues (parallel)
const automationWorker = new Worker('automation:events', processRule, {
  connection: redis,
  concurrency: 10,        // 10 parallel rule evaluations
  limiter: { max: 100, duration: 60_000 },  // 100 jobs/min cap
});

// AI processing (rate-limited by provider)
const aiWorker = new Worker('ai:processing', processAi, {
  connection: redis,
  concurrency: 3,         // 3 parallel AI calls max
  limiter: { max: 30, duration: 60_000 },   // 30 AI calls/min
});
```

### Expected Job Volumes (Medium Scale — 500 tickets/day)

| Job | Frequency | Volume/day | Max Duration |
|---|---|---|---|
| SLA monitor | Every 1 min | 1440 runs | 30s |
| SLA escalation | Per breach | ~10/day | 5s |
| Automation events | Per ticket event | ~2000/day | 30s |
| AI suggestions | Per ticket view (cached) | ~200/day | 10s |
| Snapshot aggregation | Daily at 01:00 | 1/day | 5min |
| Report generation | On-demand | ~20/day | 2min |

---

## 6. Frontend Performance

### Bundle Size Management

| Module | Strategy | Estimated Size |
|---|---|---|
| React Flow (workflow builder) | Lazy-loaded, only on builder page | ~400KB |
| Recharts (charts) | Already in bundle | ~200KB |
| AI panel | Lazy-loaded, only on ticket detail | ~20KB |
| Catalog form renderer | Lazy-loaded | ~30KB |

### Render Performance

| Component | Risk | Mitigation |
|---|---|---|
| `WorkflowCanvas` (React Flow) | Large graph re-renders | Memoize node/edge arrays, use `React.memo` on node components |
| `ExecutiveDashboard` | Many simultaneous queries | Stagger query firing with small delays |
| `AutomationRuleList` | Large rule list | Virtualise list with `@tanstack/react-virtual` |
| `AuditLogTable` | Thousands of rows | Server-side pagination, no client-side filter |
| `DynamicFormRenderer` | Deep conditionals | `useMemo` on derived field visibility, `useCallback` on handlers |

---

## 7. Horizontal Scaling Strategy

### Current Single-Server Architecture → Target Multi-Server

```
Phase 5.0 (1 server):
  [Express API] + [BullMQ Workers] + [Cron Jobs]

Phase 5.1 (Separate concerns):
  [Express API Server × N] → Load Balancer
  [Worker Server × M]       → BullMQ consumers
  [Cron Server × 1]         → Dedicated cron host

Phase 5.2 (Cloud-native):
  API → Google Cloud Run (auto-scaling)
  Workers → Cloud Run Jobs
  Crons → Cloud Scheduler + Cloud Run
  Cache → Cloud Memorystore (Redis)
  DB → Supabase (fully managed)
```

---

## 8. Performance Testing Plan

| Test | Tool | Acceptance Criteria |
|---|---|---|
| SLA cron under 10k tickets | k6 + DB load | Completes in < 30s |
| Automation rule evaluation storm | k6 | 1000 events/min, < 5s avg latency |
| Executive dashboard cold load | Lighthouse | LCP < 3s, TTI < 5s |
| AI suggestion throughput | k6 | 50 concurrent users, < 5s P95 |
| Vector search at 100k embeddings | pgbench | < 200ms P95 |
| Full ticket lifecycle E2E | Playwright | Complete in < 10s |
