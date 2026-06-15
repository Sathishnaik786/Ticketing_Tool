/* ============================================================
   ETMS – Ticketing Module (Sprint 1: Database Foundation)
   Database Schema (PostgreSQL / Supabase Compatible)

   Purpose:
     Additive ticketing tables for EMS → ETMS co-existence.
     Does NOT modify any existing EMS tables.

   Apply order:
     1. Run this file in Supabase SQL Editor (or psql)
     2. Run enable_ticketing_rls.sql

   Rollback:
     Run ticketing_phase1_rollback.sql

   Prerequisites:
     - Core EMS schema (users, employees, departments)
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- SHARED TRIGGER FUNCTION (self-contained; safe if already exists)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- TICKET NUMBER SEQUENCE
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::TEXT, 5, '0');
END;
$$;

-- ------------------------------------------------------------
-- CATEGORIES & SUBCATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES ticket_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, name)
);

-- ------------------------------------------------------------
-- TICKETS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(30) UNIQUE NOT NULL DEFAULT generate_ticket_number(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES ticket_subcategories(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN (
      'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER',
      'RESOLVED', 'CLOSED', 'REJECTED', 'CANCELLED', 'REOPENED', 'ESCALATED'
    )),
  requester_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  assignee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  sla_response_due_at TIMESTAMPTZ,
  sla_resolution_due_at TIMESTAMPTZ,
  sla_response_breached BOOLEAN DEFAULT FALSE,
  sla_resolution_breached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- COMMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ATTACHMENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ACTIVITY / AUDIT TIMELINE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL
    CHECK (activity_type IN (
      'CREATED', 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'ASSIGNMENT',
      'REASSIGNMENT', 'COMMENT', 'ATTACHMENT', 'ESCALATION',
      'SLA_BREACH', 'RESOLUTION', 'CLOSURE', 'REOPEN', 'WATCHER_ADDED', 'WATCHER_REMOVED'
    )),
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ASSIGNMENT HISTORY
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  assigned_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  assignment_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL'
    CHECK (assignment_type IN ('MANUAL', 'ROUND_ROBIN', 'QUEUE', 'SKILL_BASED')),
  is_current BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  unassigned_at TIMESTAMPTZ,
  notes TEXT
);

-- ------------------------------------------------------------
-- WATCHERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ticket_id, employee_id)
);

-- ------------------------------------------------------------
-- SLA RULES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  response_time_minutes INT NOT NULL CHECK (response_time_minutes > 0),
  resolution_time_minutes INT NOT NULL CHECK (resolution_time_minutes > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ticket_sla_rules_unique_scope
  ON ticket_sla_rules (
    COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid),
    priority
  );

-- ------------------------------------------------------------
-- ESCALATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  escalation_level INT NOT NULL DEFAULT 1 CHECK (escalation_level >= 1),
  escalated_from UUID REFERENCES employees(id) ON DELETE SET NULL,
  escalated_to UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  sla_rule_id UUID REFERENCES ticket_sla_rules(id) ON DELETE SET NULL,
  escalation_reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'RESOLVED')),
  escalated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ticket_categories_department
  ON ticket_categories(department_id);

CREATE INDEX IF NOT EXISTS idx_ticket_subcategories_category
  ON ticket_subcategories(category_id);

CREATE INDEX IF NOT EXISTS idx_tickets_status
  ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_tickets_priority
  ON tickets(priority);

CREATE INDEX IF NOT EXISTS idx_tickets_department
  ON tickets(department_id);

CREATE INDEX IF NOT EXISTS idx_tickets_requester
  ON tickets(requester_id);

CREATE INDEX IF NOT EXISTS idx_tickets_assignee
  ON tickets(assignee_id);

CREATE INDEX IF NOT EXISTS idx_tickets_created_at
  ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_sla_response_due
  ON tickets(sla_response_due_at)
  WHERE sla_response_breached = FALSE AND status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED');

CREATE INDEX IF NOT EXISTS idx_tickets_sla_resolution_due
  ON tickets(sla_resolution_due_at)
  WHERE sla_resolution_breached = FALSE AND status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED');

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket
  ON ticket_comments(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket
  ON ticket_attachments(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_activities_ticket
  ON ticket_activities(ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket
  ON ticket_assignments(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_assignments_current
  ON ticket_assignments(ticket_id, is_current)
  WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_ticket_watchers_employee
  ON ticket_watchers(employee_id);

CREATE INDEX IF NOT EXISTS idx_ticket_sla_rules_lookup
  ON ticket_sla_rules(department_id, category_id, priority)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_ticket_escalations_ticket
  ON ticket_escalations(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_escalations_status
  ON ticket_escalations(status)
  WHERE status = 'PENDING';

-- ------------------------------------------------------------
-- UPDATED_AT TRIGGERS (idempotent)
-- ------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'ticket_categories',
    'ticket_subcategories',
    'tickets',
    'ticket_comments',
    'ticket_sla_rules'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated ON %I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- DEFAULT SLA RULES (global, department-agnostic)
-- ------------------------------------------------------------
INSERT INTO ticket_sla_rules (name, department_id, category_id, priority, response_time_minutes, resolution_time_minutes)
SELECT 'Global Critical SLA', NULL, NULL, 'CRITICAL', 15, 240
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_sla_rules
  WHERE department_id IS NULL AND category_id IS NULL AND priority = 'CRITICAL'
);

INSERT INTO ticket_sla_rules (name, department_id, category_id, priority, response_time_minutes, resolution_time_minutes)
SELECT 'Global High SLA', NULL, NULL, 'HIGH', 30, 480
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_sla_rules
  WHERE department_id IS NULL AND category_id IS NULL AND priority = 'HIGH'
);

INSERT INTO ticket_sla_rules (name, department_id, category_id, priority, response_time_minutes, resolution_time_minutes)
SELECT 'Global Medium SLA', NULL, NULL, 'MEDIUM', 120, 1440
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_sla_rules
  WHERE department_id IS NULL AND category_id IS NULL AND priority = 'MEDIUM'
);

INSERT INTO ticket_sla_rules (name, department_id, category_id, priority, response_time_minutes, resolution_time_minutes)
SELECT 'Global Low SLA', NULL, NULL, 'LOW', 480, 4320
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_sla_rules
  WHERE department_id IS NULL AND category_id IS NULL AND priority = 'LOW'
);
