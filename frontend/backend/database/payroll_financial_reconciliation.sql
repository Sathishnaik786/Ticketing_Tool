-- PHASE-2: Financial Reconciliation & Payroll Control Hardening

-- 1. Create payroll_reconciliation_batches table
CREATE TABLE IF NOT EXISTS payroll_reconciliation_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES payroll_bulk_commitments(id) ON DELETE CASCADE,
    
    total_gross_payroll NUMERIC(15, 2) NOT NULL,
    total_net_payout NUMERIC(15, 2) NOT NULL,
    total_deductions NUMERIC(15, 2) NOT NULL,
    
    reconciliation_status VARCHAR DEFAULT 'PENDING' CHECK (reconciliation_status IN ('PENDING', 'PROCESSING', 'MATCHED', 'PARTIAL_MATCH', 'FAILED', 'RECONCILED')),
    
    variance_count INT DEFAULT 0,
    variance_severity VARCHAR DEFAULT 'LOW',
    
    reconciled_by UUID REFERENCES users(id),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payroll_disbursements table (Disbursement Lifecycle)
CREATE TABLE IF NOT EXISTS payroll_disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reconciliation_id UUID REFERENCES payroll_reconciliation_batches(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    payout_status VARCHAR DEFAULT 'SCHEDULED' CHECK (payout_status IN ('SCHEDULED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED')),
    
    transaction_reference VARCHAR UNIQUE,
    bank_reference_id VARCHAR,
    failure_reason TEXT,
    retry_count INT DEFAULT 0,
    
    initiated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payroll_financial_variances table (Anomaly Detection)
CREATE TABLE IF NOT EXISTS payroll_financial_variances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reconciliation_id UUID REFERENCES payroll_reconciliation_batches(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    
    variance_type VARCHAR NOT NULL, -- e.g., 'SALARY_SPIKE', 'NEGATIVE_NET', 'DUPLICATE_BONUS', 'MISSING_PAYOUT'
    severity VARCHAR DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    resolution_status VARCHAR DEFAULT 'OPEN' CHECK (resolution_status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'IGNORED')),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create payroll_closure_audits table (Governance)
CREATE TABLE IF NOT EXISTS payroll_closure_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    
    previous_status VARCHAR,
    new_status VARCHAR,
    
    action_type VARCHAR NOT NULL, -- 'FREEZE', 'LOCK', 'CLOSE', 'REOPEN'
    performed_by UUID REFERENCES users(id),
    reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add Idempotency & Locking support to commitments
ALTER TABLE payroll_bulk_commitments 
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_recon_upload_id ON payroll_reconciliation_batches(upload_id);
CREATE INDEX IF NOT EXISTS idx_disburse_status ON payroll_disbursements(payout_status);
CREATE INDEX IF NOT EXISTS idx_variance_severity ON payroll_financial_variances(severity);
CREATE INDEX IF NOT EXISTS idx_closure_upload_id ON payroll_closure_audits(upload_id);
