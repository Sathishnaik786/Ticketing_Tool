# PHASE 5 OBSERVABILITY PLAN
# Enterprise Telemetry System — Monitoring, Tracing, Alerting, and Incident Response

This document defines logging formats, system dashboards, queue monitoring configurations, and incident response runbooks for Phase 5.

---

## 1. Structured Logging & Tracing

### Structured Logging
All backend logs execute via a structured JSON logging service (Winston/Pino) with fields:
```json
{
  "timestamp": "2026-06-24T14:14:36Z",
  "level": "error",
  "tenant_id": "uuid-tenant-123",
  "actor_id": "uuid-user-456",
  "module": "workflow-engine",
  "event_type": "workflow.started",
  "message": "Workflow step execution failed",
  "stack_trace": "..."
}
```

### Distributed Tracing (OpenTelemetry)
* **API Requests:** OpenTelemetry tracks incoming HTTP requests, recording path latency and downstream database query durations.
* **Asynchronous Jobs:** Spans are passed through BullMQ job payloads, connecting API triggers to background queue executions.

---

## 2. Telemetry Dashboards Matrix

### 1. Redis Telemetry
* *Metrics:* Memory usage, client connection counts, commands processed/sec, cache hit/miss ratio.
* *Tool:* Grafana / Datadog.

### 2. BullMQ Queue Performance
* *Metrics:* Pending jobs count, processing duration, failed job rates, worker health.
* *Tool:* Bull-Board console dashboard.

### 3. Database Performance
* *Metrics:* Active client connection pool size, execution time for heavy reporting views, transaction lock counts.
* *Tool:* Supabase monitoring portal.

### 4. ESM Operational Performance
* *Metrics:* SLA breach percentages, mean time to first response, workflow loop cancellations count.
* *Tool:* Executive analytics panel.

---

## 3. System Alerts Configuration

Alert notifications are classified into three severity levels and routed using the Notification Broker:

| Severity Level | Trigger Threshold | Alert Channel | Targeted Action |
|---|---|---|---|
| **P0 (Critical)** | Redis connection failure, or database RLS violation triggers. | PagerDuty + Slack alert. | On-call engineer is paged instantly. |
| **P1 (Warning)** | SLA breach rate $> 15\%$, or BullMQ job failure rate $> 10\%$. | Slack alert to admin group. | Development squad reviews logs during the next work day. |
| **P2 (Info)** | Feature flag status toggled, or sync connection state updated. | Internal log write. | Kept for audit record. |

---

## 4. Incident Response Runbook

When a P0 system alert is triggered:
1. **Declare Incident:** Assign an incident commander and open a dedicated communication bridge.
2. **Review Telemetry:** Open Grafana and Bull-Board dashboard screens to check Redis memory and active queue processing rates.
3. **Execute Mitigation Steps:**
   * If Redis is out of memory, trigger a cache flush or increase the cluster size.
   * If BullMQ workers are blocked, restart background worker processes.
   * If a migration query locks the database, identify the query ID using the Supabase console and terminate it.
4. **Deploy Fallback Mode:** If infrastructure issues persist, set `ENABLE_REDIS` to `false` and restart services to activate the in-process fallback mode.
5. **Resolve and Document:** Once operations stabilize, document the root cause and update system alerts to prevent recurrence.
