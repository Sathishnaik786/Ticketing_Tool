/* Rollback: Phase 7.1 ticket_feedback table */

DROP TRIGGER IF EXISTS trg_ticket_feedback_updated_at ON ticket_feedback;
DROP TABLE IF EXISTS ticket_feedback CASCADE;
