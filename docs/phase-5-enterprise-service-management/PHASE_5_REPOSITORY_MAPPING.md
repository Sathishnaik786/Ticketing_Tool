# PHASE 5 REPOSITORY MAPPING
# Repository Structure and ESM Module Codebase Mapping

This document maps all Phase 5 modules to their target folders in the Ticketra ETMS repository structure.

---

## 1. Actual Repository Structure

* **Backend:** `backend/src/`
  * Controllers are located in `backend/src/controllers/` or inline in modular directories.
  * Middleware is located in `backend/src/middlewares/` (e.g. JWT and RBAC checks).
  * Modules are located in `backend/src/modules/` (modular layout).
* **Frontend:** `frontend/src/`
  * Main routing configuration is in `frontend/src/App.tsx`.
  * Modular folders are located in `frontend/src/modules/`.
* **Database:** `backend/database/` contains SQL files and schemas for migrations.

---

## 2. ESM Module Mappings

### Module 1: Workflow Engine
* **Current Location:** Doesn't exist.
* **Recommended Location:**
  * Backend: `backend/src/modules/workflow-engine/`
  * Frontend: `frontend/src/modules/workflow-builder/`
* **Files To Create:**
  * Backend: `workflow.controller.js`, `workflow.routes.js`, `workflow-execution.service.js`
  * Frontend: `WorkflowListPage.tsx`, `WorkflowBuilderPage.tsx`, `WorkflowCanvas.tsx`, `useWorkflows.ts`
* **Files To Extend:**
  * Backend: `backend/database/schema.sql` (append migration scripts), `backend/src/app.js` (mount routes)
  * Frontend: `frontend/src/App.tsx` (add lazy-loaded routing imports)
* **Files To Avoid Touching:** Core ticket action files (`backend/src/modules/ticketing/ticketing.controller.js`).
* **Risk Level:** Medium. Requires intercepting ticket state updates without breaking legacy status tracking.

---

### Module 2: Approval Engine
* **Current Location:** Simple approval logic in `backend/src/modules/approval-management/`.
* **Recommended Location:**
  * Backend: `backend/src/modules/approval-engine/` (migration/refactor of old logic)
  * Frontend: `frontend/src/modules/approvals/`
* **Files To Create:**
  * Backend: `approval-policy.service.js`, `approval-execution.service.js`, `approval.routes.js`
  * Frontend: `ApprovalsDashboardPage.tsx`, `ApprovalDecisionCard.tsx`
* **Files To Extend:**
  * Backend: `backend/database/approval_engine_phase7_5.sql` (migrate/extend with levels tables)
* **Files To Avoid Touching:** Core user authentication middleware.
* **Risk Level:** High. Requires careful validation of signatures to prevent approval forgery.

---

### Module 3: Notification Engine
* **Current Location:** Simple notification logs in `backend/src/modules/notification-center/`.
* **Recommended Location:**
  * Backend: `backend/src/modules/notification-engine/`
  * Frontend: `frontend/src/modules/notifications/`
* **Files To Create:**
  * Backend: `notification-broker.service.js`, `template-parser.js`
  * Frontend: `NotificationPreferencesPage.tsx`
* **Files To Extend:**
  * Backend: `backend/src/socketHandlers.js` (integrate notification alerts)
* **Files To Avoid Touching:** Native Express email SMTP client setups.
* **Risk Level:** Low. Operates completely out-of-process via BullMQ.

---

### Module 4: SLA Engine
* **Current Location:** Static priority alerts in frontend dashboards.
* **Recommended Location:**
  * Backend: `backend/src/modules/sla-engine/`
  * Frontend: `frontend/src/modules/sla/`
* **Files To Create:**
  * Backend: `sla-policy.service.js`, `sla-monitor.cron.js`, `sla.routes.js`
  * Frontend: `SlaTimerCard.tsx`, `SlaManagementPage.tsx`
* **Files To Extend:**
  * Database: Additive tables in `backend/database/indexes.sql`
* **Files To Avoid Touching:** Core ticketing tables schema.
* **Risk Level:** Medium. Background evaluation scripts must not cause database resource exhaustion.

---

### Module 5: Service Catalog
* **Current Location:** Doesn't exist.
* **Recommended Location:**
  * Backend: `backend/src/modules/catalog-engine/`
  * Frontend: `frontend/src/modules/catalog/`
* **Files To Create:**
  * Backend: `catalog.controller.js`, `catalog.routes.js`, `service-request.service.js`
  * Frontend: `CatalogBrowserPage.tsx`, `CatalogRequestPage.tsx`, `CatalogFormRenderer.tsx`
* **Files To Extend:**
  * Frontend: Navigation menus inside sidebar layouts (`frontend/src/components/layout/sidebar/Sidebar.tsx`)
* **Files To Avoid Touching:** Existing HR forms and employees data grids.
* **Risk Level:** Low. Additive component relying on core ticketing submission pipelines.

---

### Module 6: Automation Engine
* **Current Location:** Simple trigger functions.
* **Recommended Location:**
  * Backend: `backend/src/modules/automation-engine/`
  * Frontend: `frontend/src/modules/automation/`
* **Files To Create:**
  * Backend: `automation-rule.service.js`, `rule-evaluator.js`
  * Frontend: `AutomationListPage.tsx`, `AutomationBuilderPage.tsx`
* **Files To Extend:**
  * Backend: Event triggers inside ticketing controllers (`backend/src/modules/ticketing/`)
* **Files To Avoid Touching:** Database configuration scripts.
* **Risk Level:** High. Requires loop detection controls to prevent infinite action loops.

---

### Module 7: Analytics Engine
* **Current Location:** Raw database aggregates in `backend/src/modules/executive-analytics/`.
* **Recommended Location:**
  * Backend: `backend/src/modules/analytics-engine/`
  * Frontend: `frontend/src/modules/analytics/`
* **Files To Create:**
  * Backend: `kpi.service.js`, `reporting-snapshots.cron.js`
  * Frontend: `ExecutiveCommandPage.tsx`, `CapacityPlanningPage.tsx`, `ServiceHealthPage.tsx`
* **Files To Extend:**
  * Backend: `backend/src/modules/executive-analytics/executive.routes.js` (extend with snapshot endpoints)
* **Files To Avoid Touching:** Core transaction logs.
* **Risk Level:** Medium. Aggregation logic must run asynchronously to prevent database transaction delays.
