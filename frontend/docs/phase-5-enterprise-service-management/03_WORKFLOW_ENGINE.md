# 03 — Workflow Engine
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The Workflow Engine enables administrators to visually design, version, and enforce multi-step approval and process workflows that attach to tickets, service requests, and catalog items.

---

## 2. Core Concepts

| Concept | Description |
|---|---|
| **Workflow** | Named, versioned process template (e.g., "Access Request") |
| **Step** | A single action node in the workflow (approval, notification, action) |
| **Condition** | Branch logic applied between steps |
| **Execution** | A running instance of a workflow tied to a ticket or request |
| **Escalation** | Automatic re-routing when a step is overdue |

---

## 3. Workflow Step Types

| Type | Description |
|---|---|
| `APPROVAL` | A user or group must approve/reject to proceed |
| `NOTIFICATION` | Send email/in-app notification and continue |
| `ACTION` | Automated system action (assign ticket, set status) |
| `CONDITION` | Branch to different steps based on field values |
| `WAIT` | Pause execution until a condition is met or timer expires |
| `PARALLEL_GATE` | All branches must complete before proceeding |
| `ANY_GATE` | First branch to complete triggers continuation |

---

## 4. Database Schema

```sql
-- Workflow templates
CREATE TABLE workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),          -- 'access_request', 'onboarding', etc.
  status          VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                                         -- DRAFT | ACTIVE | ARCHIVED
  version         INTEGER NOT NULL DEFAULT 1,
  current_version_id UUID,              -- FK to workflow_versions
  trigger_type    VARCHAR(100) NOT NULL, -- 'ticket_created' | 'catalog_request' | 'manual'
  trigger_config  JSONB DEFAULT '{}',
  created_by      UUID NOT NULL REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,           -- Soft delete
  UNIQUE(tenant_id, name, version)
);

-- Versioned workflow snapshots
CREATE TABLE workflow_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  definition      JSONB NOT NULL,        -- Full step/condition graph
  changelog       TEXT,
  published_by    UUID REFERENCES employees(id),
  published_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Individual steps within a workflow version
CREATE TABLE workflow_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version_id      UUID NOT NULL REFERENCES workflow_versions(id),
  step_key        VARCHAR(100) NOT NULL, -- Unique key within workflow
  step_type       VARCHAR(50) NOT NULL,  -- APPROVAL | NOTIFICATION | ACTION | etc.
  name            VARCHAR(255) NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',
  -- config.approvers: [{type: 'role'|'user'|'group', value: 'MANAGER'}]
  -- config.timeout_hours: 24
  -- config.escalation_step_key: 'escalate_to_director'
  position_x      INTEGER,               -- Canvas x position
  position_y      INTEGER,               -- Canvas y position
  next_step_key   VARCHAR(100),          -- Default next step
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Branch conditions between steps
CREATE TABLE workflow_conditions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_key   VARCHAR(100) NOT NULL,
  to_step_key     VARCHAR(100) NOT NULL,
  condition_type  VARCHAR(50) NOT NULL,  -- 'ALWAYS' | 'IF' | 'ELSE'
  condition_expr  JSONB DEFAULT '{}',
  -- { field: 'priority', operator: 'eq', value: 'CRITICAL' }
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Running workflow instances
CREATE TABLE workflow_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id),
  version_id      UUID NOT NULL REFERENCES workflow_versions(id),
  entity_type     VARCHAR(100) NOT NULL,  -- 'ticket' | 'service_request'
  entity_id       UUID NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
                                          -- RUNNING | COMPLETED | CANCELLED | FAILED
  current_step_key VARCHAR(100),
  context         JSONB DEFAULT '{}',     -- Execution variables
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  started_by      UUID REFERENCES employees(id)
);

-- Individual step execution records
CREATE TABLE workflow_step_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    UUID NOT NULL REFERENCES workflow_executions(id),
  step_key        VARCHAR(100) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                         -- PENDING | IN_PROGRESS | APPROVED | REJECTED | SKIPPED
  assigned_to     UUID REFERENCES employees(id),
  assigned_group  VARCHAR(100),
  decision        VARCHAR(50),            -- APPROVED | REJECTED | SKIPPED
  decision_notes  TEXT,
  decided_by      UUID REFERENCES employees(id),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  due_at          TIMESTAMPTZ,            -- SLA deadline for this step
  escalated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_step_executions_execution ON workflow_step_executions(execution_id);
CREATE INDEX idx_step_executions_due ON workflow_step_executions(due_at) WHERE status = 'PENDING';
```

---

## 5. Backend API Contracts

### Workflow Templates
```
GET    /api/v2/workflows              List workflows (paginated)
POST   /api/v2/workflows              Create new workflow
GET    /api/v2/workflows/:id          Get workflow with latest version
PUT    /api/v2/workflows/:id          Update workflow (creates new version)
DELETE /api/v2/workflows/:id          Soft delete workflow
POST   /api/v2/workflows/:id/publish  Publish draft version
POST   /api/v2/workflows/:id/clone    Clone workflow

GET    /api/v2/workflows/:id/versions         List all versions
GET    /api/v2/workflows/:id/versions/:ver    Get specific version
```

### Workflow Executions
```
POST   /api/v2/workflow-executions              Start a new execution
GET    /api/v2/workflow-executions/:id          Get execution detail + steps
POST   /api/v2/workflow-executions/:id/cancel   Cancel execution

POST   /api/v2/workflow-step-executions/:id/approve  Approve a step
POST   /api/v2/workflow-step-executions/:id/reject   Reject a step
POST   /api/v2/workflow-step-executions/:id/delegate Delegate to another user
```

### Analytics
```
GET    /api/v2/workflows/analytics/summary       Completion rates, avg time
GET    /api/v2/workflows/:id/analytics           Per-workflow metrics
```

---

## 6. Workflow Execution Engine

### Execution Flow

```
1. Trigger event received (ticket created, catalog request submitted)
2. Match trigger to active workflow
3. Create workflow_executions record (status: RUNNING)
4. Evaluate first step's conditions
5. Create workflow_step_executions record (status: PENDING)
6. Notify assigned approver(s) via NotificationService
7. Wait for decision (via API) OR timeout

8. On APPROVE:
   - Mark step APPROVED
   - Evaluate next step conditions
   - If parallel gate: check all branches complete
   - Advance to next step → repeat from step 5
   - If no next step: mark execution COMPLETED

9. On REJECT:
   - Mark step REJECTED
   - Trigger rejection notification
   - Mark execution CANCELLED (or route to rejection path)

10. On TIMEOUT:
    - Trigger escalation job
    - Route to escalation step or escalate approver
```

### Escalation Job (BullMQ)
```javascript
// Runs every 5 minutes
// Finds PENDING steps where due_at < NOW() AND escalated_at IS NULL
// Escalates to next approver tier
// Sends notification
// Sets escalated_at = NOW()
```

---

## 7. Frontend: Workflow Builder

### Technology
- **React Flow** (`reactflow` npm package) for drag-drop canvas
- Sidebar panel with step type palette
- Properties panel for step configuration
- JSON definition auto-synced with canvas

### Pages

| Page | Route | Description |
|---|---|---|
| `WorkflowListPage` | `/app/admin/workflows` | List + manage workflows |
| `WorkflowBuilderPage` | `/app/admin/workflows/:id/builder` | Visual drag-drop editor |
| `WorkflowAnalyticsPage` | `/app/admin/workflows/:id/analytics` | Execution metrics |

### Builder UX
- Step nodes dragged from left sidebar onto canvas
- Connect nodes with edges (auto-evaluates conditions)
- Right panel shows selected step properties
- Publish button validates graph before saving
- Version history drawer shows past versions
- Preview mode simulates execution with sample data

---

## 8. Approval Matrix

```
Standard Workflow (P3/P4):
  Employee → Manager (1 approver required)

Elevated Workflow (P2):
  Employee → Manager → Department Head

Critical Workflow (P1):
  Employee → Manager → Department Head → CISO/CTO

Parallel Approval:
  Employee → [Manager + Security] (both required) → IT

Any-of Approval:
  Employee → [Manager OR HR] (first to respond) → Completion
```

---

## 9. RBAC Requirements

| Role | List | View | Create | Edit | Delete | Publish | Execute |
|---|---|---|---|---|---|---|---|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (approve) |
| AGENT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (approve) |
| EMPLOYEE | ❌ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 10. Feature Flag

```
VITE_ENABLE_WORKFLOW_ENGINE=true
```

Back-end equivalent: `ENABLE_WORKFLOW_ENGINE=true` in `.env`
