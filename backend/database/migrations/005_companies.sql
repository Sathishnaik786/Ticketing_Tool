-- Migration: 005_companies
-- Up
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to previous tables once companies table is created
ALTER TABLE system_settings ADD CONSTRAINT fk_settings_tenant FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE feature_registry ADD CONSTRAINT fk_features_tenant FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE event_store ADD CONSTRAINT fk_events_tenant FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE system_audit_logs ADD CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE processed_events ADD CONSTRAINT fk_processed_tenant FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Rollback
-- ALTER TABLE processed_events DROP CONSTRAINT IF EXISTS fk_processed_tenant;
-- ALTER TABLE system_audit_logs DROP CONSTRAINT IF EXISTS fk_audit_tenant;
-- ALTER TABLE event_store DROP CONSTRAINT IF EXISTS fk_events_tenant;
-- ALTER TABLE feature_registry DROP CONSTRAINT IF EXISTS fk_features_tenant;
-- ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS fk_settings_tenant;
-- DROP TABLE IF EXISTS companies;
