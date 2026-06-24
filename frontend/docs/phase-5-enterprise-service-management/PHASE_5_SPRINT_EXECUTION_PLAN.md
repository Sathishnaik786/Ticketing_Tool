# PHASE 5 SPRINT EXECUTION PLAN
# ESM Transition — Sequential 11-Sprint Implementation Blueprint

This document details the goals, files, dependencies, acceptance criteria, risks, and rollbacks for each of the 11 implementation sprints.

---

## Sprint 01: Infrastructure
* **Goal:** Initialize the Redis database client and configure BullMQ worker queues.
* **Files:**
  * `backend/src/lib/redis.js` (Create)
  * `backend/src/lib/queue.js` (Create)
  * `backend/src/app.js` (Modify)
* **Dependencies:** None.
* **Acceptance Criteria:** Backend starts up and establishes a stable Redis connection. BullMQ queues are initialized successfully.
* **Risk:** Incorrect connection parameters crash the server.
* **Rollback Plan:** Revert `app.js` changes, and toggle `ENABLE_REDIS` to `false` in environment configurations.

---

## Sprint 02: Audit
* **Goal:** Deploy the audit logs table and create the immutable logging trigger.
* **Files:**
  * `backend/database/create_audit_logs.sql` (Create)
  * `backend/src/services/audit.service.js` (Create)
  * `backend/src/modules/audit-compliance/` (Create folder and controllers)
* **Dependencies:** Sprint 01.
* **Acceptance Criteria:** Operational edits (e.g. ticket updates) generate write-once audit log entries. Database updates or deletions on logs throw SQL errors.
* **Risk:** Triggers block standard ticket writes if exceptions are handled incorrectly.
* **Rollback Plan:** Run `DROP TRIGGER trg_immutable_audit ON system_audit_logs;` and drop table.

---

## Sprint 03: Workflow
* **Goal:** Implement the versioned workflow schema and backend engine execution loop.
* **Files:**
  * `backend/database/workflows_schema.sql` (Create)
  * `backend/src/modules/workflow-engine/` (Create backend files)
* **Dependencies:** Sprint 01.
* **Acceptance Criteria:** Workflows can be saved, versions tracked, and step sequences executed.
* **Risk:** Circular step definitions cause infinite loops.
* **Rollback Plan:** Run rollback schema SQL to drop workflows tables and restore routing configs.

---

## Sprint 04: Approvals
* **Goal:** Setup the multi-level approvals engine and assign verification decisions.
* **Files:**
  * `backend/database/approval_engine_phase7_5.sql` (Extend)
  * `backend/src/modules/approval-engine/` (Create backend files)
  * `frontend/src/modules/approvals/` (Create frontend dashboards & cards)
* **Dependencies:** Sprint 03.
* **Acceptance Criteria:** Ticket events trigger multi-level approval assignments. Decisions register via JWT security checks.
* **Risk:** Users bypassing validation to approve steps assigned to others.
* **Rollback Plan:** Drop approval schemas tables and restore previous approval route imports in `App.tsx`.

---

## Sprint 05: Notifications
* **Goal:** Deploy the notification templates and multi-channel dispatch broker.
* **Files:**
  * `backend/database/create_chat_notifications_schema.sql` (Extend)
  * `backend/src/modules/notification-engine/` (Create backend files)
* **Dependencies:** Sprint 01.
* **Acceptance Criteria:** User preference toggles operate correctly. Messages format using Mustache templates and dispatch to channels.
* **Risk:** Delivery failures block backend threads.
* **Rollback Plan:** Revert channel integration configurations in environment files and fall back to local `IN_APP` notifications.

---

## Sprint 06: Settings
* **Goal:** Implement the key-value dynamic configuration settings registry.
* **Files:**
  * `backend/database/system_settings.sql` (Create)
  * `backend/src/lib/settings.js` (Create)
  * `frontend/src/modules/settings/` (Create Admin Settings UI page)
* **Dependencies:** None.
* **Acceptance Criteria:** Settings load into memory cache from Redis. Changes written by Admins trigger Pub/Sub cache clears.
* **Risk:** Null configurations crash lookup requests.
* **Rollback Plan:** Drop table `system_settings` and fall back to environment configurations.

---

## Sprint 07: SLA
* **Goal:** Deploy the SLA engine policy matching, breach crons, and countdown timers.
* **Files:**
  * `backend/database/sla_schema.sql` (Create)
  * `backend/src/modules/sla-engine/` (Create backend files)
  * `frontend/src/modules/sla/` (Create SlaTimerCard & SlaManagement UI)
* **Dependencies:** Sprint 01.
* **Acceptance Criteria:** Background worker evaluates breach limits every minute. Sidebar timers count down correctly.
* **Risk:** Monitoring queries slow down the primary database.
* **Rollback Plan:** Drop SLA database schemas, and cancel repeatable crons in Redis.

---

## Sprint 08: Business Hierarchy
* **Goal:** Map Company -> BU -> Division -> Department mappings.
* **Files:**
  * `backend/database/business_units.sql` (Create)
  * `backend/database/alter_departments.sql` (Create)
* **Dependencies:** None.
* **Acceptance Criteria:** Database views support hierarchy aggregation. Nullable links allow legacy EMS tables to run normally.
* **Risk:** Relational queries break existing user profile assignments.
* **Rollback Plan:** Run `ALTER TABLE departments DROP COLUMN division_id` and drop added hierarchy structures.

---

## Sprint 09: Catalog
* **Goal:** Deploy the service catalog browser and dynamic input forms.
* **Files:**
  * `backend/database/catalog_schema.sql` (Create)
  * `backend/src/modules/catalog-engine/` (Create backend files)
  * `frontend/src/modules/catalog/` (Create Catalog Browser and Form Renderer)
* **Dependencies:** Sprint 03.
* **Acceptance Criteria:** Employees select items, input parameters validated against schemas, and tickets route with workflows.
* **Risk:** Dynamic layouts break mobile responsive UI views.
* **Rollback Plan:** Drop catalog tables, and toggle `isCatalogEnabled` to `false`.

---

## Sprint 10: Automation
* **Goal:** Implement the event-driven rules engine and condition parsers.
* **Files:**
  * `backend/database/automation_schema.sql` (Create)
  * `backend/src/modules/automation-engine/` (Create backend files)
  * `frontend/src/modules/automation/` (Create Rules Builder UI)
* **Dependencies:** Sprint 01.
* **Acceptance Criteria:** Event hooks emit statuses, evaluator resolves conditions, and workers execute actions safely.
* **Risk:** Loop runs lock worker execution queues.
* **Rollback Plan:** Toggle `isAutomationEnabled` to `false` and clear rules listener bindings in Express controllers.

---

## Sprint 11: Analytics
* **Goal:** Setup the dimensional star schema aggregation crons and Recharts executive dashboards.
* **Files:**
  * `backend/database/reporting_star_schema.sql` (Create)
  * `backend/src/modules/analytics-engine/` (Create backend files)
  * `frontend/src/modules/analytics/` (Create Dashboards and Export Modal UI)
* **Dependencies:** Sprint 07.
* **Acceptance Criteria:** Snapshot jobs aggregate data into analytical tables. KPI dashboards render without UI lag.
* **Risk:** Analytical aggregates lock core operational writes.
* **Rollback Plan:** Drop star schema and snapshots tables, and revert routes in `App.tsx`.
