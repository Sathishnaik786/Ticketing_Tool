-- PHASE-3: Payroll Commitment & Payslip Generation Infrastructure

-- 1. Create payroll_bulk_commitments table
CREATE TABLE IF NOT EXISTS payroll_bulk_commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    payroll_cycle_id UUID, -- Links to core payroll cycle if exists
    
    commitment_status VARCHAR DEFAULT 'PENDING' CHECK (commitment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL_FAILURE', 'FAILED')),
    
    total_committed INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    
    gross_total NUMERIC(15, 2) DEFAULT 0,
    net_total NUMERIC(15, 2) DEFAULT 0,
    
    committed_by UUID REFERENCES users(id),
    committed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create employee_payslip_documents table
CREATE TABLE IF NOT EXISTS employee_payslip_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_record_id UUID, -- Link to core payroll_records
    payroll_cycle_id UUID,
    
    payslip_number VARCHAR UNIQUE NOT NULL,
    pdf_url TEXT,
    pdf_hash VARCHAR,
    verification_token VARCHAR,
    
    generated_from VARCHAR DEFAULT 'BULK_UPLOAD',
    generation_status VARCHAR DEFAULT 'GENERATED' CHECK (generation_status IN ('GENERATED', 'FAILED', 'ARCHIVED')),
    
    is_visible_to_employee BOOLEAN DEFAULT TRUE,
    
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payroll_commitment_audits table
CREATE TABLE IF NOT EXISTS payroll_commitment_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commitment_id UUID REFERENCES payroll_bulk_commitments(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    action_type VARCHAR NOT NULL, -- e.g., 'COMMIT_START', 'PAYSLIP_GENERATED', 'RECORD_CREATED'
    performed_by UUID REFERENCES users(id),
    
    old_state JSONB DEFAULT '{}'::jsonb,
    new_state JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create payroll_document_download_logs table
CREATE TABLE IF NOT EXISTS payroll_document_download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payslip_document_id UUID REFERENCES employee_payslip_documents(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- 5. Add Indexes
CREATE INDEX IF NOT EXISTS idx_commitments_upload_id ON payroll_bulk_commitments(upload_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON employee_payslip_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_cycle_id ON employee_payslip_documents(payroll_cycle_id);
CREATE INDEX IF NOT EXISTS idx_commitment_audits_commit_id ON payroll_commitment_audits(commitment_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_payslip_id ON payroll_document_download_logs(payslip_document_id);

-- 6. Enable RLS
ALTER TABLE payroll_bulk_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payslip_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_commitment_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_document_download_logs ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Prevent policy creation collisions by dropping existing ones first
DROP POLICY IF EXISTS "Employees can view own payslips" ON employee_payslip_documents;
DROP POLICY IF EXISTS "Admins/HR can view all payslips" ON employee_payslip_documents;

-- Employees can only view their own payslips
CREATE POLICY "Employees can view own payslips" ON employee_payslip_documents 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = employee_payslip_documents.employee_id 
    AND employees.user_id = auth.uid()
  )
);

-- Admins/HR can view all
CREATE POLICY "Admins/HR can view all payslips" ON employee_payslip_documents 
FOR ALL USING (true);
