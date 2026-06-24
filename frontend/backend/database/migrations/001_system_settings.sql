-- Migration: 001_system_settings
-- Up
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WORKFLOW', 'SLA', 'CACHE', 'AUDIT', 'NOTIFICATION', 'SECURITY')),
    validation_regex VARCHAR(255),
    tenant_id UUID NOT NULL, -- required for multi-tenancy
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS system_settings;
