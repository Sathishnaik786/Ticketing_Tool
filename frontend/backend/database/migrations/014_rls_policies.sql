-- Migration: 014_rls_policies
-- Up

-- Ensure role column exists on employees table and backfill it
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'EMPLOYEE';

DO $$
BEGIN
    UPDATE employees e
    SET role = u.role
    FROM users u
    WHERE e.user_id = u.id AND (e.role IS NULL OR e.role = 'EMPLOYEE');
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if users or auth tables are not ready in specific testing contexts
END $$;

-- Helper function to extract tenant_id from JWT claims
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() ->> 'tenant_id')::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID -- fallback safe default
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has admin/manager role
CREATE OR REPLACE FUNCTION is_auth_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
          AND role IN ('ADMIN', 'MANAGER')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure tenant_id column exists on all target tables before creating RLS policies
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE feature_registry ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE event_store ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE processed_events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE business_units ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_forms ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_catalog_form_fields ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE service_request_responses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE workflow_versions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE workflow_steps ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE ticket_workflow_state ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE approval_policies ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE approval_levels ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE approval_assignments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE approval_history ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_channels ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE sla_escalation_rules ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE sla_breaches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- ─── System Settings Policies ──────────────────────────────────────────
DROP POLICY IF EXISTS select_settings ON system_settings;
CREATE POLICY select_settings ON system_settings
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_settings ON system_settings;
CREATE POLICY write_settings ON system_settings
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

-- ─── Feature Registry Policies ─────────────────────────────────────────
DROP POLICY IF EXISTS select_features ON feature_registry;
CREATE POLICY select_features ON feature_registry
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_features ON feature_registry;
CREATE POLICY write_features ON feature_registry
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

-- ─── Event Store Policies ──────────────────────────────────────────────
DROP POLICY IF EXISTS select_events ON event_store;
CREATE POLICY select_events ON event_store
    FOR SELECT USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS insert_events ON event_store;
CREATE POLICY insert_events ON event_store
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

-- ─── Processed Events Policies ─────────────────────────────────────────
DROP POLICY IF EXISTS all_processed_events ON processed_events;
CREATE POLICY all_processed_events ON processed_events
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- ─── Organizational Hierarchy Policies ─────────────────────────────────
DROP POLICY IF EXISTS select_companies ON companies;
CREATE POLICY select_companies ON companies
    FOR SELECT USING (id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_companies ON companies;
CREATE POLICY write_companies ON companies
    FOR ALL USING (is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_business_units ON business_units;
CREATE POLICY select_business_units ON business_units
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_business_units ON business_units;
CREATE POLICY write_business_units ON business_units
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_divisions ON divisions;
CREATE POLICY select_divisions ON divisions
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_divisions ON divisions;
CREATE POLICY write_divisions ON divisions
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_teams ON teams;
CREATE POLICY select_teams ON teams
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_teams ON teams;
CREATE POLICY write_teams ON teams
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

-- ─── Service Catalog Policies ──────────────────────────────────────────
DROP POLICY IF EXISTS select_catalog_categories ON service_catalog_categories;
CREATE POLICY select_catalog_categories ON service_catalog_categories
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_catalog_categories ON service_catalog_categories;
CREATE POLICY write_catalog_categories ON service_catalog_categories
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_catalog_items ON service_catalog_items;
CREATE POLICY select_catalog_items ON service_catalog_items
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_catalog_items ON service_catalog_items;
CREATE POLICY write_catalog_items ON service_catalog_items
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_catalog_forms ON service_catalog_forms;
CREATE POLICY select_catalog_forms ON service_catalog_forms
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_catalog_forms ON service_catalog_forms;
CREATE POLICY write_catalog_forms ON service_catalog_forms
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_catalog_form_fields ON service_catalog_form_fields;
CREATE POLICY select_catalog_form_fields ON service_catalog_form_fields
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_catalog_form_fields ON service_catalog_form_fields;
CREATE POLICY write_catalog_form_fields ON service_catalog_form_fields
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_requests ON service_requests;
CREATE POLICY select_requests ON service_requests
    FOR SELECT USING (tenant_id = get_auth_tenant_id() AND (requested_by = auth.uid() OR is_auth_admin_or_manager()));

DROP POLICY IF EXISTS insert_requests ON service_requests;
CREATE POLICY insert_requests ON service_requests
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id() AND requested_by = auth.uid());

DROP POLICY IF EXISTS update_requests ON service_requests;
CREATE POLICY update_requests ON service_requests
    FOR UPDATE USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS all_request_responses ON service_request_responses;
CREATE POLICY all_request_responses ON service_request_responses
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- ─── Workflows Policies ────────────────────────────────────────────────
DROP POLICY IF EXISTS select_workflows ON workflows;
CREATE POLICY select_workflows ON workflows
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_workflows ON workflows;
CREATE POLICY write_workflows ON workflows
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_workflow_versions ON workflow_versions;
CREATE POLICY select_workflow_versions ON workflow_versions
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_workflow_versions ON workflow_versions;
CREATE POLICY write_workflow_versions ON workflow_versions
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_workflow_steps ON workflow_steps;
CREATE POLICY select_workflow_steps ON workflow_steps
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_workflow_steps ON workflow_steps;
CREATE POLICY write_workflow_steps ON workflow_steps
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_ticket_workflow ON ticket_workflow_state;
CREATE POLICY select_ticket_workflow ON ticket_workflow_state
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_ticket_workflow ON ticket_workflow_state;
CREATE POLICY write_ticket_workflow ON ticket_workflow_state
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- ─── Approval Engine Policies ──────────────────────────────────────────
DROP POLICY IF EXISTS select_approval_policies ON approval_policies;
CREATE POLICY select_approval_policies ON approval_policies
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_approval_policies ON approval_policies;
CREATE POLICY write_approval_policies ON approval_policies
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_approval_levels ON approval_levels;
CREATE POLICY select_approval_levels ON approval_levels
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_approval_levels ON approval_levels;
CREATE POLICY write_approval_levels ON approval_levels
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_approval_assignments ON approval_assignments;
CREATE POLICY select_approval_assignments ON approval_assignments
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS update_approval_assignments ON approval_assignments;
CREATE POLICY update_approval_assignments ON approval_assignments
    FOR UPDATE USING (tenant_id = get_auth_tenant_id() AND (assigned_user_id = auth.uid() OR is_auth_admin_or_manager()));

DROP POLICY IF EXISTS insert_approval_assignments ON approval_assignments;
CREATE POLICY insert_approval_assignments ON approval_assignments
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS select_approval_history ON approval_history;
CREATE POLICY select_approval_history ON approval_history
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS insert_approval_history ON approval_history;
CREATE POLICY insert_approval_history ON approval_history
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id() AND actor_id = auth.uid());

-- ─── Notification Engine Policies ──────────────────────────────────────
DROP POLICY IF EXISTS select_notification_templates ON notification_templates;
CREATE POLICY select_notification_templates ON notification_templates
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_notification_templates ON notification_templates;
CREATE POLICY write_notification_templates ON notification_templates
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_notification_channels ON notification_channels;
CREATE POLICY select_notification_channels ON notification_channels
    FOR SELECT USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS write_notification_channels ON notification_channels;
CREATE POLICY write_notification_channels ON notification_channels
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_notification_preferences ON notification_preferences;
CREATE POLICY select_notification_preferences ON notification_preferences
    FOR SELECT USING (tenant_id = get_auth_tenant_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS write_notification_preferences ON notification_preferences;
CREATE POLICY write_notification_preferences ON notification_preferences
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS all_notification_delivery_logs ON notification_delivery_logs;
CREATE POLICY all_notification_delivery_logs ON notification_delivery_logs
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND (recipient_id = auth.uid() OR is_auth_admin_or_manager()));

-- ─── SLA Engine Policies ───────────────────────────────────────────────
DROP POLICY IF EXISTS select_sla_policies ON sla_policies;
CREATE POLICY select_sla_policies ON sla_policies
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_sla_policies ON sla_policies;
CREATE POLICY write_sla_policies ON sla_policies
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS select_sla_escalation_rules ON sla_escalation_rules;
CREATE POLICY select_sla_escalation_rules ON sla_escalation_rules
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS write_sla_escalation_rules ON sla_escalation_rules;
CREATE POLICY write_sla_escalation_rules ON sla_escalation_rules
    FOR ALL USING (tenant_id = get_auth_tenant_id() AND is_auth_admin_or_manager());

DROP POLICY IF EXISTS all_sla_breaches ON sla_breaches;
CREATE POLICY all_sla_breaches ON sla_breaches
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- Rollback
-- DROP POLICY IF EXISTS all_sla_breaches ON sla_breaches;
-- DROP POLICY IF EXISTS write_sla_escalation_rules ON sla_escalation_rules;
-- DROP POLICY IF EXISTS select_sla_escalation_rules ON sla_escalation_rules;
-- DROP POLICY IF EXISTS write_sla_policies ON sla_policies;
-- DROP POLICY IF EXISTS select_sla_policies ON sla_policies;
-- DROP POLICY IF EXISTS all_notification_delivery_logs ON notification_delivery_logs;
-- DROP POLICY IF EXISTS write_notification_preferences ON notification_preferences;
-- DROP POLICY IF EXISTS select_notification_preferences ON notification_preferences;
-- DROP POLICY IF EXISTS write_notification_channels ON notification_channels;
-- DROP POLICY IF EXISTS select_notification_channels ON notification_channels;
-- DROP POLICY IF EXISTS write_notification_templates ON notification_templates;
-- DROP POLICY IF EXISTS select_notification_templates ON notification_templates;
-- DROP POLICY IF EXISTS insert_approval_history ON approval_history;
-- DROP POLICY IF EXISTS select_approval_history ON approval_history;
-- DROP POLICY IF EXISTS insert_approval_assignments ON approval_assignments;
-- DROP POLICY IF EXISTS update_approval_assignments ON approval_assignments;
-- DROP POLICY IF EXISTS select_approval_assignments ON approval_assignments;
-- DROP POLICY IF EXISTS write_approval_levels ON approval_levels;
-- DROP POLICY IF EXISTS select_approval_levels ON approval_levels;
-- DROP POLICY IF EXISTS write_approval_policies ON approval_policies;
-- DROP POLICY IF EXISTS select_approval_policies ON approval_policies;
-- DROP POLICY IF EXISTS write_ticket_workflow ON ticket_workflow_state;
-- DROP POLICY IF EXISTS select_ticket_workflow ON ticket_workflow_state;
-- DROP POLICY IF EXISTS write_workflow_steps ON workflow_steps;
-- DROP POLICY IF EXISTS select_workflow_steps ON workflow_steps;
-- DROP POLICY IF EXISTS write_workflow_versions ON workflow_versions;
-- DROP POLICY IF EXISTS select_workflow_versions ON workflow_versions;
-- DROP POLICY IF EXISTS write_workflows ON workflows;
-- DROP POLICY IF EXISTS select_workflows ON workflows;
-- DROP POLICY IF EXISTS all_request_responses ON service_request_responses;
-- DROP POLICY IF EXISTS update_requests ON service_requests;
-- DROP POLICY IF EXISTS insert_requests ON service_requests;
-- DROP POLICY IF EXISTS select_requests ON service_requests;
-- DROP POLICY IF EXISTS write_catalog_form_fields ON service_catalog_form_fields;
-- DROP POLICY IF EXISTS select_catalog_form_fields ON service_catalog_form_fields;
-- DROP POLICY IF EXISTS write_catalog_forms ON service_catalog_forms;
-- DROP POLICY IF EXISTS select_catalog_forms ON service_catalog_forms;
-- DROP POLICY IF EXISTS write_catalog_items ON service_catalog_items;
-- DROP POLICY IF EXISTS select_catalog_items ON service_catalog_items;
-- DROP POLICY IF EXISTS write_catalog_categories ON service_catalog_categories;
-- DROP POLICY IF EXISTS select_catalog_categories ON service_catalog_categories;
-- DROP POLICY IF EXISTS write_teams ON teams;
-- DROP POLICY IF EXISTS select_teams ON teams;
-- DROP POLICY IF EXISTS write_divisions ON divisions;
-- DROP POLICY IF EXISTS select_divisions ON divisions;
-- DROP POLICY IF EXISTS write_business_units ON business_units;
-- DROP POLICY IF EXISTS select_business_units ON business_units;
-- DROP POLICY IF EXISTS write_companies ON companies;
-- DROP POLICY IF EXISTS select_companies ON companies;
-- DROP POLICY IF EXISTS all_processed_events ON processed_events;
-- DROP POLICY IF EXISTS insert_events ON event_store;
-- DROP POLICY IF EXISTS select_events ON event_store;
-- DROP POLICY IF EXISTS write_features ON feature_registry;
-- DROP POLICY IF EXISTS select_features ON feature_registry;
-- DROP POLICY IF EXISTS write_settings ON system_settings;
-- DROP POLICY IF EXISTS select_settings ON system_settings;
-- DROP FUNCTION IF EXISTS is_auth_admin_or_manager();
-- DROP FUNCTION IF EXISTS get_auth_tenant_id();
