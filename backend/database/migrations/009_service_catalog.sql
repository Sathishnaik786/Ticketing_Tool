-- Migration: 009_service_catalog
-- Up
CREATE TABLE IF NOT EXISTS service_catalog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'Inbox',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_catalog_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE service_catalog_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_catalog_categories(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_items ADD COLUMN IF NOT EXISTS workflow_id UUID;

CREATE TABLE IF NOT EXISTS service_catalog_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES service_catalog_items(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_catalog_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES service_catalog_forms(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL, -- key name in payload JSON
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'select', 'checkbox', 'file', 'number', 'textarea')),
    is_required BOOLEAN DEFAULT false,
    options JSONB DEFAULT '[]'::jsonb, -- dynamic select dropdown values
    field_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES service_catalog_items(id) ON DELETE CASCADE,
    ticket_id UUID, -- reference to tickets
    requested_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_request_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES service_catalog_form_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE service_catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_responses ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS service_request_responses;
-- DROP TABLE IF EXISTS service_requests;
-- DROP TABLE IF EXISTS service_catalog_form_fields;
-- DROP TABLE IF EXISTS service_catalog_forms;
-- DROP TABLE IF EXISTS service_catalog_items;
-- DROP TABLE IF EXISTS service_catalog_categories;
