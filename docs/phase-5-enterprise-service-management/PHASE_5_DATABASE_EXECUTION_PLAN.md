# DATABASE EXECUTION PLAN
# Database Migration Strategy, RLS Configuration, and Rollback Procedures

This document outlines the database deployment sequence, index designs, row-level security (RLS) policies, and rollback paths for all Phase 5 tables.

---

## 1. Migration Sequence (Execution Order)

To ensure foreign key integrity, migrations must execute in the following order:

```
Step 1: Base Config & Tenant Tables
  ├── system_settings
  └── companies
        └── business_units
              └── divisions
                    └── teams

Step 2: Workflow Config Tables
  └── workflows
        └── workflow_versions
              └── workflow_steps

Step 3: SLA Config Tables
  └── sla_policies
        └── sla_escalation_rules

Step 4: Approval Config Tables
  └── approval_policies
        └── approval_levels

Step 5: Notification Config Tables
  └── notification_templates
        └── notification_channels
              └── notification_preferences

Step 6: Operational & Transaction Tables
  ├── ticket_workflow_state
  ├── approval_assignments
  │     └── approval_history
  └── notification_delivery_logs

Step 7: Analytics & System Logs
  ├── reporting_snapshots
  └── system_audit_logs
```

---

## 2. Foreign Keys & Indexes Specification

### Indexes on Lookup Columns
* **Workflows:**
  * `CREATE INDEX idx_wv_workflow ON workflow_versions(workflow_id);`
  * `CREATE INDEX idx_ws_version ON workflow_steps(version_id);`
  * `CREATE INDEX idx_tws_ticket ON ticket_workflow_state(ticket_id);`
* **Approvals:**
  * `CREATE INDEX idx_al_policy ON approval_levels(policy_id);`
  * `CREATE INDEX idx_aa_level ON approval_assignments(level_id);`
  * `CREATE INDEX idx_aa_ticket ON approval_assignments(ticket_id);`
  * `CREATE INDEX idx_ah_assignment ON approval_history(assignment_id);`
* **Notifications:**
  * `CREATE INDEX idx_np_user ON notification_preferences(user_id);`
  * `CREATE INDEX idx_ndl_recipient ON notification_delivery_logs(recipient_id);`
* **SLA Policies:**
  * `CREATE INDEX idx_ser_policy ON sla_escalation_rules(policy_id);`
* **Organizational Structure:**
  * `CREATE INDEX idx_bu_company ON business_units(company_id);`
  * `CREATE INDEX idx_div_bu ON divisions(business_unit_id);`
  * `CREATE INDEX idx_teams_dept ON teams(department_id);`

---

## 3. Row-Level Security (RLS) Strategy

All tables must have RLS enabled. Security policies are structured as follows:

### 1. Configuration Tables
* *Tables:* `workflows`, `workflow_versions`, `workflow_steps`, `approval_policies`, `approval_levels`, `sla_policies`, `sla_escalation_rules`, `notification_templates`, `notification_channels`, `system_settings`.
* *Read Policy:* `true` (readable by all authenticated users to allow normal app execution).
* *Write/Update/Delete Policy:* `auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')))` (restricted to Administrators and Managers).

### 2. Operational Transaction Tables
* *Tables:* `ticket_workflow_state`, `approval_assignments`, `approval_history`, `notification_preferences`, `notification_delivery_logs`, `service_requests`.
* *Read Policy:* Authenticated users can view records belonging to them (e.g. assignments matching their user ID or role) or records associated with tickets they have permission to access.
* *Write/Update Policy:* Restricted to system worker scopes (bypass via service role credentials) or specific assigned actors (e.g. users updating their own pending approval assignments).

### 3. Immutable System Log Tables
* *Tables:* `system_audit_logs`.
* *Read Policy:* Restricted to admins (`role = 'ADMIN'`).
* *Write Policy:* Restricted to the backend database service key context.
* *Update/Delete Policy:* Denied globally. Trigger checks raise exceptions on any write/delete operations.

---

## 4. Migration Rollback Strategy

Each migration step must have a corresponding rollback SQL script. The execution path is reversed:

1. **Step 1 (Operational logs):** Drop tables `system_audit_logs` and `reporting_snapshots`.
2. **Step 2 (Transaction logs):** Drop tables `notification_delivery_logs`, `approval_history`, `approval_assignments`, and `ticket_workflow_state`.
3. **Step 3 (Notification configs):** Drop tables `notification_preferences`, `notification_channels`, and `notification_templates`.
4. **Step 4 (Approval configs):** Drop tables `approval_levels` and `approval_policies`.
5. **Step 5 (SLA configs):** Drop tables `sla_escalation_rules` and `sla_policies`.
6. **Step 6 (Workflow configs):** Drop tables `workflow_steps`, `workflow_versions`, and `workflows`.
7. **Step 7 (Hierarchy & Registry):** Drop tables `teams`, `divisions`, `business_units`, `companies`, and `system_settings`. Remove added columns `division_id` and `team_id` from existing departments and employees tables.
