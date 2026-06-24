# DATABASE IMPACT ANALYSIS
# Enterprise Service Management Platform — Database Audit

---

## 1. Additive Database Schema Design

All changes to the database layer are strictly **additive**. No existing tables belonging to EMS (e.g. `employees`, `attendance`, `payroll`) or standard ETMS tables will be modified or altered.

```
                  ┌──────────────────────┐
                  │       tickets        │
                  └──────────┬───────────┘
                             │ (1:N)
         ┌───────────────────┼───────────────────┐
         │ (1:1)             │ (1:N)             │ (1:1)
┌────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│ workflow_state   ││  sla_breaches    ││ service_requests │
└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
         │ (N:1)             │ (N:1)             │ (N:1)
┌────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│    workflows     ││   sla_policies   ││  catalog_items   │
└──────────────────┘└──────────────────┘└────────┬─────────┘
                                                 │ (N:1)
                                        ┌────────▼─────────┐
                                        │catalog_categories│
                                        └──────────────────┘
```

---

## 2. Table-by-Table Database Design

### Workflow Engine Tables
1. **`workflows`**: Defines the workflow configuration.
   * *Fields:* `id (UUID, PK)`, `name (VARCHAR)`, `description (TEXT)`, `is_active (BOOLEAN)`, `created_at`, `updated_at`.
2. **`workflow_steps`**: Individual stages in a workflow path.
   * *Fields:* `id (UUID, PK)`, `workflow_id (UUID, FK -> workflows)`, `step_order (INT)`, `name (VARCHAR)`, `type (VARCHAR: APPROVAL, NOTIFICATION, RESOLUTION)`, `assigned_role (VARCHAR)`, `assigned_user_id (UUID, FK -> auth.users)`, `created_at`, `updated_at`.
3. **`ticket_workflow_state`**: Maps active runtime workflows to tickets.
   * *Fields:* `id (UUID, PK)`, `ticket_id (UUID, FK -> tickets)`, `workflow_id (UUID, FK -> workflows)`, `current_step_id (UUID, FK -> workflow_steps)`, `status (VARCHAR: IN_PROGRESS, COMPLETED, FAILED)`, `updated_at`.

### SLA Engine Tables
1. **`sla_policies`**: Define thresholds for response and resolution.
   * *Fields:* `id (UUID, PK)`, `name (VARCHAR)`, `priority (VARCHAR: LOW, MEDIUM, HIGH, URGENT)`, `response_target_mins (INT)`, `resolution_target_mins (INT)`, `is_active (BOOLEAN)`.
2. **`sla_breaches`**: Tracks SLA breach alerts.
   * *Fields:* `id (UUID, PK)`, `ticket_id (UUID, FK -> tickets)`, `policy_id (UUID, FK -> sla_policies)`, `breach_type (VARCHAR: RESPONSE, RESOLUTION)`, `target_time (TIMESTAMP)`, `breached_at (TIMESTAMP)`, `is_acknowledged (BOOLEAN)`.

### Service Catalog Tables
1. **`service_catalog_categories`**: Hierarchical classification for catalog items.
   * *Fields:* `id (UUID, PK)`, `name (VARCHAR)`, `icon (VARCHAR)`, `is_active (BOOLEAN)`.
2. **`service_catalog_items`**: Requestable offerings.
   * *Fields:* `id (UUID, PK)`, `category_id (UUID, FK -> service_catalog_categories)`, `name (VARCHAR)`, `description (TEXT)`, `form_schema (JSONB)`, `workflow_id (UUID, FK -> workflows, Nullable)`, `is_active (BOOLEAN)`.
3. **`service_requests`**: Records submission payloads.
   * *Fields:* `id (UUID, PK)`, `catalog_item_id (UUID, FK -> service_catalog_items)`, `ticket_id (UUID, FK -> tickets)`, `requested_by (UUID, FK -> auth.users)`, `form_responses (JSONB)`.

### Automation Engine Tables
1. **`automation_rules`**: Define ECA (Event-Condition-Action) triggers.
   * *Fields:* `id (UUID, PK)`, `name (VARCHAR)`, `event_trigger (VARCHAR)`, `conditions (JSONB)`, `actions (JSONB)`, `is_active (BOOLEAN)`.
2. **`automation_logs`**: Executions log for audit trails.
   * *Fields:* `id (UUID, PK)`, `rule_id (UUID, FK -> automation_rules)`, `ticket_id (UUID, FK -> tickets)`, `status (VARCHAR)`, `error_message (TEXT)`, `executed_at`.

### Executive Analytics & Snapshot Tables
1. **`reporting_snapshots`**: Weekly/monthly system metrics.
   * *Fields:* `id (UUID, PK)`, `snapshot_date (DATE)`, `metric_name (VARCHAR)`, `metric_value (NUMERIC)`, `dimensions (JSONB)`.

### Audit Tables
1. **`system_audit_logs`**: Immutable history of admin configuration adjustments.
   * *Fields:* `id (UUID, PK)`, `actor_id (UUID, FK -> auth.users)`, `action (VARCHAR)`, `target_entity (VARCHAR)`, `target_id (UUID)`, `old_values (JSONB)`, `new_values (JSONB)`, `created_at`.

---

## 3. FK Integrity & Indexing Coverage

To maintain fast query response times under high concurrency, indexes are required on foreign keys and active lookup columns:
* **Workflows:** Index on `ticket_workflow_state.ticket_id`, and index on `workflow_steps.workflow_id`.
* **SLA:** Index on `sla_breaches.ticket_id`, and composite index on `(ticket_id, breach_type)` to check breaches rapidly.
* **Catalog:** Index on `service_catalog_items.category_id` and `service_requests.ticket_id`.
* **Audit:** Index on `system_audit_logs.actor_id` and `(target_entity, target_id)`.

---

## 4. Migration Order & Rollout Plan

1. **Category & Metadata Tables:** Create `workflows`, `sla_policies`, and `service_catalog_categories`.
2. **Configuration Definition Tables:** Create `workflow_steps`, `service_catalog_items`, and `automation_rules`.
3. **Transactional & Operations Mapping Tables:** Create `ticket_workflow_state`, `sla_breaches`, `service_requests`, and `automation_logs`.
4. **Analytics & Aggregation Tables:** Create `reporting_snapshots`.
5. **Security & Governance Logs:** Create `system_audit_logs` and apply Postgres write-once trigger logic.
6. **Apply RLS Policies:** Apply Supabase RLS and policies to all newly created tables.

---

## 5. RLS Requirements

* **Read Permissions:** Catalog items, categories, and active SLA targets are readable by authenticated users.
* **Update Permissions:** Workflow states, SLA breaches, rule triggers, and audit logs are read-only for employees and updating is restricted to backend services (using service keys/security contexts).
* **Write Permissions:** Form submissions (`service_requests`) are write-enabled for authenticated users.
