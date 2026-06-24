-- PHASE-2: Employee Mapping & Payroll Preview Infrastructure

-- 1. Create payroll_bulk_row_mappings table
CREATE TABLE IF NOT EXISTS payroll_bulk_row_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_row_id UUID REFERENCES payroll_bulk_upload_rows(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    mapping_status VARCHAR NOT NULL CHECK (mapping_status IN ('MATCHED', 'PARTIAL_MATCH', 'AMBIGUOUS', 'NOT_FOUND', 'DUPLICATE_PAYROLL', 'INVALID')),
    mapping_confidence NUMERIC(5,2) DEFAULT 0,
    mapping_notes TEXT,
    matched_by VARCHAR CHECK (matched_by IN ('EMPLOYEE_CODE', 'EMPLOYEE_NAME', 'MANUAL_REVIEW')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payroll_bulk_preview_summaries table
CREATE TABLE IF NOT EXISTS payroll_bulk_preview_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    
    total_rows INT DEFAULT 0,
    matched_rows INT DEFAULT 0,
    unmatched_rows INT DEFAULT 0,
    duplicate_rows INT DEFAULT 0,
    invalid_rows INT DEFAULT 0,
    
    gross_total NUMERIC(15, 2) DEFAULT 0,
    net_total NUMERIC(15, 2) DEFAULT 0,
    
    preview_status VARCHAR DEFAULT 'READY' CHECK (preview_status IN ('READY', 'REVIEW_REQUIRED', 'BLOCKED')),
    validation_summary JSONB DEFAULT '{}'::jsonb,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payroll_bulk_mapping_audits table
CREATE TABLE IF NOT EXISTS payroll_bulk_mapping_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES payroll_bulk_uploads(id) ON DELETE CASCADE,
    upload_row_id UUID REFERENCES payroll_bulk_upload_rows(id) ON DELETE SET NULL,
    
    action_type VARCHAR NOT NULL, -- e.g., 'MAPPING_START', 'MANUAL_OVERRIDE', 'PREVIEW_GENERATED'
    performed_by UUID REFERENCES users(id),
    
    old_state JSONB DEFAULT '{}'::jsonb,
    new_state JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add Indexes
CREATE INDEX IF NOT EXISTS idx_row_mappings_row_id ON payroll_bulk_row_mappings(upload_row_id);
CREATE INDEX IF NOT EXISTS idx_row_mappings_emp_id ON payroll_bulk_row_mappings(employee_id);
CREATE INDEX IF NOT EXISTS idx_preview_summaries_upload_id ON payroll_bulk_preview_summaries(upload_id);
CREATE INDEX IF NOT EXISTS idx_mapping_audits_upload_id ON payroll_bulk_mapping_audits(upload_id);

-- 5. Enable RLS
ALTER TABLE payroll_bulk_row_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_bulk_preview_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_bulk_mapping_audits ENABLE ROW LEVEL SECURITY;

-- 6. Grant Permissions (Assuming HR/Admin roles exist)
-- Policy examples
-- CREATE POLICY "HR can view mappings" ON payroll_bulk_row_mappings FOR SELECT USING (true);
