-- Migration: 013_sla_engine
-- Up
CREATE TABLE IF NOT EXISTS sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
    catalog_item_id UUID REFERENCES service_catalog_items(id) ON DELETE SET NULL,
    response_target_mins INTEGER NOT NULL,
    resolution_target_mins INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES sla_policies(id) ON DELETE CASCADE,
    trigger_event VARCHAR(50) NOT NULL CHECK (trigger_event IN ('NEAR_BREACH', 'BREACHED')),
    buffer_percentage INTEGER DEFAULT 80,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('NOTIFY_MANAGER', 'REASSIGN_TICKET', 'ESCALATE_PRIORITY')),
    action_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL, -- references tickets
    policy_id UUID REFERENCES sla_policies(id) ON DELETE CASCADE,
    breach_type VARCHAR(50) NOT NULL CHECK (breach_type IN ('RESPONSE', 'RESOLUTION')),
    target_time TIMESTAMP WITH TIME ZONE NOT NULL,
    breached_at TIMESTAMP WITH TIME ZONE,
    is_acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_breaches ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS sla_breaches;
-- DROP TABLE IF EXISTS sla_escalation_rules;
-- DROP TABLE IF EXISTS sla_policies;
