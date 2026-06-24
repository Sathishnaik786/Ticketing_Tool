# PHASE 5 IMPLEMENTATION BACKLOG
# Enterprise Service Management Platform — Sprint Backlog

---

## Sprint 1: Redis & BullMQ Infrastructure
* **Story ESM-101: Redis Client Integration**
  * *Description:* Set up the Redis database client using `ioredis` in the backend application.
  * *Dependencies:* None.
  * *Acceptance Criteria:* Client successfully connects to Redis on app bootstrap, handles retries, and closes cleanly on SIGTERM.
  * *Estimate:* 1 Story Point (SP).
* **Story ESM-102: BullMQ Queue Setup**
  * *Description:* Initialize BullMQ queue workers and job schemas inside Express backend.
  * *Dependencies:* ESM-101.
  * *Acceptance Criteria:* Workers execute jobs pushed to queues. Errors are captured and retry schedules are verified.
  * *Estimate:* 2 SP.

---

## Sprint 2: Immutable System Audit Logging
* **Story ESM-201: Audit Database Schema**
  * *Description:* Deploy database migrations for the `system_audit_logs` table.
  * *Dependencies:* None.
  * *Acceptance Criteria:* Immutable trigger blocks updates and deletes.
  * *Estimate:* 2 SP.
* **Story ESM-202: Audit Logging Service**
  * *Description:* Create backend logger utilities and Admin audit viewer routes.
  * *Dependencies:* ESM-201.
  * *Acceptance Criteria:* Operations (e.g. ticket updates) are correctly logged. Admins can search logs via the UI dashboard.
  * *Estimate:* 2 SP.

---

## Sprint 3: Workflow Engine Backend
* **Story ESM-301: Workflow Schema and RLS**
  * *Description:* Deploy migrations for `workflows`, `workflow_steps`, and `ticket_workflow_state`.
  * *Dependencies:* ESM-102.
  * *Acceptance Criteria:* RLS policies block unauthorized reads/writes.
  * *Estimate:* 2 SP.
* **Story ESM-302: Workflow Execution Service**
  * *Description:* Develop the logic to evaluate workflow states and execute tasks.
  * *Dependencies:* ESM-301.
  * *Acceptance Criteria:* Tickets advance through workflow steps upon user actions or automated transitions.
  * *Estimate:* 3 SP.

---

## Sprint 4: Workflow Builder Frontend
* **Story ESM-401: Workflow Builder Panel**
  * *Description:* Build a node or list-based page allowing admins to configure workflow steps.
  * *Dependencies:* ESM-302.
  * *Acceptance Criteria:* Admins can define step order, step names, and assigned roles.
  * *Estimate:* 3 SP.
* **Story ESM-402: Ticket Step Status Widget**
  * *Description:* Design a sidebar component for the ticket detail dashboard showing the active step.
  * *Dependencies:* ESM-401.
  * *Acceptance Criteria:* Users can see the active workflow stage, completed steps, and pending actions.
  * *Estimate:* 2 SP.

---

## Sprint 5: SLA Engine Integration
* **Story ESM-501: SLA Database Schema & Cron**
  * *Description:* Deploy schema migrations for `sla_policies` and `sla_breaches`. Configure a 1-minute BullMQ repeatable cron job.
  * *Dependencies:* ESM-102.
  * *Acceptance Criteria:* Scheduled job checks active ticket SLA targets every minute.
  * *Estimate:* 3 SP.
* **Story ESM-502: SLA Countdown UI**
  * *Description:* Add an active countdown widget on ticket detail panels.
  * *Dependencies:* ESM-501.
  * *Acceptance Criteria:* Timers count down to SLA targets and turn red upon breach.
  * *Estimate:* 2 SP.

---

## Sprint 6: Service Catalog Backend
* **Story ESM-601: Catalog Database Schema**
  * *Description:* Deploy schemas for `service_catalog_categories`, `service_catalog_items`, and `service_requests`.
  * *Dependencies:* ESM-302.
  * *Acceptance Criteria:* Configurations link to existing ticketing structure. RLS blocks non-admin updates.
  * *Estimate:* 2 SP.
* **Story ESM-602: Catalog Request APIs**
  * *Description:* Create REST endpoints to submit requests and map dynamic fields.
  * *Dependencies:* ESM-601.
  * *Acceptance Criteria:* Submitting a request triggers a ticket mapped to catalog item workflows.
  * *Estimate:* 3 SP.

---

## Sprint 7: Service Catalog Frontend
* **Story ESM-701: Catalog Request Browser**
  * *Description:* Develop catalog selection screen for employees.
  * *Dependencies:* ESM-602.
  * *Acceptance Criteria:* Users can browse categories, search items, and select offerings.
  * *Estimate:* 2 SP.
* **Story ESM-702: Dynamic Form Form Renderer**
  * *Description:* Build form component parsing catalog item JSON input schemas.
  * *Dependencies:* ESM-701.
  * *Acceptance Criteria:* Input types (text, selects, attachments) render and validate correct values.
  * *Estimate:* 3 SP.

---

## Sprint 8: Automation Engine Backend
* **Story ESM-801: Automation Schema and Evaluator**
  * *Description:* Create schemas for `automation_rules` and write conditions parser services.
  * *Dependencies:* ESM-102.
  * *Acceptance Criteria:* Controller events trigger rule evaluations asynchronously.
  * *Estimate:* 3 SP.
* **Story ESM-802: Automation Actions Executor**
  * *Description:* Code executor routines (assign agent, edit priority, add comments).
  * *Dependencies:* ESM-801.
  * *Acceptance Criteria:* Actions are dispatched when conditions evaluate to true. Circular loops are caught and stopped.
  * *Estimate:* 3 SP.

---

## Sprint 9: Automation UI Builder
* **Story ESM-901: Automation Rules Builder**
  * *Description:* Design trigger-condition-action configurations page for admins.
  * *Dependencies:* ESM-802.
  * *Acceptance Criteria:* Rules can be created, saved, toggled, and viewed in the dashboard.
  * *Estimate:* 3 SP.

---

## Sprint 10: Executive Analytics Database Views
* **Story ESM-1001: Aggregated Views and Snapshots**
  * *Description:* Create database views and snapshots aggregation routines inside the kpi engine.
  * *Dependencies:* ESM-501.
  * *Acceptance Criteria:* Weekly performance counters are written to snapshots.
  * *Estimate:* 3 SP.
* **Story ESM-1002: Analytics Dashboards Frontend**
  * *Description:* Build routes for Executive, Service Health, and Capacity dashboards using Recharts.
  * *Dependencies:* ESM-1001.
  * *Acceptance Criteria:* Widgets and charts render aggregated data from cached Redis snapshots.
  * *Estimate:* 3 SP.

---

## Sprint 11: Analytical Report Exports
* **Story ESM-1101: Reports Generation Workers**
  * *Description:* Create background report exporters (PDF/CSV engines) using BullMQ.
  * *Dependencies:* ESM-1002.
  * *Acceptance Criteria:* Running heavy report queries executes in the background. On completion, a system notification with download url is sent.
  * *Estimate:* 3 SP.
