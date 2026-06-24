-- Migration: 002_feature_registry
-- Up
CREATE TABLE feature_registry (
    key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT false,
    enabled_tenant_ids UUID[] DEFAULT '{}',
    enabled_department_ids UUID[] DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    target_environments VARCHAR(50)[] DEFAULT '{development}',
    required_license_tier VARCHAR(50) DEFAULT 'STANDARD' CHECK (required_license_tier IN ('STANDARD', 'ENTERPRISE', 'ULTIMATE')),
    tenant_id UUID NOT NULL, -- required for multi-tenancy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE feature_registry ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS feature_registry;
