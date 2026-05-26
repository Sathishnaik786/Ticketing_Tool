-- Payroll Module Schema - Phase 4 (Workflow & Governance)

-- 1. Workflow Definitions
CREATE TABLE IF NOT EXISTS payroll_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    workflow_code VARCHAR UNIQUE NOT NULL,
    workflow_name VARCHAR NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workflow Steps (Approval Hierarchy)
CREATE TABLE IF NOT EXISTS payroll_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES payroll_workflows(id) ON DELETE CASCADE,
    step_name VARCHAR NOT NULL,
    step_order INT NOT NULL,
    approver_role VARCHAR NOT NULL, -- ADMIN, HR_MANAGER, FINANCE_HEAD, etc.
    is_mandatory BOOLEAN DEFAULT TRUE,
    sla_hours INT DEFAULT 24,
    can_delegate BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payroll Approvals (Runtime Approval Instances)
CREATE TABLE IF NOT EXISTS payroll_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE, -- Optional: batch or individual
    workflow_step_id UUID REFERENCES payroll_workflow_steps(id),
    approver_id UUID REFERENCES public.users(id),
    approval_status VARCHAR DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'SKIPPED')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    delegated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payroll Variances (Anomaly Detection)
CREATE TABLE IF NOT EXISTS payroll_variances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_record_id UUID REFERENCES payroll_records(id) ON DELETE CASCADE,
    variance_type VARCHAR NOT NULL, -- GROSS_SPIKE, DEDUCTION_DROP, NEGATIVE_NET, etc.
    previous_amount NUMERIC(15, 2),
    current_amount NUMERIC(15, 2),
    variance_percentage NUMERIC(8, 2),
    severity VARCHAR CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payroll Escalations
CREATE TABLE IF NOT EXISTS payroll_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    approval_id UUID REFERENCES payroll_approvals(id) ON DELETE CASCADE,
    escalated_to UUID REFERENCES public.users(id),
    escalation_reason TEXT,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Payroll Notifications
CREATE TABLE IF NOT EXISTS payroll_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type VARCHAR NOT NULL, -- APPROVAL_REQUEST, REJECTED, LOCKED, ESCALATION
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR, -- PAYROLL_CYCLE, PAYROLL_APPROVAL
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payroll Reopen Requests
CREATE TABLE IF NOT EXISTS payroll_reopen_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    payroll_cycle_id UUID REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES public.users(id),
    reason TEXT NOT NULL,
    status VARCHAR DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Workflow Audit Trails
CREATE TABLE IF NOT EXISTS payroll_workflow_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    entity_type VARCHAR NOT NULL, -- CYCLE, APPROVAL, RULE
    entity_id UUID NOT NULL,
    action_type VARCHAR NOT NULL, -- APPROVE, REJECT, ESCALATE, REOPEN, DELEGATE
    performed_by UUID REFERENCES public.users(id),
    old_state JSONB,
    new_state JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX idx_approvals_cycle ON payroll_approvals(payroll_cycle_id);
CREATE INDEX idx_variances_record ON payroll_variances(payroll_record_id);
CREATE INDEX idx_notifications_recipient ON payroll_notifications(recipient_id);
CREATE INDEX idx_workflow_steps_order ON payroll_workflow_steps(workflow_id, step_order);

-- Enable RLS
ALTER TABLE payroll_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_variances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_reopen_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_workflow_audits ENABLE ROW LEVEL SECURITY;
