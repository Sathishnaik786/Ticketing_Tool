# BACKEND IMPLEMENTATION MAP
# Modules Specifications for Express Backend Engines

This document defines the controller routes, service managers, background queue workers, and validation rules for all backend ESM modules.

---

## 1. Workflow Engine (`workflow-engine/`)

* **Controllers:** `workflow.controller.js`
  * REST handlers to create workflows, add steps, query active running status, and initiate workflow rollbacks.
* **Routes:** `workflow.routes.js`
  * `POST /api/v1/workflows` (create)
  * `PUT /api/v1/workflows/:id/publish` (activate version)
  * `GET /api/v1/workflows/:id/history` (version history)
* **Services:** `workflow-execution.service.js`
  * Validates DAG schemas, advances ticket workflow states, checks trigger conditions, and invokes next step actions.
* **Workers:** `workflow-step.worker.js` (BullMQ)
  * Executes asynchronous workflow steps (e.g. running notifications, generating sub-tasks, updating priorities).
* **Events:** `workflow.started`, `workflow.step_completed`, `workflow.completed`
* **DTOs & Validators:** `workflow.validators.js`
  * Zod schema checks for workflow step arrays, ensuring step order is sequential and assigned role identifiers exist.
* **Middleware:** `requireRole(['ADMIN', 'MANAGER'])` guards all configuration endpoints.

---

## 2. Approval Engine (`approval-engine/`)

* **Controllers:** `approval.controller.js`
  * Handlers to evaluate ticket criteria, assign approvals, and register approval decisions.
* **Routes:** `approval.routes.js`
  * `GET /api/v1/approvals/pending` (user dashboard query)
  * `POST /api/v1/approvals/action` (approve or reject action submit)
* **Services:** `approval-policy.service.js`
  * Compares entity values against active policies. Initiates approvals assignments.
* **Workers:** `approval-escalation.worker.js` (BullMQ)
  * Checks for pending approvals nearing escalation limits and reassigns them.
* **Events:** `approval.requested`, `approval.completed`, `approval.rejected`
* **DTOs & Validators:**
  * Checks for valid `action` input parameters (`APPROVED` or `REJECTED`) and enforces non-empty comments on rejection.
* **Middleware:** Checks if the authenticated user's JWT ID matches the assignee ID or assigned role for the active approval step.

---

## 3. Notification Engine (`notification-engine/`)

* **Controllers:** `notification.controller.js`
  * Handlers to update notification preferences and view logs.
* **Routes:** `notification.routes.js`
  * `PUT /api/v1/notifications/preferences`
  * `GET /api/v1/notifications/logs`
* **Services:** `notification-broker.service.js`
  * Compiles templated subjects and bodies, resolves preferences, and maps channels to queues.
* **Workers:** `notification-dispatcher.worker.js` (BullMQ)
  * Manages outbound connections (SES, Twilio, Slack webhooks) and processes delivery queues.
* **Events:** `notification.dispatched`, `notification.delivered`, `notification.failed`
* **DTOs & Validators:**
  * Preferences schema asserts that enabled channels are within the supported list: `IN_APP`, `EMAIL`, `SMS`, `WHATSAPP`, `SLACK`, `TEAMS`.
* **Middleware:** Standard `requireAuth` guards.

---

## 4. SLA Engine (`sla-engine/`)

* **Controllers:** `sla.controller.js`
  * Query status logs and configure target limits.
* **Routes:** `sla.routes.js`
  * `GET /api/v1/sla/policies`
  * `POST /api/v1/sla/policies`
* **Services:** `sla-policy.service.js`
  * Computes targets, checks specifications, and marks breaches.
* **Workers:** `sla-monitor.worker.js` (BullMQ repeatable cron)
  * Scans active ticket records every minute to evaluate targets and dispatch breach events.
* **Events:** `sla.near_breach`, `sla.breached`
* **DTOs & Validators:**
  * Asserts target values (response and resolution targets) are integers greater than zero.
* **Middleware:** `requireRole(['ADMIN', 'MANAGER'])` restricts policy updates.

---

## 5. Catalog Engine (`catalog-engine/`)

* **Controllers:** `catalog.controller.js`
  * Query categories and items, and submit requests.
* **Routes:** `catalog.routes.js`
  * `GET /api/v1/catalog/items`
  * `POST /api/v1/catalog/request`
* **Services:** `service-request.service.js`
  * Maps catalog request fields to form configurations and initiates corresponding workflows.
* **Workers:** None (operations process synchronously in request threads).
* **Events:** `catalog.requested`
* **DTOs & Validators:**
  * Validates submitted payload variables against the catalog item's JSON Schema configuration.
* **Middleware:** None.

---

## 6. Automation Engine (`automation-engine/`)

* **Controllers:** `automation.controller.js`
  * Create automation rules and view execution logs.
* **Routes:** `automation.routes.js`
  * `POST /api/v1/automation/rules`
  * `GET /api/v1/automation/logs`
* **Services:** `rule-evaluator.service.js`
  * Parses event payloads and evaluates matched conditions.
* **Workers:** `automation-action.worker.js` (BullMQ)
  * Processes triggered actions (e.g. reassigning tickets, updating values) asynchronously.
* **Events:** `automation.executed`
* **DTOs & Validators:**
  * JSON schema validator checking rules structures (ensuring trigger events match supported hooks: `ticket.created`, `ticket.updated`).
* **Middleware:** Restricted to `ADMIN` users.

---

## 7. Analytics Engine (`analytics-engine/`)

* **Controllers:** `analytics.controller.js`
  * Fetch aggregates and export reports.
* **Routes:** `analytics.routes.js`
  * `GET /api/v1/analytics/dashboards`
  * `POST /api/v1/analytics/reports/export`
* **Services:** `kpi.service.js`
  * Formulates aggregates, reads cached values from Redis, and runs reporting exports.
* **Workers:** `snapshot.worker.js` (BullMQ repeatable jobs)
  * Compiles weekly aggregates and stores snapshot records.
* **Events:** None.
* **DTOs & Validators:**
  * Validates export parameters (enforcing date range limits and validating format requests: `PDF` or `CSV`).
* **Middleware:** Restricted to `ADMIN` and `MANAGER` roles.
