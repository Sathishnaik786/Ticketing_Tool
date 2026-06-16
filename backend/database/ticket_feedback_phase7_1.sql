/* ============================================================
   ETMS – Phase 7.1: Customer Satisfaction (CSAT) Feedback
   Database Schema (PostgreSQL / Supabase Compatible)

   Purpose:
     Additive ticket_feedback table for post-closure CSAT collection.
     Does NOT modify the tickets table or any existing EMS tables.

   Apply order:
     1. ticketing_phase1.sql (prerequisite – tickets table must exist)
     2. Run this file

   Rollback:
     Run ticket_feedback_phase7_1_rollback.sql
   ============================================================ */

CREATE TABLE IF NOT EXISTS ticket_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES employees(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  resolution_quality INTEGER NOT NULL CHECK (resolution_quality BETWEEN 1 AND 5),
  communication_quality INTEGER NOT NULL CHECK (communication_quality BETWEEN 1 AND 5),
  response_time INTEGER NOT NULL CHECK (response_time BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ticket_feedback_one_per_ticket UNIQUE (ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_feedback_ticket_id ON ticket_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_submitted_by ON ticket_feedback(submitted_by);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_submitted_at ON ticket_feedback(submitted_at);

DROP TRIGGER IF EXISTS trg_ticket_feedback_updated_at ON ticket_feedback;
CREATE TRIGGER trg_ticket_feedback_updated_at
  BEFORE UPDATE ON ticket_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ticket_feedback IS 'Post-closure CSAT feedback – one submission per closed ticket';
