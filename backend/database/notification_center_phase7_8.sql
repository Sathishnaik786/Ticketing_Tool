/* ============================================================
   ETMS – Phase 7.8: Enterprise Notification & Alert Center
   Aparna Enterprises

   Rollback: notification_center_phase7_8_rollback.sql
   Additive only – no ALTER on existing ETMS tables.
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_center_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  source_module VARCHAR(50) NOT NULL,
  source_id VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, event_type, source_module, source_id)
);

CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES notification_center_events(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL
    CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH')),
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (delivery_status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nc_events_employee ON notification_center_events(employee_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nc_events_module ON notification_center_events(source_module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nc_events_priority ON notification_center_events(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nc_delivery_event ON notification_delivery_log(event_id);

INSERT INTO notification_templates (code, name, type, subject, message_template)
VALUES
  ('TICKET_CREATED', 'Ticket Created', 'TICKET', 'New ticket created', 'Ticket {{ticket_id}} was created.'),
  ('TICKET_ASSIGNED', 'Ticket Assigned', 'TICKET', 'Ticket assigned to you', 'Ticket {{ticket_id}} has been assigned.'),
  ('TICKET_REASSIGNED', 'Ticket Reassigned', 'TICKET', 'Ticket reassigned', 'Ticket {{ticket_id}} was reassigned.'),
  ('TICKET_UPDATED', 'Ticket Updated', 'TICKET', 'Ticket updated', 'Ticket {{ticket_id}} was updated.'),
  ('TICKET_RESOLVED', 'Ticket Resolved', 'TICKET', 'Ticket resolved', 'Ticket {{ticket_id}} has been resolved.'),
  ('TICKET_CLOSED', 'Ticket Closed', 'TICKET', 'Ticket closed', 'Ticket {{ticket_id}} has been closed.'),
  ('SLA_WARNING', 'SLA Warning', 'SLA', 'SLA warning', 'Ticket {{ticket_id}} is approaching SLA deadline.'),
  ('SLA_BREACH', 'SLA Breach', 'SLA', 'SLA breached', 'Ticket {{ticket_id}} has breached SLA.'),
  ('APPROVAL_REQUIRED', 'Approval Required', 'APPROVAL', 'Approval required', 'Your approval is required for ticket {{ticket_id}}.'),
  ('APPROVAL_APPROVED', 'Approval Approved', 'APPROVAL', 'Approval approved', 'Approval for ticket {{ticket_id}} was approved.'),
  ('APPROVAL_REJECTED', 'Approval Rejected', 'APPROVAL', 'Approval rejected', 'Approval for ticket {{ticket_id}} was rejected.'),
  ('COMMENT_ADDED', 'Comment Added', 'COMMUNICATION', 'New comment', 'A comment was added to ticket {{ticket_id}}.'),
  ('EMAIL_RECEIVED', 'Email Received', 'COMMUNICATION', 'Email received', 'An email was received for ticket {{ticket_id}}.'),
  ('CALL_LOGGED', 'Call Logged', 'COMMUNICATION', 'Call logged', 'A call was logged for ticket {{ticket_id}}.'),
  ('FEEDBACK_SUBMITTED', 'Feedback Submitted', 'FEEDBACK', 'Feedback submitted', 'Feedback was submitted for ticket {{ticket_id}}.'),
  ('KNOWLEDGE_PUBLISHED', 'Article Published', 'KNOWLEDGE', 'Knowledge article published', 'Article "{{title}}" was published.'),
  ('REPORT_GENERATED', 'Report Generated', 'ANALYTICS', 'Analytics report ready', 'Report "{{name}}" has been generated.')
ON CONFLICT (code) DO NOTHING;
