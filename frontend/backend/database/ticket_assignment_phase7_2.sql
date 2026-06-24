/* ============================================================
   ETMS – Phase 7.2: Assignment History & Work Queue
   Database Schema (PostgreSQL / Supabase Compatible)

   Purpose:
     Additive ticket_assignment_history audit table.
     Uses EXISTING ticket_assignments table from ticketing_phase1.sql
     — DO NOT recreate or alter ticket_assignments.

   Apply order:
     1. ticketing_phase1.sql (prerequisite)
     2. Run this file

   Rollback:
     Run ticket_assignment_phase7_2_rollback.sql
   ============================================================ */

CREATE TABLE IF NOT EXISTS ticket_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_assignee UUID REFERENCES employees(id) ON DELETE SET NULL,
  new_assignee UUID REFERENCES employees(id) ON DELETE SET NULL,
  changed_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_assignment_history_ticket
  ON ticket_assignment_history(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_assignment_history_changed_at
  ON ticket_assignment_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_assignment_history_new_assignee
  ON ticket_assignment_history(new_assignee);

COMMENT ON TABLE ticket_assignment_history IS 'Immutable audit trail for ticket ownership changes (Phase 7.2)';
