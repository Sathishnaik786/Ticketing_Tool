-- PHASE-1: Payroll Bulk Upload & Validation Infrastructure

-- 1. Create payroll_bulk_uploads table
CREATE TABLE IF NOT EXISTS payroll_bulk_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    upload_name VARCHAR NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    upload_status VARCHAR DEFAULT 'UPLOADED' CHECK (upload_status IN ('UPLOADED', 'VALIDATING', 'VALIDATED', 'FAILED')),
    
    total_rows INT DEFAULT 0,
    successful_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    
    original_file_name VARCHAR,
    original_file_url TEXT,
    
    validation_summary JSONB DEFAULT '{}'::jsonb,
    
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payroll_bulk_upload_rows table
CREATE TABLE IF NOT EXISTS payroll_bulk_upload_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    
    row_number INT,
    employee_code VARCHAR,
    employee_name VARCHAR,
    department VARCHAR,
    designation VARCHAR,
    
    payroll_month INT,
    payroll_year INT,
    
    gross_salary NUMERIC(15, 2),
    net_salary NUMERIC(15, 2),
    
    upload_status VARCHAR DEFAULT 'PENDING' CHECK (upload_status IN ('PENDING', 'VALID', 'INVALID', 'DUPLICATE', 'FAILED')),
    
    validation_errors JSONB DEFAULT '[]'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_org ON payroll_bulk_uploads(organization_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_status ON payroll_bulk_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_bulk_upload_rows_upload_id ON payroll_bulk_upload_rows(upload_id);
CREATE INDEX IF NOT EXISTS idx_bulk_upload_rows_status ON payroll_bulk_upload_rows(upload_status);
CREATE INDEX IF NOT EXISTS idx_bulk_upload_rows_emp_code ON payroll_bulk_upload_rows(employee_code);

-- 4. Add updated_at trigger for payroll_bulk_uploads
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payroll_bulk_uploads_updated_at
    BEFORE UPDATE ON payroll_bulk_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable RLS (Assuming Supabase environment)
ALTER TABLE payroll_bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_bulk_upload_rows ENABLE ROW LEVEL SECURITY;

-- Policy examples (Adjust based on organization_id logic if exists)
-- CREATE POLICY "Admins/HR can view all uploads" ON payroll_bulk_uploads FOR SELECT USING (true);
-- CREATE POLICY "Admins/HR can insert uploads" ON payroll_bulk_uploads FOR INSERT WITH CHECK (true);
