DROP TRIGGER IF EXISTS trg_ticket_communications_updated_at ON ticket_communications;
DROP TABLE IF EXISTS ticket_activity_timeline CASCADE;
DROP TABLE IF EXISTS ticket_email_logs CASCADE;
DROP TABLE IF EXISTS ticket_call_logs CASCADE;
DROP TABLE IF EXISTS ticket_communications CASCADE;
