-- Migration: 017_hardening_indexes
-- Up

-- 1. Performance and Composite Indexes
CREATE INDEX IF NOT EXISTS idx_wv_tenant_workflow_status
ON workflow_versions(tenant_id, workflow_id, status);

CREATE INDEX IF NOT EXISTS idx_ws_tenant_version_order
ON workflow_steps(tenant_id, version_id, step_order);

CREATE INDEX IF NOT EXISTS idx_tws_tenant_ticket
ON ticket_workflow_state(tenant_id, ticket_id);

CREATE INDEX IF NOT EXISTS idx_aa_tenant_assignee_status
ON approval_assignments(tenant_id, assigned_user_id, status);

CREATE INDEX IF NOT EXISTS idx_aa_tenant_ticket_status
ON approval_assignments(tenant_id, ticket_id, status);

CREATE INDEX IF NOT EXISTS idx_ah_tenant_assignment
ON approval_history(tenant_id, assignment_id);

CREATE INDEX IF NOT EXISTS idx_ndl_tenant_recipient_status
ON notification_delivery_logs(tenant_id, recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_sr_tenant_requester_status
ON service_requests(tenant_id, requested_by, status);

CREATE INDEX IF NOT EXISTS idx_sb_tenant_ticket_ack
ON sla_breaches(tenant_id, ticket_id, is_acknowledged);

-- Add error telemetry columns to delivery logs
ALTER TABLE notification_delivery_logs ADD COLUMN IF NOT EXISTS error_stack TEXT;

-- 2. Security Helper functions

-- Helper to check if caller is admin
CREATE OR REPLACE FUNCTION is_auth_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
          AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to check if caller is manager
CREATE OR REPLACE FUNCTION is_auth_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
          AND role = 'MANAGER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to fetch department of the authenticated employee
CREATE OR REPLACE FUNCTION get_auth_employee_department_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT department_id FROM employees
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Hardened Row Level Security (RLS) Policies

-- Refine service_requests (catalog requests) RLS Policies
DROP POLICY IF EXISTS select_requests ON service_requests;
CREATE POLICY select_requests ON service_requests
    FOR SELECT USING (
        tenant_id = get_auth_tenant_id() 
        AND (
            is_auth_admin()
            OR (is_auth_manager() AND EXISTS (
                SELECT 1 FROM employees emp_req
                WHERE emp_req.user_id = service_requests.requested_by
                  AND emp_req.department_id = get_auth_employee_department_id()
            ))
            OR requested_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS insert_requests ON service_requests;
CREATE POLICY insert_requests ON service_requests
    FOR INSERT WITH CHECK (
        tenant_id = get_auth_tenant_id() 
        AND requested_by = auth.uid()
    );

-- Refine approval_assignments RLS Policies
DROP POLICY IF EXISTS select_approval_assignments ON approval_assignments;
CREATE POLICY select_approval_assignments ON approval_assignments
    FOR SELECT USING (
        tenant_id = get_auth_tenant_id()
        AND (
            is_auth_admin()
            OR (is_auth_manager() AND EXISTS (
                SELECT 1 FROM tickets t
                JOIN employees e ON e.user_id = auth.uid()
                WHERE t.id = approval_assignments.ticket_id
                  AND t.department_id = e.department_id
            ))
            OR assigned_user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM employees e
                WHERE e.user_id = auth.uid()
                  AND e.role = approval_assignments.assigned_role
            )
        )
    );

DROP POLICY IF EXISTS update_approval_assignments ON approval_assignments;
CREATE POLICY update_approval_assignments ON approval_assignments
    FOR UPDATE USING (
        tenant_id = get_auth_tenant_id()
        AND (
            assigned_user_id = auth.uid()
            OR is_auth_admin()
            OR (is_auth_manager() AND EXISTS (
                SELECT 1 FROM employees e
                WHERE e.user_id = auth.uid()
                  AND e.role = approval_assignments.assigned_role
            ))
        )
    );

-- Refine notification_delivery_logs RLS Policies
DROP POLICY IF EXISTS all_notification_delivery_logs ON notification_delivery_logs;
CREATE POLICY all_notification_delivery_logs ON notification_delivery_logs
    FOR ALL USING (
        tenant_id = get_auth_tenant_id()
        AND (
            recipient_id = auth.uid()
            OR is_auth_admin()
            OR (is_auth_manager() AND EXISTS (
                SELECT 1 FROM employees emp_rec
                WHERE emp_rec.user_id = notification_delivery_logs.recipient_id
                  AND emp_rec.department_id = get_auth_employee_department_id()
            ))
        )
    );
