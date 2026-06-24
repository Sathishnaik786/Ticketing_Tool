/* ============================================================
   ETMS – Phase 7.7: Executive Analytics & BI Platform
   Aparna Enterprises

   Rollback: executive_analytics_phase7_7_rollback.sql
   Additive only – no ALTER on existing ETMS tables.
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type VARCHAR(50) NOT NULL
    CHECK (snapshot_type IN ('EXECUTIVE', 'DEPARTMENT', 'BUSINESS_UNIT', 'CUSTOM')),
  scope_key VARCHAR(100),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  report_type VARCHAR(50) NOT NULL
    CHECK (report_type IN ('EXECUTIVE', 'DEPARTMENT', 'BUSINESS_UNIT', 'SLA', 'CSAT', 'APPROVAL', 'KNOWLEDGE', 'TREND')),
  format VARCHAR(20) NOT NULL DEFAULT 'JSON'
    CHECK (format IN ('JSON', 'CSV', 'XLSX', 'PDF')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  dashboard_type VARCHAR(50) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_type ON analytics_snapshots(snapshot_type, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_saved_filters_owner ON analytics_saved_filters(owner_id);

INSERT INTO analytics_dashboard_configs (dashboard_key, title, config)
VALUES
  ('executive', 'Executive Dashboard', '{"widgets":["kpi","trends","sla","csat"]}'::jsonb),
  ('department', 'Department Analytics', '{"departments":["HR","IT","FINANCE","PROCUREMENT","FACILITIES","ADMINISTRATION"]}'::jsonb),
  ('business_unit', 'Business Unit Analytics', '{"units":["Aparna Realty","Aparna RMC","Aparna Tiles","Venster","Alteza","Rollform","Unispace","Externa","Corporate Services"]}'::jsonb)
ON CONFLICT (dashboard_key) DO NOTHING;
