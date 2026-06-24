-- REPAIR: Fix missing payout_status column and indices

-- 1. Ensure columns exist in payroll_disbursements
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_disbursements' AND column_name='payout_status') THEN
        ALTER TABLE payroll_disbursements ADD COLUMN payout_status VARCHAR DEFAULT 'SCHEDULED' CHECK (payout_status IN ('SCHEDULED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'));
    END IF;
END $$;

-- 2. Re-create indices safely
DROP INDEX IF EXISTS idx_disburse_status;
CREATE INDEX idx_disburse_status ON payroll_disbursements(payout_status);

DROP INDEX IF EXISTS idx_recon_upload_id;
CREATE INDEX idx_recon_upload_id ON payroll_reconciliation_batches(upload_id);

DROP INDEX IF EXISTS idx_variance_severity;
CREATE INDEX idx_variance_severity ON payroll_financial_variances(severity);

DROP INDEX IF EXISTS idx_closure_upload_id;
CREATE INDEX idx_closure_upload_id ON payroll_closure_audits(upload_id);
