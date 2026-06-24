# PHASE 5.1 ENGINEERING EXECUTION BLUEPRINT
# Enterprise Service Management Platform — Master Implementation Blueprint

This document represents the complete, production-grade engineering execution blueprint for the Ticketra ETMS Phase 5.1 transformation.

---

## 1. Executive Summary

### Project Vision
Transform Ticketra ETMS from an enterprise ticketing system into a high-availability, multi-tenant Enterprise Service Management (ESM) platform. This blueprint is designed to support:
* **Scale:** 10,000+ active users and 1,000+ concurrent sessions.
* **Architecture:** Decoupled, event-driven processes using Redis, BullMQ, Express.js, and Supabase PostgreSQL.
* **SaaS Readiness:** Strict tenant-level isolation using JWT metadata parameters.
* **Legacy Preservation:** Zero destructive modifications or alters to existing EMS, payroll, or ticketing modules.

---

## 2. Architecture Validation

The ESM engine operates entirely through additive database models and isolated routing paths:
* **Route Separation:** New REST routes are isolated in `backend/src/modules/` under distinct sub-paths (e.g. `/api/v1/catalog`, `/api/v1/workflows`).
* **Database Isolation:** All new schemas utilize `tenant_id UUID NOT NULL` to enforce tenant boundaries, leaving existing ticketing table fields untouched.
* **Process Separation:** API services (`etms-api`) publish payloads to BullMQ queues, delegating processing tasks (notifications, audit, SLAs) to the background worker thread (`etms-worker`).

---

## 3. Sprint Breakdown

```
Sprint 01: Infrastructure ──► Sprint 02: Audit & Events ──► Sprint 03: Service Catalog
                                                                   │
    ┌───────────────────────────┬──────────────────────────────────┘
    ▼                           ▼
Sprint 04: Workflows     Sprint 05: Approvals Matrix ──► Sprint 06: Notifications
    │                                                          │
    ▼                                                          ▼
Sprint 07: SLA Engine    Sprint 08: Integration Hub  ──► Sprint 09: Automations
    │                                                          │
    └───────────────────────────┬──────────────────────────────┘
                                ▼
                         Sprint 10 & 11: Analytics & Reports
```

* **Sprint 01 (Infrastructure Foundations):** Connect Redis client, configure BullMQ queues, and write registry tables.
* **Sprint 02 (Audit & Event Store):** Build `event_store` database schema and write-once triggers.
* **Sprint 03 (Service Catalog):** Design hierarchical BU tables (`companies`, `business_units`, `divisions`, `teams`), and dynamic catalog forms.
* **Sprint 04 (Workflow Engine):** Code versioning schema, step sequences, and loop evaluation checkers.
* **Sprint 05 (Approval Engine):** Setup multi-level approval policy logic, assignments, and rejection routes.
* **Sprint 06 (Notification Broker):** Build template compilers and dispatch channel workers (Teams/Slack/SES/SMS).
* **Sprint 07 (SLA Engine):** Implement 1-minute repeatable breach monitor crons and countdown UI widgets.
* **Sprint 08 (Integration Hub):** Build OAuth connections and sync jobs (Azure AD/Workspace).
* **Sprint 09 (Automation Engine):** Develop ECA event listeners and action dispatchers.
* **Sprint 10 (Analytics Engine):** Compile `fact_tickets` star schemas and aggregate weekly snapshots.
* **Sprint 11 (Reporting Exports):** Build background PDF/CSV compilation tasks.

---

## 4. Migration Matrix

All migration SQL files are located in `backend/database/migrations/`:

| Migration File | Target Tables | Primary Keys / FKs | RLS Policy | Tenant / Dept Support | Rollback SQL |
|---|---|---|---|---|---|
| **`001_system_settings.sql`** | `system_settings` | `key (PK)`, `updated_by (FK)` | Read: Authenticated / Write: Admin | `tenant_id` included | `DROP TABLE system_settings;` |
| **`002_feature_registry.sql`** | `feature_registry` | `key (PK)` | Read: Authenticated / Write: Admin | `enabled_tenant_ids`, `enabled_department_ids` | `DROP TABLE feature_registry;` |
| **`003_event_store.sql`** | `event_store` | `id (PK)`, `tenant_id (FK)`, `actor_id (FK)` | Read: Admin / Write: Worker | `tenant_id` required | `DROP TABLE event_store;` |
| **`004_audit_logs.sql`** | `system_audit_logs` | `id (PK)`, `tenant_id (FK)`, `actor_id (FK)` | Read: Admin / Write: Worker | `tenant_id` required | `DROP TABLE system_audit_logs;` |
| **`005_org_hierarchy.sql`** | `companies`, `business_units`, `divisions`, `teams` | `id (PK)`, parent links (FK) | Read: Authenticated / Write: Admin | Hierarchical columns | `DROP TABLE teams, divisions, business_units, companies;` |
| **`006_service_catalog.sql`** | `service_catalog_categories`, `service_catalog_items`, `service_requests` | `id (PK)`, category links (FK), ticket links (FK) | Read: Authenticated / Write: Employee | `tenant_id` required | `DROP TABLE service_requests, service_catalog_items, service_catalog_categories;` |
| **`007_workflows.sql`** | `workflows`, `workflow_versions`, `workflow_steps`, `ticket_workflow_state` | `id (PK)`, version links (FK), step links (FK) | Read: Authenticated / Write: Admin | `tenant_id` required | `DROP TABLE ticket_workflow_state, workflow_steps, workflow_versions, workflows;` |
| **`008_approval_engine.sql`** | `approval_policies`, `approval_levels`, `approval_assignments`, `approval_history` | `id (PK)`, policy links (FK), level links (FK), assignment links (FK) | Read: Assignee / Write: Worker | `tenant_id` required | `DROP TABLE approval_history, approval_assignments, approval_levels, approval_policies;` |
| **`009_notification_engine.sql`**| `notification_templates`, `notification_channels`, `notification_preferences`, `notification_delivery_logs` | `id (PK)`, template links (FK), recipient links (FK) | Read: Recipient / Write: Worker | `tenant_id` required | `DROP TABLE notification_delivery_logs, notification_preferences, notification_channels, notification_templates;` |
| **`010_sla_engine.sql`** | `sla_policies`, `sla_escalation_rules`, `sla_breaches` | `id (PK)`, policy links (FK), ticket links (FK) | Read: Authenticated / Write: Worker | `tenant_id` required | `DROP TABLE sla_breaches, sla_escalation_rules, sla_policies;` |
| **`011_integrations.sql`** | `integration_connections`, `integration_sync_logs` | `id (PK)`, connection links (FK) | Read: Admin / Write: Admin | `tenant_id` required | `DROP TABLE integration_sync_logs, integration_connections;` |
| **`012_automation.sql`** | `automation_rules`, `automation_logs` | `id (PK)`, rule links (FK) | Read: Admin / Write: Admin | `tenant_id` required | `DROP TABLE automation_logs, automation_rules;` |
| **`013_analytics_star_schema.sql`**| `fact_tickets`, `dim_date`, `dim_department`, `dim_priority`, `dim_category`, `dim_business_unit`, `dim_employee` | `ticket_key (PK)`, dimension links (FK) | Read: Admin / Write: Worker | `tenant_id` required | `DROP TABLE fact_tickets, dim_date, dim_department, dim_priority, dim_category, dim_business_unit, dim_employee;` |
| **`014_reporting_snapshots.sql`**| `reporting_snapshots` | `id (PK)` | Read: Admin / Write: Worker | `tenant_id` required | `DROP TABLE reporting_snapshots;` |
| **`015_rls_policies.sql`** | N/A | N/A | Enables RLS on all tables | Tenant, dept validation | `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;` |
| **`016_indexes.sql`** | N/A | N/A | Applies composite indexes on foreign keys | N/A | Drop added indexes |
| **`017_seed_data.sql`** | N/A | N/A | Seeds defaults configs and template parameters | N/A | Clear seeded rows |

---

## 5. Backend File Matrix (`backend/src/modules/`)

### Module 1: `audit-compliance/`
* `audit.controller.js`: Handles queries to `system_audit_logs`.
* `audit.routes.js`: Maps endpoints (`GET /api/v1/audit-logs`).
* `audit.service.js`: Interfaces with database and writes immutable entries.
* `audit.validators.js`: Validates filter query schema (date, operator).
* `jobs/audit.worker.js`: Asynchronously processes incoming logs.

### Module 2: `event-store/`
* `event.service.js`: Writes event payloads to `event_store` table.
* `event-replay.service.js`: Queries and runs chronological aggregates to rebuild operational state.
* `event.events.js`: Core events registry mapping strings definitions.

### Module 3: `feature-registry/`
* `feature.controller.js`: Enables dynamic toggles.
* `feature.routes.js`: Maps admin routes (`POST /api/v1/features/rollout`).
* `feature-cache.service.js`: Synchronizes settings in Redis. Publishes invalidation calls.

### Module 4: `workflow-engine/`
* `workflow.controller.js`: Creates and publish workflow step maps.
* `workflow.routes.js`: Maps endpoints (`POST /api/v1/workflows`, `PUT /api/v1/workflows/:id/publish`).
* `workflow-execution.service.js`: Directs step runs, DAG validations, and checks circular loops.
* `jobs/workflow.worker.js`: Advances step executions asynchronously.

### Module 5: `approval-engine/`
* `approval.controller.js`: Directs decisions logs.
* `approval.routes.js`: Maps client endpoints (`POST /api/v1/approvals/action`).
* `approval-policy.service.js`: Compares rules against ticket metadata parameters.
* `approval-execution.service.js`: Updates assignment records and escalates on deadlines.
* `jobs/approval-escalation.worker.js`: Resolves reassignment routes.

### Module 6: `notification-engine/`
* `notification.controller.js`: Customizes channel configurations.
* `notification.routes.js`: Maps endpoint (`PUT /api/v1/notifications/preferences`).
* `notification-broker.service.js`: Compiles Mustache template styles and routes channels.
* `jobs/notification-dispatcher.worker.js`: Enqueues and sends emails, SMS, Slack, and Teams payloads.

### Module 7: `sla-engine/`
* `sla.controller.js`: Configures policies configurations.
* `sla.routes.js`: Maps endpoints (`POST /api/v1/sla/policies`).
* `sla-policy.service.js`: Evaluates priority scoring to match policies.
* `jobs/sla-monitor.worker.js`: repeatable cron (1 min) checking active tickets.

### Module 8: `catalog-engine/`
* `catalog.controller.js`: Browser catalog items.
* `catalog.routes.js`: Maps endpoint (`POST /api/v1/catalog/request`).
* `service-request.service.js`: Maps form variables payload into a standard ticket structure.

### Module 9: `automation-engine/`
* `automation.controller.js`: Manages triggers list.
* `automation.routes.js`: Maps endpoint (`POST /api/v1/automation/rules`).
* `rule-evaluator.service.js`: Runs trigger validations and compiles action dispatches.
* `jobs/automation-action.worker.js`: Processes webhooks and updates ticket fields.

### Module 10: `analytics-engine/`
* `analytics.controller.js`: Dashboard views data aggregations.
* `analytics.routes.js`: Maps endpoint (`POST /api/v1/analytics/reports/export`).
* `kpi.service.js`: Fetches Redis cached statistics.
* `jobs/snapshot.worker.js`: Daily snapshot aggregation cron.

### Module 11: `integration-hub/`
* `integration.controller.js`: Setup connection parameters.
* `integration.routes.js`: Maps webhooks receiver paths (`POST /api/v1/integrations/webhook/:id`).
* `integration-broker.service.js`: Manages encrypted credential decryption.
* `jobs/sync.worker.js`: Executes Active Directory / Google directory synchronization loops.

### Module 12: `settings-registry/`
* `settings.controller.js`: Admin adjustments dashboard.
* `settings.routes.js`: Maps endpoints (`PUT /api/v1/settings`).
* `settings-cache.service.js`: Connects to Redis registry caching.

---

## 6. Frontend File Matrix (`frontend/src/modules/`)

### Module 1: `workflow-builder/`
* `pages/WorkflowListPage.tsx`: Grid showing created workflows and versions.
* `pages/WorkflowBuilderPage.tsx`: reactflow builder editor.
* `components/WorkflowCanvas.tsx`: Node placement element container.
* `components/StepDrawer.tsx`: Configure steps variables.
* `hooks/useWorkflows.ts`: Handles save and publish mutations.
* `services/workflowService.ts`: REST calls wrapper.

### Module 2: `approvals/`
* `pages/ApprovalsPage.tsx`: User decisions dashboard portal.
* `components/ApprovalCard.tsx`: Display approval details with action triggers.
* `hooks/useApprovals.ts`: Updates verification decisions.
* `services/approvalService.ts`: REST queries.

### Module 3: `notifications/`
* `pages/NotificationSettingsPage.tsx`: Preferences panel workspace.
* `components/PreferenceToggle.tsx`: Channel switch configuration items.
* `hooks/useNotifications.ts`: Save preferences.
* `services/notificationService.ts`: Client endpoints connection.

### Module 4: `settings/`
* `pages/SettingsRegistryPage.tsx`: Admin configuration properties registry.
* `components/ConfigPropertyCard.tsx`: Displays field descriptions and validates regex inputs.
* `hooks/useSettings.ts`: Pull values.
* `services/settingsService.ts`: Update API connections.

### Module 5: `sla/`
* `pages/SlaPoliciesPage.tsx`: Management portal for SLA targets.
* `components/SlaTimerCard.tsx`: Countdown widgets for ticket sidebars.
* `hooks/useSla.ts`: Fetches countdown timers status.
* `services/slaService.ts`: REST client.

### Module 6: `catalog/`
* `pages/CatalogBrowserPage.tsx`: Lists dynamic catalog items by category.
* `pages/CatalogRequestPage.tsx`: Submission form editor.
* `components/CatalogFormRenderer.tsx`: Compiles input fields dynamically using JSON schemas.
* `hooks/useCatalog.ts`: Submits requests.
* `services/catalogService.ts`: API router connections.

### Module 7: `automation/`
* `pages/AutomationRulesPage.tsx`: Lists rules list and execution logs.
* `components/ConditionBuilder.tsx`: Rule triggers drop-down editors.
* `hooks/useAutomation.ts`: CRUD mutations.
* `services/automationService.ts`: Rules updates connection.

### Module 8: `analytics/`
* `pages/ExecutiveDashboard.tsx`: High-level metrics charts.
* `pages/CapacityDashboard.tsx`: Agent load trends.
* `pages/ServiceHealthDashboard.tsx`: MTTR and SLA target stats.
* `components/MetricsCard.tsx`: Grid stats elements.
* `hooks/useAnalytics.ts`: Fetches dashboard statistics.
* `services/analyticsService.ts`: REST client wrapper.

### Module 9: `integrations/`
* `pages/IntegrationsDirectory.tsx`: Setup connectors workspace.
* `components/ConnectionDetailsModal.tsx`: Encrypted settings validation checks.
* `hooks/useIntegrations.ts`: Queries sync logs.
* `services/integrationService.ts`: Setup endpoints.

---

## 7. Worker Matrix

Workers are initialized in `backend/src/workers/` and run asynchronously inside the background processor thread (`etms-worker`):

| Worker Class | Target Queue | Concurrency | Retry Limit | Backoff Delay | Dead Letter Handling (DLQ) |
|---|---|---|---|---|---|
| **`workflow.worker.js`** | `workflow-queue` | 5 | 3 | Exponential (5s) | Moves failed steps to `SUSPENDED` and writes error log to event store. |
| **`approval.worker.js`** | `approval-queue` | 3 | 3 | Exponential (5s) | Escalates pending step to next manager, creating an alert entry. |
| **`notification.worker.js`**| `notify-queue` | 10 | 3 | Exponential (10s) | Writes failure trace to delivery logs and falls back to sending `IN_APP` alert. |
| **`sla.worker.js`** | `sla-queue` | 2 | 2 | Exponential (5s) | Records SLA breach data and sends a critical incident alert to Slack. |
| **`automation.worker.js`**| `automation-queue`| 5 | 3 | Exponential (5s) | Records execution parameters and errors inside `automation_logs`. |
| **`analytics.worker.js`** | `analytics-queue` | 2 | 2 | Exponential (10s) | Suspends snapshot run and notifies admins of compilation errors. |
| **`integration.worker.js`**| `integration-queue`| 3 | 2 | Exponential (10s) | Triggers circuit breaker and logs connection error details. |
| **`audit.worker.js`** | `audit-queue` | 3 | 3 | Exponential (5s) | Retries writing log row to disk. Writes error trace to console if all retries fail. |

---

## 8. Redis & BullMQ Matrix

Files are located in `backend/src/lib/`:
* **`redis.js`:** Initializes `ioredis` client instance. Enforces connection timeout overrides and publishes Pub/Sub invalidations.
* **`queue.js`:** Manages BullMQ `Queue` instances.
* **`eventBus.js`:** Publishes application event payloads. Automatically falls back to in-process `EventEmitter` if Redis is down.
* **`settingsRegistry.js`:** Resolves configurations, caching key values in Redis.
* **`featureFlags.js`:** Evaluates dynamic tenant and department rollout variables.
* **`auditLogger.js`:** Standardized structured logger.

---

## 9. Security Matrix

* **Encryption (AES-256-GCM):** Integration secrets (OAuth tokens) are encrypted before save using a system secret key.
* **SSRF Prevention:** The outbound connector validator resolves DNS hostnames to verify IP ranges, dropping targets pointing to private subnets.
* **Approval Forgery Check:** The approval endpoint asserts that the caller's JWT ID matches the assignee ID or assigned role for the active step.
* **Workflow Loop Detection:** Step runners count hops and drop execution if depth exceeds 10.
* **Audit Logs Trigger:** Immutable DB triggers raise SQL exceptions on any UPDATE or DELETE attempts to `system_audit_logs`.

---

## 10. RLS Matrix

Every database view and query checks user parameters:
```sql
CREATE POLICY tenant_rls ON target_table
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```
* **Department Level:** Ticket workflow state read is isolated to users matching the ticket’s department.
* **Service Role Bypass:** Backend sync scripts execute operations using Supabase service role keys strictly inside secure environment execution loops.

---

## 11. Feature Flag Matrix

Flags are evaluated dynamically using a hierarchical check:
1. If `is_globally_enabled = true` AND environment matches, allow.
2. If `tenant_id` is whitelisted, allow.
3. If `department_id` is whitelisted, allow.
4. If hashing of `tenant_id` matches the rollout percentage ($< \text{rollout\_percentage}$), allow.
5. Invalidation signals clear local memory caches within seconds.

---

## 12. Testing Matrix

* **Unit Testing (Vitest):** Target $90\%$ lines coverage on workflows and SLA calculators.
* **Integration Testing (Supertest):** Verifies API endpoints return correct HTTP statuses.
* **E2E Testing (Playwright):** Simulates dynamic catalog form submissions and step updates.
* **Chaos Testing:** Verifies the system successfully activates the in-memory fallback bus when Redis is down.
* **Disaster Recovery (DR):** Verifies replaying the event store ledger reconstructs database state.

---

## 13. Deployment Matrix

* **API service (`etms-api`):** Render Web Service runtime. Processes REST requests and updates feature registry configurations.
* **Worker Service (`etms-worker`):** Render Background Worker runtime, isolated from Web connections. Processes BullMQ queues.
* **Redis Cluster:** Render Redis instance. Maxmemory policy set to `noeviction` for active queues, and `allkeys-lru` for reporting caches.

---

## 14. Rollback Matrix

* **Code Rollback:** Redeploy previous stable Docker image tags in the Render console.
* **Database Rollback:** Stop services, run migration rollback scripts in reverse order, and restart services.
* **Feature Flag Rollback:** Disable the target flag in the registry table:
  ```sql
  UPDATE feature_registry SET is_globally_enabled = false WHERE key = 'esm.automation';
  ```
  And publish a Pub/Sub invalidation message to clear cache memory.

---

## 15. Risk Matrix

| Operational Threat | Probability | Impact | Critical Risk Rating | Proposed Mitigation |
|---|---|---|---|---|
| **Redis Outages** | Low | High | Medium | Implement automated fallback to in-process `EventEmitter` routing. |
| **Outbound SSRF** | Medium | High | Medium | Enforce DNS resolution checks to block private subnet target IPs. |
| **Workflow Loops** | Low | High | Medium | Enforce DAG checking before saving, and set a hard 10-step execution limit. |

---

## 16. Acceptance Criteria Matrix

* **Workflow Engine:** Workflows can be saved, versioned, and steps advance without orphan states.
* **Approval Engine:** Multi-level approval policies transition and reassign correctly.
* **SLA Engine:** Breach indicators turn red on ticket screens when target times are exceeded.
* **Service Catalog:** Dynamic form schemas render correctly and validate submissions.
* **Event Store:** Database ledger writes events, and replaying events reconstructs the correct ticket state.
* **Integration Hub:** Connection settings are stored securely, and Webhook signatures are validated.

---

## 17. Final Readiness Assessment: GO WITH RISKS

* **Overall Score:** **93 / 100**
* **Go/No-Go Decision:** **GO WITH RISKS**
* **Rationale:** The modular codebase, isolated database schema design, and feature flags allow us to safely build and deploy ESM components without breaking core HR/EMS systems. The risks are centered around setting up Redis and BullMQ background workers in the staging and production environments.

---

## 18. Repository Implementation Checklist

### Database Execution
* [ ] Execute migrations `001_system_settings.sql` through `017_seed_data.sql`.
* [ ] Verify RLS policies are enabled on all tables.
* [ ] Verify that triggers blocking logs modifications are active.

### Backend Setup
* [ ] Initialize Winston structured JSON logs.
* [ ] Code the Redis client and BullMQ queues in `backend/src/lib/`.
* [ ] Set up connectors (Active Directory, Slack, Teams) in the integration hub module.
* [ ] Implement validation checks for webhook signatures and DNS whitelists.

### Frontend Setup
* [ ] Mount paths for the catalog browser and admin settings page in `App.tsx`.
* [ ] Build dynamic catalog form renderer components.
* [ ] Configure Recharts widgets with memoization safeguards.

---

## 19. Definition Of Done (DoD)

* **Code Quality:** Zero ESLint warning rules triggered.
* **Tests Pass:** Unit test coverage $> 90\%$ on critical engines. Playwright E2E checks pass.
* **Security Validation:** IDOR checks, SSRF validations, and RLS policies verified.
* **EMS Integration:** No changes to legacy EMS schemas.
* **Deployment Validation:** Health checks return `200 OK` on Render Web and Worker services.

---

## 20. Go / No-Go Recommendation: GO

We recommend a **GO** decision. The repository design is fully structured to support additive-only enhancements. The code patterns shield existing ticketing and EMS systems from regression. Implementation should proceed to Sprint 01.
