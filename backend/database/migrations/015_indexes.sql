-- Migration: 015_indexes
-- Up

-- Workflows
CREATE INDEX IF NOT EXISTS idx_wv_workflow ON workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ws_version ON workflow_steps(version_id);
CREATE INDEX IF NOT EXISTS idx_tws_ticket ON ticket_workflow_state(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tws_version ON ticket_workflow_state(version_id);

-- Approvals
CREATE INDEX IF NOT EXISTS idx_al_policy ON approval_levels(policy_id);
CREATE INDEX IF NOT EXISTS idx_aa_level ON approval_assignments(level_id);
CREATE INDEX IF NOT EXISTS idx_aa_ticket ON approval_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ah_assignment ON approval_history(assignment_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_np_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ndl_recipient ON notification_delivery_logs(recipient_id);

-- SLA
CREATE INDEX IF NOT EXISTS idx_ser_policy ON sla_escalation_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_sb_ticket ON sla_breaches(ticket_id);

-- Hierarchy
CREATE INDEX IF NOT EXISTS idx_bu_company ON business_units(company_id);
CREATE INDEX IF NOT EXISTS idx_div_bu ON divisions(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_teams_dept ON teams(department_id);

-- Audit & Events
CREATE INDEX IF NOT EXISTS idx_es_aggregate ON event_store(tenant_id, aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_es_type_time ON event_store(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sal_actor_time ON system_audit_logs(actor_id, created_at DESC);
