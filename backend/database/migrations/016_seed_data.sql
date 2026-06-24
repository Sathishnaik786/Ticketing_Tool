-- Migration: 016_seed_data
-- Up

DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- 1. Insert Default Company and get the randomly generated UUID
    INSERT INTO companies (name, registration_number)
    VALUES ('Ticketra ESM Demo Company', 'REG-12345678')
    RETURNING id INTO v_tenant_id;

    -- 2. Seed System Settings Registry for tenant
    INSERT INTO system_settings (key, value, description, category, validation_regex, tenant_id) VALUES
    ('workflow.max_depth', '10', 'Maximum circular step hops allowed in single ticket execution path', 'WORKFLOW', '^[1-9][0-9]?$', v_tenant_id),
    ('sla.check_interval', '60', 'Interval in seconds to check for SLA breaches', 'SLA', '^[1-9][0-9]*$', v_tenant_id),
    ('dashboard.cache_ttl', '300', 'Cache duration in seconds for executive dashboards data', 'CACHE', '^[0-9]+$', v_tenant_id),
    ('audit.retention_days', '365', 'Retention time in days for audit log records before cold archive', 'AUDIT', '^[1-9][0-9]*$', v_tenant_id),
    ('notification.retry_count', '3', 'Maximum retries for failed email/SMS delivery notifications', 'NOTIFICATION', '^[0-9]$', v_tenant_id)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

    -- 3. Seed Feature Registry settings
    INSERT INTO feature_registry (key, name, description, is_globally_enabled, target_environments, required_license_tier, tenant_id) VALUES
    ('esm.workflow', 'Workflow Engine', 'Process orchestration step runner', true, '{development,staging,production}', 'ENTERPRISE', v_tenant_id),
    ('esm.approvals', 'Approval Engine', 'Multi-level approvals configuration panel', true, '{development,staging,production}', 'ENTERPRISE', v_tenant_id),
    ('esm.sla', 'SLA Engine', 'Response and resolution targets calculations', true, '{development,staging,production}', 'ENTERPRISE', v_tenant_id),
    ('esm.catalog', 'Service Catalog', 'Dynamic dynamic forms self-service request portal', true, '{development,staging,production}', 'STANDARD', v_tenant_id)
    ON CONFLICT (key) DO UPDATE SET is_globally_enabled = EXCLUDED.is_globally_enabled;

    -- 4. Seed default notification templates
    INSERT INTO notification_templates (tenant_id, key, name, description, channel, subject_template, body_template) VALUES
    (v_tenant_id, 'TICKET_ASSIGNED', 'Ticket Assignment Alert', 'Fired when a ticket is assigned to an agent', 'EMAIL', 'Ticket #{{ticket_id}} assigned to you', 'Hello {{agent_name}}, Ticket #{{ticket_id}} has been assigned to you. Subject: {{ticket_subject}}'),
    (v_tenant_id, 'TICKET_ASSIGNED', 'Ticket Assignment Alert', 'Fired when a ticket is assigned to an agent', 'IN_APP', 'New Assignment', 'Ticket #{{ticket_id}} has been assigned to you.'),
    (v_tenant_id, 'SLA_BREACHED', 'SLA Breach Notification', 'Fired when a ticket breaches SLA target', 'EMAIL', 'CRITICAL: Ticket #{{ticket_id}} breached SLA', 'Hello Manager, Ticket #{{ticket_id}} has breached its SLA policy. Time elapsed: {{elapsed}} minutes.'),
    (v_tenant_id, 'SLA_BREACHED', 'SLA Breach Notification', 'Fired when a ticket breaches SLA target', 'IN_APP', 'SLA Breached Alert', 'Ticket #{{ticket_id}} has breached its SLA target.')
    ON CONFLICT (tenant_id, key, channel) DO NOTHING;
END $$;
