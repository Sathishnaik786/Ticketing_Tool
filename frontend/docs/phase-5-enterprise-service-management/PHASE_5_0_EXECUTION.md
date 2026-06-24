# PHASE 5.0 FOUNDATION EXECUTION PLAN
# ESM Platform Foundation — Redis, BullMQ, Audit, Workflow, and SLA

---

## 1. Module 1: Redis Infrastructure

### Database (Data Layer)
* No persistent DB changes.
* Setup local/staging Redis credentials in environment parameters (`REDIS_URL`, `REDIS_PASSWORD`).

### Backend
* Create Redis client instance in `backend/src/lib/redis.js` using `ioredis`.
* Implement connection health-check verification during app bootstrap in `server.js`.
* Implement clean client termination on server shutdown (`SIGTERM`, `SIGINT`).

### Frontend
* No UI components. Add a telemetry health dashboard indicator if needed (Phase 5.2).

### Testing
* Unit test Redis connection retry logic and failover handlers.

### Deployment
* Deploy Redis instances in staging and production (AWS ElastiCache or Redis Enterprise). Add Redis connection strings to environment secrets.

---

## 2. Module 2: BullMQ Infrastructure

### Database (Data Layer)
* BullMQ uses Redis key structures for queues (`bull:queue-name:*`). No Postgres changes are needed.

### Backend
* Initialize BullMQ queue managers in `backend/src/lib/queue.js`.
* Set up worker loops in `backend/src/jobs/` using BullMQ `Worker` class.
* Implement error retry limits, dead-letter logic (max retries = 3), and clean termination.

### Frontend
* No direct client pages. Add status views to Admin settings if needed.

### Testing
* Mock Redis in unit tests. Verify job scheduling and worker queue processing using integration tests.

### Deployment
* Enable background processor threads inside Express runtime, or spin up separate worker containers in the staging environment.

---

## 3. Module 3: Audit Framework

### Database (Data Layer)
* Create `system_audit_logs` table with indexed fields: `actor_id`, `target_entity`, `target_id`.
* Apply database trigger to prevent log updates/deletions (making it write-only/immutable).

### Backend
* Create `audit.service.js` in `backend/src/services/` to capture operations.
* Mount `audit.routes.js` for log querying. Add authorization gate (`ADMIN` or `MANAGER`).

### Frontend
* Create Audit Log Viewer page under Admin (`/app/admin/audit-logs`).
* Build a paginated search table using shadcn `Table` components.

### Testing
* Unit tests verify that any SQL write attempts to `system_audit_logs` are blocked. Integration tests verify log creation during ticket edits.

### Deployment
* Execute the SQL schema migration in Staging. Roll out backend logging service.

---

## 4. Module 4: Workflow Engine

### Database (Data Layer)
* Deploy schema migrations for `workflows`, `workflow_steps`, and `ticket_workflow_state` tables.
* Configure FK references, cascade delete options, and RLS policies.

### Backend
* Create `workflow.controller.js` and `workflow-execution.service.js`.
* Hook ticket creation and status update event events to check if a workflow should be executed.
* Integrate BullMQ workers to run step execution asynchronously.

### Frontend
* Build Workflow list page (`/app/admin/workflows`) and visual sequencing editor panel.
* Add active workflow step status tracker on ticket detail dashboard.

### Testing
* Write integration tests checking ticket workflow status changes. Mock BullMQ queues to assert correct job payloads are scheduled.

### Deployment
* Execute DB migrations. Activate feature flags in development and staging environments.

---

## 5. Module 5: SLA Engine

### Database (Data Layer)
* Deploy migrations for `sla_policies` and `sla_breaches` tables.
* Apply indexes on `sla_breaches(ticket_id, breach_type)`.

### Backend
* Create `sla-policy.service.js` and `sla-enforcement.service.js`.
* Setup `sla-monitor.cron.js` (runs every 1 minute via BullMQ repeatable jobs) to check target times.
* Schedule escalation actions (status alerts, reassignment) on breach.

### Frontend
* Add SLA countdown timer card to the ticket sidebar.
* Build SLA management interface for managers to configure target targets.

### Testing
* Unit test SLA breach calculations (asserting correct breach threshold dates). E2E test verifying breach flag turns red when target time is exceeded.

### Deployment
* Run DB migrations. Configure BullMQ repeat scheduling on app boot.

---

## 6. Implementation Order & Dependencies

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│ 1. Redis Client    ├────►│ 2. BullMQ Worker   ├────►│ 3. Audit Logging   │
└────────────────────┘     └─────────┬──────────┘     └────────────────────┘
                                     │
                                     ├────────────────────────┐
                                     ▼                        ▼
                           ┌────────────────────┐   ┌────────────────────┐
                           │ 4. Workflow Engine │   │ 5. SLA Engine      │
                           └────────────────────┘   └────────────────────┘
```

1. Setup **Redis Connection** in backend environment configuration.
2. Initialize **BullMQ Worker Infrastructure** and configure job queues.
3. Deploy **Audit Log DB schema** and enable security logging triggers.
4. Implement **Workflow Engine** schema, execution listeners, and step workers.
5. Implement **SLA Engine** rules, cron checks, and countdown widgets.
