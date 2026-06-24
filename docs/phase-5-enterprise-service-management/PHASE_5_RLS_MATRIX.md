# PHASE 5 ROW-LEVEL SECURITY (RLS) MATRIX
# Enterprise Security, Tenant Segmentation, and Compliance Gates

This document defines the Row-Level Security (RLS) matrices, data classification rules, and tenant/department isolation policies for all tables in Phase 5.

---

## 1. RLS Permissions Matrix

All tables are segmented by `tenant_id` and, where applicable, `department_id` to guarantee isolated data contexts.

| Table Name | SELECT (Read) | INSERT (Write) | UPDATE (Edit) | DELETE (Remove) | Service Role | Tenant Isolation Rule | Dept Isolation Rule |
|---|---|---|---|---|---|---|---|
| **`system_settings`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`feature_registry`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`companies`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `id` as tenant | Global to tenant |
| **`business_units`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`divisions`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`teams`** | Authenticated | Admin / Mgr | Admin / Mgr | Denied | Bypass / Full | Match `tenant_id` | Match `department_id` |
| **`workflows`** | Authenticated | Admin / Mgr | Admin / Mgr | Denied | Bypass / Full | Match `tenant_id` | Match assigned dept |
| **`workflow_versions`** | Authenticated | Admin / Mgr | Admin / Mgr | Denied | Bypass / Full | Match `tenant_id` | Match parent workflow |
| **`workflow_steps`** | Authenticated | Admin / Mgr | Admin / Mgr | Denied | Bypass / Full | Match `tenant_id` | Match parent version |
| **`ticket_workflow_state`**| Assigned / Agent| Worker | Worker | Denied | Bypass / Full | Match `tenant_id` | Match ticket dept |
| **`approval_policies`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`approval_levels`** | Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`approval_assignments`**| Assignee / Agent | Worker | Assignee | Denied | Bypass / Full | Match `tenant_id` | Match assignee dept |
| **`approval_history`** | Authenticated | Assignee | Denied | Denied | Bypass / Full | Match `tenant_id` | Match ticket dept |
| **`notification_templates`**| Authenticated | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`notification_channels`** | Admin | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`notification_preferences`**| Owner | Owner | Owner | Denied | Bypass / Full | Match `tenant_id` | Global to owner |
| **`notification_delivery_logs`**| Recipient / Admin| Worker | Denied | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`event_store`** | Admin | Worker | Denied | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`system_audit_logs`** | Admin | Worker | Denied | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`integration_connections`**| Admin | Admin | Admin | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |
| **`integration_sync_logs`**| Admin | Worker | Denied | Denied | Bypass / Full | Match `tenant_id` | Global to tenant |

---

## 2. Tenant Isolation Enforcement

Every query executing via the client interfaces is routed through Supabase RLS which asserts:
```sql
CREATE POLICY tenant_isolation_policy ON target_table
    FOR ALL
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### Strategic SaaS Readiness Path
1. **JWT Custom Claims:** The auth server injects `tenant_id` into the user’s JWT metadata claims on login.
2. **Schema Separation Option:** For premium enterprise tiering, the database router supports spinning up isolated schemas (e.g. `tenant_a.tickets`, `tenant_b.tickets`) while keeping settings globally pooled in `public.system_settings`.
3. **Database Client Pools:** Separate connection client pools execute matching tenant ID variables to avoid multi-tenant data leaks.

---

## 3. Department Isolation Enforcement

For tables mapped to specific organizational lines, policies check the operator's department ID:
```sql
CREATE POLICY department_isolation_policy ON ticket_workflow_state
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.user_id = auth.uid() 
              AND employees.department_id = (
                  SELECT department_id FROM tickets 
                  WHERE tickets.id = ticket_workflow_state.ticket_id
              )
        )
    );
```
This isolates workflow running states to teams matching ticket operations.
