# 09 — Complete Database Design
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Schema Overview

All new tables follow these conventions:
- `UUID` primary keys using `gen_random_uuid()`
- `tenant_id` on all tenant-scoped tables (multi-tenant ready)
- `created_at` / `updated_at` timestamps on every table
- `deleted_at` for soft deletes (never hard delete)
- `created_by` FK to `employees` for all user-created records
- Indexes on foreign keys, status fields, and frequently queried date ranges

---

## 2. Full Schema (Phase 5.0 New Tables)

```sql
-- ============================================================
-- WORKFLOW ENGINE
-- ============================================================

CREATE TABLE workflows (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(100),
  status            VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  version           INTEGER NOT NULL DEFAULT 1,
  current_version_id UUID,
  trigger_type      VARCHAR(100) NOT NULL,
  trigger_config    JSONB DEFAULT '{}',
  created_by        UUID NOT NULL REFERENCES employees(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE workflow_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL,
  definition    JSONB NOT NULL,
  changelog     TEXT,
  published_by  UUID REFERENCES employees(id),
  published_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  version_id    UUID NOT NULL REFERENCES workflow_versions(id),
  step_key      VARCHAR(100) NOT NULL,
  step_type     VARCHAR(50) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  position_x    INTEGER,
  position_y    INTEGER,
  next_step_key VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_conditions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_key   VARCHAR(100) NOT NULL,
  to_step_key     VARCHAR(100) NOT NULL,
  condition_type  VARCHAR(50) NOT NULL,
  condition_expr  JSONB DEFAULT '{}',
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE workflow_executions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id      UUID NOT NULL REFERENCES workflows(id),
  version_id       UUID NOT NULL REFERENCES workflow_versions(id),
  entity_type      VARCHAR(100) NOT NULL,
  entity_id        UUID NOT NULL,
  status           VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
  current_step_key VARCHAR(100),
  context          JSONB DEFAULT '{}',
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  started_by       UUID REFERENCES employees(id)
);

CREATE TABLE workflow_step_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    UUID NOT NULL REFERENCES workflow_executions(id),
  step_key        VARCHAR(100) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  assigned_to     UUID REFERENCES employees(id),
  assigned_group  VARCHAR(100),
  decision        VARCHAR(50),
  decision_notes  TEXT,
  decided_by      UUID REFERENCES employees(id),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  due_at          TIMESTAMPTZ,
  escalated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SLA ENGINE
-- ============================================================

CREATE TABLE sla_policies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  description           TEXT,
  is_default            BOOLEAN NOT NULL DEFAULT FALSE,
  business_hours_only   BOOLEAN NOT NULL DEFAULT FALSE,
  business_hours_config JSONB DEFAULT '{"timezone":"Asia/Kolkata","days":[1,2,3,4,5],"start":"09:00","end":"18:00"}',
  warning_threshold_pct INTEGER NOT NULL DEFAULT 75,
  status                VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_by            UUID REFERENCES employees(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE TABLE sla_targets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id         UUID NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
  priority          VARCHAR(50) NOT NULL,
  department_id     UUID REFERENCES departments(id),
  response_minutes  INTEGER NOT NULL,
  resolution_minutes INTEGER NOT NULL,
  escalation_minutes INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_assignments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id           UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  policy_id           UUID NOT NULL REFERENCES sla_policies(id),
  target_id           UUID NOT NULL REFERENCES sla_targets(id),
  response_due_at     TIMESTAMPTZ NOT NULL,
  resolution_due_at   TIMESTAMPTZ NOT NULL,
  response_met_at     TIMESTAMPTZ,
  resolution_met_at   TIMESTAMPTZ,
  paused_at           TIMESTAMPTZ,
  pause_reason        TEXT,
  total_paused_mins   INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id)
);

CREATE TABLE sla_breaches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         UUID NOT NULL REFERENCES tickets(id),
  assignment_id     UUID NOT NULL REFERENCES sla_assignments(id),
  breach_type       VARCHAR(50) NOT NULL,
  breached_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at            TIMESTAMPTZ NOT NULL,
  overdue_minutes   INTEGER NOT NULL,
  acknowledged_by   UUID REFERENCES employees(id),
  acknowledged_at   TIMESTAMPTZ,
  root_cause        TEXT
);

CREATE TABLE sla_escalations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         UUID NOT NULL REFERENCES tickets(id),
  assignment_id     UUID NOT NULL REFERENCES sla_assignments(id),
  escalation_type   VARCHAR(50) NOT NULL,
  escalated_to      UUID REFERENCES employees(id),
  escalated_to_role VARCHAR(100),
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  escalated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_metrics_daily (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date          DATE NOT NULL,
  department_id        UUID REFERENCES departments(id),
  priority             VARCHAR(50),
  total_tickets        INTEGER NOT NULL DEFAULT 0,
  response_met         INTEGER NOT NULL DEFAULT 0,
  resolution_met       INTEGER NOT NULL DEFAULT 0,
  total_breaches       INTEGER NOT NULL DEFAULT 0,
  avg_response_mins    NUMERIC,
  avg_resolution_mins  NUMERIC,
  sla_compliance_pct   NUMERIC,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date, department_id, priority)
);

-- ============================================================
-- SERVICE CATALOG
-- ============================================================

CREATE TABLE catalog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  icon        VARCHAR(100),
  color       VARCHAR(50),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE service_catalogs (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL,
  category_id            UUID NOT NULL REFERENCES catalog_categories(id),
  name                   VARCHAR(255) NOT NULL,
  description            TEXT NOT NULL,
  short_description      VARCHAR(500),
  icon                   VARCHAR(100),
  image_url              TEXT,
  status                 VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  is_featured            BOOLEAN NOT NULL DEFAULT FALSE,
  request_count          INTEGER NOT NULL DEFAULT 0,
  workflow_id            UUID REFERENCES workflows(id),
  sla_policy_id          UUID REFERENCES sla_policies(id),
  default_priority       VARCHAR(50) NOT NULL DEFAULT 'P3',
  default_assignee_group VARCHAR(100),
  visible_to_roles       JSONB DEFAULT '["EMPLOYEE","MANAGER","ADMIN"]',
  department_restriction UUID[],
  tags                   TEXT[],
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_by             UUID REFERENCES employees(id),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ
);

CREATE TABLE catalog_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id  UUID NOT NULL REFERENCES service_catalogs(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL DEFAULT 1,
  is_current  BOOLEAN NOT NULL DEFAULT TRUE,
  name        VARCHAR(255) NOT NULL,
  created_by  UUID REFERENCES employees(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE catalog_fields (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id           UUID NOT NULL REFERENCES catalog_forms(id) ON DELETE CASCADE,
  field_key         VARCHAR(100) NOT NULL,
  field_type        VARCHAR(50) NOT NULL,
  label             VARCHAR(255) NOT NULL,
  placeholder       TEXT,
  help_text         TEXT,
  is_required       BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  validation_rules  JSONB DEFAULT '{}',
  options           JSONB DEFAULT '[]',
  conditional_logic JSONB DEFAULT '{}',
  UNIQUE(form_id, field_key)
);

CREATE TABLE service_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id            UUID NOT NULL REFERENCES service_catalogs(id),
  form_id               UUID NOT NULL REFERENCES catalog_forms(id),
  requester_id          UUID NOT NULL REFERENCES employees(id),
  request_number        VARCHAR(50) UNIQUE,
  status                VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  form_data             JSONB NOT NULL DEFAULT '{}',
  ticket_id             UUID REFERENCES tickets(id),
  workflow_execution_id UUID REFERENCES workflow_executions(id),
  sla_assignment_id     UUID REFERENCES sla_assignments(id),
  submitted_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  rejection_reason      TEXT,
  notes                 TEXT
);

-- ============================================================
-- AUTOMATION ENGINE
-- ============================================================

CREATE TABLE automation_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  trigger_type    VARCHAR(100) NOT NULL,
  trigger_config  JSONB DEFAULT '{}',
  condition_logic VARCHAR(10) NOT NULL DEFAULT 'AND',
  run_order       INTEGER NOT NULL DEFAULT 0,
  stop_processing BOOLEAN NOT NULL DEFAULT FALSE,
  run_count       BIGINT NOT NULL DEFAULT 0,
  last_run_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE automation_conditions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id     UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  group_id    INTEGER NOT NULL DEFAULT 0,
  field_path  VARCHAR(255) NOT NULL,
  operator    VARCHAR(50) NOT NULL,
  value       JSONB NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE automation_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  action_type   VARCHAR(100) NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE automation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id          UUID NOT NULL REFERENCES automation_rules(id),
  entity_type      VARCHAR(100) NOT NULL,
  entity_id        UUID NOT NULL,
  trigger_event    VARCHAR(100) NOT NULL,
  conditions_met   BOOLEAN NOT NULL,
  actions_executed JSONB DEFAULT '[]',
  error            TEXT,
  duration_ms      INTEGER,
  executed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI COPILOT
-- ============================================================

CREATE TABLE ai_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       UUID NOT NULL,
  suggestion_type VARCHAR(100) NOT NULL,
  model_id        VARCHAR(100) NOT NULL,
  prompt_version  VARCHAR(50) NOT NULL,
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  latency_ms      INTEGER,
  confidence      NUMERIC,
  content         JSONB NOT NULL,
  cache_hit       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id   UUID NOT NULL REFERENCES ai_suggestions(id),
  user_id         UUID NOT NULL REFERENCES employees(id),
  feedback_type   VARCHAR(50) NOT NULL,
  applied_content TEXT,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL,
  user_id          UUID REFERENCES employees(id),
  interaction_type VARCHAR(100) NOT NULL,
  entity_type      VARCHAR(100),
  entity_id        UUID,
  model_id         VARCHAR(100),
  input_tokens     INTEGER NOT NULL DEFAULT 0,
  output_tokens    INTEGER NOT NULL DEFAULT 0,
  cost_usd         NUMERIC(10, 6),
  success          BOOLEAN NOT NULL DEFAULT TRUE,
  error            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_prompt_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(255) NOT NULL UNIQUE,
  version              VARCHAR(50) NOT NULL,
  feature              VARCHAR(100) NOT NULL,
  system_prompt        TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  max_tokens           INTEGER NOT NULL DEFAULT 512,
  temperature          NUMERIC NOT NULL DEFAULT 0.3,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- pgvector extension required
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE kb_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text  TEXT NOT NULL,
  embedding   VECTOR(1536),
  model_id    VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, chunk_index)
);

-- ============================================================
-- AUDIT & COMPLIANCE
-- ============================================================

CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  actor_id      UUID REFERENCES employees(id),
  actor_role    VARCHAR(100),
  action        VARCHAR(100) NOT NULL,
  -- 'ticket.status_changed' | 'workflow.step.approved' | 'sla.policy.created'
  entity_type   VARCHAR(100) NOT NULL,
  entity_id     UUID,
  old_values    JSONB DEFAULT '{}',
  new_values    JSONB DEFAULT '{}',
  metadata      JSONB DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at, NO deleted_at — immutable
);

-- ============================================================
-- EXECUTIVE INTELLIGENCE
-- ============================================================

CREATE TABLE intelligence_snapshots (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date        DATE NOT NULL,
  granularity          VARCHAR(20) NOT NULL,
  department_id        UUID REFERENCES departments(id),
  agent_id             UUID REFERENCES employees(id),
  priority             VARCHAR(20),
  total_created        INTEGER,
  total_resolved       INTEGER,
  total_breached       INTEGER,
  avg_mtta_mins        NUMERIC,
  avg_mttr_mins        NUMERIC,
  sla_compliance_pct   NUMERIC,
  fcr_rate             NUMERIC,
  reopen_rate          NUMERIC,
  escalation_rate      NUMERIC,
  automation_rate      NUMERIC,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date, granularity, department_id, agent_id, priority)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Workflow indexes
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id, status);
CREATE INDEX idx_wf_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX idx_wf_executions_status ON workflow_executions(status);
CREATE INDEX idx_wf_step_exec_due ON workflow_step_executions(due_at) WHERE status = 'PENDING';

-- SLA indexes
CREATE INDEX idx_sla_assignments_response ON sla_assignments(response_due_at) WHERE response_met_at IS NULL;
CREATE INDEX idx_sla_assignments_resolution ON sla_assignments(resolution_due_at) WHERE resolution_met_at IS NULL;
CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_sla_metrics_date ON sla_metrics_daily(metric_date DESC);

-- Catalog indexes
CREATE INDEX idx_service_catalogs_category ON service_catalogs(category_id, status);
CREATE INDEX idx_service_requests_requester ON service_requests(requester_id, submitted_at DESC);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- Automation indexes
CREATE INDEX idx_automation_rules_trigger ON automation_rules(tenant_id, trigger_type, is_active);
CREATE INDEX idx_automation_logs_entity ON automation_logs(entity_type, entity_id);

-- AI indexes
CREATE INDEX idx_ai_suggestions_entity ON ai_suggestions(entity_type, entity_id);
CREATE INDEX idx_ai_interactions_cost ON ai_interactions(tenant_id, created_at DESC);
CREATE INDEX idx_kb_embeddings_vector ON kb_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Audit indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);

-- Intelligence indexes
CREATE INDEX idx_intelligence_date ON intelligence_snapshots(snapshot_date DESC);
CREATE INDEX idx_intelligence_dept ON intelligence_snapshots(department_id, snapshot_date DESC);
```

---

## 3. Row Level Security (Supabase RLS)

```sql
-- Tenants can only see their own data
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON workflows
  USING (tenant_id = auth.jwt()->>'tenant_id'::UUID);

-- Employees can only see their own service requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY requester_access ON service_requests
  USING (requester_id = auth.uid() OR 
         auth.jwt()->>'role' IN ('ADMIN', 'MANAGER', 'HR'));
```

---

## 4. Migration Strategy

All migrations are **additive only** — no existing table is modified (only new tables added).

```
migrations/
├── 005_workflow_engine.sql
├── 006_sla_engine.sql
├── 007_service_catalog.sql
├── 008_automation_engine.sql
├── 009_ai_copilot.sql
├── 010_audit_compliance.sql
└── 011_executive_intelligence.sql
```
