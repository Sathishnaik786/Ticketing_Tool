-- Create Meetups table
CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('TEAMS', 'GOOGLE_MEET')) DEFAULT 'TEAMS',
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
    department_id UUID REFERENCES departments(id),
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    start_time TIME,
    end_time TIME,
    meet_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_meetups_status ON meetups(status);
CREATE INDEX idx_meetups_created_by ON meetups(created_by);
CREATE INDEX idx_meetups_scheduled_at ON meetups(scheduled_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to meetups table
CREATE TRIGGER trg_meetups_updated
    BEFORE UPDATE ON meetups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create Calendar Events table
CREATE TABLE calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meetup_id uuid UNIQUE REFERENCES meetups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  event_type text NOT NULL CHECK (event_type = 'MEETUP'),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create indexes for calendar_events
CREATE INDEX idx_calendar_events_time ON calendar_events USING btree (start_time, end_time);
CREATE INDEX idx_calendar_events_department ON calendar_events USING btree (department_id);
CREATE INDEX idx_calendar_events_created_by ON calendar_events USING btree (created_by);

-- Create Meetup Audit Logs table
CREATE TABLE meetup_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (
    action = ANY (ARRAY['CREATED', 'REQUESTED', 'APPROVED', 'REJECTED'])
  ),
  performed_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  performed_role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create indexes for meetup_audit_logs
CREATE INDEX idx_meetup_audit_meetup ON meetup_audit_logs USING btree (meetup_id, created_at);
CREATE INDEX idx_meetup_audit_performer ON meetup_audit_logs USING btree (performed_by);