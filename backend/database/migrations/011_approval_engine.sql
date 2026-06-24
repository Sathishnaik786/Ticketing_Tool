-- Migration: 011_approval_engine
-- Up
CREATE TABLE IF NOT EXISTS approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_entity VARCHAR(100) NOT NULL, -- 'tickets', 'service_requests'
    conditions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES approval_policies(id) ON DELETE CASCADE,
    level_order INTEGER NOT NULL,
    approval_type VARCHAR(50) DEFAULT 'SINGLE',
    required_approvals INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_policy_level UNIQUE (tenant_id, policy_id, level_order)
);

CREATE TABLE IF NOT EXISTS approval_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    level_id UUID REFERENCES approval_levels(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL, -- references tickets
    assigned_role VARCHAR(100),
    assigned_user_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED')),
    escalates_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES approval_assignments(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'DELEGATED', 'ESCALATED')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure missing columns are added if approval_history already existed
ALTER TABLE approval_history ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE approval_history ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES approval_assignments(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS approval_history;
-- DROP TABLE IF EXISTS approval_assignments;
-- DROP TABLE IF EXISTS approval_levels;
-- DROP TABLE IF EXISTS approval_policies;
