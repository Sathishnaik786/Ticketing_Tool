-- Migration: 008_teams
-- Up
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Additive change only: add team_id to employees table
ALTER TABLE employees ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Rollback
-- ALTER TABLE employees DROP COLUMN IF EXISTS team_id;
-- DROP TABLE IF EXISTS teams;
