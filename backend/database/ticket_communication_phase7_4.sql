/* Phase 7.4: Communication & Activity Tracking */

CREATE TABLE IF NOT EXISTS ticket_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  communication_type VARCHAR(30) NOT NULL
    CHECK (communication_type IN ('COMMENT', 'CHAT', 'EMAIL', 'PHONE_CALL', 'MEETING', 'SYSTEM_NOTE')),
  direction VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND'
    CHECK (direction IN ('INBOUND', 'OUTBOUND', 'INTERNAL')),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'
    CHECK (visibility IN ('PUBLIC', 'INTERNAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  customer_name VARCHAR(200),
  phone_number VARCHAR(50),
  call_start_at TIMESTAMPTZ NOT NULL,
  call_end_at TIMESTAMPTZ,
  duration_seconds INT,
  call_summary TEXT,
  outcome VARCHAR(30) NOT NULL DEFAULT 'CONNECTED'
    CHECK (outcome IN ('NO_ANSWER', 'CONNECTED', 'RESOLVED', 'FOLLOWUP_REQUIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  cc VARCHAR(500),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SENT'
    CHECK (status IN ('SENT', 'FAILED', 'RECEIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL
    CHECK (event_type IN (
      'TICKET_CREATED', 'ASSIGNED', 'REASSIGNED', 'COMMENT_ADDED', 'CALL_LOGGED',
      'EMAIL_SENT', 'EMAIL_RECEIVED', 'SLA_WARNING', 'ESCALATION', 'STATUS_CHANGED',
      'RESOLVED', 'CLOSED', 'FEEDBACK_SUBMITTED', 'CHAT_MESSAGE', 'MEETING_LOGGED', 'SYSTEM_NOTE'
    )),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_communications_ticket ON ticket_communications(ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_communications_type ON ticket_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_ticket_call_logs_ticket ON ticket_call_logs(ticket_id, call_start_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_email_logs_ticket ON ticket_email_logs(ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_timeline_ticket ON ticket_activity_timeline(ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_timeline_event ON ticket_activity_timeline(event_type);

DROP TRIGGER IF EXISTS trg_ticket_communications_updated_at ON ticket_communications;
CREATE TRIGGER trg_ticket_communications_updated_at
  BEFORE UPDATE ON ticket_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ticket_communications IS 'Phase 7.4 unified communication history (independent of ticket_comments)';
