# SLA POLICY ENHANCEMENT
# Multi-Dimensional Service Level Agreements & Escalation Rules

This document outlines the enhanced SLA matching schema, inheritance logic, and automated escalation flows.

---

## 1. Enhanced SLA Database Schema (SQL)

```sql
-- Enhanced SLA Policies Configuration
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Multi-Dimensional Scope Matching Rules (All Nullable to allow wildcard fallback)
    priority VARCHAR(50) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    catalog_item_id UUID REFERENCES service_catalog_items(id) ON DELETE SET NULL,
    
    -- Target Targets
    response_target_mins INTEGER NOT NULL,      -- minutes to first response
    resolution_target_mins INTEGER NOT NULL,    -- minutes to ticket close
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automated SLA Escalations Execution Path
CREATE TABLE sla_escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES sla_policies(id) ON DELETE CASCADE,
    trigger_event VARCHAR(50) NOT NULL CHECK (trigger_event IN ('NEAR_BREACH', 'BREACHED')),
    buffer_percentage INTEGER DEFAULT 80,      -- triggers NEAR_BREACH at 80% duration
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('NOTIFY_MANAGER', 'REASSIGN_TICKET', 'ESCALATE_PRIORITY')),
    action_payload JSONB DEFAULT '{}'::jsonb,   -- e.g. {"reassign_to_role": "TIER_3"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Inheritance Rules & Evaluation Flow

When a ticket is created or updated (e.g., category, priority, or department changes), the SLA engine evaluates policies using the following lookup order:

```
[ New Ticket Submitted ]
         │
         ├──► 1. Match Specific Catalog Item Policy
         │         (Found? Apply, stop)
         │
         ├──► 2. Match Department + Category + Priority Policy
         │         (Found? Apply, stop)
         │
         ├──► 3. Match Business Unit Wide Policy
         │         (Found? Apply, stop)
         │
         └──► 4. Fallback to Global Default Priority SLA Policy
```

---

## 3. Conflict Resolution Strategy

If a ticket matches multiple SLA policies (e.g. one policy matches `Priority = URGENT` and another matches `Department = IT`), the engine resolves conflicts using a **specificity score logic**:
* Specificity scores are computed by summing values for matched columns:
  * `catalog_item_id` match: $+10$ points
  * `subcategory` match: $+5$ points
  * `category` match: $+4$ points
  * `department_id` match: $+3$ points
  * `business_unit_id` match: $+2$ points
  * `priority` match: $+1$ point
* The policy with the highest specificity score is selected.
* If specificity scores are equal, the policy with the shortest resolution target time is applied to prioritize faster service delivery.

---

## 4. Escalation Execution Model

1. **Scheduling Checks:** When a policy is applied, the system schedules two BullMQ jobs in Redis:
   * **Job 1 (Near-Breach Alert):** Scheduled at $\text{target\_time} \times \text{buffer\_percentage}$. Executes `action_type = NOTIFY_MANAGER`.
   * **Job 2 (Breach Alert):** Scheduled at the final breach threshold time. Executes `action_type = ESCALATE_PRIORITY` and logs the violation.
2. **Dynamic Recalculation:** If a ticket is updated or reassigned, the active jobs are canceled in Redis, and new target times are computed and rescheduled.
3. **Audit Tracking:** All breach details are written to the database `sla_breaches` table and audited via the system logging service.
