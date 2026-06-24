/* ============================================================
   ETMS – Phase 7.5: Approval Workflow & Service Catalog Engine
   Aparna Enterprises

   Apply order:
     1. ticketing_phase1.sql (prerequisite – tickets table must exist)
     2. Run this file

   Rollback:
     approval_engine_phase7_5_rollback.sql

   Additive only – no ALTER on existing ETMS tables.
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- SERVICE CATALOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL
    CHECK (category IN ('IT', 'HR', 'FINANCE', 'PROCUREMENT', 'FACILITY', 'ADMINISTRATION')),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES service_catalogs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(catalog_id, name)
);

-- ------------------------------------------------------------
-- APPROVAL WORKFLOWS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  service_item_id UUID REFERENCES service_catalog_items(id) ON DELETE SET NULL,
  approval_type VARCHAR(20) NOT NULL DEFAULT 'MULTI'
    CHECK (approval_type IN ('SINGLE', 'MULTI')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- WORKFLOW STEPS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order INT NOT NULL CHECK (step_order >= 1),
  step_name VARCHAR(200) NOT NULL,
  approver_role VARCHAR(30) NOT NULL,
  approver_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  escalation_hours INT CHECK (escalation_hours IS NULL OR escalation_hours > 0),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id, step_order)
);

-- ------------------------------------------------------------
-- TICKET APPROVALS (runtime instances)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE RESTRICT,
  current_step_id UUID REFERENCES approval_workflow_steps(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ESCALATED')),
  started_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- APPROVAL HISTORY (audit trail)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_approval_id UUID NOT NULL REFERENCES ticket_approvals(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  step_id UUID REFERENCES approval_workflow_steps(id) ON DELETE SET NULL,
  action VARCHAR(30) NOT NULL
    CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'ESCALATED', 'COMMENT')),
  actor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  actor_role VARCHAR(30),
  comments TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_service_catalogs_category ON service_catalogs(category, is_active);
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_catalog ON service_catalog_items(catalog_id, is_active);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_active ON approval_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_steps_workflow ON approval_workflow_steps(workflow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_ticket ON ticket_approvals(ticket_id, status);
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_status ON ticket_approvals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_workflow ON ticket_approvals(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_ticket ON approval_history(ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_history_approval ON approval_history(ticket_approval_id, created_at DESC);

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_service_catalogs_updated_at ON service_catalogs;
CREATE TRIGGER trg_service_catalogs_updated_at
  BEFORE UPDATE ON service_catalogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_catalog_items_updated_at ON service_catalog_items;
CREATE TRIGGER trg_service_catalog_items_updated_at
  BEFORE UPDATE ON service_catalog_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_approval_workflows_updated_at ON approval_workflows;
CREATE TRIGGER trg_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ticket_approvals_updated_at ON ticket_approvals;
CREATE TRIGGER trg_ticket_approvals_updated_at
  BEFORE UPDATE ON ticket_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- SEED: Aparna Enterprises Service Catalog
-- ------------------------------------------------------------
INSERT INTO service_catalogs (name, description, category, display_order)
SELECT v.name, v.description, v.category, v.display_order
FROM (VALUES
  ('IT Services', 'Information technology requests for Aparna Enterprises', 'IT', 1),
  ('HR Services', 'Human resources and employee services', 'HR', 2),
  ('Finance Services', 'Financial operations and payroll corrections', 'FINANCE', 3),
  ('Procurement Services', 'Vendor and purchase requests', 'PROCUREMENT', 4),
  ('Facility Services', 'Facilities and workplace services', 'FACILITY', 5),
  ('Administration Services', 'General administration requests', 'ADMINISTRATION', 6)
) AS v(name, description, category, display_order)
WHERE NOT EXISTS (SELECT 1 FROM service_catalogs sc WHERE sc.name = v.name);

-- Seed items (uses catalog names via subselect)
INSERT INTO service_catalog_items (catalog_id, name, description, display_order)
SELECT c.id, v.name, v.description, v.display_order
FROM service_catalogs c
CROSS JOIN (VALUES
  ('IT Services', 'Software Access Request', 'Request access to enterprise software', 1),
  ('IT Services', 'Laptop Request', 'Request new or replacement laptop', 2),
  ('IT Services', 'Hardware Repair', 'Report and repair hardware issues', 3),
  ('HR Services', 'Leave Regularization', 'Regularize attendance or leave records', 1),
  ('HR Services', 'Payroll Correction', 'Request payroll data correction', 2),
  ('Finance Services', 'Payroll Correction', 'Finance review of payroll adjustments', 1),
  ('Procurement Services', 'Vendor Registration', 'Register a new vendor', 1),
  ('Procurement Services', 'Purchase Request', 'Submit purchase requisition', 2),
  ('Facility Services', 'Meeting Room Booking', 'Book meeting rooms', 1),
  ('Administration Services', 'Travel Request', 'Submit business travel request', 1)
) AS v(catalog_name, name, description, display_order)
WHERE c.name = v.catalog_name
  AND NOT EXISTS (
    SELECT 1 FROM service_catalog_items sci
    WHERE sci.catalog_id = c.id AND sci.name = v.name
  );

COMMENT ON TABLE service_catalogs IS 'Phase 7.5 – Aparna Enterprises service catalog categories';
COMMENT ON TABLE service_catalog_items IS 'Phase 7.5 – catalog service items linkable to approval workflows';
COMMENT ON TABLE approval_workflows IS 'Phase 7.5 – reusable approval workflow definitions';
COMMENT ON TABLE approval_workflow_steps IS 'Phase 7.5 – ordered steps within a workflow';
COMMENT ON TABLE ticket_approvals IS 'Phase 7.5 – per-ticket approval instances';
COMMENT ON TABLE approval_history IS 'Phase 7.5 – immutable approval audit trail';
