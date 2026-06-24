-- Migration: 012_notification_engine
-- Up
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL, -- e.g., 'TICKET_ASSIGNED', 'SLA_BREACHED'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'SLACK', 'TEAMS')),
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_template_key UNIQUE (tenant_id, key, channel)
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'EMAIL', 'SLACK', etc.
    configuration JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT true,
    rate_limit_per_min INTEGER DEFAULT 120,
    CONSTRAINT unique_tenant_channel UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    enabled_channels VARCHAR(50)[] NOT NULL DEFAULT '{IN_APP,EMAIL}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_user_template_pref UNIQUE (tenant_id, user_id, template_key)
);

CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id),
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RETRIED')),
    payload JSONB,
    attempts INTEGER DEFAULT 1,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for notification_templates if table was pre-created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'code') THEN
        ALTER TABLE notification_templates ALTER COLUMN code DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'type') THEN
        ALTER TABLE notification_templates ALTER COLUMN type DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'subject') THEN
        ALTER TABLE notification_templates ALTER COLUMN subject DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_templates' AND column_name = 'message_template') THEN
        ALTER TABLE notification_templates ALTER COLUMN message_template DROP NOT NULL;
    END IF;
END $$;

ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS key VARCHAR(100);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS channel VARCHAR(50);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS subject_template VARCHAR(255);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS body_template TEXT;

-- Drop and recreate the unique constraint for template key
ALTER TABLE notification_templates DROP CONSTRAINT IF EXISTS unique_tenant_template_key;
ALTER TABLE notification_templates ADD CONSTRAINT unique_tenant_template_key UNIQUE (tenant_id, key, channel);

-- Ensure columns exist for notification_preferences if table was pre-created
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS template_key VARCHAR(100);
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS enabled_channels VARCHAR(50)[] DEFAULT '{IN_APP,EMAIL}';

-- Drop and recreate the unique constraint for user template preference
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS unique_tenant_user_template_pref;
ALTER TABLE notification_preferences ADD CONSTRAINT unique_tenant_user_template_pref UNIQUE (tenant_id, user_id, template_key);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS notification_delivery_logs;
-- DROP TABLE IF EXISTS notification_preferences;
-- DROP TABLE IF EXISTS notification_channels;
-- DROP TABLE IF EXISTS notification_templates;
