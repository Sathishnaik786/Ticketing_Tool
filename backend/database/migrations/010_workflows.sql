-- Migration: 010_workflows
-- Up
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_workflow_version UNIQUE (tenant_id, workflow_id, version_number)
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    version_id UUID REFERENCES workflow_versions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('APPROVAL', 'TASK', 'NOTIFICATION')),
    assigned_role VARCHAR(100),
    assigned_user_id UUID REFERENCES auth.users(id),
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_version_step UNIQUE (tenant_id, version_id, step_order)
);

CREATE TABLE IF NOT EXISTS ticket_workflow_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL, -- references tickets after creation / in existing schemas
    version_id UUID REFERENCES workflow_versions(id),
    current_step_id UUID REFERENCES workflow_steps(id),
    state_status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (state_status IN ('IN_PROGRESS', 'COMPLETED', 'SUSPENDED')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add workflow link back to catalog items table
ALTER TABLE service_catalog_items ADD COLUMN IF NOT EXISTS workflow_id UUID;
ALTER TABLE service_catalog_items DROP CONSTRAINT IF EXISTS fk_catalog_workflow;
ALTER TABLE service_catalog_items ADD CONSTRAINT fk_catalog_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_workflow_state ENABLE ROW LEVEL SECURITY;

-- Rollback
-- ALTER TABLE service_catalog_items DROP CONSTRAINT IF EXISTS fk_catalog_workflow;
-- DROP TABLE IF EXISTS ticket_workflow_state;
-- DROP TABLE IF EXISTS workflow_steps;
-- DROP TABLE IF EXISTS workflow_versions;
-- DROP TABLE IF EXISTS workflows;
