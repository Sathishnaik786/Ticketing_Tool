-- SAFE ENTERPRISE PAYROLL COMMITMENT HARDENING
-- PHASE 7: PAYROLL RECORD EXTENSION FOR DOCUMENT STATE

ALTER TABLE payroll_records
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS document_status VARCHAR(30) DEFAULT 'PENDING' CHECK (document_status IN ('PENDING', 'GENERATED', 'FAILED', 'NOT_REQUIRED')),
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS generation_error TEXT;

-- Index for document state monitoring
CREATE INDEX IF NOT EXISTS idx_payroll_records_doc_status ON payroll_records(document_status);

-- RLS Policy Hardening: Recreate "Employees can view own payslips" to secure and correct relational access
DROP POLICY IF EXISTS "Employees can view own payslips" ON employee_payslip_documents;
CREATE POLICY "Employees can view own payslips" ON employee_payslip_documents 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = employee_payslip_documents.employee_id 
    AND employees.user_id = auth.uid()
  )
);

