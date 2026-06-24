# PHASE 5 ENTERPRISE GAP ANALYSIS
# ESM Transformation — Gap Analysis & Strategic Evaluation

This document outlines the gaps between the current Ticketra ETMS codebase and the requirements for a full Enterprise Service Management (ESM) platform.

---

## Gap 1: Business Unit Hierarchy

* **Current State:** The system only supports flat `departments` (e.g. IT, HR) without hierarchical division or multi-entity business unit mapping.
* **Risk:** Inability to support large enterprises with multiple corporate subsidiaries, business divisions, and distinct departmental hierarchies.
* **Impact:** High. Leads to access control policy leakage, where agents in Subsidiary A can see structures and records belonging to Subsidiary B.
* **Recommendation:** Introduce a hierarchical organizational design model supporting Company -> Business Unit -> Division -> Department -> Team.
* **Implementation Priority:** High (Phase 5.0).
* **Migration Strategy:** Maintain existing `departments` table but append optional nullable columns `division_id` and `business_unit_id` to establish the hierarchy gradually without breaking active foreign keys.

---

## Gap 2: Workflow Versioning

* **Current State:** Workflows are edited in place directly. If a workflow step configuration is updated, all tickets referencing that workflow immediately experience the new step layout.
* **Risk:** Changing steps for active tickets can break their in-progress workflow execution state, leading to orphans or crashes during transition checks.
* **Impact:** Critical. Causes database execution exceptions and workflow halts for active client tickets.
* **Recommendation:** Implement a versioned workflow schema. Active tickets run on the version of the workflow they were created under, while new tickets fetch the latest active published version.
* **Implementation Priority:** Critical (Phase 5.0).
* **Migration Strategy:** Move step definitions to a `workflow_versions` table and map tickets directly to the workflow version instance.

---

## Gap 3: Approval Matrix Engine

* **Current State:** Approvals are handled inline within ticket actions or via simple sequential ticket update loops.
* **Risk:** Inability to configure conditional approval paths (e.g., spending limit > $5,000 requires VP approval; > $10,000 requires CFO approval).
* **Impact:** High. Administrative approval paths remain hardcoded, slowing down operational governance changes.
* **Recommendation:** Decouple approvals from tickets into a standalone rules-based Approval Engine with multi-level delegation and automatic escalation rules.
* **Implementation Priority:** High (Phase 5.1).
* **Migration Strategy:** Seed standard approval configurations into a distinct `approval_policies` schema that listens to ticket updates.

---

## Gap 4: Notification Framework

* **Current State:** Notification triggers are hardcoded directly inside operational methods, using local emails or basic websocket broadcasts.
* **Risk:** Adding messaging channels (Slack, Teams, SMS) creates nested, duplicate dispatch code inside business logic controllers.
* **Impact:** Medium. Code duplication makes maintenance slow and prone to notification misses.
* **Recommendation:** Create a centralized Notification Broker that receives events, evaluates user preferences, loads HTML/markdown templates, and enqueues dispatch tasks via BullMQ.
* **Implementation Priority:** High (Phase 5.0).
* **Migration Strategy:** Build an additive template parser, and route existing notification dispatches through it.

---

## Gap 5: System Settings Registry

* **Current State:** Configuration constants (e.g. max workflow depth, ticket caches, SLA monitoring schedules) are hardcoded in environment variables or configuration files.
* **Risk:** Tuning system performance requires restarting servers or redeploying code.
* **Impact:** Low. Causes operational friction during load adjustments.
* **Recommendation:** Introduce a dynamic `system_settings` table in the database, cached in Redis, to store system settings with an admin UI for live tuning.
* **Implementation Priority:** Medium (Phase 5.0).
* **Migration Strategy:** Initialize the registry database table and fallback to existing config values if a setting is missing.

---

## Gap 6: Analytics Data Model Strategy

* **Current State:** Analytical queries perform aggregations on raw transactional database tables, caching results temporarily in local views.
* **Risk:** Large historical queries lock active ticket tables, slowing down operational transactions.
* **Impact:** High. Performance slows down under heavy reporting requests.
* **Recommendation:** Adopt an ETL snapshot model storing weekly aggregates, transitioning to a dedicated analytical Star Schema (`fact_tickets` and dimension tables) in production.
* **Implementation Priority:** Medium (Phase 5.3).
* **Migration Strategy:** Build background schedulers to aggregate ticket records into snapshot tables asynchronously during off-peak hours.

---

## Gap 7: Audit Retention Strategy

* **Current State:** Audit logs are saved indefinitely in a single table, with no automated partition or pruning strategy.
* **Risk:** The audit database table size grows exponentially, leading to slow search lookups and high database storage bills.
* **Impact:** Medium. Long-term performance decreases.
* **Recommendation:** Enforce a partition scheme (e.g., monthly tables) and support automatic archiving to cold object storage (S3/Supabase Storage) based on retention limits.
* **Implementation Priority:** Medium (Phase 5.0).
* **Migration Strategy:** Seed default partition boundaries and implement a clean sweep cron worker.

---

## Gap 8: SLA Scope Model

* **Current State:** SLA policies only check ticket priority levels.
* **Risk:** Inability to define custom SLA targets based on category, request type, customer division, or service catalog item.
* **Impact:** High. Critical enterprise requests are not tracked with appropriate urgency.
* **Recommendation:** Enhance SLA schemas to support composite inheritance rules and conditional matches.
* **Implementation Priority:** High (Phase 5.1).
* **Migration Strategy:** Introduce additive matching columns to `sla_policies` and run matches using a priority scoring engine.

---

## Gap 9: Multi-Department Support

* **Current State:** The system is single-tenant focused with departments sharing access to a common tickets pool under shared role filters.
* **Risk:** Cross-department ticket transfers might expose sensitive information (e.g. moving a ticket from IT to HR could expose confidential payroll details).
* **Impact:** Critical. Leads to compliance and privacy breaches.
* **Recommendation:** Implement strict RLS boundaries that segment ticket visibility by department, requiring explicit user transitions and transfer approvals.
* **Implementation Priority:** High (Phase 5.0).
* **Migration Strategy:** Update existing RLS policies to check the department ID of both the ticket and the user.

---

## Gap 10: Future Multi-Tenant Readiness

* **Current State:** Core data tables do not include a tenant identification column, meaning all client data is stored globally.
* **Risk:** Transitioning to a SaaS model requires costly database refactoring to split records by customer.
* **Impact:** Medium. Restricts business growth opportunities.
* **Recommendation:** Ensure all new ESM tables include a `tenant_id` column to support logical tenant separation, even if the value defaults to a single tenant for now.
* **Implementation Priority:** Low (Phase 5.0).
* **Migration Strategy:** Build all new database structures with a tenant column, establishing logical isolation layers from day one.
