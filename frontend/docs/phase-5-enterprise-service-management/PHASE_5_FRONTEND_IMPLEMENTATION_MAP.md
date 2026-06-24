# FRONTEND IMPLEMENTATION MAP
# Modules Specifications for React ESM Components

This document defines pages, components, client-side hooks, services, and route gates for all frontend ESM modules.

---

## 1. Workflow Builder (`workflow-builder/`)

* **Pages:**
  * `WorkflowListPage.tsx`: Displays list of created workflows, statuses (Draft, Published), and versions.
  * `WorkflowBuilderPage.tsx`: Interactive canvas editor panel.
* **Components:**
  * `WorkflowCanvas.tsx`: Node container utilizing reactflow (or custom step lists) to build steps.
  * `StepConfigDrawer.tsx`: Configuration drawer for individual step roles and assignments.
* **Hooks:**
  * `useWorkflows.ts`: Manages workflow CRUD, draft commits, and rollback mutations.
* **Services:** `workflowService.ts`
  * API client wrappers for `/api/v1/workflows`.
* **Routes:** `/app/admin/workflows` and `/app/admin/workflows/:id/builder`.
* **Feature Flags & RBAC Gates:** Protected by `isWorkflowEnabled` flag and `requireRole(['ADMIN', 'MANAGER'])`.

---

## 2. Approvals (`approvals/`)

* **Pages:**
  * `ApprovalsDashboardPage.tsx`: Portal listing pending, approved, and historical requests.
* **Components:**
  * `ApprovalDecisionCard.tsx`: Interface with action triggers (Approve, Reject) and comment validation fields.
* **Hooks:**
  * `useApprovals.ts`: Queries pending items and processes actions.
* **Services:** `approvalService.ts`
  * Wrapper for `/api/v1/approvals` REST calls.
* **Routes:** `/app/approvals`.
* **Feature Flags & RBAC Gates:** Enabled for all roles (`ADMIN`, `MANAGER`, `HR`, `EMPLOYEE`), but limits list results using current user ID parameters.

---

## 3. Notifications Settings (`notifications/`)

* **Pages:**
  * `NotificationPreferencesPage.tsx`: Dashboard for users to configure channel targets (Email, SMS, Teams, Slack).
* **Components:**
  * `ChannelPreferenceRow.tsx`: Switch widgets to toggle preference parameters per template category.
* **Hooks:**
  * `useNotificationSettings.ts`: Manages preference reads and updates.
* **Services:** `notificationService.ts`
  * Interface for preference configurations.
* **Routes:** `/app/profile/notifications`.
* **Feature Flags & RBAC Gates:** None (open to all authenticated sessions).

---

## 4. Settings Registry (`settings/`)

* **Pages:**
  * `SystemSettingsPage.tsx`: Registry editor workspace.
* **Components:**
  * `SettingInputCard.tsx`: Displays variable attributes, description, regex guidelines, and validate inputs on save.
* **Hooks:**
  * `useSystemSettings.ts`: Pulls live configurations list and processes adjustments.
* **Services:** `settingsService.ts`
  * Client wrapper for `/api/v1/settings`.
* **Routes:** `/app/admin/settings`.
* **Feature Flags & RBAC Gates:** Protected by `requireRole(['ADMIN'])`.

---

## 5. Service Level Agreements (`sla/`)

* **Pages:**
  * `SlaManagementPage.tsx`: Policy list and targets settings.
* **Components:**
  * `SlaPolicyModal.tsx`: Creation modal for defining priorities, targets, and escalations.
  * `SlaTimerWidget.tsx`: Dynamic countdown timer displayed on ticket details.
* **Hooks:**
  * `useSlaPolicies.ts`: Manages policies CRUD.
  * `useSlaTimer.ts`: Calculates countdown and breach flags.
* **Services:** `slaService.ts`
  * Wrapper for `/api/v1/sla`.
* **Routes:** `/app/admin/sla`.
* **Feature Flags & RBAC Gates:** Protected by `isSlaEnabled` flag and `requireRole(['ADMIN', 'MANAGER'])`.

---

## 6. Service Catalog (`catalog/`)

* **Pages:**
  * `CatalogBrowserPage.tsx`: Catalog selector with category sidebars.
  * `CatalogRequestPage.tsx`: Form rendering page.
* **Components:**
  * `CatalogFormRenderer.tsx`: Dynamic form parser rendering inputs based on JSON schemes.
* **Hooks:**
  * `useCatalog.ts`: Queries category items and submits form payloads.
* **Services:** `catalogService.ts`
  * Client wrapper for `/api/v1/catalog`.
* **Routes:** `/app/catalog` and `/app/catalog/:id/request`.
* **Feature Flags & RBAC Gates:** Guarded by `isCatalogEnabled`. Open to all authenticated sessions.

---

## 7. Automation Engine (`automation/`)

* **Pages:**
  * `AutomationListPage.tsx`: Lists rules and historical execution logs.
  * `AutomationBuilderPage.tsx`: Canvas to configure trigger conditions and action sets.
* **Components:**
  * `RuleConditionRow.tsx`: Trigger match rule dropdown selectors.
* **Hooks:**
  * `useAutomation.ts`: Handles rules CRUD and parses logs.
* **Services:** `automationService.ts`
  * Wrapper for `/api/v1/automation`.
* **Routes:** `/app/admin/automation`.
* **Feature Flags & RBAC Gates:** Guarded by `isAutomationEnabled` and `requireRole(['ADMIN'])`.

---

## 8. Analytics (`analytics/`)

* **Pages:**
  * `ExecutiveDashboardPage.tsx`: Aggregated KPI metric dashboard.
  * `CapacityDashboardPage.tsx`: Agent load trends.
  * `ServiceHealthPage.tsx`: MTTR and SLA target stats.
* **Components:**
  * `KpiMetricCard.tsx`: Displays progress trends with skeleton loading placeholders.
  * `TelemetryChart.tsx`: Recharts component optimized with memoization.
* **Hooks:**
  * `useAnalytics.ts`: Queries metrics and requests report compilation.
* **Services:** `analyticsService.ts`
  * Client wrapper for `/api/v1/analytics`.
* **Routes:** `/app/executive/dashboard`, `/app/executive/capacity`, `/app/executive/health`.
* **Feature Flags & RBAC Gates:** Guarded by `isExecutiveIntelEnabled` and `requireRole(['ADMIN', 'MANAGER'])`.
