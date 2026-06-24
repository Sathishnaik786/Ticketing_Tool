# Phase 7.5 — Database Design

## New Tables Only

No `ALTER` on existing ETMS tables.

### service_catalogs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(100) | e.g. IT Services |
| description | TEXT | |
| category | VARCHAR(50) | IT, HR, FINANCE, PROCUREMENT, FACILITY, ADMINISTRATION |
| display_order | INT | |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMPTZ | |

### service_catalog_items

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| catalog_id | UUID FK → service_catalogs | CASCADE delete |
| name | VARCHAR(200) | e.g. Laptop Request |
| description | TEXT | |
| requires_approval | BOOLEAN | |
| is_active | BOOLEAN | |
| display_order | INT | |
| UNIQUE(catalog_id, name) | | |

### approval_workflows

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(200) | |
| description | TEXT | |
| service_item_id | UUID FK → service_catalog_items | SET NULL |
| approval_type | VARCHAR(20) | SINGLE \| MULTI |
| is_active | BOOLEAN | |
| created_by | UUID FK → employees | SET NULL |
| department_id | UUID FK → departments | SET NULL |

### approval_workflow_steps

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| workflow_id | UUID FK → approval_workflows | CASCADE |
| step_order | INT | ≥ 1, unique per workflow |
| step_name | VARCHAR(200) | |
| approver_role | VARCHAR(30) | MANAGER, HR, FINANCE, etc. |
| approver_employee_id | UUID FK → employees | Optional specific approver |
| escalation_hours | INT | Optional SLA escalation |
| is_required | BOOLEAN | |

### ticket_approvals

Runtime approval instances linked to tickets (read-only reference to existing `tickets` table).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_id | UUID FK → tickets | |
| workflow_id | UUID FK → approval_workflows | |
| current_step_id | UUID FK → approval_workflow_steps | NULL when complete |
| status | VARCHAR(20) | PENDING, APPROVED, REJECTED, CANCELLED, ESCALATED |
| started_by | UUID FK → employees | |
| started_at / completed_at | TIMESTAMPTZ | |

### approval_history

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| ticket_approval_id | UUID FK → ticket_approvals | |
| ticket_id | UUID FK → tickets | |
| step_id | UUID FK → approval_workflow_steps | |
| action | VARCHAR(30) | SUBMITTED, APPROVED, REJECTED, etc. |
| actor_id | UUID FK → employees | |
| actor_role | VARCHAR(30) | |
| comments | TEXT | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

## Relationships

```
service_catalogs 1──* service_catalog_items
service_catalog_items 0──1 approval_workflows
approval_workflows 1──* approval_workflow_steps
tickets 1──* ticket_approvals
ticket_approvals 1──* approval_history
```

## Seed Data

Migration seeds Aparna Enterprises catalogs and sample items:
- Software Access Request, Laptop Request, Hardware Repair
- Payroll Correction, Leave Regularization
- Vendor Registration, Purchase Request, Travel Request, Meeting Room Booking

## Rollback

`approval_engine_phase7_5_rollback.sql` drops all six tables in dependency order.
