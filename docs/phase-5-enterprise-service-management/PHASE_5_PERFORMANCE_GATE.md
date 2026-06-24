# PHASE 5 PERFORMANCE GATE
# Enterprise Service Management Platform — Performance Validation

---

## 1. Performance Target Objectives

| Metric | Target | Peak Capacity Expectation |
|---|---|---|
| SLA monitoring latency | < 1 min delay | 10,000 active tickets |
| Automation action dispatch | < 2.5 seconds | 250 requests/sec |
| Dashboard loading time (P95) | < 1.8 seconds | 1,000 concurrent page sessions |
| Report compilation duration | < 15 seconds | 50 simultaneous PDF exports |

---

## 2. DB Index Coverage Strategy

To avoid full-table scans, the following composite indexes must be defined in the SQL migration file:
* **Workflow Engine:**
  * `CREATE INDEX idx_tws_ticket_workflow ON ticket_workflow_state(ticket_id, workflow_id);`
  * `CREATE INDEX idx_wfs_workflow_order ON workflow_steps(workflow_id, step_order);`
* **SLA Monitoring:**
  * `CREATE INDEX idx_slab_unresolved ON sla_breaches(ticket_id) WHERE breached_at IS NULL;`
  * `CREATE INDEX idx_slap_priority ON sla_policies(priority) WHERE is_active = true;`
* **Service Request Lookup:**
  * `CREATE INDEX idx_sr_item_user ON service_requests(catalog_item_id, requested_by);`
* **Audit Trail:**
  * `CREATE INDEX idx_sal_actor_time ON system_audit_logs(actor_id, created_at DESC);`

---

## 3. Redis Caching Configuration

* **Dashboard KPI Counters:** Cache aggregate counts (MTTR, open tickets count, department SLA rate) using key `cache:dashboard:kpi:<dept_id>`. TTL is set to 5 minutes.
* **Catalog Category Structure:** Cache item schemas using key `cache:catalog:items`. Invalidated only when catalog configuration changes. TTL is set to 2 hours.
* **Session Validation Caching:** Store user permission sets to bypass Supabase queries during API calls. TTL is set to 15 minutes.

---

## 4. BullMQ Queue Specifications

Three queues are initialized to balance CPU and network workloads:
1. **`sla-monitor-queue`:**
   * *Purpose:* Tick repeatable cron jobs to check targets.
   * *Concurrency:* 1 worker thread (processes checklist sequence in batches of 100).
   * *Repeat rate:* Every 1 minute.
2. **`workflow-engine-queue`:**
   * *Purpose:* Advance workflow steps (sending alerts, creating tasks).
   * *Concurrency:* 5 worker threads.
   * *Rate Limiting:* 150 jobs/sec.
3. **`reports-compilation-queue`:**
   * *Purpose:* Compile PDF/CSV analytical summaries.
   * *Concurrency:* 2 worker threads (isolated from standard ticket tasks).
   * *Retry Strategy:* exponential backoff (delay = 5000ms, factor = 2).

---

## 5. UI Rendering Safeguards

* **Recharts Optimization:** Memoize chart components with React `useMemo` and use CSS virtualization wrappers for large historical reporting lists.
* **Optimistic UI Updates:** Apply local React Query cache adjustments for user actions (e.g. ticket workflow state changes) before database confirmations return.
