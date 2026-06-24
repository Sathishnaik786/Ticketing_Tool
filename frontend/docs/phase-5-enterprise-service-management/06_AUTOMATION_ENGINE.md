# 06 — Automation Rules Engine
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The Automation Rules Engine allows administrators to configure IF/THEN rules that automatically respond to ticket events — reducing manual work, enforcing consistency, and enabling proactive management.

---

## 2. Rule Structure

```
RULE = TRIGGER + CONDITIONS + ACTIONS + (optional SCHEDULE)

Example:
  TRIGGER:    Ticket created
  CONDITIONS: Priority = "CRITICAL" AND Department = "IT"
  ACTIONS:    [Assign to "Network Team", Set SLA = P1 Policy, Notify "IT Manager"]
```

---

## 3. Trigger Types

| Trigger | Event |
|---|---|
| `ticket.created` | New ticket submitted |
| `ticket.updated` | Any ticket field changed |
| `ticket.status_changed` | Status transitions |
| `ticket.assigned` | Assignee changed |
| `ticket.commented` | New comment added |
| `ticket.sla_warning` | SLA warning threshold hit |
| `ticket.sla_breached` | SLA breach occurred |
| `ticket.age_exceeded` | Ticket older than N hours |
| `service_request.submitted` | New catalog request |
| `workflow.step_completed` | Workflow step finished |
| `schedule` | Time-based trigger (cron) |

---

## 4. Condition Operators

| Field Type | Operators |
|---|---|
| String | `eq`, `ne`, `contains`, `starts_with`, `in`, `not_in` |
| Number | `eq`, `ne`, `gt`, `lt`, `gte`, `lte`, `between` |
| Date | `before`, `after`, `within_last_N_hours`, `older_than_N_hours` |
| Boolean | `is_true`, `is_false` |
| Array | `contains_any`, `contains_all`, `is_empty` |

Conditions can be grouped with `AND` / `OR` / `NOT` logic.

---

## 5. Action Types

| Action | Description |
|---|---|
| `set_field` | Set any ticket field (priority, status, category) |
| `assign_to_user` | Assign to a specific user |
| `assign_to_group` | Assign to a team/department |
| `add_tag` | Add a tag to the ticket |
| `send_notification` | Send in-app/email notification |
| `send_email` | Send templated email to specified address |
| `add_comment` | Auto-add a comment (internal or public) |
| `escalate` | Route to escalation path |
| `close_ticket` | Auto-resolve and close ticket |
| `create_ticket` | Create a linked follow-up ticket |
| `trigger_webhook` | Call an external URL with ticket payload |
| `start_workflow` | Start a named workflow on the ticket |
| `apply_sla_policy` | Override SLA policy for the ticket |

---

## 6. Database Schema

```sql
-- Automation rule definitions
CREATE TABLE automation_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  trigger_type    VARCHAR(100) NOT NULL,
  trigger_config  JSONB DEFAULT '{}',
  -- For schedule triggers: { cron: '0 */4 * * *', timezone: 'Asia/Kolkata' }
  -- For age triggers: { hours: 4 }
  condition_logic VARCHAR(10) NOT NULL DEFAULT 'AND', -- AND | OR
  run_order       INTEGER NOT NULL DEFAULT 0,
  stop_processing BOOLEAN NOT NULL DEFAULT FALSE, -- Stop evaluating further rules
  run_count       BIGINT NOT NULL DEFAULT 0,
  last_run_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Rule conditions
CREATE TABLE automation_conditions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id         UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  group_id        INTEGER NOT NULL DEFAULT 0,    -- Conditions in same group are AND'd
  field_path      VARCHAR(255) NOT NULL,          -- e.g. 'ticket.priority', 'ticket.age_hours'
  operator        VARCHAR(50) NOT NULL,
  value           JSONB NOT NULL,                 -- Can be string, number, array
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Rule actions
CREATE TABLE automation_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id         UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  action_type     VARCHAR(100) NOT NULL,
  action_config   JSONB NOT NULL DEFAULT '{}',
  -- set_field: { field: 'priority', value: 'P1' }
  -- assign_to_group: { group: 'network-team' }
  -- send_notification: { recipients: ['assigned_agent', 'manager'], template_id: 'sla_breach' }
  -- trigger_webhook: { url: 'https://...', method: 'POST', headers: {}, body_template: '...' }
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Execution audit log
CREATE TABLE automation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id         UUID NOT NULL REFERENCES automation_rules(id),
  entity_type     VARCHAR(100) NOT NULL,          -- 'ticket' | 'service_request'
  entity_id       UUID NOT NULL,
  trigger_event   VARCHAR(100) NOT NULL,
  conditions_met  BOOLEAN NOT NULL,
  actions_executed JSONB DEFAULT '[]',            -- Array of executed action types
  error           TEXT,                           -- If execution failed
  duration_ms     INTEGER,
  executed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_rules_active ON automation_rules(tenant_id, is_active, trigger_type);
CREATE INDEX idx_automation_rules_order ON automation_rules(run_order);
CREATE INDEX idx_automation_logs_rule ON automation_logs(rule_id, executed_at DESC);
CREATE INDEX idx_automation_logs_entity ON automation_logs(entity_type, entity_id);
```

---

## 7. Rule Evaluation Engine

```
Event fired (e.g., ticket.created)
  │
  ▼
Load active rules matching trigger_type (ordered by run_order)
  │
  ▼
For each rule:
  1. Evaluate conditions (AND/OR group logic)
  2. If conditions met:
     a. Execute actions in sort_order
     b. Log to automation_logs
     c. If stop_processing=true → break
  3. Continue to next rule
```

### Key Design Decisions
- Rules are evaluated synchronously within a BullMQ job (not blocking HTTP request)
- Each event creates a single job in the `automation:events` queue
- Max execution time per rule: 30 seconds (timeout protection)
- Actions that can fail (webhooks) are retried up to 3 times with exponential backoff
- Circular rule prevention: max 3 automation cycles per ticket per minute

---

## 8. Example Rules

### Rule 1: Auto-assign Critical Tickets
```json
{
  "name": "Auto-assign Critical IT Tickets",
  "trigger_type": "ticket.created",
  "condition_logic": "AND",
  "conditions": [
    { "field_path": "ticket.priority", "operator": "eq", "value": "CRITICAL" },
    { "field_path": "ticket.department", "operator": "eq", "value": "IT" }
  ],
  "actions": [
    { "action_type": "assign_to_group", "config": { "group": "network-team" } },
    { "action_type": "apply_sla_policy", "config": { "policy_id": "uuid-p1-policy" } },
    { "action_type": "send_notification", "config": { "recipients": ["group:network-team", "manager"] } }
  ]
}
```

### Rule 2: Auto-close Password Resets
```json
{
  "name": "Auto-close Resolved Password Resets",
  "trigger_type": "ticket.status_changed",
  "conditions": [
    { "field_path": "ticket.category", "operator": "eq", "value": "Password Reset" },
    { "field_path": "ticket.status", "operator": "eq", "value": "RESOLVED" }
  ],
  "actions": [
    { "action_type": "add_comment", "config": { "body": "This ticket has been automatically closed after resolution. Please reopen if the issue persists.", "visibility": "public" } },
    { "action_type": "set_field", "config": { "field": "status", "value": "CLOSED" } }
  ]
}
```

### Rule 3: Escalate Aged Tickets
```json
{
  "name": "Escalate Tickets Older Than 4 Hours Without Response",
  "trigger_type": "schedule",
  "trigger_config": { "cron": "*/15 * * * *" },
  "conditions": [
    { "field_path": "ticket.age_hours", "operator": "gt", "value": 4 },
    { "field_path": "ticket.first_response_at", "operator": "is_null", "value": true },
    { "field_path": "ticket.status", "operator": "in", "value": ["OPEN", "ASSIGNED"] }
  ],
  "actions": [
    { "action_type": "escalate", "config": { "escalate_to_role": "MANAGER" } },
    { "action_type": "add_tag", "config": { "tag": "auto-escalated" } }
  ]
}
```

---

## 9. API Contracts

```
GET    /api/v2/automation/rules            List rules (paginated + filterable)
POST   /api/v2/automation/rules            Create rule
GET    /api/v2/automation/rules/:id        Get rule detail
PUT    /api/v2/automation/rules/:id        Update rule
DELETE /api/v2/automation/rules/:id        Soft delete
POST   /api/v2/automation/rules/:id/toggle Toggle active/inactive
POST   /api/v2/automation/rules/:id/test   Test rule against a sample ticket

GET    /api/v2/automation/logs             Execution audit log (filterable by rule, entity)
GET    /api/v2/automation/logs/:id         Log detail
```

---

## 10. Frontend Pages

| Page | Route | Description |
|---|---|---|
| `RuleListPage` | `/app/admin/automation` | All rules + enable/disable |
| `RuleBuilderPage` | `/app/admin/automation/:id` | Visual rule builder |
| `AutomationLogPage` | `/app/admin/automation/logs` | Execution audit log |

### Rule Builder UX
- Three-panel layout: Trigger | Conditions | Actions
- Add condition rows with field selector + operator + value
- Add action rows with action type selector + config form
- Test rule button: simulate against last 10 tickets
- Show matched/unmatched results with explanation

---

## 11. Feature Flag

```
VITE_ENABLE_AUTOMATION_ENGINE=true
ENABLE_AUTOMATION_ENGINE=true  # backend
```
