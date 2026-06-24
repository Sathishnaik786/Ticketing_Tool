# EVENT BUS ARCHITECTURE
# Event-Driven Architecture and Asynchronous Processing

This document outlines the event producer-consumer relationships, queue divisions, and failure recovery protocols for Phase 5.

---

## 1. Event Pipeline Topology

All core operational actions emit events to the system broker. The broker enqueues tasks into dedicated queues managed by BullMQ workers:
a
```
[ EVENT PRODUCER ] (Express REST Controller)
         │
         ▼  (in-process emit)
  [ EVENT BUS ] (Redis-backed Event Dispatcher)
         │
         ├──► workflow-queue ──► [ Workflow Worker ] (Runs actions, assigns approvals)
         │
         ├──► sla-queue ───────► [ SLA Breach Worker ] (Triggers escalation, updates flags)
         │
         ├──► notify-queue ────► [ Notification Worker ] (Renders templates, calls webhooks)
         │
         └──► audit-queue ─────► [ Audit Log Worker ] (Writes immutable log entries)
```

---

## 2. Event Registry & Consumer Mapping

| Event Name | Producer Component | Consumer Component(s) | Target Queue | Processing Style |
|---|---|---|---|---|
| `ticket.created` | Ticketing Controller | Workflow Engine, SLA Engine, Automation Engine | `workflow-queue`, `sla-queue` | Asynchronous |
| `ticket.updated` | Ticketing Controller | SLA Engine, Automation Engine | `sla-queue` | Asynchronous |
| `ticket.assigned` | Assignment Controller | Notification Broker, Automation Engine | `notify-queue` | Asynchronous |
| `ticket.closed` | Ticketing Controller | SLA Engine, Analytics Engine | `sla-queue`, `analytics-queue` | Asynchronous |
| `approval.completed`| Approval Controller | Workflow Engine | `workflow-queue` | Asynchronous |
| `approval.rejected` | Approval Controller | Workflow Engine, Notification Broker | `workflow-queue`, `notify-queue`| Asynchronous |
| `workflow.started` | Workflow Engine | Notification Broker, Audit Logger | `notify-queue`, `audit-queue` | Asynchronous |
| `workflow.completed`| Workflow Engine | Ticketing Controller, Notification Broker | `workflow-queue`, `notify-queue`| Asynchronous |
| `sla.near_breach` | SLA Monitor Cron | Notification Broker | `notify-queue` | Asynchronous |
| `sla.breached` | SLA Monitor Cron | Automation Engine, Notification Broker | `notify-queue` | Asynchronous |
| `catalog.requested` | Service Catalog Ctrl | Ticketing Controller, Workflow Engine | `workflow-queue` | Asynchronous |
| `automation.executed`| Automation Evaluator| Audit Logger | `audit-queue` | Asynchronous |
| `notification.sent` | Notification Worker | None (Logs delivery verification) | `audit-queue` | Asynchronous |

---

## 3. BullMQ Queues Configuration

Four dedicated queues isolate execution loads:

1. **`workflow-queue`:**
   * *Tasks:* Advancing workflow steps, condition checks, and sub-task creation.
   * *Concurrency:* 5 parallel threads.
2. **`sla-queue`:**
   * *Tasks:* Monitoring breach target timers and updating escalation states.
   * *Concurrency:* 2 parallel threads.
3. **`notify-queue`:**
   * *Tasks:* Parsing Mustache template formats and making external API requests.
   * *Concurrency:* 10 parallel threads.
4. **`audit-queue`:**
   * *Tasks:* Writing immutable data rows to `system_audit_logs`.
   * *Concurrency:* 3 parallel threads.

---

## 4. Retry and Failure Recovery Strategies

### Retry Mechanism
If a job worker fails (e.g. SMTP server timeout or external webhook down):
* **Automatic Retry:** Job is rescheduled automatically in Redis.
* **Exponential Backoff:** The delay before retry increases using the formula:
  $$\text{Delay} = \text{InitialDelay (5s)} \times 2^{\text{AttemptCount} - 1}$$
* **Max Attempt Threshold:** Limit to a maximum of 3 retry attempts.

### Dead Letter Handling (DLQ)
When a job fails after 3 attempts:
1. The job is marked as `FAILED` and moved to the Dead Letter Queue (`failed:jobs:list`).
2. The failure details (error message and stack trace) are saved to `notification_delivery_logs` or `automation_logs`.
3. A critical system event is emitted to notify administrators via the in-app dashboard.
4. A manual trigger utility allows administrators to re-run or clear failed jobs from the Dead Letter Queue.
