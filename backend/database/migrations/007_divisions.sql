-- Migration: 007_divisions
-- Up
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    business_unit_id UUID NOT NULL REFERENCES business_units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Additive change only: add division_id to departments table
ALTER TABLE departments ADD COLUMN division_id UUID REFERENCES divisions(id) ON DELETE SET NULL;

-- Rollback
-- ALTER TABLE departments DROP COLUMN IF EXISTS division_id;
-- DROP TABLE IF EXISTS divisions;
